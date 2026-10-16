export const STATUTS = ["RECU", "EN_COURS", "PRET", "LIVRE"] as const;
export type Statut = (typeof STATUTS)[number];

export const LIBELLES: Record<Statut, string> = {
  RECU: "Reçu",
  EN_COURS: "En couture",
  PRET: "Prêt",
  LIVRE: "Livré",
};

export function estStatut(s: string): s is Statut {
  return (STATUTS as readonly string[]).includes(s);
}

export function statutSuivant(s: Statut): Statut | null {
  const i = STATUTS.indexOf(s);
  return i < STATUTS.length - 1 ? STATUTS[i + 1] : null;
}

export function statutPrecedent(s: Statut): Statut | null {
  const i = STATUTS.indexOf(s);
  return i > 0 ? STATUTS[i - 1] : null;
}
