// QUORMEL 1 – Aktionen für Elemente mit data-click / data-input / data-change.
import {app} from "../state.js";
import {$,mdl,show,toast} from "./dom.js";
import {edClose,edDraw,edFinish,edUndo} from "./editor.js";
import {leave,resume} from "./sim.js";
import {loadSave} from "../storage/save.js";
import {back} from "./race.js";
import {wClose} from "./wheel.js";
import {labExit} from "./lab.js";
import {decDry,decNext,decRun,decUI,faOpen} from "./analysis.js";
import {bvOpen} from "./duel.js";

// ===== Aktionen für Elemente mit data-click / data-input / data-change (ersetzt die früheren Inline-Handler) =====
export const ACTIONS={
 showLib:()=>show('lib'),loadSave:()=>loadSave(),showHome:()=>show('home'),leave:()=>leave(),labExit:()=>labExit(),back:()=>back(),
 edDraw:()=>edDraw(),edUndo:()=>edUndo(),edClear:()=>{app.ep=[];edDraw()},edClose:()=>edClose(),edFinish:()=>edFinish(),
 closeMore:()=>mdl('mm',0),closeFailures:()=>{app.FA=null;mdl('fm',0)},closeDecision:()=>mdl('dm',0),closeParamPick:()=>mdl('po',0),
 closeMenuAnalysis:()=>mdl('ma',0),closeMenuBest:()=>mdl('mb',0),closeDuelSetup:()=>mdl('ko',0),closeBestCompare:()=>{app.BV=null;mdl('bv',0)},
 wClose:()=>wClose(),closeExplain:()=>{$('code').style.display='none'},faOpen:()=>faOpen(),
 decNext:()=>decNext(),decResume:()=>{mdl('dm',0);resume()},decModeA:()=>{app.DM.m=1;decUI()},decModeB:()=>{app.DM.m=2;app.DM.rev=true;decUI()},
 decPred:el=>{app.DM.pred=+el.dataset.arg},decCheck:()=>{if(app.DM.pred===null){toast('Bitte zuerst eine Vermutung wählen.');return}app.DM.rev=true;decUI()},
 decDry:()=>decDry(),decRun:()=>decRun(),raceAgain:()=>$('rGo').click(),bvOpen:()=>bvOpen()};

// Initialisierung – wird von main.js in der Reihenfolge der Originaldatei aufgerufen
export function init(){
["click","input","change"].forEach(t=>document.addEventListener(t,e=>{const el=e.target&&e.target.closest&&e.target.closest("[data-"+t+"]");if(!el)return;const f=ACTIONS[el.dataset[t]];if(f)f(el)}));
}
