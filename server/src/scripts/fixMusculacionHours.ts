import "dotenv/config";
import { randomUUID } from "crypto";
import { PrismaClient } from "@prisma/client";
import { Weekday } from "../utils/constants";

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
  const musculacion = await prisma.activity.findUnique({ where: { name: "Musculacion" } });
  if (!musculacion) throw new Error("No existe la actividad Musculacion");

  // Cascades to delete any bookings tied to the old Musculacion slots.
  await prisma.classSlot.deleteMany({ where: { activityId: musculacion.id } });

  const weekdaysLunSab: Weekday[] = ["LUN", "MAR", "MIE", "JUE", "VIE", "SAB"];

  for (const [start, end] of buildSlots(8, 22, 60)) {
    const groupId = randomUUID();
    await prisma.$transaction(
      weekdaysLunSab.map((weekday) =>
        prisma.classSlot.create({
          data: { activityId: musculacion.id, groupId, weekday, startTime: start, endTime: end, capacity: 20 },
        })
      )
    );
  }

  console.log("Horarios de Musculacion actualizados a turnos de 1 hora (08:00-22:00).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
