export interface WebhookPayload {
  event: "form_submission";
  form: { id: string; name: string; slug: string };
  submission: {
    id: string;
    submittedAt: string;
    data: Record<string, unknown>;
    files?: Record<string, string>;
    metadata?: Record<string, string>;
  };
}

export async function sendToWebhook(
  webhookUrl: string,
  headers: Record<string, string>,
  payload: WebhookPayload
): Promise<{ status: "success" | "failed"; response?: unknown }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const text = await res.text();
    return { status: res.ok ? "success" : "failed", response: text };
  } catch (e) {
    clearTimeout(timeout);
    return { status: "failed", response: String(e) };
  }
}
