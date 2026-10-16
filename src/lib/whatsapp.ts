import { fcfa, dateCourte } from "./format";

// MVP : liens wa.me pré-remplis, le tailleur appuie sur "Envoyer" depuis son WhatsApp.
// Zéro coût, zéro validation Meta. Passage à l'API WhatsApp Cloud plus tard.
export function lienWhatsApp(telephone: string, message: string): string {
  return `https://wa.me/${telephone}?text=${encodeURIComponent(message)}`;
}

type Ctx = { atelier: string; client: string; modele: string; lienSuivi: string };

export function messageRecu(c: Ctx & { dateLivraison: Date; prix: number; paye: number }): string {
  const reste = c.prix - c.paye;
  return [
    `Bonjour ${c.client}, ici ${c.atelier}.`,
    `Votre commande "${c.modele}" est bien enregistrée.`,
    `Livraison prévue : ${dateCourte(c.dateLivraison)}`,
    c.prix > 0 ? `Prix : ${fcfa(c.prix)} — déjà payé : ${fcfa(c.paye)} — reste : ${fcfa(reste)}.` : "",
    `Suivez votre tenue ici : ${c.lienSuivi}`,
  ].filter(Boolean).join("\n");
}

export function messagePret(c: Ctx & { reste: number }): string {
  return [
    `Bonjour ${c.client}, bonne nouvelle !`,
    `Votre "${c.modele}" est prêt chez ${c.atelier}.`,
    c.reste > 0 ? `Reste à payer : ${fcfa(c.reste)} (Wave, Orange Money ou espèces).` : "",
    `Détails : ${c.lienSuivi}`,
  ].filter(Boolean).join("\n");
}

export function messageCarnet(c: { atelier: string; client: string; lienCarnet: string }): string {
  return [
    `Bonjour ${c.client}, voici votre carnet de mesures enregistré chez ${c.atelier}.`,
    `Gardez ce lien, vos mesures sont sauvegardées : ${c.lienCarnet}`,
  ].join("\n");
}
