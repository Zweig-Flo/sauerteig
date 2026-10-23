// Dates are plain "YYYY-MM-DD" strings, meant as local dates in Europe/Berlin.

export function berlinToday(now = new Date()): string {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}
