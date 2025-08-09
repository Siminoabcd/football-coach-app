"use client";

import Papa from "papaparse";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function ImportPlayers({ teamId }: { teamId: string }) {
  async function handleFile(file: File) {
    Papa.parse<string[]>(file, {
      complete: async (result) => {
        const rows = result.data.filter(r => r && r.length >= 2);
        if (!rows.length) return toast.error("No valid rows found");

        // Build insert rows
        const payload = rows.map((r) => ({
          team_id: teamId,
          first_name: (r[0] ?? "").trim(),
          last_name: (r[1] ?? "").trim(),
          position: (r[2] ?? "").trim() || null,
          jersey: (r[3] ?? "").trim() || null,
        })).filter(x => x.first_name && x.last_name);

        if (!payload.length) return toast.error("No valid names in CSV");

        const res = await fetch(`/api/players/import`, {
          method: "POST",
          body: JSON.stringify({ rows: payload }),
        });

        if (res.ok) toast.success("Imported players");
        else toast.error("Import failed");
      },
      skipEmptyLines: true,
    });
  }

  return (
    <label className="inline-flex items-center gap-2">
      <input
        type="file"
        accept=".csv"
        hidden
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      <Button variant="secondary" type="button">Import CSV</Button>
    </label>
  );
}
