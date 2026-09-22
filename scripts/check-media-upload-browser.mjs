import { chromium } from "/Users/davidfrancotte/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import assert from "node:assert/strict";
import path from "node:path";
const browser = await chromium.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const open = () => page.getByRole("button", { name: "Ajouter un média", exact: true }).click();
const choose = (file) => page.getByLabel("Choisir un média", { exact: true }).setInputFiles(file);
const close = async () => {
  await page.getByLabel("Fermer la fenêtre").click();
  await page.getByRole("dialog").waitFor({ state: "hidden" });
};
const photo = path.resolve("public/images/padel-color.webp");
try {
  await page.goto("http://127.0.0.1:3002/medias", { waitUntil: "networkidle" });
  await open();
  await choose({ name: "unsafe.svg", mimeType: "image/svg+xml", buffer: Buffer.from("<svg/>") });
  assert.match(await page.getByRole("alert").innerText(), /JPG, PNG ou WebP/);
  await choose({ name: "broken.png", mimeType: "image/png", buffer: Buffer.from("not a picture") });
  await page.getByText("Image illisible.", { exact: false }).waitFor();
  await choose(photo);
  await page.getByAltText("Aperçu du média sélectionné").waitFor();
  assert.equal(
    await page.getByRole("button", { name: "Ajouter à ma galerie", exact: true }).isDisabled(),
    true,
  );
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Ajouter à ma galerie", exact: true }).click();
  await page.getByRole("dialog").waitFor({ state: "hidden" });
  assert.equal(await page.locator(".media-grid img").count(), 3);
  assert.equal(
    await page
      .locator('.media-grid img[src^="blob:"]')
      .evaluate((el) => el.complete && el.naturalWidth > 0),
    true,
  );
  await open();
  await choose(photo);
  assert.match(await page.getByRole("alert").innerText(), /3 photos/);
  await close();
  await page.locator('.bottom-nav a[href="/profil"]').click();
  await page.locator('a[href="/medias"]').first().click();
  await page.locator('.media-grid img[src^="blob:"]').waitFor();
  await page.getByRole("button", { name: "Agrandir la photo importée", exact: true }).click();
  await page.getByRole("button", { name: "Retirer de ma galerie", exact: true }).click();
  await page.getByRole("dialog").waitFor({ state: "hidden" });
  assert.equal(await page.locator(".media-grid img").count(), 2);
  await page.locator('a[href="/parametres"]').first().click();
  await page.getByRole("link", { name: "Gérer mon abonnement", exact: true }).click();
  await page.getByRole("button", { name: "Essayer Premium dans la démo", exact: true }).click();
  await page.getByRole("button", { name: "Activer Premium dans la démo", exact: true }).click();
  await page.getByRole("dialog").waitFor({ state: "hidden" });
  await page.locator('.bottom-nav a[href="/profil"]').click();
  await page.locator('a[href="/medias"]').first().click();
  await open();
  await choose(process.argv[2]);
  await page.getByLabel("Aperçu de la vidéo").waitFor();
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Ajouter à ma galerie", exact: true }).click();
  await page.getByRole("dialog").waitFor({ state: "hidden" });
  assert.equal(await page.locator(".profile-video-card video").count(), 1);
  await page.locator(".profile-video-card video").evaluate(async (video) => {
    await video.play();
    video.pause();
  });
  await page.getByRole("button", { name: "Retirer la vidéo", exact: true }).click();
  assert.equal(await page.locator(".profile-video-card video").count(), 0);
  for (const width of [320, 390, 480]) {
    await page.setViewportSize({ width, height: 844 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await open();
  await choose(photo);
  await page.getByAltText("Aperçu du média sélectionné").waitFor();
  await page.screenshot({ path: "/tmp/op-media-upload-preview.png", animations: "disabled" });
  await close();
  assert.equal(await page.locator(".media-grid img").count(), 2);
  assert.deepEqual(errors, []);
  console.log(
    "PASS: upload button, image/video import, preview, consent, invalid files, quota, cancellation, navigation, playback and removal.",
  );
} finally {
  await browser.close();
}
