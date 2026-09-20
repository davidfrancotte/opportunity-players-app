"use client";
import { useRef, useState, useEffect, type FormEvent } from "react";
import Link from "next/link";
import { useDemo } from "./demo-provider";
import { ProfileLayout } from "./profile-screens";
import { Field, Submit } from "./studio-ui";
import { Button } from "./ui/button";
import { T, useLocale } from "./locale";
import { sports, type Profile } from "@/lib/model";
import { ageOn, videoFileIssue, type SportVideo } from "@/lib/sport-profile";
import { moderateText } from "@/lib/trust";

export function SportProfileSummary({ showLink = true }: { showLink?: boolean }) {
  const { profile: p } = useDemo();
  const { t, locale } = useLocale();
  const age = ageOn(p.birthDate);
  return (
    <div className="sport-profile-summary">
      {p.category === "Sportif" && age !== null && (
        <span className="sport-chip">
          {age} {locale === "en" ? "years old" : "ans"}
        </span>
      )}
      {p.registrationMode === "child" && (
        <p className="inline-note">
          <T>Profil géré par un représentant</T>
        </p>
      )}
      {p.disciplines.map((r) => (
        <p key={r.sport}>
          <strong>{r.sport}</strong>
          {r.paraSport === "yes" && <> · {t("Handisport")}</>}
          {r.availability && r.availability !== "Non renseignée" && (
            <>
              {" "}
              · {t(r.availability)} {r.availability === "Disponible à partir du" && r.availableFrom}
            </>
          )}
          {r.contractStatus && r.contractStatus !== "Non renseignée" && (
            <> · {t(r.contractStatus)}</>
          )}
        </p>
      ))}
      {showLink && (
        <Link className="action secondary" href="/dossier-sportif">
          <T>Palmarès, vidéos & licences</T> ↗
        </Link>
      )}
    </div>
  );
}

export function SportsPortfolioPage() {
  const { profile: p, setProfile, notify } = useDemo();
  const { t, locale } = useLocale();
  const [error, setError] = useState("");
  const [videoError, setVideoError] = useState("");
  const [pending, setPending] = useState<SportVideo | null>(null);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState("");
  const generation = useRef(0);
  const pendingURL = useRef("");
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      generation.current++;
      if (pendingURL.current) URL.revokeObjectURL(pendingURL.current);
    };
  }, []);
  const disciplines = p.disciplines.length ? p.disciplines.map((r) => r.sport) : [p.sport];
  function achievement(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget,
      data = new FormData(form);
    const entry = {
      id: editing || crypto.randomUUID(),
      sport: String(data.get("awardSport")),
      title: String(data.get("awardTitle") || "").trim(),
      event: String(data.get("awardEvent") || "").trim(),
      year: String(data.get("awardYear") || ""),
    };
    if (
      !entry.title ||
      !entry.event ||
      !/^\d{4}$/.test(entry.year) ||
      +entry.year < 1900 ||
      +entry.year > new Date().getFullYear() ||
      !sports.includes(entry.sport)
    ) {
      setError(
        locale === "en"
          ? "Complete the title, competition and valid year."
          : "Complétez le titre, l’épreuve et une année valide.",
      );
      return;
    }
    if (moderateText(entry.title + " " + entry.event)) {
      setError(
        locale === "en"
          ? "Please use respectful wording."
          : "Reformulez le contenu de manière respectueuse.",
      );
      return;
    }
    setProfile({
      ...p,
      achievements: editing
        ? p.achievements.map((a) => (a.id === editing ? entry : a))
        : [...p.achievements, entry],
    });
    setEditing("");
    setError("");
    form.reset();
    notify(t("Enregistrer"));
  }
  async function choose(file: File | undefined) {
    const token = ++generation.current;
    if (pendingURL.current) URL.revokeObjectURL(pendingURL.current);
    pendingURL.current = "";
    setPending(null);
    setVideoError("");
    setBusy(false);
    if (!file) return;
    const issue = videoFileIssue(file);
    if (issue) {
      setVideoError(t(issue));
      return;
    }
    setBusy(true);
    const url = URL.createObjectURL(file);
    pendingURL.current = url;
    const valid = await new Promise<boolean>((resolve) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      const timer = setTimeout(() => finish(false), 10000);
      function finish(ok: boolean) {
        clearTimeout(timer);
        video.onloadedmetadata = null;
        video.onerror = null;
        video.removeAttribute("src");
        video.load();
        resolve(ok);
      }
      video.onloadedmetadata = () =>
        finish(Number.isFinite(video.duration) && video.duration > 0 && video.duration <= 300);
      video.onerror = () => finish(false);
      video.src = url;
    });
    if (!mounted.current || token !== generation.current) {
      URL.revokeObjectURL(url);
      return;
    }
    setBusy(false);
    if (!valid) {
      URL.revokeObjectURL(url);
      pendingURL.current = "";
      setVideoError(
        locale === "en"
          ? "Unreadable video or longer than 5 minutes."
          : "Vidéo illisible ou de plus de 5 minutes.",
      );
      return;
    }
    setPending({ id: crypto.randomUUID(), sport: p.sport, title: "", url, size: file.size });
  }
  function addVideo(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget,
      data = new FormData(form);
    const title = String(data.get("videoTitle") || "").trim(),
      sport = String(data.get("videoSport"));
    if (!pending || !title || !data.get("videoConsent") || !sports.includes(sport)) {
      setVideoError(
        locale === "en"
          ? "Choose a video, add a title and confirm sharing permission."
          : "Choisissez une vidéo, indiquez un titre et confirmez les autorisations.",
      );
      return;
    }
    if (moderateText(title)) {
      setVideoError(
        locale === "en"
          ? "Please use respectful wording."
          : "Reformulez le titre de manière respectueuse.",
      );
      return;
    }
    setProfile({ ...p, videos: [...p.videos, { ...pending, title, sport }] });
    pendingURL.current = "";
    setPending(null);
    setVideoError("");
    form.reset();
    notify(t("Enregistrer"));
  }
  const current = p.achievements.find((a) => a.id === editing);
  return (
    <ProfileLayout back="/profil" title={t("Dossier sportif")}>
      <p className="demo-context">
        <T>Modifications conservées pendant cette visite uniquement.</T>{" "}
        <T>Informations déclarées · aucune certification.</T>
      </p>
      <SportProfileSummary showLink={false} />
      <section className="portfolio-panel">
        <h2>
          <T>Licence sportive</T>
        </h2>
        {p.disciplines.map((r) => (
          <article className="portfolio-record" key={r.sport}>
            <strong>{r.sport}</strong>
            <p>
              {r.licenceNumber
                ? `${t("Licence déclarée · non vérifiée")} · ${t("Numéro masqué")} · ••••${r.licenceNumber.slice(-2)}`
                : t("Non renseignée")}
            </p>
            <p>{[r.federation, r.licenceSeason].filter(Boolean).join(" · ")}</p>
          </article>
        ))}
        <Link className="action secondary" href="/disciplines">
          <T>Gérer mes sports et licences</T>
        </Link>
      </section>
      <section className="portfolio-panel">
        <h2>
          <T>Palmarès & distinctions</T>
        </h2>
        {!p.achievements.length && (
          <p>
            <T>Aucune distinction ajoutée.</T>
          </p>
        )}
        {p.achievements.map((a) => (
          <article className="portfolio-record" key={a.id}>
            <small>
              {a.sport} · {a.year}
            </small>
            <h3>{a.title}</h3>
            <p>{a.event}</p>
            <div className="portfolio-actions">
              <Button
                variant="outline"
                onClick={() => {
                  setEditing(a.id);
                  setError("");
                }}
              >
                <T>Modifier</T>
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setProfile({ ...p, achievements: p.achievements.filter((x) => x.id !== a.id) });
                  if (editing === a.id) setEditing("");
                }}
              >
                <T>Supprimer</T>
              </Button>
            </div>
          </article>
        ))}
        <form key={editing || "new"} onSubmit={achievement} className="portfolio-form">
          <h3>
            <T>{editing ? "Modifier" : "Ajouter une distinction"}</T>
          </h3>
          <Field label="Discipline" name="awardSport">
            <select id="awardSport" name="awardSport" defaultValue={current?.sport || p.sport}>
              {disciplines.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field
            label="Titre"
            name="awardTitle"
            required
            maxLength={100}
            defaultValue={current?.title}
          />
          <Field
            label="Épreuve / organisme"
            name="awardEvent"
            required
            maxLength={100}
            defaultValue={current?.event}
          />
          <Field
            label="Année"
            name="awardYear"
            type="number"
            required
            min={1900}
            max={new Date().getFullYear()}
            defaultValue={current?.year}
          />
          {error && (
            <p className="field-error" role="alert">
              {error}
            </p>
          )}
          <Submit>
            <T>Enregistrer</T>
          </Submit>
          {editing && (
            <Button type="button" variant="ghost" onClick={() => setEditing("")}>
              <T>Annuler</T>
            </Button>
          )}
        </form>
      </section>
      <section className="portfolio-panel">
        <h2>
          <T>Vidéos sportives</T>
        </h2>
        <p className="field-hint">
          <T>
            Aperçu local uniquement : MP4 ou WebM, 50 Mo et 5 minutes maximum. Aucun téléversement
            ni analyse automatique du contenu.
          </T>
        </p>
        {!p.videos.length && (
          <p>
            <T>Aucune vidéo ajoutée.</T>
          </p>
        )}
        {p.videos.map((v) => (
          <article className="portfolio-record" key={v.id}>
            <video controls playsInline preload="metadata" src={v.url} aria-label={v.title} />
            <h3>{v.title}</h3>
            <p>{v.sport}</p>
            <Button
              variant="ghost"
              onClick={() => setProfile({ ...p, videos: p.videos.filter((x) => x.id !== v.id) })}
            >
              <T>Supprimer</T>
            </Button>
          </article>
        ))}
        <form className="portfolio-form" onSubmit={addVideo}>
          <Field
            label="Choisir une vidéo"
            name="videoFile"
            type="file"
            accept="video/mp4,video/webm"
            onChange={(e) => void choose(e.target.files?.[0])}
          />
          {busy && (
            <p role="status">{locale === "en" ? "Reading video…" : "Lecture de la vidéo…"}</p>
          )}
          {pending && (
            <video controls playsInline src={pending.url} aria-label={t("Vidéos sportives")} />
          )}
          <Field label="Titre" name="videoTitle" maxLength={100} required />
          <Field label="Discipline" name="videoSport">
            <select id="videoSport" name="videoSport" defaultValue={p.sport}>
              {disciplines.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <label className="sport-consent">
            <input type="checkbox" name="videoConsent" required />
            <T>
              Je confirme que cette vidéo concerne le sport et que je dispose des autorisations de
              diffusion.
            </T>
          </label>
          {videoError && (
            <p role="alert" className="field-error">
              {videoError}
            </p>
          )}
          <Submit disabled={busy || !pending}>
            <T>Ajouter la vidéo</T>
          </Submit>
        </form>
      </section>
    </ProfileLayout>
  );
}
