import { dateCourte, joursRestants } from "@/lib/format";

export function Echeance({ date, statut }: { date: Date; statut: string }) {
  const j = joursRestants(date);
  const fini = statut === "PRET" || statut === "LIVRE";
  let suffixe = "";
  if (!fini) suffixe = j < 0 ? ` · ${-j} j de retard` : j === 0 ? " · aujourd'hui" : j === 1 ? " · demain" : ` · dans ${j} j`;
  return <span className={!fini && j < 0 ? "retard" : "muted"}>{dateCourte(date)}{suffixe}</span>;
}
