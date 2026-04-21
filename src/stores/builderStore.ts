import { create } from "zustand";
import { FieldDefinition } from "@/types/form";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface BuilderStore {
  fields: FieldDefinition[];
  selectedFieldId: string | null;
  isDirty: boolean;
  isSaving: boolean;
  chatHistory: ChatMessage[];
  isAiLoading: boolean;
  aiPanelOpen: boolean;

  setFields: (fields: FieldDefinition[]) => void;
  addField: (field: FieldDefinition) => void;
  updateField: (id: string, updates: Partial<FieldDefinition>) => void;
  removeField: (id: string) => void;
  duplicateField: (id: string) => void;
  reorderFields: (activeId: string, overId: string) => void;
  selectField: (id: string | null) => void;
  setDirty: (dirty: boolean) => void;
  setSaving: (saving: boolean) => void;
  addChatMessage: (msg: ChatMessage) => void;
  setAiLoading: (loading: boolean) => void;
  toggleAiPanel: () => void;
}

export const useBuilderStore = create<BuilderStore>((set, get) => ({
  fields: [],
  selectedFieldId: null,
  isDirty: false,
  isSaving: false,
  chatHistory: [],
  isAiLoading: false,
  aiPanelOpen: false,

  setFields: (fields) => set({ fields, isDirty: true }),

  addField: (field) =>
    set((s) => ({
      fields: [...s.fields, { ...field, order: s.fields.length }],
      isDirty: true,
      selectedFieldId: field.id,
    })),

  updateField: (id, updates) =>
    set((s) => ({
      fields: s.fields.map((f) => (f.id === id ? { ...f, ...updates } as FieldDefinition : f)),
      isDirty: true,
    })),

  removeField: (id) =>
    set((s) => ({
      fields: s.fields.filter((f) => f.id !== id).map((f, i) => ({ ...f, order: i })),
      selectedFieldId: s.selectedFieldId === id ? null : s.selectedFieldId,
      isDirty: true,
    })),

  duplicateField: (id) => {
    const { fields } = get();
    const field = fields.find((f) => f.id === id);
    if (!field) return;
    const { createId } = require("@paralleldrive/cuid2");
    const newField = { ...field, id: createId(), order: fields.length };
    set((s) => ({ fields: [...s.fields, newField], isDirty: true, selectedFieldId: newField.id }));
  },

  reorderFields: (activeId, overId) => {
    const { fields } = get();
    const oldIndex = fields.findIndex((f) => f.id === activeId);
    const newIndex = fields.findIndex((f) => f.id === overId);
    if (oldIndex === -1 || newIndex === -1) return;
    const newFields = [...fields];
    const [moved] = newFields.splice(oldIndex, 1);
    newFields.splice(newIndex, 0, moved);
    set({ fields: newFields.map((f, i) => ({ ...f, order: i })), isDirty: true });
  },

  selectField: (id) => set({ selectedFieldId: id }),

  setDirty: (dirty) => set({ isDirty: dirty }),
  setSaving: (saving) => set({ isSaving: saving }),

  addChatMessage: (msg) => set((s) => ({ chatHistory: [...s.chatHistory, msg] })),
  setAiLoading: (loading) => set({ isAiLoading: loading }),
  toggleAiPanel: () => set((s) => ({ aiPanelOpen: !s.aiPanelOpen })),
}));
