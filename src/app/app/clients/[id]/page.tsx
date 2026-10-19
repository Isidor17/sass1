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
import { Alerte } from "@/components/Alerte";
import { QrCode } from "@/components/QrCode";
import { Avatar } from "@/components/Avatar";
import { IcoWhatsApp } from "@/components/Icones";

export default async function FicheClient({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ importe?: string }> }) {
  const a = await atelierConnecte();
  const { id } = await params;
  const { importe } = await searchParams;
  const c = await db.client.findFirst({
    where: { id, atelierId: a.id },
    include: { mesures: { orderBy: { createdAt: "desc" } }, commandes: { orderBy: { createdAt: "desc" } } },
  });
  if (!c) notFound();
  const derniere = c.mesures[0];
  const lienCarnet = `${urlApp()}/carnet/${c.carnetToken}`;

  return (
    <main className="page">
      {importe && <Alerte succes="Client importé avec ses mesures depuis son carnet." />}
      <div className="fiche-entete">
        <Avatar nom={c.nom} />
        <div className="ligne-corps">
          <h1>{c.nom}</h1>
          <p className="muted small">{c.telephone ? afficherTelephone(c.telephone) : "Pas de numéro"} · {c.genre === "H" ? "Homme" : "Femme"}</p>
        </div>
        <Link className="btn ghost sm" href={`/app/clients/${c.id}/modifier`}>Modifier</Link>
      </div>
      {c.notes && <p className="small">{c.notes}</p>}

      <div className="grid2" style={{ margin: "14px 0" }}>
        <Link className="btn" href={`/app/commandes/nouvelle?client=${c.id}`}>＋ Commande</Link>
        {c.telephone && (
          <a className="btn wa" href={lienWhatsApp(c.telephone, messageCarnet({ atelier: a.nom, client: c.nom, lienCarnet }))} target="_blank" rel="noreferrer">
            <IcoWhatsApp taille={20} /> Son carnet
          </a>
        )}
      </div>

      <div className="row between"><h2>Mesures</h2><Link className="small" href={`/app/clients/${c.id}/mesures`}>Nouvelles mesures</Link></div>
      <div className="card">
        {derniere && <p className="small muted">Prises le {dateCourte(derniere.createdAt)}{derniere.note ? ` · ${derniere.note}` : ""}</p>}
        <AfficherMesures valeurs={lireMesures(derniere?.valeurs)} genre={c.genre} />
      </div>
      {c.mesures.length > 1 && <p className="small muted">{c.mesures.length - 1} ancienne(s) prise(s) de mesures conservée(s).</p>}

      <details className="card" style={{ marginTop: 16 }}>
        <summary>QR code du carnet</summary>
        <p className="small muted">Le client le scanne pour garder ses mesures, ou le montre à un autre tailleur.</p>
        <QrCode url={lienCarnet} legende={c.nom} />
        <p className="small" style={{ textAlign: "center" }}><a href={lienCarnet} target="_blank" rel="noreferrer">Ouvrir / imprimer le carnet</a></p>
      </details>

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
