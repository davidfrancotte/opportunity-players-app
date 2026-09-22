import { chromium } from '/Users/davidfrancotte/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
try {
  await page.goto('http://127.0.0.1:3002/opportunities', { waitUntil: 'networkidle' });
  assert.equal(await page.locator('.career-nav').count(), 0);
  const filters = page.getByRole('group', { name: 'Types d’opportunités' });
  assert.deepEqual(await filters.getByRole('button').allTextContents(), ['Toutes', 'Coaching', 'Recrutement', 'Partenariat', 'Sponsoring', 'Essais groupés']);
  assert.equal(await page.locator('.opportunity-card').count(), 4);
  await filters.getByRole('button', { name: 'Essais groupés', exact: true }).click();
  assert.equal(await page.locator('.opportunity-card').count(), 1);
  assert.match(await page.locator('.opportunity-card').innerText(), /Essai groupé/);
  await page.locator('#opportunity-sport').selectOption('Tennis');
  assert.equal(await page.locator('.opportunity-card').count(), 0);
  await page.locator('#opportunity-sport').selectOption('Basketball');
  assert.equal(await page.locator('.opportunity-card').count(), 1);
  await page.locator('.save-opportunity').click();
  await page.getByRole('button', { name: /Voir les favoris/ }).click();
  assert.equal(await page.locator('.opportunity-card').count(), 1);
  await page.getByRole('button', { name: /Voir l’opportunité/ }).click();
  await page.getByRole('dialog').waitFor();
  assert.match(await page.getByRole('dialog').innerText(), /Essai collectif/);
  await page.getByLabel('Fermer la fenêtre').click();
  await page.getByRole('dialog').waitFor({ state: 'hidden' });
  await page.getByRole('button', { name: /Voir les favoris/ }).click();
  await page.locator('#opportunity-sport').selectOption('Tous');
  await filters.getByRole('button', { name: 'Toutes', exact: true }).click();
  assert.equal(await page.locator('.opportunity-card').count(), 4);
  for (const width of [320, 390, 480, 900]) {
    await page.setViewportSize({ width, height: 844 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `overflow at ${width}`);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({ path: '/tmp/op-opportunities-simplified.png' });
  assert.deepEqual(errors, []);
  console.log('PASS: six filters only, group trials, sport, favorites, detail modal and responsive layout.');
} finally { await browser.close(); }
