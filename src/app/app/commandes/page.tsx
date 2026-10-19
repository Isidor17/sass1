import Link from "next/link";
import { db } from "@/lib/db";
import { atelierConnecte } from "@/lib/session";
import { joursRestants } from "@/lib/format";
import { LIBELLES, STATUTS, estStatut } from "@/lib/statut";
import { LigneCommande } from "@/components/LigneCommande";

export default async function Commandes({ searchParams }: { searchParams: Promise<{ statut?: string; filtre?: string }> }) {
  const a = await atelierConnecte();
  const { statut, filtre } = await searchParams;
  const s = statut && estStatut(statut) ? statut : null;

  const commandes = await db.commande.findMany({
    where: {
      atelierId: a.id,
      statut: s ?? (filtre === "tout" ? undefined : { in: ["RECU", "EN_COURS", "PRET"] }),
    },
    include: { client: true },
    orderBy: s === "LIVRE" ? { livreLe: "desc" } : { dateLivraison: "asc" },
    take: 300,
  });

  const liste = commandes.filter((c) => {
    const j = joursRestants(c.dateLivraison);
    if (filtre === "retard") return c.statut !== "PRET" && j < 0;
    if (filtre === "semaine") return c.statut !== "PRET" && j >= 0 && j <= 7;
    return true;
  });

  const onglets = [
    { href: "/app/commandes", label: "En cours", on: !s && !filtre },
    { href: "/app/commandes?filtre=retard", label: "En retard", on: filtre === "retard" },
    { href: "/app/commandes?filtre=semaine", label: "Sous 7 j", on: filtre === "semaine" },
    ...STATUTS.map((x) => ({ href: `/app/commandes?statut=${x}`, label: LIBELLES[x], on: s === x })),
  ];

  return (
    <main className="page">
      <div className="entete-page"><h1>Commandes</h1><Link className="btn sm" href="/app/commandes/nouvelle">＋ Commande</Link></div>
      <nav className="tabs">
        {onglets.map((o) => <Link key={o.href} href={o.href} className={o.on ? "on" : ""}>{o.label}</Link>)}
      </nav>
      {liste.length === 0 ? <p className="muted">Aucune commande ici.</p> : (
        <ul className="list">
          {liste.map((c) => <li key={c.id}><LigneCommande c={c} /></li>)}
        </ul>
      )}
    </main>
  );
}
