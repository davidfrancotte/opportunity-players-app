"use client";
import { FreePlanNote } from "./subscription-ui";
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
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { useDemo } from "./demo-provider";
import {
  AuthLayout,
  Field,
  Password,
  Submit,
  Guard,
  FormErrors,
  focusError,
} from "./studio-ui";
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
} from "@/lib/model";
const value = (form: FormData, key: string) =>
  String(form.get(key) || "").trim();

export function Signup() {
  const { draft, setDraft, setEmailVerified, dispatchTrust } = useDemo();
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
    const issues = validateIdentity(
      identity,
      String(data.get("password") || ""),
    );
    if (!data.get("policy"))
      issues.policy = "Prenez connaissance de la notice de confidentialité.";
    if (!data.get("accuracy"))
      issues.accuracy =
        "Confirmez l’exactitude des informations et le respect de la charte.";
    if (moderateText(JSON.stringify(identity)))
      issues.firstName = "Reformulez les informations de manière respectueuse.";
    setErrors(issues);
    focusError(issues);
    if (Object.keys(issues).length) return;
    dispatchTrust({ type: "reset" });
    dispatchTrust({ type: "consent", policy: true, accuracy: true });
    setDraft(createProfile(identity));
    setEmailVerified(false);
    e.currentTarget.reset();
    router.push("/verification");
  }
  return (
    <AuthLayout
      step={1}
      title={
        <>
          Votre compte,
          <br />
          votre départ<span className="lime">.</span>
        </>
      }
      intro="Un profil gratuit pour donner une nouvelle dimension à votre parcours sportif."
    >
      <form onSubmit={submit} noValidate>
        <FormErrors errors={errors} />
        <div className="field-pair">
          <Field
            label="Prénom"
            name="firstName"
            autoComplete="given-name"
            required
            maxLength={60}
            defaultValue={draft?.firstName}
            placeholder="Alex"
            error={errors.firstName}
          />
          <Field
            label="Nom"
            name="lastName"
            autoComplete="family-name"
            required
            maxLength={60}
            defaultValue={draft?.lastName}
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
          defaultValue={draft?.email}
          placeholder="alex@demo.example"
          error={errors.email}
        />
        <Password error={errors.password} newPassword />
        <div className="trust-consents">
          <label>
            <input id="policy" name="policy" type="checkbox" required />
            J’ai pris connaissance de la{" "}
            <Link href="/confidentialite" target="_blank" rel="noreferrer">
              notice de confidentialité de la démo
            </Link>
            .
          </label>
          <label>
            <input id="accuracy" name="accuracy" type="checkbox" required />
            J’atteste l’exactitude de mes informations dans le service réel et
            j’accepte la charte de respect. Pour cette démo, j’utilise
            uniquement des données fictives.
          </label>
        </div>
        <div className="inline-note">
          <Mail size={18} />
          <span>
            Prochaine étape : vérifier votre adresse.
            <small>La validation sera simulée dans cette démo.</small>
          </span>
        </div>
        <Submit>Continuer</Submit>
      </form>
      <p className="switch-auth">
        Déjà membre ?{" "}
        <Link href="/connexion">
          Se connecter <ArrowRight size={14} />
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
          Votre e-mail,
          <br />
          votre point de départ.
        </>
      }
      intro="Un petit geste pour garder les bons contacts."
    >
      <div className="email-target">
        <Mail size={25} />
        <strong>{draft.email}</strong>
        <Link href="/inscription">Corriger l’adresse</Link>
      </div>
      <div className="demo-code-note">
        <span>SIMULATION · AUCUN E-MAIL ENVOYÉ</span>
        <p>
          Pour essayer cette étape, saisissez <strong>{DEMO_CODE}</strong>.
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
        <Submit>Valider le code démo</Submit>
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
        <RefreshCw size={15} /> Simuler un nouvel envoi
      </Button>
      {resends > 0 && (
        <p className="field-hint" role="status">
          Renvoi simulé. Utilisez toujours le code {DEMO_CODE}.
        </p>
      )}
    </AuthLayout>
  );
}

export function Personalise() {
  const { draft, setDraft, emailVerified, trust } = useDemo();
  const router = useRouter();
  const [category, setCategory] = useState<Category>(
    draft?.category || "Sportif",
  );
  const [errors, setErrors] = useState<Issues>({});
  if (!draft) return <Guard />;
  if (!emailVerified) return <Guard verification />;
  if (!trust.securityStep || !trust.policy || !trust.accuracy)
    return (
      <AuthLayout
        title="Terminez la validation."
        intro="Les validations de la démo sont nécessaires avant de poursuivre."
      >
        <Link
          className="action primary"
          href={trust.policy ? "/double-facteur" : "/inscription"}
        >
          Reprendre la validation
        </Link>
      </AuthLayout>
    );
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const issues: Issues = {};
    if (!value(data, "headline"))
      issues.headline = "Indiquez votre rôle dans le sport.";
    if (!value(data, "city")) issues.city = "Indiquez une ville fictive.";
    if (category === "Organisation" && !value(data, "organisation"))
      issues.organisation = "Indiquez le nom de l’organisation fictive.";
    if (
      moderateText(
        [
          value(data, "headline"),
          value(data, "city"),
          value(data, "organisation"),
        ].join(" "),
      )
    )
      issues.headline = "Utilisez des informations respectueuses.";
    setErrors(issues);
    focusError(issues);
    if (Object.keys(issues).length) return;
    setDraft({
      ...draft!,
      category,
      sport: value(data, "sport"),
      disciplines: [
        {
          sport: value(data, "sport"),
          level: value(data, "level"),
          ranking: value(data, "ranking"),
          federation: "",
          clubs: [],
        },
      ],
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
          Votre place
          <br />
          dans le sport<span className="lime">.</span>
        </>
      }
      intro="Plus votre profil vous ressemble, plus les rencontres ont du sens."
    >
      <form noValidate onSubmit={submit}>
        <FormErrors errors={errors} />
        <fieldset className="role-choices">
          <legend>Vous êtes…</legend>
          {categories.map((cat, i) => {
            const Icon = icons[i];
            return (
              <label key={cat} className={category === cat ? "selected" : ""}>
                <input
                  type="radio"
                  name="category"
                  value={cat}
                  checked={category === cat}
                  onChange={() => setCategory(cat)}
                />
                <Icon size={21} />
                <span>{cat}</span>
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
            defaultValue={draft.organisation}
            error={errors.organisation}
            maxLength={100}
          />
        )}
        <Field label="Votre discipline" name="sport">
          <NativeSelect
            id="sport"
            name="sport"
            defaultValue={draft.sport}
            className="select-field"
          >
            {sports.map((s) => (
              <NativeSelectOption key={s} value={s}>
                {s}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>
        <Field label="Niveau dans cette discipline" name="level">
          <NativeSelect id="level" name="level" defaultValue="Loisir">
            {[
              "Débutant",
              "Loisir",
              "Intermédiaire",
              "Compétition",
              "Professionnel",
            ].map((l) => (
              <NativeSelectOption key={l}>{l}</NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>
        <Field
          label="Classement (facultatif)"
          name="ranking"
          maxLength={80}
          placeholder="Ex. P200 ou C15.2, pays et saison"
        />
        <p className="field-hint">
          Vous pourrez ajouter d’autres sports, leurs niveaux et leurs clubs
          dans Profil → Sports, niveaux & clubs.
        </p>
        <Field
          label={
            category === "Organisation"
              ? "Votre activité"
              : "Votre rôle ou spécialité"
          }
          name="headline"
          defaultValue={draft.headline}
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
          defaultValue={draft.city}
          autoComplete="address-level2"
          placeholder="Liège, Belgique"
          maxLength={90}
          error={errors.city}
        />
        <Submit>Continuer</Submit>
      </form>
    </AuthLayout>
  );
}

export function Presentation() {
  const {
    draft,
    setDraft,
    emailVerified,
    setProfile,
    notify,
    dispatchSocial,
    trust,
  } = useDemo();
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
        <Link
          className="action primary"
          href={trust.policy ? "/double-facteur" : "/inscription"}
        >
          Reprendre la validation
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
    notify(
      "Votre profil de démonstration est prêt. Aucun compte réel n’a été créé.",
    );
    router.push("/accueil");
  }
  return (
    <AuthLayout
      back="/personnalisation"
      step={4}
      title={
        <>
          Un profil
          <br />à votre image.
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
          <legend>Choisir une illustration de profil</legend>
          <p className="field-hint">
            Personnages fictifs, images de démonstration.
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
            Quelques mots sur vous <span className="optional">facultatif</span>
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
            Le terrain est à vous.
            <small>Votre profil est prêt à être exploré.</small>
          </span>
        </div>
        <Submit>Découvrir mon profil</Submit>
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
    const issues = validateDemoLogin(
      email,
      String(data.get("password") || ""),
      profile.email,
    );
    setErrors(issues);
    focusError(issues);
    if (Object.keys(issues).length) return;
    if (email !== profile.email.toLowerCase())
      setProfile(structuredClone(initialProfile));
    e.currentTarget.reset();
    notify("Vous explorez une session fictive, sans authentification réelle.");
    router.push("/accueil");
  }
  return (
    <AuthLayout
      title={
        <>
          Heureux de
          <br />
          vous revoir<span className="lime">.</span>
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
          Mot de passe oublié ?
        </Link>
        <Submit>Se connecter à la démo</Submit>
      </form>
      <p className="switch-auth">
        Pas encore de profil ?{" "}
        <Link href="/inscription">Créer un compte gratuit</Link>
      </p>
      <div className="demo-access">
        <span className="eyebrow">POUR ESSAYER EN UN CLIC</span>
        <strong>Le profil fictif d’Alex vous attend.</strong>
        <p>Aucune information personnelle nécessaire.</p>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            setProfile(structuredClone(initialProfile));
            notify("Profil fictif d’Alex ouvert.");
            router.push("/accueil");
          }}
        >
          Explorer le profil démo <ArrowRight size={17} />
        </Button>
        <small>
          Accès formulaire : {DEMO_EMAIL} / {DEMO_PASSWORD}
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
            On vous remet
            <br />
            dans le jeu.
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
          <h2>Envoi simulé.</h2>
          <p>
            Aucun e-mail n’a été envoyé. Dans cette démo, le mot de passe reste{" "}
            <strong>{DEMO_PASSWORD}</strong>.
          </p>
          <Link href="/connexion" className="action primary">
            Retour à la connexion <ArrowRight size={18} />
          </Link>
          <Button variant="ghost" onClick={() => setSent(false)}>
            Essayer une autre adresse
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
          <Submit>Simuler l’envoi du lien</Submit>
        </form>
      )}
    </AuthLayout>
  );
}
