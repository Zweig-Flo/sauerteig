import { useEffect, useState } from "react";
import type { BatchMood } from "../../shared/batch.ts";
import type { Kind } from "../../shared/kinds.ts";
import type { Mood } from "../../shared/mood.ts";

export type AnyMood = Mood | BatchMood;

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
  burp: "Entlüften!",
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

/** How high the contents stand in the jar, 0 to 1. Batches stay put, a starter rises and falls. */
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

/** The ferment in its jar, with a face that follows its mood. */
export function Pet({ kind, mood, size = 120 }: { kind: Kind; mood: AnyMood; size?: number }) {
  const top = 22;
  const bottom = 112;
  const surface = bottom - (bottom - top) * LEVEL[mood];
  return (
    <svg
      className={`st-pet st-pet-${mood} st-pet-kind-${kind}`}
      viewBox="0 0 100 120"
      width={size}
      height={size * 1.2}
      role="img"
      aria-label={`${MOOD_LABEL[mood]}`}
    >
      {mood === "egg" ? (
        <g className="st-pet-body">
          <ellipse cx="50" cy="72" rx="28" ry="36" className="st-pet-shell" />
          <path d="M34 62 l6 6 l6 -6 l6 6 l6 -6 l6 6" className="st-pet-line" />
        </g>
      ) : (
        <>
          <rect x="18" y={mood === "burp" ? 2 : 8} width="64" height="10" rx="3" className="st-pet-lid" />
          <rect x="14" y="16" width="72" height="100" rx="14" className="st-pet-glass" />
          <g className="st-pet-body">
            <path
              d={`M16 ${surface} Q33 ${surface - 6} 50 ${surface} T84 ${surface} V102 Q84 114 72 114 H28 Q16 114 16 102 Z`}
              className="st-pet-fill"
            />
            <Texture kind={kind} surface={surface} />
            {(mood === "hungry" || mood === "starving") && (
              <path d={`M22 ${surface - 14} H78 M24 ${surface - 22} H76`} className="st-pet-streak" />
            )}
            <Face mood={mood} y={Math.min(surface + 22, 96)} />
          </g>
          {BUBBLES.has(mood) && (
            <g className="st-pet-bubbles">
              <circle cx="30" cy="104" r="2.5" />
              <circle cx="66" cy="100" r="2" />
              <circle cx="48" cy="108" r="1.6" />
            </g>
          )}
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

/** What makes each kind recognisable in the jar. */
function Texture({ kind, surface }: { kind: Kind; surface: number }) {
  const y = surface;
  switch (kind) {
    case "sauerkraut":
      return <path d={`M24 ${y + 8} q6 -3 12 0 M58 ${y + 6} q6 -3 12 0 M30 ${y + 40} q6 -3 12 0 M60 ${y + 44} q6 -3 12 0`} className="st-pet-texture" />;
    case "kimchi":
      return (
        <g className="st-pet-texture">
          <path d={`M22 ${y + 10} q8 -6 16 0 q-8 5 -16 0 M62 ${y + 8} q8 -6 16 0 q-8 5 -16 0`} />
          <circle cx="24" cy={y + 56} r="1.6" />
          <circle cx="76" cy={y + 52} r="1.6" />
        </g>
      );
    case "kombucha":
      // The scoby floats on top.
      return <rect x="20" y={y - 3} width="60" height="7" rx="3.5" className="st-pet-scoby" />;
    default:
      return null;
  }
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
