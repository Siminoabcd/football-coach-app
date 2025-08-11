"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,       // Events
  CheckSquare,        // Attendance
  User,               // Info
  BarChart3,          // Stats
} from "lucide-react";

type Item = { href: string; label: string; icon: React.ElementType };

const items: Item[] = [
  { href: "/me/calendar",   label: "Events",     icon: CalendarDays },
  { href: "/me/attendance", label: "Attendance", icon: CheckSquare  },
  { href: "/me/info",       label: "My Info",    icon: User         },
  { href: "/me/stats",      label: "My Stats",   icon: BarChart3    },
];

export default function PlayerSidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="grid gap-1">
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
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
