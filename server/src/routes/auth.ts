import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../db";
import { signToken } from "../utils/jwt";
import { requireAuth } from "../middleware/auth";

const router = Router();

const registerSchema = z.object({
  dni: z.string().trim().regex(/^\d{7,9}$/, "El DNI debe tener entre 7 y 9 numeros"),
  password: z.string().min(6, "La contrasena debe tener al menos 6 caracteres"),
  fullName: z.string().trim().min(2, "Ingresa tu nombre completo"),
  phone: z.string().trim().optional(),
});

router.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const { dni, password, fullName, phone } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { dni } });
  if (existing) {
    return res.status(409).json({ error: "Ya existe un socio registrado con ese DNI" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { dni, passwordHash, fullName, phone, role: "SOCIO" },
  });

  const token = signToken({ userId: user.id, role: user.role as "SOCIO" | "ADMIN" });
  res.status(201).json({
    token,
    user: { id: user.id, dni: user.dni, fullName: user.fullName, role: user.role },
  });
});

const loginSchema = z.object({
  dni: z.string().trim().min(1),
  password: z.string().min(1),
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Ingresa DNI y contrasena" });
  }
  const { dni, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { dni } });
  if (!user) {
    return res.status(401).json({ error: "DNI o contrasena incorrectos" });
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: "DNI o contrasena incorrectos" });
  }

  const token = signToken({ userId: user.id, role: user.role as "SOCIO" | "ADMIN" });
  res.json({
    token,
    user: { id: user.id, dni: user.dni, fullName: user.fullName, role: user.role },
  });
});

router.get("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
  if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
  res.json({ id: user.id, dni: user.dni, fullName: user.fullName, phone: user.phone, role: user.role });
});

export default router;
