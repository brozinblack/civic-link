import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkClientRequest, execute, getAuthUser, jsonError, query, rateLimit } from "@/lib/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const requestSchema = z.object({ requestedRole: z.enum(["journalist", "civic_educator", "moderator", "administrator", "government_representative", "public_representative"]), reason: z.string().trim().max(1000).optional() }).strict();

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request.cookies.get("webdev_app_session")?.value);
  if (!user) return jsonError("Sign in to view role requests.", 401);
  try {
    const rows = await query("SELECT id, requested_role AS requestedRole, status, created_at AS createdAt FROM role_requests WHERE user_id = ? ORDER BY created_at DESC", [user.id]);
    return NextResponse.json({ requests: rows }, { headers: { "Cache-Control": "no-store" } });
  } catch { return jsonError("Role requests are temporarily unavailable.", 503); }
}

export async function POST(request: NextRequest) {
  if (!checkClientRequest(request)) return jsonError("Request not allowed.", 403);
  const user = await getAuthUser(request.cookies.get("webdev_app_session")?.value);
  if (!user) return jsonError("Sign in before requesting a role.", 401);
  if (!rateLimit(`roles:${user.id}`, 4)) return jsonError("Please wait before submitting another request.", 429);
  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("Choose a role and provide a short reason if needed.");
  try {
    const id = randomUUID();
    await execute("INSERT INTO role_requests (id, user_id, requested_role, reason) VALUES (?, ?, ?, ?)", [id, user.id, parsed.data.requestedRole, parsed.data.reason || null]);
    return NextResponse.json({ ok: true, id, status: "pending", message: "Request received. Privileged access is not granted until an authorized review is complete." }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch { return jsonError("Your request could not be saved right now.", 503); }
}
