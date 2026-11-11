// QUORMEL 1 – Touch-Bedienung: Erkennung von Touch-Geräten und die vier Bildschirmtasten im Rennen (Links, Rechts, Gas, Bremse).
import {app} from "../state.js";
import {$} from "../ui/dom.js";
import {H,W} from "../core/constants.js";

// Touch-Modus: aktiv auf Geräten mit Touch als Hauptbedienung und ab der ersten Berührung mit Finger oder Stift (z. B. Laptop mit Touchscreen).
// Er blendet die Bildschirmtasten im Rennen ein und passt den Starthinweis an. Tastatur und Maus funktionieren weiterhin.
export const isTouch=()=>document.body.classList.contains("touch");
export function setTouch(){if(isTouch())return;document.body.classList.add("touch");
 $("rh").textContent="Tippe auf Gas – deine Zeit und die KI starten gleichzeitig";
 document.querySelector("#ed .hint").textContent="Zeichne deine eigene Rennstrecke mit dem Finger oder Stift.";INS.key=""}

// Bildschirmtasten: Sie setzen dieselben Einträge wie die Tastatur (A, D, W, S). Die Fahrphysik in raceTick() bleibt unberührt.
// Mehrere Finger gleichzeitig sind möglich; ein Finger kann von einer Taste zur Nachbartaste gleiten.
const held=new Map(),down={a:false,d:false,w:false,s:false}; // held: Zeiger -> gedrückte Taste
function keyAt(e){const el=document.elementFromPoint(e.clientX,e.clientY),b=el&&el.closest&&el.closest("#tc [data-key]");return b?b.dataset.key:null}
function sync(){for(const k in down){let on=false;for(const v of held.values())if(v===k)on=true;
 if(on!==down[k]){down[k]=on;app.keys[k]=on;const b=$("tc").querySelector('[data-key="'+k+'"]');b.classList.toggle("on",on);b.setAttribute("aria-pressed",on)}}}
function press(e){e.preventDefault();try{$("tc").setPointerCapture(e.pointerId)}catch(err){}held.set(e.pointerId,keyAt(e));sync()}
function slide(e){if(!held.has(e.pointerId))return;held.set(e.pointerId,keyAt(e));sync()}
function release(e){if(held.delete(e.pointerId))sync()}
function releaseAll(){held.clear();sync()}

// Freie Fläche für die Strecke im Rennen (in CSS-Pixeln). Ohne Touch-Modus: ganzes Fenster (alle Werte 0).
// Mit Touch-Modus bleibt die Kopfzeile frei, und die Tasten liegen entweder neben oder unter der Strecke – je nachdem, wo die Strecke größer wird.
const INS={key:"",v:{l:0,r:0,t:0,b:0}};
export function raceInsets(){const cw=innerWidth,ch=innerHeight,key=isTouch()?cw+"x"+ch:"-";if(key===INS.key)return INS.v;INS.key=key;
 if(!isTouch())return INS.v={l:0,r:0,t:0,b:0};
 const L=$("tcL").getBoundingClientRect(),R=$("tcR").getBoundingClientRect();if(!L.width){INS.key="";return INS.v={l:0,r:0,t:0,b:0}}
 const row=$("rinfo").parentNode.getBoundingClientRect().bottom+6,hud=$("hud").getBoundingClientRect().bottom+6;
 const fit=i=>Math.min((cw-i.l-i.r)/W,(ch-i.t-i.b)/H);
 const side={l:L.right+10,r:cw-R.left+10,t:row,b:0},below={l:0,r:0,t:row,b:ch-Math.min(L.top,R.top)+10};
 const best=fit(side)>=fit(below)?side:below,clear={...best,t:Math.max(row,hud)}; // Zeitanzeige nur freihalten, wenn die Strecke dadurch nicht kleiner wird
 return INS.v=fit(clear)>=fit(best)-1e-9?clear:best}

// Initialisierung – wird von main.js nach allen ursprünglichen Schritten aufgerufen
export function init(){
if(matchMedia("(pointer: coarse)").matches)setTouch();
addEventListener("pointerdown",e=>{if(e.pointerType==="touch"||e.pointerType==="pen")setTouch()},{capture:true,passive:true});
const tc=$("tc");
tc.addEventListener("pointerdown",press);tc.addEventListener("pointermove",slide);
for(const t of["pointerup","pointercancel","lostpointercapture"])tc.addEventListener(t,release);
tc.addEventListener("contextmenu",e=>e.preventDefault());
for(const t of["touchstart","touchmove"])tc.addEventListener(t,e=>{if(e.cancelable)e.preventDefault()},{passive:false}); // Rückfall für Browser ohne touch-action
addEventListener("blur",releaseAll);document.addEventListener("visibilitychange",releaseAll);
// Vollbild-Flächen (Rennen, Wiedergabe): auch dort kein Scrollen/Zoomen durch Wischen auf dem Bild
for(const id of["rc2","fc"])for(const t of["touchstart","touchmove"])$(id).addEventListener(t,e=>{if(e.cancelable)e.preventDefault()},{passive:false});
}
