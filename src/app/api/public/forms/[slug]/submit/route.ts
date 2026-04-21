import { prisma } from "@/lib/prisma";
import { sendToWebhook } from "@/lib/webhook";
import { headers } from "next/headers";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const form = await prisma.form.findUnique({ where: { slug } });
  if (!form || !form.isPublished) {
    return Response.json({ error: "Form non trovato" }, { status: 404 });
  }

  const { data, files } = await request.json();

  // Build fieldId → label map for human-readable webhook payload
  const fields = (form.fields as { id: string; label: string; type: string }[]) ?? [];
  const labelMap: Record<string, string> = {};
  for (const f of fields) {
    if (f.id && f.label) labelMap[f.id] = f.label;
  }
  function toLabeled(obj: Record<string, unknown>) {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      result[labelMap[k] ?? k] = v;
    }
    return result;
  }

  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") ?? headersList.get("x-real-ip") ?? "unknown";
  const userAgent = headersList.get("user-agent") ?? "";

  const submission = await prisma.submission.create({
    data: {
      formId: form.id,
      data: data ?? {},
      files: files && Object.keys(files).length > 0 ? files : undefined,
      metadata: { ip, userAgent, submittedAt: new Date().toISOString() },
      webhookStatus: form.webhookUrl ? "pending" : "skipped",
    },
  });

  // Fire webhook async (don't block response)
  if (form.webhookUrl) {
    const webhookHeaders = (form.webhookHeaders as Record<string, string>) ?? {};
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

    // Build file URLs with absolute paths
    const fileUrls: Record<string, string> = {};
    if (files) {
      for (const [fieldId, path] of Object.entries(files as Record<string, string>)) {
        fileUrls[fieldId] = path.startsWith("http") ? path : `${baseUrl}${path}`;
      }
    }

    sendToWebhook(form.webhookUrl, webhookHeaders, {
      event: "form_submission",
      form: { id: form.id, name: form.name, slug: form.slug },
      submission: {
        id: submission.id,
        submittedAt: submission.createdAt.toISOString(),
        data: toLabeled(data ?? {}),
        ...(Object.keys(fileUrls).length > 0 && { files: toLabeled(fileUrls) }),
        metadata: { ip, userAgent },
      },
    }).then(async (result) => {
      await prisma.submission.update({
        where: { id: submission.id },
        data: {
          webhookStatus: result.status,
          webhookResponse: result.response as object,
        },
      });
    });
  }

  return Response.json({ ok: true, submissionId: submission.id });
}
