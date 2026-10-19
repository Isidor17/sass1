import Link from "next/link";
import { inscription } from "../actions";
import { Alerte } from "@/components/Alerte";

export default async function Inscription({ searchParams }: { searchParams: Promise<{ erreur?: string; carnet?: string }> }) {
  const { erreur, carnet } = await searchParams;
  return (
    <main className="page">
      <h1>Créer mon atelier</h1>
      <p className="muted">Votre numéro et un code à 4 chiffres suffisent.</p>
      <Alerte erreur={erreur} />
      <form action={inscription} className="stack">
        {carnet && <input type="hidden" name="carnet" value={carnet} />}
        <div><label htmlFor="nom">Nom de l&apos;atelier</label><input id="nom" name="nom" required placeholder="Couture Fatou" /></div>
        <div><label htmlFor="telephone">Téléphone</label><input id="telephone" name="telephone" type="tel" inputMode="tel" required placeholder="77 123 45 67" /></div>
        <div><label htmlFor="quartier">Quartier (facultatif)</label><input id="quartier" name="quartier" placeholder="HLM, Médina…" /></div>
        <div className="grid2">
          <div><label htmlFor="pin">Code secret</label><input id="pin" name="pin" type="password" inputMode="numeric" pattern="\d{4,6}" required /></div>
          <div><label htmlFor="pin2">Confirmer</label><input id="pin2" name="pin2" type="password" inputMode="numeric" pattern="\d{4,6}" required /></div>
        </div>
        <button className="btn block">Créer mon atelier</button>
      </form>
      <p className="small muted" style={{ marginTop: 16 }}>Déjà inscrit ? <Link href={carnet ? `/connexion?carnet=${carnet}` : "/connexion"}>Se connecter</Link></p>
    </main>
  );
}
