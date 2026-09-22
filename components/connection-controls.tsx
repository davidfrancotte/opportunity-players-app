"use client";
import { Button } from "./ui/button";
import { useDemo } from "./demo-provider";
import { useLocale } from "./locale";
import { isConnected } from "@/lib/social";
import { Check, UserPlus } from "lucide-react";

export function ConnectionControls({ memberId }: { memberId: string }) {
  const { social, dispatchSocial, trust } = useDemo();
  const { locale } = useLocale();
  const c = (fr: string, en: string) => (locale === "en" ? en : fr);
  const invitation = social.connectionInvitations.find((i) => i.memberId === memberId);
  if (trust.blocked.includes(memberId))
    return (
      <p className="field-hint">
        {c("Débloquez ce membre pour vous connecter.", "Unblock this member to connect.")}
      </p>
    );
  if (isConnected(social, memberId))
    return (
      <div className="connection-status">
        <Check size={18} />
        <span>
          {c("Connectés", "Connected")}
          <small>
            {c(
              "Messages sans quota et invitations aux matchs.",
              "Unlimited messaging and match invitations.",
            )}
          </small>
        </span>
      </div>
    );
  if (invitation?.status === "pending")
    return invitation.direction === "outgoing" ? (
      <div className="connection-pending">
        <p>{c("Demande de connexion envoyée", "Connection request sent")}</p>
        <small>{c("En attente de son acceptation.", "Waiting for their acceptance.")}</small>
        <Button
          variant="ghost"
          onClick={() => dispatchSocial({ type: "connection-cancel", id: memberId })}
        >
          {c("Retirer la demande", "Withdraw request")}
        </Button>
        <details className="connection-demo">
          <summary>
            {c(
              "Démo · simuler la réponse du destinataire",
              "Demo · simulate the recipient’s reply",
            )}
          </summary>
          <p>
            {c(
              "Aucune demande réelle n’est envoyée. Ces boutons jouent le rôle de l’autre personne.",
              "No real request is sent. These buttons act as the other person.",
            )}
          </p>
          <div>
            <Button
              onClick={() =>
                dispatchSocial({ type: "connection-demo-response", id: memberId, accept: true })
              }
            >
              {c("Simuler : accepte", "Simulate: accepts")}
            </Button>
            <Button
              variant="ghost"
              onClick={() =>
                dispatchSocial({ type: "connection-demo-response", id: memberId, accept: false })
              }
            >
              {c("Simuler : refuse", "Simulate: declines")}
            </Button>
          </div>
        </details>
      </div>
    ) : (
      <div className="connection-pending">
        <p>
          {c(
            "Cette personne souhaite se connecter avec vous.",
            "This person wants to connect with you.",
          )}
        </p>
        <div className="connection-buttons">
          <Button
            onClick={() =>
              dispatchSocial({ type: "connection-response", id: memberId, accept: true })
            }
          >
            {c("Accepter la connexion", "Accept connection")}
          </Button>
          <Button
            variant="ghost"
            onClick={() =>
              dispatchSocial({ type: "connection-response", id: memberId, accept: false })
            }
          >
            {c("Refuser", "Decline")}
          </Button>
        </div>
      </div>
    );
  return (
    <Button
      className="action primary connection-connect"
      onClick={() => dispatchSocial({ type: "connection-request", id: memberId })}
    >
      <UserPlus size={18} />
      Connect
    </Button>
  );
}
