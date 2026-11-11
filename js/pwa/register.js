// QUORMEL 1 – Installierbare Web-App: Service Worker anmelden, Offline-Status, Update-Hinweis, Installationshilfe.
import {app} from "../state.js";
import {$} from "../ui/dom.js";
import {pause} from "../ui/sim.js";

// Läuft die Seite bereits als installierte App (vom Home-Bildschirm gestartet)?
export const isStandalone=()=>matchMedia("(display-mode: standalone)").matches||navigator.standalone===true;
// iPhone/iPad (das iPad meldet sich in Safari als Mac mit Touch)
export const isIOS=()=>/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);

let reloadOnChange=false,installEvt=null;
function showUpdate(reg){$("pwaUpd").hidden=false;
 $("bUpd").onclick=()=>{if(!reg.waiting)return;
  if(app.st==="training")pause(); // laufendes Training anhalten und speichern, bevor die Seite neu lädt
  reloadOnChange=true;$("bUpd").disabled=true;reg.waiting.postMessage("skipWaiting")}}
function ready(){$("pwaState").textContent="Offline bereit – QUORMEL 1 funktioniert jetzt auch ohne Internet."}

// Initialisierung – wird von main.js nach allen ursprünglichen Schritten aufgerufen
export function init(){
// Installation: Android/Chrome/Edge melden sich mit einem Ereignis; auf iPhone und iPad gibt es nur den Weg über „Teilen“.
addEventListener("beforeinstallprompt",e=>{e.preventDefault();installEvt=e;if(!isStandalone())$("bInst").hidden=false});
$("bInst").onclick=()=>{if(!installEvt)return;const e=installEvt;installEvt=null;$("bInst").hidden=true;e.prompt()};
addEventListener("appinstalled",()=>{$("bInst").hidden=true;installEvt=null});
if(isIOS()&&!isStandalone())$("iosHint").hidden=false;
if(!("serviceWorker" in navigator)||!isSecureContext)return; // z. B. sehr alte Browser oder Aufruf ohne HTTPS: Seite läuft normal, nur ohne Offline-Betrieb
navigator.serviceWorker.addEventListener("controllerchange",()=>{if(reloadOnChange)location.reload()});
navigator.serviceWorker.register("sw.js",{updateViaCache:"none"}).then(reg=>{
 // Eine neue Fassung gilt erst als Update, wenn bereits eine alte die Seite steuert (nicht beim allerersten Besuch).
 const check=()=>{if(reg.waiting&&navigator.serviceWorker.controller)showUpdate(reg)};
 check();
 reg.addEventListener("updatefound",()=>{const w=reg.installing;if(w)w.addEventListener("statechange",()=>{if(w.state==="installed")check()})});
 navigator.serviceWorker.ready.then(ready);
 // Beim Zurückkehren in die App nach einer neuen Fassung suchen (nur mit Internet erfolgreich)
 document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")reg.update().catch(()=>0)});
}).catch(()=>{$("pwaState").textContent="Offline-Betrieb ist in diesem Browser nicht verfügbar."});
}
