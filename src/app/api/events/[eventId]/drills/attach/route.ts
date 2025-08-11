import { NextResponse } from "next/server";
import { attachDrillsToEvent } from "@/app/(app)/teams/[teamId]/events/[eventId]/drills-actions";


export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;
  const { drillIds, teamId } = await req.json();
  const res = await attachDrillsToEvent(teamId ?? "", eventId, drillIds);
  return NextResponse.json(res, { status: res.ok ? 200 : 400 });
}
