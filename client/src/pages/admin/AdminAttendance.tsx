import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { AttendanceReport } from "../../api/types";
import { Badge, Card, Input, Label } from "../../components/ui";

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function AdminAttendance() {
  const [date, setDate] = useState(todayIso());
  const [report, setReport] = useState<AttendanceReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api<AttendanceReport>(`/admin/attendance?date=${date}`)
      .then(setReport)
      .finally(() => setLoading(false));
  }, [date]);

  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-1">Asistencia</h1>
      <p className="text-muted text-sm mb-5">Anotados vs. presentes por dia.</p>

      <div className="mb-6 max-w-xs">
        <Label htmlFor="date">Fecha</Label>
        <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      {loading && <p className="text-muted">Cargando...</p>}

      {report && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 mb-6">
            <Card>
              <p className="text-sm text-muted mb-1">Total anotados</p>
              <p className="font-display text-3xl font-bold">{report.totalBookings}</p>
            </Card>
            <Card>
              <p className="text-sm text-muted mb-1">Asistieron</p>
              <p className="font-display text-3xl font-bold text-success">{report.totalAttended}</p>
            </Card>
          </div>

          <h2 className="font-display text-xl font-bold mb-2">Anotados</h2>
          <div className="space-y-2 mb-6">
            {report.rows.length === 0 && (
              <Card>
                <p className="text-muted">No hay anotaciones para este dia.</p>
              </Card>
            )}
            {report.rows.map((r, i) => (
              <Card key={i} className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{r.fullName}</p>
                  <p className="text-sm text-muted">
                    DNI {r.dni} · {r.activityName} {r.startTime}hs
                  </p>
                </div>
                <Badge tone={r.attended ? "success" : "danger"}>{r.attended ? "Asistio" : "Ausente"}</Badge>
              </Card>
            ))}
          </div>

          {report.walkIns.length > 0 && (
            <>
              <h2 className="font-display text-xl font-bold mb-2">Ingresos sin reserva</h2>
              <div className="space-y-2">
                {report.walkIns.map((w, i) => (
                  <Card key={i} className="flex items-center justify-between">
                    <p className="font-semibold">{w.fullName}</p>
                    <p className="text-sm text-muted">
                      DNI {w.dni} · {new Date(w.timestamp).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </Card>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
