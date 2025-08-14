"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Link from "next/link";
import { Mail, Lock, ArrowRight, User2 } from "lucide-react";

const SHOW_PASSWORD = process.env.NEXT_PUBLIC_ENABLE_PASSWORD_LOGIN === "true";

export default function LoginClient() {
  const supabase = supabaseBrowser();

  const [email, setEmail] = useState("");
  const [playerMode, setPlayerMode] = useState(true); // default players straight to /me
  const [pwEmail, setPwEmail] = useState("");
  const [password, setPassword] = useState("");
  const nextParam = playerMode ? "?next=/me" : "";

  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback${nextParam}` },
    });
    if (error) toast.error(error.message);
  }

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback${nextParam}` },
    });
    if (error) toast.error(error.message);
    else toast.success("Check your email for a magic link.");
  }

  async function signInWithPassword(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email: pwEmail, password });
    if (error) toast.error(error.message);
    // Success path: server /login will redirect to /me or /teams
    else window.location.assign("/login");
  }

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* subtle gradient bg */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_0%,hsl(var(--primary)/0.15),transparent_60%)]" />
      <div className="container mx-auto px-4 py-10 md:py-16">
        <div className="grid gap-10 md:grid-cols-2 items-center">
          {/* Left: hero copy */}
          <section className="order-2 md:order-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-muted/60 px-3 py-1 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-primary" /> Modern Coach
            </div>
            <h1 className="mt-4 text-3xl md:text-5xl font-semibold tracking-tight">
              Plan smarter. <span className="text-primary">Coach better.</span>
            </h1>
            <p className="mt-3 text-muted-foreground">
              One place for sessions, attendance, player stats, and communication.
              Coaches get control—players get clarity.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4">
                Learn more
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-4 text-sm">
              <div className="rounded-lg border bg-card/60 p-3">
                <div className="text-xs text-muted-foreground">Attendance</div>
                <div className="text-lg font-medium">Bulk/Live</div>
              </div>
              <div className="rounded-lg border bg-card/60 p-3">
                <div className="text-xs text-muted-foreground">Stats</div>
                <div className="text-lg font-medium">Trends</div>
              </div>
              <div className="rounded-lg border bg-card/60 p-3">
                <div className="text-xs text-muted-foreground">Calendar</div>
                <div className="text-lg font-medium">RSVP</div>
              </div>
            </div>
          </section>

          {/* Right: auth card */}
          <section className="order-1 md:order-2">
            <div className="mx-auto w-full max-w-md rounded-2xl border bg-card/80 shadow-sm backdrop-blur">
              <div className="border-b px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">Welcome</div>
                    <div className="text-xl font-semibold">Sign in to continue</div>
                  </div>
                  <User2 className="h-6 w-6 text-muted-foreground" />
                </div>
              </div>

              <div className="px-6 py-5 space-y-4">
                {/* Player toggle */}
                <label className="flex items-center justify-between rounded-lg border px-3 py-2">
                  <span className="text-sm">I’m signing in as a player</span>
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-current"
                    checked={playerMode}
                    onChange={(e) => setPlayerMode(e.target.checked)}
                  />
                </label>

                {/* Google */}
                <Button onClick={signInWithGoogle} className="w-full inline-flex items-center gap-2">
                  <GoogleIcon className="h-4 w-4" />
                  Continue with Google
                </Button>

                {/* Divider */}
                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-card px-2 text-xs text-muted-foreground">or</span>
                  </div>
                </div>

                {/* Magic link */}
                <form onSubmit={sendMagicLink} className="space-y-2">
                  <label className="text-xs text-muted-foreground">Email</label>
                  <div className="flex gap-2">
                    <div className="relative w-full">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        className="pl-9"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="shrink-0 inline-flex items-center gap-1">
                      Send link <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    We’ll email you a secure login link.
                  </p>
                </form>

                {/* Optional password (dev) */}
                {SHOW_PASSWORD && (
                  <>
                    <div className="relative my-2">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-card px-2 text-xs text-muted-foreground">dev password</span>
                      </div>
                    </div>

                    <form onSubmit={signInWithPassword} className="space-y-2">
                      <label className="text-xs text-muted-foreground">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="dev@example.com"
                          className="pl-9"
                          value={pwEmail}
                          onChange={(e) => setPwEmail(e.target.value)}
                          required
                        />
                      </div>
                      <label className="text-xs text-muted-foreground">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className="pl-9"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full">Sign in</Button>
                      <p className="text-[11px] text-muted-foreground">
                        Create & confirm the user in Supabase → Authentication → Users.
                      </p>
                    </form>
                  </>
                )}
              </div>

              <div className="px-6 py-4 border-t text-xs text-muted-foreground">
                By continuing you agree to our{" "}
                <Link href="#" className="underline underline-offset-4">Terms</Link> and{" "}
                <Link href="#" className="underline underline-offset-4">Privacy</Link>.
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="#EA4335" d="M12 10.2v3.96h5.6c-.24 1.44-1.68 4.2-5.6 4.2-3.36 0-6.1-2.76-6.1-6.16S8.64 6 12 6c1.92 0 3.2.8 3.92 1.48l2.68-2.6C16.7 3.36 14.56 2.4 12 2.4 6.88 2.4 2.8 6.52 2.8 11.6S6.88 20.8 12 20.8c6.72 0 9.24-4.72 9.24-7.6 0-.48-.04-.8-.12-1H12z"/>
    </svg>
  );
}
