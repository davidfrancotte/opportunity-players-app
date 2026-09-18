"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowUpRight, Check, LockKeyhole, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useDemo } from "./demo-provider";
import { isPremium, remainingMessages, type AccessReason } from "@/lib/social";
import type { Category } from "@/lib/model";
import { monthlyPrice } from "@/lib/pricing";

export const categoryLabel = (category: Category) =>
  category === "Sportif" ? "Joueur" : category === "Organisation" ? "Collectif" : "Professionnel";
export function FreePlanNote({ category }: { category: Category }) {
  return (
    <aside className="free-plan-note">
      <span>
        <Check size={15} /> Votre compte est gratuit
      </span>
      <p>
        {category === "Sportif"
          ? "Explorez le réseau et envoyez 5 messages par mois. La publication de posts se débloque avec Premium."
          : "Présentez votre activité et publiez gratuitement. Premium est nécessaire pour échanger avec les joueurs, recevoir des messages et recevoir des commentaires sur vos posts."}
      </p>
      <small>
        Premium optionnel : {monthlyPrice(category)}/mois. Aucun paiement à l’inscription.
      </small>
    </aside>
  );
}
export function PlanStatus({ compact = false }: { compact?: boolean }) {
  const { profile, social, access } = useDemo();
  const premium = isPremium(social, profile.category);
  const left = remainingMessages(social, access.month);
  return (
    <Link href="/abonnement" className={compact ? "plan-status compact" : "plan-status"}>
      <span className="plan-icon">
        {premium ? <Sparkles size={19} /> : <LockKeyhole size={18} />}
      </span>
      <span>
        <strong>
          {categoryLabel(profile.category)} · {premium ? "Premium simulé" : "Gratuit"}
        </strong>
        <small>
          {premium
            ? "Vos échanges sont débloqués dans la démo."
            : profile.category === "Sportif"
              ? left + " / 5 messages disponibles ce mois-ci"
              : "Activez vos échanges avec les joueurs."}
        </small>
        {!premium && (
          <em className="plan-monthly">Premium · {monthlyPrice(profile.category)}/mois</em>
        )}
      </span>
      <ArrowUpRight size={18} />
    </Link>
  );
}
export const gateCopy: Record<AccessReason, { title: string; text: string; benefits: string[] }> = {
  publish: {
    title: "Votre parcours mérite d’être partagé.",
    text: "La publication de posts est réservée aux joueurs Premium. Continuez à explorer gratuitement ou débloquez la possibilité de publier.",
    benefits: [
      "Partagez vos moments sportifs",
      "Ajoutez une illustration à vos posts",
      "Poursuivez vos échanges au-delà de 5 messages",
    ],
  },
  "player-contact": {
    title: "Passez de la découverte à l’échange.",
    text: "Votre compte gratuit vous permet de découvrir les joueurs. Activez Premium pour leur envoyer des messages et commenter leurs publications.",
    benefits: [
      "Contactez les joueurs",
      "Recevez leurs réponses",
      "Recevez des commentaires sur vos publications",
    ],
  },
  receive: {
    title: "Ouvrez la porte aux échanges.",
    text: "Pour les professionnels et collectifs, la réception de messages et de commentaires sur leurs posts nécessite Premium.",
    benefits: [
      "Consultez les messages reçus",
      "Échangez avec les joueurs",
      "Recevez les commentaires de la communauté",
    ],
  },
  quota: {
    title: "Gardez la conversation ouverte.",
    text: "Vous avez envoyé vos 5 messages gratuits ce mois-ci. Retrouvez votre quota au début du mois prochain ou découvrez Premium.",
    benefits: [
      "Continuez vos échanges sans le quota gratuit",
      "Publiez dans le fil sportif",
      "Conservez votre profil et votre réseau",
    ],
  },
  recipient: {
    title: "Ce membre ne peut pas encore recevoir.",
    text: "Ce professionnel ou collectif fictif n’a pas d’abonnement actif. Il doit activer Premium pour recevoir votre message ou commentaire. Aucun message n’est envoyé et votre quota n’est pas débité.",
    benefits: [],
  },
};
export function LockedFeature({ reason = "receive" }: { reason?: AccessReason }) {
  const { dispatchSocial } = useDemo();
  return (
    <aside className="locked-feature">
      <LockKeyhole size={21} />
      <h3>{gateCopy[reason].title}</h3>
      <p>{gateCopy[reason].text}</p>
      <Button variant="secondary" onClick={() => dispatchSocial({ type: "gate", reason })}>
        {reason === "recipient" ? "Comprendre cette limite" : "Découvrir Premium"}
        <ArrowUpRight size={15} />
      </Button>
    </aside>
  );
}
export function UpgradeGate() {
  const { profile, social, dispatchSocial } = useDemo();
  const router = useRouter();
  const pathname = usePathname();
  const reason = social.gate;
  const copy = reason ? gateCopy[reason] : gateCopy.receive;
  function close() {
    dispatchSocial({ type: "gate", reason: null });
  }
  return (
    <Dialog
      open={!!reason}
      onOpenChange={(v) => {
        if (!v) close();
      }}
    >
      <DialogContent className="studio-modal upgrade-modal" showCloseButton={false}>
        <Button className="modal-close" variant="ghost" aria-label="Fermer" onClick={close}>
          <X size={20} />
        </Button>
        <span className="premium-eyebrow">
          <Sparkles size={15} />
          {reason === "recipient" ? "DISPONIBILITÉ DU MEMBRE" : "ARENA / PREMIUM"}
        </span>
        <DialogTitle className="modal-title">{copy.title}</DialogTitle>
        <DialogDescription className="modal-description">{copy.text}</DialogDescription>
        {reason !== "recipient" && (
          <p className="upgrade-price">
            {monthlyPrice(profile.category)}
            <span>/mois · offre {categoryLabel(profile.category)}</span>
          </p>
        )}
        {!!copy.benefits.length && (
          <ul className="premium-benefits">
            {copy.benefits.map((s) => (
              <li key={s}>
                <Check size={16} />
                {s}
              </li>
            ))}
          </ul>
        )}
        {reason !== "recipient" && (
          <Button
            className="action primary"
            onClick={() => {
              close();
              router.push("/abonnement?retour=" + encodeURIComponent(pathname));
            }}
          >
            Voir mon offre <ArrowUpRight size={18} />
          </Button>
        )}
        <Button variant="ghost" className="keep-free" onClick={close}>
          {reason === "recipient" ? "Compris" : "Continuer gratuitement"}
        </Button>
        <p className="demo-context">Démo uniquement. Aucun prélèvement, aucun achat réel.</p>
      </DialogContent>
    </Dialog>
  );
}
