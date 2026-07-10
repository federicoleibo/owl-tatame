import "dotenv/config";
import path from "path";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import authRoutes from "./routes/auth";
import scheduleRoutes from "./routes/schedule";
import bookingRoutes from "./routes/bookings";
import checkinRoutes from "./routes/checkin";
import announcementRoutes from "./routes/announcements";
import adminRoutes from "./routes/admin";
import { UPLOADS_DIR } from "./utils/upload";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(UPLOADS_DIR));

app.use("/api/auth", authRoutes);
app.use("/api", scheduleRoutes);
app.use("/api", bookingRoutes);
app.use("/api", checkinRoutes);
app.use("/api", announcementRoutes);
app.use("/api/admin", adminRoutes);

app.get("/api/health", (_req, res) => res.json({ ok: true }));

// In production this single service also serves the built React app, so the
// frontend and API share one origin (no CORS/proxy setup needed on Render).
const clientDist = path.join(__dirname, "..", "..", "client", "dist");
app.use(express.static(clientDist));
app.get(/.*/, (req, res, next) => {
  if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) return next();
  res.sendFile(path.join(clientDist, "index.html"), (err) => {
    if (err) next();
  });
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  res.status(400).json({ error: err.message || "Ocurrio un error inesperado" });
});

const port = Number(process.env.PORT) || 4000;
app.listen(port, () => {
  console.log(`OWL TATAME API escuchando en http://localhost:${port}`);
});
