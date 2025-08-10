"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectItem, SelectContent, SelectValue } from "@/components/ui/select";
import { upsertPlayerProfile } from "./actions";
import { toast } from "sonner";

export default function InfoForm({
  teamId, playerId, profile,
}: {
  teamId: string;
  playerId: string;
  profile?: {
    date_of_birth: string | null;
    preferred_foot: "left" | "right" | "both" | null;
    positions: string[] | null;
    strengths: string | null;
    weaknesses: string | null;
    contact_email: string | null;
    contact_phone: string | null;
    guardian_name: string | null;
    guardian_phone: string | null;
    emergency_notes: string | null;
  } | null;
}) {
  const [pending, start] = useTransition();

  async function onSubmit(formData: FormData) {
    formData.set("team_id", teamId);
    formData.set("player_id", playerId);
    start(async () => {
      const res = await upsertPlayerProfile(formData);
      if (res.ok) toast.success("Profile saved");
      else toast.error(res.error ?? "Failed to save");
    });
  }

  return (
    <form action={onSubmit} className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <label className="text-sm">Date of birth</label>
        <Input name="date_of_birth" type="date" defaultValue={profile?.date_of_birth ?? ""} />
      </div>

      <div className="space-y-2">
        <label className="text-sm">Preferred foot</label>
        <Select name="preferred_foot" defaultValue={profile?.preferred_foot ?? undefined}>
          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Left</SelectItem>
            <SelectItem value="right">Right</SelectItem>
            <SelectItem value="both">Both</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2 md:col-span-2">
        <label className="text-sm">Positions (comma separated)</label>
        <Input name="positions" placeholder="e.g. ST, RW" defaultValue={(profile?.positions ?? []).join(", ")} />
      </div>

      <div className="space-y-2 md:col-span-2">
        <label className="text-sm">Strengths</label>
        <Textarea name="strengths" rows={3} defaultValue={profile?.strengths ?? ""} />
      </div>

      <div className="space-y-2 md:col-span-2">
        <label className="text-sm">Weaknesses</label>
        <Textarea name="weaknesses" rows={3} defaultValue={profile?.weaknesses ?? ""} />
      </div>

      <div className="space-y-2">
        <label className="text-sm">Contact email</label>
        <Input name="contact_email" type="email" defaultValue={profile?.contact_email ?? ""} />
      </div>
      <div className="space-y-2">
        <label className="text-sm">Contact phone</label>
        <Input name="contact_phone" defaultValue={profile?.contact_phone ?? ""} />
      </div>
      <div className="space-y-2">
        <label className="text-sm">Guardian name</label>
        <Input name="guardian_name" defaultValue={profile?.guardian_name ?? ""} />
      </div>
      <div className="space-y-2">
        <label className="text-sm">Guardian phone</label>
        <Input name="guardian_phone" defaultValue={profile?.guardian_phone ?? ""} />
      </div>

      <div className="space-y-2 md:col-span-2">
        <label className="text-sm">Emergency notes</label>
        <Textarea name="emergency_notes" rows={3} defaultValue={profile?.emergency_notes ?? ""} />
      </div>

      <div className="md:col-span-2 flex justify-end">
        <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save"}</Button>
      </div>
    </form>
  );
}
