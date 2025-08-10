"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function PlayerTabsNav({ teamId, playerId }: { teamId: string; playerId: string }) {
  const pathname = usePathname();
  const tabs = [
    { href: `/teams/${teamId}/players/${playerId}`, label: "Info" },
    { href: `/teams/${teamId}/players/${playerId}/stats`, label: "Stats" },
    { href: `/teams/${teamId}/players/${playerId}/attendance`, label: "Attendance" },
  ];
  return (
    <div className="flex gap-4 border-b">
      {tabs.map(t => {
        const active = pathname === t.href || pathname.startsWith(t.href + "/");
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`pb-2 -mb-px border-b-2 ${active ? "border-foreground font-medium" : "border-transparent text-muted-foreground hover:border-foreground/30"}`}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
