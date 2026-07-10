import { FormEvent, useEffect, useState } from "react";
import { api, ApiError } from "../../api/client";
import { Activity, AdminScheduleGroup, Weekday } from "../../api/types";
import { Badge, Button, Card, ErrorText, Input, Label } from "../../components/ui";

const WEEKDAYS: { value: Weekday; label: string }[] = [
  { value: "LUN", label: "Lun" },
  { value: "MAR", label: "Mar" },
  { value: "MIE", label: "Mie" },
  { value: "JUE", label: "Jue" },
  { value: "VIE", label: "Vie" },
  { value: "SAB", label: "Sab" },
  { value: "DOM", label: "Dom" },
];

interface FormState {
  activityId: number | "";
  startTime: string;
  endTime: string;
  capacity: number;
  weekdays: Weekday[];
}

const emptyForm: FormState = { activityId: "", startTime: "", endTime: "", capacity: 20, weekdays: [] };

export function AdminSchedules() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [groups, setGroups] = useState<AdminScheduleGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingGroupId, setEditingGroupId] = useState<string | "new" | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const [acts, grps] = await Promise.all([
      api<Activity[]>("/activities"),
      api<AdminScheduleGroup[]>("/admin/schedule"),
    ]);
    setActivities(acts);
    setGroups(grps);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function startCreate() {
    setForm({ ...emptyForm, activityId: activities[0]?.id ?? "" });
    setEditingGroupId("new");
    setError("");
  }

  function startEdit(group: AdminScheduleGroup) {
    setForm({
      activityId: group.activityId,
      startTime: group.startTime,
      endTime: group.endTime,
      capacity: group.capacity,
      weekdays: group.weekdays,
    });
    setEditingGroupId(group.groupId);
    setError("");
  }

  function toggleWeekday(day: Weekday) {
    setForm((f) => ({
      ...f,
      weekdays: f.weekdays.includes(day) ? f.weekdays.filter((d) => d !== day) : [...f.weekdays, day],
    }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.activityId || form.weekdays.length === 0 || !form.startTime || !form.endTime) {
      setError("Completa actividad, dias y horario");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const body = { ...form, activityId: Number(form.activityId), capacity: Number(form.capacity) };
      if (editingGroupId === "new") {
        await api("/admin/schedule", { method: "POST", body });
      } else if (editingGroupId) {
        await api(`/admin/schedule/${editingGroupId}`, { method: "PUT", body });
      }
      setEditingGroupId(null);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo guardar el horario");
    } finally {
      setSaving(false);
    }
  }

  async function remove(groupId: string) {
    if (!window.confirm("¿Eliminar este horario? Se cancelaran las reservas futuras asociadas.")) return;
    await api(`/admin/schedule/${groupId}`, { method: "DELETE" });
    await load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold mb-1">Horarios</h1>
          <p className="text-muted text-sm">Turnos de Musculacion y CrossFuncional.</p>
        </div>
        <Button onClick={startCreate}>+ Nuevo horario</Button>
      </div>

      {editingGroupId && (
        <Card className="mb-6">
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2 mb-4">
              <div>
                <Label htmlFor="activity">Actividad</Label>
                <select
                  id="activity"
                  className="w-full min-h-[44px] rounded-md border border-border bg-surface px-3 text-foreground"
                  value={form.activityId}
                  onChange={(e) => setForm((f) => ({ ...f, activityId: Number(e.target.value) }))}
                >
                  {activities.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="capacity">Cupo maximo</Label>
                <Input
                  id="capacity"
                  type="number"
                  min={1}
                  value={form.capacity}
                  onChange={(e) => setForm((f) => ({ ...f, capacity: Number(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="startTime">Hora de inicio</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={form.startTime}
                  onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="endTime">Hora de fin</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={form.endTime}
                  onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
                />
              </div>
            </div>
            <Label>Dias</Label>
            <div className="flex flex-wrap gap-2 mb-4">
              {WEEKDAYS.map((d) => (
                <button
                  type="button"
                  key={d.value}
                  onClick={() => toggleWeekday(d.value)}
                  className={`min-h-[44px] min-w-[52px] rounded-md text-sm font-semibold cursor-pointer transition-colors ${
                    form.weekdays.includes(d.value) ? "bg-primary text-on-primary" : "bg-surface-alt text-muted"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
            <ErrorText>{error}</ErrorText>
            <div className="flex gap-2 mt-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Guardando..." : "Guardar"}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setEditingGroupId(null)} disabled={saving}>
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      )}

      {loading && <p className="text-muted">Cargando...</p>}

      <div className="space-y-3">
        {groups.map((g) => (
          <Card key={g.groupId} className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="font-semibold">
                {g.activityName} · {g.startTime} - {g.endTime}
              </p>
              <div className="flex gap-1.5 mt-1.5 flex-wrap">
                {g.weekdays.map((wd) => (
                  <Badge key={wd}>{wd}</Badge>
                ))}
                <Badge tone="primary">Cupo {g.capacity}</Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => startEdit(g)}>
                Editar
              </Button>
              <Button variant="danger" onClick={() => remove(g.groupId)}>
                Eliminar
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
