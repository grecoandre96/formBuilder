"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface FormSettings {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  webhookUrl: string | null;
  webhookHeaders: Record<string, string> | null;
  isPublished: boolean;
}

export default function SettingsPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params.formId as string;

  const [form, setForm] = useState<FormSettings | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [headers, setHeaders] = useState<{ key: string; value: string }[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/forms/${formId}`)
      .then((r) => r.json())
      .then((data: FormSettings) => {
        setForm(data);
        setName(data.name);
        setSlug(data.slug);
        setDescription(data.description ?? "");
        setWebhookUrl(data.webhookUrl ?? "");
        setIsPublished(data.isPublished);
        const h = data.webhookHeaders ?? {};
        setHeaders(Object.entries(h).map(([key, value]) => ({ key, value: String(value) })));
      });
  }, [formId]);

  async function handleSave() {
    setSaving(true);
    const webhookHeadersObj = Object.fromEntries(
      headers.filter((h) => h.key.trim()).map((h) => [h.key.trim(), h.value.trim()])
    );

    const res = await fetch(`/api/forms/${formId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name, slug, description, webhookUrl, isPublished,
        webhookHeaders: Object.keys(webhookHeadersObj).length > 0 ? webhookHeadersObj : null,
      }),
    });

    if (res.ok) {
      toast.success("Impostazioni salvate");
    } else {
      const err = await res.json();
      toast.error(err.error || "Errore nel salvataggio");
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!confirm(`Eliminare "${form?.name}"? Questa azione è irreversibile.`)) return;
    await fetch(`/api/forms/${formId}`, { method: "DELETE" });
    router.push("/dashboard");
  }

  if (!form) return <div className="p-8 text-muted-foreground">Caricamento...</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/forms/${formId}/builder`} className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
          ← Builder
        </Link>
        <h1 className="text-xl font-bold">Impostazioni — {form.name}</h1>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Generale</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nome</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Slug URL</Label>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">/f/</span>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} className="flex-1" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Descrizione</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Facoltativo"
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Form pubblicato</Label>
            <Switch checked={isPublished} onCheckedChange={setIsPublished} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Webhook n8n</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>URL Webhook</Label>
            <Input
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://n8n.tuodominio.com/webhook/..."
            />
            <p className="text-xs text-muted-foreground">
              Le submission verranno inviate via POST a questo URL.
            </p>
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Header aggiuntivi</Label>
            {headers.map((h, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  value={h.key}
                  onChange={(e) => {
                    const next = [...headers];
                    next[i] = { ...next[i], key: e.target.value };
                    setHeaders(next);
                  }}
                  placeholder="Header-Name"
                  className="flex-1"
                />
                <Input
                  value={h.value}
                  onChange={(e) => {
                    const next = [...headers];
                    next[i] = { ...next[i], value: e.target.value };
                    setHeaders(next);
                  }}
                  placeholder="valore"
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setHeaders(headers.filter((_, j) => j !== i))}
                >
                  ✕
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setHeaders([...headers, { key: "", value: "" }])}
            >
              + Aggiungi header
            </Button>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? "Salvataggio..." : "Salva impostazioni"}
      </Button>

      <Card className="border-destructive/50">
        <CardHeader><CardTitle className="text-base text-destructive">Zona pericolosa</CardTitle></CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleDelete}>
            Elimina form e tutte le risposte
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
