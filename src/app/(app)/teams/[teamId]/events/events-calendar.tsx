"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Calendar, dateFnsLocalizer, View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, addMinutes } from "date-fns";
import { enGB } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = { "en-GB": enGB };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

type DbEvent = { id: string; type: "training" | "game" | "other"; date: string; start_time: string | null; title: string | null };

export default function EventsCalendar({ teamId, events }: { teamId: string; events: DbEvent[] }) {
  const router = useRouter();

  const data = useMemo(() => {
    return events.map(e => {
      const start = e.start_time
        ? new Date(`${e.date}T${e.start_time}`)
        : new Date(`${e.date}T00:00:00`);
      const end = e.start_time
        ? addMinutes(start, 90) // default 90 min if time exists
        : addMinutes(start, 60 * 24); // all-day feel
      return {
        id: e.id,
        title: `${e.type}${e.title ? `: ${e.title}` : ""}`,
        start,
        end,
        allDay: !e.start_time,
      };
    });
  }, [events]);

  return (
    <div className="rounded-md border p-2 bg-background">
      <Calendar
        localizer={localizer}
        events={data}
        startAccessor="start"
        endAccessor="end"
        views={["month", "week", "day"] as View[]}
        defaultView="month"
        style={{ height: 600 }}
        onSelectEvent={(ev: any) => {
          router.push(`/teams/${teamId}/events/${ev.id}`);
        }}
      />
    </div>
  );
}
