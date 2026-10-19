import { z } from "zod";
import { CHAMPS_MESURES, type Mesures } from "./mesures";
import { normaliserTelephone } from "./telephone";

// Schéma demandé au modèle : un champ par mesure connue (null si absente), le reste dans "autres".
const champs = Object.fromEntries(CHAMPS_MESURES.map((c) => [c.cle, z.number().nullable()])) as Record<
  string,
  z.ZodNullable<z.ZodNumber>
>;

export const ClientExtraitSchema = z.object({
  nom: z.string(),
  telephone: z.string().nullable(),
  genre: z.enum(["F", "H", "inconnu"]),
  mesures: z.object(champs),
  autres: z.array(z.object({ libelle: z.string(), valeur: z.string() })),
  doute: z.string().nullable(),
});

export const ExtractionSchema = z.object({
  clients: z.array(ClientExtraitSchema),
  remarque: z.string().nullable(),
});

export type Extraction = z.infer<typeof ExtractionSchema>;

/** Client prêt à être relu par le tailleur. */
export type Brouillon = {
  nom: string;
  telephone: string | null;
  genre: "F" | "H";
  mesures: Mesures;
  notes: string;
  doute: string | null;
};

export function versBrouillons(e: Extraction): Brouillon[] {
  return e.clients
    .filter((c) => c.nom.trim())
    .map((c) => {
      const mesures: Mesures = {};
      for (const ch of CHAMPS_MESURES) {
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

export const LISTE_CHAMPS_PROMPT = CHAMPS_MESURES.map((c) => `- ${c.cle} : ${c.libelle}`).join("\n");
