"use client";

export function Imprimer() {
  return <button type="button" className="btn ghost block no-print" onClick={() => window.print()}>Imprimer / enregistrer en PDF</button>;
}
