import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, hasRole, jsonError, query } from "@/lib/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request.cookies.get("webdev_app_session")?.value);
  if (!hasRole(user, ["admin", "editor", "journalist"])) return jsonError("Approved editorial access is required.", user ? 403 : 401);
  try {
    const articles = await query("SELECT slug, title, status, article_type AS articleType, created_at AS createdAt FROM news_articles WHERE status <> 'published' ORDER BY created_at DESC LIMIT 30");
    return NextResponse.json({ role: user!.roles.find((role) => ["admin", "editor", "journalist"].includes(role)), articles }, { headers: { "Cache-Control": "no-store" } });
  } catch { return jsonError("Editorial queue is temporarily unavailable.", 503); }
}
