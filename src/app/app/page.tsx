import Link from "next/link";
import { db } from "@/lib/db";
import { atelierConnecte } from "@/lib/session";
import { chargeParSemaine } from "@/lib/capacite";
import { dateCourte, fcfa, joursRestants } from "@/lib/format";
import { LigneCommande } from "@/components/LigneCommande";

function salutation() {
  const h = Number(new Date().toLocaleString("fr-FR", { hour: "numeric", hour12: false, timeZone: "Africa/Dakar" }));
  return h < 12 ? "Bonjour 👋" : h < 18 ? "Bon après-midi 👋" : "Bonsoir 👋";
}

export default async function Tableau() {
  const a = await atelierConnecte();
  const ouvertes = await db.commande.findMany({
    where: { atelierId: a.id, statut: { in: ["RECU", "EN_COURS", "PRET"] } },
    include: { client: true, paiements: true },
    orderBy: { dateLivraison: "asc" },
  });

  const aFaire = ouvertes.filter((c) => c.statut !== "PRET");
  const enRetard = aFaire.filter((c) => joursRestants(c.dateLivraison) < 0);
  const semaine = aFaire.filter((c) => { const j = joursRestants(c.dateLivraison); return j >= 0 && j <= 7; });
  const prets = ouvertes.filter((c) => c.statut === "PRET");
  const resteAEncaisser = ouvertes.reduce((s, c) => s + Math.max(0, c.prix - c.paiements.reduce((t, p) => t + p.montant, 0)), 0);
  const charge = chargeParSemaine(aFaire, a.capaciteSemaine);
  const urgentes = [...enRetard, ...semaine].slice(0, 8);

  return (
    <main className="page">
      <section className="synthese">
        <div className="l-motif" aria-hidden="true" />
        <h1>{salutation()}</h1>
        <p>{ouvertes.length} commande{ouvertes.length > 1 ? "s" : ""} en cours chez {a.nom}</p>
        <div className="kpis">
          <Link href="/app/commandes?filtre=retard"><b className={enRetard.length ? "alerte-kpi" : ""}>{enRetard.length}</b><span>en retard</span></Link>
          <Link href="/app/commandes?filtre=semaine"><b>{semaine.length}</b><span>sous 7 jours</span></Link>
          <Link href="/app/commandes?statut=PRET"><b>{prets.length}</b><span>prêtes</span></Link>
        </div>
        <div className="encaisser"><span>Reste à encaisser</span><b>{fcfa(resteAEncaisser)}</b></div>
      </section>

      <h2>À faire en priorité</h2>
      {urgentes.length === 0 ? (
        <p className="muted">Rien d&apos;urgent. <Link href="/app/commandes/nouvelle">Ajouter une commande</Link></p>
      ) : (
        <ul className="list">
          {urgentes.map((c) => <li key={c.id}><LigneCommande c={c} /></li>)}
        </ul>
      )}

      <h2>Charge des prochaines semaines</h2>
      <p className="small muted">Capacité : {a.capaciteSemaine} tenues / semaine. Au-delà, acceptez avec une date plus tardive.</p>
      <div className="card stack">
        {charge.map((s) => {
          const pct = Math.min(100, Math.round((s.tenues / Math.max(1, s.capacite)) * 100));
          return (
            <div key={s.debut.toISOString()}>
              <div className="row between small"><span>Semaine du {dateCourte(s.debut)}</span><b className={s.tenues > s.capacite ? "retard" : ""}>{s.tenues} / {s.capacite}</b></div>
              <div className={`barre${s.tenues > s.capacite ? " plein" : ""}`}><i style={{ width: `${pct}%` }} /></div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
