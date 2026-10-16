/**
 * Normalise un numéro sénégalais vers le format international sans "+".
 * "77 123 45 67", "+221771234567", "00221 77..." -> "221771234567".
 * Retourne null si le numéro n'est pas exploitable.
 */
export function normaliserTelephone(saisie: string): string | null {
  let n = saisie.replace(/[^\d+]/g, "");
  if (n.startsWith("+")) n = n.slice(1);
  else if (n.startsWith("00")) n = n.slice(2);

  // Numéro local à 9 chiffres (mobiles 70/75/76/77/78, fixes 33)
  if (/^(7[05678]|33)\d{7}$/.test(n)) return "221" + n;
  if (/^221(7[05678]|33)\d{7}$/.test(n)) return n;
  // Autres pays : on accepte un numéro international plausible
  if (!n.startsWith("221") && /^\d{10,15}$/.test(n)) return n;
  return null;
}

/** "221771234567" -> "77 123 45 67" */
export function afficherTelephone(n: string): string {
  if (/^221\d{9}$/.test(n)) {
    const l = n.slice(3);
    return `${l.slice(0, 2)} ${l.slice(2, 5)} ${l.slice(5, 7)} ${l.slice(7)}`;
  }
  return "+" + n;
}
