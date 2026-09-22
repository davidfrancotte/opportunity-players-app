import test from "node:test";
import assert from "node:assert/strict";
import { agendaDay, monthDays, agendaEntries, filterAgenda } from "../lib/agenda.ts";
import { createEventState, eventReducer } from "../lib/events.ts";
import { createCareerState } from "../lib/career.ts";
import { emptyWorkspace, calendarFile } from "../lib/extensions.ts";
const now = Date.parse("2026-09-22T10:00:00Z");
const context = { now, premium: false, city: "Liège" };
test("monthly calendar: Monday first, leap years, full weeks", () => {
  assert.equal(monthDays("2026-09")[0], null);
  assert.equal(monthDays("2026-09")[1], "2026-09-01");
  assert.equal(monthDays("2026-09").filter(Boolean).length, 30);
  assert.equal(monthDays("2028-02").filter(Boolean).length, 29);
  assert.equal(monthDays("2026-03").length, 42);
  assert.equal(monthDays("2026-02").filter(Boolean).length, 28);
});
test("calendar dates use Brussels timezone, including month boundary and DST", () => {
  assert.equal(agendaDay("2026-09-30T22:30:00Z"), "2026-10-01");
  assert.equal(agendaDay("2026-12-31T23:30:00Z"), "2027-01-01");
  assert.equal(agendaDay("2026-03-29T22:30:00Z"), "2026-03-30");
});
test("spectator interest: free access, idempotence, removal and unknown ID", () => {
  let s = createEventState(now);
  const action = { type: "spectator-interest", id: "spectator-padel", interested: true };
  s = eventReducer(s, { action, context });
  s = eventReducer(s, { action, context });
  assert.equal(s.spectatorInterests.filter((id) => id === action.id).length, 1);
  s = eventReducer(s, { action: { ...action, interested: false }, context });
  assert.equal(s.spectatorInterests.includes(action.id), false);
  assert.ok(eventReducer(s, { action: { ...action, id: "unknown" }, context }).error);
});
test("agenda includes only confirmed personal matches and booked relevant appointments", () => {
  const e = createEventState(now),
    c = createCareerState(),
    w = emptyWorkspace();
  const base = { ...e.matches[0], confirmed: "a" };
  e.matches = [
    base,
    { ...base, id: "host", host: "me" },
    {
      ...base,
      id: "accepted",
      replies: [{ user: "me", slots: ["a"], status: "approved", guests: [] }],
    },
    {
      ...base,
      id: "wrong-slot",
      replies: [{ user: "me", slots: ["b"], status: "approved", guests: [] }],
    },
    { ...base, id: "cancelled", host: "me", cancelled: true },
  ];
  c.slots = [
    { id: "slot", professional: "marc", start: "2026-09-25T12:00:00Z", place: "Bureau démo" },
  ];
  c.appointments = [
    {
      id: "booked",
      requester: "self",
      professional: "marc",
      purpose: "Test",
      status: "booked",
      slot: "slot",
    },
    { id: "pending", requester: "self", professional: "marc", purpose: "Test", status: "accepted" },
    {
      id: "other",
      requester: "lea",
      professional: "marc",
      purpose: "Test",
      status: "booked",
      slot: "slot",
    },
  ];
  const items = agendaEntries(e, c, w, "self", (id) => id);
  assert.deepEqual(
    items.filter((i) => i.category === "match").map((i) => i.id),
    ["match-host", "match-accepted"],
  );
  assert.deepEqual(
    items.filter((i) => i.category === "professional").map((i) => i.id),
    ["appointment-booked"],
  );
  assert.equal(items.filter((i) => i.category === "spectator").length, 1);
  assert.ok(calendarFile(items, 60).includes("Arena FC"));
});
test("month, day and category filters compose and reflect interest removal", () => {
  const e = createEventState(now),
    c = createCareerState(),
    w = emptyWorkspace();
  const items = agendaEntries(e, c, w, "self", (id) => id);
  assert.equal(filterAgenda(items, "2026-09", "spectator", "2026-09-24").length, 1);
  assert.equal(filterAgenda(items, "2026-09", "match").length, 0);
  assert.equal(filterAgenda(items, "2026-10", "all").length, 0);
  e.spectatorInterests = [];
  assert.equal(agendaEntries(e, c, w, "self", (id) => id).length, 0);
});
