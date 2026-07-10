import { Fragment, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, ApiError } from "../api/client";
import { Activity, BookingType, ScheduleDay, ScheduleSlot } from "../api/types";
import { Button } from "../components/ui";
import { Modal } from "../components/Modal";

const WEEKDAY_LABEL: Record<string, string> = {
  LUN: "Lun",
  MAR: "Mar",
  MIE: "Mie",
  JUE: "Jue",
  VIE: "Vie",
  SAB: "Sab",
  DOM: "Dom",
};

function dayHeaderLabel(weekday: string, index: number) {
  if (index === 0) return "Hoy";
  if (index === 1) return "Manana";
  return WEEKDAY_LABEL[weekday] || weekday;
}

function formatShortDate(dateIso: string) {
  const d = new Date(dateIso);
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" });
}

type CellState = "booked" | "bookable" | "full" | "closed" | "none";

function cellState(slot: ScheduleSlot | undefined): CellState {
  if (!slot) return "none";
  if (slot.alreadyBooked) return "booked";
  if (slot.bookable) return "bookable";
  if (slot.spotsLeft === 0) return "full";
  return "closed";
}

const CELL_STYLES: Record<CellState, string> = {
  booked: "bg-primary text-on-primary border-primary",
  bookable: "bg-surface border-primary/50 text-foreground hover:bg-primary/10 cursor-pointer",
  full: "bg-surface-alt border-border text-muted",
  closed: "bg-surface-alt/50 border-border text-muted/60",
  none: "border-transparent text-muted/30",
};

export function ActivityCalendar() {
  const { activityId } = useParams();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [days, setDays] = useState<ScheduleDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<{ slot: ScheduleSlot; day: ScheduleDay } | null>(null);
  const [bookingType, setBookingType] = useState<BookingType>("DIARIA");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null);

  async function load() {
    setLoading(true);
    const [activities, schedule] = await Promise.all([
      api<Activity[]>("/activities"),
      api<ScheduleDay[]>(`/schedule?days=7&activityId=${activityId}`),
    ]);
    setActivity(activities.find((a) => String(a.id) === activityId) || null);
    setDays(schedule);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activityId]);

  const times = useMemo(() => {
    const set = new Set<string>();
    days.forEach((d) => d.slots.forEach((s) => set.add(s.startTime)));
    return Array.from(set).sort();
  }, [days]);

  function openSlot(slot: ScheduleSlot, day: ScheduleDay) {
    if (!slot.bookable) return;
    setSelected({ slot, day });
    setBookingType("DIARIA");
    setFeedback(null);
  }

  async function confirmBooking() {
    if (!selected) return;
    setSubmitting(true);
    try {
      const res = await api<{ created: unknown[]; skipped: { reason: string }[] }>("/bookings", {
        method: "POST",
        body: { classSlotId: selected.slot.id, date: selected.day.date, type: bookingType },
      });
      const skippedCount = res.skipped?.length || 0;
      setFeedback({
        tone: "success",
        message:
          bookingType === "SEMANAL"
            ? `Te anotaste a ${res.created.length} clase(s) esta semana${
                skippedCount ? ` (${skippedCount} dia(s) sin cupo o fuera de horario)` : ""
              }.`
            : "¡Listo! Quedaste anotado a la clase.",
      });
      setSelected(null);
      await load();
    } catch (err) {
      setFeedback({ tone: "error", message: err instanceof ApiError ? err.message : "No se pudo completar la reserva" });
      setSelected(null);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <Link to="/reservar" className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground mb-3">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Elegir otra actividad
      </Link>
      <h1 className="font-display text-3xl font-bold mb-1">{activity?.name || "Horarios"}</h1>
      <p className="text-muted text-sm mb-5">
        Toca un horario disponible para anotarte. Podes anotarte hasta 30 minutos antes de que empiece la clase.
      </p>

      {feedback && (
        <div
          role="status"
          className={`mb-4 rounded-md px-4 py-3 text-sm font-medium ${
            feedback.tone === "success" ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
          }`}
        >
          {feedback.message}
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-3 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-primary" /> Anotado
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm border border-primary/50 bg-surface" /> Disponible
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-surface-alt border border-border" /> Sin cupo / cerrado
        </span>
      </div>

      {loading && <p className="text-muted">Cargando horarios...</p>}

      {!loading && (
        <div className="overflow-x-auto pb-2">
          <div
            className="grid gap-1.5"
            style={{ gridTemplateColumns: `72px repeat(${days.length}, minmax(84px, 1fr))`, minWidth: 72 + days.length * 88 }}
          >
            <div />
            {days.map((day, idx) => (
              <div key={day.date} className="text-center px-1 py-2">
                <p className="text-sm font-bold">{dayHeaderLabel(day.weekday, idx)}</p>
                <p className="text-xs text-muted">{formatShortDate(day.date)}</p>
              </div>
            ))}

            {times.map((time) => (
              <Fragment key={time}>
                <div className="flex items-center justify-end pr-2 text-sm font-semibold text-muted">
                  {time}
                </div>
                {days.map((day) => {
                  const slot = day.slots.find((s) => s.startTime === time);
                  const state = cellState(slot);
                  return (
                    <button
                      key={`${time}-${day.date}`}
                      disabled={state !== "bookable"}
                      onClick={() => slot && openSlot(slot, day)}
                      title={
                        slot
                          ? `${slot.startTime}-${slot.endTime} · ${slot.spotsLeft}/${slot.capacity} cupos`
                          : undefined
                      }
                      className={`min-h-[52px] rounded-md border text-xs font-semibold flex flex-col items-center justify-center gap-0.5 transition-colors ${CELL_STYLES[state]}`}
                    >
                      {state === "booked" && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                      {state === "bookable" && <span>{slot!.spotsLeft} lug.</span>}
                      {state === "full" && <span>Sin cupo</span>}
                      {state === "closed" && <span>Cerrado</span>}
                      {state === "none" && <span>—</span>}
                    </button>
                  );
                })}
              </Fragment>
            ))}
          </div>
        </div>
      )}

      {selected && (
        <Modal title={`${activity?.name} · ${selected.slot.startTime}hs`} onClose={() => setSelected(null)}>
          <p className="text-sm text-muted mb-4">
            {dayHeaderLabel(selected.day.weekday, days.indexOf(selected.day))} {formatShortDate(selected.day.date)} ·{" "}
            {selected.slot.spotsLeft} de {selected.slot.capacity} cupos disponibles
          </p>
          <div className="flex gap-2 mb-4">
            <button
              className={`flex-1 rounded-md px-3 py-3 text-sm font-semibold cursor-pointer min-h-[44px] ${
                bookingType === "DIARIA" ? "bg-primary text-on-primary" : "bg-surface-alt text-muted"
              }`}
              onClick={() => setBookingType("DIARIA")}
            >
              Solo este dia
            </button>
            <button
              className={`flex-1 rounded-md px-3 py-3 text-sm font-semibold cursor-pointer min-h-[44px] ${
                bookingType === "SEMANAL" ? "bg-primary text-on-primary" : "bg-surface-alt text-muted"
              }`}
              onClick={() => setBookingType("SEMANAL")}
            >
              Toda la semana
            </button>
          </div>
          <div className="flex gap-2">
            <Button onClick={confirmBooking} disabled={submitting} className="flex-1">
              {submitting ? "Confirmando..." : "Confirmar"}
            </Button>
            <Button variant="secondary" onClick={() => setSelected(null)} disabled={submitting}>
              Cancelar
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
