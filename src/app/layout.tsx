import type { Metadata, Viewport } from "next";
import "./globals.css";

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
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
