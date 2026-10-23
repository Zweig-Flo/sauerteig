import { berlinToday } from "../../shared/dates.ts";

const time = new Intl.DateTimeFormat("de-DE", {
  timeZone: "Europe/Berlin",
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

/** "Di., 20. Okt., 08:00" in Europe/Berlin. */
export const fedAt = (iso: string) => time.format(new Date(iso));

/** "gerade eben", "vor 40 Min.", "vor 6 Std.", "vor 3 Tagen". */
export function ago(iso: string, now = Date.now()): string {
  const minutes = Math.max(0, Math.round((now - Date.parse(iso)) / 60_000));
  if (minutes < 1) return "gerade eben";
  if (minutes < 60) return `vor ${minutes} Min.`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `vor ${hours} Std.`;
  return `vor ${Math.round(hours / 24)} Tagen`;
}

export const grams = (value: number) => `${value.toLocaleString("de-DE")} g`;

const clock = new Intl.DateTimeFormat("de-DE", { timeZone: "Europe/Berlin", hour: "2-digit", minute: "2-digit" });

/** "heute 21:30", "morgen 07:10", otherwise like `fedAt`. */
export function when(iso: string, now = Date.now()): string {
  const day = berlinToday(new Date(iso));
  if (day === berlinToday(new Date(now))) return `heute ${clock.format(new Date(iso))}`;
  if (day === berlinToday(new Date(now + 86_400_000))) return `morgen ${clock.format(new Date(iso))}`;
  if (day === berlinToday(new Date(now - 86_400_000))) return `gestern ${clock.format(new Date(iso))}`;
  return fedAt(iso);
}

/** "heute geschlüpft", "1 Tag alt", "12 Tage alt". */
export function age(bornAt: string, now = Date.now()): string {
  const days = Math.max(0, Math.floor((now - Date.parse(bornAt)) / 86_400_000));
  if (days === 0) return "heute geschlüpft";
  return days === 1 ? "1 Tag alt" : `${days} Tage alt`;
}

export const hours = (value: number) => `${value.toLocaleString("de-DE")} Std.`;

const date = new Intl.DateTimeFormat("de-DE", { timeZone: "Europe/Berlin", weekday: "short", day: "numeric", month: "short" });

/** Like `when` within two days, further out only the day: "Sa., 21. Nov.". */
export function whenDay(iso: string, now = Date.now()): string {
  return Math.abs(Date.parse(iso) - now) < 2 * 86_400_000 ? when(iso, now) : date.format(new Date(iso));
}
