import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";

const titre = Bricolage_Grotesque({ subsets: ["latin"], weight: ["600", "800"], variable: "--font-titre", display: "swap" });

export const metadata: Metadata = {
  title: "Atelier — gestion couture",
  description: "Mesures, commandes et suivi client pour les tailleurs.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Atelier" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f5c4d",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={titre.variable}>
      <body>{children}</body>
    </html>
  );
}
