export function initiales(nom: string): string {
  const mots = nom.trim().split(/\s+/).filter(Boolean);
  return ((mots[0]?.[0] ?? "") + (mots.length > 1 ? mots[mots.length - 1][0] : "")).toUpperCase() || "?";
}

export function Avatar({ nom }: { nom: string }) {
  return <span className="avatar" aria-hidden="true">{initiales(nom)}</span>;
}
