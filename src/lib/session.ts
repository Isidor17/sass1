import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";
import { lireSession, signerSession } from "./pin";

const COOKIE = "atelier_session";

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 16) throw new Error("SESSION_SECRET manquant ou trop court (16 caractères minimum)");
  return s;
}

export async function ouvrirSession(atelierId: string) {
  const store = await cookies();
  store.set(COOKIE, signerSession(atelierId, secret()), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 86_400,
  });
}

export async function fermerSession() {
  (await cookies()).delete(COOKIE);
}

/** Atelier connecté, ou redirection vers /connexion. */
export async function atelierConnecte() {
  const id = lireSession((await cookies()).get(COOKIE)?.value, secret());
  const atelier = id ? await db.atelier.findUnique({ where: { id } }) : null;
  if (!atelier) redirect("/connexion");
  return atelier;
}

export async function atelierIdOptionnel(): Promise<string | null> {
  return lireSession((await cookies()).get(COOKIE)?.value, secret());
}

export function urlApp(): string {
  return (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
}
