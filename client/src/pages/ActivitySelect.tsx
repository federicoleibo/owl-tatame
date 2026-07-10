import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { Activity } from "../api/types";
import { DumbbellIcon, KettlebellIcon } from "../components/ActivityIcons";

const ACTIVITY_META: Record<string, { icon: (size: number) => JSX.Element; blurb: string }> = {
  musculacion: {
    icon: (size) => <DumbbellIcon size={size} />,
    blurb: "Entrenamiento con pesas y maquinas a tu ritmo.",
  },
  crossfuncional: {
    icon: (size) => <KettlebellIcon size={size} />,
    blurb: "Clases grupales de alta intensidad y trabajo funcional.",
  },
};

function metaFor(name: string) {
  const key = name.toLowerCase().replace(/[^a-z]/g, "");
  return ACTIVITY_META[key] || { icon: (size: number) => <DumbbellIcon size={size} />, blurb: "" };
}

export function ActivitySelect() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api<Activity[]>("/activities")
      .then(setActivities)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-1">¿A que actividad te queres anotar?</h1>
      <p className="text-muted text-sm mb-6">Elegi una actividad para ver los horarios disponibles.</p>

      {loading && <p className="text-muted">Cargando...</p>}

      <div className="grid gap-5 sm:grid-cols-2">
        {activities.map((activity) => {
          const meta = metaFor(activity.name);
          return (
            <button
              key={activity.id}
              onClick={() => navigate(`/reservar/${activity.id}`)}
              className="group flex flex-col items-center text-center gap-4 rounded-2xl border border-border bg-surface p-8 cursor-pointer transition-all duration-200 hover:border-primary hover:-translate-y-0.5 min-h-[220px] justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <div className="flex items-center justify-center w-24 h-24 rounded-full bg-primary/15 text-primary transition-colors group-hover:bg-primary group-hover:text-on-primary">
                {meta.icon(56)}
              </div>
              <div>
                <p className="font-display text-2xl font-bold">{activity.name}</p>
                {meta.blurb && <p className="text-sm text-muted mt-1">{meta.blurb}</p>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
