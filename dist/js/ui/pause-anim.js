// QUORMEL 1 – Pausenanimation am Fortsetzen-Knopf.
import {app} from "../state.js";
import {$} from "./dom.js";
import {drawCar} from "../render/sim-view.js";
import {hd} from "../render/hidpi.js";

// Pausenanimation: Auto zeichnet einen Pfeil Richtung „Fortsetzen“
export const PA={t0:0};
export function paPath(){const a=[8,84],t=[75,24],d=Math.atan2(t[1]-a[1],t[0]-a[0]),w=(k)=>[t[0]-14*Math.cos(d+k),t[1]-14*Math.sin(d+k)];return[a,t,w(.5),t,w(-.5)]}
export function paAt(pts,sl){for(let i=0;i<pts.length-1;i++){const l=Math.hypot(pts[i+1][0]-pts[i][0],pts[i+1][1]-pts[i][1]);if(sl<=l||i===pts.length-2){const u=Math.min(1,sl/l);return[pts[i][0]+(pts[i+1][0]-pts[i][0])*u,pts[i][1]+(pts[i+1][1]-pts[i][1])*u,Math.atan2(pts[i+1][1]-pts[i][1],pts[i+1][0]-pts[i][0])]}sl-=l}}
export function paTrail(x,pts,len,al){let rest=len;x.strokeStyle=`rgba(255,45,61,${al})`;x.lineWidth=3;x.lineCap=x.lineJoin="round";x.beginPath();x.moveTo(pts[0][0],pts[0][1]);for(let i=0;i<pts.length-1&&rest>0;i++){const l=Math.hypot(pts[i+1][0]-pts[i][0],pts[i+1][1]-pts[i][1]),u=Math.min(1,rest/l);x.lineTo(pts[i][0]+(pts[i+1][0]-pts[i][0])*u,pts[i][1]+(pts[i+1][1]-pts[i][1])*u);rest-=l}x.stroke()}
export function paTick(){if(app.st!=="paused"){PA.t0=0;return}const x=hd($("pac"));x.clearRect(0,0,150,90);const pts=paPath(),L=pts.slice(1).reduce((s,p,i)=>s+Math.hypot(p[0]-pts[i][0],p[1]-pts[i][1]),0);
 if(matchMedia("(prefers-reduced-motion: reduce)").matches){paTrail(x,pts,L,1);return}
 const now=performance.now();if(!PA.t0)PA.t0=now;const T0=now-PA.t0,cyc=Math.floor(T0/3300),ct=T0%3300;
 if(cyc>0)paTrail(x,pts,L,Math.max(0,1-ct/1200)); // alte Spur verblasst
 let car;if(ct<2400){const sl=L*ct/2400;paTrail(x,pts,sl,1);car=paAt(pts,sl)}else{paTrail(x,pts,L,1);const u=(ct-2400)/900,e=u*u*(3-2*u),e2=pts[4];car=[e2[0]+(pts[0][0]-e2[0])*e,e2[1]+(pts[0][1]-e2[1])*e,Math.atan2(pts[0][1]-e2[1],pts[0][0]-e2[0])]}
 drawCar(x,0,car[0],car[1],car[2],"#ff2d3d",1)}
