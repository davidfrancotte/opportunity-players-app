import type { Category, Profile } from "./model";
import {limits,calendarMonth} from './entitlements.ts';
import { members, unpaidRecipients, type Member } from "./social.ts";
import { memberSports, moderateText } from "./trust.ts";

// Local demo workflows. Production must authorize every transition server-side.
export type Actor = {
  id: string;
  name: string;
  category: Category;
  premium: boolean;
  sports: string[];
  city: string;
  country: string;
  dossier: string[];
  guardian: boolean;
};
export function careerActors(profile: Profile, premium: boolean): Actor[] {
  return [
    {
      id: "self",
      name:
        `${profile.firstName} ${profile.lastName}`.trim() || profile.organisation || "Mon profil",
      category: profile.category,
      premium,
      sports: [
        ...new Set([profile.sport, ...profile.disciplines.map((d) => d.sport)].filter(Boolean)),
      ],
      city: profile.city,
      country: profile.country,
      guardian: profile.registrationMode === "child",
      dossier: [
        profile.headline,
        ...profile.disciplines.map((d) =>
          [d.sport, d.level, d.position, d.availability, d.contractStatus]
            .filter(Boolean)
            .join(" · "),
        ),
        ...profile.experiences.map((e) => `${e.title} · ${e.organisation}`),
      ].filter(Boolean),
    },
    ...members.map((m) => ({
      id: m.id,
      name: m.name,
      category: (m.kind === "Joueurs"
        ? "Sportif"
        : m.kind === "Professionnels"
          ? "Professionnel"
          : "Organisation") as Category,
      premium: !unpaidRecipients.includes(m.id),
      sports: [...new Set([m.sport, ...(memberSports[m.id] || []).map((d) => d.sport)])],
      city: m.city,
      country: m.country,
      guardian: false,
      dossier: [
        m.role,
        ...(memberSports[m.id] || []).map((d) =>
          [d.sport, d.level, d.position, d.availability].filter(Boolean).join(" · "),
        ),
      ],
    })),
    {
      id: "arena",
      name: "Collectif Arena",
      category: "Organisation",
      premium: true,
      sports: ["Basketball"],
      city: "Liège",
      country: "Belgique",
      dossier: ["Collectif fictif de basketball"],
      guardian: false,
    },
  ];
}
export type Offer = {
  id: string;
  owner: string;
  title: string;
  sport: string;
  city: string;
  country: string;
  audience: "Sportif" | "Professionnel";
  level: string;
  position: string;
  description: string;
  open: boolean;
};
export type Application = {
  createdAt?:number;
  invitedAt?:number;
  id: string;
  offerId: string;
  candidate: string;
  name: string;
  dossier: string[];
  guardian: boolean;
  stage: "submitted" | "shortlisted" | "declined" | "invited" | "confirmed" | "withdrawn";
  trial?: { start: string; place: string };
};
export type Appointment = {
  respondedAt?:number;
  createdAt?:number;
  bookedAt?:number;
  id: string;
  requester: string;
  professional: string;
  purpose: string;
  status: "pending" | "accepted" | "declined" | "booked" | "cancelled";
  slot?: string;
};
export type Slot = { id: string; professional: string; start: string; place: string };
export type CareerNotice = {
  id: string;
  recipient: string;
  fr: string;
  en: string;
  href: string;
  read: boolean;
};
export type CareerState = {
  offers: Offer[];
  applications: Application[];
  appointments: Appointment[];
  slots: Slot[];
  notices: CareerNotice[];
  preference: { sport: string; city: string };
  dismissed: string[];
  error: string | null;
};
export function createCareerState(): CareerState {
  return {
    offers: [
      {
        id: "coach",
        owner: "horizon",
        title: "Un coach pour faire grandir notre équipe.",
        sport: "Padel",
        city: "Namur",
        country: "Belgique",
        audience: "Professionnel",
        level: "",
        position: "",
        description:
          "Deux séances hebdomadaires. Expérience en encadrement souhaitée. Mission fictive.",
        open: true,
      },
      {
        id: "tryout",
        owner: "arena",
        title: "De nouveaux talents sur le parquet.",
        sport: "Basketball",
        city: "Liège",
        country: "Belgique",
        audience: "Sportif",
        level: "Compétition",
        position: "Ailier",
        description: "Détection amateur. Postes extérieurs et intérieurs. Aucune sélection réelle.",
        open: true,
      },
      {
        id: "padel-trial",
        owner: "horizon",
        title: "Rejoignez notre collectif de padel.",
        sport: "Padel",
        city: "Namur",
        country: "Belgique",
        audience: "Sportif",
        level: "Intermédiaire",
        position: "",
        description:
          "Une séance de découverte pour rencontrer le groupe. Tous les dossiers seront étudiés.",
        open: true,
      },
    ],
    applications: [],
    appointments: [],
    slots: [],
    notices: [],
    preference: { sport: "", city: "" },
    dismissed: [],
    error: null,
  };
}
export type CareerAction =
  | { type: "reset" | "clear-error" }
  | { type: "preferences"; sport: string; city: string }
  | { type: "dismiss"; id: string }
  | { type: "read"; id?: string }
  | { type: "offer"; offer: Offer }
  | { type: "close-offer"; id: string }
  | { type: "apply"; id: string; offerId: string }
  | { type: "stage"; id: string; stage: Application["stage"]; trial?: Application["trial"] }
  | { type: "request"; id: string; professional: string; purpose: string }
  | { type: "respond"; id: string; accept: boolean }
  | { type: "slot"; slot: Slot }
  | { type: "remove-slot"; id: string }
  | { type: "slots-series"; slots: Slot[] }
  | { type: "book"; id: string; slot: string }
  | { type: "cancel"; id: string };
export type CareerContext = { actor: Actor; actors: Actor[]; blocked: string[]; now: number };
const clean = (s: string, max = 160) => !!s.trim() && s.length <= max && !moderateText(s);
const future = (s: string, now: number) => Number.isFinite(Date.parse(s)) && Date.parse(s) > now;
const overlap = (a: string, b: string) => Math.abs(Date.parse(a) - Date.parse(b)) < 30 * 60000;
export const appointmentPurposes = [
  "Découvrir votre accompagnement",
  "Préparer ma progression",
  "Échanger sur un projet sportif",
];
export function unconfirmedAppointments(state: CareerState, actorId: string) {
  return state.appointments
    .filter(a => [a.requester, a.professional].includes(actorId) && (a.status === "pending" || a.status === "accepted"))
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}
export function availableSlots(
  state: CareerState,
  request: Appointment,
  actorId: string,
  now: number,
): Slot[] {
  // Never expose availability to a requester while pending, refused or cancelled.
  if (request.requester !== actorId || request.status !== "accepted") return [];
  return state.slots.filter(
    (s) =>
      s.professional === request.professional &&
      future(s.start, now) &&
      !state.appointments.some((a) => a.status === "booked" && a.slot === s.id),
  );
}
export function careerReducer(
  state: CareerState,
  command: { action: CareerAction; context: CareerContext },
): CareerState {
  const {
    action,
    context: { actor, actors, blocked, now },
  } = command;
  const fail = (code: string) => ({ ...state, error: code });
  const base = { ...state, error: null };
  const recruiter = actor.category !== "Sportif";
  const quota=limits(actor.category,actor.premium);
  const inMonth=(at?:number)=>!!at&&calendarMonth(at)===calendarMonth(now);
  const allowed = (id: string) => !blocked.includes(id);
  const notify = (next: CareerState, recipient: string, fr: string, en: string, href: string) => ({
    ...next,
    notices: [
      { id: `${now}-${next.notices.length}`, recipient, fr, en, href, read: false },
      ...next.notices,
    ],
  });
  if (action.type === "reset") return createCareerState();
  if (action.type === "clear-error") return base;
  if(action.type==='slots-series'){
    if(!actor.premium||!action.slots.length||action.slots.length>12)return fail('premium');
    let next=state;for(const slot of action.slots){next=careerReducer(next,{action:{type:'slot',slot},context:command.context});if(next.error)return fail(next.error);}return next;
  }
  if (action.type === "preferences")
    return {
      ...base,
      preference: { sport: action.sport.slice(0, 80), city: action.city.trim().slice(0, 80) },
    };
  if (action.type === "dismiss")
    return { ...base, dismissed: [...new Set([...state.dismissed, action.id])] };
  if (action.type === "read")
    return {
      ...base,
      notices: state.notices.map((n) =>
        n.recipient === actor.id && (!action.id || n.id === action.id) ? { ...n, read: true } : n,
      ),
    };
  if (action.type === "offer") {
    const o = action.offer;
    if (!recruiter||state.offers.filter(x=>x.owner===actor.id&&x.open).length>=quota.offers) return fail("quota");
    if (
      o.owner !== actor.id ||
      state.offers.some((x) => x.id === o.id) ||
      !clean(o.title) ||
      !clean(o.sport) ||
      !clean(o.city) ||
      !clean(o.country) ||
      !clean(o.description, 800) ||
      !["Sportif", "Professionnel"].includes(o.audience) ||
      moderateText(o.level + " " + o.position)
    )
      return fail("invalid");
    return { ...base, offers: [{ ...o, open: true }, ...state.offers] };
  }
  if (action.type === "close-offer") {
    if (!recruiter || !state.offers.some((o) => o.id === action.id && o.owner === actor.id))
      return fail("forbidden");
    return {
      ...base,
      offers: state.offers.map((o) => (o.id === action.id ? { ...o, open: false } : o)),
    };
  }
  if (action.type === "apply") {
    if(state.applications.filter(a=>a.candidate===actor.id&&inMonth(a.createdAt)).length>=quota.applications)return fail('quota');
    const o = state.offers.find((o) => o.id === action.offerId);
    if (
      !o?.open ||
      o.owner === actor.id ||
      !allowed(o.owner) ||
      o.audience !== actor.category ||
      !actors.some((a) => a.id === o.owner)
    )
      return fail("ineligible");
    if (
      state.applications.some(
        (a) => a.id === action.id || (a.offerId === o.id && a.candidate === actor.id),
      )
    )
      return fail("duplicate");
    const dossier = actor.dossier.filter((s) => !moderateText(s));
    if (!dossier.length) return fail("profile");
    return notify(
      {
        ...base,
        applications: [
          {
            id: action.id,
            createdAt:now,
            offerId: o.id,
            candidate: actor.id,
            name: actor.name,
            dossier,
            guardian: actor.guardian,
            stage: "submitted",
          },
          ...state.applications,
        ],
      },
      o.owner,
      "Nouvelle candidature : " + o.title,
      "New application: " + o.title,
      "/recrutement",
    );
  }
  if (action.type === "stage") {
    const a = state.applications.find((a) => a.id === action.id);
    const o = state.offers.find((o) => o.id === a?.offerId);
    if (!a || !o || !allowed(a.candidate) || !allowed(o.owner)) return fail("forbidden");
    const own = a.candidate === actor.id;
    const hiring = o.owner === actor.id && recruiter;
    if(hiring&&action.stage==='shortlisted'&&!actor.premium)return fail('premium');
    if(hiring&&action.stage==='invited'&&actor.category==='Professionnel'&&!actor.premium&&state.applications.filter(x=>inMonth(x.invitedAt)&&state.offers.some(o=>o.id===x.offerId&&o.owner===actor.id)).length>=5)return fail('quota');
    if (["declined", "withdrawn"].includes(a.stage)) return fail("transition");
    if (
      action.stage === "withdrawn"
        ? !own
        : action.stage === "confirmed"
          ? !own || a.stage !== "invited" || !a.trial || !future(a.trial.start, now)
          : !hiring
    )
      return fail("forbidden");
    if (
      action.stage === "submitted" ||
      (action.stage === "shortlisted" && a.stage !== "submitted") ||
      (action.stage === "invited" &&
        (!o.open ||
          !["submitted", "shortlisted"].includes(a.stage) ||
          !action.trial ||
          !future(action.trial.start, now) ||
          !clean(action.trial.place)))
    )
      return fail("transition");
    const recipient = own ? o.owner : a.candidate;
    const text =
      action.stage === "invited"
        ? ["Invitation à un essai", "Trial invitation"]
        : action.stage === "confirmed"
          ? ["Essai confirmé", "Trial confirmed"]
          : ["Candidature mise à jour", "Application updated"];
    return notify(
      {
        ...base,
        applications: state.applications.map((x) =>
          x.id === a.id
            ? {
                ...x,
                stage: action.stage,
                ...(action.stage === "invited" ? { trial: action.trial, invitedAt:now } : {}),
              }
            : x,
        ),
      },
      recipient,
      text[0] + " : " + o.title,
      text[1] + ": " + o.title,
      own ? "/recrutement" : "/candidatures",
    );
  }
  if (action.type === "request") {
    if(state.appointments.filter(a=>a.requester===actor.id&&inMonth(a.createdAt)).length>=quota.appointments)return fail('quota');
    const pro = actors.find((a) => a.id === action.professional);
    if (
      !pro ||
      pro.category !== "Professionnel" ||
      actor.id === pro.id ||
      !allowed(pro.id)
    )
      return fail("unavailable");
    if (!appointmentPurposes.includes(action.purpose)) return fail("invalid");
    if (
      state.appointments.some(
        (a) =>
          a.id === action.id ||
          (a.requester === actor.id &&
            a.professional === pro.id &&
            a.status !== "cancelled" &&
            a.status !== "declined"),
      )
    )
      return fail("duplicate");
    return notify(
      {
        ...base,
        appointments: [
          {
            id: action.id,
            requester: actor.id,
            createdAt:now,
            professional: pro.id,
            purpose: action.purpose,
            status: "pending",
          },
          ...state.appointments,
        ],
      },
      pro.id,
      "Nouvelle demande de rendez-vous",
      "New appointment request",
      "/rendez-vous",
    );
  }
  if (action.type === "respond") {
    const a = state.appointments.find((a) => a.id === action.id);
    if (
      !a ||
      a.professional !== actor.id ||
      actor.category !== "Professionnel" ||
      !allowed(a.requester) ||
      a.status !== "pending"
    )
      return fail("forbidden");
    return notify(
      {
        ...base,
        appointments: state.appointments.map((x) =>
          x.id === a.id ? { ...x, status: action.accept ? "accepted" : "declined",respondedAt:now } : x,
        ),
      },
      a.requester,
      action.accept
        ? "Demande acceptée : choisissez un créneau"
        : "Demande de rendez-vous déclinée",
      action.accept ? "Request accepted: choose a time" : "Appointment request declined",
      "/rendez-vous",
    );
  }
  if (action.type === "slot") {
    const s = action.slot;
    if (actor.category !== "Professionnel" || s.professional !== actor.id)
      return fail("premium");
    if (!future(s.start, now) || !clean(s.place)) return fail("invalid");
    if (
      state.slots.some(
        (x) => x.id === s.id || (x.professional === actor.id && overlap(x.start, s.start)),
      )
    )
      return fail("overlap");
    return {
      ...base,
      slots: [...state.slots, s].sort((a, b) => Date.parse(a.start) - Date.parse(b.start)),
    };
  }
  if (action.type === "remove-slot") {
    if (
      !state.slots.some((s) => s.id === action.id && s.professional === actor.id) ||
      state.appointments.some((a) => a.slot === action.id && a.status === "booked")
    )
      return fail("forbidden");
    return { ...base, slots: state.slots.filter((s) => s.id !== action.id) };
  }
  if (action.type === "book") {
    const a = state.appointments.find((a) => a.id === action.id);
    const pro = actors.find((p) => p.id === a?.professional);
    if (
      !a ||
      !pro ||
      !allowed(pro.id) ||
      !availableSlots(state, a, actor.id, now).some((s) => s.id === action.slot)
    )
      return fail("slot");
    const chosen = state.slots.find((s) => s.id === action.slot)!;
    if(state.appointments.filter(x=>x.professional===pro!.id&&inMonth(x.bookedAt)).length>=limits(pro!.category,pro!.premium).appointmentsReceived)return fail('quota');
    if (
      state.appointments.some(
        (x) =>
          x.requester === actor.id &&
          x.status === "booked" &&
          state.slots.some((s) => s.id === x.slot && overlap(s.start, chosen.start)),
      )
    )
      return fail("overlap");
    return notify(
      notify(
        {
          ...base,
          appointments: state.appointments.map((x) =>
            x.id === a.id ? { ...x, status: "booked", slot: action.slot,bookedAt:now } : x,
          ),
        },
        pro.id,
        "Rendez-vous confirmé",
        "Appointment confirmed",
        "/rendez-vous",
      ),
      actor.id,
      "Votre rendez-vous est confirmé",
      "Your appointment is confirmed",
      "/rendez-vous",
    );
  }
  if (action.type === "cancel") {
    const a = state.appointments.find((a) => a.id === action.id);
    if (
      !a ||
      ![a.requester, a.professional].includes(actor.id) ||
      ["cancelled", "declined"].includes(a.status)
    )
      return fail("forbidden");
    return notify(
      {
        ...base,
        appointments: state.appointments.map((x) =>
          x.id === a.id ? { ...x, status: "cancelled" } : x,
        ),
      },
      actor.id === a.requester ? a.professional : a.requester,
      "Rendez-vous / demande annulé(e)",
      "Appointment / request cancelled",
      "/rendez-vous",
    );
  }
  return state;
}
const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
export function recommendations(state: CareerState, actor: Actor, blocked: string[]) {
  const wantedSports = state.preference.sport ? [state.preference.sport] : actor.sports;
  const city = state.preference.city || actor.city;
  function reasons(sports: string[], place: string, country: string) {
    const result: ("sport" | "city" | "country")[] = [];
    if (sports.some((s) => wantedSports.map(norm).includes(norm(s)))) result.push("sport");
    if (city && norm(city) === norm(place)) result.push("city");
    else if (actor.country && norm(actor.country) === norm(country)) result.push("country");
    return result;
  }
  const rank = (r: string[]) =>
    r.reduce((n, x) => n + (x === "sport" ? 4 : x === "city" ? 2 : 1), 0);
  return {
    people: members
      .filter(
        (m) => m.id !== actor.id && !blocked.includes(m.id) && !state.dismissed.includes(m.id),
      )
      .map((m) => ({
        member: m,
        reasons: reasons(
          [m.sport, ...(memberSports[m.id] || []).map((d) => d.sport)],
          m.city,
          m.country,
        ),
      }))
      .filter((x) => x.reasons.length)
      .sort((a, b) => rank(b.reasons) - rank(a.reasons))
      .slice(0, 3),
    offers: state.offers
      .filter(
        (o) =>
          o.open &&
          o.audience === actor.category &&
          o.owner !== actor.id &&
          !blocked.includes(o.owner) &&
          !state.dismissed.includes(o.id),
      )
      .map((o) => ({ offer: o, reasons: reasons([o.sport], o.city, o.country) }))
      .filter((x) => x.reasons.length)
      .sort((a, b) => rank(b.reasons) - rank(a.reasons))
      .slice(0, 2),
  };
}
