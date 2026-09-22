"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useDemo } from "./demo-provider";
import { useLocale } from "./locale";
import { CareerFeedback } from "./career-screens";
import { availableSlots, unconfirmedAppointments, type Appointment } from "@/lib/career";

function RequestDetail({ request }: { request: Appointment }) {
  const { career, careerActor, dispatchCareer } = useDemo();
  const { locale } = useLocale();
  const c = (fr: string, en: string) => (locale === "en" ? en : fr);
  const [chosen, setChosen] = useState("");
  const receiving = request.professional === careerActor.id;
  const slots = availableSlots(career, request, careerActor.id, Date.now());
  const format = (start: string | number) =>
    new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "fr-BE", {
      timeZone: "Europe/Brussels",
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(start));
  return (
    <div className="agenda-request-content">
      <h3>{c("Objet de la demande", "Request purpose")}</h3>
      <p className="agenda-request-purpose">{request.purpose}</p>
      {request.createdAt && (
        <p className="event-note">
          {c("Envoyée le", "Sent on")} {format(request.createdAt)} ·{" "}
          {c("heure de Bruxelles", "Brussels time")}
        </p>
      )}
      {receiving && request.status === "pending" && (
        <>
          <p className="event-note">
            {c(
              "Valider autorise cette personne à choisir un de vos créneaux disponibles. Le rendez-vous sera confirmé après son choix.",
              "Accepting allows this person to choose an available time. The meeting is confirmed once they choose a slot.",
            )}
          </p>
          <div className="agenda-request-actions">
            <button
              type="button"
              className="action primary"
              onClick={() => dispatchCareer({ type: "respond", id: request.id, accept: true })}
            >
              {c("Valider", "Accept")}
            </button>
            <button
              type="button"
              className="action secondary"
              onClick={() => dispatchCareer({ type: "respond", id: request.id, accept: false })}
            >
              {c("Refuser", "Decline")}
            </button>
          </div>
        </>
      )}
      {!receiving && request.status === "pending" && (
        <p className="event-note">
          {c(
            "En attente de réponse. Seul le destinataire peut valider ou refuser votre demande.",
            "Awaiting a reply. Only the recipient can accept or decline your request.",
          )}
        </p>
      )}
      {receiving && request.status === "accepted" && (
        <p className="event-note">
          {c(
            "Demande validée. En attente du choix d’un créneau par le demandeur.",
            "Request accepted. Waiting for the requester to choose a time.",
          )}
        </p>
      )}
      {!receiving && request.status === "accepted" && (
        <div className="agenda-request-booking">
          {slots.length ? (
            <>
              <label htmlFor={`request-slot-${request.id}`}>
                {c("Choisir un créneau", "Choose a time")}
              </label>
              <select
                id={`request-slot-${request.id}`}
                value={chosen}
                onChange={(e) => setChosen(e.target.value)}
              >
                <option value="">
                  {c("Sélectionner une disponibilité", "Select an available time")}
                </option>
                {slots.map((slot) => (
                  <option key={slot.id} value={slot.id}>
                    {format(slot.start)} · {slot.place}
                  </option>
                ))}
              </select>
              <p className="event-note">
                {c(
                  "30 minutes · heure de Bruxelles. La validation ajoute le rendez-vous à l’agenda.",
                  "30 minutes · Brussels time. Confirmation adds the meeting to your calendar.",
                )}
              </p>
              <button
                type="button"
                className="action primary"
                disabled={!slots.some((s) => s.id === chosen)}
                onClick={() => dispatchCareer({ type: "book", id: request.id, slot: chosen })}
              >
                {c("Valider le rendez-vous", "Confirm meeting")}
              </button>
            </>
          ) : (
            <p className="event-note">
              {c(
                "Aucun créneau disponible. Le professionnel doit ajouter ses disponibilités.",
                "No slots available. The professional needs to add their availability.",
              )}
            </p>
          )}
        </div>
      )}
      {(!receiving || request.status === "accepted") && (
        <button
          type="button"
          className="agenda-request-cancel"
          onClick={() => dispatchCareer({ type: "cancel", id: request.id })}
        >
          {c("Annuler la demande", "Cancel request")}
        </button>
      )}
    </div>
  );
}

export function AgendaRequests() {
  const { career, careerActor, careerActors } = useDemo();
  const { locale } = useLocale();
  const c = (fr: string, en: string) => (locale === "en" ? en : fr);
  const requests = unconfirmedAppointments(career, careerActor.id);
  return (
    <details className="agenda-requests">
      <summary className="agenda-requests-heading">
        <ChevronDown size={17} aria-hidden="true" />
        <span>{c("Mes demandes de RDV", "My meeting requests")}</span>
        <span
          className="agenda-request-count"
          aria-live="polite"
          aria-label={`${requests.length} ${c("demandes non confirmées", "unconfirmed requests")}`}
        >
          {requests.length}
        </span>
      </summary>
      <p className="event-note">
        {c(
          "Demandes reçues et envoyées, en attente de réponse ou de créneau. Les rendez-vous confirmés apparaissent dans le calendrier.",
          "Incoming and outgoing requests awaiting a reply or a time slot. Confirmed meetings appear in the calendar.",
        )}
      </p>
      <CareerFeedback />
      {!requests.length && (
        <p className="agenda-requests-empty">
          {c("Aucune demande en attente de confirmation.", "No requests awaiting confirmation.")}
        </p>
      )}
      {requests.map((request) => {
        const receiving = request.professional === careerActor.id;
        const person = careerActors.find(
          (actor) => actor.id === (receiving ? request.requester : request.professional),
        );
        return (
          <details className="agenda-request" key={request.id}>
            <summary>
              <span>
                <strong>{person?.name || c("Membre", "Member")}</strong>
                <small>
                  {receiving ? c("Reçue", "Received") : c("Envoyée", "Sent")} ·{" "}
                  {request.status === "pending"
                    ? c("En attente de réponse", "Awaiting a reply")
                    : c("Acceptée · créneau à fixer", "Accepted · time to be agreed")}
                </small>
              </span>
              <ChevronDown size={17} aria-hidden="true" />
            </summary>
            <RequestDetail request={request} />
          </details>
        );
      })}
    </details>
  );
}
