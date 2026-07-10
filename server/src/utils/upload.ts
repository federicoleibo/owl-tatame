import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import multer from "multer";

export const UPLOADS_DIR = path.join(__dirname, "..", "..", "uploads");
const ANNOUNCEMENTS_DIR = path.join(UPLOADS_DIR, "announcements");

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, ANNOUNCEMENTS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    cb(null, `${randomUUID()}${ext}`);
  },
});

export const uploadAnnouncementImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(new Error("Formato de imagen no soportado (usa JPG, PNG, WEBP o GIF)"));
      return;
    }
    cb(null, true);
  },
});

export function announcementImageUrl(filename: string): string {
  return `/uploads/announcements/${filename}`;
}

export function deleteAnnouncementImage(imageUrl: string | null) {
  if (!imageUrl) return;
  const filename = path.basename(imageUrl);
  const filePath = path.join(ANNOUNCEMENTS_DIR, filename);
  fs.promises.unlink(filePath).catch(() => {});
}
