import { Router } from "express";
import { randomUUID } from "crypto";
import { z } from "zod";
import { prisma } from "../db";
import { requireAuth } from "../middleware/auth";
import {
  BOOKING_CUTOFF_MINUTES,
  isPastCutoff,
  isPastDate,
  remainingOccurrencesThisWeek,
  toDateOnly,
  weekdayOf,
} from "../utils/time";
import { Weekday } from "../utils/constants";

const router = Router();

const createSchema = z.object({
  classSlotId: z.number().int(),
  date: z.string(), // ISO yyyy-mm-dd
  type: z.enum(["DIARIA", "SEMANAL"]),
});

async function spotsLeft(classSlotId: number, date: Date, capacity: number) {
  const taken = await prisma.booking.count({
    where: { classSlotId, date, status: "CONFIRMADA" },
  });
  return capacity - taken;
}

router.post("/bookings", requireAuth, async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Datos invalidos" });
  const { classSlotId, type } = parsed.data;
  const date = toDateOnly(new Date(parsed.data.date));

  const slot = await prisma.classSlot.findUnique({
    where: { id: classSlotId },
    include: { activity: true },
  });
  if (!slot) return res.status(404).json({ error: "Turno no encontrado" });
  if (weekdayOf(date) !== slot.weekday) {
    return res.status(400).json({ error: "La fecha no corresponde a ese turno" });
  }
  if (isPastDate(date)) return res.status(400).json({ error: "No podes anotarte a una fecha pasada" });
  if (isPastCutoff(date, slot.startTime)) {
    return res.status(400).json({ error: `Ya paso el horario limite de inscripcion (${BOOKING_CUTOFF_MINUTES} min antes)` });
  }

  const userId = req.user!.userId;

  if (type === "DIARIA") {
    const left = await spotsLeft(classSlotId, date, slot.capacity);
    if (left <= 0) return res.status(409).json({ error: "No quedan cupos para ese turno" });

    const existing = await prisma.booking.findUnique({
      where: { classSlotId_date_userId: { classSlotId, date, userId } },
    });
    if (existing && existing.status === "CONFIRMADA") {
      return res.status(409).json({ error: "Ya estas anotado a ese turno" });
    }

    const booking = existing
      ? await prisma.booking.update({
          where: { id: existing.id },
          data: { status: "CONFIRMADA", type: "DIARIA" },
        })
      : await prisma.booking.create({
          data: { userId, classSlotId, date, type: "DIARIA", status: "CONFIRMADA" },
        });

    return res.status(201).json({ created: [booking], skipped: [] });
  }

  // SEMANAL: book this same "horario" (groupId) for every remaining day it runs this week
  const groupSlots = await prisma.classSlot.findMany({ where: { groupId: slot.groupId } });
  const weekGroupId = randomUUID();
  const created: any[] = [];
  const skipped: { date: string; reason: string }[] = [];

  for (const s of groupSlots) {
    const occurrences = remainingOccurrencesThisWeek(date, s.weekday as Weekday);
    for (const occDate of occurrences) {
      if (isPastDate(occDate) || isPastCutoff(occDate, s.startTime)) {
        skipped.push({ date: occDate.toISOString(), reason: "Fuera de horario de inscripcion" });
        continue;
      }
      const left = await spotsLeft(s.id, occDate, s.capacity);
      if (left <= 0) {
        skipped.push({ date: occDate.toISOString(), reason: "Sin cupos" });
        continue;
      }
      const existing = await prisma.booking.findUnique({
        where: { classSlotId_date_userId: { classSlotId: s.id, date: occDate, userId } },
      });
      if (existing && existing.status === "CONFIRMADA") {
        skipped.push({ date: occDate.toISOString(), reason: "Ya estabas anotado" });
        continue;
      }
      const booking = existing
        ? await prisma.booking.update({
            where: { id: existing.id },
            data: { status: "CONFIRMADA", type: "SEMANAL", weekGroupId },
          })
        : await prisma.booking.create({
            data: { userId, classSlotId: s.id, date: occDate, type: "SEMANAL", weekGroupId, status: "CONFIRMADA" },
          });
      created.push(booking);
    }
  }

  if (created.length === 0) {
    return res.status(409).json({ error: "No se pudo anotar a ningun dia de esta semana", skipped });
  }
  res.status(201).json({ created, skipped });
});

router.get("/bookings/me", requireAuth, async (req, res) => {
  const today = toDateOnly(new Date());
  const bookings = await prisma.booking.findMany({
    where: { userId: req.user!.userId, date: { gte: today }, status: "CONFIRMADA" },
    include: { classSlot: { include: { activity: true } } },
    orderBy: [{ date: "asc" }],
  });
  res.json(
    bookings.map((b) => ({
      id: b.id,
      date: b.date.toISOString(),
      type: b.type,
      weekGroupId: b.weekGroupId,
      activityName: b.classSlot.activity.name,
      startTime: b.classSlot.startTime,
      endTime: b.classSlot.endTime,
    }))
  );
});

router.delete("/bookings/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking || booking.userId !== req.user!.userId) {
    return res.status(404).json({ error: "Reserva no encontrada" });
  }
  await prisma.booking.update({ where: { id }, data: { status: "CANCELADA" } });
  res.json({ ok: true });
});

router.delete("/bookings/group/:weekGroupId", requireAuth, async (req, res) => {
  const today = toDateOnly(new Date());
  await prisma.booking.updateMany({
    where: {
      weekGroupId: req.params.weekGroupId,
      userId: req.user!.userId,
      date: { gte: today },
    },
    data: { status: "CANCELADA" },
  });
  res.json({ ok: true });
});

export default router;
