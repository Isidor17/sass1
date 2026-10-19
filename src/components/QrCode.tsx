import { qrSvg } from "@/lib/qr";

export async function QrCode({ url, taille = 180, legende }: { url: string; taille?: number; legende?: string }) {
  const svg = await qrSvg(url);
  return (
    <figure className="qr" style={{ width: taille }}>
      <div dangerouslySetInnerHTML={{ __html: svg }} />
      {legende && <figcaption className="small muted">{legende}</figcaption>}
    </figure>
  );
}
