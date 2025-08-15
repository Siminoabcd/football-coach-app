"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Dumbbell, CalendarDays, BarChart3 } from "lucide-react";

type Item = { href: string; label: string; icon: React.ElementType };

const items: Item[] = [
  { href: "/teams",  label: "Teams",  icon: Users },
  { href: "/drills", label: "Drills", icon: Dumbbell },
  // future:
  // { href: "/calendar", label: "Calendar", icon: CalendarDays },
  // { href: "/stats",    label: "Insights", icon: BarChart3 },
];

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="mt-3 flex flex-col gap-1">
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={[
              "flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors",
              active
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
            ].join(" ")}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
