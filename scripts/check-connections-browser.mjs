import { chromium } from '/Users/davidfrancotte/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
async function nav(href) { await page.locator(`.bottom-nav a[href="${href}"]`).press('Enter'); await page.waitForURL(`**${href}`); }
async function member(name) {
  await nav('/reseau');
  await page.getByRole('searchbox').fill(name);
  await page.getByRole('button', { name: 'Rechercher des membres', exact: true }).click();
  await page.locator('.community-results .member-card').filter({ hasText: name }).locator('.member-intro').click();
  await page.getByRole('dialog').waitFor();
}
async function close() { await page.getByLabel('Fermer la fenêtre').click(); await page.getByRole('dialog').waitFor({ state: 'hidden' }); }
try {
  await page.goto('http://127.0.0.1:3002/accueil', { waitUntil: 'networkidle' });
  assert.equal(await page.locator('.post-card').count(), 1);
  await member('United Sport');
  const dialog = page.getByRole('dialog');
  assert.equal(await dialog.getByRole('button', { name: 'Connect', exact: true }).count(), 1);
  assert.equal(await dialog.getByRole('link', { name: 'Inviter à jouer', exact: true }).count(), 0);
  await dialog.getByRole('button', { name: 'Suivre', exact: true }).click();
  for (const width of [320, 390, 480, 900]) {
    await page.setViewportSize({ width, height: 844 });
    const actions = dialog.locator('.member-relationship-actions');
    await actions.scrollIntoViewIfNeeded();
    const connect = await actions.getByRole('button', { name: 'Connect', exact: true }).boundingBox();
    const unfollow = await actions.getByRole('button', { name: 'Ne plus suivre', exact: true }).boundingBox();
    const row = await actions.boundingBox();
    assert.ok(Math.abs(connect.y - unfollow.y) < 2, `same row at ${width}px`);
    assert.ok(unfollow.x >= connect.x + connect.width + 10, `spaced at ${width}px`);
    assert.ok(Math.abs(unfollow.x + unfollow.width - row.x - row.width) < 2, 'right aligned');
    assert.ok(unfollow.height >= 44);
    if (width === 390) await actions.screenshot({ path: '/tmp/op-member-actions.png', animations: 'disabled' });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await close(); await nav('/accueil');
  assert.equal(await page.locator('.post-card').count(), 2);
  assert.match(await page.locator('.feed-list').innerText(), /attaquant/);
  await member('United Sport');
  await dialog.getByRole('button', { name: 'Connect', exact: true }).click();
  assert.equal(await dialog.locator('.connection-status').count(), 0);
  assert.equal(await dialog.getByRole('link', { name: 'Inviter à jouer', exact: true }).count(), 0);
  await dialog.locator('.connection-demo summary').click();
  await dialog.getByRole('button', { name: 'Simuler : refuse', exact: true }).click();
  assert.equal(await dialog.getByRole('button', { name: 'Connect', exact: true }).count(), 1);
  await dialog.getByRole('button', { name: 'Connect', exact: true }).click();
  await dialog.getByRole('button', { name: 'Retirer la demande', exact: true }).click();
  await dialog.getByRole('button', { name: 'Connect', exact: true }).click();
  await close();
  assert.match(await page.locator('.connection-sent summary').innerText(), /1/);
  await member('United Sport');
  await dialog.locator('.connection-demo summary').click();
  await dialog.getByRole('button', { name: 'Simuler : accepte', exact: true }).click();
  assert.match(await dialog.locator('.connection-status').innerText(), /Connectés/);
  await dialog.screenshot({ path: '/tmp/op-connected-profile.png', animations: 'disabled' });
  await dialog.getByRole('button', { name: 'Écrire librement', exact: true }).click();
  await page.waitForURL('**/messages');
  await page.getByLabel('Votre message fictif', { exact: true }).fill('Bonjour, partant pour un match ?');
  await page.getByRole('button', { name: 'Ajouter le message à la démo', exact: true }).press('Enter');
  assert.match(await page.getByRole('log').innerText(), /partant pour un match/);
  assert.match(await page.locator('.plan-status').innerText(), /Gratuit/);
  assert.equal(await page.locator('.upgrade-modal').count(), 0);
  await member('United Sport');
  await dialog.getByRole('button', { name: 'Ne plus suivre', exact: true }).click();
  assert.equal(await dialog.locator('.connection-status').count(), 1);
  await close(); await nav('/accueil');
  assert.equal(await page.locator('.post-card').count(), 1);
  await member('United Sport');
  await dialog.getByRole('link', { name: 'Inviter à jouer', exact: true }).click();
  await page.waitForURL('**/organiser?invite=united');
  await page.locator('input[name="match-title"]').fill('Match entre connexions');
  await page.locator('input[name="venue"]').fill('Terrain fictif');
  await page.getByRole('button', { name: 'Continuer', exact: true }).press('Enter');
  const day = new Date(Date.now() + 86400000 * 2).toISOString().slice(0,10);
  await page.locator('input[type="date"]').fill(day);
  await page.getByRole('button', { name: 'Continuer', exact: true }).press('Enter');
  assert.equal(await page.locator('.invite-list input').count(), 1);
  assert.equal(await page.locator('.invite-list input').isChecked(), true);
  assert.match(await page.locator('.invite-list').innerText(), /United Sport/);
  await page.getByRole('button', { name: 'Créer et inviter', exact: true }).press('Enter');
  await page.waitForURL('**/match?id=*');
  assert.match(await page.locator('h1').innerText(), /Match entre connexions/);
  await nav('/reseau');
  await page.locator('.community-invitation').first().getByRole('button', { name: 'Accepter', exact: true }).click();
  await member('Léa Moreau');
  assert.equal(await dialog.locator('.connection-status').count(), 1);
  for (const width of [320, 390, 480]) { await page.setViewportSize({ width, height: 844 }); assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)); }
  assert.deepEqual(errors, []);
  console.log('PASS: follow-only feed, pending/refused/cancelled/accepted connections, recipient consent simulation, incoming acceptance, free messages, unfollow without disconnect, connected-only match creation.');
} finally { await browser.close(); }
