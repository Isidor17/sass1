import Link from "next/link";
import { connexion } from "../actions";
import { Alerte } from "@/components/Alerte";

export default async function Connexion({ searchParams }: { searchParams: Promise<{ erreur?: string; carnet?: string }> }) {
  const { erreur, carnet } = await searchParams;
  return (
    <main className="page">
      <h1>Connexion</h1>
      <Alerte erreur={erreur} />
      <form action={connexion} className="stack">
        {carnet && <input type="hidden" name="carnet" value={carnet} />}
        <div><label htmlFor="telephone">Téléphone</label><input id="telephone" name="telephone" type="tel" inputMode="tel" required placeholder="77 123 45 67" /></div>
        <div><label htmlFor="pin">Code secret</label><input id="pin" name="pin" type="password" inputMode="numeric" required /></div>
        <button className="btn block">Se connecter</button>
      </form>
      <p className="small muted" style={{ marginTop: 16 }}>Pas encore de compte ? <Link href={carnet ? `/inscription?carnet=${carnet}` : "/inscription"}>Créer mon atelier</Link></p>
    </main>
  );
}
