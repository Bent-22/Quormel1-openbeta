// QUORMEL 1 – Schutz der Trainingsstände vor Verlust.
import {app} from "../state.js";
import {$} from "../ui/dom.js";
import {hasValidSave,persist,updLoadBtn} from "./save.js";

// Speichern, sobald die App in den Hintergrund geht oder geschlossen wird. Mobilgeräte beenden Web-Apps im Hintergrund ohne Vorwarnung;
// ohne diesen Schritt gingen bis zu 49 Episoden seit dem letzten automatischen Speichern verloren. Format und Inhalt wie bei jedem Speichern.
// Sicherung: Ergibt das Speichern keinen gültigen Stand (z. B. nach einem Trainingsabbruch wegen ungültiger Zahlenwerte),
// wird der vorherige Stand zurückgeschrieben. Ein gültiger Stand wird so nie durch einen ungültigen ersetzt.
export function saveOnHide(){if(!app.SAVE_OWNED||(app.st!=="training"&&app.st!=="paused"))return;
 const prev=localStorage.getItem("q1save"),t=app.NOTOAST;app.NOTOAST=true;persist();app.NOTOAST=t; // ohne Hinweis: die App ist in diesem Moment nicht sichtbar
 if(prev!==null&&!hasValidSave()){try{localStorage.setItem("q1save",prev)}catch(e){}updLoadBtn()}}

// Den Browser bitten, die Daten dieser Seite nicht selbstständig zu löschen (bei Platzmangel oder langer Nichtnutzung).
// Ob er zustimmt, entscheidet der Browser; installierte Apps haben die besten Chancen.
let asked=false;
export function requestPersistence(){if(asked||!navigator.storage||!navigator.storage.persist)return;asked=true;
 navigator.storage.persist().then(showState).catch(()=>0)}
function showState(ok){if(!hasValidSave()&&!app.SAVE_OWNED){$("pwaStore").textContent="";return}
 $("pwaStore").textContent=ok?"Trainingsstände sind auf diesem Gerät dauerhaft gespeichert.":"Der Browser kann Trainingsstände bei Platzmangel oder langer Nichtnutzung löschen. Sichere wichtige Stände mit „Speicherstand exportieren“."}

// Initialisierung – wird von main.js nach allen ursprünglichen Schritten aufgerufen
export function init(){
addEventListener("pagehide",saveOnHide);
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden")saveOnHide()});
// Die Bitte um dauerhaften Speicher stellen, sobald es etwas zu schützen gibt: Trainingsstart, Laden oder Import eines Standes.
for(const id of["bGo","owOk","bCont","imOk","mvOk"])$(id).addEventListener("click",requestPersistence);
if(navigator.storage&&navigator.storage.persisted)navigator.storage.persisted().then(showState).catch(()=>0);
}
