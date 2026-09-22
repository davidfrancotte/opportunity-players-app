import "./sport-profile.css";
import "./career.css";
import './extensions.css';
import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import './brand-mark.css';
import "./mobile-app.css";
import "./social.css";
import "./subscription.css";
import "./events.css";
import "./trust.css";
import "./community.css";
import "./agenda.css";
import "./appearance.css";
import "./light.css";
import { AppAppearanceProvider } from "@/components/app-appearance";
import { appearanceBootstrap } from "@/lib/appearance";
import { UpgradeGate } from "@/components/subscription-ui";
import { DemoProvider } from "@/components/demo-provider";

const font = DM_Sans({ subsets: ["latin"], variable: "--font-arena", display: "swap" });
const origin =
  process.env.SITE_URL ||
  process.env.DEPLOY_PRIME_URL ||
  process.env.URL ||
  "http://localhost:3000";
export const metadata: Metadata = {
  metadataBase: new URL(origin),
  title: "Arena Studio — Opportunity Players",
  description:
    "Votre sport. Votre réseau. Démo mobile Opportunity Players : fil sportif, réseau, messages, opportunités et profil.",
  robots: { index: false, follow: false },
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "Arena Studio — Opportunity Players",
    description: "Votre sport. Votre réseau. Découvrez la démo de l’app.",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Arena Studio — Opportunity Players",
    images: ["/og.png"],
  },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark" data-theme="dark" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#101214" suppressHydrationWarning />
        <script dangerouslySetInnerHTML={{ __html: appearanceBootstrap }} />
      </head>
      <body className={font.variable}>
        <a href="#main" className="skip-link">
          Aller au contenu
        </a>
        <noscript>
          <p className="no-script">
            Activez JavaScript pour essayer cette démonstration. Les formulaires sont désactivés ;
            ne saisissez pas de données personnelles.
          </p>
        </noscript>
        <AppAppearanceProvider><DemoProvider>
          <div className="mobile-app-frame">{children}</div>
          <UpgradeGate />
        </DemoProvider></AppAppearanceProvider>
      </body>
    </html>
  );
}
