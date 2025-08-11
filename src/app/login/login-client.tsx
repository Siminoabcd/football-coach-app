"use client";

import { supabaseBrowser } from "@/lib/supabase-browser";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function LoginClient() {
  const supabase = supabaseBrowser();

  // existing magic link state
  const [email, setEmail] = useState("");

  // NEW: password login (dev)
  const [pwEmail, setPwEmail] = useState("");
  const [password, setPassword] = useState("");

  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) toast.error(error.message);
  }

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) toast.error(error.message);
    else toast.success("Check your email for a magic link.");
  }

  // NEW: email + password sign-in (dev only)
  async function signInWithPassword(e: React.FormEvent) {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: pwEmail,
      password,
    });
    if (error) toast.error(error.message);
    // success will redirect because /login/page.tsx checks auth on the server
  }

  return (
    <main className="min-h-screen grid place-items-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-semibold">Welcome</h1>

        <div className="space-y-2">
          <p onClick={signInWithGoogle} className="w-full">Continue with Google</p>
        </div>

        <div className="space-y-2">
          <form onSubmit={sendMagicLink} className="space-y-2">
            <Input type="email" placeholder="you@example.com"
                   value={email} onChange={e => setEmail(e.target.value)} required />
            <Button type="submit" className="w-full">Send magic link</Button>
          </form>
        </div>

        {/* NEW: dev password login */}
        <div className="space-y-2 border-t pt-4">
          <div className="text-sm text-muted-foreground">Dev login (email + password)</div>
          <form onSubmit={signInWithPassword} className="space-y-2">
            <Input type="email" placeholder="dev@example.com"
                   value={pwEmail} onChange={e => setPwEmail(e.target.value)} required />
            <Input type="password" placeholder="password" value={password}
                   onChange={e => setPassword(e.target.value)} required />
            <Button type="submit" className="w-full">Sign in</Button>
          </form>
          <p className="text-xs text-muted-foreground">
            Create/confirm the user in Supabase Dashboard → Authentication → Users.
          </p>
        </div>
      </div>
    </main>
  );
}
