// QUORMEL 1 – Impressum & Datenschutz: Button unten links öffnet ein Overlay. Schließen mit ✕, Escape oder Klick daneben.
import {$} from "./dom.js";

export function init(){
 const b=$("lgB"),m=$("lgM"),p=m.querySelector(".pan");
 const open=()=>{m.hidden=false;p.focus()},close=()=>{if(m.hidden)return;m.hidden=true;b.focus()};
 b.addEventListener("click",open);
 $("lgX").addEventListener("click",close);
 m.addEventListener("click",e=>{if(e.target===m)close()});
 addEventListener("keydown",e=>{if(e.key==="Escape"&&!m.hidden){e.stopPropagation();close()}});
}
