import { notFound } from "next/navigation";
import Link from "next/link";
import { getDrill, getDrillMedia } from "@/lib/drills-queries";
import { deleteDrill } from "../actions";
import { Button } from "@/components/ui/button";

export default async function DrillDetail(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const drill = await getDrill(id).catch(() => null);
  if (!drill) notFound();
  const media = await getDrillMedia(id);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold">{drill.title}</h3>
          <div className="text-sm text-muted-foreground">
            {drill.category ?? "—"} · {drill.age_group ?? "All ages"} · {drill.difficulty ?? "—"} · {drill.duration_min ?? "—"} min
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/drills/${drill.id}/edit`} className="underline">Edit</Link>
          <form action={async () => {
            "use server";
            await deleteDrill(drill.id);
          }}>
            <Button type="submit" variant="destructive" size="sm">Delete</Button>
          </form>
        </div>
      </div>

      {drill.objective && (
        <section className="space-y-1">
          <h4 className="font-medium">Objective</h4>
          <p className="text-sm whitespace-pre-wrap">{drill.objective}</p>
        </section>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <section className="space-y-2">
          {drill.setup && <>
            <h4 className="font-medium">Setup</h4>
            <p className="text-sm whitespace-pre-wrap">{drill.setup}</p>
          </>}
          {drill.instructions && <>
            <h4 className="font-medium mt-4">Instructions</h4>
            <p className="text-sm whitespace-pre-wrap">{drill.instructions}</p>
          </>}
        </section>

        <section className="space-y-2">
          {drill.coaching_points && <>
            <h4 className="font-medium">Coaching points</h4>
            <p className="text-sm whitespace-pre-wrap">{drill.coaching_points}</p>
          </>}
          {drill.progressions && <>
            <h4 className="font-medium mt-4">Progressions</h4>
            <p className="text-sm whitespace-pre-wrap">{drill.progressions}</p>
          </>}
        </section>
      </div>

      {drill.equipment && drill.equipment.length > 0 && (
        <section>
          <h4 className="font-medium">Equipment</h4>
          <div className="mt-1 flex flex-wrap gap-1">
            {drill.equipment.map((e, i) => (
              <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-muted">{e}</span>
            ))}
          </div>
        </section>
      )}

      {media.length > 0 && (
        <section className="space-y-2">
          <h4 className="font-medium">Media</h4>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {media.map(m => (
              <a key={m.id} href={m.url} target="_blank" rel="noreferrer" className="block border rounded overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.url} alt={m.caption ?? ""} className="w-full h-40 object-cover" />
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
