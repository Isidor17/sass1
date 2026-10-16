import { randomBytes } from "node:crypto";

/** Jeton public non devinable pour les liens de suivi / carnet (base64url, 16 octets). */
export function nouveauToken(): string {
  return randomBytes(16).toString("base64url");
}
