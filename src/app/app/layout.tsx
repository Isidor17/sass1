import Link from "next/link";
import { atelierConnecte } from "@/lib/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await atelierConnecte();
  return (
    <>
      {children}
      <nav className="bas" aria-label="Navigation">
        <Link href="/app"><b>⌂</b>Accueil</Link>
        <Link href="/app/commandes"><b>☰</b>Commandes</Link>
        <Link href="/app/commandes/nouvelle" className="plus"><b>＋</b>Nouvelle</Link>
        <Link href="/app/clients"><b>☺</b>Clients</Link>
        <Link href="/app/reglages"><b>⚙</b>Atelier</Link>
      </nav>
    </>
  );
}
