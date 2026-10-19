import { CHAMPS_MESURES, type Mesures } from "@/lib/mesures";

/**
 * Champs de mesures en cm. Avec `replierVides`, seuls les champs remplis sont visibles,
 * les autres restent accessibles sous « Autres mesures » (formulaire plus court à relire).
 */
export function ChampsMesures({ valeurs = {}, prefixe = "", replierVides = false }: { valeurs?: Mesures; prefixe?: string; replierVides?: boolean }) {
  const champ = (c: (typeof CHAMPS_MESURES)[number]) => {
    const nom = `${prefixe}m_${c.cle}`;
    return (
      <div key={c.cle}>
        <label htmlFor={nom} className="small">{c.libelle}{c.genres.length === 1 ? " (F)" : ""}</label>
        <input id={nom} name={nom} inputMode="decimal" placeholder="cm" defaultValue={valeurs[c.cle] ?? ""} />
      </div>
    );
  };
  const remplis = CHAMPS_MESURES.filter((c) => valeurs[c.cle] !== undefined);
  if (!replierVides || remplis.length === 0) return <div className="grid2">{CHAMPS_MESURES.map(champ)}</div>;
  const vides = CHAMPS_MESURES.filter((c) => valeurs[c.cle] === undefined);
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
