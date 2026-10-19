import { atelierConnecte, urlApp } from "@/lib/session";
import { afficherTelephone } from "@/lib/telephone";
import { deconnexion, majAtelier } from "../../actions";
import Link from "next/link";
import { Alerte } from "@/components/Alerte";
import { IcoChevron } from "@/components/Icones";

export default async function Reglages({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const a = await atelierConnecte();
  const { ok } = await searchParams;
  return (
    <main className="page">
      <h1>Mon atelier</h1>
      <p className="muted small">{afficherTelephone(a.telephone)}</p>
      {ok && <Alerte succes="Enregistré." />}
      <form action={majAtelier} className="stack">
        <div><label htmlFor="nom">Nom de l&apos;atelier</label><input id="nom" name="nom" defaultValue={a.nom} /></div>
        <div><label htmlFor="quartier">Quartier</label><input id="quartier" name="quartier" defaultValue={a.quartier ?? ""} /></div>
        <div>
          <label htmlFor="capaciteSemaine">Tenues que vous pouvez finir par semaine</label>
          <input id="capaciteSemaine" name="capaciteSemaine" inputMode="numeric" defaultValue={a.capaciteSemaine} />
          <p className="small muted">Sert à vous alerter quand une semaine est pleine (Tabaski, Korité…).</p>
        </div>
        <button className="btn block">Enregistrer</button>
      </form>
      <Link className="action-photo" style={{ marginTop: 20 }} href="/app/reglages/mesures">
        <span>Mes mesures<small>Choisir, renommer et ordonner les mesures que je prends</small></span><IcoChevron />
      </Link>
      <h2>Installer l&apos;application</h2>
      <p className="small">Sur Android : ouvrez {urlApp()} dans Chrome → menu ⋮ → « Ajouter à l&apos;écran d&apos;accueil ».</p>
      <form action={deconnexion} style={{ marginTop: 24 }}><button className="btn ghost block">Se déconnecter</button></form>
    </main>
  );
}
