import { NextRequest, NextResponse } from "next/server";
import { createSession, upsertProviderUser } from "@/lib/server";

export const runtime = "nodejs";

type StateCookie = { origin: string; redirectUri: string; nonce: string };
function parseStateCookie(value?: string): StateCookie | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as StateCookie;
    const origin = new URL(parsed.origin);
    if (origin.origin !== parsed.origin || !parsed.redirectUri.endsWith("/api/auth/callback") || !parsed.nonce) return null;
    if (new URL(parsed.redirectUri).origin !== parsed.origin) return null;
    return parsed;
  } catch { return null; }
}

function signInRedirect(origin: string, error: string) {
  const target = new URL("/sign-in", origin);
  target.searchParams.set("error", error);
  return NextResponse.redirect(target);
}

export async function GET(request: NextRequest) {
  const stateCookie = parseStateCookie(request.cookies.get("civic_oauth_state")?.value);
  const providerError = request.nextUrl.searchParams.get("error");
  const code = request.nextUrl.searchParams.get("code");
  const returnedState = request.nextUrl.searchParams.get("state");
  if (!stateCookie) return NextResponse.json({ error: "Sign-in state could not be confirmed. Start sign-in again." }, { status: 400, headers: { "Cache-Control": "no-store" } });
  if (providerError) return signInRedirect(stateCookie.origin, "provider");
  if (!code || !returnedState) return signInRedirect(stateCookie.origin, "callback");

  let statePayload: { redirectUri?: string; nonce?: string };
  try { statePayload = JSON.parse(Buffer.from(returnedState, "base64url").toString("utf8")) as typeof statePayload; }
  catch { return signInRedirect(stateCookie.origin, "state"); }
  if (statePayload.nonce !== stateCookie.nonce || statePayload.redirectUri !== stateCookie.redirectUri) return signInRedirect(stateCookie.origin, "state");

  const clientId = process.env.MANUS_PROJECT_ID;
  const apiBase = process.env.MANUS_OAUTH_API_URL;
  if (!clientId || !apiBase) return signInRedirect(stateCookie.origin, "configuration");

  try {
    const exchangeUrl = new URL("webdev.v1.WebDevAuthPublicService/ExchangeToken", apiBase.endsWith("/") ? apiBase : `${apiBase}/`);
    const exchangeResponse = await fetch(exchangeUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId, grantType: "authorization_code", code, redirectUri: stateCookie.redirectUri }),
      cache: "no-store"
    });
    if (!exchangeResponse.ok) return signInRedirect(stateCookie.origin, "exchange");
    const exchange = await exchangeResponse.json() as { accessToken?: string };
    if (!exchange.accessToken) return signInRedirect(stateCookie.origin, "exchange");

    const infoUrl = new URL("webdev.v1.WebDevAuthPublicService/GetUserInfo", apiBase.endsWith("/") ? apiBase : `${apiBase}/`);
    const infoResponse = await fetch(infoUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken: exchange.accessToken }),
      cache: "no-store"
    });
    if (!infoResponse.ok) return signInRedirect(stateCookie.origin, "identity");
    const info = await infoResponse.json() as { openId?: string; name?: string; email?: string };
    if (!info.openId) return signInRedirect(stateCookie.origin, "identity");

    const user = await upsertProviderUser(info.openId, info.name?.trim() || "Civic Link member", info.email || null);
    const { token } = await createSession(user.id);
    const response = NextResponse.redirect(new URL("/account", stateCookie.origin));
    response.cookies.set("webdev_app_session", token, { httpOnly: true, secure: true, sameSite: "none", path: "/", maxAge: 30 * 24 * 60 * 60 });
    response.cookies.set("civic_oauth_state", "", { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 0 });
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch {
    return signInRedirect(stateCookie.origin, "service");
  }
}
