// QUORMEL 1 – Startseite: animierte Strecke.
import {app} from "../state.js";
import {$} from "./dom.js";
import {PRE,cat,rs} from "../core/track.js";
import {drawCar} from "../render/sim-view.js";

// ===== Startseite =====
export function homeTick(){const cv=$("hc"),x=cv.getContext("2d");x.clearRect(0,0,900,360);x.save();x.scale(.9,.5625);x.lineCap=x.lineJoin="round";x.strokeStyle="#e8ebf2";x.lineWidth=60;x.beginPath();app.hp.forEach((q,i)=>i?x.lineTo(q.x,q.y):x.moveTo(q.x,q.y));x.stroke();x.strokeStyle="#2b303c";x.lineWidth=52;x.stroke();x.setLineDash([12,16]);x.strokeStyle="#ffffff55";x.lineWidth=2;x.stroke();x.setLineDash([]);
 app.hi=(app.hi+1.2)%(app.hp.length-4);const i=app.hi|0,a=app.hp[i],b=app.hp[i+3];drawCar(x,0,a.x,a.y,Math.atan2(b.y-a.y,b.x-a.x),"#ff2d3d",1);x.restore()}

// Initialisierung – wird von main.js in der Reihenfolge der Originaldatei aufgerufen
export function init(){
app.hp=rs(cat(PRE[0].c),5);
}
