import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ formId: string }> }
) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: "Non autorizzato" }, { status: 401 });
  }
  const { formId } = await params;
  const { fields } = await request.json();

  const form = await prisma.form.update({
    where: { id: formId },
    data: { fields: fields ?? [] },
  });

  return Response.json(form);
}
