"use client";
import { T } from "./locale";
import { RegistrationFields } from "./sport-profile-fields";
import { sportProfileIssues } from "@/lib/sport-profile";
import { FreePlanNote } from "./subscription-ui";
import { ProfileDirectoryFields } from "./directory-fields";
import { athleteIssues, normalizeMeasurement } from "@/lib/athlete";
import { directoryIssues, primaryRecord } from "@/lib/directory";
import { moderateText } from "@/lib/trust";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  Mail,
  RefreshCw,
  UserRound,
  BriefcaseBusiness,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { useDemo } from "./demo-provider";
import { AuthLayout, Field, Password, Submit, Guard, FormErrors, focusError } from "./studio-ui";
import {
  DEMO_CODE,
  DEMO_PASSWORD,
  DEMO_EMAIL,
  categories,
  sports,
  initialProfile,
  photos,
  createProfile,
  validateIdentity,
  validateDemoLogin,
  validDemoCode,
  validEmail,
  type Category,
  type Issues,
  type Profile,
} from "@/lib/model";
const value = (form: FormData, key: string) => String(form.get(key) || "").trim();

export function Signup() {
  const { draft, setDraft, setEmailVerified, dispatchTrust } = useDemo();
  const [identityDefaults] = useState(draft);
  const [registration, setRegistration] = useState<Profile>(
    () => draft || createProfile({ firstName: "", lastName: "", email: "" }),
  );
  const router = useRouter();
  const [errors, setErrors] = useState<Issues>({});
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const identity = {
      firstName: value(data, "firstName"),
      lastName: value(data, "lastName"),
      email: value(data, "email"),
    };
    const issues = {
      ...validateIdentity(identity, String(data.get("password") || "")),
      ...sportProfileIssues(registration),
    };
    if (!data.get("policy")) issues.policy = "Prenez connaissance de la notice de confidentialité.";
    if (!data.get("accuracy"))
      issues.accuracy = "Confirmez l’exactitude des informations et le respect de la charte.";
    if (moderateText(JSON.stringify(identity)))
      issues.firstName = "Reformulez les informations de manière respectueuse.";
    setErrors(issues);
    focusError(issues);
    if (Object.keys(issues).length) return;
    dispatchTrust({ type: "reset" });
    dispatchTrust({ type: "consent", policy: true, accuracy: true });
    setDraft({
      ...createProfile(identity),
      birthDate: registration.birthDate,
      registrationMode: registration.registrationMode,
      guardian: registration.guardian,
    });
    setEmailVerified(false);
    e.currentTarget.reset();
    router.push("/verification");
  }
  return (
    <AuthLayout
      step={1}
      title={
        <>
          <T>{"Votre compte,"}</T>
          <br />
          <T>{"votre départ"}</T>
          <span className="lime">.</span>
        </>
      }
      intro="Un profil gratuit pour donner une nouvelle dimension à votre parcours sportif."
    >
      <form onSubmit={submit} noValidate>
        <FormErrors errors={errors} />
        <RegistrationFields profile={registration} onChange={setRegistration} errors={errors} />
        {registration.registrationMode === "child" && (
          <p className="child-mode-note">
            <T>
              {
                "Les prénom et nom ci-dessous sont ceux de l’enfant. L’adresse e-mail et le compte appartiennent au représentant."
              }
            </T>
          </p>
        )}
        <div className="field-pair">
          <Field
            label="Prénom"
            name="firstName"
            autoComplete="given-name"
            required
            maxLength={60}
            defaultValue={identityDefaults?.firstName}
            placeholder="Alex"
            error={errors.firstName}
          />
          <Field
            label="Nom"
            name="lastName"
            autoComplete="family-name"
            required
            maxLength={60}
            defaultValue={identityDefaults?.lastName}
            placeholder="Dupont"
            error={errors.lastName}
          />
        </div>
        <Field
          label="Adresse e-mail fictive"
          name="email"
          type="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          inputMode="email"
          required
          maxLength={254}
          defaultValue={identityDefaults?.email}
          placeholder="alex@demo.example"
          error={errors.email}
        />
        <Password error={errors.password} newPassword />
        <div className="trust-consents">
          <label>
            <input id="policy" name="policy" type="checkbox" required />
            <T>{"J’ai pris connaissance de la"}</T>{" "}
            <Link href="/confidentialite" target="_blank" rel="noreferrer">
              <T>{"notice de confidentialité de la démo"}</T>
            </Link>
            .
          </label>
          <label>
            <input id="accuracy" name="accuracy" type="checkbox" required />
            <T>
              {
                "J’atteste l’exactitude de mes informations dans le service réel et j’accepte la charte de respect. Pour cette démo, j’utilise uniquement des données fictives."
              }
            </T>
          </label>
        </div>
        <div className="inline-note">
          <Mail size={18} />
          <span>
            <T>{"Prochaine étape : vérifier votre adresse."}</T>
            <small>
              <T>{"La validation sera simulée dans cette démo."}</T>
            </small>
          </span>
        </div>
        <Submit>
          <T>{"Continuer"}</T>
        </Submit>
      </form>
      <p className="switch-auth">
        <T>{"Déjà membre ?"}</T>{" "}
        <Link href="/connexion">
          <T>{"Se connecter"}</T>
          <ArrowRight size={14} />
        </Link>
      </p>
    </AuthLayout>
  );
}

export function VerifyEmail() {
  const { draft, setEmailVerified, notify } = useDemo();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [resends, setResends] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [expires, setExpires] = useState(() => Date.now() + 600000);
  if (!draft) return <Guard />;
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (attempts >= 5 || Date.now() > expires) {
      setError("Code expiré ou trop de tentatives. Simulez un nouvel envoi.");
      return;
    }
    setAttempts(attempts + 1);
    if (!validDemoCode(code)) {
      setError("Le code de démonstration est 246810.");
      return;
    }
    setEmailVerified(true);
    router.push("/double-facteur");
  }
  return (
    <AuthLayout
      back="/inscription"
      step={2}
      title={
        <>
          <T>{"Votre e-mail,"}</T>
          <br />
          <T>{"votre point de départ."}</T>
        </>
      }
      intro="Un petit geste pour garder les bons contacts."
    >
      <div className="email-target">
        <Mail size={25} />
        <strong>{draft.email}</strong>
        <Link href="/inscription">
          <T>{"Corriger l’adresse"}</T>
        </Link>
      </div>
      <div className="demo-code-note">
        <span>
          <T>{"SIMULATION · AUCUN E-MAIL ENVOYÉ"}</T>
        </span>
        <p>
          <T>{"Pour essayer cette étape, saisissez"}</T>
          <strong>{DEMO_CODE}</strong>.
        </p>
      </div>
      <form onSubmit={submit} noValidate>
        <Field
          label="Code de vérification"
          name="code"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]{6}"
          maxLength={6}
          className="code-input"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.replace(/\D/g, ""));
            setError("");
          }}
          placeholder="000000"
          error={error}
        />
        {error && (
          <p className="sr-only" role="alert">
            {error}
          </p>
        )}
        <Submit>
          <T>{"Valider le code démo"}</T>
        </Submit>
      </form>
      <Button
        variant="ghost"
        className="resend"
        onClick={() => {
          setResends(resends + 1);
          setAttempts(0);
          setExpires(Date.now() + 600000);
          setError("");
          notify("Renvoi simulé : aucun e-mail envoyé. Le code reste 246810.");
        }}
      >
        <RefreshCw size={15} />
        <T>{"Simuler un nouvel envoi"}</T>
      </Button>
      {resends > 0 && (
        <p className="field-hint" role="status">
          <T>{"Renvoi simulé. Utilisez toujours le code"}</T>
          {DEMO_CODE}.
        </p>
      )}
    </AuthLayout>
  );
}

export function Personalise() {
  const { draft, setDraft, emailVerified, trust } = useDemo();
  const router = useRouter();
  const [category, setCategory] = useState<Category>(draft?.category || "Sportif");
  const [errors, setErrors] = useState<Issues>({});
  const [discovery, setDiscovery] = useState<Profile>(() =>
    structuredClone(draft || initialProfile),
  );
  if (!draft) return <Guard />;
  if (!emailVerified) return <Guard verification />;
  if (!trust.securityStep || !trust.policy || !trust.accuracy)
    return (
      <AuthLayout
        title="Terminez la validation."
        intro="Les validations de la démo sont nécessaires avant de poursuivre."
      >
        <Link className="action primary" href={trust.policy ? "/double-facteur" : "/inscription"}>
          <T>{"Reprendre la validation"}</T>
        </Link>
      </AuthLayout>
    );
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const issues: Issues = {
      ...directoryIssues({ ...discovery, category }),
      ...sportProfileIssues({ ...discovery, category }),
      ...athleteIssues({ ...discovery, category }),
    };
    if (!value(data, "headline")) issues.headline = "Indiquez votre rôle dans le sport.";
    if (!value(data, "city")) issues.city = "Indiquez une ville fictive.";
    if (category === "Organisation" && !value(data, "organisation"))
      issues.organisation = "Indiquez le nom de l’organisation fictive.";
    if (
      moderateText(
        [
          value(data, "headline"),
          value(data, "city"),
          value(data, "organisation"),
          JSON.stringify(discovery),
        ].join(" "),
      )
    )
      issues.headline = "Utilisez des informations respectueuses.";
    setErrors(issues);
    focusError(issues);
    if (Object.keys(issues).length) return;
    setDraft({
      ...draft!,
      birthDate: discovery.birthDate,
      registrationMode: discovery.registrationMode,
      guardian: discovery.guardian,
      category,
      country: discovery.country.trim(),
      weightKg: category === "Sportif" ? normalizeMeasurement(discovery.weightKg) : "",
      heightCm: category === "Sportif" ? normalizeMeasurement(discovery.heightCm) : "",
      gender: category === "Sportif" ? discovery.gender : "",
      accountType: category === "Sportif" ? "" : discovery.accountType,
      sport: discovery.sport,
      disciplines: discovery.disciplines.some((r) => r.sport === discovery.sport)
        ? discovery.disciplines
        : [...discovery.disciplines, primaryRecord(discovery)],
      headline: value(data, "headline"),
      city: value(data, "city"),
      organisation: value(data, "organisation"),
    });
    router.push("/presentation");
  }
  const icons = [UserRound, BriefcaseBusiness, Building2];
  return (
    <AuthLayout
      back="/double-facteur"
      step={3}
      title={
        <>
          <T>{"Votre place"}</T>
          <br />
          <T>{"dans le sport"}</T>
          <span className="lime">.</span>
        </>
      }
      intro="Plus votre profil vous ressemble, plus les rencontres ont du sens."
    >
      <form noValidate onSubmit={submit}>
        <FormErrors errors={errors} />
        <fieldset className="role-choices">
          <legend>
            <T>{"Vous êtes…"}</T>
          </legend>
          {categories.map((cat, i) => {
            const Icon = icons[i];
            return (
              <label key={cat} className={category === cat ? "selected" : ""}>
                <input
                  type="radio"
                  name="category"
                  value={cat}
                  disabled={discovery.registrationMode === "child" && cat !== "Sportif"}
                  checked={category === cat}
                  onChange={() => {
                    setCategory(cat);
                    setDiscovery((p) => ({ ...p, category: cat, accountType: "" }));
                    setErrors({});
                  }}
                />
                <Icon size={21} />
                <span>
                  <T>{cat}</T>
                </span>
                {category === cat && <Check size={14} />}
              </label>
            );
          })}
        </fieldset>
        <FreePlanNote category={category} />
        {category === "Organisation" && (
          <Field
            label="Nom de l’organisation fictive"
            name="organisation"
            autoComplete="organization"
            defaultValue={discovery.organisation}
            error={errors.organisation}
            maxLength={100}
          />
        )}
        <Field label="Votre discipline" name="sport">
          <NativeSelect
            id="sport"
            name="sport"
            value={discovery.sport}
            onChange={(e) => setDiscovery((p) => ({ ...p, sport: e.target.value }))}
            className="select-field"
          >
            {sports.map((s) => (
              <NativeSelectOption key={s} value={s}>
                {s}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>
        <ProfileDirectoryFields
          profile={{ ...discovery, category }}
          onChange={(p) => {
            setDiscovery(p);
            setErrors((previous) => {
              const next = { ...previous };
              delete next.country;
              delete next.gender;
              delete next.accountType;
              delete next.weightKg;
              delete next.heightCm;
              return next;
            });
          }}
          errors={errors}
        />
        <Field
          label={category === "Organisation" ? "Votre activité" : "Votre rôle ou spécialité"}
          name="headline"
          defaultValue={discovery.headline}
          autoComplete="organization-title"
          placeholder={
            category === "Professionnel"
              ? "Coach de padel"
              : category === "Organisation"
                ? "Club de padel"
                : "Joueur de padel"
          }
          maxLength={90}
          error={errors.headline}
        />
        <Field
          label="Ville"
          name="city"
          defaultValue={discovery.city}
          autoComplete="address-level2"
          placeholder="Liège"
          maxLength={90}
          error={errors.city}
        />
        <Submit>
          <T>{"Continuer"}</T>
        </Submit>
      </form>
    </AuthLayout>
  );
}

export function Presentation() {
  const { draft, setDraft, emailVerified, setProfile, notify, dispatchSocial, trust } = useDemo();
  const router = useRouter();
  const [photo, setPhoto] = useState(draft?.photo || photos[0].src);
  const [bio, setBio] = useState(draft?.bio || "");
  const [bioError, setBioError] = useState("");
  if (!draft) return <Guard />;
  if (!emailVerified) return <Guard verification />;
  if (!trust.securityStep || !trust.policy || !trust.accuracy)
    return (
      <AuthLayout
        title="Terminez la validation."
        intro="Votre parcours d’inscription n’est pas terminé."
      >
        <Link className="action primary" href={trust.policy ? "/double-facteur" : "/inscription"}>
          <T>{"Reprendre la validation"}</T>
        </Link>
      </AuthLayout>
    );
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (moderateText(bio)) {
      setBioError("Reformulez votre présentation de manière respectueuse.");
      return;
    }
    setProfile({ ...draft!, bio: bio.trim(), photo });
    dispatchSocial({ type: "reset" });
    setDraft(null);
    notify("Votre profil de démonstration est prêt. Aucun compte réel n’a été créé.");
    router.push("/accueil");
  }
  return (
    <AuthLayout
      back="/personnalisation"
      step={4}
      title={
        <>
          <T>{"Un profil"}</T>
          <br />
          <T>{"à votre image."}</T>
        </>
      }
      intro="Ajoutez une touche personnelle. Vous pourrez compléter le reste à votre rythme."
    >
      <form onSubmit={submit}>
        {bioError && (
          <p role="alert" className="event-error">
            {bioError}
          </p>
        )}
        <fieldset className="photo-choices">
          <legend>
            <T>{"Choisir une illustration de profil"}</T>
          </legend>
          <p className="field-hint">
            <T>{"Personnages fictifs, images de démonstration."}</T>
          </p>
          <div>
            {photos.slice(0, 4).map((p) => (
              <label key={p.src} className={photo === p.src ? "selected" : ""}>
                <input
                  type="radio"
                  name="photo"
                  value={p.src}
                  checked={photo === p.src}
                  onChange={() => setPhoto(p.src)}
                />
                <img src={p.src} alt={p.label} />
                {photo === p.src && <Check size={15} />}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="field">
          <label htmlFor="bio">
            <T>{"Quelques mots sur vous"}</T>
            <span className="optional">
              <T>{"facultatif"}</T>
            </span>
          </label>
          <Textarea
            id="bio"
            name="bio"
            value={bio}
            maxLength={600}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Votre passion, votre approche, ce qui vous anime…"
            rows={4}
          />
          <p className="field-hint char-count">{bio.length}/600</p>
        </div>
        <div className="ready-card">
          <Check size={19} />
          <span>
            <T>{"Le terrain est à vous."}</T>
            <small>
              <T>{"Votre profil est prêt à être exploré."}</T>
            </small>
          </span>
        </div>
        <Submit>
          <T>{"Découvrir mon profil"}</T>
        </Submit>
      </form>
    </AuthLayout>
  );
}

export function Login() {
  const { profile, setProfile, notify } = useDemo();
  const router = useRouter();
  const [errors, setErrors] = useState<Issues>({});
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = value(data, "email").toLowerCase();
    const issues = validateDemoLogin(email, String(data.get("password") || ""), profile.email);
    setErrors(issues);
    focusError(issues);
    if (Object.keys(issues).length) return;
    if (email !== profile.email.toLowerCase()) setProfile(structuredClone(initialProfile));
    e.currentTarget.reset();
    notify("Vous explorez une session fictive, sans authentification réelle.");
    router.push("/accueil");
  }
  return (
    <AuthLayout
      title={
        <>
          <T>{"Heureux de"}</T>
          <br />
          <T>{"vous revoir"}</T>
          <span className="lime">.</span>
        </>
      }
      intro="Votre parcours, vos ambitions, votre prochain chapitre."
    >
      <form onSubmit={submit} noValidate id="login-form">
        <FormErrors errors={errors} />
        <Field
          label="Adresse e-mail fictive"
          name="email"
          type="email"
          autoComplete="username"
          inputMode="email"
          autoCapitalize="none"
          spellCheck={false}
          placeholder={DEMO_EMAIL}
          required
          maxLength={254}
          error={errors.email}
        />
        <Password error={errors.password} />
        <Link href="/mot-de-passe-oublie" className="forgot-link">
          <T>{"Mot de passe oublié ?"}</T>
        </Link>
        <Submit>
          <T>{"Se connecter à la démo"}</T>
        </Submit>
      </form>
      <p className="switch-auth">
        <T>{"Pas encore de profil ?"}</T>
        <Link href="/inscription">
          <T>{"Créer un compte gratuit"}</T>
        </Link>
      </p>
      <div className="demo-access">
        <span className="eyebrow">
          <T>{"POUR ESSAYER EN UN CLIC"}</T>
        </span>
        <strong>
          <T>{"Le profil fictif d’Alex vous attend."}</T>
        </strong>
        <p>
          <T>{"Aucune information personnelle nécessaire."}</T>
        </p>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            setProfile(structuredClone(initialProfile));
            notify("Profil fictif d’Alex ouvert.");
            router.push("/accueil");
          }}
        >
          <T>{"Explorer le profil démo"}</T>
          <ArrowRight size={17} />
        </Button>
        <small>
          <T>{"Accès formulaire :"}</T>
          {DEMO_EMAIL} / {DEMO_PASSWORD}
        </small>
      </div>
    </AuthLayout>
  );
}

export function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = value(new FormData(e.currentTarget), "email");
    if (!validEmail(email)) {
      setError("Indiquez une adresse au format nom@exemple.com.");
      return;
    }
    setError("");
    setSent(true);
  }
  return (
    <AuthLayout
      back="/connexion"
      title={
        sent ? (
          "Votre accès, en toute simplicité."
        ) : (
          <>
            <T>{"On vous remet"}</T>
            <br />
            <T>{"dans le jeu."}</T>
          </>
        )
      }
      intro={
        sent
          ? "Vous venez de tester le parcours de récupération."
          : "Indiquez une adresse fictive pour découvrir la récupération de compte."
      }
    >
      {sent ? (
        <div className="recovery-success" role="status">
          <Mail size={32} />
          <h2>
            <T>{"Envoi simulé."}</T>
          </h2>
          <p>
            <T>{"Aucun e-mail n’a été envoyé. Dans cette démo, le mot de passe reste"}</T>{" "}
            <strong>{DEMO_PASSWORD}</strong>.
          </p>
          <Link href="/connexion" className="action primary">
            <T>{"Retour à la connexion"}</T>
            <ArrowRight size={18} />
          </Link>
          <Button variant="ghost" onClick={() => setSent(false)}>
            <T>{"Essayer une autre adresse"}</T>
          </Button>
        </div>
      ) : (
        <form noValidate onSubmit={submit}>
          <Field
            label="Adresse e-mail fictive"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            placeholder={DEMO_EMAIL}
            error={error}
            maxLength={254}
          />
          {error && (
            <span role="alert" className="sr-only">
              {error}
            </span>
          )}
          <Submit>
            <T>{"Simuler l’envoi du lien"}</T>
          </Submit>
        </form>
      )}
    </AuthLayout>
  );
}
