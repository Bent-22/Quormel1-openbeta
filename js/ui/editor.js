// QUORMEL 1 – Streckeneditor: Freihandzeichnen, Zeichenbereich, Prüfung und Übernahme der Strecke.
import {app} from "../state.js";
import {$,toast} from "./dom.js";
import {H,W} from "../core/constants.js";
import {rs,setTrack,validate} from "../core/track.js";
import {openSim} from "./sim.js";

// ===== Editor =====
export function edOpen(){$("ed").style.display="block";(document.documentElement.requestFullscreen||(()=>0)).call(document.documentElement)?.catch?.(()=>0);app.ec.width=innerWidth;app.ec.height=innerHeight;app.ep=[];edSt.out=false;edSt.lost=false;edDraw()}
export function edClose(){$("ed").style.display="none";if(document.fullscreenElement)document.exitFullscreen()}
export function edDraw(){app.ex.fillStyle="#0b0d12";app.ex.fillRect(0,0,app.ec.width,app.ec.height);app.ex.lineCap=app.ex.lineJoin="round";app.ex.strokeStyle="#3a3f4b";app.ex.lineWidth=+$("ew").value/Math.min(W/app.ec.width,H/app.ec.height);app.ex.beginPath();app.ep.forEach((q,i)=>i?app.ex.lineTo(q.x,q.y):app.ex.moveTo(q.x,q.y));app.ex.stroke();app.ex.strokeStyle="#ffffff88";app.ex.lineWidth=2;app.ex.stroke();edFrame()}
export const edSt={out:false,lost:false};
export function edUndo(){app.ep.splice(Math.max(0,app.ep.length-25));edDraw()}
export function edFinish(){if(app.ep.length<20){toast("Bitte zeichne zuerst eine Strecke.");return}
 const B=edBuild(app.ep,app.ec.width,app.ec.height,+$("ew").value);let p=B.p;if(B.out){toast("Deine Strecke liegt außerhalb des Zeichenbereichs. Bitte korrigiere den Streckenverlauf.");return}
 const w=+$("ew").value,err=validate(p,w);if(err){toast(err);return}let mr=1e9;for(let i=8;i<p.length-8;i+=4){const a=p[i-8],b=p[i],c2=p[i+8],A=Math.hypot(b.x-c2.x,b.y-c2.y),B=Math.hypot(a.x-c2.x,a.y-c2.y),C=Math.hypot(a.x-b.x,a.y-b.y),K=Math.abs((b.x-a.x)*(c2.y-a.y)-(c2.x-a.x)*(b.y-a.y))/2;if(K>1)mr=Math.min(mr,A*B*C/(4*K))}
 const warn=mr<40?"Achtung: Eine Kurve ist sehr eng (Radius ≈ "+Math.round(mr)+" px), das Auto kann sie vermutlich kaum befahren. Zeichne sie etwas großzügiger. ":"";
 setTrack("Eigene Strecke",w,p);edClose();toast(warn+"Deine Strecke wurde erstellt. Start (grün) und Ziel (rot) liegen an den Enden.");openSim()}
// ===== Streckeneditor: Zeichenbereich =====
export function edMargin(cw,ch,wv){const s=Math.min(W/cw,H/ch);return wv/s/2+14} // halbe Straßenbreite (in Bildschirm-Pixeln) + 14 px Sicherheitsabstand
export function edInside(x,y,cw,ch,wv){const m=edMargin(cw,ch,wv);return x>=m&&y>=m&&x<=cw-m&&y<=ch-m}
export function edAccept(ep,st,x,y,cw,ch,wv){if(!edInside(x,y,cw,ch,wv)){st.out=true;st.lost=true;return false}st.out=false;const l=ep[ep.length-1];if(l){const d=Math.hypot(x-l.x,y-l.y);if(st.lost&&d>60)return false;if(d<4)return false}st.lost=false;ep.push({x,y});return true}
export function edOutside(p,w,bw,bh){const hw=w/2;for(let i=0;i<p.length;i++){const a=p[Math.max(0,i-1)],b=p[Math.min(p.length-1,i+1)],l=Math.hypot(b.x-a.x,b.y-a.y)||1,tx=(b.x-a.x)/l*hw,ty=(b.y-a.y)/l*hw,pts=[[p[i].x,p[i].y],[p[i].x-ty,p[i].y+tx],[p[i].x+ty,p[i].y-tx]];if(i===0)pts.push([p[i].x-tx,p[i].y-ty]);if(i===p.length-1)pts.push([p[i].x+tx,p[i].y+ty]);for(const q of pts)if(q[0]<-.5||q[1]<-.5||q[0]>bw+.5||q[1]>bh+.5)return true}return false}
export function edBuild(ep,cw,ch,wv){const s=Math.min(W/cw,H/ch);let p=rs(ep.map(q=>({x:q.x*s,y:q.y*s})),5);for(let k=0;k<4;k++)p=p.map((q,i)=>{if(i<2||i>p.length-3)return q;let x=0,y=0;for(let j=-2;j<=2;j++){x+=p[i+j].x;y+=p[i+j].y}return{x:x/5,y:y/5}});return{p,out:edOutside(p,wv,cw*s,ch*s)}}
export function edFrame(){const m=edMargin(app.ec.width,app.ec.height,+$("ew").value);app.ex.save();app.ex.setLineDash([10,8]);app.ex.strokeStyle="#ff2d3d";app.ex.lineWidth=2;app.ex.strokeRect(m,m,app.ec.width-2*m,app.ec.height-2*m);app.ex.setLineDash([]);app.ex.fillStyle="#8a93a6";app.ex.font="12px system-ui";app.ex.fillText("Zeichenbereich – die Straßenränder bleiben im Bild",m+8,m+16);if(edSt.out){app.ex.fillStyle="#ff2d3d";app.ex.font="bold 18px system-ui";app.ex.textAlign="center";app.ex.fillText("Hier endet der Zeichenbereich.",app.ec.width/2,m+44)}app.ex.restore()}

// Initialisierung (Teil 1 von 2) – wird von main.js in der Reihenfolge der Originaldatei aufgerufen
export function init(){
app.ec=$("ec");app.ex=app.ec.getContext("2d");
app.ec.onpointerdown=e=>{if(e.button)return;app.ec.setPointerCapture(e.pointerId);app.drawing=true;edSt.lost=false;edAccept(app.ep,edSt,e.clientX,e.clientY,app.ec.width,app.ec.height,+$("ew").value);edDraw()};
app.ec.onpointermove=e=>{if(!app.drawing)return;edAccept(app.ep,edSt,e.clientX,e.clientY,app.ec.width,app.ec.height,+$("ew").value);edDraw()};
app.ec.onpointerup=()=>{app.drawing=false;edSt.out=false;edDraw()};
}

// Initialisierung (Teil 2 von 2) – wird von main.js in der Reihenfolge der Originaldatei aufgerufen
export function init2(){
addEventListener("resize",()=>{if($("ed").style.display==="block"){const kx=innerWidth/app.ec.width,ky=innerHeight/app.ec.height;app.ep=app.ep.map(q=>({x:q.x*kx,y:q.y*ky}));app.ec.width=innerWidth;app.ec.height=innerHeight;edDraw()}});
}
