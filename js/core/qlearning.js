// QUORMEL 1 – Q-Learning-Kern: Sensoren, Zustand, Aktionswahl, Bewegung, Reward, Q-Update, Episodenende.
// Unverändert aus der Originaldatei übernommen – nicht ohne Vergleichstest ändern (tests/golden.mjs).
import {app} from "../state.js";
import {$,toast} from "../ui/dom.js";
import {ACT,H,TURN,V,W} from "./constants.js";
import {rnd} from "./rng.js";
import {road} from "./track.js";
import {setPU,trainAbort} from "../ui/sim.js";
import {persist} from "../storage/save.js";

// ===== Q-Learning =====
export const getQ=k=>{let q=app.Q.get(k);if(!q){q=[0,0,0,0,0];app.Q.set(k,q)}return q};
// Die Straßenabfrage entspricht road() aus track.js. Maske und Weltgröße werden hier einmal pro Aufruf in lokale Variablen geholt:
// Zugriffe auf Modulvariablen wären in dieser innersten Schleife deutlich langsamer. Ergebnis identisch (siehe tests/golden.cjs).
export function sense(c){const m=app.mask,w=W,h=H,on=(x,y)=>x>=0&&y>=0&&x<w&&y<h&&m[(y|0)*w+(x|0)]===1;return[-90,-45,0,45,90].map(d=>{const a=c.a+d*Math.PI/180;let r=0;while(r<120&&on(c.x+Math.cos(a)*r,c.y+Math.sin(a)*r))r+=3;return r})}
export const binS=v=>v<35?0:v<70?1:2;
export function keyOf(c){app.sn=sense(c);const g=app.T.p[app.T.p.length-1];let ga=Math.atan2(g.y-c.y,g.x-c.x)-c.a;while(ga>Math.PI)ga-=2*Math.PI;while(ga<-Math.PI)ga+=2*Math.PI;const gb=ga<-1?0:ga<-.3?1:ga<.3?2:ga<1?3:4;return app.sn.map(binS).join("")+"|"+gb}
export function nearest(c){let bi=c.i,bd=1e9;const lo=Math.max(0,c.i-5),hi=Math.min(app.T.p.length-1,c.i+40);for(let i=lo;i<=hi;i++){const d=Math.hypot(app.T.p[i].x-c.x,app.T.p[i].y-c.y);if(d<bd){bd=d;bi=i}}return[bi,bd]}
export function resetCar(){app.c={x:app.T.p[0].x,y:app.T.p[0].y,a:app.T.a0,i:0,steps:0};app.rec=[];app.epLog=[];app.epRew=0}
export function stepCar(c,act){c.a+=TURN[act];c.x+=Math.cos(c.a)*V;c.y+=Math.sin(c.a)*V;c.steps++;const old=c.i,[i,d]=nearest(c);c.i=i;
 if(!road(c.x,c.y))return{r:-app.P.rc,done:true,win:false};
 if(i>=app.T.p.length-3)return{r:app.P.rg,done:true,win:true};
 let r=(i-old)*app.P.rp-.1-app.P.rd*(d/(app.T.w/2));if(i<=old)r-=app.P.ri;return{r,done:false}}
export const best_=q=>{let m=Math.max(...q),ix=[];q.forEach((v,i)=>v===m&&ix.push(i));return ix[rnd(ix.length)]};
export function trainStep(){ // Zustand -> Aktion (epsilon-greedy) -> Bewegung -> Reward -> Q-Update
 const q=getQ(app.S),ch=chooseAction(q,app.P.eps_),ex=ch.ex,a=ch.a,oldv=q[a],before=q.slice(),sens=app.sn.slice(),sk=app.S;
 const c0={...app.c};let res=stepCar(app.c,a);if(app.c.i>(app.c.bi||0)){app.c.bi=app.c.i;app.c.bs=app.c.steps}
 if(!res.done&&app.c.steps-(app.c.bs||0)>=1500)res={r:-app.P.rc,done:true,win:false,stall:true}; // P07: Stillstand beendet die Episode wie ein Crash (Endzustand, kein Zukunftswert)
 const s2=keyOf(app.c),nmax=Math.max(...getQ(s2)),tgt=res.done?res.r:res.r+app.P.g*nmax,nv=oldv+app.P.a*(tgt-oldv);
 if(!Number.isFinite(res.r)||!Number.isFinite(oldv)||(!res.done&&!Number.isFinite(nmax))||!Number.isFinite(tgt)||!Number.isFinite(nv)){Object.assign(app.c,c0);keyOf(app.c); // F1: ungültiger Schritt wird verworfen, Q-Tabelle bleibt unverändert
  trainAbort(!Number.isFinite(res.r)?`Ungültiger Reward-Wert (${res.r}) in Episode ${app.epN+1}. Bitte prüfe die Reward-Gewichte.`:`Ungültiger Q-Wert im Zustand ${sk} (alt ${oldv}, Ziel ${tgt}).`);return}
 q[a]=nv;
 app.last={sk,sens,a,ex,before,old:oldv,r:res.r,tgt,nw:q[a]};app.epLog.push([a,+res.r.toFixed(1),sens.map(v=>v|0),sk,ex?1:0,before.map(v=>+v.toFixed(2))]);if(app.epLog.length>80)app.epLog.shift();app.epRew+=res.r;app.rec.push(+app.c.x.toFixed(1),+app.c.y.toFixed(1),+app.c.a.toFixed(3));app.maxIdx=Math.max(app.maxIdx,app.c.i);
 app.recent.unshift(sk);app.recent=[...new Set(app.recent)].slice(0,10);
 app.logs.unshift(`Ep ${app.epN+1}: Zustand ${sk} · ${ex?"Exploration":"Exploitation"} → ${ACT[a]} · r=${res.r.toFixed(1)} · Q ${oldv.toFixed(2)}→${q[a].toFixed(2)}`);app.logs.length=Math.min(app.logs.length,8);
 app.S=s2;if(res.done||app.c.steps>=maxSteps())endEp(res.win===true,res.win?"win":res.stall?"stall":res.done?"off":"time")}
export function endEp(win,why){app.epN++;win?app.ok++:app.fail++;if(!win&&!app.LAB){app.fails.unshift({ep:app.epN,why,steps:app.c.steps,prog:Math.round(app.c.i/(app.T.p.length-1)*100),rec:app.rec.slice(-240),log:app.epLog.slice(),path:pathOf(app.rec)});app.fails.length=Math.min(app.fails.length,8)}app.hist.push(win?1:0);app.sumRew+=app.epRew;app.sumSteps+=app.c.steps;
 if(!app.LAB){app.aggCur.n++;if(win)app.aggCur.ok++;if(app.aggCur.rew!==null)app.aggCur.rew+=app.epRew;if(app.aggCur.n>=100){app.agg.push([app.aggCur.ok,app.aggCur.rew===null?null:+app.aggCur.rew.toFixed(1)]);app.aggCur={n:0,ok:0,rew:0}}if(app.hist.length>4000)app.hist.splice(0,app.hist.length-2000)} // F4: Langzeitstatistik, Detailhistorie begrenzt
 if(win){app.okSteps++;if(!app.best||app.c.steps<app.best.steps){app.best={steps:app.c.steps,rec:app.rec.slice()};$("bBest").disabled=$("bRace").disabled=false;toast("Glückwunsch! Das Auto hat das Ziel erreicht. Beste Fahrt gespeichert.")}}
 app.P.eps_=Math.max(.05,app.P.eps_*app.P.d);if(app.epN%50===0||win||app.maxIdx>app.savedMax)persist();
 if(app.epN>=app.P.n){finish();return}resetCar();app.S=keyOf(app.c)}
export function pathOf(r){const n=r.length/3,k=Math.max(1,Math.ceil(n/300)),o=[];for(let i=0;i<n;i+=k)o.push(Math.round(r[i*3]),Math.round(r[i*3+1]));if(n)o.push(Math.round(r[(n-1)*3]),Math.round(r[(n-1)*3+1]));return o} // P11: verkleinerte Gesamtfahrt (max. ~300 Punkte) für die blasse Darstellung
export function finish(){app.st="done";setPU(false);persist();$("bPause").disabled=true;$("bMore").disabled=false;toast(app.ok?"Das Training ist beendet.":"Die KI hat das Ziel innerhalb der bisherigen Trainingsversuche noch nicht erreicht.")}
// Aktionswahl (ε-greedy); FORCE erzwingt die im Entscheidungsmodus untersuchte Aktion
export function chooseAction(q,eps){if(app.FORCE){const f=app.FORCE;app.FORCE=null;return f}const ex=Math.random()<eps;return{ex,a:ex?rnd(5):best_(q)}}
// ===== Dynamisches Schrittlimit =====
export function maxSteps(){return app.T.ms||(app.T.ms=Math.min(60000,Math.max(1500,Math.ceil((app.T.p.length-1)*5/V*2.5))))} // 2,5-fache ideale Fahrzeit, mindestens wie bisher 1500
