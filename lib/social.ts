import type { Category } from "./model";
import { moderateText } from "./trust.ts";
import { limits } from './entitlements.ts';
import { validClassification, type PostClassification } from './community.ts';
export type Member = {
  birthDate?: string;
  id: string;
  name: string;
  kind: "Joueurs" | "Professionnels" | "Collectives";
  role: string;
  sport: string;
  city: string;
  country: string;
  gender?: string;
  accountType?: string;
  image: string;
  bio: string;
};
export const members: Member[] = [
  {
    id: "ines",
    birthDate: "2000-05-12",
    name: "Inès Martin",
    kind: "Joueurs",
    role: "Gardienne · Football",
    sport: "Football",
    city: "Lille",
    country: "France",
    gender: "Femme",
    image: "/images/football-color.webp",
    bio: "Profil fictif : gardienne à la recherche d’un collectif et de séances spécifiques.",
  },
  {
    id: "camille",
    name: "Camille Roy",
    kind: "Professionnels",
    role: "Entraîneur de gardiens",
    accountType: "Entraîneur de gardiens",
    sport: "Football",
    city: "Montréal",
    country: "Canada",
    image: "/images/coach.webp",
    bio: "Profil fictif : accompagnement technique des gardiens et gardiennes.",
  },
  {
    id: "academie",
    name: "Académie du Nord",
    kind: "Collectives",
    role: "Formation sportive",
    accountType: "Académie",
    sport: "Football",
    city: "Lille",
    country: "France",
    image: "/images/football-color.webp",
    bio: "Structure fictive dédiée à la formation et aux rencontres sportives.",
  },
  {
    id: "lea",
    birthDate: "1997-03-21",
    country: "Belgique",
    gender: "Femme",
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
    birthDate: "2004-11-08",
    country: "Belgique",
    gender: "Homme",
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
    country: "Belgique",
    accountType: "Club",
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
    country: "Belgique",
    accountType: "Préparateur physique",
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
    country: "Belgique",
    accountType: "Équipe",
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
    country: "Belgique",
    accountType: "Entraîneur",
    name: "Marc Petit",
    kind: "Professionnels",
    role: "Coach de padel",
    sport: "Padel",
    city: "Bruxelles",
    image: "/images/coach.webp",
    bio: "Des séances construites autour du plaisir et de la progression, pour débutants et compétiteurs.",
  },
];
export type Post = PostClassification & {
  id: string;
  author: string;
  name: string;
  role: string;
  avatar: string;
  sport: string;
  text: string;
  image?: string;
  video?: string;
  likes: number;
  liked: boolean;
  comments: { id: string; name: string; text: string }[];
};
export type ChatMessage = { id: string; text: string; mine: boolean };
export type Conversation = {
  memberId: string;
  unread: boolean;
  messages: ChatMessage[];
};
export type Opportunity = {
  groupTrial?: boolean;
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
export function matchesOpportunityType(opportunity: Opportunity, type: string) {
  return type === "Toutes" || opportunity.type === type || (type === "Essais groupés" && opportunity.groupTrial === true);
}
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
    groupTrial: true,
    title: "De nouveaux talents sur le parquet.",
    owner: "Collectif Arena",
    sport: "Basketball",
    type: "Recrutement",
    city: "Liège",
    format: "Essai groupé · Amateur",
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
  contactedByMonth?: Record<string,string[]>;
  gate: AccessReason | null;
  posts: Post[];
  following: string[];
  connectionInvitations: { memberId: string; direction?: 'incoming' | 'outgoing'; status: 'pending' | 'accepted' | 'declined' }[];
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
    connectionInvitations: ['lea', 'noah', 'sam'].map(memberId => ({ memberId, status: 'pending' })),
    saved: [],
    interested: [],
    activeChat: null,
    posts: [
      {
        id: "post-padel",
        category: 'News',
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
        category: 'Opportunités',
        opportunityCategory: 'Partenaires de jeu',
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
        category: 'Divers',
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
        category: 'News',
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
      {
        id: 'post-coach-job', category: 'Offres d’emploi', author: 'academie', name: 'Académie du Nord', role: 'Académie · Lille', avatar: '/images/football-color.webp', sport: 'Football',
        text: 'Offre fictive : notre académie recherche un entraîneur de gardiens pour accompagner ses équipes jeunes. Mission à Lille, modalités à discuter avec le club.', likes: 0, liked: false, comments: [],
      },
      {
        id: 'post-striker', category: 'Opportunités', opportunityCategory: 'Recrutement de joueurs', author: 'united', name: 'United Sport', role: 'Collectif · Charleroi', avatar: '/images/football-color.webp', sport: 'Football',
        text: 'Opportunité fictive : notre club recherche un nouvel attaquant pour la saison. Prenez contact pour présenter votre parcours et organiser un essai.', likes: 0, liked: false, comments: [],
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
  | { type: 'connection-request' | 'connection-cancel'; id: string }
  | { type: 'connection-demo-response'; id: string; accept: boolean }
  | { type: "subscription"; category: Category | null }
  | { type: "gate"; reason: AccessReason | null }
  | { type: "post"; post: Post }
  | { type: "like"; id: string }
  | {
      type: "comment";
      id: string;
      comment: { id: string; name: string; text: string };
    }
  | { type: "follow"; id: string }
  | { type: 'connection-response'; id: string; accept: boolean }
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
      if (!text || text.length > 1200 || !validClassification(action.post) || state.posts.some((p) => p.id === action.post.id))
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
    case 'connection-request': {
      if (!members.some(m => m.id === action.id) || state.connectionInvitations.some(i => i.memberId === action.id && i.status !== 'declined')) return state;
      return { ...state, connectionInvitations: [...state.connectionInvitations.filter(i => i.memberId !== action.id), { memberId: action.id, direction: 'outgoing', status: 'pending' }] };
    }
    case 'connection-cancel': {
      return { ...state, connectionInvitations: state.connectionInvitations.filter(i => !(i.memberId === action.id && i.direction === 'outgoing' && i.status === 'pending')) };
    }
    case 'connection-demo-response':
    case 'connection-response': {
      const outgoing = action.type === 'connection-demo-response';
      if (!state.connectionInvitations.some(i => i.memberId === action.id && i.status === 'pending' && (i.direction === 'outgoing') === outgoing)) return state;
      return { ...state, connectionInvitations: state.connectionInvitations.map(i => i.memberId === action.id ? { ...i, status: action.accept ? 'accepted' : 'declined' } : i), following: action.accept ? [...new Set([...state.following, action.id])] : state.following };
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
export type AccessContext = {
  category: Category;
  month: string;
  blocked?: string[];
};
export const FREE_MESSAGES = 3;
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
export function isConnected(state: SocialState, memberId?: string) {
  return state.connectionInvitations.some(i => i.memberId === memberId && i.status === 'accepted');
}
export function connectedMemberIds(state: SocialState, blocked: string[] = []) {
  return state.connectionInvitations.filter(i => i.status === 'accepted' && !blocked.includes(i.memberId)).map(i => i.memberId);
}
export function inCommunityFeed(state: SocialState, author: string) {
  return author === 'self' || state.following.includes(author);
}
export function canReceive(state: SocialState, category: Category) {
  return true;
}
export function remainingMessages(state: SocialState, month: string, category:Category='Sportif') {
  return Math.max(0, limits(category,isPremium(state,category)).contacts - (state.contactedByMonth?.[`${category}:${month}`]?.length || 0));
}
export function accessReason(
  state: SocialState,
  context: AccessContext,
  feature: AccessFeature,
  targetId?: string,
): AccessReason | null {
  const premium = isPremium(state, context.category);
  if (feature === "publish") return limits(context.category,premium).publish ? null : 'publish';
  if (feature === "receive") return canReceive(state, context.category) ? null : "receive";
  const established=state.conversations.some(c=>c.memberId===targetId&&c.messages.length>0);
  if (
    feature === "message" &&
    !isConnected(state, targetId) &&
    !established &&
    !remainingMessages(state, context.month,context.category)
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
  const text =
    action.type === "message"
      ? action.message.text
      : action.type === "post"
        ? action.post.text
        : action.type === "comment"
          ? action.comment.text
          : "";
  if (moderateText(text)) return state;
  if (
    (action.type === "message" || action.type === "open-chat" || action.type === "follow" || action.type === "connection-request" || action.type === "connection-response" || action.type === "connection-demo-response") &&
    context.blocked?.includes(action.id)
  )
    return state;
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
    !isConnected(state, action.id) &&
    !state.conversations.some(c=>c.memberId===action.id&&c.messages.length>0)
  ) {
    return {
      ...next,
      contactedByMonth:{...state.contactedByMonth,[`${context.category}:${context.month}`]:[...(state.contactedByMonth?.[`${context.category}:${context.month}`]||[]),action.id]},
      sentByMonth: {
        ...state.sentByMonth,
        [context.month]: (state.sentByMonth[context.month] || 0) + 1,
      },
    };
  }
  return next;
}
