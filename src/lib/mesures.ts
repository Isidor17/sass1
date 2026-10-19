// Champs de mesures, en cm. Chaque atelier choisit les siens (Atelier.champsMesures) ;
// sans réglage, il utilise CHAMPS_DEFAUT. Les valeurs sont stockées par clé (MesureSet.valeurs).

export type Genre = "F" | "H";
export type ChampMesure = { cle: string; libelle: string; genres: Genre[] };
export type Mesures = Record<string, number>;

const TOUS: Genre[] = ["F", "H"];

export const CHAMPS_DEFAUT: ChampMesure[] = [
  { cle: "cou", libelle: "Tour de cou", genres: TOUS },
  { cle: "epaule", libelle: "Épaule", genres: TOUS },
  { cle: "poitrine", libelle: "Poitrine", genres: TOUS },
  { cle: "taille", libelle: "Tour de taille", genres: TOUS },
  { cle: "hanches", libelle: "Hanches", genres: TOUS },
  { cle: "longueur_haut", libelle: "Longueur haut / chemise", genres: TOUS },
  { cle: "longueur_boubou", libelle: "Longueur boubou / robe", genres: TOUS },
  { cle: "manche", libelle: "Longueur manche", genres: TOUS },
  { cle: "bras", libelle: "Tour de bras", genres: TOUS },
  { cle: "poignet", libelle: "Poignet", genres: TOUS },
  { cle: "longueur_pantalon", libelle: "Longueur pantalon", genres: TOUS },
  { cle: "cuisse", libelle: "Tour de cuisse", genres: TOUS },
  { cle: "bas", libelle: "Bas pantalon", genres: TOUS },
  { cle: "longueur_jupe", libelle: "Longueur jupe / pagne", genres: ["F"] },
  { cle: "sous_poitrine", libelle: "Sous-poitrine", genres: ["F"] },
];

/** Mesures proposées en un clic dans les réglages, absentes de la liste par défaut. */
export const SUGGESTIONS: ChampMesure[] = [
  { cle: "carrure_dos", libelle: "Carrure dos", genres: TOUS },
  { cle: "taille_dos", libelle: "Longueur taille-dos", genres: TOUS },
  { cle: "hauteur_poitrine", libelle: "Hauteur de poitrine", genres: ["F"] },
  { cle: "entrejambe", libelle: "Entrejambe", genres: TOUS },
  { cle: "genou", libelle: "Tour de genou", genres: TOUS },
  { cle: "tour_tete", libelle: "Tour de tête", genres: TOUS },
];

export const CATALOGUE: ChampMesure[] = [...CHAMPS_DEFAUT, ...SUGGESTIONS];
export const MAX_CHAMPS = 40;

/** Nettoie une liste de champs venue d'un formulaire ou de la base. null si invalide ou vide. */
export function validerChamps(entree: unknown): ChampMesure[] | null {
  if (!Array.isArray(entree)) return null;
  const vus = new Set<string>();
  const out: ChampMesure[] = [];
  for (const brut of entree.slice(0, MAX_CHAMPS)) {
    if (!brut || typeof brut !== "object") continue;
    const { cle, libelle, genres } = brut as Record<string, unknown>;
    if (typeof cle !== "string" || !/^[a-z0-9_]{1,40}$/.test(cle) || vus.has(cle)) continue;
    const lib = typeof libelle === "string" ? libelle.trim().slice(0, 40) : "";
    if (!lib) continue;
    const g = Array.isArray(genres) ? TOUS.filter((x) => genres.includes(x)) : TOUS;
    vus.add(cle);
    out.push({ cle, libelle: lib, genres: g.length ? g : TOUS });
  }
  return out.length ? out : null;
}

/** Champs de l'atelier (JSON en base), ou la liste par défaut. */
export function champsAtelier(json: string | null | undefined): ChampMesure[] {
  if (!json) return CHAMPS_DEFAUT;
  try {
    return validerChamps(JSON.parse(json)) ?? CHAMPS_DEFAUT;
  } catch {
    return CHAMPS_DEFAUT;
  }
}

/** Clé stable pour un champ créé par le tailleur : "perso_" + libellé simplifié, unique. */
export function cleDepuisLibelle(libelle: string, existantes: Iterable<string>): string {
  const base =
    "perso_" +
    (libelle
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "")
      .slice(0, 30) || "mesure");
  const prises = new Set(existantes);
  let cle = base;
  for (let i = 2; prises.has(cle); i++) cle = `${base}_${i}`;
  return cle;
}

/** Libellé d'une clé, même si elle n'est plus dans la liste de l'atelier (mesure ancienne ou importée). */
export function libelleDe(cle: string, champs: ChampMesure[] = CHAMPS_DEFAUT): string {
  const c = champs.find((x) => x.cle === cle) ?? CATALOGUE.find((x) => x.cle === cle);
  if (c) return c.libelle;
  const texte = cle.replace(/^perso_/, "").replace(/_\d+$/, "").replace(/_/g, " ");
  return texte.charAt(0).toUpperCase() + texte.slice(1);
}

/**
 * Mesures à afficher, dans l'ordre de l'atelier, puis celles qui ne font plus partie de sa liste
 * (on ne cache jamais une valeur enregistrée).
 */
export function mesuresAffichees(valeurs: Mesures, champs: ChampMesure[]): { cle: string; libelle: string; valeur: number }[] {
  const connues = champs.filter((c) => valeurs[c.cle] !== undefined).map((c) => ({ cle: c.cle, libelle: c.libelle, valeur: valeurs[c.cle] }));
  const autres = Object.keys(valeurs)
    .filter((k) => !champs.some((c) => c.cle === k) && typeof valeurs[k] === "number")
    .map((k) => ({ cle: k, libelle: libelleDe(k, champs), valeur: valeurs[k] }));
  return [...connues, ...autres];
}

/** Extrait les mesures d'un formulaire (champs "<prefixe>m_<cle>"). Accepte la virgule décimale. */
export function mesuresDepuisFormulaire(form: FormData, champs: ChampMesure[], prefixe = ""): Mesures {
  const out: Mesures = {};
  for (const c of champs) {
    const brut = String(form.get(prefixe + "m_" + c.cle) ?? "").trim().replace(",", ".");
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
