import { Router } from "express";
import { prisma } from "../db";

const router = Router();

// Public: shown on the login/register screen.
router.get("/announcements", async (_req, res) => {
  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });
  res.json(announcements);
});

export default router;
