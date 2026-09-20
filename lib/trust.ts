// Demonstration only. Neither these rules nor the client state are security controls.
export const levels = ["Débutant", "Loisir", "Intermédiaire", "Compétition", "Professionnel"];
export type ClubRecord = {
  id: string;
  name: string;
  current: boolean;
  period: string;
};
export type SportRecord = {
  paraSport?: "yes" | "no" | "";
  availability?: string;
  availableFrom?: string;
  contractStatus?: string;
  licenceNumber?: string;
  licenceSeason?: string;
  sport: string;
  position?: string;
  dominantSide?: string;
  level: string;
  ranking: string;
  federation: string;
  clubs: ClubRecord[];
};
export type AgentRecord = {
  name: string;
  memberId: string;
  status: "none" | "declared" | "pending" | "confirmed";
};
export type Review = {
  id: string;
  memberId: string;
  sport: string;
  club: string;
  author: string;
  score: number;
  text: string;
  status: "pending" | "published" | "contested";
  relationship: string;
};
export type DocumentRecord = {
  id: string;
  name: string;
  kind: "CV" | "Référence" | "Photo";
  sport: string;
  club: string;
  size: number;
  status: "pending" | "rejected";
  reason: string;
};
export type Referral = {
  id: string;
  email: string;
  stage: 0 | 1 | 2 | 3;
  credited: boolean;
};
export type TrustState = {
  blocked: string[];
  reports: {
    id: string;
    memberId: string;
    reason: string;
    status: "received" | "appeal";
  }[];
  documents: DocumentRecord[];
  reviews: Review[];
  referrals: Referral[];
  rewardMonths: number;
  rewardActivated: boolean;
  policy: boolean;
  accuracy: boolean;
  policyVersion: string;
  securityStep: boolean;
  error: string;
};
export function createTrustState(): TrustState {
  return {
    blocked: [],
    reports: [],
    documents: [],
    reviews: [],
    referrals: [],
    rewardMonths: 0,
    rewardActivated: false,
    policy: false,
    accuracy: false,
    policyVersion: "2026-09-demo",
    securityStep: false,
    error: "",
  };
}
export const normalizeText = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[._-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
// Deliberately small deterministic demo, not a semantic moderation system.
export function moderateText(text: string): string | null {
  const value = normalizeText(text);
  if (/\[test racisme\]|\b(sale race|retourne dans ton pays)\b/.test(value))
    return "Propos racistes ou discriminatoires";
  if (/\[test sexisme\]|\b(les femmes sont nulles|les femmes ne savent pas jouer)\b/.test(value))
    return "Propos sexistes";
  if (/\[test menace\]|\b(je vais te tuer|je vais te frapper)\b/.test(value)) return "Menace";
  if (/\[test harcelement\]|\b(ferme ta gueule|sale merde)\b/.test(value))
    return "Insulte ou harcèlement";
  return null;
}
export function fileDecision(
  name: string,
  type: string,
  size: number,
  kind: DocumentRecord["kind"],
) {
  if (size <= 0 || size > 10 * 1024 * 1024) return "Fichier vide ou supérieur à 10 Mo.";
  if (kind === "Photo")
    return /\.(jpg|jpeg|png|webp)$/i.test(name) &&
      ["image/jpeg", "image/png", "image/webp"].includes(type)
      ? null
      : "Choisissez une image JPG, PNG ou WebP. SVG et fichiers animés non acceptés.";
  return /\.pdf$/i.test(name) && type === "application/pdf"
    ? null
    : "Choisissez un document PDF (10 Mo maximum).";
}
export const memberSports: Record<string, SportRecord[]> = {
  ines: [
    {
      sport: "Football",
      level: "Compétition",
      position: "Gardien",
      dominantSide: "Droite",
      ranking: "Régional · exemple",
      federation: "France · déclaration fictive",
      clubs: [],
    },
  ],
  lea: [
    {
      sport: "Tennis",
      paraSport: "yes",
      availability: "Disponible",
      contractStatus: "Libre",
      position: "Double",
      dominantSide: "Droite",
      level: "Compétition",
      ranking: "C15.2 · exemple",
      federation: "Belgique · déclaration fictive",
      clubs: [
        {
          id: "lea-tennis",
          name: "Tennis Club Arena",
          current: true,
          period: "2023 — aujourd’hui",
        },
      ],
    },
    {
      sport: "Padel",
      position: "Joueur à gauche",
      dominantSide: "Gauche",
      level: "Intermédiaire",
      ranking: "P200 · exemple",
      federation: "Belgique · déclaration fictive",
      clubs: [
        {
          id: "lea-padel",
          name: "Horizon Padel",
          current: false,
          period: "2022 — 2023",
        },
      ],
    },
  ],
  noah: [
    {
      sport: "Basketball",
      position: "Ailier",
      dominantSide: "Ambidextre",
      level: "Compétition",
      ranking: "Régional · exemple",
      federation: "Belgique · déclaration fictive",
      clubs: [
        {
          id: "noah-basket",
          name: "Liège Arena Basket",
          current: true,
          period: "2024 — aujourd’hui",
        },
      ],
    },
    {
      sport: "Football",
      position: "Gardien",
      dominantSide: "Gauche",
      level: "Loisir",
      ranking: "Amateur · exemple",
      federation: "",
      clubs: [
        {
          id: "noah-foot",
          name: "United Sport",
          current: false,
          period: "2020 — 2022",
        },
      ],
    },
  ],
};
export function matchesSportRecords(
  records: SportRecord[],
  sport: string,
  level: string,
  club: string,
  ranking = "",
) {
  return records.some(
    (r) =>
      (sport === "Tous" || r.sport === sport) &&
      (level === "Tous" || r.level === level) &&
      (!ranking || normalizeText(r.ranking).includes(normalizeText(ranking))) &&
      (!club || r.clubs.some((c) => normalizeText(c.name).includes(normalizeText(club)))),
  );
}
export type TrustAction =
  | { type: "block"; id: string }
  | { type: "report"; id: string; memberId: string; reason: string }
  | { type: "document"; document: DocumentRecord }
  | { type: "remove-document"; id: string }
  | { type: "review"; review: Review; professional: boolean }
  | { type: "review-status"; id: string; status: "published" | "contested" }
  | { type: "referral"; referral: Referral; ownEmail: string }
  | { type: "referral-step"; id: string }
  | { type: "activate-reward" }
  | { type: "consent"; policy: boolean; accuracy: boolean }
  | { type: "security"; enabled: boolean }
  | { type: "reset" };
export function trustReducer(state: TrustState, a: TrustAction): TrustState {
  const s = structuredClone(state);
  s.error = "";
  const fail = (error: string) => ({ ...state, error });
  if (a.type === "reset") return createTrustState();
  if (a.type === "consent") {
    s.policy = a.policy;
    s.accuracy = a.accuracy;
    return s;
  }
  if (a.type === "security") {
    s.securityStep = a.enabled;
    return s;
  }
  if (a.type === "block") {
    s.blocked = s.blocked.includes(a.id)
      ? s.blocked.filter((id) => id !== a.id)
      : [...s.blocked, a.id];
    return s;
  }
  if (a.type === "report") {
    if (!a.reason.trim()) return fail("Choisissez un motif.");
    s.reports.unshift({ ...a, status: "received" });
    return s;
  }
  if (a.type === "document") {
    // The category-specific photo/document cap is checked by DemoProvider.
    if (s.documents.length >= 70) return fail("Capacité maximale de cette démo atteinte.");
    s.documents.unshift(a.document);
    return s;
  }
  if (a.type === "remove-document") {
    s.documents = s.documents.filter((d) => d.id !== a.id);
    return s;
  }
  if (a.type === "review") {
    const r = a.review;
    if (!a.professional || !memberSports[r.memberId])
      return fail(
        "Les avis sont réservés aux professionnels et aux expériences de joueurs identifiées.",
      );
    if (
      !memberSports[r.memberId].some(
        (s) => s.sport === r.sport && s.clubs.some((c) => c.name === r.club),
      ) ||
      !r.club ||
      !r.relationship.trim() ||
      !r.text.trim() ||
      r.text.length > 600 ||
      r.relationship.length > 150 ||
      !Number.isInteger(r.score) ||
      r.score < 1 ||
      r.score > 5
    )
      return fail(
        "Précisez une expérience, votre relation au joueur, une note de 1 à 5 et un commentaire.",
      );
    if (moderateText(r.text) || moderateText(r.relationship))
      return fail(
        "Commentaire bloqué : reformulez votre avis de manière factuelle et respectueuse.",
      );
    if (
      s.reviews.some(
        (x) =>
          x.memberId === r.memberId &&
          x.sport === r.sport &&
          x.club === r.club &&
          x.author === r.author,
      )
    )
      return fail("Vous avez déjà donné un avis sur cette expérience.");
    s.reviews.unshift({ ...r, status: "pending" });
    return s;
  }
  if (a.type === "review-status") {
    s.reviews = s.reviews.map((r) => (r.id === a.id ? { ...r, status: a.status } : r));
    return s;
  }
  if (a.type === "referral") {
    const email = a.referral.email.trim().toLowerCase();
    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      email === a.ownEmail.toLowerCase() ||
      s.referrals.some((r) => r.email === email)
    )
      return fail("Adresse invalide, auto-parrainage ou adresse déjà invitée.");
    s.referrals.push({ ...a.referral, email, stage: 0, credited: false });
    return s;
  }
  if (a.type === "referral-step") {
    const r = s.referrals.find((r) => r.id === a.id);
    if (!r || r.stage === 3) return s;
    r.stage = (r.stage + 1) as Referral["stage"];
    if (r.stage === 3 && !r.credited) {
      r.credited = true;
      s.rewardMonths += 3;
    }
    return s;
  }
  if (a.type === "activate-reward") {
    if (s.rewardMonths < 3 || s.rewardActivated)
      return fail("Aucune nouvelle récompense à activer.");
    s.rewardActivated = true;
    return s;
  }
  return s;
}
