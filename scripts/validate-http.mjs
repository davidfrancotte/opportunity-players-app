import assert from "node:assert/strict";
import fs from "node:fs";
const base = process.argv[2] || "http://localhost:3000";
const routes = [
  "/",
  "/accueil",
  "/reseau",
  "/messages",
  "/opportunities",
  "/abonnement",
  "/inscription",
  "/verification",
  "/personnalisation",
  "/presentation",
  "/connexion",
  "/mot-de-passe-oublie",
  "/profil",
  "/parcours",
  "/medias",
  "/modifier-profil",
  "/parametres",
];
const resources = new Set();
for (const route of routes) {
  const response = await fetch(base + route);
  assert.equal(response.status, 200, route);
  const html = await response.text();
  assert.ok(html.includes('id="main"'), route + ": landmark");
  assert.ok(html.includes('lang="fr"'), route + ": French");
  assert.match(html, /<title>[^<]*Arena Studio[^<]*<\/title>/);
  assert.ok(html.includes("noindex"), route + ": preview not indexed");
  assert.ok(html.includes("viewport-fit=cover"), route + ": smartphone safe area");
  assert.ok(html.includes('class="mobile-app-frame"'), route + ": mobile app frame");
  const nav = html.match(/<nav class="bottom-nav"[^>]*>(.*?)<\/nav>/s);
  const appRoutes = [
    "/abonnement",
    "/accueil",
    "/reseau",
    "/messages",
    "/opportunities",
    "/profil",
    "/parcours",
    "/medias",
    "/modifier-profil",
    "/parametres",
  ];
  if (appRoutes.includes(route)) {
    assert.ok(nav, route + ": fixed navigation");
    assert.equal([...nav[1].matchAll(/<a /g)].length, 5);
    for (const href of ["/accueil", "/reseau", "/messages", "/opportunities", "/profil"])
      assert.ok(nav[1].includes(`href="${href}"`), route + ": " + href);
    const active = [...nav[1].matchAll(/<a [^>]*aria-current="page"[^>]*>/g)];
    assert.equal(active.length, 1, route + ": one active destination");
    const expected = [
      "/modifier-profil",
      "/parcours",
      "/medias",
      "/parametres",
      "/abonnement",
    ].includes(route)
      ? "/profil"
      : route;
    assert.ok(active[0][0].includes(`href="${expected}"`));
  } else assert.equal(nav, null, route + ": onboarding without profile navigation");
  if (["/parcours", "/medias"].includes(route)) {
    assert.ok(
      !html.includes('class="identity-card"'),
      route + ": dedicated screen, no repeated hero",
    );
    assert.ok(
      html.includes(route === "/parcours" ? "Chaque étape compte." : "Votre sport en images."),
    );
  }
  for (const m of html.matchAll(/(?:src|href)="(\/(?:images\/|_next\/static\/)[^"<>]+)"/g))
    resources.add(m[1].replaceAll("&amp;", "&"));
  for (const m of html.matchAll(/href="(\/[^"?#]*)/g)) {
    const href = m[1];
    if (
      href.startsWith("/_next/") ||
      href.startsWith("/images/") ||
      href === "/favicon.svg" ||
      href === "/og.png"
    )
      continue;
    assert.ok(routes.includes(href), `${route}: link ${href}`);
  }
  if (route === "/inscription") {
    assert.match(
      html,
      /<button[^>]*type="submit"[^>]*disabled/,
      "demo form disabled before hydration",
    );
    for (const token of ["given-name", "family-name", "email", "new-password"])
      assert.ok(
        html.includes(`autoComplete="${token}"`) || html.includes(`autocomplete="${token}"`),
        token,
      );
  }
  if (route === "/profil") {
    assert.ok(html.includes("Alex Dupont"));
    assert.ok(html.includes("À propos"));
    assert.ok(html.includes("CV sportif"));
    assert.ok(html.includes("DÉMO INTERACTIVE"));
  }
  const socialContent = {
    "/abonnement": [
      "14,99",
      "2,99",
      "29,99",
      "Essayer Premium dans la démo",
      "Ce qui change",
      "Aucun paiement",
    ],
    "/accueil": [
      "Dans le mouvement",
      "Filtrer les publications par sport",
      "Horizon Padel",
      "Commenter",
    ],
    "/reseau": ["Votre réseau", "Collectives", "Suivre", "network-sport"],
    "/messages": ["Conversations simulées", "Nouvelle conversation", "Léa Moreau"],
    "/opportunities": ["Opportunities", "opportunity-sport", "Sponsoring", "Aucune"],
  };
  for (const token of socialContent[route] || [])
    assert.ok(html.toLowerCase().includes(token.toLowerCase()), route + ": " + token);
  if (route === "/messages") {
    assert.ok(
      !html.includes("Votre approche du coaching nous intéresse"),
      "free professional: incoming body not rendered",
    );
    assert.ok(
      !html.includes("J’aimerais découvrir le padel"),
      "free professional: incoming preview not rendered",
    );
    assert.ok(html.includes("Réception des messages réservée à Premium"));
  }
  if (["/verification", "/personnalisation", "/presentation"].includes(route))
    assert.ok(html.includes("Reprenons au bon endroit"), route + ": fresh-visit guard");
  console.log("OK", route);
}
for (const file of fs.readdirSync(new URL("../public/images/", import.meta.url)))
  resources.add("/images/" + file);
resources.add("/og.png");
resources.add("/favicon.svg");
for (const resource of resources) {
  const r = await fetch(base + resource);
  assert.equal(r.status, 200, resource);
}
for (const route of ["/inexistant", "/espace", "/sports", "/api/login"])
  assert.equal((await fetch(base + route)).status, 404, route);
const css = fs.readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
assert.ok(css.includes("prefers-reduced-motion"));
assert.match(css, /@media\s*\(max-width:\s*360px\)/);
const mobileCss = fs.readFileSync(new URL("../app/mobile-app.css", import.meta.url), "utf8");
assert.match(mobileCss, /\.bottom-nav\s*\{[^}]*position:\s*fixed/s);
assert.ok(mobileCss.includes("safe-area-inset-bottom"));
assert.match(mobileCss, /\.save-bar\s*\{[^}]*bottom:\s*var\(--app-nav-height\)/s);
console.log(
  `PASS: ${routes.length} screens; ${resources.size} compiled/image assets; 4 missing/out-of-scope routes; mobile navigation, active destinations, safe areas, metadata, guards, autocomplete, reduced-motion rules. No browser automation.`,
);
