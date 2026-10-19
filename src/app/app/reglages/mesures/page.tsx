import Link from "next/link";
import { atelierConnecte } from "@/lib/session";
import { CATALOGUE, MAX_CHAMPS, champsAtelier } from "@/lib/mesures";
import { reinitialiserChampsMesures } from "../../../actions";
import { Alerte } from "@/components/Alerte";
import { EditeurMesures } from "@/components/EditeurMesures";

export default async function ReglageMesures({ searchParams }: { searchParams: Promise<{ ok?: string; erreur?: string }> }) {
  const a = await atelierConnecte();
  const { ok, erreur } = await searchParams;
  const champs = champsAtelier(a.champsMesures);
  return (
    <main className="page">
      <p className="small"><Link href="/app/reglages">← Mon atelier</Link></p>
      <h1>Mes mesures</h1>
      <p className="muted small">
        Choisissez les mesures que vous prenez, dans votre ordre, avec vos mots. Retirer une mesure n&apos;efface rien :
        les valeurs déjà enregistrées restent visibles sur les fiches.
      </p>
      {ok && <Alerte succes="Liste enregistrée. Elle s'applique aux fiches, aux nouvelles commandes et à l'import photo." />}
      <Alerte erreur={erreur} />
      {/* key : l'éditeur repart de la liste enregistrée après chaque sauvegarde */}
      <EditeurMesures key={a.champsMesures ?? "defaut"} champs={champs} suggestions={CATALOGUE} max={MAX_CHAMPS} />
      {a.champsMesures && (
        <form action={reinitialiserChampsMesures} style={{ marginTop: 16 }}>
          <button className="btn ghost block">Revenir à la liste par défaut</button>
        </form>
      )}
    </main>
  );
}
