// Starters and batters from flour and grain.
import type { KindRules } from "../kinds.ts";
import { fridge, hours } from "./parts.ts";

export const GRAIN = {
  sourdough: {
    family: "keep",
    group: "grain",
    label: "Sauerteig",
    emoji: "🍞",
    blurb: "Lebt dauerhaft, will regelmäßig gefüttert werden.",
    baseLabel: "Roggen",
    flour: "Roggenvollkorn",
    hydration: 100,
    look: { vessel: "jar", color: "#e2c48e", accent: "#a8834a", motif: "dough" },
    recipe: {
      makes: "etwa 150 g Anstellgut",
      ingredients: [
        { amount: "90 g", item: "Roggenvollkornmehl oder Type 1370, verteilt auf 5 Tage" },
        { amount: "160 ml", item: "lauwarmes Wasser, verteilt auf 4 Tage" },
      ],
      steps: [
        "Ein Glas heiß ausspülen. Tag 1: 20 g Roggenmehl mit 40 ml lauwarmem Wasser glatt rühren.",
        "Abdecken, aber nicht luftdicht verschließen, und bei etwa 24 °C warm stellen.",
        "Tag 2 bis 4: jeden Tag weitere 20 g Mehl und 40 ml Wasser einrühren.",
        "Tag 5: 10 g Mehl unterrühren. Reif ist er, wenn er deutlich gewachsen ist, sich leicht wölbt und sauer-aromatisch, aber nicht nach Essig riecht.",
        "Zum Backen auffrischen: Anstellgut mit 240 g Mehl und 240 ml Wasser mischen und etwa 16 Stunden bei Zimmertemperatur reifen lassen. 30 g als neues Anstellgut abnehmen, den Rest in den Brotteig.",
      ],
    },
    care: [
      "Im Kühlschrank bei etwa 5 °C hält das Anstellgut rund zwei Wochen, danach wieder auffrischen.",
      "Überreif ist er, wenn die Oberfläche eingefallen und angetrocknet ist.",
      "Tipp auf „Jetzt am Höhepunkt“, wenn er oben steht: Dann lernt er, wann er seinen Höhepunkt hat.",
      "Schimmel: wegwerfen und neu ansetzen.",
    ],
    source: {
      name: "AOK: Sauerteig verleiht Brot Geschmack und Lockerheit",
      url: "https://www.aok.de/pk/magazin/ernaehrung/lebensmittel/sauerteig-verleiht-brot-geschmack-und-lockerheit/",
    },
    variants: [
      {
        id: "weizen",
        label: "Weizensauerteig",
        blurb: "Mild-säuerlich, für Weizenbrote und Baguettes.",
        flour: "Weizen 550",
        hydration: 90,
        look: { color: "#efdcae" },
        recipe: {
          ingredients: [
            { amount: "90 g", item: "Weizenvollkornmehl für den Start" },
            { amount: "160 ml", item: "lauwarmes Wasser für den Start" },
            { amount: "danach", item: "Weizenmehl Type 550 und Wasser zum Füttern" },
          ],
          steps: [
            "Wie beim Roggen ansetzen, aber mit Weizenvollkornmehl: Tag 1 20 g Mehl mit 40 ml lauwarmem Wasser, abgedeckt bei etwa 24 °C.",
            "Tag 2 bis 4 täglich 20 g Mehl und 40 ml Wasser einrühren, an Tag 5 noch 10 g Mehl.",
            "Danach mit hellem Mehl füttern, etwa gleiche Teile Mehl und Wasser (TA 190 bis 200).",
            "Die Menge Anstellgut steuert die Reifezeit: 2 % für etwa 18 Stunden, 5 % für 15, 10 % für 12 Stunden; ideal sind 23 bis 26 °C.",
          ],
        },
        care: [
          "Im Kühlschrank aufbewahren; bei Zimmertemperatur frisst er sich schnell ab.",
          "Wird er schwach, mit 5 % Roggen- und 95 % Weizenmehl auffrischen.",
          "Zum Backen nimmt man ihn bei 80 bis 90 % Reife.",
        ],
        source: { name: "Homebaking Blog: Weizensauerteig", url: "https://www.homebaking.at/weizensauerteig/" },
      },
      {
        id: "lievito-madre",
        label: "Lievito Madre",
        blurb: "Fester italienischer Weizensauer, Mehl zu Wasser 2:1.",
        flour: "Weizen 550",
        hydration: 50,
        look: { color: "#f0e2bf", motif: "ball" },
        recipe: {
          makes: "etwa 100 g Lievito Madre",
          ingredients: [
            { amount: "225 g", item: "Bio-Weizenmehl" },
            { amount: "115 ml", item: "lauwarmes Wasser" },
            { amount: "½ TL", item: "Bio-Olivenöl" },
            { amount: "½ TL", item: "Bio-Honig" },
          ],
          steps: [
            "Tag 1: 30 g Mehl, 15 ml lauwarmes Wasser, Honig und Olivenöl glatt verkneten, kreuzweise einschneiden und locker abgedeckt im Glas 24 Stunden warm stellen.",
            "Tag 2: den Teig in 25 ml lauwarmem Wasser auflösen, 45 g Mehl einarbeiten und wieder warm stellen.",
            "Tag 3 bis 5: jeweils 50 g Teig vom Vortag mit 25 ml Wasser und 50 g Mehl verkneten. Den Rest im Kühlschrank für Brot oder Pfannkuchen sammeln.",
            "An Tag 5 mit geschlossenem Deckel in den Kühlschrank stellen.",
            "Zum Auffrischen die harte Haut entfernen und immer Mehl zu Wasser 2:1 nehmen, z. B. 50 g Mehl und 25 ml Wasser. Nach dem Verdoppeln zurück in den Kühlschrank.",
          ],
        },
        care: [
          "An einem 28 bis 30 °C warmen Ort geht der Start deutlich schneller; bei Zimmertemperatur kann er bis zu 25 Tage brauchen.",
          "Im Kühlschrank etwa alle 8 bis 10 Tage füttern; ohne Futter hält er etwa 14 Tage.",
          "Reif riecht er nach Mehl, Hefe und leicht säuerlich; ein leichter Alkoholgeruch ist unbedenklich.",
          "Schimmel: komplett wegwerfen.",
        ],
        source: {
          name: "Utopia: Lievito Madre selber machen",
          url: "https://utopia.de/ratgeber/lievito-madre-so-machst-du-die-italienische-mutterhefe-selber_275271/",
        },
      },
    ],
  },

  injera: {
    family: "batch",
    group: "grain",
    label: "Injera-Teig",
    emoji: "🫓",
    blurb: "Teff und Wasser, 2 bis 5 Tage; ergibt saure Fladen.",
    defaultTemperature: 22,
    look: { vessel: "bowl", cover: "cloth", color: "#8a6a4a", accent: "#d8bd96", motif: "holes", dark: true },
    recipe: {
      makes: "etwa 20 Fladen à 15 cm",
      ingredients: [
        { amount: "280 g", item: "Teffmehl (2 Tassen)" },
        { amount: "950 ml", item: "Wasser, mehr nach Bedarf" },
        { amount: "60 bis 120 ml", item: "Sauerteig oder Injera-Teig vom letzten Mal, nach Wunsch" },
        { amount: "nach Geschmack", item: "Salz" },
        { amount: "etwas", item: "Butterschmalz oder Öl zum Backen" },
      ],
      steps: [
        "Teff, Wasser und nach Wunsch Starter in einer großen Schüssel aus Glas oder Keramik verrühren.",
        "Mit einem sauberen Tuch abdecken und ohne direkte Sonne stehen lassen.",
        "Mit Starter 2 bis 3 Tage, ohne 4 bis 5 Tage gären lassen, bis der Teig blubbert und sauer riecht. Braune Flüssigkeit oben ist normal.",
        "Die Flüssigkeit abgießen, salzen und mit Wasser zu einem crêpedünnen Teig verdünnen.",
        "Eine große Pfanne bei mittlerer Hitze leicht fetten und den Teig von außen nach innen spiralförmig eingießen.",
        "Backen, bis Bläschen kommen, dann 3 bis 5 Minuten zugedeckt dämpfen, bis der Rand sich löst und die Oberfläche trocken ist. Nicht wenden.",
      ],
    },
    care: [
      "Etwas Teig vom letzten Mal macht den nächsten schneller und zuverlässiger.",
      "Wärmer geht es schneller.",
      "Riecht er faulig statt säuerlich oder zeigt pelzigen Schimmel, wegwerfen.",
    ],
    source: { name: "Wordloaf (Andrew Janjigian): Injera", url: "https://wordloaf.substack.com/p/recipe-injera" },
    stages: [{ label: "Gärung", readyDays: { from: 2, to: 3 }, overripeDays: 6 }],
  },

  idli: {
    family: "batch",
    group: "grain",
    label: "Idli-Teig",
    emoji: "⚪",
    blurb: "Reis und Urad Dal gemahlen, 8 bis 12 Stunden warm.",
    baseLabel: "Idli",
    defaultTemperature: 27,
    look: { vessel: "bowl", color: "#f1ead8", accent: "#c3b48f", motif: "holes" },
    recipe: {
      makes: "etwa 40 Idli",
      ingredients: [
        { amount: "800 g", item: "Parboiled-Rundkornreis (4 Tassen)" },
        { amount: "200 g", item: "geschälte weiße Urad Dal (1 Tasse)" },
        { amount: "1 TL", item: "Bockshornkleesamen" },
        { amount: "2 TL", item: "Salz ohne Jod" },
        { amount: "etwa 500 ml", item: "chlorfreies Wasser" },
      ],
      steps: [
        "Reis und Dal getrennt einweichen, den Bockshornklee zum Dal geben. Das Einweichwasser vom Dal aufheben.",
        "Dal mit etwas Einweichwasser sehr fein mahlen.",
        "Reis mit etwa 250 ml Wasser mahlen: grob für Idli, fein, wenn der Teig auch für Dosa sein soll.",
        "Beides gründlich mischen und salzen.",
        "Warm bei 25 bis 28 °C mindestens 8 Stunden gären lassen, im Winter im Ofen mit eingeschaltetem Licht.",
        "Formen fetten, den Teig vorsichtig einfüllen, ohne ihn umzurühren, und 12 Minuten dämpfen.",
      ],
    },
    care: [
      "Zeigen sich am nächsten Morgen keine feinen Bläschen, ist die Gärung misslungen.",
      "Bei Kälte das Salz erst nach dem Gären zugeben.",
      "Übrigen Teig im Kühlschrank aufbewahren.",
    ],
    source: { name: "Wikibooks Cookbook: Idli", url: "https://en.wikibooks.org/wiki/Cookbook:Idli" },
    stages: [
      { label: "Gärung", readyDays: { from: hours(8), to: hours(12) }, overripeDays: 1, next: "In den Kühlschrank gestellt" },
      fridge(5, 10),
    ],
    variants: [
      {
        id: "dosa",
        label: "Dosa",
        blurb: "Feiner gemahlen, für dünne, knusprige Pfannkuchen.",
        look: { color: "#efe2c4" },
        recipe: {
          makes: "etwa 12 Dosas",
          ingredients: [
            { amount: "100 g", item: "Urad Dal" },
            { amount: "25 g", item: "Chana Dal" },
            { amount: "315 g", item: "Reis, am besten Sona Masuri" },
            { amount: "15 g", item: "Poha (Reisflocken)" },
            { amount: "½ TL", item: "Bockshornkleesamen" },
            { amount: "300 ml", item: "kaltes, gefiltertes Wasser, etwas mehr nach Bedarf" },
            { amount: "½ TL", item: "Salz ohne Jod" },
          ],
          steps: [
            "Dals mit dem Bockshornklee dreimal spülen und in 750 ml Wasser 5 bis 6 Stunden einweichen, den Reis getrennt genauso.",
            "Poha 30 Minuten vor dem Mahlen in 60 ml Wasser einweichen.",
            "Dal abgießen und mit Poha und 180 bis 250 ml kaltem Wasser glatt und luftig mixen.",
            "Reis abgießen, mit 120 ml Wasser glatt mixen und unter den Dal-Teig rühren. Kaltes Wasser verhindert, dass der Teig warm wird.",
            "Warm über Nacht 8 bis 16 Stunden gären lassen, bis er aufgegangen und luftig ist.",
            "Ungesalzenen Teig im Kühlschrank 2 bis 3 Wochen aufbewahren, gesalzenen kürzer.",
          ],
        },
        source: { name: "Swasthi's Recipes: Dosa Batter", url: "https://www.indianhealthyrecipes.com/dosa-recipe-dosa-batter/" },
        stages: [
          { label: "Gärung", readyDays: { from: hours(8), to: hours(14) }, overripeDays: 1, next: "In den Kühlschrank gestellt" },
          fridge(14, 21),
        ],
      },
    ],
  },
} satisfies Record<string, KindRules>;
