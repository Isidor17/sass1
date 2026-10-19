export function fcfa(montant: number): string {
  return new Intl.NumberFormat("fr-FR").format(montant).replace(/ | /g, " ") + " F";
}

/** « mer. 20 août », avec l'année si elle diffère de l'année en cours (« mer. 20 août 2025 »). */
export function dateCourte(d: Date, maintenant = new Date()): string {
  const autreAnnee = d.getUTCFullYear() !== maintenant.getUTCFullYear();
  return d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short", ...(autreAnnee ? { year: "numeric" } : {}), timeZone: "Africa/Dakar" });
}

/** Valeur pour <input type="date"> */
export function versInputDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Lit une date "AAAA-MM-JJ" et la place à midi UTC pour éviter les décalages de jour. */
export function depuisInputDate(s: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const d = new Date(s + "T12:00:00Z");
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Nombre de jours calendaires entre aujourd'hui et la date (négatif = en retard). */
export function joursRestants(d: Date, maintenant = new Date()): number {
  const jour = (x: Date) => Date.UTC(x.getUTCFullYear(), x.getUTCMonth(), x.getUTCDate());
  return Math.round((jour(d) - jour(maintenant)) / 86_400_000);
}
