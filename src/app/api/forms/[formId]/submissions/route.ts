import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ formId: string }> }
) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: "Non autorizzato" }, { status: 401 });
  }
  const { formId } = await params;
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") ?? "1");
  const limit = 20;
  const skip = (page - 1) * limit;

  const [submissions, total] = await Promise.all([
    prisma.submission.findMany({
      where: { formId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.submission.count({ where: { formId } }),
  ]);

  return Response.json({ submissions, total, page, pages: Math.ceil(total / limit) });
}
