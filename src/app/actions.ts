"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { hacherPin, pinValide, verifierPin } from "@/lib/pin";
import { atelierConnecte, fermerSession, ouvrirSession } from "@/lib/session";
import { normaliserTelephone } from "@/lib/telephone";
import { nouveauToken } from "@/lib/token";
import { mesuresDepuisFormulaire } from "@/lib/mesures";
import { depuisInputDate } from "@/lib/format";
import { estStatut } from "@/lib/statut";

const txt = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const entier = (f: FormData, k: string) => {
  const n = parseInt(txt(f, k).replace(/\s/g, ""), 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
};
const erreur = (chemin: string, msg: string): never =>
  redirect(`${chemin}${chemin.includes("?") ? "&" : "?"}erreur=${encodeURIComponent(msg)}`);

// --- Limitation des essais de PIN (mémoire du process : suffisant pour un seul serveur) ---
const essais = new Map<string, { n: number; jusqua: number }>();
function bloque(tel: string) {
  const e = essais.get(tel);
  return !!e && e.n >= 5 && e.jusqua > Date.now();
}
function echec(tel: string) {
  const e = essais.get(tel);
  const n = e && e.jusqua > Date.now() ? e.n + 1 : 1;
  essais.set(tel, { n, jusqua: Date.now() + 15 * 60_000 });
}

// ---------------- Compte ----------------

export async function inscription(f: FormData) {
  const nom = txt(f, "nom");
  const telephone = normaliserTelephone(txt(f, "telephone"));
  const pin = txt(f, "pin");
  if (!nom) erreur("/inscription", "Donnez le nom de l'atelier.");
  if (!telephone) erreur("/inscription", "Numéro de téléphone invalide.");
  if (!pinValide(pin)) erreur("/inscription", "Le code doit faire 4 à 6 chiffres.");
  if (pin !== txt(f, "pin2")) erreur("/inscription", "Les deux codes ne sont pas identiques.");
  if (await db.atelier.findUnique({ where: { telephone: telephone! } }))
    erreur("/inscription", "Ce numéro a déjà un compte. Connectez-vous.");

  const a = await db.atelier.create({
    data: { nom, telephone: telephone!, pinHash: hacherPin(pin), quartier: txt(f, "quartier") || null },
  });
  await ouvrirSession(a.id);
  redirect("/app");
}

export async function connexion(f: FormData) {
  const telephone = normaliserTelephone(txt(f, "telephone"));
  const pin = txt(f, "pin");
  if (!telephone) erreur("/connexion", "Numéro de téléphone invalide.");
  if (bloque(telephone!)) erreur("/connexion", "Trop d'essais. Réessayez dans 15 minutes.");
  const a = await db.atelier.findUnique({ where: { telephone: telephone! } });
  if (!a || !verifierPin(pin, a.pinHash)) {
    echec(telephone!);
    erreur("/connexion", "Numéro ou code incorrect.");
  }
  essais.delete(telephone!);
  await ouvrirSession(a!.id);
  redirect("/app");
}

export async function deconnexion() {
  await fermerSession();
  redirect("/");
}

export async function majAtelier(f: FormData) {
  const a = await atelierConnecte();
  const capacite = entier(f, "capaciteSemaine");
  await db.atelier.update({
    where: { id: a.id },
    data: {
      nom: txt(f, "nom") || a.nom,
      quartier: txt(f, "quartier") || null,
      capaciteSemaine: capacite || a.capaciteSemaine,
    },
  });
  redirect("/app/reglages?ok=1");
}

// ---------------- Clients ----------------

export async function creerClient(f: FormData) {
  const a = await atelierConnecte();
  const nom = txt(f, "nom");
  if (!nom) erreur("/app/clients/nouveau", "Le nom du client est obligatoire.");
  const telSaisi = txt(f, "telephone");
  const telephone = telSaisi ? normaliserTelephone(telSaisi) : null;
  if (telSaisi && !telephone) erreur("/app/clients/nouveau", "Numéro de téléphone invalide.");

  const mesures = mesuresDepuisFormulaire(f);
  const c = await db.client.create({
    data: {
      atelierId: a.id,
      nom,
      telephone,
      genre: txt(f, "genre") === "H" ? "H" : "F",
      notes: txt(f, "notes") || null,
      carnetToken: nouveauToken(),
      mesures: Object.keys(mesures).length ? { create: { valeurs: JSON.stringify(mesures) } } : undefined,
    },
  });
  redirect(txt(f, "suite") === "commande" ? `/app/commandes/nouvelle?client=${c.id}` : `/app/clients/${c.id}`);
}

export async function majClient(f: FormData) {
  const a = await atelierConnecte();
  const id = txt(f, "id");
  const c = await db.client.findFirst({ where: { id, atelierId: a.id } });
  if (!c) redirect("/app/clients");
  const telSaisi = txt(f, "telephone");
  const telephone = telSaisi ? normaliserTelephone(telSaisi) : null;
  if (telSaisi && !telephone) erreur(`/app/clients/${id}/modifier`, "Numéro de téléphone invalide.");
  await db.client.update({
    where: { id },
    data: {
      nom: txt(f, "nom") || c!.nom,
      telephone,
      genre: txt(f, "genre") === "H" ? "H" : "F",
      notes: txt(f, "notes") || null,
    },
  });
  redirect(`/app/clients/${id}`);
}

export async function nouvellesMesures(f: FormData) {
  const a = await atelierConnecte();
  const id = txt(f, "clientId");
  const c = await db.client.findFirst({ where: { id, atelierId: a.id } });
  if (!c) redirect("/app/clients");
  const mesures = mesuresDepuisFormulaire(f);
  if (!Object.keys(mesures).length) erreur(`/app/clients/${id}/mesures`, "Saisissez au moins une mesure.");
  await db.mesureSet.create({ data: { clientId: id, valeurs: JSON.stringify(mesures), note: txt(f, "note") || null } });
  redirect(`/app/clients/${id}`);
}

// ---------------- Commandes ----------------

export async function creerCommande(f: FormData) {
  const a = await atelierConnecte();
  const clientId = txt(f, "clientId");
  const retour = `/app/commandes/nouvelle?client=${clientId}`;
  const c = await db.client.findFirst({ where: { id: clientId, atelierId: a.id } });
  if (!c) erreur("/app/commandes/nouvelle", "Choisissez un client.");
  const modele = txt(f, "modele");
  if (!modele) erreur(retour, "Décrivez le modèle.");
  const date = depuisInputDate(txt(f, "dateLivraison"));
  if (!date) erreur(retour, "Date de livraison invalide.");

  const acompte = entier(f, "acompte");
  const moyen = txt(f, "moyen") || "ESPECES";
  const cmd = await db.commande.create({
    data: {
      atelierId: a.id,
      clientId,
      modele,
      quantite: entier(f, "quantite") || 1,
      prix: entier(f, "prix"),
      dateLivraison: date!,
      notes: txt(f, "notes") || null,
      suiviToken: nouveauToken(),
      paiements: acompte ? { create: { montant: acompte, moyen } } : undefined,
    },
  });
  redirect(`/app/commandes/${cmd.id}?nouvelle=1`);
}

export async function changerStatut(f: FormData) {
  const a = await atelierConnecte();
  const id = txt(f, "id");
  const statut = txt(f, "statut");
  if (!estStatut(statut)) return;
  const cmd = await db.commande.findFirst({ where: { id, atelierId: a.id } });
  if (!cmd) return;
  await db.commande.update({
    where: { id },
    data: {
      statut,
      pretLe: statut === "PRET" ? (cmd.pretLe ?? new Date()) : cmd.pretLe,
      livreLe: statut === "LIVRE" ? new Date() : null,
    },
  });
  revalidatePath("/app", "layout");
  redirect(`/app/commandes/${id}${statut === "PRET" ? "?pret=1" : ""}`);
}

export async function ajouterPaiement(f: FormData) {
  const a = await atelierConnecte();
  const id = txt(f, "commandeId");
  const montant = entier(f, "montant");
  const cmd = await db.commande.findFirst({ where: { id, atelierId: a.id } });
  if (!cmd) redirect("/app/commandes");
  if (!montant) erreur(`/app/commandes/${id}`, "Montant invalide.");
  const moyen = ["WAVE", "ORANGE_MONEY", "ESPECES"].includes(txt(f, "moyen")) ? txt(f, "moyen") : "ESPECES";
  await db.paiement.create({ data: { commandeId: id, montant, moyen } });
  redirect(`/app/commandes/${id}`);
}

export async function majCommande(f: FormData) {
  const a = await atelierConnecte();
  const id = txt(f, "id");
  const cmd = await db.commande.findFirst({ where: { id, atelierId: a.id } });
  if (!cmd) redirect("/app/commandes");
  const date = depuisInputDate(txt(f, "dateLivraison"));
  if (!date) erreur(`/app/commandes/${id}`, "Date de livraison invalide.");
  await db.commande.update({
    where: { id },
    data: {
      modele: txt(f, "modele") || cmd!.modele,
      quantite: entier(f, "quantite") || cmd!.quantite,
      prix: entier(f, "prix"),
      dateLivraison: date!,
      notes: txt(f, "notes") || null,
    },
  });
  redirect(`/app/commandes/${id}`);
}

export async function supprimerCommande(f: FormData) {
  const a = await atelierConnecte();
  await db.commande.deleteMany({ where: { id: txt(f, "id"), atelierId: a.id } });
  redirect("/app/commandes");
}
