import type { ChampMesure, Mesures } from "@/lib/mesures";

/**
 * Champs de mesures de l'atelier, en cm. Avec `replierVides`, seuls les champs remplis sont visibles,
 * les autres restent accessibles sous « Autres mesures » (formulaire plus court à relire).
 */
export function ChampsMesures({ champs, valeurs = {}, prefixe = "", replierVides = false }: {
  champs: ChampMesure[];
  valeurs?: Mesures;
  prefixe?: string;
  replierVides?: boolean;
}) {
  const champ = (c: ChampMesure) => {
    const nom = `${prefixe}m_${c.cle}`;
    return (
      <div key={c.cle}>
        <label htmlFor={nom} className="small">{c.libelle}{c.genres.length === 1 ? ` (${c.genres[0]})` : ""}</label>
        <input id={nom} name={nom} inputMode="decimal" placeholder="cm" defaultValue={valeurs[c.cle] ?? ""} />
      </div>
    );
  };
  const remplis = champs.filter((c) => valeurs[c.cle] !== undefined);
  if (!replierVides || remplis.length === 0) return <div className="grid2">{champs.map(champ)}</div>;
  const vides = champs.filter((c) => valeurs[c.cle] === undefined);
  return (
    <>
      <div className="grid2">{remplis.map(champ)}</div>
      {vides.length > 0 && (
        <details className="plus-mesures">
          <summary>+ Autres mesures ({vides.length})</summary>
          <div className="grid2">{vides.map(champ)}</div>
        </details>
      )}
    </>
  );
}
