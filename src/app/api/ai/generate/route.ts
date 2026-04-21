import { isAuthenticated } from "@/lib/auth";
import { callAI } from "@/lib/ai";

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const body = await request.json();
  const { mode, prompt, currentFields, selectedField } = body;

  if (!prompt?.trim()) {
    return Response.json({ error: "Prompt richiesto" }, { status: 400 });
  }

  try {
    const result = await callAI({ mode, prompt, currentFields, selectedField });
    return Response.json(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("AI error:", msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}
