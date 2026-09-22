import { emptyDirectoryFilters, type DirectoryFilters } from "./directory.ts";

export const feedCategories = [
  "Matchs ouverts",
  "Offres d’emploi",
  "Opportunités",
  "News",
  "Divers",
] as const;
export const opportunityCategories = [
  "Recrutement de joueurs",
  "Essais et détections",
  "Partenaires de jeu",
  "Coaching et accompagnement",
  "Sponsoring et partenariats",
] as const;
export type FeedCategory = (typeof feedCategories)[number];
export type OpportunityCategory = (typeof opportunityCategories)[number];
export type PostClassification = {
  category?: FeedCategory;
  opportunityCategory?: OpportunityCategory;
};
export type FeedFilters = {
  category: string;
  opportunityCategory: string;
  sport: string;
  query: string;
};
export const emptyFeedFilters: FeedFilters = {
  category: "Tous",
  opportunityCategory: "Tous",
  sport: "Tous",
  query: "",
};
const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
export function matchesFeed(
  post: PostClassification & { sport: string; text: string; name?: string },
  filters: FeedFilters,
  premium: boolean,
) {
  if (!premium) return true;
  return (
    (filters.category === "Tous" || (post.category || "Divers") === filters.category) &&
    (filters.category !== "Opportunités" ||
      filters.opportunityCategory === "Tous" ||
      post.opportunityCategory === filters.opportunityCategory) &&
    (filters.sport === "Tous" || post.sport === filters.sport) &&
    normalize(`${post.name || ""} ${post.text}`).includes(normalize(filters.query.trim()))
  );
}
export function validClassification(post: PostClassification) {
  return (
    (!post.category || feedCategories.includes(post.category)) &&
    (post.category !== "Opportunités" ||
      (!!post.opportunityCategory && opportunityCategories.includes(post.opportunityCategory))) &&
    (!post.opportunityCategory || post.category === "Opportunités")
  );
}
// A downgrade must ignore all advanced criteria, including state entered while Premium.
export function memberSearchFilters(filters: DirectoryFilters, premium: boolean): DirectoryFilters {
  return premium
    ? {
        ...emptyDirectoryFilters,
        query: filters.query,
        country: filters.country,
        city: filters.city,
        sport: filters.sport,
        ranking: filters.ranking,
        kind: filters.ranking.trim() ? "Joueurs" : "Tous",
      }
    : { ...emptyDirectoryFilters, query: filters.query };
}
