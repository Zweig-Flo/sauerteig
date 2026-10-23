// Inputs of the API, checked on the server and typed in the web app. New fields go here first.
import { z } from "zod";

const grams = z.number().min(0).max(5000);

export const starterInput = z.object({
  name: z.string().trim().min(1, "Name fehlt").max(60),
  flour: z.string().trim().min(1, "Mehl fehlt").max(60),
  /** Water per flour in percent, 100 = equal parts. */
  hydration: z.number().int().min(40).max(200),
  notes: z.string().trim().max(2000).nullish(),
});
export type StarterInput = z.infer<typeof starterInput>;

export const starterPatch = starterInput.partial().extend({ archived: z.boolean().optional() });
export type StarterPatch = z.infer<typeof starterPatch>;

export const feedingInput = z.object({
  /** ISO time; missing = now. */
  fedAt: z.iso.datetime({ offset: true }).optional(),
  starterGrams: grams,
  flourGrams: grams.refine((value) => value > 0, "Ohne Mehl ist es keine Fütterung"),
  waterGrams: grams,
  note: z.string().trim().max(500).nullish(),
});
export type FeedingInput = z.infer<typeof feedingInput>;
