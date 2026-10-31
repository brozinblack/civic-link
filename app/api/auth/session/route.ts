import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request.cookies.get("webdev_app_session")?.value);
    return NextResponse.json({ user: user ? { id: user.id, name: user.name, email: user.email, roles: user.roles } : null }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ user: null, error: "Session service is temporarily unavailable." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
