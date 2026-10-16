import { LIBELLES, estStatut } from "@/lib/statut";

export function StatutBadge({ statut }: { statut: string }) {
  return <span className={`badge s-${statut}`}>{estStatut(statut) ? LIBELLES[statut] : statut}</span>;
}
