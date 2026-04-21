"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useBuilderStore } from "@/stores/builderStore";
import { FieldDefinition } from "@/types/form";
import BuilderToolbar from "@/components/builder/BuilderToolbar";
import FieldPalette from "@/components/builder/FieldPalette";
import FormCanvas from "@/components/builder/FormCanvas";
import PropertiesPanel from "@/components/builder/PropertiesPanel";
import AiChatPanel from "@/components/builder/AiChatPanel";
import { toast } from "sonner";

interface FormData {
  id: string;
  name: string;
  slug: string;
  isPublished: boolean;
  fields: FieldDefinition[];
}

export default function BuilderPage() {
  const params = useParams();
  const formId = params.formId as string;
  const [form, setForm] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"build" | "preview">("build");

  const { fields, setFields, setDirty, setSaving, isDirty, aiPanelOpen } = useBuilderStore();

  useEffect(() => {
    fetch(`/api/forms/${formId}`)
      .then((r) => r.json())
      .then((data) => {
        setForm(data);
        setFields(data.fields ?? []);
        setDirty(false);
      })
      .finally(() => setLoading(false));
  }, [formId]);

  const handleSave = useCallback(async () => {
    if (!isDirty) return;
    setSaving(true);
    try {
      await fetch(`/api/forms/${formId}/fields`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields }),
      });
      setDirty(false);
      toast.success("Salvato");
    } catch {
      toast.error("Errore nel salvataggio");
    } finally {
      setSaving(false);
    }
  }, [formId, fields, isDirty]);

  async function handleTogglePublish() {
    if (!form) return;
    const res = await fetch(`/api/forms/${formId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !form.isPublished }),
    });
    if (res.ok) {
      setForm((f) => f ? { ...f, isPublished: !f.isPublished } : f);
      toast.success(form.isPublished ? "Form nascosto" : "Form pubblicato!");
    }
  }

  // Auto-save dopo 2s di inattività
  useEffect(() => {
    if (!isDirty) return;
    const t = setTimeout(handleSave, 2000);
    return () => clearTimeout(t);
  }, [fields, isDirty, handleSave]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        Caricamento...
      </div>
    );
  }

  if (!form) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        Form non trovato
      </div>
    );
  }

  if (activeTab === "preview") {
    return (
      <div className="flex flex-col flex-1 overflow-hidden">
        <BuilderToolbar
          formId={form.slug}
          formName={form.name}
          isPublished={form.isPublished}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onSave={handleSave}
          onTogglePublish={handleTogglePublish}
        />
        <div className="flex-1 overflow-y-auto bg-muted/20 p-8">
          <div className="max-w-2xl mx-auto bg-background rounded-xl border p-8">
            <h1 className="text-2xl font-bold mb-6">{form.name}</h1>
            {fields.length === 0 ? (
              <p className="text-muted-foreground">Nessun campo aggiunto</p>
            ) : (
              <div className="space-y-4">
                {fields.map((f) => (
                  <div key={f.id}>
                    <PreviewField field={f} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <BuilderToolbar
        formId={form.slug}
        formName={form.name}
        isPublished={form.isPublished}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSave={handleSave}
        onTogglePublish={handleTogglePublish}
      />
      <div className="flex flex-1 overflow-hidden">
        <FieldPalette />
        <FormCanvas />
        <PropertiesPanel />
        <AiChatPanel formId={formId} />
      </div>
    </div>
  );
}

function PreviewField({ field }: { field: FieldDefinition }) {
  if (field.type === "heading") {
    const Tag = `h${field.level ?? 2}` as "h1" | "h2" | "h3";
    return <Tag className="font-semibold">{field.content}</Tag>;
  }
  if (field.type === "section") {
    return <p className="text-muted-foreground text-sm">{field.content}</p>;
  }
  return (
    <div>
      <label className="text-sm font-medium mb-1.5 flex items-center gap-1">
        {field.label}
        {field.required && <span className="text-destructive">*</span>}
      </label>
      {field.type === "textarea" ? (
        <textarea
          className="w-full rounded-md border bg-background px-3 py-2 text-sm h-20"
          placeholder={(field as { placeholder?: string }).placeholder}
          readOnly
        />
      ) : field.type === "select" ? (
        <select className="w-full rounded-md border bg-background px-3 py-2 text-sm">
          <option value="">{(field as { placeholder?: string }).placeholder || "Seleziona..."}</option>
          {(field as { options: { label: string; value: string }[] }).options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      ) : field.type === "radio" ? (
        <div className="space-y-2">
          {(field as { options: { label: string; value: string }[] }).options.map((o) => (
            <label key={o.value} className="flex items-center gap-2 text-sm">
              <input type="radio" name={field.id} value={o.value} readOnly />
              {o.label}
            </label>
          ))}
        </div>
      ) : field.type === "checkbox" ? (
        <div className="space-y-2">
          {(field as { options: { label: string; value: string }[] }).options.map((o) => (
            <label key={o.value} className="flex items-center gap-2 text-sm">
              <input type="checkbox" value={o.value} readOnly />
              {o.label}
            </label>
          ))}
        </div>
      ) : field.type === "file" ? (
        <div className="w-full rounded-md border-2 border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
          Carica file
        </div>
      ) : field.type === "date" ? (
        <input type="date" className="w-full rounded-md border bg-background px-3 py-2 text-sm" readOnly />
      ) : (
        <input
          type={field.type === "email" ? "email" : field.type === "number" ? "number" : "text"}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          placeholder={(field as { placeholder?: string }).placeholder}
          readOnly
        />
      )}
    </div>
  );
}
