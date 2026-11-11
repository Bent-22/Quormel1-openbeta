// QUORMEL 1 – Einstieg: Hauptschleife und Initialisierung in der Reihenfolge der Originaldatei.
import {app} from "./state.js";
import {$} from "./ui/dom.js";
import {trainStep} from "./core/qlearning.js";
import {SIM,kpis,simSig} from "./ui/sim.js";
import {drawSim} from "./render/sim-view.js";
import {raceTick} from "./ui/race.js";
import {homeTick} from "./ui/home.js";
import {rpTick} from "./ui/replay.js";
import {labTick} from "./ui/lab.js";
import {faTick} from "./ui/analysis.js";
import {paTick} from "./ui/pause-anim.js";
import {bvTick,djTick} from "./ui/duel.js";
import * as library from "./ui/library.js";
import * as editor from "./ui/editor.js";
import * as sim from "./ui/sim.js";
import * as save from "./storage/save.js";
import * as dom from "./ui/dom.js";
import * as race from "./ui/race.js";
import * as home from "./ui/home.js";
import * as replay from "./ui/replay.js";
import * as wheel from "./ui/wheel.js";
import * as explain from "./ui/explain.js";
import * as lab from "./ui/lab.js";
import * as analysis from "./ui/analysis.js";
import * as duel from "./ui/duel.js";
import * as actions from "./ui/actions.js";
import * as touchControls from "./input/touch-controls.js";

export function loop(){requestAnimationFrame(loop);faTick();bvTick();
 if(app.page==="sim"){paTick();if(app.st==="training"){const n=+$("ps").value;for(let i=0;i<n&&app.st==="training";i++)trainStep()}
  if(app.T){if(app.st==="training"){drawSim();if(++app.fr%4===0)kpis()}else{const sg=simSig(),now=performance.now();if(sg!==SIM.sig||now-SIM.t>1000){SIM.sig=sg;SIM.t=now;drawSim();kpis()}}}} // F6: außerhalb des Trainings nur bei Änderungen (spätestens 1×/s) neu zeichnen
 else if(app.page==="home")homeTick();else if(app.page==="rpv")rpTick();else if(app.page==="race")raceTick();else if(app.page==="pl")labTick();else if(app.page==="dj")djTick()}

// ===== Initialisierung: exakt die Reihenfolge der Anweisungen der Originaldatei =====
library.init();
editor.init();
sim.init();
save.init();
sim.init2();
save.init2();
dom.init();
race.init();
sim.init3();
home.init();
replay.init();
race.init2();
wheel.init();
explain.init();
sim.init4();
explain.init2();
lab.init();
sim.init5();
race.init3();
analysis.init();
sim.init6();
duel.init();
replay.init2();
actions.init();
editor.init2();
// ===== Ab hier: Ergänzungen, die es in der Originaldatei nicht gab =====
touchControls.init();
requestAnimationFrame(loop);
