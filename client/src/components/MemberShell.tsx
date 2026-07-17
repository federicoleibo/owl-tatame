import { NavLink, Outlet } from "react-router-dom";
import { Logo } from "./Logo";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `relative rounded-md px-2.5 py-2 text-sm font-semibold transition-colors duration-150 after:absolute after:left-2.5 after:right-2.5 after:-bottom-[1px] after:h-0.5 after:origin-left after:scale-x-0 after:bg-primary after:transition-transform after:duration-200 sm:px-3 ${
    isActive
      ? "text-foreground after:scale-x-100"
      : "text-muted hover:text-foreground hover:bg-surface-alt"
  }`;

export function MemberShell() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-dvh flex flex-col">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-2 px-3 py-3 sm:gap-3 sm:px-4">
          <div className="flex items-center gap-2 shrink-0">
            <Logo size={36} />
            <span className="font-display text-xl font-bold hidden sm:inline">OWL TATAME</span>
          </div>
          <nav className="flex items-center gap-1">
            <NavLink to="/reservar" className={navLinkClass}>
              Anotarme
            </NavLink>
            <NavLink to="/mis-reservas" className={navLinkClass}>
              Mis reservas
            </NavLink>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden sm:inline text-sm text-muted">{user?.fullName}</span>
            <Button variant="ghost" onClick={logout} className="px-3">
              Salir
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 animate-fade-in">
        <Outlet />
      </main>
    </div>
  );
}
