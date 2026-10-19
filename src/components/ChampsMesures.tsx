import { CHAMPS_MESURES, type Mesures } from "@/lib/mesures";

// Tous les champs sont affichés ; ceux réservés aux femmes sont marqués. Le tailleur remplit ce qu'il utilise.
export function ChampsMesures({ valeurs = {}, prefixe = "" }: { valeurs?: Mesures; prefixe?: string }) {
  return (
    <div className="grid2">
      {CHAMPS_MESURES.map((c) => {
        const nom = `${prefixe}m_${c.cle}`;
        return (
          <div key={c.cle}>
            <label htmlFor={nom} className="small">{c.libelle}{c.genres.length === 1 ? " (F)" : ""}</label>
            <input id={nom} name={nom} inputMode="decimal" placeholder="cm" defaultValue={valeurs[c.cle] ?? ""} />
          </div>
        );
      })}
    </div>
  );
}
