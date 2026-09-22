"use client";
import { T } from "./locale";
import Link from "next/link";
import { Bell, CalendarDays, ArrowUpRight } from "lucide-react";
import { useDemo } from "./demo-provider";
export function EventHeader() {
  const { events, career, careerActor, extensionWorkspace } = useDemo();
  const unread =
    events.notices.filter((n) => n.recipient === "me" && !n.read).length +
    career.notices.filter((n) => n.recipient === careerActor.id && !n.read).length +
    extensionWorkspace.notices.filter((n) => !n.read).length;
  return (
    <div className="event-header">
      <Link href="/agenda" className="icon-link" aria-label="Mon agenda">
        <CalendarDays size={21} />
      </Link>
      <Link
        href="/notifications"
        className="icon-link event-bell"
        aria-label={`Notifications, ${unread} non lues`}
      >
        <Bell size={21} />
        {unread > 0 && <span>{unread > 9 ? "9+" : unread}</span>}
      </Link>
    </div>
  );
}
export function NetworkSections({
  active = "members",
}: {
  active?: "members" | "play" | "agenda";
}) {
  return (
    <nav className="network-sections" aria-label="Rubriques du réseau">
      <Link href="/reseau" aria-current={active === "members" ? "page" : undefined}>
        <T>{"Les membres"}</T>
      </Link>
      <Link href="/jouer" aria-current={active === "play" ? "page" : undefined}>
        <T>{"Jouer ensemble"}</T>
        <span>NEW</span>
      </Link>
      <Link href="/agenda" aria-current={active === "agenda" ? "page" : undefined}>
        <T>{"Agenda"}</T>
      </Link>
    </nav>
  );
}
export function PlayHomeCard() {
  const { events } = useDemo();
  const upcoming = events.matches
    .filter(
      (m) =>
        m.confirmed &&
        !m.cancelled &&
        (m.host === "me" ||
          m.replies.some(
            (r) => r.user === "me" && r.status === "approved" && r.slots.includes(m.confirmed!),
          )),
    )
    .map((m) => ({ m, slot: m.slots.find((s) => s.id === m.confirmed)! }))
    .filter(({ slot }) => Date.parse(slot.start) > Date.now())
    .sort((a, b) => Date.parse(a.slot.start) - Date.parse(b.slot.start))[0];
  const invitations = events.matches.filter(
    (m) =>
      m.invitees.includes("me") &&
      !m.cancelled &&
      !m.confirmed &&
      !m.replies.some((r) => r.user === "me"),
  ).length;
  return (
    <section className="play-home">
      <span className="mini-kicker">
        <T>{"DU RÉSEAU AU TERRAIN"}</T>
      </span>
      <div>
        <h2>
          <T>{"On joue quand ?"}</T>
        </h2>
        <CalendarDays size={27} />
      </div>
      <p>
        <T>{"Un sport. Vos contacts. Le bon créneau."}</T>
      </p>
      <div className="play-home-links">
        <Link href="/organiser">
          <T>{"Organiser un match"}</T>
          <ArrowUpRight size={17} />
        </Link>
        <Link href="/jouer">
          {invitations ? `${invitations} invitation à découvrir` : "Trouver un match"}
        </Link>
      </div>
      {upcoming && (
        <Link className="play-upcoming" href={`/match?id=${upcoming.m.id}`}>
          <small>
            <T>{"PROCHAIN RENDEZ-VOUS"}</T>
          </small>
          <strong>{upcoming.m.title}</strong>
          <span>
            {new Intl.DateTimeFormat("fr-BE", {
              weekday: "short",
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
              timeZone: "Europe/Brussels",
            }).format(new Date(upcoming.slot.start))}{" "}
            · {upcoming.m.city}
          </span>
        </Link>
      )}
    </section>
  );
}
