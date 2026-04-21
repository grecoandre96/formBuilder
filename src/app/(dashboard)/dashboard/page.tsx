import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import FormCard from "@/components/dashboard/FormCard";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const forms = await prisma.form.findMany({
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { submissions: true } } },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">I tuoi form</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {forms.length === 0 ? "Nessun form ancora" : `${forms.length} form creati`}
          </p>
        </div>
        <Link href="/forms/new" className={buttonVariants()}>
          + Nuovo form
        </Link>
      </div>

      {forms.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground">
          <p className="text-lg mb-4">Nessun form ancora</p>
          <Link href="/forms/new" className={buttonVariants()}>
            Crea il primo form
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {forms.map((form) => (
            <FormCard
              key={form.id}
              form={{
                id: form.id,
                name: form.name,
                slug: form.slug,
                isPublished: form.isPublished,
                updatedAt: form.updatedAt,
                _count: form._count,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
