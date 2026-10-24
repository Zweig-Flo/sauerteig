// Building blocks the catalog entries share.
import type { Stage, Tend } from "../kinds.ts";

/** Stage days are days; short stages are easier to read in hours. */
export const hours = (value: number) => value / 24;

export const burp = (everyHours = 24): Tend => ({
  everyHours,
  todo: "Entlüften",
  done: "Entlüftet",
  says: "Ich platze gleich! Bitte entlüften.",
});

export const stir = (everyHours = 24, says = "Rühr mich bitte einmal um."): Tend => ({
  everyHours,
  todo: "Umrühren",
  done: "Umgerührt",
  says,
});

/** For what sits under brine: a look every few days, skim what floats. */
export const check = (everyHours: number, says = "Schau nach mir: alles unter der Lake? Kahmhaut abschöpfen."): Tend => ({
  everyHours,
  todo: "Nachsehen",
  done: "Nachgesehen",
  says,
});

/** The last stage of most ferments: done fermenting, kept cold and eaten up. */
export const fridge = (bestDays: number, overripeDays: number, label = "Kühlschrank"): Stage => ({
  label,
  readyDays: { from: 0, to: bestDays },
  overripeDays,
  fixed: true,
});
