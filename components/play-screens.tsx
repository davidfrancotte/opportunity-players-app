"use client";
import { CareerAgenda, CareerNotices } from "./career-screens";
import { T } from "./locale";
import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowUpRight,
  CalendarDays,
  Check,
  MapPin,
  Plus,
  UsersRound,
  LockKeyhole,
  Bell,
  X,
} from "lucide-react";
import { Button } from "./ui/button";
import { NativeSelect, NativeSelectOption } from "./ui/native-select";
import { Field } from "./studio-ui";
import { ProfileLayout, Modal } from "./profile-screens";
import { NetworkSections } from "./event-navigation";
import { useDemo } from "./demo-provider";
import { sports, displayName } from "@/lib/model";
import { members, isPremium } from "@/lib/social";
import { monthlyPrice } from "@/lib/pricing";
import {
  cities,
  suggestedTotals,
  countPlayers,
  canViewMatch,
  profileCity,
  personalMatch,
  distanceKm,
  type Match,
  type Slot,
} from "@/lib/events";

function useEventContext() {
  const { profile, social } = useDemo();
  return {
    premium: isPremium(social, profile.category),
    city: profileCity(profile.city),
    now: Date.now(),
  };
}
function dateLabel(value: string) {
  return new Intl.DateTimeFormat("fr-BE", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Brussels",
  }).format(new Date(value));
}
function MemberName({ id }: { id: string }) {
  const { profile } = useDemo();
  return (
    <>
      {id === "me" ? displayName(profile) : members.find((m) => m.id === id)?.name || "Membre démo"}
    </>
  );
}
function EventError() {
  const { events } = useDemo();
  return events.error ? (
    <p className="event-error" role="alert">
      {events.error}
    </p>
  ) : null;
}
function PremiumCard({ creation = false }: { creation?: boolean }) {
  const { profile } = useDemo();
  return (
    <section className="event-premium">
      <LockKeyhole size={26} />
      <span className="mini-kicker">JOUEZ PLUS LOIN / PREMIUM</span>
      <h2>{creation ? "Rassemblez votre équipe." : "Votre prochain match est tout près."}</h2>
      <p>
        {creation
          ? "Organiser un match, proposer plusieurs créneaux et inviter vos contacts est réservé aux membres payants."
          : "Avec Premium, découvrez les invitations ouvertes dans les 50 km de votre ville et proposez de rejoindre un match."}
      </p>
      <strong>
        {monthlyPrice(profile.category)} <small>/ mois</small>
      </strong>
      <Link
        className="action primary"
        href={`/abonnement?retour=${creation ? "/organiser" : "/jouer"}`}
      >
        Découvrir Premium <ArrowUpRight size={18} />
      </Link>
      <small>
        Les invitations reçues personnellement restent accessibles gratuitement. Aucun paiement dans
        la démo.
      </small>
    </section>
  );
}
function MatchCard({ match: m }: { match: Match }) {
  const { city } = useEventContext();
  const first = m.slots.find((s) => s.id === m.confirmed) || m.slots[0];
  return (
    <Link href={`/match?id=${m.id}`} className="match-card">
      <div className="match-card-top">
        <span>{m.sport}</span>
        <small>
          {m.cancelled
            ? "Annulé"
            : m.confirmed
              ? "Confirmé"
              : m.host === "me"
                ? "J’organise"
                : m.invitees.includes("me")
                  ? "Invitation privée"
                  : "Ouvert · accord requis"}
        </small>
      </div>
      <h2>{m.title}</h2>
      <p>
        <MapPin size={15} />
        {m.city}
        {!personalMatch(m) && Number.isFinite(distanceKm(city, m.city))
          ? ` · ≈ ${Math.round(distanceKm(city, m.city))} km`
          : ""}
      </p>
      <p>
        <CalendarDays size={15} />
        {dateLabel(first.start)}
        {!m.confirmed && m.slots.length > 1 ? ` + ${m.slots.length - 1} autre(s)` : ""}
      </p>
      <div className="match-card-bottom">
        <span>
          <UsersRound size={16} />
          {countPlayers(m, first.id)} / {m.minimum} min. · {m.capacity} places
        </span>
        <ArrowUpRight size={19} />
      </div>
    </Link>
  );
}
export function PlayPage() {
  const { events } = useDemo(),
    ctx = useEventContext();
  const [tab, setTab] = useState("invitations"),
    [sport, setSport] = useState("Tous");
  const list = events.matches.filter(
    (m) =>
      canViewMatch(m, ctx) &&
      (sport === "Tous" || m.sport === sport) &&
      (tab === "organise"
        ? m.host === "me"
        : tab === "invitations"
          ? m.host !== "me" && personalMatch(m)
          : m.open &&
            m.host !== "me" &&
            !m.cancelled &&
            !m.confirmed &&
            ctx.premium &&
            distanceKm(ctx.city, m.city) <= 50),
  );
  return (
    <ProfileLayout>
      <div className="event-title">
        <span className="mini-kicker">VOTRE RÉSEAU, SUR LE TERRAIN</span>
        <h1>
          <T>{"Jouer ensemble"}</T>
          <span>.</span>
        </h1>
        <p>Moins de messages pour s’organiser. Plus de moments à partager.</p>
      </div>
      <NetworkSections active="play" />
      <Link className="action primary" href="/organiser">
        <Plus size={18} />
        <T>{"Organiser un match"}</T>
        {!ctx.premium && <LockKeyhole size={15} />}
      </Link>
      <div className="event-tabs" role="group" aria-label="Filtrer les matchs">
        {[
          ["invitations", "Mes invitations"],
          ["organise", "J’organise"],
          ["nearby", "À proximité"],
        ].map(([v, l]) => (
          <Button key={v} variant="ghost" aria-pressed={tab === v} onClick={() => setTab(v)}>
            {l}
            {v === "nearby" && !ctx.premium && <LockKeyhole size={12} />}
          </Button>
        ))}
      </div>
      {tab === "nearby" && !ctx.premium ? (
        <PremiumCard />
      ) : (
        <>
          <label className="event-select-label">
            <T>{"Sport"}</T>
            <NativeSelect
              aria-label="Sport"
              value={sport}
              onChange={(e) => setSport(e.target.value)}
            >
              <NativeSelectOption value="Tous">
                <T>{"Tous"}</T>
              </NativeSelectOption>
              {sports.map((s) => (
                <NativeSelectOption key={s}>{s}</NativeSelectOption>
              ))}
            </NativeSelect>
          </label>
          {tab === "nearby" && (
            <p className="event-note">
              {ctx.city
                ? `À 50 km de ${ctx.city}. Distances approximatives entre villes de démonstration.`
                : "Indiquez une ville prise en charge dans votre profil pour découvrir les matchs : Liège, Bruxelles, Namur, Charleroi, Louvain, Huy ou Verviers."}
            </p>
          )}
          <div className="match-list">
            {list.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
          {!list.length && (
            <div className="event-empty">
              <CalendarDays size={30} />
              <h2>
                {tab === "organise"
                  ? "Votre prochain match commence ici."
                  : "Pas encore de match ici."}
              </h2>
              <p>
                {tab === "organise"
                  ? "Invitez vos contacts et trouvez un créneau commun."
                  : "Essayez une autre discipline ou consultez vos invitations."}
              </p>
            </div>
          )}
        </>
      )}
      <p className="event-note">
        Des rencontres fictives pour tester le parcours. Aucune invitation réelle n’est envoyée.
      </p>
    </ProfileLayout>
  );
}

type DraftSlot = { id: string; date: string; time: string; minutes: number };
function blankSlot(): DraftSlot {
  return { id: crypto.randomUUID(), date: "", time: "18:00", minutes: 90 };
}
export function CreateMatchPage() {
  const { profile, events, dispatchEvent } = useDemo(),
    ctx = useEventContext(),
    router = useRouter();
  const [step, setStep] = useState(1),
    [title, setTitle] = useState(""),
    [sport, setSport] = useState(profile.sport || "Padel"),
    [city, setCity] = useState(ctx.city || "Liège"),
    [venue, setVenue] = useState("");
  const [minimum, setMinimum] = useState(suggestedTotals[profile.sport] || 2),
    [capacity, setCapacity] = useState(Math.max(4, suggestedTotals[profile.sport] || 2)),
    [hostPlays, setHostPlays] = useState(true),
    [open, setOpen] = useState(false),
    [plusOne, setPlusOne] = useState(true),
    [invitees, setInvitees] = useState<string[]>([]),
    [slots, setSlots] = useState<DraftSlot[]>([]),
    [error, setError] = useState(""),
    [submitted, setSubmitted] = useState("");
  useEffect(() => {
    setSlots([blankSlot()]);
    const q = new URLSearchParams(window.location.search),
      id = q.get("invite");
    if (id && members.some((m) => m.id === id)) setInvitees([id]);
    const original = events.matches.find((m) => m.id === q.get("copie") && m.host === "me");
    if (original) {
      setTitle(original.title);
      setSport(original.sport);
      setCity(original.city);
      setVenue(original.venue);
      setMinimum(original.minimum);
      setCapacity(original.capacity);
      setHostPlays(original.hostPlays);
      setOpen(original.open);
      setPlusOne(original.plusOne);
      setInvitees(original.invitees);
    }
  }, []); // Copy details only, never the old dates or votes.
  useEffect(() => {
    if (submitted && events.lastCreated === submitted) router.push(`/match?id=${submitted}`);
  }, [submitted, events.lastCreated, router]);
  function next(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (step === 2) {
      const dates = slots.map((s) => new Date(`${s.date}T${s.time}`).getTime());
      if (
        dates.some((d) => !Number.isFinite(d) || d <= Date.now()) ||
        new Set(dates).size !== dates.length
      ) {
        setError("Choisissez des créneaux futurs et différents.");
        return;
      }
    }
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    const id = crypto.randomUUID();
    setSubmitted(id);
    dispatchEvent({
      type: "create",
      match: {
        id,
        title,
        sport,
        city,
        venue,
        host: "me",
        hostPlays,
        minimum,
        capacity,
        open,
        plusOne,
        invitees,
        slots: slots.map((s) => ({
          id: s.id,
          start: new Date(`${s.date}T${s.time}`).toISOString(),
          minutes: s.minutes,
        })),
        replies: [],
      },
    });
  }
  return (
    <ProfileLayout back="/jouer">
      <div className="event-title">
        <span className="mini-kicker">LANCEZ LE MOUVEMENT</span>
        <h1>
          On organise<span> ?</span>
        </h1>
      </div>
      {!ctx.premium ? (
        <PremiumCard creation />
      ) : (
        <>
          <ol className="event-steps">
            {["Le match", "Les créneaux", "Les invités"].map((s, i) => (
              <li key={s} aria-current={step === i + 1 ? "step" : undefined}>
                <span>{i + 1}</span>
                {s}
              </li>
            ))}
          </ol>
          <form className="event-form" onSubmit={next}>
            {step === 1 && (
              <>
                <Field
                  label="Nom du match"
                  name="match-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  maxLength={90}
                  placeholder="Un padel après le boulot ?"
                />
                <label>
                  <T>{"Sport"}</T>
                  <NativeSelect
                    aria-label="Sport du match"
                    value={sport}
                    onChange={(e) => {
                      setSport(e.target.value);
                      const n = suggestedTotals[e.target.value] || 2;
                      setMinimum(n);
                      setCapacity(Math.max(n, 4));
                    }}
                  >
                    {sports.map((s) => (
                      <NativeSelectOption key={s}>{s}</NativeSelectOption>
                    ))}
                  </NativeSelect>
                </label>
                <label>
                  Ville du match
                  <NativeSelect
                    aria-label="Ville du match"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  >
                    {Object.keys(cities).map((c) => (
                      <NativeSelectOption key={c}>{c}</NativeSelectOption>
                    ))}
                  </NativeSelect>
                </label>
                <Field
                  label="Lieu / adresse"
                  name="venue"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  required
                  maxLength={150}
                  placeholder="Club, terrain, adresse…"
                  hint="Utilisez un lieu fictif dans cette démo. L’adresse n’est visible qu’aux invités ou candidats acceptés."
                />
                <div className="event-fields">
                  <Field
                    label="Minimum total"
                    name="minimum"
                    type="number"
                    min={1}
                    max={100}
                    value={minimum}
                    onChange={(e) => {
                      const n = Number(e.target.value);
                      setMinimum(n);
                      if (n > capacity) setCapacity(n);
                    }}
                    required
                  />
                  <Field
                    label="Maximum total"
                    name="capacity"
                    type="number"
                    min={minimum}
                    max={100}
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    required
                  />
                </div>
                <p className="event-note">
                  Suggestion {sport} : {suggestedTotals[sport]} participant(s) au total, modifiable
                  selon votre format. Ce n’est pas une règle officielle. Organisateur et +1 inclus.
                </p>
                <label className="event-check">
                  <input
                    type="checkbox"
                    checked={hostPlays}
                    onChange={(e) => setHostPlays(e.target.checked)}
                  />
                  Je participe moi aussi (+1 dans le total)
                </label>
              </>
            )}
            {step === 2 && (
              <>
                <h2>Proposez le choix.</h2>
                <p className="event-note">
                  Plusieurs propositions pour un seul match. Les invités pourront en sélectionner
                  plusieurs ; vous confirmerez un seul créneau. Saisie dans le fuseau de votre
                  appareil ; affichage en heure de Bruxelles.
                </p>
                {slots.map((s, i) => (
                  <fieldset key={s.id} className="slot-form">
                    <legend>Option {i + 1}</legend>
                    <Field
                      label="Date"
                      id={`date-${s.id}`}
                      type="date"
                      value={s.date}
                      required
                      onChange={(e) =>
                        setSlots(
                          slots.map((t) => (t.id === s.id ? { ...t, date: e.target.value } : t)),
                        )
                      }
                    />
                    <div className="event-fields">
                      <Field
                        label="Heure"
                        id={`time-${s.id}`}
                        type="time"
                        value={s.time}
                        required
                        onChange={(e) =>
                          setSlots(
                            slots.map((t) => (t.id === s.id ? { ...t, time: e.target.value } : t)),
                          )
                        }
                      />
                      <Field
                        label="Durée (min)"
                        id={`duration-${s.id}`}
                        type="number"
                        min={15}
                        max={720}
                        value={s.minutes}
                        required
                        onChange={(e) =>
                          setSlots(
                            slots.map((t) =>
                              t.id === s.id ? { ...t, minutes: Number(e.target.value) } : t,
                            ),
                          )
                        }
                      />
                    </div>
                    {slots.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setSlots(slots.filter((t) => t.id !== s.id))}
                      >
                        Retirer cette option
                      </Button>
                    )}
                  </fieldset>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  disabled={slots.length >= 6}
                  onClick={() => setSlots([...slots, blankSlot()])}
                >
                  <Plus size={17} />
                  Ajouter un créneau
                </Button>
              </>
            )}
            {step === 3 && (
              <>
                <h2>Qui rejoint le terrain ?</h2>
                <p className="event-note">
                  Contacts fictifs. Une invitation personnelle peut recevoir une réponse même sans
                  abonnement.
                </p>
                <div className="invite-list">
                  {members.map((m) => (
                    <label className="event-check" key={m.id}>
                      <input
                        type="checkbox"
                        checked={invitees.includes(m.id)}
                        onChange={(e) =>
                          setInvitees(
                            e.target.checked
                              ? [...invitees, m.id]
                              : invitees.filter((id) => id !== m.id),
                          )
                        }
                      />
                      <img src={m.image} alt="" />
                      <span>
                        {m.name}
                        <small>
                          {m.sport} · {m.city}
                        </small>
                      </span>
                    </label>
                  ))}
                </div>
                <label className="event-check">
                  <input
                    type="checkbox"
                    checked={plusOne}
                    onChange={(e) => setPlusOne(e.target.checked)}
                  />
                  Autoriser un ami non inscrit (+1 par participant)
                </label>
                <label className="event-check">
                  <input
                    type="checkbox"
                    checked={open}
                    onChange={(e) => setOpen(e.target.checked)}
                  />
                  Ouvrir aux membres Premium dans les 50 km
                </label>
                <p className="event-note">
                  Les candidatures externes nécessitent votre accord. Un +1 est lié à son
                  accompagnant et ne reçoit pas de notification personnelle.
                </p>
                <div className="event-summary">
                  <strong>{title}</strong>
                  <p>
                    {sport} · {city} · {minimum} à {capacity} participants au total
                  </p>
                  <p>
                    {slots.length} créneau(x) proposé(s) · {invitees.length} invité(s)
                  </p>
                </div>
              </>
            )}
            {error && (
              <p className="event-error" role="alert">
                {error}
              </p>
            )}
            <EventError />
            <div className="event-form-actions">
              {step > 1 && (
                <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
                  <T>{"Retour"}</T>
                </Button>
              )}
              <Button type="submit" className="action primary">
                {step === 3 ? "Créer et inviter" : "Continuer"}
                <ArrowUpRight size={17} />
              </Button>
            </div>
          </form>
        </>
      )}
    </ProfileLayout>
  );
}

export function MatchPage() {
  const { events } = useDemo(),
    ctx = useEventContext();
  const id = useSearchParams().get("id") || "";
  const m = events.matches.find((m) => m.id === id);
  return (
    <ProfileLayout back="/jouer">
      {m && canViewMatch(m, ctx) ? (
        <MatchDetail key={m.id} match={m} />
      ) : (
        <div className="event-empty">
          <LockKeyhole size={30} />
          <h1>Match indisponible.</h1>
          <p>
            Il peut être privé, hors de votre rayon ou réservé à Premium. Les matchs créés dans la
            démo disparaissent au rechargement.
          </p>
          <Link className="action primary" href="/jouer">
            Revenir à Jouer
          </Link>
        </div>
      )}
    </ProfileLayout>
  );
}
function MatchDetail({ match: m }: { match: Match }) {
  const { events, dispatchEvent, notify } = useDemo(),
    ctx = useEventContext();
  const host = m.host === "me",
    reply = m.replies.find((r) => r.user === "me");
  const [selected, setSelected] = useState(reply?.slots || []),
    [guests, setGuests] = useState(reply?.guests || []),
    [confirmSlot, setConfirmSlot] = useState<Slot | null>(null),
    [cancel, setCancel] = useState(false),
    [simUser, setSimUser] = useState(m.invitees[0] || "lea"),
    [simSlot, setSimSlot] = useState(m.slots[0].id),
    [simGuest, setSimGuest] = useState(false),
    [saved, setSaved] = useState(false);
  const exact = host || m.invitees.includes("me") || reply?.status === "approved";
  function save() {
    setSaved(true);
    dispatchEvent({
      type: "reply",
      id: m.id,
      slots: selected,
      guests: guests.filter((id) => selected.includes(id)),
    });
  }
  return (
    <div className="match-detail">
      <div className="event-title">
        <span className="mini-kicker">
          {m.sport.toUpperCase()} /{" "}
          {m.cancelled ? "ANNULÉ" : m.confirmed ? "CONFIRMÉ" : "À ORGANISER"}
        </span>
        <h1>{m.title}</h1>
        <p>
          Organisé par <MemberName id={m.host} />
        </p>
      </div>
      <div className="event-summary">
        <p>
          <MapPin size={17} />
          {m.city}
        </p>
        <strong>{exact ? m.venue : "Adresse communiquée après acceptation"}</strong>
        <p>
          <UsersRound size={17} />
          {m.minimum} minimum · {m.capacity} maximum, au total
        </p>
        <small>
          {m.hostPlays ? "Organisateur inclus" : "Organisateur non participant"} ·{" "}
          {m.plusOne ? "+1 autorisé" : "Sans accompagnant"}
        </small>
      </div>
      {!host && !m.cancelled && !m.confirmed && (
        <p className="event-note">
          Cochez toutes vos disponibilités.{" "}
          {m.invitees.includes("me")
            ? "Votre réponse ne consomme aucun message."
            : "Votre candidature ne sera comptée qu’après accord de l’organisateur."}{" "}
          Vous pouvez ajouter un ami différent selon le créneau.
        </p>
      )}
      <div className="match-slots">
        {m.slots
          .filter((s) => !m.confirmed || s.id === m.confirmed)
          .map((slot, i) => {
            const total = countPlayers(m, slot.id),
              ready = total >= m.minimum;
            return (
              <article className="match-slot" key={slot.id}>
                <div className="slot-heading">
                  <span>0{i + 1}</span>
                  <div>
                    <h2>{dateLabel(slot.start)}</h2>
                    <small>{slot.minutes} min · heure de Bruxelles</small>
                  </div>
                  {m.confirmed && <Check size={21} />}
                </div>
                <div className="slot-meter">
                  <span
                    style={{
                      width: `${Math.min(100, (total / m.minimum) * 100)}%`,
                    }}
                  />
                </div>
                <p className="slot-count">
                  {total} / {m.minimum} participants requis{" "}
                  <small>{m.capacity - total} place(s) libre(s)</small>
                </p>
                {host && !m.confirmed && !m.cancelled && (
                  <Button
                    className="action secondary"
                    disabled={!ready || Date.parse(slot.start) <= Date.now()}
                    onClick={() => setConfirmSlot(slot)}
                  >
                    {ready ? "Confirmer ce créneau" : "En attente de participants"}
                  </Button>
                )}
                {!host && !m.confirmed && !m.cancelled && (
                  <>
                    <label className="event-check">
                      <input
                        type="checkbox"
                        checked={selected.includes(slot.id)}
                        onChange={(e) => {
                          setSaved(false);
                          setSelected(
                            e.target.checked
                              ? [...selected, slot.id]
                              : selected.filter((id) => id !== slot.id),
                          );
                          if (!e.target.checked) setGuests(guests.filter((id) => id !== slot.id));
                        }}
                      />
                      Je suis disponible
                    </label>
                    {selected.includes(slot.id) && m.plusOne && (
                      <label className="event-check guest-check">
                        <input
                          type="checkbox"
                          checked={guests.includes(slot.id)}
                          onChange={(e) => {
                            setSaved(false);
                            setGuests(
                              e.target.checked
                                ? [...guests, slot.id]
                                : guests.filter((id) => id !== slot.id),
                            );
                          }}
                        />
                        Je viens avec un ami (+1)
                      </label>
                    )}
                  </>
                )}
              </article>
            );
          })}
      </div>
      {m.confirmed && (
        <p className="event-note">
          Le créneau est fixé ; les autres propositions sont closes.{" "}
          {host
            ? "Les participants ont été notifiés dans la simulation."
            : reply?.status === "approved" && reply.slots.includes(m.confirmed)
              ? "Votre présence est confirmée. Pensez à prévenir votre +1."
              : "Vous n’êtes pas inscrit sur ce créneau."}
        </p>
      )}
      {!host && !m.cancelled && !m.confirmed && (
        <>
          <Button className="action primary" onClick={save}>
            {reply
              ? "Mettre à jour ma réponse"
              : m.invitees.includes("me")
                ? "Envoyer mes disponibilités"
                : "Proposer de rejoindre"}
          </Button>
          {saved && !events.error && (
            <p className="event-success" role="status">
              {reply?.status === "pending"
                ? "Candidature envoyée, en attente de l’organisateur."
                : selected.length
                  ? "Disponibilités enregistrées dans la démo."
                  : "Votre réponse a été retirée."}
            </p>
          )}
        </>
      )}
      {!host && !m.cancelled && m.confirmed && reply?.slots.length ? (
        <Button
          variant="outline"
          onClick={() => {
            dispatchEvent({ type: "reply", id: m.id, slots: [], guests: [] });
            notify("Désistement enregistré dans la démo.");
          }}
        >
          Me désister (avec mon +1)
        </Button>
      ) : null}
      <EventError />
      {host && (
        <>
          <section className="event-section">
            <h2>Les réponses</h2>
            {!m.replies.length && (
              <p className="event-note">Vos invités n’ont pas encore répondu.</p>
            )}
            {m.replies.map((r) => (
              <article className="reply-row" key={r.user}>
                <strong>
                  <MemberName id={r.user} />
                </strong>
                <small>
                  {r.status === "pending"
                    ? "Candidature à approuver"
                    : r.status === "declined"
                      ? "Refusée"
                      : "Accepté / invité"}{" "}
                  · {r.slots.length} créneau(x)
                  {r.guests.length ? " · avec +1" : ""}
                </small>
                <small>
                  {r.slots
                    .map((id) => dateLabel(m.slots.find((s) => s.id === id)!.start))
                    .join(" / ")}
                </small>
                {r.status === "pending" && !m.confirmed && !m.cancelled && (
                  <div>
                    <Button
                      onClick={() =>
                        dispatchEvent({
                          type: "approve",
                          id: m.id,
                          user: r.user,
                        })
                      }
                    >
                      Accepter
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() =>
                        dispatchEvent({
                          type: "decline",
                          id: m.id,
                          user: r.user,
                        })
                      }
                    >
                      Refuser
                    </Button>
                  </div>
                )}
              </article>
            ))}
          </section>
          {ctx.premium && !m.cancelled && !m.confirmed && (
            <details className="event-demo">
              <summary>Tester les réponses · simulation</summary>
              <p>
                Simulez un invité ou une candidature externe. Aucun autre utilisateur n’est
                connecté.
              </p>
              <label>
                Membre
                <NativeSelect
                  aria-label="Membre"
                  value={simUser}
                  onChange={(e) => setSimUser(e.target.value)}
                >
                  {members
                    .filter((p) => m.open || m.invitees.includes(p.id))
                    .map((p) => (
                      <NativeSelectOption key={p.id} value={p.id}>
                        {p.name}
                        {m.invitees.includes(p.id) ? " · invité" : " · candidature"}
                      </NativeSelectOption>
                    ))}
                </NativeSelect>
              </label>
              <label>
                Créneau
                <NativeSelect
                  aria-label="Créneau"
                  value={simSlot}
                  onChange={(e) => setSimSlot(e.target.value)}
                >
                  {m.slots.map((s) => (
                    <NativeSelectOption key={s.id} value={s.id}>
                      {dateLabel(s.start)}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </label>
              {m.plusOne && (
                <label className="event-check">
                  <input
                    type="checkbox"
                    checked={simGuest}
                    onChange={(e) => setSimGuest(e.target.checked)}
                  />
                  Avec un ami (+1)
                </label>
              )}
              <Button
                variant="outline"
                onClick={() =>
                  dispatchEvent({
                    type: "simulate",
                    id: m.id,
                    user: simUser,
                    slot: simSlot,
                    guest: simGuest,
                  })
                }
              >
                Simuler la disponibilité
              </Button>
            </details>
          )}
          <Link href={`/organiser?copie=${m.id}`} className="action secondary">
            Créer un autre match similaire <Plus size={17} />
          </Link>
          {!m.cancelled && (
            <Button className="event-cancel" variant="ghost" onClick={() => setCancel(true)}>
              Annuler ce match
            </Button>
          )}
        </>
      )}
      <Modal
        open={!!confirmSlot}
        onOpenChange={(v) => {
          if (!v) setConfirmSlot(null);
        }}
        title="On bloque ce créneau ?"
        description="Cette action confirme un seul créneau, ferme les autres propositions et génère les notifications dans la démo."
      >
        <p>
          {confirmSlot && dateLabel(confirmSlot.start)} ·{" "}
          {confirmSlot && countPlayers(m, confirmSlot.id)} participants au total.
        </p>
        <Button
          className="action primary"
          onClick={() => {
            if (confirmSlot)
              dispatchEvent({
                type: "confirm",
                id: m.id,
                slot: confirmSlot.id,
              });
            setConfirmSlot(null);
          }}
        >
          Confirmer et notifier
        </Button>
      </Modal>
      <Modal
        open={cancel}
        onOpenChange={setCancel}
        title="Annuler le match ?"
        description="Tous les invités recevront une notification d’annulation dans la simulation."
      >
        <Button
          className="action primary"
          onClick={() => {
            dispatchEvent({ type: "cancel", id: m.id });
            setCancel(false);
          }}
        >
          Confirmer l’annulation
        </Button>
      </Modal>
    </div>
  );
}

export function AgendaPage() {
  const { events } = useDemo();
  const [pending, setPending] = useState(false);
  const entries = events.matches
    .filter(
      (m) =>
        personalMatch(m) &&
        !m.cancelled &&
        (pending
          ? !m.confirmed
          : !!m.confirmed &&
            (m.host === "me" ||
              m.replies.some(
                (r) => r.user === "me" && r.status === "approved" && r.slots.includes(m.confirmed!),
              ))),
    )
    .flatMap((m) =>
      m.slots
        .filter((s) => (pending || s.id === m.confirmed) && Date.parse(s.start) > Date.now())
        .map((slot) => ({ m, slot })),
    )
    .sort((a, b) => Date.parse(a.slot.start) - Date.parse(b.slot.start));
  return (
    <ProfileLayout>
      <div className="event-title">
        <span className="mini-kicker">VOTRE TEMPS DE JEU</span>
        <h1>
          <T>{"Mon agenda"}</T>
          <span>.</span>
        </h1>
        <p>Vos matchs, sans perdre le fil.</p>
      </div>
      <div className="event-tabs">
        <Button variant="ghost" aria-pressed={!pending} onClick={() => setPending(false)}>
          Confirmés
        </Button>
        <Button variant="ghost" aria-pressed={pending} onClick={() => setPending(true)}>
          À organiser
        </Button>
      </div>
      {entries.map(({ m, slot }) => (
        <Link className="agenda-item" key={m.id + slot.id} href={`/match?id=${m.id}`}>
          <span className="agenda-date">
            {new Intl.DateTimeFormat("fr", {
              day: "2-digit",
              timeZone: "Europe/Brussels",
            }).format(new Date(slot.start))}
            <small>
              {new Intl.DateTimeFormat("fr", {
                month: "short",
                timeZone: "Europe/Brussels",
              }).format(new Date(slot.start))}
            </small>
          </span>
          <span>
            <small>
              {pending ? "PROPOSITION" : "CONFIRMÉ"} · {m.sport}
            </small>
            <strong>{m.title}</strong>
            <p>
              {dateLabel(slot.start)} · {m.city}
            </p>
          </span>
          <ArrowUpRight size={18} />
        </Link>
      ))}
      {!entries.length && (
        <div className="event-empty">
          <CalendarDays size={32} />
          <h2>Le terrain vous attend.</h2>
          <p>
            {pending ? "Aucune proposition à venir." : "Les créneaux confirmés apparaîtront ici."}
          </p>
          <Link href="/jouer" className="action secondary">
            Découvrir mes matchs
          </Link>
        </div>
      )}
      <p className="event-note">
        Agenda de démonstration · heure de Bruxelles. Pas de synchronisation avec un calendrier
        externe.
      </p>
      <CareerAgenda />
    </ProfileLayout>
  );
}
export function NotificationsPage() {
  const { events, dispatchEvent, dispatchSocial, requestAccess } = useDemo();
  const [unreadOnly, setUnreadOnly] = useState(false);
  const list = events.notices.filter((n) => n.recipient === "me" && (!unreadOnly || !n.read));
  return (
    <ProfileLayout>
      <div className="event-title">
        <span className="mini-kicker">NE MANQUEZ PAS LE RENDEZ-VOUS</span>
        <h1>
          <T>{"Notifications"}</T>
          <span>.</span>
        </h1>
      </div>
      <div className="notification-controls">
        <Button
          variant="ghost"
          aria-pressed={unreadOnly}
          onClick={() => setUnreadOnly(!unreadOnly)}
        >
          Non lues uniquement
        </Button>
        <Button variant="ghost" onClick={() => dispatchEvent({ type: "read" })}>
          Tout marquer lu
        </Button>
      </div>
      <div className="notification-list">
        <CareerNotices unreadOnly={unreadOnly} />
        {list.map((n) => (
          <Link
            key={n.id}
            href={n.href}
            className={`notification-item ${n.read ? "" : "unread"}`}
            onClick={() => dispatchEvent({ type: "read", id: n.id })}
          >
            <span className="notification-symbol">
              {n.kind === "confirmed" ? (
                <Check size={20} />
              ) : n.kind === "invitation" ? (
                <CalendarDays size={20} />
              ) : (
                <Bell size={20} />
              )}
            </span>
            <span>
              <small>
                {
                  {
                    invitation: "INVITATION",
                    application: "CANDIDATURE",
                    ready: "PRÊT À CONFIRMER",
                    confirmed: "MATCH CONFIRMÉ",
                    change: "MISE À JOUR",
                    reminder: "RAPPEL",
                    message: "MESSAGE",
                  }[n.kind]
                }
              </small>
              <strong>{n.text}</strong>
            </span>
            {!n.read && <i aria-label="Non lue" />}
          </Link>
        ))}
      </div>
      {!list.length && <p className="event-empty">Vous êtes à jour.</p>}
      <details className="event-demo">
        <summary>Préférences et test de la démo</summary>
        <label className="event-check">
          <input
            type="checkbox"
            checked={events.banners}
            onChange={(e) =>
              dispatchEvent({
                type: "settings",
                banners: e.target.checked,
                reminders: events.reminders,
              })
            }
          />
          Bannières dans l’application
        </label>
        <label className="event-check">
          <input
            type="checkbox"
            checked={events.reminders}
            onChange={(e) =>
              dispatchEvent({
                type: "settings",
                reminders: e.target.checked,
                banners: events.banners,
              })
            }
          />
          Rappels à moins de 24 h et 2 h
        </label>
        <p>
          Les rappels sont calculés uniquement lorsque cette démo est ouverte. Les notifications
          push et e-mails nécessiteront le service serveur de la vraie application.
        </p>
        <Button variant="outline" onClick={() => dispatchEvent({ type: "demo-invite" })}>
          Simuler une invitation reçue
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            if (!requestAccess("receive")) return;
            dispatchSocial({ type: "open-chat", id: "noah" });
            dispatchSocial({
              type: "message",
              id: "noah",
              message: {
                id: crypto.randomUUID(),
                text: "Bonjour ! Prêt pour notre prochain match ? (simulation)",
                mine: false,
              },
            });
          }}
        >
          Simuler un message reçu
        </Button>
      </details>
    </ProfileLayout>
  );
}
