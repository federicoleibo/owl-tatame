import { useEffect, useState } from "react";
import { api } from "../api/client";
import { Announcement } from "../api/types";

function AnnouncementCard({ announcement }: { announcement: Announcement }) {
  if (announcement.imageUrl) {
    return (
      <li
        className="relative overflow-hidden rounded-xl border border-border min-h-[96px] flex items-end bg-cover bg-center"
        style={{ backgroundImage: `url(${announcement.imageUrl})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
        <p className="relative z-10 p-4 text-sm font-medium text-white">{announcement.message}</p>
      </li>
    );
  }
  return (
    <li className="rounded-xl border border-primary/30 bg-primary/10 p-4 text-sm text-foreground">
      {announcement.message}
    </li>
  );
}

export function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    api<Announcement[]>("/announcements")
      .then(setAnnouncements)
      .catch(() => setAnnouncements([]));
  }, []);

  if (announcements.length === 0) return null;

  return (
    <div className="w-full max-w-sm mt-6">
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
      <ul className="space-y-2">
        {announcements.map((a) => (
          <AnnouncementCard key={a.id} announcement={a} />
        ))}
      </ul>
    </div>
  );
}
