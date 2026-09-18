export const DEMO_PASSWORD = "ArenaDemo2026!";
export const DEMO_CODE = "246810";
export const DEMO_EMAIL = "alex@demo.example";
export const sports = [
  "Padel",
  "Football",
  "Basketball",
  "Tennis",
  "Handball",
  "Rugby",
  "Volleyball",
  "Hockey sur gazon",
  "Pickleball",
  "Futsal",
  "Boxe",
  "Athlétisme",
];
export const categories = ["Sportif", "Professionnel", "Organisation"] as const;
export type Category = (typeof categories)[number];
export type Experience = {
  id: string;
  title: string;
  organisation: string;
  period: string;
  description: string;
};
export type Profile = {
  firstName: string;
  lastName: string;
  email: string;
  category: Category;
  organisation: string;
  headline: string;
  sport: string;
  city: string;
  bio: string;
  objective: string;
  skills: string[];
  experiences: Experience[];
  photo: string;
  media: string[];
};
export type Identity = { firstName: string; lastName: string; email: string };
export type Issues = Record<string, string>;
export const photos = [
  { src: "/images/coach.webp", label: "Portrait du coach fictif" },
  { src: "/images/padel-color.webp", label: "Sur le terrain de padel" },
  { src: "/images/tennis-color.webp", label: "Un moment de tennis" },
  { src: "/images/football-color.webp", label: "L’esprit collectif" },
  { src: "/images/basketball-color.webp", label: "Sur le parquet" },
  { src: "/images/athletics-color.webp", label: "Le goût du dépassement" },
];
export const initialProfile: Profile = {
  firstName: "Alex",
  lastName: "Dupont",
  email: DEMO_EMAIL,
  category: "Professionnel",
  organisation: "",
  headline: "Coach de padel",
  sport: "Padel",
  city: "Liège, Belgique",
  bio: "Accompagner chaque joueur dans sa progression. Sur le terrain, je privilégie l’écoute, le plaisir de jouer et une technique qui fait la différence.",
  objective: "Échanger avec des clubs et partager de nouvelles méthodes d’entraînement.",
  skills: ["Pédagogie", "Technique", "Accompagnement"],
  experiences: [
    {
      id: "experience-1",
      title: "Coach de padel",
      organisation: "Club Horizon · fictif",
      period: "2023 — Aujourd’hui",
      description: "Séances individuelles et collectives. Accompagnement de joueurs amateurs.",
    },
    {
      id: "experience-2",
      title: "Encadrement sportif",
      organisation: "Collectif Arena · fictif",
      period: "2021 — 2023",
      description: "Animation de stages et découverte des sports de raquette.",
    },
  ],
  photo: "/images/coach.webp",
  media: ["/images/padel-color.webp", "/images/tennis-color.webp"],
};
export function validEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) && email.length <= 254;
}
export function validateIdentity(identity: Identity, password: string): Issues {
  const errors: Issues = {};
  if (!identity.firstName.trim()) errors.firstName = "Indiquez un prénom fictif.";
  if (!identity.lastName.trim()) errors.lastName = "Indiquez un nom fictif.";
  if (!validEmail(identity.email)) errors.email = "Indiquez une adresse au format nom@exemple.com.";
  if (password !== DEMO_PASSWORD)
    errors.password = `Pour cette démo, utilisez uniquement ${DEMO_PASSWORD}`;
  return errors;
}
export function validateDemoLogin(email: string, password: string, currentEmail: string): Issues {
  const errors: Issues = {};
  const normalized = email.trim().toLowerCase();
  if (!validEmail(normalized)) errors.email = "Indiquez une adresse valide.";
  else if (normalized !== DEMO_EMAIL && normalized !== currentEmail.toLowerCase())
    errors.email = "Utilisez alex@demo.example ou l’adresse du profil créé pendant cette visite.";
  if (password !== DEMO_PASSWORD)
    errors.password = "Le mot de passe de démonstration est ArenaDemo2026!";
  return errors;
}
export function validDemoCode(code: string) {
  return code === DEMO_CODE;
}
export function validateProfile(profile: Profile): Issues {
  const errors: Issues = {};
  if (!profile.firstName.trim()) errors.firstName = "Le prénom est requis.";
  if (!profile.lastName.trim()) errors.lastName = "Le nom est requis.";
  if (!categories.includes(profile.category)) errors.category = "Choisissez un type de profil.";
  if (profile.category === "Organisation" && !profile.organisation.trim())
    errors.organisation = "Indiquez le nom de votre organisation fictive.";
  if (!profile.headline.trim()) errors.headline = "Décrivez votre rôle dans le sport.";
  if (!sports.includes(profile.sport)) errors.sport = "Choisissez une discipline.";
  if (!profile.city.trim()) errors.city = "Indiquez une ville.";
  if (profile.bio.length > 600) errors.bio = "Limitez la présentation à 600 caractères.";
  return errors;
}
export function createProfile(identity: Identity): Profile {
  return {
    ...initialProfile,
    ...identity,
    firstName: identity.firstName.trim(),
    lastName: identity.lastName.trim(),
    email: identity.email.trim().toLowerCase(),
    category: "Sportif",
    organisation: "",
    headline: "",
    city: "",
    bio: "",
    objective: "",
    skills: [],
    experiences: [],
    media: [],
  };
}
export function displayName(profile: Profile) {
  return profile.category === "Organisation"
    ? profile.organisation
    : `${profile.firstName} ${profile.lastName}`;
}
export function completion(profile: Profile) {
  const items = [
    {
      label: "Identité et discipline",
      done: !!profile.firstName && !!profile.headline && !!profile.city,
    },
    { label: "Présentation", done: !!profile.bio.trim() },
    { label: "Compétences", done: profile.skills.length > 0 },
    { label: "Objectif", done: !!profile.objective.trim() },
    { label: "Parcours", done: profile.experiences.length > 0 },
    { label: "Médias", done: profile.media.length > 0 },
  ];
  return { items, count: items.filter((x) => x.done).length, total: items.length };
}
export function cvText(profile: Profile) {
  return [
    "OPPORTUNITY PLAYERS — PROFIL FICTIF DE DÉMONSTRATION",
    "",
    displayName(profile),
    profile.headline,
    `${profile.sport} · ${profile.city}`,
    "",
    "PRÉSENTATION",
    profile.bio || "À compléter",
    "",
    "COMPÉTENCES",
    profile.skills.join(" · ") || "À compléter",
    "",
    "PARCOURS",
    ...profile.experiences.flatMap((x) => [
      x.title,
      `${x.organisation} · ${x.period}`,
      x.description,
      "",
    ]),
    "Document généré localement. Ne constitue pas le CV d’une personne réelle.",
  ].join("\n");
}
