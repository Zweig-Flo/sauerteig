import { useMutation } from "@tanstack/react-query";
import { Check, Trash2, Utensils, Wind } from "lucide-react";
import { useState, type FormEvent } from "react";
import { batchMood, type EventKind } from "../../shared/batch.ts";
import { rules } from "../../shared/kinds.ts";
import type { EventInput } from "../../shared/schema.ts";
import type { FermentDetail } from "./api.ts";
import { usePlugin } from "./context.tsx";
import { fedAt } from "./format.ts";

// What only a batch has: burp, next stage, done, and the log of what happened.

export type BatchFerment = Extract<FermentDetail, { family: "batch" }>;

type Props = { ferment: BatchFerment; onChange: () => Promise<unknown> };

const EVENT_LABEL: Record<EventKind, string> = {
  burp: "Entlüftet",
  taste: "Probiert",
  stage: "Nächste Stufe",
  done: "Fertig",
};

export function BatchActions({ ferment, onChange }: Props) {
  const { api } = usePlugin();
  const state = batchMood(ferment);
  const add = useMutation({ mutationFn: (input: EventInput) => api.addEvent(ferment.id, input), onSuccess: onChange });
  if (state.mood === "done") return null;
  return (
    <>
      <div className="st-actions">
        {state.stage.burpHours && (
          <button
            type="button"
            className={`st-button${state.mood === "burp" ? " st-button-primary" : ""}`}
            disabled={add.isPending}
            onClick={() => add.mutate({ kind: "burp" })}
          >
            <Wind aria-hidden size={18} /> Entlüftet
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
            className={`st-button${state.mood === "ready" || state.mood === "overripe" ? " st-button-primary" : ""}`}
            disabled={add.isPending}
            onClick={() => add.mutate({ kind: "done" })}
          >
            <Check aria-hidden size={18} /> Fertig
          </button>
        )}
      </div>
      {add.error && <p className="st-error">{add.error.message}</p>}
    </>
  );
}

/** Tasting comes with a note, so the next batch can learn from this one. */
export function TasteForm({ ferment, onChange }: Props) {
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

export function EventList({ ferment, onChange }: Props) {
  const { api } = usePlugin();
  const remove = useMutation({ mutationFn: api.deleteEvent, onSuccess: onChange });
  const kindRules = rules(ferment.kind);
  const stages = kindRules.family === "batch" ? kindRules.stages : [];
  // Events come newest first; the n-th stage event (oldest = 0) leaves stage n.
  let stageEvents = ferment.events.filter((e) => e.kind === "stage").length;
  const label = (kind: EventKind) => (kind === "stage" ? (stages[--stageEvents]?.next ?? EVENT_LABEL.stage) : EVENT_LABEL[kind]);
  return (
    <section aria-label="Verlauf">
      <h2>Verlauf</h2>
      <ul className="st-feedings">
        {ferment.events.map((event) => (
          <li key={event.id}>
            <span>
              <strong>{label(event.kind)}</strong>
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
