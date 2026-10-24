import { useEffect, useId, useState, type CSSProperties, type ReactNode } from "react";
import type { BatchMood } from "../../shared/batch.ts";
import type { CultureMood } from "../../shared/culture.ts";
import { KIND_RULES, resolve, stagesOf, type Cover, type Kind, type Motif, type Vessel } from "../../shared/kinds.ts";
import type { Mood } from "../../shared/mood.ts";

export type AnyMood = Mood | BatchMood | CultureMood;

/** Current time, refreshed every minute so the mood moves on while the page stays open. */
export function useNow(every = 60_000) {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), every);
    return () => clearInterval(timer);
  }, [every]);
  return now;
}

export const MOOD_LABEL: Record<AnyMood, string> = {
  egg: "Ei",
  full: "Satt",
  rising: "Wach",
  peak: "Höhepunkt",
  hungry: "Hungrig",
  starving: "Verhungert",
  sleeping: "Schläft",
  fresh: "Frisch angesetzt",
  bubbling: "Blubbert",
  burp: "Braucht dich",
  ready: "Bereit",
  overripe: "Überreif",
  done: "Fertig",
};

type Eyes = "dot" | "big" | "closed" | "x";
type Mouth = "smile" | "grin" | "flat" | "frown" | "o" | "wavy";

const FACE: Record<AnyMood, { eyes: Eyes; mouth: Mouth; cheeks?: boolean }> = {
  egg: { eyes: "dot", mouth: "flat" },
  full: { eyes: "closed", mouth: "smile", cheeks: true },
  rising: { eyes: "dot", mouth: "smile" },
  peak: { eyes: "big", mouth: "grin", cheeks: true },
  hungry: { eyes: "dot", mouth: "frown" },
  starving: { eyes: "x", mouth: "wavy" },
  sleeping: { eyes: "closed", mouth: "flat" },
  fresh: { eyes: "dot", mouth: "flat" },
  bubbling: { eyes: "dot", mouth: "smile" },
  burp: { eyes: "big", mouth: "o" },
  ready: { eyes: "big", mouth: "grin", cheeks: true },
  overripe: { eyes: "x", mouth: "wavy" },
  done: { eyes: "closed", mouth: "smile", cheeks: true },
};

/** How high a starter stands, 0 to 1. */
const LEVEL: Record<AnyMood, number> = {
  egg: 0,
  full: 0.38,
  rising: 0.6,
  peak: 0.86,
  hungry: 0.44,
  starving: 0.3,
  sleeping: 0.4,
  fresh: 0.72,
  bubbling: 0.72,
  burp: 0.76,
  ready: 0.72,
  overripe: 0.66,
  done: 0.72,
};

const BUBBLES = new Set<AnyMood>(["rising", "peak", "bubbling", "burp"]);

interface Shape {
  /** The inside the contents fill; everything in it is clipped to it. */
  inside: string;
  /** Where the surface stands when full and when empty. */
  top: number;
  bottom: number;
  /** Lowest the eyes go. */
  faceMax: number;
  /** A heap, a block or a barrel: no level, no glass. */
  solid?: boolean;
  cover: Cover;
}

const SHAPES: Record<Vessel, Shape> = {
  jar: {
    inside: "M28 18 H72 Q84 18 84 30 V102 Q84 114 72 114 H28 Q16 114 16 102 V30 Q16 18 28 18 Z",
    top: 22,
    bottom: 112,
    faceMax: 96,
    cover: "lid",
  },
  bottle: {
    inside: "M42 22 V30 Q42 40 30 46 Q22 51 22 62 V104 Q22 114 32 114 H68 Q78 114 78 104 V62 Q78 51 70 46 Q58 40 58 30 V22 Z",
    top: 36,
    bottom: 112,
    faceMax: 96,
    cover: "lid",
  },
  carboy: {
    inside: "M43 18 V34 Q18 42 14 72 Q12 112 50 114 Q88 112 86 72 Q82 42 57 34 V18 Z",
    top: 32,
    bottom: 112,
    faceMax: 92,
    cover: "airlock",
  },
  cup: { inside: "M24 40 H76 L72 108 Q71 114 64 114 H36 Q29 114 28 108 Z", top: 44, bottom: 112, faceMax: 98, cover: "none" },
  bowl: { inside: "M8 56 H92 Q90 96 64 112 H36 Q10 96 8 56 Z", top: 58, bottom: 110, faceMax: 90, cover: "none" },
  tray: { inside: "M14 92 Q18 48 50 44 Q82 48 86 92 Z", top: 44, bottom: 92, faceMax: 70, solid: true, cover: "none" },
  block: {
    inside: "M24 50 H76 Q86 50 86 60 V96 Q86 106 76 106 H24 Q14 106 14 96 V60 Q14 50 24 50 Z",
    top: 50,
    bottom: 106,
    faceMax: 76,
    solid: true,
    cover: "none",
  },
  tub: { inside: "M17 42 Q13 77 19 112 H81 Q87 77 83 42 Z", top: 42, bottom: 112, faceMax: 70, solid: true, cover: "none" },
};

/** The look of a kind in a variant and stage: kombucha moves into a bottle for its second fermentation. */
function lookFor(kind: Kind, variant: string | null | undefined, stage: number) {
  const look = resolve(kind, variant).look;
  const moved = KIND_RULES[kind].family === "batch" ? stagesOf(kind, variant)[stage]?.vessel : undefined;
  const vessel = moved ?? look.vessel;
  const cover = moved && moved !== look.vessel ? SHAPES[moved].cover : (look.cover ?? SHAPES[vessel].cover);
  return { ...look, vessel, cover };
}

/** The ferment in its vessel, with a face that follows its mood. */
export function Pet({
  kind,
  variant,
  stage = 0,
  mood,
  size = 120,
}: {
  kind: Kind;
  variant?: string | null;
  stage?: number;
  mood: AnyMood;
  size?: number;
}) {
  const clip = `st-clip-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const look = lookFor(kind, variant, stage);
  const shape = SHAPES[look.vessel];
  // Only a starter rises and falls; the rest stays put and bulges a little when it wants burping.
  const level = KIND_RULES[kind].family === "keep" ? LEVEL[mood] : mood === "burp" ? LEVEL.burp : LEVEL.bubbling;
  const surface = shape.solid ? shape.top : shape.bottom - (shape.bottom - shape.top) * level;
  const style = { "--st-tint": look.color, "--st-accent": look.accent ?? look.color } as CSSProperties;
  const motif = look.motif;
  return (
    <svg
      className={`st-pet st-pet-${mood}${look.dark ? " st-pet-dark" : ""}`}
      style={style}
      viewBox="0 0 100 120"
      width={size}
      height={size * 1.2}
      role="img"
      aria-label={`${KIND_RULES[kind].label}: ${MOOD_LABEL[mood]}`}
    >
      {mood === "egg" ? (
        <g className="st-pet-body">
          <ellipse cx="50" cy="72" rx="28" ry="36" className="st-pet-shell" />
          <path d="M34 62 l6 6 l6 -6 l6 6 l6 -6 l6 6" className="st-pet-line" />
        </g>
      ) : (
        <>
          <defs>
            <clipPath id={clip}>
              <path d={shape.inside} />
            </clipPath>
          </defs>
          <Behind vessel={look.vessel} inside={shape.inside} />
          <g className="st-pet-body">
            {look.vessel === "tub" ? (
              <Tub motif={motif} />
            ) : (
              <g clipPath={`url(#${clip})`}>
                <path
                  d={shape.solid ? shape.inside : `M0 ${surface} Q25 ${surface - 6} 50 ${surface} T100 ${surface} V120 H0 Z`}
                  className="st-pet-fill"
                />
                {motif && <Inside motif={motif} s={surface} />}
                {(mood === "hungry" || mood === "starving") && !shape.solid && (
                  <path d={`M22 ${surface - 14} H78 M24 ${surface - 22} H76`} className="st-pet-streak" />
                )}
                {BUBBLES.has(mood) && !shape.solid && (
                  <g className="st-pet-bubbles">
                    <circle cx="32" cy={shape.bottom - 8} r="2.5" />
                    <circle cx="66" cy={shape.bottom - 12} r="2" />
                    <circle cx="48" cy={shape.bottom - 4} r="1.6" />
                  </g>
                )}
              </g>
            )}
            {motif && <Above motif={motif} s={surface} />}
            <Face mood={mood} y={Math.min(surface + 22, shape.faceMax)} />
          </g>
          {!shape.solid && <path d={shape.inside} className="st-pet-outline" />}
          <Lid vessel={look.vessel} cover={look.cover} burp={mood === "burp"} bubbling={BUBBLES.has(mood)} />
          {mood === "sleeping" && (
            <text x="70" y="12" className="st-pet-zzz">
              z<tspan dx="1" dy="-5">z</tspan>
            </text>
          )}
          {(mood === "ready" || mood === "done") && (
            <path d="M84 10 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 l5 -2 z" className="st-pet-sparkle" />
          )}
        </>
      )}
    </svg>
  );
}

/** Glass behind the contents, or what a solid ferment sits on. */
function Behind({ vessel, inside }: { vessel: Vessel; inside: string }) {
  switch (vessel) {
    case "tray":
      return (
        <g>
          <rect x="6" y="88" width="88" height="22" rx="3" className="st-pet-wood" />
          <path d="M10 99 H90" className="st-pet-woodline" />
        </g>
      );
    case "block":
      return <path d="M2 106 Q50 88 98 106 Q50 122 2 106 Z" className="st-pet-leaf" />;
    case "tub":
      return null;
    default:
      return <path d={inside} className="st-pet-glass" />;
  }
}

/** A wooden barrel, open on top: miso under a stone, the nuka bed with vegetables sticking out. */
function Tub({ motif }: { motif?: Motif }) {
  return (
    <g>
      <path d={SHAPES.tub.inside} className="st-pet-wood" />
      <path d="M33 46 Q31 79 34 112 M50 48 V112 M67 46 Q69 79 66 112" className="st-pet-woodline" />
      <path d="M15 56 Q50 63 85 56 M17 99 Q50 106 83 99" className="st-pet-hoop" />
      {motif === "bran" && (
        <g>
          <path d="M37 44 L42 16 L47 44 Z" className="st-pet-carrot" />
          <path d="M42 16 l-4 -7 M42 16 v-8 M42 16 l4 -7" className="st-pet-stem" />
          <rect x="54" y="18" width="10" height="28" rx="5" className="st-pet-cucumber" />
        </g>
      )}
      <ellipse cx="50" cy="42" rx="33" ry="8" className="st-pet-fill" />
    </g>
  );
}

const hexagon = (cx: number, cy: number, r: number) =>
  `M${[0, 1, 2, 3, 4, 5]
    .map((i) => {
      const angle = (Math.PI / 3) * i + Math.PI / 6;
      return `${(cx + r * Math.cos(angle)).toFixed(1)} ${(cy + r * Math.sin(angle)).toFixed(1)}`;
    })
    .join(" L")} Z`;

const ginger = (x: number, y: number) => `M${x} ${y} q2 -8 9 -6 q2 -8 9 -3 q6 1 3 7 q-3 5 -10 4 q-8 4 -11 -2 z`;

function LemonSlice({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} className="st-pet-motif" />
      <path
        d={`M${cx - r * 0.75} ${cy} H${cx + r * 0.75} M${cx - r * 0.38} ${cy - r * 0.65} L${cx + r * 0.38} ${cy + r * 0.65} M${cx - r * 0.38} ${cy + r * 0.65} L${cx + r * 0.38} ${cy - r * 0.65}`}
        className="st-pet-motif-line"
      />
    </g>
  );
}

type Points = readonly (readonly [number, number])[];

/** What makes a kind recognisable in its vessel; `s` is where the surface stands. Clipped to the inside. */
function Inside({ motif, s }: { motif: Motif; s: number }): ReactNode {
  const dots = (points: readonly (readonly [number, number, number])[], className = "st-pet-motif") =>
    points.map(([cx, cy, r]) => <circle key={`${cx}-${cy}-${r}`} cx={cx} cy={s + cy} r={r} className={className} />);
  const squares = (points: Points, size: number, className = "st-pet-motif") =>
    points.map(([x, y]) => (
      <rect key={`${x}-${y}`} x={x} y={s + y} width={size} height={size} rx={size / 4} className={className} />
    ));
  const ovals = (points: Points, rx: number, ry: number, className = "st-pet-motif") =>
    points.map(([cx, cy]) => <ellipse key={`${cx}-${cy}`} cx={cx} cy={s + cy} rx={rx} ry={ry} className={className} />);
  switch (motif) {
    case "dough":
      return <g>{dots([[26, 10, 2.2], [74, 16, 1.8], [28, 46, 1.6], [70, 50, 2.4], [50, 56, 1.6]], "st-pet-motif-line")}</g>;
    case "ball":
      return <path d={`M42 ${s + 6} H58 M50 ${s - 1} V${s + 13}`} className="st-pet-motif-line" />;
    case "cabbage":
      return (
        <path
          d={`M20 ${s + 8} q6 -3 12 0 M66 ${s + 6} q6 -3 12 0 M22 ${s + 40} q6 -3 12 0 M66 ${s + 44} q6 -3 12 0 M42 ${s + 54} q6 -3 12 0 M22 ${s + 24} q4 -2 8 0 M70 ${s + 26} q4 -2 8 0`}
          className="st-pet-motif-line"
        />
      );
    case "kimchi":
      return (
        <g>
          <path
            d={`M20 ${s + 10} q8 -6 16 0 q-8 5 -16 0 M64 ${s + 8} q8 -6 16 0 q-8 5 -16 0 M40 ${s + 50} q10 -7 20 0 q-10 6 -20 0`}
            className="st-pet-motif"
          />
          {dots([[24, 40, 1.6], [76, 38, 1.6], [30, 56, 1.4], [70, 58, 1.6], [50, 62, 1.2]], "st-pet-dots")}
        </g>
      );
    case "radish":
      return <g>{squares([[19, 6], [70, 10], [21, 40], [69, 44], [45, 52]], 9)}</g>;
    case "cucumber":
      return (
        <g>
          <rect x="19" y={s + 6} width="12" height="40" rx="6" className="st-pet-motif" />
          <rect x="69" y={s + 10} width="12" height="38" rx="6" className="st-pet-motif" />
          {dots([[23, 14, 1], [27, 24, 1], [23, 34, 1], [73, 18, 1], [77, 28, 1], [73, 38, 1]], "st-pet-dots")}
          <path
            d={`M50 ${s + 44} v16 M50 ${s + 50} l-6 -4 M50 ${s + 50} l6 -4 M50 ${s + 56} l-5 -3 M50 ${s + 56} l5 -3`}
            className="st-pet-stem"
          />
        </g>
      );
    case "carrot":
      return (
        <g>
          {(
            [
              [19, 4, 46],
              [26, 10, 40],
              [67, 8, 42],
              [74, 4, 46],
            ] as const
          ).map(([x, y, h]) => (
            <rect key={x} x={x} y={s + y} width="6" height={h} rx="3" className="st-pet-motif" />
          ))}
        </g>
      );
    case "florets":
      return (
        <g>
          {dots([[22, 12, 4.5], [29, 8, 4.5], [30, 16, 4], [70, 44, 4.5], [77, 40, 4.5], [78, 48, 4]])}
          {dots([[47, 54, 5], [74, 14, 4]], "st-pet-carrot")}
        </g>
      );
    case "radishes": {
      const slices = [[25, 12], [75, 16], [28, 46], [72, 50], [50, 58]] as const;
      return (
        <g>
          {dots(slices.map(([x, y]) => [x, y, 6] as const))}
          {dots(slices.map(([x, y]) => [x, y, 3.6] as const), "st-pet-flesh")}
        </g>
      );
    }
    case "beans":
      return (
        <path
          d={`M22 ${s + 4} q4 22 0 44 M30 ${s + 10} q-3 18 1 36 M70 ${s + 8} q4 20 0 40 M78 ${s + 4} q-4 22 0 44`}
          className="st-pet-motif-thick"
        />
      );
    case "chili":
      return (
        <g>
          <path d={`M24 ${s + 6} q-7 20 4 42 q4 -20 1 -42 z`} className="st-pet-motif" />
          <path d={`M76 ${s + 8} q7 20 -4 40 q-4 -20 -1 -40 z`} className="st-pet-motif" />
          <path d={`M26 ${s + 7} l2 -5 M74 ${s + 9} l-2 -5`} className="st-pet-stem" />
        </g>
      );
    case "salsa":
      return (
        <g>
          {squares([[20, 8], [72, 12], [24, 44], [64, 52]], 6, "st-pet-flesh")}
          {dots([[30, 16, 2], [70, 40, 2], [48, 54, 2], [76, 26, 2]])}
          {dots([[22, 28, 2], [74, 54, 2], [56, 46, 2], [36, 58, 1.6]], "st-pet-dots")}
        </g>
      );
    case "tomato":
      return (
        <g>
          <circle cx="50" cy={s + 52} r="9" className="st-pet-motif" />
          <path d={`M45 ${s + 44} l5 3 l5 -3 M50 ${s + 47} v-5`} className="st-pet-stem" />
          {dots([[24, 12, 1.4], [76, 16, 1.4], [26, 44, 1.4], [74, 40, 1.4]], "st-pet-dots")}
        </g>
      );
    case "lemon":
      return (
        <g>
          <LemonSlice cx={25} cy={s + 44} r={9} />
          <LemonSlice cx={75} cy={s + 40} r={9} />
          <LemonSlice cx={27} cy={s + 10} r={7} />
        </g>
      );
    case "plum": {
      const plums = [[24, 12], [76, 16], [28, 46], [72, 48], [50, 58]] as const;
      return (
        <g>
          {dots(plums.map(([x, y]) => [x, y, 7] as const))}
          {dots(plums.map(([x, y]) => [x - 2, y - 2, 1.6] as const), "st-pet-flesh")}
        </g>
      );
    }
    case "scoby":
      return <rect x="14" y={s - 3} width="72" height="7" rx="3.5" className="st-pet-motif" />;
    case "grains":
      return (
        <g>
          {(
            [
              [22, 50],
              [70, 52],
              [46, 60],
              [76, 30],
            ] as const
          ).map(([cx, cy]) => (
            <g key={cx}>{dots([[cx, cy, 3.5], [cx + 5, cy - 2, 3], [cx + 2, cy + 4, 2.6]])}</g>
          ))}
        </g>
      );
    case "rice":
      return (
        <g>
          {(
            [
              [22, 8, 30],
              [30, 14, -20],
              [74, 10, 10],
              [70, 20, -35],
              [24, 40, 15],
              [76, 44, -15],
              [44, 50, 25],
              [56, 56, -10],
              [28, 56, 0],
              [72, 58, 40],
            ] as const
          ).map(([cx, cy, angle]) => (
            <ellipse
              key={`${cx}-${cy}`}
              cx={cx}
              cy={s + cy}
              rx="3.2"
              ry="1.6"
              transform={`rotate(${angle} ${cx} ${s + cy})`}
              className="st-pet-motif"
            />
          ))}
        </g>
      );
    case "soy":
    case "threads": {
      const beans = [[22, 10], [77, 12], [24, 40], [75, 42], [44, 50], [57, 54], [30, 54], [70, 28]] as const;
      return (
        <g>
          {ovals(beans, 4, 3.2)}
          <path d={beans.map(([cx, cy]) => `M${cx - 1.5} ${s + cy} h3`).join(" ")} className="st-pet-motif-line" />
          {motif === "threads" && (
            <path
              d={`M16 ${s + 5} q8 8 16 0 t16 0 t16 0 t16 0 t16 0 M20 ${s + 14} q6 6 12 0 M68 ${s + 16} q6 6 12 0`}
              className="st-pet-thread"
            />
          )}
        </g>
      );
    }
    case "honey":
      return (
        <g>
          <path d={`${hexagon(44, s + 52, 5.5)} ${hexagon(54, s + 52, 5.5)} ${hexagon(49, s + 43.5, 5.5)}`} className="st-pet-motif" />
          <path d={`M24 ${s + 6} q-5 8 0 10 q5 -2 0 -10 z M76 ${s + 30} q-5 8 0 10 q5 -2 0 -10 z`} className="st-pet-motif" />
        </g>
      );
    case "berries":
      return <g>{dots([[22, 10, 3.5], [28, 14, 3], [76, 14, 3.5], [24, 44, 3.5], [74, 46, 3.5], [70, 40, 3], [48, 56, 3.5], [55, 58, 3]])}</g>;
    case "apple":
      return (
        <g>
          {(
            [
              [25, 44],
              [75, 40],
            ] as const
          ).map(([cx, cy]) => (
            <g key={cx}>
              <circle cx={cx} cy={s + cy} r="7.5" className="st-pet-motif" />
              <path d={`M${cx} ${s + cy - 7} q1 -4 3 -5`} className="st-pet-stem" />
              <ellipse cx={cx + 4} cy={s + cy - 10} rx="3" ry="1.5" className="st-pet-leaf" />
            </g>
          ))}
        </g>
      );
    case "pineapple":
      return (
        <g>
          <path d={`M18 ${s + 42} l12 -14 l4 16 z M70 ${s + 10} l12 4 l-6 14 z M42 ${s + 50} l14 2 l-8 10 z`} className="st-pet-motif" />
          <path d={`M22 ${s + 38} l6 2 M26 ${s + 34} l4 6 M74 ${s + 16} l4 4 M46 ${s + 54} l6 2`} className="st-pet-motif-line" />
        </g>
      );
    case "ginger":
      return <path d={`${ginger(18, s + 46)} ${ginger(64, s + 22)} ${ginger(40, s + 58)}`} className="st-pet-motif" />;
    case "bread":
      return <g>{squares([[18, 8], [70, 10], [22, 44], [66, 48], [44, 54]], 9)}</g>;
    case "beet":
      return <g>{squares([[19, 8], [71, 12], [23, 42], [67, 46], [46, 54]], 8)}</g>;
    case "flower":
      return (
        <g>
          {(
            [
              [24, 3],
              [72, 5],
              [48, 52],
            ] as const
          ).map(([cx, cy]) => (
            <g key={cx}>
              {dots([
                [cx, cy, 1.8],
                [cx - 4, cy + 1, 1.6],
                [cx + 4, cy + 1, 1.6],
                [cx - 2, cy - 3, 1.6],
                [cx + 2, cy - 3, 1.6],
                [cx, cy + 4, 1.6],
              ])}
            </g>
          ))}
        </g>
      );
    case "seeds":
      return (
        <g>
          {dots(
            (
              [
                [20, 6],
                [26, 12],
                [22, 20],
                [30, 28],
                [74, 8],
                [78, 16],
                [72, 22],
                [76, 32],
                [22, 42],
                [28, 50],
                [72, 46],
                [78, 52],
                [40, 52],
                [50, 56],
                [60, 52],
                [46, 62],
              ] as const
            ).map(([x, y]) => [x, y, 1.6] as const),
          )}
        </g>
      );
    case "sprouts": {
      const grains = [[22, 44], [74, 40], [46, 56], [30, 58], [70, 58]] as const;
      return (
        <g>
          {ovals(grains, 3.4, 2)}
          <path d={grains.map(([cx, cy]) => `M${cx + 3} ${s + cy - 1} q3 -5 7 -4`).join(" ")} className="st-pet-stem" />
        </g>
      );
    }
    case "holes":
      return <g>{ovals([[20, 4], [33, 6], [65, 5], [79, 3], [26, 40], [73, 44], [50, 48]], 2.6, 1.5)}</g>;
    case "raisins":
      return (
        <g>
          <circle cx="27" cy={s + 4} r="7" className="st-pet-lemon" />
          {ovals([[62, 2], [70, 5], [78, 2], [44, 58]], 2.8, 1.9)}
        </g>
      );
    case "curds":
      // Lumps that stick out of the surface, like a strained cheese.
      return <g>{dots([[18, 2, 7], [29, -1, 6], [40, 3, 5], [62, 2, 5], [72, -1, 6], [83, 3, 7]])}</g>;
    default:
      return null;
  }
}

/** What sits on top or sticks out: a spoon, a dollop, the stone on the miso. Not clipped. */
function Above({ motif, s }: { motif: Motif; s: number }) {
  switch (motif) {
    case "spoon":
      return (
        <g>
          <path d={`M64 ${s + 4} L84 ${s - 30}`} className="st-pet-spoon-handle" />
          <ellipse cx="62" cy={s + 6} rx="7" ry="4" transform={`rotate(-30 62 ${s + 6})`} className="st-pet-spoon" />
        </g>
      );
    case "ropes":
      return (
        <g>
          <path d={`M58 ${s - 9} q-2 5 0 9 M62 ${s - 9} q2 5 0 9 M66 ${s - 8} q1 4 0 8`} className="st-pet-motif-line" />
          <path d={`M66 ${s - 12} L84 ${s - 40}`} className="st-pet-spoon-handle" />
          <ellipse cx="62" cy={s - 11} rx="7" ry="4" transform={`rotate(-30 62 ${s - 11})`} className="st-pet-spoon" />
        </g>
      );
    case "swirl":
      return (
        <g>
          <path d={`M32 ${s + 1} Q36 ${s - 14} 50 ${s - 14} Q64 ${s - 14} 68 ${s + 1} Z`} className="st-pet-swirl" />
          <path d={`M42 ${s - 6} q8 -7 16 0 M47 ${s - 11} q3 -3 6 0`} className="st-pet-motif-line" />
        </g>
      );
    case "stone":
      return <ellipse cx="50" cy="36" rx="16" ry="7" className="st-pet-stone" />;
    default:
      return null;
  }
}

/** Lid, cloth, swing top or airlock; a lid lifts when it needs burping. */
function Lid({ vessel, cover, burp, bubbling }: { vessel: Vessel; cover: Cover; burp: boolean; bubbling: boolean }) {
  if (cover === "none") return null;
  if (vessel === "bottle") {
    return (
      <g>
        <path d="M38 30 L35 42 M62 30 L65 42" className="st-pet-wire" />
        <rect x="40" y={burp ? 8 : 14} width="20" height="9" rx="3" className="st-pet-lid" />
      </g>
    );
  }
  if (vessel === "carboy") {
    return (
      <g>
        <rect x="41" y="12" width="18" height="8" rx="2" className="st-pet-lid" />
        <path d="M46 12 V5 Q46 1 50 1 Q54 1 54 5 V12" className="st-pet-wire" />
        {bubbling && <circle cx="50" cy="6" r="1.8" className="st-pet-airbubble" />}
      </g>
    );
  }
  // Jar, cup and bowl: their mouth is the top of the inside.
  const top = vessel === "jar" ? 18 : vessel === "cup" ? 40 : 56;
  const left = vessel === "jar" ? 16 : vessel === "cup" ? 24 : 8;
  const right = 100 - left;
  if (cover === "cloth") {
    return (
      <g>
        <path
          d={`M${left - 5} ${top + 4} Q${left - 2} ${top - 9} 50 ${top - 9} Q${right + 2} ${top - 9} ${right + 5} ${top + 4} L${right + 1} ${top + 8} Q50 ${top} ${left - 1} ${top + 8} Z`}
          className="st-pet-cloth"
        />
        <path d={`M${left} ${top + 3} Q50 ${top - 3} ${right} ${top + 3}`} className="st-pet-band" />
      </g>
    );
  }
  const y = top - 10 - (burp ? 6 : 0);
  return (
    <g>
      <rect x={left + 2} y={y} width={right - left - 4} height="10" rx="3" className="st-pet-lid" />
      {cover === "airlock" && (
        <g>
          <rect x="45" y={y - 9} width="10" height="10" rx="3" className="st-pet-airlock" />
          {bubbling && <circle cx="50" cy={y - 4} r="1.6" className="st-pet-airbubble" />}
        </g>
      )}
    </g>
  );
}

function Face({ mood, y }: { mood: AnyMood; y: number }) {
  const { eyes, mouth, cheeks } = FACE[mood];
  const m = y + 10;
  const eyePaths = {
    dot: null,
    big: null,
    closed: `M36 ${y} q4 3 8 0 M56 ${y} q4 3 8 0`,
    x: `M37 ${y - 3} l6 6 m0 -6 l-6 6 M57 ${y - 3} l6 6 m0 -6 l-6 6`,
  }[eyes];
  const mouthPath = {
    smile: `M44 ${m} q6 5 12 0`,
    grin: `M40 ${m - 1} q10 10 20 0 z`,
    flat: `M47 ${m} h6`,
    frown: `M45 ${m + 2} q5 -4 10 0`,
    o: "",
    wavy: `M42 ${m + 2} q2 -3 4 0 t4 0 t4 0 t4 0`,
  }[mouth];
  return (
    <g>
      {eyePaths ? (
        <path d={eyePaths} className="st-pet-line" />
      ) : (
        <g className="st-pet-ink">
          <circle cx="40" cy={y} r={eyes === "big" ? 3.6 : 3} />
          <circle cx="60" cy={y} r={eyes === "big" ? 3.6 : 3} />
        </g>
      )}
      {mouth === "o" ? (
        <ellipse cx="50" cy={m + 1} rx="3" ry="4" className="st-pet-line" />
      ) : (
        <path d={mouthPath} className={mouth === "grin" ? "st-pet-ink" : "st-pet-line"} />
      )}
      {cheeks && (
        <g className="st-pet-cheeks">
          <circle cx="32" cy={y + 6} r="3" />
          <circle cx="68" cy={y + 6} r="3" />
        </g>
      )}
    </g>
  );
}

/** A thin bar: hunger for what gets fed, progress for a batch. */
export function Meter({ value, label, warn }: { value: number; label: string; warn: boolean }) {
  const percent = Math.round(value * 100);
  return (
    <div
      className="st-meter"
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      data-warn={warn || undefined}
    >
      <span style={{ width: `${percent}%` }} />
    </div>
  );
}
