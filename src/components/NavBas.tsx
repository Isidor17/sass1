"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IcoAccueil, IcoAtelier, IcoClients, IcoCommandes, IcoPlus } from "./Icones";

const LIENS = [
  { href: "/app", label: "Accueil", Ico: IcoAccueil, exact: true },
  { href: "/app/commandes", label: "Commandes", Ico: IcoCommandes },
  { href: "/app/commandes/nouvelle", label: "Nouvelle", Ico: IcoPlus, plus: true },
  { href: "/app/clients", label: "Clients", Ico: IcoClients },
  { href: "/app/reglages", label: "Atelier", Ico: IcoAtelier },
];

export function NavBas() {
  const chemin = usePathname();
  const actif = (href: string, exact?: boolean) =>
    exact ? chemin === href : chemin === href || (chemin.startsWith(href + "/") && !chemin.startsWith("/app/commandes/nouvelle"));
  return (
    <nav className="bas" aria-label="Navigation">
      {LIENS.map(({ href, label, Ico, exact, plus }) =>
        plus ? (
          <Link key={href} href={href} className="plus" aria-label="Nouvelle commande">
            <span className="plus-rond"><Ico taille={26} /></span>
          </Link>
        ) : (
          <Link key={href} href={href} className={actif(href, exact) ? "on" : ""} aria-current={actif(href, exact) ? "page" : undefined}>
            <Ico />{label}
          </Link>
        ),
      )}
    </nav>
  );
}
