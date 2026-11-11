// QUORMEL 1 – Scharfe Darstellung auf Retina- und High-DPI-Displays.
// Betrifft nur Anzeige-Canvas. Die Straßenmaske in core/track.js bleibt immer bei 1000 × 640 Pixeln.

// Faktor zwischen logischen Einheiten und Gerätepixeln (höchstens 2, damit die Rechenlast auf Geräten mit Faktor 3 begrenzt bleibt)
export const pxScale=()=>Math.min(2,Math.max(1,window.devicePixelRatio||1));

// Liefert den 2D-Kontext eines Canvas. Gezeichnet wird weiter in logischen Einheiten (lw × lh);
// die tatsächliche Pixelzahl des Canvas ist um pxScale() größer. Ohne lw/lh gilt die im HTML angegebene Größe.
// Bei Faktor 1 ändert sich gegenüber früher nichts.
export function hd(cv,lw,lh){
 if(lw===undefined){if(cv._lw===undefined){cv._lw=cv.width;cv._lh=cv.height}lw=cv._lw;lh=cv._lh}
 const s=pxScale(),w=Math.round(lw*s),h=Math.round(lh*s);
 if(cv.width!==w||cv.height!==h){cv.width=w;cv.height=h}
 const x=cv.getContext("2d");x.setTransform(w/lw,0,0,h/lh,0,0);return x}
