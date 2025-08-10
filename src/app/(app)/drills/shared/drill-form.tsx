"use client";

import { useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { Drill } from "@/lib/types/drills";
import { useRouter } from "next/navigation";

export default function DrillForm({
  initial,
  onSubmitAction,
}: {
  initial: Drill | null;
  onSubmitAction: (fd: FormData) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [pending, start] = useTransition();
  const router = useRouter();

  async function onSubmit(formData: FormData) {
    start(async () => {
      const res = await onSubmitAction(formData);
      if (res.ok) {
        toast.success("Saved");
        router.push("/drills");
      } else {
        toast.error(res.error ?? "Failed to save");
      }
    });
  }

  return (
    <form action={onSubmit} className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2 md:col-span-2">
        <label className="text-sm">Title*</label>
        <Input name="title" required defaultValue={initial?.title ?? ""} />
      </div>

      <div className="space-y-2">
        <label className="text-sm">Category</label>
        <Input name="category" placeholder="e.g. Passing" defaultValue={initial?.category ?? ""} />
      </div>

      <div className="space-y-2">
        <label className="text-sm">Age group</label>
        <Input name="age_group" placeholder="e.g. U9/U11/All" defaultValue={initial?.age_group ?? ""} />
      </div>

      <div className="space-y-2">
        <label className="text-sm">Difficulty</label>
        <Select name="difficulty" defaultValue={initial?.difficulty ?? undefined}>
          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Easy">Easy</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Hard">Hard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm">Duration (min)</label>
        <Input name="duration_min" type="number" min={0} defaultValue={initial?.duration_min ?? ""} />
      </div>

      <div className="space-y-2">
        <label className="text-sm">Players min</label>
        <Input name="players_min" type="number" min={0} defaultValue={initial?.players_min ?? ""} />
      </div>

      <div className="space-y-2">
        <label className="text-sm">Players max</label>
        <Input name="players_max" type="number" min={0} defaultValue={initial?.players_max ?? ""} />
      </div>

      <div className="space-y-2 md:col-span-2">
        <label className="text-sm">Equipment (comma separated)</label>
        <Input name="equipment" placeholder="cones, bibs, balls" defaultValue={(initial?.equipment ?? []).join(", ")} />
      </div>

      <div className="space-y-2 md:col-span-2">
        <label className="text-sm">Objective</label>
        <Textarea name="objective" rows={3} defaultValue={initial?.objective ?? ""} />
      </div>

      <div className="space-y-2">
        <label className="text-sm">Setup</label>
        <Textarea name="setup" rows={4} defaultValue={initial?.setup ?? ""} />
      </div>

      <div className="space-y-2">
        <label className="text-sm">Instructions</label>
        <Textarea name="instructions" rows={4} defaultValue={initial?.instructions ?? ""} />
      </div>

      <div className="space-y-2">
        <label className="text-sm">Coaching points</label>
        <Textarea name="coaching_points" rows={4} defaultValue={initial?.coaching_points ?? ""} />
      </div>

      <div className="space-y-2">
        <label className="text-sm">Progressions</label>
        <Textarea name="progressions" rows={4} defaultValue={initial?.progressions ?? ""} />
      </div>

      <div className="space-y-2">
        <label className="text-sm">Visibility</label>
        <Select name="visibility" defaultValue={initial?.visibility ?? "private"}>
          <SelectTrigger><SelectValue placeholder="private" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="private">Private</SelectItem>
            <SelectItem value="team">Team</SelectItem>
            <SelectItem value="public">Public</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="md:col-span-2 flex justify-end">
        <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save drill"}</Button>
      </div>
    </form>
  );
}
