import test from "node:test";
import {
  athleteIssues,
  normalizeMeasurement,
  measurementLabel,
  sideNames,
} from "../lib/athlete.ts";
import assert from "node:assert/strict";
test("athlete measurements: optional, decimal comma, positive bounds and no fabricated defaults", () => {
  const p = { category: "Sportif", weightKg: "", heightCm: "" };
  assert.deepEqual(athleteIssues(p), {});
  assert.deepEqual(athleteIssues({ ...p, weightKg: "72,5", heightCm: "180" }), {});
  for (const weightKg of ["0", "-5", "501", "abc", "1e2"])
    assert.ok(athleteIssues({ ...p, weightKg }).weightKg);
  for (const heightCm of ["0", "-1", "301", "xxx"])
    assert.ok(athleteIssues({ ...p, heightCm }).heightCm);
  assert.equal(normalizeMeasurement(" 72,5 "), "72.5");
  assert.equal(measurementLabel("72.5", "kg"), "72,5 kg");
  assert.equal(measurementLabel("", "cm"), "Non renseigné");
  assert.deepEqual(athleteIssues({ ...p, category: "Professionnel", weightKg: "x" }), {});
  assert.deepEqual(Object.keys(sideNames), ["Gauche", "Droite", "Ambidextre"]);
});
import { members } from "../lib/social.ts";
import { memberSports } from "../lib/trust.ts";
import { initialProfile, createProfile, validateProfile } from "../lib/model.ts";
import {
  emptyDirectoryFilters as base,
  matchesDirectory,
  professionalTypes,
  collectiveTypes,
  typesFor,
  updatePrimaryRecord,
  primaryRecord,
  changeDirectoryKind,
} from "../lib/directory.ts";
const results = (patch) =>
  members
    .filter((m) => matchesDirectory(m, memberSports[m.id] || [], { ...base, ...patch }))
    .map((m) => m.id);
test("players: all seven criteria combine on actual member data", () => {
  assert.deepEqual(
    results({
      kind: "Joueurs",
      sport: "Football",
      gender: "Femme",
      country: " france ",
      city: "LILLE",
      level: "Compétition",
      position: "gardien",
      dominantSide: "Droite",
    }),
    ["ines"],
  );
  assert.deepEqual(
    results({
      kind: "Joueurs",
      sport: "Basketball",
      gender: "Homme",
      country: "Belgique",
      city: "liege",
      level: "Compétition",
      position: "Ailier",
      dominantSide: "Ambidextre",
    }),
    ["noah"],
  );
  assert.deepEqual(
    results({ kind: "Joueurs", sport: "Football", level: "Compétition", dominantSide: "Gauche" }),
    [],
  );
});
test("multisport: never mix level, position, side and clubs from two sports", () => {
  assert.deepEqual(results({ kind: "Joueurs", sport: "Tennis", level: "Intermédiaire" }), []);
  assert.deepEqual(results({ kind: "Joueurs", sport: "Tennis", dominantSide: "Gauche" }), []);
  assert.deepEqual(
    results({
      kind: "Joueurs",
      sport: "Padel",
      level: "Intermédiaire",
      club: "horizon",
      ranking: "p200",
      position: "gauche",
      dominantSide: "Gauche",
    }),
    ["lea"],
  );
});
test("professionals and collectives: country, city, sport and exact account type", () => {
  assert.deepEqual(
    results({
      kind: "Professionnels",
      sport: "Football",
      country: "Canada",
      city: "montreal",
      accountType: "Entraîneur de gardiens",
    }),
    ["camille"],
  );
  assert.deepEqual(
    results({
      kind: "Collectives",
      sport: "Football",
      country: "France",
      city: "lille",
      accountType: "Académie",
    }),
    ["academie"],
  );
  assert.deepEqual(results({ kind: "Professionnels", accountType: "Entraîneur" }), ["marc"]);
});
test("category switch clears hidden incompatible filters, keeps location and sport", () => {
  const f = changeDirectoryKind(
    {
      ...base,
      kind: "Joueurs",
      sport: "Football",
      city: "Lille",
      gender: "Femme",
      level: "Compétition",
      dominantSide: "Droite",
      position: "Gardien",
    },
    "Collectives",
  );
  assert.equal(f.gender, "Tous");
  assert.equal(f.level, "Tous");
  assert.equal(f.position, "");
  assert.deepEqual(results(f), ["academie"]);
});
test("all requested account types validate in their own category only", () => {
  assert.equal(professionalTypes.length, 26);
  assert.equal(collectiveTypes.length, 7);
  for (const [category, types] of [
    ["Professionnel", professionalTypes],
    ["Organisation", collectiveTypes],
  ]) {
    assert.deepEqual(typesFor(category), types);
    for (const accountType of types)
      assert.deepEqual(
        validateProfile({ ...initialProfile, category, accountType, organisation: "Démo" }),
        {},
      );
  }
  assert.ok(validateProfile({ ...initialProfile, accountType: "Club" }).accountType);
  assert.ok(validateProfile({ ...initialProfile, country: " " }).country);
});
test("new account starts empty and editing preserves each sport independently", () => {
  let p = createProfile({ firstName: "Test", lastName: "Démo", email: "test@demo.example" });
  assert.equal(p.country, "");
  assert.equal(p.gender, "");
  assert.equal(p.accountType, "");
  p = updatePrimaryRecord(
    { ...p, sport: "Football" },
    { level: "Compétition", position: "Gardien", dominantSide: "Gauche" },
  );
  p = updatePrimaryRecord(
    { ...p, sport: "Tennis" },
    { level: "Loisir", position: "Double", dominantSide: "Droite" },
  );
  assert.equal(primaryRecord(p).dominantSide, "Droite");
  assert.equal(primaryRecord({ ...p, sport: "Football" }).dominantSide, "Gauche");
  assert.equal(p.disciplines.length, 2);
});
