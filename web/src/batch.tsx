import { useMutation } from "@tanstack/react-query";
import { Check, Eye, RotateCw, Thermometer, Trash2, Utensils, Wind, type LucideIcon } from "lucide-react";
import { useState, type FormEvent } from "react";
import { batchMood, type EventKind } from "../../shared/batch.ts";
import { feedOf, rules, stagesOf } from "../../shared/kinds.ts";
import type { EventInput } from "../../shared/schema.ts";
import type { FermentDetail } from "./api.ts";
import { usePlugin } from "./context.tsx";
import { fedAt } from "./format.ts";

// What only a batch has: the stage's touch (burp, stir, …), next stage, done. Tasting and the log are shared with
// cultures.

export type BatchFerment = Extract<FermentDetail, { family: "batch" }>;
/** What gets tasted and keeps a log of events. */
export type LoggedFerment = Extract<FermentDetail, { family: "batch" | "culture" }>;

type Props<T> = { ferment: T; onChange: () => Promise<unknown> };

const TEND_ICON: Record<string, LucideIcon> = { Entlüften: Wind, Umrühren: RotateCw, "Temperatur prüfen": Thermometer };

const EVENT_LABEL: Record<EventKind, string> = {
  burp: "Entlüftet",
  taste: "Probiert",
  stage: "Nächste Stufe",
  done: "Fertig",
  feed: "Versorgt",
};

export function BatchActions({ ferment, onChange }: Props<BatchFerment>) {
  const { api } = usePlugin();
  const state = batchMood(ferment);
  const add = useMutation({ mutationFn: (input: EventInput) => api.addEvent(ferment.id, input), onSuccess: onChange });
  if (state.mood === "done") return null;
  const { tend } = state.stage;
  const TendIcon = tend ? (TEND_ICON[tend.todo] ?? Eye) : null;
  return (
    <>
      <div className="st-actions">
        {tend && TendIcon && (
          <button
            type="button"
            className={`st-button${state.mood === "burp" ? " st-button-primary" : ""}`}
            disabled={add.isPending}
            onClick={() => add.mutate({ kind: "burp" })}
          >
            <TendIcon aria-hidden size={18} /> {tend.done}
          </button>
        )}
        {state.stage.next && (
          <button
            type="button"
            className={`st-button${state.mood === "ready" ? " st-button-primary" : ""}`}
            disabled={add.isPending}
            onClick={() => add.mutate({ kind: "stage" })}
          >
            {state.stage.next}
          </button>
        )}
        {!state.stage.next && (
          <button
            type="button"
            className={`st-button${state.mood === "ready" || state.mood === "overripe" ? " st-button-done" : ""}`}
            disabled={add.isPending}
            onClick={() => add.mutate({ kind: "done" })}
          >
            <Check aria-hidden size={18} /> {state.stage.readyDays.from === 0 ? "Aufgegessen" : "Fertig"}
          </button>
        )}
      </div>
      {add.error && <p className="st-error">{add.error.message}</p>}
    </>
  );
}

/** Tasting comes with a note, so the next batch can learn from this one. */
export function TasteForm({ ferment, onChange }: Props<LoggedFerment>) {
  const { api } = usePlugin();
  const [note, setNote] = useState("");
  const taste = useMutation({
    mutationFn: () => api.addEvent(ferment.id, { kind: "taste", note: note || null }),
    onSuccess: async () => {
      setNote("");
      await onChange();
    },
  });
  const submit = (event: FormEvent) => {
    event.preventDefault();
    taste.mutate();
  };
  return (
    <form className="st-form st-feed" onSubmit={submit} aria-label="Probiert">
      <div className="st-peak-row">
        <label>
          Wie schmeckt es?
          <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} placeholder="z. B. noch mild, mehr Salz" />
        </label>
        <button type="submit" className="st-button" disabled={taste.isPending}>
          <Utensils aria-hidden size={18} /> Probiert
        </button>
      </div>
      {taste.error && <p className="st-error">{taste.error.message}</p>}
    </form>
  );
}

export function EventList({ ferment, onChange }: Props<LoggedFerment>) {
  const { api } = usePlugin();
  const remove = useMutation({ mutationFn: api.deleteEvent, onSuccess: onChange });
  const stages = rules(ferment.kind).family === "batch" ? stagesOf(ferment.kind, ferment.variant) : [];
  // The n-th stage event (oldest = 0) leaves stage n; a touch belongs to the stage it happened in.
  const stageTimes = ferment.events
    .filter((e) => e.kind === "stage")
    .map((e) => e.at)
    .sort();
  const label = ({ kind, at }: { kind: EventKind; at: string }) => {
    if (kind === "feed") return feedOf(ferment.kind, ferment.variant).done;
    if (kind === "stage") return stages[stageTimes.indexOf(at)]?.next ?? EVENT_LABEL.stage;
    if (kind === "burp") return stages[stageTimes.filter((t) => t <= at).length]?.tend?.done ?? EVENT_LABEL.burp;
    return EVENT_LABEL[kind];
  };
  return (
    <section aria-label="Verlauf">
      <h2>Verlauf</h2>
      <ul className="st-feedings">
        {ferment.events.map((event) => (
          <li key={event.id}>
            <span>
              <strong>{label(event)}</strong>
              <span className="st-quiet">{fedAt(event.at)}</span>
              {event.note && <span className="st-quiet">{event.note}</span>}
            </span>
            <button
              type="button"
              className="st-icon-button"
              aria-label="Eintrag löschen"
              disabled={remove.isPending}
              onClick={() => remove.mutate(event.id)}
            >
              <Trash2 aria-hidden size={18} />
            </button>
          </li>
        ))}
        <li>
          <span>
            <strong>Angesetzt</strong>
            <span className="st-quiet">{fedAt(ferment.startedAt)}</span>
          </span>
        </li>
      </ul>
    </section>
  );
}
