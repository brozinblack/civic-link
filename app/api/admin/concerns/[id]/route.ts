import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2/promise";
import { z } from "zod";
import { checkClientRequest, getAuthUser, hasRole, jsonError, query, withTransaction } from "@/lib/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const updateInput = z.object({ status: z.enum(["acknowledged", "under_review", "response_published", "closed"]), note: z.string().trim().min(4).max(1200) }).strict();
const transitions: Record<string, string> = { submitted: "acknowledged", acknowledged: "under_review", under_review: "response_published", response_published: "closed" };
const staffRoles = ["admin", "moderator", "case_worker"];

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(request.cookies.get("webdev_app_session")?.value);
  if (!hasRole(user, staffRoles)) return jsonError("Authorized staff access is required.", user ? 403 : 401);
  const { id } = await context.params;
  try {
    const rows = await query<(RowDataPacket & { id: string; subject: string; description: string; generalArea: string | null; status: string; createdAt: Date })[]>("SELECT id, subject, description, general_area AS generalArea, status, created_at AS createdAt FROM community_concerns WHERE id = ? LIMIT 1", [id]);
    const concern = rows[0];
    if (!concern) return jsonError("Concern not found.", 404);
    const updates = await query<(RowDataPacket & { status: string; note: string | null; createdAt: Date })[]>("SELECT status, public_note AS note, created_at AS createdAt FROM concern_updates WHERE concern_id = ? ORDER BY created_at ASC", [id]);
    return NextResponse.json({ concern, updates }, { headers: { "Cache-Control": "no-store" } });
  } catch { return jsonError("Concern details are temporarily unavailable.", 503); }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!checkClientRequest(request)) return jsonError("Request not allowed.", 403);
  const user = await getAuthUser(request.cookies.get("webdev_app_session")?.value);
  if (!hasRole(user, staffRoles)) return jsonError("Authorized staff access is required.", user ? 403 : 401);
  const { id } = await context.params;
  const parsed = updateInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("Select a valid next status and provide a clear status explanation.");
  try {
    const result = await withTransaction(async (tx) => {
      const rows = await tx.query<(RowDataPacket & { status: string })[]>("SELECT status FROM community_concerns WHERE id = ? FOR UPDATE", [id]);
      if (!rows[0]) return { ok: false as const, status: 404, message: "Concern not found." };
      const current = String(rows[0].status);
      if (transitions[current] !== parsed.data.status) return { ok: false as const, status: 409, message: "This status change is not the next step in the concern workflow." };
      const updated = await tx.execute("UPDATE community_concerns SET status = ?, assigned_to = COALESCE(assigned_to, ?) WHERE id = ? AND status = ?", [parsed.data.status, user!.id, id, current]);
      if (updated.affectedRows !== 1) return { ok: false as const, status: 409, message: "The concern status changed concurrently. Refresh the queue before trying again." };
      await tx.execute("INSERT INTO concern_updates (id, concern_id, actor_id, status, public_note) VALUES (?, ?, ?, ?, ?)", [randomUUID(), id, user!.id, parsed.data.status, parsed.data.note]);
      await tx.execute("INSERT INTO audit_logs (id, actor_id, action, object_type, object_id, metadata_json) VALUES (?, ?, 'concern_status_updated', 'community_concern', ?, ?)", [randomUUID(), user!.id, id, JSON.stringify({ status: parsed.data.status })]);
      return { ok: true as const, status: parsed.data.status };
    });
    if (!result.ok) return jsonError(result.message, result.status);
    return NextResponse.json({ ok: true, status: result.status }, { headers: { "Cache-Control": "no-store" } });
  } catch { return jsonError("The concern could not be updated right now.", 503); }
}
