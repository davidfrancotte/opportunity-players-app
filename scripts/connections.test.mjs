import test from "node:test";
import assert from "node:assert/strict";
import {
  createSocialState,
  socialReducer,
  guardedSocialReducer,
  isConnected,
  connectedMemberIds,
  inCommunityFeed,
  accessReason,
  remainingMessages,
} from "../lib/social.ts";
import { createEventState, eventReducer } from "../lib/events.ts";
const ctx = { category: "Sportif", month: "2026-09", blocked: [] };
const act = (s, action, context = ctx) => guardedSocialReducer(s, { action, context });
test("follow and connect are distinct; only receiver acceptance connects, auto-follow is reversible", () => {
  let s = act(createSocialState(), { type: "follow", id: "marc" });
  assert.equal(isConnected(s, "marc"), false);
  assert.equal(inCommunityFeed(s, "marc"), true);
  s = act(s, { type: "connection-request", id: "marc" });
  assert.equal(isConnected(s, "marc"), false);
  assert.equal(act(s, { type: "connection-request", id: "marc" }), s);
  assert.equal(act(s, { type: "connection-response", id: "marc", accept: true }), s);
  s = act(s, { type: "connection-demo-response", id: "marc", accept: true });
  assert.equal(isConnected(s, "marc"), true);
  assert.deepEqual(connectedMemberIds(s), ["marc"]);
  s = act(s, { type: "follow", id: "marc" });
  assert.equal(inCommunityFeed(s, "marc"), false);
  assert.equal(isConnected(s, "marc"), true);
  assert.equal(inCommunityFeed(s, "self"), true);
});
test("incoming acceptance, outgoing rejection, cancellation, duplicate/unknown and blocking guards", () => {
  let s = createSocialState();
  assert.equal(act(s, { type: "connection-demo-response", id: "lea", accept: true }), s);
  s = act(s, { type: "connection-response", id: "lea", accept: true });
  assert.equal(isConnected(s, "lea"), true);
  assert.equal(act(s, { type: "connection-request", id: "unknown" }), s);
  s = act(s, { type: "connection-request", id: "marc" });
  const blocked = { ...ctx, blocked: ["marc"] };
  assert.equal(act(s, { type: "connection-demo-response", id: "marc", accept: true }, blocked), s);
  s = act(s, { type: "connection-demo-response", id: "marc", accept: false });
  assert.equal(isConnected(s, "marc"), false);
  s = act(s, { type: "connection-request", id: "marc" });
  s = act(s, { type: "connection-cancel", id: "marc" });
  assert.equal(
    s.connectionInvitations.some((i) => i.memberId === "marc"),
    false,
  );
  assert.deepEqual(connectedMemberIds(s, ["lea"]), []);
  assert.deepEqual(socialReducer(s, { type: "reset" }), createSocialState());
});
test("accepted connections message for free even at quota; pending requests and follows do not bypass it", () => {
  let s = createSocialState();
  s.contactedByMonth = { "Sportif:2026-09": ["ines", "academie", "united"] };
  assert.equal(remainingMessages(s, ctx.month), 0);
  s = act(s, { type: "follow", id: "marc" });
  s = act(s, { type: "connection-request", id: "marc" });
  assert.equal(accessReason(s, ctx, "message", "marc"), "quota");
  s = act(s, { type: "connection-demo-response", id: "marc", accept: true });
  assert.equal(accessReason(s, ctx, "message", "marc"), null);
  s = act(s, { type: "open-chat", id: "marc" });
  s = act(s, { type: "message", id: "marc", message: { id: "m", mine: true, text: "Bonjour !" } });
  assert.equal(s.conversations.find((c) => c.memberId === "marc").messages.length, 1);
  assert.equal(s.contactedByMonth["Sportif:2026-09"].length, 3);
  assert.deepEqual(s.sentByMonth, {});
  assert.equal(
    act(
      s,
      { type: "message", id: "marc", message: { id: "blocked", mine: true, text: "Salut" } },
      { ...ctx, blocked: ["marc"] },
    ),
    s,
  );
});
test("match creation requires accepted, nonblocked connections even for open matches and direct requests", () => {
  const now = Date.parse("2026-09-22T10:00:00Z");
  const state = createEventState(now);
  const match = { ...state.matches[0], id: "own", host: "me", invitees: ["marc"], open: true };
  const create = (connections) =>
    eventReducer(state, {
      action: { type: "create", match },
      context: { now, premium: true, city: "Liège", connections },
    });
  assert.match(create([]).error, /connexions acceptées/);
  assert.equal(create(["marc"]).error, "");
  assert.equal(create([]).matches.length, state.matches.length);
});
