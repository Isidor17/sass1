import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { atelierConnecte } from "@/lib/session";
import { champsAtelier, lireMesures } from "@/lib/mesures";
import { dateCourte } from "@/lib/format";
import { ilYa } from "@/lib/historique";
import { nouvellesMesures } from "../../../../actions";
import { Alerte } from "@/components/Alerte";
import { ChampsMesures } from "@/components/ChampsMesures";

export default async function Mesures({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ erreur?: string; retour?: string; commande?: string }> }) {
  const a = await atelierConnecte();
  const { id } = await params;
  const { erreur, retour, commande } = await searchParams;
  const c = await db.client.findFirst({ where: { id, atelierId: a.id }, include: { mesures: { orderBy: { createdAt: "desc" }, take: 1 } } });
  if (!c) notFound();
  return (
    <main className="page">
      <h1>Mesures de {c.nom}</h1>
      <p className="muted small">
        {c.mesures[0]
          ? <>Pré-rempli avec les mesures du {dateCourte(c.mesures[0].createdAt)} ({ilYa(c.mesures[0].createdAt)}). Corrigez ce qui a changé ; les anciennes restent dans l&apos;historique.</>
          : "Première prise de mesures pour ce client."}
      </p>
      <Alerte erreur={erreur} />
      <form action={nouvellesMesures} className="stack">
        <input type="hidden" name="clientId" value={c.id} />
        {retour === "commande" && <input type="hidden" name="retour" value="commande" />}
        {commande && <input type="hidden" name="commandeId" value={commande} />}
        <ChampsMesures champs={champsAtelier(a.champsMesures)} valeurs={lireMesures(c.mesures[0]?.valeurs)} />
        <div><label htmlFor="note">Note</label><input id="note" name="note" placeholder="ex: après grossesse, a maigri…" /></div>
        <button className="btn block">{retour === "commande" ? "Enregistrer et continuer la commande" : "Enregistrer les mesures"}</button>
      </form>
    </main>
  );
}
