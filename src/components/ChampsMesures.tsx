import { CHAMPS_MESURES, type Mesures } from "@/lib/mesures";

// Tous les champs sont affichés ; ceux réservés aux femmes sont marqués. Le tailleur remplit ce qu'il utilise.
export function ChampsMesures({ valeurs = {} }: { valeurs?: Mesures }) {
  return (
    <div className="grid2">
      {CHAMPS_MESURES.map((c) => (
        <div key={c.cle}>
          <label htmlFor={"m_" + c.cle} className="small">{c.libelle}{c.genres.length === 1 ? " (F)" : ""}</label>
          <input id={"m_" + c.cle} name={"m_" + c.cle} inputMode="decimal" placeholder="cm" defaultValue={valeurs[c.cle] ?? ""} />
        </div>
      ))}
    </div>
  );
}
