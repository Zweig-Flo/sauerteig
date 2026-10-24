// The kinds of ferments: rules, recipe, care and look. The entries live in shared/catalog/, one file per group; a new
// kind is one entry there, its pet is drawn from `look` in web/src/pet.tsx.

import { CATALOG } from "./catalog/index.ts";

/** "keep" is fed with flour and water, "culture" lives on and gets tended on a rhythm, "batch" ripens until done. */
export type Family = "keep" | "culture" | "batch";

export type Group = "vegetables" | "drinks" | "dairy" | "grain" | "koji" | "condiments" | "fruit";

/** In the order of the picker. */
export const GROUPS: readonly { id: Group; label: string }[] = [
  { id: "vegetables", label: "Gemüse" },
  { id: "drinks", label: "Getränke" },
  { id: "dairy", label: "Milch" },
  { id: "grain", label: "Brot und Getreide" },
  { id: "koji", label: "Koji und Bohnen" },
  { id: "condiments", label: "Würzen und Saucen" },
  { id: "fruit", label: "Obst" },
];

export type Vessel = "jar" | "bottle" | "carboy" | "cup" | "bowl" | "tray" | "block" | "tub";
export type Cover = "lid" | "cloth" | "airlock" | "none";
export type Motif =
  | "dough"
  | "ball"
  | "cabbage"
  | "kimchi"
  | "radish"
  | "cucumber"
  | "carrot"
  | "florets"
  | "radishes"
  | "beans"
  | "chili"
  | "salsa"
  | "tomato"
  | "lemon"
  | "plum"
  | "scoby"
  | "grains"
  | "rice"
  | "soy"
  | "threads"
  | "honey"
  | "berries"
  | "apple"
  | "pineapple"
  | "ginger"
  | "bread"
  | "beet"
  | "flower"
  | "seeds"
  | "bran"
  | "sprouts"
  | "holes"
  | "raisins"
  | "spoon"
  | "ropes"
  | "swirl"
  | "curds"
  | "stone";

/** How the pet looks: what it lives in, the colour of its contents and what floats in them. */
export interface Look {
  vessel: Vessel;
  /** Defaults to a lid on jars and bottles, nothing on the rest. */
  cover?: Cover;
  /** Contents, as #rrggbb; mixed with food's surface so it follows dark mode. */
  color: string;
  /** The motif's colour; defaults to the contents'. */
  accent?: string;
  motif?: Motif;
  /** Dark contents: the face is drawn light. */
  dark?: boolean;
}

export interface Ingredient {
  amount: string;
  item: string;
}

export interface Recipe {
  /** What it yields, e.g. "1 Glas, 1 l". */
  makes: string;
  ingredients: readonly Ingredient[];
  steps: readonly string[];
}

/** A checked page the recipe follows, in our own words. */
export interface Source {
  name: string;
  url: string;
}

/** A recurring touch while a stage works: burping a closed jar, stirring, turning. */
export interface Tend {
  everyHours: number;
  /** What to do, for the list of things due: "Entlüften". */
  todo: string;
  /** What was done, for the button and the log: "Entlüftet". */
  done: string;
  /** In the pet's voice when it is due. */
  says: string;
}

/** One step of a batch, e.g. the first and second fermentation of kombucha. Days at the kind's default temperature. */
export interface Stage {
  label: string;
  /** Ready to use after `from`, at its best until `to`. */
  readyDays: { from: number; to: number };
  /** After this it is past its best. */
  overripeDays: number;
  tend?: Tend;
  /** Label of the button that moves on to the next stage. */
  next?: string;
  /** Spent in the fridge, a cellar or the sun: the days hold as given, the room temperature doesn't count. */
  fixed?: boolean;
  /** Moves into another vessel, e.g. kombucha into bottles. */
  vessel?: Vessel;
}

/** How a culture is tended: hours at its default temperature, days in the fridge. */
export interface Feed {
  /** What was done, for the button and the log: "Neu angesetzt". */
  done: string;
  /** What to do when it is hungry: "Abseihen und neu ansetzen". */
  todo: string;
  /** What to do when it is ready, if that differs from `todo`. */
  readyTodo?: string;
  readyHours: number;
  hungryHours: number;
  starvingHours: number;
  fridgeDays: { hungry: number; starving: number };
  /** A fresh batch starts at room temperature, so tending it takes it out of the fridge. */
  leavesFridge?: boolean;
}

/** A variation of a kind, picked when it is set up; anything it leaves out comes from the kind. */
export interface Variant {
  /** kebab-case, stored with the ferment. */
  id: string;
  label: string;
  blurb: string;
  /** Replaces the kind's fields one by one, e.g. only the ingredients. */
  recipe?: Partial<Recipe>;
  care?: readonly string[];
  source?: Source;
  look?: Partial<Look>;
  /** Batch only. */
  stages?: readonly [Stage, ...Stage[]];
  defaultTemperature?: number;
  /** Culture only. */
  feed?: Partial<Feed>;
  /** Keep only: what the form suggests. */
  flour?: string;
  hydration?: number;
}

interface KindBase {
  label: string;
  emoji: string;
  /** One line for the picker. */
  blurb: string;
  group: Group;
  /** Name of the plain recipe next to the variants; defaults to "Klassisch". */
  baseLabel?: string;
  look: Look;
  recipe: Recipe;
  /** What to watch and do while it works. */
  care: readonly string[];
  source: Source;
  variants?: readonly Variant[];
}

export type KindRules =
  | (KindBase & { family: "keep"; flour: string; hydration: number })
  | (KindBase & { family: "culture"; feed: Feed; defaultTemperature: number })
  | (KindBase & { family: "batch"; stages: readonly [Stage, ...Stage[]]; defaultTemperature: number });

export type Kind = keyof typeof CATALOG;
export const KIND_RULES: Record<Kind, KindRules> = CATALOG;
export const KINDS = Object.keys(KIND_RULES) as [Kind, ...Kind[]];

export const rules = (kind: Kind) => KIND_RULES[kind];
export const isKind = (value: string): value is Kind => Object.hasOwn(KIND_RULES, value);

export function variantOf(kind: Kind, id: string | null | undefined): Variant | null {
  if (!id) return null;
  return KIND_RULES[kind].variants?.find((variant) => variant.id === id) ?? null;
}

export const isVariant = (kind: Kind, id: string) => variantOf(kind, id) !== null;

/** Recipe, care, source and look of a kind with its variant applied. */
export function resolve(kind: Kind, variant?: string | null) {
  const kindRules = KIND_RULES[kind];
  const chosen = variantOf(kind, variant);
  return {
    label: kindRules.label,
    /** The variant's name, or the plain recipe's when the kind has variants. */
    variantLabel: chosen?.label ?? (kindRules.variants?.length ? (kindRules.baseLabel ?? "Klassisch") : null),
    recipe: { ...kindRules.recipe, ...chosen?.recipe } as Recipe,
    care: chosen?.care ?? kindRules.care,
    source: chosen?.source ?? kindRules.source,
    look: { ...kindRules.look, ...chosen?.look } as Look,
  };
}

export function stagesOf(kind: Kind, variant?: string | null): readonly [Stage, ...Stage[]] {
  const kindRules = KIND_RULES[kind];
  if (kindRules.family !== "batch") throw new Error(`${kind} ist keine Charge`);
  return variantOf(kind, variant)?.stages ?? kindRules.stages;
}

export function feedOf(kind: Kind, variant?: string | null): Feed {
  const kindRules = KIND_RULES[kind];
  if (kindRules.family !== "culture") throw new Error(`${kind} ist keine Kultur`);
  return { ...kindRules.feed, ...variantOf(kind, variant)?.feed };
}

/** The room temperature its days are given at; null for what gets fed with flour. */
export function temperatureOf(kind: Kind, variant?: string | null): number | null {
  const kindRules = KIND_RULES[kind];
  if (kindRules.family === "keep") return null;
  return variantOf(kind, variant)?.defaultTemperature ?? kindRules.defaultTemperature;
}

/** What the form suggests for flour and hydration. */
export function starterOf(kind: Kind, variant?: string | null) {
  const kindRules = KIND_RULES[kind];
  if (kindRules.family !== "keep") return null;
  const chosen = variantOf(kind, variant);
  return { flour: chosen?.flour ?? kindRules.flour, hydration: chosen?.hydration ?? kindRules.hydration };
}

/** How much slower than at `reference`: 10 °C cooler doubles the time. */
export const slowdown = (temperature: number, reference: number) => 2 ** ((reference - temperature) / 10);
