export function Alerte({ erreur, succes }: { erreur?: string; succes?: string }) {
  if (erreur) return <div className="alerte" role="alert">{erreur}</div>;
  if (succes) return <div className="succes" role="status">{succes}</div>;
  return null;
}
