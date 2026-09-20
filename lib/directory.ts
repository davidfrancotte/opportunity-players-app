import type { Category, Profile } from "./model";
import { ageOn } from "./sport-profile.ts";
import type { Member } from "./social";
import { normalizeText, levels, type SportRecord } from "./trust.ts";

// One vocabulary shared by profile forms and network filters.
export const professionalTypes = [
  "Scout",
  "Entraîneur",
  "Entraîneur de gardiens",
  "Sélectionneur national",
  "Entraîneur adjoint",
  "Analyste vidéo",
  "Team manager",
  "Arbitre",
  "Kiné",
  "Nutritionniste",
  "Ostéopathe",
  "Médecin sportif",
  "Physiothérapeute",
  "Agent",
  "Préparateur physique",
  "Coach mental",
  "Personal trainer",
  "Formateur",
  "Journaliste",
  "Massothérapeute",
  "Sophrologue",
  "Entraîneur sportif",
  "Média",
  "Photographe sportif",
  "Conseiller en placement sportif universitaire",
  "Diététicien du sport",
];
export const collectiveTypes = [
  "Fédération",
  "Association",
  "Université",
  "Académie",
  "Sport études",
  "Équipe",
  "Club",
];
export const genders = ["Femme", "Homme", "Non binaire", "Préfère ne pas préciser"];
export const dominantSides = ["Gauche", "Droite", "Ambidextre"];
export const countrySuggestions = [
  "Belgique",
  "France",
  "Luxembourg",
  "Suisse",
  "Pays-Bas",
  "Allemagne",
  "Espagne",
  "Italie",
  "Portugal",
  "Royaume-Uni",
  "Maroc",
  "Algérie",
  "Tunisie",
  "Sénégal",
  "Côte d’Ivoire",
  "Cameroun",
  "Canada",
  "États-Unis",
  "Brésil",
];
export const positions: Record<string, string[]> = {
  Football: [
    "Gardien",
    "Défenseur central",
    "Latéral",
    "Milieu défensif",
    "Milieu central",
    "Milieu offensif",
    "Ailier",
    "Attaquant",
  ],
  Futsal: ["Gardien", "Fixe", "Ailier", "Pivot"],
  Basketball: ["Meneur", "Arrière", "Ailier", "Ailier fort", "Pivot"],
  Handball: [
    "Gardien",
    "Ailier gauche",
    "Ailier droit",
    "Arrière gauche",
    "Arrière droit",
    "Demi-centre",
    "Pivot",
  ],
  Rugby: [
    "Pilier",
    "Talonneur",
    "Deuxième ligne",
    "Troisième ligne",
    "Demi de mêlée",
    "Demi d’ouverture",
    "Centre",
    "Ailier",
    "Arrière",
  ],
  Volleyball: ["Passeur", "Réceptionneur-attaquant", "Central", "Pointu", "Libéro"],
  "Hockey sur gazon": ["Gardien", "Défenseur", "Milieu", "Attaquant"],
  Padel: ["Joueur à gauche", "Joueur à droite", "Polyvalent"],
  Tennis: ["Simple", "Double", "Polyvalent"],
  Pickleball: ["Simple", "Double", "Polyvalent"],
};
export function positionsFor(sport: string) {
  return [
    ...new Set(sport === "Tous" ? Object.values(positions).flat() : positions[sport] || []),
    "Non applicable",
  ];
}
export function sideLabel(sport: string) {
  return ["Football", "Futsal"].includes(sport) ? "Pied dominant" : "Bras / pied dominant";
}
export function typesFor(category: Category) {
  return category === "Professionnel"
    ? professionalTypes
    : category === "Organisation"
      ? collectiveTypes
      : [];
}
export function directoryIssues(
  profile: Pick<Profile, "category" | "country" | "gender" | "accountType">,
) {
  const errors: Record<string, string> = {};
  if (!profile.country?.trim()) errors.country = "Indiquez votre pays.";
  if (profile.category !== "Sportif" && !typesFor(profile.category).includes(profile.accountType))
    errors.accountType = "Choisissez un type de compte pour cette catégorie.";
  if (profile.category === "Sportif" && profile.gender && !genders.includes(profile.gender))
    errors.gender = "Choisissez une option de genre proposée.";
  return errors;
}
export function primaryRecord(profile: Profile): SportRecord {
  return (
    profile.disciplines.find((r) => r.sport === profile.sport) || {
      sport: profile.sport,
      level: "Loisir",
      ranking: "",
      federation: "",
      clubs: [],
    }
  );
}
export function updatePrimaryRecord(profile: Profile, patch: Partial<SportRecord>): Profile {
  const record = { ...primaryRecord(profile), ...patch, sport: profile.sport };
  return {
    ...profile,
    disciplines: profile.disciplines.some((r) => r.sport === profile.sport)
      ? profile.disciplines.map((r) => (r.sport === profile.sport ? record : r))
      : [...profile.disciplines, record],
  };
}
export type DirectoryFilters = {
  ageMin: string;
  ageMax: string;
  paraSport: string;
  availability: string;
  contractStatus: string;
  kind: string;
  sport: string;
  country: string;
  city: string;
  gender: string;
  level: string;
  position: string;
  dominantSide: string;
  accountType: string;
  club: string;
  ranking: string;
  query: string;
};
export const emptyDirectoryFilters: DirectoryFilters = {
  ageMin: "",
  ageMax: "",
  paraSport: "Tous",
  availability: "Tous",
  contractStatus: "Tous",
  kind: "Tous",
  sport: "Tous",
  country: "",
  city: "",
  gender: "Tous",
  level: "Tous",
  position: "",
  dominantSide: "Tous",
  accountType: "Tous",
  club: "",
  ranking: "",
  query: "",
};
export function changeDirectoryKind(filters: DirectoryFilters, kind: string): DirectoryFilters {
  return {
    ...filters,
    kind,
    ageMin: "",
    ageMax: "",
    paraSport: "Tous",
    availability: "Tous",
    contractStatus: "Tous",
    gender: "Tous",
    level: "Tous",
    position: "",
    dominantSide: "Tous",
    accountType: "Tous",
    club: "",
    ranking: "",
  };
}
const contains = (value: string, query: string) =>
  normalizeText(value).includes(normalizeText(query.trim()));
export function matchesDirectory(member: Member, records: SportRecord[], f: DirectoryFilters) {
  if (f.kind !== "Tous" && member.kind !== f.kind) return false;
  if (!contains(member.country, f.country) || !contains(member.city, f.city)) return false;
  const playerFilters = f.kind === "Joueurs";
  if (playerFilters && (f.ageMin || f.ageMax)) {
    const age = ageOn(member.birthDate);
    if (
      age === null ||
      (f.ageMin && age < Number(f.ageMin)) ||
      (f.ageMax && age > Number(f.ageMax))
    )
      return false;
  }
  if (playerFilters && f.gender !== "Tous" && member.gender !== f.gender) return false;
  if (
    ["Professionnels", "Collectives"].includes(f.kind) &&
    f.accountType !== "Tous" &&
    member.accountType !== f.accountType
  )
    return false;
  const sportMatch = records.length
    ? records.some(
        (r) =>
          (f.sport === "Tous" || r.sport === f.sport) &&
          (!playerFilters ||
            ((!f.paraSport || f.paraSport === "Tous" || r.paraSport === f.paraSport) &&
              (!f.availability || f.availability === "Tous" || r.availability === f.availability) &&
              (!f.contractStatus ||
                f.contractStatus === "Tous" ||
                r.contractStatus === f.contractStatus) &&
              (f.level === "Tous" || r.level === f.level) &&
              contains(r.position || "", f.position) &&
              (f.dominantSide === "Tous" || r.dominantSide === f.dominantSide) &&
              contains(r.ranking, f.ranking) &&
              (!f.club.trim() || r.clubs.some((c) => contains(c.name, f.club))))),
      )
    : (f.sport === "Tous" || member.sport === f.sport) &&
      (!playerFilters ||
        ((!f.paraSport || f.paraSport === "Tous") &&
          (!f.availability || f.availability === "Tous") &&
          (!f.contractStatus || f.contractStatus === "Tous") &&
          f.level === "Tous" &&
          !f.position.trim() &&
          f.dominantSide === "Tous" &&
          !f.club.trim() &&
          !f.ranking.trim()));
  if (!sportMatch) return false;
  return contains(
    [
      member.name,
      member.role,
      member.city,
      member.country,
      member.accountType || "",
      member.sport,
      ...records.flatMap((r) => [r.sport, ...r.clubs.map((c) => c.name)]),
    ].join(" "),
    f.query,
  );
}
export { levels };
