"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useBuilderStore } from "@/stores/builderStore";
import CanvasField from "./CanvasField";

export default function FormCanvas() {
  const { fields, reorderFields, selectField } = useBuilderStore();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderFields(String(active.id), String(over.id));
    }
  }

  return (
    <div
      className="flex-1 overflow-y-auto p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) selectField(null);
      }}
    >
      {fields.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center py-24">
          <p className="text-4xl mb-4">⊕</p>
          <p className="text-lg font-medium">Aggiungi un campo</p>
          <p className="text-sm mt-1">Clicca un elemento a sinistra o chiedi all&apos;AI</p>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto space-y-2">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={fields.map((f) => f.id)}
              strategy={verticalListSortingStrategy}
            >
              {fields.map((field) => (
                <CanvasField key={field.id} field={field} />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  );
}
