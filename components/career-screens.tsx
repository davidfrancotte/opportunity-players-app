"use client";
import {limits} from '@/lib/entitlements';
import { useId, useState, useEffect, type ReactNode, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  Check,
  BriefcaseBusiness,
  SlidersHorizontal,
  UsersRound,
  X,
  LockKeyhole,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { sports } from "@/lib/model";
import {
  appointmentPurposes,
  availableSlots,
  recommendations,
  type Application,
  type Offer,
  type Slot,
} from "@/lib/career";
import type { Member } from "@/lib/social";
import { useDemo } from "./demo-provider";
import { useLocale } from "./locale";
import { ProfileLayout, Modal } from "./profile-screens";
import { Field, Submit } from "./studio-ui";

const uid = () => crypto.randomUUID();
function useCopy() {
  const { locale } = useLocale();
  return (fr: string, en: string) => (locale === "fr" ? fr : en);
}
function dateText(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-BE" : "en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
function Select({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (s: string) => void;
  children: ReactNode;
}) {
  const id = useId();
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return (
    <Field id={id} label={label}>
      <NativeSelect
        id={id}
        disabled={!ready}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {children}
      </NativeSelect>
    </Field>
  );
}
function Option({ children, value }: { children: ReactNode; value: string }) {
  return <NativeSelectOption value={value}>{children}</NativeSelectOption>;
}
function Status({ value }: { value: string }) {
  const c = useCopy();
  const labels: Record<string, [string, string]> = {
    submitted: ["Candidature envoyée", "Application submitted"],
    shortlisted: ["Présélection", "Shortlisted"],
    declined: ["Décliné", "Declined"],
    invited: ["Invitation à un essai", "Trial invitation"],
    confirmed: ["Essai confirmé", "Trial confirmed"],
    withdrawn: ["Candidature retirée", "Withdrawn"],
    pending: ["En attente de réponse", "Awaiting response"],
    accepted: ["Accepté · choisir un créneau", "Accepted · choose a time"],
    booked: ["Rendez-vous confirmé", "Appointment confirmed"],
    cancelled: ["Annulé", "Cancelled"],
  };
  return (
    <span className={"career-status status-" + value}>
      {labels[value] ? c(...labels[value]) : value}
    </span>
  );
}
export function CareerFeedback() {
  const { career, dispatchCareer } = useDemo();
  const c = useCopy();
  const messages: Record<string, [string, string]> = {
    quota:['Cette action dépasse le quota de votre offre. Consultez les formules pour connaître vos accès.','This action exceeds your plan allowance. Check your plan for details.'],
    premium: [
      "Un abonnement Premium professionnel ou collectif est nécessaire pour gérer ces demandes.",
      "A professional or collective Premium plan is required to manage requests.",
    ],
    invalid: [
      "Vérifiez les champs : texte valide et date future sont requis.",
      "Check the fields: valid text and a future date are required.",
    ],
    forbidden: [
      "Cette action n’est pas disponible pour ce profil ou ce statut.",
      "This action is unavailable for this profile or status.",
    ],
    ineligible: [
      "Cette offre n’est pas ouverte à ce type de profil, ou son auteur n’est pas disponible.",
      "This offer is not open to this profile type, or its owner is unavailable.",
    ],
    duplicate: [
      "Une demande ou candidature existe déjà. Retrouvez-la dans votre suivi.",
      "A request or application already exists. Open your tracking page.",
    ],
    profile: [
      "Complétez votre présentation ou votre parcours avant de candidater.",
      "Complete your introduction or experience before applying.",
    ],
    transition: [
      "Le statut ou le créneau ne permet plus cette action.",
      "The status or time no longer allows this action.",
    ],
    unavailable: [
      "Ce professionnel n’est pas disponible pour recevoir des demandes.",
      "This professional is unavailable to receive requests.",
    ],
    overlap: [
      "Ce créneau chevauche une disponibilité ou un rendez-vous existant (30 min).",
      "This time overlaps an existing availability or appointment (30 min).",
    ],
    slot: [
      "Ce créneau n’est plus disponible ou la demande n’a pas été acceptée.",
      "This time is no longer available or the request has not been accepted.",
    ],
  };
  return career.error ? (
    <div className="career-feedback" role="alert">
      <p>{c(...(messages[career.error] || messages.invalid))}</p>
      <Button
        variant="ghost"
        aria-label={c("Fermer", "Close")}
        onClick={() => dispatchCareer({ type: "clear-error" })}
      >
        <X size={18} />
      </Button>
    </div>
  ) : null;
}
export function CareerNav() {
  const c = useCopy();
  return (
    <nav
      className="career-nav"
      aria-label={c("Parcours et rendez-vous", "Career and appointments")}
    >
      <Link href="/talents">Listes & portefeuille</Link>
      <Link href="/essais-groupes">Essais groupés</Link>
      <Link href="/agenda">Agenda</Link>
      <Link href="/candidatures">
        <BriefcaseBusiness size={17} />
        {c("Candidatures & essais", "Applications & trials")}
      </Link>
      <Link href="/recrutement">
        <UsersRound size={17} />
        {c("Espace recrutement", "Recruitment workspace")}
      </Link>
    </nav>
  );
}
function DemoActor() {
  const { careerActor, careerActors, setCareerActor, dispatchCareer } = useDemo();
  const c = useCopy();
  return (
    <details className="career-demo" open={careerActor.id !== "self" || undefined}>
      <summary>
        {careerActor.id === "self"
          ? c("Tester les deux côtés du parcours", "Test both sides of the workflow")
          : `${c("Simulation active", "Active simulation")} · ${careerActor.name}`}
      </summary>
      <p>
        {c(
          "Profils fictifs. Changer de rôle ne modifie pas votre compte. Tout s’efface au rechargement.",
          "Fictional profiles. Switching roles does not change your account. Reloading clears all changes.",
        )}
      </p>
      <Select
        label={c("Profil de simulation", "Simulation profile")}
        value={careerActor.id}
        onChange={(id) => {
          setCareerActor(id);
          dispatchCareer({ type: "clear-error" });
        }}
      >
        {careerActors
          .filter((a) => ["self", "lea", "noah", "marc", "horizon", "arena"].includes(a.id))
          .map((a) => (
            <Option key={a.id} value={a.id}>
              {a.id === "self"
                ? c("Mon profil actuel", "My current profile")
                : a.name + " · " + a.category}
            </Option>
          ))}
      </Select>
    </details>
  );
}
function CareerPage({
  title,
  intro,
  children,
}: {
  title: string;
  intro: string;
  children: ReactNode;
}) {
  const c = useCopy();
  return (
    <ProfileLayout>
      <div className="social-title">
        <h1>
          {title}
          <span>.</span>
        </h1>
      </div>
      <p className="social-intro">{intro}</p>
      <CareerNav />
      <DemoActor />
      <CareerFeedback />
      <div className="career-workspace">{children}</div>
      <p className="career-note">
        {c(
          "Démo locale · aucune candidature, réservation ou notification réelle.",
          "Local demo · no real applications, bookings or notifications.",
        )}
      </p>
    </ProfileLayout>
  );
}
function PremiumNotice() {
  const c = useCopy();
  const { careerActor } = useDemo();
  if (careerActor.premium) return <div className="career-empty"><h2>{c("Un espace pour les professionnels et collectifs", "A workspace for professionals and organisations")}</h2><p>{c("Votre Premium est actif. Cet outil est réservé aux profils professionnels et collectifs ; en tant que sportif, retrouvez vos démarches dans vos candidatures.", "Your Premium is active. This tool is for professional and organisation profiles; as an athlete, manage your applications instead.")}</p><Link href="/candidatures">{c("Mes candidatures", "My applications")}</Link></div>;
  return (
    <div className="career-empty">
      <LockKeyhole size={24} />
      <h2>{c("Votre espace professionnel", "Your professional workspace")}</h2>
      <p>
        {c(
          "Les sportifs peuvent candidater. Pour publier une recherche et gérer les échanges côté professionnel ou collectif, activez le Premium de démonstration.",
          "Athletes can apply. To publish a vacancy and manage requests as a professional or collective, activate demo Premium.",
        )}
      </p>
      <Link href="/abonnement" className="action primary">
        {c("Voir mon abonnement", "View my subscription")}
      </Link>
    </div>
  );
}

export function PersonalizedRecommendations() {
  const { career, careerActors, dispatchCareer, trust, social, dispatchSocial } = useDemo();
  const c = useCopy();
  const [prefs, setPrefs] = useState(false),
    [selected, setSelected] = useState<Member | null>(null);
  const [sport, setSport] = useState(career.preference.sport),
    [city, setCity] = useState(career.preference.city);
  const results = recommendations(career, careerActors[0], trust.blocked);
  const reason = (r: string) =>
    r === "sport"
      ? c("Sport en commun", "Shared sport")
      : r === "city"
        ? c("Même ville", "Same city")
        : c("Même pays", "Same country");
  return (
    <section className="career-recommendations">
      <div className="career-section-title">
        <div>
          <span className="mini-kicker">{c("POUR VOUS", "FOR YOU")}</span>
          <h2>{c("Les bonnes connexions.", "The right connections.")}</h2>
        </div>
        <Button
          variant="ghost"
          onClick={() => setPrefs(true)}
          aria-label={c("Ajuster mes recommandations", "Adjust my recommendations")}
        >
          <SlidersHorizontal size={20} />
        </Button>
      </div>
      <p className="career-note">
        {c(
          "Suggestions selon vos sports et votre localisation. Pas de classement de valeur des personnes.",
          "Suggestions based on your sports and location. People are not ranked by their worth.",
        )}
      </p>
      <div className="career-people">
        {results.people.map(({ member: m, reasons }) => (
          <article className="career-person" key={m.id}>
            <img src={m.image} alt="" />
            <div>
              <button className="career-name" onClick={() => setSelected(m)}>
                {m.name}
              </button>
              <p>
                {m.role} · {m.city}
              </p>
              <small>{reasons.map(reason).join(" · ")}</small>
              <div className="career-actions">
                <Button
                  className="action secondary"
                  aria-pressed={social.following.includes(m.id)}
                  onClick={() => dispatchSocial({ type: "follow", id: m.id })}
                >
                  {social.following.includes(m.id)
                    ? c("Suivi", "Following")
                    : c("Suivre", "Follow")}
                </Button>
                <Button
                  variant="ghost"
                  aria-label={c("Masquer la suggestion : ", "Hide suggestion: ") + m.name}
                  onClick={() => dispatchCareer({ type: "dismiss", id: m.id })}
                >
                  <X size={16} />
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
      {results.offers.map(({ offer: o, reasons }) => (
        <Link key={o.id} href="/candidatures" className="career-suggestion">
          <BriefcaseBusiness size={22} />
          <span>
            <strong>{o.title}</strong>
            <small>
              {reasons.map(reason).join(" · ")} · {o.city}
            </small>
          </span>
          <ArrowUpRight size={18} />
        </Link>
      ))}
      {!results.people.length && !results.offers.length && (
        <p>
          {c(
            "Aucune suggestion pour le moment. Ajustez vos préférences ou complétez votre profil.",
            "No suggestions yet. Adjust your preferences or complete your profile.",
          )}
        </p>
      )}
      <Modal
        open={prefs}
        onOpenChange={setPrefs}
        title={c("Vos recommandations", "Your recommendations")}
        description={c(
          "Ces préférences ne modifient pas votre profil.",
          "These preferences do not change your profile.",
        )}
      >
        <form
          className="career-form"
          onSubmit={(e) => {
            e.preventDefault();
            dispatchCareer({ type: "preferences", sport, city });
            setPrefs(false);
          }}
        >
          <Select
            label={c("Sport prioritaire", "Preferred sport")}
            value={sport}
            onChange={setSport}
          >
            <Option value="">{c("Mes sports du profil", "My profile sports")}</Option>
            {sports.map((s) => (
              <Option key={s} value={s}>
                {s}
              </Option>
            ))}
          </Select>
          <Field
            id="recommend-city"
            label={c("Ville préférée (facultatif)", "Preferred city (optional)")}
            maxLength={80}
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <Submit>{c("Appliquer", "Apply")}</Submit>
        </form>
      </Modal>
      <Modal
        open={!!selected}
        onOpenChange={(v) => !v && setSelected(null)}
        title={selected?.name || ""}
        description={c("Profil fictif recommandé", "Recommended fictional profile")}
      >
        {selected && (
          <div className="career-form">
            <p>
              {selected.role} · {selected.city}
            </p>
            <p>{selected.bio}</p>
            <AppointmentRequestButton member={selected} />
            <Link href="/reseau" className="action secondary">
              {c("Explorer les profils du réseau", "Explore network profiles")}
            </Link>
          </div>
        )}
      </Modal>
    </section>
  );
}

export function ApplyButton({ offerId }: { offerId: string }) {
  const { career, careerActor, dispatchCareer } = useDemo();
  const c = useCopy();
  const [open, setOpen] = useState(false);
  const [consent, setConsent] = useState(false);
  const offer = career.offers.find((o) => o.id === offerId);
  const app = career.applications.find(
    (a) => a.offerId === offerId && a.candidate === careerActor.id,
  );
  if (!offer) return null;
  if (app)
    return (
      <div className="career-form">
        <Status value={app.stage} />
        <Link href="/candidatures" className="action secondary">
          {c("Suivre ma candidature", "Track my application")}
        </Link>
      </div>
    );
  if (offer.owner === careerActor.id)
    return (
      <Link href="/recrutement" className="action secondary">
        {c("Gérer les candidatures", "Manage applications")}
      </Link>
    );
  if (offer.audience !== careerActor.category)
    return (
      <p className="career-note">
        {c("Cette recherche s’adresse au profil : ", "This vacancy is for: ")}
        {offer.audience}.
      </p>
    );
  return (
    <>
      <Button
        className="action primary"
        disabled={!offer.open}
        onClick={() => {
          dispatchCareer({ type: "clear-error" });
          setOpen(true);
        }}
      >
        {offer.open
          ? c("Candidater avec mon profil", "Apply with my profile")
          : c("Offre clôturée", "Closed offer")}
      </Button>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title={c("Vérifier ma candidature", "Review my application")}
        description={offer.title}
      >
        <div className="career-form">
          <p>
            <strong>{careerActor.name}</strong>
          </p>
          <ul>
            {careerActor.dossier.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
          <p className="career-note">
            {c(
              "Seuls votre nom et ce résumé sportif sont partagés dans la démo. Ni date de naissance, ni coordonnées, ni numéro de licence.",
              "Only your name and this sports summary are shared in the demo. No birth date, contact details or licence number.",
            )}
          </p>
          <label className="career-consent">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
            />
            {careerActor.guardian
              ? c(
                  "En tant que représentant légal, j’autorise le partage de ce dossier.",
                  "As legal guardian, I authorize sharing this dossier.",
                )
              : c(
                  "Je confirme le partage de ce dossier avec le recruteur.",
                  "I confirm sharing this dossier with the recruiter.",
                )}
          </label>
          <CareerFeedback />
          <Button
            className="action primary"
            disabled={!consent}
            onClick={() => dispatchCareer({ type: "apply", id: uid(), offerId })}
          >
            {c("Envoyer ma candidature · démo", "Submit application · demo")}
          </Button>
        </div>
      </Modal>
    </>
  );
}
function TrialInfo({ application: a }: { application: Application }) {
  const { locale } = useLocale();
  const c = useCopy();
  return a.trial ? (
    <p className="career-trial">
      <CalendarDays size={18} />
      <span>
        {dateText(a.trial.start, locale)} · {a.trial.place}
        <small>{c("Heure locale de votre appareil", "Your device’s local time")}</small>
      </span>
    </p>
  ) : null;
}
export function ApplicationsPage() {
  const { career, careerActor, careerActors, dispatchCareer } = useDemo();
  const c = useCopy();
  const [tab, setTab] = useState("discover");
  const mine = career.applications.filter((a) => a.candidate === careerActor.id);
  const offers = career.offers.filter(
    (o) => o.open && o.audience === careerActor.category && o.owner !== careerActor.id,
  );
  return (
    <CareerPage
      title={c("Candidatures & essais", "Applications & trials")}
      intro={c(
        "Votre dossier, votre prochain terrain. Suivez chaque étape jusqu’à l’essai.",
        "Your profile, your next opportunity. Track each step through to the trial.",
      )}
    >
      <div className="event-tabs">
        <Button
          variant="ghost"
          aria-pressed={tab === "discover"}
          onClick={() => setTab("discover")}
        >
          {c("Recherches ouvertes", "Open vacancies")}
        </Button>
        <Button variant="ghost" aria-pressed={tab === "mine"} onClick={() => setTab("mine")}>
          {c("Mon suivi", "My applications")} ({mine.length})
        </Button>
      </div>
      {tab === "discover" ? (
        <div className="career-grid">
          {offers.map((o) => (
            <article className="career-card" key={o.id}>
              <span className="mini-kicker">
                {o.sport} · {o.city}
              </span>
              <h2>{o.title}</h2>
              <p>{careerActors.find((a) => a.id === o.owner)?.name}</p>
              <p>{o.description}</p>
              <p className="career-note">{[o.level, o.position].filter(Boolean).join(" · ")}</p>
              <ApplyButton offerId={o.id} />
            </article>
          ))}
          {!offers.length && (
            <p>
              {c(
                "Aucune recherche ouverte pour ce type de profil.",
                "No open vacancies for this profile type.",
              )}
            </p>
          )}
        </div>
      ) : (
        <div className="career-grid">
          {mine.map((a) => (
            <article className="career-card" key={a.id}>
              <Status value={a.stage} />
              <h2>{career.offers.find((o) => o.id === a.offerId)?.title}</h2>
              <TrialInfo application={a} />
              {a.stage === "invited" && (
                <Button
                  className="action primary"
                  onClick={() => dispatchCareer({ type: "stage", id: a.id, stage: "confirmed" })}
                >
                  {c("Confirmer ma présence", "Confirm attendance")}
                </Button>
              )}
              {!["withdrawn", "declined"].includes(a.stage) && (
                <Button
                  variant="ghost"
                  onClick={() => dispatchCareer({ type: "stage", id: a.id, stage: "withdrawn" })}
                >
                  {c("Retirer ma candidature", "Withdraw my application")}
                </Button>
              )}
            </article>
          ))}
          {!mine.length && (
            <div className="career-empty">
              <h2>{c("Votre prochaine étape est ici.", "Your next step starts here.")}</h2>
              <p>
                {c(
                  "Choisissez une recherche ouverte et partagez votre dossier sportif.",
                  "Choose an open vacancy and share your sports dossier.",
                )}
              </p>
              <Button className="action secondary" onClick={() => setTab("discover")}>
                {c("Découvrir les recherches", "Discover vacancies")}
              </Button>
            </div>
          )}
        </div>
      )}
      <CareerNotices />
    </CareerPage>
  );
}

export function RecruitmentPage() {
  const { career, careerActor, dispatchCareer } = useDemo();
  const c = useCopy();
  const [create, setCreate] = useState(false);
  const [invite, setInvite] = useState<Application | null>(null);
  const [selected, setSelected] = useState<Application | null>(null);
  const [audience, setAudience] = useState("Sportif"),
    [sport, setSport] = useState("Padel"),
    [filter, setFilter] = useState("all");
  const offers = career.offers.filter((o) => o.owner === careerActor.id);
  const applications = career.applications.filter(
    (a) => offers.some((o) => o.id === a.offerId) && (filter === "all" || a.stage === filter),
  );
  const access = careerActor.category !== "Sportif";
  function createOffer(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    dispatchCareer({
      type: "offer",
      offer: {
        id: uid(),
        owner: careerActor.id,
        title: String(f.get("title")),
        sport,
        city: String(f.get("city")),
        country: String(f.get("country")),
        audience: audience as Offer["audience"],
        level: String(f.get("level")),
        position: String(f.get("position")),
        description: String(f.get("description")),
        open: true,
      },
    });
    setCreate(false);
  }
  return (
    <CareerPage
      title={c("Recruter", "Recruit")}
      intro={c(
        "Une recherche claire. Les bons dossiers. Un essai pour se rencontrer.",
        "A clear vacancy. Relevant profiles. A trial to meet in person.",
      )}
    >
      {!access ? (
        <PremiumNotice />
      ) : (
        <>
          <div className="career-section-title">
            <h2>
              {c("Mes recherches", "My vacancies")} ({offers.length})
            </h2>
            <Button className="action primary" onClick={() => setCreate(true)}>
              {c("Créer une recherche", "Create a vacancy")}
            </Button>
          </div>
          <div className="career-grid">
            {offers.map((o) => (
              <article key={o.id} className="career-card">
                <span className="mini-kicker">
                  {o.sport} · {o.city}
                </span>
                <h3>{o.title}</h3>
                <p>
                  {o.open ? c("Ouverte", "Open") : c("Clôturée", "Closed")} ·{" "}
                  {career.applications.filter((a) => a.offerId === o.id).length}{" "}
                  {c("candidature(s)", "application(s)")}
                </p>
                {o.open && (
                  <Button
                    variant="ghost"
                    onClick={() => dispatchCareer({ type: "close-offer", id: o.id })}
                  >
                    {c("Clôturer la recherche", "Close vacancy")}
                  </Button>
                )}
              </article>
            ))}
          </div>
          {!offers.length && (
            <p>
              {c(
                "Créez votre première recherche. Elle sera visible dans les candidatures de démonstration.",
                "Create your first vacancy. It will appear in demo applications.",
              )}
            </p>
          )}
          <div className="career-section-title">
            <h2>{c("Les candidatures", "Applications")}</h2>
            <Select
              label={c("Filtrer par statut", "Filter by status")}
              value={filter}
              onChange={setFilter}
            >
              <Option value="all">{c("Tous les statuts", "All statuses")}</Option>
              {[
                ["submitted", "Reçues", "Submitted"],
                ["shortlisted", "Présélection", "Shortlisted"],
                ["invited", "Invités", "Invited"],
                ["confirmed", "Confirmés", "Confirmed"],
                ["declined", "Déclinés", "Declined"],
                ["withdrawn", "Retirés", "Withdrawn"],
              ].map(([value, fr, en]) => (
                <Option key={value} value={value}>
                  {c(fr, en)}
                </Option>
              ))}
            </Select>
          </div>
          <div className="career-grid">
            {applications.map((a) => (
              <article className="career-card" key={a.id}>
                <Status value={a.stage} />
                <h3>{a.name}</h3>
                <p>{career.offers.find((o) => o.id === a.offerId)?.title}</p>
                {a.guardian && (
                  <p>
                    {c(
                      "Dossier transmis par le représentant légal.",
                      "Dossier submitted by the legal guardian.",
                    )}
                  </p>
                )}
                <TrialInfo application={a} />
                <div className="career-actions">
                  <Button className="action secondary" onClick={() => setSelected(a)}>
                    {c("Voir le dossier", "View dossier")}
                  </Button>
                  {a.stage === "submitted" && (
                    <Button
                      className="action secondary"
                      onClick={() =>
                        dispatchCareer({ type: "stage", id: a.id, stage: "shortlisted" })
                      }
                    >
                      {c("Présélectionner", "Shortlist")}
                    </Button>
                  )}
                  {["submitted", "shortlisted"].includes(a.stage) && (
                    <Button className="action primary" onClick={() => setInvite(a)}>
                      {c("Inviter à un essai", "Invite to a trial")}
                    </Button>
                  )}
                  {!["declined", "withdrawn"].includes(a.stage) && (
                    <Button
                      variant="ghost"
                      onClick={() => dispatchCareer({ type: "stage", id: a.id, stage: "declined" })}
                    >
                      {c("Décliner / annuler", "Decline / cancel")}
                    </Button>
                  )}
                </div>
              </article>
            ))}
          </div>
          {!applications.length && (
            <p>
              {c(
                "Aucun dossier pour ce filtre. Dans la simulation, candidatez avec un sportif ou un professionnel, puis revenez ici.",
                "No dossiers for this filter. In the simulation, apply as an athlete or professional, then return here.",
              )}
            </p>
          )}
          <Modal
            open={create}
            onOpenChange={setCreate}
            title={c("Nouvelle recherche", "New vacancy")}
            description={c(
              "Annonce fictive visible pendant cette visite uniquement.",
              "Fictional vacancy visible during this visit only.",
            )}
          >
            <form className="career-form" onSubmit={createOffer}>
              <Field name="title" label={c("Intitulé", "Title")} required maxLength={160} />
              <Select label={c("Sport", "Sport")} value={sport} onChange={setSport}>
                {sports.map((s) => (
                  <Option key={s} value={s}>
                    {s}
                  </Option>
                ))}
              </Select>
              <Select
                label={c("Profil recherché", "Profile wanted")}
                value={audience}
                onChange={setAudience}
              >
                <Option value="Sportif">{c("Sportif", "Athlete")}</Option>
                <Option value="Professionnel">{c("Professionnel", "Professional")}</Option>
              </Select>
              <Field name="city" label={c("Ville", "City")} required maxLength={80} />
              <Field
                name="country"
                label={c("Pays", "Country")}
                required
                maxLength={80}
                defaultValue={careerActor.country}
              />
              <Field
                name="level"
                label={c("Niveau souhaité (facultatif)", "Preferred level (optional)")}
                maxLength={80}
              />
              <Field
                name="position"
                label={c("Poste ou spécialité (facultatif)", "Position or specialty (optional)")}
                maxLength={80}
              />
              <Field
                id="vacancy-description"
                label={c("Description et modalités", "Description and terms")}
              >
                <Textarea id="vacancy-description" name="description" required maxLength={800} />
              </Field>
              <Submit>{c("Publier la recherche · démo", "Publish vacancy · demo")}</Submit>
            </form>
          </Modal>
          <Modal
            open={!!invite}
            onOpenChange={(v) => !v && setInvite(null)}
            title={c("Inviter à un essai", "Invite to a trial")}
            description={invite?.name || ""}
          >
            <form
              className="career-form"
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                dispatchCareer({
                  type: "stage",
                  id: invite!.id,
                  stage: "invited",
                  trial: {
                    start: new Date(String(f.get("start"))).toISOString(),
                    place: String(f.get("place")),
                  },
                });
                setInvite(null);
              }}
            >
              <Field
                name="start"
                type="datetime-local"
                label={c("Date et heure (heure locale)", "Date and time (local time)")}
                required
              />
              <Field
                name="place"
                label={c("Lieu et adresse", "Venue and address")}
                required
                maxLength={160}
              />
              <p>
                {c(
                  "Le candidat doit ensuite confirmer sa présence.",
                  "The candidate must then confirm attendance.",
                )}
              </p>
              <Submit>{c("Envoyer l’invitation · démo", "Send invitation · demo")}</Submit>
            </form>
          </Modal>
          <Modal
            open={!!selected}
            onOpenChange={(v) => !v && setSelected(null)}
            title={selected?.name || ""}
            description={c(
              "Dossier partagé au moment de la candidature.",
              "Dossier shared at the time of application.",
            )}
          >
            <ul className="career-dossier">
              {selected?.dossier.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </Modal>
        </>
      )}
      <CareerNotices />
    </CareerPage>
  );
}

export function AppointmentRequestButton({ member }: { member: Member }) {
  const { career, careerActor, dispatchCareer, trust } = useDemo();
  const c = useCopy();
  const [open, setOpen] = useState(false),
    [purpose, setPurpose] = useState(appointmentPurposes[0]);
  const request = career.appointments.find(
    (a) =>
      a.requester === careerActor.id &&
      a.professional === member.id &&
      !["cancelled", "declined"].includes(a.status),
  );
  if (member.kind !== "Professionnels") return null;
  return (
    <>
      <Button
        className="action secondary"
        disabled={trust.blocked.includes(member.id)}
        onClick={() => {
          dispatchCareer({ type: "clear-error" });
          setOpen(true);
        }}
      >
        <CalendarDays size={18} />
        {request
          ? c("Suivre ma demande de rendez-vous", "Track my appointment request")
          : c("Demander un rendez-vous", "Request an appointment")}
      </Button>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title={c("Rendez-vous avec ", "Appointment with ") + member.name}
        description={c(
          "Les disponibilités restent privées jusqu’à acceptation de votre demande.",
          "Availability stays private until your request is accepted.",
        )}
      >
        <div className="career-form">
          {request ? (
            <>
              <Status value={request.status} />
              <Link href="/rendez-vous" className="action primary">
                {c("Ouvrir mes rendez-vous", "Open my appointments")}
              </Link>
            </>
          ) : (
            <>
              <Select
                label={c("Objet du rendez-vous", "Appointment purpose")}
                value={purpose}
                onChange={setPurpose}
              >
                {appointmentPurposes.map((p, i) => (
                  <Option key={p} value={p}>
                    {c(
                      p,
                      ["Discover your coaching", "Plan my progress", "Discuss a sports project"][i],
                    )}
                  </Option>
                ))}
              </Select>
              <p>
                {c(
                  "Demande structurée, sans message libre. Aucune séance ni aucun paiement ne sont engagés à cette étape.",
                  "Structured request, without free-text messaging. No session or payment is committed at this stage.",
                )}
              </p>
              {careerActor.guardian && (
                <p>
                  {c(
                    "Demande gérée par le représentant légal.",
                    "Request managed by the legal guardian.",
                  )}
                </p>
              )}
              <Button
                className="action primary"
                onClick={() =>
                  dispatchCareer({ type: "request", id: uid(), professional: member.id, purpose })
                }
              >
                {c("Envoyer la demande · démo", "Send request · demo")}
              </Button>
            </>
          )}
          <CareerFeedback />
        </div>
      </Modal>
    </>
  );
}
export function AppointmentsPage() {
  const { career, careerActor, careerActors, dispatchCareer } = useDemo();
  const c = useCopy();
  const { locale } = useLocale();
  const [tab, setTab] = useState("sent"),
    [slotForm, setSlotForm] = useState(false);
  const sent = career.appointments.filter((a) => a.requester === careerActor.id);
  const incoming = career.appointments.filter((a) => a.professional === careerActor.id);
  const pro = careerActor.category === "Professionnel";
  const name = (id: string) => careerActors.find((a) => a.id === id)?.name || id;
  const ownSlots = career.slots.filter(
    (s) => s.professional === careerActor.id && Date.parse(s.start) > Date.now(),
  );
  return (
    <CareerPage
      title={c("Demandes de RDV", "Meeting requests")}
      intro={c(
        "Demandez un échange. Après accord du professionnel, choisissez votre créneau.",
        "Request a meeting. Once the professional agrees, choose a time.",
      )}
    >
      <Link href="/agenda" className="action secondary">{c("Retour à l’agenda", "Back to calendar")}</Link>
      <div className="event-tabs">
        <Button variant="ghost" aria-pressed={tab === "sent"} onClick={() => setTab("sent")}>
          {c("Mes demandes", "My requests")} ({sent.length})
        </Button>
        {pro && (
          <Button
            variant="ghost"
            aria-pressed={tab === "received"}
            onClick={() => setTab("received")}
          >
            {c("Demandes reçues", "Incoming requests")} ({incoming.length})
          </Button>
        )}
        {pro && (
          <Button variant="ghost" aria-pressed={tab === "slots"} onClick={() => setTab("slots")}>
            {c("Mes disponibilités", "My availability")}
          </Button>
        )}
      </div>
      {tab === "slots" && pro ? (
        pro ? (
          <>
            <div className="career-section-title">
              <h2>{c("Créneaux de 30 minutes", "30-minute slots")}</h2>
              <Button className="action primary" onClick={() => setSlotForm(true)}>
                {c("Ajouter un créneau", "Add availability")}
              </Button>
            </div>
            <p className="career-note">
              {c(
                "Seules les personnes dont vous avez accepté la demande voient les créneaux libres.",
                "Only people whose requests you accepted can see free slots.",
              )}
            </p>
            {ownSlots.map((s) => {
              const booked = career.appointments.some(
                (a) => a.slot === s.id && a.status === "booked",
              );
              return (
                <article className="career-card" key={s.id}>
                  <h3>{dateText(s.start, locale)}</h3>
                  <p>
                    {s.place} · {booked ? c("Réservé", "Booked") : c("Libre", "Available")}
                  </p>
                  {!booked && (
                    <Button
                      variant="ghost"
                      onClick={() => dispatchCareer({ type: "remove-slot", id: s.id })}
                    >
                      {c("Retirer le créneau", "Remove slot")}
                    </Button>
                  )}
                </article>
              );
            })}
            {!ownSlots.length && (
              <p>
                {c(
                  "Ajoutez votre première disponibilité future.",
                  "Add your first future availability.",
                )}
              </p>
            )}
          </>
        ) : (
          <PremiumNotice />
        )
      ) : tab === "received" && !pro ? (
        <PremiumNotice />
      ) : (
        <div className="career-grid">
          {(tab === "received" && pro ? incoming : sent).map((a) => {
            const receiving = a.professional === careerActor.id;
            const slot = career.slots.find((s) => s.id === a.slot);
            const slots = availableSlots(career, a, careerActor.id, Date.now());
            return (
              <article key={a.id} className="career-card">
                <Status value={a.status} />
                <h2>{name(receiving ? a.requester : a.professional)}</h2>
                <p>
                  {c(
                    a.purpose,
                    ["Discover your coaching", "Plan my progress", "Discuss a sports project"][
                      appointmentPurposes.indexOf(a.purpose)
                    ] || a.purpose,
                  )}
                </p>
                {slot && a.status === "booked" && (
                  <p className="career-trial">
                    <CalendarDays size={20} />
                    <span>
                      {dateText(slot.start, locale)} · {slot.place}
                      <small>
                        {c(
                          "30 minutes · heure locale de votre appareil",
                          "30 minutes · your device’s local time",
                        )}
                      </small>
                    </span>
                  </p>
                )}
                {receiving && a.status === "pending" && (
                  <div className="career-actions">
                    <Button
                      className="action primary"
                      onClick={() => dispatchCareer({ type: "respond", id: a.id, accept: true })}
                    >
                      {c("Accepter la demande", "Accept request")}
                    </Button>
                    <Button
                      className="action secondary"
                      onClick={() => dispatchCareer({ type: "respond", id: a.id, accept: false })}
                    >
                      {c("Décliner", "Decline")}
                    </Button>
                  </div>
                )}
                {!receiving && a.status === "pending" && (
                  <p className="career-note">
                    <LockKeyhole size={17} />
                    {c(
                      "Vous pourrez consulter les créneaux après acceptation.",
                      "You can view slots after acceptance.",
                    )}
                  </p>
                )}
                {!receiving && a.status === "accepted" && (
                  <div className="career-slots">
                    <h3>{c("Choisir un créneau", "Choose a time")}</h3>
                    {slots.map((s) => (
                      <Button
                        className="action secondary"
                        key={s.id}
                        onClick={() => dispatchCareer({ type: "book", id: a.id, slot: s.id })}
                      >
                        {dateText(s.start, locale)}
                        <small>{s.place} · 30 min</small>
                      </Button>
                    ))}
                    {!slots.length && (
                      <p>
                        {c(
                          "Aucun créneau libre actuellement. Le professionnel doit en ajouter.",
                          "No slots are currently available. The professional needs to add some.",
                        )}
                      </p>
                    )}
                    <p className="career-note">
                      {c(
                        "Choisir un créneau le confirme dans les deux agendas de démonstration. Heure locale de votre appareil.",
                        "Choosing a slot confirms it in both demo calendars. Your device’s local time.",
                      )}
                    </p>
                  </div>
                )}
                {!["declined", "cancelled"].includes(a.status) && (
                  <Button
                    variant="ghost"
                    onClick={() => dispatchCareer({ type: "cancel", id: a.id })}
                  >
                    {c("Annuler la demande / le rendez-vous", "Cancel request / appointment")}
                  </Button>
                )}
              </article>
            );
          })}
          {!(tab === "received" && pro ? incoming : sent).length && (
            <div className="career-empty">
              <CalendarDays size={26} />
              <h2>{c("Tout commence par une rencontre.", "It starts with a meeting.")}</h2>
              <p>
                {c(
                  "Depuis le réseau, ouvrez le profil d’un professionnel et demandez un rendez-vous.",
                  "Open a professional’s profile in your network and request an appointment.",
                )}
              </p>
              <Link href="/reseau" className="action secondary">
                {c("Explorer le réseau", "Explore the network")}
              </Link>
            </div>
          )}
        </div>
      )}
      <Modal
        open={slotForm}
        onOpenChange={setSlotForm}
        title={c("Ajouter une disponibilité", "Add availability")}
        description={c(
          "Séance de 30 minutes · heure locale de votre appareil.",
          "30-minute session · your device’s local time.",
        )}
      >
        <form
          className="career-form"
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            dispatchCareer({
              type: "slot",
              slot: {
                id: uid(),
                professional: careerActor.id,
                start: new Date(String(f.get("start"))).toISOString(),
                place: String(f.get("place")),
              },
            });
            setSlotForm(false);
          }}
        >
          <Field
            name="start"
            type="datetime-local"
            label={c("Date et heure", "Date and time")}
            required
          />
          <Field
            name="place"
            label={c("Adresse ou visioconférence", "Address or video call")}
            required
            maxLength={160}
          />
          <Submit>{c("Ajouter le créneau", "Add slot")}</Submit>
        </form>
      </Modal>
      <CareerNotices />
    </CareerPage>
  );
}
export function CareerNotices({ unreadOnly = false }: { unreadOnly?: boolean }) {
  const { career, careerActor, dispatchCareer } = useDemo();
  const c = useCopy();
  const list = career.notices.filter(
    (n) => n.recipient === careerActor.id && (!unreadOnly || !n.read),
  );
  if (!list.length) return null;
  return (
    <section className="career-notices">
      <div className="career-section-title">
        <h2>{c("Suivi des demandes", "Request updates")}</h2>
        <Button variant="ghost" onClick={() => dispatchCareer({ type: "read" })}>
          {c("Tout marquer lu", "Mark all read")}
        </Button>
      </div>
      {list.map((n) => (
        <Link
          className={"career-suggestion " + (!n.read ? "career-unread" : "")}
          key={n.id}
          href={n.href}
          onClick={() => dispatchCareer({ type: "read", id: n.id })}
        >
          <span>{c(n.fr, n.en)}</span>
          <ArrowUpRight size={18} />
        </Link>
      ))}
    </section>
  );
}
export function CareerAgenda() {
  const { career, careerActor, careerActors } = useDemo();
  const { locale } = useLocale();
  const c = useCopy();
  const appointments = career.appointments
    .filter((a) => a.status === "booked" && [a.requester, a.professional].includes(careerActor.id))
    .flatMap((a) => {
      const s = career.slots.find((s) => s.id === a.slot);
      return s && Date.parse(s.start) > Date.now()
        ? [
            {
              start: s.start,
              place: s.place,
              title:
                careerActors.find(
                  (p) => p.id === (a.requester === careerActor.id ? a.professional : a.requester),
                )?.name || "",
              href: "/rendez-vous",
              id: a.id,
            },
          ]
        : [];
    });
  const trials = career.applications
    .filter(
      (a) =>
        a.stage === "confirmed" &&
        a.trial &&
        Date.parse(a.trial.start) > Date.now() &&
        (a.candidate === careerActor.id ||
          career.offers.some((o) => o.id === a.offerId && o.owner === careerActor.id)),
    )
    .map((a) => ({
      start: a.trial!.start,
      place: a.trial!.place,
      title: c("Essai · ", "Trial · ") + a.name,
      href: a.candidate === careerActor.id ? "/candidatures" : "/recrutement",
      id: a.id,
    }));
  return (
    <section className="career-notices">
      <CareerNav />
      {[...appointments, ...trials]
        .sort((a, b) => Date.parse(a.start) - Date.parse(b.start))
        .map((x) => (
          <Link key={x.id} className="career-suggestion" href={x.href}>
            <CalendarDays size={20} />
            <span>
              <strong>{x.title}</strong>
              <small>
                {dateText(x.start, locale)} · {x.place}
              </small>
            </span>
            <Check size={18} />
          </Link>
        ))}
    </section>
  );
}
