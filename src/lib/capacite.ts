// Charge de l'atelier par semaine : aide à refuser ou décaler une commande avant le rush (Tabaski, Korité).

export type Semaine = { debut: Date; tenues: number; capacite: number };

/** Lundi 00:00 UTC de la semaine contenant d. */
export function debutSemaine(d: Date): Date {
  const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const jour = (x.getUTCDay() + 6) % 7; // lundi = 0
  x.setUTCDate(x.getUTCDate() - jour);
  return x;
}

export function chargeParSemaine(
  commandes: { dateLivraison: Date; quantite: number }[],
  capacite: number,
  nbSemaines = 6,
  maintenant = new Date(),
): Semaine[] {
  const premiere = debutSemaine(maintenant);
  const semaines: Semaine[] = Array.from({ length: nbSemaines }, (_, i) => {
    const debut = new Date(premiere);
    debut.setUTCDate(debut.getUTCDate() + i * 7);
    return { debut, tenues: 0, capacite };
  });
  for (const c of commandes) {
    // Les commandes en retard comptent dans la semaine courante : elles restent à faire.
    const s = debutSemaine(c.dateLivraison) < premiere ? premiere : debutSemaine(c.dateLivraison);
    const i = Math.round((s.getTime() - premiere.getTime()) / (7 * 86_400_000));
    if (i >= 0 && i < nbSemaines) semaines[i].tenues += c.quantite;
  }
  return semaines;
}
