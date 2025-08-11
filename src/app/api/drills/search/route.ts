import { NextResponse } from "next/server";
import { listDrills } from "@/lib/drills-queries";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? undefined;
  const drills = await listDrills({ q, limit: 50 });
  return NextResponse.json({ drills });
}
