import { NextRequest, NextResponse } from "next/server";
import { getNowMs } from "@/lib/time";
import { fetchAndCountView } from "@/lib/paste";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const nowMs = getNowMs(req);
  const result = await fetchAndCountView(id, nowMs);

  if (!result.ok) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(
    {
      content: result.content,
      remaining_views: result.remainingViews,
      expires_at: result.expiresAtMs === null ? null : new Date(result.expiresAtMs).toISOString(),
    },
    { status: 200 }
  );
}
