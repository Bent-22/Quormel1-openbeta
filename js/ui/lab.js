// QUORMEL 1 – Parameter-Labor: ein Parameter auf fester S-Kurve, eigener Lernstand.
import {app} from "../state.js";
import {$,mdl,show} from "./dom.js";
import {ACT} from "../core/constants.js";
import {cat,rs,setTrack} from "../core/track.js";
import {getQ,keyOf,resetCar,trainStep} from "../core/qlearning.js";
import {drawSim} from "../render/sim-view.js";

// ===== Parameter lernen (isoliert: eigene Q-Tabelle, Zustand wird beim Verlassen wiederhergestellt) =====
export const LCTRL=[[50,330],[220,330],[360,170],[500,320],[640,470],[780,330],[950,330]];
export const LPAR=[
{id:"a",n:"Lernrate (Alpha)",k:"a",min:.01,max:1,st:.01,d:.15,t:["Die Lernrate bestimmt, wie stark neue Erfahrungen die bisherigen Einschätzungen des Autos verändern. Hoch heißt starke Anpassung, niedrig heißt kleine Schritte.","Stell dir vor, das Auto lenkt in der Kurve falsch. Bei hoher Lernrate verändert sich der Q-Wert dieser Aktion deutlich, bei niedriger nur ein wenig. Das Lernen ist dann ruhiger, aber langsamer.","Probiere 1,00 aus und beobachte, wie stark die orange markierten Q-Werte springen."]},
{id:"g",n:"Discount-Faktor (Gamma)",k:"g",min:0,max:.99,st:.01,d:.95,t:["Der Discount-Faktor legt fest, wie wichtig zukünftige Belohnungen sind. Bei 0 zählt nur der nächste Schritt, nahe 1 zählt auch das weit entfernte Ziel.","Beispiel: Das Auto lenkt früh in eine Kurve, die erst später Fortschritt bringt. Mit hohem Gamma lohnt sich dieses vorausschauende Lenken.","Teste Gamma 0 und schau, ob das Auto kurzsichtig lenkt."]},
{id:"e",n:"Explorationsrate (Epsilon)",k:"eps_",min:.05,max:1,st:.05,d:1,t:["Epsilon ist die Wahrscheinlichkeit, mit der das Auto zufällig etwas ausprobiert (Exploration) statt die beste bekannte Aktion zu wählen (Exploitation).","Bei 1,00 fährt das Auto zufällig und entdeckt neue Wege. Bei 0,05 verlässt es sich fast nur auf seine Q-Tabelle.","Beobachte, wie viele neue Zustände bei hohem Epsilon in der Tabelle entstehen. Die Abnahme pro Episode ist hier fest."]},
{id:"d",n:"Explorationsabnahme (Epsilon Decay)",k:"d",min:.9,max:1,st:.001,d:.995,t:["Die Explorationsabnahme senkt Epsilon nach jeder Episode (Epsilon mal Faktor). 0,995 heißt langsames Abnehmen, 0,90 sehr schnelles.","Beispiel: Bei 0,90 ist Epsilon nach 20 Fahrten nur noch etwa 0,12. Das Auto verlässt sich früh auf unfertiges Wissen.","Beobachte „ε aktuell“ über mehrere Episoden."]},
{id:"rg",n:"Belohnung für das Erreichen des Ziels",k:"rg",min:0,max:300,st:10,d:100,t:["Die Zielbelohnung ist die große Prämie fürs Erreichen des Ziels. Über Gamma zieht sie die Werte der Zustände davor nach oben.","Beispiel: Bei 0 gibt es keinen Extra-Grund, das Ziel zu erreichen. Bei 300 lohnt sich jeder Weg dorthin stark.","Beobachte die Q-Werte kurz vor dem Ziel."]},
{id:"rc",n:"Strafe für das Verlassen der Straße",k:"rc",min:0,max:300,st:10,d:100,t:["Die Strafe wird abgezogen, wenn das Auto die Straße verlässt. Sie lehrt das Auto, gefährliche Lenkaktionen zu meiden.","Beispiel: Bei hoher Strafe sinkt der Q-Wert der Aktion vor dem Fehler stark. Bei 0 hat ein Fehler kaum Folgen.","Beobachte, wie Aktionen kurz vor dem Straßenrand schlechter bewertet werden."]},
{id:"rp",n:"Belohnung für den Fortschritt",k:"rp",min:0,max:10,st:.5,d:3,t:["Die Fortschrittsbelohnung gibt Punkte für jeden Streckenabschnitt, den das Auto Richtung Ziel schafft. So wird Vorwärtsfahren attraktiv.","Beispiel: Ohne sie lernt das Auto langsam, weil erst das Ziel belohnt wird. Mit hohem Wert lernt es schneller vorwärts zu fahren.","Beobachte den Reward pro Schritt."]},
{id:"ri",n:"Strafe für Stillstand",k:"ri",min:0,max:3,st:.1,d:.5,t:["Die Stillstandsstrafe wird abgezogen, wenn kein Fortschritt entsteht. Sie verhindert, dass das Auto auf der Stelle fährt oder zurückrollt.","Beispiel: Bei hoher Strafe sind Schritte ohne Fortschritt unattraktiv, bei 0 kostet Trödeln nichts.","Beobachte, wie der Reward in Schritten ohne Fortschritt sinkt."]}];
export function labEnter(id){if(!app.LAB)app.LAB={snap:{T:app.T,mask:app.mask,roadC:app.roadC,Q:app.Q,P:app.P,c:app.c,S:app.S,sn:app.sn,epN:app.epN,ok:app.ok,fail:app.fail,hist:app.hist,best:app.best,rec:app.rec,epRew:app.epRew,sumRew:app.sumRew,sumSteps:app.sumSteps,maxIdx:app.maxIdx,last:app.last,logs:app.logs,recent:app.recent,okSteps:app.okSteps,st:app.st},fast:false};labSpd(app.LAB.fast);
 const pr=LPAR.find(p=>p.id===id);app.LAB.k=pr;app.LAB.run=false;app.LAB.f=0;
 setTrack("Lernstrecke S-Kurve",80,rs(cat(LCTRL),5));app.Q=new Map();app.P={a:.15,g:.95,e:1,d:.995,n:1e9,rg:100,rc:100,rp:3,ri:.5,rd:.5,eps_:1};
 app.epN=app.ok=app.fail=app.sumRew=app.sumSteps=app.maxIdx=app.okSteps=0;app.hist=[];app.best=null;app.logs=[];app.recent=[];app.last=null;app.sn=[];app.st="lab";resetCar();app.S=keyOf(app.c);
 $("lt").textContent=pr.n;$("le").innerHTML=pr.t.map(t=>`<p>${t}</p>`).join("");const sl=$("ls");sl.min=pr.min;sl.max=pr.max;sl.step=pr.st;sl.value=pr.d;$("lv").textContent=pr.d;$("ll").textContent=pr.n+" (aktiv)";
 $("lo").innerHTML=LPAR.filter(p=>p.id!==id).map(p=>`<label>${p.n}<input disabled value="${p.d}"></label>`).join("");$("lGo").textContent="Starten";show("pl");window.scrollTo(0,0)}
export function labExit(){if(!app.LAB)return;({T:app.T,mask:app.mask,roadC:app.roadC,Q:app.Q,P:app.P,c:app.c,S:app.S,sn:app.sn,epN:app.epN,ok:app.ok,fail:app.fail,hist:app.hist,best:app.best,rec:app.rec,epRew:app.epRew,sumRew:app.sumRew,sumSteps:app.sumSteps,maxIdx:app.maxIdx,last:app.last,logs:app.logs,recent:app.recent,okSteps:app.okSteps,st:app.st}=app.LAB.snap);app.LAB=null;$("bBest").disabled=$("bRace").disabled=!app.best;show("lib");$("pw").scrollIntoView()}
// P05: Zeitlupe = 1 Lernschritt pro 12 Bilder (≈ 5 Schritte/s bei 60 Bildern/s), Schnell = 20 Lernschritte pro Bild (≈ 1200 Schritte/s)
export function labSpd(fast){if(!app.LAB)return;app.LAB.fast=fast;$("lSlow").classList.toggle("sel",!fast);$("lFast").classList.toggle("sel",fast);$("lSpd").textContent=fast?"20 Lernschritte pro Bild – Lernfortschritt sichtbar":"1 Lernschritt pro 12 Bilder – jede Entscheidung nachvollziehbar"}
export function labTick(){if(!app.LAB)return;if(app.LAB.run){app.LAB.f++;if(app.LAB.fast){for(let i=0;i<20&&app.LAB.run;i++)trainStep()}else if(app.LAB.f%12===0)trainStep()}
 if(app.LAB.run){drawSim($("lc"));if(app.LAB.f%4===0)labUI()}else{const sg=[app.epN,app.Q.size,app.c&&app.c.x,app.c&&app.c.y,app.last&&app.last.nw,app.LAB.k&&app.P[app.LAB.k.k],app.recent[0]].join("|"),now=performance.now();if(sg!==app.LAB.sig||now-(app.LAB.t||0)>1000){app.LAB.sig=sg;app.LAB.t=now;drawSim($("lc"));labUI()}}} // F6
export function labUI(){const l50=app.hist.slice(-50),k=[["Episode",app.epN],["Erfolgreich",app.ok],["Fehlgeschlagen",app.fail],["ε aktuell",app.P.eps_.toFixed(3)],["Erfolgsquote (letzte 50)",l50.length?Math.round(l50.reduce((a,b)=>a+b,0)/l50.length*100)+"%":"–"],["Bester Fortschritt",Math.round(app.maxIdx/(app.T.p.length-1)*100)+"%"]];
 if(app.last)k.push(["Zustand",app.last.sk],["Sensoren (px)",app.last.sens.map(v=>v|0).join(" / ")],["Aktion",ACT[app.last.a]+" – "+(app.last.ex?"Exploration":"Exploitation")],["Reward",app.last.r.toFixed(1)],["Q alt → neu",app.last.old.toFixed(2)+" → "+app.last.nw.toFixed(2)]);
 $("lk").innerHTML=k.map(a=>`<div>${a[0]}<b>${a[1]}</b></div>`).join("");
 $("lm").textContent=app.last?"Orange markiert: zuletzt veränderter Q-Wert. Grün: höchster Wert im Zustand.":"Noch keine Trainingsdaten vorhanden. Starte das Training, damit die KI ihre ersten Erfahrungen sammelt.";
 $("lq").innerHTML="<tr><th>Zustand"+ACT.map(a=>"<th>"+a.replace("Stark ","St. ").replace("Leicht ","L. ")).join("")+"</tr>"+app.recent.map(key=>{const q=getQ(key),m=Math.max(...q);return`<tr><td>${key}`+q.map((v,i)=>`<td class="${v===m&&m!==0?"mx":""} ${app.last&&key===app.last.sk&&i===app.last.a?"up":""}">${v.toFixed(2)}`).join("")+"</tr>"}).join("")}

// Initialisierung – wird von main.js in der Reihenfolge der Originaldatei aufgerufen
export function init(){
$("pw").innerHTML='<div class="drawb" id="pOpen"><svg width="76" height="76" viewBox="0 0 24 24" fill="none" stroke="#ff2d3d" stroke-width="1.6" stroke-linecap="round"><path d="M4 7h8M18 7h2M4 17h3M13 17h7"/><circle cx="15" cy="7" r="2.2"/><circle cx="10" cy="17" r="2.2"/></svg><h3 style="margin:10px 0 4px">Parameter lernen</h3><p style="color:var(--m);margin:0">Untersuche, wie einzelne Lernparameter das Verhalten der KI verändern.</p></div>';
$("pOpen").onclick=()=>mdl("po",1);
LPAR.forEach(p=>{const b=document.createElement("button");b.textContent=p.n;b.onclick=()=>{app.psel=p.id;[...$("pg2").children].forEach(x=>x.classList.toggle("sel",x===b));$("pGo").disabled=false};$("pg2").appendChild(b)});
$("pGo").onclick=()=>{mdl("po",0);labEnter(app.psel)};
$("ls").oninput=()=>{if(!app.LAB)return;const v=+$("ls").value;app.P[app.LAB.k.k]=v;$("lv").textContent=v}; // wirkt ab dem nächsten Lernschritt
$("lGo").onclick=()=>{if(!app.LAB)return;app.LAB.run=!app.LAB.run;$("lGo").textContent=app.LAB.run?"Pausieren":"Fortsetzen"};
$("lRe").onclick=()=>{if(app.LAB)labEnter(app.LAB.k.id)};
$("lSlow").onclick=()=>labSpd(false);
$("lFast").onclick=()=>labSpd(true);
}
