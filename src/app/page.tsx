import Link from "next/link";

export default function Landing() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-bold">ModernCoach</h1>
      <p className="text-muted-foreground">Plan sessions, manage teams, track notes.</p>
      <Link href="/login" className="underline">Log in / Sign up</Link>
    </main>
  );
}
