"use client";

import { supabaseBrowser } from "@/lib/supabase-browser";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function LoginClient() {
  const supabase = supabaseBrowser();
  const [email, setEmail] = useState("");

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

  return (
    <main className="min-h-screen grid place-items-center p-6">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold">Welcome</h1>
        <Button onClick={signInWithGoogle}>Continue with Google</Button>
        <form onSubmit={sendMagicLink} className="space-y-3">
          <Input type="email" placeholder="you@example.com"
                 value={email} onChange={e => setEmail(e.target.value)} required />
          <Button type="submit">Send magic link</Button>
        </form>
      </div>
    </main>
  );
}
