import type { CalendarEvent, CalendarEventCategory, Race } from "@/types";

export interface CalendarItem {
  id: string;
  title: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD, >= startDate
  category: CalendarEventCategory;
  /** set for real races, so they can link through to their detail/RSVP page */
  href: string | null;
}

/** Merges real races (always category "Race", linkable) with generic calendar_events. */
export function buildCalendarItems(races: Race[], events: CalendarEvent[]): CalendarItem[] {
  const raceItems: CalendarItem[] = races.map((r) => ({
    id: `race-${r.id}`,
    title: r.name,
    startDate: r.race_date,
    endDate: r.race_date,
    category: "Race",
    href: `/races/${r.id}`,
  }));
  const eventItems: CalendarItem[] = events.map((e) => ({
    id: `event-${e.id}`,
    title: e.title,
    startDate: e.start_date,
    endDate: e.end_date,
    category: e.category,
    href: null,
  }));
  return [...raceItems, ...eventItems].sort((a, b) => a.startDate.localeCompare(b.startDate));
}

/** Items whose date range overlaps the given year/month (1-indexed). */
export function itemsForMonth(items: CalendarItem[], year: number, month: number): CalendarItem[] {
  const monthStart = `${year}-${String(month).padStart(2, "0")}-01`;
  const daysInMonth = new Date(year, month, 0).getDate();
  const monthEnd = `${year}-${String(month).padStart(2, "0")}-${String(daysInMonth).padStart(2, "0")}`;
  return items.filter((item) => item.startDate <= monthEnd && item.endDate >= monthStart);
}

/** Groups items by their start-day (YYYY-MM-DD) — each multi-day item is shown once, under its start date. */
export function itemsByStartDay(items: CalendarItem[]): Map<string, CalendarItem[]> {
  const map = new Map<string, CalendarItem[]>();
  for (const item of items) {
    const existing = map.get(item.startDate);
    if (existing) {
      existing.push(item);
    } else {
      map.set(item.startDate, [item]);
    }
  }
  return map;
}

/** Set of every YYYY-MM-DD an item's range touches, for the mini-month's event dots. */
export function datesWithItems(items: CalendarItem[]): Set<string> {
  const dates = new Set<string>();
  for (const item of items) {
    // Parsed and iterated in UTC throughout (Z suffix + UTC getters/setters) —
    // mixing a local-time parse with a toISOString() UTC readout shifts every
    // date by the local timezone offset (e.g. a day early in UTC+8), so dots
    // would land on the wrong day for anyone not in UTC.
    const start = new Date(`${item.startDate}T00:00:00Z`);
    const end = new Date(`${item.endDate}T00:00:00Z`);
    for (let d = start; d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
      dates.add(d.toISOString().slice(0, 10));
    }
  }
  return dates;
}

/** Items whose date range covers a specific day. */
export function itemsForDay(items: CalendarItem[], dateIso: string): CalendarItem[] {
  return items.filter((item) => item.startDate <= dateIso && item.endDate >= dateIso);
}

/** The next `limit` items ending on/after `fromDateIso`, soonest first. */
export function upcomingItems(
  items: CalendarItem[],
  fromDateIso: string,
  limit: number
): CalendarItem[] {
  return items
    .filter((item) => item.endDate >= fromDateIso)
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .slice(0, limit);
}

/**
 * Leading blanks (for days-of-week alignment) followed by 1..N for the given
 * month, shared by CalendarMiniMonth and CalendarMonthGrid so both grids
 * agree on cell placement.
 */
export function buildMonthGridCells(year: number, month: number): (number | null)[] {
  const daysInMonth = new Date(year, month, 0).getDate();
  const leadingBlanks = new Date(year, month - 1, 1).getDay();
  return [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
}

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(`${startDate}T00:00:00`);
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  if (startDate === endDate) return fmt(start);
  const end = new Date(`${endDate}T00:00:00`);
  return `${fmt(start)} – ${fmt(end)}`;
}
