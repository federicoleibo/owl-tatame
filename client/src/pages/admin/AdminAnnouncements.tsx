import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { api, ApiError } from "../../api/client";
import { Announcement } from "../../api/types";
import { Button, Card, ErrorText, Input, Label } from "../../components/ui";

export function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [message, setMessage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    const data = await api<Announcement[]>("/admin/announcements");
    setAnnouncements(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  }

  function resetForm() {
    setMessage("");
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setSaving(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("message", message);
      if (imageFile) formData.append("image", imageFile);
      await api("/admin/announcements", { method: "POST", body: formData });
      resetForm();
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo publicar la novedad");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: number) {
    await api(`/admin/announcements/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-1">Novedades</h1>
      <p className="text-muted text-sm mb-6">
        Mensajes que se muestran en la pantalla de ingreso de los socios (ej. feriados, cierres, avisos). Podes agregarles
        una imagen de fondo.
      </p>

      <Card className="mb-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Label htmlFor="message">Mensaje</Label>
            <Input
              id="message"
              placeholder="Ej: El gimnasio no abre el 25/12 por feriado."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={300}
            />
          </div>
          <div className="mb-4">
            <Label htmlFor="image">Imagen de fondo (opcional)</Label>
            <input
              ref={fileInputRef}
              id="image"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={handleFileChange}
              className="block w-full text-sm text-muted file:mr-3 file:rounded-md file:border-0 file:bg-surface-alt file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-foreground file:cursor-pointer cursor-pointer"
            />
            {imagePreview && (
              <div className="relative mt-3 h-32 w-full max-w-xs overflow-hidden rounded-lg border border-border">
                <img src={imagePreview} alt="Vista previa" className="h-full w-full object-cover" />
              </div>
            )}
          </div>
          <ErrorText>{error}</ErrorText>
          <Button type="submit" disabled={saving || !message.trim()}>
            {saving ? "Publicando..." : "Publicar"}
          </Button>
        </form>
      </Card>

      {loading && <p className="text-muted">Cargando...</p>}

      <div className="space-y-2">
        {announcements.length === 0 && !loading && (
          <Card>
            <p className="text-muted">No hay novedades publicadas.</p>
          </Card>
        )}
        {announcements.map((a) => (
          <Card key={a.id} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {a.imageUrl && (
                <img src={a.imageUrl} alt="" className="h-16 w-16 rounded-lg object-cover border border-border shrink-0" />
              )}
              <div>
                <p>{a.message}</p>
                <p className="text-xs text-muted mt-1">
                  {new Date(a.createdAt).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" })}
                </p>
              </div>
            </div>
            <Button variant="danger" onClick={() => remove(a.id)}>
              Eliminar
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
