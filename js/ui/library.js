// QUORMEL 1 – Streckenwahl: Karten der Vorlagen und Einstieg in den Editor.
import {$} from "./dom.js";
import {H,W} from "../core/constants.js";
import {PRE,cat,rs,setTrack} from "../core/track.js";
import {edOpen} from "./editor.js";
import {openSim} from "./sim.js";
import {hd} from "../render/hidpi.js";

export function preview(cv,pts,w){const x=hd(cv),cw=cv._lw,ch=cv._lh;x.clearRect(0,0,cw,ch);x.lineCap=x.lineJoin="round";x.strokeStyle="#7a8296";x.lineWidth=w/3;x.beginPath();pts.forEach((q,i)=>i?x.lineTo(q.x*cw/W,q.y*ch/H):x.moveTo(q.x*cw/W,q.y*ch/H));x.stroke()}

// Initialisierung – wird von main.js in der Reihenfolge der Originaldatei aufgerufen
export function init(){
// Bibliothek
(function(){const c=$("cards");PRE.forEach(t=>{const p=rs(cat(t.c),5),d=document.createElement("div");d.className="card";d.innerHTML=`<h3 style="margin:4px 0 8px">${t.n}</h3><canvas width="300" height="190"></canvas><div style="margin-top:8px">Länge ≈ ${Math.round(p.length*5/10)} m</div><b style="color:var(--a)">${t.d}</b><p style="color:var(--m)">${t.t}</p><button class="pri">Wählen</button>`;c.appendChild(d);preview(d.querySelector("canvas"),p,t.w);d.querySelector("button").onclick=()=>{setTrack(t.n,t.w,p);openSim()}});
 const d=$("drawblk");d.className="drawb";d.innerHTML='<svg width="76" height="76" viewBox="0 0 24 24" fill="none" stroke="#ff2d3d" stroke-width="1.6" stroke-linejoin="round"><path d="M3 21l3.5-1 12-12-2.5-2.5-12 12L3 21z"/><path d="M14.5 6.5l3 3"/></svg><h3 style="margin:10px 0 4px">Eigene Rennstrecke zeichnen</h3><p style="color:var(--m);margin:0">Gestalte deinen eigenen Rennkurs und fordere die KI heraus.</p>';d.onclick=edOpen})();
}
