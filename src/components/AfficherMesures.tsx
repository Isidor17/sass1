import { champsPour, type Mesures } from "@/lib/mesures";

export function AfficherMesures({ valeurs, genre }: { valeurs: Mesures; genre: string }) {
  const champs = champsPour(genre).filter((c) => valeurs[c.cle] !== undefined);
  if (!champs.length) return <p className="muted">Aucune mesure enregistrée.</p>;
  return (
    <div className="mesures">
      {champs.map((c) => (
        <div key={c.cle}><span className="small">{c.libelle}</span><b>{valeurs[c.cle]}</b></div>
      ))}
    </div>
  );
}
