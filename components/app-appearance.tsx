"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Sun, Moon, Check } from "lucide-react";
import { appearanceKey, normalizeTheme, themeColors, type AppTheme } from "@/lib/appearance";
import { useLocale } from "./locale";

const AppearanceContext = createContext<{
  theme: AppTheme;
  choose: (theme: AppTheme) => void;
  saved: boolean;
} | null>(null);

function applyTheme(theme: AppTheme) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
  document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.setAttribute("content", themeColors[theme]);
}

export function AppAppearanceProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<AppTheme>("dark");
  const [saved, setSaved] = useState(true);
  useEffect(() => {
    function sync() {
      let next = normalizeTheme(document.documentElement.dataset.theme);
      try { next = normalizeTheme(localStorage.getItem(appearanceKey)); } catch {}
      applyTheme(next);
      setTheme(next);
    }
    sync();
    function onStorage(event: StorageEvent) {
      if (event.key === appearanceKey || event.key === null) sync();
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  function choose(next: AppTheme) {
    applyTheme(next);
    setTheme(next);
    try {
      localStorage.setItem(appearanceKey, next);
      setSaved(true);
    } catch {
      setSaved(false); // The switch still works when browser storage is unavailable.
    }
  }
  return <AppearanceContext.Provider value={{ theme, choose, saved }}>{children}</AppearanceContext.Provider>;
}

export function AppearancePreferences() {
  const appearance = useContext(AppearanceContext);
  const { t } = useLocale();
  if (!appearance) return null;
  return (
    <section className="info-card appearance-preferences" aria-labelledby="appearance-heading">
      <div className="card-heading"><h2 id="appearance-heading"><Sun size={19} aria-hidden="true" />{t("Apparence de l’app")}</h2></div>
      <p>{t("Choisissez le thème qui vous convient. Vous pouvez le changer à tout moment.")}</p>
      <fieldset className="appearance-options">
        <legend className="sr-only">{t("Thème de l’application")}</legend>
        {(["light", "dark"] as const).map((value) => {
          const selected = appearance.theme === value;
          const Icon = value === "light" ? Sun : Moon;
          return (
            <label key={value} className="appearance-option" data-selected={selected}>
              <input type="radio" name="app-appearance" value={value} checked={selected} onChange={() => appearance.choose(value)} />
              <Icon size={23} aria-hidden="true" />
              <span>{t(value === "light" ? "Mode clair" : "Mode sombre")}</span>
              <Check className="appearance-check" size={16} aria-hidden="true" />
            </label>
          );
        })}
      </fieldset>
      <p className="appearance-note" role="status">
        {t(appearance.saved ? "Votre préférence est enregistrée sur cet appareil." : "Le stockage est indisponible. Ce choix reste actif pendant cette visite.")}
      </p>
    </section>
  );
}
