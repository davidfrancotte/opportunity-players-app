"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import { NativeSelect, NativeSelectOption } from "./ui/native-select";
import { ProfileLayout, Modal } from "./profile-screens";
import { useDemo } from "./demo-provider";
import { categories, type Category } from "@/lib/model";
import { monthlyPrice, annualPrice, annualSaving } from "@/lib/pricing";
import { isPremium, remainingMessages } from "@/lib/social";
import { limits } from "@/lib/entitlements";
import catalog from "@/lib/offer-catalog.json";
import { categoryLabel } from "./subscription-ui";
export function SubscriptionPage() {
  const { profile, setProfile, social, dispatchSocial, access, notify, setCareerActor } = useDemo();
  const [confirm, setConfirm] = useState(false),
    [all, setAll] = useState(false);
  const [annual, setAnnual] = useState(false);
  const paid = isPremium(social, profile.category),
    free = limits(profile.category, false),
    premium = limits(profile.category, true);
  const rows = catalog[profile.category];
  return (
    <ProfileLayout back="/profil">
      <div className="extension-page">
        <header className="subscription-hero">
          <span className="mini-kicker">{paid ? "ARENA / MON ABONNEMENT" : "ARENA / GRATUIT & PREMIUM"}</span>
          <h1>
            {paid ? <>Votre Premium est actif<span>.</span></> : <>Un réseau ouvert.<br />Des outils pour aller plus loin<span>.</span></>}
          </h1>
          <p>
            {paid ? "Vos outils Premium sont disponibles. Retrouvez ici vos accès et vos limites d’utilisation." : "Votre profil, les réponses, commentaires, réactions et partages restent gratuits. Choisissez les outils adaptés à vos projets."}
          </p>
        </header>
        <div className="subscription-current">
          <strong>
            {categoryLabel(profile.category)} · {paid ? "Premium simulé" : "Gratuit"}
          </strong>
          <span>
            {remainingMessages(social, access.month, profile.category)} nouvelles prises de contact
            encore disponibles ce mois-ci
          </span>
        </div>
        {!paid && <article className="premium-offer">
          <span>PREMIUM {categoryLabel(profile.category).toUpperCase()}</span>
          <div className="billing-period" role="group" aria-label="Périodicité de la formule">
            <Button aria-pressed={!annual} onClick={() => setAnnual(false)}>Mensuel</Button>
            <Button aria-pressed={annual} onClick={() => setAnnual(true)}>Annuel · tarif réduit</Button>
          </div>
          <div className="subscription-price">
            <strong>{annual ? annualPrice(profile.category) : monthlyPrice(profile.category)}</strong>
            <span>{annual ? "/an" : "/mois"}</span>
          </div>
          <p className="annual-price-note">
            {annual
              ? `Paiement annuel en une fois. Économisez ${annualSaving(profile.category)} par rapport à 12 mensualités de ${monthlyPrice(profile.category)}.`
              : `Ou ${annualPrice(profile.category)}/an, payés en une fois : ${annualSaving(profile.category)} d’économie par rapport à 12 mensualités.`}
          </p>
          <p className="price-caveat">Les mêmes fonctionnalités et quotas sont inclus, quelle que soit la périodicité.</p>
          <ul className="premium-benefits">
            <li>{premium.contacts} nouvelles demandes de conversation par mois</li>
            <li>{premium.searches} recherches favorites avec alertes de nouveautés</li>
            <li>Programmation des publications et statistiques détaillées</li>
            <li>{premium.events} événements actifs, récurrence et agenda avancé</li>
            <li>
              {profile.category === "Sportif"
                ? "30 candidatures par mois et jusqu’à 15 demandes de rendez-vous"
                : "Viviers, notes privées, sessions d’essais et outils de coordination"}
            </li>
          </ul>
          <Button className="action primary" disabled={paid} onClick={() => setConfirm(true)}>
            {paid ? "Premium actif dans la démo" : "Essayer Premium dans la démo"}
          </Button>
          <p className="demo-context">
            Simulation gratuite. Aucun prélèvement, aucune carte, aucun abonnement réel. TVA et
            conditions commerciales à préciser avant lancement.
          </p>
        </article>}
        <section className="extension-card">
          <h2>Vos accès, en détail</h2>
          <p>
            Référence : fichier d’offres mis à jour par le propriétaire. Réponses et interactions
            gratuites, y compris sans abonnement.
          </p>
          <div className="extension-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Fonctionnalité</th>
                  <th>Gratuit</th>
                  <th>Premium</th>
                </tr>
              </thead>
              <tbody>
                {(all ? rows : rows.filter((r) => r.free !== "V")).map((r) => (
                  <tr key={r.feature}>
                    <td>
                      <strong>{r.feature}</strong>
                      <details>
                        <summary>Comprendre</summary>
                        <p>{r.detail}</p>
                      </details>
                    </td>
                    <td>{r.free}</td>
                    <td>{r.paid}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button variant="outline" onClick={() => setAll(!all)}>
            {all ? "Voir uniquement les différences" : "Voir toutes les fonctionnalités"}
          </Button>
        </section>
        <section className="extension-card">
          <h2>Comment les limites fonctionnent</h2>
          <p>
            Les connexions acceptées peuvent échanger sans consommer de quota. Hors connexions, un quota de contact est consommé au premier message vers un nouvel interlocuteur, pas à
            chaque réponse. Le quota gratuit est de {free.contacts} nouveaux contacts par mois,
            contre {premium.contacts} en Premium. Les réceptions et conversations déjà engagées
            restent gratuites.
          </p>
          <p>
            Les quotas mensuels suivent le mois civil, heure de Bruxelles. Les photos, vidéos et
            documents sont des capacités totales conservées. Une formule gratuite permet de créer un
            événement par mois ; Premium limite le nombre d’événements actifs.
          </p>
          <p>
            Revenir à Gratuit ne supprime pas vos contenus : la création au-delà des limites est
            bloquée. Les programmations sont suspendues tant que Premium est inactif.
          </p>
        </section>
        <details className="subscription-demo-controls">
          <summary>Tester un autre cas dans la démo</summary>
          <label htmlFor="demo-category">Type de compte fictif</label>
          <NativeSelect
            id="demo-category"
            disabled={profile.registrationMode === "child"}
            value={profile.category}
            onChange={(e) => {
              setCareerActor("self");
              setProfile({ ...profile, category: e.target.value as Category });
            }}
          >
            {categories.map((c) => (
              <NativeSelectOption key={c} value={c}>
                {categoryLabel(c)}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          {paid && (
            <Button
              variant="outline"
              onClick={() => {
                dispatchSocial({ type: "subscription", category: null });
                notify("Retour au compte gratuit simulé.");
              }}
            >
              Revenir à Gratuit dans la démo
            </Button>
          )}
        </details>
        <nav className="extension-nav">
          <Link href="/outils">Essayer les extensions</Link>
          <Link href="/accueil">Continuer dans l’app</Link>
        </nav>
        <Modal
          open={confirm && !paid}
          onOpenChange={setConfirm}
          title="Activez la simulation"
          description="Vous débloquez les outils Premium de ce profil fictif. Aucun paiement réel."
        >
          <p>
            {categoryLabel(profile.category)} · {annual ? annualPrice(profile.category) + "/an, en une fois" : monthlyPrice(profile.category) + "/mois"} affichés ·
            montant prélevé : 0 €.
          </p>
          <Button
            className="action primary"
            onClick={() => {
              dispatchSocial({ type: "subscription", category: profile.category });
              setCareerActor("self");
              setConfirm(false);
              notify("Premium activé dans la démo.");
            }}
          >
            Activer Premium dans la démo
          </Button>
        </Modal>
      </div>
    </ProfileLayout>
  );
}
