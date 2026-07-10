import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../api/client";
import { Button, Card, ErrorText, Input, Label } from "../components/ui";
import { Logo } from "../components/Logo";
import { Announcements } from "../components/Announcements";

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [dni, setDni] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register({ dni, password, fullName, phone: phone || undefined });
      navigate("/reservar");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo completar el registro");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <Logo size={64} />
          <h1 className="font-display text-2xl font-bold mt-2">Crear cuenta de socio</h1>
        </div>
        <Card>
          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-4">
              <Label htmlFor="fullName">Nombre completo</Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
            <div className="mb-4">
              <Label htmlFor="dni">DNI</Label>
              <Input
                id="dni"
                inputMode="numeric"
                placeholder="Ej: 30111222"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="phone">Telefono (opcional)</Label>
              <Input id="phone" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="mb-2">
              <Label htmlFor="password">Contrasena</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <ErrorText>{error}</ErrorText>
            <Button type="submit" className="w-full mt-4" disabled={loading}>
              {loading ? "Creando cuenta..." : "Registrarme"}
            </Button>
          </form>
        </Card>
        <p className="text-center text-sm text-muted mt-4">
          ¿Ya tenes cuenta?{" "}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Ingresa aca
          </Link>
        </p>
      </div>
      <Announcements />
    </div>
  );
}
