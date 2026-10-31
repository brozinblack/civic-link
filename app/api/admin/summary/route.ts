import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, hasRole, jsonError, query } from "@/lib/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request.cookies.get("webdev_app_session")?.value);
  if (!hasRole(user, ["admin"])) return jsonError("Authorized administrator access is required.", user ? 403 : 401);
  try {
    const concerns = await query("SELECT id, subject, status, created_at AS createdAt FROM community_concerns WHERE status <> 'closed' ORDER BY created_at ASC LIMIT 30");
    const roleRequests = await query("SELECT rr.id, rr.requested_role AS requestedRole, rr.reason, rr.created_at AS createdAt, u.full_name AS applicant FROM role_requests rr JOIN users u ON u.id = rr.user_id WHERE rr.status = 'pending' ORDER BY rr.created_at ASC LIMIT 30");
    const audit = await query("SELECT action, object_type AS objectType, created_at AS createdAt FROM audit_logs ORDER BY created_at DESC LIMIT 20");
    return NextResponse.json({ role: "administrator", concerns, roleRequests, audit }, { headers: { "Cache-Control": "no-store" } });
  } catch { return jsonError("Administrator data is temporarily unavailable.", 503); }
}
