import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkClientRequest, execute, getAuthUser, jsonError, query, rateLimit } from "@/lib/server";
import { articles } from "@/lib/content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const inputSchema = z.object({ slug: z.string().min(1).max(120), saved: z.boolean() }).strict();

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request.cookies.get("webdev_app_session")?.value);
  if (!user) return jsonError("Sign in to view saved stories.", 401);
  try {
    const rows = await query("SELECT article_slug FROM saved_articles WHERE user_id = ? ORDER BY created_at DESC", [user.id]);
    return NextResponse.json({ saved: rows.map((row) => String(row.article_slug)), articles: articles.filter((article) => rows.some((row) => row.article_slug === article.slug)) }, { headers: { "Cache-Control": "no-store" } });
  } catch { return jsonError("Saved stories are temporarily unavailable.", 503); }
}

export async function POST(request: NextRequest) {
  if (!checkClientRequest(request)) return jsonError("Request not allowed.", 403);
  const user = await getAuthUser(request.cookies.get("webdev_app_session")?.value);
  if (!user) return jsonError("Sign in to save a story.", 401);
  if (!rateLimit(`saved:${user.id}`, 30)) return jsonError("Please wait before trying again.", 429);
  const parsed = inputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || !articles.some((article) => article.slug === parsed.data.slug)) return jsonError("That story is not available.");
  try {
    if (parsed.data.saved) await execute("INSERT IGNORE INTO saved_articles (user_id, article_slug) VALUES (?, ?)", [user.id, parsed.data.slug]);
    else await execute("DELETE FROM saved_articles WHERE user_id = ? AND article_slug = ?", [user.id, parsed.data.slug]);
    return NextResponse.json({ ok: true, saved: parsed.data.saved });
  } catch { return jsonError("The story could not be saved right now.", 503); }
}
