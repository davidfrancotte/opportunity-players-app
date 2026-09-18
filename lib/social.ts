import type { Category } from "./model";
export type Member = {
  id: string;
  name: string;
  kind: "Joueurs" | "Professionnels" | "Collectives";
  role: string;
  sport: string;
  city: string;
  image: string;
  bio: string;
};
export const members: Member[] = [
  {
    id: "lea",
    name: "Léa Moreau",
    kind: "Joueurs",
    role: "Joueuse de tennis",
    sport: "Tennis",
    city: "Bruxelles",
    image: "/images/tennis-color.webp",
    bio: "Passionnée de compétition et de doubles. À la recherche de partenaires pour progresser ensemble.",
  },
  {
    id: "noah",
    name: "Noah Laurent",
    kind: "Joueurs",
    role: "Ailier · Basketball",
    sport: "Basketball",
    city: "Liège",
    image: "/images/basketball-color.webp",
    bio: "Le collectif avant tout. J’aime les projets qui rassemblent sur le parquet et en dehors.",
  },
  {
    id: "horizon",
    name: "Horizon Padel",
    kind: "Collectives",
    role: "Club & communauté",
    sport: "Padel",
    city: "Namur",
    image: "/images/padel-color.webp",
    bio: "Un club fictif ouvert à tous les niveaux. Entraînements, rencontres et projets sportifs locaux.",
  },
  {
    id: "sam",
    name: "Sam Delcourt",
    kind: "Professionnels",
    role: "Préparateur physique",
    sport: "Athlétisme",
    city: "Louvain",
    image: "/images/athletics-color.webp",
    bio: "Préparation physique, mobilité et retour à la pratique. Je souhaite collaborer avec des clubs.",
  },
  {
    id: "united",
    name: "United Sport",
    kind: "Collectives",
    role: "Collectif de football",
    sport: "Football",
    city: "Charleroi",
    image: "/images/football-color.webp",
    bio: "Un collectif fictif de passionnés. Notre ambition : créer des occasions de jouer et de se rencontrer.",
  },
  {
    id: "marc",
    name: "Marc Petit",
    kind: "Professionnels",
    role: "Coach de padel",
    sport: "Padel",
    city: "Bruxelles",
    image: "/images/coach.webp",
    bio: "Des séances construites autour du plaisir et de la progression, pour débutants et compétiteurs.",
  },
];
export type Post = {
  id: string;
  author: string;
  name: string;
  role: string;
  avatar: string;
  sport: string;
  text: string;
  image?: string;
  likes: number;
  liked: boolean;
  comments: { id: string; name: string; text: string }[];
};
export type ChatMessage = { id: string; text: string; mine: boolean };
export type Conversation = { memberId: string; unread: boolean; messages: ChatMessage[] };
export type Opportunity = {
  id: string;
  title: string;
  owner: string;
  sport: string;
  type: string;
  city: string;
  format: string;
  image: string;
  description: string;
  details: string[];
};
export const opportunities: Opportunity[] = [
  {
    id: "coach",
    title: "Un coach pour faire grandir notre équipe.",
    owner: "Horizon Padel",
    sport: "Padel",
    type: "Coaching",
    city: "Namur",
    format: "Mission · Sur place",
    image: "/images/padel-color.webp",
    description:
      "Un exemple de mission pour accompagner un groupe de joueurs intermédiaires. Pédagogie et esprit collectif au premier plan.",
    details: [
      "Deux séances hebdomadaires",
      "Expérience en encadrement souhaitée",
      "Modalités à discuter · annonce fictive",
    ],
  },
  {
    id: "double",
    title: "Votre prochain partenaire de double.",
    owner: "Léa Moreau",
    sport: "Tennis",
    type: "Partenariat",
    city: "Bruxelles",
    format: "Rencontre sportive",
    image: "/images/tennis-color.webp",
    description:
      "Un exemple de recherche de partenaire pour s’entraîner et participer à des rencontres amicales.",
    details: [
      "Niveau intermédiaire",
      "Disponibilité en soirée",
      "Rencontre fictive · aucune réservation",
    ],
  },
  {
    id: "tryout",
    title: "De nouveaux talents sur le parquet.",
    owner: "Collectif Arena",
    sport: "Basketball",
    type: "Recrutement",
    city: "Liège",
    format: "Détection · Amateur",
    image: "/images/basketball-color.webp",
    description:
      "Un exemple de détection pour compléter un collectif amateur. Venez avec votre énergie et votre envie de jouer en équipe.",
    details: [
      "Postes extérieurs et intérieurs",
      "Essai collectif à organiser",
      "Aucune sélection réelle dans cette démo",
    ],
  },
  {
    id: "sponsor",
    title: "Une marque, un club, une même ambition.",
    owner: "United Sport",
    sport: "Football",
    type: "Sponsoring",
    city: "Charleroi",
    format: "Collaboration locale",
    image: "/images/football-color.webp",
    description:
      "Un exemple de collaboration entre une structure sportive et une marque locale autour d’un projet de club.",
    details: [
      "Visibilité sur les événements du club",
      "Projet local et collectif",
      "Budget et calendrier fictifs à définir",
    ],
  },
];
export type SocialState = {
  paidCategory: Category | null;
  sentByMonth: Record<string, number>;
  gate: AccessReason | null;
  posts: Post[];
  following: string[];
  conversations: Conversation[];
  activeChat: string | null;
  saved: string[];
  interested: string[];
};
export function createSocialState(): SocialState {
  return {
    paidCategory: null,
    sentByMonth: {},
    gate: null,
    following: ["horizon"],
    saved: [],
    interested: [],
    activeChat: null,
    posts: [
      {
        id: "post-padel",
        author: "horizon",
        name: "Horizon Padel",
        role: "Club & communauté · Namur",
        avatar: "/images/padel-color.webp",
        sport: "Padel",
        text: "Le meilleur point de la semaine ? Celui qu’on construit ensemble. Une belle session pour notre collectif, entre intensité et plaisir de jouer. Et vous, quel est votre prochain objectif sur le terrain ?",
        image: "/images/padel-color.webp",
        likes: 24,
        liked: false,
        comments: [],
      },
      {
        id: "post-tennis",
        author: "lea",
        name: "Léa Moreau",
        role: "Joueuse de tennis · Bruxelles",
        avatar: "/images/tennis-color.webp",
        sport: "Tennis",
        text: "Nouvelle saison, nouvelles rencontres. Je cherche des partenaires pour des doubles à Bruxelles. Qui a envie de partager le court ?",
        image: "/images/tennis-color.webp",
        likes: 18,
        liked: false,
        comments: [],
      },
      {
        id: "post-running",
        author: "sam",
        name: "Sam Delcourt",
        role: "Préparateur physique · Louvain",
        avatar: "/images/athletics-color.webp",
        sport: "Athlétisme",
        text: "La régularité fait la différence. Aujourd’hui : mobilité, technique et récupération. Trois fondamentaux que j’aime intégrer à chaque préparation.",
        likes: 12,
        liked: false,
        comments: [],
      },
      {
        id: "post-basket",
        author: "noah",
        name: "Noah Laurent",
        role: "Ailier · Liège",
        avatar: "/images/basketball-color.webp",
        sport: "Basketball",
        text: "De l’énergie, de la confiance et un collectif qui avance. Heureux de retrouver le parquet et de préparer la suite avec l’équipe.",
        image: "/images/basketball-color.webp",
        likes: 31,
        liked: false,
        comments: [],
      },
    ],
    conversations: [
      {
        memberId: "horizon",
        unread: true,
        messages: [
          {
            id: "h1",
            mine: false,
            text: "Bonjour Alex ! Votre approche du coaching nous intéresse. Partant pour échanger sur un projet de club ? (Exemple fictif)",
          },
        ],
      },
      {
        memberId: "lea",
        unread: false,
        messages: [
          {
            id: "l1",
            mine: true,
            text: "Bonjour Léa, au plaisir d’échanger autour des sports de raquette !",
          },
          {
            id: "l2",
            mine: false,
            text: "Avec plaisir ! J’aimerais découvrir le padel. (Conversation fictive)",
          },
        ],
      },
    ],
  };
}
export type SocialAction =
  | { type: "subscription"; category: Category | null }
  | { type: "gate"; reason: AccessReason | null }
  | { type: "post"; post: Post }
  | { type: "like"; id: string }
  | { type: "comment"; id: string; comment: { id: string; name: string; text: string } }
  | { type: "follow"; id: string }
  | { type: "open-chat"; id: string }
  | { type: "close-chat" }
  | { type: "message"; id: string; message: ChatMessage }
  | { type: "save" | "interest"; id: string }
  | { type: "reset" };
function toggle(list: string[], id: string) {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}
export function socialReducer(state: SocialState, action: SocialAction): SocialState {
  switch (action.type) {
    case "subscription":
      return { ...state, paidCategory: action.category, gate: null };
    case "gate":
      return { ...state, gate: action.reason };
    case "post": {
      const text = action.post.text.trim();
      if (!text || text.length > 1200 || state.posts.some((p) => p.id === action.post.id))
        return state;
      return { ...state, posts: [{ ...action.post, text }, ...state.posts] };
    }
    case "like":
      return {
        ...state,
        posts: state.posts.map((p) =>
          p.id === action.id ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) } : p,
        ),
      };
    case "comment": {
      const text = action.comment.text.trim();
      if (!text || text.length > 400) return state;
      return {
        ...state,
        posts: state.posts.map((p) =>
          p.id === action.id ? { ...p, comments: [...p.comments, { ...action.comment, text }] } : p,
        ),
      };
    }
    case "follow":
      return members.some((m) => m.id === action.id)
        ? { ...state, following: toggle(state.following, action.id) }
        : state;
    case "open-chat": {
      if (!members.some((m) => m.id === action.id)) return state;
      const exists = state.conversations.some((c) => c.memberId === action.id);
      return {
        ...state,
        activeChat: action.id,
        conversations: exists
          ? state.conversations.map((c) => (c.memberId === action.id ? { ...c, unread: false } : c))
          : [{ memberId: action.id, unread: false, messages: [] }, ...state.conversations],
      };
    }
    case "close-chat":
      return { ...state, activeChat: null };
    case "message": {
      const text = action.message.text.trim();
      if (!text || text.length > 1000) return state;
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.memberId === action.id
            ? { ...c, messages: [...c.messages, { ...action.message, text }] }
            : c,
        ),
      };
    }
    case "save":
      return opportunities.some((o) => o.id === action.id)
        ? { ...state, saved: toggle(state.saved, action.id) }
        : state;
    case "interest":
      return opportunities.some((o) => o.id === action.id)
        ? { ...state, interested: toggle(state.interested, action.id) }
        : state;
    case "reset":
      return createSocialState();
  }
}
export function matchesQuery(text: string, query: string) {
  const normalize = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("fr");
  return normalize(text).includes(normalize(query.trim()));
}

export type AccessReason = "publish" | "player-contact" | "receive" | "quota" | "recipient";
export type AccessFeature = "publish" | "message" | "comment" | "receive";
export type AccessContext = { category: Category; month: string };
export const FREE_MESSAGES = 5;
// Fictional recipient plans, not subscription data from the real platform.
export const unpaidRecipients = ["sam", "united"];
export function monthKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: "Europe/Brussels",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(date);
  return (
    parts.find((p) => p.type === "year")!.value + "-" + parts.find((p) => p.type === "month")!.value
  );
}
export function isPremium(state: SocialState, category: Category) {
  return state.paidCategory === category;
}
export function canReceive(state: SocialState, category: Category) {
  return category === "Sportif" || isPremium(state, category);
}
export function remainingMessages(state: SocialState, month: string) {
  return Math.max(0, FREE_MESSAGES - (state.sentByMonth[month] || 0));
}
export function accessReason(
  state: SocialState,
  context: AccessContext,
  feature: AccessFeature,
  targetId?: string,
): AccessReason | null {
  const premium = isPremium(state, context.category);
  if (feature === "publish") return context.category === "Sportif" && !premium ? "publish" : null;
  if (feature === "receive") return canReceive(state, context.category) ? null : "receive";
  const target = members.find((m) => m.id === targetId);
  if (target && unpaidRecipients.includes(target.id)) return "recipient";
  if (target?.kind === "Joueurs" && context.category !== "Sportif" && !premium)
    return "player-contact";
  if (
    feature === "message" &&
    context.category === "Sportif" &&
    !premium &&
    !remainingMessages(state, context.month)
  )
    return "quota";
  return null;
}
export function visibleMessages(
  state: SocialState,
  context: AccessContext,
  conversation: Conversation,
) {
  return canReceive(state, context.category)
    ? conversation.messages
    : conversation.messages.filter((m) => m.mine);
}
export function visibleComments(state: SocialState, context: AccessContext, post: Post) {
  return post.author === "self" && !canReceive(state, context.category) ? [] : post.comments;
}
export function commentReason(state: SocialState, context: AccessContext, post: Post) {
  return post.author === "self"
    ? accessReason(state, context, "receive")
    : accessReason(state, context, "comment", post.author);
}
// This central gate protects every UI entry point, including direct message forms.
// Production must reimplement the checks and monthly counters server-side.
export function guardedSocialReducer(
  state: SocialState,
  command: { action: SocialAction; context: AccessContext },
): SocialState {
  const { action, context } = command;
  let reason: AccessReason | null = null;
  if (action.type === "post") reason = accessReason(state, context, "publish");
  if (action.type === "message") {
    if (
      !members.some((m) => m.id === action.id) ||
      !state.conversations.some((c) => c.memberId === action.id) ||
      !action.message.text.trim() ||
      action.message.text.trim().length > 1000
    )
      return state;
    reason = action.message.mine
      ? accessReason(state, context, "message", action.id)
      : accessReason(state, context, "receive");
  }
  if (action.type === "comment") {
    const post = state.posts.find((p) => p.id === action.id);
    if (!post) return state;
    reason = commentReason(state, context, post);
  }
  if (reason) return { ...state, gate: reason };
  const next = socialReducer(state, action);
  if (
    action.type === "message" &&
    action.message.mine &&
    context.category === "Sportif" &&
    !isPremium(state, context.category)
  ) {
    return {
      ...next,
      sentByMonth: {
        ...state.sentByMonth,
        [context.month]: (state.sentByMonth[context.month] || 0) + 1,
      },
    };
  }
  return next;
}
