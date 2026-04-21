import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, SessionData } from "@/lib/session";

export async function requireAuth(): Promise<void> {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  if (!session.isLoggedIn) {
    throw new Response(JSON.stringify({ error: "Non autorizzato" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  return !!session.isLoggedIn;
}
