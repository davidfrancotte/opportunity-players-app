import type { Profile } from "./model";

export type Guardian = { name: string; relationship: string; consent: boolean };
export type Achievement = { id: string; sport: string; title: string; event: string; year: string };
export type SportVideo = { id: string; sport: string; title: string; url: string; size: number };
export const availabilityOptions = [
  "Non renseignée",
  "Disponible",
  "Disponible à partir du",
  "À l’écoute",
  "Indisponible",
];
export const contractOptions = [
  "Non renseignée",
  "Libre",
  "Sous contrat",
  "Amateur",
  "En formation",
];
export function ageOn(birthDate: string | undefined, today = new Date()): number | null {
  if (!birthDate || !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) return null;
  const [y, m, d] = birthDate.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d)
    return null;
  const age =
    today.getFullYear() -
    y -
    (today.getMonth() + 1 < m || (today.getMonth() + 1 === m && today.getDate() < d) ? 1 : 0);
  return age < 0 || age > 120 || date.getTime() > today.getTime() ? null : age;
}
export function sportProfileIssues(
  p: Pick<Profile, "birthDate" | "registrationMode" | "guardian" | "category" | "disciplines">,
) {
  const errors: Record<string, string> = {};
  const age = ageOn(p.birthDate);
  if (p.birthDate && age === null) errors.birthDate = "Indiquez une date de naissance valide.";
  if (p.registrationMode === "child") {
    if (p.category !== "Sportif") errors.category = "Le profil enfant est un profil sportif.";
    if (age === null || age >= 18)
      errors.birthDate =
        "Le profil enfant nécessite une date de naissance et un âge inférieur à 18 ans.";
    if (!p.guardian?.name.trim()) errors.guardianName = "Indiquez le nom du représentant.";
    if (!p.guardian?.relationship.trim())
      errors.guardianRelationship = "Précisez votre lien avec l’enfant.";
    if (!p.guardian?.consent)
      errors.guardianConsent = "La confirmation du représentant est nécessaire.";
  } else if (age !== null && age < 18)
    errors.birthDate = "Pour un mineur, choisissez « J’inscris mon enfant ».";
  for (const r of p.disciplines || []) {
    if (
      r.availability === "Disponible à partir du" &&
      (!r.availableFrom ||
        !/^\d{4}-\d{2}-\d{2}$/.test(r.availableFrom) ||
        Number.isNaN(Date.parse(r.availableFrom)))
    )
      errors.availableFrom = "Indiquez une date de disponibilité.";
  }
  return errors;
}
export function videoFileIssue(file: { type: string; size: number }) {
  if (!["video/mp4", "video/webm"].includes(file.type)) return "Choisissez une vidéo MP4 ou WebM.";
  if (!file.size || file.size > 50 * 1024 * 1024)
    return "La vidéo doit peser entre 1 octet et 50 Mo.";
  return "";
}
