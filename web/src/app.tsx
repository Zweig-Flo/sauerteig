import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus, Refrigerator, Trash2, Undo2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, Navigate, Route, Routes, useNavigate, useParams } from "react-router";
import { ApiError, type Starter, type StarterDetail } from "./api.ts";
import { usePlugin } from "./context.tsx";
import { age, ago, fedAt, grams, hours, when } from "./format.ts";
import { HungerBar, MOOD_LABEL, Pet, useMood } from "./pet.tsx";

export function App() {
  return (
    <div className="st-app">
      <Routes>
        <Route path="/" element={<StartersPage />} />
        <Route path="/neu" element={<NewStarterPage />} />
        <Route path="/:id" element={<StarterPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function Loading() {
  return (
    <p className="st-quiet" role="status">
      Lädt …
    </p>
  );
}

function Problem({ error, retry }: { error: unknown; retry?: () => void }) {
  const message =
    error instanceof ApiError && error.status === 0
      ? "Keine Verbindung."
      : error instanceof Error
        ? error.message
        : "Unbekannter Fehler";
  return (
    <div className="st-problem" role="alert">
      <p>{message}</p>
      {retry && (
        <button type="button" className="st-button" onClick={retry}>
          Erneut laden
        </button>
      )}
    </div>
  );
}

function StartersPage() {
  const { api } = usePlugin();
  const starters = useQuery({ queryKey: ["starters"], queryFn: api.starters });
  const active = starters.data?.filter((s) => !s.archived) ?? [];
  const archived = starters.data?.filter((s) => s.archived) ?? [];
  return (
    <>
      <header className="st-head">
        <h1>Sauerteig</h1>
        <Link className="st-button st-button-primary" to="/neu">
          <Plus aria-hidden size={18} /> Starter
        </Link>
      </header>
      {starters.isPending && <Loading />}
      {starters.error && <Problem error={starters.error} retry={() => starters.refetch()} />}
      {starters.data && active.length === 0 && (
        <p className="st-quiet">Noch kein Starter. Leg deinen ersten an, dann kannst du jede Fütterung festhalten.</p>
      )}
      <ul className="st-list">
        {active.map((starter) => (
          <StarterItem key={starter.id} starter={starter} />
        ))}
      </ul>
      {archived.length > 0 && (
        <details className="st-archived">
          <summary>Archiviert ({archived.length})</summary>
          <ul className="st-list">
            {archived.map((starter) => (
              <StarterItem key={starter.id} starter={starter} />
            ))}
          </ul>
        </details>
      )}
    </>
  );
}

function StarterItem({ starter }: { starter: Starter }) {
  const last = starter.lastFeeding;
  const state = useMood(starter);
  return (
    <li>
      <Link className="st-card" to={`/${starter.id}`}>
        <Pet mood={starter.archived ? "sleeping" : state.mood} size={44} />
        <span>
          <strong>
            {starter.name}
            {!starter.archived && <span className="st-badge">{MOOD_LABEL[state.mood]}</span>}
          </strong>
          <span className="st-quiet">
            {starter.flour} · {starter.hydration} %
          </span>
          <span className="st-quiet">
            {last ? `Gefüttert ${ago(last.fedAt)} (${last.ratio})` : "Noch nie gefüttert"}
          </span>
          {!starter.archived && last && <HungerBar hunger={state.hunger} />}
        </span>
      </Link>
    </li>
  );
}

function NewStarterPage() {
  const { api } = usePlugin();
  const client = useQueryClient();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [flour, setFlour] = useState("");
  const [hydration, setHydration] = useState("100");
  const [notes, setNotes] = useState("");
  const create = useMutation({
    mutationFn: api.createStarter,
    onSuccess: async (starter) => {
      await client.invalidateQueries({ queryKey: ["starters"] });
      navigate(`/${starter.id}`, { replace: true });
    },
  });
  const submit = (event: FormEvent) => {
    event.preventDefault();
    create.mutate({ name, flour, hydration: Number(hydration), notes: notes || null });
  };
  return (
    <>
      <Link className="st-back" to="/">
        <ArrowLeft aria-hidden size={18} /> Alle Starter
      </Link>
      <h1>Neuer Starter</h1>
      <form className="st-form" onSubmit={submit}>
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={60} placeholder="Herbert" />
        </label>
        <label>
          Mehl
          <input value={flour} onChange={(e) => setFlour(e.target.value)} required maxLength={60} placeholder="Roggen 1150" />
        </label>
        <label>
          Hydration in %
          <input
            type="number"
            inputMode="numeric"
            min={40}
            max={200}
            value={hydration}
            onChange={(e) => setHydration(e.target.value)}
            required
          />
        </label>
        <label>
          Notizen
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} maxLength={2000} />
        </label>
        {create.error && <p className="st-error">{create.error.message}</p>}
        <button type="submit" className="st-button st-button-primary" disabled={create.isPending}>
          Anlegen
        </button>
      </form>
    </>
  );
}

function StarterPage() {
  const { api } = usePlugin();
  const client = useQueryClient();
  const starterId = Number(useParams().id);
  const starter = useQuery({ queryKey: ["starter", starterId], queryFn: () => api.starter(starterId) });
  const refresh = () =>
    Promise.all([
      client.invalidateQueries({ queryKey: ["starter", starterId] }),
      client.invalidateQueries({ queryKey: ["starters"] }),
    ]);
  const archive = useMutation({
    mutationFn: (archived: boolean) => api.patchStarter(starterId, { archived }),
    onSuccess: refresh,
  });
  const remove = useMutation({ mutationFn: api.deleteFeeding, onSuccess: refresh });

  return (
    <>
      <Link className="st-back" to="/">
        <ArrowLeft aria-hidden size={18} /> Alle Starter
      </Link>
      {starter.isPending && <Loading />}
      {starter.error && <Problem error={starter.error} retry={() => starter.refetch()} />}
      {starter.data && (
        <>
          <header>
            <h1>{starter.data.name}</h1>
            <p className="st-quiet">
              {starter.data.flour} · {starter.data.hydration} %{starter.data.archived && " · archiviert"}
            </p>
            {starter.data.notes && <p className="st-notes">{starter.data.notes}</p>}
          </header>
          {!starter.data.archived && (
            <>
              <PetPanel starter={starter.data} onChange={refresh} />
              <PeakForm starter={starter.data} onChange={refresh} />
              <FeedForm starter={starter.data} onFed={refresh} />
            </>
          )}
          <section aria-label="Fütterungen">
            <h2>Fütterungen</h2>
            {starter.data.feedings.length === 0 && <p className="st-quiet">Noch keine.</p>}
            <ul className="st-feedings">
              {starter.data.feedings.map((feeding) => (
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
          <button
            type="button"
            className="st-button"
            disabled={archive.isPending}
            onClick={() => archive.mutate(!starter.data.archived)}
          >
            {starter.data.archived ? "Wieder aktivieren" : "Archivieren"}
          </button>
        </>
      )}
    </>
  );
}

/** The pet with its mood, what comes next, and the one-tap actions. */
function PetPanel({ starter, onChange }: { starter: StarterDetail; onChange: () => Promise<unknown> }) {
  const { api } = usePlugin();
  const state = useMood(starter);
  const last = starter.lastFeeding;
  const again = useMutation({
    mutationFn: () =>
      api.feed(starter.id, {
        starterGrams: last!.starterGrams,
        flourGrams: last!.flourGrams,
        waterGrams: last!.waterGrams,
        temperature: last!.temperature,
      }),
    onSuccess: onChange,
  });
  const fridge = useMutation({
    mutationFn: (fridge: boolean) => api.patchStarter(starter.id, { fridge }),
    onSuccess: onChange,
  });
  const next =
    state.mood === "sleeping"
      ? state.hungryAt && `Hunger ab ${when(state.hungryAt)}`
      : state.peakAt && state.mood !== "peak" && !last?.peakAt
        ? `Höhepunkt etwa ${when(state.peakAt)}`
        : (state.mood === "full" || state.mood === "rising" || state.mood === "peak") && state.hungryAt
          ? `Hunger ab ${when(state.hungryAt)}`
          : null;
  return (
    <section className={`st-pet-panel st-mood-${state.mood}`} aria-label="Zustand">
      <Pet mood={state.mood} size={112} />
      <div className="st-pet-info">
        <p className="st-pet-mood">{MOOD_LABEL[state.mood]}</p>
        <p className="st-pet-says">„{state.says}“</p>
        {last && <HungerBar hunger={state.hunger} />}
        <p className="st-quiet">{[next, age(starter.bornAt)].filter(Boolean).join(" · ")}</p>
      </div>
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
          onClick={() => fridge.mutate(!starter.fridgeSince)}
        >
          <Refrigerator aria-hidden size={18} /> {starter.fridgeSince ? "Aus dem Kühlschrank" : "In den Kühlschrank"}
        </button>
      </div>
      {(again.error || fridge.error) && <p className="st-error">{(again.error ?? fridge.error)!.message}</p>}
    </section>
  );
}

/** After a feeding at room temperature: one tap when it stands highest, so the pet learns this starter's timing. */
function PeakForm({ starter, onChange }: { starter: StarterDetail; onChange: () => Promise<unknown> }) {
  const { api } = usePlugin();
  const last = starter.lastFeeding;
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
  if (!last || last.peakAt || starter.fridgeSince || !fresh) return null;
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
function FeedForm({ starter, onFed }: { starter: StarterDetail; onFed: () => Promise<unknown> }) {
  const { api } = usePlugin();
  const last = starter.lastFeeding;
  const [starterGrams, setStarterGrams] = useState(String(last?.starterGrams ?? 20));
  const [flourGrams, setFlourGrams] = useState(String(last?.flourGrams ?? 100));
  const [waterGrams, setWaterGrams] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [temperature, setTemperature] = useState(last?.temperature == null ? "" : String(last.temperature));
  const water = waterGrams ?? String(Math.round((Number(flourGrams) * starter.hydration) / 100));
  const feed = useMutation({
    mutationFn: () =>
      api.feed(starter.id, {
        starterGrams: Number(starterGrams),
        flourGrams: Number(flourGrams),
        waterGrams: Number(water),
        note: note || null,
        temperature: temperature === "" ? null : Number(temperature),
      }),
    onSuccess: async () => {
      setNote("");
      await onFed();
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
