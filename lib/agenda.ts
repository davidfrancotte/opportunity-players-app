import type { EventState } from "./events";
import type { CareerState } from "./career";
import type { Workspace } from "./extensions";

export type AgendaCategory = "match" | "professional" | "spectator";
export type AgendaEntry = {
  id: string;
  title: string;
  start: string;
  place: string;
  category: AgendaCategory;
  href?: string;
  spectatorId?: string;
  minutes: number;
};
// All date grouping uses the same timezone as the displayed event times.
export function agendaDay(start: string | number | Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Brussels",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(start));
}
export function monthDays(month: string): (string | null)[] {
  const [year, number] = month.split("-").map(Number);
  const first = new Date(Date.UTC(year, number - 1, 1));
  const offset = (first.getUTCDay() + 6) % 7;
  const count = new Date(Date.UTC(year, number, 0)).getUTCDate();
  return Array.from({ length: Math.ceil((offset + count) / 7) * 7 }, (_, i) =>
    i < offset || i >= offset + count
      ? null
      : `${month}-${String(i - offset + 1).padStart(2, "0")}`,
  );
}
export function agendaEntries(
  events: EventState,
  career: CareerState,
  w: Workspace,
  actor: string,
  name: (id: string) => string,
): AgendaEntry[] {
  const items: AgendaEntry[] = [];
  for (const m of events.matches) {
    if (
      m.cancelled ||
      !m.confirmed ||
      !(
        m.host === "me" ||
        m.replies.some(
          (r) => r.user === "me" && r.status === "approved" && r.slots.includes(m.confirmed!),
        )
      )
    )
      continue;
    const slot = m.slots.find((s) => s.id === m.confirmed);
    if (slot)
      items.push({
        id: `match-${m.id}`,
        title: m.title,
        start: slot.start,
        minutes: slot.minutes,
        place: `${m.venue} · ${m.city}`,
        category: "match",
        href: `/match?id=${encodeURIComponent(m.id)}`,
      });
  }
  for (const a of career.appointments) {
    if (a.status !== "booked" || ![a.requester, a.professional].includes(actor)) continue;
    const slot = career.slots.find((s) => s.id === a.slot);
    if (slot)
      items.push({
        id: `appointment-${a.id}`,
        title: name(a.requester === actor ? a.professional : a.requester),
        start: slot.start,
        minutes: 30,
        place: slot.place,
        category: "professional",
        href: "/rendez-vous",
      });
  }
  for (const a of career.applications) {
    if (
      a.stage !== "confirmed" ||
      !a.trial ||
      !(a.candidate === actor || career.offers.some((o) => o.id === a.offerId && o.owner === actor))
    )
      continue;
    items.push({
      id: `trial-${a.id}`,
      title: `Essai · ${a.name}`,
      start: a.trial.start,
      minutes: 60,
      place: a.trial.place,
      category: "professional",
      href: a.candidate === actor ? "/candidatures" : "/recrutement",
    });
  }
  for (const s of w.sessions)
    items.push({
      id: `session-${s.id}`,
      title: `Essai · ${s.title}`,
      start: s.start,
      minutes: 90,
      place: s.place,
      category: "professional",
      href: "/essais-groupes",
    });
  for (const i of w.interviews.filter((i) => i.status === "confirmed"))
    items.push({
      id: `interview-${i.id}`,
      title: `Entretien · ${name(i.candidate)}`,
      start: i.start,
      minutes: 60,
      place: i.place,
      category: "professional",
      href: "/recrutement",
    });
  for (const e of events.spectatorEvents.filter((e) => events.spectatorInterests.includes(e.id)))
    items.push({ ...e, id: `spectator-${e.id}`, category: "spectator", spectatorId: e.id });
  return items
    .filter((i) => Number.isFinite(Date.parse(i.start)))
    .sort((a, b) => Date.parse(a.start) - Date.parse(b.start));
}
export function filterAgenda(
  items: AgendaEntry[],
  month: string,
  category: AgendaCategory | "all",
  day: string | null = null,
) {
  return items.filter(
    (e) =>
      agendaDay(e.start).startsWith(month) &&
      (!day || agendaDay(e.start) === day) &&
      (category === "all" || e.category === category),
  );
}
