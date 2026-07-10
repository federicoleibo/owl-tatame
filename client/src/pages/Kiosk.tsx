import { useEffect, useRef, useState } from "react";
import { api, ApiError } from "../api/client";
import { Logo } from "../components/Logo";

interface CheckinResult {
  fullName: string;
  todaysBookings: { activityName: string; startTime: string; endTime: string }[];
}

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "borrar", "0", "ok"];

export function Kiosk() {
  const [dni, setDni] = useState("");
  const [result, setResult] = useState<CheckinResult | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function scheduleReset() {
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => {
      setDni("");
      setResult(null);
      setError("");
    }, 6000);
  }

  useEffect(() => () => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
  }, []);

  async function submit(value: string) {
    if (!value) return;
    setSubmitting(true);
    setError("");
    try {
      const data = await api<CheckinResult>("/checkin", { method: "POST", body: { dni: value } });
      setResult(data);
      setDni("");
      scheduleReset();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo registrar el ingreso");
      setDni("");
      scheduleReset();
    } finally {
      setSubmitting(false);
    }
  }

  function press(key: string) {
    setError("");
    if (key === "borrar") return setDni((d) => d.slice(0, -1));
    if (key === "ok") return submit(dni);
    if (dni.length < 9) setDni((d) => d + key);
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md text-center">
        <div className="flex flex-col items-center mb-6">
          <Logo size={88} />
          <h1 className="font-display text-4xl font-bold mt-2">OWL TATAME</h1>
          <p className="text-muted">Registro de ingreso</p>
        </div>

        {result ? (
          <div className="rounded-xl bg-success/15 p-6 mb-6" role="status">
            <p className="text-2xl font-display font-bold text-success">¡Bienvenido/a {result.fullName}!</p>
            {result.todaysBookings.length > 0 ? (
              <div className="mt-3 space-y-1 text-foreground">
                {result.todaysBookings.map((b, i) => (
                  <p key={i}>
                    Tenes {b.activityName} a las {b.startTime}hs
                  </p>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-muted">No tenes clases anotadas para hoy.</p>
            )}
          </div>
        ) : (
          <div className="mb-6">
            <div
              className="rounded-xl bg-surface border border-border text-4xl font-display font-bold tracking-widest py-5 mb-1 min-h-[68px]"
              aria-live="polite"
            >
              {dni || <span className="text-muted text-2xl">Ingresa tu DNI</span>}
            </div>
            {error && (
              <p role="alert" className="text-destructive text-sm mt-2">
                {error}
              </p>
            )}
          </div>
        )}

        {!result && (
          <div className="grid grid-cols-3 gap-3">
            {KEYS.map((key) => (
              <button
                key={key}
                onClick={() => press(key)}
                disabled={submitting}
                className={`min-h-[64px] rounded-xl text-2xl font-display font-bold cursor-pointer transition-colors disabled:opacity-40 ${
                  key === "ok"
                    ? "bg-primary text-on-primary hover:bg-primary/90"
                    : key === "borrar"
                    ? "bg-surface-alt text-destructive hover:bg-surface-alt/70"
                    : "bg-surface-alt text-foreground hover:bg-surface-alt/70"
                }`}
              >
                {key === "borrar" ? "Borrar" : key === "ok" ? "Ingresar" : key}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
