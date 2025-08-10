import { NextResponse } from "next/server";
import { getEventDrills } from "@/app/(app)/teams/[teamId]/events/[eventId]/queries";

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
  const { drillIds } = await req.json();
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/events/${eventId}/drills/attach`, {
    method: "POST",
    body: JSON.stringify({ drillIds }),
    headers: { "Content-Type": "application/json" },
  });
  return res;
}
