import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, Navigate, Route, Routes, useNavigate, useParams } from "react-router";
import { KIND_RULES, KINDS, isKind, rules, type Kind } from "../../shared/kinds.ts";
import { ApiError, type Ferment, type FermentDetail } from "./api.ts";
import { BatchActions, EventList, TasteForm } from "./batch.tsx";
import { usePlugin } from "./context.tsx";
import { age, ago } from "./format.ts";
import { FeedForm, FeedingList, KeepActions, PeakForm } from "./keep.tsx";
import { Meter, MOOD_LABEL, Pet } from "./pet.tsx";
import { useLiveState } from "./state.ts";

export function App() {
  return (
    <div className="st-app">
      <Routes>
        <Route path="/" element={<ListPage />} />
        <Route path="/neu" element={<KindPage />} />
        <Route path="/neu/:kind" element={<NewPage />} />
        <Route path="/:id" element={<FermentPage />} />
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

function ListPage() {
  const { api } = usePlugin();
  const ferments = useQuery({ queryKey: ["ferments"], queryFn: api.ferments });
  const active = ferments.data?.filter((f) => !f.archived) ?? [];
  const archived = ferments.data?.filter((f) => f.archived) ?? [];
  return (
    <>
      <header className="st-head">
        <h1>Fermente</h1>
        <Link className="st-button st-button-primary" to="/neu">
          <Plus aria-hidden size={18} /> Ansetzen
        </Link>
      </header>
      {ferments.isPending && <Loading />}
      {ferments.error && <Problem error={ferments.error} retry={() => ferments.refetch()} />}
      {ferments.data && active.length === 0 && (
        <p className="st-quiet">Noch nichts im Glas. Setz dein erstes Ferment an, dann zeigt es dir hier, wie es ihm geht.</p>
      )}
      <ul className="st-list">
        {active.map((ferment) => (
          <FermentItem key={ferment.id} ferment={ferment} />
        ))}
      </ul>
      {archived.length > 0 && (
        <details className="st-archived">
          <summary>Archiviert ({archived.length})</summary>
          <ul className="st-list">
            {archived.map((ferment) => (
              <FermentItem key={ferment.id} ferment={ferment} />
            ))}
          </ul>
        </details>
      )}
    </>
  );
}

function FermentItem({ ferment }: { ferment: Ferment }) {
  const state = useLiveState(ferment);
  const kind = KIND_RULES[ferment.kind];
  const last = ferment.lastFeeding;
  const line =
    ferment.family === "keep"
      ? last
        ? `Gefüttert ${ago(last.fedAt)} (${last.ratio})`
        : "Noch nie gefüttert"
      : state.next;
  return (
    <li>
      <Link className="st-card" to={`/${ferment.id}`}>
        <Pet kind={ferment.kind} mood={ferment.archived ? "sleeping" : state.mood} size={44} />
        <span>
          <strong>
            {ferment.name}
            {!ferment.archived && <span className="st-badge">{MOOD_LABEL[state.mood]}</span>}
          </strong>
          <span className="st-quiet">
            {kind.emoji} {kind.label}
            {ferment.family === "keep" && ` · ${ferment.flour} · ${ferment.hydration} %`}
          </span>
          {line && <span className="st-quiet">{line}</span>}
          {!ferment.archived && state.meter && <Meter {...state.meter} />}
        </span>
      </Link>
    </li>
  );
}

function KindPage() {
  return (
    <>
      <Link className="st-back" to="/">
        <ArrowLeft aria-hidden size={18} /> Alle Fermente
      </Link>
      <h1>Was setzt du an?</h1>
      <ul className="st-kinds">
        {KINDS.map((kind) => (
          <li key={kind}>
            <Link className="st-card st-kind" to={`/neu/${kind}`}>
              <Pet kind={kind} mood={rules(kind).family === "keep" ? "rising" : "bubbling"} size={44} />
              <span>
                <strong>
                  {KIND_RULES[kind].emoji} {KIND_RULES[kind].label}
                </strong>
                <span className="st-quiet">{KIND_RULES[kind].blurb}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

/** "2026-10-23T19:30" for a datetime-local input, in the browser's time zone. */
function localNow() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

function NewPage() {
  const param = useParams().kind ?? "";
  if (!isKind(param)) return <Navigate to="/neu" replace />;
  return <NewForm key={param} kind={param} />;
}

function NewForm({ kind }: { kind: Kind }) {
  const { api } = usePlugin();
  const client = useQueryClient();
  const navigate = useNavigate();
  const kindRules = rules(kind);
  const [name, setName] = useState("");
  const [flour, setFlour] = useState("");
  const [hydration, setHydration] = useState("100");
  const [startedAt, setStartedAt] = useState(localNow);
  const [temperature, setTemperature] = useState(kindRules.family === "batch" ? String(kindRules.defaultTemperature) : "");
  const [notes, setNotes] = useState("");
  const create = useMutation({
    mutationFn: api.createFerment,
    onSuccess: async (ferment) => {
      await client.invalidateQueries({ queryKey: ["ferments"] });
      navigate(`/${ferment.id}`, { replace: true });
    },
  });
  const submit = (event: FormEvent) => {
    event.preventDefault();
    create.mutate(
      kindRules.family === "keep"
        ? { kind, name, flour, hydration: Number(hydration), notes: notes || null }
        : {
            kind,
            name,
            startedAt: new Date(startedAt).toISOString(),
            temperature: temperature === "" ? null : Number(temperature),
            notes: notes || null,
          },
    );
  };
  return (
    <>
      <Link className="st-back" to="/neu">
        <ArrowLeft aria-hidden size={18} /> Andere Art
      </Link>
      <h1>
        {kindRules.emoji} {kindRules.label} ansetzen
      </h1>
      <form className="st-form" onSubmit={submit}>
        <label>
          Name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={60}
            placeholder={kindRules.family === "keep" ? "Herbert" : `${kindRules.label} Oktober`}
          />
        </label>
        {kindRules.family === "keep" ? (
          <>
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
          </>
        ) : (
          <div className="st-grams st-grams-2">
            <label>
              Angesetzt am
              <input type="datetime-local" value={startedAt} onChange={(e) => setStartedAt(e.target.value)} required />
            </label>
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
              />
            </label>
          </div>
        )}
        <label>
          Notizen
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            maxLength={2000}
            placeholder={kindRules.family === "batch" ? "z. B. 2 % Salz, mit Ingwer" : undefined}
          />
        </label>
        {create.error && <p className="st-error">{create.error.message}</p>}
        <button type="submit" className="st-button st-button-primary" disabled={create.isPending}>
          Ansetzen
        </button>
      </form>
    </>
  );
}

function FermentPage() {
  const { api } = usePlugin();
  const client = useQueryClient();
  const fermentId = Number(useParams().id);
  const ferment = useQuery({ queryKey: ["ferment", fermentId], queryFn: () => api.ferment(fermentId) });
  const refresh = () =>
    Promise.all([
      client.invalidateQueries({ queryKey: ["ferment", fermentId] }),
      client.invalidateQueries({ queryKey: ["ferments"] }),
    ]);
  const archive = useMutation({
    mutationFn: (archived: boolean) => api.patchFerment(fermentId, { archived }),
    onSuccess: refresh,
  });
  const data = ferment.data;

  return (
    <>
      <Link className="st-back" to="/">
        <ArrowLeft aria-hidden size={18} /> Alle Fermente
      </Link>
      {ferment.isPending && <Loading />}
      {ferment.error && <Problem error={ferment.error} retry={() => ferment.refetch()} />}
      {data && (
        <>
          <header>
            <h1>{data.name}</h1>
            <p className="st-quiet">
              {KIND_RULES[data.kind].emoji} {KIND_RULES[data.kind].label}
              {data.family === "keep" && ` · ${data.flour} · ${data.hydration} %`}
              {data.family === "batch" && data.temperature !== null && ` · ${data.temperature.toLocaleString("de-DE")} °C`}
              {data.archived && " · archiviert"}
            </p>
            {data.notes && <p className="st-notes">{data.notes}</p>}
          </header>
          {!data.archived && <PetPanel ferment={data} onChange={refresh} />}
          {data.family === "keep" ? (
            <>
              {!data.archived && (
                <>
                  <PeakForm ferment={data} onChange={refresh} />
                  <FeedForm ferment={data} onChange={refresh} />
                </>
              )}
              <FeedingList ferment={data} onChange={refresh} />
            </>
          ) : (
            <>
              {!data.archived && <TasteForm ferment={data} onChange={refresh} />}
              <EventList ferment={data} onChange={refresh} />
            </>
          )}
          <button type="button" className="st-button" disabled={archive.isPending} onClick={() => archive.mutate(!data.archived)}>
            {data.archived ? "Wieder aktivieren" : "Archivieren"}
          </button>
        </>
      )}
    </>
  );
}

/** The pet with its mood, what comes next, and the actions that fit its kind. */
function PetPanel({ ferment, onChange }: { ferment: FermentDetail; onChange: () => Promise<unknown> }) {
  const state = useLiveState(ferment);
  const since = ferment.family === "keep" ? age(ferment.startedAt) : null;
  return (
    <section className="st-pet-panel" aria-label="Zustand">
      <Pet kind={ferment.kind} mood={state.mood} size={112} />
      <div className="st-pet-info">
        <p className="st-pet-mood">{MOOD_LABEL[state.mood]}</p>
        <p className="st-pet-says">„{state.says}“</p>
        {state.meter && <Meter {...state.meter} />}
        <p className="st-quiet">{[state.next, since].filter(Boolean).join(" · ")}</p>
      </div>
      <div className="st-pet-actions">
        {ferment.family === "keep" ? (
          <KeepActions ferment={ferment} onChange={onChange} />
        ) : (
          <BatchActions ferment={ferment} onChange={onChange} />
        )}
      </div>
    </section>
  );
}
