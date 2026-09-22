import { chromium } from "/Users/davidfrancotte/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import assert from "node:assert/strict";
const browser = await chromium.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on("pageerror", (e) => {
  errors.push(e.message);
  console.error("PAGE ERROR:", e.message);
});
page.on("console", (msg) => {
  if (msg.type() === "error") console.error("CONSOLE:", msg.text());
});
const nav = async (href) => {
  await page.locator(`.bottom-nav a[href="${href}"]`).press("Enter");
  await page.waitForURL(`**${href}`);
};
try {
  await page.goto("http://127.0.0.1:3002/accueil", { waitUntil: "networkidle" });
  assert.equal(await page.locator(".play-home,.recommendations").count(), 0);
  assert.equal(await page.getByRole("button", { name: "Filtrer le fil", exact: true }).count(), 0);
  await page.locator(".compose-launch").click();
  assert.equal(await page.getByLabel("Programmer cette publication").isVisible(), true);
  assert.equal(await page.getByLabel("Programmer cette publication").isDisabled(), true);
  assert.equal(await page.locator(".schedule-premium-badge").innerText(), "Premium");
  assert.match(
    await page.locator("#schedule-premium-hint").innerText(),
    /réservée aux membres Premium/,
  );
  assert.equal(await page.getByLabel("Date et heure (heure locale)").count(), 0);
  assert.equal(
    await page.getByRole("link", { name: "Découvrir Premium" }).getAttribute("href"),
    "/abonnement?retour=/accueil",
  );
  await page
    .locator(".community-schedule")
    .screenshot({ path: "/tmp/op-schedule-free.png", animations: "disabled" });
  await page.getByLabel("Fermer la fenêtre").click();
  await page.screenshot({ path: "/tmp/op-community-free-home.png", fullPage: true });
  await nav("/reseau");
  assert.equal(await page.locator(".community-invitation").count(), 2);
  assert.equal(
    await page.getByRole("button", { name: "Affiner la recherche", exact: true }).count(),
    1,
  );
  const refine = page.getByRole("button", { name: "Affiner la recherche", exact: true });
  assert.equal(await refine.getAttribute("aria-expanded"), "false");
  await refine.click();
  assert.equal(await refine.getAttribute("aria-expanded"), "true");
  assert.match(await page.locator("#member-advanced").innerText(), /réservés aux membres Premium/);
  assert.equal(
    await page.getByRole("link", { name: "Découvrir Premium" }).getAttribute("href"),
    "/abonnement?retour=/reseau",
  );
  for (const label of [
    "Filtrer par pays",
    "Filtrer par ville",
    "Filtrer par sport",
    "Filtrer par classement",
  ]) {
    assert.equal(await page.getByLabel(label, { exact: true }).isDisabled(), true);
  }
  await page.getByRole("searchbox").focus();
  assert.equal(
    await page.getByRole("searchbox").evaluate((el) => getComputedStyle(el).outlineStyle),
    "none",
  );
  assert.equal(
    await page
      .locator(".community-search-row .social-search")
      .evaluate((el) => getComputedStyle(el).outlineStyle),
    "solid",
  );
  await page
    .locator(".community-section")
    .first()
    .screenshot({ path: "/tmp/op-network-free-filters.png", animations: "disabled" });
  await refine.click();
  assert.equal(await page.locator("#member-advanced").count(), 0);
  await page.getByRole("button", { name: "Voir toutes les invitations" }).click();
  assert.equal(await page.locator(".community-invitation").count(), 3);
  await page.getByRole("button", { name: "Réduire les invitations" }).click();
  await page
    .locator(".community-invitation")
    .first()
    .getByRole("button", { name: "Accepter", exact: true })
    .click();
  assert.equal(await page.locator(".community-invitation").count(), 2);
  await page.getByRole("searchbox").fill("Inès");
  await page.getByRole("button", { name: "Rechercher des membres" }).click();
  assert.equal(await page.locator(".community-results .member-card").count(), 1);
  await page.getByRole("button", { name: "Effacer la recherche" }).click();
  await page.screenshot({ path: "/tmp/op-community-free-network.png", fullPage: true });
  await page.locator('.network-sections a[href="/jouer"]').click();
  assert.equal(await page.locator(".nearby-alerts").count(), 0);
  assert.equal(
    await page.getByLabel("Rayon des matchs ouverts", { exact: true }).isDisabled(),
    true,
  );
  await page.getByRole("button", { name: "J’organise", exact: true }).click();
  assert.equal(await page.getByLabel("Rayon des matchs ouverts", { exact: true }).count(), 0);
  await page.getByRole("button", { name: "À proximité", exact: true }).click();
  assert.equal(await page.locator(".event-premium").count(), 1);
  assert.equal(await page.locator(".match-card,.nearby-alerts").count(), 0);
  await page.locator(".event-premium a").click();
  await page.getByRole("button", { name: "Essayer Premium dans la démo", exact: true }).click();
  await page.getByRole("button", { name: "Activer Premium dans la démo", exact: true }).click();
  await page.getByRole("dialog").waitFor({ state: "hidden" });
  await nav("/reseau");
  for (const name of ["United Sport", "Académie du Nord"]) {
    await page.getByRole("searchbox").fill(name);
    await page.getByRole("button", { name: "Rechercher des membres", exact: true }).click();
    await page
      .locator(".community-results .member-card")
      .filter({ hasText: name })
      .getByRole("button", { name: "Suivre", exact: true })
      .click();
  }
  await nav("/accueil");
  await page.getByRole("button", { name: "Filtrer le fil", exact: true }).click();
  await page.getByLabel("Catégorie du fil").selectOption("Opportunités");
  await page.getByLabel("Type d’opportunité").selectOption("Recrutement de joueurs");
  assert.equal(await page.locator(".post-card").count(), 1);
  assert.match(await page.locator(".post-card").innerText(), /attaquant/);
  await page.getByLabel("Catégorie du fil").selectOption("Offres d’emploi");
  assert.equal(await page.locator(".post-card").count(), 1);
  await page.getByLabel("Catégorie du fil").selectOption("Matchs ouverts");
  assert.equal(await page.locator(".post-card").count(), 0);
  assert.ok((await page.locator(".match-card").count()) > 0);
  await page.getByRole("button", { name: "Réinitialiser les filtres", exact: true }).click();
  await page.locator(".compose-launch").click();
  await page
    .getByLabel("Votre publication", { exact: true })
    .fill("Publication programmée de test");
  await page.getByLabel("Catégorie", { exact: true }).selectOption("Opportunités");
  await page.getByLabel("Discipline", { exact: true }).selectOption("-");
  await page.getByLabel("Type d’opportunité", { exact: true }).selectOption("Essais et détections");
  await page
    .getByLabel("Importer une photo ou une vidéo", { exact: true })
    .setInputFiles("public/images/tennis-color.webp");
  await page.getByAltText("Aperçu de la photo à publier").waitFor();
  await page.getByLabel("Programmer cette publication").check();
  assert.equal(await page.locator(".schedule-premium-badge,.schedule-premium-notice").count(), 0);
  await page.getByLabel("Date et heure (heure locale)").fill("2000-01-01T12:00");
  await page.getByRole("button", { name: "Programmer", exact: true }).click();
  assert.match(await page.getByRole("dialog").innerText(), /futures/);
  const date = new Date(Date.now() + 3600000);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  await page.getByLabel("Date et heure (heure locale)").fill(date.toISOString().slice(0, 16));
  await page.screenshot({ path: "/tmp/op-community-schedule.png", fullPage: true });
  await page.getByRole("button", { name: "Programmer", exact: true }).click();
  await page.getByRole("dialog").waitFor({ state: "hidden" });
  assert.equal(await page.getByRole("dialog").count(), 0);
  assert.equal(
    await page.locator(".post-card").filter({ hasText: "Publication programmée de test" }).count(),
    0,
  );
  await page.locator(".community-planned").click();
  await page.getByRole("button", { name: "Simuler l’arrivée de cette date" }).click();
  await nav("/accueil");
  const published = page
    .locator(".post-card")
    .filter({ hasText: "Publication programmée de test" });
  assert.equal(await published.count(), 1);
  assert.equal(await published.locator(".post-sport").innerText(), "-");
  assert.match(await published.innerText(), /Essais et détections/);
  assert.match(await published.locator(".post-image").getAttribute("src"), /^blob:/);
  assert.equal(
    await published.locator(".post-image").evaluate((el) => el.complete && el.naturalWidth > 0),
    true,
  );
  await page.screenshot({ path: "/tmp/op-community-premium-home.png", fullPage: true });
  await nav("/reseau");
  await page.getByRole("button", { name: "Affiner la recherche", exact: true }).click();
  assert.equal(await page.locator(".member-search-premium").count(), 0);
  assert.equal(await page.getByLabel("Filtrer par pays").isDisabled(), false);
  await page.getByLabel("Filtrer par pays").fill("Belgique");
  await page.getByLabel("Filtrer par ville").fill("Bruxelles");
  await page.getByLabel("Filtrer par sport").selectOption("Tennis");
  await page.getByLabel("Filtrer par classement").fill("C15.2");
  assert.equal(await page.locator(".community-results .member-card").count(), 1);
  assert.match(await page.locator(".community-results").innerText(), /Léa Moreau/);
  await page.screenshot({ path: "/tmp/op-community-premium-network.png", fullPage: true });
  await page.locator('.network-sections a[href="/jouer"]').click();
  await page.getByRole("button", { name: "À proximité", exact: true }).click();
  await page.getByLabel("Rayon des matchs ouverts", { exact: true }).selectOption("200");
  await page.locator(".nearby-alerts summary").click();
  await page.getByLabel("Nom de l’alerte").fill("Mes matchs proches");
  await page.getByRole("button", { name: "Créer l’alerte", exact: true }).click();
  assert.match(
    await page.locator(".community-alert-item").innerText(),
    /Mes matchs proches.*200 km/,
  );
  await page.screenshot({ path: "/tmp/op-community-nearby.png", fullPage: true });
  for (const width of [320, 390, 480, 900]) {
    await page.setViewportSize({ width, height: 844 });
    const overflow = await page.evaluate(() =>
      [...document.querySelectorAll("main *")]
        .filter((e) => e.getBoundingClientRect().right > innerWidth + 1)
        .map((e) => ({
          tag: e.tagName,
          class: e.className,
          width: e.getBoundingClientRect().width,
          right: e.getBoundingClientRect().right,
        })),
    );
    assert.ok(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      `overflow nearby ${width}: ${JSON.stringify(overflow)}`,
    );
  }
  await page.getByLabel("Langue / Language").selectOption("en");
  await nav("/reseau");
  assert.equal(await page.getByRole("heading", { name: "People you may know" }).count(), 1);
  await page.screenshot({ path: "/tmp/op-community-network-en.png", fullPage: true });
  await nav("/accueil");
  assert.equal(await page.getByRole("heading", { name: "Your community feed" }).count(), 1);
  assert.deepEqual(errors, []);
  console.log(
    "PASS: free/Premium feed, categories, invitations, search, scheduling, nearby access, alerts and mobile layouts.",
  );
} catch (error) {
  await page.screenshot({ path: "/tmp/op-community-test-failure.png", fullPage: true });
  throw error;
} finally {
  await browser.close();
}
