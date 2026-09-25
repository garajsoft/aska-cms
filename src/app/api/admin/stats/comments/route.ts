import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/requireUser";
import { adminAccess } from "@/lib/auth/roles";
import { getCommentStats } from "@/lib/comments/stats";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/stats/comments
 * Comment counts by moderation status for the dashboard widget. Staff only.
 */
export async function GET() {
  const user = await getCurrentUser();
  if (!user || !adminAccess({ req: { user } })) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    return NextResponse.json(await getCommentStats());
  } catch {
    return NextResponse.json({ error: "Failed to load comment stats" }, { status: 500 });
  }
}
