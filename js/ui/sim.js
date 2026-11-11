// QUORMEL 1 – Trainingsansicht: Einstellungen, Validierung, Start/Pause, Kennzahlen, Weitertrainieren, Präsentationsmodus.
import {app} from "../state.js";
import {$,mdl,setH,setT,show,toast,toastForce} from "./dom.js";
import {ACT} from "../core/constants.js";
import {getQ,keyOf,resetCar} from "../core/qlearning.js";
import {MV,exportSave,persist,readSave} from "../storage/save.js";
import {drawChart} from "../render/sim-view.js";
import {djBtns} from "./duel.js";

export function readP(){const g=i=>parseFloat($(i).value);return{a:g("pa"),g:g("pg"),e:g("pe"),d:g("pd"),n:parseInt($("pn").value),rg:g("rg"),rc:g("rc"),rp:g("rp"),ri:g("ri"),rd:g("rd")}}
// ===== Sim-UI =====
export const IN=["pa","pg","pe","pd","pn","rg","rc","rp","ri","rd"];
export function lock(l){IN.forEach(i=>$(i).disabled=l);document.querySelectorAll(".wb").forEach(b=>b.disabled=l)}
export function openSim(){show("sim");app.mode="sim";app.st="idle";app.SAVE_OWNED=false;app.saveMV=MV;app.savedMax=0;app.agg=[];app.aggStart=0;app.aggCur={n:0,ok:0,rew:0};app.Q=new Map();app.epN=app.ok=app.fail=app.sumRew=app.sumSteps=app.maxIdx=app.okSteps=0;app.hist=[];app.best=null;app.logs=[];app.recent=[];app.last=null;app.sn=[];app.fails=[];lock(false);app.P=readP();app.P.eps_=app.P.e;resetCar();$("bGo").disabled=false;$("bGo").textContent="Training starten";setPU(false);["bPause","bMore","bBest","bRace"].forEach(i=>$(i).disabled=true)}
export function leave(){if(app.st==="training")pause();show("lib");app.mode="lib"}
// ===== F1: Eingabevalidierung (bestehende Grenzen; Reward-Felder: nur gültige endliche Zahl) =====
export const VAL={pa:["Lernrate α",.01,1],pg:["Discount-Faktor γ",0,.99],pe:["Exploration ε",.05,1],pd:["Explorationsabnahme",.9,1],pn:["Episoden",1,Infinity],rg:["Belohnung für Zielerreichung"],rc:["Strafe für Verlassen der Straße"],rp:["Belohnung für Fortschritt"],ri:["Stillstand-Strafe"],rd:["Abweichung von Mitte (Strafe)"]};
export const fmtN=v=>String(v).replace(".",",");
export function validateInputs(){IN.forEach(i=>$(i).classList.remove("bad"));
 for(const id of IN){const el=$(id),[nm,lo,hi]=VAL[id],raw=String(el.value).trim();let why=null;
  if(el.validity&&el.validity.badInput)why="enthält ungültige Zeichen";else if(raw==="")why="ist leer";else if(!/^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(raw))why="enthält ungültige Zeichen";
  else{const v=Number(raw);if(!Number.isFinite(v))why="enthält keinen endlichen Zahlenwert";else if(id==="pn"&&!Number.isInteger(v))why="muss eine ganze Zahl sein";else if(lo!==undefined&&(v<lo||v>hi))why=`liegt außerhalb des erlaubten Bereichs (${fmtN(lo)} bis ${hi===Infinity?"∞":fmtN(hi)})`}
  if(why){el.classList.add("bad");const d=el.closest("details");if(d)d.open=true;el.focus();return{ok:false,id,msg:`Deine Trainingsparameter sind noch nicht vollständig. Bitte überprüfe das Feld „${nm}“ – es ${why}.`}}}
 return{ok:true}}
// P19: Warnung bei negativen Reward-Werten (keine Begrenzung – Experimente bleiben möglich)
export function rwUpd(){const t=[["rg","Ziel erreicht","Das Erreichen des Ziels wird bestraft."],["rp","Fortschritt","Vorwärtsfahren wird bestraft."],["rc","Straße verlassen","Das Verlassen der Straße wird belohnt."],["ri","Stillstand-Strafe","Trödeln ohne Fortschritt wird belohnt."],["rd","Abweichung von Mitte","Fahren am Rand wird belohnt."]].filter(a=>parseFloat($(a[0]).value)<0).map(a=>`„${a[1]}“ ist negativ: ${a[2]}`);const e=$("rwarn");e.innerHTML=t.join("<br>");e.style.display=t.length?"block":"none"}
export function trainAbort(msg){ // F1: kontrolliert pausieren, gültigen Lernstand behalten
 if(app.DU){app.DU.run=false;djBtns()}else if(app.LAB&&app.LAB.k){app.LAB.run=false;$("lGo").textContent="Fortsetzen"}else{app.st="paused";setPU(true)} // kein persist(): der letzte gültige Speicherstand bleibt unangetastet
 const e=$("toast");toastForce("Training pausiert: "+msg);clearTimeout(toast.t);toast.t=setTimeout(()=>e.style.display="none",7000)}
export function startTraining(){const v=validateInputs();if(!v.ok){const e=$("toast");toast(v.msg);clearTimeout(toast.t);toast.t=setTimeout(()=>e.style.display="none",6000);return}
 try{const p=readP();if(!["a","g","e","d","n","rg","rc","rp","ri","rd"].every(k=>Number.isFinite(p[k])))throw new Error("Parameter");
  app.P=p;app.P.eps_=p.e;lock(true);app.st="training";resetCar();app.S=keyOf(app.c);if(!app.c||typeof app.S!=="string")throw new Error("Init")}
 catch(e){app.st="idle";lock(false);toast("Das Training konnte nicht gestartet werden. Dein bisheriger Speicherstand bleibt erhalten.");return}
 app.SAVE_OWNED=true; // erst nach erfolgreicher Initialisierung darf gespeichert (überschrieben) werden
 $("bGo").disabled=true;$("bPause").disabled=false;toast("Das Training beginnt.")}
export function pause(){if(app.st!=="training")return;app.st="paused";persist();setPU(true);toast("Training pausiert.")}
export function resume(){if(app.st==="paused"){app.st="training";setPU(false)}}
export function kpis(){$("bFail").disabled=!(app.fails.length&&(app.st==="paused"||app.st==="done"));$("bDec").disabled=!(app.st==="paused"||app.st==="training"||app.st==="done");$("bMore").disabled=app.st!=="done";const l100=app.hist.slice(-100),r=a=>a.length?Math.round(a.reduce((x,y)=>x+y,0)/a.length*100)+"%":"–";
 setH($("kp"),[["Episode",`${app.epN} / ${app.P.n}`],["Status",{idle:"Bereit",training:"Training",paused:"Pausiert",done:"Beendet"}[app.st]],["Erfolgreich",app.ok],["Fehlgeschlagen",app.fail],["Erfolgsquote",app.epN?Math.round(app.ok/app.epN*100)+"%":"–"],["Letzte 100",r(l100)],["ε (Exploration)",app.P.eps_.toFixed(3)],["Bester Fortschritt",Math.round(app.maxIdx/(app.T.p.length-1)*100)+"%"],["Ø Reward",app.epN?(app.sumRew/app.epN).toFixed(1):"–"],["Ø Fahrtdauer",app.epN?Math.round(app.sumSteps/app.epN)+" Schr.":"–"]].map(a=>`<div>${a[0]}<b>${a[1]}</b></div>`).join(""));
 drawChart();
 if(!app.last){setH($("an"),"");setT($("ae"),app.Q.size?"Gespeicherter Stand geladen – starte das Training, um weiterzulernen.":"Noch keine Trainingsdaten vorhanden. Starte das Training, damit die KI ihre ersten Erfahrungen sammelt.")}if(app.last){const q=getQ(app.last.sk);setH($("an"),[["Zustand",app.last.sk],["Aktion",ACT[app.last.a]],["Reward",app.last.r.toFixed(1)],["Q alt → neu",app.last.old.toFixed(2)+" → "+app.last.nw.toFixed(2)],["Zielwert",app.last.tgt.toFixed(2)],["Gelernte Zustände",app.Q.size]].map(a=>`<div>${a[0]}<b>${a[1]}</b></div>`).join(""));setT($("ae"),app.last.ex?"Exploration – das Auto probiert etwas Neues aus.":"Exploitation – das Auto nutzt seine bisherigen Erfahrungen.")}
 setH($("qt"),"<tr><th>Zustand"+ACT.map(a=>"<th>"+a.replace("Stark ","St. ").replace("Leicht ","L. ")).join("")+"</tr>"+app.recent.map(k=>{const q=getQ(k),m=Math.max(...q);return`<tr><td>${k}`+q.map(v=>`<td class="${v===m&&m!==0?"mx":""}">${v.toFixed(1)}`).join("")+"</tr>"}).join(""));setH($("log"),app.logs.join("<br>"));
 setT($("sens"),app.sn.length?`Sensor links ${app.sn[0]|0} · vorne links ${app.sn[1]|0} · vorne ${app.sn[2]|0} · vorne rechts ${app.sn[3]|0} · rechts ${app.sn[4]|0}`:"")}
export const SIM={sig:"",t:0};
export function simSig(){return[app.st,app.T&&app.T.id,app.T&&app.T.name,app.epN,app.ok,app.fail,app.Q.size,app.showIdeal,app.maxIdx,app.c&&app.c.x,app.c&&app.c.y,app.c&&app.c.a,app.last&&app.last.nw,app.last&&app.last.sk,app.P&&app.P.eps_,app.P&&app.P.n,app.fails.length,app.best&&app.best.steps,app.logs[0],app.recent[0],app.sn.join(",")].join("|")}
// ===== P04: Präsentationsmodus (größere Schrift, wird gemerkt) =====
export function setPres(on){document.body.classList.toggle("pres",on);$("bPres").textContent="Präsentationsmodus: "+(on?"an":"aus");try{localStorage.setItem("q1pres",on?"1":"0")}catch(e){}}
// ===== Pause-UI, Vollbild =====
export function setPU(p){$("pac").style.display=p?"block":"none";$("bPause").textContent=p?"Fortsetzen":"Pause"}
export function toggleIdeal(){app.showIdeal=!app.showIdeal;$("bIdeal").textContent="Ideallinie: "+(app.showIdeal?"an":"aus")}

// Initialisierung (Teil 1 von 6) – wird von main.js in der Reihenfolge der Originaldatei aufgerufen
export function init(){
IN.forEach(i=>$(i).addEventListener("input",()=>$(i).classList.remove("bad")));
["rg","rp","rc","ri","rd"].forEach(i=>$(i).addEventListener("input",rwUpd));
}

// Initialisierung (Teil 2 von 6) – wird von main.js in der Reihenfolge der Originaldatei aufgerufen
export function init2(){
$("bGo").onclick=()=>{if(app.st!=="idle")return;const d=!app.SAVE_OWNED&&readSave();if(d){$("owInfo").textContent=`Gespeichert: ${d.tn} · ${d.epN} Episoden · ${d.ok} erfolgreich`;mdl("ow",1);return}startTraining()};
$("owOk").onclick=()=>{mdl("ow",0);startTraining()};
$("owExp").onclick=()=>exportSave();
$("owNo").onclick=()=>{mdl("ow",0);toast("Abgebrochen – dein Speicherstand bleibt unverändert.")};
$("bPause").onclick=()=>app.st==="paused"?resume():pause();
}

// Initialisierung (Teil 3 von 6) – wird von main.js in der Reihenfolge der Originaldatei aufgerufen
export function init3(){
$("bPres").onclick=()=>setPres(!document.body.classList.contains("pres"));
try{if(localStorage.getItem("q1pres")==="1")setPres(true)}catch(e){}
}

// Initialisierung (Teil 4 von 6) – wird von main.js in der Reihenfolge der Originaldatei aufgerufen
export function init4(){
$("bIdeal").onclick=toggleIdeal;
}

// Initialisierung (Teil 5 von 6) – wird von main.js in der Reihenfolge der Originaldatei aufgerufen
export function init5(){
// Weitertrainieren: Q-Tabelle, Parameter, ε und Statistik bleiben; nur das Episodenziel wächst
$("bMore").onclick=()=>{if(app.st!=="done")return;$("mi").innerHTML=`Bisher: ${app.epN} Episoden (geplant ${app.P.n}) · ${app.ok} erfolgreich · Erfolgsquote ${app.epN?Math.round(app.ok/app.epN*100):0}%<br>Q-Tabelle, alle Lernparameter und ε bleiben unverändert.`;mdl("mm",1)};
$("mx").onchange=()=>$("mc").style.display=$("mx").value==="c"?"block":"none";
$("mOk").onclick=()=>{const e=$("mx").value==="c"?parseInt($("mc").value):parseInt($("mx").value);if(!(e>0)){toast("Bitte eine gültige Episodenzahl eingeben.");return}app.P.n=app.epN+e;app.st="training";resetCar();app.S=keyOf(app.c);$("bMore").disabled=true;$("bPause").disabled=false;mdl("mm",0);toast("Das Training läuft mit "+e+" weiteren Episoden weiter.")};
}

// Initialisierung (Teil 6 von 6) – wird von main.js in der Reihenfolge der Originaldatei aufgerufen
export function init6(){
// ===== Menüs im Trainingsbereich =====
$("bMA").onclick=()=>mdl("ma",1);
$("bMB").onclick=()=>mdl("mb",1);
["bDec","bFail","bBest","bRace"].forEach(id=>$(id).addEventListener("click",()=>{mdl("ma",0);mdl("mb",0)}));
}
