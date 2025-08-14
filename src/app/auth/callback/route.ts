import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const errorDesc = url.searchParams.get("error_description");
  const nextParam = url.searchParams.get("next"); // optional ?next=/xyz

  if (errorDesc) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(errorDesc)}`, request.url)
    );
  }
  if (!code) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Next 15: cookies() is async in route handlers
  const cookieStore = await cookies();

  // Create a *temporary* redirect; we’ll update its Location after we know where to go
  const response = NextResponse.redirect(new URL("/teams", request.url));

  // Cookie adapter so Supabase can write auth cookies on THIS response
  type CookieOptions = NonNullable<Parameters<typeof response.cookies.set>[2]>;
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options?: CookieOptions) {
          response.cookies.set(name, value, options);
        },
        remove(name: string, options?: CookieOptions) {
          response.cookies.set(name, "", { ...options, maxAge: 0 });
        },
      },
    }
  );

  // Exchange the code -> session (writes Set-Cookie to the response)
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url)
    );
  }

  // Decide destination:
  // 1) If caller supplied ?next, respect it (trusted internal paths only)
  // 2) Else, if user is linked to a Player, go to /me
  // 3) Else, default to /teams
  let dest = nextParam;
  if (!dest) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: player } = await supabase
        .from("players")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      dest = player ? "/me" : "/teams";
    } else {
      dest = "/login";
    }
  }

  // Update Location on the same response so we keep the Set-Cookie headers
  response.headers.set("Location", new URL(dest, request.url).toString());
  return response;
}
