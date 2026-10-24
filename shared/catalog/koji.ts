// Koji and what grows on beans: warm and fast, or salted and slow.
import type { KindRules } from "../kinds.ts";
import { fridge, hours, stir } from "./parts.ts";

const KOJI_STEPS = [
  "Reis waschen, bis das Wasser klar ist, und über Nacht im Kühlschrank in weichem Wasser einweichen. Gut abtropfen lassen.",
  "In ein Tuch gewickelt 40 bis 45 Minuten kräftig dämpfen; er soll etwas fester als gekochter Reis sein, ohne harten Kern.",
  "Auf einem sauberen Blech ausbreiten und wenden, bis er auf 36 °C abgekühlt ist.",
  "Sporen darüberstreuen und mit den Händen untermischen, zügig und ohne Zugluft.",
  "Fest in ein Tuch gewickelt bei 32 bis 35 °C 18 bis 22 Stunden bebrüten; eine Schale Wasser im Brutkasten hält die Luft feucht.",
  "Klumpen auflockern, wieder einwickeln und nach 3 Stunden flach auf einem Blech ausbreiten, mit feuchtem Tuch weiter bebrüten.",
  "Steigt die Temperatur über 40 °C, auflockern und abkühlen lassen. Nach insgesamt 45 bis 50 Stunden ist jedes Korn weiß bepelzt und riecht süß.",
];

const TEMPEH_STEPS_END = [
  "Lauwarm den Essig untermischen; er senkt den pH-Wert und hält unerwünschte Bakterien fern.",
  "Den Starter gleichmäßig unterrühren.",
  "In Gefrierbeutel etwa 2,5 cm hoch füllen, nicht zu fest pressen und alle 2 bis 3 cm mit einer Nadel einstechen.",
  "Bei etwa 31 °C 24 bis 48 Stunden bebrüten. Nach 12 Stunden prüfen und die Heizung zurückdrehen: Tempeh wärmt sich selbst.",
  "Fertig, wenn ein fester, weißer Kuchen entstanden ist. Vor der Sporenbildung abbrechen; ein paar graue Stellen sind normal.",
];

export const KOJI = {
  koji: {
    family: "batch",
    group: "koji",
    label: "Koji",
    emoji: "🍚",
    blurb: "Reis mit Koji-Sporen, 2 Tage bei 30 bis 35 °C.",
    baseLabel: "Reis-Koji",
    defaultTemperature: 32,
    look: { vessel: "tray", color: "#f5f1e6", accent: "#d9cfb6", motif: "rice" },
    recipe: {
      makes: "etwa 600 g Koji",
      ingredients: [
        { amount: "500 g", item: "Rundkornreis" },
        { amount: "3 g", item: "Koji-Kin (Sporen von Aspergillus oryzae)" },
      ],
      steps: KOJI_STEPS,
    },
    care: [
      "Die Temperatur im Reis zählt, nicht die im Brutkasten: den Fühler in den Reis stecken.",
      "Koji erzeugt selbst Wärme. Über 40 °C wird es kritisch.",
      "Kondenswasser vom Deckel wischen, damit es nicht auf den Reis tropft.",
      "Gelbe oder grüne Flecken können Fremdschimmel oder Sporenbildung sein; im Zweifel neu anfangen.",
      "Fertig im Kühlschrank bis zu 3 Wochen, eingefroren bis zu 3 Monate.",
    ],
    source: { name: "Science Meets Food: Culturing Koji at Home", url: "https://sciencemeetsfood.org/koji-at-home/" },
    stages: [
      {
        label: "Bebrüten",
        readyDays: { from: hours(45), to: hours(50) },
        overripeDays: hours(60),
        tend: {
          everyHours: 8,
          todo: "Auflockern",
          done: "Aufgelockert",
          says: "Mir wird warm! Lockere mich auf und prüf die Temperatur.",
        },
        next: "Abgekühlt",
      },
      fridge(21, 28),
    ],
    variants: [
      {
        id: "gerste",
        label: "Gersten-Koji",
        blurb: "Mugi-Koji aus Perlgraupen, z. B. für Gerstenmiso.",
        look: { color: "#efe6cf" },
        recipe: {
          ingredients: [
            { amount: "500 g", item: "Perlgraupen" },
            { amount: "3 g", item: "Koji-Kin (Sporen von Aspergillus oryzae)" },
          ],
          steps: [
            "Graupen waschen, bis das Wasser klar ist, und über Nacht im Kühlschrank einweichen. Gut abtropfen lassen.",
            ...KOJI_STEPS.slice(1),
          ],
        },
      },
    ],
  },

  "shio-koji": {
    family: "batch",
    group: "koji",
    label: "Shio-Koji",
    emoji: "🧂",
    blurb: "Koji, Salz und Wasser: 1 bis 2 Wochen, täglich umrühren.",
    defaultTemperature: 22,
    look: { vessel: "jar", color: "#ece3c9", accent: "#cbbd99", motif: "rice" },
    recipe: {
      makes: "2 Gläser à 250 ml",
      ingredients: [
        { amount: "200 g", item: "Reis-Koji" },
        { amount: "60 g", item: "Meersalz (4 EL, 10 bis 30 % vom Koji), kein Tafelsalz" },
        { amount: "240 ml", item: "Wasser" },
      ],
      steps: [
        "Koji zerbröseln und zwischen den Händen reiben, bis die Körner einzeln sind und duften.",
        "Salz untermischen.",
        "Wasser einreiben; der Koji muss bedeckt sein, sonst etwas nachgießen.",
        "In saubere Gläser füllen, Deckel auflegen und bei Zimmertemperatur reifen lassen.",
        "Einmal täglich umrühren. Im Sommer ist er nach etwa einer Woche fertig, im Winter nach zwei: dicklich, süßlich duftend, nicht mehr scharf salzig.",
        "Im Kühlschrank bis zu 6 Monate haltbar.",
      ],
    },
    care: [
      "Wird er zu fest, etwas Wasser nachgießen.",
      "Wärme beschleunigt das Reifen.",
      "Als Marinade etwa 10 % vom Gewicht des Fleischs, Fischs oder Gemüses nehmen.",
    ],
    source: { name: "Just One Cookbook: How to Make Shio Koji", url: "https://www.justonecookbook.com/how-to-make-shio-koji/" },
    stages: [
      { label: "Reifen", readyDays: { from: 7, to: 14 }, overripeDays: 21, tend: stir(), next: "In den Kühlschrank gestellt" },
      fridge(180, 240),
    ],
  },

  miso: {
    family: "batch",
    group: "koji",
    label: "Miso",
    emoji: "🟤",
    blurb: "Sojabohnen, Koji und Salz: 6 bis 9 Monate reifen.",
    defaultTemperature: 18,
    look: { vessel: "tub", color: "#c8955a", accent: "#9aa0a6", motif: "stone" },
    recipe: {
      makes: "etwa 3 kg",
      ingredients: [
        { amount: "635 g", item: "getrocknete Sojabohnen" },
        { amount: "5 Tassen", item: "Reis-Koji" },
        { amount: "375 g", item: "Meersalz, plus ½ EL für oben" },
        { amount: "nach Bedarf", item: "gefiltertes Wasser" },
        { amount: "etwas", item: "Shochu oder Wodka zum Auswischen" },
      ],
      steps: [
        "Bohnen waschen und 18 Stunden in gefiltertem Wasser einweichen.",
        "Im Schnellkochtopf 20 Minuten unter Druck garen und natürlich abdampfen lassen, oder offen 3 bis 4 Stunden köcheln. Fertig, wenn sich eine Bohne zwischen Daumen und kleinem Finger leicht zerdrücken lässt.",
        "Bohnen portionsweise zerstampfen, möglichst ohne Kochwasser.",
        "Erst wenn sie lauwarm sind, Koji und Salz untermischen und gründlich kneten; Hitze tötet den Koji.",
        "Tennisballgroße Kugeln formen und luftfrei in ein mit Schnaps ausgewischtes Gefäß drücken.",
        "Oberfläche glatt streichen, ½ EL Salz darüberstreuen, mit Frischhaltefolie bedecken und mit etwa einem Drittel des Miso-Gewichts beschweren.",
        "Mit nicht luftdichtem Deckel kühl und dunkel mindestens 3 Monate reifen lassen.",
        "Nach 3 Monaten Schimmel abheben, von unten nach oben umrühren, neu abdecken und beschweren und weitere 3 Monate reifen lassen. Schmeckt es dir, in den Kühlschrank.",
      ],
    },
    care: [
      "Schimmel an der Oberfläche ist bei feuchtem Klima häufig: großzügig abheben.",
      "Im Sommer reift es schneller: alle 2 bis 3 Wochen umrühren und Schimmel entfernen.",
      "Ab und zu probieren; reif ist es nach 6 bis 9 Monaten.",
    ],
    source: { name: "Just One Cookbook: How To Make Miso", url: "https://www.justonecookbook.com/how-to-make-miso/" },
    stages: [
      {
        label: "Reifen",
        readyDays: { from: 180, to: 270 },
        overripeDays: 730,
        tend: {
          everyHours: 90 * 24,
          todo: "Durchsehen",
          done: "Durchgesehen",
          says: "Zeit für den Check: Schimmel abheben, einmal umrühren, neu beschweren.",
        },
      },
    ],
  },

  amazake: {
    family: "batch",
    group: "koji",
    label: "Amazake",
    emoji: "🍶",
    blurb: "Süßer Reistrunk aus Koji, 8 bis 10 Stunden bei 50 bis 60 °C.",
    defaultTemperature: 58,
    look: { vessel: "cup", cover: "cloth", color: "#f3ecdc", accent: "#d6cbb0", motif: "rice" },
    recipe: {
      makes: "etwa 700 ml",
      ingredients: [
        { amount: "180 ml", item: "japanischer Rundkornreis (1 Reiskocher-Becher)" },
        { amount: "nach Markierung", item: "Wasser für Reisbrei" },
        { amount: "240 ml", item: "Wasser zum Abkühlen" },
        { amount: "240 ml", item: "Reis-Koji (1 Tasse)" },
      ],
      steps: [
        "Reis waschen und im Reiskocher mit der Brei-Einstellung als Reisbrei kochen.",
        "Topf herausnehmen und nach und nach Wasser einrühren, bis der Brei 60 °C hat; heißer überlebt der Koji nicht.",
        "Koji zerbröseln und einrühren. Alles muss mit Flüssigkeit bedeckt sein, sonst etwas warmes Wasser dazu.",
        "Zurück in den Reiskocher, auf Warmhalten stellen, den Deckel offen lassen und mit einem Tuch abdecken.",
        "8 bis 10 Stunden ziehen lassen, ab und zu umrühren und in den ersten Stunden stündlich die Temperatur prüfen: immer 50 bis 60 °C.",
        "Riecht er süß, im Eiswasserbad abkühlen und in ein sauberes Gefäß füllen.",
        "Pur oder mit Wasser verdünnt trinken; höchstens lauwarm erwärmen.",
      ],
    },
    care: [
      "Über 60 °C stirbt das Enzym; zu kühl wird er sauer statt süß.",
      "Im Kühlschrank bis zu 1 Woche, eingefroren bis zu 1 Monat.",
      "Diese Art Amazake ist alkoholfrei.",
    ],
    source: { name: "Just One Cookbook: Amazake", url: "https://www.justonecookbook.com/amazake/" },
    stages: [
      {
        label: "Verzuckern",
        readyDays: { from: hours(8), to: hours(10) },
        overripeDays: hours(14),
        tend: stir(2, "Rühr mich um und prüf die Temperatur: 50 bis 60 °C."),
        next: "Abgekühlt",
      },
      fridge(7, 9),
    ],
  },

  tempeh: {
    family: "batch",
    group: "koji",
    label: "Tempeh",
    emoji: "🟫",
    blurb: "Sojabohnen mit Rhizopus, 24 bis 48 Stunden bei etwa 31 °C.",
    baseLabel: "Soja",
    defaultTemperature: 31,
    look: { vessel: "block", color: "#f2ede0", accent: "#d9b77a", motif: "soy" },
    recipe: {
      makes: "etwa 900 g",
      ingredients: [
        { amount: "500 g", item: "getrocknete Sojabohnen" },
        { amount: "2 EL", item: "Essig" },
        { amount: "nach Packung", item: "Tempeh-Starter (Rhizopus-Sporen)" },
      ],
      steps: [
        "Bohnen über Nacht einweichen, dann zwischen den Händen reiben und die Schalen abspülen.",
        "Köcheln, bis sie gar, aber noch fest sind. Gut abtropfen lassen und trocken dämpfen.",
        ...TEMPEH_STEPS_END,
      ],
    },
    care: [
      "Ab etwa 12 Stunden erzeugt er eigene Wärme; dann die Heizung reduzieren oder abschalten.",
      "Riecht er stark nach Ammoniak oder wird schleimig, ist etwas schiefgelaufen.",
      "Im Kühlschrank etwa eine Woche, eingefroren mehrere Monate.",
    ],
    source: { name: "Brød & Taylor: How to Make Tempeh", url: "https://brodandtaylor.com/blogs/recipes/how-to-make-tempeh" },
    stages: [
      {
        label: "Bebrüten",
        readyDays: { from: 1, to: 2 },
        overripeDays: 2.5,
        tend: {
          everyHours: 12,
          todo: "Temperatur prüfen",
          done: "Temperatur geprüft",
          says: "Mir wird selbst warm. Prüf die Temperatur und dreh die Heizung runter.",
        },
        next: "In den Kühlschrank gelegt",
      },
      fridge(7, 10),
    ],
    variants: [
      {
        id: "kichererbse",
        label: "Kichererbsen-Tempeh",
        blurb: "Aus Kichererbsen, nussig und mild.",
        look: { accent: "#e3c27d" },
        recipe: {
          ingredients: [
            { amount: "500 g", item: "getrocknete Kichererbsen" },
            { amount: "2 EL", item: "Essig" },
            { amount: "nach Packung", item: "Tempeh-Starter (Rhizopus-Sporen)" },
          ],
          steps: [
            "Kichererbsen über Nacht einweichen, halbieren und die Häute so gut es geht abreiben.",
            "Köcheln, bis sie gar, aber noch fest sind. Gut abtropfen lassen und trocken dämpfen.",
            ...TEMPEH_STEPS_END,
          ],
        },
      },
    ],
  },

  natto: {
    family: "batch",
    group: "koji",
    label: "Natto",
    emoji: "🥢",
    blurb: "Sojabohnen mit Natto-Bazillus: 24 Stunden bei 40 °C, dann 24 Stunden kalt.",
    defaultTemperature: 40,
    look: { vessel: "bowl", color: "#c9a066", accent: "#f4ead2", motif: "threads" },
    recipe: {
      makes: "etwa 1 kg",
      ingredients: [
        { amount: "380 g", item: "getrocknete Sojabohnen" },
        { amount: "1 Packung", item: "gekauftes Natto (tiefgekühlt), 60 g Natto vom letzten Mal oder 0,1 g Natto-Starter" },
        { amount: "1 EL", item: "gefiltertes Wasser" },
      ],
      steps: [
        "Bohnen über Nacht einweichen, bis sie prall sind, und das Wasser abgießen.",
        "Weich garen, im Schnellkochtopf oder auf dem Herd.",
        "Schüssel und Löffel mit heißem Wasser überbrühen und eine flache Form mit Frischhaltefolie auslegen.",
        "Bohnen gut abtropfen lassen und in die Form geben. Gekauftes Natto mit dem Wasser lockern, darüber verteilen und untermischen.",
        "Mit Küchenpapier, dann mit Folie abdecken und mit Gummibändern fixieren.",
        "24 Stunden bei 40 °C fermentieren, etwa im Joghurtbereiter oder Gärautomaten.",
        "Danach 24 Stunden im Kühlschrank nachreifen lassen. Dort hält es 2 Tage, sonst portionsweise einfrieren.",
      ],
    },
    care: [
      "Die Wärme muss gleichmäßig bleiben; ein Joghurtbereiter oder eine Gärbox ist sicherer als der Backofen.",
      "Natto vom letzten Mal höchstens dreimal als Starter nehmen, dann wieder gekauftes.",
      "Riecht es stark nach Ammoniak, war es zu lange oder zu warm.",
    ],
    source: { name: "Okonomi Kitchen: How to Make Homemade Natto", url: "https://www.okonomikitchen.com/how-to-make-natto/" },
    stages: [
      { label: "Fermentieren", readyDays: { from: 1, to: 1.1 }, overripeDays: 1.5, next: "In den Kühlschrank gestellt" },
      { label: "Nachreifen", readyDays: { from: 1, to: 3 }, overripeDays: 5, fixed: true },
    ],
  },
} satisfies Record<string, KindRules>;
