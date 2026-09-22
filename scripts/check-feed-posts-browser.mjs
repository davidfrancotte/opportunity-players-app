import { chromium } from '/Users/davidfrancotte/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
const close = async () => { await page.getByLabel('Fermer la fenêtre').click(); await page.getByRole('dialog').waitFor({ state: 'hidden' }); };
async function checkLines() {
  const entries = await page.locator('.post-excerpt-visible').evaluateAll(nodes => nodes.map(n => ({ height: n.getBoundingClientRect().height, line: parseFloat(getComputedStyle(n).lineHeight), text: n.textContent })));
  assert.ok(entries.length > 0);
  assert.ok(entries.every(e => e.height <= e.line * 3 + 1));
  return entries;
}
try {
  await page.goto('http://127.0.0.1:3002/accueil', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  let entries = await checkLines();
  assert.ok(entries.some(e => e.text.endsWith('.....')));
  const first = page.locator('.post-card').first();
  const excerpt = await first.locator('.post-excerpt-visible').innerText();
  await first.locator('.post-open').press('Enter');
  const dialog = page.getByRole('dialog');
  await dialog.waitFor();
  const full = await dialog.locator('.post-full-text').innerText();
  assert.ok(full.length > excerpt.length);
  assert.ok(full.startsWith(excerpt.slice(0, -5)));
  assert.equal(await dialog.locator('.post-image').count(), 1);
  await dialog.getByRole('button', { name: 'Aimer la publication', exact: true }).click();
  assert.equal(await first.locator('.post-actions button').first().getAttribute('aria-pressed'), 'true');
  await page.screenshot({ path: '/tmp/op-full-post.png', animations: 'disabled' });
  await close();
  for (const width of [320, 390, 480, 900]) { await page.setViewportSize({ width, height: 844 }); await checkLines(); assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)); }
  await page.setViewportSize({ width: 390, height: 844 });
  const text = 'Première ligne.\nDeuxième ligne.\nTroisième ligne.\nQuatrième ligne cachée.\nCinquième ligne complète.';
  await page.locator('.compose-launch').click();
  await page.locator('#post-text').fill(text);
  await page.getByRole('button', { name: 'Publier dans la démo', exact: true }).press('Enter');
  await page.getByRole('dialog').waitFor({ state: 'hidden' });
  await checkLines();
  assert.ok((await first.locator('.post-excerpt-visible').innerText()).endsWith('.....'));
  assert.ok(!(await first.locator('.post-excerpt-visible').innerText()).includes('Quatrième'));
  await first.locator('.post-open').click();
  assert.equal(await page.getByRole('dialog').locator('.post-full-text').innerText(), text);
  await close();
  await page.locator('.compose-launch').click();
  await page.locator('#post-text').fill('Une publication courte.');
  await page.getByRole('button', { name: 'Publier dans la démo', exact: true }).press('Enter');
  await page.getByRole('dialog').waitFor({ state: 'hidden' });
  assert.equal(await first.locator('.post-excerpt-visible').innerText(), 'Une publication courte.');
  await first.getByRole('button', { name: 'Commenter', exact: true }).click();
  assert.equal(await page.getByRole('dialog').locator('.post-full-text').innerText(), 'Une publication courte.');
  await close();
  await page.locator('.feed-list').screenshot({ path: '/tmp/op-feed-excerpts.png', animations: 'disabled' });
  assert.deepEqual(errors, []);
  console.log('PASS: max three lines, five-dot ellipsis, short posts unchanged, full text/image, keyboard opening, likes, comment entry point and mobile widths.');
} finally { await browser.close(); }
