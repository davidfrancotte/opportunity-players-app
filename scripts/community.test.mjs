import test from "node:test";
import assert from "node:assert/strict";
import {
  feedCategories,
  emptyFeedFilters,
  matchesFeed,
  memberSearchFilters,
} from "../lib/community.ts";
import { emptyDirectoryFilters, matchesDirectory } from "../lib/directory.ts";
import { createSocialState, socialReducer, guardedSocialReducer, members } from "../lib/social.ts";
import { memberSports } from "../lib/trust.ts";
import { createEventState, canViewMatch } from "../lib/events.ts";
import { limits } from "../lib/entitlements.ts";
import { createExtensionState, extensionReducer, workspace } from "../lib/extensions.ts";

test("feed categories and opportunity subcategories combine; free ignores stale premium filters", () => {
  assert.equal(feedCategories.length, 5);
  const posts = createSocialState().posts;
  const f = {
    ...emptyFeedFilters,
    category: "Opportunités",
    opportunityCategory: "Recrutement de joueurs",
    query: "ATTAQUANT",
    sport: "Football",
  };
  assert.deepEqual(
    posts.filter((p) => matchesFeed(p, f, true)).map((p) => p.id),
    ["post-striker"],
  );
  assert.equal(posts.filter((p) => matchesFeed(p, f, false)).length, posts.length);
  assert.equal(
    posts.filter((p) => matchesFeed(p, { ...emptyFeedFilters, category: "Offres d’emploi" }, true))
      .length,
    1,
  );
});
test("post classification validates and preserves opportunity category", () => {
  const initial = createSocialState();
  const post = {
    ...initial.posts[0],
    id: "new",
    category: "Opportunités",
    opportunityCategory: "Essais et détections",
  };
  assert.equal(
    socialReducer(initial, { type: "post", post }).posts[0].opportunityCategory,
    post.opportunityCategory,
  );
  for (const bad of [
    { category: "bad" },
    { category: "Opportunités" },
    { category: "News", opportunityCategory: "Essais et détections" },
  ]) {
    assert.equal(
      socialReducer(initial, { type: "post", post: { ...initial.posts[0], id: "bad", ...bad } }),
      initial,
    );
  }
});
test("member search gates all four refinements and combines ranking with sport", () => {
  const filters = {
    ...emptyDirectoryFilters,
    country: "Belgique",
    city: "Bruxelles",
    sport: "Tennis",
    ranking: "C15.2",
  };
  const paid = memberSearchFilters(filters, true);
  assert.deepEqual(
    members.filter((m) => matchesDirectory(m, memberSports[m.id] || [], paid)).map((m) => m.id),
    ["lea"],
  );
  assert.deepEqual(memberSearchFilters({ ...filters, query: "Léa" }, false), {
    ...emptyDirectoryFilters,
    query: "Léa",
  });
});
test("pending connection invitations accept or decline once; reset restores demo", () => {
  const initial = createSocialState();
  assert.equal(initial.connectionInvitations.length, 3);
  let state = socialReducer(initial, { type: "connection-response", id: "lea", accept: true });
  assert.ok(state.following.includes("lea"));
  assert.equal(state.connectionInvitations.filter((i) => i.status === "pending").length, 2);
  assert.equal(
    socialReducer(state, { type: "connection-response", id: "lea", accept: true }),
    state,
  );
  state = socialReducer(state, { type: "connection-response", id: "noah", accept: false });
  assert.ok(!state.following.includes("noah"));
  assert.deepEqual(socialReducer(state, { type: "reset" }), initial);
  assert.equal(
    guardedSocialReducer(initial, {
      context: { category: "Sportif", month: "2026-09", blocked: ["lea"] },
      action: { type: "connection-response", id: "lea", accept: true },
    }),
    initial,
  );
});
test("nearby open matches require Premium for every category; personal invitations stay free at any radius", () => {
  const now = Date.now();
  const seed = createEventState(now).matches[0];
  const open = {
    ...seed,
    host: "other",
    invitees: [],
    replies: [],
    open: true,
    city: "Liège",
    cancelled: false,
  };
  for (const category of ["Sportif", "Professionnel", "Organisation"]) {
    assert.equal(limits(category, false).discover, false);
    assert.equal(canViewMatch(open, { category, premium: false, city: "Liège", now }), false);
    assert.equal(
      canViewMatch(open, { category, premium: true, city: "Liège", radius: 10, now }),
      true,
    );
    assert.equal(
      canViewMatch(
        { ...open, city: "Bruxelles", invitees: ["me"] },
        { category, premium: false, city: "Liège", radius: 10, now },
      ),
      true,
    );
  }
});
test("scheduled posts preserve image and category and reject past, free or unmoderated input", () => {
  const now = Date.now(),
    context = { key: "self:Professionnel", category: "Professionnel", premium: true, now };
  const value = {
    id: "scheduled",
    text: "Recherche de partenaires",
    sport: "Tennis",
    category: "Opportunités",
    opportunityCategory: "Partenaires de jeu",
    image: "/images/tennis-color.webp",
    start: new Date(now + 3600000).toISOString(),
    status: "planned",
  };
  const initial = createExtensionState();
  const result = extensionReducer(initial, { context, action: { type: "schedule", value } });
  assert.deepEqual(workspace(result, context.key).schedules[0], value);
  for (const command of [
    { context: { ...context, premium: false }, value },
    { context, value: { ...value, start: "2000-01-01" } },
    { context, value: { ...value, text: "[TEST MENACE]" } },
  ]) {
    const state = extensionReducer(initial, {
      context: command.context,
      action: { type: "schedule", value: command.value },
    });
    assert.ok(state.error);
    assert.equal(workspace(state, context.key).schedules.length, 0);
  }
});
