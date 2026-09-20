import type { Profile } from "./model";

export const sideNames: Record<string, string> = {
  Gauche: "Gaucher / gauchère",
  Droite: "Droitier / droitière",
  Ambidextre: "Ambidextre",
};
export function normalizeMeasurement(value: string) {
  return value.trim().replace(",", ".");
}
export function athleteIssues(profile: Pick<Profile, "category" | "weightKg" | "heightCm">) {
  const issues: Record<string, string> = {};
  if (profile.category !== "Sportif") return issues;
  for (const [key, max, unit] of [
    ["weightKg", 500, "kg"],
    ["heightCm", 300, "cm"],
  ] as const) {
    const value = normalizeMeasurement(profile[key] || "");
    if (value && (!/^\d+(\.\d{1,2})?$/.test(value) || Number(value) <= 0 || Number(value) > max)) {
      issues[key] =
        `Indiquez une valeur supérieure à 0 et au maximum ${max} ${unit}, ou laissez vide.`;
    }
  }
  return issues;
}
export function measurementLabel(value: string, unit: string) {
  return value?.trim()
    ? `${normalizeMeasurement(value).replace(".", ",")} ${unit}`
    : "Non renseigné";
}
