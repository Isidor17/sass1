import QRCode from "qrcode";

/** QR code en SVG (texte) pour une URL. Couleurs fixes : il doit rester lisible imprimé et en mode sombre. */
export function qrSvg(url: string): Promise<string> {
  return QRCode.toString(url, { type: "svg", margin: 1, errorCorrectionLevel: "M", color: { dark: "#000000", light: "#ffffff" } });
}
