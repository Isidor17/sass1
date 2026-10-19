// Marque Nawkat (« le couturier » en wolof) : un N tracé comme un fil, avec le chas de l'aiguille en or.
export function LogoMarque({ taille = 34 }: { taille?: number }) {
  return (
    <svg width={taille} height={taille} viewBox="0 0 40 40" aria-hidden="true">
      <rect width="40" height="40" rx="10" fill="var(--l-vert, #0d4f43)" />
      <path d="M12 29V11l16 18V11" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
      <ellipse cx="28" cy="8.6" rx="1.5" ry="2.4" fill="none" stroke="var(--l-or, #e8a33d)" strokeWidth="1.6" />
      <path d="M8 33c6-3 18 3 24 0" fill="none" stroke="var(--l-or, #e8a33d)" strokeWidth="2.2" strokeLinecap="round" strokeDasharray="3 3" />
    </svg>
  );
}

export function Logo({ petit = false }: { petit?: boolean }) {
  return (
    <span className="logo">
      <LogoMarque taille={petit ? 26 : 34} />
      <span className="logo-nom" style={{ fontSize: petit ? 17 : 21 }}>Nawkat</span>
    </span>
  );
}
