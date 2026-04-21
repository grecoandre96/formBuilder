"use client";

import { useState, useRef, useEffect } from "react";
import { useBuilderStore } from "@/stores/builderStore";
import { FieldDefinition } from "@/types/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AiChatPanelProps {
  formId: string;
}

export default function AiChatPanel({ formId }: AiChatPanelProps) {
  const {
    chatHistory, isAiLoading, aiPanelOpen, toggleAiPanel,
    fields, selectedFieldId, addChatMessage, setAiLoading, setFields, updateField,
  } = useBuilderStore();

  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState<"generate" | "modify">("generate");
  const bottomRef = useRef<HTMLDivElement>(null);

  const selectedField = fields.find((f) => f.id === selectedFieldId);

  useEffect(() => {
    if (selectedField) setMode("modify");
    else setMode("generate");
  }, [selectedField]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  if (!aiPanelOpen) return null;

  async function handleSend() {
    if (!prompt.trim() || isAiLoading) return;
    const userPrompt = prompt.trim();
    setPrompt("");
    addChatMessage({ role: "user", content: userPrompt });
    setAiLoading(true);

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          prompt: userPrompt,
          currentFields: fields,
          selectedField: mode === "modify" ? selectedField : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        addChatMessage({ role: "assistant", content: `Errore: ${data.error || "Riprova"}` });
        return;
      }

      if (mode === "generate" && data.fields) {
        setFields(data.fields as FieldDefinition[]);
      } else if (mode === "modify" && data.field && selectedFieldId) {
        updateField(selectedFieldId, data.field as Partial<FieldDefinition>);
      }

      addChatMessage({ role: "assistant", content: data.message || "Fatto!" });
    } catch {
      addChatMessage({ role: "assistant", content: "Errore di rete. Riprova." });
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <div className="w-72 border-l bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <span className="font-medium text-sm">✨ AI Builder</span>
        <button onClick={toggleAiPanel} className="text-muted-foreground hover:text-foreground text-sm">✕</button>
      </div>

      {/* Mode toggle */}
      <div className="px-3 pt-3 pb-2">
        <div className="flex border rounded-md overflow-hidden text-xs">
          <button
            onClick={() => setMode("generate")}
            className={`flex-1 py-1.5 transition-colors ${mode === "generate" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
          >
            Genera form
          </button>
          <button
            onClick={() => setMode("modify")}
            disabled={!selectedField}
            className={`flex-1 py-1.5 transition-colors disabled:opacity-40 ${mode === "modify" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
          >
            Modifica campo
          </button>
        </div>
        {mode === "modify" && selectedField && (
          <p className="text-xs text-muted-foreground mt-1.5">
            Campo: <span className="font-medium">{selectedField.label}</span>
          </p>
        )}
      </div>

      {/* Chat history */}
      <ScrollArea className="flex-1 px-3">
        {chatHistory.length === 0 ? (
          <div className="text-xs text-muted-foreground text-center py-8">
            <p className="text-2xl mb-2">✨</p>
            <p>Descrivi il form che vuoi creare</p>
            <p className="mt-1 opacity-70">Es. &ldquo;form per raccolta ordini con nome, prodotto e quantità&rdquo;</p>
          </div>
        ) : (
          <div className="space-y-3 py-3">
            {chatHistory.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-lg px-3 py-2 text-xs ${
                  msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isAiLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-3 py-2 text-xs text-muted-foreground">
                  Sto pensando...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t">
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={
            mode === "generate"
              ? "Descrivi il form..."
              : "Cosa vuoi cambiare nel campo selezionato?"
          }
          rows={3}
          className="text-xs resize-none mb-2"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
          }}
        />
        <Button
          onClick={handleSend}
          disabled={!prompt.trim() || isAiLoading}
          className="w-full h-8 text-xs"
        >
          {isAiLoading ? "..." : "Invia"}
        </Button>
      </div>
    </div>
  );
}
