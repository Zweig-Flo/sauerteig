import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ChevronRight, Plus, Search } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, Navigate, Route, Routes, useNavigate, useParams } from "react-router";
import { batchMood } from "../../shared/batch.ts";
import {
  GROUPS,
  KIND_RULES,
  KINDS,
  isKind,
  resolve,
  rules,
  starterOf,
  temperatureOf,
  type Kind,
} from "../../shared/kinds.ts";
import { ApiError, type Ferment, type FermentDetail } from "./api.ts";
import { BatchActions, EventList, TasteForm } from "./batch.tsx";
import { usePlugin } from "./context.tsx";
import { CultureActions } from "./culture.tsx";
import { age, ago, fedAt, whenDay } from "./format.ts";
import { FeedForm, FeedingList, KeepActions, PeakForm } from "./keep.tsx";
import { Meter, Pet } from "./pet.tsx";
import { RecipeView } from "./recipe.tsx";
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

/** "Kimchi · Kkakdugi", or just the kind without a variant. */
function kindName(kind: Kind, variant: string | null) {
  const { label, variantLabel } = resolve(kind, variant);
  return variant && variantLabel ? `${label} · ${variantLabel}` : label;
}

function ListPage() {
  const { api } = usePlugin();
  const ferments = useQuery({ queryKey: ["ferments"], queryFn: api.ferments });
  const active = ferments.data?.filter((f) => !f.archived) ?? [];
  const archived = ferments.data?.filter((f) => f.archived) ?? [];
  return (
    <>
      <header className="st-head">
        <div>
          <p className="st-kicker">{today()}</p>
          <h1>Fermente</h1>
        </div>
        <Link className="st-button st-button-primary" to="/neu">
          <Plus aria-hidden size={18} /> Ansetzen
        </Link>
      </header>
      {ferments.isPending && <Loading />}
      {ferments.error && <Problem error={ferments.error} retry={() => ferments.refetch()} />}
      {ferments.data && active.length === 0 && (
        <div className="st-notice">
          <p>Noch nichts im Glas. Setz dein erstes Ferment an, dann zeigt es dir hier, wie es ihm geht und was als Nächstes dran ist.</p>
        </div>
      )}
      {active.length > 0 && <DueCard ferments={active} />}
      {active.length > 0 && (
        <section aria-label="Alle Gläser">
          <ul className="st-rows">
            {active.map((ferment) => (
              <FermentRow key={ferment.id} ferment={ferment} />
            ))}
          </ul>
        </section>
      )}
      {archived.length > 0 && (
        <details className="st-archived">
          <summary>Archiviert ({archived.length})</summary>
          <ul className="st-rows">
            {archived.map((ferment) => (
              <FermentRow key={ferment.id} ferment={ferment} />
            ))}
          </ul>
        </details>
      )}
    </>
  );
}

const dayFormat = new Intl.DateTimeFormat("de-DE", { timeZone: "Europe/Berlin", weekday: "long", day: "numeric", month: "long" });
const today = () => dayFormat.format(new Date());

/** What needs a hand right now, most urgent first; the one place on the page that asks for something. */
function DueCard({ ferments }: { ferments: Ferment[] }) {
  return (
    <section className="st-due" aria-label="Jetzt dran">
      <h2 className="st-due-head">Jetzt dran</h2>
      <ul>
        {ferments.map((ferment) => (
          <DueRow key={ferment.id} ferment={ferment} />
        ))}
      </ul>
      <p className="st-due-empty">Alles ruhig. Kein Glas braucht dich gerade.</p>
    </section>
  );
}

function DueRow({ ferment }: { ferment: Ferment }) {
  const state = useLiveState(ferment);
  if (!state.todo) return null;
  return (
    <li>
      <Link to={`/${ferment.id}`} className="st-due-row" data-tone={state.tone}>
        <Pet kind={ferment.kind} variant={ferment.variant} stage={state.stage} mood={state.mood} size={30} />
        <span>
          <strong>{state.todo}</strong>
          <span className="st-quiet">{ferment.name}</span>
        </span>
        <ChevronRight aria-hidden size={20} />
      </Link>
    </li>
  );
}

function FermentRow({ ferment }: { ferment: Ferment }) {
  const state = useLiveState(ferment);
  const last = ferment.lastFeeding;
  const line =
    ferment.family === "keep"
      ? last
        ? `Gefüttert ${ago(last.fedAt)} · ${last.ratio}`
        : "Noch nie gefüttert"
      : ferment.family === "culture"
        ? `Versorgt ${ago(ferment.culture.tendedAt)}${state.next ? ` · ${state.next}` : ""}`
        : state.next;
  return (
    <li>
      <Link className="st-row" to={`/${ferment.id}`} data-tone={ferment.archived ? "rest" : state.tone}>
        <span className="st-row-jar">
          <Pet
            kind={ferment.kind}
            variant={ferment.variant}
            stage={state.stage}
            mood={ferment.archived ? "sleeping" : state.mood}
            size={46}
          />
        </span>
        <span className="st-row-body">
          <span className="st-row-kind">{kindName(ferment.kind, ferment.variant)}</span>
          <span className="st-row-title">
            {ferment.name}
            {!ferment.archived && <span className="st-tag">{state.label}</span>}
          </span>
          {line && <span className="st-quiet">{line}</span>}
          {!ferment.archived && state.meter && <Meter {...state.meter} />}
        </span>
        <ChevronRight aria-hidden size={20} className="st-row-chevron" />
      </Link>
    </li>
  );
}

const FAMILY_LABEL = { keep: "Füttern", culture: "Pflegen", batch: "Charge" } as const;

/** Lower case and without accents, so "creme" finds "Crème fraîche". */
const fold = (text: string) => text.toLocaleLowerCase("de-DE").normalize("NFD").replace(/\p{Diacritic}/gu, "");

function matches(kind: Kind, query: string) {
  if (!query) return true;
  const kindRules = KIND_RULES[kind];
  const text = [kindRules.label, kindRules.blurb, kindRules.baseLabel ?? "", ...(kindRules.variants ?? []).map((v) => v.label)].join(" ");
  return fold(text).includes(fold(query.trim()));
}

function KindPage() {
  const [query, setQuery] = useState("");
  const found = KINDS.filter((kind) => matches(kind, query));
  return (
    <>
      <Link className="st-back" to="/">
        <ArrowLeft aria-hidden size={18} /> Alle Fermente
      </Link>
      <h1>Was setzt du an?</h1>
      <label className="st-search">
        <Search aria-hidden size={18} />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Suchen, z. B. Kimchi, Kefir, Senf"
          aria-label="Fermente durchsuchen"
        />
      </label>
      {found.length === 0 && <p className="st-quiet">Nichts gefunden.</p>}
      {GROUPS.map((group) => {
        const kinds = found.filter((kind) => KIND_RULES[kind].group === group.id);
        if (!kinds.length) return null;
        return (
          <section key={group.id} className="st-group" aria-label={group.label}>
            <h2>{group.label}</h2>
            <ul className="st-rows">
              {kinds.map((kind) => (
                <KindRow key={kind} kind={kind} />
              ))}
            </ul>
          </section>
        );
      })}
    </>
  );
}

function KindRow({ kind }: { kind: Kind }) {
  const kindRules = rules(kind);
  const variants = kindRules.variants?.length ?? 0;
  return (
    <li>
      <Link className="st-row" to={`/neu/${kind}`} data-tone="rest">
        <span className="st-row-jar">
          <Pet kind={kind} mood={kindRules.family === "keep" ? "rising" : "bubbling"} size={46} />
        </span>
        <span className="st-row-body">
          <span className="st-row-kind">
            {FAMILY_LABEL[kindRules.family]}
            {variants > 0 && ` · ${variants + 1} Sorten`}
          </span>
          <span className="st-row-title">{kindRules.label}</span>
          <span className="st-quiet">{kindRules.blurb}</span>
        </span>
        <ChevronRight aria-hidden size={20} className="st-row-chevron" />
      </Link>
    </li>
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
  const [variant, setVariant] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [flour, setFlour] = useState(starterOf(kind)?.flour ?? "");
  const [hydration, setHydration] = useState(String(starterOf(kind)?.hydration ?? 100));
  const [startedAt, setStartedAt] = useState(localNow);
  const [temperature, setTemperature] = useState(String(temperatureOf(kind) ?? ""));
  const [notes, setNotes] = useState("");
  const create = useMutation({
    mutationFn: api.createFerment,
    onSuccess: async (ferment) => {
      await client.invalidateQueries({ queryKey: ["ferments"] });
      navigate(`/${ferment.id}`, { replace: true });
    },
  });
  // A variant brings its own starting values; what was typed by hand gives way.
  const choose = (next: string | null) => {
    setVariant(next);
    const starter = starterOf(kind, next);
    if (starter) {
      setFlour(starter.flour);
      setHydration(String(starter.hydration));
    }
    setTemperature(String(temperatureOf(kind, next) ?? ""));
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    create.mutate(
      kindRules.family === "keep"
        ? { kind, variant, name, flour, hydration: Number(hydration), notes: notes || null }
        : {
            kind,
            variant,
            name,
            startedAt: new Date(startedAt).toISOString(),
            temperature: temperature === "" ? null : Number(temperature),
            notes: notes || null,
          },
    );
  };
  const options = kindRules.variants?.length
    ? [{ id: null, label: kindRules.baseLabel ?? "Klassisch" }, ...kindRules.variants.map((v) => ({ id: v.id, label: v.label }))]
    : [];
  const chosen = kindRules.variants?.find((v) => v.id === variant);
  return (
    <>
      <Link className="st-back" to="/neu">
        <ArrowLeft aria-hidden size={18} /> Andere Art
      </Link>
      <header className="st-new-head">
        <Pet kind={kind} variant={variant} mood={kindRules.family === "keep" ? "rising" : "bubbling"} size={64} />
        <div className="st-title">
          <p className="st-kicker">{FAMILY_LABEL[kindRules.family]}</p>
          <h1>
            {kindRules.label} ansetzen {kindRules.emoji}
          </h1>
          <p className="st-quiet">{chosen?.blurb ?? kindRules.blurb}</p>
        </div>
      </header>
      <form className="st-form" onSubmit={submit}>
        {options.length > 0 && (
          <fieldset className="st-variants">
            <legend>Sorte</legend>
            <div className="st-chips">
              {options.map((option) => (
                <label key={option.id ?? "base"} className="st-chip">
                  <input
                    type="radio"
                    name="variant"
                    checked={variant === option.id}
                    onChange={() => choose(option.id)}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        )}
        <label>
          Name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={60}
            placeholder={kindRules.family === "keep" ? "Herbert" : `${chosen?.label ?? kindRules.label} ${monthName()}`}
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
                max={70}
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
      <section className="st-recipe-section" aria-label="Rezept und Pflege">
        <h2>Rezept und Pflege</h2>
        <RecipeView kind={kind} variant={variant} />
      </section>
    </>
  );
}

const monthFormat = new Intl.DateTimeFormat("de-DE", { timeZone: "Europe/Berlin", month: "long" });
const monthName = () => monthFormat.format(new Date());

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
          <header className="st-title">
            <p className="st-kicker">
              {kindName(data.kind, data.variant)}
              {data.archived && <span className="st-tag">archiviert</span>}
            </p>
            <h1>{data.name}</h1>
          </header>
          {!data.archived && <PetPanel ferment={data} onChange={refresh} />}
          <FermentLabel ferment={data} />
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
          <details className="st-recipe-details">
            <summary>Rezept und Pflege</summary>
            <RecipeView kind={data.kind} variant={data.variant} />
          </details>
          <button
            type="button"
            className="st-button st-button-quiet"
            disabled={archive.isPending}
            onClick={() => archive.mutate(!data.archived)}
          >
            {data.archived ? "Wieder aktivieren" : "Archivieren"}
          </button>
        </>
      )}
    </>
  );
}

/** The pet with its mood, what comes next, and the actions that fit its kind. Its wash follows the mood. */
function PetPanel({ ferment, onChange }: { ferment: FermentDetail; onChange: () => Promise<unknown> }) {
  const state = useLiveState(ferment);
  return (
    <section className="st-hero" data-tone={state.tone} aria-label="Zustand">
      <div className="st-hero-top">
        <span className="st-hero-jar">
          <Pet kind={ferment.kind} variant={ferment.variant} stage={state.stage} mood={state.mood} size={104} />
        </span>
        <div className="st-hero-info">
          <span className="st-tag">{state.label}</span>
          <p className="st-hero-says">{state.says}</p>
          {state.next && <p className="st-quiet">{state.next}</p>}
          {state.meter && <Meter {...state.meter} />}
        </div>
      </div>
      <div className="st-hero-actions">
        {ferment.family === "keep" ? (
          <KeepActions ferment={ferment} onChange={onChange} />
        ) : ferment.family === "culture" ? (
          <CultureActions ferment={ferment} onChange={onChange} />
        ) : (
          <BatchActions ferment={ferment} onChange={onChange} />
        )}
      </div>
    </section>
  );
}

/** The facts as a jar label, like the nutrition label in food: the one loud element on the page. */
function FermentLabel({ ferment }: { ferment: FermentDetail }) {
  const state = useLiveState(ferment);
  const { label, variantLabel } = resolve(ferment.kind, ferment.variant);
  const rows: [string, string][] = [];
  if (variantLabel) rows.push(["Sorte", variantLabel]);
  const temperature = ferment.temperature ?? temperatureOf(ferment.kind, ferment.variant);
  if (ferment.family === "keep") {
    rows.push(["Mehl", ferment.flour], ["Hydration", `${ferment.hydration} %`]);
    if (ferment.lastFeeding) rows.push(["Letzte Fütterung", `${ago(ferment.lastFeeding.fedAt)} · ${ferment.lastFeeding.ratio}`]);
    if (ferment.fridgeSince) rows.push(["Kühlschrank", `seit ${ago(ferment.fridgeSince).replace(/^vor /, "")}`]);
    rows.push(["Alter", age(ferment.startedAt)]);
  } else if (ferment.family === "culture") {
    rows.push(["Zuletzt versorgt", ago(ferment.culture.tendedAt)]);
    if (ferment.fridgeSince) rows.push(["Kühlschrank", `seit ${ago(ferment.fridgeSince).replace(/^vor /, "")}`]);
    else if (temperature !== null) rows.push(["Raum", `${temperature.toLocaleString("de-DE")} °C`]);
    rows.push(["Alter", age(ferment.startedAt)]);
  } else {
    const batch = batchMood(ferment);
    rows.push(["Angesetzt", fedAt(ferment.startedAt)]);
    if (batch.stageIndex > 0 || batch.stage.next) rows.push(["Stufe", batch.stage.label]);
    if (temperature !== null) rows.push(["Raum", `${temperature.toLocaleString("de-DE")} °C`]);
    if (batch.mood !== "done" && batch.stage.readyDays.from > 0)
      rows.push(["Bereit", `${whenDay(batch.readyAt)} bis ${whenDay(batch.bestUntil)}`]);
  }
  const big = state.meter ? `${Math.round(state.meter.value * 100)} %` : "–";
  return (
    <section className="st-label" aria-label="Etikett">
      <h2 className="st-label-title">{label}</h2>
      <table>
        <tbody>
          <tr className="st-label-big">
            <th scope="row">{state.meter?.label ?? "Zustand"}</th>
            <td>{big}</td>
          </tr>
          {rows.map(([name, value]) => (
            <tr key={name}>
              <th scope="row">{name}</th>
              <td>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {ferment.notes && <p className="st-label-note">{ferment.notes}</p>}
    </section>
  );
}
