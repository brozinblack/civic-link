import { NextRequest, NextResponse } from "next/server";
import { checkClientRequest, execute, tokenHash } from "@/lib/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!checkClientRequest(request)) return NextResponse.json({ error: "Request not allowed." }, { status: 403 });
  const token = request.cookies.get("webdev_app_session")?.value;
  if (token) {
    try { await execute("DELETE FROM auth_sessions WHERE token_hash = ?", [tokenHash(token)]); } catch { /* Clearing the browser cookie is still safe. */ }
  }
  const response = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  response.cookies.set("webdev_app_session", "", { httpOnly: true, secure: true, sameSite: "none", path: "/", maxAge: 0 });
  return response;
}
