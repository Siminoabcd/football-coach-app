"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";

export default function Filters() {
  const router = useRouter();
  const sp = useSearchParams();

  const [q, setQ] = useState(sp.get("q") ?? "");
  const [category, setCategory] = useState(sp.get("category") ?? "");
  const [age, setAge] = useState(sp.get("age_group") ?? "");
  const [diff, setDiff] = useState(sp.get("difficulty") ?? "");

  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (age) params.set("age_group", age);
    if (diff) params.set("difficulty", diff);
    const url = params.toString() ? `/drills?${params}` : "/drills";
    const t = setTimeout(() => router.replace(url), 250);
    return () => clearTimeout(t);
  }, [q, category, age, diff, router]);

  return (
    <div className="grid gap-3 md:grid-cols-4">
      <Input placeholder="Search drills…" value={q} onChange={(e) => setQ(e.target.value)} />
      <Input placeholder="Category (e.g. Finishing)" value={category} onChange={(e) => setCategory(e.target.value)} />
      <Input placeholder="Age group (e.g. U11)" value={age} onChange={(e) => setAge(e.target.value)} />
      <Select value={diff} onValueChange={setDiff}>
        <SelectTrigger><SelectValue placeholder="Difficulty" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="Easy">Easy</SelectItem>
          <SelectItem value="Medium">Medium</SelectItem>
          <SelectItem value="Hard">Hard</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
