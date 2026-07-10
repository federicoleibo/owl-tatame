import { NavLink, Outlet } from "react-router-dom";
import { Logo } from "./Logo";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `block rounded-md px-3 py-2.5 text-sm font-semibold transition-colors ${
    isActive ? "bg-primary text-on-primary" : "text-muted hover:text-foreground hover:bg-surface-alt"
  }`;

export function AdminShell() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-dvh flex flex-col lg:flex-row">
      <aside className="lg:w-64 shrink-0 border-b lg:border-b-0 lg:border-r border-border bg-surface">
        <div className="flex items-center gap-2 px-4 py-4">
          <Logo size={32} />
          <div className="leading-tight">
            <p className="font-display text-lg font-bold">OWL TATAME</p>
            <p className="text-xs text-muted">Panel de administracion</p>
          </div>
        </div>
        <nav className="flex flex-row lg:flex-col gap-1 px-3 pb-3 overflow-x-auto">
          <NavLink to="/admin" end className={navLinkClass}>
            Resumen
          </NavLink>
          <NavLink to="/admin/horarios" className={navLinkClass}>
            Horarios
          </NavLink>
          <NavLink to="/admin/socios" className={navLinkClass}>
            Socios
          </NavLink>
          <NavLink to="/admin/asistencia" className={navLinkClass}>
            Asistencia
          </NavLink>
          <NavLink to="/admin/novedades" className={navLinkClass}>
            Novedades
          </NavLink>
          <NavLink to="/admin/administradores" className={navLinkClass}>
            Administradores
          </NavLink>
        </nav>
        <div className="hidden lg:block px-4 py-3 border-t border-border mt-2">
          <p className="text-sm text-muted mb-2">{user?.fullName}</p>
          <Button variant="secondary" onClick={logout} className="w-full">
            Cerrar sesion
          </Button>
        </div>
      </aside>
      <main className="flex-1 px-4 py-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
