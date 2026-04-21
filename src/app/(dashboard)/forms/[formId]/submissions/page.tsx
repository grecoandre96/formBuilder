"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface Submission {
  id: string;
  data: Record<string, unknown>;
  files?: Record<string, string>;
  webhookStatus?: string;
  createdAt: string;
}

export default function SubmissionsPage() {
  const params = useParams();
  const formId = params.formId as string;
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Submission | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/forms/${formId}/submissions?page=${page}`)
      .then((r) => r.json())
      .then((data) => {
        setSubmissions(data.submissions);
        setTotal(data.total);
        setPages(data.pages);
      })
      .finally(() => setLoading(false));
  }, [formId, page]);

  function webhookBadge(status?: string) {
    if (status === "success") return <Badge variant="default" className="text-xs">✓ Webhook</Badge>;
    if (status === "failed") return <Badge variant="destructive" className="text-xs">✗ Webhook</Badge>;
    if (status === "skipped") return <Badge variant="secondary" className="text-xs">— No webhook</Badge>;
    return <Badge variant="secondary" className="text-xs">Pending</Badge>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/forms/${formId}/builder`} className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
          ← Builder
        </Link>
        <h1 className="text-xl font-bold">Risposte ({total})</h1>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Caricamento...</p>
      ) : submissions.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg">Nessuna risposta ancora</p>
          <p className="text-sm mt-1">Le risposte appariranno qui dopo l&apos;invio del form</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {submissions.map((sub) => {
              const preview = Object.values(sub.data).filter(Boolean).slice(0, 3).join(" · ");
              return (
                <div
                  key={sub.id}
                  onClick={() => setSelected(sub)}
                  className="border rounded-lg px-4 py-3 hover:bg-muted/50 cursor-pointer flex items-center justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{preview || "Risposta vuota"}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(sub.createdAt).toLocaleString("it-IT")}
                    </p>
                  </div>
                  {webhookBadge(sub.webhookStatus)}
                </div>
              );
            })}
          </div>

          {pages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                ← Precedente
              </Button>
              <span className="text-sm py-2">{page} / {pages}</span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pages}
                onClick={() => setPage(page + 1)}
              >
                Successiva →
              </Button>
            </div>
          )}
        </>
      )}

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        {selected && (
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <h2 className="font-semibold mb-3">
              Risposta — {new Date(selected.createdAt).toLocaleString("it-IT")}
            </h2>
            <pre className="text-xs bg-muted rounded-md p-4 overflow-auto whitespace-pre-wrap">
              {JSON.stringify({ data: selected.data, files: selected.files }, null, 2)}
            </pre>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
