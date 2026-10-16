import { describe, expect, it } from "vitest";
import { afficherTelephone, normaliserTelephone } from "./telephone";
import { hacherPin, lireSession, pinValide, signerSession, verifierPin } from "./pin";
import { chargeParSemaine, debutSemaine } from "./capacite";
import { depuisInputDate, fcfa, joursRestants } from "./format";
import { mesuresDepuisFormulaire } from "./mesures";
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
    expect(mesuresDepuisFormulaire(f)).toEqual({ poitrine: 92.5, taille: 74 });
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
