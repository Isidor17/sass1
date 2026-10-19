"use client";

import { useState } from "react";
import type { ChampMesure, Genre } from "@/lib/mesures";
import { enregistrerChampsMesures } from "@/app/actions";

type Ligne = { cle?: string; libelle: string; genres: Genre[]; id: number };
const GENRES: { v: string; l: string; g: Genre[] }[] = [
  { v: "FH", l: "Tous", g: ["F", "H"] },
  { v: "F", l: "Femme", g: ["F"] },
  { v: "H", l: "Homme", g: ["H"] },
];
const valeurGenre = (g: Genre[]) => (g.length === 2 ? "FH" : g[0]);

let compteur = 0;
const versLigne = (c: Omit<Ligne, "id">): Ligne => ({ ...c, id: ++compteur });

export function EditeurMesures({ champs, suggestions, max }: { champs: ChampMesure[]; suggestions: ChampMesure[]; max: number }) {
  const [lignes, setLignes] = useState<Ligne[]>(() => champs.map(versLigne));
  const [nouveau, setNouveau] = useState("");
  const [modifie, setModifie] = useState(false);

  const maj = (f: (l: Ligne[]) => Ligne[]) => { setLignes(f); setModifie(true); };
  const deplacer = (i: number, d: -1 | 1) =>
    maj((l) => { const c = [...l]; const j = i + d; if (j < 0 || j >= c.length) return l; [c[i], c[j]] = [c[j], c[i]]; return c; });
  const presentes = new Set(lignes.map((l) => l.cle).filter(Boolean));
  const proposables = suggestions.filter((s) => !presentes.has(s.cle));
  const plein = lignes.length >= max;

  const ajouterLibre = () => {
    const libelle = nouveau.trim();
    if (!libelle || plein) return;
    maj((l) => [...l, versLigne({ libelle, genres: ["F", "H"] })]);
    setNouveau("");
  };

  return (
    <form action={enregistrerChampsMesures} className="stack">
      <input type="hidden" name="champs" value={JSON.stringify(lignes.map(({ cle, libelle, genres }) => ({ cle, libelle, genres })))} />

      <ol className="editeur-liste">
        {lignes.map((l, i) => (
          <li key={l.id} className="card editeur-ligne">
            <div className="editeur-ordre">
              <button type="button" aria-label="Monter" disabled={i === 0} onClick={() => deplacer(i, -1)}>▲</button>
              <button type="button" aria-label="Descendre" disabled={i === lignes.length - 1} onClick={() => deplacer(i, 1)}>▼</button>
            </div>
            <div className="editeur-champs">
              <input
                aria-label="Nom de la mesure"
                value={l.libelle}
                maxLength={40}
                onChange={(e) => { const v = e.target.value; maj((x) => x.map((y) => (y.id === l.id ? { ...y, libelle: v } : y))); }}
              />
              <select
                aria-label="Pour qui"
                value={valeurGenre(l.genres)}
                onChange={(e) => { const g = GENRES.find((x) => x.v === e.target.value)!.g; maj((x) => x.map((y) => (y.id === l.id ? { ...y, genres: g } : y))); }}
              >
                {GENRES.map((g) => <option key={g.v} value={g.v}>{g.l}</option>)}
              </select>
            </div>
            <button type="button" className="editeur-suppr" aria-label={`Retirer ${l.libelle}`} disabled={lignes.length === 1}
              onClick={() => maj((x) => x.filter((y) => y.id !== l.id))}>✕</button>
          </li>
        ))}
      </ol>

      <div className="card stack">
        <label htmlFor="nouvelle-mesure">Ajouter une mesure</label>
        <div className="row">
          <input id="nouvelle-mesure" value={nouveau} maxLength={40} placeholder="ex : Tour de poitrine haute"
            onChange={(e) => setNouveau(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); ajouterLibre(); } }} />
          <button type="button" className="btn" disabled={!nouveau.trim() || plein} onClick={ajouterLibre}>Ajouter</button>
        </div>
        {proposables.length > 0 && (
          <div>
            <p className="small muted" style={{ margin: "4px 0 8px" }}>Suggestions</p>
            <div className="row wrap">
              {proposables.map((s) => (
                <button key={s.cle} type="button" className="puce" disabled={plein}
                  onClick={() => maj((l) => [...l, versLigne({ cle: s.cle, libelle: s.libelle, genres: s.genres })])}>
                  + {s.libelle}
                </button>
              ))}
            </div>
          </div>
        )}
        {plein && <p className="small muted">Maximum {max} mesures.</p>}
      </div>

      <div className="barre-enregistrer">
        <button className="btn block" disabled={!modifie || lignes.some((l) => !l.libelle.trim())}>
          {modifie ? "Enregistrer ma liste" : "Liste enregistrée"}
        </button>
      </div>
    </form>
  );
}
