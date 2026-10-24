// Inputs of the API, checked on the server and typed in the web app. New fields go here first.
import { z } from "zod";
import { EVENT_KINDS } from "./batch.ts";
import { isVariant, KINDS, rules } from "./kinds.ts";

const grams = z.number().min(0).max(5000);
// Up to 70 °C: amazake and yogurt are kept warm.
const temperature = z.number().min(-30).max(70);

const fermentFields = z.object({
  name: z.string().trim().min(1, "Name fehlt").max(60),
  notes: z.string().trim().max(2000).nullish(),
  /** Sourdough only. */
  flour: z.string().trim().min(1, "Mehl fehlt").max(60).nullish(),
  /** Sourdough only: water per flour in percent, 100 = equal parts. */
  hydration: z.number().int().min(40).max(200).nullish(),
  /** Batches and cultures: room temperature in °C; null = the kind's default. */
  temperature: temperature.nullish(),
  /** A variant of the kind, see `variants` in shared/catalog; null = the plain recipe. */
  variant: z.string().trim().min(1).max(40).nullish(),
});

export const fermentInput = fermentFields
  .extend({
    kind: z.enum(KINDS),
    /** ISO time it was set up; missing = now. */
    startedAt: z.iso.datetime({ offset: true }).optional(),
  })
  .superRefine((input, ctx) => {
    if (input.variant && !isVariant(input.kind, input.variant))
      ctx.addIssue({ code: "custom", path: ["variant"], message: `${rules(input.kind).label} gibt es nicht als „${input.variant}“` });
    if (rules(input.kind).family !== "keep") return;
    if (!input.flour) ctx.addIssue({ code: "custom", path: ["flour"], message: "Mehl fehlt" });
    if (input.hydration == null) ctx.addIssue({ code: "custom", path: ["hydration"], message: "Hydration fehlt" });
  });
export type FermentInput = z.infer<typeof fermentInput>;

export const fermentPatch = fermentFields.partial().extend({
  archived: z.boolean().optional(),
  /** Keeps and cultures: true puts it into the fridge (from now), false takes it out. */
  fridge: z.boolean().optional(),
});
export type FermentPatch = z.infer<typeof fermentPatch>;

/** Burped (or stirred, turned), tasted, next stage, done, or tended (`feed`, cultures only). */
export const eventInput = z.object({
  kind: z.enum(EVENT_KINDS),
  /** ISO time; missing = now. */
  at: z.iso.datetime({ offset: true }).optional(),
  note: z.string().trim().max(500).nullish(),
});
export type EventInput = z.infer<typeof eventInput>;

export const feedingInput = z.object({
  /** ISO time; missing = now. */
  fedAt: z.iso.datetime({ offset: true }).optional(),
  starterGrams: grams,
  flourGrams: grams.refine((value) => value > 0, "Ohne Mehl ist es keine Fütterung"),
  waterGrams: grams,
  note: z.string().trim().max(500).nullish(),
  /** Room temperature in °C. */
  temperature: temperature.nullish(),
});
export type FeedingInput = z.infer<typeof feedingInput>;

/** What was seen after a feeding; null clears a value. */
export const feedingObservation = z.object({
  /** When it stood highest; must be after the feeding. */
  peakAt: z.iso.datetime({ offset: true }).nullish(),
  /** How much it grew, 100 = doubled. */
  risePercent: z.number().int().min(0).max(1000).nullish(),
  temperature: temperature.nullish(),
});
export type FeedingObservation = z.infer<typeof feedingObservation>;
