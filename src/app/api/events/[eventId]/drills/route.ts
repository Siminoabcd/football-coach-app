import { NextResponse } from "next/server";
import { getEventDrills } from "@/app/(app)/teams/[teamId]/events/[eventId]/queries";
import { attachDrillsToEvent } from "@/app/(app)/teams/[teamId]/events/[eventId]/drills-actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;
  const drills = await getEventDrills(eventId);
  return NextResponse.json({ drills });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;
  const { drillIds, teamId } = await req.json();
  const res = await attachDrillsToEvent(teamId ?? "", eventId, drillIds);
  return NextResponse.json(res, { status: res.ok ? 200 : 400 });
}
