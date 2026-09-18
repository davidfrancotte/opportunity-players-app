import test from "node:test";
import assert from "node:assert/strict";
import { monthlyPricesInCents, monthlyPrice } from "../lib/pricing.ts";
import {
  createSocialState,
  guardedSocialReducer,
  accessReason,
  monthKey,
  remainingMessages,
  isPremium,
  canReceive,
  visibleMessages,
  visibleComments,
} from "../lib/social.ts";
const player = { category: "Sportif", month: "2026-09" };
test("tarifs mensuels validés : sportif 2,99 €, professionnel 14,99 €, collectif 29,99 €", () => {
  assert.deepEqual(monthlyPricesInCents, { Sportif: 299, Professionnel: 1499, Organisation: 2999 });
  assert.equal(monthlyPrice("Sportif"), "2,99 €");
  assert.equal(monthlyPrice("Professionnel"), "14,99 €");
  assert.equal(monthlyPrice("Organisation"), "29,99 €");
});
const pro = { category: "Professionnel", month: "2026-09" };
const club = { category: "Organisation", month: "2026-09" };
function act(state, context, action) {
  return guardedSocialReducer(state, { context, action });
}
function send(state, context, id = "lea", text = "Bonjour", mine = true) {
  return act(state, context, {
    type: "message",
    id,
    message: { id: "test-" + (state.sentByMonth[context.month] || 0), text, mine },
  });
}
test("joueur gratuit : exactement 5 messages envoyés, sixième refusé sans ajout", () => {
  let state = createSocialState();
  for (let i = 0; i < 5; i++) {
    state = send(state, player);
    assert.equal(remainingMessages(state, player.month), 4 - i);
  }
  const before = state.conversations.find((c) => c.memberId === "lea").messages.length;
  state = send(state, player);
  assert.equal(state.gate, "quota");
  assert.equal(state.sentByMonth[player.month], 5);
  assert.equal(state.conversations.find((c) => c.memberId === "lea").messages.length, before);
});
test("quota partagé entre conversations et préservé au changement de formule", () => {
  let state = createSocialState();
  state = send(state, player, "horizon");
  state = send(state, player, "lea");
  assert.equal(remainingMessages(state, player.month), 3);
  state = act(state, player, { type: "subscription", category: "Sportif" });
  state = send(state, player);
  assert.equal(state.sentByMonth[player.month], 2);
  state = act(state, player, { type: "subscription", category: null });
  assert.equal(remainingMessages(state, player.month), 3);
});
test("un quota mensuel repart à 5 au mois suivant, y compris changement d’année", () => {
  let state = createSocialState();
  for (let i = 0; i < 5; i++) state = send(state, player);
  assert.equal(remainingMessages(state, "2026-10"), 5);
  state = send(state, { ...player, month: "2026-10" });
  assert.equal(remainingMessages(state, "2026-10"), 4);
  assert.equal(remainingMessages(state, "2026-09"), 0);
  assert.equal(monthKey(new Date("2026-12-31T23:30:00Z")), "2027-01");
  assert.equal(monthKey(new Date("2026-09-30T21:59:00Z")), "2026-09");
  assert.equal(monthKey(new Date("2026-09-30T22:00:00Z")), "2026-10");
});
test("les réceptions, commentaires, invalides et destinataires bloqués ne consomment pas de message", () => {
  let state = createSocialState();
  state = send(state, player, "lea", "Réponse", false);
  state = send(state, player, "lea", " ");
  state = send(state, player, "inconnu");
  state = act(state, player, { type: "open-chat", id: "sam" });
  state = send(state, player, "sam");
  assert.equal(state.gate, "recipient");
  assert.equal(remainingMessages(state, player.month), 5);
  state = act(state, player, {
    type: "comment",
    id: "post-tennis",
    comment: { id: "c", name: "Alex", text: "Bravo" },
  });
  assert.equal(remainingMessages(state, player.month), 5);
  assert.equal(state.posts.find((p) => p.id === "post-tennis").comments.length, 1);
});
test("publication : joueur gratuit refusé, professionnels et collectifs gratuits autorisés", () => {
  const state = createSocialState();
  const post = {
    ...state.posts[0],
    id: "new",
    author: "self",
    text: "Mon moment sportif",
    comments: [],
  };
  const denied = act(state, player, { type: "post", post });
  assert.equal(denied.gate, "publish");
  assert.equal(denied.posts.length, state.posts.length);
  for (const context of [pro, club])
    assert.equal(act(state, context, { type: "post", post }).posts.length, state.posts.length + 1);
  const paid = act(state, player, { type: "subscription", category: "Sportif" });
  assert.equal(act(paid, player, { type: "post", post }).posts.length, state.posts.length + 1);
});
test("pro et collectif gratuits : contacts joueurs bloqués par messages ET commentaires", () => {
  for (const context of [pro, club]) {
    const state = createSocialState();
    assert.equal(send(state, context).gate, "player-contact");
    const denied = act(state, context, {
      type: "comment",
      id: "post-tennis",
      comment: { id: "c", name: "Test", text: "Bonjour" },
    });
    assert.equal(denied.gate, "player-contact");
    assert.equal(denied.posts.find((p) => p.id === "post-tennis").comments.length, 0);
    assert.equal(accessReason(state, context, "message", "horizon"), null);
  }
});
test("réception professionnelle : texte masqué dans historique et commentaires de ses posts", () => {
  for (const context of [pro, club]) {
    let state = createSocialState();
    const convo = state.conversations.find((c) => c.memberId === "lea");
    assert.ok(visibleMessages(state, context, convo).every((m) => m.mine));
    assert.equal(canReceive(state, context.category), false);
    const ownPost = {
      ...state.posts[0],
      id: "self-post",
      author: "self",
      comments: [{ id: "c", name: "Léa", text: "Un commentaire reçu" }],
    };
    assert.deepEqual(visibleComments(state, context, ownPost), []);
    const denied = send(state, context, "lea", "Réponse entrante", false);
    assert.equal(denied.gate, "receive");
    assert.deepEqual(denied.conversations, state.conversations);
    state = act(state, context, { type: "subscription", category: context.category });
    assert.equal(visibleMessages(state, context, convo).length, convo.messages.length);
    assert.equal(visibleComments(state, context, ownPost).length, 1);
  }
});
test("réception de commentaires : création bloquée sur son propre post professionnel gratuit", () => {
  let state = createSocialState();
  const ownPost = { ...state.posts[0], id: "self-post", author: "self", comments: [] };
  state = act(state, pro, { type: "post", post: ownPost });
  state = act(state, pro, {
    type: "comment",
    id: "self-post",
    comment: { id: "c", name: "Léa", text: "Bonjour" },
  });
  assert.equal(state.gate, "receive");
  assert.equal(state.posts[0].comments.length, 0);
});
test("Premium ne permet pas d’écrire à un destinataire professionnel gratuit", () => {
  let state = createSocialState();
  state = act(state, player, { type: "subscription", category: "Sportif" });
  assert.equal(accessReason(state, player, "message", "sam"), "recipient");
  assert.equal(accessReason(state, player, "comment", "united"), "recipient");
  assert.equal(accessReason(state, player, "message", "lea"), null);
});
test("Premium : pas de quota gratuit et abonnement limité à sa catégorie", () => {
  let state = createSocialState();
  state = act(state, player, { type: "subscription", category: "Sportif" });
  for (let i = 0; i < 8; i++) state = send(state, player);
  assert.equal(state.gate, null);
  assert.equal(state.conversations.find((c) => c.memberId === "lea").messages.length, 10);
  assert.equal(isPremium(state, "Sportif"), true);
  assert.equal(isPremium(state, "Professionnel"), false);
  assert.equal(accessReason(state, pro, "message", "lea"), "player-contact");
  assert.deepEqual(act(state, player, { type: "reset" }), createSocialState());
});
