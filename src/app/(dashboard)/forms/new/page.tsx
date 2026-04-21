"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NewFormPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("Il nome è richiesto"); return; }
    setLoading(true);

    const res = await fetch("/api/forms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });

    if (res.ok) {
      const form = await res.json();
      router.push(`/forms/${form.id}/builder`);
    } else {
      const data = await res.json();
      setError(data.error || "Errore nella creazione");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Nuovo form</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Es. Raccolta ordini Store Nord"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrizione (opzionale)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A cosa serve questo form?"
                rows={3}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Creazione..." : "Crea e apri builder"}
              </Button>
              <Link
                href="/dashboard"
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                Annulla
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
