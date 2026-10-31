import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkClientRequest, execute, getAuthUser, hasRole, jsonError, rateLimit } from "@/lib/server";

export const runtime = "nodejs";
const schema = z.object({ title: z.string().trim().min(12).max(240), excerpt: z.string().trim().min(20).max(500), body: z.string().trim().min(60).max(20000), category: z.enum(["parliament", "public-policy", "local-government", "youth-education", "economy", "fact-checking", "civic-learning"]) }).strict();

export async function POST(request: NextRequest) {
  if (!checkClientRequest(request)) return jsonError("Request not allowed.", 403);
  const user = await getAuthUser(request.cookies.get("webdev_app_session")?.value);
  if (!hasRole(user, ["admin", "editor", "journalist"])) return jsonError("Approved editorial access is required.", user ? 403 : 401);
  if (!rateLimit(`draft:${user!.id}`, 10)) return jsonError("Please wait before submitting another draft.", 429);
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("Add a longer headline, clear summary and draft text.");
  const slugBase = parsed.data.title.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 90);
  const slug = `${slugBase}-${randomUUID().slice(0, 8)}`;
  try {
    await execute("INSERT INTO news_articles (slug, author_id, category_slug, source_slug, title, excerpt, body, article_type, status, is_breaking, is_demo) VALUES (?, ?, ?, 'demo-desk', ?, ?, ?, 'reporting', 'draft', 0, 0)", [slug, user!.id, parsed.data.category, parsed.data.title, parsed.data.excerpt, parsed.data.body]);
    await execute("INSERT INTO editorial_reviews (id, article_slug, reviewer_id, stage, decision, notes) VALUES (?, ?, ?, 'editorial_review', 'pending', ?)", [randomUUID(), slug, user!.id, "Submitted as a draft; publication requires separate fact-check and approval."]);
    await execute("INSERT INTO audit_logs (id, actor_id, action, object_type, object_id, metadata_json) VALUES (?, ?, 'article_draft_submitted', 'news_article', ?, ?)", [randomUUID(), user!.id, slug, JSON.stringify({ status: "draft" })]);
    return NextResponse.json({ ok: true, slug, status: "draft", message: "Draft submitted for editorial review. It has not been published." }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch { return jsonError("Draft could not be saved right now.", 503); }
}
