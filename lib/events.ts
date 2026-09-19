// Client-only demo rules. The production API must enforce the same permissions.
export const cities: Record<string, [number, number]> = {
  Liège: [50.6326, 5.5797],
  Bruxelles: [50.8503, 4.3517],
  Namur: [50.4674, 4.872],
  Charleroi: [50.4108, 4.4446],
  Louvain: [50.8798, 4.7005],
  Huy: [50.518, 5.24],
  Verviers: [50.589, 5.864],
};
export const suggestedTotals: Record<string, number> = {
  Football: 11,
  Tennis: 1,
  Padel: 2,
  Basketball: 6,
  Handball: 8,
  Rugby: 10,
  Volleyball: 6,
  Futsal: 10,
  Boxe: 2,
  Athlétisme: 2,
  Pickleball: 2,
  "Hockey sur gazon": 11,
};
export type Slot = { id: string; start: string; minutes: number };
export type Reply = {
  user: string;
  slots: string[];
  guests: string[];
  status: "approved" | "pending" | "declined";
};
export type Match = {
  id: string;
  title: string;
  sport: string;
  city: string;
  venue: string;
  host: string;
  hostPlays: boolean;
  minimum: number;
  capacity: number;
  open: boolean;
  plusOne: boolean;
  invitees: string[];
  slots: Slot[];
  replies: Reply[];
  confirmed?: string;
  cancelled?: boolean;
};
export type EventNotice = {
  id: string;
  recipient: string;
  text: string;
  href: string;
  read: boolean;
  kind:
    | "invitation"
    | "application"
    | "ready"
    | "confirmed"
    | "change"
    | "reminder"
    | "message";
};
export type EventState = {
  matches: Match[];
  notices: EventNotice[];
  error: string;
  lastCreated: string | null;
  banner: string | null;
  reminders: boolean;
  banners: boolean;
};
export type EventContext = { premium: boolean; city: string; now: number };
export type EventAction =
  | { type: "create"; match: Match }
  | { type: "reply"; id: string; slots: string[]; guests: string[] }
  | { type: "approve" | "decline"; id: string; user: string }
  | { type: "confirm"; id: string; slot: string }
  | { type: "cancel"; id: string }
  | { type: "simulate"; id: string; user: string; slot: string; guest: boolean }
  | { type: "demo-message" }
  | { type: "demo-invite" }
  | { type: "read"; id?: string }
  | { type: "settings"; reminders: boolean; banners: boolean }
  | { type: "tick" }
  | { type: "dismiss" }
  | { type: "reset" };
export function profileCity(value: string) {
  return (
    Object.keys(cities).find((c) =>
      value.toLowerCase().includes(c.toLowerCase()),
    ) || ""
  );
}
export function distanceKm(a: string, b: string) {
  if (!cities[a] || !cities[b]) return Infinity;
  const [x, y] = cities[a],
    [u, v] = cities[b],
    r = Math.PI / 180;
  const h =
    Math.sin(((u - x) * r) / 2) ** 2 +
    Math.cos(x * r) * Math.cos(u * r) * Math.sin(((v - y) * r) / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}
export function countPlayers(match: Match, slot: string) {
  return (
    Number(match.hostPlays) +
    match.replies
      .filter(
        (r) =>
          r.user !== match.host &&
          r.status === "approved" &&
          r.slots.includes(slot),
      )
      .reduce(
        (n, r) => n + 1 + Number(match.plusOne && r.guests.includes(slot)),
        0,
      )
  );
}
export function personalMatch(m: Match) {
  return (
    m.host === "me" ||
    m.invitees.includes("me") ||
    m.replies.some((r) => r.user === "me")
  );
}
export function canViewMatch(m: Match, ctx: EventContext) {
  return (
    m.host === "me" ||
    m.invitees.includes("me") ||
    m.replies.some((r) => r.user === "me" && r.status === "approved") ||
    (ctx.premium &&
      m.open &&
      !m.cancelled &&
      distanceKm(ctx.city, m.city) <= 50)
  );
}
export function createEventState(now = Date.now()): EventState {
  const day = new Date(now);
  day.setUTCHours(17, 0, 0, 0);
  const slot = (id: string, days: number): Slot => ({
    id,
    start: new Date(day.getTime() + days * 86400000).toISOString(),
    minutes: 90,
  });
  return {
    matches: [
      {
        id: "invitation-padel",
        title: "Un padel après le boulot ?",
        sport: "Padel",
        city: "Liège",
        venue: "Club Arena · terrain démo",
        host: "noah",
        hostPlays: true,
        minimum: 4,
        capacity: 4,
        open: false,
        plusOne: true,
        invitees: ["me", "lea"],
        slots: [slot("a", 2), slot("b", 3)],
        replies: [
          { user: "lea", slots: ["a", "b"], guests: [], status: "approved" },
        ],
      },
      {
        id: "open-basket",
        title: "Un match, de nouvelles rencontres.",
        sport: "Basketball",
        city: "Liège",
        venue: "Parc sportif · terrain démo",
        host: "noah",
        hostPlays: true,
        minimum: 6,
        capacity: 10,
        open: true,
        plusOne: true,
        invitees: [],
        slots: [slot("c", 4)],
        replies: [],
      },
      {
        id: "open-tennis",
        title: "Tennis du week-end",
        sport: "Tennis",
        city: "Bruxelles",
        venue: "Club Arena · court démo",
        host: "lea",
        hostPlays: true,
        minimum: 2,
        capacity: 4,
        open: true,
        plusOne: false,
        invitees: [],
        slots: [slot("d", 5)],
        replies: [],
      },
    ],
    notices: [
      {
        id: "invite-seed",
        recipient: "me",
        text: "Noah vous invite à un padel. Deux créneaux proposés.",
        href: "/match?id=invitation-padel",
        read: false,
        kind: "invitation",
      },
    ],
    error: "",
    lastCreated: null,
    banner: null,
    reminders: true,
    banners: true,
  };
}
function notice(
  s: EventState,
  id: string,
  recipient: string,
  text: string,
  href: string,
  kind: EventNotice["kind"],
) {
  if (s.notices.some((n) => n.id === id)) return;
  s.notices.unshift({ id, recipient, text, href, kind, read: false });
  if (recipient === "me" && s.banners) s.banner = id;
}
function participants(m: Match) {
  return [...new Set([m.host, ...m.invitees, ...m.replies.map((r) => r.user)])];
}
export function eventReducer(
  state: EventState,
  payload: { action: EventAction; context: EventContext },
): EventState {
  const { action: a, context: ctx } = payload;
  if (a.type === "reset") return createEventState(ctx.now);
  const s: EventState = structuredClone(state);
  s.error = "";
  const fail = (error: string) => ({ ...state, error });
  if (a.type === "dismiss") {
    s.banner = null;
    return s;
  }
  if (a.type === "read") {
    s.notices.forEach((n) => {
      if (n.recipient === "me" && (!a.id || n.id === a.id)) n.read = true;
    });
    return s;
  }
  if (a.type === "settings") {
    s.reminders = a.reminders;
    s.banners = a.banners;
    if (!a.banners) s.banner = null;
    return s;
  }
  if (a.type === "demo-invite") {
    const m = createEventState(ctx.now).matches[0];
    m.id = `invitation-demo-${ctx.now}`;
    if (s.matches.some((e) => e.id === m.id)) return s;
    s.matches.unshift(m);
    notice(
      s,
      `invite-${m.id}`,
      "me",
      `Noah vous invite : ${m.title}`,
      `/match?id=${m.id}`,
      "invitation",
    );
    return s;
  }
  if (a.type === "demo-message") {
    notice(
      s,
      `message-${ctx.now}`,
      "me",
      "Nouveau message de démonstration. Ouvrir la messagerie.",
      "/messages",
      "message",
    );
    return s;
  }
  if (a.type === "tick") {
    if (!s.reminders) return state;
    s.matches
      .filter((m) => m.confirmed && !m.cancelled)
      .forEach((m) => {
        const slot = m.slots.find((t) => t.id === m.confirmed)!;
        const left = Date.parse(slot.start) - ctx.now;
        const attends =
          (m.host === "me" && m.hostPlays) ||
          m.replies.some(
            (r) =>
              r.user === "me" &&
              r.status === "approved" &&
              r.slots.includes(slot.id),
          );
        if (attends && left > 0 && left <= 86400000) {
          const interval = left <= 7200000 ? "2h" : "24h";
          notice(
            s,
            `reminder-${m.id}-${slot.id}-${interval}`,
            "me",
            `${m.title} commence dans moins de ${interval}.`,
            `/match?id=${m.id}`,
            "reminder",
          );
        }
      });
    return s.notices.length === state.notices.length ? state : s;
  }
  if (a.type === "create") {
    if (!ctx.premium)
      return fail("Un abonnement est nécessaire pour organiser un match.");
    const m = structuredClone(a.match);
    if (
      !m.title.trim() ||
      !m.venue.trim() ||
      !cities[m.city] ||
      !suggestedTotals[m.sport]
    )
      return fail("Renseignez le titre, le sport, la ville et le lieu.");
    if (
      !Number.isInteger(m.minimum) ||
      m.minimum < 1 ||
      !Number.isInteger(m.capacity) ||
      m.capacity < m.minimum ||
      m.capacity > 100
    )
      return fail(
        "L’effectif total doit être compris entre 1 et 100, avec un maximum supérieur ou égal au minimum.",
      );
    if (
      !m.slots.length ||
      m.slots.length > 6 ||
      m.slots.some(
        (t) =>
          !Number.isFinite(Date.parse(t.start)) ||
          Date.parse(t.start) <= ctx.now ||
          !Number.isInteger(t.minutes) ||
          t.minutes < 15 ||
          t.minutes > 720,
      ) ||
      new Set(m.slots.map((t) => t.start)).size !== m.slots.length ||
      new Set(m.slots.map((t) => t.id)).size !== m.slots.length
    )
      return fail(
        "Proposez 1 à 6 créneaux futurs et différents, d’une durée de 15 à 720 minutes.",
      );
    if (!m.open && !m.invitees.length)
      return fail(
        "Invitez au moins un contact ou ouvrez le match aux membres proches.",
      );
    if (s.matches.some((e) => e.id === m.id))
      return fail("Ce match existe déjà.");
    m.host = "me";
    m.replies = [];
    m.confirmed = undefined;
    m.cancelled = false;
    m.invitees = [...new Set(m.invitees.filter((id) => id !== "me"))];
    s.matches.unshift(m);
    s.lastCreated = m.id;
    m.invitees.forEach((id) =>
      notice(
        s,
        `invite-${m.id}-${id}`,
        id,
        `Vous êtes invité : ${m.title}`,
        `/match?id=${m.id}`,
        "invitation",
      ),
    );
    notice(
      s,
      `created-${m.id}`,
      "me",
      "Match créé. Les invitations sont simulées dans cette visite.",
      `/match?id=${m.id}`,
      "change",
    );
    m.slots
      .filter((slot) => countPlayers(m, slot.id) >= m.minimum)
      .forEach((slot) =>
        notice(
          s,
          `ready-${m.id}-${slot.id}-${ctx.now}`,
          "me",
          `Le minimum de participants est atteint pour ${m.title}. Vous pouvez confirmer un créneau.`,
          `/match?id=${m.id}`,
          "ready",
        ),
      );
    return s;
  }
  const m = s.matches.find((e) => e.id === a.id);
  if (!m || !canViewMatch(m, ctx))
    return fail(
      "Ce match n’est pas accessible avec votre compte ou votre ville.",
    );
  if (m.cancelled) return fail("Ce match a été annulé.");
  const before = new Map(m.slots.map((t) => [t.id, countPlayers(m, t.id)]));
  const href = `/match?id=${m.id}`;
  if (a.type === "cancel") {
    if (m.host !== "me") return fail("Seul l’organisateur peut annuler.");
    m.cancelled = true;
    participants(m).forEach((id) =>
      notice(
        s,
        `cancel-${m.id}-${id}`,
        id,
        `Match annulé : ${m.title}`,
        href,
        "change",
      ),
    );
    return s;
  }
  if (a.type === "confirm") {
    if (m.host !== "me") return fail("Seul l’organisateur peut confirmer.");
    const slot = m.slots.find((t) => t.id === a.slot);
    if (
      m.confirmed ||
      !slot ||
      Date.parse(slot.start) <= ctx.now ||
      countPlayers(m, a.slot) < m.minimum ||
      countPlayers(m, a.slot) > m.capacity
    )
      return fail(
        "Le créneau doit être futur, atteindre le minimum et respecter la capacité.",
      );
    m.confirmed = a.slot;
    participants(m).forEach((id) => {
      const selected =
        id === m.host ||
        m.replies.some(
          (r) =>
            r.user === id &&
            r.status === "approved" &&
            r.slots.includes(a.slot),
        );
      notice(
        s,
        `confirmed-${m.id}-${id}`,
        id,
        selected
          ? `Créneau confirmé : ${m.title}`
          : `Un autre créneau a été retenu pour ${m.title}. Vous n’êtes pas inscrit.`,
        href,
        "confirmed",
      );
    });
    return s;
  }
  if (a.type === "approve" || a.type === "decline") {
    if (m.host !== "me" || m.confirmed)
      return fail(
        "Seul l’organisateur peut traiter une demande avant confirmation.",
      );
    const r = m.replies.find(
      (r) => r.user === a.user && r.status === "pending",
    );
    if (!r) return fail("Cette demande a déjà été traitée.");
    r.status = a.type === "approve" ? "approved" : "declined";
    notice(
      s,
      `decision-${m.id}-${a.user}-${ctx.now}`,
      a.user,
      a.type === "approve"
        ? `Votre demande a été acceptée : ${m.title}`
        : `Votre demande n’a pas été retenue : ${m.title}`,
      href,
      "change",
    );
  }
  if (a.type === "reply" || a.type === "simulate") {
    if (
      a.type === "simulate" &&
      (m.host !== "me" || !ctx.premium || a.user === "me" || m.confirmed)
    )
      return fail(
        "Simulation réservée à l’organisateur Premium avant confirmation.",
      );
    const user = a.type === "reply" ? "me" : a.user;
    if (a.type === "simulate" && !m.open && !m.invitees.includes(user))
      return fail("Ce membre n’est pas invité à ce match privé.");
    if (user === m.host)
      return fail("L’organisateur est déjà compté via « Je participe ».");
    const slots = a.type === "reply" ? [...new Set(a.slots)] : [a.slot];
    const guests =
      a.type === "reply" ? [...new Set(a.guests)] : a.guest ? [a.slot] : [];
    if (
      slots.some(
        (id) =>
          !m.slots.some((t) => t.id === id && Date.parse(t.start) > ctx.now),
      ) ||
      guests.some((id) => !slots.includes(id)) ||
      (guests.length && !m.plusOne)
    )
      return fail("Vérifiez les créneaux et les accompagnants.");
    const previous = m.replies.find((r) => r.user === user);
    if (m.confirmed && (slots.length > 0 || !previous))
      return fail(
        "Le créneau est confirmé. Seul un désistement est encore possible.",
      );
    const direct = m.invitees.includes(user);
    if (
      !direct &&
      a.type === "reply" &&
      slots.length &&
      (!ctx.premium || distanceKm(ctx.city, m.city) > 50)
    )
      return fail(
        "La candidature à un match ouvert nécessite Premium et une ville dans les 50 km.",
      );
    const status =
      direct || previous?.status === "approved" ? "approved" : "pending";
    m.replies = m.replies.filter((r) => r.user !== user);
    if (slots.length) m.replies.push({ user, slots, guests, status });
    notice(
      s,
      `reply-${m.id}-${user}-${ctx.now}`,
      m.host,
      slots.length
        ? status === "pending"
          ? `Une candidature attend votre accord : ${m.title}`
          : `Une disponibilité a été mise à jour : ${m.title}`
        : `Un participant s’est désisté : ${m.title}`,
      href,
      status === "pending" ? "application" : "change",
    );
  }
  if (m.slots.some((t) => countPlayers(m, t.id) > m.capacity))
    return fail(
      "Ce choix dépasserait le nombre total de places. Retirez le +1 ou choisissez un autre créneau.",
    );
  for (const slot of m.slots) {
    const total = countPlayers(m, slot.id);
    if (
      !m.confirmed &&
      total >= m.minimum &&
      (before.get(slot.id) || 0) < m.minimum
    )
      notice(
        s,
        `ready-${m.id}-${slot.id}-${ctx.now}`,
        m.host,
        `${total} participants disponibles ! Vous pouvez confirmer ${m.title}.`,
        href,
        "ready",
      );
    if (
      m.confirmed === slot.id &&
      total < m.minimum &&
      (before.get(slot.id) || 0) >= m.minimum
    )
      notice(
        s,
        `short-${m.id}-${ctx.now}`,
        m.host,
        `Effectif incomplet pour ${m.title}. Contactez les participants ou annulez le match.`,
        href,
        "change",
      );
  }
  return s;
}
