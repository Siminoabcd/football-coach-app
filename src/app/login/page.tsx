import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import LoginClient from "./login-client";

export default async function LoginPage() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();

  if (user) {
    // If linked to a player -> /me, else -> /teams
    const { data: player } = await sb
      .from("players")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    redirect(player ? "/me" : "/teams");
  }

  return <LoginClient />;
}
