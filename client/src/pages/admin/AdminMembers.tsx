import { FormEvent, useEffect, useState } from "react";
import { api, ApiError } from "../../api/client";
import { AdminMember } from "../../api/types";
import { Button, Card, ErrorText, Input, Label } from "../../components/ui";
import { Modal } from "../../components/Modal";

const emptyForm = { dni: "", fullName: "", phone: "", password: "" };

export function AdminMembers() {
  const [members, setMembers] = useState<AdminMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [resetTarget, setResetTarget] = useState<AdminMember | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetting, setResetting] = useState(false);

  async function load() {
    setLoading(true);
    const data = await api<AdminMember[]>("/admin/members");
    setMembers(data);
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
      await api("/admin/members", { method: "POST", body: form });
      setForm(emptyForm);
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo crear el socio");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: number) {
    if (!window.confirm("¿Eliminar este socio? Se perderan sus reservas.")) return;
    await api(`/admin/members/${id}`, { method: "DELETE" });
    await load();
  }

  function openReset(member: AdminMember) {
    setResetTarget(member);
    setNewPassword("");
    setResetError("");
  }

  async function submitReset(e: FormEvent) {
    e.preventDefault();
    if (!resetTarget) return;
    setResetting(true);
    setResetError("");
    try {
      await api(`/admin/members/${resetTarget.id}/password`, { method: "PUT", body: { password: newPassword } });
      setResetTarget(null);
    } catch (err) {
      setResetError(err instanceof ApiError ? err.message : "No se pudo restablecer la contrasena");
    } finally {
      setResetting(false);
    }
  }

  const filtered = members.filter(
    (m) => m.fullName.toLowerCase().includes(query.toLowerCase()) || m.dni.includes(query)
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold mb-1">Socios</h1>
          <p className="text-muted text-sm">{members.length} socios registrados.</p>
        </div>
        <Button onClick={() => setShowForm((s) => !s)}>{showForm ? "Cerrar" : "+ Nuevo socio"}</Button>
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
              {saving ? "Guardando..." : "Crear socio"}
            </Button>
          </form>
        </Card>
      )}

      <Input
        placeholder="Buscar por nombre o DNI..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mb-4 max-w-sm"
      />

      {loading && <p className="text-muted">Cargando...</p>}

      <div className="space-y-2">
        {filtered.map((m) => (
          <Card key={m.id} className="flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold">{m.fullName}</p>
              <p className="text-sm text-muted">
                DNI {m.dni}
                {m.phone ? ` · ${m.phone}` : ""}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => openReset(m)}>
                Restablecer contrasena
              </Button>
              <Button variant="danger" onClick={() => remove(m.id)}>
                Eliminar
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {resetTarget && (
        <Modal title={`Restablecer contrasena de ${resetTarget.fullName}`} onClose={() => setResetTarget(null)}>
          <form onSubmit={submitReset}>
            <div className="mb-4">
              <Label htmlFor="newPassword">Contrasena nueva</Label>
              <Input
                id="newPassword"
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimo 6 caracteres"
                autoFocus
                required
              />
            </div>
            <ErrorText>{resetError}</ErrorText>
            <div className="flex gap-2">
              <Button type="submit" disabled={resetting} className="flex-1">
                {resetting ? "Guardando..." : "Guardar"}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setResetTarget(null)} disabled={resetting}>
                Cancelar
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
