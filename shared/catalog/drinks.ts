// Drinks: tea, sugar water, juice and honey, with a culture or yeast.
import type { KindRules } from "../kinds.ts";
import { burp, fridge, hours, stir } from "./parts.ts";

const MEAD_STEPS_END = [
  "Hefenährsalz in etwas warmem Wasser lösen und einrühren.",
  "Trockenhefe in etwas Ansatz bei 34 bis 38 °C 30 Minuten quellen lassen und dazugeben, sobald der Ansatz unter 25 °C abgekühlt ist.",
  "Mit Gärspund verschließen und bei 20 bis 25 °C gären lassen.",
  "Läuft die Hauptgärung aus, den Met vorsichtig von der Hefe abziehen und kühl bei 10 bis 12 °C nachreifen lassen; nach einigen Wochen bei Bedarf noch einmal abziehen.",
  "Abfüllen, wenn er klar ist. Met mit wenig Alkohol warm abfüllen (55 °C), sonst gärt er in der Flasche nach.",
];

const MEAD_CARE = [
  "Sauberkeit entscheidet: Gefäße, Schlauch und Löffel gründlich reinigen.",
  "Backhefe und Mosthefe eignen sich nicht, sie schaffen den vielen Zucker nicht.",
  "Im Gärspund muss immer Wasser stehen. Steigen kaum noch Blasen auf, ist die Hauptgärung durch.",
  "Fensterbanktest vor dem Lagern: eine Flasche zwei Wochen warm stellen. Gärt nichts nach, ist er stabil.",
];

const CIDER_STEPS = (fruit: string, juice: string) => [
  "Gärballon mit sehr heißem Wasser sterilisieren.",
  `${fruit} waschen, Kerngehäuse entfernen, Schale dranlassen und grob zerkleinern.`,
  `Mit Presse oder Entsafter entsaften und durch Tuch und Sieb drücken; oder ${juice} nehmen.`,
  "Saft in den Ballon füllen, etwa 10 % frei lassen, den Zucker mit einem sterilen Löffel einrühren.",
  "Hefe in etwas warmem Wasser anrühren, dazugeben und mit Gärspund verschließen.",
  "Kühl bei höchstens 21 °C, am besten im Keller, etwa vier Wochen gären lassen, bis keine Bläschen mehr aufsteigen.",
  "Mit dünnem Schlauch vom trüben Bodensatz abziehen und in sterile Flaschen füllen; nach Wunsch noch Monate nachreifen lassen.",
];

export const DRINKS = {
  kombucha: {
    family: "batch",
    group: "drinks",
    label: "Kombucha",
    emoji: "🫖",
    blurb: "1. Gärung 7 bis 9 Tage, dann 3 bis 7 Tage in Flaschen.",
    baseLabel: "Schwarztee",
    defaultTemperature: 24,
    look: { vessel: "jar", cover: "cloth", color: "#c98a3a", accent: "#ecdcb6", motif: "scoby" },
    recipe: {
      makes: "1 l",
      ingredients: [
        { amount: "1 l", item: "Wasser" },
        { amount: "4 bis 5", item: "Beutel schwarzer oder grüner Tee" },
        { amount: "50 g", item: "weißer Zucker" },
        { amount: "25 g", item: "Scoby (Teepilz)" },
        { amount: "200 ml", item: "fertiger Kombucha als Starter" },
      ],
      steps: [
        "Tee im Wasser aufbrühen, Zucker darin lösen und auf Zimmertemperatur abkühlen lassen. Heißer Tee tötet den Scoby.",
        "Abgekühlten Tee in ein abgekochtes Glas gießen, Scoby und Starter dazugeben.",
        "Mit einem dichten Tuch und Gummiband abdecken und luftig, ohne direkte Sonne bei 21 bis 29 °C stehen lassen.",
        "Ab Tag 3 bildet sich ein neuer Scoby an der Oberfläche; mit einem Strohhalm probieren.",
        "Nach 7 bis 9 Tagen, oder wenn er dir sauer genug ist, abfüllen. Scoby und eine Tasse Kombucha für die nächste Runde aufheben.",
        "Für Kohlensäure durch einen Kaffeefilter in Bügelflaschen füllen, nach Wunsch Beeren, Apfel oder Ingwer dazu, 2,5 cm Luft lassen, verschließen und 3 bis 7 Tage stehen lassen.",
        "Dann kühlen, das stoppt die Gärung.",
      ],
    },
    care: [
      "Den Scoby nie in den Kühlschrank stellen und nie mit heißem Tee übergießen.",
      "In der Flasche täglich den Druck prüfen, am besten über der Spüle; Flaschen können platzen.",
      "Eine weiche Plastikflasche dazu hilft, den Druck zu fühlen.",
      "Pelziger, trockener Schimmel auf dem Scoby: alles wegwerfen. Braune Fäden sind Hefe und harmlos.",
    ],
    source: { name: "Michelin Guide: Homemade Kombucha", url: "https://guide.michelin.com/us/en/article/dining-in/diy-kombucha-recipe" },
    stages: [
      { label: "1. Gärung", readyDays: { from: 7, to: 9 }, overripeDays: 21, next: "In Flaschen abgefüllt" },
      { label: "2. Gärung", readyDays: { from: 3, to: 7 }, overripeDays: 10, tend: burp(), vessel: "bottle" },
    ],
    variants: [
      {
        id: "jun",
        label: "Jun",
        blurb: "Mit grünem Tee und Honig, schneller und milder.",
        look: { color: "#e3c46a" },
        defaultTemperature: 20,
        recipe: {
          makes: "2 l",
          ingredients: [
            { amount: "2 l", item: "Wasser" },
            { amount: "2 TL", item: "Sencha oder 2 Beutel grüner Tee" },
            { amount: "120 ml", item: "roher Honig" },
            { amount: "1", item: "Jun-Scoby" },
            { amount: "120 ml", item: "Jun vom letzten Ansatz" },
          ],
          steps: [
            "Wasser auf etwa 77 °C erhitzen, den Tee 3 bis 5 Minuten ziehen lassen und abseihen.",
            "Auf Zimmertemperatur abkühlen lassen, erst dann Honig, Scoby und Starter dazugeben.",
            "Mit einem Tuch abdecken und bei 18 bis 21 °C 3 bis 5 Tage säuern lassen, bis er angenehm sauer und leicht süß riecht.",
            "Scoby herausnehmen und 120 ml für den nächsten Ansatz zurückbehalten.",
            "Den Rest in Bügelflaschen füllen und 2 bis 3 Tage bei Zimmertemperatur nachgären lassen, dann kühlen. Hält bis zu 3 Monate.",
          ],
        },
        source: { name: "Nourished Kitchen: Jun Tea", url: "https://nourishedkitchen.com/how-to-make-jun-tea/" },
        stages: [
          { label: "1. Gärung", readyDays: { from: 3, to: 5 }, overripeDays: 10, next: "In Flaschen abgefüllt" },
          { label: "2. Gärung", readyDays: { from: 2, to: 3 }, overripeDays: 6, tend: burp(), vessel: "bottle" },
        ],
      },
    ],
  },

  "water-kefir": {
    family: "culture",
    group: "drinks",
    label: "Wasserkefir",
    emoji: "💧",
    blurb: "Kristalle in Zuckerwasser, alle 1 bis 3 Tage neu ansetzen.",
    defaultTemperature: 22,
    look: { vessel: "jar", color: "#ebe2bf", accent: "#fbf7ea", motif: "grains" },
    recipe: {
      makes: "1 l",
      ingredients: [
        { amount: "1 l", item: "Wasser, Zimmertemperatur" },
        { amount: "30 g", item: "Wasserkefir-Kristalle" },
        { amount: "60 g", item: "Rohrzucker" },
        { amount: "30 g", item: "ungeschwefelte Trockenfrüchte: Feigen, Datteln, Rosinen oder Aprikosen" },
        { amount: "1 bis 2", item: "Scheiben Bio-Zitrone" },
      ],
      steps: [
        "Zucker vollständig im Wasser lösen.",
        "Kristalle und Zuckerwasser in ein Gärglas geben, Trockenfrüchte und Zitrone dazu.",
        "Locker verschließen, nie fest zuschrauben.",
        "1 bis 3 Tage bei Zimmertemperatur gären lassen; im Sommer einmal täglich lüften.",
        "Durch ein Plastiksieb in eine Flasche abseihen, Früchte und Zitrone entsorgen.",
        "Kristalle kalt abspülen und gleich neu ansetzen. Das Getränk hält im Kühlschrank mindestens vier Wochen.",
      ],
    },
    care: [
      "Kein Metall: nur Glas, Kunststoff oder Holz.",
      "Rohr- oder Haushaltszucker nehmen; Honig funktioniert schlecht, Süßstoff gar nicht.",
      "Nach zwei Tagen enthält er etwa 0,5 % Alkohol.",
      "Für eine Pause die Kristalle in frischem Zuckerwasser in den Kühlschrank stellen und wöchentlich erneuern.",
    ],
    source: {
      name: "Utopia: Wasserkefir selber machen",
      url: "https://utopia.de/ratgeber/wasserkefir-selber-machen-anleitung-und-wissenswerte-infos_128005/",
    },
    feed: {
      done: "Neu angesetzt",
      todo: "Abseihen und neu ansetzen",
      readyHours: 36,
      hungryHours: 72,
      starvingHours: 120,
      fridgeDays: { hungry: 7, starving: 14 },
    },
  },

  "ginger-bug": {
    family: "culture",
    group: "drinks",
    label: "Ginger Bug",
    emoji: "🫚",
    blurb: "Ingwer-Starter für Limo, will täglich gefüttert werden.",
    defaultTemperature: 22,
    look: { vessel: "jar", cover: "cloth", color: "#ead39a", accent: "#c99a4e", motif: "ginger" },
    recipe: {
      makes: "1 Glas, etwa 400 ml",
      ingredients: [
        { amount: "1 EL", item: "Bio-Ingwer mit Schale, gerieben" },
        { amount: "1 EL", item: "Zucker" },
        { amount: "350 ml", item: "Wasser" },
        { amount: "täglich", item: "1 EL geriebener Ingwer und 1 EL Zucker" },
      ],
      steps: [
        "Ingwer und Zucker in ein Glas geben, Wasser dazu und kräftig rühren.",
        "Mit einem luftdurchlässigen Tuch abdecken.",
        "Jeden Tag 1 EL geriebenen Ingwer und 1 EL Zucker dazugeben und kräftig rühren.",
        "Nach etwa 5 Tagen ist er bereit: Er blubbert, riecht nach Hefe, ist trüb und hat weißen Bodensatz.",
        "Für Limo den Bodensatz aufrühren, 60 ml abseihen und in kalte, gesüßte Flüssigkeit geben, nie in heiße.",
        "Die abgenommene Menge mit Wasser ersetzen und wieder füttern.",
      ],
    },
    care: [
      "Bio-Ingwer nehmen: Bestrahlter Ingwer bringt oft keine wilden Hefen mit.",
      "Auf der Arbeitsfläche täglich füttern. Wird es zu viel, die Hälfte durch frisches Wasser, Ingwer und Zucker ersetzen.",
      "Im Kühlschrank reicht einmal pro Woche: auf Zimmertemperatur kommen lassen, füttern, ein paar Stunden warten, zurückstellen.",
      "Mit Deckel im Kühlschrank ab und zu Gas ablassen.",
    ],
    source: { name: "Zero-Waste Chef: How to Make a Ginger Bug", url: "https://zerowastechef.com/2015/06/10/ginger-bug/" },
    feed: {
      done: "Gefüttert",
      todo: "Füttern",
      readyTodo: "Füttern oder Limo ansetzen",
      readyHours: 20,
      hungryHours: 30,
      starvingHours: 72,
      fridgeDays: { hungry: 7, starving: 14 },
    },
  },

  "ginger-beer": {
    family: "batch",
    group: "drinks",
    label: "Ginger Beer",
    emoji: "🥤",
    blurb: "Ingwerlimo mit Ginger Bug: 2 bis 3 Tage, dann in Flaschen.",
    defaultTemperature: 21,
    look: { vessel: "bottle", color: "#e9c46a", accent: "#b9853a", motif: "ginger" },
    recipe: {
      makes: "2 l",
      ingredients: [
        { amount: "100 g", item: "frischer Ingwer, fein gerieben" },
        { amount: "150 g", item: "brauner Zucker oder Kokosblütenzucker" },
        { amount: "2", item: "Zitronen, ausgepresst" },
        { amount: "2 l", item: "Wasser" },
        { amount: "120 ml", item: "abgeseihter Ginger Bug" },
      ],
      steps: [
        "Ingwer, Zucker und 500 ml Wasser etwa 10 Minuten köcheln lassen.",
        "Vom Herd nehmen, die restlichen 1,5 l Wasser dazugießen und auf Zimmertemperatur abkühlen lassen.",
        "Ginger Bug und Zitronensaft einrühren.",
        "In eine große Flasche mit Luft nach oben füllen, verschließen und 2 bis 3 Tage bei Zimmertemperatur gären lassen.",
        "Abseihen, in kleine Bügelflaschen füllen und weitere 2 bis 3 Tage stehen lassen.",
        "Fühlen sich die Flaschen prall an, vorsichtig Druck ablassen und kalt stellen.",
      ],
    },
    care: [
      "Täglich entlüften, besonders bei Wärme.",
      "Je länger es gärt, desto spritziger und weniger süß wird es.",
      "Sehr spritzige Flaschen sofort kühlen, sonst können sie platzen.",
      "Den Ginger Bug alle paar Tage weiterfüttern.",
    ],
    source: {
      name: "The Happy Pear: Naturally Fermented Ginger Beer",
      url: "https://thehappypear.ie/plant-based-and-vegan-recipes/naturally-fermented-ginger-beer-non-alcoholic/",
    },
    stages: [
      { label: "1. Gärung", readyDays: { from: 2, to: 3 }, overripeDays: 5, tend: burp(), next: "In kleine Flaschen gefüllt" },
      { label: "2. Gärung", readyDays: { from: 2, to: 3 }, overripeDays: 6, tend: burp() },
    ],
    variants: [
      {
        id: "zitronenlimo",
        label: "Zitronenlimo",
        blurb: "Gesüßte Limonade mit Ginger Bug, gleich in Flaschen.",
        look: { color: "#f3e48a", accent: "#f2d33b", motif: "lemon" },
        recipe: {
          makes: "1 l",
          ingredients: [
            { amount: "1 l", item: "Wasser" },
            { amount: "3", item: "Zitronen, ausgepresst" },
            { amount: "80 g", item: "Zucker" },
            { amount: "60 ml", item: "abgeseihter Ginger Bug" },
          ],
          steps: [
            "Zucker in etwas warmem Wasser lösen und mit dem restlichen kalten Wasser und dem Zitronensaft mischen.",
            "Erst wenn alles kalt ist, den Ginger Bug einrühren.",
            "In Bügelflaschen füllen, verschließen und höchstens etwa drei Tage im Schrank stehen lassen.",
            "Alle ein bis zwei Tage öffnen, damit Gas entweicht, dann kühlen.",
          ],
        },
        source: { name: "Zero-Waste Chef: How to Make a Ginger Bug", url: "https://zerowastechef.com/2015/06/10/ginger-bug/" },
        stages: [{ label: "In Flaschen", readyDays: { from: 1, to: 3 }, overripeDays: 4, tend: burp() }],
      },
    ],
  },

  tepache: {
    family: "batch",
    group: "drinks",
    label: "Tepache",
    emoji: "🍍",
    blurb: "Ananas mit Piloncillo und Gewürzen, 2 bis 3 Tage.",
    defaultTemperature: 23,
    look: { vessel: "jar", cover: "cloth", color: "#e2a43c", accent: "#f5d35b", motif: "pineapple" },
    recipe: {
      makes: "etwa 2 l",
      ingredients: [
        { amount: "825 g", item: "Ananas mit Schale, geviertelt, ohne Strunk (gut ½ Ananas)" },
        { amount: "350 g", item: "Piloncillo oder dunkler Rohrzucker" },
        { amount: "2 l", item: "gefiltertes Wasser" },
        { amount: "2", item: "Zimtstangen" },
        { amount: "½ EL", item: "Koriandersaat" },
        { amount: "3", item: "Nelken" },
        { amount: "nach Wunsch", item: "1 Morita-Chili, halbiert" },
      ],
      steps: [
        "Zucker, Gewürze und 1 l Wasser im großen Glas verrühren, bis sich ein Teil gelöst hat.",
        "Ananas und das restliche Wasser dazugeben.",
        "Mit einem Tuch und Gummiband abdecken und dunkel bei etwa 22 bis 23 °C 2 bis 3 Tage gären lassen.",
        "Einmal täglich mit einem sauberen Löffel umrühren, damit nichts trocken oben liegt.",
        "Ab Tag 2 probieren: leicht prickelnd, trüb-bernsteinfarben, fruchtig-säuerlich. Dann abseihen.",
        "Für Kohlensäure in Bügelflaschen füllen, 12 bis 24 Stunden stehen lassen, dann kühlen. Hält im Kühlschrank etwa eine Woche.",
      ],
    },
    care: [
      "Riecht er faulig oder scharf statt fruchtig, wegwerfen.",
      "Weißer Schaum ist normal, pelziger Schimmel nicht.",
      "In Flaschen baut sich schnell Druck auf: vorsichtig entlüften.",
      "Tepache enthält etwas Alkohol.",
    ],
    source: { name: "America's Test Kitchen: Tepache", url: "https://www.americastestkitchen.com/recipes/17759-tepache" },
    stages: [
      {
        label: "Gärung",
        readyDays: { from: 2, to: 3 },
        overripeDays: 5,
        tend: stir(24, "Rühr mich um, damit keine Ananas trocken oben liegt."),
        next: "In Flaschen abgefüllt",
      },
      { label: "In Flaschen", readyDays: { from: 0.5, to: 1 }, overripeDays: 3, tend: burp(12), vessel: "bottle" },
    ],
  },

  kvass: {
    family: "batch",
    group: "drinks",
    label: "Kwas",
    emoji: "🥖",
    blurb: "Geröstetes Roggenbrot mit Hefe: in einem Tag in die Flasche.",
    baseLabel: "Brotkwas",
    defaultTemperature: 22,
    look: { vessel: "jar", cover: "cloth", color: "#7a4a26", accent: "#3e2412", motif: "bread", dark: true },
    recipe: {
      makes: "etwa 2,5 l",
      ingredients: [
        { amount: "2,5 l", item: "Wasser" },
        { amount: "3 Scheiben", item: "dunkles Roggenbrot" },
        { amount: "1 kleine Handvoll", item: "Rosinen" },
        { amount: "200 g", item: "Zucker" },
        { amount: "1 TL", item: "Trockenhefe, etwa 3 g" },
        { amount: "nach Wunsch", item: "frische Minze" },
      ],
      steps: [
        "Brot zweimal sehr dunkel toasten; je dunkler, desto dunkler der Kwas.",
        "Wasser aufkochen, vom Herd nehmen, Brot und Rosinen hineingeben und zugedeckt mindestens 8 Stunden ziehen lassen.",
        "Brot herausnehmen. Zucker mit der Hefe mischen, einrühren und zugedeckt 6 bis 8 Stunden gären lassen, ab und zu umrühren. Hier zählt er als angesetzt.",
        "Durch ein feines Sieb oder Tuch in Flaschen füllen, nur locker verschließen und über Nacht kalt stellen.",
        "Am nächsten Morgen fest verschließen. Für mehr Kohlensäure ½ TL Zucker pro 500 ml in die Flasche geben.",
      ],
    },
    care: [
      "Kwas gärt im Kühlschrank langsam weiter: Flaschen regelmäßig öffnen und Druck ablassen.",
      "Gekühlt etwa eine Woche haltbar.",
      "Bei Schimmel, schleimiger Konsistenz oder fauligem Geruch wegwerfen.",
      "In kühleren Räumen die Zeiten verlängern.",
    ],
    source: { name: "Cocktail Society: Bread Kvass", url: "https://cocktail-society.com/recipes/kvass/" },
    stages: [
      { label: "Gärung", readyDays: { from: hours(6), to: hours(8) }, overripeDays: hours(16), next: "In Flaschen abgefüllt" },
      {
        label: "In Flaschen, kalt",
        readyDays: { from: 0.5, to: 7 },
        overripeDays: 9,
        tend: burp(),
        fixed: true,
        vessel: "bottle",
      },
    ],
    variants: [
      {
        id: "rote-bete",
        label: "Rote-Bete-Kwas",
        blurb: "Rote Bete in Salzlake, 4 bis 7 Tage, erdig-sauer.",
        look: { color: "#8e1f3f", accent: "#d0537a", motif: "beet" },
        defaultTemperature: 20,
        recipe: {
          makes: "1 l",
          ingredients: [
            { amount: "3", item: "große Rote Beten" },
            { amount: "1 l", item: "lauwarmes Wasser" },
            { amount: "1 TL", item: "feines Meersalz" },
            { amount: "nach Wunsch", item: "2 EL Starter, z. B. Sauerkrautsaft" },
          ],
          steps: [
            "Rote Beten gründlich waschen, mit Schale würfeln und in ein 1-l-Glas geben.",
            "Salz und Starter im Wasser verrühren und über die Bete gießen.",
            "Mit Gärspund oder dicht schließendem Deckel 4 bis 7 Tage bei Zimmertemperatur gären lassen, bis er angenehm sauer schmeckt; im Sommer kürzer, im Winter länger.",
            "Abseihen und trinken oder in Flaschen im Kühlschrank bis zu einem Monat aufheben.",
          ],
        },
        care: [
          "Schaum und Bläschen sind normal.",
          "Wird der Kwas zähflüssig, neu anfangen.",
          "Die Bete gibt noch einen zweiten, schwächeren Ansatz her.",
        ],
        source: { name: "Nourished Kitchen: Beet Kvass", url: "https://nourishedkitchen.com/beet-kvass-recipe/" },
        stages: [
          { label: "Gärung", readyDays: { from: 4, to: 7 }, overripeDays: 12, next: "Abgefüllt" },
          fridge(30, 40),
        ],
      },
    ],
  },

  rejuvelac: {
    family: "batch",
    group: "drinks",
    label: "Rejuvelac",
    emoji: "🌾",
    blurb: "Gekeimter Weizen in Wasser, 1 bis 2 Tage.",
    defaultTemperature: 22,
    look: { vessel: "jar", cover: "cloth", color: "#efe7c8", accent: "#b89a5a", motif: "sprouts" },
    recipe: {
      makes: "1,5 l",
      ingredients: [
        { amount: "180 g", item: "Weizenkörner (1 Tasse)" },
        { amount: "nach Bedarf", item: "Wasser zum Einweichen und Spülen" },
        { amount: "1,5 l", item: "gefiltertes Wasser zum Fermentieren" },
      ],
      steps: [
        "Körner abspülen und 8 bis 12 Stunden bei Zimmertemperatur einweichen.",
        "Abgießen, spülen und das Glas schräg stellen, damit es abtropft, aber feucht bleibt.",
        "1 bis 3 Tage zweimal täglich spülen und abtropfen lassen, bis die Keime 3 bis 6 mm lang sind.",
        "Gekeimte Körner spülen, mit 1,5 l frischem Wasser übergießen und mit Tuch oder Kaffeefilter abdecken. Hier zählt es als angesetzt.",
        "Ohne direkte Sonne bei 21 bis 24 °C 24 bis 48 Stunden stehen lassen, ab 24 Stunden probieren.",
        "Abseihen, sobald es trüb und säuerlich-zitronig schmeckt. Im Kühlschrank 7 bis 10 Tage haltbar.",
      ],
    },
    care: [
      "Es soll frisch und säuerlich riechen; riecht es faulig, wegwerfen.",
      "Weißer Bodensatz ist normal, pelziger Schimmel nicht.",
      "Über 27 °C geht es schneller, unter 18 °C langsamer.",
      "Mit 1 bis 1,5 l frischem Wasser geben die Körner einen zweiten Ansatz, meist nach 24 Stunden fertig.",
    ],
    source: {
      name: "Country Life Foods: How to Make Rejuvelac",
      url: "https://countrylifefoods.com/blogs/grain-foods/how-to-make-rejuvelac-with-wheat-berries",
    },
    stages: [
      { label: "Gärung", readyDays: { from: 1, to: 2 }, overripeDays: 3, next: "Abgeseiht" },
      fridge(7, 10),
    ],
  },

  sima: {
    family: "batch",
    group: "drinks",
    label: "Sima",
    emoji: "🥂",
    blurb: "Finnische Zitronenlimo; fertig, wenn die Rosinen steigen.",
    defaultTemperature: 20,
    look: { vessel: "bottle", color: "#f4e7a1", accent: "#5a3a2a", motif: "raisins" },
    recipe: {
      makes: "1 l",
      ingredients: [
        { amount: "1 l", item: "Wasser" },
        { amount: "100 g", item: "weißer Zucker" },
        { amount: "100 g", item: "brauner Zucker" },
        { amount: "1", item: "Bio-Zitrone" },
        { amount: "2 TL", item: "Trockenhefe oder ein erbsengroßes Stück Frischhefe" },
        { amount: "10 bis 12", item: "Rosinen" },
      ],
      steps: [
        "Wasser mit beiden Zuckern erhitzen, bis sie sich gelöst haben, und auf 38 °C abkühlen lassen.",
        "120 ml davon abnehmen und die Hefe darin aufblühen lassen.",
        "Zitrone abreiben, die weiße Haut entfernen und das Fruchtfleisch in Scheiben schneiden. Schale und Scheiben in den Topf geben.",
        "Hefe dazugießen, abdecken und 24 Stunden ungestört stehen lassen.",
        "Zitrone herausnehmen, in Flaschen füllen, pro 500 ml 5 bis 6 Rosinen dazugeben und verschließen.",
        "Nach 1 bis 7 Tagen ist sie fertig, sobald die Rosinen nach oben steigen.",
      ],
    },
    care: [
      "Wärmer als 38 °C tötet die Hefe.",
      "Täglich Druck ablassen, Flaschen können platzen.",
      "Je länger sie steht, desto kräftiger und alkoholischer wird sie.",
      "Fertig kalt stellen.",
    ],
    source: {
      name: "Junction City Scandinavian Festival: Sima",
      url: "https://junctioncityscandia.org/sima-fermented-flavor-of-finland/",
    },
    stages: [
      { label: "Ansatz", readyDays: { from: 1, to: 1.5 }, overripeDays: 3, next: "Mit Rosinen abgefüllt", vessel: "jar" },
      { label: "In Flaschen", readyDays: { from: 1, to: 7 }, overripeDays: 10, tend: burp() },
    ],
  },

  mead: {
    family: "batch",
    group: "drinks",
    label: "Met",
    emoji: "🍯",
    blurb: "Honigwein: 2 bis 4 Wochen Hauptgärung, dann Monate reifen.",
    defaultTemperature: 22,
    look: { vessel: "carboy", color: "#e5b647", accent: "#c98a1c", motif: "honey" },
    recipe: {
      makes: "gut 4 l im 5-l-Gärballon",
      ingredients: [
        { amount: "1,5 kg", item: "Honig, höchstens 1 Teil Honig auf 2 Teile Wasser" },
        { amount: "3 l", item: "Trinkwasser" },
        { amount: "1 g", item: "Hefenährsalz (20 bis 30 g pro 100 l)" },
        { amount: "1 Päckchen", item: "Trockenreinzuchthefe für hohe Zuckergehalte, z. B. Sherryhefe" },
      ],
      steps: [
        "Honig mit etwas Wasser auf mindestens 78 °C erhitzen, das tötet wilde Hefen ab; lange kochen ist nicht nötig.",
        "Mit kaltem Wasser auf die ganze Menge auffüllen und den Ballon höchstens zu vier Fünfteln füllen.",
        ...MEAD_STEPS_END,
      ],
    },
    care: MEAD_CARE,
    source: {
      name: "LWG Bayern, Institut für Bienenkunde: Honigwein – Met",
      url: "https://www.lwg.bayern.de/mam/cms06/bienen/dateien/met-herstellung.pdf",
    },
    stages: [
      { label: "Hauptgärung", readyDays: { from: 14, to: 28 }, overripeDays: 42, next: "Von der Hefe abgezogen" },
      { label: "Nachreifen", readyDays: { from: 42, to: 180 }, overripeDays: 365, fixed: true },
    ],
    variants: [
      {
        id: "mit-frucht",
        label: "Met mit Fruchtsaft",
        blurb: "Ein Teil Wasser durch Saft ersetzt: schnellerer Start, mehr Säure.",
        look: { color: "#a23a5a", accent: "#e48aa6", motif: "berries", dark: true },
        recipe: {
          ingredients: [
            { amount: "1,5 kg", item: "Honig" },
            { amount: "2 l", item: "Trinkwasser" },
            { amount: "1 l", item: "Fruchtsaft ohne Konservierungsstoffe, z. B. Johannisbeere oder Apfel" },
            { amount: "1 Päckchen", item: "Trockenreinzuchthefe für hohe Zuckergehalte" },
            { amount: "nach Bedarf", item: "Hefenährsalz; mit Saft oft weniger oder keins" },
          ],
          steps: [
            "Honig mit etwas Wasser auf mindestens 78 °C erhitzen; lange kochen ist nicht nötig.",
            "Mit kaltem Wasser und dem Saft auffüllen und den Ballon höchstens zu vier Fünfteln füllen.",
            ...MEAD_STEPS_END,
          ],
        },
        care: [
          ...MEAD_CARE,
          "Konservierte Säfte verhindern die Gärung; nur unbehandelten Saft nehmen. Mit viel Saft heißt er Honigfruchtwein.",
        ],
      },
    ],
  },

  cider: {
    family: "batch",
    group: "drinks",
    label: "Cider",
    emoji: "🍏",
    blurb: "Apfelsaft mit Weinhefe, etwa 4 Wochen im Ballon.",
    baseLabel: "Apfel",
    defaultTemperature: 18,
    look: { vessel: "carboy", color: "#e9cf7a", accent: "#c8432f", motif: "apple" },
    recipe: {
      makes: "etwa 4,5 l",
      ingredients: [
        { amount: "4,5 l", item: "frisch gepresster Apfelsaft, aus etwa 8 kg gemischten Äpfeln" },
        { amount: "400 g", item: "Zucker" },
        { amount: "1 g", item: "Weinhefe" },
      ],
      steps: CIDER_STEPS("Äpfel", "naturtrüben Direktsaft ohne Konservierungsstoffe"),
    },
    care: [
      "Saft ohne Konservierungsstoffe verwenden, sonst gärt nichts.",
      "Gärspund immer mit Wasser gefüllt halten.",
      "Auch in der Flasche kann Cider nachgären und Druck aufbauen: erst abfüllen, wenn sicher nichts mehr blubbert.",
      "Ergibt etwa 5 bis 7 % Alkohol, je nach Süße der Äpfel.",
    ],
    source: { name: "Utopia: Apfelwein selber machen", url: "https://utopia.de/ratgeber/apfelwein-selber-machen-ein-rezept_141794/" },
    stages: [
      { label: "Gärung", readyDays: { from: 21, to: 35 }, overripeDays: 56, next: "Abgezogen" },
      { label: "Nachreifen", readyDays: { from: 14, to: 120 }, overripeDays: 365, fixed: true },
    ],
    variants: [
      {
        id: "birne",
        label: "Birnenmost",
        blurb: "Perry: Birnensaft statt Apfelsaft.",
        look: { color: "#e5e0a0", accent: "#8fa83e" },
        recipe: {
          ingredients: [
            { amount: "4,5 l", item: "frisch gepresster Birnensaft, aus etwa 8 kg Birnen" },
            { amount: "400 g", item: "Zucker" },
            { amount: "1 g", item: "Weinhefe" },
          ],
          steps: CIDER_STEPS("Birnen", "Birnendirektsaft ohne Konservierungsstoffe"),
        },
      },
    ],
  },

  elderflower: {
    family: "batch",
    group: "drinks",
    label: "Holunderblütensekt",
    emoji: "🌼",
    blurb: "Holunderblüten, Zitrone und Zucker: 6 Tage im Eimer, 5 in Flaschen.",
    defaultTemperature: 20,
    look: { vessel: "bottle", color: "#f1ecc8", accent: "#fffdf3", motif: "flower" },
    recipe: {
      makes: "5 l",
      ingredients: [
        { amount: "900 g", item: "Zucker" },
        { amount: "9", item: "Holunderblütendolden, frisch gepflückt" },
        { amount: "4", item: "Bio-Zitronen, Abrieb und Saft" },
        { amount: "2,5 g", item: "Champagnerhefe (½ Päckchen)" },
        { amount: "5 l", item: "Wasser" },
      ],
      steps: [
        "Zucker in 2 l frisch gekochtem Wasser im Gäreimer vollständig lösen und 3 l kaltes Wasser dazugeben.",
        "Blüten ausschütteln, damit Insekten herausfallen, und die Blütchen mit einer Gabel abstreifen.",
        "Wenn das Zuckerwasser auf 20 °C abgekühlt ist, Zitronenabrieb, Saft, Blüten und Hefe einrühren.",
        "Abgedeckt ohne direkte Sonne 6 Tage gären lassen; ohne Gärdeckel den Deckel nur auflegen.",
        "Durch ein abgekochtes Tuch in einen zweiten Eimer abseihen und zwei Stunden absetzen lassen.",
        "In Sekt- oder Limoflaschen füllen, verschließen und 5 Tage kühl und dunkel lagern, dann Druck prüfen.",
      ],
    },
    care: [
      "Holunderblüten welken schnell: gleich nach dem Pflücken ansetzen.",
      "In der Flasche täglich vorsichtig Druck ablassen; sehr lebhafte Flaschen in den Kühlschrank.",
      "Mit dieser Zuckermenge entsteht ein alkoholisches Getränk um 8 %.",
      "Eimer, Tuch und Flaschen vorher gründlich reinigen.",
    ],
    source: { name: "BBC Good Food: Elderflower champagne", url: "https://www.bbcgoodfood.com/recipes/elderflower-champagne" },
    stages: [
      { label: "Im Eimer", readyDays: { from: 6, to: 7 }, overripeDays: 10, next: "In Flaschen abgefüllt", vessel: "jar" },
      { label: "In Flaschen", readyDays: { from: 5, to: 10 }, overripeDays: 21, tend: burp() },
    ],
  },
} satisfies Record<string, KindRules>;
