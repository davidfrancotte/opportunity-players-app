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
type Context = {
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
  const [profile, setProfile] = useState<Profile>(structuredClone(initialProfile));
  const [draft, setDraft] = useState<Profile | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [notice, setNotice] = useState("");
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
  const access = { category: profile.category, month };
  function dispatchSocial(action: SocialAction) {
    dispatch({ action, context: { category: profile.category, month: monthKey() } });
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
    setNotice("La démo a été réinitialisée.");
  }
  return (
    <DemoContext.Provider
      value={{
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
