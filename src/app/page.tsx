import Link from "next/link";
import { redirect } from "next/navigation";
import { atelierIdOptionnel } from "@/lib/session";
import { Logo } from "@/components/Logo";

export default async function Accueil() {
  if (await atelierIdOptionnel()) redirect("/app");
  return (
    <div className="l">
      <header className="l-entete">
        <div className="l-conteneur l-entete-int">
          <Logo />
          <Link href="/connexion" className="l-lien-connexion">Se connecter</Link>
        </div>
      </header>

      <section className="l-hero">
        <div className="l-motif" aria-hidden="true" />
        <div className="l-conteneur l-hero-grille">
          <div className="l-hero-texte">
            <p className="l-surtitre">Pour les tailleurs et ateliers de couture</p>
            <h1>Vos mesures gardées à vie. Vos clients prévenus sur WhatsApp.</h1>
            <p className="l-chapo">
              Fini le bout de papier perdu et les clients qui appellent dix fois. Chaque commande est suivie, du tissu reçu à la tenue livrée.
            </p>
            <div className="l-actions">
              <Link className="l-btn l-btn-or" href="/inscription">Créer mon atelier gratuitement</Link>
              <Link className="l-btn l-btn-contour" href="/connexion">J&apos;ai déjà un compte</Link>
            </div>
            <ul className="l-garanties">
              <li><Coche /> Sans installation, marche sur tout Android</li>
              <li><Coche /> Votre numéro + un code, c&apos;est tout</li>
            </ul>
          </div>
          <Telephone />
        </div>
      </section>

      <section className="l-section">
        <div className="l-conteneur">
          <h2 className="l-titre">Le carnet papier vous coûte des clients</h2>
          <div className="l-grille3">
            <div className="l-douleur"><span>01</span><p><b>Mesures perdues.</b> Le client doit revenir se faire mesurer, et repart agacé.</p></div>
            <div className="l-douleur"><span>02</span><p><b>Retards à la Tabaski.</b> Trop de commandes acceptées, impossible de tout livrer à temps.</p></div>
            <div className="l-douleur"><span>03</span><p><b>Téléphone qui sonne.</b> « C&apos;est prêt ? » toute la journée, au lieu de coudre.</p></div>
          </div>
        </div>
      </section>

      <section className="l-section l-section-teinte">
        <div className="l-conteneur">
          <h2 className="l-titre">Tout l&apos;atelier dans votre poche</h2>
          <div className="l-grille2">
            <Atout icone={<IcoMetre />} titre="Mesures enregistrées une fois">
              Une fiche par client, avec l&apos;historique. Plus jamais de mesures à reprendre.
            </Atout>
            <Atout icone={<IcoWhatsApp />} titre="Le client prévenu sur WhatsApp">
              Reçu à la commande, message « c&apos;est prêt » en un appui, lien pour suivre sa tenue.
            </Atout>
            <Atout icone={<IcoPhoto />} titre="Votre vieux carnet importé en photo">
              Photographiez une page : noms et mesures sont relevés, vous vérifiez, c&apos;est enregistré.
            </Atout>
            <Atout icone={<IcoCalendrier />} titre="Prêt pour le rush de la Tabaski">
              L&apos;appli vous dit quand une semaine est pleine, avant de promettre une date intenable.
            </Atout>
          </div>
        </div>
      </section>

      <section className="l-section">
        <div className="l-conteneur l-carnet">
          <div className="l-carnet-visuel" aria-hidden="true">
            <div className="l-carte">
              <p className="l-carte-sur">Carnet de mesures</p>
              <p className="l-carte-nom">Awa Ndiaye</p>
              <div className="l-carte-mesures">
                <span>Épaule <b>38</b></span><span>Poitrine <b>92</b></span>
                <span>Taille <b>74</b></span><span>Hanches <b>102</b></span>
              </div>
              <QrDecoratif />
            </div>
          </div>
          <div>
            <h2 className="l-titre">Le carnet qui suit votre client</h2>
            <p className="l-chapo-sombre">
              Chaque client reçoit son carnet de mesures, avec un QR code. Il le garde sur son téléphone et vous fait confiance parce que ses mesures ne se perdent plus.
            </p>
            <p className="l-chapo-sombre">
              Un client vous arrive avec son carnet ? Scannez le QR et ses mesures sont dans votre atelier en un geste.
            </p>
          </div>
        </div>
      </section>

      <section className="l-section l-section-teinte">
        <div className="l-conteneur">
          <h2 className="l-titre">Démarrer prend 2 minutes</h2>
          <ol className="l-etapes">
            <li><b>Créez votre atelier</b><span>Nom, numéro de téléphone, code secret.</span></li>
            <li><b>Ajoutez vos clients</b><span>À la main ou en photographiant votre carnet.</span></li>
            <li><b>Enregistrez une commande</b><span>Le client reçoit son reçu sur WhatsApp.</span></li>
          </ol>
        </div>
      </section>

      <section className="l-final">
        <div className="l-motif" aria-hidden="true" />
        <div className="l-conteneur l-final-int">
          <h2>Gratuit pendant la phase pilote</h2>
          <p>On construit l&apos;outil avec les tailleurs de Dakar. Vos retours décident des prochaines fonctions.</p>
          <Link className="l-btn l-btn-or" href="/inscription">Créer mon atelier</Link>
        </div>
      </section>

      <footer className="l-pied">
        <div className="l-conteneur l-pied-int">
          <Logo petit />
          <span>Fait au Sénégal, pour les ateliers de couture.</span>
        </div>
      </footer>
    </div>
  );
}

function Atout({ icone, titre, children }: { icone: React.ReactNode; titre: string; children: React.ReactNode }) {
  return (
    <div className="l-atout">
      <div className="l-atout-icone">{icone}</div>
      <div><h3>{titre}</h3><p>{children}</p></div>
    </div>
  );
}

// Aperçu du produit dans un téléphone, en HTML : net à toutes les tailles, rien à télécharger.
function Telephone() {
  return (
    <div className="l-tel" aria-hidden="true">
      <div className="l-tel-ecran">
        <div className="l-tel-barre"><b>Couture Fatou</b><span>3 en cours</span></div>
        <div className="l-tel-kpis">
          <div><b className="l-rouge">1</b><span>en retard</span></div>
          <div><b>2</b><span>sous 7 j</span></div>
          <div><b className="l-vert">1</b><span>prêt</span></div>
        </div>
        <div className="l-tel-cmd">
          <div><b>Awa Ndiaye</b><span>Taille basse wax</span></div><i className="l-pastille l-p-pret">Prêt</i>
        </div>
        <div className="l-tel-cmd">
          <div><b>Moussa Diop</b><span>Grand boubou bazin</span></div><i className="l-pastille l-p-cours">En couture</i>
        </div>
        <div className="l-tel-cmd">
          <div><b>Fatou Sall</b><span>Robe soirée</span></div><i className="l-pastille l-p-recu">Reçu</i>
        </div>
        <div className="l-tel-wa">
          <span>Bonjour Awa, votre taille basse wax est prête chez Couture Fatou. Reste à payer : 5 000 F.</span>
          <small>WhatsApp · 10:42 ✓✓</small>
        </div>
      </div>
    </div>
  );
}

function Coche() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>;
}
function IcoMetre() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="8" width="20" height="8" rx="2" /><path d="M6 8v3M10 8v4M14 8v3M18 8v4" /></svg>;
}
function IcoWhatsApp() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21l1.7-4.6A8.5 8.5 0 1 1 8 19.6L3 21Z" /><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 .8a4 4 0 0 1-2-2l.8-1-1-2L9 9.5Z" /></svg>;
}
function IcoPhoto() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h3l2-3h6l2 3h3a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Z" /><circle cx="12" cy="13" r="4" /></svg>;
}
function IcoCalendrier() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4M8 14h2M14 14h2M8 17h2" /></svg>;
}
function QrDecoratif() {
  // Motif statique évoquant un QR (le vrai QR est généré sur la page carnet de chaque client).
  const n = 21;
  const repere = (x: number, y: number, ox: number, oy: number) => {
    const dx = x - ox, dy = y - oy;
    if (dx < 0 || dy < 0 || dx > 6 || dy > 6) return null;
    return dx === 0 || dy === 0 || dx === 6 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4);
  };
  const cases: [number, number][] = [];
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      const r = repere(x, y, 0, 0) ?? repere(x, y, 14, 0) ?? repere(x, y, 0, 14);
      const zoneRepere = (x < 8 && y < 8) || (x > 12 && y < 8) || (x < 8 && y > 12);
      const plein = r !== null ? r : !zoneRepere && ((x * 7 + y * 13 + x * y) % 5 < 2);
      if (plein) cases.push([x, y]);
    }
  return (
    <svg className="l-qr" viewBox={`0 0 ${n} ${n}`} shapeRendering="crispEdges">
      {cases.map(([x, y]) => <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" />)}
    </svg>
  );
}
