import { chromium } from "/Users/davidfrancotte/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import assert from "node:assert/strict";
const browser = await chromium.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") console.log("BROWSER:", m.text());
  });
  await page.goto("http://localhost:3002/reseau", { waitUntil: "networkidle" });
  const chips = page.getByRole("group", { name: "Types de membres" });
  await chips.getByRole("button", { name: "Joueurs", exact: true }).click();
  await page.getByLabel("Sport", { exact: true }).selectOption("Football");
  for (const [label, value] of [
    ["pays", "France"],
    ["ville", "lille"],
    ["position", "Gardien"],
  ])
    await page.getByLabel("Filtrer par " + label, { exact: true }).fill(value);
  await page.getByLabel("Filtrer par genre").selectOption("Femme");
  await page.getByLabel("Filtrer par niveau").selectOption("Compétition");
  await page.getByLabel("Filtrer par côté dominant").selectOption("Droite");
  assert.equal(await page.locator(".member-card").count(), 1);
  assert.match(await page.locator(".member-card").innerText(), /Inès Martin/);
  await page.getByLabel("Filtrer par côté dominant").selectOption("Gauche");
  assert.equal(await page.locator(".member-card").count(), 0);
  await page.getByLabel("Filtrer par côté dominant").selectOption("Droite");
  await page.evaluate(() => {
    document.activeElement?.blur();
    scrollTo(0, 0);
  });
  await page.screenshot({ path: "/tmp/arena-network-players.png", fullPage: true });
  await chips.getByRole("button", { name: "Collectives", exact: true }).click();
  assert.equal(await page.getByLabel("Filtrer par genre").count(), 0);
  await page.getByLabel("Filtrer par type de compte").selectOption("Académie");
  assert.match(await page.locator(".member-card").innerText(), /Académie du Nord/);
  assert.equal(await page.getByLabel("Filtrer par type de compte").locator("option").count(), 8);
  await chips.getByRole("button", { name: "Professionnels", exact: true }).click();
  await page.getByLabel("Filtrer par pays").fill("Canada");
  await page.getByLabel("Filtrer par ville").fill("montreal");
  await page.getByLabel("Filtrer par type de compte").selectOption("Entraîneur de gardiens");
  assert.equal(await page.getByLabel("Filtrer par type de compte").locator("option").count(), 27);
  assert.match(await page.locator(".member-card").innerText(), /Camille Roy/);
  for (const width of [320, 390, 430]) {
    await page.setViewportSize({ width, height: 844 });
    assert.ok(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      `overflow ${width}`,
    );
  }
  await page.screenshot({ path: "/tmp/arena-network-professionals.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("http://localhost:3002/modifier-profil", { waitUntil: "networkidle" });
  await page.getByLabel("Type de profil", { exact: true }).selectOption("Sportif");
  await page.getByLabel("Discipline", { exact: true }).selectOption("Football");
  await page.getByLabel("Pays", { exact: true }).fill("France");
  await page.getByLabel("Ville", { exact: true }).fill("Lille");
  await page.getByLabel("Genre", { exact: true }).selectOption("Femme");
  await page.getByLabel("Niveau Football", { exact: true }).selectOption("Compétition");
  await page.getByLabel("Position / poste", { exact: true }).fill("Gardien");
  await page.getByLabel("Pied dominant", { exact: true }).selectOption("Gauche");
  await page.getByLabel("Poids (kg)", { exact: true }).fill("-5");
  await page.getByLabel("Taille (cm)", { exact: true }).fill("180");
  await page.getByRole("button", { name: "Enregistrer", exact: true }).click();
  assert.equal(
    await page.getByLabel("Poids (kg)", { exact: true }).getAttribute("aria-invalid"),
    "true",
  );
  await page.getByLabel("Poids (kg)", { exact: true }).fill("72,5");
  await page.getByRole("button", { name: "Enregistrer", exact: true }).click();
  await page.waitForURL("**/profil");
  assert.match(await page.locator(".trust-profile").innerText(), /Lille · France · Femme/);
  assert.match(await page.locator(".trust-profile").innerText(), /Gardien · Gauche/);
  assert.match(await page.locator(".athlete-profile-facts").innerText(), /72,5 kg/);
  assert.match(await page.locator(".athlete-profile-facts").innerText(), /180 cm/);
  assert.match(await page.locator(".athlete-profile-facts").innerText(), /Gaucher/);
  await page
    .locator(".athlete-profile-facts")
    .screenshot({ path: "/tmp/arena-athlete-measurements.png" });
  await page.getByRole("link", { name: /Modifier mes caractéristiques/ }).click();
  assert.equal(await page.getByLabel("Poids (kg)", { exact: true }).inputValue(), "72.5");
  await page.getByLabel("Poids (kg)", { exact: true }).fill("");
  await page.getByLabel("Taille (cm)", { exact: true }).fill("");
  await page.getByRole("button", { name: "Enregistrer", exact: true }).click();
  await page.waitForURL("**/profil");
  assert.equal(
    await page.locator(".athlete-profile-facts dd").filter({ hasText: "Non renseigné" }).count(),
    2,
  );
  await page
    .locator(".trust-profile")
    .getByRole("link", { name: /Sports, niveaux/ })
    .click();
  await page
    .getByLabel("Sport à ajouter", { exact: true })
    .count()
    .then((n) => console.log("sport selector", n));
  assert.equal(await page.getByLabel("Pied dominant", { exact: true }).inputValue(), "Gauche");
  console.log(
    "Network combined filters, category reset, zero state, mobile widths and edited profile: PASS",
  );

  for (const category of ["Sportif", "Professionnel", "Organisation"]) {
    const p = await browser.newPage({ viewport: { width: 390, height: 844 } });
    p.on("pageerror", (e) => errors.push(e.message));
    p.on("console", (m) => {
      if (m.type() === "error") console.log("BROWSER:", m.text());
    });
    await p.goto("http://localhost:3002/inscription", { waitUntil: "networkidle" });
    await p.getByLabel("Prénom", { exact: true }).fill("Test");
    await p.getByLabel("Nom", { exact: true }).fill("Réseau");
    await p.getByLabel("Adresse e-mail fictive", { exact: true }).fill("directory@demo.example");
    await p.locator("#password").fill("ArenaDemo2026!");
    await p.locator("#policy").check();
    await p.locator("#accuracy").check();
    await p.getByRole("button", { name: "Continuer", exact: true }).click();
    await p.getByLabel("Code de vérification", { exact: true }).fill("246810");
    await p.getByRole("button", { name: "Valider le code démo", exact: true }).click();
    await p.getByLabel("Code d’authentification démo", { exact: true }).fill("135790");
    await p.getByRole("button", { name: "Valider la seconde étape", exact: true }).click();
    await p.getByRole("radio", { name: category, exact: true }).check();
    await p.getByLabel("Votre discipline", { exact: true }).selectOption("Football");
    await p.getByLabel("Ville", { exact: true }).fill("Lille");
    await p.getByLabel("Pays", { exact: true }).fill("France");
    await p.locator("#headline").fill("Un rôle fictif");
    if (category === "Sportif") {
      await p.getByLabel("Genre", { exact: true }).selectOption("Homme");
      await p.getByLabel("Niveau Football", { exact: true }).selectOption("Compétition");
      await p.getByLabel("Position / poste", { exact: true }).fill("Gardien");
      await p.getByLabel("Pied dominant", { exact: true }).selectOption("Ambidextre");
      await p.getByLabel("Poids (kg)", { exact: true }).fill("80,2");
      await p.getByLabel("Taille (cm)", { exact: true }).fill("185");
    } else {
      assert.equal(await p.getByLabel("Genre", { exact: true }).count(), 0);
      assert.equal(await p.getByLabel("Poids (kg)", { exact: true }).count(), 0);
      await p.getByRole("button", { name: "Continuer", exact: true }).click();
      assert.match(await p.locator("body").innerText(), /Choisissez un type de compte/);
      if (category === "Organisation") await p.locator("#organisation").fill("Collectif démo");
      await p
        .getByLabel("Type de compte", { exact: true })
        .selectOption(
          category === "Professionnel"
            ? "Conseiller en placement sportif universitaire"
            : "Sport études",
        );
    }
    assert.ok(
      await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      `onboarding overflow ${category}`,
    );
    await p.evaluate(() => {
      document.activeElement?.blur();
      scrollTo(0, 0);
    });
    await p.screenshot({ path: `/tmp/arena-onboarding-${category}.png`, fullPage: true });
    await p.getByRole("button", { name: "Continuer", exact: true }).click();
    await p.getByRole("button", { name: "Découvrir mon profil", exact: true }).click();
    await p.waitForURL("**/accueil");
    await p
      .getByRole("navigation", { name: "Navigation de l’application" })
      .getByRole("link", { name: "Profil", exact: true })
      .click();
    const summary = await p.locator(".trust-profile").innerText();
    assert.match(summary, /Lille · France/);
    if (category === "Sportif") {
      assert.match(summary, /80,2 kg/);
      assert.match(summary, /185 cm/);
    }
    assert.ok(
      summary.includes(
        category === "Sportif"
          ? "Gardien · Ambidextre"
          : category === "Professionnel"
            ? "Conseiller en placement sportif universitaire"
            : "Sport études",
      ),
    );
    console.log(`Onboarding ${category}: PASS`);
    await p.close();
  }
  assert.deepEqual(errors, []);
} finally {
  await browser.close();
}
