import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main" className="not-found">
      <p className="eyebrow">HORS TERRAIN / 404</p>
      <h1>Cette page n’existe pas.</h1>
      <p>Retrouvez votre chemin vers la démo Arena Studio.</p>
      <Link className="action primary" href="/">
        Retour à l’accueil
      </Link>
    </main>
  );
}
