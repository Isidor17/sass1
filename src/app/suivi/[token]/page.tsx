import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { dateCourte, fcfa } from "@/lib/format";
import { LIBELLES, STATUTS } from "@/lib/statut";
import { afficherTelephone } from "@/lib/telephone";

export const metadata: Metadata = { title: "Suivi de commande", robots: { index: false } };

// Page publique : le client suit sa tenue sans compte. Le jeton est non devinable.
export default async function Suivi({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const c = await db.commande.findUnique({
    where: { suiviToken: token },
    include: { atelier: true, client: true, paiements: true },
  });
  if (!c) notFound();
  const paye = c.paiements.reduce((s, p) => s + p.montant, 0);
  const etape = STATUTS.indexOf(c.statut as (typeof STATUTS)[number]);

  return (
    <main className="page">
      <p className="muted small">{c.atelier.nom}{c.atelier.quartier ? ` · ${c.atelier.quartier}` : ""}</p>
      <h1>Bonjour {c.client.nom.split(" ")[0]}</h1>
      <p>Votre commande : <b>{c.modele}</b>{c.quantite > 1 ? ` (×${c.quantite})` : ""}</p>

      <div className="card stack" style={{ marginTop: 16 }}>
        {STATUTS.map((s, i) => (
          <div key={s} className="row">
            <span className={`badge ${i <= etape ? `s-${s}` : ""}`} style={{ minWidth: 28, textAlign: "center" }}>{i <= etape ? "✓" : i + 1}</span>
            <span className={i <= etape ? "" : "muted"}>{LIBELLES[s]}</span>
          </div>
        ))}
      </div>

      <div className="card stack" style={{ marginTop: 12 }}>
        <div className="row between"><span>Livraison prévue</span><b>{dateCourte(c.dateLivraison)}</b></div>
        {c.prix > 0 && (
          <>
            <div className="row between"><span>Prix</span><span>{fcfa(c.prix)}</span></div>
            <div className="row between"><span>Déjà payé</span><span>{fcfa(paye)}</span></div>
            <div className="row between"><span>Reste</span><b>{fcfa(Math.max(0, c.prix - paye))}</b></div>
          </>
        )}
      </div>

      <a className="btn ghost block" style={{ marginTop: 16 }} href={`https://wa.me/${c.atelier.telephone}`}>Contacter l&apos;atelier · {afficherTelephone(c.atelier.telephone)}</a>
      <p className="small muted" style={{ marginTop: 16 }}>Vos mesures sont enregistrées : plus besoin de les reprendre à la prochaine commande.</p>
    </main>
  );
}
