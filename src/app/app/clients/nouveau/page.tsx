import { creerClient } from "../../../actions";
import { Alerte } from "@/components/Alerte";
import { ChampsMesures } from "@/components/ChampsMesures";
import Link from "next/link";
import { atelierConnecte } from "@/lib/session";
import { champsAtelier } from "@/lib/mesures";

export default async function NouveauClient({ searchParams }: { searchParams: Promise<{ erreur?: string }> }) {
  const { erreur } = await searchParams;
  const a = await atelierConnecte();
  return (
    <main className="page">
      <h1>Nouveau client</h1>
      <Alerte erreur={erreur} />
      <form action={creerClient} className="stack">
        <div><label htmlFor="nom">Nom</label><input id="nom" name="nom" required autoFocus /></div>
        <div className="grid2">
          <div><label htmlFor="telephone">Téléphone (WhatsApp)</label><input id="telephone" name="telephone" type="tel" inputMode="tel" placeholder="77 123 45 67" /></div>
          <div><label htmlFor="genre">Genre</label><select id="genre" name="genre"><option value="F">Femme</option><option value="H">Homme</option></select></div>
        </div>
        <div className="row between"><h2>Mesures (cm)</h2><Link className="small" href="/app/reglages/mesures">Choisir mes mesures</Link></div>
        <ChampsMesures champs={champsAtelier(a.champsMesures)} />
        <div><label htmlFor="notes">Notes</label><textarea id="notes" name="notes" placeholder="Préférences, morphologie…" /></div>
        <button className="btn block" name="suite" value="commande">Enregistrer et créer une commande</button>
        <button className="btn ghost block" name="suite" value="fiche">Enregistrer seulement</button>
      </form>
    </main>
  );
}
