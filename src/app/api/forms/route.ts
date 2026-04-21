import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { generateSlug } from "@/lib/slug";

export async function GET() {
  if (!(await isAuthenticated())) {
    return Response.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const forms = await prisma.form.findMany({
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { submissions: true } } },
  });

  return Response.json(forms);
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const { name, description } = await request.json();
  if (!name?.trim()) {
    return Response.json({ error: "Nome richiesto" }, { status: 400 });
  }

  const baseSlug = generateSlug(name);
  let slug = baseSlug;
  let counter = 1;

  while (await prisma.form.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter++}`;
  }

  const form = await prisma.form.create({
    data: { name: name.trim(), slug, description: description?.trim() || null, fields: [] },
  });

  return Response.json(form, { status: 201 });
}
