// Données de démo : atelier "Couture Démo", tél 77 000 00 00, code 1234.
import { PrismaClient } from "@prisma/client";
import { hacherPin } from "../src/lib/pin";
import { nouveauToken } from "../src/lib/token";

const db = new PrismaClient();
const jours = (n: number) => new Date(Date.now() + n * 86_400_000);

async function main() {
  await db.atelier.deleteMany({ where: { telephone: "221770000000" } });
  const a = await db.atelier.create({
    data: { nom: "Couture Démo", telephone: "221770000000", pinHash: hacherPin("1234"), quartier: "HLM", capaciteSemaine: 10 },
  });
  const clients = [
    { nom: "Awa Ndiaye", telephone: "221771112233", genre: "F", m: { epaule: 38, poitrine: 92, taille: 74, hanches: 102, longueur_boubou: 145, manche: 58 } },
    { nom: "Moussa Diop", telephone: "221782223344", genre: "H", m: { cou: 40, epaule: 46, poitrine: 104, longueur_boubou: 150, manche: 64, longueur_pantalon: 104 } },
    { nom: "Fatou Sall", telephone: "221763334455", genre: "F", m: { poitrine: 96, taille: 80, hanches: 108, longueur_jupe: 105 } },
  ];
  const ids: string[] = [];
  for (const c of clients) {
    const r = await db.client.create({
      data: { atelierId: a.id, nom: c.nom, telephone: c.telephone, genre: c.genre, carnetToken: nouveauToken(), mesures: { create: { valeurs: JSON.stringify(c.m) } } },
    });
    ids.push(r.id);
  }
  // Awa : mesures prises il y a 14 mois, après une première prise il y a 2 ans (démo de l'alerte et de l'historique).
  const awa = await db.mesureSet.findFirstOrThrow({ where: { clientId: ids[0] } });
  await db.mesureSet.update({ where: { id: awa.id }, data: { createdAt: jours(-425), note: "Avant la Tabaski" } });
  await db.mesureSet.create({
    data: { clientId: ids[0], createdAt: jours(-730), valeurs: JSON.stringify({ epaule: 37, poitrine: 88, taille: 70, hanches: 98, longueur_boubou: 145, manche: 58 }) },
  });
  const cmds = [
    { c: 0, modele: "Taille basse wax", prix: 15000, j: -2, statut: "EN_COURS", acompte: 5000 },
    { c: 1, modele: "Grand boubou bazin", prix: 35000, j: 3, statut: "RECU", acompte: 15000, q: 1 },
    { c: 2, modele: "Robe soirée", prix: 25000, j: 6, statut: "EN_COURS", acompte: 0 },
    { c: 0, modele: "Ensemble Tabaski (3 tenues)", prix: 60000, j: 10, statut: "RECU", acompte: 30000, q: 3 },
    { c: 1, modele: "Caftan", prix: 20000, j: 0, statut: "PRET", acompte: 20000 },
  ];
  for (const o of cmds) {
    await db.commande.create({
      data: {
        atelierId: a.id, clientId: ids[o.c], modele: o.modele, prix: o.prix, quantite: o.q ?? 1,
        dateLivraison: jours(o.j), statut: o.statut, suiviToken: nouveauToken(),
        paiements: o.acompte ? { create: { montant: o.acompte, moyen: "WAVE" } } : undefined,
      },
    });
  }
  console.log("Démo prête : tél 77 000 00 00, code 1234");
}

main().finally(() => db.$disconnect());
