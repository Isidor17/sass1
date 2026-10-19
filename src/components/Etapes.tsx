import { LIBELLES, STATUTS } from "@/lib/statut";

// Frise des étapes Reçu → En couture → Prêt → Livré.
export function Etapes({ statut }: { statut: string }) {
  const actuelle = STATUTS.indexOf(statut as (typeof STATUTS)[number]);
  return (
    <ol className="etapes-cmd">
      {STATUTS.map((s, i) => (
        <li key={s} className={i < actuelle ? "fait" : i === actuelle ? "ici" : ""}>
          <span className="pastille-etape">{i < actuelle ? "✓" : i + 1}</span>
          <span className="libelle-etape">{LIBELLES[s]}</span>
        </li>
      ))}
    </ol>
  );
}
