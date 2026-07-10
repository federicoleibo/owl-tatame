import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db";
import { toDateOnly } from "../utils/time";

const router = Router();

const checkinSchema = z.object({ dni: z.string().trim().min(1) });

// Public endpoint: the kiosk screen at the gym entrance has no login,
// members just type their DNI to register attendance.
router.post("/checkin", async (req, res) => {
  const parsed = checkinSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Ingresa tu numero de DNI" });

  const user = await prisma.user.findUnique({ where: { dni: parsed.data.dni } });
  if (!user) return res.status(404).json({ error: "No encontramos un socio con ese DNI" });

  await prisma.checkIn.create({ data: { userId: user.id } });

  const today = toDateOnly(new Date());
  const todaysBookings = await prisma.booking.findMany({
    where: { userId: user.id, date: today, status: "CONFIRMADA" },
    include: { classSlot: { include: { activity: true } } },
    orderBy: { classSlot: { startTime: "asc" } },
  });

  res.status(201).json({
    fullName: user.fullName,
    todaysBookings: todaysBookings.map((b) => ({
      activityName: b.classSlot.activity.name,
      startTime: b.classSlot.startTime,
      endTime: b.classSlot.endTime,
    })),
  });
});

export default router;
