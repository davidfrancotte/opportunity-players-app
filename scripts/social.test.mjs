import test from "node:test";
import assert from "node:assert/strict";
import {
  createSocialState,
  socialReducer,
  members,
  opportunities,
  matchesQuery,
  matchesOpportunityType,
} from "../lib/social.ts";

test("opportunités : les essais groupés se filtrent sans disparaître du recrutement", () => {
  const trials = opportunities.filter(o => matchesOpportunityType(o, "Essais groupés"));
  assert.deepEqual(trials.map(o => o.id), ["tryout"]);
  assert.ok(matchesOpportunityType(trials[0], "Recrutement"));
  assert.ok(matchesOpportunityType(trials[0], "Toutes"));
  assert.equal(matchesOpportunityType(trials[0], "Coaching"), false);
  assert.equal(matchesOpportunityType({ ...trials[0], groupTrial: false }, "Essais groupés"), false);
});

test("publication : ajout en tête, normalisation, limites et déduplication", () => {
  const state = createSocialState();
  const post = {
    ...state.posts[0],
    id: "new",
    author: "self",
    text: "  Mon premier post  ",
    likes: 0,
    liked: false,
    comments: [],
  };
  const next = socialReducer(state, { type: "post", post });
  assert.equal(next.posts[0].text, "Mon premier post");
  assert.equal(next.posts.length, state.posts.length + 1);
  assert.equal(state.posts[0].id, "post-padel");
  assert.equal(socialReducer(next, { type: "post", post }), next);
  for (const text of [" ", "a".repeat(1201)])
    assert.equal(socialReducer(state, { type: "post", post: { ...post, text } }), state);
});
test("likes : toggle réversible sans changer les autres publications", () => {
  const state = createSocialState();
  const next = socialReducer(state, { type: "like", id: state.posts[0].id });
  assert.equal(next.posts[0].likes, state.posts[0].likes + 1);
  assert.equal(next.posts[0].liked, true);
  assert.equal(next.posts[1], state.posts[1]);
  assert.deepEqual(socialReducer(next, { type: "like", id: state.posts[0].id }), state);
});
test("commentaires : ajout dans le bon post et refus des textes vides ou trop longs", () => {
  const state = createSocialState();
  const action = {
    type: "comment",
    id: state.posts[0].id,
    comment: { id: "c", name: "Alex", text: " Bravo ! " },
  };
  const next = socialReducer(state, action);
  assert.equal(next.posts[0].comments[0].text, "Bravo !");
  assert.equal(next.posts[1].comments.length, 0);
  for (const text of [" ", "x".repeat(401)])
    assert.equal(socialReducer(state, { ...action, comment: { ...action.comment, text } }), state);
});
test("réseau : suivre, ne plus suivre et refuser un membre inconnu", () => {
  const state = createSocialState();
  const next = socialReducer(state, { type: "follow", id: "lea" });
  assert.ok(next.following.includes("lea"));
  assert.deepEqual(socialReducer(next, { type: "follow", id: "lea" }), state);
  assert.equal(socialReducer(state, { type: "follow", id: "unknown" }), state);
  assert.deepEqual(
    new Set(members.map((m) => m.kind)),
    new Set(["Joueurs", "Professionnels", "Collectives"]),
  );
});
test("messages : ouverture, statut lu, nouvelle conversation sans doublons et envoi local", () => {
  const initial = createSocialState();
  let state = socialReducer(initial, { type: "open-chat", id: "horizon" });
  assert.equal(state.conversations.find((c) => c.memberId === "horizon").unread, false);
  state = socialReducer(state, { type: "open-chat", id: "noah" });
  assert.equal(state.activeChat, "noah");
  state = socialReducer(state, { type: "open-chat", id: "noah" });
  assert.equal(state.conversations.length, initial.conversations.length + 1);
  state = socialReducer(state, {
    type: "message",
    id: "noah",
    message: { id: "m", mine: true, text: " Bonjour " },
  });
  assert.equal(state.conversations[0].messages[0].text, "Bonjour");
  assert.equal(state.conversations[0].messages[0].mine, true);
  for (const text of [" ", "x".repeat(1001)])
    assert.equal(
      socialReducer(state, {
        type: "message",
        id: "noah",
        message: { id: "invalid", mine: true, text },
      }),
      state,
    );
  const closed = socialReducer(state, { type: "close-chat" });
  assert.equal(closed.activeChat, null);
  assert.deepEqual(closed.conversations, state.conversations);
});
test("opportunités : favoris et intérêt indépendants et réversibles", () => {
  const state = createSocialState();
  let next = socialReducer(state, { type: "save", id: opportunities[0].id });
  next = socialReducer(next, { type: "interest", id: opportunities[0].id });
  assert.equal(next.saved.length, 1);
  assert.equal(next.interested.length, 1);
  next = socialReducer(next, { type: "save", id: opportunities[0].id });
  assert.equal(next.saved.length, 0);
  assert.equal(next.interested.length, 1);
  assert.deepEqual(socialReducer(next, { type: "interest", id: opportunities[0].id }), state);
  assert.equal(socialReducer(state, { type: "save", id: "unknown" }), state);
});
test("recherche : accents, casse et espaces superflus", () => {
  assert.ok(matchesQuery("Léa Moreau · Bruxelles", "  LEA "));
  assert.ok(matchesQuery("Préparateur physique", "preparateur"));
  assert.ok(!matchesQuery("Horizon Padel", "tennis"));
  assert.ok(matchesQuery("Collectif", ""));
});
test("réinitialisation : toutes les interactions de la visite sont effacées", () => {
  let state = createSocialState();
  state = socialReducer(state, { type: "follow", id: "lea" });
  state = socialReducer(state, { type: "open-chat", id: "noah" });
  state = socialReducer(state, { type: "save", id: "coach" });
  assert.deepEqual(socialReducer(state, { type: "reset" }), createSocialState());
  assert.notEqual(createSocialState().posts, createSocialState().posts);
});
