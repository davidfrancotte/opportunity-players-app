import { chromium } from "/Users/davidfrancotte/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import assert from "node:assert/strict";
const browser = await chromium.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
try {
  await page.goto("http://127.0.0.1:3002/jouer", { waitUntil: "networkidle" });
  assert.equal(await page.locator(".network-sections a").count(), 3);
  await page.locator('.network-sections a[href="/agenda"]').click();
  await page.getByRole("table").waitFor();
  assert.equal(
    await page.locator('.network-sections a[aria-current="page"]').innerText(),
    "Agenda",
  );
  assert.equal(await page.locator(".agenda-day.has-events").count(), 1);
  assert.equal(await page.locator(".unified-agenda-event").count(), 1);
  await page.screenshot({ path: "/tmp/op-agenda-mobile.png", fullPage: true });
  await page.getByRole("button", { name: "Matchs", exact: true }).click();
  assert.equal(await page.locator(".unified-agenda-event").count(), 0);
  assert.equal(await page.locator(".agenda-day.has-events").count(), 0);
  await page.getByRole("button", { name: "RDV pro", exact: true }).click();
  assert.equal(await page.locator(".unified-agenda-event").count(), 0);
  await page.getByRole("button", { name: "Agenda sportif", exact: true }).click();
  assert.equal(await page.locator(".unified-agenda-event").count(), 1);
  await page.locator(".agenda-day.has-events").click();
  assert.equal(await page.locator('.agenda-day[aria-pressed="true"]').count(), 1);
  await page.getByRole("button", { name: "Tout le mois", exact: true }).click();
  const month = await page.locator(".agenda-month-heading h2").innerText();
  await page.getByRole("button", { name: "Mois suivant", exact: true }).click();
  assert.notEqual(await page.locator(".agenda-month-heading h2").innerText(), month);
  assert.equal(await page.locator(".unified-agenda-event").count(), 0);
  await page.getByRole("button", { name: "Ce mois-ci", exact: true }).click();
  await page.locator(".agenda-discover summary").click();
  const padel = page
    .locator(".agenda-discover article")
    .filter({ hasText: "Finale du tournoi de padel" });
  await padel.getByRole("button").click();
  assert.equal(await padel.getByRole("button").getAttribute("aria-pressed"), "true");
  assert.equal(await page.locator(".unified-agenda-event").count(), 2);
  await page
    .locator(".unified-agenda-event")
    .filter({ hasText: "Finale du tournoi de padel" })
    .getByRole("button")
    .click();
  assert.equal(await padel.getByRole("button").getAttribute("aria-pressed"), "false");
  assert.equal(await page.locator(".unified-agenda-event").count(), 1);
  assert.equal(await page.getByRole("link", { name: "Mes matchs et invitations", exact: true }).count(), 0);
  assert.equal(await page.getByRole("link", { name: "Gérer mes demandes de RDV", exact: true }).count(), 0);
  await page.locator(".agenda-requests-heading").click();
  assert.equal(await page.locator(".agenda-request-count").innerText(), "0");
  await page.getByText("Aucune demande en attente de confirmation.").waitFor();
  assert.equal(await page.locator(".unified-agenda-event").count(), 1);
  for (const width of [320, 390, 480, 900]) {
    await page.setViewportSize({ width, height: 900 });
    assert.ok(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
      `overflow at ${width}`,
    );
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: "/tmp/op-agenda-viewport.png" });
  await page.goto("http://127.0.0.1:3002/calendrier-avance", { waitUntil: "networkidle" });
  assert.equal(await page.getByRole("table").count(), 1);
  await page.getByLabel("Langue / Language").selectOption("en");
  await page.getByRole("button", { name: "Sports calendar", exact: true }).click();
  assert.equal(await page.locator(".unified-agenda-event").count(), 1);
  assert.deepEqual(errors, []);
  console.log(
    "PASS: unified navigation, month/day/category filters, spectator interest, requests return, old route, mobile widths, English, no runtime errors",
  );
} finally {
  await browser.close();
}
