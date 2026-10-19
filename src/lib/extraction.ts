import { z } from "zod";
import type { ChampMesure, Mesures } from "./mesures";
import { normaliserTelephone } from "./telephone";

export type Extraction = {
  clients: {
    nom: string;
    telephone: string | null;
    genre: "F" | "H" | "inconnu";
    mesures: Record<string, number | null>;
    autres: { libelle: string; valeur: string }[];
    doute: string | null;
  }[];
  remarque: string | null;
};

/** Schéma demandé au modèle : un champ par mesure de l'atelier (null si absente), le reste dans "autres". */
export function schemaExtraction(champs: ChampMesure[]): z.ZodType<Extraction> {
  const mesures = z.object(Object.fromEntries(champs.map((c) => [c.cle, z.number().nullable()])));
  return z.object({
    clients: z.array(
      z.object({
        nom: z.string(),
        telephone: z.string().nullable(),
        genre: z.enum(["F", "H", "inconnu"]),
        mesures,
        autres: z.array(z.object({ libelle: z.string(), valeur: z.string() })),
        doute: z.string().nullable(),
      }),
    ),
    remarque: z.string().nullable(),
  }) as z.ZodType<Extraction>;
}

/** Client prêt à être relu par le tailleur. */
export type Brouillon = {
  nom: string;
  telephone: string | null;
  genre: "F" | "H";
  mesures: Mesures;
  notes: string;
  doute: string | null;
};

export function versBrouillons(e: Extraction, champs: ChampMesure[]): Brouillon[] {
  return e.clients
    .filter((c) => c.nom.trim())
    .map((c) => {
      const mesures: Mesures = {};
      for (const ch of champs) {
        const v = c.mesures[ch.cle];
        if (typeof v === "number" && Number.isFinite(v) && v > 0 && v < 400) mesures[ch.cle] = Math.round(v * 10) / 10;
      }
      return {
        nom: c.nom.trim(),
        telephone: c.telephone ? normaliserTelephone(c.telephone) : null,
        genre: c.genre === "H" ? "H" : "F",
        mesures,
        notes: c.autres.map((a) => `${a.libelle} : ${a.valeur}`).join(" · "),
        doute: c.doute,
      };
    });
}

export function listeChampsPrompt(champs: ChampMesure[]): string {
  return champs.map((c) => `- ${c.cle} : ${c.libelle}`).join("\n");
}
