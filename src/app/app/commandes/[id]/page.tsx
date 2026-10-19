import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { atelierConnecte, urlApp } from "@/lib/session";
import { dateCourte, fcfa, versInputDate } from "@/lib/format";
import { LIBELLES, estStatut, statutPrecedent, statutSuivant } from "@/lib/statut";
import { lienWhatsApp, messagePret, messageRecu } from "@/lib/whatsapp";
import { ajouterPaiement, changerStatut, majCommande, supprimerCommande } from "../../../actions";
import { Alerte } from "@/components/Alerte";
import { StatutBadge } from "@/components/StatutBadge";
import { Echeance } from "@/components/Echeance";
import { Etapes } from "@/components/Etapes";

const MOYENS: Record<string, string> = { WAVE: "Wave", ORANGE_MONEY: "Orange Money", ESPECES: "Espèces" };

export default async function Commande({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ erreur?: string; nouvelle?: string; pret?: string }>;
}) {
  const a = await atelierConnecte();
  const { id } = await params;
  const sp = await searchParams;
  const c = await db.commande.findFirst({
    where: { id, atelierId: a.id },
    include: { client: true, paiements: { orderBy: { createdAt: "asc" } } },
  });
  if (!c) notFound();

  const paye = c.paiements.reduce((s, p) => s + p.montant, 0);
  const reste = Math.max(0, c.prix - paye);
  const lienSuivi = `${urlApp()}/suivi/${c.suiviToken}`;
  const ctx = { atelier: a.nom, client: c.client.nom, modele: c.modele, lienSuivi };
  const tel = c.client.telephone;
  const suivant = estStatut(c.statut) ? statutSuivant(c.statut) : null;
  const precedent = estStatut(c.statut) ? statutPrecedent(c.statut) : null;

  return (
    <main className="page">
      {sp.nouvelle && <Alerte succes="Commande enregistrée. Envoyez le reçu au client 👇" />}
      {sp.pret && <Alerte succes="Marquée prête. Prévenez le client 👇" />}
      <Alerte erreur={sp.erreur} />

      <div className="row between"><h1>{c.modele}</h1><StatutBadge statut={c.statut} /></div>
      <p className="small"><Link href={`/app/clients/${c.client.id}`}>{c.client.nom}</Link>{c.quantite > 1 ? ` · ${c.quantite} tenues` : ""}</p>
      <p className="small">Livraison : <Echeance date={c.dateLivraison} statut={c.statut} /></p>
      {c.notes && <p className="small muted">{c.notes}</p>}

      {tel ? (
        <div className="stack" style={{ margin: "12px 0" }}>
          {(c.statut === "PRET") ? (
            <a className="btn wa block" target="_blank" rel="noreferrer" href={lienWhatsApp(tel, messagePret({ ...ctx, reste }))}>Prévenir : c&apos;est prêt (WhatsApp)</a>
          ) : (
            <a className={`btn ${sp.nouvelle ? "wa" : "ghost"} block`} target="_blank" rel="noreferrer" href={lienWhatsApp(tel, messageRecu({ ...ctx, dateLivraison: c.dateLivraison, prix: c.prix, paye }))}>Envoyer le reçu (WhatsApp)</a>
          )}
        </div>
      ) : (
        <p className="small muted">Ajoutez le numéro du client pour lui envoyer les messages WhatsApp.</p>
      )}

      <h2>Avancement</h2>
      <div className="card stack">
        <Etapes statut={c.statut} />
        {suivant && (
          <form action={changerStatut}>
            <input type="hidden" name="id" value={c.id} />
            <input type="hidden" name="statut" value={suivant} />
            <button className="btn block">Passer à « {LIBELLES[suivant]} »</button>
          </form>
        )}
        {precedent && (
          <form action={changerStatut}>
            <input type="hidden" name="id" value={c.id} />
            <input type="hidden" name="statut" value={precedent} />
            <button className="btn ghost sm">Annuler la dernière étape</button>
          </form>
        )}
      </div>

      <h2>Paiement</h2>
      <div className="card stack">
        <div className="row between"><span>Prix</span><b>{fcfa(c.prix)}</b></div>
        {c.paiements.map((p) => (
          <div key={p.id} className="row between small muted"><span>{dateCourte(p.createdAt)} · {MOYENS[p.moyen] ?? p.moyen}</span><span>− {fcfa(p.montant)}</span></div>
        ))}
        <div className="row between"><span>Reste à payer</span><b className={reste > 0 ? "retard" : ""}>{fcfa(reste)}</b></div>
        {reste > 0 && (
          <form action={ajouterPaiement} className="row">
            <input type="hidden" name="commandeId" value={c.id} />
            <input name="montant" inputMode="numeric" placeholder="Montant" defaultValue={reste} aria-label="Montant" />
            <select name="moyen" aria-label="Moyen" style={{ maxWidth: 130 }}><option value="WAVE">Wave</option><option value="ORANGE_MONEY">OM</option><option value="ESPECES">Espèces</option></select>
            <button className="btn">OK</button>
          </form>
        )}
      </div>

      <h2>Lien de suivi client</h2>
      <p className="small"><a href={lienSuivi} target="_blank" rel="noreferrer">{lienSuivi}</a></p>

      <details className="card" style={{ marginTop: 16 }}>
        <summary>Modifier la commande</summary>
        <form action={majCommande} className="stack" style={{ marginTop: 12 }}>
          <input type="hidden" name="id" value={c.id} />
          <div><label htmlFor="modele">Modèle</label><input id="modele" name="modele" defaultValue={c.modele} /></div>
          <div className="grid2">
            <div><label htmlFor="quantite">Tenues</label><input id="quantite" name="quantite" inputMode="numeric" defaultValue={c.quantite} /></div>
            <div><label htmlFor="prix">Prix (F)</label><input id="prix" name="prix" inputMode="numeric" defaultValue={c.prix} /></div>
          </div>
          <div><label htmlFor="dateLivraison">Livraison</label><input id="dateLivraison" name="dateLivraison" type="date" defaultValue={versInputDate(c.dateLivraison)} /></div>
          <div><label htmlFor="notes">Notes</label><textarea id="notes" name="notes" defaultValue={c.notes ?? ""} /></div>
          <button className="btn block">Enregistrer</button>
        </form>
        <form action={supprimerCommande} style={{ marginTop: 12 }}>
          <input type="hidden" name="id" value={c.id} />
          <button className="btn danger block">Supprimer la commande</button>
        </form>
      </details>
    </main>
  );
}
