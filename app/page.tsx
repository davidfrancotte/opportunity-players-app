import Link from "next/link";
import { ArrowUpRight, ArrowRight } from "lucide-react";
export default function Welcome() {
  return (
    <main id="main" className="welcome-screen">
      <header className="app-header">
        <Link href="/" className="brand" aria-label="Opportunity Players — accueil">
          op<i className="op-angle" aria-hidden="true" />
          <small>Opportunity Players</small>
        </Link>
        <span className="demo-pill">
          <i /> DÉMO INTERACTIVE
        </span>
      </header>
      <section className="welcome-grid">
        <div className="welcome-copy">
          <p className="eyebrow">DES TALENTS AUX OPPORTUNITÉS</p>
          <h1>
            Votre sport.
            <br />
            Votre réseau<span className="lime">.</span>
          </h1>
          <p className="lede">
            Votre parcours mérite les bonnes rencontres.
            <br />
            Faites le premier pas.
          </p>
          <div className="welcome-actions">
            <Link href="/inscription" className="primary action">
              Créer un compte gratuit <ArrowRight size={20} />
            </Link>
            <Link href="/connexion" className="secondary action">
              Se connecter <ArrowUpRight size={20} />
            </Link>
            <Link href="/accueil" className="text-link">
              Explorer l’app de démonstration <ArrowRight size={15} />
            </Link>
          </div>
          <p className="disclosure">
            Une démo, sans compte réel ni envoi d’e-mail.
            <br />
            Utilisez uniquement des informations fictives.
          </p>
        </div>
        <div className="welcome-photos">
          <figure className="photo-main">
            <img
              src="/images/coach.webp"
              alt="Joueur de padel fictif, illustration du réseau sportif"
            />
            <figcaption>
              UNE PASSION.
              <br />
              DES POSSIBILITÉS.
            </figcaption>
          </figure>
          <figure className="photo-strip">
            <img src="/images/tennis-color.webp" alt="Joueuse de tennis fictive" />
            <span>
              LE SPORT
              <br />
              NOUS RÉUNIT <ArrowUpRight />
            </span>
          </figure>
        </div>
      </section>
      <footer className="welcome-footer">
        <span>ARENA STUDIO / 01</span>
        <span>SPORT. PEOPLE. OPPORTUNITIES.</span>
      </footer>
    </main>
  );
}
