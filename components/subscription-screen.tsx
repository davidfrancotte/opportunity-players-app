"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { useDemo } from "./demo-provider";
import { ProfileLayout, Modal } from "./profile-screens";
import { categoryLabel } from "./subscription-ui";
import { isPremium, remainingMessages } from "@/lib/social";
import { categories, type Category } from "@/lib/model";
import { monthlyPrice } from "@/lib/pricing";

export function SubscriptionPage() {
  const { profile, setProfile, social, dispatchSocial, access, notify } =
    useDemo();
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const premium = isPremium(social, profile.category);
  const player = profile.category === "Sportif";
  const benefits = player
    ? [
        "Publier vos posts et moments sportifs",
        "Échanger au-delà des 5 messages gratuits",
        "Garder votre profil, votre réseau et vos favoris",
      ]
    : [
        "Contacter les joueurs par message",
        "Recevoir les messages et les réponses",
        "Recevoir les commentaires sur vos posts",
      ];
  return (
    <ProfileLayout back="/profil">
      <div className="subscription-hero">
        <span className="premium-eyebrow">
          <Sparkles size={16} /> ARENA / PREMIUM
        </span>
        <h1>
          Les rencontres
          <br />
          méritent une suite<span>.</span>
        </h1>
        <p>
          {player
            ? "Votre prochain échange peut faire avancer votre parcours."
            : "Votre présence est créée. Donnez maintenant vie aux échanges."}
        </p>
      </div>
      <Link href="/parrainage" className="trust-card">
        <span className="mini-kicker">INVITEZ VOTRE RÉSEAU</span>
        <strong>3 mois Premium par filleul qualifié</strong>
        <small>Découvrez le parrainage · offre et activation simulées.</small>
      </Link>
      <div className="subscription-current">
        <span>
          {categoryLabel(profile.category)} ·{" "}
          {premium ? "Premium simulé" : "Compte gratuit"}
        </span>
        {player && !premium && (
          <strong>
            {remainingMessages(social, access.month)}/5 messages restants
          </strong>
        )}
      </div>
      <article className="premium-offer">
        <span className="premium-eyebrow">
          PREMIUM {categoryLabel(profile.category).toUpperCase()}
        </span>
        <div className="subscription-price">
          <small>Abonnement mensuel</small>
          <strong>{monthlyPrice(profile.category)}</strong>
          <span>/mois</span>
        </div>
        <p className="price-caveat">
          Tarif défini pour cette démo. TVA et conditions contractuelles à
          préciser avant le lancement commercial.
        </p>
        <ul className="premium-benefits">
          {benefits.map((s) => (
            <li key={s}>
              <Check size={17} />
              {s}
            </li>
          ))}
          <li>
            <Check size={17} />
            Organiser des matchs et inviter votre réseau
          </li>
          <li>
            <Check size={17} />
            Découvrir les invitations ouvertes dans les 50 km
          </li>
        </ul>
        <Button
          className="action primary"
          disabled={premium}
          onClick={() => setConfirm(true)}
        >
          {premium
            ? "Premium actif dans la démo"
            : "Essayer Premium dans la démo"}
          <ArrowUpRight size={18} />
        </Button>
        <p className="demo-context">
          Simulation gratuite · aucune carte · aucun engagement réel
        </p>
      </article>
      <section className="plan-comparison">
        <h2>Ce qui change, simplement.</h2>
        <table>
          <caption className="sr-only">
            Comparaison des fonctionnalités Gratuit et Premium
          </caption>
          <thead>
            <tr>
              <th>Fonctionnalité</th>
              <th>Gratuit</th>
              <th>Premium</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>Organiser un match</th>
              <td>Non</td>
              <td>Oui</td>
            </tr>
            <tr>
              <th>Voir les matchs ouverts à proximité</th>
              <td>Non</td>
              <td>Oui</td>
            </tr>
            <tr>
              <th>Répondre à une invitation personnelle</th>
              <td>Oui</td>
              <td>Oui</td>
            </tr>
            <tr>
              <th>Créer son profil, explorer et suivre</th>
              <td>Oui</td>
              <td>Oui</td>
            </tr>
            <tr>
              <th>Publier des posts</th>
              <td>{player ? "Non" : "Oui"}</td>
              <td>Oui</td>
            </tr>
            <tr>
              <th>{player ? "Messages envoyés" : "Contacter les joueurs"}</th>
              <td>{player ? "5 / mois" : "Non"}</td>
              <td>{player ? "Sans quota gratuit*" : "Oui"}</td>
            </tr>
            <tr>
              <th>Recevoir des messages</th>
              <td>{player ? "Oui" : "Non"}</td>
              <td>Oui</td>
            </tr>
            <tr>
              <th>Recevoir des commentaires sur ses posts</th>
              <td>{player ? "Pas de nouveaux posts" : "Non"}</td>
              <td>Oui</td>
            </tr>
          </tbody>
        </table>
        <p className="demo-context">
          * Dans cette proposition de démo. La réception dépend aussi des droits
          du destinataire. Les règles de modération restent applicables dans le
          produit final.
        </p>
      </section>
      <section className="subscription-faq">
        <h2>Avant de vous décider.</h2>
        <details>
          <summary>Mon compte reste-t-il gratuit ?</summary>
          <p>
            Oui. Vous pouvez créer votre profil, explorer le réseau et suivre
            des membres sans abonnement. Aucun paiement n’est demandé pour
            terminer l’inscription.
          </p>
        </details>
        <details>
          <summary>Comment les 5 messages sont-ils comptés ?</summary>
          <p>
            Un message envoyé consomme une unité, même dans une conversation
            existante. Les lectures, réceptions et commentaires n’en consomment
            pas. Le quota gratuit repart à 5 au début de chaque mois civil,
            heure de Bruxelles. Un envoi bloqué ne consomme rien.
          </p>
        </details>
        <details>
          <summary>Et si mon interlocuteur n’est pas abonné ?</summary>
          <p>
            Un professionnel ou collectif gratuit ne peut pas recevoir de
            messages ni de commentaires. Votre propre abonnement ne contourne
            pas cette limite.
          </p>
        </details>
        <details>
          <summary>Est-ce un véritable abonnement ?</summary>
          <p>
            Non. Tout est simulé et revient à l’état initial au rechargement. La
            périodicité n’entraîne aucun prélèvement ni renouvellement. Pour une
            souscription réelle, les taxes et conditions contractuelles devront
            être précisées avant le lancement commercial.
          </p>
        </details>
      </section>
      <section className="all-plan-prices">
        <h2>À chaque profil, son offre.</h2>
        {categories.map((c) => (
          <div key={c}>
            <span>{categoryLabel(c)}</span>
            <strong>
              {monthlyPrice(c)}
              <small>/mois</small>
            </strong>
          </div>
        ))}
      </section>
      <p className="pricing-source">
        Tarifs mensuels validés pour cette version. Aucune formule annuelle ni
        réduction n’est proposée.
      </p>
      <details className="subscription-demo-controls">
        <summary>Tester un autre cas dans la démo</summary>
        <label htmlFor="demo-category">Type de compte fictif</label>
        <NativeSelect
          id="demo-category"
          value={profile.category}
          onChange={(e) => {
            const category = e.target.value as Category;
            setProfile({
              ...profile,
              category,
              organisation:
                category === "Organisation"
                  ? profile.organisation || "Collectif Arena · démo"
                  : profile.organisation,
            });
          }}
        >
          {categories.map((c) => (
            <NativeSelectOption key={c} value={c}>
              {categoryLabel(c)}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <p>
          Ce sélecteur modifie uniquement le profil fictif de cette visite. Un
          abonnement simulé s’applique à la catégorie choisie.
        </p>
        {premium && (
          <Button
            variant="outline"
            onClick={() => {
              dispatchSocial({ type: "subscription", category: null });
              notify(
                "Retour au compte gratuit dans la démo, sans annulation réelle.",
              );
            }}
          >
            Revenir à Gratuit dans la démo
          </Button>
        )}
      </details>
      <Link className="text-link keep-free" href="/accueil">
        {premium ? "Continuer dans l’app" : "Continuer à explorer gratuitement"}
      </Link>
      <Modal
        open={confirm}
        onOpenChange={setConfirm}
        title="Activez la simulation."
        description="Aucun achat, aucune carte et aucun renouvellement. Vous allez uniquement débloquer les fonctionnalités Premium de ce profil fictif."
      >
        <p className="demo-context">
          Profil {categoryLabel(profile.category)} · offre mensuelle affichée :{" "}
          {monthlyPrice(profile.category)}/mois. Montant prélevé dans cette démo
          : 0 €.
        </p>
        <Button
          className="action primary"
          onClick={() => {
            dispatchSocial({
              type: "subscription",
              category: profile.category,
            });
            setConfirm(false);
            notify(
              "Premium activé dans la démo uniquement. Aucun paiement effectué.",
            );
            const target = new URLSearchParams(window.location.search).get(
              "retour",
            );
            router.push(
              target &&
                [
                  "/accueil",
                  "/reseau",
                  "/messages",
                  "/profil",
                  "/parcours",
                  "/medias",
                  "/opportunities",
                  "/organiser",
                  "/jouer",
                ].includes(target)
                ? target
                : "/accueil",
            );
          }}
        >
          Activer sans paiement <Check size={17} />
        </Button>
        <Button variant="ghost" onClick={() => setConfirm(false)}>
          Rester gratuit
        </Button>
      </Modal>
    </ProfileLayout>
  );
}
