import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { generateSlug } from "@/lib/slug";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ formId: string }> }
) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: "Non autorizzato" }, { status: 401 });
  }
  const { formId } = await params;
  const form = await prisma.form.findUnique({ where: { id: formId } });
  if (!form) return Response.json({ error: "Form non trovato" }, { status: 404 });
  return Response.json(form);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ formId: string }> }
) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: "Non autorizzato" }, { status: 401 });
  }
  const { formId } = await params;
  const body = await request.json();

  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.description !== undefined) data.description = body.description;
  if (body.webhookUrl !== undefined) data.webhookUrl = body.webhookUrl;
  if (body.webhookHeaders !== undefined) data.webhookHeaders = body.webhookHeaders;
  if (body.isPublished !== undefined) data.isPublished = body.isPublished;

  if (body.name) {
    const slug = generateSlug(body.name);
    const existing = await prisma.form.findFirst({
      where: { slug, NOT: { id: formId } },
    });
    if (!existing) data.slug = slug;
  }
  if (body.slug !== undefined) {
    const existing = await prisma.form.findFirst({
      where: { slug: body.slug, NOT: { id: formId } },
    });
    if (existing) {
      return Response.json({ error: "Slug già in uso" }, { status: 400 });
    }
    data.slug = body.slug;
  }

  const form = await prisma.form.update({ where: { id: formId }, data });
  return Response.json(form);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ formId: string }> }
) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: "Non autorizzato" }, { status: 401 });
  }
  const { formId } = await params;
  await prisma.form.delete({ where: { id: formId } });
  return Response.json({ ok: true });
}
