"use client";

import { useBuilderStore } from "@/stores/builderStore";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { createId } from "@paralleldrive/cuid2";
import { FieldDefinition, SelectField, CheckboxField } from "@/types/form";

export default function PropertiesPanel() {
  const { fields, selectedFieldId, updateField } = useBuilderStore();
  const field = fields.find((f) => f.id === selectedFieldId);

  if (!field) {
    return (
      <div className="w-64 border-l bg-muted/30 p-4 flex items-center justify-center">
        <p className="text-sm text-muted-foreground text-center">
          Seleziona un campo per modificarlo
        </p>
      </div>
    );
  }

  function update(updates: Partial<FieldDefinition>) {
    updateField(field!.id, updates);
  }

  return (
    <div className="w-64 border-l bg-muted/30 p-4 overflow-y-auto flex flex-col gap-4">
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Proprietà campo
        </p>

        {/* Label */}
        {field.type !== "heading" && field.type !== "section" && (
          <div className="space-y-1.5 mb-3">
            <Label className="text-xs">Etichetta</Label>
            <Input
              value={field.label}
              onChange={(e) => update({ label: e.target.value })}
              className="h-8 text-sm"
            />
          </div>
        )}

        {/* Required toggle */}
        {field.type !== "heading" && field.type !== "section" && (
          <div className="flex items-center justify-between mb-3">
            <Label className="text-xs">Obbligatorio</Label>
            <Switch
              checked={field.required}
              onCheckedChange={(v) => update({ required: v })}
            />
          </div>
        )}

        {/* Placeholder */}
        {(field.type === "text" || field.type === "textarea" || field.type === "email" ||
          field.type === "phone" || field.type === "number" || field.type === "select") && (
          <div className="space-y-1.5 mb-3">
            <Label className="text-xs">Placeholder</Label>
            <Input
              value={(field as { placeholder?: string }).placeholder ?? ""}
              onChange={(e) => update({ placeholder: e.target.value } as Partial<FieldDefinition>)}
              className="h-8 text-sm"
            />
          </div>
        )}

        {/* Helper text for text-like fields */}
        {(field.type === "text" || field.type === "textarea" || field.type === "email" ||
          field.type === "phone" || field.type === "number") && (
          <div className="space-y-1.5 mb-3">
            <Label className="text-xs">Testo aiuto</Label>
            <Input
              value={(field as { helperText?: string }).helperText ?? ""}
              onChange={(e) => update({ helperText: e.target.value } as Partial<FieldDefinition>)}
              className="h-8 text-sm"
              placeholder="Facoltativo"
            />
          </div>
        )}

        {/* Options for select / radio / checkbox */}
        {(field.type === "select" || field.type === "radio" || field.type === "checkbox") && (
          <OptionsEditor field={field as SelectField | CheckboxField} onUpdate={update} />
        )}

        {/* File field props */}
        {field.type === "file" && (
          <>
            <div className="space-y-1.5 mb-3">
              <Label className="text-xs">Tipi accettati</Label>
              <Input
                value={(field as { accept?: string }).accept ?? ""}
                onChange={(e) => update({ accept: e.target.value } as Partial<FieldDefinition>)}
                className="h-8 text-sm"
                placeholder="es. image/*,.pdf"
              />
            </div>
            <div className="space-y-1.5 mb-3">
              <Label className="text-xs">Dimensione max (MB)</Label>
              <Input
                type="number"
                value={(field as { maxSizeMb?: number }).maxSizeMb ?? 10}
                onChange={(e) => update({ maxSizeMb: parseInt(e.target.value) } as Partial<FieldDefinition>)}
                className="h-8 text-sm"
                min={1}
                max={100}
              />
            </div>
          </>
        )}

        {/* Heading/section content */}
        {(field.type === "heading" || field.type === "section") && (
          <>
            <div className="space-y-1.5 mb-3">
              <Label className="text-xs">
                {field.type === "heading" ? "Testo titolo" : "Testo sezione"}
              </Label>
              <Input
                value={(field as { content: string }).content}
                onChange={(e) => update({ content: e.target.value } as Partial<FieldDefinition>)}
                className="h-8 text-sm"
              />
            </div>
            {field.type === "heading" && (
              <div className="space-y-1.5 mb-3">
                <Label className="text-xs">Livello</Label>
                <select
                  value={(field as { level?: number }).level ?? 2}
                  onChange={(e) => update({ level: parseInt(e.target.value) as 1 | 2 | 3 } as Partial<FieldDefinition>)}
                  className="w-full h-8 rounded-md border bg-background text-sm px-2"
                >
                  <option value={1}>H1 — Grande</option>
                  <option value={2}>H2 — Medio</option>
                  <option value={3}>H3 — Piccolo</option>
                </select>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function OptionsEditor({
  field,
  onUpdate,
}: {
  field: SelectField | CheckboxField;
  onUpdate: (u: Partial<FieldDefinition>) => void;
}) {
  const options = field.options;

  function updateOption(i: number, key: "label" | "value", val: string) {
    const next = options.map((o, idx) => (idx === i ? { ...o, [key]: val } : o));
    onUpdate({ options: next } as Partial<FieldDefinition>);
  }

  function addOption() {
    const n = options.length + 1;
    onUpdate({ options: [...options, { label: `Opzione ${n}`, value: `opzione_${n}` }] } as Partial<FieldDefinition>);
  }

  function removeOption(i: number) {
    onUpdate({ options: options.filter((_, idx) => idx !== i) } as Partial<FieldDefinition>);
  }

  return (
    <div className="space-y-2 mb-3">
      <Label className="text-xs">Opzioni</Label>
      {options.map((opt, i) => (
        <div key={i} className="flex gap-1 items-center">
          <Input
            value={opt.label}
            onChange={(e) => updateOption(i, "label", e.target.value)}
            className="h-7 text-xs flex-1"
            placeholder="Etichetta"
          />
          <button
            onClick={() => removeOption(i)}
            className="text-muted-foreground hover:text-destructive text-xs px-1"
          >
            ✕
          </button>
        </div>
      ))}
      <Button
        variant="outline"
        className="w-full h-7 text-xs"
        onClick={addOption}
      >
        + Aggiungi opzione
      </Button>
    </div>
  );
}
