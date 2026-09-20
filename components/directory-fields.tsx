"use client";
import { T } from "./locale";
import { RegistrationFields, SportExtraFields } from "./sport-profile-fields";
import { Field } from "./studio-ui";
import { sideNames } from "@/lib/athlete";
import { NativeSelect, NativeSelectOption } from "./ui/native-select";
import type { Profile, Issues } from "@/lib/model";
import type { SportRecord } from "@/lib/trust";
import {
  countrySuggestions,
  dominantSides,
  genders,
  levels,
  positionsFor,
  primaryRecord,
  sideLabel,
  typesFor,
  updatePrimaryRecord,
} from "@/lib/directory";

export function PlayerSportFields({
  record,
  onChange,
  prefix = "player",
}: {
  record: SportRecord;
  onChange: (patch: Partial<SportRecord>) => void;
  prefix?: string;
}) {
  return (
    <div className="directory-fields">
      <Field label="Niveau dans cette discipline" name={`${prefix}-level`}>
        <NativeSelect
          id={`${prefix}-level`}
          aria-label={`Niveau ${record.sport}`}
          value={record.level}
          onChange={(e) => onChange({ level: e.target.value })}
        >
          {levels.map((v) => (
            <NativeSelectOption key={v} value={v}>
              <T>{v}</T>
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </Field>
      <Field
        label="Position / poste"
        name={`${prefix}-position`}
        value={record.position || ""}
        onChange={(e) => onChange({ position: e.target.value })}
        maxLength={80}
        list={`${prefix}-positions`}
        placeholder="Choisir ou préciser un poste"
        hint="Selon votre sport. Indiquez Non applicable si nécessaire."
      />
      <datalist id={`${prefix}-positions`}>
        {positionsFor(record.sport).map((v) => (
          <option key={v} value={v} />
        ))}
      </datalist>
      <Field label={sideLabel(record.sport)} name={`${prefix}-side`}>
        <NativeSelect
          id={`${prefix}-side`}
          value={record.dominantSide || ""}
          onChange={(e) => onChange({ dominantSide: e.target.value })}
        >
          <NativeSelectOption value="">
            <T>{"Non renseigné / non applicable"}</T>
          </NativeSelectOption>
          {dominantSides.map((v) => (
            <NativeSelectOption key={v} value={v}>
              <T>{sideNames[v]}</T>
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </Field>
      <SportExtraFields record={record} onChange={onChange} prefix={prefix} />
    </div>
  );
}

export function ProfileDirectoryFields({
  profile,
  onChange,
  errors = {},
}: {
  profile: Profile;
  onChange: (p: Profile) => void;
  errors?: Issues;
}) {
  return (
    <div className="directory-fields">
      <Field
        label="Pays"
        name="country"
        value={profile.country}
        onChange={(e) => onChange({ ...profile, country: e.target.value })}
        required
        autoComplete="country-name"
        maxLength={80}
        list="profile-countries"
        placeholder="Belgique"
        error={errors.country}
        hint="Pays de résidence ou d’implantation. Vous pouvez saisir tout autre pays."
      />
      <datalist id="profile-countries">
        {countrySuggestions.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
      {profile.category === "Sportif" ? (
        <>
          <RegistrationFields profile={profile} onChange={onChange} errors={errors} />
          <fieldset className="athlete-measurements">
            <legend>
              <T>{"Vos caractéristiques physiques"}</T>
            </legend>
            <p className="field-hint">
              <T>{"Facultatif. Ces informations seront visibles sur votre profil sportif."}</T>
            </p>
            <div className="field-pair">
              <Field
                label="Poids (kg)"
                name="weightKg"
                inputMode="decimal"
                maxLength={6}
                placeholder="Ex. 72,5"
                value={profile.weightKg}
                onChange={(e) => onChange({ ...profile, weightKg: e.target.value })}
                error={errors.weightKg}
              />
              <Field
                label="Taille (cm)"
                name="heightCm"
                inputMode="decimal"
                maxLength={6}
                placeholder="Ex. 180"
                value={profile.heightCm}
                onChange={(e) => onChange({ ...profile, heightCm: e.target.value })}
                error={errors.heightCm}
              />
            </div>
          </fieldset>
          <Field label="Genre" name="gender" error={errors.gender}>
            <NativeSelect
              id="gender"
              value={profile.gender}
              aria-invalid={!!errors.gender}
              aria-describedby={errors.gender ? "gender-error" : undefined}
              onChange={(e) => onChange({ ...profile, gender: e.target.value })}
            >
              <NativeSelectOption value="">
                <T>{"Non renseigné"}</T>
              </NativeSelectOption>
              {genders.map((v) => (
                <NativeSelectOption key={v} value={v}>
                  <T>{v}</T>
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>
          <PlayerSportFields
            record={primaryRecord(profile)}
            onChange={(patch) => onChange(updatePrimaryRecord(profile, patch))}
          />
          <Field
            label="Classement (facultatif)"
            name="ranking"
            value={primaryRecord(profile).ranking}
            onChange={(e) => onChange(updatePrimaryRecord(profile, { ranking: e.target.value }))}
            maxLength={80}
            placeholder="Ex. P200, C15.2, division…"
          />
          <p className="field-hint">
            Niveau, poste et côté dominant sont propres à chaque sport. Complétez vos autres
            disciplines depuis Profil → Sports, niveaux &amp; clubs.
          </p>
        </>
      ) : (
        <Field label="Type de compte" name="accountType" error={errors.accountType}>
          <NativeSelect
            id="accountType"
            required
            aria-invalid={!!errors.accountType}
            aria-describedby={errors.accountType ? "accountType-error" : undefined}
            value={
              typesFor(profile.category).includes(profile.accountType) ? profile.accountType : ""
            }
            onChange={(e) => onChange({ ...profile, accountType: e.target.value })}
          >
            <NativeSelectOption value="">
              Choisir{" "}
              {profile.category === "Professionnel" ? "votre métier" : "le type de structure"}
            </NativeSelectOption>
            {typesFor(profile.category).map((v) => (
              <NativeSelectOption key={v} value={v}>
                <T>{v}</T>
              </NativeSelectOption>
            ))}
          </NativeSelect>
          {profile.accountType && typesFor(profile.category).includes(profile.accountType) && (
            <p className="field-hint">
              <T>{"Sélection :"}</T>
              {profile.accountType}
            </p>
          )}
        </Field>
      )}
    </div>
  );
}
