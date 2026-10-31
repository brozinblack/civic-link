import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkClientRequest, execute, getAuthUser, jsonError, rateLimit } from "@/lib/server";

export const runtime = "nodejs";
const schema = z.object({ type: z.enum(["access", "deletion"]) }).strict();

export async function POST(request: NextRequest) {
  if (!checkClientRequest(request)) return jsonError("Request not allowed.", 403);
  const user = await getAuthUser(request.cookies.get("webdev_app_session")?.value);
  if (!user) return jsonError("Sign in to submit a privacy request.", 401);
  if (!rateLimit(`privacy:${user.id}`, 3)) return jsonError("Please wait before submitting another request.", 429);
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("Choose a valid privacy request type.");
  try {
    const id = randomUUID();
    await execute("INSERT INTO privacy_requests (id, user_id, request_type, status) VALUES (?, ?, ?, 'submitted')", [id, user.id, parsed.data.type]);
    await execute("INSERT INTO audit_logs (id, actor_id, action, object_type, object_id, metadata_json) VALUES (?, ?, 'privacy_request_submitted', 'privacy_request', ?, ?)", [randomUUID(), user.id, id, JSON.stringify({ type: parsed.data.type })]);
    return NextResponse.json({ ok: true, id, message: "Your request has been recorded for review. Deletion is not automatic and may be limited by applicable retention duties." }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch { return jsonError("Your privacy request could not be recorded right now.", 503); }
}
