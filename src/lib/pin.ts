import { randomBytes, scryptSync, timingSafeEqual, createHmac } from "node:crypto";

export function hacherPin(pin: string): string {
  const sel = randomBytes(16).toString("hex");
  const h = scryptSync(pin, sel, 32).toString("hex");
  return `${sel}:${h}`;
}

export function verifierPin(pin: string, stocke: string): boolean {
  const [sel, h] = stocke.split(":");
  if (!sel || !h) return false;
  const attendu = Buffer.from(h, "hex");
  const calcule = scryptSync(pin, sel, 32);
  return attendu.length === calcule.length && timingSafeEqual(attendu, calcule);
}

export function pinValide(pin: string): boolean {
  return /^\d{4,6}$/.test(pin);
}

// Session = "<atelierId>.<expiration>.<signature HMAC>"
export function signerSession(atelierId: string, secret: string, dureeMs = 60 * 86_400_000, maintenant = Date.now()): string {
  const exp = maintenant + dureeMs;
  const charge = `${atelierId}.${exp}`;
  const sig = createHmac("sha256", secret).update(charge).digest("base64url");
  return `${charge}.${sig}`;
}

export function lireSession(valeur: string | undefined, secret: string, maintenant = Date.now()): string | null {
  if (!valeur) return null;
  const parts = valeur.split(".");
  if (parts.length !== 3) return null;
  const [id, exp, sig] = parts;
  const attendu = createHmac("sha256", secret).update(`${id}.${exp}`).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(attendu);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  if (Number(exp) < maintenant) return null;
  return id;
}
