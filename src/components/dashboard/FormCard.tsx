"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface FormCardProps {
  form: {
    id: string;
    name: string;
    slug: string;
    isPublished: boolean;
    updatedAt: Date;
    _count: { submissions: number };
  };
}

export default function FormCard({ form }: FormCardProps) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`Eliminare "${form.name}"? Questa azione è irreversibile.`)) return;
    await fetch(`/api/forms/${form.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-tight">{form.name}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger render={<button className="p-1 rounded hover:bg-muted text-muted-foreground" />}>
              ⋯
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem render={<Link href={`/forms/${form.id}/builder`} />}>
                Modifica
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href={`/forms/${form.id}/settings`} />}>
                Impostazioni
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href={`/forms/${form.id}/submissions`} />}>
                Risposte
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem render={<a href={`/f/${form.slug}`} target="_blank" rel="noopener noreferrer" />}>
                Apri form
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={handleDelete}>
                Elimina
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-2 mt-2">
          <Badge variant={form.isPublished ? "default" : "secondary"}>
            {form.isPublished ? "Pubblicato" : "Bozza"}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {form._count.submissions} risposte
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-2">/{form.slug}</p>
        <Link
          href={`/forms/${form.id}/builder`}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full mt-3")}
        >
          Apri builder
        </Link>
      </CardContent>
    </Card>
  );
}
