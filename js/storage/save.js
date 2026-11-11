// QUORMEL 1 – Speicherstand: Prüfung, automatisches Speichern, Laden, Export und Import (JSON-Format v:1, localStorage "q1save").
import {app} from "../state.js";
import {$,mdl,show,toast,toastL} from "../ui/dom.js";
import {setTrack} from "../core/track.js";
import {keyOf,resetCar} from "../core/qlearning.js";
import {lock,rwUpd,setPU} from "../ui/sim.js";
import {matchPreset} from "./records.js";

// ===== F2: Überschreibschutz =====
export const MV=2;
// P01: prüft einen Speicherstand vollständig (Strecke, Parameter, Q-Tabelle, Zähler, beste Fahrt, Fehlversuche)
export const fin=Number.isFinite;
export function saveOk(d){if(!d||typeof d!=="object"||d.v!==1||typeof d.tn!=="string"||!fin(d.w)||d.w<=0)return false;
 if(!Array.isArray(d.p)||d.p.length<2||!d.p.every(q=>Array.isArray(q)&&fin(q[0])&&fin(q[1])))return false;
 if(!d.P||typeof d.P!=="object"||!["a","g","e","d","n","rg","rc","rp","ri","rd","eps_"].every(k=>fin(d.P[k])))return false;
 if(!d.q||typeof d.q!=="object"||Array.isArray(d.q)||!Object.values(d.q).every(a=>Array.isArray(a)&&a.length===5&&a.every(fin)))return false;
 if(!Number.isInteger(d.epN)||d.epN<0||!fin(d.ok)||!fin(d.fail)||!Array.isArray(d.hist))return false;
 if(d.best!=null&&(!fin(d.best.steps)||!Array.isArray(d.best.rec)||d.best.rec.length<3))return false;
 if(d.fails!==undefined&&!Array.isArray(d.fails))return false;return true}
export function readSave(raw){try{const d=JSON.parse(raw===undefined?localStorage.getItem("q1save"):raw);return saveOk(d)?d:null}catch(e){return null}}
export const hasValidSave=()=>!!readSave();
// ===== Speichern =====
export function persist(manual){if(!app.T||app.LAB||!app.SAVE_OWNED)return;try{localStorage.setItem("q1save",JSON.stringify({v:1,tn:app.T.name,w:app.T.w,p:app.T.p.map(q=>[+q.x.toFixed(1),+q.y.toFixed(1)]),P:app.P,q:Object.fromEntries(app.Q),epN:app.epN,ok:app.ok,fail:app.fail,hist:app.hist.slice(-2000),best:app.best,fails:app.fails,sumRew:app.sumRew,sumSteps:app.sumSteps,maxIdx:app.maxIdx,okSteps:app.okSteps,st:app.st,agg:app.agg,aggStart:app.aggStart,aggCur:app.aggCur,tid:app.T.id,mv:app.saveMV}));if(!hasValidSave())throw new Error("Prüfung");app.savedMax=app.maxIdx;updLoadBtn();if(manual)toast("Speicherstand gespeichert.")}catch(e){updLoadBtn();toast("Speichern fehlgeschlagen (Speicher voll?).")}}
export function updLoadBtn(){const v=hasValidSave(),b=$("bCont");b.disabled=!v;b.title=v?"":"Noch kein Training vorhanden";$("saveHint").style.display=v?"none":"block"} // F3
export function loadSave(dIn,imp,force){const d=dIn||readSave();
 if(!d){toast("Noch kein gültiger Speicherstand vorhanden.");return false}
 if(!force&&(d.mv||1)<MV){app.MVP={d,imp:!!imp};$("mvInfo").textContent=saveInfo(d);$("mvExp").hidden=!!imp;mdl("mv",1);return false} // P07: ältere Lernlogik nie unbemerkt weiterverwenden
 try{app.saveMV=d.mv||1;setTrack(d.tn,d.w,d.p.map(q=>({x:q[0],y:q[1]})));if(typeof d.tid==="string")app.T.id=d.tid;else{const m=matchPreset();if(m)app.T.id=m}show("sim");app.mode="sim";app.P=d.P;app.Q=new Map(Object.entries(d.q));app.epN=d.epN;app.ok=d.ok;app.fail=d.fail;app.hist=d.hist;app.best=d.best;app.fails=(d.fails||[]).slice(0,8);app.sumRew=d.sumRew;app.sumSteps=d.sumSteps;app.maxIdx=d.maxIdx;app.okSteps=d.okSteps;app.logs=[];
 if(Array.isArray(d.agg)&&Number.isFinite(d.aggStart)&&d.aggCur){app.agg=d.agg;app.aggStart=d.aggStart;app.aggCur=d.aggCur}else{ // F4: älterer Speicherstand – nur aus tatsächlich vorhandener Historie ergänzen
  const hs=app.epN-app.hist.length;app.aggStart=Math.min(app.epN,Math.ceil(hs/100)*100);app.agg=[];let e=app.aggStart;const sum=a=>a.reduce((x,y)=>x+y,0);while(e+100<=app.epN){app.agg.push([sum(app.hist.slice(e-hs,e-hs+100)),null]);e+=100}const rest=app.hist.slice(e-hs);app.aggCur={n:rest.length,ok:sum(rest),rew:null}}app.recent=Object.keys(d.q).slice(-10).reverse();app.last=null;app.sn=[];
 $("pa").value=app.P.a;$("pg").value=app.P.g;$("pe").value=app.P.e;$("pd").value=app.P.d;$("pn").value=app.P.n;$("rg").value=app.P.rg;$("rc").value=app.P.rc;$("rp").value=app.P.rp;$("ri").value=app.P.ri;$("rd").value=app.P.rd;rwUpd();lock(true);resetCar();app.S=keyOf(app.c);
 $("bGo").disabled=true;$("bPause").disabled=false;$("bBest").disabled=$("bRace").disabled=!app.best;
 if(d.st==="done"||app.epN>=app.P.n){app.st="done";$("bPause").disabled=true;$("bMore").disabled=false}else{app.st="paused";setPU(true)}app.SAVE_OWNED=true;app.savedMax=app.maxIdx;toast("Speicherstand erfolgreich geladen.");return true}catch(e){app.SAVE_OWNED=false;app.st="idle";show("home");toast("Der Speicherstand ist beschädigt.");return false}}
export function exportSave(){persist(); // persist() schreibt nur, wenn die aktuelle Trainingseinheit den Speicher besitzt – sonst wird der gespeicherte Stand unverändert exportiert
 const raw=localStorage.getItem("q1save"),d=readSave(raw);if(!d){toast("Noch kein gültiger Speicherstand zum Exportieren vorhanden.");return}
 const slug=d.tn.toLowerCase().replace(/ä/g,"ae").replace(/ö/g,"oe").replace(/ü/g,"ue").replace(/ß/g,"ss").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""),dt=new Date(),z=n=>String(n).padStart(2,"0");
 const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([raw],{type:"application/json"}));a.download=`quormel1_${slug||"strecke"}_${d.epN}ep_${dt.getFullYear()}-${z(dt.getMonth()+1)}-${z(dt.getDate())}.json`;
 document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000);toast("Speicherstand exportiert: "+a.download)}
export const saveInfo=d=>`${d.tn} · ${d.epN} Episoden · ${d.ok} erfolgreich · beste Fahrt ${d.best?(d.best.steps/60).toFixed(2)+" s":"–"}`;
export function doImport(){const d=app.IMP;app.IMP=null;if(!d)return;if(app.st==="training")app.st="paused";
 if(loadSave(d,true)){persist();if(readSave()){toastL("Speicherstand importiert: "+saveInfo(d),4500)}}} // gespeichert wird erst nach erfolgreichem Laden – ein fehlgeschlagener Import verändert q1save nicht

// Initialisierung (Teil 1 von 2) – wird von main.js in der Reihenfolge der Originaldatei aufgerufen
export function init(){
app.saveMV=MV;
}

// Initialisierung (Teil 2 von 2) – wird von main.js in der Reihenfolge der Originaldatei aufgerufen
export function init2(){
updLoadBtn();
$("bExp").onclick=exportSave;
$("bImp").onclick=()=>{$("fImp").value="";$("fImp").click()};
$("fImp").onchange=()=>{const f=$("fImp").files[0];$("fImp").value="";if(!f)return;if(f.size>25e6){toastL("Die Datei ist zu groß für einen QUORMEL-1-Speicherstand. Es wurde nichts verändert.");return}
 f.text().then(txt=>{const d=readSave(txt);if(!d){toastL("Import abgelehnt: Die Datei ist kein gültiger QUORMEL-1-Speicherstand oder beschädigt. Dein bisheriger Speicherstand bleibt unverändert.",7000);return}
  app.IMP=d;const cur=readSave();if(cur||(app.SAVE_OWNED&&app.st!=="idle")){$("imInfo").innerHTML="Vorhanden: "+(cur?saveInfo(cur):"aktuelles Training (noch nicht gespeichert)")+"<br>Datei: "+saveInfo(d);mdl("im",1)}else doImport()})
 .catch(()=>toastL("Die Datei konnte nicht gelesen werden. Es wurde nichts verändert."))};
$("imOk").onclick=()=>{mdl("im",0);doImport()};
$("mvNo").onclick=()=>{app.MVP=null;mdl("mv",0);toast("Abgebrochen – es wurde nichts geladen.")};
$("mvExp").onclick=()=>exportSave();
$("mvOk").onclick=()=>{const m=app.MVP;app.MVP=null;mdl("mv",0);if(!m)return;if(app.st==="training")app.st="paused";if(loadSave(m.d,m.imp,true)){if(m.imp)persist();toastL("Älterer Speicherstand geladen: Die Q-Werte stammen aus der alten Lernlogik ohne Stillstands-Endstrafe. Für saubere Vergleiche starte ein neues Training.",7000)}};
$("imNo").onclick=()=>{app.IMP=null;mdl("im",0);toast("Import abgebrochen – dein Speicherstand bleibt unverändert.")};
$("imExp").onclick=()=>exportSave();
}
