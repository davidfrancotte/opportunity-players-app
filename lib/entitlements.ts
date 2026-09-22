import type { Category } from "./model";

// Workbook supplied by the owner, 20/09/2026. The subsequent clarification keeps
// comments, reactions and shares free. Production must enforce these on the API.
export function limits(category: Category, premium: boolean) {
  const player = category === "Sportif",
    pro = category === "Professionnel";
  return {
    publish: premium || pro,
    searches: premium ? (player ? 10 : pro ? 20 : 30) : 1,
    contacts: premium ? (player ? 30 : pro ? 100 : 200) : player || pro ? 3 : 5,
    photos: premium ? (player || pro ? 50 : 30) : player || pro ? 3 : 5,
    documents: premium ? 20 : player || pro ? 0 : 1,
    videos: premium ? (player ? 20 : pro ? 30 : 10) : player || pro ? 0 : 1,
    videoSeconds: !player && !pro ? (premium ? 180 : 60) : 300,
    applications: premium ? 30 : 0,
    appointments: premium ? (player || pro ? 15 : 20) : pro ? 3 : 1,
    appointmentsReceived: premium ? 100 : 3,
    offers: player ? 0 : premium ? (pro ? 5 : 10) : pro ? 0 : 1,
    events: premium ? (player ? 10 : pro ? 25 : 50) : 1,
    discover: premium,
    lists: player ? 0 : premium ? (pro ? 20 : 30) : 1,
    talents: player ? 0 : premium ? 1000 : 20,
    managers: category === "Organisation" && premium ? 5 : 1,
    services: pro ? (premium ? 15 : 3) : 0,
    referral: premium || !pro,
  };
}
export function calendarMonth(now = Date.now()) {
  const p = new Intl.DateTimeFormat("en", {
    timeZone: "Europe/Brussels",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(now);
  return `${p.find((p) => p.type === "year")!.value}-${p.find((p) => p.type === "month")!.value}`;
}
