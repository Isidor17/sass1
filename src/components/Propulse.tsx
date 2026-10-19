import Link from "next/link";
import { LogoMarque } from "./Logo";

// Signature discrète des pages publiques (suivi, carnet) : chaque client qui les ouvre découvre la marque.
export function Propulse() {
  return (
    <Link href="/" className="propulse no-print">
      <LogoMarque taille={18} /> <span>Suivi par <b>Nawkat</b></span>
    </Link>
  );
}
