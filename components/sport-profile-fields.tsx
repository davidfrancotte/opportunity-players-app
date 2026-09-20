"use client";
import type { Profile, Issues } from "@/lib/model";
import type { SportRecord } from "@/lib/trust";
import type { DirectoryFilters } from "@/lib/directory";
import { availabilityOptions, contractOptions } from "@/lib/sport-profile";
import { Field } from "./studio-ui";
import { T, useLocale } from "./locale";

export function RegistrationFields({
  profile,
  onChange,
  errors = {},
}: {
  profile: Profile;
  onChange: (p: Profile) => void;
  errors?: Issues;
}) {
  const { t } = useLocale();
  return (
    <fieldset className="sport-extra-fields">
      <legend>
        <T>Inscription</T>
      </legend>
      <div className="registration-choices">
        {(["self", "child"] as const).map((mode) => (
          <label key={mode}>
            <input
              type="radio"
              name="registrationMode"
              value={mode}
              checked={profile.registrationMode === mode}
              onChange={() =>
                onChange({
                  ...profile,
                  registrationMode: mode,
                  ...(mode === "child" ? { category: "Sportif" as const } : {}),
                })
              }
            />
            {t(mode === "child" ? "J’inscris mon enfant" : "Je m’inscris")}
          </label>
        ))}
      </div>
      <Field
        label="Date de naissance"
        name="birthDate"
        type="date"
        autoComplete="bday"
        value={profile.birthDate}
        onChange={(e) => onChange({ ...profile, birthDate: e.target.value })}
        error={errors.birthDate}
        hint="Seul l’âge sera affiché, jamais la date de naissance. Utilisez une date fictive."
      />
      {profile.registrationMode === "child" && (
        <>
          <Field
            label="Nom du représentant"
            name="guardianName"
            autoComplete="name"
            maxLength={100}
            value={profile.guardian.name}
            onChange={(e) =>
              onChange({ ...profile, guardian: { ...profile.guardian, name: e.target.value } })
            }
            error={errors.guardianName}
          />
          <Field
            label="Lien avec l’enfant"
            name="guardianRelationship"
            error={errors.guardianRelationship}
          >
            <select
              id="guardianRelationship"
              value={profile.guardian.relationship}
              onChange={(e) =>
                onChange({
                  ...profile,
                  guardian: { ...profile.guardian, relationship: e.target.value },
                })
              }
            >
              <option value="">{t("Non renseigné")}</option>
              {["Parent", "Tuteur légal"].map((v) => (
                <option key={v} value={v}>
                  {t(v)}
                </option>
              ))}
            </select>
          </Field>
          <label className="sport-consent">
            <input
              id="guardianConsent"
              type="checkbox"
              checked={profile.guardian.consent}
              onChange={(e) =>
                onChange({
                  ...profile,
                  guardian: { ...profile.guardian, consent: e.target.checked },
                })
              }
            />
            <T>Je suis majeur et habilité à gérer ce profil.</T>
          </label>
          {errors.guardianConsent && (
            <p className="field-error" role="alert">
              {t(errors.guardianConsent)}
            </p>
          )}
          <p className="field-hint">
            <T>
              Coordonnées privées du représentant. Les échanges passent par son compte. Vérification
              parentale simulée, sans valeur de vérification réelle.
            </T>
          </p>
        </>
      )}
    </fieldset>
  );
}
export function SportExtraFields({
  record: r,
  onChange,
  prefix,
}: {
  record: SportRecord;
  onChange: (p: Partial<SportRecord>) => void;
  prefix: string;
}) {
  const { t } = useLocale();
  return (
    <fieldset className="sport-extra-fields">
      <legend>
        <T>Disponibilité</T> & <T>Licence sportive</T>
      </legend>
      <Field
        label="Pratique handisport"
        name={`${prefix}-para`}
        hint="Informations facultatives, déclarées par discipline. Aucun justificatif médical demandé."
      >
        <select
          id={`${prefix}-para`}
          value={r.paraSport || ""}
          onChange={(e) => onChange({ paraSport: e.target.value as SportRecord["paraSport"] })}
        >
          {[
            ["", "Non renseignée"],
            ["yes", "Oui"],
            ["no", "Non"],
          ].map(([v, l]) => (
            <option key={v} value={v}>
              {t(l)}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Disponibilité" name={`${prefix}-availability`}>
        <select
          id={`${prefix}-availability`}
          value={r.availability || availabilityOptions[0]}
          onChange={(e) => onChange({ availability: e.target.value })}
        >
          {availabilityOptions.map((v) => (
            <option key={v} value={v}>
              {t(v)}
            </option>
          ))}
        </select>
      </Field>
      {r.availability === "Disponible à partir du" && (
        <Field
          label="Date de disponibilité"
          name={`${prefix}-availableFrom`}
          type="date"
          required
          value={r.availableFrom || ""}
          onChange={(e) => onChange({ availableFrom: e.target.value })}
        />
      )}
      <Field label="Situation contractuelle" name={`${prefix}-contract`}>
        <select
          id={`${prefix}-contract`}
          value={r.contractStatus || contractOptions[0]}
          onChange={(e) => onChange({ contractStatus: e.target.value })}
        >
          {contractOptions.map((v) => (
            <option key={v} value={v}>
              {t(v)}
            </option>
          ))}
        </select>
      </Field>
      <Field
        label="Fédération"
        name={`${prefix}-licenceFederation`}
        value={r.federation}
        maxLength={100}
        onChange={(e) => onChange({ federation: e.target.value })}
      />
      <div className="field-pair">
        <Field
          label="Numéro de licence"
          name={`${prefix}-licence`}
          maxLength={50}
          value={r.licenceNumber || ""}
          onChange={(e) => onChange({ licenceNumber: e.target.value })}
        />
        <Field
          label="Saison"
          name={`${prefix}-season`}
          placeholder="2026–2027"
          maxLength={20}
          value={r.licenceSeason || ""}
          onChange={(e) => onChange({ licenceSeason: e.target.value })}
        />
      </div>
      <p className="field-hint">
        <T>
          Le numéro reste privé et n’apparaît pas dans le CV partagé. Ne saisissez aucune vraie
          licence dans la démo.
        </T>
      </p>
    </fieldset>
  );
}
export function ExtraDirectoryFilters({
  filters: f,
  onChange,
}: {
  filters: DirectoryFilters;
  onChange: (key: keyof DirectoryFilters, value: string) => void;
}) {
  const { t } = useLocale();
  return (
    <>
      {(["ageMin", "ageMax"] as const).map((k, i) => (
        <label key={k}>
          {t(i ? "Âge maximum" : "Âge minimum")}
          <input
            aria-label={t(i ? "Âge maximum" : "Âge minimum")}
            type="number"
            min={0}
            max={120}
            value={f[k]}
            onChange={(e) => onChange(k, e.target.value)}
          />
        </label>
      ))}
      <label>
        {t("Handisport")}
        <select
          aria-label={t("Handisport")}
          value={f.paraSport}
          onChange={(e) => onChange("paraSport", e.target.value)}
        >
          {[
            ["Tous", "Tous"],
            ["yes", "Oui"],
            ["no", "Non"],
          ].map(([v, l]) => (
            <option key={v} value={v}>
              {t(l)}
            </option>
          ))}
        </select>
      </label>
      {(["availability", "contractStatus"] as const).map((k, i) => (
        <label key={k}>
          {t(i ? "Situation contractuelle" : "Disponibilité")}
          <select
            aria-label={t(i ? "Situation contractuelle" : "Disponibilité")}
            value={f[k]}
            onChange={(e) => onChange(k, e.target.value)}
          >
            <option value="Tous">{t("Tous")}</option>
            {(i ? contractOptions : availabilityOptions).slice(1).map((v) => (
              <option key={v} value={v}>
                {t(v)}
              </option>
            ))}
          </select>
        </label>
      ))}
      {f.ageMin && f.ageMax && Number(f.ageMin) > Number(f.ageMax) && (
        <p className="field-error" role="alert">
          {t("Âge minimum")} &gt; {t("Âge maximum")}
        </p>
      )}
    </>
  );
}
