import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { atelierConnecte } from "@/lib/session";
import { afficherTelephone } from "@/lib/telephone";
import { majClient } from "../../../../actions";
import { Alerte } from "@/components/Alerte";

export default async function ModifierClient({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ erreur?: string }> }) {
  const a = await atelierConnecte();
  const { id } = await params;
  const { erreur } = await searchParams;
  const c = await db.client.findFirst({ where: { id, atelierId: a.id } });
  if (!c) notFound();
  return (
    <main className="page">
      <h1>Modifier {c.nom}</h1>
      <Alerte erreur={erreur} />
      <form action={majClient} className="stack">
        <input type="hidden" name="id" value={c.id} />
        <div><label htmlFor="nom">Nom</label><input id="nom" name="nom" defaultValue={c.nom} required /></div>
        <div className="grid2">
          <div><label htmlFor="telephone">Téléphone</label><input id="telephone" name="telephone" type="tel" defaultValue={c.telephone ? afficherTelephone(c.telephone) : ""} /></div>
          <div><label htmlFor="genre">Genre</label><select id="genre" name="genre" defaultValue={c.genre}><option value="F">Femme</option><option value="H">Homme</option></select></div>
        </div>
        <div><label htmlFor="notes">Notes</label><textarea id="notes" name="notes" defaultValue={c.notes ?? ""} /></div>
        <button className="btn block">Enregistrer</button>
      </form>
    </main>
  );
}
