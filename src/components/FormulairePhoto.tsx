"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { importerPhoto } from "@/app/actions";

const COTE_MAX = 1600; // px : assez pour lire l'écriture, léger en 3G (~300 Ko)

async function reduire(fichier: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(fichier);
    const echelle = Math.min(1, COTE_MAX / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * echelle);
    canvas.height = Math.round(bitmap.height * echelle);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.85));
    return blob ? new File([blob], "carnet.jpg", { type: "image/jpeg" }) : fichier;
  } catch {
    return fichier; // navigateur ancien : on envoie l'original
  }
}

function Envoyer({ pret }: { pret: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button className="btn block" disabled={!pret || pending}>
      {pending ? "Lecture du carnet… (15 à 40 s)" : "Lire la page"}
    </button>
  );
}

export function FormulairePhoto() {
  const [apercu, setApercu] = useState<string | null>(null);

  async function envoyer(fd: FormData) {
    const photo = fd.get("photo");
    if (photo instanceof File && photo.size > 0) fd.set("photo", await reduire(photo));
    await importerPhoto(fd);
  }

  return (
    <form action={envoyer} className="stack">
      <label className="btn ghost block" htmlFor="photo">📷 Prendre ou choisir une photo</label>
      <input
        id="photo"
        name="photo"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        required
        style={{ display: "none" }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          setApercu(f ? URL.createObjectURL(f) : null);
        }}
      />
      {apercu && <img src={apercu} alt="Page du carnet" className="apercu" />}
      <Envoyer pret={!!apercu} />
    </form>
  );
}
