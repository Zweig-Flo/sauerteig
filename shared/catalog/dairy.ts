// Milk with a culture: warm like yogurt, at room temperature like viili, or living on like kefir.
import type { KindRules } from "../kinds.ts";
import { fridge, hours } from "./parts.ts";

const YOGURT_STEPS = [
  "Milch langsam auf 82 bis 85 °C erhitzen und dabei ab und zu rühren, damit nichts anbrennt.",
  "Vom Herd nehmen und auf 42 bis 46 °C abkühlen lassen.",
  "Eine Tasse Milch abnehmen, den Joghurt darin glatt rühren und zurück in den Topf rühren.",
  "In Gläser füllen und abdecken.",
  "Bei 42 bis 46 °C 6 bis 10 Stunden ungestört bebrüten: im Ofen, der zwischendurch kurz angeht, in einer Kühlbox mit warmem Wasser oder im Joghurtbereiter.",
];

const VIILI_STEPS = (culture: string) => [
  "Milch aufkochen und vollständig auf Zimmertemperatur abkühlen lassen.",
  `Mit dem ganzen Beutel ${culture} in ein sauberes Glas rühren, abdecken, aber nicht luftdicht verschließen.`,
  "24 bis 72 Stunden bei Zimmertemperatur stehen lassen, bis die Milch dick wird.",
  "Für jeden neuen Ansatz 1 EL davon pro 500 ml frische Milch einrühren und 12 bis 48 Stunden bei Zimmertemperatur dick werden lassen.",
  "Gut durchkühlen, bevor du ihn isst, und etwas für den nächsten Ansatz zurückbehalten.",
];

export const DAIRY = {
  yogurt: {
    family: "batch",
    group: "dairy",
    label: "Joghurt",
    emoji: "🥣",
    blurb: "Milch mit Starter, 6 bis 10 Stunden bei 42 bis 46 °C.",
    baseLabel: "Naturjoghurt",
    defaultTemperature: 44,
    look: { vessel: "cup", color: "#f7f3ea", accent: "#aab3bb", motif: "spoon" },
    recipe: {
      makes: "1 l",
      ingredients: [
        { amount: "1 l", item: "Milch" },
        { amount: "2 EL", item: "Naturjoghurt mit lebenden Kulturen als Starter" },
      ],
      steps: [...YOGURT_STEPS, "Sobald er fest ist, in den Kühlschrank stellen und innerhalb von 14 Tagen essen."],
    },
    care: [
      "Gekauften Joghurt vor dem Mindesthaltbarkeitsdatum als Starter nehmen, eigenen innerhalb von 5 bis 7 Tagen.",
      "Nicht rühren oder schütteln, solange er dick wird.",
      "Zu lange warm wird er sauer und trennt sich; zu kalt oder zu heiß wird er nicht fest.",
      "Kleine Gläser werden schneller fest als ein großes.",
    ],
    source: {
      name: "University of Illinois Extension: Making Yogurt at Home",
      url: "https://extension.illinois.edu/sites/default/files/2024-05/yogurt_final.pdf",
    },
    stages: [
      { label: "Bebrüten", readyDays: { from: hours(6), to: hours(10) }, overripeDays: hours(14), next: "In den Kühlschrank gestellt" },
      fridge(14, 16),
    ],
    variants: [
      {
        id: "griechisch",
        label: "Griechischer Joghurt",
        blurb: "Fertigen Joghurt im Tuch abtropfen lassen, cremig und fest.",
        recipe: {
          steps: [
            ...YOGURT_STEPS,
            "Den festen Joghurt in ein mit einem Tuch ausgelegtes Sieb geben und im Kühlschrank 2 bis 8 Stunden abtropfen lassen, je nachdem, wie fest er werden soll.",
            "Die Molke auffangen: Sie eignet sich als Starter für Gemüse oder Ketchup.",
          ],
        },
        stages: [
          { label: "Bebrüten", readyDays: { from: hours(6), to: hours(10) }, overripeDays: hours(14), next: "Zum Abtropfen gehängt" },
          { label: "Abtropfen", readyDays: { from: hours(2), to: hours(8) }, overripeDays: 1, fixed: true, next: "In den Kühlschrank gestellt" },
          fridge(14, 16),
        ],
      },
      {
        id: "labneh",
        label: "Labneh",
        blurb: "Gesalzener Joghurt, 24 bis 36 Stunden abgetropft: ein Frischkäse.",
        look: { vessel: "bowl", color: "#efe6cf", accent: "#e2cfa0", motif: "curds" },
        recipe: {
          makes: "etwa 250 g",
          ingredients: [
            { amount: "500 g", item: "Vollmilchjoghurt, selbst gemacht oder gekauft" },
            { amount: "½ TL", item: "Salz" },
            { amount: "zum Servieren", item: "Olivenöl, Pfeffer, Za'atar oder Kräuter" },
          ],
          steps: [
            "Joghurt mit dem Salz verrühren.",
            "Ein Sieb mit Gaze oder einem Mulltuch auslegen, den Joghurt hineingeben und das Tuch zusammenbinden.",
            "Über einer Schüssel 24 bis 36 Stunden im Kühlschrank abtropfen lassen; das Sieb darf nicht in der Molke stehen.",
            "Je länger, desto fester. Mit Olivenöl, Pfeffer und Kräutern servieren oder zu Kugeln formen.",
          ],
        },
        source: { name: "SRF: Labneh selber machen", url: "https://www.srf.ch/radio-srf-1/kochen/rezepte/labneh" },
        stages: [
          { label: "Abtropfen", readyDays: { from: 1, to: 1.5 }, overripeDays: 3, fixed: true, next: "In den Kühlschrank gestellt" },
          fridge(7, 10),
        ],
      },
    ],
  },

  "milk-kefir": {
    family: "culture",
    group: "dairy",
    label: "Milchkefir",
    emoji: "🥛",
    blurb: "Knollen in Milch, alle 24 bis 48 Stunden neu ansetzen.",
    defaultTemperature: 21,
    look: { vessel: "jar", cover: "cloth", color: "#f6f2e8", accent: "#ead9b0", motif: "grains" },
    recipe: {
      makes: "500 ml",
      ingredients: [
        { amount: "8 g", item: "Kefirknollen" },
        { amount: "500 ml", item: "Bio-Milch, H-Milch oder abgekocht" },
      ],
      steps: [
        "Knollen mit der Milch in ein sauberes Glas geben.",
        "Mit einem Tuch und Gummiband abdecken und lichtgeschützt bei Zimmertemperatur stehen lassen.",
        "Nach 24 bis 48 Stunden durch ein Kunststoffsieb in eine Flasche gießen.",
        "Knollen vorsichtig lauwarm abspülen und sofort mit frischer Milch neu ansetzen.",
        "Den Kefir im Kühlschrank aufbewahren.",
      ],
    },
    care: [
      "Kein Metall, und die Knollen nicht mit den Fingern anfassen.",
      "Pause bis zu einem Monat: Knollen mit Milch bedeckt verschlossen in den Kühlschrank.",
      "Länger: abtrocknen, mit Milchpulver bestreuen und einfrieren. Danach mit täglichem Milchwechsel wieder aufwecken.",
      "Pausen sind Stress für die Knollen, lieber jemanden füttern lassen.",
    ],
    source: {
      name: "Utopia: Kefir selber machen",
      url: "https://utopia.de/ratgeber/kefir-selber-machen-einfaches-schritt-fuer-schritt-rezept_77918/",
    },
    feed: {
      done: "Neu angesetzt",
      todo: "Abseihen und neu ansetzen",
      readyHours: 24,
      hungryHours: 48,
      starvingHours: 72,
      fridgeDays: { hungry: 21, starving: 30 },
    },
  },

  viili: {
    family: "culture",
    group: "dairy",
    label: "Viili",
    emoji: "🫗",
    blurb: "Fadenziehender Joghurt bei Zimmertemperatur, wöchentlich neu.",
    defaultTemperature: 21,
    look: { vessel: "cup", color: "#f4efe2", accent: "#aab3bb", motif: "ropes" },
    recipe: {
      makes: "1 l",
      ingredients: [
        { amount: "1 Beutel", item: "Viili-Starterkultur, gefriergetrocknet" },
        { amount: "150 ml", item: "Vollmilch zum Aktivieren" },
        { amount: "1 EL pro 500 ml", item: "Viili für jeden weiteren Ansatz, dazu frische Vollmilch" },
      ],
      steps: VIILI_STEPS("Viili-Starter"),
    },
    care: [
      "Den Starter höchstens 7 Tage alt werden lassen, also mindestens wöchentlich neu ansetzen.",
      "Wärmer geht es schneller, kühler langsamer.",
      "Vollmilch gibt den besten Geschmack. Wer Pflanzenmilch nimmt, behält eine Milch-Kultur in Reserve.",
      "Fertig im Kühlschrank bis zu 7 Tage haltbar.",
    ],
    source: {
      name: "Freshly Fermented: Viili Yoghurt Starter Instructions",
      url: "https://freshlyfermented.co.uk/instructions/viili-yoghurt-starter-instructions/",
    },
    feed: {
      done: "Neu angesetzt",
      todo: "Neu ansetzen",
      readyTodo: "In den Kühlschrank stellen",
      readyHours: 18,
      hungryHours: 48,
      starvingHours: 96,
      fridgeDays: { hungry: 6, starving: 10 },
      leavesFridge: true,
    },
    variants: [
      {
        id: "filmjoelk",
        label: "Filmjölk",
        blurb: "Schwedische Sauermilch, dünner und mild-säuerlich.",
        look: { motif: "spoon" },
        recipe: {
          ingredients: [
            { amount: "1 Beutel", item: "Filmjölk-Starterkultur" },
            { amount: "150 ml", item: "Vollmilch zum Aktivieren" },
            { amount: "1 EL pro 500 ml", item: "Filmjölk für jeden weiteren Ansatz, dazu frische Vollmilch" },
          ],
          steps: VIILI_STEPS("Filmjölk-Starter"),
        },
        source: {
          name: "Revolution Fermentation: Mesophilic Yogurt",
          url: "https://revolutionfermentation.com/en/blogs/yogurt/mesophilic-yogurt-recipes-viili-matsoni-filmjolk-piima/",
        },
      },
    ],
  },

  "creme-fraiche": {
    family: "batch",
    group: "dairy",
    label: "Crème fraîche",
    emoji: "🥄",
    blurb: "Sahne mit Buttermilch, etwa 24 Stunden bei Zimmertemperatur.",
    defaultTemperature: 21,
    look: { vessel: "jar", color: "#f3ead2", accent: "#fbf6ea", motif: "swirl" },
    recipe: {
      makes: "etwa 300 ml",
      ingredients: [
        { amount: "250 ml", item: "Sahne mit 33 bis 35 % Fett" },
        { amount: "45 ml", item: "Buttermilch oder saure Sahne" },
      ],
      steps: [
        "Sahne und Buttermilch in einer Schüssel verrühren.",
        "Mit einem fusselfreien Tuch abdecken und bei 20 bis 22 °C etwa 24 Stunden stehen lassen, bis sie dick ist.",
        "Riechen: frisch und nussig ist richtig.",
        "Glatt rühren, luftdicht abdecken und etwa 8 Stunden kalt stellen; innerhalb einer Woche verbrauchen.",
      ],
    },
    care: [
      "Riecht sie stark sauer oder seltsam, wegwerfen.",
      "Ultrahocherhitzte Sahne wird oft nicht dick.",
      "Kühler dauert es bis zu 36 Stunden.",
    ],
    source: {
      name: "Dairy Farmers of Canada: Crème fraîche",
      url: "https://dairyfarmersofcanada.ca/en/canadian-goodness/recipes/creme-fraiche",
    },
    stages: [
      { label: "Dicklegen", readyDays: { from: 1, to: 1.5 }, overripeDays: 2.5, next: "In den Kühlschrank gestellt" },
      fridge(7, 10),
    ],
    variants: [
      {
        id: "buttermilch",
        label: "Buttermilch",
        blurb: "Milch mit etwas Buttermilch, nach 24 Stunden dick, immer wieder neu.",
        look: { vessel: "bottle", color: "#f6f1e4", motif: undefined },
        recipe: {
          makes: "1 l",
          ingredients: [
            { amount: "1 l", item: "Vollmilch" },
            { amount: "60 ml", item: "gekaufte Buttermilch als Starter" },
          ],
          steps: [
            "Milch und Buttermilch in ein sauberes Glas geben und umrühren.",
            "Den Deckel nur auflegen, nicht zuschrauben.",
            "Etwa 24 Stunden bei Zimmertemperatur stehen lassen.",
            "Verschließen und in den Kühlschrank stellen; dort hält sie bis zu zwei Wochen.",
            "60 ml davon als Starter für die nächste Runde aufheben.",
          ],
        },
        care: ["Klumpen oder Schimmel: wegwerfen.", "Eingefroren als Würfel etwa sechs Monate haltbar."],
        source: { name: "Homesteading Family: Cultured Buttermilk", url: "https://homesteadingfamily.com/cultured-buttermilk-recipe/" },
        stages: [
          { label: "Dicklegen", readyDays: { from: 1, to: 1.5 }, overripeDays: 2, next: "In den Kühlschrank gestellt" },
          fridge(14, 18),
        ],
      },
      {
        id: "quark",
        label: "Quark",
        blurb: "Milch mit Buttermilch dicklegen und im Tuch abtropfen.",
        look: { vessel: "bowl", color: "#f7f2e6", accent: "#ebdcb4", motif: "curds" },
        recipe: {
          makes: "etwa 250 g",
          ingredients: [
            { amount: "1 l", item: "Frischmilch, keine H-Milch" },
            { amount: "80 ml", item: "Buttermilch" },
          ],
          steps: [
            "Milch und Buttermilch in einer Schüssel mit Deckel verrühren und verschließen.",
            "Zwei volle Tage bei Zimmertemperatur reifen lassen.",
            "Die Schüssel im Ofen bei 30 bis 35 °C etwa zwei Stunden warm stellen; dabei trennt sich die Molke.",
            "Ein Sieb mit einem Küchentuch auslegen, den Inhalt hindurchgießen und abtropfen lassen.",
            "Den Quark im Kühlschrank aufbewahren und innerhalb von etwa fünf Tagen essen.",
          ],
        },
        care: ["Riecht er faulig oder zeigt Schimmel, wegwerfen.", "Die Molke eignet sich als Starter für Gemüse."],
        source: {
          name: "Utopia: Quark selber machen",
          url: "https://utopia.de/ratgeber/quark-selber-machen-schnellrezept-mit-nur-zwei-zutaten_106067/",
        },
        stages: [
          { label: "Dicklegen", readyDays: { from: 2, to: 2.5 }, overripeDays: 4, next: "Abgetropft" },
          fridge(5, 7),
        ],
      },
    ],
  },
} satisfies Record<string, KindRules>;
