// The kinds of ferments and their rules. A new kind is one entry here plus its look in web/src/pet.tsx.

/** "keep" lives on and gets fed, "batch" is set up once and ripens until it is done. */
export type Family = "keep" | "batch";

export const KINDS = ["sourdough", "kimchi", "sauerkraut", "kombucha"] as const;
export type Kind = (typeof KINDS)[number];

/** One step of a batch, e.g. the first and second fermentation of kombucha. Days at REFERENCE_TEMPERATURE. */
export interface Stage {
  label: string;
  /** Ready to taste after `from`, at its best until `to`. */
  readyDays: { from: number; to: number };
  /** After this it is past its best. */
  overripeDays: number;
  /** Gas builds up in a closed jar: wants a burp this often while it works. */
  burpHours?: number;
  /** Label of the button that moves on to the next stage. */
  next?: string;
}

interface KindBase {
  label: string;
  emoji: string;
  /** One line for the picker. */
  blurb: string;
}

export type KindRules =
  | (KindBase & { family: "keep" })
  | (KindBase & { family: "batch"; stages: readonly [Stage, ...Stage[]]; defaultTemperature: number });

/** Batch days are given at this room temperature; 10 °C warmer roughly halves them. */
export const REFERENCE_TEMPERATURE = 20;

export const KIND_RULES: Record<Kind, KindRules> = {
  sourdough: {
    family: "keep",
    label: "Sauerteig",
    emoji: "🍞",
    blurb: "Lebt dauerhaft, will regelmäßig gefüttert werden.",
  },
  kimchi: {
    family: "batch",
    label: "Kimchi",
    emoji: "🌶️",
    blurb: "3 bis 14 Tage, will täglich entlüftet werden.",
    defaultTemperature: 20,
    stages: [{ label: "Gärung", readyDays: { from: 3, to: 14 }, overripeDays: 30, burpHours: 24 }],
  },
  sauerkraut: {
    family: "batch",
    label: "Sauerkraut",
    emoji: "🥬",
    blurb: "2 bis 6 Wochen unter Salzlake, mit Gärspund.",
    defaultTemperature: 20,
    stages: [{ label: "Gärung", readyDays: { from: 14, to: 42 }, overripeDays: 90 }],
  },
  kombucha: {
    family: "batch",
    label: "Kombucha",
    emoji: "🫖",
    blurb: "1. Gärung 7 bis 12 Tage, dann 2 bis 4 Tage in Flaschen.",
    defaultTemperature: 22,
    stages: [
      { label: "1. Gärung", readyDays: { from: 7, to: 12 }, overripeDays: 21, next: "In Flaschen abgefüllt" },
      { label: "2. Gärung", readyDays: { from: 2, to: 4 }, overripeDays: 7, burpHours: 24 },
    ],
  },
};

export const rules = (kind: Kind) => KIND_RULES[kind];
export const isKind = (value: string): value is Kind => (KINDS as readonly string[]).includes(value);
