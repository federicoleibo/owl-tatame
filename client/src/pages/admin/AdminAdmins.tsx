import { FormEvent, useEffect, useState } from "react";
import { api, ApiError } from "../../api/client";
import { AdminMember } from "../../api/types";
import { Button, Card, ErrorText, Input, Label } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";

const emptyForm = { dni: "", fullName: "", phone: "", password: "" };

export function AdminAdmins() {
  const { user } = useAuth();
  const [admins, setAdmins] = useState<AdminMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const data = await api<AdminMember[]>("/admin/admins");
    setAdmins(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api("/admin/admins", { method: "POST", body: form });
      setForm(emptyForm);
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo crear el administrador");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: number) {
    if (!window.confirm("¿Eliminar este administrador?")) return;
    try {
      await api(`/admin/members/${id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : "No se pudo eliminar");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold mb-1">Administradores</h1>
          <p className="text-muted text-sm">{admins.length} administradores con acceso al panel.</p>
        </div>
        <Button onClick={() => setShowForm((s) => !s)}>{showForm ? "Cerrar" : "+ Nuevo administrador"}</Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2 mb-4">
              <div>
                <Label htmlFor="fullName">Nombre completo</Label>
                <Input
                  id="fullName"
                  value={form.fullName}
                  onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="dni">DNI</Label>
                <Input
                  id="dni"
                  inputMode="numeric"
                  value={form.dni}
                  onChange={(e) => setForm((f) => ({ ...f, dni: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefono</Label>
                <Input
                  id="phone"
                  inputMode="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="password">Contrasena inicial</Label>
                <Input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  required
                />
              </div>
            </div>
            <ErrorText>{error}</ErrorText>
            <Button type="submit" disabled={saving}>
              {saving ? "Guardando..." : "Crear administrador"}
            </Button>
          </form>
        </Card>
      )}

      {loading && <p className="text-muted">Cargando...</p>}

      <div className="space-y-2">
        {admins.map((a) => {
          const isSelf = a.id === user?.id;
          return (
            <Card key={a.id} className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold">
                  {a.fullName} {isSelf && <span className="text-xs text-muted">(vos)</span>}
                </p>
                <p className="text-sm text-muted">
                  DNI {a.dni}
                  {a.phone ? ` · ${a.phone}` : ""}
                </p>
              </div>
              <Button variant="danger" onClick={() => remove(a.id)} disabled={isSelf} title={isSelf ? "No podes eliminar tu propio usuario" : undefined}>
                Eliminar
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
