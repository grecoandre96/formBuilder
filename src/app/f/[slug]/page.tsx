import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { FieldDefinition } from "@/types/form";
import PublicFormClient from "./PublicFormClient";

export default async function PublicFormPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const form = await prisma.form.findUnique({ where: { slug } });

  if (!form || !form.isPublished) notFound();

  return (
    <div className="min-h-screen bg-muted/20 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-background rounded-xl border shadow-sm p-8">
        <div className="flex justify-center mb-6">
          <img src="/logo.png" alt="Logo" className="h-16 w-auto object-contain" />
        </div>
        <PublicFormClient
          formId={form.id}
          formSlug={form.slug}
          formName={form.name}
          formDescription={form.description ?? undefined}
          fields={form.fields as unknown as FieldDefinition[]}
        />
      </div>
    </div>
  );
}
