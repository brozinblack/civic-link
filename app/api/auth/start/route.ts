import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { checkClientRequest } from "@/lib/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!checkClientRequest(request)) return NextResponse.json({ error: "Request not allowed." }, { status: 403 });
  const projectId = process.env.MANUS_PROJECT_ID;
  const portalBase = process.env.MANUS_OAUTH_PORTAL_URL;
  const origin = request.headers.get("origin");
  if (!projectId || !portalBase || !origin) return NextResponse.json({ error: "Sign-in is not configured in this environment." }, { status: 503 });

  let parsedOrigin: URL;
  try {
    parsedOrigin = new URL(origin);
    const localHttp = parsedOrigin.protocol === "http:" && ["localhost", "127.0.0.1"].includes(parsedOrigin.hostname);
    if (parsedOrigin.origin !== origin || (parsedOrigin.protocol !== "https:" && !localHttp)) throw new Error("Invalid origin");
  } catch {
    return NextResponse.json({ error: "Sign-in origin is invalid." }, { status: 400 });
  }

  const redirectUri = new URL("/api/auth/callback", parsedOrigin.origin).toString();
  const nonce = randomBytes(24).toString("base64url");
  const state = Buffer.from(JSON.stringify({ redirectUri, nonce })).toString("base64url");
  const authorization = new URL("app-auth", portalBase.endsWith("/") ? portalBase : `${portalBase}/`);
  authorization.searchParams.set("appId", projectId);
  authorization.searchParams.set("redirectUri", redirectUri);
  authorization.searchParams.set("state", state);
  authorization.searchParams.set("responseType", "code");

  const response = NextResponse.json({ authorizationUrl: authorization.toString() }, { headers: { "Cache-Control": "no-store" } });
  response.cookies.set("civic_oauth_state", Buffer.from(JSON.stringify({ origin: parsedOrigin.origin, redirectUri, nonce })).toString("base64url"), {
    httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 300
  });
  return response;
}
