"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

function SubmitBtn({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : children}
    </Button>
  );
}

/**
 * Renders a dialog with a server-action form for editing ONLY the allowed fields:
 * - date_of_birth, preferred_foot, contact_email, contact_phone, guardian_name, guardian_phone, emergency_notes
 * Positions, strengths, weaknesses are read-only for players.
 */
export default function EditMyInfoDialog({
  initial,
  onSave,
  children,
}: {
  initial: {
    date_of_birth: string | null;
    preferred_foot: string | null;
    contact_email: string;
    contact_phone: string;
    guardian_name: string;
    guardian_phone: string;
    emergency_notes: string;
  };
  onSave: (formData: FormData) => Promise<any>; // server action
  children: React.ReactNode; // trigger
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit my info</DialogTitle>
        </DialogHeader>

        <form action={onSave} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm mb-1 block">Date of birth</label>
              <Input name="date_of_birth" type="date" defaultValue={initial.date_of_birth ?? ""} />
            </div>
            <div>
              <label className="text-sm mb-1 block">Preferred foot</label>
              <select
                name="preferred_foot"
                defaultValue={initial.preferred_foot ?? ""}
                className="w-full rounded-md border bg-transparent px-3 py-2 text-sm"
              >
                <option value="">—</option>
                <option value="left">left</option>
                <option value="right">right</option>
                <option value="both">both</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm mb-1 block">Contact email</label>
              <Input name="contact_email" type="email" defaultValue={initial.contact_email} />
            </div>
            <div>
              <label className="text-sm mb-1 block">Contact phone</label>
              <Input name="contact_phone" defaultValue={initial.contact_phone} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm mb-1 block">Guardian name</label>
              <Input name="guardian_name" defaultValue={initial.guardian_name} />
            </div>
            <div>
              <label className="text-sm mb-1 block">Guardian phone</label>
              <Input name="guardian_phone" defaultValue={initial.guardian_phone} />
            </div>
          </div>

          <div>
            <label className="text-sm mb-1 block">Emergency / medical notes</label>
            <Textarea name="emergency_notes" defaultValue={initial.emergency_notes} rows={4} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <SubmitBtn>Save</SubmitBtn>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
