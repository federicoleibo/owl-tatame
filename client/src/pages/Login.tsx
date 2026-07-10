import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../api/client";
import { Button, Card, ErrorText, Input, Label } from "../components/ui";
import { Logo } from "../components/Logo";
import { Announcements } from "../components/Announcements";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [dni, setDni] = useState("");
  const [password, setPassword] = useState("");
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
          <p className="text-muted text-sm">Ingresa con tu DNI y contrasena</p>
        </div>
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
              <Label htmlFor="password">Contrasena</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <ErrorText>{error}</ErrorText>
            <Button type="submit" className="w-full mt-4" disabled={loading}>
              {loading ? "Ingresando..." : "Ingresar"}
            </Button>
          </form>
        </Card>
        <p className="text-center text-sm text-muted mt-4">
          ¿Todavia no sos socio?{" "}
          <Link to="/registro" className="text-primary font-semibold hover:underline">
            Registrate
          </Link>
        </p>
      </div>
      <Announcements />
    </div>
  );
}
