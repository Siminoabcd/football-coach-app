import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import { Button } from "@/components/ui/button";

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
      <aside className="border-r p-4 space-y-4">
        <h1 className="font-bold">Modern Coach</h1>
        <nav className="flex flex-col gap-2">
          <Link href="/teams" className="hover:underline">Teams</Link>
        </nav>
        <form action={SignOutButton}>
          <Button type="submit" variant="secondary" size="sm">Sign out</Button>
        </form>
      </aside>
      <main className="p-6">{children}</main>
    </div>
  );
}
