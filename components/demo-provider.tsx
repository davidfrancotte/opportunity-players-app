"use client";
import {
  createContext,
  useContext,
  useState,
  useReducer,
  useEffect,
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
  const [profile, setProfile] = useState<Profile>(
    structuredClone(initialProfile),
  );
  const [draft, setDraft] = useState<Profile | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [notice, setNotice] = useState("");
  const [trust, dispatchTrust] = useReducer(
    trustReducer,
    undefined,
    createTrustState,
  );
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
  const [social, dispatch] = useReducer(
    guardedSocialReducer,
    undefined,
    createSocialState,
  );
  const [events, eventDispatch] = useReducer(
    eventReducer,
    undefined,
    createEventState,
  );
  function dispatchEvent(action: EventAction) {
    eventDispatch({
      action,
      context: {
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
      !accessReason(
        social,
        { category: profile.category, month: monthKey() },
        "receive",
      )
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
    setProfile(structuredClone(initialProfile));
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
            <button
              aria-label="Fermer la notification"
              onClick={() => setNotice("")}
            >
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
