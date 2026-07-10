import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import { AttendanceReport } from "../../api/types";
import { Card } from "../../components/ui";

export function AdminDashboard() {
  const [report, setReport] = useState<AttendanceReport | null>(null);

  useEffect(() => {
    api<AttendanceReport>("/admin/attendance").then(setReport);
  }, []);

  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-1">Resumen de hoy</h1>
      <p className="text-muted text-sm mb-6">
        {new Date().toLocaleDateString("es-AR", { weekday: "long", day: "2-digit", month: "long" })}
      </p>

      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <Card>
          <p className="text-sm text-muted mb-1">Anotados hoy</p>
          <p className="font-display text-4xl font-bold">{report?.totalBookings ?? "-"}</p>
        </Card>
        <Card>
          <p className="text-sm text-muted mb-1">Asistieron</p>
          <p className="font-display text-4xl font-bold text-success">{report?.totalAttended ?? "-"}</p>
        </Card>
        <Card>
          <p className="text-sm text-muted mb-1">Ingresos sin reserva</p>
          <p className="font-display text-4xl font-bold">{report?.walkIns.length ?? "-"}</p>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link to="/admin/horarios">
          <Card className="hover:border-primary transition-colors cursor-pointer h-full">
            <p className="font-semibold mb-1">Gestionar horarios</p>
            <p className="text-sm text-muted">Crea, edita o elimina turnos de Musculacion y CrossFuncional.</p>
          </Card>
        </Link>
        <Link to="/admin/socios">
          <Card className="hover:border-primary transition-colors cursor-pointer h-full">
            <p className="font-semibold mb-1">Socios</p>
            <p className="text-sm text-muted">Ve y da de alta socios del gimnasio.</p>
          </Card>
        </Link>
        <Link to="/admin/asistencia">
          <Card className="hover:border-primary transition-colors cursor-pointer h-full">
            <p className="font-semibold mb-1">Asistencia</p>
            <p className="text-sm text-muted">Compara anotados vs. presentes por dia.</p>
          </Card>
        </Link>
      </div>
    </div>
  );
}
