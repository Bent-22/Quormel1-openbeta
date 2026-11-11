// QUORMEL 1 – Draufsicht: Auto, Sensorstrahlen, Fortschrittsmarkierung, Ideallinie, Erfolgsdiagramm.
import {app} from "../state.js";
import {$} from "../ui/dom.js";
import {H,W} from "../core/constants.js";
import {road} from "../core/track.js";

// F4: Diagramm über das gesamte Training – ältere Abschnitte aus 100er-Blöcken, neuere aus der Detailhistorie (gleitend 50)
export function drawChart(){const x=$("ch").getContext("2d"),w=320,h=80;x.clearRect(0,0,w,h);if(!app.epN||!app.hist.length&&!app.agg.length)return;
 const N=app.epN,hs=app.epN-app.hist.length,X=e=>e/N*w,Y=v=>h-4-v*(h-8),first=Math.min(app.aggStart,hs);
 if(first>0){x.save();x.beginPath();x.rect(0,0,X(first),h);x.clip();x.fillStyle="#262c3a";x.fillRect(0,0,X(first),h);x.strokeStyle="#3a4258";x.lineWidth=1;for(let k=-h;k<X(first);k+=6){x.beginPath();x.moveTo(k,h);x.lineTo(k+h,0);x.stroke()}x.restore();x.fillStyle="#8a93a6";x.font="9px system-ui";if(X(first)>46)x.fillText("keine Daten",3,11)}
 x.strokeStyle="#ff2d3d";x.lineWidth=1;x.beginPath();let pr=false;const pt=(e,v)=>{pr?x.lineTo(X(e),Y(v)):x.moveTo(X(e),Y(v));pr=true};
 for(let k=0;k<app.agg.length;k++){const e0=app.aggStart+k*100;if(e0+100>hs)break;pt(e0+50,app.agg[k][0]/100)}
 const stp=Math.max(1,Math.floor(app.hist.length/300));for(let i=0;i<app.hist.length;i+=stp){const s=app.hist.slice(Math.max(0,i-49),i+1);pt(hs+i+1,s.reduce((a,b)=>a+b,0)/s.length)}
 if(app.hist.length&&(app.hist.length-1)%stp){const s=app.hist.slice(-50);pt(N,s.reduce((a,b)=>a+b,0)/s.length)}x.stroke()}
export function drawCar(x,a0,px,py,a,col,al){x.save();x.globalAlpha=al;x.translate(px,py);x.rotate(a);x.fillStyle=col;x.fillRect(-10,-6,20,12);x.fillStyle="#0b0d12";x.fillRect(1,-4,5,8);x.restore()}
export function drawSim(cv){const x=(cv||$("sc")).getContext("2d");x.drawImage(app.roadC,0,0);if(app.showIdeal)drawIdeal(x);if(!cv)drawProgress(x);if(!app.c)return;const cols=["#ff0","#0ff","#f0f","#0ff","#ff0"];[-90,-45,0,45,90].forEach((d,i)=>{const a=app.c.a+d*Math.PI/180,r=app.sn[i]||0;x.strokeStyle=cols[i];x.lineWidth=1.5;x.beginPath();x.moveTo(app.c.x,app.c.y);x.lineTo(app.c.x+Math.cos(a)*r,app.c.y+Math.sin(a)*r);x.stroke();x.fillStyle=cols[i];x.fillRect(app.c.x+Math.cos(a)*r-2,app.c.y+Math.sin(a)*r-2,4,4)});drawCar(x,0,app.c.x,app.c.y,app.c.a,"#ff2d3d",1)}
// ===== Fortschrittsmarkierung (rein visuell, nutzt maxIdx entlang der Mittellinie) =====
export function drawProgress(x){if(!app.T||!(app.maxIdx>0))return;const n=app.T.p.length,done=app.maxIdx>=n-3,i=Math.min(app.maxIdx,n-1),a=app.T.p[Math.max(0,i-2)],b=app.T.p[Math.min(n-1,i+2)],q=app.T.p[i];
 let dx=b.x-a.x,dy=b.y-a.y;const l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;const nx=-dy,ny=dx,hw=app.T.w/2,col=done?"#2ecc71":"#ffb020";
 const ln=()=>{x.beginPath();x.moveTo(q.x-nx*hw,q.y-ny*hw);x.lineTo(q.x+nx*hw,q.y+ny*hw);x.stroke()};
 x.save();x.lineCap="butt";x.strokeStyle="#0b0d12";x.lineWidth=8;ln();x.strokeStyle=col;x.lineWidth=5;x.setLineDash([7,5]);ln();x.setLineDash([]);
 for(const s of[-1,1]){x.fillStyle=col;x.beginPath();x.arc(q.x+nx*hw*s,q.y+ny*hw*s,3.5,0,7);x.fill()}
 const t=done?"Strecke abgeschlossen":"Bisheriger Bestfortschritt · "+Math.round(app.maxIdx/(n-1)*100)+" %";x.font="600 12px system-ui,sans-serif";const tw=x.measureText(t).width+12;
 let sd=1,o=hw+16;for(const s of[1,-1]){const e2=o+(Math.abs(nx)*tw+Math.abs(ny)*20)/2,px=q.x+nx*s*e2,py=q.y+ny*s*e2;if(!road(px,py)&&!road(q.x+nx*s*o,q.y+ny*s*o)){sd=s;break}}
 const ext=o+(Math.abs(nx)*tw+Math.abs(ny)*20)/2;let cx=q.x+nx*sd*ext,cy=q.y+ny*sd*ext;cx=Math.max(tw/2+4,Math.min(W-tw/2-4,cx));cy=Math.max(14,Math.min(H-14,cy));
 x.fillStyle="#10131ae6";x.strokeStyle=col;x.lineWidth=1;x.beginPath();x.roundRect?x.roundRect(cx-tw/2,cy-10,tw,20,6):x.rect(cx-tw/2,cy-10,tw,20);x.fill();x.stroke();
 x.fillStyle=col;x.textAlign="center";x.textBaseline="middle";x.fillText(t,cx,cy);x.restore()}
// ===== Ideallinie (nur Anzeige, wird nie vom Lernen benutzt) =====
export function drawIdeal(x){x.save();x.setLineDash([10,8]);x.strokeStyle="#ffd400";x.lineWidth=2.5;x.beginPath();app.T.ideal.forEach((q,i)=>i?x.lineTo(q.x,q.y):x.moveTo(q.x,q.y));x.stroke();x.restore()}
