"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, dateFnsLocalizer, View, EventProps } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, addMinutes } from "date-fns";
import { enGB } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import NewEventDialog from "./event-new";

const locales = { "en-GB": enGB };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

type DbEvent = {
  id: string;
  type: "training" | "game" | "other";
  date: string;
  start_time: string | null;
  title: string | null;
};

export default function EventsCalendar({ teamId, events }: { teamId: string; events: DbEvent[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [defaults, setDefaults] = useState<{ date?: string; time?: string }>({});

  const data = useMemo(() => {
    return events.map(e => {
      const start = e.start_time
        ? new Date(`${e.date}T${e.start_time}`)
        : new Date(`${e.date}T00:00:00`);
      const end = e.start_time ? addMinutes(start, 90) : addMinutes(start, 60 * 24);
      return {
        id: e.id,
        type: e.type,
        title: e.title ? e.title : e.type,
        start,
        end,
        allDay: !e.start_time,
      };
    });
  }, [events]);

  // Color mapping
  function eventPropGetter(event: any) {
    // prefer inline styles to ensure they override RbC defaults
    const base = {
      borderRadius: "6px",
      border: "none",
      color: "white",
    } as React.CSSProperties;

    if (event.type === "training") {
      return { style: { ...base, backgroundColor: "#22c55e" } }; // green-500
    }
    if (event.type === "game") {
      return { style: { ...base, backgroundColor: "#3b82f6" } }; // blue-500
    }
    return { style: { ...base, backgroundColor: "#6b7280" } };   // gray-500
  }

  return (
    <div className="rounded-md border p-2 bg-background">
      {/* legend same as before */}
      <Calendar
        localizer={localizer}
        events={data}
        startAccessor="start"
        endAccessor="end"
        selectable
        onSelectSlot={(slotInfo: any) => {
          const start: Date = slotInfo.start;
          const date = start.toISOString().slice(0,10);
          const time = start.getHours().toString().padStart(2,"0") + ":" + start.getMinutes().toString().padStart(2,"0");
          setDefaults({ date, time });
          setOpen(true);
        }}
        onSelectEvent={(ev: any) => router.push(`/teams/${teamId}/events/${ev.id}`)}
        views={["month","week","day"] as View[]}
        defaultView="month"
        style={{ height: 600 }}
        eventPropGetter={eventPropGetter}
      />

      {/* Controlled create dialog with defaults */}
      <NewEventDialog
        teamId={teamId}
        open={open}
        onOpenChange={setOpen}
        defaultDate={defaults.date}
        defaultTime={defaults.time}
      />
    </div>
  );
}
