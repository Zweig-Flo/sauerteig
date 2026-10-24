// All kinds, in the order of the picker's groups.
import { CONDIMENTS } from "./condiments.ts";
import { DAIRY } from "./dairy.ts";
import { DRINKS } from "./drinks.ts";
import { FRUIT } from "./fruit.ts";
import { GRAIN } from "./grain.ts";
import { KOJI } from "./koji.ts";
import { VEGETABLES } from "./vegetables.ts";

export const CATALOG = { ...VEGETABLES, ...DRINKS, ...DAIRY, ...GRAIN, ...KOJI, ...CONDIMENTS, ...FRUIT };
