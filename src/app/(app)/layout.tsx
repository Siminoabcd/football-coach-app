import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/theme-toggle"; // ⬅️ add

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
    <div className="min-h-screen grid grid-cols-[220px_1fr]">
      {/* Sidebar */}
      <aside className="border-r p-4 flex flex-col bg-background">
        <div className="space-y-4">
          <h1 className="font-bold">Modern Coach</h1>
          <nav className="flex flex-col gap-2">
            <Link href="/teams" className="hover:underline">Teams</Link>
          </nav>
        </div>

        {/* Bottom actions */}
        <div className="mt-auto space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Theme</span>
            <ThemeToggle />
          </div>
          <form action={SignOutButton}>
            <Button type="submit" variant="secondary" size="sm">Sign out</Button>
          </form>
        </div>
      </aside>

      {/* Content */}
      <main className="p-6">{children}</main>
    </div>
  );
}
