import Link from "next/link";
import { db } from "@/lib/db";
import { atelierConnecte } from "@/lib/session";
import { chargeParSemaine } from "@/lib/capacite";
import { dateCourte, versInputDate } from "@/lib/format";
import { afficherTelephone } from "@/lib/telephone";
import { creerCommande } from "../../../actions";
import { Alerte } from "@/components/Alerte";

export default async function NouvelleCommande({ searchParams }: { searchParams: Promise<{ client?: string; erreur?: string; q?: string }> }) {
  const a = await atelierConnecte();
  const { client: clientId, erreur, q = "" } = await searchParams;
  const client = clientId ? await db.client.findFirst({ where: { id: clientId, atelierId: a.id } }) : null;

  // Étape 1 : choisir le client
  if (!client) {
    const clients = await db.client.findMany({
      where: { atelierId: a.id, ...(q.trim() ? { nom: { contains: q.trim() } } : {}) },
      orderBy: { createdAt: "desc" },
      take: 30,
    });
    return (
      <main className="page">
        <h1>Nouvelle commande</h1>
        <p className="muted">Pour quel client ?</p>
        <Alerte erreur={erreur} />
        <Link className="btn block" href="/app/clients/nouveau">＋ Nouveau client</Link>
        <form style={{ margin: "12px 0" }}><input name="q" type="search" placeholder="Rechercher un client existant" defaultValue={q} /></form>
        <ul className="list">
          {clients.map((c) => (
            <li key={c.id}>
              <Link className="card item" href={`/app/commandes/nouvelle?client=${c.id}`}>
                <b>{c.nom}</b> <span className="small muted">{c.telephone ? afficherTelephone(c.telephone) : ""}</span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    );
  }

  // Étape 2 : détails de la commande
  const ouvertes = await db.commande.findMany({
    where: { atelierId: a.id, statut: { in: ["RECU", "EN_COURS"] } },
    select: { dateLivraison: true, quantite: true },
  });
  const charge = chargeParSemaine(ouvertes, a.capaciteSemaine, 6);
  const parDefaut = new Date(Date.now() + 14 * 86_400_000);

  return (
    <main className="page">
      <h1>Commande pour {client.nom}</h1>
      <Alerte erreur={erreur} />
      <form action={creerCommande} className="stack">
        <input type="hidden" name="clientId" value={client.id} />
        <div><label htmlFor="modele">Modèle</label><input id="modele" name="modele" required autoFocus placeholder="Grand boubou bazin, broderie col" /></div>
        <div className="grid2">
          <div><label htmlFor="quantite">Nombre de tenues</label><input id="quantite" name="quantite" inputMode="numeric" defaultValue="1" /></div>
          <div><label htmlFor="prix">Prix total (F)</label><input id="prix" name="prix" inputMode="numeric" placeholder="25000" /></div>
        </div>
        <div><label htmlFor="dateLivraison">Date de livraison promise</label><input id="dateLivraison" name="dateLivraison" type="date" required defaultValue={versInputDate(parDefaut)} /></div>
        <details className="card small">
          <summary>Charge de l&apos;atelier ({a.capaciteSemaine} tenues / semaine)</summary>
          <ul className="list" style={{ marginTop: 8 }}>
            {charge.map((s) => (
              <li key={s.debut.toISOString()} className="row between">
                <span>Sem. du {dateCourte(s.debut)}</span>
                <b className={s.tenues >= s.capacite ? "retard" : ""}>{s.tenues} / {s.capacite}{s.tenues >= s.capacite ? " — complet" : ""}</b>
              </li>
            ))}
          </ul>
        </details>
        <div className="grid2">
          <div><label htmlFor="acompte">Acompte reçu (F)</label><input id="acompte" name="acompte" inputMode="numeric" placeholder="0" /></div>
          <div><label htmlFor="moyen">Payé par</label><select id="moyen" name="moyen"><option value="WAVE">Wave</option><option value="ORANGE_MONEY">Orange Money</option><option value="ESPECES">Espèces</option></select></div>
        </div>
        <div><label htmlFor="notes">Notes (tissu, détails)</label><textarea id="notes" name="notes" placeholder="Tissu fourni par la cliente, 4 m, couleur bleu roi…" /></div>
        <button className="btn block">Enregistrer la commande</button>
      </form>
    </main>
  );
}
