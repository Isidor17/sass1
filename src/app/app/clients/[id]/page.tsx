import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { atelierConnecte, urlApp } from "@/lib/session";
import { lireMesures } from "@/lib/mesures";
import { afficherTelephone } from "@/lib/telephone";
import { dateCourte, fcfa } from "@/lib/format";
import { lienWhatsApp, messageCarnet } from "@/lib/whatsapp";
import { AfficherMesures } from "@/components/AfficherMesures";
import { StatutBadge } from "@/components/StatutBadge";

export default async function FicheClient({ params }: { params: Promise<{ id: string }> }) {
  const a = await atelierConnecte();
  const { id } = await params;
  const c = await db.client.findFirst({
    where: { id, atelierId: a.id },
    include: { mesures: { orderBy: { createdAt: "desc" } }, commandes: { orderBy: { createdAt: "desc" } } },
  });
  if (!c) notFound();
  const derniere = c.mesures[0];
  const lienCarnet = `${urlApp()}/carnet/${c.carnetToken}`;

  return (
    <main className="page">
      <div className="row between">
        <h1>{c.nom}</h1>
        <Link className="btn ghost sm" href={`/app/clients/${c.id}/modifier`}>Modifier</Link>
      </div>
      <p className="muted small">{c.telephone ? afficherTelephone(c.telephone) : "Pas de numéro"} · {c.genre === "H" ? "Homme" : "Femme"}</p>
      {c.notes && <p className="small">{c.notes}</p>}

      <div className="row wrap" style={{ margin: "12px 0" }}>
        <Link className="btn" href={`/app/commandes/nouvelle?client=${c.id}`}>＋ Commande</Link>
        {c.telephone && (
          <a className="btn wa" href={lienWhatsApp(c.telephone, messageCarnet({ atelier: a.nom, client: c.nom, lienCarnet }))} target="_blank" rel="noreferrer">
            Envoyer son carnet
          </a>
        )}
      </div>

      <div className="row between"><h2>Mesures</h2><Link className="small" href={`/app/clients/${c.id}/mesures`}>Nouvelles mesures</Link></div>
      <div className="card">
        {derniere && <p className="small muted">Prises le {dateCourte(derniere.createdAt)}{derniere.note ? ` · ${derniere.note}` : ""}</p>}
        <AfficherMesures valeurs={lireMesures(derniere?.valeurs)} genre={c.genre} />
      </div>
      {c.mesures.length > 1 && <p className="small muted">{c.mesures.length - 1} ancienne(s) prise(s) de mesures conservée(s).</p>}

      <h2>Commandes</h2>
      {c.commandes.length === 0 ? <p className="muted">Aucune commande.</p> : (
        <ul className="list">
          {c.commandes.map((o) => (
            <li key={o.id}>
              <Link className="card item" href={`/app/commandes/${o.id}`}>
                <div className="row between"><b>{o.modele}</b><StatutBadge statut={o.statut} /></div>
                <div className="small muted">{dateCourte(o.dateLivraison)} · {fcfa(o.prix)}</div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
