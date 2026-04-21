"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useBuilderStore } from "@/stores/builderStore";
import { FieldDefinition } from "@/types/form";

interface CanvasFieldProps {
  field: FieldDefinition;
}

function FieldPreview({ field }: { field: FieldDefinition }) {
  if (field.type === "heading") {
    const Tag = `h${field.level ?? 2}` as "h1" | "h2" | "h3";
    return <Tag className="font-semibold text-foreground">{field.content}</Tag>;
  }
  if (field.type === "section") {
    return <p className="text-sm text-muted-foreground">{field.content}</p>;
  }
  if (field.type === "textarea") {
    return (
      <div className="w-full rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground h-16 pointer-events-none">
        {(field as { placeholder?: string }).placeholder || field.label}
      </div>
    );
  }
  if (field.type === "select") {
    return (
      <div className="w-full rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground flex items-center justify-between pointer-events-none">
        <span>{(field as { placeholder?: string }).placeholder || "Seleziona..."}</span>
        <span>▾</span>
      </div>
    );
  }
  if (field.type === "radio") {
    const f = field as { options: { label: string }[] };
    return (
      <div className="space-y-1 pointer-events-none">
        {f.options.slice(0, 3).map((o, i) => (
          <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-4 h-4 rounded-full border" />
            {o.label}
          </div>
        ))}
      </div>
    );
  }
  if (field.type === "checkbox") {
    const f = field as { options: { label: string }[] };
    return (
      <div className="space-y-1 pointer-events-none">
        {f.options.slice(0, 3).map((o, i) => (
          <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-4 h-4 rounded border" />
            {o.label}
          </div>
        ))}
      </div>
    );
  }
  if (field.type === "file") {
    return (
      <div className="w-full rounded-md border-2 border-dashed bg-background px-3 py-4 text-sm text-muted-foreground text-center pointer-events-none">
        📎 Carica file
      </div>
    );
  }
  if (field.type === "date") {
    return (
      <div className="w-full rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground pointer-events-none">
        gg/mm/aaaa
      </div>
    );
  }
  if (field.type === "time") {
    return (
      <div className="w-full rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground pointer-events-none">
        --:--
      </div>
    );
  }
  return (
    <div className="w-full rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground pointer-events-none">
      {(field as { placeholder?: string }).placeholder || field.label}
    </div>
  );
}

export default function CanvasField({ field }: CanvasFieldProps) {
  const { selectedFieldId, selectField, removeField, duplicateField } = useBuilderStore();
  const isSelected = selectedFieldId === field.id;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => selectField(field.id)}
      className={`group relative rounded-lg border-2 p-3 cursor-pointer transition-all ${
        isSelected ? "border-primary bg-primary/5" : "border-transparent hover:border-border bg-background"
      }`}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-1 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity p-1 text-muted-foreground"
        onClick={(e) => e.stopPropagation()}
      >
        ⠿
      </div>

      {/* Field actions */}
      <div className="absolute right-2 top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); duplicateField(field.id); }}
          className="p-1 rounded hover:bg-muted text-xs text-muted-foreground"
          title="Duplica"
        >
          ⧉
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); removeField(field.id); }}
          className="p-1 rounded hover:bg-destructive/10 hover:text-destructive text-xs text-muted-foreground"
          title="Elimina"
        >
          ✕
        </button>
      </div>

      {/* Field content */}
      <div className="pl-5 pr-12">
        {field.type !== "heading" && field.type !== "section" && (
          <div className="flex items-center gap-1 mb-1.5">
            <label className="text-sm font-medium">{field.label}</label>
            {field.required && <span className="text-destructive text-xs">*</span>}
          </div>
        )}
        <FieldPreview field={field} />
      </div>
    </div>
  );
}
