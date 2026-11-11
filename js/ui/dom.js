// QUORMEL 1 – Oberflächen-Helfer: Elementzugriff, Seitenwechsel, Hinweise (Toast), Modale, sparsames Schreiben ins DOM.
import {app} from "../state.js";
import {dbgReset} from "./replay.js";

// ===== Hilfen =====
export const $=id=>document.getElementById(id);
export function show(id){document.querySelectorAll("section").forEach(s=>s.classList.toggle("on",s.id===id));app.page=id;if(id==="home")app.mode="home";dbgReset()}
export function toast(t){if(app.NOTOAST)return;const e=$("toast");e.textContent=t;e.style.display="block";clearTimeout(toast.t);toast.t=setTimeout(()=>e.style.display="none",2500)}
export function toastForce(t){const n=app.NOTOAST;app.NOTOAST=false;toast(t);app.NOTOAST=n}
export const setH=(el,h)=>{if(el._h!==h){el._h=h;el.innerHTML=h}},setT=(el,t)=>{if(el._t!==t){el._t=t;el.textContent=t}}; // F6: identische Inhalte nicht erneut schreiben
export function toastL(t,ms){toast(t);clearTimeout(toast.t);toast.t=setTimeout(()=>$("toast").style.display="none",ms||6000)}
export const mdl=(id,on)=>$(id).style.display=on?"flex":"none";

// Initialisierung – wird von main.js in der Reihenfolge der Originaldatei aufgerufen
export function init(){
// ===== P02: Fokus nach Mausklick zurücksetzen (Tastaturbedienung bleibt: dort ist e.detail 0) =====
addEventListener("click",e=>{const b=e.target&&e.target.closest&&e.target.closest("button,summary");if(b&&e.detail>0)b.blur()});
}
