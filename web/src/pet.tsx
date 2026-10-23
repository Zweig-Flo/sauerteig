import { useEffect, useState } from "react";
import { mood, type Mood, type MoodInput, type MoodState } from "../../shared/mood.ts";

/** Current time, refreshed every minute so the mood moves on while the page stays open. */
export function useNow(every = 60_000) {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), every);
    return () => clearInterval(timer);
  }, [every]);
  return now;
}

export function useMood(starter: MoodInput): MoodState {
  return mood(starter, useNow());
}

export const MOOD_LABEL: Record<Mood, string> = {
  egg: "Ei",
  full: "Satt",
  rising: "Wach",
  peak: "Höhepunkt",
  hungry: "Hungrig",
  starving: "Verhungert",
  sleeping: "Schläft",
};

/** How high the dough stands in the jar, 0 to 1. */
const LEVEL: Record<Mood, number> = {
  egg: 0,
  full: 0.38,
  rising: 0.6,
  peak: 0.86,
  hungry: 0.44,
  starving: 0.3,
  sleeping: 0.4,
};

/** The starter in its jar, with a face that follows its mood. */
export function Pet({ mood, size = 120 }: { mood: Mood; size?: number }) {
  const top = 22;
  const bottom = 112;
  const surface = bottom - (bottom - top) * LEVEL[mood];
  return (
    <svg
      className={`st-pet st-pet-${mood}`}
      viewBox="0 0 100 120"
      width={size}
      height={size * 1.2}
      role="img"
      aria-label={`Starter: ${MOOD_LABEL[mood]}`}
    >
      {mood === "egg" ? (
        <g className="st-pet-body">
          <ellipse cx="50" cy="72" rx="28" ry="36" className="st-pet-shell" />
          <path d="M34 62 l6 6 l6 -6 l6 6 l6 -6 l6 6" className="st-pet-crack" />
        </g>
      ) : (
        <>
          <rect x="18" y="8" width="64" height="10" rx="3" className="st-pet-lid" />
          <rect x="14" y="16" width="72" height="100" rx="14" className="st-pet-glass" />
          <g className="st-pet-body">
            <path
              d={`M16 ${surface} Q33 ${surface - 6} 50 ${surface} T84 ${surface} V102 Q84 114 72 114 H28 Q16 114 16 102 Z`}
              className="st-pet-dough"
            />
            {(mood === "hungry" || mood === "starving") && (
              <path d={`M22 ${surface - 14} H78 M24 ${surface - 22} H76`} className="st-pet-streak" />
            )}
            <Face mood={mood} y={Math.min(surface + 22, 96)} />
          </g>
          {(mood === "rising" || mood === "peak") && (
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
        </>
      )}
    </svg>
  );
}

function Face({ mood, y }: { mood: Mood; y: number }) {
  const eyes =
    mood === "sleeping" || mood === "full" ? (
      <path d={`M36 ${y} q4 3 8 0 M56 ${y} q4 3 8 0`} className="st-pet-line" />
    ) : mood === "starving" ? (
      <path d={`M37 ${y - 3} l6 6 m0 -6 l-6 6 M57 ${y - 3} l6 6 m0 -6 l-6 6`} className="st-pet-line" />
    ) : (
      <g className="st-pet-eyes">
        <circle cx="40" cy={y} r={mood === "peak" ? 3.6 : 3} />
        <circle cx="60" cy={y} r={mood === "peak" ? 3.6 : 3} />
      </g>
    );
  const m = y + 10;
  const mouth = {
    egg: "",
    full: `M44 ${m} q6 4 12 0`,
    rising: `M44 ${m} q6 5 12 0`,
    peak: `M40 ${m - 1} q10 10 20 0 z`,
    hungry: `M45 ${m + 2} q5 -4 10 0`,
    starving: `M43 ${m + 3} q7 -6 14 0`,
    sleeping: `M47 ${m} h6`,
  }[mood];
  return (
    <g>
      {eyes}
      <path d={mouth} className={mood === "peak" ? "st-pet-mouth-open" : "st-pet-line"} />
      {(mood === "full" || mood === "peak") && (
        <g className="st-pet-cheeks">
          <circle cx="32" cy={y + 6} r="3" />
          <circle cx="68" cy={y + 6} r="3" />
        </g>
      )}
    </g>
  );
}

/** Hunger as a bar, full when it starves. */
export function HungerBar({ hunger }: { hunger: number }) {
  const percent = Math.round(hunger * 100);
  return (
    <div
      className="st-hunger"
      role="meter"
      aria-label="Hunger"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      data-level={hunger >= 0.5 ? "high" : hunger >= 0.33 ? "mid" : "low"}
    >
      <span style={{ width: `${percent}%` }} />
    </div>
  );
}
