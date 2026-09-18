import type { Category } from "./model";
// Monthly prices explicitly selected by the product owner on 19 September 2026.
// No annual offer, introductory discount, tax status or renewal terms have been approved.
export const monthlyPricesInCents: Record<Category, number> = {
  Sportif: 299,
  Professionnel: 1499,
  Organisation: 2999,
};
export function monthlyPrice(category: Category) {
  return (monthlyPricesInCents[category] / 100).toFixed(2).replace(".", ",") + " €";
}
