import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function supabaseServer() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          // In Server Components this will throw; swallow it there.
          try {
            cookieStore.set(name, value, options);
          } catch {
            /* noop in Server Components */
          }
        },
        remove(name: string) {
          try {
            cookieStore.delete(name);
          } catch {
            /* noop in Server Components */
          }
        },
      },
    }
  );
}
