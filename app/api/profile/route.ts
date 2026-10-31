import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkClientRequest, execute, getAuthUser, jsonError, query, rateLimit } from "@/lib/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const profileInput = z.object({ displayName: z.string().trim().max(80).optional(), language: z.enum(["en", "lg", "sw", "luo", "rn", "ach"]).optional(), generalArea: z.string().trim().max(120).optional(), citizenshipCountry: z.string().trim().max(80).optional() }).strict();

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request.cookies.get("webdev_app_session")?.value);
  if (!user) return jsonError("Sign in to view your profile.", 401);
  try {
    const rows = await query("SELECT display_name, preferred_language, general_area, citizenship_country FROM user_profiles WHERE user_id = ? LIMIT 1", [user.id]);
    return NextResponse.json({ user: { name: user.name, email: user.email, roles: user.roles }, profile: rows[0] ?? null }, { headers: { "Cache-Control": "no-store" } });
  } catch { return jsonError("Profile service is temporarily unavailable.", 503); }
}

export async function PATCH(request: NextRequest) {
  if (!checkClientRequest(request)) return jsonError("Request not allowed.", 403);
  const user = await getAuthUser(request.cookies.get("webdev_app_session")?.value);
  if (!user) return jsonError("Sign in to update your profile.", 401);
  if (!rateLimit(`profile:${user.id}`, 10)) return jsonError("Please wait before trying again.", 429);
  const parsed = profileInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("Check the profile fields and try again.");
  const input = parsed.data;
  try {
    await execute("INSERT IGNORE INTO user_profiles (user_id) VALUES (?)", [user.id]);
    await execute("UPDATE user_profiles SET display_name = COALESCE(?, display_name), preferred_language = COALESCE(?, preferred_language), general_area = COALESCE(?, general_area), citizenship_country = COALESCE(?, citizenship_country) WHERE user_id = ?", [input.displayName ?? null, input.language ?? null, input.generalArea ?? null, input.citizenshipCountry ?? null, user.id]);
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch { return jsonError("Profile could not be saved right now.", 503); }
}
