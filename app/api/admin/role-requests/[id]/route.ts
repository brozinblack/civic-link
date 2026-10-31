import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2/promise";
import { z } from "zod";
import { checkClientRequest, getAuthUser, hasRole, jsonError, withTransaction } from "@/lib/server";

export const runtime = "nodejs";
const inputSchema = z.object({ decision: z.enum(["approved", "rejected"]) }).strict();
const reviewableRoles = new Set(["journalist", "civic_educator", "public_representative", "government_representative", "moderator", "administrator"]);

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!checkClientRequest(request)) return jsonError("Request not allowed.", 403);
  const admin = await getAuthUser(request.cookies.get("webdev_app_session")?.value);
  if (!hasRole(admin, ["admin"])) return jsonError("Authorized administrator access is required.", admin ? 403 : 401);
  const { id } = await context.params;
  const parsed = inputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("Select approve or reject.");

  try {
    const result = await withTransaction(async (tx) => {
      const rows = await tx.query<(RowDataPacket & { user_id: string; requested_role: string; status: string })[]>("SELECT user_id, requested_role, status FROM role_requests WHERE id = ? FOR UPDATE", [id]);
      const row = rows[0];
      if (!row) return { ok: false as const, status: 404, message: "Role request not found." };
      if (row.status !== "pending") return { ok: false as const, status: 409, message: "This role request has already been reviewed." };
      const requestedRole = String(row.requested_role);
      if (!reviewableRoles.has(requestedRole)) return { ok: false as const, status: 409, message: "The requested role is not eligible for approval." };
      const updated = await tx.execute("UPDATE role_requests SET status = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP WHERE id = ? AND status = 'pending'", [parsed.data.decision, admin!.id, id]);
      if (updated.affectedRows !== 1) return { ok: false as const, status: 409, message: "The request was reviewed concurrently. Refresh the queue." };
      if (parsed.data.decision === "approved") {
        const role = requestedRole === "administrator" ? "admin" : requestedRole;
        await tx.execute("INSERT INTO user_roles (id, user_id, role_name, status, granted_by) VALUES (?, ?, ?, 'active', ?) ON DUPLICATE KEY UPDATE status = 'active', granted_by = VALUES(granted_by), granted_at = CURRENT_TIMESTAMP", [randomUUID(), String(row.user_id), role, admin!.id]);
      }
      await tx.execute("INSERT INTO audit_logs (id, actor_id, action, object_type, object_id, metadata_json) VALUES (?, ?, 'role_request_reviewed', 'role_request', ?, ?)", [randomUUID(), admin!.id, id, JSON.stringify({ decision: parsed.data.decision, requestedRole })]);
      return { ok: true as const, decision: parsed.data.decision };
    });
    if (!result.ok) return jsonError(result.message, result.status);
    return NextResponse.json({ ok: true, decision: result.decision }, { headers: { "Cache-Control": "no-store" } });
  } catch { return jsonError("Role request could not be updated right now.", 503); }
}
