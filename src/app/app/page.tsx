import Link from "next/link";
import { db } from "@/lib/db";
import { atelierConnecte } from "@/lib/session";
import { chargeParSemaine } from "@/lib/capacite";
import { dateCourte, fcfa, joursRestants } from "@/lib/format";
import { StatutBadge } from "@/components/StatutBadge";
import { Echeance } from "@/components/Echeance";

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
      <h1>{a.nom}</h1>
      <p className="muted small">{ouvertes.length} commande(s) en cours · {fcfa(resteAEncaisser)} à encaisser</p>

      <div className="kpis" style={{ marginTop: 12 }}>
        <Link href="/app/commandes?filtre=retard" className="card kpi item"><b className={enRetard.length ? "retard" : ""}>{enRetard.length}</b><span>en retard</span></Link>
        <Link href="/app/commandes?filtre=semaine" className="card kpi item"><b>{semaine.length}</b><span>à livrer sous 7 j</span></Link>
        <Link href="/app/commandes?statut=PRET" className="card kpi item"><b>{prets.length}</b><span>prêts à récupérer</span></Link>
      </div>

      <h2>À faire en priorité</h2>
      {urgentes.length === 0 ? (
        <p className="muted">Rien d&apos;urgent. <Link href="/app/commandes/nouvelle">Ajouter une commande</Link></p>
      ) : (
        <ul className="list">
          {urgentes.map((c) => (
            <li key={c.id}>
              <Link href={`/app/commandes/${c.id}`} className="card item">
                <div className="row between"><b>{c.client.nom}</b><StatutBadge statut={c.statut} /></div>
                <div className="small">{c.modele}{c.quantite > 1 ? ` ×${c.quantite}` : ""}</div>
                <div className="small"><Echeance date={c.dateLivraison} statut={c.statut} /></div>
              </Link>
            </li>
          ))}
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
