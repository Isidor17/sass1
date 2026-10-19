import { Alerte } from "@/components/Alerte";
import { FormulairePhoto } from "@/components/FormulairePhoto";

export default async function Importer({ searchParams }: { searchParams: Promise<{ erreur?: string }> }) {
  const { erreur } = await searchParams;
  return (
    <main className="page">
      <h1>Importer un carnet papier</h1>
      <p className="muted">Photographiez une page : les clients et leurs mesures sont relevés automatiquement. Vous vérifiez avant d&apos;enregistrer.</p>
      <Alerte erreur={erreur} />
      <FormulairePhoto />
      <h2>Pour une bonne lecture</h2>
      <ul className="small">
        <li>Une seule page à la fois, posée à plat.</li>
        <li>Lumière du jour, sans ombre du téléphone.</li>
        <li>Toute la page dans le cadre, chiffres nets.</li>
      </ul>
    </main>
  );
}
