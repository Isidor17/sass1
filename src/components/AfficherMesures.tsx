import { mesuresAffichees, type ChampMesure, type Mesures } from "@/lib/mesures";
import { formatEcart } from "@/lib/historique";

export function AfficherMesures({ valeurs, champs, ecarts }: { valeurs: Mesures; champs: ChampMesure[]; ecarts?: Record<string, number> }) {
  const lignes = mesuresAffichees(valeurs, champs);
  if (!lignes.length) return <p className="muted">Aucune mesure enregistrée.</p>;
  return (
    <div className="mesures">
      {lignes.map((m) => (
        <div key={m.cle}>
          <span className="small">{m.libelle}</span>
          <b>
            {m.valeur}
            {ecarts?.[m.cle] !== undefined && <i className={`ecart ${ecarts[m.cle] > 0 ? "plus" : "moins"}`}>{formatEcart(ecarts[m.cle])}</i>}
          </b>
        </div>
      ))}
    </div>
  );
}
