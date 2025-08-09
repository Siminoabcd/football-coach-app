"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TeamTabsNav({ teamId }: { teamId: string }) {
  const pathname = usePathname();
  const tabs = [
    { href: `/teams/${teamId}/players`, label: "Players" },
    { href: `/teams/${teamId}/events`,  label: "Calendar" },
    { href: `/teams/${teamId}/settings`, label: "Settings" },
  ];
  return (
    <div className="flex gap-4 border-b">
      {tabs.map(t => {
        const active = pathname.startsWith(t.href);
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
