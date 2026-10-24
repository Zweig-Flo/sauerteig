// The starter as a Tamagotchi: its mood follows from the last feeding, the temperature and the fridge. Pure, so the
// server, the web app and the tests all get the same answer for the same moment.

export type Mood = "egg" | "full" | "rising" | "peak" | "hungry" | "starving" | "sleeping";

export interface MoodFeeding {
  fedAt: string;
  starterGrams: number;
  flourGrams: number;
  /** Room temperature in °C at the feeding; null = unknown. */
  temperature: number | null;
  /** When it was seen at its highest; null = not observed. */
  peakAt: string | null;
}

export interface MoodInput {
  lastFeeding: MoodFeeding | null;
  /** Since when it sits in the fridge; null = at room temperature. */
  fridgeSince: string | null;
  /** Observed / predicted peak time of earlier feedings, see `calibration`. 1 = the model fits. */
  calibration: number;
}

export interface MoodState {
  mood: Mood;
  /** One line in the starter's own voice. */
  says: string;
  /** 0 = just fed, 1 = starving. */
  hunger: number;
  /** Expected peak, only while it is still ahead or just happening at room temperature. */
  peakAt: string | null;
  /** When it turns hungry. */
  hungryAt: string | null;
}

/** Without a thermometer reading we assume a normal kitchen. */
export const DEFAULT_TEMPERATURE = 22;

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

/** In the fridge it gets hungry after a week and starves after two. */
const FRIDGE_STARVING_DAYS = 14;

/**
 * Hours from feeding to peak at room temperature, before calibration. Rule of thumb: 1:1:1 at 24 °C peaks after about
 * 5 h, every doubling of the feed adds 2.5 h, and 8 °C less doubles the time.
 */
export function predictedPeakHours(feeding: Pick<MoodFeeding, "starterGrams" | "flourGrams" | "temperature">): number {
  const feed = feeding.starterGrams > 0 ? feeding.flourGrams / feeding.starterGrams : 10;
  const temperature = feeding.temperature ?? DEFAULT_TEMPERATURE;
  return (2.5 + 2.5 * Math.log2(1 + feed)) * 2 ** ((24 - temperature) / 8);
}

/** Median of observed / predicted over the feedings with a peak, clamped so one odd day can't break it. */
export function calibration(feedings: readonly MoodFeeding[]): number {
  const factors = feedings
    .filter((f) => f.peakAt !== null)
    .slice(0, 5)
    .map((f) => (Date.parse(f.peakAt!) - Date.parse(f.fedAt)) / HOUR / predictedPeakHours(f))
    .filter((factor) => factor > 0)
    .sort((a, b) => a - b);
  if (!factors.length) return 1;
  const middle = Math.floor(factors.length / 2);
  const median = factors.length % 2 ? factors[middle] : (factors[middle - 1] + factors[middle]) / 2;
  return Math.min(3, Math.max(1 / 3, median));
}

const iso = (ms: number) => new Date(ms).toISOString();
const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export function mood({ lastFeeding, fridgeSince, calibration }: MoodInput, now = Date.now()): MoodState {
  if (!lastFeeding) {
    return { mood: "egg", says: "Ich bin noch ein Ei. Füttere mich zum ersten Mal!", hunger: 0, peakAt: null, hungryAt: null };
  }
  const fedAt = Date.parse(lastFeeding.fedAt);
  const since = Math.max(0, now - fedAt);
  const peakHours = predictedPeakHours(lastFeeding) * calibration;
  const peak = lastFeeding.peakAt ? Date.parse(lastFeeding.peakAt) : fedAt + peakHours * HOUR;
  const peakSpan = Math.max(HOUR, peak - fedAt);
  // At room temperature it turns hungry when it has fallen (1.5 × the time to peak) and starves at 3 ×.
  const starvingSpan = peakSpan * 3;

  if (fridgeSince) {
    // Time before going into the fridge counts at room speed, so the fridge is no trick to skip a feeding.
    const outside = Math.min(since, Math.max(0, Date.parse(fridgeSince) - fedAt));
    const hunger = clamp01(outside / starvingSpan + (since - outside) / (FRIDGE_STARVING_DAYS * DAY));
    const hungryAt = iso(now + (0.5 - hunger) * FRIDGE_STARVING_DAYS * DAY);
    const base = { hunger, peakAt: null, hungryAt };
    if (hunger >= 1) return { ...base, mood: "starving", says: "Mir ist kalt und ich hab seit Ewigkeiten nichts gegessen …" };
    if (hunger >= 0.5) return { ...base, mood: "hungry", says: "Hol mich raus und füttere mich bitte." };
    return { ...base, mood: "sleeping", says: "Zzz … ich ruhe im Kühlschrank." };
  }

  const hungry = fedAt + peakSpan * 1.5;
  const starving = fedAt + starvingSpan;
  const hunger = clamp01(since / starvingSpan);
  const ahead = (at: number) => (at > now - peakSpan * 0.2 ? iso(at) : null);
  const base = { hunger, peakAt: ahead(peak), hungryAt: iso(hungry) };

  if (now >= starving) return { ...base, mood: "starving", says: "Ich verhungere! Bitte füttern." };
  if (now >= hungry) return { ...base, mood: "hungry", says: "Ich bin eingefallen und hab Hunger." };
  if (now >= peak - peakSpan * 0.15) return { ...base, mood: "peak", says: "Ich bin ganz oben! Jetzt backen." };
  if (since < peakSpan * 0.25) return { ...base, mood: "full", says: "Mmh, satt. Ich verdaue noch." };
  return { ...base, mood: "rising", says: "Ich blubbere und wachse." };
}
