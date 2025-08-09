import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import LoginClient from "./login-client";

export default async function LoginPage() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();

  if (user) {
    // already authenticated -> go to dashboard
    redirect("/teams");
  }

  return <LoginClient />;
}
