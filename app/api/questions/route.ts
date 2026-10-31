import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkClientRequest, execute, getAuthUser, jsonError, query, rateLimit } from "@/lib/server";
import { representatives } from "@/lib/content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const questionInput = z.object({ representativeSlug: z.string().min(1).max(120), question: z.string().trim().min(10).max(2400) }).strict();

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request.cookies.get("webdev_app_session")?.value);
  if (!user) return jsonError("Sign in to view your questions.", 401);
  try {
    const rows = await query("SELECT id, representative_slug AS representativeSlug, question_text AS question, status, response_text AS response, created_at AS createdAt, responded_at AS respondedAt FROM citizen_questions WHERE user_id = ? ORDER BY created_at DESC LIMIT 50", [user.id]);
    return NextResponse.json({ questions: rows }, { headers: { "Cache-Control": "no-store" } });
  } catch { return jsonError("Question tracking is temporarily unavailable.", 503); }
}

export async function POST(request: NextRequest) {
  if (!checkClientRequest(request)) return jsonError("Request not allowed.", 403);
  const user = await getAuthUser(request.cookies.get("webdev_app_session")?.value);
  if (!user) return jsonError("Sign in to submit a question.", 401);
  if (!rateLimit(`question:${user.id}`, 5)) return jsonError("Please wait before submitting another question.", 429);
  const parsed = questionInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success || !representatives.some((rep) => rep.slug === parsed.data.representativeSlug)) return jsonError("Choose a listed profile and enter a clear question.");
  const id = randomUUID();
  try {
    await execute("INSERT INTO citizen_questions (id, user_id, representative_slug, question_text, status) VALUES (?, ?, ?, ?, 'submitted')", [id, user.id, parsed.data.representativeSlug, parsed.data.question]);
    return NextResponse.json({ ok: true, id, status: "submitted", notice: "This demo profile is not a real representative; no official response is expected." }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch { return jsonError("Your question could not be saved right now.", 503); }
}
