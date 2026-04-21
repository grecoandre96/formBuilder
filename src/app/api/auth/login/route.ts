import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, SessionData } from "@/lib/session";

export async function POST(request: Request) {
  const { password } = await request.json();

  if (password !== process.env.APP_PASSWORD) {
    return Response.json({ error: "Password errata" }, { status: 401 });
  }

  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  session.isLoggedIn = true;
  await session.save();

  return Response.json({ ok: true });
}
