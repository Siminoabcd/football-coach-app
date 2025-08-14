import Link from "next/link";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/theme-toggle";
import { CalendarDays, BarChart3, Users2, CheckSquare } from "lucide-react";
import LogoIcon from "@/components/logo-icon";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Landing() {
  return (
    <main className="min-h-screen relative">
      {/* subtle background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_-10%,hsl(var(--primary)/0.12),transparent_60%)]" />

      {/* NAV */}
      <header className="relative p-3 z-10">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="inline-flex items-center gap-2">
              <LogoIcon size={32} />
              <span className="font-semibold tracking-tight">Modern Coach</span>
            </Link>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button asChild variant="ghost"><Link href="/login">Log in</Link></Button>
              <Button asChild><Link href="/login">Get started</Link></Button>
            </div>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative w-full h-full p-3 z-10">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid items-center gap-10 py-12 md:grid-cols-2 md:py-20">
            {/* Left column: copy + CTAs */}
            <div>
              <h1 className="text-4xl p-3 font-semibold tracking-tight md:text-6xl">
                Manage teams. <span className="text-primary">Elevate players.</span>
              </h1>
              <p className="mt-4 p-3 text-base text-muted-foreground">
                Unify scheduling, attendance, and performance analytics.
                Built for coaches; delightful for players.
              </p>
              <div className="mt-8 p-3 flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/login">Start now</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/login?next=/me">Try as player</Link>
                </Button>
              </div>
            </div>

            {/* Right column: simple preview card */}
            <div className="mx-auto w-full max-w-md">
              <div className="rounded-2xl border bg-card/80 p-4 shadow-lg backdrop-blur">
                <div className="rounded-xl border bg-background p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">Next training</div>
                    <div className="text-xs text-muted-foreground">Today 18:00</div>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                    <PreviewPill label="Attendance" value="Live" />
                    <PreviewPill label="Players" value="18" />
                    <PreviewPill label="Drills" value="4" />
                  </div>
                  <div className="mt-4 h-32 rounded-lg border bg-muted/40" />
                  <div className="mt-3 text-xs text-muted-foreground">
                    Built-in analytics and session planning.
                  </div>
                </div>
              </div>
            </div> 
          </div>
        </div>
      </section>

      {/* FEATURES (moved below hero, full width but centered) */}
      <section className="relative z-10 border-t">
        <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={<CalendarDays className="h-4 w-4" />}
              title="Smart Calendar"
              desc="RSVP & drills"
            />
            <FeatureCard
              icon={<CheckSquare className="h-4 w-4" />}
              title="Attendance"
              desc="Bulk & live updates"
            />
            <FeatureCard
              icon={<BarChart3 className="h-4 w-4" />}
              title="Player Stats"
              desc="Trends & totals"
            />
            <FeatureCard
              icon={<Users2 className="h-4 w-4" />}
              title="Team Hub"
              desc="Profiles & roles"
            />
          </div>
        </div>
      </section>
      

      {/* FOOTER */}
      <footer className="relative z-10 border-t">
        <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-muted-foreground flex items-center justify-between">
          <div>© {new Date().getFullYear()} Modern Coach</div>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-foreground">Privacy</Link>
            <Link href="#" className="hover:text-foreground">Terms</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2">
        <div className="rounded-md border p-1.5">{icon}</div>
        <div className="font-medium">{title}</div>
      </div>
      <div className="mt-2 text-sm text-muted-foreground">{desc}</div>
    </div>
  );
}

function PreviewPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-background p-2">
      <div className="text-muted-foreground">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}
