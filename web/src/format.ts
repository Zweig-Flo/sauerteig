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
