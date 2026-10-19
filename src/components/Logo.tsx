// Marque provisoire : une aiguille et son fil qui dessinent un « A ». Nom à remplacer une fois choisi.
export function Logo({ petit = false }: { petit?: boolean }) {
  const t = petit ? 26 : 34;
  return (
    <span className="logo">
      <svg width={t} height={t} viewBox="0 0 40 40" aria-hidden="true">
        <rect width="40" height="40" rx="10" fill="var(--l-vert)" />
        <path d="M11 30 20 9l9 21" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 23c4-3 8 3 12 0" fill="none" stroke="var(--l-or)" strokeWidth="2.6" strokeLinecap="round" />
        <circle cx="20" cy="9" r="1.6" fill="var(--l-or)" />
      </svg>
      <span className="logo-nom" style={{ fontSize: petit ? 17 : 21 }}>Atelier</span>
    </span>
  );
}
