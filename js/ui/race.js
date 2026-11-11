// QUORMEL 1 – Rennen gegen die KI: Tastatur, Fahrphysik, HUD, Ergebnis, Vollbild.
import {app} from "../state.js";
import {$,show} from "./dom.js";
import {H,V,W} from "../core/constants.js";
import {road} from "../core/track.js";
import {drawCar,drawIdeal} from "../render/sim-view.js";
import {pbGet,pbKey,pbLegacy} from "../storage/records.js";

// ===== P03: Tastenzustand zurücksetzen, wenn das Fenster den Fokus verliert =====
export function clearKeys(){for(const k in app.keys)app.keys[k]=false}
// ===== Rennen =====
export function raceTick(){const cv=$("rc2");if(cv.width!==innerWidth||cv.height!==innerHeight){cv.width=innerWidth;cv.height=innerHeight}const x=cv.getContext("2d"),sc=Math.min(cv.width/W,cv.height/H);x.setTransform(1,0,0,1,0,0);x.fillStyle="#1b2a1f";x.fillRect(0,0,cv.width,cv.height);x.setTransform(sc,0,0,sc,(cv.width-W*sc)/2,(cv.height-H*sc)/2);x.drawImage(app.roadC,0,0);if(app.showIdeal)drawIdeal(x);x.fillStyle="#e8ebf2";x.font="16px sans-serif";
 if(app.R.s==="idle"){x.font="22px sans-serif";x.fillText("Bereit? Klicke auf „Rennen starten“.",330,320);return}
 const now=performance.now();
 if(app.R.s==="cd"){const n=3-Math.floor((now-app.R.t0)/900);drawCar(x,0,app.R.car.x,app.R.car.y,app.R.car.a,"#4da3ff",1);showCd(n>0?n:"");if(n<=0){app.R.s="run";app.R.goT=now;app.R.last=now;app.R.acc=0}return}
 if(app.R.s==="run"){showCd(now-app.R.goT<700?"GO!":"");app.R.acc+=(now-app.R.last)/1000*60;app.R.last=now;const k=app.R.car;while(app.R.acc>=1&&app.R.s==="run"){app.R.acc--;if(!app.R.go){if(app.keys.w||app.keys.b||app.keys.arrowup){app.R.go=true;if($("drv").open){app.DRVAUTO=true;$("drv").open=false}}else{app.R.acc=0;break}}app.R.steps++;
  const up=app.keys.w||app.keys.b||app.keys.arrowup,dn=app.keys.s||app.keys.arrowdown,l=app.keys.a||app.keys.arrowleft,r=app.keys.d||app.keys.arrowright;
  k.v=Math.max(-1,Math.min(V,k.v+(up?.5:dn?-.1:-.02*Math.sign(k.v))));if(!up&&!dn&&Math.abs(k.v)<.03)k.v=0;
  const sv=Math.abs(k.v)<.3&&(up||dn)?(dn?-.35:.35):k.v/V;k.a+=((r?1:0)-(l?1:0))*.09*sv;let nx=k.x+Math.cos(k.a)*k.v,ny=k.y+Math.sin(k.a)*k.v;
  if(road(nx,ny)){k.x=nx;k.y=ny;app.R.was=true}else{k.v*=.5;if(app.R.was){app.R.viol++;app.R.was=false}const mx=k.x+Math.cos(k.a)*k.v,my=k.y+Math.sin(k.a)*k.v;if(wallOk(mx,my,k.i)){k.x=mx;k.y=my}else k.v=0}
  const old=k.i,lo=Math.max(0,k.i-5),hi=Math.min(app.T.p.length-1,k.i+40);let bd=1e9;for(let i=lo;i<=hi;i++){const d=Math.hypot(app.T.p[i].x-k.x,app.T.p[i].y-k.y);if(d<bd){bd=d;k.i=i}}
  if(k.i>app.R.bi){app.R.bi=k.i;app.R.bs=app.R.steps}if(!app.R.aiDone&&app.R.steps>=app.best.steps){app.R.aiDone=true;app.R.aiT=app.best.steps/60} // F5: KI-Zeit steht fest, Spieler fährt weiter
  if(k.i>=app.T.p.length-3)endRace(true);else if(app.R.steps-app.R.bs>=RSTALL||app.R.steps>=Math.max(app.best.steps*20,RMAX))endRace(false)}}
 const gi=Math.min(app.R.steps,app.best.steps-1);drawCar(x,0,app.best.rec[gi*3],app.best.rec[gi*3+1],app.best.rec[gi*3+2],"#ff2d3d",.45);drawCar(x,0,app.R.car.x,app.R.car.y,app.R.car.a,"#4da3ff",1);
 hudUpd(gi);$("rh").style.display=app.R.s==="run"&&!app.R.go?"block":"none";$("rai").style.display=app.R.s==="run"&&app.R.aiDone?"block":"none";
 if(app.R.s==="done")showRes();}
export function endRace(pw){const pt=app.R.steps/60,at=app.best.steps/60;let win=pw&&pt<at;app.R.s="done";$("rGo").style.display="none";app.R.aiDone=true;app.R.aiT=at;hudUpd(0);
 const pv=pbGet(),pb=pv===null?1e9:pv;if(pw&&pt<pb)localStorage.setItem(pbKey(),pt);
 app.R.msg=!pw?"Deine Fahrt wurde nicht abgeschlossen.":win?"Glückwunsch! Die KI wurde besiegt. Die Weltherrschaft muss wohl noch warten!":"Die KI hat gewonnen! Die Weltherrschaft rückt näher. Menschen, genießt eure letzten freien Tage!";
 app.R.lines=["Sieger: "+(win?"Du":"KI"),"Deine Zeit: "+(pw?pt.toFixed(2)+" s":"nicht abgeschlossen")+" · KI-Zeit: "+at.toFixed(2)+" s",pw?"Unterschied: "+Math.abs(pt-at).toFixed(2)+" s":"","Fahrbahnverletzungen: "+app.R.viol,"Persönlicher Rekord: "+(Math.min(pb,pw?pt:1e9)<1e9?Math.min(pb,pw?pt:1e9).toFixed(2)+" s":"–")]}
export function fsOn(){try{document.documentElement.requestFullscreen().catch(()=>0)}catch(e){}}
export function back(){if(document.fullscreenElement)document.exitFullscreen();$("rs").style.display="none";showCd("");show("sim");app.mode="sim"}
export function wallOk(x,y,i){let m=1e9;for(let j=Math.max(0,i-8);j<=Math.min(app.T.p.length-1,i+45);j++)m=Math.min(m,Math.hypot(app.T.p[j].x-x,app.T.p[j].y-y));return m<=app.T.w/2+16} // unsichtbare Wand 16 px hinter dem Straßenrand
// Rennen-HUD
export const fmt=t=>String(Math.floor(t/60)).padStart(2,"0")+":"+(t%60).toFixed(2).padStart(5,"0").replace(".",",");
export function hudUpd(gi){$("hT").textContent=fmt(app.R.steps/60);$("hK").textContent=app.R.aiDone?fmt(app.R.aiT):app.R.s==="run"&&app.R.go?"fährt …":"–"}
export const RSTALL=60*15,RMAX=60*600; // 15 s ohne neuen Streckenfortschritt bzw. 10 min Obergrenze
export function showCd(n){const e=$("cd");e.textContent=n;e.style.display=n===""?"none":"flex"}
export function showRes(){if(app.R.shown)return;app.R.shown=1;const w=app.R.msg.startsWith("Glückwunsch");$("rs").innerHTML=`<div class="rc"><div style="font:italic 900 clamp(20px,3vw,28px)/1.25 'Arial Black',system-ui;letter-spacing:1px;color:${w?"#2ecc71":"#ff2d3d"}">${app.R.msg}</div><div style="color:var(--m);line-height:1.7;margin-top:14px">${app.R.lines.filter(Boolean).join("<br>")}</div><div class="row"><button class="pri" data-click="raceAgain">Noch einmal</button><button data-click="back">Zurück</button></div></div>`;$("rs").style.display="flex"}

// Initialisierung (Teil 1 von 3) – wird von main.js in der Reihenfolge der Originaldatei aufgerufen
export function init(){
addEventListener("blur",clearKeys);
document.addEventListener("visibilitychange",clearKeys);
}

// Initialisierung (Teil 2 von 3) – wird von main.js in der Reihenfolge der Originaldatei aufgerufen
export function init2(){
$("bRace").onclick=()=>{if(!app.best)return;show("race");{const o=localStorage.getItem("q1drv")!=="0";if($("drv").open!==o){app.DRVAUTO=true;$("drv").open=o}}fsOn();app.mode="race";app.R={s:"idle"};$("rGo").style.display="";$("rs").style.display="none";showCd("");$("rGo").textContent="Rennen starten";const pb=pbGet(),lg=pb===null?pbLegacy():null;$("rinfo").textContent=`${app.T.name} · Dein Rekord ${pb!==null?pb.toFixed(2)+" s":"–"}`+(lg!==null?` · Älterer Rekord „${app.T.name}“ (keiner Strecke eindeutig zuordenbar): ${lg.toFixed(2)} s`:"");$("hK").textContent="–";$("rai").style.display="none";$("rGo").disabled=false};
$("rGo").onclick=()=>{app.R={s:"cd",go:false,t0:performance.now(),car:{x:app.T.p[0].x,y:app.T.p[0].y,a:app.T.a0,v:0,i:0},steps:0,acc:0,last:performance.now(),viol:0,was:true,bi:0,bs:0,aiDone:false};$("rGo").style.display="";$("rGo").textContent="Neu starten";$("rGo").blur();$("rs").style.display="none";showCd("")};
addEventListener("keydown",e=>{const k=e.key.toLowerCase();app.keys[k]=true;if(app.page==="race"&&["arrowup","arrowdown","arrowleft","arrowright"," "].includes(k))e.preventDefault()});
addEventListener("keyup",e=>app.keys[e.key.toLowerCase()]=false);
}

// Initialisierung (Teil 3 von 3) – wird von main.js in der Reihenfolge der Originaldatei aufgerufen
export function init3(){
$("drv").open=localStorage.getItem("q1drv")!=="0";
$("drv").ontoggle=()=>{if(app.DRVAUTO){app.DRVAUTO=false;return}localStorage.setItem("q1drv",$("drv").open?"1":"0")}; // P12: automatisches Einklappen ändert die gespeicherte Einstellung nicht
}
