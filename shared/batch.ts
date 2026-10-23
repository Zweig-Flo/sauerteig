// A batch (kimchi, sauerkraut, kombucha) as a Tamagotchi: its mood follows from the days since it was set up, the
// room temperature and what was done to it. Pure, like shared/mood.ts.

import { REFERENCE_TEMPERATURE, rules, type Kind, type Stage } from "./kinds.ts";

export type BatchMood = "fresh" | "bubbling" | "burp" | "ready" | "overripe" | "done";

/** What can happen to a ferment besides a feeding. */
export const EVENT_KINDS = ["burp", "taste", "stage", "done"] as const;
export type EventKind = (typeof EVENT_KINDS)[number];

export interface BatchInput {
  kind: Kind;
  startedAt: string;
  /** Room temperature in °C; null = the kind's default. */
  temperature: number | null;
  events: readonly { kind: EventKind; at: string }[];
}

export interface BatchState {
  mood: BatchMood;
  says: string;
  stage: Stage;
  /** 0-based, into the kind's stages. */
  stageIndex: number;
  /** Whole days in this stage, counted from 1. */
  day: number;
  /** 0 = just set up, 1 = ready to taste. */
  progress: number;
  readyAt: string;
  bestUntil: string;
  overripeAt: string;
  /** When it wants the next burp; null when the stage needs none. */
  burpAt: string | null;
}

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
const iso = (ms: number) => new Date(ms).toISOString();

/** How much slower than at REFERENCE_TEMPERATURE: 10 °C cooler doubles the days. */
export const slowdown = (temperature: number) => 2 ** ((REFERENCE_TEMPERATURE - temperature) / 10);

export function batchMood({ kind, startedAt, temperature, events }: BatchInput, now = Date.now()): BatchState {
  const kindRules = rules(kind);
  if (kindRules.family !== "batch") throw new Error(`${kind} ist keine Charge`);
  const sorted = [...events].sort((a, b) => a.at.localeCompare(b.at));
  const stageEvents = sorted.filter((e) => e.kind === "stage");
  const stageIndex = Math.min(stageEvents.length, kindRules.stages.length - 1);
  const stage = kindRules.stages[stageIndex];
  const stageStart = Date.parse(stageIndex > 0 ? stageEvents[stageIndex - 1].at : startedAt);
  const lastBurp = Math.max(
    stageStart,
    ...sorted.filter((e) => e.kind === "burp").map((e) => Date.parse(e.at)),
  );

  const scale = slowdown(temperature ?? kindRules.defaultTemperature) * DAY;
  const days = Math.max(0, now - stageStart) / scale;
  const readyAt = stageStart + stage.readyDays.from * scale;
  const overripeAt = stageStart + stage.overripeDays * scale;
  const burpAt = stage.burpHours ? lastBurp + stage.burpHours * HOUR : null;
  const base = {
    stage,
    stageIndex,
    day: Math.floor(Math.max(0, now - stageStart) / DAY) + 1,
    progress: Math.min(1, days / stage.readyDays.from),
    readyAt: iso(readyAt),
    bestUntil: iso(stageStart + stage.readyDays.to * scale),
    overripeAt: iso(overripeAt),
    burpAt: burpAt === null ? null : iso(burpAt),
  };

  if (sorted.some((e) => e.kind === "done")) return { ...base, burpAt: null, mood: "done", says: "Fertig! Guten Appetit." };
  if (now >= overripeAt) return { ...base, mood: "overripe", says: "Ich bin drüber. Probier vorsichtig." };
  if (burpAt !== null && now >= burpAt) return { ...base, mood: "burp", says: "Ich platze gleich! Bitte entlüften." };
  if (now >= readyAt)
    return { ...base, mood: "ready", says: stage.next ? "Ich bin so weit für den nächsten Schritt." : "Ich bin bereit! Probier mal." };
  if (days < 1) return { ...base, mood: "fresh", says: "Frisch angesetzt, ich komme langsam in Gang." };
  return { ...base, mood: "bubbling", says: "Ich blubbere vor mich hin." };
}
