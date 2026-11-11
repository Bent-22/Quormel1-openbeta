// QUORMEL 1 – Gemeinsamer veränderlicher Zustand der Anwendung.
// Früher globale Variablen der Einzeldatei; Namen und Startwerte sind unverändert.
// Gruppiert nach dem Modul, zu dem die Werte fachlich gehören.
export const app={
 // ui/dom.js
 page:"home",mode:"home",
 // core/track.js
 T:null,mask:null,roadC:null,
 // ui/editor.js
 ep:[],drawing:false,
 ec:undefined,ex:undefined,
 // core/qlearning.js
 agg:[],aggStart:0,aggCur:{n:0,ok:0,rew:0}, // F4: ältere Episoden je 100 zusammengefasst ([erfolgreich, Reward-Summe])
 Q:new Map(),P:undefined,st:"idle",c:undefined,S:undefined,sn:[],eps:1,epN:0,ok:0,fail:0,hist:[],best:null,rec:[],epRew:0,sumRew:0,sumSteps:0,maxIdx:0,last:null,logs:[],recent:[],okSteps:0,
 // ui/sim.js
 fr:0,
 // storage/save.js
 SAVE_OWNED:false,savedMax:0,saveMV:undefined,MVP:null, // MV: Version der Lernlogik (2 = mit Stillstands-Endstrafe, P07) // darf die aktuelle Trainingseinheit q1save schreiben?
 IMP:null,
 // render/sim-view.js
 showIdeal:false,
 // ui/race.js
 R:{s:"idle"},keys:{},
 DRVAUTO:false,
 // ui/home.js
 hp:undefined,
 hi:0,
 // ui/replay.js
 rpk:0,rpPlay:false,
 rpSig:"",
 FDBG:false,
 // ui/wheel.js
 wid:undefined,wr:0,wv:[],wbusy:false,wres:null,
 // ui/lab.js
 LAB:null,psel:null,
 // ui/analysis.js
 epLog:[],fails:[],FORCE:null,DEC:null,FA:null,DM:{},
 // storage/records.js
 PREID:null,
 // ui/duel.js
 DU:null,KP:null,NOTOAST:false,BV:null,
};
