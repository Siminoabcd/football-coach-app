import { NextResponse } from "next/server";
import { reorderEventDrills } from "@/app/(app)/teams/[teamId]/events/[eventId]/drills-actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;
  const { orderedDrillIds, teamId } = await req.json();
  const res = await reorderEventDrills(teamId ?? "", eventId, orderedDrillIds);
  return NextResponse.json(res, { status: res.ok ? 200 : 400 });
}
