import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/theme-toggle";
import SidebarNav from "@/components/sidebar-nav";

async function SignOutButton() {
  "use server";
  const sb = await supabaseServer();
  await sb.auth.signOut();
  redirect("/login");
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-[260px_1fr]">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col border-r bg-card/50 backdrop-blur-sm">
        {/* Brand / header */}
        <div className="p-4 border-b">
          <Link href="/teams" className="group inline-flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary/90 to-primary/60 shadow-inner" />
            <div className="leading-tight">
              <div className="font-semibold tracking-tight">Modern Coach</div>
              <div className="text-xs text-muted-foreground group-hover:text-foreground/80 transition">
                Manage · Plan · Analyze
              </div>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <div className="px-3 py-3">
          <SidebarNav />
        </div>

        {/* Footer */}
        <div className="mt-auto border-t p-3 space-y-3">
          <div className="flex items-center justify-between rounded-lg bg-muted/50 px-2.5 py-2">
            <span className="text-sm text-muted-foreground">Theme</span>
            <ThemeToggle />
          </div>
          <form action={SignOutButton}>
            <Button type="submit" variant="secondary" size="sm" className="w-full">
              Sign out
            </Button>
          </form>
        </div>
      </aside>

      {/* Content */}
      <main className="p-4 md:p-6">{children}</main>
    </div>
  );
}
