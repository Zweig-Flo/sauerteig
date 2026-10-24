// A culture (kefir, ginger bug, nuka bed, viili) as a Tamagotchi: it lives on and wants tending on a rhythm. Its mood
// follows from the last time it was tended, the room temperature and the fridge. Pure, like shared/mood.ts.

import { feedOf, slowdown, temperatureOf, type Kind } from "./kinds.ts";

export type CultureMood = "full" | "rising" | "ready" | "hungry" | "starving" | "sleeping";

export interface CultureInput {
  kind: Kind;
  variant?: string | null;
  /** Setting it up counts as the first tending. */
  startedAt: string;
  /** Room temperature in °C; null = the kind's default. */
  temperature: number | null;
  /** Since when it sits in the fridge; null = at room temperature. */
  fridgeSince: string | null;
  events: readonly { kind: string; at: string }[];
}

export interface CultureState {
  mood: CultureMood;
  says: string;
  /** What to do now, for the list of things due; null when nothing is due. */
  todo: string | null;
  /** 0 = just tended, 1 = starving. */
  hunger: number;
  tendedAt: string;
  /** When it is ready to use, while that is still ahead at room temperature. */
  readyAt: string | null;
  hungryAt: string;
}

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
const iso = (ms: number) => new Date(ms).toISOString();
const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export function cultureMood(
  { kind, variant, startedAt, temperature, fridgeSince, events }: CultureInput,
  now = Date.now(),
): CultureState {
  const feed = feedOf(kind, variant);
  const reference = temperatureOf(kind, variant) ?? 21;
  const tended = Math.max(Date.parse(startedAt), ...events.filter((e) => e.kind === "feed").map((e) => Date.parse(e.at)));
  const since = Math.max(0, now - tended);
  const scale = slowdown(temperature ?? reference, reference) * HOUR;
  const readySpan = feed.readyHours * scale;
  const starvingSpan = feed.starvingHours * scale;
  const base = { tendedAt: iso(tended) };

  if (fridgeSince) {
    // Time before going into the fridge counts at room speed, so the fridge is no trick to skip a tending.
    const outside = Math.min(since, Math.max(0, Date.parse(fridgeSince) - tended));
    const fridgeSpan = feed.fridgeDays.starving * DAY;
    const hunger = clamp01(outside / starvingSpan + (since - outside) / fridgeSpan);
    const hungryFrom = feed.fridgeDays.hungry / feed.fridgeDays.starving;
    const cold = { ...base, hunger, readyAt: null, hungryAt: iso(now + (hungryFrom - hunger) * fridgeSpan) };
    if (hunger >= 1)
      return { ...cold, mood: "starving", says: "Mir ist kalt und ich hab ewig nichts bekommen …", todo: `Dringend: ${feed.todo}` };
    if (hunger >= hungryFrom) return { ...cold, mood: "hungry", says: `Zeit für frisches Futter: ${feed.todo}.`, todo: feed.todo };
    return { ...cold, mood: "sleeping", says: "Zzz … ich ruhe im Kühlschrank.", todo: null };
  }

  const readyAt = tended + readySpan;
  const hungryAt = tended + feed.hungryHours * scale;
  const warm = { ...base, hunger: clamp01(since / starvingSpan), readyAt: now < readyAt ? iso(readyAt) : null, hungryAt: iso(hungryAt) };
  if (since >= starvingSpan)
    return { ...warm, mood: "starving", says: `Ich verhungere! ${feed.todo}, schnell.`, todo: `Dringend: ${feed.todo}` };
  if (now >= hungryAt) return { ...warm, mood: "hungry", says: `Ich hab Hunger. ${feed.todo}, bitte.`, todo: feed.todo };
  if (now >= readyAt) {
    const todo = feed.readyTodo ?? feed.todo;
    return { ...warm, mood: "ready", says: `Ich bin so weit: ${todo}.`, todo };
  }
  if (since < readySpan * 0.25) return { ...warm, mood: "full", says: "Frisch versorgt, ich lege los.", todo: null };
  return { ...warm, mood: "rising", says: "Ich arbeite vor mich hin.", todo: null };
}
