import Link from "next/link";
import { redirect } from "next/navigation";
import { atelierIdOptionnel } from "@/lib/session";

export default async function Accueil() {
  if (await atelierIdOptionnel()) redirect("/app");
  return (
    <main className="page">
      <section className="hero">
        <h1>Fini les mesures perdues et les clients qui appellent.</h1>
        <p className="muted">
          Enregistrez les mesures une fois, suivez chaque tenue, prévenez le client sur WhatsApp quand c&apos;est prêt.
        </p>
        <div className="stack">
          <Link className="btn block" href="/inscription">Créer mon atelier — gratuit</Link>
          <Link className="btn ghost block" href="/connexion">J&apos;ai déjà un compte</Link>
        </div>
      </section>
      <h2>Comment ça marche</h2>
      <ol className="etapes">
        <li><b>Fiche client</b> — les mesures sont gardées à vie, même si le papier se perd.</li>
        <li><b>Commande</b> — modèle, prix, acompte Wave / Orange Money, date de livraison.</li>
        <li><b>Reçu WhatsApp</b> — le client reçoit un lien pour suivre sa tenue.</li>
        <li><b>C&apos;est prêt</b> — un appui, et le client est prévenu.</li>
      </ol>
    </main>
  );
}
