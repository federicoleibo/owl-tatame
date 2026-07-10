import { Router } from "express";
import { prisma } from "../db";
import { requireAuth } from "../middleware/auth";
import { addDays, isPastCutoff, isPastDate, toDateOnly, weekdayOf } from "../utils/time";

const router = Router();

router.get("/activities", async (_req, res) => {
  const activities = await prisma.activity.findMany({ orderBy: { name: "asc" } });
  res.json(activities);
});

/** Upcoming schedule for the next `days` days (default 7), with live availability. */
router.get("/schedule", requireAuth, async (req, res) => {
  const days = Math.min(Number(req.query.days) || 7, 14);
  const activityId = req.query.activityId ? Number(req.query.activityId) : undefined;
  const today = toDateOnly(new Date());

  const allSlots = await prisma.classSlot.findMany({
    where: activityId ? { activityId } : undefined,
    include: { activity: true },
    orderBy: [{ startTime: "asc" }],
  });

  const rangeDates = Array.from({ length: days }, (_, i) => addDays(today, i));

  const bookingCounts = await prisma.booking.groupBy({
    by: ["classSlotId", "date"],
    where: { status: "CONFIRMADA", date: { gte: today, lte: addDays(today, days) } },
    _count: { _all: true },
  });
  const countKey = (classSlotId: number, date: Date) => `${classSlotId}|${date.toISOString()}`;
  const countMap = new Map(bookingCounts.map((b) => [countKey(b.classSlotId, b.date), b._count._all]));

  const myBookings = await prisma.booking.findMany({
    where: { userId: req.user!.userId, status: "CONFIRMADA", date: { gte: today } },
  });
  const myBookingKey = (classSlotId: number, date: Date) => `${classSlotId}|${toDateOnly(date).toISOString()}`;
  const myBookingSet = new Set(myBookings.map((b) => myBookingKey(b.classSlotId, b.date)));

  const days_ = rangeDates.map((date) => {
    const wd = weekdayOf(date);
    const slots = allSlots
      .filter((s) => s.weekday === wd)
      .map((s) => {
        const taken = countMap.get(countKey(s.id, date)) || 0;
        const spotsLeft = Math.max(s.capacity - taken, 0);
        const bookable =
          !isPastDate(date) && !isPastCutoff(date, s.startTime) && spotsLeft > 0;
        return {
          id: s.id,
          groupId: s.groupId,
          activityId: s.activityId,
          activityName: s.activity.name,
          startTime: s.startTime,
          endTime: s.endTime,
          capacity: s.capacity,
          spotsTaken: taken,
          spotsLeft,
          bookable,
          alreadyBooked: myBookingSet.has(myBookingKey(s.id, date)),
        };
      });
    return { date: date.toISOString(), weekday: wd, slots };
  });

  res.json(days_);
});

export default router;
