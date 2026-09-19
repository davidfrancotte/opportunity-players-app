import test from "node:test";
import assert from "node:assert/strict";
import {
  createTrustState,
  trustReducer,
  moderateText,
  fileDecision,
  memberSports,
  matchesSportRecords,
} from "../lib/trust.ts";
import {
  createSocialState,
  guardedSocialReducer,
  remainingMessages,
} from "../lib/social.ts";

test("filter recognises the four safe markers and normalised case/accents", () => {
  for (const marker of ["RACISME", "SEXiSME", "MENACE", "HARCÈLEMENT"])
    assert.ok(moderateText("[TEST " + marker + "]"));
  assert.equal(moderateText("Bravo à cette équipe féminine de tennis !"), null);
});
test("blocked and filtered incoming/outgoing messages neither publish nor consume quota", () => {
  const state = createSocialState(),
    context = { category: "Sportif", month: "2026-09" };
  for (const mine of [true, false]) {
    const action = {
      type: "message",
      id: "lea",
      message: { id: "test", mine, text: "[TEST RACISME]" },
    };
    assert.equal(guardedSocialReducer(state, { context, action }), state);
    assert.equal(
      guardedSocialReducer(state, {
        context: { ...context, blocked: ["lea"] },
        action: { ...action, message: { ...action.message, text: "Bonjour" } },
      }),
      state,
    );
  }
  assert.equal(remainingMessages(state, context.month), 5);
  assert.equal(
    guardedSocialReducer(state, {
      context: { ...context, blocked: ["lea"] },
      action: { type: "open-chat", id: "lea" },
    }),
    state,
  );
});
test("posts and comments are also screened before mutation", () => {
  const state = createSocialState(),
    context = { category: "Professionnel", month: "2026-09" };
  assert.equal(
    guardedSocialReducer(state, {
      context,
      action: {
        type: "post",
        post: { ...state.posts[0], id: "bad", text: "[TEST SEXISME]" },
      },
    }),
    state,
  );
  assert.equal(
    guardedSocialReducer(state, {
      context,
      action: {
        type: "comment",
        id: state.posts[0].id,
        comment: { id: "bad", name: "Alex", text: "[TEST MENACE]" },
      },
    }),
    state,
  );
});
test("sport, level, club and ranking must match the SAME discipline", () => {
  const records = memberSports.lea;
  assert.ok(
    matchesSportRecords(records, "Padel", "Intermédiaire", "horizon", "P200"),
  );
  assert.ok(
    matchesSportRecords(records, "Tennis", "Compétition", "arena", "C15.2"),
  );
  assert.equal(
    matchesSportRecords(records, "Tennis", "Intermédiaire", "horizon"),
    false,
  );
  assert.equal(
    matchesSportRecords(records, "Padel", "Tous", "", "C15.2"),
    false,
  );
});
test("file format and size gate; no executables, SVG, animated GIF or empty file", () => {
  assert.equal(fileDecision("cv.pdf", "application/pdf", 100, "CV"), null);
  assert.equal(fileDecision("sport.jpg", "image/jpeg", 100, "Photo"), null);
  for (const [n, t, s, k] of [
    ["bad.svg", "image/svg+xml", 100, "Photo"],
    ["a.gif", "image/gif", 100, "Photo"],
    ["a.exe", "application/pdf", 100, "CV"],
    ["a.pdf", "application/pdf", 0, "CV"],
    ["a.pdf", "application/pdf", 11 * 1024 * 1024, "CV"],
  ])
    assert.ok(fileDecision(n, t, s, k));
});
const review = {
  id: "r1",
  memberId: "lea",
  sport: "Tennis",
  club: "Tennis Club Arena",
  author: "Alex",
  score: 4,
  text: "Bonne progression technique durant la saison.",
  relationship: "Coach durant 2023",
  status: "published",
};
test("professional reviews require actual club experience, rating and respectful text; start pending", () => {
  const s = createTrustState();
  for (const [professional, r] of [
    [false, review],
    [true, { ...review, club: "Arena" }],
    [true, { ...review, score: 6 }],
    [true, { ...review, text: "[TEST HARCELEMENT]" }],
  ]) {
    const next = trustReducer(s, { type: "review", professional, review: r });
    assert.equal(next.reviews.length, 0);
    assert.ok(next.error);
  }
  const next = trustReducer(s, { type: "review", professional: true, review });
  assert.equal(next.reviews[0].status, "pending");
  assert.equal(
    trustReducer(next, { type: "review", professional: true, review }).reviews
      .length,
    1,
  );
  const published = trustReducer(next, {
    type: "review-status",
    id: "r1",
    status: "published",
  });
  assert.equal(
    trustReducer(published, {
      type: "review-status",
      id: "r1",
      status: "contested",
    }).reviews[0].status,
    "contested",
  );
});
test("referral rewards require all three steps, prevent duplicate/self and credit once", () => {
  let s = createTrustState();
  const add = (email) => ({
    type: "referral",
    ownEmail: "me@demo.example",
    referral: { id: "f1", email, stage: 3, credited: true },
  });
  assert.ok(trustReducer(s, add("ME@demo.example")).error);
  s = trustReducer(s, add("friend@demo.example"));
  assert.equal(s.referrals[0].stage, 0);
  assert.ok(trustReducer(s, add("FRIEND@demo.example")).error);
  for (let i = 0; i < 2; i++) {
    s = trustReducer(s, { type: "referral-step", id: "f1" });
    assert.equal(s.rewardMonths, 0);
  }
  s = trustReducer(s, { type: "referral-step", id: "f1" });
  assert.equal(s.rewardMonths, 3);
  s = trustReducer(s, { type: "referral-step", id: "f1" });
  assert.equal(s.rewardMonths, 3);
  s = trustReducer(s, { type: "activate-reward" });
  assert.equal(s.rewardActivated, true);
  assert.ok(trustReducer(s, { type: "activate-reward" }).error);
  assert.deepEqual(trustReducer(s, { type: "reset" }), createTrustState());
});
test("consents start unchecked, reporting and block/unblock are explicit", () => {
  let s = createTrustState();
  assert.equal(s.policy, false);
  assert.equal(s.accuracy, false);
  assert.equal(s.securityStep, false);
  s = trustReducer(s, { type: "block", id: "lea" });
  assert.deepEqual(s.blocked, ["lea"]);
  s = trustReducer(s, { type: "block", id: "lea" });
  assert.deepEqual(s.blocked, []);
  s = trustReducer(s, {
    type: "report",
    id: "x",
    memberId: "lea",
    reason: "Harcèlement",
  });
  assert.equal(s.reports[0].status, "received");
});
