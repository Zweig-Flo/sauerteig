import assert from "node:assert/strict";
import { test } from "node:test";
import { GROUPS, KIND_RULES, KINDS, resolve, type Stage } from "../shared/kinds.ts";

const entries = KINDS.map((kind) => [kind, KIND_RULES[kind]] as const);

test("more than 50 ferments, counting the variants", () => {
  const count = entries.reduce((sum, [, kind]) => sum + 1 + (kind.variants?.length ?? 0), 0);
  assert.ok(count >= 50, `nur ${count}`);
});

test("every kind and variant has a recipe, care and a source", () => {
  for (const [kind, rules] of entries) {
    assert.ok(GROUPS.some((group) => group.id === rules.group), kind);
    assert.match(rules.look.color, /^#[0-9a-f]{6}$/, kind);
    for (const variant of [null, ...(rules.variants ?? []).map((v) => v.id)]) {
      const { recipe, care, source } = resolve(kind, variant);
      const name = `${kind} ${variant ?? ""}`;
      assert.ok(recipe.makes && recipe.ingredients.length > 0 && recipe.steps.length > 0, name);
      assert.ok(care.length > 0, name);
      assert.ok(source.name, name);
      assert.match(source.url, /^https:\/\/[^\s]+$/, name);
    }
  }
});

test("variants: unique kebab-case ids, fields that fit the family", () => {
  for (const [kind, rules] of entries) {
    const ids = (rules.variants ?? []).map((v) => v.id);
    assert.equal(new Set(ids).size, ids.length, kind);
    for (const variant of rules.variants ?? []) {
      assert.match(variant.id, /^[a-z]+(-[a-z]+)*$/, `${kind} ${variant.id}`);
      if (variant.stages) assert.equal(rules.family, "batch", `${kind} ${variant.id}`);
      if (variant.feed) assert.equal(rules.family, "culture", `${kind} ${variant.id}`);
      if (variant.flour || variant.hydration) assert.equal(rules.family, "keep", `${kind} ${variant.id}`);
    }
  }
});

test("stages and rhythms make sense", () => {
  const check = (name: string, stage: Stage) => {
    assert.ok(stage.readyDays.from >= 0 && stage.readyDays.from <= stage.readyDays.to, name);
    assert.ok(stage.readyDays.to <= stage.overripeDays, name);
    if (stage.tend) assert.ok(stage.tend.everyHours > 0 && stage.tend.todo && stage.tend.done && stage.tend.says, name);
  };
  for (const [kind, rules] of entries) {
    if (rules.family === "batch") {
      for (const stages of [rules.stages, ...(rules.variants ?? []).map((v) => v.stages ?? [])]) {
        stages.forEach((stage, i) => {
          check(`${kind} ${stage.label}`, stage);
          // Only the last stage may lack a way on.
          if (i < stages.length - 1) assert.ok(stage.next, `${kind} ${stage.label}`);
        });
      }
    }
    if (rules.family === "culture") {
      const { readyHours, hungryHours, starvingHours, fridgeDays } = rules.feed;
      assert.ok(readyHours < hungryHours && hungryHours < starvingHours, kind);
      assert.ok(fridgeDays.hungry < fridgeDays.starving, kind);
    }
  }
});

test("a variant replaces what it brings and keeps the rest", () => {
  const radish = resolve("kimchi", "kkakdugi");
  assert.equal(radish.variantLabel, "Kkakdugi");
  assert.match(radish.source.url, /kkakdugi/);
  assert.notDeepEqual(radish.recipe.ingredients, KIND_RULES.kimchi.recipe.ingredients);
  assert.deepEqual(radish.care, KIND_RULES.kimchi.care);
  assert.equal(radish.look.vessel, "jar");
  assert.equal(radish.look.motif, "radish");
  assert.equal(resolve("kimchi").variantLabel, "Chinakohl");
  assert.equal(resolve("mustard").variantLabel, null);
});
