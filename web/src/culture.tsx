import { useMutation } from "@tanstack/react-query";
import { Check, Refrigerator } from "lucide-react";
import { cultureMood } from "../../shared/culture.ts";
import { feedOf } from "../../shared/kinds.ts";
import type { FermentDetail } from "./api.ts";
import { usePlugin } from "./context.tsx";

// What only a culture has: one tap when it was tended, and the fridge.

export type CultureFerment = Extract<FermentDetail, { family: "culture" }>;

type Props = { ferment: CultureFerment; onChange: () => Promise<unknown> };

export function CultureActions({ ferment, onChange }: Props) {
  const { api } = usePlugin();
  const feed = feedOf(ferment.kind, ferment.variant);
  const state = cultureMood(ferment);
  const tend = useMutation({ mutationFn: () => api.addEvent(ferment.id, { kind: "feed" }), onSuccess: onChange });
  const fridge = useMutation({
    mutationFn: (fridge: boolean) => api.patchFerment(ferment.id, { fridge }),
    onSuccess: onChange,
  });
  const due = state.mood === "ready" || state.mood === "hungry" || state.mood === "starving";
  return (
    <>
      <div className="st-actions">
        <button
          type="button"
          className={`st-button${due ? " st-button-primary" : ""}`}
          disabled={tend.isPending}
          onClick={() => tend.mutate()}
          title={feed.todo}
        >
          <Check aria-hidden size={18} /> {feed.done}
        </button>
        <button
          type="button"
          className="st-button"
          disabled={fridge.isPending}
          onClick={() => fridge.mutate(!ferment.fridgeSince)}
        >
          <Refrigerator aria-hidden size={18} /> {ferment.fridgeSince ? "Aus dem Kühlschrank" : "In den Kühlschrank"}
        </button>
      </div>
      {(tend.error || fridge.error) && <p className="st-error">{(tend.error ?? fridge.error)!.message}</p>}
    </>
  );
}
