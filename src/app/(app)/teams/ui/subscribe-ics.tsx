"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function SubscribeIcs({
  token,
  teamId,
  teamName,
  onRotate,
}: {
  token: string;
  teamId: string;
  teamName: string;
  onRotate: (teamId: string) => Promise<{ ok: boolean; token?: string; error?: string }>;
}) {
  const [curToken, setCurToken] = React.useState(token);

  const url = React.useMemo(() => {
    if (typeof window === "undefined") return "";
    const base = window.location.origin;
    return `${base}/api/calendar/${curToken}.ics`;
  }, [curToken]);

  async function copy() {
    await navigator.clipboard.writeText(url);
    toast.success("Calendar URL copied");
  }

  async function rotate() {
    const res = await onRotate(teamId);
    if (!res.ok || !res.token) {
      toast.error(res.error ?? "Failed to rotate link");
    } else {
      setCurToken(res.token);
      toast.success("Link rotated");
    }
  }

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Subscribe to calendar</h3>
      </div>
      <p className="text-sm text-muted-foreground mt-1">
        Add <b>{teamName}</b> to Apple/Google Calendar. This link is private—anyone with the URL can view the schedule.
      </p>
      <div className="mt-3 flex items-center gap-2">
        <Input readOnly value={url} onFocus={(e) => e.currentTarget.select()} />
        <Button onClick={copy} variant="outline">Copy</Button>
        <Button onClick={rotate} variant="destructive">Rotate link</Button>
      </div>
      <div className="mt-2 text-xs text-muted-foreground">
        After rotating, re-subscribe with the new link. The old link stops working.
      </div>
    </div>
  );
}
