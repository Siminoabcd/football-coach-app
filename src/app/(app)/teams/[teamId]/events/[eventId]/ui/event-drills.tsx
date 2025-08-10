"use client";

import { useEffect, useMemo, useOptimistic, useState, useTransition } from "react";
import Link from "next/link";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

type DrillLite = {
  id: string;
  title: string;
  category: string | null;
  age_group: string | null;
  difficulty: "Easy" | "Medium" | "Hard" | null;
  duration_min: number | null;
  objective: string | null;
  equipment: string[] | null;
  order_index?: number;
};

export default function EventDrills({ teamId, eventId }: { teamId: string; eventId: string }) {
  const [initial, setInitial] = useState<DrillLite[] | null>(null);
  const [pending, start] = useTransition();

  // load attached drills (SSR alternative: pass as prop)
  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/events/${eventId}/drills`).then(r => r.json());
      setInitial(res.drills as DrillLite[]);
    })();
  }, [eventId]);

  const [optimistic, setOptimistic] = useOptimistic(initial ?? []);

  async function onRemove(id: string) {
    setOptimistic(d => d.filter(x => x.id !== id));
    const res = await fetch(`/api/events/${eventId}/drills/${id}`, { method: "DELETE" });
    if (!res.ok) toast.error("Failed to remove drill");
  }

  async function onReorder(ids: string[]) {
    setOptimistic(d => ids.map((id, i) => ({ ...(d.find(x => x.id === id)!), order_index: i })));
    const res = await fetch(`/api/events/${eventId}/drills/reorder`, {
      method: "POST",
      body: JSON.stringify({ orderedDrillIds: ids }),
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) toast.error("Failed to reorder");
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Drills for this session</h4>
        <AddDrillsDialog
          teamId={teamId}
          eventId={eventId}
          onAdded={async () => {
            const res = await fetch(`/api/events/${eventId}/drills`).then(r => r.json());
            setInitial(res.drills);
            setOptimistic(res.drills);
          }}
        />
      </div>

      {!optimistic.length ? (
        <p className="text-sm text-muted-foreground">No drills yet. Add some.</p>
      ) : (
        <ul className="space-y-2">
          {optimistic.map((d, idx) => (
            <li key={d.id} className="flex items-start gap-2 border rounded p-3">
              <button
                className="cursor-grab pt-0.5"
                onMouseDown={(e) => {
                  // tiny manual reorder: swap with previous/next on alt/ctrl
                  // (for production use dnd-kit; here we keep deps zero)
                  if (e.altKey || e.ctrlKey || e.metaKey) return;
                }}
                title="Drag to reorder (use buttons below)"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <Link href={`/drills/${d.id}`} className="font-medium hover:underline truncate">
                    {idx + 1}. {d.title}
                  </Link>
                  <div className="text-xs text-muted-foreground shrink-0">
                    {d.duration_min != null ? `${d.duration_min} min` : "—"}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {d.category ?? "—"} · {d.age_group ?? "All ages"} · {d.difficulty ?? "—"}
                </div>
                {d.objective && <p className="text-sm mt-1 line-clamp-2">{d.objective}</p>}
                {d.equipment?.length ? (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {d.equipment.slice(0, 6).map((e, i) => (
                      <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-muted">{e}</span>
                    ))}
                  </div>
                ) : null}

                {/* simple reorder controls */}
                <div className="mt-2 flex gap-1">
                  <Button
                    size="sm" variant="outline"
                    onClick={() => {
                      const ids = optimistic.map(x => x.id);
                      if (idx === 0) return;
                      [ids[idx - 1], ids[idx]] = [ids[idx], ids[idx - 1]];
                      onReorder(ids);
                    }}
                  >
                    Up
                  </Button>
                  <Button
                    size="sm" variant="outline"
                    onClick={() => {
                      const ids = optimistic.map(x => x.id);
                      if (idx === ids.length - 1) return;
                      [ids[idx + 1], ids[idx]] = [ids[idx], ids[idx + 1]];
                      onReorder(ids);
                    }}
                  >
                    Down
                  </Button>
                </div>
              </div>

              <Button size="icon" variant="ghost" onClick={() => onRemove(d.id)} title="Remove">
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* Add drills dialog */

function AddDrillsDialog({
  teamId, eventId, onAdded,
}: { teamId: string; eventId: string; onAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<DrillLite[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [pending, start] = useTransition();

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(async () => {
      const url = query ? `/api/drills/search?q=${encodeURIComponent(query)}` : `/api/drills/search`;
      const res = await fetch(url).then(r => r.json());
      setRows(res.drills as DrillLite[]);
    }, 200);
    return () => clearTimeout(t);
  }, [open, query]);

  async function add() {
    const ids = Object.keys(selected).filter(k => selected[k]);
    if (!ids.length) return;
    start(async () => {
      const res = await fetch(`/api/events/${eventId}/drills`, {
        method: "POST",
        body: JSON.stringify({ drillIds: ids }),
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        toast.success("Drills added");
        setOpen(false);
        setSelected({});
        onAdded();
      } else {
        toast.error("Failed to add drills");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add drills</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Select drills</DialogTitle>
        </DialogHeader>

        <Input placeholder="Search by title, objective…" value={query} onChange={e => setQuery(e.target.value)} />

        <div className="max-h-80 overflow-auto space-y-1">
          {rows.map(r => {
            const checked = !!selected[r.id];
            return (
              <label key={r.id} className="flex items-start gap-2 border rounded p-2">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={checked}
                  onChange={(e) => setSelected(s => ({ ...s, [r.id]: e.target.checked }))}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{r.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {r.category ?? "—"} · {r.age_group ?? "All ages"} · {r.difficulty ?? "—"}
                    {r.duration_min != null ? ` · ${r.duration_min} min` : ""}
                  </div>
                  {r.objective && <p className="text-xs line-clamp-2 mt-1">{r.objective}</p>}
                </div>
              </label>
            );
          })}
          {!rows.length && <div className="text-sm text-muted-foreground">No drills found.</div>}
        </div>

        <div className="flex justify-end">
          <Button onClick={add} disabled={pending}>Add selected</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
