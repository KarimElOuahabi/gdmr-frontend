import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, CalendarX2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VisitCard } from "@/components/common/VisitCard";
import type { VisitResponse } from "@/features/visit/visitApi";

type DayCategory = "upcoming" | "done" | "absent";

const UPCOMING_STATUSES: VisitResponse["status"][] = [
  "PROPOSED",
  "AWAITING_DOCTOR_CONFIRMATION",
  "SCHEDULED",
  "IN_PROGRESS",
];

const CATEGORY_CELL_CLASSES: Record<DayCategory, string> = {
  upcoming:
    "bg-blue-500/15 text-blue-700 hover:bg-blue-500/25 dark:text-blue-400",
  done: "bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 dark:text-emerald-400",
  absent: "bg-red-500/15 text-red-700 hover:bg-red-500/25 dark:text-red-400",
};

const LEGEND_ITEMS: { label: string; className: string }[] = [
  { label: "Today", className: "bg-background ring-1 ring-border" },
  { label: "Upcoming", className: "bg-blue-500/60" },
  { label: "Completed", className: "bg-emerald-500/60" },
  { label: "Absent", className: "bg-red-500/60" },
];

function categorize(visit: VisitResponse): DayCategory | null {
  if (!visit.confirmedDateTime) return null;
  if (visit.status === "ABSENT") return "absent";
  if (visit.status === "COMPLETED") return "done";
  if (UPCOMING_STATUSES.includes(visit.status)) return "upcoming";
  return null;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

// Monday-first 6-week grid so every month renders in a stable 42-cell layout.
function buildMonthGrid(monthAnchor: Date): Date[] {
  const firstOfMonth = startOfMonth(monthAnchor);
  const firstWeekday = (firstOfMonth.getDay() + 6) % 7; // 0 = Monday
  const gridStart = new Date(firstOfMonth);
  gridStart.setDate(gridStart.getDate() - firstWeekday);

  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    return d;
  });
}

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface AppointmentCalendarProps {
  visits: VisitResponse[];
  isLoading?: boolean;
  /** "employee" shows the doctor's info on selected-day cards; "staff" shows both. */
  perspective?: "employee" | "staff";
  title?: string;
  /** When provided, clicking a visit card in the side agenda opens its details. */
  onVisitClick?: (visit: VisitResponse) => void;
}

export function AppointmentCalendar({
  visits,
  isLoading = false,
  perspective = "employee",
  title = "My Calendar",
  onVisitClick,
}: AppointmentCalendarProps) {
  const today = useMemo(() => new Date(), []);
  const [monthAnchor, setMonthAnchor] = useState(() => startOfMonth(today));
  const [selectedDate, setSelectedDate] = useState<Date | null>(today);

  const visitsByDay = useMemo(() => {
    const map = new Map<string, VisitResponse[]>();
    for (const visit of visits) {
      if (!visit.confirmedDateTime) continue;
      const date = new Date(visit.confirmedDateTime);
      const key = date.toDateString();
      const existing = map.get(key);
      if (existing) existing.push(visit);
      else map.set(key, [visit]);
    }
    return map;
  }, [visits]);

  const grid = useMemo(() => buildMonthGrid(monthAnchor), [monthAnchor]);

  const monthLabel = monthAnchor.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const goToMonth = (delta: number) => {
    setMonthAnchor((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  const goToToday = () => {
    setMonthAnchor(startOfMonth(today));
    setSelectedDate(today);
  };

  const selectedDayVisits = selectedDate
    ? (visitsByDay.get(selectedDate.toDateString()) ?? [])
    : [];

  return (
    <Card className="mx-auto flex w-full max-w-6xl flex-1 flex-col lg:min-h-[calc(100vh-19rem)]">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-lg">{title}</CardTitle>
          <div className="flex items-center gap-1.5">
            <Button type="button" variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Previous month"
              onClick={() => goToMonth(-1)}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="min-w-32 text-center text-sm font-medium">
              {monthLabel}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Next month"
              onClick={() => goToMonth(1)}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col">
        {isLoading ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 min-h-[28rem] text-muted-foreground">
            <Loader2 className="size-7 animate-spin text-primary" />
            <p className="text-sm">Loading visits…</p>
          </div>
        ) : (
          <div className="flex flex-1 flex-col gap-6 lg:flex-row">
            {/* Month grid — the dominant element */}
            <div className="flex flex-1 flex-col lg:min-w-0">
              <div className="grid grid-cols-7 gap-1.5 pb-1.5">
                {WEEKDAY_LABELS.map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs font-medium text-muted-foreground"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid flex-1 grid-cols-7 grid-rows-6 gap-1.5">
                {grid.map((day) => {
                  const inMonth = day.getMonth() === monthAnchor.getMonth();
                  const isToday = isSameDay(day, today);
                  const isSelected =
                    !!selectedDate && isSameDay(day, selectedDate);
                  const dayVisits = visitsByDay.get(day.toDateString()) ?? [];

                  let category: DayCategory | null = null;
                  if (dayVisits.some((v) => categorize(v) === "absent"))
                    category = "absent";
                  else if (dayVisits.some((v) => categorize(v) === "upcoming"))
                    category = "upcoming";
                  else if (dayVisits.some((v) => categorize(v) === "done"))
                    category = "done";

                  return (
                    <button
                      type="button"
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      className={`relative flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-xl border border-transparent text-sm transition-colors ${
                        category
                          ? CATEGORY_CELL_CLASSES[category]
                          : isToday
                            ? "bg-background border-border hover:bg-muted/40"
                            : "text-foreground hover:bg-muted/40"
                      } ${!inMonth ? "opacity-35" : ""} ${
                        isSelected ? "ring-2 ring-primary" : ""
                      }`}
                    >
                      <span className={isToday ? "font-semibold" : ""}>
                        {day.getDate()}
                      </span>
                      {dayVisits.length > 0 && (
                        <span className="text-[10px] leading-none opacity-80">
                          {dayVisits.length} visit{dayVisits.length > 1 ? "s" : ""}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-4">
                {LEGEND_ITEMS.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground"
                  >
                    <span className={`size-2.5 rounded-full ${item.className}`} />
                    {item.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Selected day agenda */}
            <div className="flex flex-col lg:w-80 lg:shrink-0 lg:border-l lg:pl-6">
              <p className="pb-3 text-sm font-semibold">
                {selectedDate
                  ? selectedDate.toLocaleDateString(undefined, {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })
                  : "Select a day"}
              </p>

              <div className="flex-1 space-y-3 px-0.5 py-1 lg:max-h-[calc(100vh-20rem)] lg:overflow-y-auto lg:px-1">
                {selectedDayVisits.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-10 text-center">
                    <CalendarX2 className="size-6 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      No appointments on this day.
                    </p>
                  </div>
                ) : (
                  selectedDayVisits.map((visit) => (
                    <VisitCard
                      key={visit.id}
                      visit={visit}
                      perspective={perspective}
                      onClick={onVisitClick}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
