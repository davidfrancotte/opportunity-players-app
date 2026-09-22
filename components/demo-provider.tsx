"use client";
import { LocaleProvider, useLocale } from "./locale";
import { limits } from "@/lib/entitlements";
import {
  emptyDirectoryFilters,
  matchesDirectory,
  effectiveDirectoryFilters,
} from "@/lib/directory";
import { members, connectedMemberIds } from "@/lib/social";
import { memberSports } from "@/lib/trust";
import { canViewMatch } from "@/lib/events";
import {
  createExtensionState,
  extensionReducer,
  workspace,
  roleCan,
  type ExtensionAction,
  type ExtensionState,
  type Workspace,
} from "@/lib/extensions";
import {
  createCareerState,
  careerReducer,
  careerActors,
  type CareerAction,
  type CareerState,
  type Actor,
} from "@/lib/career";
import {
  createContext,
  useContext,
  useState,
  useReducer,
  useEffect,
  useRef,
  type Dispatch,
  type ReactNode,
} from "react";
import {
  createSocialState,
  guardedSocialReducer,
  accessReason,
  monthKey,
  type AccessContext,
  type AccessFeature,
  type SocialAction,
  type SocialState,
} from "@/lib/social";
import { initialProfile, type Profile } from "@/lib/model";
import { X, Check } from "lucide-react";
import Link from "next/link";
import { isPremium } from "@/lib/social";
import {
  createTrustState,
  trustReducer,
  moderateText,
  type TrustState,
  type TrustAction,
} from "@/lib/trust";
import {
  createEventState,
  eventReducer,
  profileCity,
  type EventAction,
  type EventState,
} from "@/lib/events";
type Context = {
  extensions: ExtensionState;
  extensionWorkspace: Workspace;
  dispatchExtension: (action: ExtensionAction) => void;
  runScheduled: (through?: number) => void;
  career: CareerState;
  dispatchCareer: (action: CareerAction) => void;
  careerActor: Actor;
  careerActors: Actor[];
  setCareerActor: (id: string) => void;
  trust: TrustState;
  dispatchTrust: Dispatch<TrustAction>;
  events: EventState;
  dispatchEvent: (action: EventAction) => void;
  profile: Profile;
  setProfile: (p: Profile) => void;
  draft: Profile | null;
  setDraft: (p: Profile | null) => void;
  emailVerified: boolean;
  setEmailVerified: (v: boolean) => void;
  notify: (message: string) => void;
  reset: () => void;
  social: SocialState;
  dispatchSocial: Dispatch<SocialAction>;
  access: AccessContext;
  requestAccess: (feature: AccessFeature, targetId?: string) => boolean;
};
const DemoContext = createContext<Context | null>(null);
export function DemoProvider({ children }: { children: ReactNode }) {
  return (
    <LocaleProvider>
      <DemoStateProvider>{children}</DemoStateProvider>
    </LocaleProvider>
  );
}
function DemoStateProvider({ children }: { children: ReactNode }) {
  const { locale } = useLocale();
  const [profile, rawSetProfile] = useState<Profile>(structuredClone(initialProfile));
  function setProfile(next: Profile) {
    const cap = limits(next.category, isPremium(social, next.category));
    if (
      next.media.length > profile.media.length &&
      next.media.length + trust.documents.filter((d) => d.kind === "Photo").length > cap.photos
    ) {
      setNotice(`Limite : ${cap.photos} photos dans cette offre.`);
      return;
    }
    if (next.videos.length > profile.videos.length && next.videos.length > cap.videos) {
      setNotice(`Limite : ${cap.videos} vidéos dans cette offre.`);
      return;
    }
    rawSetProfile(next);
  }
  const videoURLs = useRef<string[]>([]);
  useEffect(() => {
    const next = [...profile.videos.map((v) => v.url), ...profile.media.filter(url => url.startsWith("blob:"))];
    videoURLs.current
      .filter((url) => !next.includes(url))
      .forEach((url) => URL.revokeObjectURL(url));
    videoURLs.current = next;
  }, [profile.videos, profile.media]);
  useEffect(() => () => videoURLs.current.forEach((url) => URL.revokeObjectURL(url)), []);
  const [draft, setDraft] = useState<Profile | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [notice, setNotice] = useState("");
  const [trust, trustDispatch] = useReducer(trustReducer, undefined, createTrustState);
  function dispatchTrust(action: TrustAction) {
    const cap = limits(profile.category, isPremium(social, profile.category));
    if (action.type === "document") {
      const photo = action.document.kind === "Photo";
      const count =
        trust.documents.filter((d) => (d.kind === "Photo") === photo).length +
        (photo ? profile.media.length : 0);
      const max = photo ? cap.photos : cap.documents;
      if (count >= max) {
        setNotice(`Limite de votre offre : ${max} ${photo ? "photos" : "documents"}.`);
        return;
      }
    }
    if (["referral", "referral-step", "activate-reward"].includes(action.type) && !cap.referral) {
      setNotice("Le parrainage professionnel est inclus dans Premium.");
      return;
    }
    trustDispatch(action);
  }
  const [month, setMonth] = useState(() => monthKey());
  useEffect(() => {
    const refresh = () => setMonth(monthKey());
    const timer = window.setInterval(refresh, 30_000);
    window.addEventListener("focus", refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
    };
  }, []);
  const [social, dispatch] = useReducer(guardedSocialReducer, undefined, createSocialState);
  const [events, eventDispatch] = useReducer(eventReducer, undefined, createEventState);
  const [career, careerDispatch] = useReducer(careerReducer, undefined, createCareerState);
  const [careerActorId, setCareerActor] = useState("self");
  const [extensions, extensionDispatch] = useReducer(
    extensionReducer,
    undefined,
    createExtensionState,
  );
  const actors = careerActors(profile, isPremium(social, profile.category));
  const careerActor = actors.find((a) => a.id === careerActorId) || actors[0];
  const extensionKey = `${careerActor.id}:${careerActor.category}`;
  const extensionWorkspace = workspace(extensions, extensionKey);
  const postURLs = useRef<string[]>([]);
  useEffect(() => {
    const drafts = Object.values(extensions.workspaces).flatMap(w => w.schedules.filter(p => p.status !== "cancelled"));
    const next = [...new Set([...social.posts, ...drafts].flatMap(p => [p.image, p.video]).filter((url): url is string => !!url?.startsWith("blob:")))];
    postURLs.current.filter(url => !next.includes(url)).forEach(url => URL.revokeObjectURL(url));
    postURLs.current = next;
  }, [social.posts, extensions.workspaces]);
  useEffect(() => () => postURLs.current.forEach(url => URL.revokeObjectURL(url)), []);
  function dispatchExtension(action: ExtensionAction) {
    extensionDispatch({
      action,
      context: {
        key: extensionKey,
        category: careerActor.category,
        premium: careerActor.premium,
        now: Date.now(),
      },
    });
  }
  function runScheduled(through = Date.now()) {
    // The demo publishes only the current user's drafts, never as another simulated actor.
    if (careerActor.id !== "self" || !isPremium(social, profile.category)) return;
    extensionWorkspace.schedules
      .filter((p) => p.status === "planned" && Date.parse(p.start) <= through)
      .forEach((p) => {
        dispatchSocial({
          type: "post",
          post: {
            id: p.id,
            author: "self",
            name: careerActor.name,
            role: profile.category,
            avatar: profile.photo,
            sport: p.sport,
            text: p.text,
            category: p.category,
            opportunityCategory: p.opportunityCategory,
            image: p.image,
            video: p.video,
            likes: 0,
            liked: false,
            comments: [],
          },
        });
        dispatchExtension({ type: "schedule-status", id: p.id, status: "published" });
        dispatchExtension({
          type: "notice",
          id: `published-${p.id}`,
          text: "Publication programmée ajoutée au fil de démonstration.",
          href: "/accueil",
        });
      });
  }
  useEffect(() => {
    const timer = window.setInterval(() => runScheduled(), 15000);
    return () => window.clearInterval(timer);
  });
  useEffect(() => {
    if (!careerActor.premium) return;
    extensionWorkspace.searches
      .filter((q) => q.alerts)
      .forEach((q) => {
        const f = q.filters;
        const ids =
          q.kind === "people"
            ? members
                .filter(
                  (m) =>
                    !trust.blocked.includes(m.id) &&
                    matchesDirectory(
                      m,
                      memberSports[m.id] || [],
                      effectiveDirectoryFilters(
                        { ...emptyDirectoryFilters, ...f },
                        careerActor.premium,
                      ),
                    ),
                )
                .map((m) => m.id)
            : q.kind === "opportunities"
              ? career.offers
                  .filter(
                    (o) =>
                      o.open &&
                      !trust.blocked.includes(o.owner) &&
                      (f.sport === "Tous" || o.sport === f.sport) &&
                      o.city.toLowerCase().includes((f.city || "").toLowerCase()),
                  )
                  .map((o) => o.id)
              : events.matches
                  .filter(
                    (m) =>
                      m.open &&
                      !m.cancelled &&
                      !m.confirmed &&
                      canViewMatch(m, {
                        premium: true,
                        category: careerActor.category,
                        city: profileCity(f.city || profile.city),
                        radius: Number(f.radius || 50),
                        now: Date.now(),
                      }) &&
                      (f.sport === "Tous" || m.sport === f.sport) &&
                      (!f.level || m.level === f.level) &&
                      m.slots.some(
                        (t) =>
                          Date.parse(t.start) > Date.now() &&
                          (!f.after || new Date(t.start).getHours() >= Number(f.after)),
                      ),
                  )
                  .map((m) => m.id);
        if (ids.some((id) => !q.seen.includes(id)))
          dispatchExtension({ type: "search-check", id: q.id, results: ids });
      });
  }, [
    extensionWorkspace.searches,
    career.offers,
    events.matches,
    trust.blocked,
    careerActor.premium,
    careerActor.category,
    profile.city,
  ]);
  const seenCareerNotices = useRef(new Set<string>());
  useEffect(() => {
    const latest = career.notices.find(
      (n) => n.recipient === careerActor.id && !n.read && !seenCareerNotices.current.has(n.id),
    );
    if (latest) {
      career.notices
        .filter((n) => n.recipient === careerActor.id)
        .forEach((n) => seenCareerNotices.current.add(n.id));
      setNotice(locale === "fr" ? latest.fr : latest.en);
    }
  }, [career.notices, careerActor.id, locale]);
  function dispatchCareer(action: CareerAction) {
    if (
      careerActor.category === "Organisation" &&
      ["offer", "close-offer", "stage"].includes(action.type) &&
      !roleCan(extensionWorkspace, "recruit")
    ) {
      setNotice("Ce gestionnaire ne dispose pas des droits de recrutement.");
      return;
    }
    careerDispatch({
      action,
      context: { actor: careerActor, actors, blocked: trust.blocked, now: Date.now() },
    });
  }
  function dispatchEvent(action: EventAction) {
    eventDispatch({
      action,
      context: {
        category: profile.category,
        radius: events.radius,
        connections: connectedMemberIds(social, trust.blocked),
        premium: isPremium(social, profile.category),
        city: profileCity(profile.city),
        now: Date.now(),
      },
    });
  }
  useEffect(() => {
    const tick = () =>
      eventDispatch({
        action: { type: "tick" },
        context: { premium: false, city: "", now: Date.now() },
      });
    tick();
    const timer = window.setInterval(tick, 30_000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    if (!events.banner) return;
    const timer = window.setTimeout(
      () =>
        eventDispatch({
          action: { type: "dismiss" },
          context: { premium: false, city: "", now: Date.now() },
        }),
      8000,
    );
    return () => window.clearTimeout(timer);
  }, [events.banner]);
  const access = { category: profile.category, month };
  function dispatchSocial(action: SocialAction) {
    const content =
      action.type === "message"
        ? action.message.text
        : action.type === "post"
          ? action.post.text
          : action.type === "comment"
            ? action.comment.text
            : "";
    const reason = moderateText(content);
    if (reason) {
      dispatchEvent({
        type: "safety-notice",
        text: `Contenu non transmis : ${reason.toLowerCase()}. Filtre de démonstration ; vous pouvez demander une révision dans Sécurité.`,
      });
      setNotice("Contenu bloqué dans la démo. Aucun envoi ni quota consommé.");
      return;
    }
    if (
      (action.type === "message" || action.type === "open-chat") &&
      trust.blocked.includes(action.id)
    ) {
      setNotice("Ce membre est bloqué. Gérez vos blocages dans Sécurité.");
      return;
    }
    dispatch({
      action,
      context: {
        category: profile.category,
        month: monthKey(),
        ...{ blocked: trust.blocked },
      },
    });
    if (
      action.type === "message" &&
      !action.message.mine &&
      action.message.text.trim() &&
      action.message.text.length <= 1000 &&
      !accessReason(social, { category: profile.category, month: monthKey() }, "receive")
    )
      dispatchEvent({ type: "demo-message" });
  }
  function requestAccess(feature: AccessFeature, targetId?: string) {
    const reason = accessReason(
      social,
      { category: profile.category, month: monthKey() },
      feature,
      targetId,
    );
    if (reason) dispatchSocial({ type: "gate", reason });
    return !reason;
  }
  function reset() {
    dispatchExtension({ type: "reset" });
    dispatchCareer({ type: "reset" });
    setCareerActor("self");
    seenCareerNotices.current.clear();
    rawSetProfile(structuredClone(initialProfile));
    setDraft(null);
    setEmailVerified(false);
    dispatchSocial({ type: "reset" });
    dispatchEvent({ type: "reset" });
    dispatchTrust({ type: "reset" });
    setNotice("La démo a été réinitialisée.");
  }
  return (
    <DemoContext.Provider
      value={{
        extensions,
        extensionWorkspace,
        dispatchExtension,
        runScheduled,
        career,
        dispatchCareer,
        careerActor,
        careerActors: actors,
        setCareerActor,
        trust,
        dispatchTrust,
        events,
        dispatchEvent,
        profile,
        setProfile,
        draft,
        setDraft,
        emailVerified,
        setEmailVerified,
        notify: setNotice,
        reset,
        social,
        dispatchSocial,
        access,
        requestAccess,
      }}
    >
      {children}
      {events.banner &&
        events.notices
          .filter((n) => n.id === events.banner && n.recipient === "me")
          .map((n) => (
            <aside className="event-banner" key={n.id} role="status">
              <Link
                href={n.href}
                onClick={() => {
                  dispatchEvent({ type: "read", id: n.id });
                  dispatchEvent({ type: "dismiss" });
                }}
              >
                <small>OP / NOTIFICATION DÉMO</small>
                <strong>{n.text}</strong>
              </Link>
              <button
                aria-label="Fermer la bannière"
                onClick={() => dispatchEvent({ type: "dismiss" })}
              >
                <X size={18} />
              </button>
            </aside>
          ))}
      <div className="toast-region" aria-live="polite" aria-atomic="true">
        {notice && (
          <div className="toast">
            <Check size={17} />
            <span>{notice}</span>
            <button aria-label="Fermer la notification" onClick={() => setNotice("")}>
              <X size={16} />
            </button>
          </div>
        )}
      </div>
    </DemoContext.Provider>
  );
}
export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) throw new Error("DemoProvider is required");
  return context;
}
