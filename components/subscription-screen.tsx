"use client";
import { T } from "./locale";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { useDemo } from "./demo-provider";
import { ProfileLayout, Modal } from "./profile-screens";
import { categoryLabel } from "./subscription-ui";
import { isPremium, remainingMessages } from "@/lib/social";
import { categories, type Category } from "@/lib/model";
import { monthlyPrice } from "@/lib/pricing";

export function SubscriptionPage() {
  const { profile, setProfile, social, dispatchSocial, access, notify } = useDemo();
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
          <T>{"Les rencontres"}</T>
          <br />
          <T>{"méritent une suite"}</T>
          <span>.</span>
        </h1>
        <p>
          {player
            ? "Votre prochain échange peut faire avancer votre parcours."
            : "Votre présence est créée. Donnez maintenant vie aux échanges."}
        </p>
      </div>
      <Link href="/parrainage" className="trust-card">
        <span className="mini-kicker">
          <T>{"INVITEZ VOTRE RÉSEAU"}</T>
        </span>
        <strong>
          <T>{"3 mois Premium par filleul qualifié"}</T>
        </strong>
        <small>
          <T>{"Découvrez le parrainage · offre et activation simulées."}</T>
        </small>
      </Link>
      <div className="subscription-current">
        <span>
          {categoryLabel(profile.category)} · {premium ? "Premium simulé" : "Compte gratuit"}
        </span>
        {player && !premium && (
          <strong>
            {remainingMessages(social, access.month)}
            <T>{"/5 messages restants"}</T>
          </strong>
        )}
      </div>
      <article className="premium-offer">
        <span className="premium-eyebrow">
          PREMIUM {categoryLabel(profile.category).toUpperCase()}
        </span>
        <div className="subscription-price">
          <small>
            <T>{"Abonnement mensuel"}</T>
          </small>
          <strong>{monthlyPrice(profile.category)}</strong>
          <span>
            <T>{"/mois"}</T>
          </span>
        </div>
        <p className="price-caveat">
          <T>
            {
              "Tarif défini pour cette démo. TVA et conditions contractuelles à préciser avant le lancement commercial."
            }
          </T>
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
            <T>{"Organiser des matchs et inviter votre réseau"}</T>
          </li>
          <li>
            <Check size={17} />
            <T>{"Découvrir les invitations ouvertes dans les 50 km"}</T>
          </li>
        </ul>
        <Button className="action primary" disabled={premium} onClick={() => setConfirm(true)}>
          {premium ? "Premium actif dans la démo" : "Essayer Premium dans la démo"}
          <ArrowUpRight size={18} />
        </Button>
        <p className="demo-context">
          <T>{"Simulation gratuite · aucune carte · aucun engagement réel"}</T>
        </p>
      </article>
      <section className="plan-comparison">
        <h2>
          <T>{"Ce qui change, simplement."}</T>
        </h2>
        <table>
          <caption className="sr-only">
            <T>{"Comparaison des fonctionnalités Gratuit et Premium"}</T>
          </caption>
          <thead>
            <tr>
              <th>
                <T>{"Fonctionnalité"}</T>
              </th>
              <th>
                <T>{"Gratuit"}</T>
              </th>
              <th>Premium</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>
                <T>{"Organiser un match"}</T>
              </th>
              <td>
                <T>{"Non"}</T>
              </td>
              <td>
                <T>{"Oui"}</T>
              </td>
            </tr>
            <tr>
              <th>
                <T>{"Voir les matchs ouverts à proximité"}</T>
              </th>
              <td>
                <T>{"Non"}</T>
              </td>
              <td>
                <T>{"Oui"}</T>
              </td>
            </tr>
            <tr>
              <th>
                <T>{"Répondre à une invitation personnelle"}</T>
              </th>
              <td>
                <T>{"Oui"}</T>
              </td>
              <td>
                <T>{"Oui"}</T>
              </td>
            </tr>
            <tr>
              <th>
                <T>{"Créer son profil, explorer et suivre"}</T>
              </th>
              <td>
                <T>{"Oui"}</T>
              </td>
              <td>
                <T>{"Oui"}</T>
              </td>
            </tr>
            <tr>
              <th>
                <T>{"Publier des posts"}</T>
              </th>
              <td>{player ? "Non" : "Oui"}</td>
              <td>
                <T>{"Oui"}</T>
              </td>
            </tr>
            <tr>
              <th>{player ? "Messages envoyés" : "Contacter les joueurs"}</th>
              <td>{player ? "5 / mois" : "Non"}</td>
              <td>{player ? "Sans quota gratuit*" : "Oui"}</td>
            </tr>
            <tr>
              <th>
                <T>{"Recevoir des messages"}</T>
              </th>
              <td>{player ? "Oui" : "Non"}</td>
              <td>
                <T>{"Oui"}</T>
              </td>
            </tr>
            <tr>
              <th>
                <T>{"Recevoir des commentaires sur ses posts"}</T>
              </th>
              <td>{player ? "Pas de nouveaux posts" : "Non"}</td>
              <td>
                <T>{"Oui"}</T>
              </td>
            </tr>
          </tbody>
        </table>
        <p className="demo-context">
          <T>
            {
              "* Dans cette proposition de démo. La réception dépend aussi des droits du destinataire. Les règles de modération restent applicables dans le produit final."
            }
          </T>
        </p>
      </section>
      <section className="subscription-faq">
        <h2>
          <T>{"Avant de vous décider."}</T>
        </h2>
        <details>
          <summary>
            <T>{"Mon compte reste-t-il gratuit ?"}</T>
          </summary>
          <p>
            <T>
              {
                "Oui. Vous pouvez créer votre profil, explorer le réseau et suivre des membres sans abonnement. Aucun paiement n’est demandé pour terminer l’inscription."
              }
            </T>
          </p>
        </details>
        <details>
          <summary>
            <T>{"Comment les 5 messages sont-ils comptés ?"}</T>
          </summary>
          <p>
            <T>
              {
                "Un message envoyé consomme une unité, même dans une conversation existante. Les lectures, réceptions et commentaires n’en consomment pas. Le quota gratuit repart à 5 au début de chaque mois civil, heure de Bruxelles. Un envoi bloqué ne consomme rien."
              }
            </T>
          </p>
        </details>
        <details>
          <summary>
            <T>{"Et si mon interlocuteur n’est pas abonné ?"}</T>
          </summary>
          <p>
            <T>
              {
                "Un professionnel ou collectif gratuit ne peut pas recevoir de messages ni de commentaires. Votre propre abonnement ne contourne pas cette limite."
              }
            </T>
          </p>
        </details>
        <details>
          <summary>
            <T>{"Est-ce un véritable abonnement ?"}</T>
          </summary>
          <p>
            <T>
              {
                "Non. Tout est simulé et revient à l’état initial au rechargement. La périodicité n’entraîne aucun prélèvement ni renouvellement. Pour une souscription réelle, les taxes et conditions contractuelles devront être précisées avant le lancement commercial."
              }
            </T>
          </p>
        </details>
      </section>
      <section className="all-plan-prices">
        <h2>
          <T>{"À chaque profil, son offre."}</T>
        </h2>
        {categories.map((c) => (
          <div key={c}>
            <span>{categoryLabel(c)}</span>
            <strong>
              {monthlyPrice(c)}
              <small>
                <T>{"/mois"}</T>
              </small>
            </strong>
          </div>
        ))}
      </section>
      <p className="pricing-source">
        <T>
          {
            "Tarifs mensuels validés pour cette version. Aucune formule annuelle ni réduction n’est proposée."
          }
        </T>
      </p>
      <details className="subscription-demo-controls">
        <summary>
          <T>{"Tester un autre cas dans la démo"}</T>
        </summary>
        <label htmlFor="demo-category">
          <T>{"Type de compte fictif"}</T>
        </label>
        <NativeSelect
          id="demo-category"
          disabled={profile.registrationMode === "child"}
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
          <T>
            {
              "Ce sélecteur modifie uniquement le profil fictif de cette visite. Un abonnement simulé s’applique à la catégorie choisie."
            }
          </T>
        </p>
        {premium && (
          <Button
            variant="outline"
            onClick={() => {
              dispatchSocial({ type: "subscription", category: null });
              notify("Retour au compte gratuit dans la démo, sans annulation réelle.");
            }}
          >
            <T>{"Revenir à Gratuit dans la démo"}</T>
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
          <T>{"Profil"}</T>
          {categoryLabel(profile.category)} · offre mensuelle affichée :{" "}
          {monthlyPrice(profile.category)}/mois. Montant prélevé dans cette démo : 0 €.
        </p>
        <Button
          className="action primary"
          onClick={() => {
            dispatchSocial({
              type: "subscription",
              category: profile.category,
            });
            setConfirm(false);
            notify("Premium activé dans la démo uniquement. Aucun paiement effectué.");
            const target = new URLSearchParams(window.location.search).get("retour");
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
          <T>{"Activer sans paiement"}</T>
          <Check size={17} />
        </Button>
        <Button variant="ghost" onClick={() => setConfirm(false)}>
          <T>{"Rester gratuit"}</T>
        </Button>
      </Modal>
    </ProfileLayout>
  );
}
