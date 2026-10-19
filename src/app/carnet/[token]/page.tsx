import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { dateCourte } from "@/lib/format";
import { champsAtelier, lireMesures } from "@/lib/mesures";
import { atelierIdOptionnel, urlApp } from "@/lib/session";
import { importerDepuisCarnet } from "../../actions";
import { AfficherMesures } from "@/components/AfficherMesures";
import { Imprimer } from "@/components/Imprimer";
import { QrCode } from "@/components/QrCode";
import { Propulse } from "@/components/Propulse";

export const metadata: Metadata = { title: "Mon carnet de mesures", robots: { index: false } };

// Carnet de mesures portable : le client garde ce lien (ou son QR) et le montre à n'importe quel tailleur.
// Un tailleur connecté l'importe en un geste ; un tailleur sans compte est invité à s'inscrire.
// C'est la boucle d'acquisition : chaque client fait venir son prochain tailleur sur la plateforme.
export default async function Carnet({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const c = await db.client.findUnique({
    where: { carnetToken: token },
    include: { atelier: true, mesures: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  if (!c) notFound();
  const m = c.mesures[0];
  const visiteur = await atelierIdOptionnel();
  const dejaImporte = visiteur && visiteur !== c.atelierId
    ? await db.client.findFirst({ where: { atelierId: visiteur, origineCarnet: token }, select: { id: true } })
    : null;

  return (
    <main className="page">
      <p className="muted small">Carnet de mesures</p>
      <h1>{c.nom}</h1>
      <p className="small muted">Enregistré chez {c.atelier.nom}{m ? ` · mis à jour le ${dateCourte(m.createdAt)}` : ""}</p>
      <div className="card" style={{ marginTop: 12 }}>
        <AfficherMesures valeurs={lireMesures(m?.valeurs)} champs={champsAtelier(c.atelier.champsMesures)} />
      </div>
      <p className="small muted" style={{ marginTop: 12 }}>Mesures en centimètres. Montrez ce code à votre tailleur :</p>
      <QrCode url={`${urlApp()}/carnet/${token}`} taille={160} />

      <div className="stack no-print" style={{ marginTop: 16 }}>
        {visiteur === c.atelierId ? (
          <Link className="btn ghost block" href="/app/clients">Retour à mes clients</Link>
        ) : dejaImporte ? (
          <Link className="btn block" href={`/app/clients/${dejaImporte.id}`}>Ce client est déjà dans votre atelier</Link>
        ) : visiteur ? (
          <form action={importerDepuisCarnet}>
            <input type="hidden" name="token" value={token} />
            <button className="btn block">Ajouter ce client à mon atelier</button>
          </form>
        ) : (
          <div className="card">
            <p><b>Vous êtes tailleur ?</b> Récupérez ces mesures dans votre propre atelier, gratuitement.</p>
            <Link className="btn block" href={`/inscription?carnet=${token}`}>Créer mon atelier et importer</Link>
            <p className="small" style={{ marginTop: 8 }}>Déjà inscrit ? <Link href={`/connexion?carnet=${token}`}>Se connecter</Link></p>
          </div>
        )}
        <Imprimer />
      </div>
      <Propulse />
    </main>
  );
}
