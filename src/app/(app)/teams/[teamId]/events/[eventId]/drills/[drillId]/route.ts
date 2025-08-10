import { NextResponse } from "next/server";
import { removeDrillFromEvent } from "@/app/(app)/teams/[teamId]/events/[eventId]/drills-actions";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ eventId: string; drillId: string }> }
) {
  const { eventId, drillId } = await params;
  const res = await removeDrillFromEvent("", eventId, drillId);
  return NextResponse.json(res, { status: res.ok ? 200 : 400 });
}
