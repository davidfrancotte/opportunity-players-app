import { chromium } from "/Users/davidfrancotte/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import assert from "node:assert/strict";
const browser = await chromium.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const choose = (file) =>
  page.getByLabel("Importer une photo ou une vidéo", { exact: true }).setInputFiles(file);
const open = () => page.locator(".compose-launch").click();
const close = async () => {
  await page.getByLabel("Fermer la fenêtre").click();
  await page.getByRole("dialog").waitFor({ state: "hidden" });
};
const publish = async () => {
  await page.getByRole("button", { name: "Publier dans la démo", exact: true }).press("Enter");
  await page.getByRole("dialog").waitFor({ state: "hidden" });
};
const video = process.argv[2];
assert.ok(video, "Pass a playable MP4 fixture path.");
try {
  await page.goto("http://127.0.0.1:3002/accueil", { waitUntil: "networkidle" });
  await open();
  assert.equal(await page.getByLabel("Discipline", { exact: true }).inputValue(), "-");
  assert.equal(await page.locator("#post-photo").count(), 0);
  const chooser = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "Importer une photo ou une vidéo", exact: true }).click();
  await (await chooser).setFiles("public/images/padel-color.webp");
  await page.getByAltText("Aperçu de la photo à publier").waitFor();
  await page.getByRole("button", { name: "Retirer le média", exact: true }).click();
  assert.equal(await page.locator(".post-attachment-preview").count(), 0);
  await choose({ name: "broken.png", mimeType: "image/png", buffer: Buffer.from("not an image") });
  await page.getByText("Fichier illisible.", { exact: false }).waitFor();
  await page.getByRole("button", { name: "Continuer sans média" }).click();
  await choose({ name: "bad.svg", mimeType: "image/svg+xml", buffer: Buffer.from("<svg/>") });
  assert.match(await page.getByRole("alert").innerText(), /SVG/);
  await choose("public/images/padel-color.webp");
  await page.getByAltText("Aperçu de la photo à publier").waitFor();
  await page.getByLabel("Votre publication", { exact: true }).fill("Photo importée dans le fil");
  await publish();
  const photoPost = page.locator(".post-card").filter({ hasText: "Photo importée dans le fil" });
  assert.equal(
    await photoPost.locator("img.post-image").evaluate((el) => el.complete && el.naturalWidth > 0),
    true,
  );
  await photoPost.locator(".post-open").click();
  assert.equal(
    await page
      .getByRole("dialog")
      .locator("img.post-image")
      .evaluate((el) => el.complete && el.naturalWidth > 0),
    true,
  );
  await close();
  await open();
  assert.equal(await page.getByLabel("Discipline", { exact: true }).inputValue(), "-");
  await choose(video);
  await page.getByLabel("Aperçu de la vidéo à publier").waitFor();
  await page.getByLabel("Votre publication", { exact: true }).fill("Vidéo importée dans le fil");
  await page
    .getByRole("dialog")
    .screenshot({ path: "/tmp/op-post-video-upload.png", animations: "disabled" });
  await publish();
  const videoPost = page.locator(".post-card").filter({ hasText: "Vidéo importée dans le fil" });
  await videoPost.locator("video").evaluate(async (el) => {
    await el.play();
    el.pause();
  });
  await videoPost.locator(".post-open").click();
  await page
    .getByRole("dialog")
    .locator("video")
    .evaluate(async (el) => {
      await el.play();
      el.pause();
    });
  await close();
  await open();
  await choose("public/images/padel-color.webp");
  await page.getByAltText("Aperçu de la photo à publier").waitFor();
  await close();
  await open();
  assert.equal(await page.locator(".post-attachment-preview").count(), 0);
  await close();
  await page.goto("http://127.0.0.1:3002/abonnement?retour=/accueil");
  await page.getByRole("button", { name: "Essayer Premium dans la démo", exact: true }).click();
  await page.getByRole("button", { name: "Activer Premium dans la démo", exact: true }).click();
  await page.getByRole("dialog").waitFor({ state: "hidden" });
  await page.locator('.bottom-nav a[href="/accueil"]').press("Enter");
  await open();
  await choose(video);
  await page.getByLabel("Aperçu de la vidéo à publier").waitFor();
  await page.getByLabel("Votre publication", { exact: true }).fill("Vidéo programmée importée");
  await page.getByLabel("Programmer cette publication").check();
  const future = new Date(Date.now() + 3600000);
  future.setMinutes(future.getMinutes() - future.getTimezoneOffset());
  await page.getByLabel("Date et heure (heure locale)").fill(future.toISOString().slice(0, 16));
  await page.getByRole("button", { name: "Programmer", exact: true }).press("Enter");
  await page.getByRole("dialog").waitFor({ state: "hidden" });
  await page.locator(".community-planned").click();
  await page.getByRole("button", { name: "Simuler l’arrivée de cette date" }).click();
  await page.locator('.bottom-nav a[href="/accueil"]').press("Enter");
  await page
    .locator(".post-card")
    .filter({ hasText: "Vidéo programmée importée" })
    .locator("video")
    .evaluate(async (el) => {
      await el.play();
      el.pause();
    });
  assert.deepEqual(errors, []);
  console.log(
    "PASS: default discipline, file picker, image/video previews, removal/cancellation, invalid files, immediate photo/video posts, full posts, scheduled video across navigation.",
  );
} finally {
  await browser.close();
}
