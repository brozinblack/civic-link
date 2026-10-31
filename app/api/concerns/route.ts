import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkClientRequest, execute, getAuthUser, jsonError, query, rateLimit } from "@/lib/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const concernInput = z.object({ subject: z.string().trim().min(8).max(180), description: z.string().trim().min(25).max(4000), generalArea: z.string().trim().max(120).optional() }).strict();

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request.cookies.get("webdev_app_session")?.value);
  if (!user) return jsonError("Sign in to view your private concerns.", 401);
  try {
    const rows = await query("SELECT c.id, c.subject, c.general_area AS generalArea, c.status, c.created_at AS createdAt, c.updated_at AS updatedAt, (SELECT cu.public_note FROM concern_updates cu WHERE cu.concern_id = c.id ORDER BY cu.created_at DESC LIMIT 1) AS latestNote FROM community_concerns c WHERE c.user_id = ? ORDER BY c.created_at DESC LIMIT 50", [user.id]);
    return NextResponse.json({ concerns: rows }, { headers: { "Cache-Control": "no-store" } });
  } catch { return jsonError("Concern tracking is temporarily unavailable.", 503); }
}

export async function POST(request: NextRequest) {
  if (!checkClientRequest(request)) return jsonError("Request not allowed.", 403);
  const user = await getAuthUser(request.cookies.get("webdev_app_session")?.value);
  if (!user) return jsonError("Sign in to submit a private concern.", 401);
  if (!rateLimit(`concern:${user.id}`, 4)) return jsonError("Please wait before submitting another concern.", 429);
  const parsed = concernInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("Add a clear subject and description. Do not include identity documents or sensitive personal details.");
  const id = randomUUID();
  try {
    await execute("INSERT INTO community_concerns (id, user_id, subject, description, general_area, visibility, status) VALUES (?, ?, ?, ?, ?, 'private', 'submitted')", [id, user.id, parsed.data.subject, parsed.data.description, parsed.data.generalArea || null]);
    await execute("INSERT INTO concern_updates (id, concern_id, actor_id, status, public_note) VALUES (?, ?, ?, 'submitted', ?)", [randomUUID(), id, user.id, "Concern received. An official response is not guaranteed."]);
    return NextResponse.json({ ok: true, id, status: "submitted", message: "Your concern is recorded privately. An official response is not guaranteed." }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch { return jsonError("Your concern could not be saved right now. Please try again later.", 503); }
}
