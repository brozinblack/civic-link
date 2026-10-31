import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkClientRequest, execute, getAuthUser, jsonError, query, rateLimit } from "@/lib/server";
import { courses } from "@/lib/content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const progressInput = z.object({ courseSlug: z.string().min(1).max(100), progressPercent: z.number().int().min(0).max(100) }).strict();

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request.cookies.get("webdev_app_session")?.value);
  if (!user) return jsonError("Sign in to view your learning progress.", 401);
  try {
    const rows = await query("SELECT course_slug AS courseSlug, progress_percent AS progressPercent, updated_at AS updatedAt FROM course_enrolments WHERE user_id = ? ORDER BY updated_at DESC", [user.id]);
    return NextResponse.json({ progress: rows }, { headers: { "Cache-Control": "no-store" } });
  } catch { return jsonError("Learning progress is temporarily unavailable.", 503); }
}

export async function POST(request: NextRequest) {
  if (!checkClientRequest(request)) return jsonError("Request not allowed.", 403);
  const user = await getAuthUser(request.cookies.get("webdev_app_session")?.value);
  if (!user) return jsonError("Sign in to save learning progress.", 401);
  if (!rateLimit(`progress:${user.id}`, 40)) return jsonError("Please wait before saving again.", 429);
  const parsed = progressInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success || !courses.some((course) => course.slug === parsed.data.courseSlug)) return jsonError("Choose an available course.");
  try {
    await execute("INSERT INTO course_enrolments (id, user_id, course_slug, progress_percent) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE progress_percent = GREATEST(progress_percent, VALUES(progress_percent)), updated_at = CURRENT_TIMESTAMP", [randomUUID(), user.id, parsed.data.courseSlug, parsed.data.progressPercent]);
    return NextResponse.json({ ok: true, courseSlug: parsed.data.courseSlug, progressPercent: parsed.data.progressPercent });
  } catch { return jsonError("Learning progress could not be saved right now.", 503); }
}
