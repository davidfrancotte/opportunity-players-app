"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { english } from "@/lib/translations";
type Locale = "fr" | "en";
const Context = createContext({
  locale: "fr" as Locale,
  setLocale: (_: Locale) => {},
  t: (s: string) => s,
});
export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("fr");
  useEffect(() => {
    try {
      setLocale(localStorage.getItem("op-language") === "en" ? "en" : "fr");
    } catch {}
  }, []);
  useEffect(() => {
    const previous = document.documentElement.lang;
    document.documentElement.lang = locale;
    return () => { document.documentElement.lang = previous; };
  }, [locale]);
  function change(next: Locale) {
    setLocale(next);
    try {
      localStorage.setItem("op-language", next);
    } catch {}
  }
  return (
    <Context.Provider
      value={{ locale, setLocale: change, t: (s) => (locale === "en" ? english[s] || s : s) }}
    >
      {children}
    </Context.Provider>
  );
}
export const useLocale = () => useContext(Context);
export function T({ children }: { children: string }) {
  return <>{useLocale().t(children)}</>;
}
export function LanguageSwitch() {
  const { locale, setLocale } = useLocale();
  return (
    <label className="locale-switch">
      <span>FR / EN</span>
      <select
        aria-label="Langue / Language"
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
      >
        <option value="fr">Français</option>
        <option value="en">English</option>
      </select>
    </label>
  );
}
