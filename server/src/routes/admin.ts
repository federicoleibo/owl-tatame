import { Router } from "express";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { Weekday } from "../utils/constants";
import { prisma } from "../db";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { parseDateParam } from "../utils/time";
import { announcementImageUrl, deleteAnnouncementImage, uploadAnnouncementImage } from "../utils/upload";

const router = Router();
router.use(requireAuth, requireAdmin);

// ---- Schedule management ----

router.get("/schedule", async (_req, res) => {
  const slots = await prisma.classSlot.findMany({
    include: { activity: true },
    orderBy: [{ startTime: "asc" }],
  });
  const groups = new Map<string, any>();
  for (const s of slots) {
    if (!groups.has(s.groupId)) {
      groups.set(s.groupId, {
        groupId: s.groupId,
        activityId: s.activityId,
        activityName: s.activity.name,
        startTime: s.startTime,
        endTime: s.endTime,
        capacity: s.capacity,
        weekdays: [] as Weekday[],
        slotIds: {} as Record<string, number>,
      });
    }
    const g = groups.get(s.groupId);
    g.weekdays.push(s.weekday);
    g.slotIds[s.weekday] = s.id;
  }
  res.json(Array.from(groups.values()));
});

const weekdayEnum = z.enum(["LUN", "MAR", "MIE", "JUE", "VIE", "SAB", "DOM"]);

const scheduleSchema = z.object({
  activityId: z.number().int(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  capacity: z.number().int().min(1).max(200),
  weekdays: z.array(weekdayEnum).min(1),
});

router.post("/schedule", async (req, res) => {
  const parsed = scheduleSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Datos de horario invalidos" });
  const { activityId, startTime, endTime, capacity, weekdays } = parsed.data;

  const activity = await prisma.activity.findUnique({ where: { id: activityId } });
  if (!activity) return res.status(404).json({ error: "Actividad no encontrada" });

  const groupId = randomUUID();
  await prisma.$transaction(
    weekdays.map((weekday) =>
      prisma.classSlot.create({
        data: { activityId, groupId, weekday, startTime, endTime, capacity },
      })
    )
  );
  res.status(201).json({ groupId });
});

router.put("/schedule/:groupId", async (req, res) => {
  const parsed = scheduleSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Datos de horario invalidos" });
  const { activityId, startTime, endTime, capacity, weekdays } = parsed.data;
  const { groupId } = req.params;

  const existing = await prisma.classSlot.findMany({ where: { groupId } });
  if (existing.length === 0) return res.status(404).json({ error: "Horario no encontrado" });

  const existingWeekdays = new Set<string>(existing.map((s) => s.weekday));
  const newWeekdays = new Set<string>(weekdays);

  await prisma.$transaction([
    ...existing
      .filter((s) => !newWeekdays.has(s.weekday))
      .map((s) => prisma.classSlot.delete({ where: { id: s.id } })),
    ...existing
      .filter((s) => newWeekdays.has(s.weekday))
      .map((s) => prisma.classSlot.update({ where: { id: s.id }, data: { activityId, startTime, endTime, capacity } })),
    ...weekdays
      .filter((wd) => !existingWeekdays.has(wd))
      .map((wd) => prisma.classSlot.create({ data: { activityId, groupId, weekday: wd, startTime, endTime, capacity } })),
  ]);

  res.json({ ok: true });
});

router.delete("/schedule/:groupId", async (req, res) => {
  await prisma.classSlot.deleteMany({ where: { groupId: req.params.groupId } });
  res.json({ ok: true });
});

// ---- Member management ----

router.get("/members", async (_req, res) => {
  const members = await prisma.user.findMany({
    where: { role: "SOCIO" },
    orderBy: { fullName: "asc" },
  });
  res.json(members.map((m) => ({ id: m.id, dni: m.dni, fullName: m.fullName, phone: m.phone, createdAt: m.createdAt })));
});

const createMemberSchema = z.object({
  dni: z.string().trim().regex(/^\d{7,9}$/),
  password: z.string().min(6),
  fullName: z.string().trim().min(2),
  phone: z.string().trim().optional(),
});

router.post("/members", async (req, res) => {
  const parsed = createMemberSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Datos invalidos" });
  const { dni, password, fullName, phone } = parsed.data;

  const exists = await prisma.user.findUnique({ where: { dni } });
  if (exists) return res.status(409).json({ error: "Ya existe un socio con ese DNI" });

  const passwordHash = await bcrypt.hash(password, 10);
  const member = await prisma.user.create({ data: { dni, passwordHash, fullName, phone, role: "SOCIO" } });
  res.status(201).json({ id: member.id, dni: member.dni, fullName: member.fullName });
});

router.delete("/members/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (id === req.user!.userId) {
    return res.status(400).json({ error: "No podes eliminar tu propio usuario" });
  }
  await prisma.user.delete({ where: { id } });
  res.json({ ok: true });
});

// ---- Admin account management ----

router.get("/admins", async (_req, res) => {
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    orderBy: { fullName: "asc" },
  });
  res.json(admins.map((a) => ({ id: a.id, dni: a.dni, fullName: a.fullName, phone: a.phone, createdAt: a.createdAt })));
});

router.post("/admins", async (req, res) => {
  const parsed = createMemberSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Datos invalidos" });
  const { dni, password, fullName, phone } = parsed.data;

  const exists = await prisma.user.findUnique({ where: { dni } });
  if (exists) return res.status(409).json({ error: "Ya existe un usuario con ese DNI" });

  const passwordHash = await bcrypt.hash(password, 10);
  const admin = await prisma.user.create({ data: { dni, passwordHash, fullName, phone, role: "ADMIN" } });
  res.status(201).json({ id: admin.id, dni: admin.dni, fullName: admin.fullName });
});

// ---- Bookings & attendance reports ----

router.get("/bookings", async (req, res) => {
  const date = parseDateParam(req.query.date as string | undefined);
  const bookings = await prisma.booking.findMany({
    where: { date, status: "CONFIRMADA" },
    include: { user: true, classSlot: { include: { activity: true } } },
    orderBy: [{ classSlot: { startTime: "asc" } }],
  });
  res.json(
    bookings.map((b) => ({
      id: b.id,
      dni: b.user.dni,
      fullName: b.user.fullName,
      activityName: b.classSlot.activity.name,
      startTime: b.classSlot.startTime,
      endTime: b.classSlot.endTime,
      type: b.type,
    }))
  );
});

router.get("/attendance", async (req, res) => {
  const date = parseDateParam(req.query.date as string | undefined);
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + 1);

  const bookings = await prisma.booking.findMany({
    where: { date, status: "CONFIRMADA" },
    include: { user: true, classSlot: { include: { activity: true } } },
  });
  const checkIns = await prisma.checkIn.findMany({
    where: { timestamp: { gte: date, lt: nextDate } },
    include: { user: true },
  });
  const checkedInUserIds = new Set(checkIns.map((c) => c.userId));

  const rows = bookings.map((b) => ({
    dni: b.user.dni,
    fullName: b.user.fullName,
    activityName: b.classSlot.activity.name,
    startTime: b.classSlot.startTime,
    attended: checkedInUserIds.has(b.userId),
  }));

  const bookedUserIds = new Set(bookings.map((b) => b.userId));
  const walkIns = checkIns
    .filter((c) => !bookedUserIds.has(c.userId))
    .map((c) => ({ dni: c.user.dni, fullName: c.user.fullName, timestamp: c.timestamp.toISOString() }));

  res.json({
    date: date.toISOString(),
    totalBookings: bookings.length,
    totalAttended: rows.filter((r) => r.attended).length,
    rows,
    walkIns,
  });
});
// ---- Announcements ----

router.get("/announcements", async (_req, res) => {
  const announcements = await prisma.announcement.findMany({ orderBy: { createdAt: "desc" } });
  res.json(announcements);
});

const announcementSchema = z.object({ message: z.string().trim().min(1).max(300) });

router.post("/announcements", uploadAnnouncementImage.single("image"), async (req, res) => {
  const parsed = announcementSchema.safeParse(req.body);
  if (!parsed.success) {
    if (req.file) deleteAnnouncementImage(announcementImageUrl(req.file.filename));
    return res.status(400).json({ error: "Ingresa un mensaje" });
  }
  const imageUrl = req.file ? announcementImageUrl(req.file.filename) : null;
  const announcement = await prisma.announcement.create({ data: { message: parsed.data.message, imageUrl } });
  res.status(201).json(announcement);
});

router.delete("/announcements/:id", async (req, res) => {
  const announcement = await prisma.announcement.findUnique({ where: { id: Number(req.params.id) } });
  if (announcement) deleteAnnouncementImage(announcement.imageUrl);
  await prisma.announcement.delete({ where: { id: Number(req.params.id) } });
  res.json({ ok: true });
});

export default router;
