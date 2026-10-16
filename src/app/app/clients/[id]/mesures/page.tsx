import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { atelierConnecte } from "@/lib/session";
import { lireMesures } from "@/lib/mesures";
import { nouvellesMesures } from "../../../../actions";
import { Alerte } from "@/components/Alerte";
import { ChampsMesures } from "@/components/ChampsMesures";

export default async function Mesures({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ erreur?: string }> }) {
  const a = await atelierConnecte();
  const { id } = await params;
  const { erreur } = await searchParams;
  const c = await db.client.findFirst({ where: { id, atelierId: a.id }, include: { mesures: { orderBy: { createdAt: "desc" }, take: 1 } } });
  if (!c) notFound();
  return (
    <main className="page">
      <h1>Mesures de {c.nom}</h1>
      <p className="muted small">Pré-rempli avec les dernières mesures. Les anciennes restent dans l&apos;historique.</p>
      <Alerte erreur={erreur} />
      <form action={nouvellesMesures} className="stack">
        <input type="hidden" name="clientId" value={c.id} />
        <ChampsMesures valeurs={lireMesures(c.mesures[0]?.valeurs)} />
        <div><label htmlFor="note">Note</label><input id="note" name="note" placeholder="ex: après grossesse, a maigri…" /></div>
        <button className="btn block">Enregistrer les mesures</button>
      </form>
    </main>
  );
}
