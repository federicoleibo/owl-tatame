import { Weekday, WEEKDAY_ORDER } from "./constants";

const WEEKDAY_BY_JS_DAY: Weekday[] = ["DOM", "LUN", "MAR", "MIE", "JUE", "VIE", "SAB"];

export function toDateOnly(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function weekdayOf(date: Date): Weekday {
  return WEEKDAY_BY_JS_DAY[date.getDay()];
}

export function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

/** Monday of the week containing `date`. */
export function startOfWeek(date: Date): Date {
  const d = toDateOnly(date);
  const jsDay = d.getDay(); // 0 = Sunday
  const diffToMonday = jsDay === 0 ? -6 : 1 - jsDay;
  return addDays(d, diffToMonday);
}

/** Sunday of the week containing `date`. */
export function endOfWeek(date: Date): Date {
  return addDays(startOfWeek(date), 6);
}

/** All calendar dates from `from` through the Sunday of `from`'s week whose weekday matches `weekday`. */
export function remainingOccurrencesThisWeek(from: Date, weekday: Weekday): Date[] {
  const from_ = toDateOnly(from);
  const sunday = endOfWeek(from_);
  const dates: Date[] = [];
  let cursor = from_;
  while (cursor <= sunday) {
    if (weekdayOf(cursor) === weekday) dates.push(cursor);
    cursor = addDays(cursor, 1);
  }
  return dates;
}

/**
 * Parses a "YYYY-MM-DD" query param as a local calendar date. `new Date("YYYY-MM-DD")`
 * parses as UTC midnight, which drifts to the previous local day in negative-offset
 * timezones (e.g. Argentina) and would desync admin date filters from stored bookings.
 */
export function parseDateParam(value: string | undefined): Date {
  if (!value) return toDateOnly(new Date());
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return toDateOnly(new Date());
  const [, y, m, d] = match;
  return new Date(Number(y), Number(m) - 1, Number(d));
}

export function parseTimeOnDate(date: Date, hhmm: string): Date {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date(date);
  d.setHours(h, m, 0, 0);
  return d;
}

export const BOOKING_CUTOFF_MINUTES = 30;

/** Booking cutoff: cannot book a slot within BOOKING_CUTOFF_MINUTES of its start. */
export function isPastCutoff(date: Date, startTime: string, now: Date = new Date()): boolean {
  const slotStart = parseTimeOnDate(date, startTime);
  const cutoff = new Date(slotStart.getTime() - BOOKING_CUTOFF_MINUTES * 60 * 1000);
  return now >= cutoff;
}

export function isPastDate(date: Date, now: Date = new Date()): boolean {
  return toDateOnly(date) < toDateOnly(now);
}

export { WEEKDAY_ORDER };
