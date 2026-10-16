// Champs de mesures par défaut, en cm. À ajuster après les entretiens avec les tailleurs.
export type ChampMesure = { cle: string; libelle: string; genres: ("F" | "H")[] };

export const CHAMPS_MESURES: ChampMesure[] = [
  { cle: "cou", libelle: "Tour de cou", genres: ["F", "H"] },
  { cle: "epaule", libelle: "Épaule", genres: ["F", "H"] },
  { cle: "poitrine", libelle: "Poitrine", genres: ["F", "H"] },
  { cle: "taille", libelle: "Tour de taille", genres: ["F", "H"] },
  { cle: "hanches", libelle: "Hanches", genres: ["F", "H"] },
  { cle: "longueur_haut", libelle: "Longueur haut / chemise", genres: ["F", "H"] },
  { cle: "longueur_boubou", libelle: "Longueur boubou / robe", genres: ["F", "H"] },
  { cle: "manche", libelle: "Longueur manche", genres: ["F", "H"] },
  { cle: "bras", libelle: "Tour de bras", genres: ["F", "H"] },
  { cle: "poignet", libelle: "Poignet", genres: ["F", "H"] },
  { cle: "longueur_pantalon", libelle: "Longueur pantalon", genres: ["F", "H"] },
  { cle: "cuisse", libelle: "Tour de cuisse", genres: ["F", "H"] },
  { cle: "bas", libelle: "Bas pantalon", genres: ["F", "H"] },
  { cle: "longueur_jupe", libelle: "Longueur jupe / pagne", genres: ["F"] },
  { cle: "sous_poitrine", libelle: "Sous-poitrine", genres: ["F"] },
];

export type Mesures = Record<string, number>;

export function champsPour(genre: string): ChampMesure[] {
  const g = genre === "H" ? "H" : "F";
  return CHAMPS_MESURES.filter((c) => c.genres.includes(g));
}

/** Extrait les mesures d'un formulaire (champs "m_<cle>"). Accepte la virgule décimale. */
export function mesuresDepuisFormulaire(form: FormData): Mesures {
  const out: Mesures = {};
  for (const c of CHAMPS_MESURES) {
    const brut = String(form.get("m_" + c.cle) ?? "").trim().replace(",", ".");
    if (!brut) continue;
    const v = Number(brut);
    if (Number.isFinite(v) && v > 0 && v < 400) out[c.cle] = Math.round(v * 10) / 10;
  }
  return out;
}

export function lireMesures(json: string | null | undefined): Mesures {
  if (!json) return {};
  try {
    const v = JSON.parse(json);
    return v && typeof v === "object" ? (v as Mesures) : {};
  } catch {
    return {};
  }
}
