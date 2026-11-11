// QUORMEL 1 – First-Person-Ansicht: vorberechnete Streckengeometrie und Zeichnen der 3D-Szene.
import {app} from "../state.js";
import {H,W} from "../core/constants.js";

export function drawFPV(cv,px,py,a){ // zeichnet nur die Straße vor dem Auto; passierte Abschnitte werden gar nicht mehr verarbeitet
 if(cv.width!==innerWidth||cv.height!==innerHeight){cv.width=innerWidth;cv.height=innerHeight}
 const x=cv.getContext("2d"),w=cv.width,h=cv.height,hz=h*.4,f=h*.85,ch=9,cx=px+Math.cos(a)*5,cy=py+Math.sin(a)*5,p=app.T.p,n=p.length,hw=app.T.w/2;
 const g=x.createLinearGradient(0,0,0,hz);g.addColorStop(0,"#3f83d0");g.addColorStop(1,"#cfe6f7");x.fillStyle=g;x.fillRect(0,0,w,hz);const gg=x.createLinearGradient(0,hz,0,h);gg.addColorStop(0,"#b3d1bf");gg.addColorStop(.25,"#3f7d46");gg.addColorStop(1,"#2d6a35");x.fillStyle=gg;x.fillRect(0,hz,w,h-hz);
 const G=app.T.geo||(app.T.geo=buildGeo()),NZ=1.5,items=[],ca=Math.cos(a),sa=Math.sin(a),cs=new Array(n); // Geometrie ist vorberechnet; pro Bild werden nur sichtbare Teile gezeichnet
 const cm=(X,Y,Hh)=>[-(X-cx)*sa+(Y-cy)*ca,(X-cx)*ca+(Y-cy)*sa,Hh||0];
 const fg=(c,z)=>{const t=Math.min(.6,Math.max(0,z)/1100*.6);return`rgb(${(c[0]+(179-c[0])*t)|0},${(c[1]+(209-c[1])*t)|0},${(c[2]+(191-c[2])*t)|0})`};
 const SP=q=>[w/2+f*q[0]/q[1],hz+f*(ch-q[2])/q[1]],H3=(r,k,hh)=>[r[k][0],r[k][1],hh];
 const poly3=(P3,col,z)=>{const C=clipN(P3,NZ);if(C.length<3)return;let mn=1e9,mx=-1e9;const S2=C.map(q=>{const s2=SP(q);if(s2[0]<mn)mn=s2[0];if(s2[0]>mx)mx=s2[0];return s2});if(mx<0||mn>w)return;x.fillStyle=x.strokeStyle=fg(col,z);x.lineWidth=1;x.beginPath();S2.forEach((s2,i)=>i?x.lineTo(s2[0],s2[1]):x.moveTo(s2[0],s2[1]));x.closePath();x.fill();x.stroke()};
 const Q=(pts,col,rk)=>{let z=0;for(const q of pts)z+=q[1];z/=pts.length;items.push({d:z-rk*.01,pts,col,z})};
 for(let i=0;i<n;i++){const dx=p[i].x-cx,dy=p[i].y-cy;if(dx*dx+dy*dy>1.44e6)continue;const r=G.pt[i],o=new Array(16);for(let k=0;k<16;k++)o[k]=cm(r[k][0],r[k][1],0);cs[i]=o}
 const ROADT=[59,64,75];for(const F of G.fill){if(!cs[F.i])continue;const P3=F.poly.map(v=>cm(v[0],v[1],0));let z=0;for(const q of P3)z+=q[1];items.push({d:1e9,pts:P3,col:ROADT,z:z/P3.length})} // F8: Scheitel-Füllung zuerst (liegt unter allem)
 for(let i=0;i<n-1;i++){const A=cs[i],B=cs[i+1];if(!A||!B)continue;const tz=G.tight[i]||G.tight[i+1],gc=Math.floor(i/3)%2?[52,122,62]:[46,110,56],cu=Math.floor(i/2)%2?[235,235,235]:[220,30,45];
  if(G.gl[i]&&G.gl[i+1])Q([A[0],A[1],B[1],B[0]],gc,0);if(G.gr[i]&&G.gr[i+1])Q([A[6],A[7],B[7],B[6]],gc,0);const ti=G.tight[i]===G.tight[i+1]?G.tight[i]:0;if(ti!==-1)Q([A[1],A[2],B[2],B[1]],cu,1);if(ti!==1)Q([A[5],A[6],B[6],B[5]],cu,1); // F8: zusammengefallene Innen-Randsteine im Scheitel weglassen
  if(!(tz&&G.rfold[i]))Q([A[2],A[5],B[5],B[2]],tz?ROADT:i%2?[62,67,78]:[56,61,72],2);/* F8: gefaltete Flächen im Scheitel entfallen (Füllung deckt sie ab), dort einheitliche Asphaltfarbe */if(i%6<3)Q([A[3],A[4],B[4],B[3]],[230,230,230],3);
  for(const sd of[-1,1]){if(!G.bok[(sd+1)/2][i])continue;const kb=sd<0?10:11,kt=sd<0?8:9,m3=Math.floor(i/5)%3,ad=m3===0?[200,30,45]:m3===1?[240,240,240]:[30,60,140];
   Q([H3(A,kb,0),H3(A,kb,5),H3(B,kb,5),H3(B,kb,0)],ad,4);
   if(i%3===1){const q=A[kt];items.push({d:q[1]-.05,z:q[1],fn:()=>{if(q[1]<NZ)return;const sc=f/q[1],sx=w/2+f*q[0]/q[1],sy=hz+f*ch/q[1];for(let t=0;t<3;t++){x.fillStyle=fg(t===2?[230,230,230]:[28,28,32],q[1]);x.beginPath();x.ellipse(sx,sy-sc*(1.8+t*3.2),sc*3.6,sc*1.8,0,0,6.3);x.fill()}}})}}}
 for(const st of G.stands){const k1=st.sd<0?12:13,k2=st.sd<0?14:15;for(let j=st.i;j<st.i+8;j++){const A=cs[j],B=cs[j+1];if(!A||!B)continue;const cr=[[192,57,43],[41,128,185],[236,240,241],[241,196,15]][(j*3+((j>>2)%3))%4];
  Q([H3(A,k2,0),H3(A,k2,28),H3(B,k2,28),H3(B,k2,0)],[90,95,105],5);Q([H3(A,k1,7),H3(A,k2,28),H3(B,k2,28),H3(B,k1,7)],cr,6);Q([H3(A,k1,0),H3(A,k1,7),H3(B,k1,7),H3(B,k1,0)],[120,125,135],7);
  if(j===st.i||j===st.i+7){const X=j===st.i?A:B;Q([H3(X,k1,0),H3(X,k1,7),H3(X,k2,28),H3(X,k2,0)],[150,155,165],8)}}}
 for(const tr of G.trees){const q=cm(tr.x,tr.y,0);if(q[1]<NZ||q[1]>1200||Math.abs(q[0])>q[1]*2)continue;items.push({d:q[1],z:q[1],fn:()=>{const sc=f/q[1],sx=w/2+f*q[0]/q[1],sy=hz+f*ch/q[1];x.strokeStyle=fg([74,51,34],q[1]);x.lineWidth=Math.max(1,sc*3);x.beginPath();x.moveTo(sx,sy);x.lineTo(sx,sy-sc*9);x.stroke();x.fillStyle=fg([24,84,40],q[1]);x.beginPath();x.moveTo(sx,sy-sc*30);x.lineTo(sx-sc*10,sy-sc*9);x.lineTo(sx+sc*10,sy-sc*9);x.fill()}})}
 {const G0=p[n-3],Gp=p[n-1],dg=Math.atan2(Gp.y-G0.y,Gp.x-G0.x),sx=-Math.sin(dg),sy=Math.cos(dg),o=hw+16,gp=(t,hh)=>cm(Gp.x+sx*o*(1-2*t),Gp.y+sy*o*(1-2*t),hh),zc=cm(Gp.x,Gp.y,0)[1],w0=l=>cm(G0.x+G.nx[n-3]*l,G0.y+G.ny[n-3]*l,0),w1=l=>cm(Gp.x+G.nx[n-1]*l,Gp.y+G.ny[n-1]*l,0);
  for(let q=0;q<10;q++){const a0=-hw+2*hw*q/10,a1=-hw+2*hw*(q+1)/10;Q([w0(a0),w0(a1),w1(a1),w1(a0)],q%2?[255,255,255]:[17,17,17],3.5)} // Ziellinie (nur First-Person)
  if(zc>-200)items.push({d:zc-.02,z:zc,fn:()=>{for(const t of[0,1]){const b=gp(t,0),u=gp(t,46);if(b[1]<NZ||u[1]<NZ)continue;const sb=SP(b),su=SP(u);x.strokeStyle="#d0d4dc";x.lineWidth=Math.max(2,f/b[1]*5);x.beginPath();x.moveTo(sb[0],sb[1]);x.lineTo(su[0],su[1]);x.stroke()}
   for(let c=0;c<14;c++)for(let r=0;r<3;r++)poly3([gp(c/14,26+r*6.67),gp((c+1)/14,26+r*6.67),gp((c+1)/14,32.67+r*6.67),gp(c/14,32.67+r*6.67)],(c+r)%2?[255,255,255]:[17,17,17],zc);
   const a1=gp(0,46),a2=gp(1,46);if(a1[1]>=NZ&&a2[1]>=NZ){const s1=SP(a1),s2=SP(a2);x.strokeStyle="#ff2d3d";x.lineWidth=Math.max(2,f/a1[1]*3);x.beginPath();x.moveTo(s1[0],s1[1]);x.lineTo(s2[0],s2[1]);x.stroke()}}})}
 items.sort((u,v)=>v.d-u.d);for(const it of items){if(it.pts)poly3(it.pts,it.col,it.z);else it.fn()}
 if(app.FDBG){const ln=(P1,P2,col)=>{if(P1[1]<NZ||P2[1]<NZ)return;const s1=SP(P1),s2=SP(P2);x.strokeStyle=col;x.lineWidth=1.5;x.beginPath();x.moveTo(s1[0],s1[1]);x.lineTo(s2[0],s2[1]);x.stroke()};for(let i=0;i<n-1;i++){const A=cs[i],B=cs[i+1];if(!A||!B)continue;ln(A[2],B[2],"#0ff");ln(A[5],B[5],"#0ff");ln(A[3],B[3],"#ff0");ln(A[2],A[5],"#f0f");if(G.gl[i]&&G.gl[i+1])ln(A[0],B[0],"#0f0");if(G.gr[i]&&G.gr[i+1])ln(A[7],B[7],"#0f0")}}
 const hg=x.createLinearGradient(0,h*.8,0,h);hg.addColorStop(0,"#2a2f3a");hg.addColorStop(1,"#08090c");x.fillStyle=hg;x.beginPath();x.moveTo(w*.1,h);x.lineTo(w*.28,h*.8);x.lineTo(w*.72,h*.8);x.lineTo(w*.9,h);x.fill();x.strokeStyle="#ff2d3d";x.lineWidth=3;x.beginPath();x.moveTo(w*.28,h*.8);x.lineTo(w*.72,h*.8);x.stroke();
 x.fillStyle="#ff2d3d";x.font="italic 900 "+Math.round(h*.045)+"px Arial Black,sans-serif";x.textAlign="center";x.textBaseline="middle";x.fillText("quormel 1",w/2,h*.9);x.textBaseline="alphabetic";x.textAlign="left";
 const mw=Math.min(260,w*.22),mh=mw*H/W,mx=w-mw-12,my=12;x.drawImage(app.roadC,mx,my,mw,mh);x.strokeStyle="#fff";x.lineWidth=2;x.strokeRect(mx,my,mw,mh);
 if(app.showIdeal){x.strokeStyle="#ffd400";x.lineWidth=1.5;x.beginPath();app.T.ideal.forEach((q,i)=>{const X=mx+q.x*mw/W,Y=my+q.y*mh/H;i?x.lineTo(X,Y):x.moveTo(X,Y)});x.stroke()}
 x.save();x.translate(mx+px*mw/W,my+py*mh/H);x.rotate(a);x.fillStyle="#4da3ff";x.beginPath();x.moveTo(8,0);x.lineTo(-6,-5);x.lineTo(-6,5);x.fill();x.restore();x.fillStyle="#fff";x.font="12px sans-serif";x.fillText("Live-Position",mx+6,my+mh-6)}
// ===== First-Person: vorberechnete Streckengeometrie (einmal pro Strecke) =====
export function clipN(P,NZ){const o=[];for(let i=0;i<P.length;i++){const A=P[i],B=P[(i+1)%P.length],ia=A[1]>=NZ,ib=B[1]>=NZ;if(ia)o.push(A);if(ia!==ib){const t=(NZ-A[1])/(B[1]-A[1]);o.push([A[0]+(B[0]-A[0])*t,NZ,A[2]+(B[2]-A[2])*t])}}return o}
export function buildGeo(){const p=app.T.p,n=p.length,hw=app.T.w/2,G={n,hw,nx:[],ny:[],rad:[],inn:[],pt:[],bok:[[],[]],stands:[],trees:[]},gw=hw+70;
 const OFF=[-gw,-(hw+9),-hw,-1,1,hw,hw+9,gw,-(hw+13),hw+13,-(hw+26),hw+26,-(hw+38),hw+38,-(hw+72),hw+72],tx=[],ty=[];
 for(let i=0;i<n;i++){const a=p[Math.max(0,i-2)],b=p[Math.min(n-1,i+2)];let u=b.x-a.x,v=b.y-a.y;const l=Math.hypot(u,v)||1;u/=l;v/=l;tx[i]=u;ty[i]=v;G.nx[i]=-v;G.ny[i]=u}
 for(let i=0;i<n;i++){const i0=Math.max(0,i-3),i1=Math.min(n-1,i+3);let d=Math.atan2(ty[i1],tx[i1])-Math.atan2(ty[i0],tx[i0]);while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;const k=d/Math.max(1,(i1-i0)*5);G.rad[i]=Math.abs(k)<1e-4?1e9:1/Math.abs(k);G.inn[i]=k>0?1:-1}
 const rIn=[];for(let i=0;i<n;i++){const m=[1e9,1e9];for(let j=Math.max(0,i-8);j<=Math.min(n-1,i+8);j++){const si=(G.inn[j]+1)/2;if(G.rad[j]<m[si])m[si]=G.rad[j]}rIn[i]=m} // engster Radius je Seite in ±8 Abschnitten -> weiche Begrenzung
 const rl=(i,sg)=>{let m=1e9;for(let j=Math.max(0,i-2);j<=Math.min(n-1,i+2);j++)if(G.inn[j]===sg&&G.rad[j]<m)m=G.rad[j];return m}; // engster Radius der Innenseite in ±2 Abschnitten
 for(let i=0;i<n;i++){G.pt[i]=OFF.map(o0=>{const sg=Math.sign(o0),lim=Math.abs(o0)>hw+9?.95*rIn[i][(sg+1)/2]:.95*rl(i,sg);let o=o0;if(Math.abs(o)>lim)o=sg*Math.max(3,lim);return[p[i].x+G.nx[i]*o,p[i].y+G.ny[i]*o]})} // Innenseite wird begrenzt, damit sich Ränder nie überschlagen
 const dmin=(X,Y,sk,sr)=>{let m=1e9;for(let j=0;j<n;j++){if(sk!==undefined&&Math.abs(j-sk)<=sr)continue;const d=Math.hypot(p[j].x-X,p[j].y-Y);if(d<m)m=d}return m},at=(i,sd,o)=>[p[i].x+G.nx[i]*sd*o,p[i].y+G.ny[i]*sd*o];
 const cell=70,grid=new Map();p.forEach((q,j)=>{const key=((q.x/cell)|0)+","+((q.y/cell)|0);if(!grid.has(key))grid.set(key,[]);grid.get(key).push(j)});
 const freeAt=(X,Y,r)=>{const c0=(X/cell)|0,c1=(Y/cell)|0;for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const L=grid.get((c0+a)+","+(c1+b));if(L)for(const j of L)if(Math.hypot(p[j].x-X,p[j].y-Y)<r)return false}return true};
 G.gl=[];G.gr=[];for(let i=0;i<n;i++)for(const sd of[-1,1]){let e=hw+9;for(let o=hw+12;o<=gw;o+=3){const q=at(i,sd,o);if(!freeAt(q[0],q[1],hw+10))break;e=o}(sd<0?G.gl:G.gr)[i]=e>hw+15;const k=sd<0?0:7;G.pt[i][k]=[p[i].x+G.nx[i]*sd*e,p[i].y+G.ny[i]*sd*e]} // Gras endet, sobald irgendein anderer Streckenteil näher als Fahrbahnbreite+Rand ist
 for(const sd of[-1,1])for(let i=0;i<n;i++){const q=at(i,sd,hw+26);G.bok[(sd+1)/2][i]=dmin(q[0],q[1],i,25)>=hw+30&&!(G.inn[i]===sd&&G.rad[i]<hw+40)}
 for(let i=15;i+8<n-25;i+=45){const pref=Math.floor(i/45)%2?1:-1;for(const sd of[pref,-pref]){const C=at(i+4,sd,hw+55);let ok=dmin(C[0],C[1])>=hw+42;for(const ii of[i,i+4,i+8])for(const o of[hw+38,hw+72]){const q=at(ii,sd,o);if(dmin(q[0],q[1])<hw+30)ok=false}if(G.inn[i+4]===sd&&G.rad[i+4]<hw+110)ok=false;if(ok){G.stands.push({i,sd,x:C[0],y:C[1]});break}}}
 for(const st of G.stands)for(let j=st.i-30;j<=st.i+40;j+=5){if(j<2||j>n-3||(j>=st.i-3&&j<=st.i+11))continue;const q=at(j,st.sd,hw+36+((j*13)%5)*9);let ok=dmin(q[0],q[1])>=hw+22;for(const s2 of G.stands)if(Math.hypot(s2.x-q[0],s2.y-q[1])<42)ok=false;for(const t of G.trees)if(Math.hypot(t.x-q[0],t.y-q[1])<26)ok=false;if(ok)G.trees.push({x:q[0],y:q[1]})}
 for(let k=0;k<16;k++)for(let i=1;i<n;i++){const a=G.pt[i-1][k],b=G.pt[i][k],tx=G.ny[i],ty=-G.nx[i];if((b[0]-a[0])*tx+(b[1]-a[1])*ty<.5){if(k===0||k===7)(k===0?G.gl:G.gr)[i]=false;else G.pt[i][k]=[a[0]+tx*.5,a[1]+ty*.5]}} // Randpunkte laufen nie rückwärts -> keine umgeklappten Flächen
 // F8: Nur wo die innere Fahrbahnkante begrenzt werden musste (Radius < halbe Breite): Asphaltscheibe (r = halbe Breite − 1,5 px, mind. 0,96·halbe Breite) um den Mittellinienpunkt.
 // Sie liegt vollständig in der 2D-Straßenmaske (Strich mit runden Verbindungen = Vereinigung solcher Scheiben) und wird unter allen anderen Flächen gezeichnet.
 G.tight=[];G.rfold=[];G.fill=[];for(let i=0;i<n;i++){const sg=G.inn[i];G.tight[i]=.95*rl(i,sg)<hw?sg:0}
 for(let i=0;i<n-1;i++){const A=G.pt[i],B=G.pt[i+1],q=[A[2],A[5],B[5],B[2]];let pos=0,neg=0;for(let k=0;k<4;k++){const a=q[k],b=q[(k+1)%4],c=q[(k+2)%4],cr=(b[0]-a[0])*(c[1]-b[1])-(b[1]-a[1])*(c[0]-b[0]);if(cr>1e-6)pos++;else if(cr<-1e-6)neg++}G.rfold[i]=pos&&neg}
 for(let i=0;i<n;i++)if(G.tight[i]){const r=Math.max(hw*.96,hw-1.5),poly=[];for(let k=0;k<20;k++){const t=k/20*Math.PI*2;poly.push([p[i].x+Math.cos(t)*r,p[i].y+Math.sin(t)*r])}G.fill.push({i,poly})}
 return G}
