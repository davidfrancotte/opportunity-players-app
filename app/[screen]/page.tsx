import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { StudioScreen } from "@/components/studio-screen";
const titles: Record<string, string> = {
  "dossier-sportif": "Dossier sportif",
  disciplines: "Sports, niveaux et clubs",
  agent: "Mon agent",
  documents: "CV et références",
  securite: "Sécurité et modération",
  parrainage: "Inviter mon réseau",
  confidentialite: "Confidentialité et charte",
  "double-facteur": "Seconde validation",
  accueil: "Accueil",
  reseau: "Mon réseau",
  jouer: "Jouer ensemble",
  organiser: "Organiser un match",
  match: "Votre match",
  agenda: "Mon agenda",
  notifications: "Notifications",
  messages: "Messages",
  opportunities: "Opportunities",
  abonnement: "Mon abonnement",
  inscription: "Créer un compte",
  verification: "Vérifier votre e-mail",
  personnalisation: "Votre univers sportif",
  presentation: "Votre présentation",
  connexion: "Se connecter",
  "mot-de-passe-oublie": "Retrouver votre accès",
  profil: "Mon profil",
  parcours: "Mon parcours",
  medias: "Mes médias",
  "modifier-profil": "Modifier mon profil",
  parametres: "Réglages de la démo",
};
export function generateStaticParams() {
  return Object.keys(titles).map((screen) => ({ screen }));
}
export const dynamicParams = false;
export async function generateMetadata({
  params,
}: {
  params: Promise<{ screen: string }>;
}): Promise<Metadata> {
  const { screen } = await params;
  return { title: `${titles[screen] || "Page introuvable"} — Arena Studio` };
}
export default async function Page({
  params,
}: {
  params: Promise<{ screen: string }>;
}) {
  const { screen } = await params;
  if (!titles[screen]) notFound();
  return <StudioScreen screen={screen} />;
}
