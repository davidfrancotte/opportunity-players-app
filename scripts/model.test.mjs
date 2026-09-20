import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  initialProfile,
  createProfile,
  validateIdentity,
  validateProfile,
  validateDemoLogin,
  validDemoCode,
  validEmail,
  completion,
  displayName,
  cvText,
  DEMO_PASSWORD,
  DEMO_CODE,
  DEMO_EMAIL,
} from "../lib/model.ts";

test("inscription : identité et adresse valides, mot de passe exclusivement fictif", () => {
  const identity = { firstName: "Alex", lastName: "Dupont", email: DEMO_EMAIL };
  assert.deepEqual(validateIdentity(identity, DEMO_PASSWORD), {});
  assert.ok(validateIdentity({ ...identity, firstName: " " }, DEMO_PASSWORD).firstName);
  assert.ok(validateIdentity({ ...identity, lastName: " " }, DEMO_PASSWORD).lastName);
  assert.ok(validateIdentity({ ...identity, email: "faux" }, DEMO_PASSWORD).email);
  assert.ok(validateIdentity(identity, "un-vrai-secret-non-accepte").password);
});
test("formats e-mail et code démo : erreurs et succès", () => {
  for (const value of ["", "bonjour", "a@", "@a.be", "a b@c.be", "a@c"])
    assert.equal(validEmail(value), false);
  assert.equal(validEmail("prenom.nom+sport@demo.example"), true);
  assert.equal(validDemoCode("000000"), false);
  assert.equal(validDemoCode("24681"), false);
  assert.equal(validDemoCode(DEMO_CODE), true);
});
test("connexion explicitement fictive : identifiants connus ou profil de la visite", () => {
  assert.deepEqual(validateDemoLogin(DEMO_EMAIL, DEMO_PASSWORD, "new@demo.example"), {});
  assert.deepEqual(validateDemoLogin("NEW@demo.example", DEMO_PASSWORD, "new@demo.example"), {});
  assert.ok(validateDemoLogin("unknown@demo.example", DEMO_PASSWORD, DEMO_EMAIL).email);
  assert.ok(validateDemoLogin(DEMO_EMAIL, "incorrect", DEMO_EMAIL).password);
});
test("nouveau profil : aucune expérience ni compétence fabriquée", () => {
  const p = createProfile({
    firstName: " Camille ",
    lastName: " Martin ",
    email: "CAMILLE@demo.example",
  });
  assert.equal(p.firstName, "Camille");
  assert.equal(p.email, "camille@demo.example");
  assert.deepEqual(p.experiences, []);
  assert.deepEqual(p.skills, []);
  assert.deepEqual(p.media, []);
  assert.equal(p.bio, "");
  assert.equal(p.objective, "");
  assert.equal(p.headline, "");
  assert.equal("password" in p, false);
  p.skills.push("Esprit d’équipe");
  assert.equal(initialProfile.skills.includes("Esprit d’équipe"), false);
});
test("profil : champs requis et parcours organisation", () => {
  assert.deepEqual(validateProfile(initialProfile), {});
  const p = { ...initialProfile, category: "Organisation", accountType: "Club", organisation: "" };
  assert.ok(validateProfile(p).organisation);
  p.organisation = "Club fictif";
  assert.equal(displayName(p), "Club fictif");
  assert.deepEqual(validateProfile(p), {});
  assert.ok(validateProfile({ ...initialProfile, city: " " }).city);
  assert.ok(validateProfile({ ...initialProfile, sport: "sport-inconnu" }).sport);
  assert.ok(validateProfile({ ...initialProfile, bio: "x".repeat(601) }).bio);
});
test("progression : calcul à partir du contenu réel du profil", () => {
  assert.equal(completion(initialProfile).count, 6);
  const p = createProfile({ firstName: "Test", lastName: "Démo", email: DEMO_EMAIL });
  assert.equal(completion(p).count, 0);
  p.headline = "Joueur";
  p.city = "Liège";
  assert.equal(completion(p).count, 1);
  p.bio = "Une présentation.";
  assert.equal(completion(p).count, 2);
});
test("CV téléchargé : données courantes, avertissement fictif, aucun email ou secret", () => {
  const text = cvText(initialProfile);
  assert.ok(text.includes("Alex Dupont"));
  assert.ok(text.includes("PROFIL FICTIF"));
  assert.ok(text.includes("2023 — Aujourd’hui"));
  assert.ok(!text.includes(DEMO_PASSWORD));
  assert.ok(!text.includes(DEMO_EMAIL));
  assert.ok(cvText({ ...initialProfile, firstName: "Camille" }).includes("Camille Dupont"));
});
test("frontière démo : aucun stockage navigateur ni envoi réseau applicatif", () => {
  for (const name of [
    "auth-screens.tsx",
    "profile-screens.tsx",
    "social-screens.tsx",
    "demo-provider.tsx",
  ]) {
    const source = fs.readFileSync(new URL("../components/" + name, import.meta.url), "utf8");
    assert.doesNotMatch(
      source,
      /localStorage|sessionStorage|indexedDB|fetch\s*\(|XMLHttpRequest|sendBeacon/,
    );
  }
  const provider = fs.readFileSync(
    new URL("../components/demo-provider.tsx", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(provider, /password/i);
});
