import type { Category } from "./model";
import type { DirectoryFilters } from "./directory";
import { limits } from "./entitlements.ts";
import { moderateText } from "./trust.ts";
import { validClassification, type PostClassification } from './community.ts';

export type Search = {
  id: string;
  name: string;
  kind: "people" | "opportunities" | "events";
  filters: Record<string, string>;
  alerts: boolean;
  seen: string[];
};
export type Schedule = PostClassification & {
  id: string;
  text: string;
  sport: string;
  image?: string;
  video?: string;
  start: string;
  status: "planned" | "published" | "cancelled";
};
export type TalentList = {
  id: string;
  name: string;
  profiles: { id: string; note: string; step: string; next: string }[];
};
export type Session = {
  id: string;
  title: string;
  start: string;
  place: string;
  capacity: number;
  participants: { id: string; status: "invited" | "accepted" | "declined" }[];
};
export type Team = {
  id: string;
  name: string;
  sport: string;
  description: string;
  need: string;
  eventIds: string[];
  links: { id: string; role: string; status: "pending" | "confirmed" | "declined" }[];
};
export type Manager = {
  id: string;
  name: string;
  role: "owner" | "admin" | "recruiter" | "viewer";
  status: "invited" | "active";
};
export type Interview = {
  id: string;
  candidate: string;
  staff: string[];
  start: string;
  place: string;
  accepted: string[];
  status: "proposed" | "confirmed" | "cancelled";
};
export type Invitation = {
  id: string;
  name: string;
  status: "invited" | "registered" | "verified" | "qualified";
};
export type ExtensionNotice = { id: string; text: string; href: string; read: boolean };
export type Workspace = {
  searches: Search[];
  schedules: Schedule[];
  lists: TalentList[];
  sessions: Session[];
  teams: Team[];
  managers: Manager[];
  activeManager: string;
  assignments: Record<string, { manager: string; notes: { author: string; text: string }[] }>;
  interviews: Interview[];
  invitations: Invitation[];
  calendar: { connected: boolean; provider: string; reminder: number };
  visits: {
    id: string;
    name: string;
    consent: boolean;
    at: number;
    kind: "visit" | "interaction";
  }[];
  notices: ExtensionNotice[];
};
export type ExtensionState = { workspaces: Record<string, Workspace>; error: string };
export function emptyWorkspace(): Workspace {
  return {
    searches: [],
    schedules: [],
    lists: [],
    sessions: [],
    teams: [],
    managers: [{ id: "owner", name: "Propriétaire", role: "owner", status: "active" }],
    activeManager: "owner",
    assignments: {},
    interviews: [],
    invitations: [],
    calendar: { connected: false, provider: "Google Agenda", reminder: 60 },
    visits: [],
    notices: [],
  };
}
export function createExtensionState(): ExtensionState {
  return { workspaces: {}, error: "" };
}
export type ExtensionContext = { key: string; category: Category; premium: boolean; now: number };
export function workspace(s: ExtensionState, key: string) {
  return s.workspaces[key] || emptyWorkspace();
}
export function roleCan(w: Workspace, permission: "manage" | "recruit" | "edit") {
  const m = w.managers.find((m) => m.id === w.activeManager && m.status === "active");
  return (
    !!m &&
    (m.role === "owner" ||
      m.role === "admin" ||
      (permission === "recruit" && m.role === "recruiter"))
  );
}
export type ExtensionAction =
  | { type: "reset" | "clear" }
  | { type: "search"; value: Search }
  | { type: "search-remove"; id: string }
  | { type: "search-check"; id: string; results: string[]; initialize?: boolean }
  | { type: "schedule"; value: Schedule }
  | { type: "schedule-status"; id: string; status: "published" | "cancelled" }
  | { type: "list"; id: string; name: string }
  | { type: "list-remove"; id: string }
  | {
      type: "talent";
      list: string;
      id: string;
      remove?: boolean;
      note?: string;
      step?: string;
      next?: string;
    }
  | { type: "session"; value: Session }
  | { type: "session-reply"; id: string; person: string; accept: boolean }
  | { type: "session-remove"; id: string }
  | { type: "team"; value: Team }
  | { type: "team-remove"; id: string }
  | { type: "link"; team: string; id: string; role: string }
  | { type: "link-reply"; team: string; id: string; accept: boolean }
  | { type: "manager"; value: Manager }
  | { type: "manager-activate" | "manager-remove" | "manager-switch"; id: string }
  | { type: "assignment"; id: string; manager: string; note: string }
  | { type: "interview"; value: Interview }
  | { type: "interview-reply"; id: string; person: string; accept: boolean }
  | { type: "invitation"; id: string; name: string }
  | { type: "invitation-progress"; id: string }
  | { type: "calendar"; provider: string; connected: boolean; reminder: number }
  | { type: "visit"; id: string; name: string; consent: boolean; kind: "visit" | "interaction" }
  | { type: "notice"; id: string; text: string; href: string }
  | { type: "read"; id?: string };

const clean = (s: string, max = 160) => !!s.trim() && s.length <= max && !moderateText(s);
const future = (s: string, now: number) => Number.isFinite(Date.parse(s)) && Date.parse(s) > now;
export function extensionReducer(
  s: ExtensionState,
  command: { action: ExtensionAction; context: ExtensionContext },
): ExtensionState {
  const { action: a, context: c } = command;
  if (a.type === "reset") return createExtensionState();
  if (a.type === "clear") return { ...s, error: "" };
  const w = structuredClone(workspace(s, c.key)),
    l = limits(c.category, c.premium);
  const fail = (error: string) => ({ ...s, error });
  const done = () => ({ ...s, error: "", workspaces: { ...s.workspaces, [c.key]: w } });
  const note = (id: string, text: string, href = "/outils") => {
    if (!w.notices.some((n) => n.id === id)) w.notices.unshift({ id, text, href, read: false });
  };
  const collective = c.category === "Organisation",
    professional = c.category === "Professionnel";
  const premiumActions = ["schedule", "session", "calendar", "assignment", "interview"];
  if (premiumActions.includes(a.type) && !c.premium)
    return fail("Cette extension nécessite Premium. Votre contenu existant reste conservé.");
  const management = ["manager", "manager-activate", "manager-remove"];
  const recruitment = ["list", "talent", "session", "session-remove", "assignment", "interview"];
  if (collective && management.includes(a.type) && !roleCan(w, "manage"))
    return fail("Ce rôle ne peut pas gérer les accès.");
  if (collective && recruitment.includes(a.type) && !roleCan(w, "recruit"))
    return fail("Ce rôle ne peut pas modifier le recrutement.");
  if (
    collective &&
    ["team", "team-remove", "link", "schedule", "calendar", "invitation"].includes(a.type) &&
    !roleCan(w, "edit")
  )
    return fail("Ce rôle dispose uniquement des accès autorisés à sa fonction.");
  switch (a.type) {
    case "search": {
      if (!clean(a.value.name) || !["people", "opportunities", "events"].includes(a.value.kind))
        return fail("Nommez votre recherche.");
      const exists = w.searches.some((x) => x.id === a.value.id);
      if (!exists && w.searches.length >= l.searches)
        return fail(`Limite atteinte : ${l.searches} recherche(s).`);
      if (a.value.alerts && !c.premium)
        return fail("Les alertes de nouveautés nécessitent Premium.");
      w.searches = [
        ...w.searches.filter((x) => x.id !== a.value.id),
        { ...a.value, name: a.value.name.trim() },
      ];
      break;
    }
    case "search-remove":
      w.searches = w.searches.filter((x) => x.id !== a.id);
      break;
    case "search-check": {
      const q = w.searches.find((x) => x.id === a.id);
      if (!q) return s;
      const fresh = a.results.filter((id) => !q.seen.includes(id));
      if (!a.initialize && q.alerts && c.premium && fresh.length)
        note(
          `search-${q.id}-${fresh.sort().join("-")}`,
          `${q.name} : ${fresh.length} nouvelle(s) correspondance(s).`,
          "/recherches",
        );
      q.seen = [...new Set([...q.seen, ...a.results])];
      break;
    }
    case "schedule":
      if (!clean(a.value.text, 1200) || !clean(a.value.sport) || !validClassification(a.value) || !future(a.value.start, c.now))
        return fail("Indiquez un contenu valide et une date future.");
      if (w.schedules.some((x) => x.id === a.value.id))
        return fail("Cette publication existe déjà.");
      w.schedules.unshift({ ...a.value, status: "planned" });
      break;
    case "schedule-status": {
      const x = w.schedules.find((x) => x.id === a.id);
      if (!x || x.status !== "planned") return s;
      if (a.status === "published" && !c.premium)
        return fail("Réactivez Premium pour diffuser cette publication programmée.");
      x.status = a.status;
      break;
    }
    case "list":
      if (!clean(a.name) || !l.lists)
        return fail("Les listes de talents sont réservées aux professionnels et collectifs.");
      if (w.lists.length >= l.lists || w.lists.some((x) => x.id === a.id))
        return fail(`Limite : ${l.lists} liste(s).`);
      w.lists.push({ id: a.id, name: a.name.trim(), profiles: [] });
      break;
    case "list-remove":
      w.lists = w.lists.filter((x) => x.id !== a.id);
      break;
    case "talent": {
      const list = w.lists.find((x) => x.id === a.list);
      if (!list) return fail("Choisissez une liste.");
      if (a.remove) {
        list.profiles = list.profiles.filter((x) => x.id !== a.id);
        break;
      }
      let p = list.profiles.find((x) => x.id === a.id);
      if (!p) {
        if (w.lists.reduce((n, l) => n + l.profiles.length, 0) >= l.talents)
          return fail(`Limite totale : ${l.talents} profils.`);
        p = { id: a.id, note: "", step: "À contacter", next: "" };
        list.profiles.push(p);
      }
      if (a.note !== undefined || a.step !== undefined || a.next !== undefined) {
        if (!c.premium) return fail("Les notes et le suivi des démarches nécessitent Premium.");
        if (
          (a.note || "").length > 1200 ||
          moderateText(a.note || "") ||
          (a.step || "").length > 80
        )
          return fail("Note invalide.");
        if (a.next && !Number.isFinite(Date.parse(a.next))) return fail("Date de suivi invalide.");
        p.note = a.note ?? p.note;
        p.step = a.step ?? p.step;
        p.next = a.next ?? p.next;
      }
      break;
    }
    case "session":
      if (c.category === "Sportif")
        return fail("Les sessions sont organisées par un professionnel ou un collectif.");
      if (
        !clean(a.value.title) ||
        !clean(a.value.place) ||
        !future(a.value.start, c.now) ||
        !Number.isInteger(a.value.capacity) ||
        a.value.capacity < 1 ||
        a.value.capacity > 100 ||
        a.value.participants.length > a.value.capacity ||
        new Set(a.value.participants.map((p) => p.id)).size !== a.value.participants.length
      )
        return fail("Vérifiez la date, le lieu, la capacité et les participants.");
      if (w.sessions.some((x) => x.id === a.value.id)) return fail("Cette session existe déjà.");
      w.sessions.push(a.value);
      note(
        `session-${a.value.id}`,
        `Invitations préparées pour ${a.value.title} (simulation).`,
        "/essais-groupes",
      );
      break;
    case "session-reply": {
      const session = w.sessions.find((x) => x.id === a.id),
        p = session?.participants.find((p) => p.id === a.person);
      if (!session || !p || !future(session.start, c.now))
        return fail("Invitation introuvable ou passée.");
      p.status = a.accept ? "accepted" : "declined";
      note(
        `reply-${a.id}-${a.person}-${p.status}`,
        `Réponse simulée reçue pour ${session.title}.`,
        "/essais-groupes",
      );
      break;
    }
    case "session-remove":
      w.sessions = w.sessions.filter((x) => x.id !== a.id);
      break;
    case "team": {
      if (
        !collective ||
        !clean(a.value.name) ||
        !clean(a.value.sport) ||
        a.value.description.length > 600 ||
        moderateText(a.value.description)
      )
        return fail("Renseignez une équipe et sa discipline.");
      if (!c.premium && (a.value.need || a.value.eventIds.length))
        return fail("La gestion des besoins et événements par équipe nécessite Premium.");
      const existing = w.teams.find((x) => x.id === a.value.id);
      w.teams = [
        ...w.teams.filter((x) => x.id !== a.value.id),
        { ...a.value, links: existing?.links || [] },
      ];
      break;
    }
    case "team-remove":
      w.teams = w.teams.filter((x) => x.id !== a.id);
      break;
    case "link": {
      const t = w.teams.find((t) => t.id === a.team);
      if (!t || !clean(a.role) || t.links.some((p) => p.id === a.id))
        return fail("Relation déjà présente ou équipe introuvable.");
      t.links.push({ id: a.id, role: a.role, status: "pending" });
      break;
    }
    case "link-reply": {
      const t = w.teams.find((t) => t.id === a.team),
        p = t?.links.find((p) => p.id === a.id);
      if (!p) return fail("Relation introuvable.");
      p.status = a.accept ? "confirmed" : "declined";
      break;
    }
    case "manager":
      if (
        !collective ||
        !clean(a.value.name) ||
        !["admin", "recruiter", "viewer"].includes(a.value.role) ||
        w.managers.some((x) => x.id === a.value.id)
      )
        return fail("Gestionnaire invalide.");
      if (w.managers.length >= l.managers)
        return fail(`Votre offre comprend ${l.managers} gestionnaire(s), propriétaire inclus.`);
      w.managers.push({ ...a.value, status: "invited" });
      break;
    case "manager-activate": {
      const m = w.managers.find((m) => m.id === a.id);
      if (m) m.status = "active";
      break;
    }
    case "manager-remove":
      if (a.id === "owner") return fail("Le propriétaire ne peut pas être retiré.");
      w.managers = w.managers.filter((m) => m.id !== a.id);
      if (w.activeManager === a.id) w.activeManager = "owner";
      break;
    case "manager-switch":
      if (!w.managers.some((m) => m.id === a.id && m.status === "active"))
        return fail("Cet accès n’est pas actif.");
      w.activeManager = a.id;
      break;
    case "assignment": {
      if (
        !collective ||
        !w.managers.some(
          (m) => m.id === a.manager && m.status === "active" && m.role !== "viewer",
        ) ||
        a.note.length > 1200 ||
        moderateText(a.note)
      )
        return fail("Choisissez un gestionnaire actif et une note valide.");
      const previous = w.assignments[a.id];
      w.assignments[a.id] = {
        manager: a.manager,
        notes: [
          ...(previous?.notes || []),
          ...(a.note.trim() ? [{ author: w.activeManager, text: a.note.trim() }] : []),
        ],
      };
      break;
    }
    case "interview": {
      const x = a.value;
      if (
        !collective ||
        !clean(x.place) ||
        !x.candidate ||
        !future(x.start, c.now) ||
        !x.staff.length ||
        !x.staff.every((id) => w.managers.some((m) => m.id === id && m.status === "active")) ||
        w.interviews.some((i) => i.id === x.id)
      )
        return fail("Choisissez un candidat, une date future et un staff actif.");
      if (
        w.interviews.some(
          (i) =>
            i.status !== "cancelled" &&
            Math.abs(Date.parse(i.start) - Date.parse(x.start)) < 3600000 &&
            (i.candidate === x.candidate || i.staff.some((id) => x.staff.includes(id))),
        )
      )
        return fail("Ce créneau chevauche un entretien du candidat ou du staff (1 h).");
      w.interviews.push({ ...x, accepted: [], status: "proposed" });
      break;
    }
    case "interview-reply": {
      const i = w.interviews.find((i) => i.id === a.id);
      if (!i || i.status !== "proposed" || ![i.candidate, ...i.staff].includes(a.person))
        return fail("Invitation indisponible.");
      if (!a.accept) i.status = "cancelled";
      else {
        i.accepted = [...new Set([...i.accepted, a.person])];
        if ([i.candidate, ...i.staff].every((id) => i.accepted.includes(id)))
          i.status = "confirmed";
      }
      break;
    }
    case "invitation":
      if (!l.referral || !clean(a.name) || w.invitations.some((i) => i.id === a.id))
        return fail("Invitation indisponible pour cette offre ou nom invalide.");
      w.invitations.push({ id: a.id, name: a.name, status: "invited" });
      break;
    case "invitation-progress": {
      if (collective && !c.premium)
        return fail("Le suivi détaillé des activations nécessite Premium.");
      const i = w.invitations.find((i) => i.id === a.id);
      if (i) {
        const steps: Invitation["status"][] = ["invited", "registered", "verified", "qualified"];
        i.status = steps[Math.min(3, steps.indexOf(i.status) + 1)];
      }
      break;
    }
    case "calendar":
      if (
        !["Google Agenda", "Outlook", "Apple Calendrier"].includes(a.provider) ||
        ![15, 60, 1440].includes(a.reminder)
      )
        return fail("Réglage d’agenda invalide.");
      w.calendar = { provider: a.provider, connected: a.connected, reminder: a.reminder };
      break;
    case "visit":
      if (w.visits.some((v) => v.id === a.id)) return s;
      w.visits.push({ ...a, at: c.now });
      break;
    case "notice":
      note(a.id, a.text, a.href);
      break;
    case "read":
      w.notices = w.notices.map((n) => (!a.id || n.id === a.id ? { ...n, read: true } : n));
      break;
  }
  return done();
}

export function savedDirectory(filters: Record<string, string>): DirectoryFilters {
  return { ...filters } as DirectoryFilters;
}
export function weeklyDates(start: string, count: number) {
  if (!Number.isInteger(count) || count < 1 || count > 12 || !Number.isFinite(Date.parse(start)))
    return [];
  // Calendar weeks in the browser's local zone preserve the local wall-clock hour over DST.
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i * 7);
    return d.toISOString();
  });
}
export function calendarFile(
  items: { id: string; title: string; start: string; minutes: number; place: string }[],
  reminder = 60,
) {
  const escape = (s: string) =>
    s.replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
  const date = (s: string) =>
    new Date(s)
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Opportunity Players//Demo//FR",
    "CALSCALE:GREGORIAN",
    ...items.flatMap((i) => [
      "BEGIN:VEVENT",
      `UID:${escape(i.id)}@opportunity-players-demo`,
      `DTSTAMP:${date(new Date().toISOString())}`,
      `DTSTART:${date(i.start)}`,
      `DTEND:${date(new Date(Date.parse(i.start) + i.minutes * 60000).toISOString())}`,
      `SUMMARY:${escape(i.title)}`,
      `LOCATION:${escape(i.place)}`,
      "DESCRIPTION:Événement fictif de démonstration.",
      "BEGIN:VALARM",
      `TRIGGER:-PT${reminder}M`,
      "ACTION:DISPLAY",
      "DESCRIPTION:Rappel Opportunity Players",
      "END:VALARM",
      "END:VEVENT",
    ]),
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}
