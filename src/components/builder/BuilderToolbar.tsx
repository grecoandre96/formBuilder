"use client";

import { useBuilderStore } from "@/stores/builderStore";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface BuilderToolbarProps {
  formId: string;
  formName: string;
  isPublished: boolean;
  activeTab: "build" | "preview";
  onTabChange: (tab: "build" | "preview") => void;
  onSave: () => void;
  onTogglePublish: () => void;
}

export default function BuilderToolbar({
  formId,
  formName,
  isPublished,
  activeTab,
  onTabChange,
  onSave,
  onTogglePublish,
}: BuilderToolbarProps) {
  const { isDirty, isSaving, toggleAiPanel } = useBuilderStore();

  return (
    <div className="border-b bg-background px-4 h-12 flex items-center gap-3 shrink-0">
      {/* Back */}
      <Link href="/dashboard" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-xs")}>
        ← Dashboard
      </Link>

      <div className="w-px h-5 bg-border" />

      {/* Form name */}
      <span className="font-medium text-sm truncate max-w-40">{formName}</span>
      <Badge variant={isPublished ? "default" : "secondary"} className="text-xs">
        {isPublished ? "Pubblicato" : "Bozza"}
      </Badge>

      {/* Tabs */}
      <div className="flex-1 flex justify-center">
        <div className="flex border rounded-md overflow-hidden">
          <button
            onClick={() => onTabChange("build")}
            className={`px-3 py-1 text-xs font-medium transition-colors ${
              activeTab === "build" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
            }`}
          >
            Build
          </button>
          <button
            onClick={() => onTabChange("preview")}
            className={`px-3 py-1 text-xs font-medium transition-colors ${
              activeTab === "preview" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
            }`}
          >
            Preview
          </button>
        </div>
      </div>

      {/* Actions */}
      <Button variant="ghost" size="sm" className="text-xs" onClick={toggleAiPanel}>
        ✨ AI
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="text-xs"
        onClick={onSave}
        disabled={isSaving || !isDirty}
      >
        {isSaving ? "Salvo..." : isDirty ? "Salva*" : "Salvato"}
      </Button>

      <Button size="sm" className="text-xs" onClick={onTogglePublish}>
        {isPublished ? "Nascondi" : "Pubblica"}
      </Button>

      <a
        href={`/f/${formId}`}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-xs")}
      >
        ↗ Apri
      </a>
    </div>
  );
}
