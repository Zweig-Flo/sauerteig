// Fruit in salt.
import type { KindRules } from "../kinds.ts";
import { fridge } from "./parts.ts";

export const FRUIT = {
  "preserved-lemons": {
    family: "batch",
    group: "fruit",
    label: "Salzzitronen",
    emoji: "🍋",
    blurb: "Zitronen in Salz und Saft, mindestens 3 Wochen.",
    defaultTemperature: 18,
    look: { vessel: "jar", color: "#f3dc6b", accent: "#e2ab12", motif: "lemon" },
    recipe: {
      makes: "1 Glas, 500 ml",
      ingredients: [
        { amount: "3", item: "kleine Bio-Zitronen" },
        { amount: "60 g", item: "grobes Salz, Meer- oder Einmachsalz" },
        { amount: "etwa 160 ml", item: "frisch gepresster Zitronensaft" },
      ],
      steps: [
        "Zitronen längs vierteln und mit dem Salz mischen.",
        "In ein sauberes Glas mit weiter Öffnung drücken; auf halber Höhe Salz dazwischenstreuen, dann die übrigen Viertel und den Rest Salz.",
        "Mit Zitronensaft auffüllen, bis alles bedeckt ist, und verschließen.",
        "Kühl und dunkel mindestens drei Wochen ziehen lassen.",
        "Alle 3 bis 4 Tage das Glas für ein paar Stunden auf den Kopf stellen und wieder umdrehen.",
        "Fertig, wenn die Schale weich ist und sich leicht vom Fruchtfleisch löst. Angebrochen im Kühlschrank bis zu einem Jahr.",
      ],
    },
    care: [
      "Die Zitronen müssen mit Saft bedeckt bleiben.",
      "Meist nimmt man nur die Schale: abspülen und das Fruchtfleisch entfernen.",
      "Lieber länger warten: Die weiße Haut verliert mit der Zeit ihre Bitterkeit.",
    ],
    source: { name: "What's Cooking America: Preserved Lemons", url: "https://whatscookingamerica.net/karencalanchini/preservedlemons.htm" },
    stages: [
      {
        label: "Ziehen",
        readyDays: { from: 21, to: 42 },
        overripeDays: 120,
        tend: {
          everyHours: 84,
          todo: "Wenden",
          done: "Gewendet",
          says: "Stell mich kurz auf den Kopf, damit sich Salz und Saft verteilen.",
        },
        next: "In den Kühlschrank gestellt",
      },
      fridge(365, 400),
    ],
  },

  umeboshi: {
    family: "batch",
    group: "fruit",
    label: "Umeboshi",
    emoji: "🍑",
    blurb: "Salzpflaumen mit Shiso: einsalzen, in der Sonne trocknen, reifen.",
    defaultTemperature: 20,
    look: { vessel: "jar", color: "#efb2b0", accent: "#c8323f", motif: "plum" },
    recipe: {
      makes: "etwa 1,5 kg",
      ingredients: [
        { amount: "3 kg", item: "vollreife Ume, gelb mit rötlichem Hauch" },
        { amount: "540 g", item: "grobes Meersalz (18 % der Ume)" },
        { amount: "120 ml", item: "Shochu oder Wodka mit mindestens 35 % zum Auswischen" },
        { amount: "nach Wunsch", item: "600 g rote Shiso-Blätter und 108 g Salz dafür" },
      ],
      steps: [
        "Ume waschen, die Stielansätze mit einem Holzspieß herauslösen und vollständig trocknen. Beschädigte Früchte aussortieren.",
        "Gefäß und Abdeckplatte mit dem Schnaps auswischen.",
        "Ume und Salz abwechselnd einschichten, mit Salz beginnen und enden.",
        "Mit einer Platte abdecken und mit dem doppelten Ume-Gewicht beschweren, kühl und dunkel stellen.",
        "Nach etwa 7 Tagen steht der Saft (Umezu) über den Früchten: das Gewicht auf etwa das Ume-Gewicht verringern.",
        "Nach rund 2 Wochen die Shiso mit der halben Salzmenge kneten, den dunklen Saft ausdrücken und wegschütten, mit dem Rest Salz wiederholen. Mit einer Tasse Umezu mischen und über die Ume geben.",
        "Etwa einen Monat später drei sonnige Tage abwarten: Ume tagsüber auf Bambusmatten in die Sonne legen, abends hereinholen, morgens wenden.",
        "In ein sauberes Glas füllen und mindestens 3, besser 6 bis 12 Monate reifen lassen.",
      ],
    },
    care: [
      "Das Salz nicht unter 18 % senken und die Ume immer im Umezu halten, sonst droht Schimmel.",
      "Salzkristalle sind hart und lösen sich in Wasser, Schimmel ist pelzig oder pudrig.",
      "Schimmel mit einem sterilen Löffel entfernen und die Stelle mit hochprozentigem Alkohol abwischen.",
      "Trübes, rosa Umezu ohne Schimmel und Fehlgeruch ist harmlos.",
    ],
    source: { name: "Just One Cookbook: How to Make Umeboshi", url: "https://www.justonecookbook.com/how-to-make-umeboshi/" },
    stages: [
      {
        label: "Einsalzen",
        readyDays: { from: 30, to: 45 },
        overripeDays: 75,
        tend: {
          everyHours: 72,
          todo: "Nachsehen",
          done: "Nachgesehen",
          says: "Schau, ob ich ganz im Umezu liege, und heb Schimmel ab.",
        },
        next: "Zum Trocknen ausgelegt",
      },
      { label: "Sonnentrocknen", readyDays: { from: 3, to: 4 }, overripeDays: 7, fixed: true, next: "Ins Glas gefüllt" },
      { label: "Reifen", readyDays: { from: 90, to: 365 }, overripeDays: 1095, fixed: true },
    ],
  },
} satisfies Record<string, KindRules>;
