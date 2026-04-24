import { readFile } from "fs/promises";
import path from "path";
import { NextRequest } from "next/server";

function mimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const map: Record<string, string> = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".pdf": "application/pdf",
    ".doc": "application/msword",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".xls": "application/vnd.ms-excel",
    ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".zip": "application/zip",
    ".txt": "text/plain",
    ".csv": "text/csv",
  };
  return map[ext] ?? "application/octet-stream";
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;

  // Prevent path traversal
  const safe = path.basename(filename);
  const filepath = path.join(process.cwd(), "public", "uploads", safe);

  try {
    const buffer = await readFile(filepath);
    return new Response(buffer, {
      headers: {
        "Content-Type": mimeType(safe),
        "Content-Disposition": `inline; filename="${safe}"`,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return Response.json({ error: "File non trovato" }, { status: 404 });
  }
}
