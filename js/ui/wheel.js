// QUORMEL 1 – Glücksrad für Parameterwerte.
import {app} from "../state.js";
import {$,toast} from "./dom.js";
import {rnd} from "../core/rng.js";
import {IN,rwUpd} from "./sim.js";

// ===== Glücksrad =====
export const WH={pa:[.01,1,.01,"Lernrate"],pg:[0,.99,.01,"Discount-Faktor"],pe:[.05,1,.05,"Explorationsrate"],pd:[.9,1,.001,"Explorationsabnahme"],pn:[0,0,0,"Episodenzahl"],rg:[20,200,10,"Ziel-Belohnung"],rc:[20,200,10,"Strafe: Straße verlassen"],rp:[1,8,.5,"Fortschritts-Belohnung"],ri:[0,2,.1,"Stillstand-Strafe"],rd:[0,2,.1,"Abweichungs-Strafe"]};
export function genVals(id){const[a,b,s]=WH[id];if(id==="pn")return[100,500,1000,5000,10000,500,1000,100];return Array.from({length:8},()=>+(a+rnd(Math.round((b-a)/s)+1)*s).toFixed(3))}
export function wOpen(id){app.wid=id;app.wv=genVals(id);app.wres=null;$("wt").textContent="Glücksrad: "+WH[id][3];$("wv").textContent="";$("wOk").disabled=true;$("wSpin").textContent="Drehen";$("wm").style.display="flex";wDraw()}
export function wClose(){if(!app.wbusy)$("wm").style.display="none"}
export function wDraw(){const x=$("wc").getContext("2d"),sg=Math.PI/4;x.clearRect(0,0,320,320);app.wv.forEach((v,i)=>{x.beginPath();x.moveTo(160,160);x.arc(160,160,150,app.wr+i*sg-Math.PI/2,app.wr+(i+1)*sg-Math.PI/2);x.fillStyle=i%2?"#2b3142":"#ff2d3d";x.fill();x.save();x.translate(160,160);x.rotate(app.wr+(i+.5)*sg-Math.PI/2);x.fillStyle="#fff";x.font="bold 16px sans-serif";x.textAlign="right";x.fillText(v,140,5);x.restore()});x.fillStyle="#fff";x.beginPath();x.moveTo(150,2);x.lineTo(170,2);x.lineTo(160,26);x.fill()}

// Initialisierung – wird von main.js in der Reihenfolge der Originaldatei aufgerufen
export function init(){
IN.forEach(id=>{const b=document.createElement("button");b.className="wb";b.textContent="🎡";b.title="Glücksrad";b.style.cssText="padding:2px 6px;margin-top:4px";b.onclick=e=>{e.preventDefault();wOpen(id)};$(id).parentNode.appendChild(b)});
$("wSpin").onclick=()=>{if(app.wbusy)return;app.wbusy=true;$("wOk").disabled=true;$("wv").textContent="";app.wv=genVals(app.wid);const i=rnd(8),sg=Math.PI/4,base=-(i+.5)*sg,t0=performance.now(),r0=app.wr,tg=base+2*Math.PI*(Math.ceil((r0-base)/(2*Math.PI))+5);
 (function f(n){const t=Math.min(1,(n-t0)/3000);app.wr=r0+(tg-r0)*(1-Math.pow(1-t,3));wDraw();if(t<1)requestAnimationFrame(f);else{app.wbusy=false;app.wres=app.wv[i];$("wv").textContent=app.wres;$("wOk").disabled=false;$("wSpin").textContent="Erneut drehen"}})(t0)};
$("wOk").onclick=()=>{if(app.wres!==null){$(app.wid).value=app.wres;toast("Wert übernommen: "+app.wres)}rwUpd();wClose()};
}
