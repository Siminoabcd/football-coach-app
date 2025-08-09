import Link from "next/link";

export default function Landing() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-bold">Modern<span className="text-4xl font-bold text-green-800">Coach</span></h1>
      <p className="text-muted-foreground">Plan sessions, manage teams, track notes.⚽️</p>
      <Link href="/login" className="underline">Join for free</Link>
    </main>
  );
}
