"use client";
import { useState, useId, useEffect, type ReactNode, type FormEvent } from "react";
import Link from "next/link";
import {
  Bookmark,
  CalendarDays,
  ChartNoAxesCombined,
  Clock,
  Layers,
  UsersRound,
  Bell,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "./ui/button";
import { NativeSelect, NativeSelectOption } from "./ui/native-select";
import { Textarea } from "./ui/textarea";
import { useDemo } from "./demo-provider";
import { ProfileLayout } from "./profile-screens";
import { Field, Submit } from "./studio-ui";
import { sports } from "@/lib/model";
import { members } from "@/lib/social";
import { limits } from "@/lib/entitlements";
import { emptyDirectoryFilters, effectiveDirectoryFilters, matchesDirectory, type DirectoryFilters } from "@/lib/directory";
import { memberSports } from "@/lib/trust";
import { cities, distanceKm, canViewMatch, personalMatch, profileCity } from "@/lib/events";
import { calendarFile, weeklyDates, type Search, type Team, type Manager } from "@/lib/extensions";
import { agendaEntries } from "@/lib/agenda";

const uid = () => crypto.randomUUID();
const name = (id: string) =>
  members.find((m) => m.id === id)?.name || (id === "owner" ? "Propriétaire" : id);
const when = (s: string) =>
  new Intl.DateTimeFormat("fr-BE", { dateStyle: "medium", timeStyle: "short" }).format(new Date(s));
function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: (string | [string, string])[];
}) {
  const id = useId();
  return (
    <Field id={id} label={label}>
      <NativeSelect id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => {
          const [v, t] = typeof o === "string" ? [o, o] : o;
          return (
            <NativeSelectOption key={v} value={v}>
              {t}
            </NativeSelectOption>
          );
        })}
      </NativeSelect>
    </Field>
  );
}
function CheckChoice({
  children,
  checked,
  onChange,
}: {
  children: ReactNode;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="extension-check">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{children}</span>
    </label>
  );
}
function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="extension-card">
      <h2>{title}</h2>
      {children}
    </section>
  );
}
function Premium({ children }: { children: ReactNode }) {
  const { careerActor } = useDemo();
  return careerActor.premium ? (
    <>{children}</>
  ) : (
    <aside className="extension-lock">
      <strong>Inclus dans Premium</strong>
      <p>Votre offre gratuite reste accessible. Activez Premium pour essayer cette extension.</p>
      <Link href="/abonnement">
        Découvrir mon offre <ArrowUpRight size={16} />
      </Link>
    </aside>
  );
}
const routes = [
  ["recherches", "Recherches favorites", Bookmark],
  ["publications-programmees", "Publications", Clock],
  ["talents", "Talents & portefeuille", UsersRound],
  ["essais-groupes", "Essais groupés", UsersRound],
  ["equipes", "Équipes & accès", Layers],
  ["agenda", "Agenda", CalendarDays],
  ["statistiques", "Statistiques & invitations", ChartNoAxesCombined],
] as const;
export function ExtensionNav({ compact = false }: { compact?: boolean }) {
  return (
    <nav className="extension-nav" aria-label="Outils complémentaires">
      {(compact ? routes.slice(0, 1) : routes).map(([route, label, Icon]) => (
        <Link href={`/${route}`} key={route}>
          <Icon size={17} />
          {label}
        </Link>
      ))}
      {compact && (
        <Link href="/outils">
          <Layers size={17} />
          Tous mes outils
        </Link>
      )}
    </nav>
  );
}
export function ExtensionPage({ section = "outils" }: { section?: string }) {
  const {
    extensions,
    dispatchExtension,
    careerActor,
    careerActors,
    setCareerActor,
    extensionWorkspace: w,
  } = useDemo();
  const title = routes.find((r) => r[0] === section)?.[1] || "Mes outils";
  return (
    <ProfileLayout back="/profil">
      <div className="extension-page">
        <header>
          <span className="mini-kicker">ARENA / VOTRE ESPACE DE TRAVAIL</span>
          <h1>
            {title}
            <span>.</span>
          </h1>
          <p className="demo-context">
            Démo interactive · données fictives conservées pendant cette visite. Aucun envoi, aucune
            connexion à un service externe.
          </p>
        </header>
        <details className="extension-simulation">
          <summary>
            Tester un autre rôle · {careerActor.name} ·{" "}
            {careerActor.premium ? "Premium" : "Gratuit"}
          </summary>
          <Select
            label="Profil fictif de simulation"
            value={careerActor.id}
            onChange={setCareerActor}
            options={careerActors
              .filter((a) => ["self", "lea", "noah", "marc", "horizon", "arena"].includes(a.id))
              .map((a) => [a.id, a.name + " · " + a.category])}
          />
          <p>
            Les espaces sont séparés par profil. Revenez à votre profil pour programmer ses
            publications.
          </p>
        </details>
        <ExtensionNav />
        {extensions.error && (
          <div role="alert" className="extension-error">
            {extensions.error}
            <Button variant="ghost" onClick={() => dispatchExtension({ type: "clear" })}>
              Fermer
            </Button>
          </div>
        )}
        {section === "outils" && (
          <>
            <Card title="Des outils pour passer à l’action">
              <p>
                Retrouvez une recherche, préparez votre communication, centralisez les talents ou
                coordonnez votre équipe.
              </p>
              <p>
                Les quotas de cette version suivent votre fichier Excel mis à jour. Les réactions,
                commentaires et partages restent gratuits.
              </p>
              <Link href="/abonnement" className="text-link">
                {careerActor.premium ? "Gérer mon abonnement" : "Comparer gratuit et Premium"}
              </Link>
            </Card>
            <ExtensionNotices />
          </>
        )}
        {section === "recherches" && <SearchWorkspace />}
        {section === "publications-programmees" && <ScheduledWorkspace />}
        {section === "talents" && <TalentWorkspace />}
        {section === "essais-groupes" && <TrialWorkspace />}
        {section === "equipes" && <TeamWorkspace />}
        {section === "calendrier-avance" && <CalendarWorkspace />}
        {section === "statistiques" && <StatsWorkspace />}
        <p className="extension-footnote">
          Les simulations ne créent aucun droit réel d’accès. En production : contrôle serveur des
          quotas et permissions, notifications et traitements en arrière-plan.
        </p>
      </div>
    </ProfileLayout>
  );
}
export function SaveDirectorySearch({
  filters,
  onLoad,
}: {
  filters: DirectoryFilters;
  onLoad: (f: DirectoryFilters) => void;
}) {
  const { extensionWorkspace: w, dispatchExtension, careerActor, trust } = useDemo();
  const [title, setTitle] = useState(""),
    [alerts, setAlerts] = useState(false);
  const items = w.searches.filter((s) => s.kind === "people");
  return (
    <details className="extension-inline">
      <summary>
        <Bookmark size={16} /> Retrouver cette recherche en un clic
      </summary>
      <p>
        Enregistrez vos filtres actuels, par exemple « Tennis · Bruxelles ». Premium peut vous
        alerter de nouvelles correspondances.
      </p>
      <div className="extension-form">
        <Field
          label="Nom de la recherche"
          id="saved-name"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={160}
        />
        <CheckChoice checked={alerts} onChange={setAlerts}>
          M’alerter des nouveaux profils · Premium
        </CheckChoice>
        <Button
          onClick={() => {
            dispatchExtension({
              type: "search",
              value: {
                id: uid(),
                name: title,
                kind: "people",
                filters: { ...filters },
                alerts,
                seen: members
                  .filter(
                    (m) =>
                      !trust.blocked.includes(m.id) &&
                      matchesDirectory(m, memberSports[m.id] || [], filters),
                  )
                  .map((m) => m.id),
              },
            });
          }}
        >
          Enregistrer mes critères
        </Button>
      </div>
      <p>
        {w.searches.length}/{limits(careerActor.category, careerActor.premium).searches}{" "}
        recherche(s) enregistrée(s)
      </p>
      {items.map((s) => (
        <Button
          key={s.id}
          variant="outline"
          onClick={() => onLoad({ ...emptyDirectoryFilters, ...s.filters })}
        >
          {s.name}
        </Button>
      ))}
      <Link href="/recherches" className="text-link">
        Gérer mes recherches favorites
      </Link>
    </details>
  );
}
function SearchWorkspace() {
  const {
    extensionWorkspace: w,
    dispatchExtension,
    career,
    events,
    careerActor,
    profile,
    trust,
  } = useDemo();
  const [kind, setKind] = useState("opportunities"),
    [title, setTitle] = useState(""),
    [sport, setSport] = useState("Tous"),
    [city, setCity] = useState(""),
    [level, setLevel] = useState(""),
    [radius, setRadius] = useState("50"),
    [after, setAfter] = useState(""),
    [alerts, setAlerts] = useState(false),
    [active, setActive] = useState<Search | null>(null);
  function results(s: Search) {
    if (s.kind === "people")
      return members
        .filter(
          (m) =>
            !trust.blocked.includes(m.id) &&
            matchesDirectory(m, memberSports[m.id] || [], effectiveDirectoryFilters({
              ...emptyDirectoryFilters,
              ...s.filters,
            }, careerActor.premium)),
        )
        .map((m) => ({
          id: m.id,
          title: m.name,
          detail: `${m.sport} · ${m.city}`,
          href: "/reseau",
        }));
    if (s.kind === "opportunities")
      return career.offers
        .filter(
          (o) =>
            o.open &&
            !trust.blocked.includes(o.owner) &&
            (s.filters.sport === "Tous" || o.sport === s.filters.sport) &&
            o.city.toLowerCase().includes(s.filters.city.toLowerCase()),
        )
        .map((o) => ({
          id: o.id,
          title: o.title,
          detail: `${o.sport} · ${o.city}`,
          href: "/opportunities",
        }));
    return events.matches
      .filter(
        (m) =>
          m.open &&
          !m.cancelled &&
          !m.confirmed &&
          canViewMatch(m, {
            premium: careerActor.premium,
            category: careerActor.category,
            city: profileCity(s.filters.city || profile.city),
            now: Date.now(),
            radius: Number(s.filters.radius || 50),
          }) &&
          (s.filters.sport === "Tous" || m.sport === s.filters.sport) &&
          (!s.filters.level || m.level === s.filters.level) &&
          m.slots.some(
            (t) =>
              Date.parse(t.start) > Date.now() &&
              (!s.filters.after || new Date(t.start).getHours() >= Number(s.filters.after)),
          ),
      )
      .map((m) => ({
        id: m.id,
        title: m.title,
        detail: `${m.sport} · ${m.city} · ${m.level || "Niveau non précisé"}`,
        href: `/match?id=${m.id}`,
      }));
  }
  useEffect(() => {
    w.searches
      .filter((s) => s.alerts)
      .forEach((s) =>
        dispatchExtension({ type: "search-check", id: s.id, results: results(s).map((r) => r.id) }),
      );
  }, [career.offers, events.matches, careerActor.premium]);
  function save(e: FormEvent) {
    e.preventDefault();
    const s: Search = {
      id: uid(),
      name: title,
      kind: kind as Search["kind"],
      filters: { sport, city, level, radius, after },
      alerts,
      seen: [],
    };
    s.seen = results(s).map((r) => r.id);
    dispatchExtension({ type: "search", value: s });
  }
  return (
    <>
      <Card title="Vos critères, mémorisés">
        <p>
          Une recherche favorite conserve vos filtres ; elle ne contacte personne. Une alerte
          signale uniquement les nouveaux résultats, sans répéter ceux déjà vus.
        </p>
        <Link href="/reseau" className="text-link">
          Enregistrer une recherche de personnes depuis le réseau
        </Link>
      </Card>
      <Card title="Suivre des opportunités ou des matchs">
        <form className="extension-form" onSubmit={save}>
          <Select
            label="Je recherche"
            value={kind}
            onChange={setKind}
            options={[
              ["opportunities", "Des opportunités"],
              ["events", "Des matchs ouverts"],
            ]}
          />
          <Field
            id="search-title"
            label="Nom de la recherche"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={160}
          />
          <Select label="Sport" value={sport} onChange={setSport} options={["Tous", ...sports]} />
          <Field
            id="search-city"
            label={kind === "events" ? "Ville de départ (Belgique · démo)" : "Ville"}
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          {kind === "events" && (
            <>
              <Select
                label="Rayon en km · Premium au-delà de 50 km"
                value={radius}
                onChange={setRadius}
                options={["10", "25", "50", "100", "200", "500"]}
              />
              <Select
                label="Niveau souhaité"
                value={level}
                onChange={setLevel}
                options={[
                  ["", "Tous niveaux"],
                  "Débutant",
                  "Intermédiaire",
                  "Confirmé",
                  "Compétition",
                ]}
              />
              <Select
                label="À partir de"
                value={after}
                onChange={setAfter}
                options={[
                  ["", "Toute la journée"],
                  ["8", "8 h"],
                  ["12", "12 h"],
                  ["17", "17 h"],
                  ["20", "20 h"],
                ]}
              />
              <p>
                Les villes disponibles pour la distance : {Object.keys(cities).join(", ")}. Les
                événements sans niveau ne correspondent pas à un filtre de niveau précis.
              </p>
            </>
          )}
          <CheckChoice checked={alerts} onChange={setAlerts}>
            M’alerter des nouveautés · Premium
          </CheckChoice>
          <Submit>Enregistrer la recherche</Submit>
        </form>
      </Card>
      <Card
        title={`Mes recherches · ${w.searches.length}/${limits(careerActor.category, careerActor.premium).searches}`}
      >
        {!w.searches.length && (
          <p>Aucune recherche enregistrée. Vos filtres du réseau peuvent aussi être mémorisés.</p>
        )}
        {w.searches.map((s) => (
          <article className="extension-item" key={s.id}>
            <strong>{s.name}</strong>
            <p>
              {s.alerts
                ? "Alertes activées · vérification pendant la visite"
                : "Sans alerte automatique"}
            </p>
            <div className="extension-actions">
              <Button
                onClick={() => {
                  setActive(s);
                  dispatchExtension({
                    type: "search-check",
                    id: s.id,
                    results: results(s).map((r) => r.id),
                  });
                }}
              >
                Voir les résultats
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  dispatchExtension({ type: "search", value: { ...s, alerts: !s.alerts } })
                }
              >
                {s.alerts ? "Désactiver" : "Activer"} l’alerte
              </Button>
              <Button
                variant="ghost"
                onClick={() => dispatchExtension({ type: "search-remove", id: s.id })}
              >
                Supprimer
              </Button>
            </div>
          </article>
        ))}
        {active && (
          <div className="extension-results">
            <h3>{active.name}</h3>
            {!results(active).length && <p>Aucune correspondance actuellement.</p>}
            {results(active).map((r) => (
              <Link key={r.id} href={r.href}>
                <strong>{r.title}</strong>
                <small>{r.detail}</small>
              </Link>
            ))}
          </div>
        )}
      </Card>
      <ExtensionNotices />
      <p className="demo-context">
        Les alertes consultent les données de démonstration. Pas de notification lorsque
        l’application est fermée.
      </p>
    </>
  );
}
function ScheduledWorkspace() {
  const { extensionWorkspace: w, dispatchExtension, runScheduled, careerActor } = useDemo();
  const [text, setText] = useState(""),
    [start, setStart] = useState(""),
    [sport, setSport] = useState("Tennis");
  return (
    <>
      <Card title="Préparer maintenant, publier plus tard">
        <p>
          La publication rejoint le fil lorsque l’heure arrive et que cette démo reste ouverte. Le
          bouton de simulation permet de tester immédiatement la diffusion.
        </p>
        {careerActor.id !== "self" ? (
          <p>Revenez à « Mon profil actuel » pour publier dans votre fil.</p>
        ) : (
          <Premium>
            <form
              className="extension-form"
              onSubmit={(e) => {
                e.preventDefault();
                dispatchExtension({
                  type: "schedule",
                  value: {
                    id: uid(),
                    text,
                    sport,
                    start: new Date(start).toISOString(),
                    status: "planned",
                  },
                });
              }}
            >
              <Field id="scheduled-text" label="Votre publication">
                <Textarea
                  id="scheduled-text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  maxLength={1200}
                  required
                />
              </Field>
              <Select label="Discipline" value={sport} onChange={setSport} options={sports} />
              <Field
                id="publish-date"
                label="Date et heure (heure locale)"
                type="datetime-local"
                required
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
              <Submit>Programmer</Submit>
            </form>
          </Premium>
        )}
      </Card>
      <Card title="Mes publications programmées">
        {!w.schedules.length && <p>Vos prochaines publications apparaîtront ici.</p>}
        {w.schedules.map((p) => (
          <article key={p.id} className="extension-item">
            <p>{p.text}</p>
            <small>
              {p.sport} · {when(p.start)} ·{" "}
              {p.status === "planned"
                ? "Programmée"
                : p.status === "published"
                  ? "Publiée dans le fil démo"
                  : "Annulée"}
            </small>
            {p.status === "planned" && (
              <div className="extension-actions">
                <Button onClick={() => runScheduled(Date.parse(p.start))}>
                  Simuler l’arrivée de cette date
                </Button>
                <Button
                  variant="ghost"
                  onClick={() =>
                    dispatchExtension({ type: "schedule-status", id: p.id, status: "cancelled" })
                  }
                >
                  Annuler
                </Button>
              </div>
            )}
          </article>
        ))}
        <Link href="/accueil" className="text-link">
          Voir le fil d’actualité
        </Link>
      </Card>
    </>
  );
}
function TalentWorkspace() {
  const { extensionWorkspace: w, dispatchExtension, careerActor } = useDemo();
  const [title, setTitle] = useState(""),
    [selected, setSelected] = useState(""),
    [person, setPerson] = useState("lea"),
    [editing, setEditing] = useState(""),
    [note, setNote] = useState(""),
    [step, setStep] = useState("À contacter"),
    [next, setNext] = useState("");
  const list = w.lists.find((l) => l.id === selected) || w.lists[0],
    l = limits(careerActor.category, careerActor.premium);
  if (careerActor.category === "Sportif")
    return (
      <Card title="Un espace pour les recruteurs et accompagnants">
        <p>
          Le portefeuille est réservé aux professionnels ; les viviers sont destinés aux collectifs.
          Vous pouvez suivre les profils dans votre réseau.
        </p>
        <Link href="/reseau">Mon réseau</Link>
      </Card>
    );
  return (
    <>
      <Card
        title={
          careerActor.category === "Professionnel"
            ? "Mes listes et mon portefeuille métier"
            : "Mes viviers de recrutement"
        }
      >
        <p>
          {w.lists.length}/{l.lists} listes · {w.lists.reduce((n, l) => n + l.profiles.length, 0)}/
          {l.talents} profils au total. Les notes ne sont jamais affichées sur le profil public.
        </p>
        <form
          className="extension-form"
          onSubmit={(e) => {
            e.preventDefault();
            dispatchExtension({ type: "list", id: uid(), name: title });
          }}
        >
          <Field
            id="list-title"
            label="Nom de la liste"
            placeholder="Talents à suivre, joueurs accompagnés…"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Submit>Créer une liste</Submit>
        </form>
      </Card>
      {list && (
        <Card title={list.name}>
          <Select
            label="Liste à consulter"
            value={list.id}
            onChange={(v) => {
              setSelected(v);
              setEditing("");
            }}
            options={w.lists.map((l) => [l.id, l.name])}
          />
          <div className="extension-form">
            <Select
              label="Ajouter un profil fictif"
              value={person}
              onChange={setPerson}
              options={members.map((m) => [m.id, m.name])}
            />
            <Button
              onClick={() => dispatchExtension({ type: "talent", list: list.id, id: person })}
            >
              Conserver ce profil
            </Button>
          </div>
          {list.profiles.map((p) => (
            <article className="extension-item" key={p.id}>
              <strong>{name(p.id)}</strong>
              <small>
                {p.step}
                {p.next ? " · Suivi le " + when(p.next) : ""}
              </small>
              {careerActor.premium && p.note && (
                <p className="extension-private">Note privée : {p.note}</p>
              )}
              <div className="extension-actions">
                <Link href="/reseau">Voir le réseau</Link>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditing(p.id);
                    setNote(p.note);
                    setStep(p.step);
                    setNext(p.next ? p.next.slice(0, 16) : "");
                  }}
                >
                  Dossier & suivi
                </Button>
                <Button
                  variant="ghost"
                  onClick={() =>
                    dispatchExtension({ type: "talent", list: list.id, id: p.id, remove: true })
                  }
                >
                  Retirer
                </Button>
              </div>
              {editing === p.id && (
                <Premium>
                  <form
                    className="extension-form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      dispatchExtension({
                        type: "talent",
                        list: list.id,
                        id: p.id,
                        note,
                        step,
                        next: next ? new Date(next).toISOString() : "",
                      });
                    }}
                  >
                    <p>{members.find((m) => m.id === p.id)?.bio}</p>
                    <Select
                      label="Étape du suivi"
                      value={step}
                      onChange={setStep}
                      options={[
                        "À contacter",
                        "Contacté",
                        "Dossier en étude",
                        "Rendez-vous prévu",
                        "Accompagné",
                        "Archivé",
                      ]}
                    />
                    <Field id="talent-note" label="Note privée">
                      <Textarea
                        id="talent-note"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        maxLength={1200}
                      />
                    </Field>
                    <Field
                      id="talent-next"
                      label="Prochaine démarche"
                      type="datetime-local"
                      value={next}
                      onChange={(e) => setNext(e.target.value)}
                    />
                    <Submit>Enregistrer le suivi</Submit>
                  </form>
                </Premium>
              )}
            </article>
          ))}
        </Card>
      )}
    </>
  );
}
function TrialWorkspace() {
  const { extensionWorkspace: w, dispatchExtension, careerActor } = useDemo();
  const [title, setTitle] = useState(""),
    [start, setStart] = useState(""),
    [place, setPlace] = useState(""),
    [capacity, setCapacity] = useState("8"),
    [selected, setSelected] = useState<string[]>([]);
  if (careerActor.category === "Sportif")
    return (
      <Card title="Vos invitations à des essais">
        <p>
          Les sessions sont organisées par un club ou un professionnel. La réponse à une invitation
          reste gratuite.
        </p>
        <Link href="/candidatures">Mes candidatures et essais</Link>
      </Card>
    );
  return (
    <>
      <Premium>
        <Card title="Inviter plusieurs candidats à un essai">
          <form
            className="extension-form"
            onSubmit={(e) => {
              e.preventDefault();
              dispatchExtension({
                type: "session",
                value: {
                  id: uid(),
                  title,
                  start: new Date(start).toISOString(),
                  place,
                  capacity: Number(capacity),
                  participants: selected.map((id) => ({ id, status: "invited" })),
                },
              });
            }}
          >
            <Field
              id="trial-title"
              label="Nom de la session"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <Field
              id="trial-date"
              label="Date et heure"
              type="datetime-local"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              required
            />
            <Field
              id="trial-place"
              label="Lieu"
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              required
            />
            <Field
              id="trial-capacity"
              label="Places disponibles"
              type="number"
              min={1}
              max={100}
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
            />
            <fieldset>
              <legend>Candidats fictifs à inviter</legend>
              {members
                .filter((m) => m.kind === "Joueurs")
                .map((m) => (
                  <CheckChoice
                    key={m.id}
                    checked={selected.includes(m.id)}
                    onChange={(yes) =>
                      setSelected(yes ? [...selected, m.id] : selected.filter((id) => id !== m.id))
                    }
                  >
                    {m.name}
                  </CheckChoice>
                ))}
            </fieldset>
            <Submit>Créer la session et ses invitations démo</Submit>
          </form>
        </Card>
      </Premium>
      <Card title="Sessions et confirmations">
        {!w.sessions.length && <p>Aucune session créée.</p>}
        {w.sessions.map((s) => (
          <article key={s.id} className="extension-item">
            <strong>{s.title}</strong>
            <p>
              {when(s.start)} · {s.place}
            </p>
            <p>
              {s.participants.filter((p) => p.status === "accepted").length}/{s.capacity}{" "}
              confirmations · {s.participants.filter((p) => p.status === "invited").length} en
              attente
            </p>
            {s.participants.map((p) => (
              <div className="extension-response" key={p.id}>
                <span>
                  {name(p.id)} ·{" "}
                  {p.status === "invited"
                    ? "Invité"
                    : p.status === "accepted"
                      ? "Confirmé"
                      : "Décliné"}
                </span>
                <Button
                  variant="outline"
                  onClick={() =>
                    dispatchExtension({
                      type: "session-reply",
                      id: s.id,
                      person: p.id,
                      accept: true,
                    })
                  }
                >
                  Simuler : accepte
                </Button>
                <Button
                  variant="ghost"
                  onClick={() =>
                    dispatchExtension({
                      type: "session-reply",
                      id: s.id,
                      person: p.id,
                      accept: false,
                    })
                  }
                >
                  Décline
                </Button>
              </div>
            ))}
            <Button
              variant="ghost"
              onClick={() => dispatchExtension({ type: "session-remove", id: s.id })}
            >
              Supprimer cette session
            </Button>
          </article>
        ))}
        <Link href="/agenda">Retrouver les sessions dans l’agenda</Link>
      </Card>
    </>
  );
}
function TeamWorkspace() {
  const { extensionWorkspace: w, dispatchExtension, careerActor, events, career } = useDemo();
  const [title, setTitle] = useState(""),
    [sport, setSport] = useState("Football"),
    [description, setDescription] = useState(""),
    [need, setNeed] = useState(""),
    [event, setEvent] = useState(""),
    [teamId, setTeamId] = useState(""),
    [person, setPerson] = useState("lea"),
    [role, setRole] = useState("Joueur"),
    [managerName, setManagerName] = useState(""),
    [managerRole, setManagerRole] = useState("recruiter"),
    [candidate, setCandidate] = useState("lea"),
    [assigned, setAssigned] = useState("owner"),
    [note, setNote] = useState("");
  const team = w.teams.find((t) => t.id === teamId) || w.teams[0];
  if (careerActor.category !== "Organisation")
    return (
      <Card title="Équipes et gestionnaires">
        <p>
          Cet espace concerne les collectifs. Le menu « Tester un autre rôle » permet d’essayer
          Horizon Padel ou Collectif Arena.
        </p>
      </Card>
    );
  return (
    <>
      <Card title="Présenter les équipes et sections">
        <form
          className="extension-form"
          onSubmit={(e) => {
            e.preventDefault();
            dispatchExtension({
              type: "team",
              value: {
                id: uid(),
                name: title,
                sport,
                description,
                need,
                eventIds: event ? [event] : [],
                links: [],
              },
            });
          }}
        >
          <Field
            id="team-title"
            label="Équipe ou section"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <Select label="Discipline" value={sport} onChange={setSport} options={sports} />
          <Field id="team-desc" label="Présentation publique">
            <Textarea
              id="team-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={600}
            />
          </Field>
          {careerActor.premium && (
            <>
              <Field
                id="team-need"
                label="Besoins de l’équipe · privé"
                value={need}
                onChange={(e) => setNeed(e.target.value)}
              />
              <Select
                label="Événement associé"
                value={event}
                onChange={setEvent}
                options={[
                  ["", "Aucun pour le moment"],
                  ...events.matches
                    .filter((m) => m.host === "me")
                    .map((m) => [m.id, m.title] as [string, string]),
                ]}
              />
            </>
          )}
          <Submit>Créer la section</Submit>
        </form>
      </Card>
      {w.teams.map((t) => (
        <Card title={t.name} key={t.id}>
          <p>
            {t.sport} · {t.description || "Présentation à compléter"}
          </p>
          <h3>Vue publique : membres ayant confirmé leur lien</h3>
          <p>
            {t.links
              .filter((l) => l.status === "confirmed")
              .map((l) => `${name(l.id)} (${l.role})`)
              .join(", ") || "Aucune relation confirmée."}
          </p>
          {careerActor.premium && (
            <div className="extension-private">
              <h3>Organisation interne</h3>
              <p>Besoins : {t.need || "Aucun besoin renseigné"}</p>
              {t.eventIds.map((id) => (
                <Link key={id} href={`/match?id=${id}`}>
                  {events.matches.find((m) => m.id === id)?.title || "Événement"}
                </Link>
              ))}
              <Button
                variant="outline"
                onClick={() => {
                  setTeamId(t.id);
                  setNeed(t.need);
                }}
              >
                Gérer les besoins
              </Button>
              {teamId === t.id && (
                <form
                  className="extension-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    dispatchExtension({
                      type: "team",
                      value: { ...t, need, eventIds: event ? [event] : t.eventIds },
                    });
                  }}
                >
                  <Field
                    id="edit-need"
                    label="Besoins"
                    value={need}
                    onChange={(e) => setNeed(e.target.value)}
                  />
                  <Select
                    label="Associer un match"
                    value={event}
                    onChange={setEvent}
                    options={[
                      ["", "Conserver"],
                      ...events.matches
                        .filter((m) => m.host === "me")
                        .map((m) => [m.id, m.title] as [string, string]),
                    ]}
                  />
                  <Submit>Enregistrer</Submit>
                </form>
              )}
            </div>
          )}
        </Card>
      ))}
      {team && (
        <Card title="Liens avec les joueurs et le staff">
          <p>
            Le lien n’apparaît publiquement qu’après confirmation par la personne concernée. Les
            boutons ci-dessous simulent sa réponse.
          </p>
          <div className="extension-form">
            <Select
              label="Équipe"
              value={team.id}
              onChange={setTeamId}
              options={w.teams.map((t) => [t.id, t.name])}
            />
            <Select
              label="Personne"
              value={person}
              onChange={setPerson}
              options={members.filter((m) => m.kind !== "Collectives").map((m) => [m.id, m.name])}
            />
            <Select
              label="Rôle dans l’équipe"
              value={role}
              onChange={setRole}
              options={["Joueur", "Entraîneur", "Staff médical", "Préparateur physique", "Manager"]}
            />
            <Button
              onClick={() => dispatchExtension({ type: "link", team: team.id, id: person, role })}
            >
              Demander la confirmation du lien
            </Button>
          </div>
          {team.links.map((l) => (
            <article className="extension-item" key={l.id}>
              <strong>
                {name(l.id)} · {l.role}
              </strong>
              <p>
                {l.status === "confirmed"
                  ? "Lien confirmé et visible"
                  : l.status === "declined"
                    ? "Lien refusé, non public"
                    : "En attente, non public"}
              </p>
              <div className="extension-actions">
                <Button
                  variant="outline"
                  onClick={() =>
                    dispatchExtension({ type: "link-reply", team: team.id, id: l.id, accept: true })
                  }
                >
                  Simuler : confirme
                </Button>
                <Button
                  variant="ghost"
                  onClick={() =>
                    dispatchExtension({
                      type: "link-reply",
                      team: team.id,
                      id: l.id,
                      accept: false,
                    })
                  }
                >
                  Refuse / retire son accord
                </Button>
              </div>
            </article>
          ))}
        </Card>
      )}
      <Card
        title={`Gestionnaires · ${w.managers.length}/${limits(careerActor.category, careerActor.premium).managers}`}
      >
        <p>
          Propriétaire / administrateur : tous les outils. Recruteur : talents, essais et suivi des
          candidats. Lecture seule : consultation. Les notes internes ne sont pas publiques.
        </p>
        <Select
          label="Tester les permissions avec le rôle de"
          value={w.activeManager}
          onChange={(id) => dispatchExtension({ type: "manager-switch", id })}
          options={w.managers
            .filter((m) => m.status === "active")
            .map((m) => [m.id, `${m.name} · ${m.role}`])}
        />
        <Premium>
          <form
            className="extension-form"
            onSubmit={(e) => {
              e.preventDefault();
              dispatchExtension({
                type: "manager",
                value: {
                  id: uid(),
                  name: managerName,
                  role: managerRole as Manager["role"],
                  status: "invited",
                },
              });
            }}
          >
            <Field
              id="manager-name"
              label="Nom du gestionnaire fictif"
              value={managerName}
              onChange={(e) => setManagerName(e.target.value)}
              required
            />
            <Select
              label="Droits"
              value={managerRole}
              onChange={setManagerRole}
              options={[
                ["admin", "Administrateur"],
                ["recruiter", "Recruteur"],
                ["viewer", "Lecture seule"],
              ]}
            />
            <Submit>Inviter un gestionnaire</Submit>
          </form>
        </Premium>
        {w.managers.map((m) => (
          <div className="extension-item" key={m.id}>
            <strong>
              {m.name} · {m.role}
            </strong>
            <p>{m.status === "active" ? "Accès actif" : "Invitation en attente"}</p>
            {m.status === "invited" && (
              <Button onClick={() => dispatchExtension({ type: "manager-activate", id: m.id })}>
                Simuler l’acceptation
              </Button>
            )}
            {m.id !== "owner" && (
              <Button
                variant="ghost"
                onClick={() => dispatchExtension({ type: "manager-remove", id: m.id })}
              >
                Retirer l’accès
              </Button>
            )}
          </div>
        ))}
      </Card>
      <Premium>
        <Card title="Suivi collaboratif des candidats">
          <form
            className="extension-form"
            onSubmit={(e) => {
              e.preventDefault();
              dispatchExtension({ type: "assignment", id: candidate, manager: assigned, note });
            }}
          >
            <Select
              label="Candidat"
              value={candidate}
              onChange={setCandidate}
              options={members.filter((m) => m.kind !== "Collectives").map((m) => [m.id, m.name])}
            />
            <Select
              label="Responsable du suivi"
              value={assigned}
              onChange={setAssigned}
              options={w.managers
                .filter((m) => m.status === "active" && m.role !== "viewer")
                .map((m) => [m.id, m.name])}
            />
            <Field id="collab-note" label="Commentaire interne">
              <Textarea
                id="collab-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={1200}
              />
            </Field>
            <Submit>Attribuer et ajouter la note</Submit>
          </form>
          {Object.entries(w.assignments).map(([id, a]) => (
            <div key={id} className="extension-item">
              <strong>
                {name(id)} →{" "}
                {w.managers.find((m) => m.id === a.manager)?.name || "Gestionnaire retiré"}
              </strong>
              {a.notes.map((n, i) => (
                <p key={i}>
                  <small>
                    {w.managers.find((m) => m.id === n.author)?.name || "Ancien gestionnaire"} :
                  </small>{" "}
                  {n.text}
                </p>
              ))}
            </div>
          ))}
          <Link href="/recrutement">Ouvrir les candidatures et décisions</Link>
        </Card>
      </Premium>
    </>
  );
}
export function CalendarWorkspace({ compact = false }: { compact?: boolean }) {
  const {
    extensionWorkspace: w,
    dispatchExtension,
    careerActor,
    career,
    dispatchCareer,
    events,
    dispatchEvent,
    notify,
  } = useDemo();
  const [provider, setProvider] = useState(w.calendar.provider),
    [reminder, setReminder] = useState(String(w.calendar.reminder)),
    [start, setStart] = useState(""),
    [count, setCount] = useState("4"),
    [place, setPlace] = useState(""),
    [source, setSource] = useState(""),
    [candidate, setCandidate] = useState("lea"),
    [staff, setStaff] = useState<string[]>(["owner"]);
  const originals = events.matches.filter((m) => m.host === "me" && !m.cancelled),
    original = originals.find((m) => m.id === source) || originals[0];
  const items = agendaEntries(events, career, w, careerActor.id, name);
  function download() {
    if (!careerActor.premium) return;
    const blob = new Blob([calendarFile(items, w.calendar.reminder)], {
      type: "text/calendar;charset=utf-8",
    });
    const url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = "Opportunity-Players-agenda-demo.ics";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function series(e: FormEvent) {
    e.preventDefault();
    if (!original) return;
    const dates = weeklyDates(start, Number(count));
    dispatchEvent({
      type: "series",
      matches: dates.map((date) => ({
        ...original,
        id: uid(),
        slots: [{ id: uid(), start: date, minutes: original.slots[0].minutes }],
        replies: [],
        confirmed: undefined,
        cancelled: false,
      })),
    });
  }
  function availability(e: FormEvent) {
    e.preventDefault();
    const dates = weeklyDates(start, Number(count));
    dispatchCareer({
      type: "slots-series",
      slots: dates.map((date) => ({ id: uid(), professional: careerActor.id, start: date, place })),
    });
  }
  return (
    <>
      {!compact && <Card title="Un agenda partagé pour vos activités">
        <p>
          Matchs confirmés, essais, rendez-vous et entretiens acceptés. Les créneaux et dates sont
          affichés dans votre fuseau local.
        </p>
        {!items.length && <p>Aucune activité confirmée pour le moment.</p>}
        {items.map((i) => (
          <article key={i.id} className="extension-item">
            <strong>{i.title}</strong>
            <p>
              {when(i.start)} · {i.place}
            </p>
          </article>
        ))}
      </Card>}
      <Premium>
        <Card title="Agenda externe et rappels">
          <p>
            La connexion ci-dessous est simulée : aucun accès à Google, Outlook ou Apple n’est
            demandé. L’export .ics est réel et contient uniquement les événements fictifs affichés
            ici ; ce n’est pas une synchronisation bidirectionnelle.
          </p>
          <div className="extension-form">
            <Select
              label="Agenda à tester"
              value={provider}
              onChange={setProvider}
              options={["Google Agenda", "Outlook", "Apple Calendrier"]}
            />
            <Select
              label="Rappel avant l’événement"
              value={reminder}
              onChange={setReminder}
              options={[
                ["15", "15 minutes"],
                ["60", "1 heure"],
                ["1440", "1 jour"],
              ]}
            />
            <Button
              onClick={() =>
                dispatchExtension({
                  type: "calendar",
                  provider,
                  reminder: Number(reminder),
                  connected: !w.calendar.connected,
                })
              }
            >
              {w.calendar.connected ? "Déconnecter la simulation" : "Simuler la connexion"}
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                dispatchExtension({
                  type: "calendar",
                  provider,
                  reminder: Number(reminder),
                  connected: w.calendar.connected,
                })
              }
            >
              Enregistrer le rappel
            </Button>
            <Button variant="outline" onClick={download} disabled={!items.length}>
              Exporter l’agenda fictif (.ics)
            </Button>
            <p>
              {w.calendar.connected
                ? `Connexion simulée : ${w.calendar.provider}`
                : "Aucun agenda externe connecté"}{" "}
              · rappel {w.calendar.reminder} min.
            </p>
            <Button
              variant="ghost"
              disabled={!items.length}
              onClick={() =>
                dispatchExtension({
                  type: "notice",
                  id: uid(),
                  text: `Rappel simulé : ${items[0]?.title} dans ${w.calendar.reminder} minutes.`,
                  href: "/agenda",
                })
              }
            >
              Tester un rappel dans les notifications
            </Button>
          </div>
        </Card>
      </Premium>
      <Premium>
        <Card title="Dupliquer une rencontre ou créer une série">
          {!original ? (
            <p>
              Créez d’abord un match dans « Jouer ensemble ». Une copie reprend lieu, sport,
              effectif et invitations, mais jamais les votes ni les confirmations.
            </p>
          ) : (
            <form className="extension-form" onSubmit={series}>
              <Select
                label="Rencontre à réutiliser"
                value={original.id}
                onChange={setSource}
                options={originals.map((m) => [m.id, m.title])}
              />
              <Field
                id="series-date"
                label="Première date"
                required
                type="datetime-local"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
              <Field
                id="series-count"
                label="Nombre de rencontres hebdomadaires (1 = duplication)"
                required
                type="number"
                min={1}
                max={12}
                value={count}
                onChange={(e) => setCount(e.target.value)}
              />
              <Submit>Créer les nouvelles rencontres</Submit>
            </form>
          )}
          {events.error && <p role="alert">{events.error}</p>}
          <Link href="/jouer">Voir les rencontres</Link>
        </Card>
      </Premium>
      {careerActor.category === "Professionnel" && (
        <Premium>
          <Card title="Disponibilités récurrentes">
            <p>
              Créez des créneaux hebdomadaires de 30 minutes. Ils apparaissent dans la prise de
              rendez-vous uniquement après acceptation de la demande. Une collision annule toute la
              série.
            </p>
            <form className="extension-form" onSubmit={availability}>
              <Field
                id="slot-start"
                label="Premier créneau"
                required
                type="datetime-local"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
              <Field
                id="slot-count"
                label="Nombre de semaines"
                required
                type="number"
                min={1}
                max={12}
                value={count}
                onChange={(e) => setCount(e.target.value)}
              />
              <Field
                id="slot-place"
                label="Lieu ou modalité"
                required
                value={place}
                onChange={(e) => setPlace(e.target.value)}
              />
              <Submit>Créer les disponibilités</Submit>
            </form>
            {career.error && <p role="alert">Impossible de créer la série : {career.error}</p>}
            {career.slots
              .filter((s) => s.professional === careerActor.id)
              .map((s) => (
                <p key={s.id}>
                  {when(s.start)} · {s.place}
                </p>
              ))}
            <Link href="/rendez-vous">Gérer mes rendez-vous</Link>
          </Card>
        </Premium>
      )}
      {careerActor.category === "Organisation" && (
        <Premium>
          <Card title="Coordonner un entretien avec le staff">
            <p>
              L’entretien est confirmé lorsque le candidat et tous les gestionnaires invités
              acceptent. Un refus annule la proposition. Les créneaux durent une heure.
            </p>
            <form
              className="extension-form"
              onSubmit={(e) => {
                e.preventDefault();
                dispatchExtension({
                  type: "interview",
                  value: {
                    id: uid(),
                    candidate,
                    staff,
                    start: new Date(start).toISOString(),
                    place,
                    accepted: [],
                    status: "proposed",
                  },
                });
              }}
            >
              <Select
                label="Candidat"
                value={candidate}
                onChange={setCandidate}
                options={members.filter((m) => m.kind !== "Collectives").map((m) => [m.id, m.name])}
              />
              <Field
                id="interview-start"
                label="Date proposée"
                type="datetime-local"
                required
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
              <Field
                id="interview-place"
                label="Lieu"
                required
                value={place}
                onChange={(e) => setPlace(e.target.value)}
              />
              <fieldset>
                <legend>Gestionnaires invités</legend>
                {w.managers
                  .filter((m) => m.status === "active")
                  .map((m) => (
                    <CheckChoice
                      key={m.id}
                      checked={staff.includes(m.id)}
                      onChange={(yes) =>
                        setStaff(yes ? [...staff, m.id] : staff.filter((id) => id !== m.id))
                      }
                    >
                      {m.name}
                    </CheckChoice>
                  ))}
              </fieldset>
              <Submit>Proposer l’entretien</Submit>
            </form>
            {w.interviews.map((i) => (
              <article key={i.id} className="extension-item">
                <strong>
                  {name(i.candidate)} · {when(i.start)}
                </strong>
                <p>
                  {i.place} ·{" "}
                  {i.status === "confirmed"
                    ? "Confirmé"
                    : i.status === "cancelled"
                      ? "Annulé"
                      : "En attente des accords"}
                </p>
                {i.status === "proposed" &&
                  [i.candidate, ...i.staff].map((id) => (
                    <div className="extension-response" key={id}>
                      <span>
                        {w.managers.find((m) => m.id === id)?.name || name(id)} ·{" "}
                        {i.accepted.includes(id) ? "Accord reçu" : "En attente"}
                      </span>
                      <Button
                        variant="outline"
                        onClick={() =>
                          dispatchExtension({
                            type: "interview-reply",
                            id: i.id,
                            person: id,
                            accept: true,
                          })
                        }
                      >
                        Simuler : accepte
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() =>
                          dispatchExtension({
                            type: "interview-reply",
                            id: i.id,
                            person: id,
                            accept: false,
                          })
                        }
                      >
                        Refuse
                      </Button>
                    </div>
                  ))}
              </article>
            ))}
          </Card>
        </Premium>
      )}
    </>
  );
}
function StatsWorkspace() {
  const { extensionWorkspace: w, dispatchExtension, careerActor, career, social } = useDemo();
  const [visitor, setVisitor] = useState("lea"),
    [consent, setConsent] = useState(false),
    [invited, setInvited] = useState(""),
    [period, setPeriod] = useState("30");
  const [metric, setMetric] = useState("visit");
  const recent = w.visits.filter((v) => v.at >= Date.now() - Number(period) * 86400000),
    requests = career.appointments.filter((a) => a.professional === careerActor.id),
    applications = career.applications.filter((a) =>
      career.offers.some((o) => o.id === a.offerId && o.owner === careerActor.id),
    );
  const titles = {
    invited: "Invité",
    registered: "Inscrit",
    verified: "E-mail vérifié",
    qualified: "Activation qualifiée",
  };
  return (
    <>
      <Card title="Mesurer la visibilité, sans inventer de résultats">
        <p>
          Compteurs de cette session de démonstration, pas de statistiques réelles de la plateforme.
        </p>
        <div className="extension-metrics">
          <div>
            <strong>{w.visits.filter((v) => v.kind === "visit").length}</strong>
            <span>visites simulées</span>
          </div>
          {careerActor.category !== "Sportif" && (
            <div>
              <strong>{requests.length}</strong>
              <span>demandes reçues</span>
            </div>
          )}
          {careerActor.category === "Organisation" && (
            <div>
              <strong>{w.visits.filter((v) => v.kind === "interaction").length}</strong>
              <span>interactions simulées</span>
            </div>
          )}
        </div>
        <details className="extension-simulation">
          <summary>Ajouter une activité fictive pour tester les statistiques</summary>
          <Select
            label="Visiteur fictif"
            value={visitor}
            onChange={setVisitor}
            options={members.map((m) => [m.id, m.name])}
          />
          <Select
            label="Activité"
            value={metric}
            onChange={setMetric}
            options={[
              ["visit", "Visite du profil"],
              ["interaction", "Interaction"],
            ]}
          />
          <CheckChoice checked={consent} onChange={setConsent}>
            Ce visiteur accepte d’afficher son identité
          </CheckChoice>
          <Button
            onClick={() =>
              dispatchExtension({
                type: "visit",
                id: uid(),
                name: name(visitor),
                consent,
                kind: metric as "visit" | "interaction",
              })
            }
          >
            Simuler cette activité
          </Button>
        </details>
      </Card>
      <Premium>
        <Card title="Statistiques détaillées">
          <Select
            label="Période"
            value={period}
            onChange={setPeriod}
            options={[
              ["7", "7 jours"],
              ["30", "30 jours"],
              ["90", "90 jours"],
            ]}
          />
          <div className="extension-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Indicateur</th>
                  <th>Résultat de la démo</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Visites / interactions sur la période</td>
                  <td>
                    {recent.filter((v) => v.kind === "visit").length} /{" "}
                    {recent.filter((v) => v.kind === "interaction").length}
                  </td>
                </tr>
                <tr>
                  <td>Candidatures reçues</td>
                  <td>{applications.length}</td>
                </tr>
                <tr>
                  <td>Rendez-vous confirmés / demandes reçues</td>
                  <td>
                    {requests.filter((a) => a.status === "booked").length} / {requests.length}
                  </td>
                </tr>
                <tr>
                  <td>Confirmations aux essais groupés</td>
                  <td>
                    {w.sessions.reduce(
                      (n, s) => n + s.participants.filter((p) => p.status === "accepted").length,
                      0,
                    )}
                  </td>
                </tr>
                <tr>
                  <td>Publications programmées diffusées</td>
                  <td>{w.schedules.filter((p) => p.status === "published").length}</td>
                </tr>
                <tr>
                  <td>Délai moyen de réponse</td>
                  <td>{requests.filter(a=>a.createdAt&&a.respondedAt).length?Math.round(requests.filter(a=>a.createdAt&&a.respondedAt).reduce((n,a)=>n+(a.respondedAt!-a.createdAt!)/60000,0)/requests.filter(a=>a.createdAt&&a.respondedAt).length)+' min':'Aucune demande traitée dans cette session'}</td>
                </tr>
                <tr>
                  <td>Réactions / commentaires sur mes publications</td>
                  <td>{social.posts.filter(p=>p.author==='self').reduce((n,p)=>n+p.likes,0)} / {social.posts.filter(p=>p.author==='self').reduce((n,p)=>n+p.comments.length,0)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Les indicateurs de recrutement couvrent la session entière ; seul le journal de
            visibilité utilise le filtre de période.
          </p>
          <h3>Journal de visibilité</h3>
          {!recent.length && <p>Aucune activité dans cette période.</p>}
          {recent.map((v) => (
            <p key={v.id}>
              {v.consent ? v.name : "Visiteur anonyme"} ·{" "}
              {v.kind === "visit" ? "visite" : "interaction"} · {when(new Date(v.at).toISOString())}
            </p>
          ))}
          <p>Le nom d’un visiteur n’est montré qu’avec son accord, même en Premium.</p>
        </Card>
      </Premium>
      <Card title="Invitations et activation du réseau">
        <p>
          Testez le parcours d’un invité : invitation → inscription → e-mail vérifié → activation
          qualifiée. Aucun e-mail n’est envoyé ; aucune récompense réelle n’est créditée.
        </p>
        <form
          className="extension-form"
          onSubmit={(e) => {
            e.preventDefault();
            dispatchExtension({ type: "invitation", id: uid(), name: invited });
          }}
        >
          <Field
            id="invited-name"
            label="Nom du contact fictif"
            required
            value={invited}
            onChange={(e) => setInvited(e.target.value)}
          />
          <Submit>Créer une invitation de démonstration</Submit>
        </form>
        {careerActor.category === "Organisation" && !careerActor.premium ? (
          <p>Le suivi détaillé des activations est inclus dans Premium.</p>
        ) : (
          <>
            {w.invitations.map((i) => (
              <article className="extension-item" key={i.id}>
                <strong>{i.name}</strong>
                <p>{titles[i.status]}</p>
                <Button
                  variant="outline"
                  disabled={i.status === "qualified"}
                  onClick={() => dispatchExtension({ type: "invitation-progress", id: i.id })}
                >
                  Simuler l’étape suivante
                </Button>
              </article>
            ))}
            <p>
              {w.invitations.filter((i) => i.status === "qualified").length} activation(s)
              qualifiée(s) simulée(s) ·{" "}
              {w.invitations.filter((i) => i.status === "qualified").length * 3} mois de récompense
              potentielle.
            </p>
          </>
        )}
        <Link href="/parrainage">Voir les règles du parrainage</Link>
      </Card>
    </>
  );
}
export function ExtensionNotices() {
  const { extensionWorkspace: w, dispatchExtension } = useDemo();
  return (
    <section className="extension-card">
      <h2>
        <Bell size={18} /> Notifications de vos outils
      </h2>
      {!w.notices.length && <p>Aucune nouvelle notification.</p>}
      {w.notices.map((n) => (
        <div className="extension-item" key={n.id}>
          <Link href={n.href}>{n.text}</Link>
          <small>{n.read ? "Lue" : "Non lue"}</small>
          {!n.read && (
            <Button variant="ghost" onClick={() => dispatchExtension({ type: "read", id: n.id })}>
              Marquer comme lue
            </Button>
          )}
        </div>
      ))}
    </section>
  );
}
