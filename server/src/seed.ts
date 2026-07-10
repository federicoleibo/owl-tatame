import "dotenv/config";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { Weekday } from "./utils/constants";

const prisma = new PrismaClient();

function buildSlots(startHour: number, endHour: number, durationMinutes: number): [string, string][] {
  const toHHMM = (mins: number) => `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
  const slots: [string, string][] = [];
  let cursor = startHour * 60;
  const end = endHour * 60;
  while (cursor + durationMinutes <= end) {
    slots.push([toHHMM(cursor), toHHMM(cursor + durationMinutes)]);
    cursor += durationMinutes;
  }
  return slots;
}

async function main() {
  // Safe to run on every deploy: only seeds once. Prevents wiping real data
  // (bookings, custom schedules, new members) on subsequent redeploys.
  const existingActivities = await prisma.activity.count();
  if (existingActivities > 0) {
    console.log("Seed omitido: ya hay datos cargados.");
    return;
  }

  await prisma.checkIn.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.classSlot.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.user.deleteMany();
  await prisma.announcement.deleteMany();

  const adminPasswordHash = await bcrypt.hash("admin123", 10);
  await prisma.user.create({
    data: { dni: "00000000", passwordHash: adminPasswordHash, fullName: "Administracion", role: "ADMIN" },
  });

  const demoPasswordHash = await bcrypt.hash("socio123", 10);
  await prisma.user.create({
    data: { dni: "30111222", passwordHash: demoPasswordHash, fullName: "Socio Demo", role: "SOCIO" },
  });

  const musculacion = await prisma.activity.create({ data: { name: "Musculacion" } });
  const crossFuncional = await prisma.activity.create({ data: { name: "CrossFuncional" } });

  const weekdaysLunSab: Weekday[] = ["LUN", "MAR", "MIE", "JUE", "VIE", "SAB"];

  async function createHorario(
    activityId: number,
    startTime: string,
    endTime: string,
    capacity: number,
    weekdays: Weekday[]
  ) {
    const groupId = randomUUID();
    await prisma.$transaction(
      weekdays.map((weekday) =>
        prisma.classSlot.create({ data: { activityId, groupId, weekday, startTime, endTime, capacity } })
      )
    );
  }

  // Musculacion: turnos de 1h corridos de 8:00 a 22:00.
  for (const [start, end] of buildSlots(8, 22, 60)) {
    await createHorario(musculacion.id, start, end, 20, weekdaysLunSab);
  }

  // CrossFuncional: turnos de 1h corridos de 14:00 a 21:00.
  for (const [start, end] of buildSlots(14, 21, 60)) {
    await createHorario(crossFuncional.id, start, end, 15, weekdaysLunSab);
  }

  await prisma.announcement.create({
    data: { message: "¡Bienvenidos a OWL TATAME! Anotate con anticipacion para asegurar tu lugar en cada clase." },
  });

  console.log("Seed completado.");
  console.log("Admin -> DNI: 00000000 / Contrasena: admin123");
  console.log("Socio demo -> DNI: 30111222 / Contrasena: socio123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
