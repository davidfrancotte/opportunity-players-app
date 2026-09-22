"use client";
import { ExtensionPage } from "./extension-screens";
import { AgendaPage } from "./agenda-screen";
import { ApplicationsPage, RecruitmentPage, AppointmentsPage } from "./career-screens";
import { SportsPortfolioPage } from "./sport-portfolio";
import { Suspense } from "react";
import {
  DisciplinesPage,
  AgentPage,
  DocumentsPage,
  SafetyPage,
  ReferralPage,
  PoliciesPage,
  SecondFactorPage,
} from "./trust-screens";
import {
  Signup,
  VerifyEmail,
  Personalise,
  Presentation,
  Login,
  ForgotPassword,
} from "./auth-screens";
import { ProfilePage, ProfileLayout, EditProfile, SettingsPage } from "./profile-screens";
import { SubscriptionPage } from "./subscription-screen";
import { FeedPage, NetworkPage, MessagesPage, OpportunitiesPage } from "./social-screens";
import { PlayPage, CreateMatchPage, MatchPage, NotificationsPage } from "./play-screens";
export function StudioScreen({ screen }: { screen: string }) {
  switch (screen) {
    case "outils":
    case "recherches":
    case "publications-programmees":
    case "talents":
    case "essais-groupes":
    case "equipes":
    case "statistiques":
      return <ExtensionPage section={screen} />;
    case "calendrier-avance":
      return <AgendaPage />;
    case "candidatures":
      return <ApplicationsPage />;
    case "recrutement":
      return <RecruitmentPage />;
    case "rendez-vous":
      return <AppointmentsPage />;
    case "dossier-sportif":
      return <SportsPortfolioPage />;
    case "disciplines":
      return <DisciplinesPage />;
    case "agent":
      return <AgentPage />;
    case "documents":
      return <DocumentsPage />;
    case "securite":
      return <SafetyPage />;
    case "parrainage":
      return <ReferralPage />;
    case "confidentialite":
      return <PoliciesPage />;
    case "double-facteur":
      return <SecondFactorPage />;
    case "jouer":
      return <PlayPage />;
    case "organiser":
      return <CreateMatchPage />;
    case "match":
      return (
        <Suspense
          fallback={
            <ProfileLayout>
              <p>Chargement du match…</p>
            </ProfileLayout>
          }
        >
          <MatchPage />
        </Suspense>
      );
    case "agenda":
      return <AgendaPage />;
    case "notifications":
      return <NotificationsPage />;
    case "abonnement":
      return <SubscriptionPage />;
    case "accueil":
      return <FeedPage />;
    case "reseau":
      return <NetworkPage />;
    case "messages":
      return <MessagesPage />;
    case "opportunities":
      return <OpportunitiesPage />;
    case "inscription":
      return <Signup />;
    case "verification":
      return <VerifyEmail />;
    case "personnalisation":
      return <Personalise />;
    case "presentation":
      return <Presentation />;
    case "connexion":
      return <Login />;
    case "mot-de-passe-oublie":
      return <ForgotPassword />;
    case "profil":
      return <ProfilePage key="profil" />;
    case "parcours":
      return <ProfilePage key="parcours" section="career" />;
    case "medias":
      return <ProfilePage key="medias" section="media" />;
    case "modifier-profil":
      return <EditProfile />;
    case "parametres":
      return <SettingsPage />;
    default:
      return null;
  }
}
