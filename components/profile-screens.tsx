"use client";
import { useState, type ReactNode, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  Download,
  FileText,
  MapPin,
  Pencil,
  Plus,
  Settings,
  Target,
  Trash2,
  UserRound,
  X,
  LogOut,
  RotateCcw,
  BriefcaseBusiness,
  Camera,
  LockKeyhole,
  House,
  UsersRound,
  MessageCircle,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useDemo } from "./demo-provider";
import { PlanStatus } from "./subscription-ui";
import { Brand, DemoPill, Field, Submit, FormErrors, focusError } from "./studio-ui";
import {
  photos,
  sports,
  categories,
  displayName,
  completion,
  cvText,
  validateProfile,
  type Profile,
  type Experience,
  type Issues,
} from "@/lib/model";

const navigation = [
  { href: "/accueil", label: "Accueil", icon: House },
  { href: "/reseau", label: "Réseau", icon: UsersRound },
  { href: "/messages", label: "Messages", icon: MessageCircle },
  { href: "/opportunities", label: "Opportunities", icon: Compass },
  { href: "/profil", label: "Profil", icon: UserRound },
];

function BottomNav() {
  const pathname = usePathname();
  const current = [
    "/modifier-profil",
    "/parcours",
    "/medias",
    "/parametres",
    "/abonnement",
  ].includes(pathname)
    ? "/profil"
    : pathname;
  return (
    <nav className="bottom-nav" aria-label="Navigation de l’application">
      {navigation.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className="bottom-nav-item"
          aria-current={current === href ? "page" : undefined}
        >
          <span className="bottom-nav-icon">
            <Icon size={22} aria-hidden="true" />
          </span>
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}

export function ProfileLayout({
  children,
  back,
  title,
}: {
  children: ReactNode;
  back?: string;
  title?: string;
}) {
  return (
    <main id="main" className="profile-layout">
      <header className="app-header">
        <Brand href="/accueil" />
        <div className="header-right">
          <DemoPill />
          {back ? (
            <Link href={back} className="icon-link" aria-label="Retour au profil">
              <ArrowLeft size={21} />
            </Link>
          ) : (
            <Link href="/parametres" className="icon-link" aria-label="Réglages de la démo">
              <Settings size={21} />
            </Link>
          )}
        </div>
      </header>
      {title && (
        <div className="page-title">
          <p className="eyebrow">VOTRE ESPACE / ARENA STUDIO</p>
          <h1>{title}</h1>
        </div>
      )}
      {children}
      <footer className="profile-footer">
        <span>CONTENUS FICTIFS · DÉMO INTERACTIVE</span>
        <p>
          Les modifications restent dans cette visite et sont effacées au rechargement. Rien n’est
          publié.
        </p>
      </footer>
      <BottomNav />
    </main>
  );
}
export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="studio-modal" showCloseButton={false}>
        <Button
          type="button"
          variant="ghost"
          className="modal-close"
          aria-label="Fermer la fenêtre"
          onClick={() => onOpenChange(false)}
        >
          <X size={20} />
        </Button>
        <DialogTitle className="modal-title">{title}</DialogTitle>
        <DialogDescription className="modal-description">{description}</DialogDescription>
        {children}
      </DialogContent>
    </Dialog>
  );
}
function EmptyCard({
  icon: Icon,
  title,
  text,
  action,
}: {
  icon: typeof UserRound;
  title: string;
  text: string;
  action: ReactNode;
}) {
  return (
    <div className="empty-card">
      <Icon size={28} />
      <h3>{title}</h3>
      <p>{text}</p>
      {action}
    </div>
  );
}

export function ProfilePage({ section = "about" }: { section?: "about" | "career" | "media" }) {
  const { profile, setProfile, notify } = useDemo();
  const progress = completion(profile);
  const router = useRouter();
  const tab = section;
  const [photoOpen, setPhotoOpen] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [experience, setExperience] = useState<Experience | null>(null);
  const [experienceOpen, setExperienceOpen] = useState(false);
  const [progressOpen, setProgressOpen] = useState(false);
  function download() {
    const url = URL.createObjectURL(
      new Blob([cvText(profile)], { type: "text/plain;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "cv-arena-profil-fictif.txt";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify("Le CV fictif a été téléchargé au format texte.");
  }
  function addExperience() {
    setExperience(null);
    setExperienceOpen(true);
  }
  function saveExperience(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const record: Experience = {
      id: experience?.id || crypto.randomUUID(),
      title: String(data.get("title") || "").trim(),
      organisation: String(data.get("organisation") || "").trim(),
      period: String(data.get("period") || "").trim(),
      description: String(data.get("description") || "").trim(),
    };
    if (!record.title || !record.organisation || !record.period) {
      notify("Complétez le rôle, l’organisation et la période avant d’enregistrer.");
      return;
    }
    setProfile({
      ...profile,
      experiences: experience
        ? profile.experiences.map((x) => (x.id === experience.id ? record : x))
        : [record, ...profile.experiences],
    });
    setExperienceOpen(false);
    notify("Votre parcours a été mis à jour dans la démo.");
  }
  return (
    <ProfileLayout>
      <div className="profile-heading">
        <div>
          <p className="eyebrow">LE SPORT VOUS RASSEMBLE</p>
          <h1>
            {tab === "career" ? "Mon parcours" : tab === "media" ? "Mes médias" : "Mon profil"}
            <span className="lime">.</span>
          </h1>
        </div>
        <span className="member-type">
          <i />
          {profile.category}
        </span>
      </div>
      {tab === "about" && <PlanStatus />}
      <nav className="profile-subnav" aria-label="Rubriques de mon profil">
        <Link href="/profil" aria-current={tab === "about" ? "page" : undefined}>
          À propos
        </Link>
        <Link href="/parcours" aria-current={tab === "career" ? "page" : undefined}>
          Parcours
        </Link>
        <Link href="/medias" aria-current={tab === "media" ? "page" : undefined}>
          Médias
        </Link>
      </nav>
      <div className="profile-grid">
        {tab === "about" && (
          <aside className="identity-card">
            <div className="profile-cover">
              <img
                src={profile.photo}
                alt={`Illustration du profil fictif ${displayName(profile)}`}
              />
              <span className="cover-caption">
                VOTRE SPORT.
                <br />
                VOTRE HISTOIRE.
              </span>
              <Button
                size="icon"
                variant="secondary"
                className="change-photo"
                aria-label="Changer l’illustration du profil"
                onClick={() => setPhotoOpen(true)}
              >
                <Camera size={18} />
              </Button>
            </div>
            <div className="identity-content">
              <div className="identity-name">
                <h2>{displayName(profile)}</h2>
                <Link
                  href="/modifier-profil"
                  className="edit-circle"
                  aria-label="Modifier mon profil"
                >
                  <Pencil size={18} />
                </Link>
              </div>
              <p className="profile-headline">{profile.headline}</p>
              <p className="location">
                <MapPin size={14} />
                {profile.city || "Ville à compléter"}
              </p>
              <span className="sport-chip">{profile.sport}</span>
              <div className="identity-rule" />
              <p className="identity-small">
                Un parcours singulier.
                <br />
                Un terrain de rencontres.
              </p>
              <Link href="/modifier-profil" className="profile-edit-link">
                Modifier mon profil <ArrowUpRight size={16} />
              </Link>
            </div>
          </aside>
        )}
        <section className="profile-content">
          {tab === "about" && (
            <Button className="completion-card" onClick={() => setProgressOpen(true)}>
              <UserRound size={26} />
              <span>
                <strong>
                  {progress.count === progress.total
                    ? "Votre profil prend vie."
                    : "Compléter mon profil"}
                </strong>
                <small>
                  {progress.count} sur {progress.total} rubriques renseignées.{" "}
                  {progress.count === progress.total
                    ? "Personnalisez-le à votre image."
                    : "Chaque détail raconte votre parcours."}
                </small>
              </span>
              <ArrowRight size={20} />
            </Button>
          )}
          <div className="profile-sections">
            {tab === "about" && (
              <section aria-label="À propos" className="tab-body">
                <article className="info-card">
                  <div className="card-heading">
                    <h3>
                      <UserRound size={16} /> Ma présentation
                    </h3>
                    <Link href="/modifier-profil" aria-label="Modifier ma présentation">
                      <Pencil size={15} />
                    </Link>
                  </div>
                  <p>
                    {profile.bio ||
                      "Votre histoire reste à écrire. Ajoutez quelques mots sur votre passion et votre approche du sport."}
                  </p>
                  <div className="skill-tags">
                    {profile.skills.length ? (
                      profile.skills.map((s) => <span key={s}>{s}</span>)
                    ) : (
                      <Link href="/modifier-profil">+ Ajouter mes compétences</Link>
                    )}
                  </div>
                </article>
                <article className="info-card">
                  <div className="card-heading">
                    <h3>
                      <Target size={17} /> Mon prochain mouvement
                    </h3>
                  </div>
                  <p>
                    {profile.objective ||
                      "Un projet, une envie de progresser, des rencontres à faire… Quel est votre prochain objectif ?"}
                  </p>
                  {!profile.objective && (
                    <Link href="/modifier-profil" className="text-link">
                      Ajouter mon objectif <ArrowRight size={14} />
                    </Link>
                  )}
                </article>
                <button className="cv-card" onClick={download}>
                  <FileText size={28} />
                  <span>
                    <strong>Mon CV sportif</strong>
                    <small>Télécharger mon parcours · fichier texte</small>
                  </span>
                  <Download size={19} />
                </button>
                <div className="card-heading section-heading">
                  <h3>Mes médias</h3>
                  <Button variant="ghost" onClick={() => router.push("/medias")}>
                    Voir tout <ArrowRight size={14} />
                  </Button>
                </div>
                {profile.media.length ? (
                  <div className="media-preview">
                    {profile.media.slice(0, 2).map((src) => (
                      <button
                        key={src}
                        onClick={() => setSelectedMedia(src)}
                        aria-label={`Agrandir : ${photos.find((p) => p.src === src)?.label || "image de démonstration"}`}
                      >
                        <img
                          src={src}
                          alt={photos.find((p) => p.src === src)?.label || "Image sportive fictive"}
                        />
                        <ArrowUpRight size={17} />
                      </button>
                    ))}
                  </div>
                ) : (
                  <button className="add-media-inline" onClick={() => setMediaOpen(true)}>
                    <Plus size={18} /> Ajouter mes premiers visuels
                  </button>
                )}
              </section>
            )}
            {tab === "career" && (
              <section aria-label="Mon parcours" className="tab-body">
                <div className="card-heading section-heading">
                  <h3>Chaque étape compte.</h3>
                  <Button variant="ghost" onClick={addExperience}>
                    <Plus size={17} /> Ajouter
                  </Button>
                </div>
                {profile.experiences.length ? (
                  <div className="timeline">
                    {profile.experiences.map((exp) => (
                      <article key={exp.id} className="experience-card">
                        <span className="timeline-dot" />
                        <div className="card-heading">
                          <span className="experience-period">{exp.period}</span>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setExperience(exp);
                              setExperienceOpen(true);
                            }}
                            aria-label={`Modifier : ${exp.title}`}
                          >
                            <Pencil size={15} />
                          </Button>
                        </div>
                        <h3>{exp.title}</h3>
                        <p className="experience-org">{exp.organisation}</p>
                        <p>{exp.description}</p>
                      </article>
                    ))}
                  </div>
                ) : (
                  <EmptyCard
                    icon={BriefcaseBusiness}
                    title="Votre parcours commence ici."
                    text="Ajoutez une expérience, un club ou une formation. Utilisez des informations fictives pour cette démo."
                    action={
                      <Button onClick={addExperience} className="small-primary">
                        <Plus size={16} /> Ajouter une étape
                      </Button>
                    }
                  />
                )}
                <button className="cv-card" onClick={download}>
                  <FileText size={26} />
                  <span>
                    <strong>Exporter mon CV fictif</strong>
                    <small>Les informations de ce profil, au format texte.</small>
                  </span>
                  <Download size={18} />
                </button>
              </section>
            )}
            {tab === "media" && (
              <section aria-label="Mes médias" className="tab-body">
                <div className="card-heading section-heading">
                  <h3>Votre sport en images.</h3>
                  <Button variant="ghost" onClick={() => setMediaOpen(true)}>
                    <Plus size={16} /> Ajouter
                  </Button>
                </div>
                <p className="section-note">
                  Galerie de démonstration. Aucun téléversement ni publication.
                </p>
                {profile.media.length ? (
                  <div className="media-grid">
                    {profile.media.map((src) => (
                      <button key={src} onClick={() => setSelectedMedia(src)}>
                        <img
                          src={src}
                          alt={photos.find((p) => p.src === src)?.label || "Illustration sportive"}
                        />
                        <span>
                          {photos.find((p) => p.src === src)?.label}
                          <ArrowUpRight size={16} />
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <EmptyCard
                    icon={Camera}
                    title="Un autre regard sur votre sport."
                    text="Choisissez des visuels de démonstration pour personnaliser votre galerie."
                    action={
                      <Button onClick={() => setMediaOpen(true)} className="small-primary">
                        Choisir une image
                      </Button>
                    }
                  />
                )}
              </section>
            )}
          </div>
        </section>
      </div>
      <Modal
        open={photoOpen}
        onOpenChange={setPhotoOpen}
        title="À votre image."
        description="Choisissez une illustration fictive pour votre profil. Aucun portrait réel n’est importé."
      >
        <div className="image-picker">
          {photos.map((p) => (
            <button
              key={p.src}
              className={profile.photo === p.src ? "selected" : ""}
              onClick={() => {
                setProfile({ ...profile, photo: p.src });
                setPhotoOpen(false);
                notify("Illustration de profil mise à jour.");
              }}
            >
              <img src={p.src} alt={p.label} />
              <span>{p.label}</span>
              {profile.photo === p.src && <Check size={17} />}
            </button>
          ))}
        </div>
      </Modal>
      <Modal
        open={mediaOpen}
        onOpenChange={setMediaOpen}
        title="Votre galerie sportive."
        description="Ajoutez une image parmi les visuels fictifs. Vous pourrez la retirer à tout moment."
      >
        <div className="image-picker">
          {photos.map((p) => {
            const added = profile.media.includes(p.src);
            return (
              <button
                key={p.src}
                disabled={added}
                onClick={() => {
                  setProfile({ ...profile, media: [...profile.media, p.src] });
                  setMediaOpen(false);
                  notify("Image ajoutée à votre galerie de démonstration.");
                }}
              >
                <img src={p.src} alt={p.label} />
                <span>{added ? "Déjà dans la galerie" : p.label}</span>
                {added && <Check size={17} />}
              </button>
            );
          })}
        </div>
      </Modal>
      <Modal
        open={!!selectedMedia}
        onOpenChange={() => setSelectedMedia(null)}
        title={photos.find((p) => p.src === selectedMedia)?.label || "Illustration sportive"}
        description="Image générée · personne fictive · galerie de démonstration."
      >
        {selectedMedia && (
          <img
            className="lightbox-image"
            src={selectedMedia}
            alt={photos.find((p) => p.src === selectedMedia)?.label || "Illustration sportive"}
          />
        )}
        <Button
          className="danger-link"
          variant="ghost"
          onClick={() => {
            setProfile({ ...profile, media: profile.media.filter((p) => p !== selectedMedia) });
            setSelectedMedia(null);
            notify("Image retirée de la galerie de démonstration.");
          }}
        >
          <Trash2 size={16} /> Retirer de ma galerie
        </Button>
      </Modal>
      <Modal
        open={experienceOpen}
        onOpenChange={setExperienceOpen}
        title={experience ? "Modifier cette étape." : "Une nouvelle étape."}
        description="Expérience, formation ou engagement : ajoutez une étape fictive à votre parcours."
      >
        <form onSubmit={saveExperience} key={experience?.id || "new"}>
          <Field
            label="Rôle ou formation"
            name="title"
            required
            maxLength={100}
            defaultValue={experience?.title}
            placeholder="Coach de padel"
          />
          <Field
            label="Organisation fictive"
            name="organisation"
            required
            maxLength={100}
            defaultValue={experience?.organisation}
            placeholder="Club Horizon · fictif"
          />
          <Field
            label="Période"
            name="period"
            required
            maxLength={60}
            defaultValue={experience?.period}
            placeholder="2023 — Aujourd’hui"
          />
          <div className="field">
            <label htmlFor="description">En quelques mots</label>
            <Textarea
              id="description"
              name="description"
              maxLength={400}
              defaultValue={experience?.description}
            />
          </div>
          <Submit>Enregistrer cette étape</Submit>
          {experience && (
            <Button
              type="button"
              variant="ghost"
              className="danger-link"
              onClick={() => {
                setProfile({
                  ...profile,
                  experiences: profile.experiences.filter((x) => x.id !== experience.id),
                });
                setExperienceOpen(false);
                notify("Étape retirée du parcours de démonstration.");
              }}
            >
              <Trash2 size={15} /> Retirer cette étape
            </Button>
          )}
        </form>
      </Modal>
      <Modal
        open={progressOpen}
        onOpenChange={setProgressOpen}
        title="Chaque détail vous rapproche."
        description="Un profil complet aide à raconter votre parcours. Ces informations restent dans la démo."
      >
        <div className="completion-list">
          {progress.items.map((item, i) => (
            <button
              key={item.label}
              onClick={() => {
                setProgressOpen(false);
                if (i < 4) router.push("/modifier-profil");
                else router.push(i === 4 ? "/parcours" : "/medias");
              }}
            >
              <span className={item.done ? "checked" : ""}>
                {item.done ? <Check size={16} /> : <Plus size={15} />}
              </span>
              {item.label}
              <ArrowRight size={15} />
            </button>
          ))}
        </div>
        <Link href="/modifier-profil" className="action primary">
          Personnaliser mon profil <Pencil size={16} />
        </Link>
      </Modal>
    </ProfileLayout>
  );
}

export function EditProfile() {
  const { profile, setProfile, notify } = useDemo();
  const router = useRouter();
  const [draft, setDraft] = useState<Profile>(structuredClone(profile));
  const [skills, setSkills] = useState(profile.skills.join(", "));
  const [errors, setErrors] = useState<Issues>({});
  function update(key: keyof Profile, value: string) {
    setDraft({ ...draft, [key]: value });
  }
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const next = {
      ...draft,
      firstName: draft.firstName.trim(),
      lastName: draft.lastName.trim(),
      headline: draft.headline.trim(),
      city: draft.city.trim(),
      organisation: draft.organisation.trim(),
      bio: draft.bio.trim(),
      objective: draft.objective.trim(),
      skills: [
        ...new Set(
          skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        ),
      ].slice(0, 8),
    };
    const issues = validateProfile(next);
    setErrors(issues);
    focusError(issues);
    if (Object.keys(issues).length) return;
    setProfile(next);
    notify("Modifications enregistrées pour cette visite. Rien n’a été publié.");
    router.push("/profil");
  }
  return (
    <ProfileLayout back="/profil" title="À votre image.">
      <form className="edit-form" onSubmit={submit} noValidate>
        <div className="edit-intro">
          <Pencil size={21} />
          <p>
            Les bonnes rencontres commencent par un profil qui vous ressemble.
            <small>Utilisez des informations fictives pour cette démonstration.</small>
          </p>
        </div>
        <FormErrors errors={errors} />
        <section className="edit-section">
          <h2>
            01 <span>Votre identité</span>
          </h2>
          <div className="field-pair">
            <Field
              label="Prénom"
              name="firstName"
              autoComplete="given-name"
              required
              maxLength={60}
              value={draft.firstName}
              onChange={(e) => update("firstName", e.target.value)}
              error={errors.firstName}
            />
            <Field
              label="Nom"
              name="lastName"
              autoComplete="family-name"
              required
              maxLength={60}
              value={draft.lastName}
              onChange={(e) => update("lastName", e.target.value)}
              error={errors.lastName}
            />
          </div>
          <Field label="Type de profil" name="category">
            <NativeSelect
              id="category"
              name="category"
              className="select-field"
              value={draft.category}
              onChange={(e) => update("category", e.target.value)}
            >
              {categories.map((c) => (
                <NativeSelectOption key={c}>{c}</NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>
          {draft.category === "Organisation" && (
            <Field
              label="Organisation fictive"
              name="organisation"
              autoComplete="organization"
              value={draft.organisation}
              onChange={(e) => update("organisation", e.target.value)}
              maxLength={100}
              error={errors.organisation}
            />
          )}
          <Field
            label="Adresse e-mail de démonstration"
            name="email"
            type="email"
            autoComplete="email"
            value={draft.email}
            readOnly
            hint="Non modifiable ici. Ce profil n’est relié à aucun compte réel."
          />
        </section>
        <section className="edit-section">
          <h2>
            02 <span>Votre univers sportif</span>
          </h2>
          <Field
            label="Rôle ou spécialité"
            name="headline"
            autoComplete="organization-title"
            value={draft.headline}
            onChange={(e) => update("headline", e.target.value)}
            required
            maxLength={90}
            error={errors.headline}
          />
          <div className="field-pair">
            <Field label="Discipline" name="sport">
              <NativeSelect
                id="sport"
                name="sport"
                className="select-field"
                value={draft.sport}
                onChange={(e) => update("sport", e.target.value)}
              >
                {sports.map((s) => (
                  <NativeSelectOption key={s}>{s}</NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
            <Field
              label="Ville"
              name="city"
              autoComplete="address-level2"
              required
              maxLength={90}
              value={draft.city}
              onChange={(e) => update("city", e.target.value)}
              error={errors.city}
            />
          </div>
          <Field
            label="Compétences"
            name="skills"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            maxLength={200}
            hint="Séparez les compétences par une virgule. Jusqu’à 8 compétences."
            placeholder="Pédagogie, technique, préparation"
          />
        </section>
        <section className="edit-section">
          <h2>
            03 <span>Votre histoire</span>
          </h2>
          <div className="field">
            <label htmlFor="bio">Présentation</label>
            <Textarea
              id="bio"
              name="bio"
              value={draft.bio}
              onChange={(e) => update("bio", e.target.value)}
              rows={5}
              maxLength={600}
            />
            <p className="field-hint char-count">{draft.bio.length}/600</p>
          </div>
          <div className="field">
            <label htmlFor="objective">Votre prochain objectif</label>
            <Textarea
              id="objective"
              name="objective"
              value={draft.objective}
              onChange={(e) => update("objective", e.target.value)}
              maxLength={250}
              rows={3}
              placeholder="Qu’aimeriez-vous construire dans le sport ?"
            />
          </div>
        </section>
        <div className="save-bar">
          <Link href="/profil" className="action secondary">
            Annuler
          </Link>
          <Submit>Enregistrer</Submit>
        </div>
      </form>
    </ProfileLayout>
  );
}

export function SettingsPage() {
  const { reset, notify, setDraft, setEmailVerified } = useDemo();
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  return (
    <ProfileLayout back="/profil" title="Votre espace, simplement.">
      <div className="settings-grid">
        <PlanStatus />
        <section className="info-card">
          <div className="card-heading">
            <h2>
              <LockKeyhole size={19} /> Une démo transparente.
            </h2>
          </div>
          <p>
            Aucun compte réel, aucune authentification et aucun message envoyé. Le code e-mail et
            les identifiants proposés servent uniquement à essayer l’interface.
          </p>
          <p>
            Vos modifications restent en mémoire dans cet onglet et disparaissent au rechargement.
            Aucun mot de passe saisi n’est conservé.
          </p>
        </section>
        <section className="info-card">
          <div className="card-heading">
            <h2>
              <UserRound size={19} /> Reprendre le parcours.
            </h2>
          </div>
          <p>Explorez la création d’un nouveau profil ou revenez au profil fictif d’Alex.</p>
          <Link href="/inscription" className="text-link">
            Essayer l’inscription <ArrowRight size={15} />
          </Link>
          <Button variant="ghost" className="settings-action" onClick={() => setConfirm(true)}>
            <RotateCcw size={17} /> Réinitialiser la démonstration
          </Button>
          <Button
            variant="ghost"
            className="settings-action"
            onClick={() => {
              setDraft(null);
              setEmailVerified(false);
              notify("Retour à l’accueil. La démo ne gère pas de session authentifiée.");
              router.push("/");
            }}
          >
            <LogOut size={17} /> Quitter le profil de démonstration
          </Button>
        </section>
      </div>
      <Modal
        open={confirm}
        onOpenChange={setConfirm}
        title="Repartir du premier point ?"
        description="Le profil, le parcours, la galerie, les publications, les suivis, les conversations et les favoris seront réinitialisés. Les données fictives de départ seront restaurées."
      >
        <Button
          className="action primary"
          onClick={() => {
            reset();
            setConfirm(false);
            router.push("/profil");
          }}
        >
          Réinitialiser la démo <RotateCcw size={17} />
        </Button>
        <Button variant="ghost" onClick={() => setConfirm(false)}>
          Conserver mes modifications
        </Button>
      </Modal>
    </ProfileLayout>
  );
}
