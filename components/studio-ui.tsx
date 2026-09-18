"use client";
import Link from "next/link";
import { useEffect, useState, type ReactNode, type ComponentProps } from "react";
import { ArrowLeft, ArrowRight, Eye, EyeOff, ShieldCheck, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
export function Brand({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="brand" aria-label="Opportunity Players — accueil">
      op<span>↗</span>
      <small>Opportunity Players</small>
    </Link>
  );
}
export function DemoPill() {
  return (
    <span className="demo-pill">
      <i /> DÉMO INTERACTIVE
    </span>
  );
}
export function Submit({ children, disabled, ...props }: ComponentProps<typeof Button>) {
  // Prevent native form submissions before the client-side demo is hydrated.
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return (
    <Button
      className="action primary submit"
      type="submit"
      {...props}
      disabled={!ready || disabled}
    >
      {children}
      <ArrowRight size={18} />
    </Button>
  );
}
export function Field({
  label,
  error,
  hint,
  children,
  ...props
}: ComponentProps<"input"> & {
  label: string;
  error?: string;
  hint?: string;
  children?: ReactNode;
}) {
  const id = props.id || props.name;
  return (
    <div className="field">
      <Label htmlFor={id}>{label}</Label>
      {children || (
        <Input
          {...props}
          id={id}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        />
      )}{" "}
      {hint && (
        <p id={`${id}-hint`} className="field-hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}
export function Password({
  error,
  newPassword = false,
}: {
  error?: string;
  newPassword?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="field">
      <Label htmlFor="password">Mot de passe de démonstration</Label>
      <div className="password-input">
        <Input
          id="password"
          name="password"
          type={visible ? "text" : "password"}
          autoComplete={newPassword ? "new-password" : "current-password"}
          required
          maxLength={80}
          placeholder="Uniquement le mot de passe démo"
          aria-invalid={!!error}
          aria-describedby="password-help"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setVisible(!visible)}
          aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          aria-pressed={visible}
        >
          {visible ? <EyeOff size={19} /> : <Eye size={19} />}
        </Button>
      </div>
      <p className={error ? "field-error" : "field-hint"} id="password-help">
        {error || (
          <>
            Utilisez <strong>ArenaDemo2026!</strong>, jamais votre vrai mot de passe.
          </>
        )}
      </p>
    </div>
  );
}
export function Stepper({ step }: { step: number }) {
  const steps = ["Identité", "E-mail", "Sport", "Présentation"];
  return (
    <div className="stepper" aria-label={`Étape ${step} sur 4 : ${steps[step - 1]}`}>
      <div>
        {steps.map((name, i) => (
          <span key={name} className={i < step ? "done" : ""} />
        ))}
      </div>
      <p>
        0{step} <span>— {steps[step - 1]}</span>
        <small>{step}/4</small>
      </p>
    </div>
  );
}
export function AuthLayout({
  title,
  intro,
  step,
  back = "/",
  children,
}: {
  title: ReactNode;
  intro?: string;
  step?: number;
  back?: string;
  children: ReactNode;
}) {
  return (
    <main id="main" className="auth-layout">
      <aside className="auth-editorial">
        <Brand />
        <div className="editorial-copy">
          <p className="eyebrow">LE SPORT RAPPROCHE LES BONNES PERSONNES</p>
          <h2>
            La suite de votre
            <br />
            parcours commence <em>ici.</em>
          </h2>
        </div>
        <img src="/images/coach.webp" alt="Portrait d’un coach de padel fictif" />
        <span className="editorial-caption">
          SPORT. PEOPLE. OPPORTUNITIES. <ArrowUpRight size={19} />
        </span>
      </aside>
      <section className="auth-content">
        <header className="auth-top">
          <Link href={back} className="icon-link" aria-label="Revenir à l’étape précédente">
            <ArrowLeft size={21} />
          </Link>
          <DemoPill />
        </header>
        <div className="auth-form-wrap">
          {step && <Stepper step={step} />}
          <h1>{title}</h1>
          {intro && <p className="form-intro">{intro}</p>}
          {children}
          <p className="auth-disclosure">
            <ShieldCheck size={15} /> Mode démo : aucune création de compte réel, aucun e-mail
            envoyé. Données fictives uniquement ; effacées au rechargement.
          </p>
        </div>
        <footer className="auth-footer">
          <span>OPPORTUNITY PLAYERS</span>
          <span>ARENA STUDIO</span>
        </footer>
      </section>
    </main>
  );
}
export function Guard({ verification = false }: { verification?: boolean }) {
  return (
    <AuthLayout
      title="Reprenons au bon endroit."
      intro="Le parcours est conservé uniquement pendant votre visite. Après un rechargement, vous pouvez recommencer ou explorer le profil fictif."
    >
      <Link className="action primary" href={verification ? "/verification" : "/inscription"}>
        {verification ? "Vérifier mon e-mail de démo" : "Commencer l’inscription"}
        <ArrowRight size={18} />
      </Link>
      <Link href="/profil" className="text-link">
        Explorer le profil de démonstration
      </Link>
    </AuthLayout>
  );
}
export function FormErrors({ errors }: { errors: Record<string, string> }) {
  return Object.keys(errors).length ? (
    <p className="form-error-summary" role="alert">
      Vérifiez les champs indiqués ci-dessous.
    </p>
  ) : null;
}
export function focusError(errors: Record<string, string>) {
  const key = Object.keys(errors)[0];
  if (key) requestAnimationFrame(() => document.getElementById(key)?.focus());
}
