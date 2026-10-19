import type { Mesures } from "./mesures";

/** Nombre de mois entiers écoulés entre deux dates. */
export function moisEcoules(depuis: Date, maintenant = new Date()): number {
  let m = (maintenant.getUTCFullYear() - depuis.getUTCFullYear()) * 12 + (maintenant.getUTCMonth() - depuis.getUTCMonth());
  if (maintenant.getUTCDate() < depuis.getUTCDate()) m -= 1;
  return Math.max(0, m);
}

/** « 3 semaines », « 14 mois », « 2 ans »… pour dire l'âge des mesures en langage courant. */
export function ancienneteLisible(depuis: Date, maintenant = new Date()): string {
  const jours = Math.floor((maintenant.getTime() - depuis.getTime()) / 86_400_000);
  if (jours < 1) return "aujourd'hui";
  if (jours < 14) return `${jours} jour${jours > 1 ? "s" : ""}`;
  const mois = moisEcoules(depuis, maintenant);
  if (mois < 1) return `${Math.floor(jours / 7)} semaines`;
  if (mois < 24) return `${mois} mois`;
  return `${Math.floor(mois / 12)} ans`;
}

/** « aujourd'hui » ou « il y a 14 mois ». */
export function ilYa(depuis: Date, maintenant = new Date()): string {
  const a = ancienneteLisible(depuis, maintenant);
  return a === "aujourd'hui" ? a : `il y a ${a}`;
}

/** Les mesures doivent-elles être revérifiées ? validiteMois = 0 désactive l'alerte. */
export function mesuresAVerifier(prisesLe: Date | null | undefined, validiteMois: number, maintenant = new Date()): boolean {
  if (!prisesLe || validiteMois <= 0) return false;
  return moisEcoules(prisesLe, maintenant) >= validiteMois;
}

/** Écart par mesure entre une prise et la précédente (seulement les mesures présentes dans les deux). */
export function ecarts(courantes: Mesures, precedentes: Mesures | null | undefined): Record<string, number> {
  const out: Record<string, number> = {};
  if (!precedentes) return out;
  for (const [cle, v] of Object.entries(courantes)) {
    const avant = precedentes[cle];
    if (typeof avant === "number" && typeof v === "number") {
      const d = Math.round((v - avant) * 10) / 10;
      if (d !== 0) out[cle] = d;
    }
  }
  return out;
}

export function formatEcart(d: number): string {
  return (d > 0 ? "+" : "−") + String(Math.abs(d)).replace(".", ",");
}
