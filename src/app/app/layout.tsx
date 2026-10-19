import Link from "next/link";
import { atelierConnecte } from "@/lib/session";
import { LogoMarque } from "@/components/Logo";
import { NavBas } from "@/components/NavBas";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const a = await atelierConnecte();
  return (
    <>
      <header className="app-entete">
        <div className="app-entete-int">
          <Link href="/app" className="app-marque"><LogoMarque taille={28} /><span>Nawkat</span></Link>
          <Link href="/app/reglages" className="app-atelier">{a.nom}</Link>
        </div>
      </header>
      {children}
      <NavBas />
    </>
  );
}
