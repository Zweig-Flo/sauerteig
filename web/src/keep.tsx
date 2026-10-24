import { useMutation } from "@tanstack/react-query";
import { Refrigerator, Trash2, Undo2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import type { FermentDetail } from "./api.ts";
import { usePlugin } from "./context.tsx";
import { fedAt, grams, hours } from "./format.ts";

// What only a ferment that gets fed has: quick feeding, fridge, peak, the feed form and the feedings.

export type KeepFerment = Extract<FermentDetail, { family: "keep" }>;

type Props = { ferment: KeepFerment; onChange: () => Promise<unknown> };

/** One tap to feed like last time, and the fridge switch. */
export function KeepActions({ ferment, onChange }: Props) {
  const { api } = usePlugin();
  const last = ferment.lastFeeding;
  const again = useMutation({
    mutationFn: () =>
      api.feed(ferment.id, {
        starterGrams: last!.starterGrams,
        flourGrams: last!.flourGrams,
        waterGrams: last!.waterGrams,
        temperature: last!.temperature,
      }),
    onSuccess: onChange,
  });
  const fridge = useMutation({
    mutationFn: (fridge: boolean) => api.patchFerment(ferment.id, { fridge }),
    onSuccess: onChange,
  });
  return (
    <>
      <div className="st-actions">
        {last && (
          <button
            type="button"
            className="st-button st-button-primary"
            disabled={again.isPending}
            onClick={() => again.mutate()}
            title={`${grams(last.starterGrams)} Starter, ${grams(last.flourGrams)} Mehl, ${grams(last.waterGrams)} Wasser`}
          >
            <Undo2 aria-hidden size={18} /> Wie letztes Mal ({last.ratio})
          </button>
        )}
        <button
          type="button"
          className="st-button"
          disabled={fridge.isPending}
          onClick={() => fridge.mutate(!ferment.fridgeSince)}
        >
          <Refrigerator aria-hidden size={18} /> {ferment.fridgeSince ? "Aus dem Kühlschrank" : "In den Kühlschrank"}
        </button>
      </div>
      {(again.error || fridge.error) && <p className="st-error">{(again.error ?? fridge.error)!.message}</p>}
    </>
  );
}

/** After a feeding at room temperature: one tap when it stands highest, so the pet learns this starter's timing. */
export function PeakForm({ ferment, onChange }: Props) {
  const { api } = usePlugin();
  const last = ferment.lastFeeding;
  const [rise, setRise] = useState("");
  const observe = useMutation({
    mutationFn: () =>
      api.observeFeeding(last!.id, {
        peakAt: new Date().toISOString(),
        risePercent: rise === "" ? null : Number(rise),
      }),
    onSuccess: async () => {
      setRise("");
      await onChange();
    },
  });
  const fresh = last && Date.now() - Date.parse(last.fedAt) < 48 * 3_600_000;
  if (!last || last.peakAt || ferment.fridgeSince || !fresh) return null;
  const submit = (event: FormEvent) => {
    event.preventDefault();
    observe.mutate();
  };
  return (
    <form className="st-form st-feed st-peak" onSubmit={submit} aria-label="Höhepunkt">
      <p className="st-quiet">Steht er gerade am höchsten? Dann tipp hier, und er lernt, wann er seinen Höhepunkt hat.</p>
      <div className="st-peak-row">
        <label>
          Gewachsen um (%)
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={1000}
            value={rise}
            onChange={(e) => setRise(e.target.value)}
            placeholder="100 = verdoppelt"
          />
        </label>
        <button type="submit" className="st-button" disabled={observe.isPending}>
          Jetzt am Höhepunkt
        </button>
      </div>
      {observe.error && <p className="st-error">{observe.error.message}</p>}
    </form>
  );
}

/** Prefilled with the last feeding; water follows the flour at the starter's hydration until it is changed by hand. */
export function FeedForm({ ferment, onChange }: Props) {
  const { api } = usePlugin();
  const last = ferment.lastFeeding;
  const [starterGrams, setStarterGrams] = useState(String(last?.starterGrams ?? 20));
  const [flourGrams, setFlourGrams] = useState(String(last?.flourGrams ?? 100));
  const [waterGrams, setWaterGrams] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [temperature, setTemperature] = useState(last?.temperature == null ? "" : String(last.temperature));
  const water = waterGrams ?? String(Math.round((Number(flourGrams) * ferment.hydration) / 100));
  const feed = useMutation({
    mutationFn: () =>
      api.feed(ferment.id, {
        starterGrams: Number(starterGrams),
        flourGrams: Number(flourGrams),
        waterGrams: Number(water),
        note: note || null,
        temperature: temperature === "" ? null : Number(temperature),
      }),
    onSuccess: async () => {
      setNote("");
      await onChange();
    },
  });
  const submit = (event: FormEvent) => {
    event.preventDefault();
    feed.mutate();
  };
  return (
    <form className="st-form st-feed" onSubmit={submit} aria-label="Füttern">
      <div className="st-grams">
        <label>
          Starter (g)
          <input type="number" inputMode="decimal" min={0} value={starterGrams} onChange={(e) => setStarterGrams(e.target.value)} required />
        </label>
        <label>
          Mehl (g)
          <input type="number" inputMode="decimal" min={1} value={flourGrams} onChange={(e) => setFlourGrams(e.target.value)} required />
        </label>
        <label>
          Wasser (g)
          <input type="number" inputMode="decimal" min={0} value={water} onChange={(e) => setWaterGrams(e.target.value)} required />
        </label>
      </div>
      <div className="st-grams">
        <label>
          Raum (°C)
          <input
            type="number"
            inputMode="decimal"
            step={0.5}
            min={-30}
            max={50}
            value={temperature}
            onChange={(e) => setTemperature(e.target.value)}
            placeholder="22"
          />
        </label>
        <label className="st-span-2">
          Notiz
          <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} placeholder="z. B. neues Mehl" />
        </label>
      </div>
      {feed.error && <p className="st-error">{feed.error.message}</p>}
      <button type="submit" className="st-button st-button-primary" disabled={feed.isPending}>
        Jetzt gefüttert
      </button>
    </form>
  );
}

export function FeedingList({ ferment, onChange }: Props) {
  const { api } = usePlugin();
  const remove = useMutation({ mutationFn: api.deleteFeeding, onSuccess: onChange });
  return (
    <section aria-label="Fütterungen">
      <h2>Fütterungen</h2>
      {ferment.feedings.length === 0 && <p className="st-quiet">Noch keine.</p>}
      <ul className="st-feedings">
        {ferment.feedings.map((feeding) => (
          <li key={feeding.id}>
            <span>
              <strong>{fedAt(feeding.fedAt)}</strong>
              <span className="st-quiet">
                {grams(feeding.starterGrams)} Starter, {grams(feeding.flourGrams)} Mehl, {grams(feeding.waterGrams)}{" "}
                Wasser · {feeding.ratio}
              </span>
              {(feeding.temperature !== null || feeding.peakHours !== null || feeding.risePercent !== null) && (
                <span className="st-quiet">
                  {[
                    feeding.temperature !== null && `${feeding.temperature.toLocaleString("de-DE")} °C`,
                    feeding.peakHours !== null && `Höhepunkt nach ${hours(feeding.peakHours)}`,
                    feeding.risePercent !== null && `+${feeding.risePercent} %`,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              )}
              {feeding.note && <span className="st-quiet">{feeding.note}</span>}
            </span>
            <button
              type="button"
              className="st-icon-button"
              aria-label="Fütterung löschen"
              disabled={remove.isPending}
              onClick={() => remove.mutate(feeding.id)}
            >
              <Trash2 aria-hidden size={18} />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
