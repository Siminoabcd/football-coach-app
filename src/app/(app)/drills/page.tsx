import Link from "next/link";
import { listDrills } from "@/lib/drills-queries";
import Filters from "./filters";
import DrillCard from "./drill-card";

export const dynamic = "force-dynamic";

export default async function DrillsPage(
  { searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }
) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : undefined;
  const category = typeof sp.category === "string" ? sp.category : undefined;
  const age_group = typeof sp.age_group === "string" ? sp.age_group : undefined;
  const difficulty = typeof sp.difficulty === "string" ? (["Easy","Medium","Hard"].includes(sp.difficulty) ? sp.difficulty as any : undefined) : undefined;

  const drills = await listDrills({
    q, category, age_group, difficulty,
    limit: 30,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold">Drills library</h3>
          <p className="text-sm text-muted-foreground">Create once, reuse in sessions.</p>
        </div>
        <Link href="/drills/new" className="underline">New drill</Link>
      </div>

      <Filters />

      {drills.length === 0 ? (
        <p className="text-muted-foreground">No drills found. Try clearing filters or <Link href="/drills/new" className="underline">create one</Link>.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {drills.map(d => <DrillCard key={d.id} drill={d} />)}
        </div>
      )}
    </div>
  );
}
