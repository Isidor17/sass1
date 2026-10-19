import { mesuresAffichees, type ChampMesure, type Mesures } from "@/lib/mesures";

export function AfficherMesures({ valeurs, champs }: { valeurs: Mesures; champs: ChampMesure[] }) {
  const lignes = mesuresAffichees(valeurs, champs);
  if (!lignes.length) return <p className="muted">Aucune mesure enregistrée.</p>;
  return (
    <div className="mesures">
      {lignes.map((m) => (
        <div key={m.cle}><span className="small">{m.libelle}</span><b>{m.valeur}</b></div>
      ))}
    </div>
  );
}
