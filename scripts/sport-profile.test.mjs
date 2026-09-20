import test from "node:test";
import assert from "node:assert/strict";
import { ageOn, sportProfileIssues, videoFileIssue } from "../lib/sport-profile.ts";
import { initialProfile, cvText, createProfile } from "../lib/model.ts";
import { matchesDirectory, emptyDirectoryFilters, changeDirectoryKind } from "../lib/directory.ts";
import { members } from "../lib/social.ts";
import { memberSports } from "../lib/trust.ts";
test("age: birthday boundary, leap date, invalid, future and missing dates", () => {
  const today = new Date(2026, 8, 20);
  assert.equal(ageOn("2000-09-20", today), 26);
  assert.equal(ageOn("2000-09-21", today), 25);
  assert.equal(ageOn("2000-02-29", today), 26);
  for (const d of ["2001-02-29", "2030-01-01", "2026-13-01", "", undefined, "1899-01-01"])
    assert.equal(ageOn(d, today), null);
});
test("child route: guardian, consent, minority and athlete category are mandatory", () => {
  const child = {
    ...initialProfile,
    category: "Sportif",
    birthDate: "2015-03-20",
    registrationMode: "child",
    guardian: { name: "Demo Parent", relationship: "Parent", consent: true },
  };
  assert.deepEqual(sportProfileIssues(child), {});
  assert.ok(
    sportProfileIssues({ ...child, guardian: { ...child.guardian, consent: false } })
      .guardianConsent,
  );
  assert.ok(sportProfileIssues({ ...child, category: "Professionnel" }).category);
  assert.ok(sportProfileIssues({ ...child, birthDate: "1990-01-01" }).birthDate);
  assert.ok(sportProfileIssues({ ...child, registrationMode: "self" }).birthDate);
  assert.ok(sportProfileIssues({ ...child, birthDate: "" }).birthDate);
});
test("network: age and para-sport combine with sport, availability and contract", () => {
  const lea = members.find((m) => m.id === "lea");
  const records = memberSports.lea;
  const f = {
    ...emptyDirectoryFilters,
    kind: "Joueurs",
    sport: "Tennis",
    paraSport: "yes",
    ageMin: "20",
    ageMax: "40",
    availability: "Disponible",
    contractStatus: "Libre",
  };
  assert.equal(matchesDirectory(lea, records, f), true);
  assert.equal(matchesDirectory({ ...lea, birthDate: undefined }, records, f), false);
  assert.equal(matchesDirectory(lea, records, { ...f, ageMin: "50" }), false);
  assert.equal(matchesDirectory(lea, records, { ...f, sport: "Padel" }), false);
  assert.equal(matchesDirectory(lea, [], f), false);
  assert.equal(changeDirectoryKind(f, "Professionnels").paraSport, "Tous");
  assert.equal(changeDirectoryKind(f, "Professionnels").ageMin, "");
});
test("sports video: MIME and size bounds", () => {
  assert.equal(videoFileIssue({ type: "video/mp4", size: 5000 }), "");
  assert.equal(videoFileIssue({ type: "video/webm", size: 50 * 1024 * 1024 }), "");
  for (const file of [
    { type: "image/png", size: 50 },
    { type: "video/mp4", size: 0 },
    { type: "video/mp4", size: 50 * 1024 * 1024 + 1 },
  ])
    assert.ok(videoFileIssue(file));
});
test("export includes achievements but not private date, licence, guardian or video object URL", () => {
  const p = {
    ...initialProfile,
    category: "Sportif",
    birthDate: "2000-04-12",
    guardian: { name: "Private Parent", relationship: "Parent", consent: true },
    disciplines: [
      { ...initialProfile.disciplines[0], licenceNumber: "SECRET-12345", paraSport: "yes" },
    ],
    achievements: [{ id: "a", sport: "Padel", year: "2025", title: "Champion", event: "Cup" }],
  };
  const text = cvText(p);
  assert.ok(text.includes("Champion"));
  assert.ok(text.includes("Handisport"));
  for (const privateValue of ["2000-04-12", "SECRET-12345", "Private Parent"])
    assert.ok(!text.includes(privateValue));
  const fresh = createProfile({ firstName: "Demo", lastName: "Test", email: "demo@example.com" });
  assert.deepEqual(fresh.videos, []);
  assert.deepEqual(fresh.achievements, []);
});
