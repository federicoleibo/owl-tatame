import { useEffect, useState } from "react";
import { api, ApiError } from "../api/client";
import { MyBooking } from "../api/types";
import { Badge, Button, Card } from "../components/ui";

const WEEKDAY_LABEL = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];

function formatDate(dateIso: string) {
  const d = new Date(dateIso);
  return `${WEEKDAY_LABEL[d.getDay()]} ${d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" })}`;
}

export function MyBookings() {
  const [bookings, setBookings] = useState<MyBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelingId, setCancelingId] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    try {
      const data = await api<MyBooking[]>("/bookings/me");
      setBookings(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function cancel(booking: MyBooking) {
    setError("");
    setCancelingId(booking.id);
    try {
      if (booking.type === "SEMANAL" && booking.weekGroupId) {
        const cancelAll = window.confirm(
          "Esta reserva es semanal. Aceptar cancela el resto de la semana; cancelar solo cancela este dia."
        );
        if (cancelAll) {
          await api(`/bookings/group/${booking.weekGroupId}`, { method: "DELETE" });
        } else {
          await api(`/bookings/${booking.id}`, { method: "DELETE" });
        }
      } else {
        await api(`/bookings/${booking.id}`, { method: "DELETE" });
      }
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo cancelar la reserva");
    } finally {
      setCancelingId(null);
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-1">Mis reservas</h1>
      <p className="text-muted text-sm mb-5">Tus proximas clases anotadas.</p>

      {error && <p className="text-destructive text-sm mb-4">{error}</p>}
      {loading && <p className="text-muted">Cargando...</p>}
      {!loading && bookings.length === 0 && (
        <Card>
          <p className="text-muted">Todavia no tenes reservas. Anda a "Anotarme" para elegir una clase.</p>
        </Card>
      )}

      <div className="space-y-3">
        {bookings.map((b) => (
          <Card key={b.id} className="flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold">
                {b.activityName} · {b.startTime} - {b.endTime}
              </p>
              <p className="text-sm text-muted">{formatDate(b.date)}</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge tone={b.type === "SEMANAL" ? "primary" : "muted"}>
                {b.type === "SEMANAL" ? "Semanal" : "Diaria"}
              </Badge>
              <Button variant="danger" onClick={() => cancel(b)} disabled={cancelingId === b.id}>
                {cancelingId === b.id ? "..." : "Cancelar"}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
