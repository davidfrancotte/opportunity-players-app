"use client";
import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, CalendarDays, ArrowUpRight, Check } from "lucide-react";
import { useDemo } from "./demo-provider";
import { useLocale } from "./locale";
import { ProfileLayout } from "./profile-screens";
import { NetworkSections } from "./event-navigation";
import { AgendaRequests } from "./agenda-requests";
import { CalendarWorkspace } from "./extension-screens";
import {
  agendaDay,
  agendaEntries,
  filterAgenda,
  monthDays,
  type AgendaCategory,
} from "@/lib/agenda";

export function AgendaPage() {
  const { events, career, careerActor, careerActors, extensionWorkspace, dispatchEvent } =
    useDemo();
  const { locale } = useLocale();
  const c = (fr: string, en: string) => (locale === "en" ? en : fr);
  const today = agendaDay(new Date());
  const [month, setMonth] = useState(today.slice(0, 7));
  const [day, setDay] = useState<string | null>(null);
  const [category, setCategory] = useState<AgendaCategory | "all">("all");
  const labels = {
    all: c("Tous", "All"),
    match: c("Matchs", "Matches"),
    professional: c("RDV pro", "Professional meetings"),
    spectator: c("Agenda sportif", "Sports calendar"),
  };
  const entries = agendaEntries(
    events,
    career,
    extensionWorkspace,
    careerActor.id,
    (id) => careerActors.find((a) => a.id === id)?.name || id,
  );
  const monthEntries = filterAgenda(entries, month, category);
  const visible = filterAgenda(entries, month, category, day);
  const date = (value: string, options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "fr-BE", {
      timeZone: "Europe/Brussels",
      ...options,
    }).format(new Date(value));
  const monthTitle = date(`${month}-15T12:00:00Z`, { month: "long", year: "numeric" });
  const days = monthDays(month);
  function moveMonth(offset: number) {
    const [year, m] = month.split("-").map(Number);
    setMonth(new Date(Date.UTC(year, m - 1 + offset, 15)).toISOString().slice(0, 7));
    setDay(null);
  }
  return (
    <ProfileLayout>
      <div className="event-title">
        <span className="mini-kicker">
          {c("VOTRE RÉSEAU, VOTRE TEMPS", "YOUR NETWORK, YOUR TIME")}
        </span>
        <h1>
          Agenda<span>.</span>
        </h1>
        <p>
          {c(
            "Sur le terrain, en rendez-vous ou dans les tribunes.",
            "On the court, in a meeting or in the stands.",
          )}
        </p>
      </div>
      <NetworkSections active="agenda" />
      <section
        className="unified-calendar"
        aria-label={c("Calendrier mensuel", "Monthly calendar")}
      >
        <div className="agenda-month-heading">
          <button
            type="button"
            onClick={() => moveMonth(-1)}
            aria-label={c("Mois précédent", "Previous month")}
          >
            <ChevronLeft size={20} />
          </button>
          <h2 aria-live="polite">{monthTitle}</h2>
          <button
            type="button"
            onClick={() => moveMonth(1)}
            aria-label={c("Mois suivant", "Next month")}
          >
            <ChevronRight size={20} />
          </button>
        </div>
        <button
          type="button"
          className="agenda-today"
          onClick={() => {
            setMonth(today.slice(0, 7));
            setDay(null);
          }}
        >
          {c("Ce mois-ci", "This month")}
        </button>
        <table className="agenda-month-grid" aria-label={monthTitle}>
          <thead>
            <tr>
              {(locale === "en"
                ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
                : ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]
              ).map((d) => (
                <th scope="col" key={d}>
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: days.length / 7 }, (_, week) => (
              <tr key={week}>
                {days.slice(week * 7, week * 7 + 7).map((d, index) => {
                  const daily = d ? monthEntries.filter((e) => agendaDay(e.start) === d) : [];
                  const types = [...new Set(daily.map((e) => e.category))];
                  return (
                    <td key={d || `empty-${index}`}>
                      {d && (
                        <button
                          type="button"
                          className={`agenda-day ${daily.length ? "has-events" : ""} ${d === today ? "is-today" : ""}`}
                          aria-pressed={day === d}
                          aria-current={d === today ? "date" : undefined}
                          aria-label={`${date(`${d}T12:00:00Z`, { weekday: "long", day: "numeric", month: "long", year: "numeric" })} · ${daily.length} ${c("événement(s)", "event(s)")}`}
                          onClick={() => setDay(day === d ? null : d)}
                        >
                          <span>{Number(d.slice(-2))}</span>
                          <span className="agenda-day-dots" aria-hidden="true">
                            {types.map((type) => (
                              <i key={type} className={`agenda-dot ${type}`} />
                            ))}
                          </span>
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="agenda-legend">
          {(["match", "professional", "spectator"] as const).map((type) => (
            <span key={type}>
              <i className={`agenda-dot ${type}`} />
              {labels[type]}
            </span>
          ))}
        </div>
      </section>
      <section className="agenda-event-list" aria-label={c("Liste des événements", "Event list")}>
        <div className="agenda-list-heading">
          <h2>
            {c("Mes événements", "My events")} <small>({visible.length})</small>
          </h2>
          {day && (
            <button type="button" onClick={() => setDay(null)}>
              {c("Tout le mois", "Whole month")}
            </button>
          )}
        </div>
        <div
          className="agenda-filters"
          role="group"
          aria-label={c("Filtrer les événements", "Filter events")}
        >
          {(["all", "match", "professional", "spectator"] as const).map((type) => (
            <button
              type="button"
              key={type}
              aria-pressed={category === type}
              onClick={() => setCategory(type)}
            >
              {labels[type]}
            </button>
          ))}
        </div>
        <p className="agenda-selection" aria-live="polite">
          {day
            ? date(`${day}T12:00:00Z`, { day: "numeric", month: "long", year: "numeric" })
            : monthTitle}{" "}
          · {c("Heure de Bruxelles", "Brussels time")}
        </p>
        {category === "spectator" && (
          <p className="event-note">
            {c(
              "Les événements que vous souhaitez suivre comme spectateur. Un intérêt ne réserve pas de billet.",
              "Events you want to attend as a spectator. Marking interest does not book a ticket.",
            )}
          </p>
        )}
        {visible.map((e) => (
          <article
            key={e.id}
            className={`unified-agenda-event ${e.category}`}
            data-category={e.category}
          >
            <div className="agenda-event-date">
              <strong>{date(e.start, { day: "2-digit" })}</strong>
              <small>{date(e.start, { month: "short" })}</small>
            </div>
            <div className="agenda-event-body">
              <span className="agenda-category-label">
                {labels[e.category]}
                {e.category === "spectator" ? c(" · Spectateur", " · Spectator") : ""}
              </span>
              <h3>{e.title}</h3>
              <p>
                {date(e.start, { hour: "2-digit", minute: "2-digit" })} · {e.place}
              </p>
              {e.href ? (
                <Link href={e.href}>
                  {c("Voir les détails", "View details")} <ArrowUpRight size={14} />
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    dispatchEvent({
                      type: "spectator-interest",
                      id: e.spectatorId!,
                      interested: false,
                    })
                  }
                >
                  {c("Retirer de mon agenda", "Remove from my calendar")}
                </button>
              )}
            </div>
          </article>
        ))}
        {!visible.length && (
          <div className="agenda-empty">
            <CalendarDays size={28} />
            <h3>{c("Aucun événement sur cette période", "No events in this period")}</h3>
            <p>
              {c(
                "Changez de jour, de mois ou de filtre. Les matchs et rendez-vous apparaissent dès leur confirmation.",
                "Change the day, month or filter. Matches and meetings appear once confirmed.",
              )}
            </p>
            {day && (
              <button type="button" onClick={() => setDay(null)}>
                {c("Voir tout le mois", "Show whole month")}
              </button>
            )}
          </div>
        )}
      </section>
      <AgendaRequests />
      <details className="agenda-discover">
        <summary>
          {c("Événements à suivre comme spectateur", "Events to attend as a spectator")}
        </summary>
        <p className="event-note">
          {c(
            "Exemples fictifs : marquez votre intérêt pour ajouter un événement à votre agenda sportif.",
            "Fictional examples: mark your interest to add an event to your sports calendar.",
          )}
        </p>
        {events.spectatorEvents
          .filter((e) => Date.parse(e.start) > Date.now())
          .map((e) => {
            const interested = events.spectatorInterests.includes(e.id);
            return (
              <article key={e.id}>
                <small>
                  {e.sport} ·{" "}
                  {date(e.start, {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </small>
                <h3>{e.title}</h3>
                <p>{e.place}</p>
                <button
                  type="button"
                  aria-pressed={interested}
                  onClick={() =>
                    dispatchEvent({ type: "spectator-interest", id: e.id, interested: !interested })
                  }
                >
                  {interested && <Check size={15} />}
                  {interested
                    ? c("Intéressé · dans mon agenda", "Interested · in my calendar")
                    : c("Ça m’intéresse", "I’m interested")}
                </button>
              </article>
            );
          })}
      </details>
      <details className="agenda-tools">
        <summary>{c("Options de l’agenda", "Calendar options")}</summary>
        <CalendarWorkspace compact />
      </details>
      <p className="event-note">
        {c(
          "Démonstration : événements fictifs, conservés pendant cette session. Aucune réservation réelle.",
          "Demo: fictional events, kept during this session. No real bookings.",
        )}
      </p>
    </ProfileLayout>
  );
}
