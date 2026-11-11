// QUORMEL 1 – Streckeneditor: Freihandzeichnen, Zeichenbereich, Prüfung und Übernahme der Strecke.
import {app} from "../state.js";
import {$,toast} from "./dom.js";
import {H,W} from "../core/constants.js";
import {rs,setTrack,validate} from "../core/track.js";
import {openSim} from "./sim.js";
import {hd} from "../render/hidpi.js";

// ===== Editor =====
export function edOpen(){$("ed").style.display="block";(document.documentElement.requestFullscreen||(()=>0)).call(document.documentElement)?.catch?.(()=>0);edSt.w=innerWidth;edSt.h=innerHeight;app.ep=[];edSt.out=false;edSt.lost=false;app.drawing=false;edSt.pid=null;edSt.pen=false;edDraw()}
export function edClose(){$("ed").style.display="none";if(document.fullscreenElement)document.exitFullscreen()}
export function edDraw(){app.ex=hd(app.ec,edSt.w,edSt.h);app.ex.fillStyle="#0b0d12";app.ex.fillRect(0,0,edSt.w,edSt.h);app.ex.lineCap=app.ex.lineJoin="round";app.ex.strokeStyle="#3a3f4b";app.ex.lineWidth=+$("ew").value/Math.min(W/edSt.w,H/edSt.h);app.ex.beginPath();app.ep.forEach((q,i)=>i?app.ex.lineTo(q.x,q.y):app.ex.moveTo(q.x,q.y));app.ex.stroke();app.ex.strokeStyle="#ffffff88";app.ex.lineWidth=2;app.ex.stroke();edFrame()}
// out/lost: Zeiger außerhalb des Zeichenbereichs · w/h: Größe der Zeichenfläche in CSS-Pixeln
// pid/ptype: aktiver Zeiger · len0: Punktzahl beim Beginn des aktuellen Strichs · pen: in dieser Sitzung wurde ein Stift benutzt
export const edSt={out:false,lost:false,w:0,h:0,pid:null,ptype:"",len0:0,pen:false};
// Zeiger im Editor: Maus, Finger und Stift (Apple Pencil). Es zeichnet immer genau ein Zeiger.
// Ein Stift hat Vorrang: Liegt die Hand schon auf, wird ihr Strich verworfen; nach der ersten Stiftberührung zeichnen Finger nicht mehr mit.
export function edDown(e){if(e.button)return;
 if(e.pointerType==="touch"&&edSt.pen)return;
 if(app.drawing){if(!(e.pointerType==="pen"&&edSt.ptype==="touch"))return;app.ep.length=edSt.len0}
 if(e.pointerType==="pen")edSt.pen=true;
 edSt.pid=e.pointerId;edSt.ptype=e.pointerType;edSt.len0=app.ep.length;
 try{app.ec.setPointerCapture(e.pointerId)}catch(err){}
 app.drawing=true;edSt.lost=false;edAccept(app.ep,edSt,e.clientX,e.clientY,edSt.w,edSt.h,+$("ew").value);edDraw()}
export function edMove(e){if(!app.drawing||e.pointerId!==edSt.pid)return;
 // Finger und Stift liefern mehr Messpunkte, als Bilder gezeichnet werden – alle auswerten (die Maus verhält sich wie bisher)
 const more=e.pointerType!=="mouse"&&e.getCoalescedEvents?e.getCoalescedEvents():[];
 for(const c of more.length?more:[e])edAccept(app.ep,edSt,c.clientX,c.clientY,edSt.w,edSt.h,+$("ew").value);edDraw()}
export function edUp(e){if(e.pointerId!==edSt.pid)return;app.drawing=false;edSt.pid=null;edSt.out=false;edDraw()}
export function edUndo(){app.ep.splice(Math.max(0,app.ep.length-25));edDraw()}
export function edFinish(){if(app.ep.length<20){toast("Bitte zeichne zuerst eine Strecke.");return}
 const B=edBuild(app.ep,edSt.w,edSt.h,+$("ew").value);let p=B.p;if(B.out){toast("Deine Strecke liegt außerhalb des Zeichenbereichs. Bitte korrigiere den Streckenverlauf.");return}
 const w=+$("ew").value,err=validate(p,w);if(err){toast(err);return}let mr=1e9;for(let i=8;i<p.length-8;i+=4){const a=p[i-8],b=p[i],c2=p[i+8],A=Math.hypot(b.x-c2.x,b.y-c2.y),B=Math.hypot(a.x-c2.x,a.y-c2.y),C=Math.hypot(a.x-b.x,a.y-b.y),K=Math.abs((b.x-a.x)*(c2.y-a.y)-(c2.x-a.x)*(b.y-a.y))/2;if(K>1)mr=Math.min(mr,A*B*C/(4*K))}
 const warn=mr<40?"Achtung: Eine Kurve ist sehr eng (Radius ≈ "+Math.round(mr)+" px), das Auto kann sie vermutlich kaum befahren. Zeichne sie etwas großzügiger. ":"";
 setTrack("Eigene Strecke",w,p);edClose();toast(warn+"Deine Strecke wurde erstellt. Start (grün) und Ziel (rot) liegen an den Enden.");openSim()}
// ===== Streckeneditor: Zeichenbereich =====
export function edMargin(cw,ch,wv){const s=Math.min(W/cw,H/ch);return wv/s/2+14} // halbe Straßenbreite (in Bildschirm-Pixeln) + 14 px Sicherheitsabstand
export function edInside(x,y,cw,ch,wv){const m=edMargin(cw,ch,wv);return x>=m&&y>=m&&x<=cw-m&&y<=ch-m}
export function edAccept(ep,st,x,y,cw,ch,wv){if(!edInside(x,y,cw,ch,wv)){st.out=true;st.lost=true;return false}st.out=false;const l=ep[ep.length-1];if(l){const d=Math.hypot(x-l.x,y-l.y);if(st.lost&&d>60)return false;if(d<4)return false}st.lost=false;ep.push({x,y});return true}
export function edOutside(p,w,bw,bh){const hw=w/2;for(let i=0;i<p.length;i++){const a=p[Math.max(0,i-1)],b=p[Math.min(p.length-1,i+1)],l=Math.hypot(b.x-a.x,b.y-a.y)||1,tx=(b.x-a.x)/l*hw,ty=(b.y-a.y)/l*hw,pts=[[p[i].x,p[i].y],[p[i].x-ty,p[i].y+tx],[p[i].x+ty,p[i].y-tx]];if(i===0)pts.push([p[i].x-tx,p[i].y-ty]);if(i===p.length-1)pts.push([p[i].x+tx,p[i].y+ty]);for(const q of pts)if(q[0]<-.5||q[1]<-.5||q[0]>bw+.5||q[1]>bh+.5)return true}return false}
export function edBuild(ep,cw,ch,wv){const s=Math.min(W/cw,H/ch);let p=rs(ep.map(q=>({x:q.x*s,y:q.y*s})),5);for(let k=0;k<4;k++)p=p.map((q,i)=>{if(i<2||i>p.length-3)return q;let x=0,y=0;for(let j=-2;j<=2;j++){x+=p[i+j].x;y+=p[i+j].y}return{x:x/5,y:y/5}});return{p,out:edOutside(p,wv,cw*s,ch*s)}}
export function edFrame(){const m=edMargin(edSt.w,edSt.h,+$("ew").value);app.ex.save();app.ex.setLineDash([10,8]);app.ex.strokeStyle="#ff2d3d";app.ex.lineWidth=2;app.ex.strokeRect(m,m,edSt.w-2*m,edSt.h-2*m);app.ex.setLineDash([]);app.ex.fillStyle="#8a93a6";app.ex.font="12px system-ui";app.ex.fillText("Zeichenbereich – die Straßenränder bleiben im Bild",m+8,m+16);if(edSt.out){app.ex.fillStyle="#ff2d3d";app.ex.font="bold 18px system-ui";app.ex.textAlign="center";app.ex.fillText("Hier endet der Zeichenbereich.",edSt.w/2,m+44)}app.ex.restore()}

// Initialisierung (Teil 1 von 2) – wird von main.js in der Reihenfolge der Originaldatei aufgerufen
export function init(){
app.ec=$("ec");app.ex=app.ec.getContext("2d");
app.ec.onpointerdown=edDown;
app.ec.onpointermove=edMove;
app.ec.onpointerup=edUp;
app.ec.onpointercancel=edUp; // z. B. Systemgeste oder eingehender Anruf: Strich sauber beenden
// Rückfall für Browser ohne touch-action: Scrollen und Zoomen auf der Zeichenfläche unterbinden
for(const t of["touchstart","touchmove"])app.ec.addEventListener(t,e=>{if(e.cancelable)e.preventDefault()},{passive:false});
}

// Initialisierung (Teil 2 von 2) – wird von main.js in der Reihenfolge der Originaldatei aufgerufen
export function init2(){
// Fenstergröße geändert oder Gerät gedreht: Die Zeichnung behält ihre Form (gleicher Maßstab in beide Richtungen)
addEventListener("resize",()=>{if($("ed").style.display==="block"){const k=Math.min(W/edSt.w,H/edSt.h)/Math.min(W/innerWidth,H/innerHeight);app.ep=app.ep.map(q=>({x:q.x*k,y:q.y*k}));edSt.w=innerWidth;edSt.h=innerHeight;edDraw()}});
}
