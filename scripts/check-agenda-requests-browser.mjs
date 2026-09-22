import { chromium } from "/Users/davidfrancotte/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import assert from "node:assert/strict";
const browser = await chromium.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
async function actor(id) {
  await page.waitForURL("**/rendez-vous");
  const select = page.getByLabel("Profil de simulation", { exact: true });
  if (!(await select.isVisible())) await page.locator(".career-demo summary").click();
  await select.selectOption(id);
}
async function request() {
  await page.locator('.bottom-nav a[href="/reseau"]').click();
  await page.getByRole("searchbox").fill("Marc");
  await page.getByRole("button", { name: "Rechercher des membres", exact: true }).click();
  await page.locator(".community-results .member-card > button").first().click();
  await page.getByRole("button", { name: "Demander un rendez-vous", exact: true }).click();
  await page.getByRole("button", { name: "Envoyer la demande · démo", exact: true }).click();
  await page.getByRole("link", { name: "Ouvrir mes rendez-vous", exact: true }).click();
  await page.waitForURL("**/rendez-vous");
}
async function agenda() {
  await page.locator('.career-nav a[href="/agenda"]').click();
  await page.waitForURL("**/agenda");
  await page.locator(".agenda-requests-heading").click();
}
try {
  await page.goto("http://127.0.0.1:3002/rendez-vous", { waitUntil: "networkidle" });
  await request();
  await actor("marc");
  await agenda();
  assert.equal(await page.locator(".agenda-request-count").innerText(), "1");
  await page.locator(".agenda-request > summary").click();
  assert.match(
    await page.locator(".agenda-request-purpose").innerText(),
    /Découvrir votre accompagnement/,
  );
  await page.getByRole("button", { name: "Refuser", exact: true }).click();
  assert.equal(await page.locator(".agenda-request-count").innerText(), "0");
  assert.equal(await page.locator(".agenda-request").count(), 0);
  await page.goBack();
  await actor("self");
  await request();
  await actor("marc");
  await page.getByRole("button", { name: "Mes disponibilités", exact: true }).click();
  await page.getByRole("button", { name: "Ajouter un créneau", exact: true }).click();
  const start = new Date();
  start.setDate(start.getDate() + 2);
  start.setHours(14, 0, 0, 0);
  const local = new Date(start.getTime() - start.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
  await page.locator('input[name="start"]').fill(local);
  await page.locator('input[name="place"]').fill("Visioconférence de démonstration");
  await page.getByRole("button", { name: "Ajouter le créneau", exact: true }).click();
  await page.getByRole("dialog").waitFor({ state: "hidden" });
  await agenda();
  await page.locator(".agenda-request > summary").click();
  await page
    .locator(".agenda-requests")
    .screenshot({ path: "/tmp/op-agenda-requests.png", animations: "disabled" });
  await page.getByRole("button", { name: "Valider", exact: true }).click();
  assert.equal(await page.locator(".agenda-request-count").innerText(), "1");
  assert.match(await page.locator(".agenda-request summary").innerText(), /créneau à fixer/);
  assert.equal(await page.getByRole("button", { name: "Valider", exact: true }).count(), 0);
  await page.goBack();
  await actor("self");
  await agenda();
  await page.locator(".agenda-request > summary").click();
  const slots = page.getByLabel("Choisir un créneau", { exact: true });
  const value = await slots.locator("option").nth(1).getAttribute("value");
  await slots.selectOption(value);
  await page.getByRole("button", { name: "Valider le rendez-vous", exact: true }).click();
  assert.equal(await page.locator(".agenda-request-count").innerText(), "0");
  assert.equal(await page.locator(".agenda-request").count(), 0);
  await page.getByRole("button", { name: "RDV pro", exact: true }).click();
  assert.equal(await page.locator(".unified-agenda-event.professional").count(), 1);
  for (const width of [320, 390, 480]) {
    await page.setViewportSize({ width, height: 844 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  }
  assert.deepEqual(errors, []);
  console.log(
    "PASS: request details, decline, accept, count until booking, role permissions, confirmed calendar event and mobile layout.",
  );
} finally {
  await browser.close();
}
