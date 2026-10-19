import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";

const titre = Bricolage_Grotesque({ subsets: ["latin"], weight: ["600", "800"], variable: "--font-titre", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Nawkat — gestion d'atelier de couture", template: "%s · Nawkat" },
  description: "Nawkat : mesures, commandes et suivi client WhatsApp pour les tailleurs du Sénégal.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Nawkat" },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0d4f43",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={titre.variable}>
      <body>{children}</body>
    </html>
  );
}
