// Icônes de trait, 24×24, couleur héritée du texte.
type P = { taille?: number };
const svg = (taille: number, d: React.ReactNode) => (
  <svg width={taille} height={taille} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>
);
export const IcoAccueil = ({ taille = 24 }: P) => svg(taille, <><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V20h14V9.5" /><path d="M10 20v-5h4v5" /></>);
export const IcoCommandes = ({ taille = 24 }: P) => svg(taille, <><path d="M8 4h8l1 2h2a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h2l1-2Z" /><path d="M8 11h8M8 15h5" /></>);
export const IcoPlus = ({ taille = 24 }: P) => svg(taille, <path d="M12 5v14M5 12h14" />);
export const IcoClients = ({ taille = 24 }: P) => svg(taille, <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5a6.5 6.5 0 0 1 3.5 5.5" /></>);
export const IcoAtelier = ({ taille = 24 }: P) => svg(taille, <><circle cx="6" cy="18" r="2.5" /><circle cx="18" cy="18" r="2.5" /><path d="M8 16.5 19 4M16 16.5 5 4" /></>);
export const IcoPhoto = ({ taille = 24 }: P) => svg(taille, <><path d="M4 7h3l2-3h6l2 3h3a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Z" /><circle cx="12" cy="13" r="4" /></>);
export const IcoWhatsApp = ({ taille = 24 }: P) => svg(taille, <><path d="M3 21l1.7-4.6A8.5 8.5 0 1 1 8 19.6L3 21Z" /><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 .8a4 4 0 0 1-2-2l.8-1-1-2L9 9.5Z" /></>);
export const IcoChevron = ({ taille = 18 }: P) => svg(taille, <path d="m9 6 6 6-6 6" />);
