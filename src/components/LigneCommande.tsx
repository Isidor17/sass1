import Link from "next/link";
import { Avatar } from "./Avatar";
import { Echeance } from "./Echeance";
import { StatutBadge } from "./StatutBadge";

type Cmd = { id: string; modele: string; quantite: number; statut: string; dateLivraison: Date; client: { nom: string } };

export function LigneCommande({ c }: { c: Cmd }) {
  return (
    <Link href={`/app/commandes/${c.id}`} className="card item ligne">
      <Avatar nom={c.client.nom} />
      <div className="ligne-corps">
        <b>{c.client.nom}</b>
        <div className="small">{c.modele}{c.quantite > 1 ? ` ×${c.quantite}` : ""}</div>
        <div className="small"><Echeance date={c.dateLivraison} statut={c.statut} /></div>
      </div>
      <StatutBadge statut={c.statut} />
    </Link>
  );
}
