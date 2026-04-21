"use client";

import { useState, useRef, useEffect } from "react";
import { FieldDefinition } from "@/types/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PublicFormClientProps {
  formId: string;
  formSlug: string;
  fields: FieldDefinition[];
}

type FormValues = Record<string, string | string[] | File | null>;

export default function PublicFormClient({ formId, formSlug, fields }: PublicFormClientProps) {
  const [values, setValues] = useState<FormValues>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  function setValue(fieldId: string, value: string | string[] | File | null) {
    setValues((v) => ({ ...v, [fieldId]: value }));
    setErrors((e) => ({ ...e, [fieldId]: "" }));
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    for (const field of fields) {
      if (field.type === "heading" || field.type === "section") continue;
      if (field.required) {
        const val = values[field.id];
        if (!val || (typeof val === "string" && !val.trim()) || (Array.isArray(val) && val.length === 0)) {
          newErrors[field.id] = "Campo obbligatorio";
        }
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError("");

    try {
      // Handle file uploads first
      const fileUrls: Record<string, string> = {};
      for (const field of fields) {
        if (field.type === "file" && values[field.id] instanceof File) {
          const formData = new FormData();
          formData.append("file", values[field.id] as File);
          formData.append("formId", formId);
          const res = await fetch("/api/upload", { method: "POST", body: formData });
          if (res.ok) {
            const { url } = await res.json();
            fileUrls[field.id] = url;
          }
        }
      }

      // Build submission data
      const data: Record<string, unknown> = {};
      for (const field of fields) {
        if (field.type === "heading" || field.type === "section") continue;
        if (field.type === "file") continue;
        data[field.id] = values[field.id] ?? null;
      }

      const res = await fetch(`/api/public/forms/${formSlug}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data, files: fileUrls }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        const err = await res.json();
        setSubmitError(err.error || "Errore nell'invio");
      }
    } catch {
      setSubmitError("Errore di rete. Riprova.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">✓</div>
        <h2 className="text-xl font-semibold mb-2">Grazie!</h2>
        <p className="text-muted-foreground">Il tuo form è stato inviato con successo.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {fields.map((field) => (
        <div key={field.id}>
          <FieldInput
            field={field}
            value={values[field.id]}
            error={errors[field.id]}
            onChange={(val) => setValue(field.id, val)}
          />
        </div>
      ))}

      {submitError && <p className="text-sm text-destructive">{submitError}</p>}

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? "Invio in corso..." : "Invia"}
      </Button>
    </form>
  );
}

function AutoResizeTextarea({
  value,
  onChange,
  placeholder,
  hasError,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  hasError?: boolean;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-invalid={hasError}
      rows={3}
      className="w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none overflow-hidden"
      style={{ minHeight: "80px" }}
    />
  );
}

function FieldInput({
  field,
  value,
  error,
  onChange,
}: {
  field: FieldDefinition;
  value: string | string[] | File | null | undefined;
  error?: string;
  onChange: (val: string | string[] | File | null) => void;
}) {
  if (field.type === "heading") {
    const Tag = `h${field.level ?? 2}` as "h1" | "h2" | "h3";
    return <Tag className="font-semibold mt-2">{field.content}</Tag>;
  }
  if (field.type === "section") {
    return <p className="text-muted-foreground text-sm">{field.content}</p>;
  }

  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-1">
        {field.label}
        {field.required && <span className="text-destructive">*</span>}
      </Label>

      {(field.type === "text" || field.type === "email" || field.type === "phone" || field.type === "number") && (
        <Input
          type={field.type === "email" ? "email" : field.type === "number" ? "number" : "text"}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={(field as { placeholder?: string }).placeholder}
          aria-invalid={!!error}
        />
      )}

      {field.type === "textarea" && (
        <AutoResizeTextarea
          value={(value as string) ?? ""}
          onChange={(val) => onChange(val)}
          placeholder={(field as { placeholder?: string }).placeholder}
          hasError={!!error}
        />
      )}

      {field.type === "select" && (
        <select
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          aria-invalid={!!error}
        >
          <option value="">{(field as { placeholder?: string }).placeholder || "Seleziona..."}</option>
          {(field as { options: { label: string; value: string }[] }).options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      )}

      {field.type === "radio" && (
        <div className="space-y-2">
          {(field as { options: { label: string; value: string }[] }).options.map((o) => (
            <label key={o.value} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name={field.id}
                value={o.value}
                checked={(value as string) === o.value}
                onChange={() => onChange(o.value)}
              />
              {o.label}
            </label>
          ))}
        </div>
      )}

      {field.type === "checkbox" && (
        <div className="space-y-2">
          {(field as { options: { label: string; value: string }[] }).options.map((o) => {
            const checked = Array.isArray(value) && (value as string[]).includes(o.value);
            return (
              <label key={o.value} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  value={o.value}
                  checked={checked}
                  onChange={(e) => {
                    const current = Array.isArray(value) ? (value as string[]) : [];
                    onChange(e.target.checked ? [...current, o.value] : current.filter((v) => v !== o.value));
                  }}
                />
                {o.label}
              </label>
            );
          })}
        </div>
      )}

      {field.type === "file" && (
        <div className="w-full rounded-md border-2 border-dashed px-4 py-4 text-center text-sm">
          <input
            type="file"
            accept={(field as { accept?: string }).accept}
            className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1 file:text-xs file:text-primary-foreground"
            onChange={(e) => onChange(e.target.files?.[0] ?? null)}
          />
          {value instanceof File && (
            <p className="mt-2 text-xs text-muted-foreground">{(value as File).name}</p>
          )}
        </div>
      )}

      {(field.type === "date" || field.type === "time") && (
        <Input
          type={field.type}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!!error}
        />
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
      {(field as { helperText?: string }).helperText && (
        <p className="text-xs text-muted-foreground">{(field as { helperText?: string }).helperText}</p>
      )}
    </div>
  );
}
