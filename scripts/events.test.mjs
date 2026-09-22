import test from "node:test";
import assert from "node:assert/strict";
import {
  createEventState,
  eventReducer,
  countPlayers,
  canViewMatch,
  distanceKm,
  profileCity,
  suggestedTotals,
} from "../lib/events.ts";
const now = Date.parse("2026-09-19T10:00:00Z"),
  paid = { premium: true, city: "Liège", now, connections: ["lea", "noah", "sam", "horizon", "marc", "ines", "united", "academie"] },
  free = { ...paid, premium: false };
const act = (s, a, c = paid) => eventReducer(s, { action: a, context: c });
function event(overrides = {}) {
  return {
    id: "test",
    title: "Match test",
    sport: "Padel",
    city: "Liège",
    venue: "Terrain fictif",
    host: "me",
    hostPlays: true,
    minimum: 4,
    capacity: 4,
    open: true,
    plusOne: true,
    invitees: ["lea", "noah"],
    slots: [
      { id: "one", start: "2026-09-21T16:00:00Z", minutes: 90 },
      { id: "two", start: "2026-09-22T16:00:00Z", minutes: 90 },
    ],
    replies: [],
    ...overrides,
  };
}
const create = (m = event()) =>
  act(createEventState(now), { type: "create", match: m });
const match = (s) => s.matches.find((m) => m.id === "test");
test("gratuit : un événement créé par mois ; les créations suivantes sont refusées", () => {
  const s = act(
    createEventState(now),
    { type: "create", match: event() },
    free,
  );
  assert.equal(s.error, '');
  assert.equal(s.matches.length, 4);
  assert.match(act(s,{type:'create',match:event({id:'second'})},free).error,/gratuit/);
  assert.equal(create().matches.length, 4);
});
test("matchs ouverts : abonnement et rayon 50km, URL directe comprise", () => {
  const m = event({ host: "noah", invitees: [] });
  assert.equal(canViewMatch(m, free), false);
  assert.equal(canViewMatch(m, paid), true);
  assert.equal(canViewMatch(m, { ...paid, city: "Bruxelles" }), false);
  assert.equal(canViewMatch(m, { ...paid, city: "" }), false);
  assert.ok(distanceKm("Liège", "Verviers") < 50);
  assert.ok(distanceKm("Liège", "Bruxelles") > 50);
  assert.equal(profileCity("Liège, Belgique"), "Liège");
});
test("invitation privée accessible et réponse gratuite, plusieurs dates +1", () => {
  let s = createEventState(now);
  s = act(
    s,
    { type: "reply", id: "invitation-padel", slots: ["a", "b"], guests: ["a"] },
    free,
  );
  assert.equal(s.error, "");
  const m = s.matches[0];
  assert.equal(countPlayers(m, "a"), 4);
  assert.equal(countPlayers(m, "b"), 3);
  assert.equal(
    s.notices.filter((n) => n.kind === "ready" && n.recipient === "noah")
      .length,
    1,
  );
});
test("compte TOTAL : organisateur optionnel et +1 inclus, pas de doublon de vote", () => {
  let s = create();
  s = act(s, {
    type: "simulate",
    id: "test",
    user: "lea",
    slot: "one",
    guest: true,
  });
  assert.equal(countPlayers(match(s), "one"), 3);
  s = act(s, {
    type: "simulate",
    id: "test",
    user: "lea",
    slot: "one",
    guest: true,
  });
  assert.equal(countPlayers(match(s), "one"), 3);
  const m = event({ hostPlays: false, replies: match(s).replies });
  assert.equal(countPlayers(m, "one"), 2);
  assert.equal(suggestedTotals.Football, 11);
  assert.equal(suggestedTotals.Tennis, 1);
  assert.equal(suggestedTotals.Padel, 2);
});
test("candidature publique en attente ne compte pas avant accord", () => {
  let s = create();
  s = act(s, {
    type: "simulate",
    id: "test",
    user: "sam",
    slot: "one",
    guest: true,
  });
  assert.equal(countPlayers(match(s), "one"), 1);
  assert.equal(match(s).replies[0].status, "pending");
  s = act(s, { type: "approve", id: "test", user: "sam" });
  assert.equal(countPlayers(match(s), "one"), 3);
  assert.equal(
    s.notices.some((n) => n.recipient === "sam" && n.text.includes("acceptée")),
    true,
  );
});
test("surbooking avec +1 refusé atomiquement ; refus des candidats possible", () => {
  let s = create();
  s = act(s, {
    type: "simulate",
    id: "test",
    user: "lea",
    slot: "one",
    guest: true,
  });
  s = act(s, {
    type: "simulate",
    id: "test",
    user: "noah",
    slot: "one",
    guest: true,
  });
  assert.match(s.error, /dépasserait/);
  assert.equal(countPlayers(match(s), "one"), 3);
  s = act(s, {
    type: "simulate",
    id: "test",
    user: "sam",
    slot: "one",
    guest: true,
  });
  s = act(s, { type: "approve", id: "test", user: "sam" });
  assert.match(s.error, /dépasserait/);
  assert.equal(
    match(s).replies.find((r) => r.user === "sam").status,
    "pending",
  );
  s = act(s, { type: "decline", id: "test", user: "sam" });
  assert.equal(
    match(s).replies.find((r) => r.user === "sam").status,
    "declined",
  );
});
test("confirmation manuelle au quorum, notifications à tous, autres dates closes", () => {
  let s = create();
  s = act(s, { type: "confirm", id: "test", slot: "one" });
  assert.ok(s.error);
  s = act(s, {
    type: "simulate",
    id: "test",
    user: "lea",
    slot: "one",
    guest: true,
  });
  s = act(s, {
    type: "simulate",
    id: "test",
    user: "noah",
    slot: "one",
    guest: false,
  });
  assert.equal(match(s).confirmed, undefined);
  assert.equal(
    s.notices.filter((n) => n.kind === "ready" && n.recipient === "me").length,
    1,
  );
  s = act(s, {
    type: "simulate",
    id: "test",
    user: "noah",
    slot: "one",
    guest: false,
  });
  assert.equal(
    s.notices.filter((n) => n.kind === "ready" && n.recipient === "me").length,
    1,
  );
  s = act(s, { type: "confirm", id: "test", slot: "one" });
  assert.equal(match(s).confirmed, "one");
  assert.deepEqual(
    s.notices
      .filter((n) => n.kind === "confirmed")
      .map((n) => n.recipient)
      .sort(),
    ["lea", "me", "noah"],
  );
  s = act(s, { type: "confirm", id: "test", slot: "two" });
  assert.ok(s.error);
  assert.equal(match(s).confirmed, "one");
});
test("désistement après confirmation retire aussi le +1 et alerte sans annuler", () => {
  let s = createEventState(now);
  s.matches = [
    event({
      host: "noah",
      invitees: ["me"],
      confirmed: "one",
      minimum: 3,
      replies: [
        { user: "me", slots: ["one"], guests: ["one"], status: "approved" },
      ],
    }),
  ];
  s = act(s, { type: "reply", id: "test", slots: [], guests: [] }, free);
  assert.equal(countPlayers(match(s), "one"), 1);
  assert.equal(match(s).cancelled, undefined);
  assert.ok(
    s.notices.some(
      (n) => n.recipient === "noah" && n.text.includes("incomplet"),
    ),
  );
});
test("seul organisateur peut confirmer/annuler/approuver ; dates passées et invalides rejetées", () => {
  let s = createEventState(now);
  for (const action of [
    { type: "confirm", id: "invitation-padel", slot: "a" },
    { type: "cancel", id: "invitation-padel" },
    { type: "approve", id: "invitation-padel", user: "lea" },
  ])
    assert.ok(act(s, action).error);
  for (const m of [
    event({ minimum: 0 }),
    event({ capacity: 2 }),
    event({ slots: [] }),
    event({ slots: [{ id: "one", start: "2026-01-01", minutes: 90 }] }),
    event({ slots: [{ id: "one", start: "bad", minutes: 90 }] }),
    event({ open: false, invitees: [] }),
  ])
    assert.ok(create(m).error);
});
test("refus de +1 non autorisé et créneaux inconnus, annulation ferme les actions", () => {
  let s = create(event({ plusOne: false }));
  assert.ok(
    act(s, {
      type: "simulate",
      id: "test",
      user: "lea",
      slot: "one",
      guest: true,
    }).error,
  );
  assert.ok(
    act(s, {
      type: "simulate",
      id: "test",
      user: "lea",
      slot: "inconnu",
      guest: false,
    }).error,
  );
  s = act(s, { type: "cancel", id: "test" });
  assert.ok(match(s).cancelled);
  assert.ok(
    act(s, {
      type: "simulate",
      id: "test",
      user: "lea",
      slot: "one",
      guest: false,
    }).error,
  );
});
test("rappels 24h/2h dédupliqués et seulement pour participants confirmés", () => {
  let s = createEventState(now);
  s.matches = [event({ confirmed: "one" })];
  const deadline = Date.parse(s.matches[0].slots[0].start);
  s = act(s, { type: "tick" }, { ...paid, now: deadline - 23 * 3600000 });
  assert.equal(s.notices.filter((n) => n.kind === "reminder").length, 1);
  s = act(s, { type: "tick" }, { ...paid, now: deadline - 22 * 3600000 });
  assert.equal(s.notices.filter((n) => n.kind === "reminder").length, 1);
  s = act(s, { type: "tick" }, { ...paid, now: deadline - 3600000 });
  assert.equal(s.notices.filter((n) => n.kind === "reminder").length, 2);
  s = act(s, { type: "read" });
  assert.ok(s.notices.filter((n) => n.recipient === "me").every((n) => n.read));
});
test("rappels désactivables et reset remet la démo à zéro", () => {
  let s = createEventState(now);
  s.matches = [event({ confirmed: "one" })];
  s = act(s, { type: "settings", reminders: false, banners: false });
  s = act(
    s,
    { type: "tick" },
    { ...paid, now: Date.parse(s.matches[0].slots[0].start) - 3600000 },
  );
  assert.equal(s.notices.filter((n) => n.kind === "reminder").length, 0);
  s = act(s, { type: "reset" });
  assert.equal(s.matches.length, 3);
  assert.equal(s.lastCreated, null);
});
