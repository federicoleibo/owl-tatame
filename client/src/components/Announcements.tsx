import { useEffect, useState } from "react";
import { api } from "../api/client";
import { Announcement } from "../api/types";

function ExpandIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9 3H3v6M15 3h6v6M21 15v6h-6M3 15v6h6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ImageLightbox({ url, onClose }: { url: string; onClose: () => void }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 animate-fade-in"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        aria-label="Cerrar"
        className="absolute top-4 right-4 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 cursor-pointer min-h-[44px] min-w-[44px]"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
      <img
        src={url}
        alt="Novedad"
        onClick={(e) => e.stopPropagation()}
        className="max-h-full max-w-full object-contain rounded-lg animate-scale-in"
      />
    </div>
  );
}

function AnnouncementCard({ announcement, onOpenImage }: { announcement: Announcement; onOpenImage: (url: string) => void }) {
  if (announcement.imageUrl) {
    return (
      <li>
        <button
          type="button"
          onClick={() => onOpenImage(announcement.imageUrl!)}
          className="group relative block w-full overflow-hidden rounded-xl border border-border min-h-[220px] sm:min-h-[280px] flex items-end bg-cover bg-center cursor-pointer text-left"
          style={{ backgroundImage: `url(${announcement.imageUrl})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <span className="absolute top-3 right-3 z-10 rounded-full bg-black/40 p-2 text-white opacity-80 group-hover:opacity-100 group-hover:bg-black/60 transition-all">
            <ExpandIcon />
          </span>
          <p className="relative z-10 p-4 text-base font-medium text-white">{announcement.message}</p>
        </button>
      </li>
    );
  }
  return (
    <li className="rounded-xl border border-primary/30 bg-primary/10 p-4 text-sm text-foreground">
      {announcement.message}
    </li>
  );
}

export function Announcements({ className = "w-full max-w-sm mt-6" }: { className?: string }) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  useEffect(() => {
    api<Announcement[]>("/announcements")
      .then(setAnnouncements)
      .catch(() => setAnnouncements([]));
  }, []);

  if (announcements.length === 0) return null;

  return (
    <div className={className}>
      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary mb-2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Novedades
      </p>
      <ul className="space-y-3">
        {announcements.map((a) => (
          <AnnouncementCard key={a.id} announcement={a} onOpenImage={setLightboxUrl} />
        ))}
      </ul>
      {lightboxUrl && <ImageLightbox url={lightboxUrl} onClose={() => setLightboxUrl(null)} />}
    </div>
  );
}
