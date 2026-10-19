import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { atelierConnecte } from "@/lib/session";
import { afficherTelephone } from "@/lib/telephone";
import type { Brouillon } from "@/lib/extraction";
import { validerImport } from "../../../../actions";
import { Alerte } from "@/components/Alerte";
import { ChampsMesures } from "@/components/ChampsMesures";

export default async function RelireImport({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ erreur?: string }> }) {
  const a = await atelierConnecte();
  const { id } = await params;
  const { erreur } = await searchParams;
  const imp = await db.importPhoto.findFirst({ where: { id, atelierId: a.id } });
  if (!imp) notFound();
  if (imp.valide) {
    return (
      <main className="page">
        <h1>Import déjà enregistré</h1>
        <Link className="btn block" href="/app/clients">Voir mes clients</Link>
      </main>
    );
  }
  const { brouillons, remarque } = JSON.parse(imp.resultat) as { brouillons: Brouillon[]; remarque: string | null };

  return (
    <main className="page">
      <h1>Vérifiez {brouillons.length} client(s)</h1>
      <p className="muted small">Corrigez si besoin, décochez ce qui est faux, puis enregistrez.</p>
      {remarque && <p className="small">{remarque}</p>}
      <Alerte erreur={erreur} />
      <form action={validerImport} className="stack">
        <input type="hidden" name="importId" value={imp.id} />
        <input type="hidden" name="nombre" value={brouillons.length} />
        {brouillons.map((b, i) => (
          <details key={i} className={`card brouillon${b.doute ? " doute" : ""}`} open={i === 0 || !!b.doute}>
            <summary className="row between">
              <b>{b.nom}</b>
              <span className="small muted">{Object.keys(b.mesures).length} mesure(s){b.doute ? " · à vérifier" : ""}</span>
            </summary>
            <div className="stack" style={{ marginTop: 12 }}>
              {b.doute && <div className="alerte small">{b.doute}</div>}
              <label className="case"><input type="checkbox" name={`c${i}_garder`} value="1" defaultChecked /> Enregistrer ce client</label>
              <div><label htmlFor={`c${i}_nom`}>Nom</label><input id={`c${i}_nom`} name={`c${i}_nom`} defaultValue={b.nom} /></div>
              <div className="grid2">
                <div><label htmlFor={`c${i}_telephone`}>Téléphone</label><input id={`c${i}_telephone`} name={`c${i}_telephone`} type="tel" defaultValue={b.telephone ? afficherTelephone(b.telephone) : ""} /></div>
                <div><label htmlFor={`c${i}_genre`}>Genre</label><select id={`c${i}_genre`} name={`c${i}_genre`} defaultValue={b.genre}><option value="F">Femme</option><option value="H">Homme</option></select></div>
              </div>
              <ChampsMesures valeurs={b.mesures} prefixe={`c${i}_`} replierVides />
              <div><label htmlFor={`c${i}_notes`}>Autres mesures / notes</label><textarea id={`c${i}_notes`} name={`c${i}_notes`} defaultValue={b.notes} /></div>
            </div>
          </details>
        ))}
        <button className="btn block">Enregistrer les clients cochés</button>
      </form>
      <Link className="btn ghost block" style={{ marginTop: 8 }} href="/app/clients/importer">Reprendre une autre photo</Link>
    </main>
  );
}
