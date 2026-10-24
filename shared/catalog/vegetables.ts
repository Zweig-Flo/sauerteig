// Vegetables under brine or in a bed of bran.
import type { KindRules } from "../kinds.ts";
import { burp, check, fridge } from "./parts.ts";

const KIMCHI_CARE = [
  "Täglich kurz öffnen und mit einem sauberen Löffel herunterdrücken, damit Gas entweicht und alles im eigenen Saft liegt.",
  "Im Warmen geht es schneller, im Sommer reicht oft ein Tag.",
  "Im Kühlschrank reift es weiter und wird mit den Wochen saurer. Sehr saures Kimchi ist ideal für Kimchi-Jjigae oder Bratreis.",
  "Gochugaru kann auf der Haut brennen: beim Einstreichen Handschuhe tragen.",
];

const BRINE_STEPS_END = [
  "Salz in wenig kochendem Wasser lösen, mit kaltem Wasser auffüllen und abkühlen lassen.",
  "Die Lake über das Gemüse gießen, mit einem Gärgewicht unter Wasser halten und verschließen.",
  "Ohne direkte Sonne bei gleichmäßig 20 bis 22 °C gären lassen.",
  "Fertig in den Kühlschrank stellen.",
];

const BRINE_CARE = [
  "Die Lake wird trüb und prickelt: Das ist die Gärung und gehört dazu.",
  "Alles muss unter der Lake liegen, sonst schimmelt es.",
  "Weiße Kahmhefe abschöpfen. Pelziger, farbiger Schimmel: wegwerfen.",
  "Ab Tag 7 probieren, je länger, desto saurer.",
];

const PICKLE_STEPS = [
  "Topf oder Glas, Teller und Beschwerer mit kochendem Wasser ausbrühen.",
  "Gurken gründlich waschen, bei Bedarf abbürsten und mehrmals mit einer Nadel einstechen.",
  "Gurken lagenweise einschichten, Dill, Pfeffer, Lorbeer und die Blätter dazwischen verteilen. Die Blätter halten die Gurken knackig.",
  "Wasser mit dem Salz aufkochen, etwas abkühlen lassen und über die Gurken gießen, bis alles bedeckt ist.",
  "Mit einem Teller und einem Gewicht beschweren, damit nichts auftaucht, und mit einem Tuch abdecken.",
];

export const VEGETABLES = {
  sauerkraut: {
    family: "batch",
    group: "vegetables",
    label: "Sauerkraut",
    emoji: "🥬",
    blurb: "2 bis 6 Wochen unter Lake, mit Gärspund.",
    baseLabel: "Weißkohl",
    defaultTemperature: 20,
    look: { vessel: "jar", cover: "airlock", color: "#d3d98a", accent: "#8f9c3c", motif: "cabbage" },
    recipe: {
      makes: "1 Gärglas, gut 1 l",
      ingredients: [
        { amount: "1 kg", item: "Weißkohl, fest und frisch" },
        { amount: "20 g", item: "Salz ohne Jod und Rieselhilfe (2 % vom Kohl)" },
        { amount: "nach Wunsch", item: "1 TL Kümmel, 5 Wacholderbeeren, 1 Lorbeerblatt" },
      ],
      steps: [
        "Äußere Blätter abnehmen und zwei schöne beiseitelegen. Kohl vierteln, Strunk herausschneiden und in etwa 2 mm feine Streifen hobeln, nicht raspeln.",
        "Kohl wiegen, 2 % Salz abwiegen und mit den Gewürzen 5 bis 10 Minuten kräftig kneten oder stampfen, bis reichlich Saft austritt.",
        "Portionsweise fest ins heiß ausgespülte Glas drücken, bis der Saft darübersteht. 2 bis 3 cm Platz bis zum Rand lassen.",
        "Die beiseitegelegten Blätter obenauf legen und beschweren, sodass alles mindestens 1 cm unter Lake liegt. Reicht der Saft nicht, Lake aus 10 g Salz auf 500 ml abgekochtem Wasser nachgießen.",
        "Mit Gärspund oder locker aufgelegtem Deckel bei 18 bis 22 °C gären lassen, auf einem Teller gegen überlaufenden Saft.",
        "Ab der zweiten Woche probieren. Bei 21 bis 24 °C ist es nach 3 bis 4 Wochen durchgegoren, bei 15 bis 18 °C nach 5 bis 6. Dann kühl lagern.",
      ],
    },
    care: [
      "Das Kraut muss immer unter der Lake liegen; was herausschaut, verdirbt.",
      "In der ersten Woche riecht es oft unangenehm. Das ist normal und vergeht.",
      "Weißer Film auf der Lake ist meist Kahmhefe: abschöpfen. Rosa, schleimig, weich oder schimmelig: wegwerfen.",
      "Unter 15 °C gärt es kaum, über 24 °C wird es weich.",
    ],
    source: {
      name: "WSU Extension: Sauerkraut Making",
      url: "https://wpcdn.web.wsu.edu/wp-extension/uploads/sites/2057/2021/04/Sauerkraut-Making-directions.pdf",
    },
    stages: [{ label: "Gärung", readyDays: { from: 14, to: 42 }, overripeDays: 90, tend: check(72) }],
    variants: [
      {
        id: "rotkraut",
        label: "Rotkraut",
        blurb: "Rotkohl, etwa 2 Wochen, leuchtend pink.",
        look: { color: "#9b3f84", accent: "#e3a1cf" },
        recipe: {
          makes: "1 Gärglas, 3 l",
          ingredients: [
            { amount: "1", item: "Bio-Rotkohl, etwa 1,8 kg geputzt" },
            { amount: "36 g", item: "Salz (2 % vom geputzten Kohl)" },
            { amount: "bei Bedarf", item: "Lake: 20 g Salz in 1 l Wasser aufgekocht und abgekühlt" },
          ],
          steps: [
            "Rotkohl putzen, vierteln und fein hobeln.",
            "Mit dem Salz mindestens 15 Minuten kneten oder stampfen, bis Saft austritt. Handschuhe tragen, Rotkohl färbt.",
            "Schichtweise fest ins Gärglas drücken, mindestens 6 cm Rand frei lassen, den restlichen Saft darübergießen.",
            "Der Kohl soll etwa 1 cm hoch mit Lake bedeckt sein: bei Bedarf Lake nachgießen und mit Gewichten beschweren.",
            "Mit Gärspund etwa eine Woche bei Zimmertemperatur gären lassen.",
            "Dann eine Woche kühl stellen und alle paar Tage probieren. Fertig umfüllen; im Kühlschrank hält es 3 bis 6 Monate.",
          ],
        },
        source: { name: "LECKER: Fermentierter Rotkohl", url: "https://www.lecker.de/fermentierter-rotkohl-130959.html" },
        stages: [{ label: "Gärung", readyDays: { from: 7, to: 21 }, overripeDays: 60, tend: check(72) }],
      },
      {
        id: "curtido",
        label: "Curtido",
        blurb: "Salvadorianischer Krautsalat mit Möhre, Zwiebel, Jalapeño und Oregano.",
        look: { color: "#d6d58a", accent: "#e07b2a" },
        recipe: {
          makes: "1 Gärglas, 1,5 l",
          ingredients: [
            { amount: "1", item: "Weißkohl, etwa 1 kg" },
            { amount: "200 g", item: "Möhren" },
            { amount: "1", item: "Zwiebel, etwa 100 g" },
            { amount: "½ bis 1", item: "Jalapeño" },
            { amount: "1 TL", item: "getrockneter Oregano" },
            { amount: "2 %", item: "Salz vom Gesamtgewicht, rund 26 g" },
          ],
          steps: [
            "Kohl, Zwiebel und Jalapeño fein schneiden, Möhren raspeln.",
            "Alles wiegen und mit 2 % Salz und dem Oregano mischen.",
            "Ein paar Minuten kneten, bis Lake austritt, oder 15 Minuten ziehen lassen.",
            "Fest ins Gärglas drücken und mit Gewicht oder einem Kohlblatt unter der Lake halten.",
            "Deckel locker auflegen oder Gärspund nutzen und 3 bis 6 Wochen gären lassen, je nachdem, wie sauer du ihn magst.",
            "Angebrochen im Kühlschrank lagern, dort hält er bis zu einem Jahr.",
          ],
        },
        source: {
          name: "Revolution Fermentation: Fermented Curtido",
          url: "https://revolutionfermentation.com/en/blogs/fermented-vegetables/curtido-salvadoran-sauerkraut/",
        },
        stages: [{ label: "Gärung", readyDays: { from: 7, to: 42 }, overripeDays: 90, tend: check(72) }],
      },
      {
        id: "sauerrueben",
        label: "Sauerrüben",
        blurb: "Geraspelte weiße Rüben oder Steckrüben, wie Kraut vergoren.",
        look: { color: "#ece0b8", accent: "#9a6ab0" },
        recipe: {
          makes: "1 Glas, 1 l",
          ingredients: [
            { amount: "1 kg", item: "weiße Rüben (Mairüben, Teltower Rübchen) oder Steckrüben" },
            { amount: "20 g", item: "Meersalz (2 %)" },
          ],
          steps: [
            "Rüben schälen und mittelgrob raspeln; zu fein wird matschig, zu grob gibt keinen Saft.",
            "Mit dem Salz 5 bis 10 Minuten kräftig massieren, bis sich Lake sammelt.",
            "Fest ins Glas drücken, bis die Rüben unter ihrer eigenen Lake liegen, und beschweren.",
            "Bei etwa 20 °C rund zwei Wochen gären lassen, dann nach Geschmack kühl stellen.",
          ],
        },
        source: {
          name: "The Fermentary: Sauerruben",
          url: "https://www.thefermentary.com.au/blogs/kimchi-kraut-and-vegetables/sauerruben-fermented-turnips",
        },
        stages: [{ label: "Gärung", readyDays: { from: 10, to: 28 }, overripeDays: 60, tend: check(72) }],
      },
    ],
  },

  kimchi: {
    family: "batch",
    group: "vegetables",
    label: "Kimchi",
    emoji: "🌶️",
    blurb: "1 bis 3 Tage warm, dann im Kühlschrank; will entlüftet werden.",
    baseLabel: "Chinakohl",
    defaultTemperature: 20,
    look: { vessel: "jar", color: "#d9542c", accent: "#f3e3b5", motif: "kimchi" },
    recipe: {
      makes: "gut 1,5 kg, ein großes Glas",
      ingredients: [
        { amount: "1", item: "Chinakohl, etwa 1,5 kg" },
        { amount: "60 g", item: "grobes Salz" },
        { amount: "250 ml", item: "Wasser, 1 EL Klebreismehl und 1 EL Zucker für den Brei" },
        { amount: "100 g", item: "Gochugaru (koreanische Chiliflocken), weniger für mild" },
        { amount: "60 ml", item: "Fischsauce" },
        { amount: "12", item: "Knoblauchzehen" },
        { amount: "1 TL", item: "geriebener Ingwer" },
        { amount: "½", item: "Zwiebel" },
        { amount: "150 g", item: "koreanischer Rettich oder Daikon, in Streifen" },
        { amount: "50 g", item: "Möhre, in Streifen" },
        { amount: "4", item: "Frühlingszwiebeln" },
      ],
      steps: [
        "Chinakohl längs halbieren, am Strunk einschneiden und in Viertel reißen. Blätter anfeuchten und das Salz dazwischenstreuen, mehr zum dicken Strunkende hin.",
        "2 Stunden ziehen lassen und alle 30 Minuten wenden. Dann dreimal gründlich kalt abspülen und gut abtropfen lassen.",
        "Klebreismehl im Wasser glatt rühren, unter Rühren zu einem dünnen Brei aufkochen, Zucker einrühren und abkühlen lassen.",
        "Knoblauch, Ingwer und Zwiebel fein pürieren und mit Fischsauce, Gochugaru und dem kalten Brei verrühren. Rettich, Möhre und Frühlingszwiebeln untermischen.",
        "Mit Handschuhen die Paste Blatt für Blatt auf den Kohl streichen, jedes Viertel einschlagen und dicht ins Glas schichten. Fest andrücken.",
        "Verschlossen 1 bis 2 Tage bei Zimmertemperatur gären lassen, bis es säuerlich riecht und Bläschen zeigt, dann in den Kühlschrank.",
      ],
    },
    care: KIMCHI_CARE,
    source: { name: "Maangchi: Tongbaechu-kimchi", url: "https://www.maangchi.com/recipe/tongbaechu-kimchi" },
    stages: [
      { label: "Gärung", readyDays: { from: 1, to: 3 }, overripeDays: 5, tend: burp(), next: "In den Kühlschrank gestellt" },
      fridge(30, 90),
    ],
    variants: [
      {
        id: "kkakdugi",
        label: "Kkakdugi",
        blurb: "Rettich in Würfeln, knackig und saftig.",
        look: { color: "#e0663c", accent: "#f6ecdc", motif: "radish" },
        recipe: {
          makes: "gut 2 kg",
          ingredients: [
            { amount: "1,8 kg", item: "koreanischer Rettich oder Daikon" },
            { amount: "2 EL", item: "grobes Salz" },
            { amount: "2 EL", item: "Zucker" },
            { amount: "4 EL", item: "Fischsauce, vegetarisch Sojasauce" },
            { amount: "60 g", item: "Gochugaru, 25 g für mild" },
            { amount: "4", item: "Frühlingszwiebeln" },
            { amount: "6", item: "Knoblauchzehen" },
            { amount: "1 TL", item: "geriebener Ingwer" },
          ],
          steps: [
            "Rettich schälen und in 2 bis 2,5 cm große Würfel schneiden.",
            "Mit Salz und Zucker mischen und 30 Minuten ziehen lassen. Den Saft abgießen und ein paar Esslöffel davon aufheben.",
            "Knoblauch fein hacken, Frühlingszwiebeln schneiden und mit Ingwer, Fischsauce, Gochugaru und etwas Rettichsaft zur Paste rühren.",
            "Rettich gründlich mit der Paste mischen und dicht ins Glas drücken.",
            "Sofort essen oder ein paar Tage bei Zimmertemperatur gären lassen, bis Bläschen kommen und es säuerlich riecht, dann in den Kühlschrank.",
          ],
        },
        source: { name: "Maangchi: Kkakdugi", url: "https://www.maangchi.com/recipe/kkakdugi" },
      },
      {
        id: "oi-sobagi",
        label: "Oi-Sobagi",
        blurb: "Gefüllte Gurken, frisch oder nach 1 bis 2 Tagen.",
        look: { color: "#d9603a", accent: "#6f9a3c", motif: "cucumber" },
        recipe: {
          makes: "8 gefüllte Gurken",
          ingredients: [
            { amount: "8", item: "kleine Einlegegurken" },
            { amount: "1 EL", item: "grobes Salz" },
            { amount: "100 g", item: "Schnittknoblauch (Buchu) oder Schnittlauch" },
            { amount: "1", item: "kleine Möhre" },
            { amount: "½", item: "Zwiebel" },
            { amount: "4", item: "Knoblauchzehen" },
            { amount: "3 EL", item: "Gochugaru" },
            { amount: "2 EL", item: "Fischsauce" },
            { amount: "1 TL", item: "Zucker und 1 TL Sesam" },
          ],
          steps: [
            "Gurken waschen, die Enden abschneiden und jede längs über Kreuz einschneiden; an beiden Enden 1 cm ganz lassen.",
            "Mit Salz einreiben, 20 Minuten ziehen lassen, abspülen und abtropfen.",
            "Schnittknoblauch, Möhre und Zwiebel fein schneiden und mit Knoblauch, Gochugaru, Fischsauce, Zucker und Sesam mischen.",
            "Die Füllung mit Handschuhen in die Gurken drücken und die Gurken ins Glas legen.",
            "Frisch essen oder 1 bis 2 Tage bei Zimmertemperatur säuern lassen, dann kühl stellen und bald essen.",
          ],
        },
        source: { name: "Maangchi: Oi-sobagi", url: "https://www.maangchi.com/recipe/oisobagi-kimchi" },
        stages: [
          { label: "Gärung", readyDays: { from: 0.5, to: 2 }, overripeDays: 3, tend: burp(), next: "In den Kühlschrank gestellt" },
          fridge(7, 14),
        ],
      },
      {
        id: "baek",
        label: "Baek-Kimchi",
        blurb: "Weißes Kimchi ohne Chili, mild und vegetarisch.",
        look: { color: "#efe9d2", accent: "#9bb86a" },
        recipe: {
          makes: "1 großes Glas, gut 3 l",
          ingredients: [
            { amount: "1", item: "Chinakohl, etwa 2 kg" },
            { amount: "70 g", item: "grobes Salz, plus etwas für die Lake" },
            { amount: "200 g", item: "koreanischer Rettich" },
            { amount: "1", item: "Möhre" },
            { amount: "1 Handvoll", item: "Schnittknoblauch" },
            { amount: "4", item: "getrocknete Jujube (rote Datteln)" },
            { amount: "1", item: "asiatische Birne" },
            { amount: "½", item: "Zwiebel, 6 Knoblauchzehen, 2 cm Ingwer" },
            { amount: "1 l", item: "Wasser" },
          ],
          steps: [
            "Kohl vierteln und wie beim roten Kimchi zwischen den Blättern salzen, 2 Stunden ziehen lassen, dabei wenden, dann abspülen und abtropfen.",
            "Rettich, Möhre und Jujube in feine Streifen schneiden, Schnittknoblauch in Stücke, mischen und zwischen die Blätter stecken.",
            "Birne, Zwiebel, Knoblauch und Ingwer pürieren, durch ein Tuch ins Wasser drücken und die Lake leicht salzen.",
            "Kohlviertel ins Glas legen und mit der Lake bedecken.",
            "1½ bis 3 Tage bei Zimmertemperatur lassen, bis die Lake säuerlich schmeckt, dann in den Kühlschrank. Dort hält es etwa einen Monat.",
          ],
        },
        source: { name: "Maangchi: White kimchi (Baek-kimchi)", url: "https://www.maangchi.com/recipe/baekkimchi" },
        stages: [
          { label: "Gärung", readyDays: { from: 1.5, to: 3 }, overripeDays: 5, tend: burp(), next: "In den Kühlschrank gestellt" },
          fridge(30, 45),
        ],
      },
    ],
  },

  "salt-pickles": {
    family: "batch",
    group: "vegetables",
    label: "Salzgurken",
    emoji: "🥒",
    blurb: "1 bis 2 Wochen in Salzlake, mit Dill.",
    defaultTemperature: 20,
    look: { vessel: "jar", color: "#cfd59a", accent: "#5f8a3a", motif: "cucumber" },
    recipe: {
      makes: "1 Steintopf oder großes Glas, gut 1,5 l",
      ingredients: [
        { amount: "1 kg", item: "kleine Einlegegurken" },
        { amount: "1 l", item: "Wasser" },
        { amount: "50 g", item: "Salz ohne Jod" },
        { amount: "1 Handvoll", item: "Dill, möglichst ohne Blüten" },
        { amount: "1 EL", item: "Pfefferkörner" },
        { amount: "4", item: "Lorbeerblätter" },
        { amount: "1 Handvoll", item: "Johannisbeer- oder Weinblätter" },
      ],
      steps: [
        ...PICKLE_STEPS,
        "Bei etwa 20 °C ein bis zwei Wochen gären lassen und zwischendurch eine Gurke probieren, dann kühl stellen.",
      ],
    },
    care: [
      "Die Gurken müssen die ganze Zeit unter der Lake bleiben.",
      "Weiße Kahmhaut auf der Lake abschöpfen oder mit Küchenpapier abnehmen, dann die Gurken wieder bedecken.",
      "Nur mit Zange oder sauberer Gabel herausnehmen, nie mit den Fingern.",
      "Weiche, schleimige oder faulig riechende Gurken wegwerfen.",
    ],
    source: {
      name: "Utopia: Salzgurken einlegen im Steintopf",
      url: "https://utopia.de/ratgeber/salzgurken-einlegen-ein-rezept-fuer-den-steintopf_100586/",
    },
    stages: [
      { label: "Gärung", readyDays: { from: 7, to: 14 }, overripeDays: 21, tend: check(72), next: "Kühl gestellt" },
      fridge(120, 180, "Kühl gelagert"),
    ],
    variants: [
      {
        id: "halbsauer",
        label: "Halbsauer",
        blurb: "Nur 3 bis 4 Tage gären, bleiben grün und knackig.",
        look: { color: "#d8e3a4" },
        recipe: {
          steps: [
            ...PICKLE_STEPS,
            "Nach 3 bis 4 Tagen, wenn sie innen noch hell und knackig sind, in den Kühlschrank stellen und innerhalb von drei Wochen essen.",
          ],
        },
        stages: [
          { label: "Gärung", readyDays: { from: 3, to: 4 }, overripeDays: 7, tend: check(48), next: "Kühl gestellt" },
          fridge(21, 42),
        ],
      },
    ],
  },

  "brine-veg": {
    family: "batch",
    group: "vegetables",
    label: "Gemüse in Lake",
    emoji: "🥕",
    blurb: "Möhren und anderes Gemüse in 2-%-Lake, 1 bis 2 Wochen.",
    baseLabel: "Möhren",
    defaultTemperature: 21,
    look: { vessel: "jar", cover: "airlock", color: "#f2e2b8", accent: "#e8782a", motif: "carrot" },
    recipe: {
      makes: "1 Glas, 1 l",
      ingredients: [
        { amount: "400 g", item: "Möhren" },
        { amount: "2", item: "Kardamomkapseln, angedrückt" },
        { amount: "750 ml", item: "Wasser, gefiltert oder abgekocht" },
        { amount: "15 g", item: "Salz (2 %)" },
      ],
      steps: ["Möhren schälen und in Stifte schneiden, mit dem Kardamom aufrecht ins Glas stellen.", ...BRINE_STEPS_END],
    },
    care: [...BRINE_CARE, "Möhren sind nach 10 Tagen bis 2 Wochen fertig und halten gekühlt 4 bis 6 Monate."],
    source: {
      name: "Worcestershire County Council: Fermented carrot sticks",
      url: "https://www.worcestershire.gov.uk/lets-waste-less/foodsavvy/recipes/fermented-carrot-sticks",
    },
    stages: [
      { label: "Gärung", readyDays: { from: 10, to: 14 }, overripeDays: 30, next: "In den Kühlschrank gestellt" },
      fridge(150, 180),
    ],
    variants: [
      {
        id: "mixed-pickles",
        label: "Mixed Pickles",
        blurb: "Blumenkohl, Möhre, Paprika und Perlzwiebeln gemischt.",
        look: { color: "#f1e5bf", accent: "#f6f0de", motif: "florets" },
        recipe: {
          ingredients: [
            { amount: "400 g", item: "Gemüse: Blumenkohlröschen, Möhrenscheiben, Paprika, Perlzwiebeln" },
            { amount: "1 TL", item: "Senfkörner" },
            { amount: "1", item: "Lorbeerblatt" },
            { amount: "750 ml", item: "Wasser, gefiltert oder abgekocht" },
            { amount: "15 g", item: "Salz (2 %)" },
          ],
          steps: ["Gemüse in mundgerechte Stücke schneiden und mit den Gewürzen dicht ins Glas schichten.", ...BRINE_STEPS_END],
        },
        stages: [
          { label: "Gärung", readyDays: { from: 7, to: 14 }, overripeDays: 30, next: "In den Kühlschrank gestellt" },
          fridge(120, 180),
        ],
      },
      {
        id: "radieschen",
        label: "Radieschen",
        blurb: "Halbierte Radieschen, färben die Lake rosa.",
        look: { color: "#f3c9cf", accent: "#d2344f", motif: "radishes" },
        recipe: {
          ingredients: [
            { amount: "400 g", item: "Radieschen" },
            { amount: "2", item: "Knoblauchzehen" },
            { amount: "1 Zweig", item: "Dill" },
            { amount: "750 ml", item: "Wasser, gefiltert oder abgekocht" },
            { amount: "15 g", item: "Salz (2 %)" },
          ],
          steps: ["Radieschen putzen, halbieren und mit Knoblauch und Dill ins Glas geben.", ...BRINE_STEPS_END],
        },
        care: [...BRINE_CARE, "Radieschen riechen beim Gären schwefelig; das verfliegt nach dem Öffnen."],
        stages: [
          { label: "Gärung", readyDays: { from: 5, to: 10 }, overripeDays: 20, next: "In den Kühlschrank gestellt" },
          fridge(60, 90),
        ],
      },
    ],
  },

  "sour-beans": {
    family: "batch",
    group: "vegetables",
    label: "Sauerbohnen",
    emoji: "🫛",
    blurb: "Gekochte grüne Bohnen in Lake, 3 bis 5 Wochen.",
    defaultTemperature: 20,
    look: { vessel: "jar", color: "#d6dca6", accent: "#4f8a3a", motif: "beans" },
    recipe: {
      makes: "2 Gläser à 750 ml",
      ingredients: [
        { amount: "1 kg", item: "grüne Bohnen (Busch- oder Stangenbohnen)" },
        { amount: "1 l", item: "Wasser, gefiltert oder abgekocht" },
        { amount: "16 g", item: "Salz ohne Jod" },
        { amount: "2 Zweige", item: "Bohnenkraut" },
        { amount: "2", item: "Knoblauchzehen" },
        { amount: "1 TL", item: "Senfkörner" },
      ],
      steps: [
        "Bohnen waschen, Enden abschneiden und ganz lassen oder in Stücke schneiden.",
        "8 bis 10 Minuten in leicht gesalzenem Wasser kochen und sofort in Eiswasser abschrecken. Rohe Bohnen enthalten giftiges Phasin, das erst durch Erhitzen zerfällt.",
        "Salz im Wasser vollständig auflösen.",
        "Bohnen mit Bohnenkraut, Knoblauch und Senfkörnern in heiß ausgespülte Gläser schichten.",
        "Mit Lake bedecken, 2 bis 3 cm Rand lassen und verschließen.",
        "Dunkel bei 19 bis 22 °C etwa 4 bis 5 Wochen gären lassen, in den ersten Tagen Gas ablassen. Ab Tag 4 darf probiert werden.",
      ],
    },
    care: [
      "Bohnen nie roh fermentieren, immer erst kochen.",
      "Die Bohnen müssen stets mit Lake bedeckt sein.",
      "In den ersten Tagen den Deckel kurz öffnen, damit Gas entweicht.",
      "Fertig im Kühlschrank lagern, dort halten sie mehrere Monate.",
    ],
    source: { name: "Gartenjournal: Buschbohnen fermentieren", url: "https://www.gartenjournal.net/buschbohnen-fermentieren" },
    stages: [
      { label: "Gärung", readyDays: { from: 21, to: 35 }, overripeDays: 60, next: "In den Kühlschrank gestellt" },
      fridge(120, 180),
    ],
  },

  salsa: {
    family: "batch",
    group: "vegetables",
    label: "Fermentierte Salsa",
    emoji: "🍅",
    blurb: "Tomaten, Zwiebel, Chili: 3 Tage, dann kalt.",
    defaultTemperature: 21,
    look: { vessel: "jar", cover: "airlock", color: "#d8452f", accent: "#7bb04a", motif: "salsa" },
    recipe: {
      makes: "2 Gläser à 500 ml",
      ingredients: [
        { amount: "700 g", item: "Tomaten" },
        { amount: "1", item: "kleine Zwiebel" },
        { amount: "1", item: "Paprika" },
        { amount: "½", item: "Jalapeño" },
        { amount: "7", item: "Knoblauchzehen" },
        { amount: "¾ TL", item: "gemahlener Kreuzkümmel" },
        { amount: "½ Bund", item: "Koriander, nach Wunsch" },
        { amount: "1 EL", item: "Limettensaft" },
        { amount: "1 EL", item: "Salz, etwa 17 g" },
      ],
      steps: [
        "Tomaten vierteln und im Mixer grob hacken, nicht pürieren.",
        "Zwiebel, Paprika, Jalapeño und Knoblauch ebenso grob hacken und dazugeben.",
        "Kreuzkümmel, Koriander, Limettensaft und Salz unterrühren.",
        "In saubere Gläser füllen, mit Gärgewichten unter die Flüssigkeit drücken und gut 1 cm Rand lassen.",
        "Mit Gärdeckel 3 Tage bei Zimmertemperatur stehen lassen, dann probieren.",
        "Ist sie angenehm säuerlich, in den Kühlschrank, sonst einen Tag länger warten.",
      ],
    },
    care: [
      "Die Feststoffe so gut es geht unter der Flüssigkeit halten.",
      "Ohne Gärdeckel einmal täglich kurz öffnen.",
      "Bei Schimmel oder fauligem Geruch wegwerfen.",
      "Im Kühlschrank hält sie mehrere Monate.",
    ],
    source: { name: "Melissa K. Norris: Fermented Salsa", url: "https://melissaknorris.com/fermented-salsa/" },
    stages: [
      { label: "Gärung", readyDays: { from: 2, to: 4 }, overripeDays: 7, tend: burp(), next: "In den Kühlschrank gestellt" },
      fridge(60, 90),
    ],
  },

  nukazuke: {
    family: "culture",
    group: "vegetables",
    label: "Nuka-Beet",
    emoji: "🍙",
    blurb: "Reiskleie-Beet für Gemüse, will täglich umgerührt werden.",
    defaultTemperature: 22,
    look: { vessel: "tub", color: "#c9995e", motif: "bran" },
    recipe: {
      makes: "1 Beet für eine Box mit etwa 3 l",
      ingredients: [
        { amount: "680 g", item: "Reiskleie (oder Weizenkleie)" },
        { amount: "90 g", item: "Meersalz, rund 13 % der Kleie" },
        { amount: "700 ml", item: "gefiltertes Wasser, mehr nach Bedarf" },
        { amount: "1 Scheibe", item: "Brot" },
        { amount: "4", item: "Knoblauchzehen" },
        { amount: "5 cm", item: "Ingwer" },
        { amount: "10 × 10 cm", item: "Kombu, in Streifen" },
        { amount: "4", item: "getrocknete Chilis, entkernt" },
        { amount: "einige", item: "Gemüsereste zum Anfüttern: Kohlblätter, Möhren, Rettich" },
      ],
      steps: [
        "Salz im Wasser lösen und abkühlen lassen.",
        "Kleie in einer Pfanne bei mittlerer Hitze etwa 10 Minuten unter Rühren rösten, bis sie duftet, und abkühlen lassen.",
        "Das Salzwasser nach und nach mit den Händen unterarbeiten, bis sich die Kleie wie feuchter Sand anfühlt.",
        "Brot, Knoblauch und Ingwer fein hacken und mit Kombu und Chilis untermischen.",
        "Gemüsereste vergraben, die Oberfläche glatt drücken und mit einem Tuch abdecken.",
        "Zwei Wochen lang täglich von unten nach oben umrühren und die Reste alle zwei Tage tauschen, bis das Beet erdig und würzig riecht.",
        "Dann Gemüse einlegen: kleine Stücke 2 bis 4 Stunden, große 6 bis 8 Stunden oder über Nacht. Kleie abstreifen, abspülen, essen.",
      ],
    },
    care: [
      "Täglich mit sauberen Händen umrühren, im Sommer zweimal.",
      "Nicht länger als etwa drei Tage leer stehen lassen.",
      "Zu nass: Flüssigkeit mit Küchenpapier abnehmen und Kleie mit 13 % Salz nachfüllen.",
      "Weißer Belag oben: abheben, etwas Senfpulver einrühren und zweimal täglich umrühren. Schimmel im Inneren: wegwerfen.",
      "Pause im Kühlschrank: Gemüse herausnehmen und mit Senfpulver und einer Schicht Salz bedecken. Danach eine Woche mit Resten wieder anfüttern.",
    ],
    source: {
      name: "Garden Betty: How to Make Nukadoko",
      url: "https://gardenbetty.com/how-to-make-nukadoko-fermented-rice-bran-bed-for-pickling/",
    },
    feed: {
      done: "Umgerührt",
      todo: "Umrühren",
      readyHours: 20,
      hungryHours: 30,
      starvingHours: 72,
      fridgeDays: { hungry: 10, starving: 14 },
    },
  },
} satisfies Record<string, KindRules>;
