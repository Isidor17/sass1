import { describe, expect, it } from "vitest";
import { afficherTelephone, normaliserTelephone } from "./telephone";
import { hacherPin, lireSession, pinValide, signerSession, verifierPin } from "./pin";
import { chargeParSemaine, debutSemaine } from "./capacite";
import { depuisInputDate, fcfa, joursRestants } from "./format";
import { CHAMPS_DEFAUT, champsAtelier, cleDepuisLibelle, libelleDe, mesuresAffichees, mesuresDepuisFormulaire, validerChamps } from "./mesures";
import { statutPrecedent, statutSuivant } from "./statut";
import { lienWhatsApp, messagePret } from "./whatsapp";

describe("téléphone", () => {
  it("normalise les formats sénégalais", () => {
    for (const s of ["77 123 45 67", "771234567", "+221 77 123 45 67", "00221771234567", "221-77-123-45-67"])
      expect(normaliserTelephone(s)).toBe("221771234567");
    expect(normaliserTelephone("33 820 00 00")).toBe("221338200000");
  });
  it("rejette les numéros invalides", () => {
    expect(normaliserTelephone("12345")).toBeNull();
    expect(normaliserTelephone("221 99 123 45 67")).toBeNull();
    expect(normaliserTelephone("")).toBeNull();
  });
  it("accepte un numéro étranger", () => {
    expect(normaliserTelephone("+33 6 12 34 56 78")).toBe("33612345678");
  });
  it("affiche au format local", () => {
    expect(afficherTelephone("221771234567")).toBe("77 123 45 67");
  });
});

describe("PIN et session", () => {
  it("hache et vérifie", () => {
    const h = hacherPin("1234");
    expect(verifierPin("1234", h)).toBe(true);
    expect(verifierPin("1235", h)).toBe(false);
    expect(verifierPin("1234", "corrompu")).toBe(false);
  });
  it("valide le format", () => {
    expect(pinValide("1234")).toBe(true);
    expect(pinValide("123")).toBe(false);
    expect(pinValide("12a4")).toBe(false);
  });
  it("signe et relit une session, refuse la falsification et l'expiration", () => {
    const s = signerSession("abc", "secret-de-test-123", 1000, 0);
    expect(lireSession(s, "secret-de-test-123", 500)).toBe("abc");
    expect(lireSession(s, "secret-de-test-123", 2000)).toBeNull();
    expect(lireSession(s, "autre-secret-xxxxx", 500)).toBeNull();
    expect(lireSession(s.replace("abc", "xyz"), "secret-de-test-123", 500)).toBeNull();
    expect(lireSession(undefined, "secret-de-test-123")).toBeNull();
  });
});

describe("capacité", () => {
  it("le début de semaine est un lundi", () => {
    expect(debutSemaine(new Date("2026-10-18T10:00:00Z")).toISOString()).toBe("2026-10-12T00:00:00.000Z"); // dimanche
    expect(debutSemaine(new Date("2026-10-12T10:00:00Z")).toISOString()).toBe("2026-10-12T00:00:00.000Z"); // lundi
  });
  it("répartit les tenues et compte les retards dans la semaine courante", () => {
    const now = new Date("2026-10-14T12:00:00Z");
    const s = chargeParSemaine(
      [
        { dateLivraison: new Date("2026-10-01T12:00:00Z"), quantite: 2 }, // en retard
        { dateLivraison: new Date("2026-10-16T12:00:00Z"), quantite: 1 },
        { dateLivraison: new Date("2026-10-21T12:00:00Z"), quantite: 3 },
        { dateLivraison: new Date("2027-01-01T12:00:00Z"), quantite: 5 }, // hors fenêtre
      ],
      10, 4, now,
    );
    expect(s.map((x) => x.tenues)).toEqual([3, 3, 0, 0]);
  });
});

describe("format", () => {
  it("formate les FCFA", () => {
    expect(fcfa(25000)).toBe("25 000 F");
  });
  it("lit les dates de formulaire", () => {
    expect(depuisInputDate("2026-12-01")?.toISOString()).toBe("2026-12-01T12:00:00.000Z");
    expect(depuisInputDate("01/12/2026")).toBeNull();
  });
  it("compte les jours restants", () => {
    const now = new Date("2026-10-14T23:00:00Z");
    expect(joursRestants(new Date("2026-10-15T01:00:00Z"), now)).toBe(1);
    expect(joursRestants(new Date("2026-10-12T12:00:00Z"), now)).toBe(-2);
  });
});

describe("mesures", () => {
  it("lit le formulaire, accepte la virgule, ignore les valeurs absurdes", () => {
    const f = new FormData();
    f.set("m_poitrine", "92,5");
    f.set("m_taille", "74");
    f.set("m_hanches", "abc");
    f.set("m_cou", "-3");
    f.set("m_epaule", "");
    expect(mesuresDepuisFormulaire(f, CHAMPS_DEFAUT)).toEqual({ poitrine: 92.5, taille: 74 });
  });
});

describe("statuts et WhatsApp", () => {
  it("enchaîne les statuts", () => {
    expect(statutSuivant("RECU")).toBe("EN_COURS");
    expect(statutSuivant("LIVRE")).toBeNull();
    expect(statutPrecedent("RECU")).toBeNull();
    expect(statutPrecedent("PRET")).toBe("EN_COURS");
  });
  it("construit un lien wa.me encodé", () => {
    const msg = messagePret({ atelier: "Couture Fatou", client: "Awa", modele: "Boubou", lienSuivi: "https://x/s/1", reste: 5000 });
    expect(msg).toContain("5 000 F");
    const l = lienWhatsApp("221771234567", msg);
    expect(l.startsWith("https://wa.me/221771234567?text=")).toBe(true);
    expect(decodeURIComponent(l.split("text=")[1])).toBe(msg);
  });
});

describe("import photo", () => {
  it("convertit l'extraction en brouillons propres, selon les champs de l'atelier", async () => {
    const { versBrouillons, schemaExtraction } = await import("./extraction");
    const champs = [...CHAMPS_DEFAUT.slice(0, 4), { cle: "perso_carrure", libelle: "Carrure", genres: ["F", "H"] as ("F" | "H")[] }];
    const vide = Object.fromEntries(champs.map((c) => [c.cle, null]));
    const e = schemaExtraction(champs).parse({
      remarque: null,
      clients: [
        { nom: " Awa Diop ", telephone: "77 123 45 67", genre: "inconnu", mesures: { ...vide, poitrine: 92.46, taille: 0, epaule: 900, perso_carrure: 40 }, autres: [{ libelle: "Bassin", valeur: "100" }], doute: null },
        { nom: "  ", telephone: null, genre: "H", mesures: vide, autres: [], doute: null },
        { nom: "Modou", telephone: "abc", genre: "H", mesures: { ...vide, cou: 41 }, autres: [], doute: "Manche illisible" },
      ],
    });
    const b = versBrouillons(e, champs);
    expect(b).toHaveLength(2);
    expect(b[0]).toEqual({ nom: "Awa Diop", telephone: "221771234567", genre: "F", mesures: { poitrine: 92.5, perso_carrure: 40 }, notes: "Bassin : 100", doute: null });
    expect(b[1].genre).toBe("H");
    expect(b[1].telephone).toBeNull();
    expect(b[1].doute).toBe("Manche illisible");
  });
  it("le schéma refuse une extraction sans les champs de l'atelier", async () => {
    const { schemaExtraction } = await import("./extraction");
    const r = schemaExtraction(CHAMPS_DEFAUT.slice(0, 1)).safeParse({ remarque: null, clients: [{ nom: "A", telephone: null, genre: "F", mesures: {}, autres: [], doute: null }] });
    expect(r.success).toBe(false);
  });
  it("lit les mesures préfixées d'un formulaire multi-clients", () => {
    const f = new FormData();
    f.set("c1_m_taille", "70");
    f.set("m_taille", "99");
    expect(mesuresDepuisFormulaire(f, CHAMPS_DEFAUT, "c1_")).toEqual({ taille: 70 });
  });
});

describe("mesures personnalisées", () => {
  it("valide et nettoie une liste", () => {
    expect(validerChamps([
      { cle: "taille", libelle: "  Ceinture ", genres: ["F", "H"] },
      { cle: "taille", libelle: "Doublon", genres: ["F"] },
      { cle: "Mauvaise Clé", libelle: "X" },
      { cle: "perso_bassin", libelle: "", genres: ["F"] },
      { cle: "perso_genou", libelle: "Genou", genres: ["Z"] },
      { cle: "perso_robe", libelle: "Robe", genres: ["F"] },
    ])).toEqual([
      { cle: "taille", libelle: "Ceinture", genres: ["F", "H"] },
      { cle: "perso_genou", libelle: "Genou", genres: ["F", "H"] },
      { cle: "perso_robe", libelle: "Robe", genres: ["F"] },
    ]);
    expect(validerChamps([])).toBeNull();
    expect(validerChamps("x")).toBeNull();
  });
  it("revient à la liste par défaut si rien n'est réglé ou si le JSON est abîmé", () => {
    expect(champsAtelier(null)).toBe(CHAMPS_DEFAUT);
    expect(champsAtelier("{pas du json")).toBe(CHAMPS_DEFAUT);
    expect(champsAtelier(JSON.stringify([{ cle: "cou", libelle: "Cou", genres: ["H"] }]))).toEqual([{ cle: "cou", libelle: "Cou", genres: ["H"] }]);
  });
  it("fabrique des clés uniques à partir du libellé", () => {
    expect(cleDepuisLibelle("Tour de poitrine haute", [])).toBe("perso_tour_de_poitrine_haute");
    expect(cleDepuisLibelle("Épaule", ["perso_epaule"])).toBe("perso_epaule_2");
    expect(cleDepuisLibelle("!!!", [])).toBe("perso_mesure");
  });
  it("affiche aussi les mesures retirées de la liste, avec un libellé lisible", () => {
    const champs = [{ cle: "taille", libelle: "Ceinture", genres: ["F", "H"] as ("F" | "H")[] }];
    expect(mesuresAffichees({ perso_tour_genou: 38, taille: 70, entrejambe: 80 }, champs)).toEqual([
      { cle: "taille", libelle: "Ceinture", valeur: 70 },
      { cle: "perso_tour_genou", libelle: "Tour genou", valeur: 38 },
      { cle: "entrejambe", libelle: "Entrejambe", valeur: 80 },
    ]);
    expect(libelleDe("perso_bassin_2")).toBe("Bassin");
  });
});
