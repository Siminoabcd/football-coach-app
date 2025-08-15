"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function SubscribeIcsReadOnly({
  token,
  teamName,
}: {
  token: string;
  teamName: string;
}) {
  const [url, setUrl] = React.useState("");
  const [webcal, setWebcal] = React.useState("");

  React.useEffect(() => {
    const origin = window.location.origin;
    const u = `${origin}/api/calendar/${token}.ics`;
    setUrl(u);
    setWebcal(u.replace(/^https?:\/\//, "webcal://"));
  }, [token]);

  async function copy() {
    await navigator.clipboard.writeText(url);
    toast.success("Calendar URL copied");
  }

  return (
    <div className="rounded-lg border bg-card p-4">
      <h3 className="font-medium">Subscribe to {teamName} calendar</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Add this team’s schedule to your personal calendar. Anyone with the link can view the schedule.
      </p>
      <div className="mt-3 flex items-center gap-2">
        <Input readOnly value={url} onFocus={(e) => e.currentTarget.select()} />
        <Button variant="outline" onClick={copy}>Copy</Button>
        {/* Opens native calendar apps (Apple/Outlook) */}
        <Button asChild><a href={webcal}>Open</a></Button>
      </div>
      <div className="mt-2 text-xs text-muted-foreground">
        Google Calendar:{" "}
        <a
          href={`https://calendar.google.com/calendar/u/0/r?cid=${encodeURIComponent(url)}`}
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-4"
        >
          Add via URL
        </a>
      </div>
    </div>
  );
}
