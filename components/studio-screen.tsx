"use client";
import {
  Signup,
  VerifyEmail,
  Personalise,
  Presentation,
  Login,
  ForgotPassword,
} from "./auth-screens";
import { ProfilePage, EditProfile, SettingsPage } from "./profile-screens";
import { SubscriptionPage } from "./subscription-screen";
import { FeedPage, NetworkPage, MessagesPage, OpportunitiesPage } from "./social-screens";
export function StudioScreen({ screen }: { screen: string }) {
  switch (screen) {
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
