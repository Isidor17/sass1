import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { dateCourte } from "@/lib/format";
import { lireMesures } from "@/lib/mesures";
import { AfficherMesures } from "@/components/AfficherMesures";
import { Imprimer } from "@/components/Imprimer";

export const metadata: Metadata = { title: "Mon carnet de mesures", robots: { index: false } };

// Carnet de mesures portable : le client garde ce lien et peut le montrer à n'importe quel tailleur.
// C'est la base du futur effet de réseau (un client fait venir son prochain tailleur sur la plateforme).
export default async function Carnet({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const c = await db.client.findUnique({
    where: { carnetToken: token },
    include: { atelier: true, mesures: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  if (!c) notFound();
  const m = c.mesures[0];
  return (
    <main className="page">
      <p className="muted small">Carnet de mesures</p>
      <h1>{c.nom}</h1>
      <p className="small muted">Enregistré chez {c.atelier.nom}{m ? ` · mis à jour le ${dateCourte(m.createdAt)}` : ""}</p>
      <div className="card" style={{ marginTop: 12 }}>
        <AfficherMesures valeurs={lireMesures(m?.valeurs)} genre={c.genre} />
      </div>
      <p className="small muted" style={{ marginTop: 16 }}>Mesures en centimètres. Montrez cette page à votre tailleur.</p>
      <Imprimer />
    </main>
  );
}
