// QUORMEL 1 – Strecken: Vorlagen, Glättung, Abtastung, Straßenmaske (fest 1000 × 640), Strecken-ID, Prüfung, Ideallinie.
import {app} from "../state.js";
import {H,W} from "./constants.js";
import {pxScale} from "../render/hidpi.js";

// ===== Strecken =====
export const PRE=[{id:"einfach",n:"Flitzpiepen-Ring",d:"Einfach",w:100,t:"Breit, lange Gerade, große Radien.",c:[[80,540],[400,570],[800,540],[930,380],[820,200],[500,110],[200,140]]},
{id:"mittel",n:"Omega-Schleife",d:"Mittel",w:72,t:"S-Kurven und wechselnde Radien.",c:[[60,540],[300,510],[450,380],[300,250],[450,110],[700,90],[850,220],[700,370],[900,510],[950,580]]},
{id:"schwer",n:"Nervenflatter Grand Prix",d:"Schwierig",w:52,t:"Enge Kurven, S-Kurven, Haarnadel.",c:[[60,580],[500,600],[880,550],[940,420],[700,380],[420,430],[260,340],[480,240],[820,230],[950,120],[600,60],[250,90],[80,220]]}];
export function cat(c){const o=[],n=c.length;for(let i=0;i<n-1;i++){const a=c[Math.max(i-1,0)],b=c[i],d=c[i+1],e=c[Math.min(i+2,n-1)];for(let t=0;t<1;t+=.05){const f=(k)=>.5*((2*b[k])+(-a[k]+d[k])*t+(2*a[k]-5*b[k]+4*d[k]-e[k])*t*t+(-a[k]+3*b[k]-3*d[k]+e[k])*t*t*t);o.push({x:f(0),y:f(1)})}}o.push({x:c[n-1][0],y:c[n-1][1]});return o}
export function rs(p,s){const o=[{x:p[0].x,y:p[0].y}];for(let i=1;i<p.length;i++){let a=o[o.length-1];const b=p[i];let l=Math.hypot(b.x-a.x,b.y-a.y);while(l>=s){const t=s/l;a={x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t};o.push(a);l=Math.hypot(b.x-a.x,b.y-a.y)}}return o}
export function setTrack(name,w,pts){const p=rs(pts,5);app.T={name,w,p,id:trackHash(p,w),a0:Math.atan2(p[3].y-p[0].y,p[3].x-p[0].x),ideal:idealLine(p,w)};
 const m=document.createElement("canvas");m.width=W;m.height=H;const x=m.getContext("2d");x.lineCap=x.lineJoin="round";x.lineWidth=w;x.strokeStyle="#fff";x.beginPath();p.forEach((q,i)=>i?x.lineTo(q.x,q.y):x.moveTo(q.x,q.y));x.stroke();
 const d=x.getImageData(0,0,W,H).data;app.mask=new Uint8Array(W*H);for(let i=0;i<W*H;i++)app.mask[i]=d[i*4+3]>128?1:0;
 const k=pxScale();app.roadC=document.createElement("canvas");app.roadC.width=Math.round(W*k);app.roadC.height=Math.round(H*k);const r=app.roadC.getContext("2d");r.scale(app.roadC.width/W,app.roadC.height/H); // nur Anzeige: auf High-DPI-Displays feiner gezeichnet, immer als W × H darzustellen
 r.fillStyle="#1b2a1f";r.fillRect(0,0,W,H);r.lineCap=r.lineJoin="round";
 const path=()=>{r.beginPath();p.forEach((q,i)=>i?r.lineTo(q.x,q.y):r.moveTo(q.x,q.y));r.stroke()};r.lineWidth=w+8;r.strokeStyle="#e8ebf2";path();r.lineWidth=w;r.strokeStyle="#3a3f4b";path();
 r.setLineDash([14,18]);r.lineWidth=2;r.strokeStyle="#ffffff55";path();r.setLineDash([]);
 for(const [q,c] of [[p[0],"#2ecc71"],[p[p.length-1],"#ff2d3d"]]){const i=p.indexOf(q),b=p[Math.min(i+(c==="#ff2d3d"?-1:1),p.length-1)]||q,a=Math.atan2(b.y-q.y,b.x-q.x)+Math.PI/2;r.strokeStyle=c;r.lineWidth=8;r.beginPath();r.moveTo(q.x-Math.cos(a)*w/2,q.y-Math.sin(a)*w/2);r.lineTo(q.x+Math.cos(a)*w/2,q.y+Math.sin(a)*w/2);r.stroke()}}
// F5: stabile Strecken-ID aus der Geometrie (64 Punkte gleichmäßig entlang der Strecke von Start bis Ziel, 4-px-Raster, Breite, Länge)
export function trackSamp(p){const L=[0];for(let i=1;i<p.length;i++)L.push(L[i-1]+Math.hypot(p[i].x-p[i-1].x,p[i].y-p[i-1].y));const tot=L[L.length-1],o=[];let j=0;
 for(let k=0;k<=64;k++){const t=tot*k/64;while(j<p.length-2&&L[j+1]<t)j++;const u=Math.min(1,Math.max(0,(t-L[j])/((L[j+1]-L[j])||1)));o.push([p[j].x+(p[j+1].x-p[j].x)*u,p[j].y+(p[j+1].y-p[j].y)*u])}return{o,tot}}
export function trackHash(p,w){const S=trackSamp(p),s=[Math.round(w),Math.round(S.tot/10)];for(const q of S.o)s.push(Math.round(q[0]/4),Math.round(q[1]/4));
 const str=s.join(",");let h1=0x811c9dc5,h2=0x9e3779b9;for(let i=0;i<str.length;i++){const c=str.charCodeAt(i);h1=Math.imul(h1^c,16777619);h2=Math.imul(h2^c,2246822507)}return"t"+(h1>>>0).toString(16).padStart(8,"0")+(h2>>>0).toString(16).padStart(8,"0")}
export const road=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&app.mask[(y|0)*W+(x|0)]===1;
export function validate(p,w){if(p.length<60)return"Die Strecke ist zu kurz.";for(let i=0;i<p.length;i+=2)for(let j=i+Math.ceil(w*1.3/5)+12;j<p.length;j+=2)if(Math.hypot(p[i].x-p[j].x,p[i].y-p[j].y)<w*.9)return"Die Strecke überschneidet sich oder ist zu eng. Zeichne sie ohne Kreuzungen.";return null}
export function idealLine(p,w){const n=p.length,m=w*.38,q=p.map(a=>({x:a.x,y:a.y}));for(let k=0;k<400;k++)for(let i=1;i<n-1;i++){let x=q[i].x+.5*((q[i-1].x+q[i+1].x)/2-q[i].x),y=q[i].y+.5*((q[i-1].y+q[i+1].y)/2-q[i].y);const dx=x-p[i].x,dy=y-p[i].y,d=Math.hypot(dx,dy);if(d>m){x=p[i].x+dx/d*m;y=p[i].y+dy/d*m}q[i]={x,y}}return q}
