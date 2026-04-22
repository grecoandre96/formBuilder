import Anthropic from "@anthropic-ai/sdk";
import { FieldDefinition } from "@/types/form";

const client = new Anthropic({ apiKey: process.env.AI_KEY });

const SYSTEM_PROMPT = `Sei un assistente per la creazione di form web. Rispondi SEMPRE con JSON valido, senza markdown o code fences.

I tipi di campo disponibili sono: text, textarea, email, phone, number, select, radio, checkbox, file, date, time, heading, section

Ogni campo deve avere: id (stringa cuid2, inizia con lettera, ~24 chars), type, label (in italiano), required (boolean), order (intero da 0).

Per select/radio: aggiungi "options": [{"label": "...", "value": "..."}] — il campo "value" deve essere IDENTICO alla "label" (testo leggibile, non slug)
Per checkbox: aggiungi "options": [{"label": "...", "value": "..."}] — il campo "value" deve essere IDENTICO alla "label" (testo leggibile, non slug)
Per heading/section: aggiungi "content": "...", "level": 1|2|3
Per text/textarea/email/phone/number/select: puoi aggiungere "placeholder": "..."
Per time: usa type "time" per campi orario (es. 14:30)
Per file: puoi aggiungere "accept": "...", "maxSizeMb": numero

Regole:
- Crea campi sensati con etichette chiare in italiano
- Imposta required=true solo per campi essenziali
- Per select/radio/checkbox crea almeno 2 opzioni significative
- Gli id devono essere univoci`;

function generateId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = chars[Math.floor(Math.random() * 26)]; // starts with letter
  for (let i = 0; i < 23; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

export async function callAI(payload: {
  mode: "generate" | "modify";
  prompt: string;
  currentFields?: FieldDefinition[];
  selectedField?: FieldDefinition;
}): Promise<{ fields?: FieldDefinition[]; field?: FieldDefinition; message: string }> {
  let userPrompt: string;

  if (payload.mode === "generate") {
    userPrompt = `Crea un form per: "${payload.prompt}"
${payload.currentFields?.length ? `\nForm attuale (${payload.currentFields.length} campi):\n${JSON.stringify(payload.currentFields, null, 2)}` : ""}

Rispondi con JSON: { "fields": [...], "message": "breve spiegazione" }`;
  } else {
    userPrompt = `Modifica questo campo in base alla richiesta dell'utente.

Campo attuale:
${JSON.stringify(payload.selectedField, null, 2)}

Richiesta: "${payload.prompt}"

Rispondi con JSON: { "field": {...}, "message": "breve spiegazione" }`;
  }

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cache_control: { type: "ephemeral" } as any,
      },
    ],
    messages: [{ role: "user", content: userPrompt }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
  const parsed = JSON.parse(cleaned);

  // Ensure IDs are present
  if (parsed.fields) {
    parsed.fields = parsed.fields.map((f: FieldDefinition, i: number) => ({
      ...f,
      id: f.id || generateId(),
      order: i,
    }));
  }

  return parsed;
}
