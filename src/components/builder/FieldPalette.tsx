"use client";

import { createId } from "@paralleldrive/cuid2";
import { useBuilderStore } from "@/stores/builderStore";
import { FieldDefinition, FieldType } from "@/types/form";

const FIELD_TYPES: { type: FieldType; label: string; icon: string }[] = [
  { type: "text", label: "Testo", icon: "T" },
  { type: "textarea", label: "Area testo", icon: "¶" },
  { type: "email", label: "Email", icon: "@" },
  { type: "phone", label: "Telefono", icon: "☏" },
  { type: "number", label: "Numero", icon: "#" },
  { type: "select", label: "Dropdown", icon: "▾" },
  { type: "radio", label: "Radio", icon: "◉" },
  { type: "checkbox", label: "Checkbox", icon: "☑" },
  { type: "file", label: "File", icon: "📎" },
  { type: "date", label: "Data", icon: "📅" },
  { type: "time", label: "Orario", icon: "⏰" },
  { type: "heading", label: "Titolo", icon: "H" },
  { type: "section", label: "Sezione", icon: "—" },
];

function createDefaultField(type: FieldType, order: number): FieldDefinition {
  const base = { id: createId(), type, label: labelFor(type), required: false, order };
  if (type === "select" || type === "radio") {
    return { ...base, type, options: [{ label: "Opzione 1", value: "Opzione 1" }] } as FieldDefinition;
  }
  if (type === "checkbox") {
    return { ...base, type, options: [{ label: "Opzione 1", value: "Opzione 1" }] } as FieldDefinition;
  }
  if (type === "heading" || type === "section") {
    return { ...base, type, content: type === "heading" ? "Titolo sezione" : "Descrizione sezione", level: 2 } as FieldDefinition;
  }
  if (type === "file") {
    return { ...base, type, accept: "*/*", maxSizeMb: 10 } as FieldDefinition;
  }
  return { ...base, type, placeholder: "" } as FieldDefinition;
}

function labelFor(type: FieldType): string {
  const map: Record<FieldType, string> = {
    text: "Campo testo", textarea: "Area testo", email: "Email", phone: "Telefono",
    number: "Numero", select: "Dropdown", radio: "Scelta multipla", checkbox: "Checkbox",
    file: "Carica file", date: "Data", time: "Orario", heading: "Titolo", section: "Sezione",
  };
  return map[type];
}

export default function FieldPalette() {
  const { addField, fields } = useBuilderStore();

  return (
    <div className="w-56 border-r bg-muted/30 p-3 flex flex-col gap-1 overflow-y-auto">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Elementi</p>
      {FIELD_TYPES.map(({ type, label, icon }) => (
        <button
          key={type}
          onClick={() => addField(createDefaultField(type, fields.length))}
          className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm hover:bg-background hover:shadow-sm transition-all text-left border border-transparent hover:border-border"
        >
          <span className="w-6 h-6 flex items-center justify-center rounded bg-background border text-xs font-mono shrink-0">
            {icon}
          </span>
          {label}
        </button>
      ))}
    </div>
  );
}
