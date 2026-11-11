// QUORMEL 1 – Wiedergabe der besten Fahrt (First-Person) samt verstecktem Debug-Modus.
import {app} from "../state.js";
import {$,show} from "./dom.js";
import {fsOn} from "./race.js";
import {drawFPV} from "../render/fpv.js";

// ===== First-Person-Wiedergabe =====
// Kamera-Glättung: Mittelwert über ±10 gespeicherte Schritte + Interpolation zwischen den Schritten
export function pose(k){const r=app.best.rec,n=r.length/3;let sx=0,sy=0,c=0,sn=0,m=0;for(let j=Math.max(0,k-10);j<=Math.min(n-1,k+10);j++){sx+=r[j*3];sy+=r[j*3+1];c+=Math.cos(r[j*3+2]);sn+=Math.sin(r[j*3+2]);m++}return[sx/m,sy/m,Math.atan2(sn,c)]}
export function smoothPose(t){const k=Math.floor(t),f=t-k,A=pose(k),B=pose(Math.min(k+1,app.best.steps-1));let d=B[2]-A[2];while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;return[A[0]+(B[0]-A[0])*f,A[1]+(B[1]-A[1])*f,A[2]+d*f]}
export function rpTick(){if(!app.best)return;if(app.rpPlay){app.rpk+=+$("rpS").value;if(app.rpk>=app.best.steps-1){app.rpk=app.best.steps-1;app.rpPlay=false}}
 const sg=[app.rpk,innerWidth,innerHeight,app.FDBG,app.showIdeal,app.best.steps,app.T&&app.T.id].join("|");if(!app.rpPlay&&sg===app.rpSig)return;app.rpSig=sg; // F6: angehaltene Wiedergabe nicht neu rendern
 const k=Math.floor(app.rpk),[px,py,a]=smoothPose(app.rpk);$("rpT").value=k;$("rpTime").textContent=(k/60).toFixed(2)+" s / "+(app.best.steps/60).toFixed(2)+" s";
 drawFPV($("fc"),px,py,a)}
// ===== Geheime Freischaltung des Debug-Buttons (Q -> U -> 1, nur in der First-Person-View) =====
export const DS={i:0,t:0};
export function dbgReset(){DS.i=0;$("rpD").hidden=true;if(app.FDBG){app.FDBG=false;$("rpD").textContent="Debug: aus"}}

// Initialisierung (Teil 1 von 2) – wird von main.js in der Reihenfolge der Originaldatei aufgerufen
export function init(){
$("bBest").onclick=()=>{if(!app.best)return;show("rpv");fsOn();app.mode="rp";app.rpk=0;app.rpPlay=true;$("rpT").max=app.best.steps-1};
$("rpPlay").onclick=()=>app.rpPlay=!app.rpPlay;
$("rpAgain").onclick=()=>{app.rpk=0;app.rpPlay=true};
$("rpT").oninput=e=>{app.rpk=+e.target.value;app.rpPlay=false};
}

// Initialisierung (Teil 2 von 2) – wird von main.js in der Reihenfolge der Originaldatei aufgerufen
export function init2(){
$("rpD").onclick=()=>{app.FDBG=!app.FDBG;$("rpD").textContent="Debug: "+(app.FDBG?"an":"aus")};
addEventListener("keydown",e=>{if(app.page!=="rpv"||e.ctrlKey||e.altKey||e.metaKey||e.repeat)return;const k=e.key.toLowerCase(),now=performance.now(),seq=["q","u","1"];if(DS.i>0&&now-DS.t>3000)DS.i=0;if(k===seq[DS.i]){if(DS.i===0)DS.t=now;DS.i++;if(DS.i===3){DS.i=0;$("rpD").hidden=false}}else if(k===seq[0]){DS.i=1;DS.t=now}else DS.i=0});
}
