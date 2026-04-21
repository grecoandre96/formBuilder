import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const formId = formData.get("formId") as string | null;

  if (!file) {
    return Response.json({ error: "Nessun file" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const filename = `${timestamp}-${safeName}`;
  const filepath = path.join(uploadDir, filename);

  await writeFile(filepath, buffer);

  return Response.json({ url: `/uploads/${filename}`, filename });
}
