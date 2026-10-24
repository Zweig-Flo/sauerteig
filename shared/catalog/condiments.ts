// Sauces, mustard and vinegar.
import type { KindRules } from "../kinds.ts";
import { burp, fridge, stir } from "./parts.ts";

export const CONDIMENTS = {
  "hot-sauce": {
    family: "batch",
    group: "condiments",
    label: "Chilisauce",
    emoji: "🔥",
    blurb: "Chilis in 3-%-Lake, 5 bis 10 Tage, dann püriert.",
    defaultTemperature: 21,
    look: { vessel: "jar", cover: "airlock", color: "#d23a2a", accent: "#7a1610", motif: "chili" },
    recipe: {
      makes: "etwa 450 ml Sauce",
      ingredients: [
        { amount: "250 g", item: "Chilis, z. B. Cayenne oder Jalapeño, nach Farbe getrennt" },
        { amount: "125 g", item: "Möhre, rote Paprika oder getrocknete Aprikosen" },
        { amount: "3", item: "Knoblauchzehen" },
        { amount: "1 l", item: "gefiltertes Wasser" },
        { amount: "30 g", item: "Salz ohne Jod (3 %)" },
      ],
      steps: [
        "Ein 1-l-Glas heiß spülen.",
        "Salz in der Hälfte des Wassers erhitzen und lösen, das restliche Wasser dazugeben und abkühlen lassen.",
        "Mit Handschuhen die Stiele entfernen und die Chilis grob schneiden. Möhre schälen und in dünne Scheiben schneiden oder Paprika würfeln.",
        "Chilis, Gemüse und Knoblauch ins Glas geben, mit der kalten Lake auffüllen und Luft nach oben lassen.",
        "Mit einem Gärgewicht unter der Lake halten, Gärspund aufsetzen und das Glas auf einen Teller stellen.",
        "Kühl und dunkel 5 bis 10 Tage gären lassen, ab Tag 5 täglich probieren.",
        "Abseihen, die Lake aufheben und die Feststoffe mit etwa 100 ml Lake glatt pürieren. In saubere Flaschen füllen und kühl lagern.",
      ],
    },
    care: [
      "Ohne Gärspund den Deckel täglich lockern.",
      "Trübe Lake und Bläschen zeigen, dass es arbeitet.",
      "Weiße Kahmhaut abschöpfen; bei Schimmel alles wegwerfen.",
      "Mit pH-Streifen prüfen: Unter 4,6 ist gut.",
      "Kommt nach dem Pürieren Zucker oder Honig dazu, gärt sie weiter: dann unbedingt in den Kühlschrank.",
    ],
    source: { name: "Cuisine Magazine: Fermented Chilli Hot Sauce", url: "https://www.cuisine.co.nz/recipe/fermented-chilli-hot-sauce/" },
    stages: [{ label: "Gärung", readyDays: { from: 5, to: 10 }, overripeDays: 30, tend: burp() }],
    variants: [
      {
        id: "sriracha",
        label: "Sriracha",
        blurb: "Rote Chilis mit Knoblauch und Palmzucker als Paste vergoren, dann eingekocht.",
        look: { vessel: "bowl", cover: "none", color: "#e04a2c" },
        recipe: {
          makes: "etwa 300 ml",
          ingredients: [
            { amount: "200 g", item: "scharfe rote Chilis" },
            { amount: "150 g", item: "rote Paprika" },
            { amount: "4", item: "Knoblauchzehen" },
            { amount: "60 g", item: "Palmzucker" },
            { amount: "1 TL", item: "Meersalz" },
            { amount: "1 EL", item: "Fischsauce" },
            { amount: "2 EL", item: "Reisessig" },
          ],
          steps: [
            "Chilis, Paprika, Knoblauch, Zucker und Salz zu einer groben Paste mixen.",
            "In eine Glasschüssel geben, abdecken und bei Zimmertemperatur etwa 2 Tage stehen lassen, bis sie blubbert.",
            "Danach drei Tage lang einmal täglich aufdecken, umrühren und wieder abdecken.",
            "Glatt pürieren und durch ein feines Sieb in einen Topf streichen.",
            "Fischsauce und Reisessig dazugeben, aufkochen und 10 bis 15 Minuten sprudelnd einkochen, bis sie dicklich ist.",
            "Abgekühlt in saubere Flaschen füllen; angebrochen im Kühlschrank etwa 4 Wochen haltbar.",
          ],
        },
        care: ["Einmal täglich umrühren.", "Bei Schimmel wegwerfen."],
        source: {
          name: "The Happy Foodie: Home-made Fermented Sriracha",
          url: "https://thehappyfoodie.co.uk/recipes/home-made-fermented-sriracha-sauce/",
        },
        stages: [{ label: "Gärung", readyDays: { from: 5, to: 6 }, overripeDays: 10, tend: stir() }],
      },
    ],
  },

  mustard: {
    family: "batch",
    group: "condiments",
    label: "Fermentierter Senf",
    emoji: "🟡",
    blurb: "Senfsaat in Lake, 5 bis 10 Tage, dann gemixt.",
    defaultTemperature: 21,
    look: { vessel: "jar", cover: "airlock", color: "#e5bf3a", accent: "#a8760a", motif: "seeds" },
    recipe: {
      makes: "1 Glas, 500 ml",
      ingredients: [
        { amount: "150 g", item: "gelbe Senfsaat" },
        { amount: "10 g", item: "Salz" },
        { amount: "25 g", item: "frische Kurkuma oder ½ TL Pulver" },
        { amount: "1", item: "Knoblauchzehe, fein gehackt" },
        { amount: "310 bis 375 ml", item: "Wasser" },
        { amount: "1 TL", item: "Lake von einem anderen Ferment" },
      ],
      steps: [
        "Senfsaat, Salz, Kurkuma, Knoblauch und Lake ins Glas geben und mit Wasser auffüllen.",
        "Verschließen, Gärspund aufsetzen und bei Zimmertemperatur 5 bis 10 Tage gären lassen; länger für mehr Säure.",
        "Öffnen, die Flüssigkeit abgießen und aufheben.",
        "Die Saat mixen und dabei nach und nach Flüssigkeit zugeben, bis die Konsistenz passt. Nach Wunsch einen Teil durch Apfelessig oder Weißwein ersetzen.",
        "Im Kühlschrank lagern.",
      ],
    },
    care: [
      "Die Saat quillt stark: das Glas nicht zu voll machen und auf den Wasserstand achten.",
      "Frisch ist er scharf und bitter; im Kühlschrank wird er über Wochen milder.",
      "Für groben Senf die Hälfte durch braune Saat ersetzen und nur kurz mixen.",
    ],
    source: {
      name: "Revolution Fermentation: Homemade Fermented Mustard",
      url: "https://revolutionfermentation.com/en/blogs/fermented-vegetables/homemade-fermented-mustard-recipe/",
    },
    stages: [{ label: "Gärung", readyDays: { from: 5, to: 10 }, overripeDays: 20 }],
  },

  ketchup: {
    family: "batch",
    group: "condiments",
    label: "Fermentierter Ketchup",
    emoji: "🥫",
    blurb: "Tomatenmark mit Gewürzen, 2 bis 3 Tage.",
    defaultTemperature: 21,
    look: { vessel: "jar", color: "#c8322a", accent: "#ef6a52", motif: "tomato" },
    recipe: {
      makes: "1 Glas, gut 500 ml",
      ingredients: [
        { amount: "340 g", item: "Tomatenmark ohne Salz" },
        { amount: "90 ml", item: "Wasser" },
        { amount: "30 ml", item: "Molke vom Abtropfen von Joghurt, oder Wasser" },
        { amount: "2 EL", item: "naturtrüber Apfelessig" },
        { amount: "¼ TL", item: "Senfpulver" },
        { amount: "je ⅛ TL", item: "gemahlene Nelken, Piment und Cayennepfeffer" },
        { amount: "¼ TL", item: "Zimt" },
        { amount: "½ TL", item: "Meersalz, ohne Molke ¾ TL" },
        { amount: "60 bis 80 ml", item: "Ahornsirup, Honig oder Melasse" },
      ],
      steps: [
        "Alles in einer Schüssel glatt rühren.",
        "In ein sauberes Glas füllen und abdecken.",
        "2 bis 3 Tage bei Zimmertemperatur stehen lassen.",
        "Dann in den Kühlschrank stellen; dort hält er mindestens einen Monat.",
      ],
    },
    care: [
      "Einmal täglich öffnen, damit Gas entweicht.",
      "Bläschen oder etwas Schaum oben zeigen, dass er arbeitet.",
      "Bei Schimmel wegwerfen.",
    ],
    source: {
      name: "Traditional Cooking School: Lacto-Fermented Ketchup",
      url: "https://traditionalcookingschool.com/food-preparation/recipes/lacto-fermented-homemade-ketchup/",
    },
    stages: [
      { label: "Gärung", readyDays: { from: 2, to: 3 }, overripeDays: 5, tend: burp(), next: "In den Kühlschrank gestellt" },
      fridge(30, 60),
    ],
  },

  vinegar: {
    family: "batch",
    group: "condiments",
    label: "Obstessig",
    emoji: "🍎",
    blurb: "Apfelreste in Zuckerwasser: 1 Woche, dann 2 bis 4 Wochen Essig.",
    defaultTemperature: 21,
    look: { vessel: "jar", cover: "cloth", color: "#c99245", accent: "#b5422f", motif: "apple" },
    recipe: {
      makes: "etwa 600 ml",
      ingredients: [
        { amount: "450 g", item: "Schalen und Kerngehäuse von ungespritzten Äpfeln" },
        { amount: "500 bis 750 ml", item: "gefiltertes Wasser" },
        { amount: "1 EL pro 250 ml Wasser", item: "Zucker" },
      ],
      steps: [
        "Zucker im Wasser lösen.",
        "Apfelreste in eine Schüssel oder ein weites Glas aus Glas, Keramik oder Edelstahl geben und mit dem Zuckerwasser übergießen.",
        "Mit einem Tuch abdecken, nicht luftdicht: Essig braucht Luft.",
        "Eine Woche bei Zimmertemperatur stehen lassen und mindestens einmal täglich umrühren.",
        "Apfelreste abseihen; die Flüssigkeit ist jetzt dunkler.",
        "Weitere 2 Wochen bis 1 Monat stehen lassen und täglich umrühren, bis es so sauer riecht und schmeckt, wie du magst.",
        "In Flaschen mit dichtem Verschluss füllen.",
      ],
    },
    care: [
      "Gechlortes Leitungswasser bremst die Gärung; gefiltertes Wasser nehmen.",
      "Der Geruch geht von leicht alkoholisch zu sauer.",
      "Eine gallertartige Haut ist die Essigmutter und erwünscht; sie startet den nächsten Ansatz.",
      "Pelziger Schimmel ist etwas anderes: abheben und genau beobachten. Kommt er wieder, wegwerfen.",
    ],
    source: {
      name: "University of Saskatchewan: Apple scrap vinegar",
      url: "https://gardening.usask.ca/articles-and-lists/articles-recipes/apple-scrap-vinegar.php",
    },
    stages: [
      { label: "Mit Apfelresten", readyDays: { from: 7, to: 8 }, overripeDays: 12, tend: stir(), next: "Apfelreste abgeseiht" },
      { label: "Essig", readyDays: { from: 14, to: 30 }, overripeDays: 90, tend: stir() },
    ],
  },
} satisfies Record<string, KindRules>;
