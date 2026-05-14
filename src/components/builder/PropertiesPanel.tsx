"use client";

import { useState } from "react";
import { useBuilderStore } from "@/stores/builderStore";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { createId } from "@paralleldrive/cuid2";
import { FieldDefinition, FieldOption, SelectField, CheckboxField, ShowIfCondition } from "@/types/form";

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

        {/* Conditional visibility — available for all non-structural fields */}
        {field.type !== "heading" && field.type !== "section" && (
          <ConditionalVisibility field={field} allFields={fields} onUpdate={update} />
        )}
      </div>
    </div>
  );
}

function ConditionalVisibility({
  field,
  allFields,
  onUpdate,
}: {
  field: FieldDefinition;
  allFields: FieldDefinition[];
  onUpdate: (u: Partial<FieldDefinition>) => void;
}) {
  // Only select/radio fields with options can act as trigger
  const triggerCandidates = allFields.filter(
    (f) =>
      f.id !== field.id &&
      (f.type === "select" || f.type === "radio") &&
      (f as SelectField).options?.length > 0
  );

  const showIf = field.showIf as ShowIfCondition | undefined;
  const triggerField = showIf
    ? (allFields.find((f) => f.id === showIf.fieldId) as SelectField | undefined)
    : undefined;
  const triggerOptions = triggerField?.options ?? [];

  return (
    <div className="space-y-2 pt-3 border-t">
      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        Visibilità condizionale
      </Label>

      <div className="space-y-1.5">
        <Label className="text-xs">Mostra solo se</Label>
        <select
          value={showIf?.fieldId ?? ""}
          onChange={(e) => {
            if (!e.target.value) {
              onUpdate({ showIf: undefined } as Partial<FieldDefinition>);
            } else {
              onUpdate({ showIf: { fieldId: e.target.value, value: "" } } as Partial<FieldDefinition>);
            }
          }}
          className="w-full h-8 rounded-md border bg-background text-sm px-2"
        >
          <option value="">— Sempre visibile —</option>
          {triggerCandidates.map((f) => (
            <option key={f.id} value={f.id}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      {showIf?.fieldId && (
        <div className="space-y-1.5">
          <Label className="text-xs">è uguale a</Label>
          <select
            value={showIf.value ?? ""}
            onChange={(e) =>
              onUpdate({
                showIf: { fieldId: showIf.fieldId, value: e.target.value },
              } as Partial<FieldDefinition>)
            }
            className="w-full h-8 rounded-md border bg-background text-sm px-2"
          >
            <option value="">— Seleziona valore —</option>
            {triggerOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {showIf?.fieldId && (
        <p className="text-xs text-muted-foreground">
          Questo campo appare solo quando{" "}
          <span className="font-medium">{triggerField?.label ?? "…"}</span> ={" "}
          <span className="font-medium">{showIf.value || "…"}</span>
        </p>
      )}
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
  const options = field.options as FieldOption[];
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  function toggleExpand(i: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  function updateOptionLabel(i: number, val: string) {
    const next = options.map((o, idx) =>
      idx === i ? { ...o, label: val, value: val } : o
    );
    onUpdate({ options: next } as Partial<FieldDefinition>);
  }

  function addOption() {
    const n = options.length + 1;
    const label = `Opzione ${n}`;
    onUpdate({ options: [...options, { label, value: label }] } as Partial<FieldDefinition>);
  }

  function removeOption(i: number) {
    onUpdate({ options: options.filter((_, idx) => idx !== i) } as Partial<FieldDefinition>);
    setExpanded((prev) => {
      const next = new Set<number>();
      prev.forEach((idx) => {
        if (idx < i) next.add(idx);
        else if (idx > i) next.add(idx - 1);
      });
      return next;
    });
  }

  function addMeta(i: number) {
    const next = options.map((o, idx) =>
      idx === i ? { ...o, meta: { ...(o.meta ?? {}), "": "" } } : o
    );
    onUpdate({ options: next } as Partial<FieldDefinition>);
  }

  function updateMeta(i: number, oldKey: string, newKey: string, newVal: string) {
    const next = options.map((o, idx) => {
      if (idx !== i) return o;
      const meta: Record<string, string> = {};
      for (const [k, v] of Object.entries(o.meta ?? {})) {
        if (k === oldKey) meta[newKey] = newVal;
        else meta[k] = v;
      }
      return { ...o, meta };
    });
    onUpdate({ options: next } as Partial<FieldDefinition>);
  }

  function removeMeta(i: number, key: string) {
    const next = options.map((o, idx) => {
      if (idx !== i) return o;
      const meta = { ...(o.meta ?? {}) };
      delete meta[key];
      return { ...o, meta: Object.keys(meta).length > 0 ? meta : undefined };
    });
    onUpdate({ options: next } as Partial<FieldDefinition>);
  }

  return (
    <div className="space-y-2 mb-3">
      <Label className="text-xs">Opzioni</Label>
      {options.map((opt, i) => {
        const isExpanded = expanded.has(i);
        const metaEntries = Object.entries(opt.meta ?? {});
        const hasMeta = metaEntries.length > 0;
        return (
          <div key={i} className="space-y-1">
            <div className="flex gap-1 items-center">
              <Input
                value={opt.label}
                onChange={(e) => updateOptionLabel(i, e.target.value)}
                className="h-7 text-xs flex-1"
                placeholder="Etichetta"
              />
              <button
                onClick={() => toggleExpand(i)}
                title="Metadati"
                className={`h-7 px-1.5 rounded border text-xs font-mono transition-colors ${
                  hasMeta
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {hasMeta ? `{${metaEntries.length}}` : "{}"}
              </button>
              <button
                onClick={() => removeOption(i)}
                className="text-muted-foreground hover:text-destructive text-xs px-1"
              >
                ✕
              </button>
            </div>

            {isExpanded && (
              <div className="ml-2 pl-2 border-l border-border space-y-1 pb-1">
                {metaEntries.map(([k, v], mi) => (
                  <div key={mi} className="flex gap-1 items-center">
                    <input
                      value={k}
                      onChange={(e) => updateMeta(i, k, e.target.value, v)}
                      className="h-6 w-0 flex-1 rounded border bg-background px-1.5 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      placeholder="chiave"
                    />
                    <input
                      value={v}
                      onChange={(e) => updateMeta(i, k, k, e.target.value)}
                      className="h-6 w-0 flex-1 rounded border bg-background px-1.5 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      placeholder="valore"
                    />
                    <button
                      onClick={() => removeMeta(i, k)}
                      className="text-muted-foreground hover:text-destructive text-xs px-1 shrink-0"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addMeta(i)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  + campo
                </button>
              </div>
            )}
          </div>
        );
      })}
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
