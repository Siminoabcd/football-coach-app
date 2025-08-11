"use client";

import { useEffect, useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function MyInfo() {
  const [form, setForm] = useState({ phone:"", emergency_contact:"", medical_notes:"" });
  const [pending, start] = useTransition();

  useEffect(() => {
    (async () => {
      const r = await fetch("/api/me/profile", { cache: "no-store" }).then(r => r.json());
      if (r.profile) setForm({
        phone: r.profile.phone ?? "",
        emergency_contact: r.profile.emergency_contact ?? "",
        medical_notes: r.profile.medical_notes ?? "",
      });
    })();
  }, []);

  function update<K extends keyof typeof form>(k: K, v: string) { setForm(p => ({ ...p, [k]: v })); }

  async function save() {
    start(async () => {
      const res = await fetch("/api/me/profile", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify(form),
      });
      if (!res.ok) toast.error("Failed to save");
      else toast.success("Saved");
    });
  }

  return (
    <div className="max-w-xl space-y-3">
      <div>
        <label className="text-sm">Phone</label>
        <Input value={form.phone} onChange={e => update("phone", e.target.value)} />
      </div>
      <div>
        <label className="text-sm">Emergency contact</label>
        <Input value={form.emergency_contact} onChange={e => update("emergency_contact", e.target.value)} />
      </div>
      <div>
        <label className="text-sm">Medical notes</label>
        <Textarea value={form.medical_notes} onChange={e => update("medical_notes", e.target.value)} />
      </div>
      <Button onClick={save} disabled={pending}>{pending ? "Saving..." : "Save"}</Button>
    </div>
  );
}
