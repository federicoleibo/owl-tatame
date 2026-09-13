import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../api/client";
import { Button, Card, ErrorText, Input, Label } from "../components/ui";
import { Logo } from "../components/Logo";
import { InstallPrompt } from "../components/InstallPrompt";
import { Modal } from "../components/Modal";

function EyeIcon({ off }: { off: boolean }) {
  if (off) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M3 3l18 18M10.58 10.58a2 2 0 0 0 2.83 2.83M9.88 4.24A9.5 9.5 0 0 1 12 4c5 0 9 4 10 8-.32 1.06-.85 2.13-1.55 3.11M6.6 6.6C4.6 8 3.2 10 2 12c1 4 5 8 10 8 1.5 0 2.9-.35 4.15-.94"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [dni, setDni] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(dni, password);
      navigate(user.role === "ADMIN" ? "/admin" : "/reservar");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo iniciar sesion");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <Logo size={72} />
          <h1 className="font-display text-3xl font-bold mt-2">OWL TATAME</h1>
          <p className="text-muted text-sm">Ingresa con tu DNI y contraseña</p>
        </div>
        <InstallPrompt />
        <Card>
          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-4">
              <Label htmlFor="dni">DNI</Label>
              <Input
                id="dni"
                inputMode="numeric"
                autoComplete="username"
                placeholder="Ej: 30111222"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                required
              />
            </div>
            <div className="mb-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md p-2 text-muted hover:text-foreground cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                >
                  <EyeIcon off={showPassword} />
                </button>
              </div>
              <button
                type="button"
                onClick={() => setShowForgot(true)}
                className="mt-1.5 text-sm text-primary font-semibold hover:underline cursor-pointer"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            <ErrorText>{error}</ErrorText>
            <Button type="submit" className="w-full mt-4" disabled={loading}>
              {loading ? "Ingresando..." : "Ingresar"}
            </Button>
          </form>
        </Card>
        {showForgot && (
          <Modal title="Recuperar contraseña" onClose={() => setShowForgot(false)}>
            <p className="text-sm text-foreground mb-4">
              Por tu seguridad, el restablecimiento de contraseña lo hace un administrador del gimnasio.
              Acercate a recepcion o contactalos para que te asignen una contraseña nueva.
            </p>
            <Button variant="secondary" className="w-full" onClick={() => setShowForgot(false)}>
              Entendido
            </Button>
          </Modal>
        )}
        <p className="text-center text-sm text-muted mt-4">
          ¿Todavia no sos socio?{" "}
          <Link to="/registro" className="text-primary font-semibold hover:underline">
            Registrate
          </Link>
        </p>
      </div>
    </div>
  );
}
