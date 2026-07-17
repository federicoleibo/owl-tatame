import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Logo } from "./Logo";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui";

const navItems = [
  { to: "/admin", end: true, label: "Resumen" },
  { to: "/admin/horarios", label: "Horarios" },
  { to: "/admin/socios", label: "Socios" },
  { to: "/admin/asistencia", label: "Asistencia" },
  { to: "/admin/novedades", label: "Novedades" },
  { to: "/admin/administradores", label: "Administradores" },
];

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `block rounded-md px-3 py-2.5 text-sm font-semibold transition-colors duration-150 ${
    isActive ? "bg-primary text-on-primary" : "text-muted hover:text-foreground hover:bg-surface-alt"
  }`;

function MenuIcon({ open }: { open: boolean }) {
  return (
    <span className="relative flex h-5 w-5 items-center justify-center">
      <span
        className={`absolute h-0.5 w-5 rounded-full bg-current transition-transform duration-200 ${
          open ? "translate-y-0 rotate-45" : "-translate-y-[6px] rotate-0"
        }`}
      />
      <span
        className={`absolute h-0.5 w-5 rounded-full bg-current transition-opacity duration-150 ${
          open ? "opacity-0" : "opacity-100"
        }`}
      />
      <span
        className={`absolute h-0.5 w-5 rounded-full bg-current transition-transform duration-200 ${
          open ? "translate-y-0 -rotate-45" : "translate-y-[6px] rotate-0"
        }`}
      />
    </span>
  );
}

export function AdminShell() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="min-h-dvh lg:flex">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-surface px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <Logo size={32} />
          <div className="leading-tight">
            <p className="font-display text-lg font-bold">OWL TATAME</p>
            <p className="text-xs text-muted">Panel de administracion</p>
          </div>
        </div>
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Cerrar menu" : "Abrir menu"}
          aria-expanded={open}
          className="flex h-11 w-11 items-center justify-center rounded-md text-foreground hover:bg-surface-alt cursor-pointer"
        >
          <MenuIcon open={open} />
        </button>
      </header>

      <div
        onClick={() => setOpen(false)}
        aria-hidden="true"
        className={`fixed inset-0 z-30 bg-black/60 transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 max-w-[85vw] flex-col border-r border-border bg-surface transition-transform duration-300 ease-out lg:static lg:z-0 lg:w-64 lg:max-w-none lg:translate-x-0 lg:shrink-0 lg:transition-none ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="hidden items-center gap-2 px-4 py-4 lg:flex">
          <Logo size={32} />
          <div className="leading-tight">
            <p className="font-display text-lg font-bold">OWL TATAME</p>
            <p className="text-xs text-muted">Panel de administracion</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1 overflow-y-auto px-3 pt-4 pb-3 lg:pt-0">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={navLinkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto px-4 py-3 border-t border-border">
          <p className="text-sm text-muted mb-2 truncate">{user?.fullName}</p>
          <Button variant="secondary" onClick={logout} className="w-full">
            Cerrar sesion
          </Button>
        </div>
      </aside>

      <main className="flex-1 px-4 py-6 lg:px-8 animate-fade-in">
        <Outlet />
      </main>
    </div>
  );
}
