import Link from "next/link";
import { db } from "@/lib/db";
import { atelierConnecte } from "@/lib/session";
import { afficherTelephone } from "@/lib/telephone";
import { Alerte } from "@/components/Alerte";
import { Avatar } from "@/components/Avatar";
import { IcoChevron, IcoPhoto } from "@/components/Icones";

export default async function Clients({ searchParams }: { searchParams: Promise<{ q?: string; importes?: string }> }) {
  const a = await atelierConnecte();
  const { q = "", importes } = await searchParams;
  const recherche = q.trim();
  const chiffres = recherche.replace(/\D/g, "");
  const clients = await db.client.findMany({
    where: {
      atelierId: a.id,
      ...(recherche
        ? { OR: [{ nom: { contains: recherche } }, ...(chiffres.length >= 3 ? [{ telephone: { contains: chiffres } }] : [])] }
        : {}),
    },
    include: { _count: { select: { commandes: true } } },
    orderBy: { nom: "asc" },
    take: 200,
  });

  return (
    <main className="page">
      <div className="entete-page"><h1>Clients</h1><Link className="btn sm" href="/app/clients/nouveau">＋ Client</Link></div>
      {importes && <div style={{ marginTop: 12 }}><Alerte succes={`${importes} client(s) importé(s) depuis le carnet.`} /></div>}
      <Link className="action-photo" href="/app/clients/importer">
        <IcoPhoto /><span>Importer un carnet papier<small>Une photo de page suffit</small></span><IcoChevron />
      </Link>
      <form style={{ margin: "0 0 12px" }}>
        <input name="q" type="search" placeholder="Rechercher un nom ou un numéro" defaultValue={recherche} />
      </form>
      {clients.length === 0 ? (
        <p className="muted">{recherche ? "Aucun client trouvé." : "Pas encore de client. Commencez par en ajouter un."}</p>
      ) : (
        <ul className="list">
          {clients.map((c) => (
            <li key={c.id}>
              <Link href={`/app/clients/${c.id}`} className="card item ligne">
                <Avatar nom={c.nom} />
                <div className="ligne-corps"><b>{c.nom}</b><span className="small muted">{c.telephone ? afficherTelephone(c.telephone) : "Pas de numéro"}</span></div>
                <span className="small muted">{c._count.commandes} cmd</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
