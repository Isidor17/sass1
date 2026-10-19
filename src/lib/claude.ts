import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { ExtractionSchema, LISTE_CHAMPS_PROMPT, type Extraction } from "./extraction";

let client: Anthropic | null = null;
function api(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN)
    throw new ExtractionImpossible("Lecture photo non configurée : ajoutez ANTHROPIC_API_KEY sur le serveur.");
  return (client ??= new Anthropic());
}

const SYSTEME = `Tu aides des tailleurs au Sénégal à numériser leurs carnets de mesures papier.
On te donne la photo d'une page de carnet, souvent manuscrite, parfois en abrégé, en français ou en wolof.
Relève chaque client présent sur la page avec ses mesures en centimètres.

Associe chaque mesure à l'un de ces champs quand le sens est clair :
${LISTE_CHAMPS_PROMPT}

Abréviations courantes : "T" ou "Ceint." pour la taille, "P" ou "Poit." pour la poitrine, "E" ou "Ep." pour l'épaule, "H" pour les hanches, "L" suivi du vêtement pour une longueur, "Manch." pour la manche.
Une mesure que tu ne sais pas placer va dans "autres" avec le libellé tel qu'écrit.
N'invente rien : un chiffre illisible reste null et tu l'expliques dans "doute".
Le genre est "inconnu" si rien ne l'indique (prénom ambigu, aucune mesure spécifique).`;

export class ExtractionImpossible extends Error {}

export async function extraireCarnet(image: { data: string; mediaType: "image/jpeg" | "image/png" | "image/webp" }): Promise<Extraction> {
  try {
    const reponse = await api().beta.messages.parse({
      model: "claude-opus-5-5",
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "medium", format: betaZodOutputFormat(ExtractionSchema) },
      system: SYSTEME,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: image.mediaType, data: image.data } },
            { type: "text", text: "Relève les clients et leurs mesures sur cette page." },
          ],
        },
      ],
    });
    if (reponse.stop_reason === "refusal") throw new ExtractionImpossible("La photo n'a pas pu être analysée.");
    if (reponse.stop_reason === "max_tokens") throw new ExtractionImpossible("Page trop chargée : photographiez une moitié de page.");
    if (!reponse.parsed_output) throw new ExtractionImpossible("Lecture impossible. Reprenez la photo avec plus de lumière.");
    return reponse.parsed_output;
  } catch (e) {
    if (e instanceof ExtractionImpossible) throw e;
    if (e instanceof Anthropic.AuthenticationError) throw new ExtractionImpossible("Clé API Anthropic absente ou invalide (ANTHROPIC_API_KEY).");
    if (e instanceof Anthropic.RateLimitError) throw new ExtractionImpossible("Service saturé, réessayez dans une minute.");
    if (e instanceof Anthropic.BadRequestError) throw new ExtractionImpossible("Image refusée : envoyez une photo JPEG ou PNG.");
    if (e instanceof Anthropic.APIConnectionError) throw new ExtractionImpossible("Pas de connexion au service de lecture. Réessayez.");
    throw e;
  }
}
