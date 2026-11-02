// Kingdom of Agents, part 2 of 4. The parts share one scope and load in order from kingdom.html.
// ===================== overworld =====================
const world={cv:document.getElementById('worldCv'),towns:[],edges:[],sel:null};
world.ctx=world.cv.getContext('2d');
const DEEP=0,SHAL=1,SAND=2,GRASS=3,FOREST=4,MOUNT=5,SNOW=6,RIVER=7,HILL=8;
function vnoise(seed){const g=(x,y)=>(hash(seed+':'+x+','+y)%10000)/10000;const s=t=>t*t*(3-2*t);
  return (x,y)=>{const x0=Math.floor(x),y0=Math.floor(y),fx=s(x-x0),fy=s(y-y0);const a=g(x0,y0),b=g(x0+1,y0),c=g(x0,y0+1),d=g(x0+1,y0+1);return a+(b-a)*fx+(c-a)*fy+(a-b-c+d)*fx*fy}}
function fbm(n,x,y){let v=0,a=.5,f=1;for(let i=0;i<4;i++){v+=a*n(x*f,y*f);a*=.5;f*=2}return v/.9375}
function genTerrain(C,R,portrait,C0=C,R0=R,OX=0,OY=0){
  const nE=vnoise('elev'),nR=vnoise('ridge'),nM=vnoise('moist'),nC=vnoise('coast'),nL=vnoise('lake'),nW=vnoise('coastW'),nD=vnoise('desert'),nEa=vnoise('coastE');
  const T=[...Array(R)].map(()=>Array(C).fill(DEEP)),E=[...Array(R)].map(()=>Array(C).fill(0));
  for(let y=0;y<R;y++)for(let x=0;x<C;x++){
    // the realm is one corner of a larger country: a sea along the north with bays and headlands, land running off the other three edges, the odd lake inland
    // a peninsula: sea to the north, west and east, joined to the wider country off the south edge; each coast wanders with bays and headlands
    const wob=(n,t,a)=>(fbm(n,t*.045+3,1.7)-.5)*a+(fbm(n,t*.13+11,5.3)-.5)*a*.45;
    // the realm is the tip of a larger country reaching in from the bottom-left corner; sea wraps the top and right, the coast wanders with bays and headlands
    const dx=(x-OX)/C0+.06,dy=(OY+R0-y)/R0+.06,r=Math.hypot(dx*.92,dy*1.05),ang=Math.atan2(dy,dx);
    // the coast is warped by two layers of noise across the map, so it throws out headlands and peninsulas, cuts deep bays and leaves islands offshore
    const wx=(fbm(nW,(x-OX)*.05+2,(y-OY)*.05+8)-.5),wy=(fbm(nEa,(x-OX)*.05+13,(y-OY)*.05+1)-.5),fine=fbm(nC,(x-OX)*.16+5,(y-OY)*.16+7)-.5;
    const rad=1.04+(fbm(nC,ang*5+3,1.7)-.5)*.42+(fbm(nW,ang*14+9,4.1)-.5)*.16,rw=Math.hypot((dx+wx*.6)*.92,(dy+wy*.6)*1.05)+fine*.16,land=clamp((rad-rw)/.06);
    const lake=fbm(nL,(x-OX)*.06+9,(y-OY)*.06+4),e=fbm(nE,(x-OX)*.085,(y-OY)*.085)*.6+land*.5-.16+clamp(rad-rw)*.12-(x<1||x>C-2||y<1?.3:0)-(lake>.72?(lake-.72)*5:0);E[y][x]=e;
    let t=e<.26?DEEP:e<.33?SHAL:e<(.41+(fine>.05?.04:0))?SAND:GRASS;
    if(t===GRASS){const ridge=1-Math.abs(2*fbm(nR,(x-OX)*.13+7,(y-OY)*.13+3)-1);
      if(e>.66&&ridge>.88)t=e>.8?SNOW:MOUNT;else if(e>.6&&ridge>.8)t=HILL;else if(fbm(nM,(x-OX)*.14+11,(y-OY)*.14+5)>.52)t=FOREST;
      // dry country: open desert where the land is dry, away from the forests
      if(t===GRASS&&fbm(nD,(x-OX)*.045+21,(y-OY)*.045+3)>.6)t=SAND}
    T[y][x]=t}
  // a river from the highest ground to the sea
  let best=null;for(let y=2;y<R-2;y++)for(let x=2;x<C-2;x++)if((T[y][x]===MOUNT||T[y][x]===SNOW)&&(!best||E[y][x]>E[best[1]][best[0]]))best=[x,y];
  // it finds its way down to the nearest water by the cheapest downhill route, one tile wide
  if(best){const N=C*R,dist=new Float32Array(N).fill(Infinity),prev=new Int32Array(N).fill(-1),H=[];
    const push=(k,v)=>{H.push([v,k]);let i=H.length-1;while(i){const p=(i-1)>>1;if(H[p][0]<=H[i][0])break;[H[p],H[i]]=[H[i],H[p]];i=p}};
    const pop=()=>{const top=H[0],last=H.pop();if(H.length){H[0]=last;let i=0;for(;;){const l=i*2+1,r=l+1;let m=i;if(l<H.length&&H[l][0]<H[m][0])m=l;if(r<H.length&&H[r][0]<H[m][0])m=r;if(m===i)break;[H[m],H[i]]=[H[i],H[m]];i=m}}return top};
    const s0=best[1]*C+best[0];dist[s0]=0;push(s0,0);let end=-1;
    while(H.length){const [dv,k]=pop();if(dv>dist[k])continue;const x=k%C,y=(k/C)|0;if(T[y][x]<=SHAL){end=k;break}
      for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const X=x+dx,Y=y+dy;if(X<1||Y<0||X>=C-1||Y>=R)continue;const n=Y*C+X,up=Math.max(0,E[Y][X]-E[y][x]);const c=1+up*40+E[Y][X]*3;if(dv+c<dist[n]){dist[n]=dv+c;prev[n]=k;push(n,dv+c)}}}
    for(let k=prev[end];end>=0&&k>=0&&k!==s0;k=prev[k]){const x=k%C,y=(k/C)|0;if(T[y][x]!==MOUNT&&T[y][x]!==SNOW&&T[y][x]>SHAL)T[y][x]=RIVER}}
  return {T,E};
}
const land=t=>t===GRASS||t===FOREST||t===SAND||t===HILL;
function near(T,x,y,r,fn){let n=0;for(let j=-r;j<=r;j++)for(let i=-r;i<=r;i++){const t=T[y+j]?.[x+i];if(t!==undefined&&fn(t))n++}return n}
function siteFor(theme,T,C,R,taken,minD,ok){
  const score=(x,y)=>{const t=T[y][x];if(ok&&!ok(x,y))return -1;
    if(taken.some(([a,b])=>Math.hypot(a-x,b-y)<minD))return -1;
    if(x<3||y<3||x>C-4||y>R-4)return -1;
    const cdist=Math.hypot(x-C/2,y-R/2)/Math.hypot(C/2,R/2);
    switch(theme){
      case 'capital':return t===GRASS?near(T,x,y,3,u=>u===GRASS)*2-cdist*60:-1;
      case 'port':{if(t!==GRASS&&t!==SAND)return -1;const w=near(T,x,y,2,u=>u<=SHAL);return w>=3&&w<=11?20+w+near(T,x,y,1,u=>u===GRASS)*2:-1}
      case 'village':return t===GRASS&&!near(T,x,y,1,u=>u<=SHAL)?near(T,x,y,2,u=>u===GRASS)-near(T,x,y,2,u=>u===MOUNT)*3:-1;
      case 'river':return (t===GRASS||t===FOREST)&&near(T,x,y,1,u=>u===RIVER)?20+near(T,x,y,2,u=>u===GRASS):-1;
      case 'arcane':return t===GRASS||t===FOREST?near(T,x,y,3,u=>u===FOREST)*1.5-near(T,x,y,1,u=>u<=SHAL)*4:-1;
      case 'cave':return (t===MOUNT||t===HILL)&&near(T,x,y,1,u=>u===GRASS||u===FOREST||u===HILL)?20+near(T,x,y,2,u=>u===MOUNT||u===SNOW)*2:-1;
      default:return land(t)?near(T,x,y,2,u=>u===GRASS):-1}};
  // spread the places over the whole island: reward distance from the others, and keep their average near the middle
  const n=taken.length,sx=taken.reduce((a,p)=>a+p[0],0),sy=taken.reduce((a,p)=>a+p[1],0);
  const spread=(x,y)=>{if(!n)return 0;const dmin=Math.min(...taken.map(([a,b])=>Math.hypot(a-x,b-y)));return Math.min(dmin,Math.max(C,R)*.4)*1.6-Math.abs((sy+y)/(n+1)-R/2)*1.4-Math.abs((sx+x)/(n+1)-C/2)*.6};
  let best=null,bs=-1;for(let y=0;y<R;y++)for(let x=0;x<C;x++){const s0=score(x,y);if(s0<0)continue;const s=s0+spread(x,y)+1000;if(s>bs){bs=s;best=[x,y]}}
  if(!best)for(let y=3;y<R-3&&!best;y++)for(let x=3;x<C-3;x++)if(land(T[y][x])&&!taken.some(([a,b])=>Math.hypot(a-x,b-y)<minD-2)){best=[x,y];break}
  return best||[Math.floor(C/2),Math.floor(R/2)];
}
function astar(T,C,R,a,b,road){
  const cost=(x,y)=>{const t=T[y][x];if(x===b[0]&&y===b[1])return 1;if(road&&road[y][x]&&t>SHAL)return .3;return t===GRASS?1:t===SAND?2:t===FOREST?3:t===HILL?3:t===RIVER?5:(t===MOUNT||t===SNOW)?40:Infinity};
  const key=(x,y)=>y*C+x,open=[[0,a[0],a[1]]],g=new Map([[key(...a),0]]),from=new Map();
  while(open.length){open.sort((p,q)=>p[0]-q[0]);const [,x,y]=open.shift();if(x===b[0]&&y===b[1])break;
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=C||ny>=R)continue;const c=cost(nx,ny);if(!isFinite(c))continue;
      const ng=g.get(key(x,y))+c;if(ng<(g.get(key(nx,ny))??Infinity)){g.set(key(nx,ny),ng);from.set(key(nx,ny),[x,y]);open.push([ng+Math.abs(nx-b[0])+Math.abs(ny-b[1]),nx,ny])}}}
  const path=[];let cur=b;while(cur){path.unshift(cur);if(cur[0]===a[0]&&cur[1]===a[1])break;cur=from.get(key(...cur))}
  return path[0]&&path[0][0]===a[0]&&path[0][1]===a[1]?path:null;
}
// Building the map is the heaviest thing the page does, and several updates often arrive together (projects, lanes,
// the charter, the config), so layouts are gathered up and run once. The very first one runs straight away.
let LW_PENDING=0;
function layoutWorld(now){if(now||!world.bg){if(LW_PENDING){clearTimeout(LW_PENDING);LW_PENDING=0}return layoutWorldNow()}if(LW_PENDING)return;LW_PENDING=setTimeout(()=>{LW_PENDING=0;layoutWorldNow()},30)}
function layoutWorldNow(boost=1){
  const list=[...villages.values()].sort((a,b)=>b.lanes.length-a.lanes.length||a.name.localeCompare(b.name));
  // with no towns yet (before the first survey) the land is still drawn, empty and waiting
  const hud=innerWidth<600?62:0,asp=innerWidth/Math.max(1,innerHeight-hud),portrait=asp<1;
  // the island grows with the realm: roomier than the screen's shape alone, and wider again for every place past seven
  const more=Math.max(0,list.length-7);
  const grow=Math.min(more,40),C0=portrait?34+grow*2:clamp(Math.round(50*asp),64,120)+grow*4,R0=portrait?clamp(Math.round(36/asp),46,90)+grow*3:48+grow*2;
  // on big screens the island keeps a comfortable size and the sea widens round it to fill the screen
  const vw=innerWidth,vh=innerHeight-hud,padX=0,padY=portrait?3:2,sc=Math.min(vw/((C0+padX*2)*TS),vh/((R0+padY*2)*TS),WORLD_SMAX);
  const C=Math.max(C0+padX*2,Math.ceil(vw/(sc*TS))),R=Math.max(R0+padY*2,Math.ceil(vh/(sc*TS))),OX=Math.floor((C-C0)/2),OY=Math.floor((R-R0)/2);
  const sig=[portrait,C,R,list.map(v=>v.name+':'+v.thKey+':'+placeName(v)).join(','),lanes.map(l=>l.talkingTo).join(','),projectLinks().join(','),tentKey()].join('|');
  if(world.sig===sig){sizeWorldBox();return}world.sig=sig;
  world.C=C;world.R=R;world.W=C*TS;world.H=R*TS;world.portrait=portrait;world.core={x:OX*TS,y:OY*TS,w:C0*TS,h:R0*TS};world.zoom=1;world.pan=null;
  world.cv.width=world.W;world.cv.height=world.H;world.ctx.imageSmoothingEnabled=false;
  const {T,E}=genTerrain(C,R,portrait,C0,R0,OX,OY);world.E=E;
  // site each place where its world makes sense, biggest first
  const order=['capital','river','port','cave','arcane','village'];
  const crownV=list.find(v=>v.thKey==='crown');
  const sorted=[...list].filter(v=>v.thKey!=='crown').sort((a,b)=>order.indexOf(a.thKey)-order.indexOf(b.thKey));
  // every place reserves its icon and its label, so nothing on the map overlaps
  // a crowded realm on a narrow screen opens zoomed in, so names have room; drag to see the rest
  const longest=Math.max(0,...list.map(v=>Math.max(placeName(v).length,v.name.length))),z0=portrait&&(list.length>8||longest>16)?clamp(1+Math.max(list.length-8,0)*.1+Math.max(0,longest-16)*.04,1,2.4)*boost:boost;
  const s=Math.min(innerWidth/world.W,(innerHeight-hud)/world.H)*z0,boxes=[];world.zoom0=z0;let crowded=false;
  const foot=(v,x,y,icon,above)=>{const [iw,ih]=ICON_SIZE[icon],cx=x*TS+8,cy=y*TS+8,meta=(v.thKey==='crown'?'The '+monarch():v.name).length+12;
    const lw=Math.min(232,Math.max(placeName(v).length*10+18,meta*8+14))/s,lh=46/s;
    if(icon==='royal')return [[cx-78,cy-76,156,162],[cx-lw/2,cy+88,lw,lh]];
    return [[cx-iw/2,cy-ih/2,iw,ih],[cx-lw/2,above?cy-ih/2-lh-2:cy+ih/2+2,lw,lh]]};
  const hit=(a,b,p=6)=>a[0]<b[0]+b[2]+p&&b[0]<a[0]+a[2]+p&&a[1]<b[1]+b[3]+p&&b[1]<a[1]+a[3]+p;
  // a safe margin round the edge (wider at the top, where the kingdom's name and the buttons sit), so nothing gets lost at the screen edge
  const SX=Math.round(36/s),ST=Math.round(70/s),SB=Math.round(30/s);let SAFE=1;
  const inside=r=>r[0]>=SX*SAFE+2&&r[1]>=ST*SAFE+2&&r[0]+r[2]<=world.W-SX*SAFE-2&&r[1]+r[3]<=world.H-SB*SAFE-2;
  const fits=f=>f.every(inside)&&!f.some(r=>boxes.some(b=>hit(r,b)));
  const taken=[];world.towns=[];
  const place=(v,x,y,icon)=>{taken.push([x,y]);boxes.push(...foot(v,x,y,icon,false));
    if(v.thKey!=='cave'){for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){const t=T[y+j]?.[x+i];if(t!==undefined&&t!==RIVER&&t>SAND)T[y+j][x+i]=GRASS}}
    if(v.thKey==='arcane')for(let j=-3;j<=3;j++)for(let i=-3;i<=3;i++){const d=Math.hypot(i,j);if(d>1.8&&d<3.4&&T[y+j]?.[x+i]===GRASS&&hash('af'+i+j)%3)T[y+j][x+i]=FOREST}
    const sz=ICON_SIZE[icon],px0=x*TS+8-sz[0]/2-4,py0=y*TS+8-sz[1]/2-4;
    for(let Y=Math.floor(py0/TS);Y<=Math.floor((py0+sz[1]+8)/TS);Y++)for(let X=Math.floor(px0/TS);X<=Math.floor((px0+sz[0]+8)/TS);X++){const t=T[Y]?.[X];if(t!==undefined&&t>SAND&&t!==RIVER)T[Y][X]=v.thKey==='cave'?HILL:GRASS}
    world.towns.push({v,name:v.name,tx:x,ty:y,cx:x*TS+8,cy:y*TS+8,w:sz[0],h:sz[1],x:x*TS+8-sz[0]/2,y:y*TS+8-sz[1]/2,icon})
    if(v.thKey==='capital')for(let j=-2;j<=2;j++)for(let i=-3;i<=3;i++){const t=T[y+j]?.[x+i];if(t!==undefined&&t>SAND&&t!==RIVER)T[y+j][x+i]=GRASS}};
  const siteOne=v=>{const icon=THEMES[v.thKey].icon;let xy=siteFor(v.thKey,T,C,R,taken,portrait?5:7,(x,y)=>fits(foot(v,x,y,icon,false)));
    if(!fits(foot(v,xy[0],xy[1],icon,false))){let best=null,bd=1e9;for(let y=3;y<R-3;y++)for(let x=3;x<C-3;x++){if(!land(T[y][x])&&T[y][x]!==MOUNT&&T[y][x]!==HILL)continue;if(!fits(foot(v,x,y,icon,false)))continue;const d=Math.hypot(x-xy[0],y-xy[1]);if(d<bd){bd=d;best=[x,y]}}if(best)xy=best}
    // a crowded small screen: keep the margin as large as still lets this place fit, rather than overlapping a neighbour
    for(const sf of [.5,0]){if(fits(foot(v,xy[0],xy[1],icon,false)))break;SAFE=sf;let best=null,bd=1e9;for(let y=2;y<R-2;y++)for(let x=2;x<C-2;x++){if(!land(T[y][x])&&T[y][x]!==MOUNT&&T[y][x]!==HILL)continue;if(!fits(foot(v,x,y,icon,false)))continue;const d=Math.hypot(x-xy[0],y-xy[1]);if(d<bd){bd=d;best=[x,y]}}if(best)xy=best}
    if(!fits(foot(v,xy[0],xy[1],icon,false)))crowded=true;SAFE=1;place(v,xy[0],xy[1],icon)};
  // the capital goes first and the King's castle beside it; with no capital, the biggest town takes its place
  const capV=sorted.find(v=>v.thKey==='capital')||[...sorted].sort((a,b)=>b.lanes.length-a.lanes.length)[0];if(capV)siteOne(capV);
  // the King's castle sits beside the capital, across a moat, joined by a guarded bridge
  world.bridge=null;
  if(crownV&&world.towns.length){const cap=world.towns[0];let best=null,bs=-1e9;
    const CO=world.portrait?[[0,-10],[0,10],[7,-9],[-7,-9],[7,9],[-7,9],[0,-13],[0,13]]:[[12,0],[-12,0],[0,-10],[0,10],[11,-8],[-11,-8],[11,8],[-11,8],[15,0],[-15,0]];
    for(const r of [10,12,14,17])for(let k=0;k<16;k++){const an=k/16*Math.PI*2;CO.push([Math.round(Math.cos(an)*r),Math.round(Math.sin(an)*r)])}
    for(const [dx,dy] of CO){const x=cap.tx+dx,y=cap.ty+dy;if(x<6||y<6||x>C-7||y>R-7)continue;
      const above=false,f=foot(crownV,x,y,'royal',above);
      let s=near(T,x,y,2,u=>u===GRASS||u===FOREST)*2-near(T,x,y,2,u=>u<=SHAL||u===MOUNT||u===SNOW)*3-(fits(f)?0:1000)-Math.hypot(dx,dy);if(s>bs){bs=s;best=[x,y,dx,dy,f]}}
    if(best){const [x,y,dx,dy,f]=best;const horiz=Math.abs(dx)>=Math.abs(dy),mx=0,my=0;world.moat=[];
      for(let j=-5;j<=5;j++)for(let i=-5;i<=5;i++){const X=x+i,Y=y+j,t=T[Y]?.[X];if(t===undefined)continue;const r=Math.hypot(i*1.05,j);
        if(r>=3.5&&r<4.5){if(t>SHAL){T[Y][X]=RIVER;world.moat.push([X,Y])}}else if(r<5.4&&t>SHAL)T[Y][X]=GRASS}
      boxes.push(...f);taken.push([x,y]);
      const sz=ICON_SIZE.royal;world.crownT={v:crownV,name:crownV.name,tx:x,ty:y,cx:x*TS+8,cy:y*TS+8,w:sz[0],h:sz[1],x:x*TS+8-sz[0]/2,y:y*TS+8-sz[1]/2,icon:'royal'};
      world.bridge={horiz,mx,my,cap:cap.name,crown:crownV.name,ax:cap.tx,ay:cap.ty,bx:x,by:y,gx:x,gy:y+4}}}
  // the fairground: a trampled patch near the middle of the island where the Curiosity Tent pitches
  world.fair=null;{const lw=(14*10+18)/s;let best=null,bs=-1e9;
    for(let y=6;y<R-6;y++)for(let x=6;x<C-6;x++){if(T[y][x]!==GRASS&&T[y][x]!==FOREST)continue;const cx=x*TS+8,cy=y*TS+8,f=[[cx-50,cy-34,90,62],[cx-lw/2,cy+24,lw,46/s]];
      if(!fits(f)||taken.some(([a,b])=>Math.hypot(a-x,b-y)<6))continue;const sc=-Math.hypot((x-C/2)/C,(y-R/2)/R)*100+near(T,x,y,2,u=>u===GRASS)*.6;if(sc>bs){bs=sc;best=[x,y,f]}}
    if(best){const [x,y,f]=best;boxes.push(...f);taken.push([x,y]);for(let j=-2;j<=2;j++)for(let i=-3;i<=3;i++){const u=T[y+j]?.[x+i];if(u===FOREST||u===HILL)T[y+j][x+i]=GRASS}world.fair={tx:x,ty:y,cx:x*TS+8,cy:y*TS+8}}}
  // a volcano in the high ground, with a dragon asleep on its ledge
  world.volcano=null;{let best=null,bs=-1e9;for(let y=5;y<R-5;y++)for(let x=5;x<C-5;x++){const u=T[y][x];if(u<=SHAL||u===RIVER)continue;const cx=x*TS+8,cy=y*TS+8,f=[[cx-34,cy-40,68,64],[cx-92,cy-70,212,140]];
    if(!fits(f)||taken.some(([a,b])=>Math.hypot(a-x,b-y)<10))continue;const sc=near(T,x,y,4,u=>u===MOUNT||u===SNOW||u===HILL)*2-near(T,x,y,5,u=>u<=SHAL)*3-near(T,x,y,3,u=>u===RIVER)*6+(hash('vo'+x+','+y)%10)/10;if(sc>bs){bs=sc;best=[x,y,f]}}
    if(best){const [x,y,f]=best;boxes.push(...f);taken.push([x,y],[x-5,y],[x+5,y]);for(let j=-3;j<=2;j++)for(let i=-3;i<=3;i++){const u=T[y+j]?.[x+i];if(u!==undefined&&u>SHAL&&u!==RIVER)T[y+j][x+i]=HILL}world.volcano={tx:x,ty:y,cx:x*TS+8,cy:y*TS+8};for(let j=-4;j<=4;j++)for(let i=-6;i<=6;i++){const u=T[y+j]?.[x+i];if(u===FOREST||u===GRASS&&hash('vh'+i+j)%3===0)T[y+j][x+i]=HILL}}}
  for(const v of sorted)if(v!==capV)siteOne(v);
  // open plots: cleared ground marked out with stakes, where the next places can settle
  world.plots=[];{const n=clamp(10-world.towns.length,2,4),pf=(x,y)=>{const cx=x*TS+8,cy=y*TS+8;return [[cx-34,cy-24,68,48]]};
    for(let k=0;k<n;k++){const xy=siteFor('plot',T,C,R,taken,portrait?5:7,(x,y)=>T[y][x]===GRASS&&fits(pf(x,y)));if(!xy||!fits(pf(...xy))||T[xy[1]][xy[0]]!==GRASS)break;
      taken.push(xy);boxes.push(...pf(...xy));for(let j=-1;j<=1;j++)for(let i=-2;i<=2;i++){const u=T[xy[1]+j]?.[xy[0]+i];if(u===FOREST)T[xy[1]+j][xy[0]+i]=GRASS}world.plots.push({tx:xy[0],ty:xy[1],cx:xy[0]*TS+8,cy:xy[1]*TS+8})}}
  // the Curiosity Tent pitches on the fairground whenever the merchant has something to show
  world.tent=tentWanted()&&world.fair?world.fair:null;
  if(world.crownT){world.towns.push(world.crownT);world.crownT=null}
  // every place has one way in, matching its town view (a gate in the north wall, the cave mouth, the castle drawbridge).
  // Roads run only to that door: town footprints, the moat and the castle grounds are closed to every road but the royal one.
  const key=(x,y)=>x+','+y,blocked=new Set();
  for(const t of world.towns)for(let Y=Math.floor((t.y-2)/TS);Y<=Math.floor((t.y+t.h)/TS);Y++)for(let X=Math.floor((t.x-2)/TS);X<=Math.floor((t.x+t.w)/TS);X++)blocked.add(key(X,Y));
  if(world.fair)for(let j=-2;j<=1;j++)for(let i=-3;i<=2;i++)blocked.add(key(world.fair.tx+i,world.fair.ty+j));
  for(const P of world.plots)for(let j=-1;j<=1;j++)for(let i=-2;i<=1;i++)blocked.add(key(P.tx+i,P.ty+j));
  if(world.volcano)for(let j=-3;j<=2;j++)for(let i=-3;i<=3;i++)blocked.add(key(world.volcano.tx+i,world.volcano.ty+j));
  const B0=world.bridge;if(B0){for(let j=-5;j<=5;j++)for(let i=-5;i<=5;i++)if(Math.hypot(i*1.05,j)<4.6)blocked.add(key(B0.bx+i,B0.by+j))}
  const open=(x,y)=>x>=0&&y>=0&&x<C&&y<R&&!blocked.has(key(x,y))&&T[y][x]>SHAL&&T[y][x]!==RIVER;
  for(const t of world.towns){
    if(t.icon==='royal'){t.door={x:B0.gx*TS+8,y:B0.by*TS+8+50};t.out=[B0.gx,B0.gy+1];blocked.delete(key(B0.gx,B0.gy+1));continue}
    // the north gate where there is land to the north (as in the town view); otherwise the landward side
    const tryDoor=south=>{const ex=Math.floor((south&&t.icon==='cave'?t.cx:t.cx-t.w*.22)/TS);let ey=south?Math.floor((t.y+t.h+4)/TS):Math.floor((t.y-4)/TS);
      for(let k=0;k<4;k++){if(open(ex,ey))return {ex,ey,south};ey+=south?1:-1}return null};
    const d=t.icon==='cave'?(tryDoor(true)||tryDoor(false)):(tryDoor(false)||tryDoor(true));if(!d)continue;
    const {ex,ey,south}=d;blocked.delete(key(ex,ey));
    t.door={x:ex*TS+8,y:t.icon==='cave'&&south?t.cy+6:south?t.y+t.h-6:t.icon==='city'?t.cy-20:t.y+6,south};t.out=[ex,ey];
  }
  const T2=T.map((row,y)=>row.map((u,x)=>blocked.has(key(x,y))?DEEP:u));
  const road=[...Array(R)].map(()=>Array(C).fill(0));world.edges=[];
  const tilePts=p=>p.map(([x,y])=>({x:x*TS+8,y:y*TS+12}));
  const lay=(A,B,tail)=>{if(!A.out||!B.out)return null;const p=astar(T2,C,R,A.out,B.out,road);if(!p)return null;for(const [x,y] of p)road[y][x]=1;
    const pts=[{x:A.door.x,y:A.door.y+4},...tilePts(p),...(tail||[{x:B.door.x,y:B.door.y+4}])];return pts};
  // the royal road first: from the capital's gate to the drawbridge, then straight in through the castle gate
  world.royalPath=null;world.royalEdge=null;
  const crownT=world.towns.find(t=>t.icon==='royal'),capT=B0&&world.towns.find(t=>t.name===B0.cap);
  if(crownT&&capT){const pts=lay(capT,crownT,tilePts([[B0.gx,B0.gy],[B0.gx,B0.gy-1],[B0.gx,B0.gy-2],[B0.bx,B0.by]]));
    if(pts){world.royalEdge={a:capT.name,b:crownT.name,pts};world.edges.push(world.royalEdge)}
    B0.guards=[[B0.gx,B0.gy+1,-12],[B0.gx,B0.gy+1,12]]}
  // then the shortest set of roads joining the towns, plus every pair that writes to each other; they share road where they can
  const towns=world.towns.filter(t=>t.icon!=='royal'),N=towns.length,inT=new Set([0]),pairs=[],seen=new Set(),k2=(a,b)=>a<b?a+'-'+b:b+'-'+a;
  while(inT.size<N){let best=null;for(const a of inT)for(let b=0;b<N;b++){if(inT.has(b))continue;const d=Math.hypot(towns[a].tx-towns[b].tx,towns[a].ty-towns[b].ty);if(!best||d<best[2])best=[a,b,d]}inT.add(best[1]);if(!seen.has(k2(best[0],best[1]))){seen.add(k2(best[0],best[1]));pairs.push([best[0],best[1]])}}
  for(const L of lanes){if(!L.talkingTo)continue;const a=towns.findIndex(t=>t.name===L.product),b=towns.findIndex(t=>t.name===L.talkingTo);if(a>=0&&b>=0&&a!==b&&!seen.has(k2(a,b))){seen.add(k2(a,b));pairs.push([a,b])}}
  for(const [pa,pb] of projectLinks()){const a=towns.findIndex(t=>t.name===pa),b=towns.findIndex(t=>t.name===pb);if(a>=0&&b>=0&&a!==b&&!seen.has(k2(a,b))){seen.add(k2(a,b));pairs.push([a,b])}}
  for(const [a,b] of pairs){const A=towns[a],B=towns[b],pts=lay(A,B);if(pts)world.edges.push({a:A.name,b:B.name,pts})}
  world.jetty=null;world.fairRoad=null;
  if(world.fair){const F=world.fair;let o=null;for(const dy of [-3,-4,2,3])if(open(F.tx,F.ty+dy)){o=[F.tx,F.ty+dy];break}
    if(o){blocked.delete(key(...o));F.out=o;F.door={x:F.cx,y:o[1]<F.ty?F.cy-26:F.cy+20};
      const T3=T.map((row,y)=>row.map((u,x)=>blocked.has(key(x,y))?DEEP:u));
      let best=null,bs=1e9;for(let y=2;y<F.ty;y++)for(let x=2;x<C-2;x++){const u=T[y][x];if(u<=SHAL||u===RIVER||u===MOUNT||u===SNOW||blocked.has(key(x,y)))continue;if(!(T[y-1][x]<=SHAL&&T[y-2][x]<=SHAL))continue;const sc=y+Math.abs(x-F.tx)*.7;if(sc<bs){bs=sc;best=[x,y]}}
      if(best){const p=astar(T3,C,R,o,best,road);if(p){for(const [x,y] of p)road[y][x]=1;const pts=[{x:F.door.x,y:F.door.y+4},...tilePts(p),{x:best[0]*TS+8,y:best[1]*TS+2}];
        world.fairRoad=pts;world.edges.push({a:'__fair',b:'__jetty',pts});world.jetty={x:best[0]*TS+8,y:best[1]*TS+2}}}
      let nt=null,nd=1e9;for(const t of world.towns){if(t.icon==='royal'||!t.out)continue;const dd=Math.hypot(t.tx-F.tx,t.ty-F.ty);if(dd<nd){nd=dd;nt=t}}
      if(nt){const pts=lay(F,nt);if(pts)world.edges.push({a:'__fair',b:nt.name,pts})}}}
  world.exits=[];
  // roads south to the wider country: two, leaving the bottom edge
  {const Y=R-1,cand=[];for(let x=3;x<C-3;x++)if(open(x,Y)&&open(x,Y-1))cand.push(x);
    for(const fx of [.3,.7]){if(!cand.length)break;const want=C*fx,X=cand.reduce((a,b)=>Math.abs(b-want)<Math.abs(a-want)?b:a);let nt=null,nd=1e9;
      for(const t of world.towns){if(t.icon==='royal'||!t.out)continue;const dd=Math.abs(t.tx-X)*.6+Math.abs(t.ty-Y);if(dd<nd){nd=dd;nt=t}}
      if(nt){const B={out:[X,Y],door:{x:X*TS+8,y:world.H+24}},pts=lay(nt,B);if(pts){world.edges.push({a:nt.name,b:'__world-'+fx,pts});world.exits.push({side:'bottom',x:X*TS+8})}}}}
  // lamps along the roads, clear of the towns
  world.lamps=[];{const near2=(x,y,r)=>world.towns.some(t=>x>t.x-r&&x<t.x+t.w+r&&y>t.y-r&&y<t.y+t.h+r);
    for(const e of world.edges){if(e===world.royalEdge)continue;const P=e.pts;for(let k=4;k<P.length-4;k+=8){const p=P[k],lx=p.x+7,ly=p.y+2,tx=Math.floor(lx/TS),ty=Math.floor(ly/TS);
      if(near2(lx,ly,24)||!(T[ty]?.[tx]>SHAL)||T[ty][tx]===RIVER||world.lamps.some(l=>Math.hypot(l.x-lx,l.y-ly)<70))continue;world.lamps.push({x:lx,y:ly});if(world.lamps.length>=18)break}}}
  // little flocks of sheep dotted about the open grass: more on bigger maps, and the meadow test relaxes until some fit
  world.sheep=[];{const want=clamp(Math.round(C*R/900),4,7),far=(x,y,r)=>world.towns.some(t=>Math.hypot(t.tx-x,t.ty-y)<r)||world.plots.some(p=>Math.hypot(p.tx-x,p.ty-y)<4)||(world.fair&&Math.hypot(world.fair.tx-x,world.fair.ty-y)<5)||(world.volcano&&Math.hypot(world.volcano.tx-x,world.volcano.ty-y)<11);
    const homes=[];for(const need of [18,12,8,4]){if(homes.length>=want)break;const spots=[];
      for(let y=3;y<R-3;y++)for(let x=3;x<C-3;x++){if(T[y][x]!==GRASS||road[y][x]||blocked.has(key(x,y)))continue;if(near(T,x,y,2,u=>u===GRASS)<need)continue;if(far(x,y,5))continue;spots.push([x,y,hash('sh'+x+','+y)])}
      spots.sort((a,b)=>a[2]-b[2]);for(const s of spots){if(homes.length>=want)break;if(homes.every(h=>Math.hypot(h[0]-s[0],h[1]-s[1])>Math.max(9,Math.min(C,R)/4)))homes.push(s)}}
    homes.forEach(([x,y,h],f)=>{const n=3+h%3;for(let k=0;k<n;k++){const hx=x*TS+8+(k%3)*9-9,hy=y*TS+8+Math.floor(k/3)*7-3;world.sheep.push({k:f*6+k,flock:f,hx,hy,x:hx,y:hy,tx:hx,ty:hy,mv:0,wait:0,face:k%2?1:-1})}})}
  world.dragon=world.volcano?{ph:null}:null;
  world.T=T;world.road=road;world.bg=worldBG();paintGrounds(world.bg.getContext('2d'));
  // places that couldn't fit without overlapping: lay the map out again, opening a little more zoomed in
  if(crowded&&boost<2.2&&world.portrait){world.sig=null;return layoutWorldNow(boost+.3)}
  if(world.zoom0>1){world.zoom=world.zoom0;const cap=world.towns.find(t=>t.icon==='city')||world.towns[0];world.pan=cap?{x:cap.cx,y:cap.cy}:null}
  sizeWorldBox();renderLabels();maybeArrive();
}
// ---- overworld art ----
// a lighter, trampled patch of grass (only over grass, so it never paints the sea or a field edge)
function groundPatch(c,cx,cy,rx,ry,seed){const T=world.T;for(let y=-ry;y<=ry;y++)for(let x=-rx;x<=rx;x++){const r=Math.hypot(x/rx,y/ry);if(r>1)continue;const X=Math.round(cx+x),Y=Math.round(cy+y),t=T[Math.floor(Y/TS)]?.[Math.floor(X/TS)];if(t!==GRASS)continue;
  const h=hash(seed+','+x+','+y)%100;if(r>.78&&h<(r-.78)*400)continue;px(c,X,Y,1,1,h<6?'#c4dc84':h<14?'#9ccc62':h<18?'#b8a86a':'#8ec45a')}}
function paintGrounds(c){
  paintVolcanic(c);
  // the desert, away from the beaches: wind ripples in the sand, the odd cactus, rock and bleached bones, like an SNES overworld's dry country
  {const T=world.T,R=world.road;for(let y=2;y<world.R-2;y++)for(let x=2;x<world.C-2;x++){if(T[y][x]!==SAND||R[y][x])continue;let wet=false;for(let j=-2;j<=2&&!wet;j++)for(let i=-2;i<=2;i++)if(T[y+j][x+i]<=SHAL||T[y+j][x+i]===RIVER){wet=true;break}if(wet)continue;
    const h=hash('ds'+x+','+y),X=x*TS,Y=y*TS;if(world.towns.some(t=>X>t.x-8&&X<t.x+t.w+8&&Y>t.y-8&&Y<t.y+t.h+8))continue;
    for(let k=0;k<2;k++){const yy=Y+3+((h>>>(k*4))%10),xx=X+((h>>>(k*3+8))%8);px(c,xx,yy,6,1,'#c9a863');px(c,xx+1,yy-1,4,1,'#f2dca0')}
    const r=h%23;if(r===0){const cx=X+6,cy=Y+3;px(c,cx,cy,3,10,'#3e8a4a');px(c,cx,cy,1,10,'#62a85e');px(c,cx-3,cy+3,2,4,'#3e8a4a');px(c,cx-3,cy+6,3,1,'#3e8a4a');px(c,cx+4,cy+2,2,4,'#3e8a4a');px(c,cx+3,cy+5,3,1,'#3e8a4a');px(c,cx-1,cy+10,5,1,'rgba(90,60,30,.35)')}
    else if(r===1){px(c,X+5,Y+8,6,4,'#9a8a74');px(c,X+5,Y+8,6,1,'#c4b8a2');px(c,X+9,Y+9,2,3,'#6e6050')}
    else if(r===2){px(c,X+4,Y+10,5,2,'#f2eee2');px(c,X+9,Y+9,2,2,'#f2eee2');px(c,X+10,Y+9,1,1,'#3a3030')}}}
  for(const T of world.towns){if(T.icon==='royal'||T.icon==='port')continue;groundPatch(c,T.cx,T.y+T.h-8,Math.round(T.w*.62),Math.round(T.h*.3),'tp'+T.name)}
  for(const P of world.plots){groundPatch(c,P.cx,P.cy,26,15,'pl'+P.tx);const W=RAMP.wood;
    for(const [sx,sy] of [[-18,-9],[18,-9],[-18,9],[18,9]]){px(c,P.cx+sx,P.cy+sy-4,2,5,W[1]);px(c,P.cx+sx,P.cy+sy-4,2,1,W[3])}
    for(let x=-17;x<18;x+=2){px(c,P.cx+x,P.cy-12,1,1,'#e8dcc0');px(c,P.cx+x,P.cy+6,1,1,'#e8dcc0')}for(let y=-12;y<7;y+=2){px(c,P.cx-17,P.cy+y,1,1,'#e8dcc0');px(c,P.cx+18,P.cy+y,1,1,'#e8dcc0')}
    px(c,P.cx-2,P.cy-6,2,9,W[0]);px(c,P.cx-7,P.cy-8,12,5,W[2]);px(c,P.cx-7,P.cy-8,12,1,W[3]);px(c,P.cx-5,P.cy-6,8,1,W[0])}
  if(world.fair){const F=world.fair;groundPatch(c,F.cx-6,F.cy+8,44,22,'fair')}
  if(world.jetty){const J=world.jetty,W=RAMP.wood;for(let k=0;k<26;k+=3){px(c,J.x-5,J.y-k-3,11,2,W[2]);px(c,J.x-5,J.y-k-3,11,1,W[3])}px(c,J.x-6,J.y-27,1,26,W[0]);px(c,J.x+5,J.y-27,1,26,W[0]);for(const pyy of [-26,-14])for(const pxx of [-7,6])px(c,J.x+pxx,J.y+pyy,2,5,W[0])}
}
// what the merchant leaves on the fairground between visits: pegs, a pole, a crate, a coil of rope, a scrap of bunting, a cold fire
function fairLeftovers(c){const F=world.fair;if(!F||world.tent)return;const W=RAMP.wood,x=F.cx,y=F.cy+12;
  for(const [dx,dy] of [[-26,-10],[18,-10],[-26,6],[18,6],[-4,-14]]){px(c,x+dx,y+dy,2,3,W[1]);px(c,x+dx,y+dy,2,1,W[3])}
  for(let k=0;k<22;k++)px(c,x-20+k,y-2+Math.round(k*.18),1,2,k%7?W[2]:W[1]);
  px(c,x+8,y-6,9,7,W[2]);px(c,x+8,y-6,9,1,W[3]);px(c,x+8,y-3,9,1,W[1]);px(c,x+12,y-6,1,7,W[1]);
  disc(c,x-12,y+8,3,'#c0a070');disc(c,x-12,y+8,1,'#8a6a40');
  for(let k=0;k<5;k++){px(c,x+22+k*3,y+2+(k%2),2,2,k%2?'#f2c94c':'#c43a3a')}px(c,x+21,y+2,15,1,'#8a6a40');
  for(let a=0;a<8;a++){const t=a/8*Math.PI*2;px(c,Math.round(x-2+Math.cos(t)*4),Math.round(y+10+Math.sin(t)*2),2,1,'#6a6a72')}px(c,x-3,y+10,3,1,'#3a2a20')}
function waterTile(c,x,y,t,h){
  if(t===DEEP){px(c,x,y,16,16,'#1f3f8a');for(let k=0;k<3;k++){const hh=hash(h+'dw'+k);px(c,x+hh%13,y+(hh>>>5)%15,4,1,'#2a4e9c')}}
  else{px(c,x,y,16,16,'#3270c4');for(let k=0;k<2;k++){const hh=hash(h+'sw'+k);px(c,x+hh%12,y+(hh>>>5)%15,4,1,'#5a94dc')}}
}
function mountainSprite(snow,v){return cached('mt'+snow+v,28,26,c=>{
  const peak=v?11:15;
  for(let y=0;y<22;y++){const l=Math.round(peak-(y+1)*.62*(v?1.15:1)),r=Math.round(peak+(y+1)*.6);px(c,l,y+2,peak-l,1,'#b88a5a');px(c,peak,y+2,r-peak,1,'#7a5434');px(c,l,y+2,2,1,'#d4a874')}
  for(let k=0;k<6;k++){const hh=hash('mk'+v+k);px(c,peak-6+hh%12,8+(hh>>>5)%12,3,1,'#5e3e26')}
  if(snow){for(let y=0;y<7;y++){const l=Math.round(peak-(y+1)*.62),r=Math.round(peak+(y+1)*.6);px(c,l,y+2,r-l,1,y<5?'#f6f6fa':'#d8dce8');px(c,peak,y+2,r-peak,1,y<5?'#c8cee0':'#a8aec4')}}
  else{px(c,peak-1,2,2,2,'#e8c08a')}
})}
function canopy(c,x,y,h){const rs=[[x+4,y+7,6],[x+11,y+6,6],[x+8,y+11,7]];for(const [cx,cy,r] of rs){for(let j=-r;j<=r;j++){const hw=Math.round(Math.sqrt(r*r-j*j));px(c,cx-hw,cy+j,hw*2,1,'#1c5a30')}
  for(let j=-r+1;j<r-1;j++){const hw=Math.round(Math.sqrt((r-1)*(r-1)-j*j));px(c,cx-hw,cy+j-1,hw*2-1,1,'#2e7a3a')}px(c,cx-r+2,cy-r+2,3,2,'#4ea04a');px(c,cx-r+3,cy-r+3,1,1,'#7ac862')}}
// ---- terrain as areas: each region is a smooth field over the tile grid, thresholded into an organic shape,
// filled with a seamless pattern for that region, then given its edge pieces (outline, shadow, surf, trunks) from the mask.
function rng(seed){let a=hash(String(seed))>>>0;return ()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function noiseGrid(seed,W,H,cell){const gw=Math.ceil(W/cell)+2,gh=Math.ceil(H/cell)+2,r=rng(seed),g=new Float32Array(gw*gh);for(let i=0;i<g.length;i++)g[i]=r();
  return (x,y)=>{const fx=x/cell,fy=y/cell,x0=fx|0,y0=fy|0,tx=fx-x0,ty=fy-y0,sx=tx*tx*(3-2*tx),sy=ty*ty*(3-2*ty),i=y0*gw+x0;const a=g[i],b=g[i+1],c=g[i+gw],d=g[i+gw+1];return a+(b-a)*sx+(c-a)*sy+(a-b-c+d)*sx*sy}}
function tileField(C,R,fn){const W=C*TS,H=R*TS,f=new Float32Array(W*H),g=new Float32Array(C*R);
  for(let y=0;y<R;y++)for(let x=0;x<C;x++)g[y*C+x]=+fn(x,y)||0;
  const xa=new Int32Array(W),xb=new Int32Array(W),xt=new Float32Array(W);
  for(let x=0;x<W;x++){const gx=(x+.5)/TS-.5,x0=Math.floor(gx);let t=gx-x0;xt[x]=t*t*(3-2*t);xa[x]=clamp(x0,0,C-1);xb[x]=clamp(x0+1,0,C-1)}
  for(let y=0;y<H;y++){const gy=(y+.5)/TS-.5,y0=Math.floor(gy);let ty=gy-y0;ty=ty*ty*(3-2*ty);const ya=clamp(y0,0,R-1)*C,yb=clamp(y0+1,0,R-1)*C;
    for(let x=0;x<W;x++){const a=g[ya+xa[x]],b=g[ya+xb[x]],c=g[yb+xa[x]],d=g[yb+xb[x]],tx=xt[x];f[y*W+x]=a+(b-a)*tx+(c-a)*ty+(a-b-c+d)*tx*ty}}
  return f}
const rgba=h=>{const n=parseInt(h.slice(1),16);return (255<<24|(n&255)<<16|((n>>8)&255)<<8|(n>>16))>>>0};
// seamless canopy: overlapping round crowns lit from the top left; cov doubles as the crown "height" so forest edges follow the crowns
// seamless conifer canopy for high ground: staggered rows of layered pines, lit from the top left
let PINES=null;
function pineTex(){if(PINES)return PINES;const N=40,col=new Uint32Array(N*N),cov=new Float32Array(N*N),cdx=new Int8Array(N*N),r=rng('pines'),tr=[];
  for(let j=0;j<5;j++)for(let i=0;i<4;i++)tr.push({x:i*10+(j%2)*5+(r()-.5)*2,y:j*8+4+(r()-.5)*2,h:10+r()*3});tr.sort((a,b)=>a.y-b.y);
  const K=['#0e2a22','#163a30','#1e5040','#2a6a4a','#3e8a54','#62a85e'].map(rgba);
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){let hit=null,hx=0,hy=0;
    for(const t of tr){let dx=x-t.x,dy=y-t.y;dx-=Math.round(dx/N)*N;dy-=Math.round(dy/N)*N;const k=(dy+t.h*.75)/(t.h);if(k<0||k>1)continue;const tier=((dy+t.h*.75)%4)/4,hw=1+k*5-tier*1.4;if(Math.abs(dx)<=hw){hit=t;hx=dx;hy=dy}}
    const i=y*N+x;if(!hit){col[i]=K[0];continue}cov[i]=.9;cdx[i]=Math.round(hx);
    col[i]=hx<-1?(hy<0?K[5]:K[4]):hx<1?K[3]:hx<3?K[2]:K[1];if(((hy+40)%4)===3)col[i]=K[1]}
  return PINES={N,col,cov,cdx}}
let CANOPY=null;
function canopyTex(){if(CANOPY)return CANOPY;(()=>{
  const N=48,col=new Uint32Array(N*N),cov=new Float32Array(N*N),cdx=new Int8Array(N*N),r=rng('crowns'),cr=[];
  for(let j=0;j<4;j++)for(let i=0;i<4;i++)cr.push({x:i*12+6+(r()-.5)*6,y:j*12+6+(r()-.5)*6,r:6.2+r()*1.8});
  cr.sort((a,b)=>a.y-b.y);
  const K=['#123a24','#1c5a30','#2a7238','#3e8e42','#62ae50','#8acc66'].map(rgba);
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){let hit=null,hd=0,hx=0,hy=0;
    for(const c of cr){let dx=x-c.x,dy=y-c.y;dx-=Math.round(dx/N)*N;dy-=Math.round(dy/N)*N;const d=Math.hypot(dx,dy*1.08);if(d<c.r){hit=c;hd=d;hx=dx;hy=dy}}
    const i=y*N+x;if(!hit){col[i]=K[0];cov[i]=0;continue}
    cov[i]=1-hd/hit.r;cdx[i]=Math.max(-9,Math.min(9,Math.round(hx)));
    const l=(-hx*.62-hy*.8)/hit.r+((x*7+y*13)%5-2)*.04;
    col[i]=hd>hit.r-1.1&&hy>-hit.r*.4?K[1]:l>.62?K[5]:l>.25?K[4]:l>-.2?K[3]:l>-.55?K[2]:K[1]}
  CANOPY={N,col,cov,cdx}})();return CANOPY}
function peakSprite(w,h,snow,v){return cached('pk'+w+'x'+h+(snow?1:0)+v,w+2,h+2,c=>{
  const r=rng('pk'+v+'|'+w+'|'+h),p0=Math.round(w*(.38+r()*.22)),ox=1;
  const LT=['#e8c690','#d4a874','#b88a5a'],SH=['#8a6038','#6e4a2e','#553820'],SN=['#ffffff','#e4eaf6','#b8c2d8'];
  let lj=0,rj=0,rd=0;
  for(let y=0;y<h;y++){const k=(y+1)/h;if(y%3===0){lj+=Math.round((r()-.5)*2);rj+=Math.round((r()-.5)*2);rd+=Math.round((r()-.5)*1.6)}
    lj=clamp(lj,-2,2);rj=clamp(rj,-2,2);rd=clamp(rd,-2,2);
    const l=Math.round(p0-k*p0)+(y>2?lj:0),rr=Math.round(p0+k*(w-p0))+(y>2?rj:0),ridge=clamp(p0+Math.round(k*w*.1)+(y>1?rd:0),l+1,rr);
    const cap=snow&&y<h*.36+(r()<.5?1:0);
    for(let x=l;x<=rr;x++){let col;
      if(x<ridge){col=cap?(x<ridge-2?SN[0]:SN[1]):(y<h*.3?LT[0]:(y+x)%5===0&&y%4===1?LT[2]:LT[1]);if(!cap&&x===ridge-1)col=LT[0]}
      else{col=cap?SN[2]:(x>rr-2?SH[2]:(y%4===2&&(x+y)%3===0?SH[2]:SH[1]))}
      if(y>=h-2&&!cap)col=x<ridge?LT[2]:SH[2];
      c.fillStyle=col;c.fillRect(x+ox,y+1,1,1)}}
})}
function worldBG(){
  const {C,R,W,H,T,road}=world,[cv,c]=mk(W,H);
  const img=c.createImageData(W,H),P=new Uint32Array(img.data.buffer),N=W*H;
  const isLandT=(x,y)=>T[y][x]>SHAL;
  const nCoast=noiseGrid('coast',W,H,7),nPatch=noiseGrid('patch',W,H,38),nEdge=noiseGrid('edge',W,H,5),nR1=noiseGrid('ridge1',W,H,17),nR2=noiseGrid('ridge2',W,H,8),nHill=noiseGrid('hill',W,H,9);
  const landF=tileField(C,R,isLandT),sandF=tileField(C,R,(x,y)=>T[y][x]===SAND),forF=tileField(C,R,(x,y)=>T[y][x]===FOREST),
        mtF=tileField(C,R,(x,y)=>T[y][x]===MOUNT||T[y][x]===SNOW),snF=tileField(C,R,(x,y)=>T[y][x]===SNOW),hiF=tileField(C,R,(x,y)=>T[y][x]===HILL);
  const Ef=tileField(C,R,(x,y)=>world.E[y][x]),nFlow=noiseGrid('flowers',W,H,22),nMarsh=noiseGrid('marsh',W,H,30),nPud=noiseGrid('puddle',W,H,6),nPine=noiseGrid('pinewood',W,H,44),nField=noiseGrid('fields',W,H,40);
  const farms=world.towns.filter(t=>t.icon==='village'||t.icon==='city'||t.icon==='hamlet');
  const LN=new Float32Array(N);for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x;LN[i]=landF[i]+(nCoast(x,y)-.5)*.34}
  // rivers and the castle moat: stamped along the chain of river tiles
  const RV=new Uint8Array(N),stamp=(M,x0,y0,x1,y1,rad,val=1)=>{const n=Math.max(1,Math.ceil(Math.hypot(x1-x0,y1-y0)));for(let k=0;k<=n;k++){const cx=x0+(x1-x0)*k/n,cy=y0+(y1-y0)*k/n,rr=rad+(nEdge(Math.max(0,cx),Math.max(0,cy))-.5)*1.4,r2=Math.ceil(rr);
    for(let j=-r2;j<=r2;j++)for(let i=-r2;i<=r2;i++){const X=Math.round(cx+i),Y=Math.round(cy+j);if(X<0||Y<0||X>=W||Y>=H||i*i+j*j>rr*rr)continue;M[Y*W+X]=val}}};
  const moat=new Set((world.moat||[]).map(([x,y])=>x+','+y));
  for(let y=0;y<R;y++)for(let x=0;x<C;x++){if(T[y][x]!==RIVER)continue;const cx=x*TS+8,cy=y*TS+8,mo=moat.has(x+','+y),rad=mo?7:3.2;stamp(RV,cx,cy,cx,cy,rad);
    for(const [dx,dy] of (mo?[[1,0],[0,1],[-1,0],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]:[[1,0],[0,1],[-1,0],[0,-1]])){const t=T[y+dy]?.[x+dx],m2=moat.has((x+dx)+','+(y+dy));if(mo&&!m2&&(dx&&dy))continue;if(t===RIVER||(t!==undefined&&t<=SHAL))stamp(RV,cx,cy,cx+dx*TS,cy+dy*TS,mo&&m2?7:3.2)}}
  // roads: dirt tracks stamped along each route; remember which way they run so bridges get planks the right way
  const RD=new Uint8Array(N);
  const B=world.bridge,gpx=B?B.gx*TS+8:-99,gpy=B?B.gy*TS+12:-99,atGate=p=>p.x===gpx&&p.y<=gpy&&p.y>=gpy-3*TS;
  for(const e of world.edges){const pts=e.pts;for(let k=1;k<pts.length;k++){const a=pts[k-1],b=pts[k];if(B&&(atGate(a)||atGate(b)))continue;stamp(RD,a.x,a.y-4,b.x,b.y-4,2.3,a.y===b.y?1:2)}}
  if(B){stamp(RD,gpx,gpy+12,gpx,gpy+6,2.3,2);stamp(RD,gpx,gpy-12,gpx,gpy-18,2.3,2)}
  // nothing grows or rises under a place
  const TM=new Uint8Array(N);for(const t of world.towns){const pad=t.icon==='royal'?16:6;for(let y=Math.max(0,Math.floor(t.y-pad));y<Math.min(H,t.y+t.h+pad);y++)for(let x=Math.max(0,Math.floor(t.x-pad));x<Math.min(W,t.x+t.w+pad);x++)TM[y*W+x]=1}
  // masks
  const FM=new Uint8Array(N),MM=new Uint8Array(N),HM=new Uint8Array(N),HT=new Float32Array(N),PM=new Uint8Array(N);const tex=canopyTex(),TN=tex.N,ptex=pineTex(),PN=ptex.N;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x;if(LN[i]<.5)continue;
    if(TM[i])continue;const pine=Ef[i]>.5||nPine(x,y)>.64;PM[i]=pine?1:0;const cv2=pine?ptex.cov[(y%PN)*PN+(x%PN)]:tex.cov[(y%TN)*TN+(x%TN)];if(forF[i]+(cv2-.38)*.55>.5)FM[i]=1;
    const r1=1-Math.abs(2*nR1(x,y)-1),r2=1-Math.abs(2*nR2(x,y)-1),h=(r1*.68+r2*.32);
    if(mtF[i]+(h-.55)*.6>.5){MM[i]=1;const m=Math.min(1,mtF[i]);HT[i]=Math.pow(h,1.4)*(.35+.65*m*m)}
    if(hiF[i]+(nHill(x,y)-.5)*.5>.5)HM[i]=1}
  const at=(M,x,y)=>x>=0&&y>=0&&x<W&&y<H&&M[y*W+x];
  const MD=new Uint8Array(N);{const tmp=new Uint8Array(N),r=5;for(let y=0;y<H;y++){let run=-99;for(let x=0;x<W;x++){if(MM[y*W+x])run=x;if(x-run<=r)tmp[y*W+x]=1}run=99999;for(let x=W-1;x>=0;x--){if(MM[y*W+x])run=x;if(run-x<=r)tmp[y*W+x]=1}}
    for(let x=0;x<W;x++){let run=-99;for(let y=0;y<H;y++){if(tmp[y*W+x])run=y;if(y-run<=r)MD[y*W+x]=1}run=99999;for(let y=H-1;y>=0;y--){if(tmp[y*W+x])run=y;if(run-y<=r)MD[y*W+x]=1}}}
  const nearRoad=(x,y)=>at(RD,x,y)||at(RD,x-3,y)||at(RD,x+3,y)||at(RD,x,y-3)||at(RD,x,y+3);
  // palettes
  const G=['#3f7a30','#4a8c36','#5aa23e','#6cb646','#88ca58'].map(rgba),SA=['#b8955a','#d4b072','#e6cc8e','#f2deae'].map(rgba);
  const WA={deep:rgba('#1d3a84'),deepL:rgba('#2a4c9c'),mid:rgba('#27559e'),midL:rgba('#3466b4'),sh:rgba('#3a78c8'),shL:rgba('#5a96dc'),surf:rgba('#cfe6ff'),foam:rgba('#f2faff')};
  const MT=['#3a2414','#5a3a24','#7a5232','#9c6e44','#c09060','#e2bc86'].map(rgba),SN=[rgba('#a8b2c8'),rgba('#d6dce8'),rgba('#f6f8fc')];
  const HL=['#3c7a2e','#5a9a3c','#78b84a','#9ad062'].map(rgba);
  const RIV=[rgba('#2f68bc'),rgba('#4a88d4'),rgba('#cfe6ff')],DIRT=[rgba('#8a6438'),rgba('#b48a52'),rgba('#d2ac70'),rgba('#e6c88e')],WOOD=[rgba('#4a2e22'),rgba('#7a5232'),rgba('#a8784a'),rgba('#c89a62')];
  const tuft=(x,y)=>{const u=x&31,v=y&31;return (u===5&&v===7)||(u===21&&v===19)||(u===13&&v===27)||(u===27&&v===4)?2:(u===4&&v===8)||(u===6&&v===8)||(u===20&&v===20)||(u===22&&v===20)||(u===12&&v===28)||(u===14&&v===28)||(u===26&&v===5)||(u===28&&v===5)?1:0};
  world.foamPx=[];world.waves=[];
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x,d=LN[i];let col;
    if(d<.5){ // sea: depth bands, a dithered surf line, rolling crest pattern
      const row=y%12,ph=((y/12)|0)*9,xx=(x+ph)%26,crest=(row===0&&xx>1&&xx<7)||(row===1&&(xx===1||xx===7));
      if(d<.17)col=crest?WA.deepL:WA.deep;else if(d<.33)col=crest?WA.midL:WA.mid;else if(d<.445)col=crest&&d<.42?WA.shL:WA.sh;
      else if(d<.468)col=(x+y)%2?WA.surf:WA.sh;else col=WA.surf;
      if(d>=.468&&(x+y)%3===0)world.foamPx.push(x,y);
      if(d<.33&&x%16===4&&y%16===6)world.waves.push([x-4,y-6,hash('wv'+x+','+y),d<.17]);
    } else {
      // land: grass in two-tone patches with dithered borders and a tuft pattern; beach band along the sea
      const pv=nPatch(x,y),dith=(x+y)%2;let g=pv>.6||(pv>.57&&dith)?3:pv<.38||(pv<.41&&dith)?1:2;
      const tf=tuft(x,y);col=tf===2?G[Math.min(4,g+1)]:tf===1?G[g-1]:G[g];
      const beach=d<.545||sandF[i]+(nEdge(x,y)-.5)*.3>.5;
      if(beach&&!RV[i]){const sp=hash(x*7+y*131)%23;col=d<.515?SA[1]:sp===0?SA[0]:sp===1?SA[3]:SA[2];if(d>=.535&&d<.545&&dith)col=G[2]}
      if(!beach&&!TM[i]&&!RV[i]){
        // marsh in low, wet hollows: dark sedge, standing pools with a light rim, reeds
        if(nMarsh(x,y)>.75&&Ef[i]<.5&&d>.62){const pv2=nPud(x,y);col=pv2>.67?(pv2>.7?rgba('#3a6a9a'):rgba('#8ab8d8')):((x*7+y*3)%23===0?rgba('#2a4a2a'):rgba('#4e6e3a'));if(pv2<=.67&&hash(x*13+y*7)%41===0)col=rgba('#7a5a3a')}
        // farm fields around the villages and the city: a patchwork of wheat, greens and ploughed earth inside hedges
        else{let farmed=false;for(const f of farms){const dd=Math.hypot(x-f.cx,(y-f.cy)*1.2);if(dd>50&&dd<112){farmed=true;break}}
          if(farmed&&!nearRoad(x,y)&&nField(x,y)>.42){const cx2=Math.floor(x/22),cy2=Math.floor(y/14),kind=hash('fld'+cx2+','+cy2)%3,lx=x%22,ly=y%14;
            if(lx===0||ly===0)col=rgba('#3e6a2e');else col=kind===0?((ly%3)?rgba('#e0c060'):rgba('#c8a040')):kind===1?((ly%2)?rgba('#5aa040'):rgba('#3e7a30')):((ly%2)?rgba('#8a6438'):rgba('#6a4a2a'))}
          // wildflower meadows
          else if(nFlow(x,y)>.66){const hf=hash(x*31+y*57)%53;if(hf<4)col=rgba(['#fff6e4','#f2c94c','#f08ab0','#b08ae0'][hf])}
          // scree and boulders at the foot of the mountains
          else if(MD[i]&&!MM[i]){const hs=hash(x*17+y*29)%9;if(hs<2)col=rgba(hs?'#9a8a70':'#b8a888');else if(hs===2)col=rgba('#6a5a44')}}}
      if(HM[i]){ // hills: a staggered pattern of rounded rises
        const rw=(y/10)|0,u=(x+(rw%2)*8)%16,v=y%10,dx=u-8,dy=v-10,dd=dx*dx+dy*dy*2.2;
        col=dd<49?(dd>36?HL[0]:dx<-1&&dy<-5?HL[3]:dx<2?HL[2]:HL[1]):HL[1];if(dd<49&&dd>30&&dy>-3)col=HL[0]}
      if(FM[i]){col=PM[i]?ptex.col[(y%PN)*PN+(x%PN)]:tex.col[(y%TN)*TN+(x%TN)]}
      else if(at(FM,x,y-1)||at(FM,x,y-2)){const ab=at(FM,x,y-1)?(y-1)*W+x:(y-2)*W+x,dx=PM[ab]?ptex.cdx[((ab/W|0)%PN)*PN+(x%PN)]:tex.cdx[((ab/W|0)%TN)*TN+(x%TN)];col=Math.abs(dx)<=1&&!HM[i]?(dx<=0?WOOD[2]:WOOD[1]):rgba('#2c5a28')}
      else if(at(FM,x-1,y)||at(FM,x+1,y)||at(FM,x,y+1))col=rgba('#123a24');
      if(RV[i]){const e=!at(RV,x-1,y)||!at(RV,x+1,y)||!at(RV,x,y-1)||!at(RV,x,y+1);col=e?RIV[2]:((x*3+y*5)%17===0||(x*3+y*5)%17===1)?RIV[1]:RIV[0]}
    }
    P[i]=col}
  // mountain ranges: the mask gets a rocky floor and outline, then peaks are packed onto a staggered lattice wherever the mask says so
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x;
    if(MM[i]){P[i]=(x*5+y*3)%13===0?MT[1]:MT[2];if(!at(MM,x-1,y)||!at(MM,x+1,y)||!at(MM,x,y-1)||!at(MM,x,y+1))P[i]=MT[0]}
    else if(LN[i]>=.5&&(at(MM,x,y-1)||at(MM,x,y-2))&&!RV[i]&&!RD[i])P[i]=rgba('#3a6a2a')}
  // roads last: dirt with a darker rim and pebbles; planked bridges with rails where they cross water
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x;if(!RD[i])continue;
    const bridge=RV[i]||LN[i]<.5,edge=!at(RD,x-1,y)||!at(RD,x+1,y)||!at(RD,x,y-1)||!at(RD,x,y+1);
    if(bridge){const hor=RD[i]===1,line=hor?x%3===0:y%3===0,rail=hor?(!at(RD,x,y-1)||!at(RD,x,y+1)):(!at(RD,x-1,y)||!at(RD,x+1,y));P[i]=rail?WOOD[0]:line?WOOD[1]:WOOD[3];continue}
    P[i]=edge?DIRT[0]:hash(x*31+y*17)%29===0?DIRT[1]:(x+y*3)%11===0?DIRT[3]:DIRT[2]}
  c.putImageData(img,0,0);
  const peaks=[];for(let row=0;row*8<H+20;row++)for(let col=-1;col*12<W+12;col++){const hh=hash('pk'+row+','+col),bx=col*12+(row%2)*6+(hh%5)-2,by=row*8+((hh>>>4)%3);
    if(bx<2||by<10||bx>=W-2||by>=H)continue;const i=by*W+bx;if(world.towns.some(T=>bx+15>T.x-4&&bx-15<T.x+T.w+4&&by+2>T.y-4&&by-26<T.y+T.h+4))continue;if(!MM[i]||!MM[Math.max(0,i-W*6)])continue;
    let clear=true;for(let j=-5;j<=2&&clear;j++)for(let k=-6;k<=6;k++){const X=bx+k,Y=by+j;if(X>=0&&Y>=0&&X<W&&Y<H&&(RD[Y*W+X]||RV[Y*W+X])){clear=false;break}}if(!clear)continue;
    const m=Math.min(1,mtF[i]),big=m>.8&&(hh>>>8)%3!==0;peaks.push({x:bx,y:by,w:big?28:20+(hh>>>10)%5,h:big?24:15+(hh>>>12)%5,snow:snF[i]>.4&&big,v:(hh>>>14)%5})}
  peaks.sort((a,b)=>a.y-b.y||a.x-b.x);for(const p of peaks){const img=peakSprite(p.w,p.h,p.snow,p.v);c.drawImage(img,Math.round(p.x-img.width/2),p.y-img.height+2)}
  world.sparks=[];for(let k=0;k<40;k++){const hh=hash('sp'+k),x=hh%W,y=(hh>>>8)%H;if(LN[y*W+x]<.3)world.sparks.push([x,y])}
  return cv;
}
const ICON_SIZE={city:[96,78],royal:[80,74],castle:[64,60],port:[56,46],village:[50,42],hamlet:[44,38],tower:[42,56],cave:[36,30]};
function hut(c,x,y,w,h,roof,wall,roofKind){
  px(c,x,y+h-8,w,8,wall);px(c,x,y+h-1,w,1,shade(wall,-.3));px(c,x+w-3,y+h-8,3,8,shade(wall,-.18));px(c,x+w/2-1,y+h-5,3,5,'#5a3622');
  for(let i=0;i<h-8;i++){const yy=y+h-9-i,inset=roofKind==='cone'?Math.round(i*.45):0;px(c,x-1+inset,yy,w+2-inset*2,1,i%3===0?shade(roof,-.3):roof);px(c,x-1+inset,yy,2,1,shade(roof,.3))}
}
function iconSprite(kind,night){const dim=kind==='city'?[112,96]:kind==='royal'?[100,92]:[80,72];return cached('ic'+kind+(night?1:0),dim[0],dim[1],c=>{
  if(kind==='city')return cityIcon(c,night);if(kind==='royal')return royalIcon(c,night);
  if(kind!=='castle')return townIcon(kind,c,night);
  const win=night?'#ffd86b':'#3e5e98';
  if(kind==='castle'){const x=8,y=10;
    px(c,x,y+20,64,34,'#a8a298');for(let yy=y+20;yy<y+54;yy+=5)px(c,x,yy,64,1,'#8a847a');for(let xx=x;xx<x+64;xx+=8)px(c,xx,y+16,5,4,'#c4beb2');
    hut(c,x+8,y+22,14,16,'#c8453a','#e8dcc4');hut(c,x+42,y+22,14,16,'#3f6ea8','#e8dcc4');
    px(c,x+24,y+6,16,40,'#c4beb2');px(c,x+24,y+6,3,40,'#ddd8cc');px(c,x+36,y+6,4,40,'#8a847a');for(let k=0;k<3;k++)px(c,x+24+k*6,y+2,4,4,'#c4beb2');
    px(c,x+29,y+14,6,8,win);px(c,x+29,y+30,6,6,win);px(c,x+31,y-8,2,10,'#ece6d6');
    for(const tx of [x-4,x+56]){px(c,tx,y+14,12,42,'#b4aea2');px(c,tx,y+14,3,42,'#cac4b8');px(c,tx+9,y+14,3,42,'#8a847a');for(let i=0;i<10;i++){const hw=Math.round(8*(1-i/10));px(c,tx+6-hw,y+13-i,hw*2,1,i%3?'#3f6ea8':'#2c5080')}px(c,tx+4,y+26,4,6,win)}
    px(c,x+26,y+42,12,12,'#2a1a10');px(c,x+26,y+42,12,2,'#6e6a62');for(let k=0;k<3;k++)px(c,x+28+k*4,y+44,1,10,'#5a564e');
    px(c,x-4,y+54,72,2,'#6e6a62')}
  if(kind==='port'){const x=10,y=14;
    hut(c,x,y+8,16,20,'#2f8a8a','#f2eadb');hut(c,x+18,y+4,16,24,'#c8453a','#f2eadb');hut(c,x+36,y+10,14,18,'#2f8a8a','#f2eadb');hut(c,x+8,y+22,14,16,'#d4822e','#f2eadb');
    px(c,x+26,y+30,26,5,'#ad7c4c');for(let k=0;k<26;k+=4)px(c,x+26+k,y+30,1,5,'#6e4a2a');for(const xx of [x+28,x+48])px(c,xx,y+35,2,5,'#5a3a20');
    px(c,x+44,y+40,18,5,'#7a4a24');px(c,x+52,y+26,1,14,PAL.woodD);px(c,x+53,y+27,8,9,'#f4eee0')}
  if(kind==='village'){const x=8,y=12;
    hut(c,x,y+12,16,18,'#d8b45a','#efe2c6');hut(c,x+20,y+16,16,16,'#d8b45a','#efe2c6');hut(c,x+8,y+28,14,14,'#d8b45a','#efe2c6');
    px(c,x+42,y+6,8,26,'#e6d6b4');px(c,x+42,y+6,2,26,'#f4ead0');px(c,x+41,y+2,10,5,'#a8402e');px(c,x+44,y+24,4,8,'#6a4228');
    for(let k=0;k<5;k++){px(c,x+26+k*5,y+36,4,2,'#7ac862');px(c,x+26+k*5,y+38,4,1,'#5a3a20')}
    for(let xx=x-2;xx<x+60;xx+=5)px(c,xx,y+44,1,4,'#f4eee0');px(c,x-2,y+45,62,1,'#f4eee0')}
  if(kind==='hamlet'){const x=10,y=14;
    hut(c,x,y+6,18,20,'#7a5a3a','#a2703f');hut(c,x+22,y+12,16,16,'#7a5a3a','#a2703f');
    for(let yy=y+10;yy<y+26;yy+=4)px(c,x,yy,18,1,'#7a5432');
    px(c,x+40,y+16,6,12,'#a2703f');for(let k=0;k<6;k++)px(c,x+46,y+14+k*3,4,2,PAL.woodD);px(c,x+2,y+32,40,3,'#ad7c4c')}
  if(kind==='tower'){const x=14,y=6;
    px(c,x+12,y+12,16,46,'#b4b0c4');px(c,x+12,y+12,3,46,'#cecade');px(c,x+25,y+12,3,46,'#8a86a0');for(let yy=y+16;yy<y+58;yy+=5)px(c,x+12,yy,16,1,'#9a96ae');
    for(let i=0;i<18;i++){const hw=Math.round(11*(1-i/18));px(c,x+20-hw,y+11-i,hw*2,1,i%3?'#5a3a9a':'#3e2878')}
    px(c,x+17,y-12,6,6,'#9a7af0');px(c,x+18,y-11,2,3,'#e8dcff');px(c,x+18,y+22,4,6,night?'#c0a8ff':win);px(c,x+18,y+38,4,6,night?'#c0a8ff':win);px(c,x+17,y+50,6,8,'#3a2a4a');
    hut(c,x-6,y+40,14,18,'#4a6ab0','#b4b0c4');hut(c,x+32,y+42,12,16,'#4a6ab0','#b4b0c4')}
  if(kind==='cave'){const x=18,y=18;
    for(let yy=0;yy<30;yy++){const hw=Math.round(22*Math.sqrt(Math.min(1,(yy+4)/22)));px(c,x+22-hw,y+yy-6,hw*2,1,yy<10?'#8a7050':'#6e5640');px(c,x+22-hw,y+yy-6,4,1,'#b08a60')}
    for(let yy=0;yy<14;yy++){const hw=Math.round(9*Math.sqrt(Math.min(1,(yy+1)/8)));px(c,x+22-hw,y+10+yy,hw*2,1,'#120c0a')}
    px(c,x+8,y+12,2,10,PAL.woodD);px(c,x+7,y+9,4,4,'#ff9a3c');px(c,x+8,y+8,2,2,'#ffe07a');
    px(c,x+34,y+18,8,6,PAL.woodL);px(c,x+37,y+24,2,4,PAL.woodD)}
})}
const bubbleQ=[];
function drawWorld(t,dt){
  if(!world.bg)return;
  const c=world.ctx,L=lighting(),lights=[];
  c.drawImage(world.bg,0,0);if(snowDay())c.drawImage(snowLayer(),0,0);
  {const fr=Math.floor(t*1.8);for(const [x,y,hh,deep] of world.waves){const k=(fr+hh)%7;if(k>3)continue;const cx=x+2+(hh>>>3)%6+k*2,cy=y+4+((hh>>>7)%8);px(c,cx,cy,3,1,deep?'#3a5ab0':'#6aa6e8');if(k===1)px(c,cx+1,cy-1,1,1,deep?'#5a7ac8':'#a8d4f8')}
   const lap=Math.floor(t*1.1)%3,F=world.foamPx;c.fillStyle='#ffffff';for(let k=0;k<F.length;k+=2){const x=F[k],y=F[k+1];if((((x>>2)+(y>>2))+lap)%3===0)c.fillRect(x,y,1,1)}}
  for(const [x,y] of world.sparks){if((Math.floor(t*2)+x+y)%9===0)px(c,x,y,3,1,'#e8f4ff')}
  fairLeftovers(c);
  for(const T of world.towns){const img=iconSprite(T.icon,L.night),v=T.v,st=townStats(v);
    ellipseShadow(c,T.cx,T.y+T.h-2,T.w*.45,4,.25);
    const ox=Math.round(T.cx-img.width/2),oy=Math.round(T.cy-img.height/2+(T.icon==='city'||T.icon==='royal'?2:0));c.drawImage(img,ox,oy);
    // every lit window glows on its own at night
    if(L.night){const G=glowFor(T.icon);glowQ.push(c=>c.drawImage(G.img,ox,oy));for(const [gx,gy] of G.pts)lights.push([ox+gx,oy+gy+1,8,WIN,.45])}
    if(T.icon==='royal'){torch(c,ox+38,oy+54,L,t,lights,1);torch(c,ox+60,oy+54,L,t,lights,2)}
    if(T.icon==='port')roadLamp(c,ox+8,oy+46,L,lights);
    if(T.icon==='city'){const w=Math.floor(t*4)%2;px(c,ox+56,oy+3,8,5,'#c43a3a');px(c,ox+64,oy+4+w,3,3,'#c43a3a')}
    if(T.icon==='royal'){const w=Math.floor(t*4)%2;for(const fx of [ox+51,ox+21,ox+79]){px(c,fx,oy+2,7,5,'#7a3ab0');px(c,fx+7,oy+3+w,3,3,'#7a3ab0');px(c,fx+2,oy+3,3,2,'#f2c94c')}}
    if(T.icon==='castle'){const w=Math.floor(t*4)%2;px(c,ox+41,oy+2,8,5,'#c43a3a');px(c,ox+49,oy+3+w,3,3,'#c43a3a');if(L.night)lights.push([T.cx,T.cy,50])}
    if(T.icon==='village'){const a=t*1.3;for(let k=0;k<4;k++){const aa=a+k*Math.PI/2;for(let r=2;r<10;r++)px(c,ox+54+Math.cos(aa)*r,oy+16+Math.sin(aa)*r,1,1,'#f4eee0')}}
    if(T.icon==='hamlet'){const a=t;for(let k=0;k<4;k++){const aa=a+k*Math.PI/2;px(c,ox+58+Math.cos(aa)*5,oy+36+Math.sin(aa)*5,2,2,PAL.woodD)}}
    if(T.icon==='tower'){const g=.5+.5*Math.sin(t*2);lights.push([ox+34,oy-3,24+g*8]);if(Math.floor(t*3)%2)px(c,ox+33,oy-8,2,2,'#fff6ff')}
    if(T.icon==='cave'){const f=Math.floor(t*8)%3;if(L.night){lights.push([ox+27,oy+26,26,FIRE]);glowQ.push(c=>px(c,ox+25,oy+24-f,3,4,f?'#ffb040':'#ffd23c'))}else px(c,ox+25,oy+25,3,2,'#4a3a2a')}
    if(T.icon==='port'){const b=Math.round(Math.sin(t*1.5));px(c,ox+54,oy+54+b,18,5,'#7a4a24')}
    if(T.door&&T.icon!=='royal'&&T.icon!=='cave'){const d=T.door;
      if(T.icon==='city'){px(c,d.x-6,d.y-4,12,10,'#1a1410');px(c,d.x-6,d.y-4,12,2,RAMP.stone[1]);for(let k=0;k<3;k++)px(c,d.x-4+k*4,d.y-2,1,8,'#5a564e');px(c,d.x-8,d.y-8,3,14,RAMP.stone[3]);px(c,d.x+5,d.y-8,3,14,RAMP.stone[3]);torch(c,d.x-12,d.y-4,L,t,lights,3);torch(c,d.x+10,d.y-4,L,t,lights,4)}
      else{px(c,d.x-7,d.y-12,2,14,PAL.woodD);px(c,d.x+5,d.y-12,2,14,PAL.woodD);px(c,d.x-9,d.y-14,18,3,PAL.wood);px(c,d.x-9,d.y-14,18,1,PAL.woodL);px(c,d.x-3,d.y-12,6,3,themeColour(T.v));torch(c,d.x-11,d.y-9,L,t,lights,5);torch(c,d.x+9,d.y-9,L,t,lights,6)}}
    if(st.working){const k=(t*.5)%1;px(c,T.cx-8+Math.sin(k*6)*2,T.cy-T.h/2-k*14,3,3,`rgba(236,236,244,${.6*(1-k)})`)}
  }
  for(const l of world.lamps||[])roadLamp(c,l.x,l.y,L,lights);
  if(world.volcano)drawVolcano(c,world.volcano,t,L,lights);
  if(world.sheep){stepSheep(Math.min(dt||0,.1),t);for(const s of world.sheep)if(!s.gone&&!s.carried)drawSheep(c,s,t)}
  drawTentOnMap(c,t,dt,lights,L);
  // riders travel on their own layer, shaded like the land and laid over the lit windows, so a town's glow never shows through them
  if(!world.act||world.act.cv.width!==world.W||world.act.cv.height!==world.H){const cv=document.createElement('canvas');cv.width=world.W;cv.height=world.H;world.act={cv,x:cv.getContext('2d')}}
  const A=world.act.x;A.imageSmoothingEnabled=false;A.clearRect(0,0,world.W,world.H);const gq0=glowQ.length;
  for(const Ln of lanes){const tp=travelPhase(Ln,t);Ln._wb=null;if(!tp||tp.k==='home')continue;const pts=edgeFor(Ln.product,Ln.talkingTo);if(!pts)continue;
    const from=villages.get(Ln.product),spec=courierSpec(from?themeColour(from):'#8a7a5a',Ln.id);let pos;
    if(tp.k==='out')pos=along(pts,tp.f);else if(tp.k==='back')pos=along([...pts].reverse(),tp.f);else{const e=pts[pts.length-1];pos={x:e.x+14,y:e.y+10,dir:'left'}}
    if(tp.k==='there')pos={x:pos.x-6,y:pos.y-2,dir:'left'};
    const head=pts[pts.length-1].x>=pts[0].x?'right':'left',face=tp.k==='there'?'left':pos.dir==='left'||pos.dir==='right'?pos.dir:(tp.k==='back'?(head==='right'?'left':'right'):head);
    drawRider(A,pos.x,pos.y,'courier',from?themeColour(from):'#8a7a5a',tp.k==='there'?'down':pos.dir,tp.k!=='there'?Math.floor(t*4):0);handTorch(A,pos.x+(pos.dir==='left'?-9:9),pos.y-12,L,t,lights);
    if(tp.k==='there')Ln._wb={x:pos.x,y:pos.y-30}}
  const msgs=messengers(t);
  if(world.bridge){drawDrawbridge(c,t,dt,msgs);if(world.bridge.guards)world.bridge.guards.forEach(([gx,gy,ox],k)=>drawMini(A,gx*TS+8+ox,gy*TS+10,guardSpec(k),'down',0))}
  if(typeof drawCrossroads==='function')drawCrossroads(A,t);
  for(const m of msgs){drawRider(A,m.x,m.y,'royal','#6a2a9a',m.walk?m.dir:'down',m.walk?Math.floor(t*4):0);handTorch(A,m.x+(m.dir==='left'?-9:9),m.y-12,L,t,lights);if(!m.walk)bubbleQ.push([m.x,m.y-30,'scroll'])}
  const riderGlow=glowQ.splice(gq0);
  // a flock of birds now and then
  {const k=(t*.03)%1.6;if(k<1){if(!active&&Math.random()<dt*.5&&!lighting().night)sfx('chirp',.6);const bx=k*world.W*1.2-40,by=world.H*.2+Math.sin(t*.3)*20;for(let i=0;i<5;i++){const xx=bx-i*8,yy=by+Math.abs(i-2)*5,w=Math.floor(t*6+i)%2;px(c,xx,yy,2,1,'#2a2236');px(c,xx+2,yy-w,2,1,'#2a2236');px(c,xx-2,yy-w,2,1,'#2a2236')}}}
  eggWorld(c,t,dt,L,lights);
  stepDragon(c,t,L,lights);
  drawWeather(c,world.W,world.H,t,dt,world,L);
  applyLight(c,world.W,world.H,L,lights);
  for(const g of glowQ.splice(0))g(c);
  shadeLayer(A,world.W,world.H,L,lights);c.drawImage(world.act.cv,0,0);for(const g of riderGlow)g(c);
  for(const [bx,by,k] of bubbleQ.splice(0))bubble(c,bx,by,k,t);
  for(const T of world.towns){const s=townStats(T.v);if(s.blocked&&Math.floor(t*2)%3)bubble(c,T.cx+T.w/2-6,T.cy-T.h/2+6,'!',t);else if(s.idle)bubble(c,T.cx-T.w/2+8,T.cy-T.h/2+8,'z',t)}
  for(const Ln of lanes)if(Ln._wb)bubble(c,Ln._wb.x,Ln._wb.y,(Math.floor(t/1.5)%2)?'chat':'...',t);
  if(world.hover){const T=world.towns.find(x=>x.name===world.hover);if(T){const k=Math.floor(t*4)%2,B=iconBounds(T.icon),img=iconSprite(T.icon,false),ox=Math.round(T.cx-img.width/2),oy=Math.round(T.cy-img.height/2+(T.icon==='city'||T.icon==='royal'?2:0));
    c.strokeStyle='#140f22';c.lineWidth=4;c.strokeRect(ox+B.x-4-k,oy+B.y-4-k,B.w+8+k*2,B.h+8+k*2);c.strokeStyle='#f0b440';c.lineWidth=2;c.strokeRect(ox+B.x-4-k,oy+B.y-4-k,B.w+8+k*2,B.h+8+k*2)}}
}
function edgeFor(a,b){for(const e of world.edges){if(e.a===a&&e.b===b)return e.pts;if(e.a===b&&e.b===a)return [...e.pts].reverse()}return null}
function along(pts,f){let tot=0;const seg=[];for(let i=1;i<pts.length;i++){const d=Math.abs(pts[i].x-pts[i-1].x)+Math.abs(pts[i].y-pts[i-1].y);seg.push(d);tot+=d}
  if(!seg.length)return {x:pts[0].x,y:pts[0].y,dir:'down'};let d=f*tot;
  for(let i=0;i<seg.length;i++){if(d<=seg[i]||i===seg.length-1){const a=pts[i],b=pts[i+1],k=seg[i]?clamp(d/seg[i]):0;return {x:a.x+(b.x-a.x)*k,y:a.y+(b.y-a.y)*k,dir:b.x>a.x?'right':b.x<a.x?'left':b.y>a.y?'down':'up'}}d-=seg[i]}
}
// the map fills the screen: the terrain grid follows the screen's shape, then the canvas is fitted and centred
const WORLD_SMAX=1.5;
// the map fills the screen at zoom 1; zooming in lets it be dragged about, and the view never leaves the map
function sizeWorldBox(){if(!world.W)return;const box=document.getElementById('mapBox'),hud=innerWidth<600?62:0,vw=innerWidth,vh=innerHeight-hud,s0=Math.min(vw/world.W,vh/world.H);
  world.zoom=clamp(world.zoom||1,1,worldZoomMax());const s=s0*world.zoom,w=world.W*s,h=world.H*s;
  let cx=world.pan?world.pan.x:world.W/2,cy=world.pan?world.pan.y:world.H/2;
  cx=w>vw?clamp(cx,vw/2/s,world.W-vw/2/s):world.W/2;cy=h>vh?clamp(cy,vh/2/s,world.H-vh/2/s):world.H/2;world.pan={x:cx,y:cy};world.scale=s;
  box.style.width=Math.round(w)+'px';box.style.height=Math.round(h)+'px';box.style.left=Math.round(vw/2-cx*s)+'px';box.style.top=Math.round(hud+vh/2-cy*s)+'px';
  updateWorldMini();
  const zb=document.getElementById('wzOut');if(zb){zb.disabled=world.zoom<=1.001;document.getElementById('wzIn').disabled=world.zoom>=worldZoomMax()-.001}}
// the most zoom: the island across the full width of the screen, or three times the fitted view if that is more
function worldFitWidth(){const hud=innerWidth<600?62:0,s0=Math.min(innerWidth/world.W,(innerHeight-hud)/world.H),c=world.core||{w:world.W};return Math.max(1,innerWidth/(c.w*s0))}
function worldZoomMax(){return Math.max(3,worldFitWidth()*1.5)}
function worldZoomAt(z,sx,sy){if(!world.W)return;const hud=innerWidth<600?62:0,old=world.scale||1;const mx=world.pan.x+(sx-innerWidth/2)/old,my=world.pan.y+(sy-hud-(innerHeight-hud)/2)/old;
  world.zoom=clamp(z,1,worldZoomMax());const s=Math.min(innerWidth/world.W,(innerHeight-hud)/world.H)*world.zoom;world.pan={x:mx-(sx-innerWidth/2)/s,y:my-(sy-hud-(innerHeight-hud)/2)/s};sizeWorldBox()}
function worldFitToggle(){const fw=worldFitWidth(),c=world.core;if(Math.abs(world.zoom-fw)<.05||fw<=1.02){world.zoom=1;world.pan=null}else{world.zoom=fw;world.pan={x:c.x+c.w/2,y:world.pan?world.pan.y:c.y+c.h/2}}sizeWorldBox()}

// tiny pixel icons for the map labels: a scroll for asks, a red warning sign for blocked lanes
function pixIcon(kind){const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 8 8');svg.setAttribute('aria-hidden','true');svg.setAttribute('shape-rendering','crispEdges');svg.classList.add('pix');
  const R=kind==='scroll'?[[1,0,6,1,'#c9b98f'],[1,1,6,6,'#f6eed6'],[1,7,6,1,'#c9b98f'],[2,2,4,1,'#9a8e70'],[2,4,4,1,'#9a8e70'],[0,0,1,2,'#c9b98f'],[7,6,1,2,'#c9b98f'],[5,5,2,2,'#c43a3a']]
    :[[3,0,2,1,'#f2c94c'],[2,1,4,2,'#f2c94c'],[1,3,6,2,'#f2c94c'],[0,5,8,3,'#f2c94c'],[3,1,2,4,'#2a1e14'],[3,6,2,1,'#2a1e14']];
  for(const [x,y,w,h,f] of R){const r=document.createElementNS(ns,'rect');r.setAttribute('x',x);r.setAttribute('y',y);r.setAttribute('width',w);r.setAttribute('height',h);r.setAttribute('fill',f);svg.appendChild(r)}return svg}
function renderLabels(){
  const box=document.getElementById('labels');box.innerHTML='';
  for(const T of world.towns){const v=T.v,b=document.createElement('button');b.type='button';b.className='tlabel';
    const above=false;
    b.style.left=(T.cx/world.W*100)+'%';const ly=T.icon==='royal'?(above?T.cy-78:T.cy+88):(above?T.y-34:T.y+T.h+2);b.style.top=(ly/world.H*100)+'%';if(T.icon==='royal'&&above)b.style.transform='translate(-50%,-100%)';
    const name=document.createElement('b'),meta=document.createElement('i');name.textContent=placeName(v).toUpperCase();
    const crown=v.thKey==='crown',projs=[...villages.values()].filter(x=>x.thKey!=='crown');
    const asks=ASKS.filter(q=>q.status!=='answered'&&(crown||q.project===v.name)).length,s=crown?null:townStats(v),blocked=crown?0:s.blocked;
    const pp=crown?null:projectProgress(v),pct=crown?Math.round(projs.reduce((n,x)=>n+projectProgress(x).pct,0)/Math.max(1,projs.length)):pp.pct,pctWhat=crown?'average roadmap progress':pp.src==='roadmap'?(pp.total?`of the roadmap done (${pp.done} of ${pp.total} steps)`:'of the roadmap done'):'built (no roadmap yet)';
    const sep=()=>{const d=document.createElement('span');d.className='sep';d.textContent='•';meta.appendChild(d)};
    const part=(txt,cls,icon,label)=>{const sp=document.createElement('span');sp.className='part '+(cls||'');if(icon)sp.appendChild(pixIcon(icon));sp.appendChild(document.createTextNode(txt));if(label)sp.title=label;meta.appendChild(sp)};
    part(crown?'The '+monarch():v.name,'proj');
    if(asks){sep();part(String(asks),'nask','scroll',asks+' ask'+(asks>1?'s':'')+' waiting on you')}
    if(blocked){sep();part(String(blocked),'bad','block',blocked+' blocked')}
    sep();part(pct+'%','pct',null,pctWhat);
    b.setAttribute('aria-label',`${placeName(v)}, ${crown?'the '+monarch()+'\'s castle':v.name+', '+v.th.label}: ${asks?asks+' asks waiting on you, ':''}${blocked?blocked+' blocked, ':''}${pct}% ${pctWhat}. ${crown?'Enter the throne room':'Enter'}`);
    b.append(name,meta);
    b.addEventListener('click',()=>travelTo(v));b.addEventListener('pointerenter',()=>world.hover=T.name);b.addEventListener('pointerleave',()=>world.hover=null);box.appendChild(b)}
  if(world.tent)box.appendChild(tentLabel());
  // keep every label inside the map's frame (a town on the very edge would otherwise clip its name)
  requestAnimationFrame(()=>{const W=box.clientWidth;if(!W)return;for(const b of box.children){if(!b.style.left.endsWith('%'))continue;const w=b.offsetWidth,cx=parseFloat(b.style.left)/100*W,c=clamp(cx,w/2+4,W-w/2-4);if(c!==cx)b.style.left=(c/W*100)+'%'}})
}
function townAt(e){const r=world.cv.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*world.W,y=(e.clientY-r.top)/r.height*world.H;return world.towns.find(T=>x>=T.x-6&&x<=T.x+T.w+6&&y>=T.y-6&&y<=T.y+T.h+20)}
world.cv.addEventListener('click',e=>{if(WDRAG.moved){WDRAG.moved=false;return}if(typeof crossroadsTap==='function'&&crossroadsTap(e))return;if(eggWorldTap(e))return;if(dragonAt(e)){wakeDragon();return}if(tentAt(e)){openTent();return}const T=townAt(e);if(T)travelTo(T.v)});
world.cv.addEventListener('pointermove',e=>{const T=townAt(e);world.hover=T?T.name:null;world.cv.style.cursor=T||tentAt(e)||dragonAt(e)?'pointer':'default'});
world.cv.addEventListener('pointerleave',()=>world.hover=null);
const WDRAG={ptrs:new Map(),moved:false,start:null,pinch:null};
const mapBoxEl=document.getElementById('mapBox');mapBoxEl.style.touchAction='none';
mapBoxEl.addEventListener('pointerdown',e=>{if(e.target.closest&&e.target.closest('button'))return;WDRAG.ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});WDRAG.moved=false;WDRAG.start={x:e.clientX,y:e.clientY,pan:{...world.pan}};
  if(WDRAG.ptrs.size===2){const [a,b]=[...WDRAG.ptrs.values()];WDRAG.pinch={d:Math.hypot(a.x-b.x,a.y-b.y),z:world.zoom}}});
addEventListener('pointermove',e=>{if(!WDRAG.ptrs.has(e.pointerId))return;WDRAG.ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(WDRAG.ptrs.size>=2&&WDRAG.pinch){const [a,b]=[...WDRAG.ptrs.values()];WDRAG.moved=true;worldZoomAt(WDRAG.pinch.z*Math.hypot(a.x-b.x,a.y-b.y)/Math.max(1,WDRAG.pinch.d),(a.x+b.x)/2,(a.y+b.y)/2);return}
  const st=WDRAG.start;if(!st)return;const dx=e.clientX-st.x,dy=e.clientY-st.y;if(Math.hypot(dx,dy)>6)WDRAG.moved=true;if(!WDRAG.moved||world.zoom<=1.001)return;
  world.pan={x:st.pan.x-dx/world.scale,y:st.pan.y-dy/world.scale};sizeWorldBox();world.cv.style.cursor='grabbing'});
const wUp=e=>{WDRAG.ptrs.delete(e.pointerId);if(WDRAG.ptrs.size<2)WDRAG.pinch=null;if(!WDRAG.ptrs.size){WDRAG.start=null;world.cv.style.cursor='default'}else{const [p]=[...WDRAG.ptrs.values()];WDRAG.start={x:p.x,y:p.y,pan:{...world.pan}}}};
addEventListener('pointerup',wUp);addEventListener('pointercancel',wUp);
document.getElementById('worldView').addEventListener('wheel',e=>{if(!world.W||e.target.closest('.menu'))return;e.preventDefault();worldZoomAt(world.zoom*Math.exp(-e.deltaY*(e.ctrlKey?.01:.0018)),e.clientX,e.clientY)},{passive:false});
document.getElementById('wzIn').addEventListener('click',()=>worldZoomAt(world.zoom*1.4,innerWidth/2,innerHeight/2));
document.getElementById('wzOut').addEventListener('click',()=>worldZoomAt(world.zoom/1.4,innerWidth/2,innerHeight/2));
document.getElementById('wzFit').addEventListener('click',worldFitToggle);

// ---- royal icons ----
function royalIcon(c,night){
  // the King's castle, built like the towns: coursed stone walls, slate cones in royal purple, lit windows at night
  const x=10,y=8,W=80,S=RAMP.stone,P='#6a3aa0',win=night?'#ffd86b':RAMP.slate[1],M={wall:'stone',wallCol:'#c8c2b6'};
  const crenel=(cx,cy,cw)=>{for(let xx=cx;xx<cx+cw;xx+=6){px(c,xx,cy-4,4,4,S[3]);px(c,xx,cy-4,4,1,S[4]);px(c,xx+3,cy-4,1,4,S[1])}};
  const win2=(wx,wy,ww,wh)=>{px(c,wx-1,wy-1,ww+2,wh+2,RAMP.wood[0]);px(c,wx,wy,ww,wh,win);px(c,wx,wy-1,ww,1,RAMP.wood[0]);if(!night)px(c,wx,wy,1,1,RAMP.slate[3])};
  // rocky plinth with a grass lip
  for(let yy=0;yy<14;yy++){const hw=Math.round(42-yy*.4);px(c,x+W/2-hw,y+64+yy,hw*2,1,yy<3?RAMP.grass[yy?1:2]:yy%3?S[2]:S[1])}
  ellipseShadow(c,x+W/2,y+66,40,3,.25);
  // curtain wall
  wallFace(c,M,x+4,y+40,W-8,26,26,true);crenel(x+4,y+40,W-8);
  // great keep with the central tower and spire
  wallFace(c,M,x+22,y+14,36,30,30,true);crenel(x+22,y+14,36);
  win2(x+29,y+20,4,7);win2(x+47,y+20,4,7);
  wallFace(c,M,x+33,y-2,14,18,18,true);roofCone(c,x+33,y-20,14,18,18,'slate',P);px(c,x+39,y-24,2,5,RAMP.gold[3]);win2(x+38,y+3,4,6);
  // four towers with purple cones
  for(const [tx,tall] of [[x,1],[x+W-14,1],[x+12,0],[x+W-26,0]]){const ty=tall?y+18:y+26,th=tall?48:40;wallFace(c,M,tx,ty,14,th,th,true);crenel(tx,ty,14);roofCone(c,tx,ty-15,14,12,12,'slate',P);win2(tx+5,ty+8,4,6)}
  // gate: arched opening with portcullis and a timber bridge
  px(c,x+W/2-8,y+50,16,16,'#1a1410');px(c,x+W/2-6,y+48,12,2,'#1a1410');px(c,x+W/2-9,y+49,18,1,S[4]);for(let k=0;k<4;k++)px(c,x+W/2-6+k*4,y+51,1,15,'#5a564e');px(c,x+W/2-8,y+56,16,1,'#5a564e');
  px(c,x+W/2-8,y+66,16,3,RAMP.wood[2]);px(c,x+W/2-8,y+66,16,1,RAMP.wood[3]);
  // golden-trimmed banners either side of the gate
  for(const bx of [x+24,x+51]){px(c,bx,y+44,5,11,P);px(c,bx,y+44,5,1,RAMP.gold[3]);px(c,bx+1,y+47,3,3,RAMP.gold[3]);px(c,bx,y+55,2,2,P);px(c,bx+3,y+55,2,2,P)}
}
function guardSpec(k){return {cls:'Guard'+k,title:'Royal Guard',skin:SKIN[(k*2)%5],hair:HAIRS[k%10],eye:EYES[k%5],hs:'short',head:'helm',headCol:'#c4cad4',build:'normal',outfit:'armor',top:'#a8b0bc',bottom:'#4a3a6a',trim:'#7a3ab0',cape:'#6a3aa0',item:'spear',acc:'none'}}
function squireSpec(){return {cls:'Herald',title:'Herald',skin:SKIN[0],hair:HAIRS[3],eye:EYES[0],hs:'short',head:'cap',headCol:'#7a3ab0',build:'normal',outfit:'tunic',top:'#f2c94c',bottom:'#4a3a6a',trim:'#7a3ab0',item:'scroll',acc:'none'}}
// a route over the road network between two places (breadth-first over edges)
function routeBetween(a,b){if(a===b)return null;const adj={};for(const e of world.edges){(adj[e.a]=adj[e.a]||[]).push([e.b,e.pts]);(adj[e.b]=adj[e.b]||[]).push([e.a,[...e.pts].reverse()])}
  const prev={[a]:null},q=[a];while(q.length){const n=q.shift();if(n===b)break;for(const [m,pts] of adj[n]||[])if(!(m in prev)){prev[m]=[n,pts];q.push(m)}}
  if(!(b in prev))return null;const segs=[];let cur=b;while(prev[cur]){segs.unshift(prev[cur][1]);cur=prev[cur][0]}return segs.flat()}
// heralds carry queued decrees from the castle to each owner's town
function messengers(t){
  const out=[],crown=world.towns.find(x=>x.icon==='royal');if(!crown)return out;
  const qd=[...(typeof DECREES!=='undefined'?DECREES:[]).filter(d=>d.status==='queued'),...(typeof answersOnRoad==='function'?answersOnRoad():[])].slice(0,8);
  qd.forEach((d,i)=>{const target=d.to==='all'?(world.towns.find(x=>x.v.thKey==='capital')||{}).name:d.to;const pts=routeBetween(crown.name,target);if(!pts)return;
    // out along the road, wait at the owner's town, then ride home: 48 seconds a round
    const age=(Date.now()-Date.parse(d.createdAt||new Date().toISOString()))/1000+i*20,k=(age%160)/160;
    let pos,f,walk=true;if(k<.4){f=k/.4;pos=along(pts,f)}else if(k<.6){f=1;walk=false;pos=along(pts,1)}else{f=1-(k-.6)/.4;pos=along([...pts].reverse(),1-f)}
    const head=pts[pts.length-1].x>=pts[0].x?'right':'left',face=pos.dir==='left'||pos.dir==='right'?pos.dir:(k>=.6?(head==='right'?'left':'right'):head);
    const L=pts.reduce((s,p,j)=>j?s+Math.abs(p.x-pts[j-1].x)+Math.abs(p.y-pts[j-1].y):0,0);
    out.push({x:pos.x,y:pos.y,dir:pos.dir,face,walk,f,near:walk&&f*L<90})});
  return out;
}
// the drawbridge lowers over the moat while a herald is crossing, and rises again behind them
function drawDrawbridge(c,t,dt,msgs){const B=world.bridge,want=msgs.some(m=>m.near)?1:0;if(world.dbWant!==want){if(world.dbWant!=null&&!active)sfx('chain',.8);world.dbWant=want}
  world.dbOpen=world.dbOpen==null?want:world.dbOpen+clamp(want-world.dbOpen,-(dt||.07)*1.4,(dt||.07)*1.4);const o=world.dbOpen;
  const x=B.gx*TS+8,cy=B.by*TS+8,hinge=cy+54,far=Math.round(hinge+24*o-16*(1-o)),y0=Math.min(hinge,far),y1=Math.max(hinge,far),up=far<hinge;
  const base=up?'#6a4228':'#b07a48',line=up?'#4a2e22':'#7a5232';
  px(c,x-7,y0,14,y1-y0+1,base);for(let y=y0+1;y<y1;y+=3)px(c,x-7,y,14,1,line);px(c,x-7,y0,1,y1-y0+1,'#3a2418');px(c,x+6,y0,1,y1-y0+1,'#3a2418');
  if(!up)px(c,x-7,y1,14,1,'#3a2418');
  for(const sx of [-6,5]){const ax=x+sx,ay=cy+32,bx=x+sx,by=far;const n=Math.max(1,Math.abs(by-ay));for(let k=0;k<=n;k+=2)px(c,ax+(bx-ax)*k/n,ay+(by-ay)*k/n,1,1,'#2a2a34')}
}
// small overworld figures, in proportion to the map: the same people as in town, drawn at map scale
function miniSprite(o,dir,frame){const f=frame%2;return cached('mini|'+o.cls+'|'+(o.headCol||'')+'|'+o.top+'|'+dir+'|'+f,18,21,c=>{
  if(dir==='right'){c.translate(18,0);c.scale(-1,1)}
  const d=dir==='right'?'left':dir,side=d==='left',up=d==='up',S=o.skin[0],Sd=o.skin[1],T=o.top,Td=shade(T,-.3),P=o.bottom||'#4a4060',H=o.hair,Hc=o.headCol||H;
  if(o.cape&&!up)px(c,5,10,8,7,shade(o.cape,-.3));
  px(c,6,15,2,4-(f?1:0),P);px(c,10,15,2,4-(f?0:1),shade(P,-.25));px(c,6,19-(f?1:0),2,1,'#2a1e24');px(c,10,19-(f?0:1),2,1,'#2a1e24');
  px(c,5,9,8,7,T);px(c,11,9,2,7,Td);px(c,5,9,8,1,shade(T,.25));
  if(o.outfit==='tabard'&&!up){px(c,7,9,4,8,o.tab||'#6a2a9a');px(c,8,11,2,2,'#f2c94c')}
  if(o.outfit==='armor')px(c,5,13,8,1,o.trim||'#7a3ab0');
  if(o.acc==='satchel'&&!up)px(c,side?5:10,13,3,3,'#8e6038');
  if(o.cape&&up)px(c,5,9,8,8,o.cape);
  if(side){const ax=f?9:7;px(c,ax,10,2,5,Td);px(c,ax,15,2,1,S)}else{px(c,4,10,1,5,Td);px(c,13,10,1,5,Td);px(c,4,15,1,1,S);px(c,13,15,1,1,S)}
  px(c,5,3,8,6,S);px(c,11,3,2,6,Sd);px(c,5,2,8,2,H);
  if(up)px(c,5,3,8,6,H);else if(side)px(c,9,3,4,5,H);else{px(c,5,3,1,3,H);px(c,12,3,1,3,H)}
  if(!up){if(side)px(c,6,5,1,2,'#2a1e36');else{px(c,7,5,1,2,'#2a1e36');px(c,10,5,1,2,'#2a1e36')}}
  if(o.head==='helm'){px(c,5,1,8,4,Hc);px(c,5,1,8,1,shade(Hc,.3));px(c,8,0,2,2,o.trim||'#7a3ab0')}
  else if(o.head==='plume'){px(c,4,2,10,2,Hc);px(c,5,1,8,1,Hc);px(c,12,0,1,3,'#f2c94c');px(c,13,0,1,1,'#fff0a8')}
  else if(o.head==='wingcap'){px(c,5,1,8,3,Hc);px(c,5,1,8,1,shade(Hc,.3));px(c,3,2,2,1,'#ffffff');px(c,2,1,1,1,'#ffffff');if(!side){px(c,13,2,2,1,'#ffffff');px(c,15,1,1,1,'#ffffff')}}
  else if(o.head==='tophat'){px(c,6,0,6,3,Hc);px(c,4,2,10,1,Hc);px(c,6,1,6,1,o.trim||'#c43a3a')}
  else if(o.head&&o.head!=='none')px(c,5,1,8,2,Hc);
  if(o.item==='banner'){px(c,15,1,1,18,'#c9a03a');px(c,16,2,2,6,'#6a2a9a');px(c,16,4,1,1,'#f2c94c')}
  else if(o.item==='spear'){px(c,15,2,1,17,PAL.woodD);px(c,14,0,3,2,'#d8dce4')}
  else if(o.item==='letter'&&!up){px(c,side?2:13,12,3,2,'#f6eed6');px(c,side?3:14,12,1,1,'#c43a3a')}
})}
function drawMini(c,x,y,o,dir,frame){ellipseShadow(c,x,y,4,1,.3);c.drawImage(miniSprite(o,dir||'down',frame||0),Math.round(x-9),Math.round(y-20))}


// messengers ride: a courier on a brown horse in the sending town's colours, the Royal Herald on a white horse in purple and gold.
// Four facings: side (left, mirrored for right), toward you (down) and away (up), with a two-step gait.
function riderSprite(kind,col,dir,frame){const f=frame%2;return cached('ride|'+kind+'|'+col+'|'+dir+'|'+f,26,28,c=>{
  if(dir==='right'){c.translate(26,0);c.scale(-1,1)}
  const d=dir==='right'?'left':dir,royal=kind==='royal',H=royal?'#f4f0e8':'#8a5a34',Hd=royal?'#c8c2d4':'#5e3a20',Hl=royal?'#ffffff':'#a8744a',M=royal?'#c9a03a':'#3a2418';
  const top=royal?'#f2c94c':shade(col,.12),Tb=royal?'#6a2a9a':top,low=royal?'#ece6f4':'#5a4630',S=SKIN[1][0],Sd=SKIN[1][1],hat=royal?'#5a2a8a':col,cloth=royal?'#6a2a9a':col;
  const lg=f?1:0;
  if(d==='left'){
    for(const [lx,o] of [[6,lg],[8,-lg],[16,-lg],[18,lg]])px(c,lx+o,19,2,7,Hd);
    px(c,5,13,16,7,H);px(c,5,13,16,1,Hl);px(c,5,18,16,2,Hd);px(c,20,13,2,7,M);px(c,21,14,1,6,M);
    px(c,2,7,5,8,H);px(c,0,10,4,4,H);px(c,0,12,1,1,'#2a1e24');px(c,3,9,1,1,'#2a1e24');px(c,5,6,2,8,M);px(c,2,7,1,1,Hl);
    px(c,9,13,9,5,cloth);px(c,9,13,9,1,shade(cloth,.3));if(royal){px(c,9,17,9,1,'#f2c94c');px(c,13,15,2,2,'#f2c94c')}else px(c,10,15,3,2,'#8e6038');
    px(c,11,14,3,5,low);px(c,11,18,3,2,'#2a1e24');
    px(c,10,6,6,8,royal?Tb:top);px(c,14,6,2,8,shade(royal?Tb:top,-.3));if(royal){px(c,11,6,1,8,'#f2c94c')}
    px(c,7,10,4,2,shade(top,-.3));px(c,6,10,1,2,S);px(c,4,11,3,1,M);
    px(c,10,1,6,6,S);px(c,14,1,2,6,Sd);px(c,11,3,1,2,'#2a1e36');px(c,13,1,3,4,royal?'#3a2418':'#6a4224');
    px(c,9,0,8,2,hat);px(c,10,0,6,1,shade(hat,.3));
    if(royal){px(c,15,0,1,3,'#f2c94c');px(c,17,0,1,17,'#c9a03a');px(c,18,1,4,5,'#6a2a9a');px(c,19,3,1,1,'#f2c94c')}else{px(c,8,1,2,1,'#ffffff');px(c,16,1,2,1,'#ffffff')}
  } else if(d==='down'){
    for(const [lx,o] of [[9,lg],[15,-lg]])px(c,lx,20+o,2,7-o,Hd);
    px(c,7,12,12,9,H);px(c,7,12,12,1,Hl);px(c,17,12,2,9,Hd);
    px(c,10,15,6,9,H);px(c,10,22,6,2,shade(H,-.15));px(c,11,23,1,1,'#2a1e24');px(c,14,23,1,1,'#2a1e24');px(c,10,16,1,1,'#2a1e24');px(c,15,16,1,1,'#2a1e24');px(c,12,13,2,4,M);
    px(c,6,12,14,4,cloth);px(c,6,12,14,1,shade(cloth,.3));if(royal)px(c,6,15,14,1,'#f2c94c');
    px(c,6,10,2,6,low);px(c,18,10,2,6,low);px(c,6,15,2,2,'#2a1e24');px(c,18,15,2,2,'#2a1e24');
    px(c,9,5,8,7,top);px(c,15,5,2,7,shade(top,-.3));if(royal){px(c,11,5,4,8,Tb);px(c,12,7,2,1,'#f2c94c')}else{for(let k=0;k<7;k++)px(c,9+k,5+k,1,1,'#6a4224');px(c,15,9,3,3,'#8e6038')}
    px(c,8,7,1,4,shade(top,-.3));px(c,17,7,1,4,shade(top,-.3));px(c,8,11,1,1,S);px(c,17,11,1,1,S);
    px(c,10,0,6,6,S);px(c,14,0,2,6,Sd);px(c,11,3,1,1,'#2a1e36');px(c,14,3,1,1,'#2a1e36');
    px(c,9,0,8,2,hat);px(c,10,0,6,1,shade(hat,.3));
    if(royal){px(c,15,0,1,2,'#f2c94c');px(c,20,0,1,17,'#c9a03a');px(c,21,1,4,5,'#6a2a9a');px(c,22,3,1,1,'#f2c94c')}else{px(c,7,1,2,1,'#ffffff');px(c,17,1,2,1,'#ffffff')}
  } else { // away from you
    for(const [lx,o] of [[9,lg],[15,-lg]])px(c,lx,21+o,2,6-o,Hd);
    px(c,7,12,12,10,H);px(c,7,12,12,1,Hl);px(c,17,12,2,10,Hd);px(c,12,14,2,9,M);px(c,11,21,4,2,M);
    px(c,6,12,14,4,cloth);px(c,6,12,14,1,shade(cloth,.3));if(royal)px(c,6,15,14,1,'#f2c94c');
    px(c,6,10,2,6,low);px(c,18,10,2,6,low);
    px(c,9,5,8,7,top);px(c,15,5,2,7,shade(top,-.3));if(royal){px(c,9,5,8,8,'#4a1e78');px(c,9,5,8,1,'#6a2a9a')}else px(c,10,6,6,4,'#8e6038');
    px(c,10,0,6,6,royal?'#3a2418':'#6a4224');px(c,9,0,8,2,hat);px(c,10,0,6,1,shade(hat,.3));
    if(royal){px(c,10,0,1,2,'#f2c94c');px(c,20,0,1,17,'#c9a03a');px(c,21,1,4,5,'#6a2a9a')}else{px(c,7,1,2,1,'#ffffff');px(c,17,1,2,1,'#ffffff')}
  }
})}
function drawRider(c,x,y,kind,col,dir,frame){ellipseShadow(c,x,y,dir==='left'||dir==='right'?9:6,2,.3);c.drawImage(riderSprite(kind,col,dir||'down',frame||0),Math.round(x-13),Math.round(y-27))}

// the overview map: shown while zoomed in, with a box for the part of the world on screen; tap or drag it to move there
let WMINI=null;
function updateWorldMini(){const box=document.getElementById('wmini');if(!box||!world.bg)return;const on=(world.zoom||1)>1.01;box.hidden=!on;if(!on)return;
  const cv=document.getElementById('wminiCv'),maxW=innerWidth<600?130:200,maxH=innerWidth<600?150:150,k=Math.min(maxW/world.W,maxH/world.H),w=Math.round(world.W*k),h=Math.round(world.H*k);
  if(!WMINI||WMINI.sig!==world.sig||WMINI.w!==w){cv.width=w;cv.height=h;cv.style.width=w+'px';cv.style.height=h+'px';const c=cv.getContext('2d');c.imageSmoothingEnabled=true;c.drawImage(world.bg,0,0,w,h);
    for(const T of world.towns){const img=iconSprite(T.icon,false),s=Math.max(k*1.6,.12);c.drawImage(img,T.cx*k-img.width*s/2,T.cy*k-img.height*s/2,img.width*s,img.height*s)}WMINI={sig:world.sig,w,k}}
  const hud=innerWidth<600?62:0,s=world.scale,vw=innerWidth/s,vh=(innerHeight-hud)/s,x0=clamp(world.pan.x-vw/2,0,world.W),y0=clamp(world.pan.y-vh/2,0,world.H),x1=clamp(world.pan.x+vw/2,0,world.W),y1=clamp(world.pan.y+vh/2,0,world.H);
  const r=document.getElementById('wview');r.style.left=Math.round(x0*k)+'px';r.style.top=Math.round(y0*k)+'px';r.style.width=Math.max(6,Math.round((x1-x0)*k))+'px';r.style.height=Math.max(6,Math.round((y1-y0)*k))+'px'}
{const box=document.getElementById('wmini');let drag=false;const go=e=>{if(!WMINI)return;const r=box.getBoundingClientRect();world.pan={x:(e.clientX-r.left-3)/WMINI.k,y:(e.clientY-r.top-3)/WMINI.k};sizeWorldBox()};
  box.addEventListener('pointerdown',e=>{drag=true;box.setPointerCapture(e.pointerId);go(e);e.stopPropagation()});box.addEventListener('pointermove',e=>{if(drag)go(e)});
  box.addEventListener('pointerup',()=>drag=false);box.addEventListener('pointercancel',()=>drag=false);box.addEventListener('wheel',e=>e.stopPropagation(),{passive:true})}

// the drawn extent of each town icon (its non-transparent pixels), so the hover frame hugs the picture rather than a guess
const ICONB={};
function iconBounds(kind){if(ICONB[kind])return ICONB[kind];const img=iconSprite(kind,false),w=img.width,h=img.height,d=img.getContext('2d').getImageData(0,0,w,h).data;let x0=w,y0=h,x1=-1,y1=-1;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(d[(y*w+x)*4+3]>40){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}
  return ICONB[kind]=x1<0?{x:0,y:0,w,h}:{x:x0,y:y0,w:x1-x0+1,h:y1-y0+1}}

// ===================== world-map town icons, drawn with the towns' own walls and roofs =====================
// Each icon is a tiny version of its town: the same wall material (stone courses, timber framing, logs, rock),
// the same roof (tile, thatch, shingle, slate) and roof colours from MATS, and the town's own feature.
// Animated overlays in drawWorld sit at fixed points: city flag (56,3), windmill hub (54,16), waterwheel hub (58,36),
// tower lantern (34,-3), cave torch (25,24), port boat (54,54). The icons keep those points.
function miniHouse(c,x,y,W,wallH,roofH,mk,roofCol,o={}){
  const M=MATS[mk]||MATS.village,kind=M.roof,R=roofCol||(M.roofs&&M.roofs[o.type||'cottage'])||defaultRoof(kind);
  ellipseShadow(c,x+W/2,y+roofH+wallH,W*.55,2,.22);
  wallFace(c,M,x,y+roofH,W,wallH,wallH,!!o.tower);
  roofGable(c,x+4,y,W-8,roofH,roofH,kind,R);
  const win=o.night?'#ffd86b':RAMP.slate[1],dy=y+roofH+wallH;
  px(c,x+Math.round(W/2)-2,dy-5,4,5,RAMP.wood[0]);px(c,x+Math.round(W/2)-2,dy-5,4,1,RAMP.wood[2]);
  if(W>=14){px(c,x+3,dy-wallH+3,3,3,RAMP.wood[1]);px(c,x+4,dy-wallH+4,1,1,win);px(c,x+W-6,dy-wallH+3,3,3,RAMP.wood[1]);px(c,x+W-5,dy-wallH+4,1,1,win)}
  if(o.chimney){px(c,x+W-8,y-3,3,6,RAMP.stone[2]);px(c,x+W-8,y-3,3,1,RAMP.stone[4])}
}
function miniKeep(c,x,y,mk,roofCol,night){const M=MATS[mk]||MATS.capital,S=RAMP.stone;
  wallFace(c,M,x,y+10,22,18,18,true);for(let k=0;k<4;k++)px(c,x+k*6,y+7,4,3,S[3]);
  for(const tx of [x-4,x+20]){wallFace(c,M,tx,y+6,6,22,22,true);roofCone(c,tx,y-4,6,10,10,M.roof,roofCol||'#c8453a')}
  px(c,x+8,y+20,6,8,'#2a1a10');px(c,x+8,y+20,6,1,S[1]);px(c,x+4,y+14,3,4,night?'#ffd86b':RAMP.slate[1]);px(c,x+15,y+14,3,4,night?'#ffd86b':RAMP.slate[1])}
function pineMini(c,x,y,k){const G=k?['#2e5a3a','#3e7a48','#5a9a5a']:['#2a5232','#386e42','#4e8e50'];for(let i=0;i<9;i++){const hw=Math.max(1,Math.round(5*(i/9)+1));px(c,x-hw,y+i,hw*2,1,i%3===0?G[2]:G[1]);px(c,x+hw-2,y+i,2,1,G[0])}px(c,x-1,y+9,2,3,RAMP.wood[0])}
function bushMini(c,x,y){px(c,x-4,y-3,8,4,RAMP.leaf[2]);px(c,x-3,y-4,6,1,RAMP.leaf[3]);px(c,x-4,y,8,1,RAMP.leaf[1])}

function townIcon(kind,c,night){
  const win=night?'#ffd86b':RAMP.slate[1];
  if(kind==='port'){ // timber houses with teal and red tile roofs above a plank quay
    px(c,0,50,80,22,'#3270c4');for(let k=0;k<9;k++)px(c,(k*11+5)%78,56+(k*7)%12,5,1,'#5a94dc');px(c,0,50,80,1,'#a8d0f8');
    for(let xx=4;xx<76;xx+=4){px(c,xx,46,4,4,RAMP.wood[2]);px(c,xx,46,1,4,RAMP.wood[1])}px(c,4,46,72,1,RAMP.wood[3]);
    for(const px0 of [10,34,58])px(c,px0,50,2,5,RAMP.wood[0]);
    miniHouse(c,4,14,20,14,12,'port','#2f8a8a',{night});miniHouse(c,26,8,22,18,14,'port','#c8453a',{night,chimney:1});miniHouse(c,50,16,20,14,12,'port','#2f8a8a',{night});
    for(const [bx,by] of [[30,40],[44,40]]){px(c,bx,by,7,5,RAMP.wood[2]);px(c,bx,by,7,1,RAMP.wood[3]);px(c,bx+1,by+2,5,1,RAMP.wood[1])}
    px(c,14,38,6,6,'#c0a070');px(c,14,38,6,1,'#e0c890'); // nets and crates on the quay
    px(c,62,26,1,24,RAMP.wood[0]);px(c,63,27,8,10,'#f4eee0');px(c,63,27,8,1,'#ffffff');px(c,62,26,6,1,'#c43a3a');return}
  if(kind==='village'){ // thatched cottages, a windmill and a hay field behind a picket fence
    for(let r=0;r<4;r++)for(let xx=6;xx<74;xx+=1)if((xx+r*3)%9<6)px(c,xx,56+r*3,1,2,r%2?'#d8b45a':'#c89a3a');
    miniHouse(c,2,22,20,14,12,'village','',{night,chimney:1});miniHouse(c,22,30,18,12,10,'village','',{night});miniHouse(c,6,40,16,10,8,'village','',{night});
    // windmill: hub at (54,16)
    const T=RAMP.plaster;for(let i=0;i<30;i++){const hw=Math.round(5+i*.12);px(c,54-hw,18+i,hw*2,1,i%6===0?T[1]:T[2]);px(c,54-hw,18+i,2,1,T[3]);px(c,54+hw-2,18+i,2,1,T[1])}
    for(let i=0;i<8;i++){const hw=Math.round(7-i*.8);px(c,54-hw,18-i,hw*2,1,i%2?RAMP.thatch[2]:RAMP.thatch[1])}
    px(c,52,38,4,10,RAMP.wood[0]);px(c,52,26,4,4,RAMP.wood[1]);px(c,53,27,2,2,win);
    for(let xx=0;xx<78;xx+=4){px(c,xx,66,1,5,'#f4eee0');px(c,xx,66,1,1,'#ffffff')}px(c,0,67,78,1,'#e8e0cc');px(c,0,69,78,1,'#e8e0cc');
    px(c,30,50,6,5,RAMP.thatch[2]);px(c,30,50,6,1,RAMP.thatch[3]);return}
  if(kind==='hamlet'){ // log cabins with shingle roofs on a riverbank, a waterwheel (hub 58,36) and a footbridge
    px(c,0,48,80,8,'#3270c4');px(c,0,48,80,1,'#a8d0f8');for(let k=0;k<6;k++)px(c,(k*13+3)%74,51+(k%2)*2,6,1,'#5a94dc');
    px(c,0,56,80,2,RAMP.dirt?RAMP.dirt[1]:'#8a6a40');
    miniHouse(c,4,14,22,16,12,'river','',{night,chimney:1});miniHouse(c,28,20,18,14,10,'river','#6a8a3a',{night});
    px(c,46,30,8,18,RAMP.wood[2]);px(c,46,30,2,18,RAMP.wood[3]);
    for(let a=0;a<12;a++){const t=a/12*Math.PI*2;px(c,Math.round(58+Math.cos(t)*9)-1,Math.round(36+Math.sin(t)*9)-1,3,3,a%2?RAMP.wood[1]:RAMP.wood[3])}
    px(c,57,35,3,3,RAMP.wood[0]);
    for(let xx=10;xx<34;xx+=3){px(c,xx,46,3,3,RAMP.wood[2]);px(c,xx,46,3,1,RAMP.wood[3])}px(c,10,45,24,1,RAMP.wood[0]);
    pineMini(c,70,10,1);pineMini(c,74,20,0);return}
  if(kind==='tower'){ // the mage tower with its cone, stone cottages with slate roofs, pines all round
    pineMini(c,4,26,0);pineMini(c,70,22,1);pineMini(c,62,40,0);
    const M=MATS.arcane;wallFace(c,M,26,10,16,50,50,true);for(let yy=16;yy<58;yy+=10){px(c,32,yy,4,5,RAMP.wood[1]);px(c,33,yy+1,2,3,night?'#c0a8ff':win)}
    roofCone(c,26,-4,16,16,16,'slate','#5a4a9a');px(c,32,-10,4,6,'#9a7af0');px(c,33,-9,1,3,'#e8dcff');
    miniHouse(c,4,40,18,14,10,'arcane','#4a6ab0',{night});miniHouse(c,46,44,18,12,10,'arcane','#5a4a9a',{night});
    for(const [gx,gy] of [[22,60],[60,62]]){px(c,gx,gy,2,3,'#7aff8a');px(c,gx+3,gy+1,2,2,'#c0a8ff')}return}
  if(kind==='cave'){ // a working mine: a rock outcrop with a timbered adit, the headframe and its wheel, rails, a cart of gold and a spoil heap
    const S=RAMP.stone,W=RAMP.wood,G=RAMP.gold;
    // the outcrop the adit is cut into (left), in the cave town's own rock
    // a craggy outcrop: a jagged skyline of rock, lit from the left, with ledges
    const top=xx=>{const t=(xx-4)/44,peak=Math.round(30*Math.sin(Math.PI*Math.min(1,Math.max(0,t)))**.7),j=(hash('cr'+(xx>>2))%7)-3;return 52-Math.max(0,peak+j)};
    for(let xx=4;xx<48;xx++){const t0=top(xx);for(let yy=t0;yy<54;yy++){const dd=yy-t0;px(c,xx,yy,1,1,dd<2?'#b0a490':xx<18?'#8a8070':xx<34?'#7a7064':'#655c52')}if(top(xx+1)>t0+1)px(c,xx,t0,1,top(xx+1)-t0,'#4e463e')}
    for(const [lx,ly,lw] of [[8,40,10],[34,36,10],[14,30,8]]){px(c,lx,ly,lw,1,'#4e463e');px(c,lx,ly-1,lw,1,'#b0a490')}
    for(let k=0;k<9;k++){const hh=hash('mn'+k),sx=8+hh%34,sy=18+(hh>>>6)%30;if(sy<top(sx)+3||sy<top(sx+2)+3)continue;px(c,sx,sy,3,2,'#5a5248');px(c,sx,sy,2,1,'#9a907e')}
    for(let k=0;k<4;k++){const hh=hash('og'+k),gx=10+hh%30,gy=22+(hh>>>5)%24;if(gy>top(gx)+3&&gy>top(gx+1)+3)px(c,gx,gy,2,2,G[3])}
    // the adit: dark mouth framed in heavy timber, lantern post beside it (torch flame at 25,24 sits just left of the frame)
    px(c,29,34,16,20,'#120c0a');px(c,31,36,12,18,'#1e1612');
    px(c,27,32,3,22,W[2]);px(c,27,32,1,22,W[3]);px(c,44,32,3,22,W[1]);px(c,26,30,22,3,W[2]);px(c,26,30,22,1,W[3]);px(c,26,33,22,1,W[0]);
    px(c,24,26,2,28,W[0]);
    // headframe over the shaft (right): two legs, a cross brace and the winding wheel
    px(c,54,12,2,40,W[1]);px(c,68,12,2,40,W[1]);px(c,54,12,1,40,W[3]);for(let i=0;i<14;i++){px(c,56+i,24+i,1,1,W[2]);px(c,67-i,24+i,1,1,W[2])}
    px(c,52,12,20,3,W[2]);px(c,52,12,20,1,W[3]);
    for(let a=0;a<24;a++){const t=a/24*Math.PI*2;px(c,Math.round(62+Math.cos(t)*6),Math.round(8+Math.sin(t)*6),1,1,RAMP.wood[0])}for(let a=0;a<4;a++){const t=a/4*Math.PI;for(let r=-5;r<=5;r++)px(c,Math.round(62+Math.cos(t)*r),Math.round(8+Math.sin(t)*r),1,1,RAMP.wood[1])}px(c,61,7,2,2,S[3]);
    px(c,62,14,1,26,'#3a3440');
    // winding hut under the frame
    miniHouse(c,52,36,20,12,8,'cave','#6a4a2e',{night});
    // rails out of the adit to a gold cart, and a spoil heap
    for(let xx=30;xx<76;xx+=4)px(c,xx,61,2,2,W[1]);px(c,30,60,46,1,'#8a8a96');px(c,30,63,46,1,'#8a8a96');
    px(c,46,53,13,7,'#5a5a66');px(c,46,53,13,1,'#8a8a96');px(c,47,58,11,1,'#3a3a44');px(c,48,50,4,3,G[3]);px(c,52,49,4,4,G[2]);px(c,55,51,3,2,G[4]);px(c,47,60,2,2,'#2a2a30');px(c,56,60,2,2,'#2a2a30');
    for(let yy=0;yy<7;yy++){const hw=Math.round(7*(yy+1)/7);px(c,70-hw,56+yy,hw*2,1,yy%2?'#6a6056':'#7a7064')}
    px(c,6,58,2,2,G[3]);return}
}
// the capital: houses inside a curtain wall, built and roofed like the capital's own town
function cityIcon(c,night){
  const x=8,y=10,W=96,H=76,S=RAMP.stone,win=night?'#ffd86b':RAMP.slate[1],roofs=MATS.capital.roofs;
  const cols=[roofs.keep,roofs.guild,roofs.shop,roofs.script,roofs.smithy,roofs.inn];
  // houses: back row, then front row either side of the square
  for(let k=0;k<5;k++)miniHouse(c,x+8+k*17,y+18,15,10,8,'capital',cols[k%cols.length],{night});
  for(const [k,hx] of [[0,x+8],[1,x+24],[2,x+58],[3,x+74]])miniHouse(c,hx,y+38,15,10,8,'capital',cols[(k+2)%cols.length],{night,chimney:k%2});
  // the keep at the heart, with the square and its fountain in front
  miniKeep(c,x+37,y+22,'capital',roofs.keep,night);
  px(c,x+40,y+52,16,8,RAMP.cobble?RAMP.cobble[2]:S[3]);disc(c,x+48,y+56,3,'#5a94dc');px(c,x+47,y+54,2,2,'#cfe6ff');
  // curtain wall with corner towers and the gate
  const wall=(wx,wy,ww,wh)=>{px(c,wx,wy,ww,wh,S[2]);for(let yy=wy;yy<wy+wh;yy+=4)px(c,wx,yy,ww,1,S[1]);px(c,wx,wy,ww,1,S[3])};
  wall(x,y+12,W,5);for(let xx=x;xx<x+W;xx+=6)px(c,xx,y+9,4,3,S[3]);
  wall(x,y+H-10,W,10);for(let xx=x;xx<x+W;xx+=6)px(c,xx,y+H-13,4,3,S[3]);
  wall(x,y+12,5,H-12);wall(x+W-5,y+12,5,H-12);
  for(const [tx,ty] of [[x-5,y+4],[x+W-9,y+4],[x-5,y+H-24],[x+W-9,y+H-24]]){px(c,tx,ty+6,14,22,S[3]);px(c,tx,ty+6,3,22,S[4]);px(c,tx+11,ty+6,3,22,S[1]);roofCone(c,tx,ty-6,14,12,12,'tile',roofs.keep);px(c,tx+5,ty+14,4,5,win)}
  px(c,x+W/2-7,y+H-10,14,10,'#1a1410');for(let k=0;k<4;k++)px(c,x+W/2-5+k*4,y+H-9,1,9,'#5a564e');
  px(c,x+48,y-7,1,10,'#3a3440');
}

// ===================== world-map light and life =====================
// Light is placed where it comes from: each town's own lit windows, torches at the gates, lamps along the roads,
// the riders' torches, the tent's bulbs and the volcano's lava. Things that glow are drawn again after the night
// shade (the glow queue), so they stay bright instead of being dimmed with the land.
const glowQ=[];
const WARM='255,196,110',FIRE='255,150,60',LAVA='255,90,40';
// the lit pixels of a town icon's night version, and the middle of each window, found once per icon
const GLOW={};const WIN='255,170,80';
function glowFor(kind){if(GLOW[kind])return GLOW[kind];const src=iconSprite(kind,true),w=src.width,h=src.height;
  const d=src.getContext('2d').getImageData(0,0,w,h).data,[cv,c]=mk(w,h),out=c.createImageData(w,h),cells=new Map();
  const lit=(r,g,b)=>(r===255&&g===216&&b===107)||(r===192&&g===168&&b===255)||(r===255&&g===242&&b===176);
  // like SNES night towns: panes are warm amber, not white-hot; the top row catches the lamp, the rest sits a shade deeper
  const isLit=i=>i>=0&&i<w*h&&d[i*4+3]>=200&&lit(d[i*4],d[i*4+1],d[i*4+2]);
  for(let i=0;i<w*h;i++){const r=d[i*4],g=d[i*4+1],b=d[i*4+2];if(d[i*4+3]<200||!lit(r,g,b))continue;const purple=r===192,top=!isLit(i-w),bot=!isLit(i+w);
    out.data.set(purple?(top?[214,190,255,255]:[150,118,230,255]):top?[255,214,128,255]:bot?[200,112,44,255]:[236,156,64,255],i*4);
    const x=i%w,y=(i/w)|0,k=((x/5)|0)+','+((y/5)|0),e=cells.get(k)||[0,0,0];e[0]+=x;e[1]+=y;e[2]++;cells.set(k,e)}
  c.putImageData(out,0,0);return GLOW[kind]={img:cv,pts:[...cells.values()].map(([x,y,n])=>[x/n,y/n])}}
// a torch on a post: dark and cold by day, burning at night
function torch(c,x,y,L,t,lights,k=0){px(c,x,y,2,9,RAMP.wood[0]);px(c,x-1,y-1,4,2,'#3a3440');
  if(!L.night){px(c,x,y-2,2,1,'#4a3a2a');return}
  const f=Math.floor(t*9+k)%3;lights.push([x+1,y-3,18,FIRE]);
  glowQ.push(c=>{px(c,x,y-3-f%2,2,3,'#ffd23c');px(c,x,y-4-f,1,1,'#fff2b0');px(c,x+1,y-2,1,2,'#ff7a2a')})}
// a hand-held torch for riders at night
function handTorch(c,x,y,L,t,lights){if(!L.night)return;px(c,x,y-6,1,7,RAMP.wood[1]);const f=Math.floor(t*10)%3;lights.push([x,y-8,20,FIRE]);
  glowQ.push(c=>{px(c,x-1,y-9-f%2,3,3,'#ffc43c');px(c,x,y-10-f,1,1,'#fff2b0')})}
// a road lamp
function roadLamp(c,x,y,L,lights){px(c,x,y-12,2,13,'#3a3440');px(c,x,y-13,5,1,'#3a3440');px(c,x+3,y-12,3,4,'#2a2430');
  if(!L.night){px(c,x+4,y-11,1,2,'#9aa4b8');return}lights.push([x+4,y-10,22,WARM]);glowQ.push(c=>{px(c,x+4,y-11,1,2,'#ffe08a');px(c,x+3,y-12,3,1,'#fff2b0')})}

// ---- the volcano ----
function volcanoSprite(){return cached('volcano2',84,64,c=>{const cx=42;
  for(let y=0;y<52;y++){const j=(hash('vj'+(y>>1))%3)-1,hw=Math.round(10+y*.66+(y>40?(y-40)*.9:0))+j;px(c,cx-hw,y+10,hw*2,1,'#3e3230');px(c,cx-hw,y+10,Math.max(2,Math.round(hw*.5)),1,'#5e4c48');px(c,cx-hw,y+10,2,1,'#7a6660');px(c,cx+Math.round(hw*.35),y+10,Math.round(hw*.65),1,'#261e1e');
    if(y%4===1)for(let k=0;k<4;k++){const hh=hash('vr'+y+k);px(c,cx-hw+2+hh%(hw*2-4),y+10,3,1,'#2a2020')}}
  for(const [gx,gy,gl] of [[cx-22,30,18],[cx+16,26,22]])for(let i=0;i<gl;i++)px(c,gx+Math.round(Math.sin(i*.4)*2),gy+i,1,1,'#1e1616'); // gullies
  px(c,cx-11,8,22,4,'#2e2424');px(c,cx-9,8,18,1,'#6a5652');px(c,cx-8,9,16,2,'#140c0a');
  for(let x=4;x<80;x++){const h=hash('va'+x)%3;px(c,x,61+(h?0:1),1,1,'#2e2626')}})}
// lava runs down from the crater: the same course every frame, brighter at night
const LAVA_RUNS=[[[39,11],[37,16],[36,21],[33,26],[31,31],[30,37],[27,43],[25,50]],[[45,11],[47,16],[49,22],[48,28],[51,34],[53,41]],[[42,11],[42,15],[41,19]]];
function drawVolcano(c,V,t,L,lights){lavaGlow(t,L,lights);const img=volcanoSprite(),ox=V.cx-42,oy=V.cy-40;ellipseShadow(c,V.cx,oy+62,40,3,.3);c.drawImage(img,ox,oy);
  const pulse=.5+.5*Math.sin(t*2.2),pool=pulse>.5?'#ffb040':'#ff7a24';
  const lava=c=>{px(c,ox+34,oy+9,16,2,pool);px(c,ox+38,oy+9,7,1,'#ffe08a');for(const run of LAVA_RUNS)run.forEach(([x,y],i)=>{const hot=(Math.floor(t*4)-i)%7===0;px(c,ox+x,oy+y,2,3,hot?'#ffd060':i%2?'#e0501e':'#ff7a24')})};
  if(L.night){lights.push([V.cx,oy+10,50,LAVA,.8],[ox+30,oy+36,24,LAVA,.6]);glowQ.push(lava)}else lava(c);
  for(let k=0;k<4;k++){const a=((t*.18+k/4)%1),sx=ox+42+Math.sin(a*5+k)*4+a*10,sy=oy+6-a*34,r=Math.round(2+a*4);c.fillStyle=`rgba(${L.night?'90,80,90':'150,140,140'},${.5*(1-a)})`;c.beginPath();c.arc(sx,sy,r,0,7);c.fill()}}

// ---- sheep ----
function drawSheep(c,s,t){const moving=s.mv>0,leg=moving?Math.floor(t*6+s.k)%2:0,x=Math.round(s.x),y=Math.round(s.y),f=s.face<0;
  px(c,x-3,y-1,6,1,'rgba(30,18,52,.25)');px(c,x-3,y+1-3,6,3,'#c8c4b8');px(c,x-3,y-3,6,2,'#f6f4ec');px(c,x-2,y-4,4,1,'#f6f4ec');
  px(c,f?x-5:x+3,y-3,2,2,'#3a3440');px(c,x-2,y+1,1,1+leg,'#3a3440');px(c,x+1,y+1,1,2-leg,'#3a3440')}
function stepSheep(dt,t){for(const s of world.sheep){if(s.carried||s.gone){if(s.gone&&t>s.back){s.gone=false;s.x=s.hx+(s.k%3-1)*10;s.y=s.hy}continue}if(s.target)continue;
  if(s.mv>0){const dx=s.tx-s.x,dy=s.ty-s.y,d=Math.hypot(dx,dy);if(d<.6){s.mv=0;s.wait=t+1.5+(hash('sw'+s.k+Math.floor(t))%40)/10}else{const v=Math.min(d,dt*5);s.x+=dx/d*v;s.y+=dy/d*v;s.face=dx<0?-1:1}}
  else if(t>s.wait){const h=hash('st'+s.k+Math.floor(t*3));s.tx=s.hx+(h%29)-14;s.ty=s.hy+((h>>>6)%17)-8;s.mv=1}}}

// ---- the dragon ----
// side view; dir 1 faces right, -1 left; wing frame 0 up, 1 down
function drawDragon(c,x,y,dir,frame,L,carry){const Z=2,p=(dx,dy,w,h,col)=>px(c,dir>0?Math.round(x+dx*Z):Math.round(x-(dx+w)*Z),Math.round(y+dy*Z),w*Z,h*Z,col);
  const R='#b0302a',Rd='#7a1e1e',Rl='#d8503a',G='#e8b04a',W='#8a2420',Wd='#4a1010';
  for(let i=0;i<9;i++)p(-6-i,-1+Math.round(i*.35),2,i<7?2:1,R);p(-17,0,3,3,Rd);p(-16,-1,1,1,Rl);       // tail and its spade
  p(-6,-3,12,5,R);p(-5,-3,10,1,Rl);p(-4,1,8,1,G);                                                     // body and belly
  p(5,-5,3,3,R);p(7,-8,5,4,R);p(8,-8,3,1,Rl);p(12,-7,3,2,R);p(13,-6,2,1,Rd);p(8,-9,1,1,'#f2e6c8');p(10,-9,1,1,'#f2e6c8'); // neck, head, snout, horns
  p(10,-7,1,1,L.night?'#3a1a10':'#ffe08a');
  if(L.night)glowQ.push(c=>px(c,dir>0?Math.round(x+20):Math.round(x-22),Math.round(y-14),2,2,'#ffe08a'));
  if(frame===0){for(let i=0;i<10;i++){const w=Math.max(1,9-i);p(-3+Math.round(i*.2),-4-i,w,1,i%3===2?Wd:W)}p(-4,-14,2,1,Wd)}
  else{for(let i=0;i<8;i++){const w=Math.max(1,9-i);p(-3,2+i,w,1,i%3===2?Wd:W)}}
  if(carry){p(-1,2,1,3,'#3a3440');p(2,2,1,3,'#3a3440')}else{p(-2,2,2,1,Rd);p(2,2,2,1,Rd)}}
function drawDragonAsleep(c,x,y,br){R='#b0302a',Rd='#7a1e1e',Rl='#d8503a',W='#8a2420',Wd='#5a1414',G='#e8b04a',BN='#f2e6c8';
  const ell=(cx,cy,rx,ry,col)=>{for(let j=-ry;j<=ry;j++){const hw=Math.round(rx*Math.sqrt(1-(j*j)/(ry*ry+.01)));px(c,Math.round(cx-hw),Math.round(cy+j),hw*2,1,col)}};
  // the tail wraps round the front of the body and ends under the chin in a spade
  for(let i=0;i<=22;i++){const a=Math.PI*(.95-i/22*.95),tx=x-4+Math.cos(a)*19,ty=y-1+Math.sin(a)*4;px(c,Math.round(tx)-1,Math.round(ty)-1,3,3,i%5===4?Rd:R);px(c,Math.round(tx)-1,Math.round(ty)-1,3,1,Rl)}
  px(c,x+14,y,5,3,Rd);px(c,x+16,y-1,2,1,Rd);
  // the body, coiled and rising with each breath; gold belly along its lower edge
  ell(x-4,y-8-br,15,8+br,R);ell(x-8,y-12-br,8,3,Rl);px(c,x-16,y-2,24,2,G);px(c,x-16,y-1,24,1,'#b07a2a');
  // the folded wing over its back, with its finger bones
  ell(x-5,y-12-br,11,5,W);for(let k=0;k<4;k++){const bx=x-13+k*5;for(let i=0;i<5;i++)px(c,bx+i,y-15-br+Math.round(i*.6),1,1,Wd)}
  for(let k=0;k<6;k++)px(c,x-16+k*5,y-18-br+Math.abs(k-2),2,2,Rd);     // spines along the ridge of the back
  // the head resting low on the tail: snout forward, eye shut, horns swept back
  ell(x+15,y-5,7,4,R);px(c,x+19,y-6,6,4,R);px(c,x+19,y-6,6,1,Rl);px(c,x+24,y-5,1,1,'#2a1210');px(c,x+13,y-6,4,1,'#2a1210');px(c,x+13,y-5,4,1,Rl);
  px(c,x+9,y-10,2,2,BN);px(c,x+7,y-12,2,2,BN);px(c,x+12,y-10,2,2,BN);px(c,x+11,y-12,1,2,BN);
}
// The dragon sleeps until someone taps it. Then: it stirs, rears up and roars fire (the map shakes), launches into the air,
// flies slowly to a sheep, circles it, swoops and grabs it, carries it home, lands, eats it and settles back to sleep.
const DK=1.25; // drawn a little larger than the art so it reads from the whole map
const DPH={stir:1.4,roar:2.2,takeoff:1.8,circle:6.5,swoop:1.6,land:1.6,eat:4.2,settle:1.4};
function dragonNest(){const V=world.volcano,N=world.nest||{x:V.cx+52,y:V.cy+24};return {x:N.x,y:N.y}}
function dragonAt(e){const D=world.dragon;if(!D||!world.volcano||D.ph)return false;const r=world.cv.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*world.W,y=(e.clientY-r.top)/r.height*world.H,P=dragonNest();return x>P.x-38&&x<P.x+40&&y>P.y-46&&y<P.y+8}
function wakeDragon(){const D=world.dragon;if(!D||D.ph)return;achieve('dragon');const now=(performance.now()-T0)/1000;D.ph='stir';D.t0=now;D.s=null;dsfx('grumble',1,dragonNest().x)}
function dsfx(name,v,x){if(typeof sfx==='function'&&!active)sfx(name,v,x==null?0:clamp((x/world.W)*2-1,-1,1)*.7)}
function dragonPhase(D,ph,t){D.ph=ph;D.t0=t;D.from=D.pos?{...D.pos}:null}
function stepDragon(c,t,L,lights){const D=world.dragon,V=world.volcano;if(!D||!V)return;const P=dragonNest();
  if(window.__dragonSoon&&!D.tested&&t>2){D.tested=true;wakeDragon()}
  const e=t-(D.t0||0),box=document.getElementById('mapBox');
  const perch=(img,dy=0)=>{ellipseShadow(c,P.x-4,P.y+1,28,3,.3);drawLit(c,L,g=>g.drawImage(img,Math.round(P.x-36),Math.round(P.y-44+dy),73,50))};
  // ---- on the nest ----
  if(!D.ph||D.ph==='stir'||D.ph==='roar'||D.ph==='eat'||D.ph==='settle'){
    if(!D.ph&&D.glare&&t<D.glare){perch(dragonAwakeNew(false));bubbleQ.push([P.x+30,P.y-50,'!']);return}
    if(!D.ph){const br=Math.floor(t/1.6)%2;perch(dragonSleepSprite(br));
      if(Math.floor(t/1.6)%3===0){const a=(t%1.6)/1.6;c.fillStyle=`rgba(200,190,190,${.5*(1-a)})`;c.fillRect(Math.round(P.x+35+a*6),Math.round(P.y-8-a*6),2,2)}
      if(Math.floor(t/2.5)%3===0)bubbleQ.push([P.x+28,P.y-20,'z']);return}
    if(D.ph==='stir'){const k=Math.floor(e*6)%2;perch(e<.7?dragonSleepNew(k,true):dragonAwakeNew(false),e<.7?k:0);if(e>.7)bubbleQ.push([P.x+30,P.y-50,'!']);if(e>.7&&!D.eyed){D.eyed=true;dsfx('grumble',.7,P.x)}if(e>DPH.stir){D.eyed=false;dragonPhase(D,'roar',t);dsfx('roar',1,P.x);dsfx('thunder',.5,P.x)}return}
    if(D.ph==='roar'){const open=e>.25&&e<DPH.roar-.2;perch(dragonAwakeNew(open),open?-1:0);
      // fire pours from its jaws, and the land trembles
      if(open){const mx=P.x+33,my=P.y-33,n=16;if(L.night||true)lights.push([mx+30,my,70,FIRE,1]);
        glowQ.push(g=>{for(let i=0;i<n*2;i++){const f=((e*2.6+i/(n*2))%1),x=mx+f*66,y=my-f*12+Math.sin(i*2.3+e*20)*f*11,r=Math.round(3+f*7);g.fillStyle=f<.25?'#fff2b0':f<.55?'#ffd23c':f<.8?'#ff7a24':'rgba(160,60,30,.6)';g.fillRect(Math.round(x-r/2),Math.round(y-r/2),r,r)}})
        if(box)box.style.transform=`translate(${Math.round(Math.sin(t*90)*2)}px,${Math.round(Math.cos(t*73)*2)}px)`}
      else if(box)box.style.transform='';
      if(e>DPH.roar){if(box)box.style.transform='';
        const free=(world.sheep||[]).filter(s=>!s.gone&&!s.carried);let s;if(free.length){s=free[hash('dp'+Math.floor(t*10))%free.length];s.target=true}
        else{const h=hash('dl'+Math.floor(t));s={fake:true,x:clamp(P.x+(h%400)-200,40,world.W-40),y:clamp(P.y+((h>>>9)%240)-80,40,world.H-40)}}
        D.s=s;D.pos={x:P.x,y:P.y,h:0};dragonPhase(D,'takeoff',t);dsfx('whoosh',1,P.x)}return}
    if(D.ph==='eat'){const chew=Math.floor(e*3)%2,k=clamp(e/DPH.eat);perch(dragonAwakeNew(chew===1,true),chew);
      if(D.s&&!D.s.fake&&k<.75){const sh={...D.s,x:P.x+30,y:P.y-2,mv:0};drawLit(c,L,g=>{g.save();g.globalAlpha=1-k*1.2;drawSheep(g,sh,t);g.restore()})}
      if(chew&&Math.floor(e*6)%2===0)for(let i=0;i<3;i++){const h=hash('wl'+Math.floor(e*6)+i);px(c,P.x+26+h%12,P.y-10-(h>>>4)%10,2,2,'#f6f4ec')}
      if(Math.floor(e*3)!==D.lastChew){D.lastChew=Math.floor(e*3);if(chew)dsfx('chomp',.8,P.x);if(D.lastChew===2&&D.s&&!D.s.fake)dsfx('bleat',.35,P.x)}
      if(e>DPH.eat){dsfx('gulp',1,P.x);if(D.s&&!D.s.fake)eggSheepEaten();if(D.s&&!D.s.fake){D.s.carried=false;D.s.target=false;D.s.gone=true;D.s.back=t+20}dragonPhase(D,'settle',t)}return}
    if(D.ph==='settle'){perch(e<.7?dragonAwakeNew(false):dragonSleepNew(0,e<1.1));if(e>DPH.settle){D.ph=null;D.s=null;dsfx('snore',1,P.x)}return}}
  // ---- in the air ----
  const S=D.s,from=D.from||{x:P.x,y:P.y,h:0};let g={x:from.x,y:from.y},h=from.h||0,fr=2,flap=2.2;
  const go=(ph)=>{D.pos={x:g.x,y:g.y,h};dragonPhase(D,ph,t)};
  if(D.ph==='takeoff'){const k=clamp(e/DPH.takeoff);g={x:P.x+k*6,y:P.y};h=Math.round(56*k*k*(3-2*k));flap=6;fr=[0,2,1,2][Math.floor(e*flap)%4];
    if(e<.6)for(let i=0;i<5;i++){const a=i/5*Math.PI*2+e*4;px(c,P.x+Math.cos(a)*(10+e*30),P.y+2+Math.sin(a)*3,2,2,'rgba(120,110,100,.6)')}
    if(e>DPH.takeoff)go('fly')}
  else if(D.ph==='fly'){const C={x:S.x-46,y:S.y},d=Math.hypot(C.x-from.x,C.y-from.y),dur=clamp(d/14,4,12),k=clamp(e/dur),u=k*k*(3-2*k);g={x:from.x+(C.x-from.x)*u,y:from.y+(C.y-from.y)*u};h=56+Math.sin(e*.8)*3;
    const gl=e>4&&Math.sin((e-4)*.6)>.55;fr=gl?2:[0,2,1,2][Math.floor(e*2.2)%4];if(e>dur)go('circle')}
  else if(D.ph==='circle'){const turns=1.25,k=clamp(e/DPH.circle),a=Math.PI+k*turns*Math.PI*2;g={x:S.x+Math.cos(a)*46,y:S.y+Math.sin(a)*20};h=54-k*10;fr=Math.sin(e*1.2)>.4?2:[0,2,1,2][Math.floor(e*2.2)%4];
    if(e>DPH.circle){go('swoop');dsfx('swoop',1,g.x)}}
  else if(D.ph==='swoop'){const k=clamp(e/DPH.swoop),u=k*k;g={x:from.x+(S.x-from.x)*u,y:from.y+(S.y-from.y)*u};h=(from.h||44)*(1-u)+2*u;fr=0;
    if(e>DPH.swoop){if(!S.fake){S.carried=true;dsfx('bleat',1,g.x)}go('return')}}
  else if(D.ph==='return'){const d=Math.hypot(P.x-from.x,P.y-from.y),dur=clamp(d/13,4,12),k=clamp(e/dur),u=k*k*(3-2*k);g={x:from.x+(P.x-from.x)*u,y:from.y+(P.y-from.y)*u};h=Math.min(52,2+e*24)*(k<.85?1:(1-k)/.15*.6+.4);
    fr=[0,2,1,2][Math.floor(e*(k<.15?4:2.4))%4];if(e>dur)go('land')}
  else if(D.ph==='land'){const k=clamp(e/DPH.land);g={x:from.x+(P.x-from.x)*k,y:from.y+(P.y-from.y)*k};h=(from.h||20)*(1-k);fr=[0,2,1,2][Math.floor(e*5)%4];
    if(e>DPH.land){if(S&&!S.fake){S.carried=false;S.x=P.x+30;S.y=P.y}const sk=D.sulk;D.sulk=false;dragonPhase(D,sk?'settle':'eat',t);return}}
  if(fr===1&&D.lfr!==1)dsfx('flap',D.ph==='takeoff'||D.ph==='land'?1:.6,g.x);D.lfr=fr;
  if(S&&S.carried&&D.ph==='return'&&Math.floor(e/2.2)!==D.lb){D.lb=Math.floor(e/2.2);if(D.lb>0)dsfx('bleat',.5,g.x)}
  const prev=D.lx??g.x,dir=Math.abs(g.x-prev)<.05?(D.dir||1):g.x>prev?1:-1;D.lx=g.x;D.dir=dir;
  const bob=fr===2?0:[-1,0,1,0][Math.floor(t*2.2)%4],dy=g.y-h-6+bob;
  ellipseShadow(c,g.x,g.y,18,3,.22);
  const carry=S&&S.carried;if(carry){S.x=g.x+dir*7;S.y=dy+16;const sh=S;drawLit(c,L,g2=>drawSheep(g2,sh,t))}
  {const img=dragonFlySprite(dir,fr,carry),gx=g.x;drawLit(c,L,g2=>g2.drawImage(img,Math.round(gx-(dir>0?33:40)),Math.round(dy-29),73,53))}}
// ---- the tent's bulbs: dull glass by day; at night each burns steadily in its own colour with a faint halo ----
function tentBulbs(c,ox,oy,t,L,lights){// one string of bulbs: from the peak down the left side, along the hem, and back up the right side
  const Ys=[3,7,11,15,19],hw=y=>Math.round(2+y*1.05),pts=[[25,5]];for(const yy of Ys)pts.push([26-hw(yy)-1,yy+4]);for(let x=9;x<45;x+=5)pts.push([x,27]);for(const yy of [...Ys].reverse())pts.push([26+hw(yy),yy+4]);
  const cols=[['#ff5a4a','#ffd0c8','rgba(255,90,80,.28)'],['#4ab8ff','#d8f0ff','rgba(80,180,255,.28)'],['#ffd23c','#fff4c0','rgba(255,210,60,.28)'],['#6ae85a','#e0ffd8','rgba(110,235,90,.28)']]; // red, blue, yellow, green
  if(L.night)lights.push([ox+26,oy+20,40,'255,200,140',.5]);
  pts.forEach(([x,y],i)=>{const X=ox+x,Y=oy+y;if(!L.night){px(c,X,Y,2,2,'#4a4038');px(c,X,Y,1,1,'#c8c0b0');return}const [b,hi,halo]=cols[i%cols.length],on=(i+Math.floor(t*2))%2===0;if(!on){glowQ.push(c=>{px(c,X,Y,2,2,'#5a4a40');px(c,X,Y,1,1,'#7a6a5a')});return}
    glowQ.push(c=>{px(c,X-1,Y,1,2,halo);px(c,X+2,Y,1,2,halo);px(c,X,Y-1,2,1,halo);px(c,X,Y+2,2,1,halo);px(c,X,Y,2,2,b);px(c,X,Y,1,1,hi)})})}

// ---- the volcanic land: scorched ground, darkened peaks, ash and lava flows running out from the cone ----
// painted once onto the map, so it costs nothing per frame; the flows are remembered so they can glow at night
function paintVolcanic(c){const V=world.volcano;if(!V)return;const RX=150,RY=110,x0=Math.max(0,V.cx-RX),y0=Math.max(0,V.cy-RY),w=Math.min(world.W,V.cx+RX)-x0,h=Math.min(world.H,V.cy+RY)-y0;
  const img=c.getImageData(x0,y0,w,h),D=img.data,T=world.T,nz=noiseGrid('scorch',world.W,world.H,22),nf=noiseGrid('scorchf',world.W,world.H,6);
  const inTown=(X,Y)=>world.towns.some(t=>X>t.x-6&&X<t.x+t.w+6&&Y>t.y-6&&Y<t.y+t.h+10);
  const heat=(X,Y)=>{const r=Math.hypot((X-V.cx)/RX,(Y-V.cy)/RY);return clamp((1-r)*1.9+(nz(X,Y)-.5)*.9)};
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const X=x0+x,Y=y0+y,t=T[Math.floor(Y/TS)]?.[Math.floor(X/TS)];if(t===undefined||t<=SHAL||t===RIVER||inTown(X,Y))continue;const hv=heat(X,Y);if(hv<.3)continue;
    // a crisp edge with a two-pixel dither band, as a 16-bit tileset would draw it
    const k=hv>=.42?1:((X>>1)^(Y>>1))&1?.85:0;if(!k)continue;const i=(y*w+x)*4,lum=(D[i]*.3+D[i+1]*.59+D[i+2]*.11),f=nf(X,Y);
    // ash grey-brown, keeping the shape's light and shade so peaks and slopes still read
    const ar=lum*.55+28,ag=lum*.42+20,ab=lum*.4+22;D[i]=D[i]*(1-k)+ar*k;D[i+1]=D[i+1]*(1-k)+ag*k;D[i+2]=D[i+2]*(1-k)+ab*k;
    if(k>.6&&f>.82){D[i]=D[i]*.7;D[i+1]=D[i+1]*.65;D[i+2]=D[i+2]*.65}else if(k>.5&&f<.06){D[i]=Math.min(255,D[i]+40);D[i+1]+=18}}
  c.putImageData(img,x0,y0);
  // lava flows: they leave the foot of the cone and wander downhill, cooling to a dark crust at the edges and the ends
  const flows=[];world.lavaPx=flows;const n=4;
  for(let k=0;k<n;k++){let a=Math.PI*(.2+.6*k/(n-1))+(hash('lf'+k)%100)/100*.3-.15,x=V.cx+Math.cos(a)*16,y=V.cy+14+Math.sin(a)*3,len=60+hash('ll'+k)%50;const pts=[];
    for(let s=0;s<len;s++){a+=((hash('lw'+k+','+(s>>3))%100)/100-.5)*.18;x+=Math.cos(a)*.85;y+=Math.abs(Math.sin(a))*.55+.3;const tx=Math.floor(x/TS),ty=Math.floor(y/TS),t=T[ty]?.[tx];
      if(t===undefined||t<=SHAL||t===RIVER||world.road[ty]?.[tx]||inTown(x,y)||heat(x,y)<.45)break;pts.push([Math.round(x),Math.round(y),s])}
    const L=pts.length;
    // crust first, then the molten channel on top: wide and bright near the cone, narrowing and cooling to dull red at the snout
    for(const [x,y,s] of pts){const cool=s/L,ww=Math.max(1,Math.round(3-cool*1.6));px(c,x-ww-1,y-1,ww*2+2,3,'#24180f')}
    for(const [x,y,s] of pts){const cool=s/L,ww=Math.max(1,Math.round(3-cool*1.6));px(c,x-ww,y,ww*2,1,cool>.85?'#6a2a18':cool>.6?'#b8381a':'#e0501e');if(cool<.6)px(c,x-ww+1,y,Math.max(1,ww*2-2),1,'#ff8a2a');
      if(s%2===0)flows.push([x-ww,y,ww*2,cool,k,s])}
    if(L){const [ex,ey]=pts[L-1];px(c,ex-4,ey,8,3,'#24180f');px(c,ex-3,ey,6,2,'#6a2a18')}}
  // a scatter of black rocks and steam vents
  for(let k=0;k<24;k++){const hh=hash('vrk'+k),X=V.cx-RX*.8+(hh%1000)/1000*RX*1.6,Y=V.cy-RY*.6+((hh>>>10)%1000)/1000*RY*1.3;if(heat(X,Y)<.4||inTown(X,Y))continue;const t=T[Math.floor(Y/TS)]?.[Math.floor(X/TS)];if(!(t>SHAL)||t===RIVER)continue;
    px(c,X,Y,4,3,'#1e1614');px(c,X,Y,3,1,'#4a3e3a')}
  // the nest: a rocky shelf beside the cone with a ring of charred branches, bones and two eggs
  const N={x:V.cx+52,y:V.cy+24};world.nest=N;
  for(let y=0;y<10;y++){const hw=Math.round(22-y*.6);px(c,N.x-hw,N.y-4+y,hw*2,1,y<2?'#6a5a52':y%3?'#3a2e2a':'#2a201e')}
  for(let k=0;k<26;k++){const a=k/26*Math.PI*2,rx=Math.round(N.x+Math.cos(a)*17),ry=Math.round(N.y-4+Math.sin(a)*5);px(c,rx-2,ry,5,1,k%3?'#4a3020':'#6a4a2e');px(c,rx,ry-1,2,1,'#2a1a10')}
  px(c,N.x-12,N.y-3,6,1,'#e8e0cc');px(c,N.x-12,N.y-4,1,3,'#e8e0cc');px(c,N.x-7,N.y-4,1,3,'#e8e0cc');px(c,N.x+11,N.y-2,5,1,'#e8e0cc');
  for(const [ex,col] of [[-3,'#c8b8e8'],[3,'#a8d8b8']]){px(c,N.x+ex-1,N.y-9,4,5,col);px(c,N.x+ex,N.y-10,2,1,col);px(c,N.x+ex,N.y-9,1,2,'#ffffff')}}
// the lava flows glow at night and carry slow pulses of heat down their length
function lavaGlow(t,L,lights){const F=world.lavaPx;if(!F||!F.length)return;const ph=t*6;
  if(L.night){for(let i=0;i<F.length;i+=10)lights.push([F[i][0]+F[i][2]/2,F[i][1],16,LAVA,.55]);
    glowQ.push(c=>{for(const [x,y,w,cool,k,s] of F){const hot=((s/2-ph+k*9)%24+24)%24<2;px(c,x,y,w,1,hot?'#ffd060':cool<.25?'#ff8a2a':'#e0501e')}})}
  else glowQ.push(c=>{for(const [x,y,w,cool,k,s] of F){if(((s/2-ph+k*9)%24+24)%24<2)px(c,x,y,w,1,'#ffb040')}})}

// the dragon as outlined sprites (one per breath, wing beat and facing), so it reads clearly like any 16-bit sprite;
// at night it is drawn after the shade with its own slightly deeper colours, so it never sinks into the dark ash
const dragonSleepSprite=br=>dragonSleepNew(br);
const dragonFlySprite=(dir,fr,carry)=>{const src=dragonFlyNew(fr,carry);if(dir>0)return src;return cached('dflyL-'+fr+(carry?1:0),58,42,c=>{c.save();c.scale(-1,1);c.drawImage(src,-58,0);c.restore()},false)};
function drawLit(c,L,fn){if(!L.night){fn(c);return}glowQ.push(g=>{g.save();g.filter='brightness(.78) saturate(.9)';fn(g);g.restore()})}

// ===================== the dragon, built like an SNES sprite =====================
// Shapes are laid down as materials (scales, belly, wing, horn), then each material is shaded from its own ramp,
// lit from the top left (light on upper-left edges, shadow on lower-right ones, hue-shifted towards purple in the dark
// and orange in the light), and the whole silhouette gets a one-pixel dark outline. Details (eye, teeth, belly bands,
// wing bones, spines) go on last.
const DRAMP={body:['#4a1220','#7a1c24','#b02a26','#d84a2e','#f27a3e'],belly:['#6a3a1a','#a8702a','#e0a840','#f6d070','#fff0a8'],
  wing:['#2e0a24','#5a1a40','#86285a','#b04274','#cc5a88'],far:['#24081c','#3e1230','#5a1a44','#702456','#7e2c60'],horn:['#6a5a44','#b0a080','#e0d4b4','#f6eedc','#ffffff']};DRAMP.head=DRAMP.body;DRAMP.tail=DRAMP.body;
function dragonSprite(key,W,H,build){return cached(key,W,H,c=>{const M=new Array(W*H).fill(null),at=(x,y)=>x>=0&&y>=0&&x<W&&y<H?M[y*W+x]:null;
  const set=(x,y,m)=>{x=Math.round(x);y=Math.round(y);if(x>=0&&y>=0&&x<W&&y<H)M[y*W+x]=m};
  const S={ell:(cx,cy,rx,ry,m)=>{for(let y=Math.floor(cy-ry);y<=cy+ry;y++)for(let x=Math.floor(cx-rx);x<=cx+rx;x++)if(((x-cx)/rx)**2+((y-cy)/ry)**2<=1)set(x,y,m)},
    line:(pts,r0,r1,m)=>{let L=0;const seg=[];for(let i=1;i<pts.length;i++){const d=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);seg.push(d);L+=d}let acc=0;
      for(let i=1;i<pts.length;i++){const [ax,ay]=pts[i-1],[bx,by]=pts[i];for(let k=0;k<=seg[i-1];k+=.5){const f=(acc+k)/L,r=r0+(r1-r0)*f,x=ax+(bx-ax)*k/seg[i-1],y=ay+(by-ay)*k/seg[i-1];S.ell(x,y,Math.max(.6,r),Math.max(.6,r),m)}acc+=seg[i-1]}},
    poly:(P,m)=>{const ys=P.map(p=>p[1]);for(let y=Math.floor(Math.min(...ys));y<=Math.max(...ys);y++){const xs=[];for(let i=0;i<P.length;i++){const [x1,y1]=P[i],[x2,y2]=P[(i+1)%P.length];if((y1<=y&&y2>y)||(y2<=y&&y1>y))xs.push(x1+(y-y1)/(y2-y1)*(x2-x1))}xs.sort((a,b)=>a-b);for(let k=0;k+1<xs.length;k+=2)for(let x=Math.ceil(xs[k]);x<=xs[k+1];x++)set(x,y,m)}}};
  const det=build(S)||[];
  // shade every material from its ramp
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const m=at(x,y);if(!m)continue;const R=DRAMP[m];let i=2;const same=(dx,dy)=>at(x+dx,y+dy)===m;
    const up=!same(0,-1),lf=!same(-1,0),dn=!same(0,1),rt=!same(1,0);if(up&&lf)i=4;else if(up||lf)i=3;else if(dn&&rt)i=0;else if(dn||rt)i=1;
    if(i===2&&!same(0,2))i=1;if(i===2&&!same(-1,-2)&&!same(0,-2))i=3;px(c,x,y,1,1,R[i])}
  // outline the whole silhouette
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){if(at(x,y))continue;if(at(x-1,y)||at(x+1,y)||at(x,y-1)||at(x,y+1))px(c,x,y,1,1,'#1e0a10')}
  for(const [x,y,w,h,col] of det)px(c,x,y,w,h,col)},false)}
// flying, facing right; frame 0 wings raised, frame 1 wings beating down
function dragonFlyNew(fr,carry){return dragonSprite('dfly2-'+fr+(carry?1:0),58,42,S=>{const up=fr===0;
  if(fr===0)S.poly([[27,18],[33,17],[38,4],[35,6],[32,8]],'far');else if(fr===1)S.poly([[27,19],[33,19],[37,30],[33,28],[30,27]],'far');else S.poly([[27,18],[33,18],[40,13],[36,13],[31,15]],'far');
  // tail: thick at the root, coiling up to a spade
  S.line([[17,25],[11,28],[5,27],[2,23]],3.6,1,'body');S.poly([[0,23],[3,18],[5,22]],'body');
  S.ell(26,23,10,6,'body');S.ell(27,26.5,8,2.6,'belly');
  S.line([[33,21],[38,16],[42,12]],4.2,3,'body');S.ell(45,11,6,4.6,'head');S.ell(51.5,12.5,4.4,2.6,'head');S.line([[46,15.5],[53,15.5]],1,1,'head');
  S.line([[30,28],[32,31],[34,33]],1.8,1.2,'body');S.line([[21,28],[20,32],[21,34]],2,1.3,'body');
  S.line([[42,8],[38,4],[35,2]],1.3,.6,'horn');S.line([[45,7],[43,3],[41,1]],1.1,.5,'horn');
  if(up)S.poly([[22,19],[30,18],[27,5],[24,2],[20,7],[16,1],[12,8],[7,3],[8,11],[13,16]],'wing');
  else if(fr===1)S.poly([[22,20],[30,19],[28,33],[23,39],[20,33],[14,37],[13,30],[7,32],[11,24]],'wing');
  else S.poly([[22,19],[30,18],[25,11],[19,8],[15,12],[10,9],[8,14],[3,13],[7,18],[14,20]],'wing');
  const d=[];const bone=(x0,y0,x1,y1)=>{const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0));for(let k=0;k<=n;k++)d.push([Math.round(x0+(x1-x0)*k/n),Math.round(y0+(y1-y0)*k/n),1,1,k<n*.5?'#e8a0b8':'#c8708e'])};
  if(up){bone(27,17,24,3);bone(26,17,16,2);bone(25,17,8,4)}else if(fr===1){bone(27,20,23,38);bone(26,20,14,36);bone(25,20,8,31)}else{bone(27,18,19,8);bone(26,18,10,9);bone(25,18,3,13)}
  for(let k=0;k<4;k++)d.push([22+k*3,27,1,2,'#9a6420']);                       // belly bands
  for(const [sx,sy] of [[19,16],[23,16],[30,16],[35,14],[39,10]])d.push([sx,sy,2,1,'#f6eedc'],[sx,sy-1,1,1,'#f6eedc']); // spines
  d.push([46,9,2,2,'#ffe060'],[47,10,1,1,'#2a0e12'],[45,8,4,1,'#4a1220']);      // eye and brow
  d.push([54,11,1,1,'#2a0e12'],[49,15,1,1,'#ffffff'],[52,15,1,1,'#ffffff']);     // nostril and teeth
  d.push([33,34,2,1,'#f6eedc'],[20,35,2,1,'#f6eedc']);                          // claws
  return d})}
// asleep: coiled on the nest, tail round the front, head on the tail, wing folded on the back; br is the breath
// asleep, perched on the nest: crouched on its haunches, wings folded upright, neck curved down so its head rests by its feet
function dragonSleepNew(br,eye){return dragonSprite('dslp5-'+br+(eye?'e':''),58,40,S=>{
  S.poly([[31,18],[27,15-br*.5],[19,17],[23,19]],'far');
  S.line([[16,28],[9,32],[4,33],[1,30]],3.4,1,'tail');S.poly([[0,30],[2,25],[4,29]],'tail');
  S.ell(26,26,11,7+br*.5,'body');S.ell(28,30,8,2.4,'belly');
  S.ell(19,30,5.5,4.5,'tail');S.line([[16,34],[24,35]],1.3,1.3,'tail');
  S.line([[34,29],[35,35]],1.8,1.5,'body');
  S.line([[34,23],[39,19],[43,22],[45,25]],3.8,3,'head');S.ell(47,28,5.5,4,'head');S.ell(53,29.5,4,2.4,'head');
  S.line([[45,24],[41,20],[38,18]],1.3,.6,'horn');S.line([[48,24],[46,20],[44,18]],1.1,.5,'horn');
  // the wing folded back along the body: raised at the wrist, its scalloped edge lying down the flank towards the tail
  S.poly([[34,22],[31,16-br*.5],[25,16-br*.5],[17,19],[10,23],[14,25],[18,23],[22,25],[26,23],[30,25]],'wing');
  const d=[],bone=(x0,y0,x1,y1)=>{const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0));for(let k=0;k<=n;k++)d.push([Math.round(x0+(x1-x0)*k/n),Math.round(y0+(y1-y0)*k/n),1,1,k<n*.5?'#e8a0b8':'#c8708e'])};
  bone(33,21,31,17);bone(31,17,11,23);bone(30,17,18,23);bone(29,18,25,23);
  d.push([30,15-Math.round(br*.5),2,1,'#f6eedc']);                                // the wing claw at the wrist
  for(const [sx,sy] of [[14,20],[19,18],[36,20],[39,17]])d.push([sx,sy,2,1,'#f6eedc'],[sx,sy-1,1,1,'#f6eedc']);
  for(let k=0;k<4;k++)d.push([23+k*3,30,1,2,'#9a6420']);
  d.push(eye?[47,26,2,2,'#ffe060']:[46,27,4,1,'#2a0e12'],[45,26,1,1,'#2a0e12'],[50,26,1,1,'#2a0e12'],[56,29,1,1,'#2a0e12'],[35,35,2,1,'#f6eedc'],[16,35,2,1,'#f6eedc'],[22,35,2,1,'#f6eedc']);
  return d})}

function dragonAwakeNew(open,low){return dragonSprite('dawk-'+(open?1:0)+(low?1:0),62,40,S=>{
  S.poly([[31,18],[27,14],[19,17],[23,19]],'far');
  S.line([[16,28],[9,32],[4,33],[1,30]],3.4,1,'tail');S.poly([[0,30],[2,25],[4,29]],'tail');
  S.ell(26,26,11,7.5,'body');S.ell(28,30,8,2.4,'belly');
  S.ell(19,30,5.5,4.5,'tail');S.line([[16,34],[24,35]],1.3,1.3,'tail');S.line([[34,29],[35,35]],1.8,1.5,'body');
  const hy=low?26:11,hx=low?47:46;
  if(low)S.line([[34,23],[39,19],[43,22],[45,25]],3.8,3,'head');else S.line([[34,24],[37,18],[41,13],[43,11]],3.9,3.2,'head');
  S.ell(hx,hy+1,5.5,4,'head');S.ell(hx+6.5,hy+2.5,4.2,2.2,'head');
  if(open)S.line([[hx,hy+5],[hx+8,hy+8]],1.2,1,'head');
  S.line([[hx-1,hy-2],[hx-5,hy-6],[hx-8,hy-8]],1.3,.6,'horn');S.line([[hx+2,hy-2],[hx,hy-6],[hx-2,hy-8]],1.1,.5,'horn');
  S.poly([[34,22],[31,14],[25,15],[17,19],[10,23],[14,25],[18,23],[22,25],[26,23],[30,25]],'wing');
  const d=[],bone=(x0,y0,x1,y1)=>{const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0));for(let k=0;k<=n;k++)d.push([Math.round(x0+(x1-x0)*k/n),Math.round(y0+(y1-y0)*k/n),1,1,k<n*.5?'#e8a0b8':'#c8708e'])};
  bone(33,21,31,15);bone(31,15,11,23);bone(30,16,18,23);bone(29,17,25,23);
  for(const [sx,sy] of [[14,20],[19,18],[36,20]])d.push([sx,sy,2,1,'#f6eedc'],[sx,sy-1,1,1,'#f6eedc']);
  d.push([hx,hy-1,2,2,'#ffe060'],[hx+1,hy,1,1,'#2a0e12'],[hx-1,hy-2,3,1,'#4a1220'],[hx+10,hy+1,1,1,'#2a0e12']);
  if(open)d.push([hx+3,hy+4,7,2,'#3a0a0a'],[hx+4,hy+4,1,1,'#ffffff'],[hx+7,hy+4,1,1,'#ffffff'],[hx+5,hy+6,1,1,'#ffffff']);
  d.push([35,35,2,1,'#f6eedc'],[16,35,2,1,'#f6eedc'],[22,35,2,1,'#f6eedc']);
  return d})}

// lit windows of any sprite (a town building at night): the glowing pixels redrawn after the shade, and a pool of light per window
const LITC=new WeakMap();
function litOf(src){let g=LITC.get(src);if(g)return g;const w=src.width,h=src.height,d=src.getContext('2d').getImageData(0,0,w,h).data,[cv,c]=mk(w,h),out=c.createImageData(w,h),cells=new Map();
  for(let i=0;i<w*h;i++){const r=d[i*4],gg=d[i*4+1],b=d[i*4+2];if(d[i*4+3]<200||!((r===255&&gg===216&&b===107)||(r===255&&gg===242&&b===176)))continue;out.data.set([r,gg,b,255],i*4);
    const x=i%w,y=(i/w)|0,k=((x/8)|0)+','+((y/8)|0),e=cells.get(k)||[0,0,0];e[0]+=x;e[1]+=y;e[2]++;cells.set(k,e)}
  c.putImageData(out,0,0);g={img:cv,pts:[...cells.values()].filter(e=>e[2]>=3).map(([x,y,n])=>[x/n,y/n])};LITC.set(src,g);return g}

// ===================== easter eggs =====================
// Little secrets on the world map and in the towns. Each one is cheap: drawn from a few pixels, triggered by a tap,
// the time of day, the weather or the kingdom's real work. Test hooks: window.__egg = {fog,clear,rainbow,snow,raven,fireworks}.
const EGG={taps:[],serpent:null,ghost:null,ghostNext:40,star:null,starNext:12,fallen:null,knight:null,lost:null,shep:null,
  rainbow:null,lastWx:null,pot:null,boats:null,catch:null,vtaps:[],ring:[],erupt:null,fw:{},cases:[],raven:null,konami:0,knightUntil:0};
const eggFlag=k=>!!(window.__egg&&window.__egg[k]);
const eggGet=(k,d)=>{try{const v=localStorage.getItem('pl-egg-'+k);return v==null?d:JSON.parse(v)}catch(e){return d}};
const eggSet=(k,v)=>{try{localStorage.setItem('pl-egg-'+k,JSON.stringify(v))}catch(e){}};
const eggHour=()=>{const d=new Date();return d.getHours()+d.getMinutes()/60};
const eggDay=()=>{const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()};
const isSea=(x,y)=>{const t=world.T&&world.T[Math.floor(y/TS)]?.[Math.floor(x/TS)];return t!==undefined&&t<=SHAL};
const isLand=(x,y)=>{const t=world.T&&world.T[Math.floor(y/TS)]?.[Math.floor(x/TS)];return t!==undefined&&t>SHAL&&t!==RIVER};
function esfx(n,v,x){if(typeof sfx==='function')sfx(n,v,x==null||!world.W?0:clamp(x/world.W*2-1,-1,1)*.7)}
function worldPoint(e){const r=world.cv.getBoundingClientRect();return {x:(e.clientX-r.left)/r.width*world.W,y:(e.clientY-r.top)/r.height*world.H}}

// ---------- world map: drawing ----------
function eggWorld(c,t,dt,L,lights){if(!world.W)return;dt=Math.min(dt||0,.1);
  eggBoats(c,t,L,lights);eggSerpent(c,t,L);eggGhost(c,t,L,lights);eggRainbow(c,t,L);eggVolcano(c,t,L,lights);
  eggLost(c,t,dt,L);eggKnight(c,t,dt,L);eggStars(c,t,L,lights);eggFireworks(c,t,L,lights);eggRaven(c,t,L)}
// a snowy day dusts the land white
let SNOWBG=null;
function snowDay(){if(eggFlag('snow'))return true;const h=hash('snow'+eggDay())%23;return h===0&&eggHour()>=6&&eggHour()<15}
function snowLayer(){if(SNOWBG&&SNOWBG.sig===world.sig)return SNOWBG.cv;const [cv,c]=mk(world.W,world.H);
  for(let y=0;y<world.R;y++)for(let x=0;x<world.C;x++){const t=world.T[y][x];if(t<=SHAL||t===RIVER)continue;for(let j=0;j<TS;j+=2)for(let i=(j/2)%2;i<TS;i+=2)px(c,x*TS+i,y*TS+j,1,1,'rgba(246,248,255,.62)')}
  SNOWBG={cv,sig:world.sig};return cv}

// 1. sea serpent: three quick taps on one patch of sea
function eggSerpent(c,t,L){const S=EGG.serpent;
  if(!S&&world.jetty&&Math.random()<.0004)EGG.serpent={x:world.jetty.x+40,y:world.jetty.y-30,t0:t,dir:1};
  if(!EGG.serpent)return;const s=EGG.serpent,e=t-s.t0;if(e>7){EGG.serpent=null;return}
  if(!s.sfx){s.sfx=1;esfx('splash',1,s.x)}
  const G=['#1e6a5a','#2e8a6a','#5ab88a'],rise=Math.min(1,e/1.2,(7-e)/1.2);
  for(let k=0;k<3;k++){const hx=s.x+s.dir*(k*16-e*6),h=Math.round(5*rise*(.6+.4*Math.sin(e*3+k)));for(let i=-5;i<=5;i++){const yy=Math.round(Math.sqrt(Math.max(0,25-i*i))/5*h);px(c,hx+i,s.y-yy,2,yy+1,G[1]);px(c,hx+i,s.y-yy,2,1,G[2])}px(c,hx-7,s.y+1,16,1,'#a8d0f8')}
  const hx=s.x+s.dir*(-14-e*6),hy=s.y-Math.round(10*rise);px(c,hx-2,hy,5,10*rise+1,G[1]);px(c,hx-4,hy-4,8,5,G[1]);px(c,hx-4,hy-4,8,1,G[2]);px(c,hx-6,hy-2,3,2,G[0]);px(c,hx-2,hy-3,1,1,'#ffe060');px(c,hx+2,hy-6,1,2,'#f6eedc')}
// 2. ghost ship on foggy nights
function eggGhost(c,t,L,lights){const fog=eggFlag('fog')||(wxKind()==='fog'&&L.night);
  if(!EGG.ghost&&fog&&t>EGG.ghostNext){let y=null;for(let yy=30;yy<world.H*.4;yy+=8)if(isSea(20,yy)&&isSea(world.W/2,yy)){y=yy;break}if(y==null)y=24;EGG.ghost={x:-40,y,t0:t,wave:0}}
  const G=EGG.ghost;if(!G)return;G.x=-40+(t-G.t0)*12;if(G.x>world.W+40){EGG.ghost=null;EGG.ghostNext=t+90;return}
  const a=.38+.12*Math.sin(t*2);glowQ.push(g=>{g.save();g.globalAlpha=a;const x=Math.round(G.x),y=Math.round(G.y+Math.sin(t*1.2)*1.5);
    px(g,x-16,y-2,32,5,'#a8f0d8');px(g,x-13,y+3,26,2,'#7ad0b8');px(g,x-1,y-26,2,24,'#c8fff0');px(g,x-12,y-22,11,14,'#dafff4');px(g,x+2,y-24,12,16,'#dafff4');px(g,x-10,y-20,2,1,'#7ad0b8');px(g,x+4,y-20,8,1,'#7ad0b8');
    if(t<G.wave){const w=Math.floor(t*6)%2;px(g,x+8,y-8,4,6,'#ffffff');px(g,x+9,y-10,2,2,'#ffffff');px(g,x+12,y-11-w*2,1,4,'#ffffff');px(g,x+9,y-7,1,1,'#2a3a3a')}g.restore()});
  lights.push([G.x,G.y-10,40,'140,255,220',.5])}
// 3. shooting stars on clear nights; catch one and it lands as a treasure
function eggStars(c,t,L,lights){const clear=eggFlag('clear')||(L.night&&['clear','partly'].includes(wxKind()));
  if(!EGG.star&&clear&&t>EGG.starNext){const h=hash('ss'+Math.floor(t));EGG.star={x:world.W*(.2+(h%60)/100),y:20+(h>>>8)%60,t0:t}}
  const S=EGG.star;if(S){const e=t-S.t0;if(e>1.6){EGG.star=null;EGG.starNext=t+20+hash('sn'+Math.floor(t))%25}
    else{S.hx=S.x+e*140;S.hy=S.y+e*55;glowQ.push(g=>{for(let k=0;k<12;k++){g.fillStyle=`rgba(255,250,220,${(1-k/12)*.9})`;g.fillRect(Math.round(S.hx-k*5),Math.round(S.hy-k*2),k?2:3,k?1:3)}})}}
  const F=EGG.fallen;if(F){const p=.5+.5*Math.sin(t*4);lights.push([F.x,F.y,20,'255,240,160',.8]);
    glowQ.push(g=>{px(g,F.x-1,F.y-4,3,9,'#fff4b0');px(g,F.x-4,F.y-1,9,3,'#fff4b0');px(g,F.x,F.y-1,1,3,'#ffffff');if(p>.6){px(g,F.x-3,F.y-3,1,1,'#ffffff');px(g,F.x+3,F.y+2,1,1,'#ffffff')}})}}
// 4. after every fifth sheep the dragon eats, a knight sheep marches to the nest and bonks it
function eggSheepEaten(){const n=eggGet('eaten',0)+1;eggSet('eaten',n);if(n%5===0&&world.sheep&&world.sheep.length){const s=world.sheep.find(s=>!s.gone)||world.sheep[0];EGG.knight={x:s.hx,y:s.hy,hx:s.hx,hy:s.hy,ph:'march',t0:null};achieve('knight')}}
function drawKnightSheep(c,x,y,t,dir,walk){const s={x,y,mv:walk?1:0,k:3,face:dir};drawSheep(c,s,t);const hx=dir<0?x-5:x+3;px(c,hx-1,y-5,4,2,'#a8b0bc');px(c,hx-1,y-5,4,1,'#d8dce4');px(c,hx+1,y-7,1,2,'#c43a3a');px(c,x+(dir<0?3:-4),y-9,1,9,'#6a4228');px(c,x+(dir<0?3:-4),y-10,1,1,'#d8dce4')}
function eggKnight(c,t,dt,L){const K=EGG.knight,D=world.dragon;if(!K||!world.volcano)return;if(K.t0==null)K.t0=t;const P=dragonNest(),tx=K.ph==='home'?K.hx:P.x+34,ty=K.ph==='home'?K.hy:P.y+2;
  const dx=tx-K.x,dy=ty-K.y,d=Math.hypot(dx,dy),walk=d>1.5&&K.ph!=='bonk';if(walk){const v=Math.min(d,dt*9);K.x+=dx/d*v;K.y+=dy/d*v;K.dir=dx<0?-1:1}
  if(K.ph==='march'&&!walk){if(D&&!D.ph){K.ph='bonk';K.t1=t}}
  if(K.ph==='bonk'){const e=t-K.t1,hop=Math.max(0,Math.sin(e*7))*4;if(Math.floor(e*7/Math.PI)!==K.lb){K.lb=Math.floor(e*7/Math.PI);if(K.lb%2===1)esfx('bonk',1,K.x)}
    drawKnightSheep(c,K.x,K.y-hop,t,-1,false);if(e>1.6){K.ph='home';if(D&&!D.ph){D.sulk=true;const now=t;D.s={fake:true,x:P.x+(hash('sk'+Math.floor(t))%2?140:-140),y:P.y-40};D.pos={x:P.x,y:P.y,h:0};D.ph='takeoff';D.t0=now;D.from=null;esfx('grumble',1,P.x)}}return}
  if(K.ph==='home'&&!walk){EGG.knight=null;return}
  drawKnightSheep(c,K.x,K.y,t,K.dir||-1,walk);if(K.ph==='march')bubbleQ.push([K.x,K.y-12,'!'])}
// 5. a sheep sometimes wanders off; tap it and a shepherd fetches it home
function shepherdSpec(){return {cls:'Shepherd',title:'Shepherd',skin:SKIN[1],hair:HAIRS[2],eye:EYES[1],hs:'short',head:'cap',headCol:'#6a8a3a',build:'normal',outfit:'tunic',top:'#8a6a3a',bottom:'#4a3a2a',trim:'#6a8a3a',item:'spear',acc:'none'}}
function eggLost(c,t,dt,L){if(!world.sheep||!world.sheep.length)return;
  if(!EGG.lost&&Math.random()<dt*.012){const s=world.sheep[hash('ls'+Math.floor(t))%world.sheep.length];if(!s.gone&&!s.carried&&!s.target){
    for(let k=0;k<12;k++){const a=(hash('la'+k+Math.floor(t))%628)/100,r=90+k*6,x=s.hx+Math.cos(a)*r,y=s.hy+Math.sin(a)*r*.6;if(isLand(x,y)&&x>20&&y>20&&x<world.W-20&&y<world.H-20){s.target=true;EGG.lost={s,tx:x,ty:y};break}}}}
  const Lo=EGG.lost;if(!Lo)return;const s=Lo.s;
  if(!EGG.shep){const dx=Lo.tx-s.x,dy=Lo.ty-s.y,d=Math.hypot(dx,dy);if(d>1){const v=Math.min(d,dt*3);s.x+=dx/d*v;s.y+=dy/d*v;s.face=dx<0?-1:1;s.mv=1}else s.mv=0;if(Math.floor(t)%3===0)bubbleQ.push([s.x,s.y-8,'?'])}
  const H=EGG.shep;if(!H)return;const goal=H.ph==='fetch'?{x:s.x+8,y:s.y}:H.ph==='lead'?{x:s.hx+10,y:s.hy}:{x:H.ox,y:H.oy};
  const dx=goal.x-H.x,dy=goal.y-H.y,d=Math.hypot(dx,dy),v=Math.min(d,dt*14);if(d>1){H.x+=dx/d*v;H.y+=dy/d*v;H.dir=Math.abs(dx)>Math.abs(dy)?(dx<0?'left':'right'):(dy<0?'up':'down')}
  if(H.ph==='lead'){s.x=H.x-10;s.y=H.y;s.face=H.x>s.x?1:-1;s.mv=1}
  if(d<=1.5){if(H.ph==='fetch'){H.ph='lead';esfx('baa',.6,s.x)}else if(H.ph==='lead'){H.ph='back';s.target=false;s.mv=0;s.x=s.hx;s.y=s.hy;EGG.lost=null}else{EGG.shep=null;return}}
  drawMini(c,H.x,H.y,shepherdSpec(),H.dir||'down',d>1.5?Math.floor(t*4):0)}
// 6. after rain, a rainbow; its end hides a pot of gold
function eggRainbow(c,t,L){const k=wxKind(),wet=['rain','drizzle','storm'].includes(k);
  if(EGG.lastWx&&['rain','drizzle','storm'].includes(EGG.lastWx)&&!wet&&!L.night)EGG.rainbow={t0:t};
  EGG.lastWx=k;if(eggFlag('rainbow')&&!EGG.rainbow)EGG.rainbow={t0:t};
  const R=EGG.rainbow;if(!R)return;const e=t-R.t0;if(e>90){EGG.rainbow=null;EGG.pot=null;return}
  if(!R.end){let best=null;for(let k2=0;k2<40;k2++){const x=world.W*(.55+(hash('re'+k2)%30)/100),y=world.H*(.45+(hash('ry'+k2)%30)/100);if(isLand(x,y)){best={x,y};break}}R.end=best||{x:world.W*.7,y:world.H*.6};R.cx=R.end.x-world.W*.28;R.r=world.W*.28}
  const a=Math.min(1,e/4,(90-e)/4)*.42,cols=['255,80,80','255,160,60','255,230,80','100,220,100','80,160,255','160,100,230'];
  c.save();for(let i=0;i<6;i++){c.strokeStyle=`rgba(${cols[i]},${a})`;c.lineWidth=5;c.beginPath();c.arc(R.cx,R.end.y,R.r-i*5,Math.PI,2*Math.PI);c.stroke()}c.restore();
  if(EGG.pot){const P=EGG.pot;px(c,P.x-6,P.y-6,12,8,'#2a2a30');px(c,P.x-7,P.y-7,14,2,'#4a4a52');for(let i=0;i<5;i++)px(c,P.x-5+i*2,P.y-9-(i%2),2,2,'#f2c94c');if(Math.floor(t*4)%2)px(c,P.x-2,P.y-12,1,1,'#ffffff')}}
// 7. fishing boats leave the harbour at dawn and come home at dusk
function eggBoats(c,t,L,lights){const port=world.towns.find(T=>T.icon==='port');if(!port)return;
  if(!EGG.boats||EGG.boats.sig!==world.sig){const spots=[];for(let k=0;k<60&&spots.length<2;k++){const a=(hash('fb'+k)%628)/100,r=70+hash('fr'+k)%50,x=port.cx+Math.cos(a)*r,y=port.cy+Math.sin(a)*r*.7;if(isSea(x,y)&&isSea(x+10,y)&&isSea(x-10,y)&&!spots.some(s=>Math.hypot(s.x-x,s.y-y)<40))spots.push({x,y})}
    EGG.boats={sig:world.sig,list:spots.map((s,i)=>({sea:s,dock:{x:port.cx+12+i*14,y:port.y+port.h-8},i}))}}
  const h=eggHour(),out=h<5?0:h<7?(h-5)/2:h<17?1:h<19?1-(h-17)/2:0;
  for(const B of EGG.boats.list){const u=out*out*(3-2*out),bob=Math.round(Math.sin(t*1.6+B.i)*1),drift=out>=1?Math.sin(t*.2+B.i*2)*6:0;
    const x=Math.round(B.dock.x+(B.sea.x-B.dock.x)*u+drift),y=Math.round(B.dock.y+(B.sea.y-B.dock.y)*u)+bob;B.x=x;B.y=y;
    px(c,x-6,y,12,3,RAMP.wood[2]);px(c,x-6,y,12,1,RAMP.wood[3]);px(c,x-4,y+3,8,1,RAMP.wood[0]);px(c,x,y-9,1,9,RAMP.wood[0]);px(c,x+1,y-8,5,6,'#f4eee0');px(c,x-4,y-4,2,4,'#3a5a8a');px(c,x-4,y-5,2,1,SKIN[1]);
    if(L.night){lights.push([x+3,y-3,12,WARM,.6]);glowQ.push(g=>px(g,x+3,y-4,1,2,'#ffd86b'))}}
  const K=EGG.catch;if(K){const e=t-K.t0;if(e>3){EGG.catch=null;return}const B=K.b,yy=B.y-6-Math.min(10,e*14);
    if(K.what==='fish'){px(c,B.x-8,yy,6,3,'#8ab0c8');px(c,B.x-2,yy+1,2,1,'#8ab0c8');px(c,B.x-7,yy,1,1,'#1a1a1a')}else if(K.what==='boot'){px(c,B.x-8,yy,4,5,'#4a3424');px(c,B.x-8,yy+4,7,2,'#4a3424')}else{px(c,B.x-8,yy,3,6,'#7ad0a0');px(c,B.x-7,yy-2,1,2,'#a07a4a');px(c,B.x-7,yy+2,1,2,'#f4eee0')}
    for(let i=0;i<Math.round(e*10)%4;i++)px(c,B.x-6+i*2,B.y-1,1,1,'#a8d0f8')}}
// 8. tapping the volcano puffs smoke rings; five quick taps make it erupt and wake the dragon, who glares
function eggVolcano(c,t,L,lights){const V=world.volcano;if(!V)return;
  EGG.ring=EGG.ring.filter(r=>t-r.t0<2.4);for(const r of EGG.ring){const e=(t-r.t0)/2.4,rr=4+e*10;c.strokeStyle=`rgba(200,190,190,${.7*(1-e)})`;c.lineWidth=2;c.beginPath();c.ellipse(V.cx,V.cy-32-e*34,rr,rr*.45,0,0,7);c.stroke()}
  const E=EGG.erupt;if(!E)return;const e=t-E.t0;const box=document.getElementById('mapBox');if(e>4.5){EGG.erupt=null;if(box)box.style.transform='';return}
  if(box)box.style.transform=e<3?`translate(${Math.round(Math.sin(t*80)*2)}px,${Math.round(Math.cos(t*67)*2)}px)`:'';
  lights.push([V.cx,V.cy-30,90,LAVA,1]);
  for(let i=0;i<10;i++){const s=(e*1.4+i/10)%1,a=(hash('eb'+i)%100)/100*Math.PI-Math.PI/2+Math.PI/2,side=i%2?1:-1,dist=30+hash('ed'+i)%70;
    const x=V.cx+side*s*dist*Math.cos(a*.3),y=V.cy-36-Math.sin(s*Math.PI)*70+s*(40+hash('eh'+i)%20);glowQ.push(g=>{px(g,Math.round(x)-2,Math.round(y)-2,4,4,s<.8?'#ffb040':'#a0301a');px(g,Math.round(x)-1,Math.round(y)-1,2,2,'#fff2b0')})}
  glowQ.push(g=>{for(let k=0;k<8;k++){const yy=V.cy-38-((e*40+k*9)%40);px(g,V.cx-4+Math.sin(k+e*6)*5,yy,6,4,k%2?'#ff7a24':'#ffd23c')}})}
// 16. fireworks over a town that has just shipped; tap the spent case to replay
function eggFireworks(c,t,L,lights){const now=Date.now();
  for(const T of world.towns){if(T.icon==='royal')continue;const shipped=eggFlag('fireworks')||T.v.lanes.some(l=>l.state==='done'&&((l._doneAt&&now-l._doneAt<9e5)||(l.updated&&now-Date.parse(l.updated)<36e5)));
    const F=EGG.fw[T.name]||(EGG.fw[T.name]={next:t+1+hash(T.name)%3,bursts:[]});
    if(shipped&&t>F.next){F.next=t+3.5+(hash(T.name+Math.floor(t))%30)/10;fireBurst(T,t);if(!EGG.cases.some(k=>k.town===T.name))EGG.cases.push({town:T.name,x:T.cx+T.w/2+6,y:T.y+T.h-2})}
    if(F.replay&&t>F.replay.next&&F.replay.n>0){F.replay.n--;F.replay.next=t+.7;fireBurst(T,t)}
    F.bursts=F.bursts.filter(b=>t-b.t0<2.6);
    for(const b of F.bursts){const e=t-b.t0;if(e<.8){const y=b.y0-e/.8*b.h;glowQ.push(g=>{px(g,b.x,Math.round(y),1,3,'#fff2b0');px(g,b.x,Math.round(y)+3,1,2,'#ffb040')})}
      else{const k=(e-.8)/1.8;if(!b.pop){b.pop=1;esfx('pop',.8,b.x)}lights.push([b.x,b.y0-b.h,40*(1-k),b.rgb,.9]);
        glowQ.push(g=>{for(let i=0;i<16;i++){const a=i/16*Math.PI*2,r=4+k*22,x=b.x+Math.cos(a)*r,y=b.y0-b.h+Math.sin(a)*r+k*k*10;g.fillStyle=k<.7?b.col:'rgba(255,240,200,.6)';g.fillRect(Math.round(x),Math.round(y),2,2)}})}}}
  for(const K of EGG.cases){px(c,K.x,K.y-5,3,5,'#c43a3a');px(c,K.x,K.y-5,3,1,'#f2c94c');px(c,K.x+1,K.y-7,1,2,'#3a3440')}}
function fireBurst(T,t){const cols=[['#ff5a5a','255,90,90'],['#ffd23c','255,210,60'],['#5ad0ff','90,210,255'],['#7aef6a','120,240,100'],['#ff7ad8','255,120,216']],k=cols[hash(T.name+t)%cols.length];
  EGG.fw[T.name].bursts.push({t0:t,x:Math.round(T.cx+((hash('fx'+t)%30)-15)),y0:T.y+6,h:40+hash('fh'+t)%30,col:k[0],rgb:k[1]})}
// 17. a raven on the King's castle when an ask has waited too long
function overdueAsks(){if(eggFlag('raven'))return 1;const now=Date.now();return (ASKS||[]).filter(a=>a.status==='open'&&(a.createdAt?now-Date.parse(a.createdAt)>1728e5:(mode==='sample'&&a.urgent))).length}
function eggRaven(c,t,L){const T=world.towns.find(x=>x.icon==='royal');EGG.raven=null;if(!T||!overdueAsks())return;
  const x=Math.round(T.cx+16),y=Math.round(T.y+2),caw=Math.floor(t/6)!==EGG.cawN;EGG.cawN=Math.floor(t/6);EGG.raven={x,y,T};
  const open=Math.floor(t*2)%12===0;px(c,x-3,y-4,6,4,'#1e1a2a');px(c,x+2,y-6,3,3,'#1e1a2a');px(c,x+5,y-5,2,1,open?'#3a3440':'#e8b04a');if(open)px(c,x+5,y-4,2,1,'#e8b04a');px(c,x+3,y-6,1,1,'#ff5a5a');px(c,x-5,y-3,2,2,'#2e2a3a');px(c,x-1,y,1,2,'#e8b04a');px(c,x+1,y,1,2,'#e8b04a');
  if(caw&&!active)esfx('caw',.7,x);if(Math.floor(t/3)%2)bubbleQ.push([x+2,y-8,'!'])}

// ---------- world map: taps ----------
function eggWorldTap(e){if(!world.W)return false;const {x,y}=worldPoint(e),t=(performance.now()-T0)/1000;
  if(EGG.raven&&Math.hypot(x-EGG.raven.x,y-EGG.raven.y)<12){esfx('caw',1,x);achieve('raven');travelTo(EGG.raven.T.v);return true}
  if(EGG.fallen&&Math.hypot(x-EGG.fallen.x,y-EGG.fallen.y)<12){esfx('coin',1,x);esfx('cheer',.6,x);const n=eggGet('stars',0)+1;eggSet('stars',n);toast(`You found a fallen star! (${n} so far)`);achieve('fallen');EGG.fallen=null;return true}
  if(EGG.star&&EGG.star.hx!=null&&Math.hypot(x-EGG.star.hx,y-EGG.star.hy)<26){esfx('zap',1,x);for(let k=0;k<30;k++){const h=hash('fs'+k+Math.floor(t));const fx=world.W*.15+(h%1000)/1000*world.W*.7,fy=world.H*.25+((h>>>10)%1000)/1000*world.H*.6;if(isLand(fx,fy)){EGG.fallen={x:Math.round(fx),y:Math.round(fy)};break}}EGG.star=null;toast('A star fell somewhere in the kingdom…');achieve('star');return true}
  for(const K of EGG.cases){if(Math.hypot(x-K.x-1,y-K.y+3)<8){const F=EGG.fw[K.town];if(F)F.replay={n:3,next:t};achieve('fireworks');esfx('blip',1,x);return true}}
  if(EGG.ghost&&Math.abs(x-EGG.ghost.x)<20&&y>EGG.ghost.y-30&&y<EGG.ghost.y+8){EGG.ghost.wave=t+3;achieve('ghost');esfx('hoot',1,x);return true}
  if(EGG.boats)for(const B of EGG.boats.list){if(B.x!=null&&Math.hypot(x-B.x,y-B.y+3)<11&&!EGG.catch){const r=hash('ct'+Math.floor(t*10))%100,what=r<60?'fish':r<95?'boot':'bottle';EGG.catch={b:B,t0:t,what};achieve('fish');if(what==='bottle')setTimeout(()=>achieve('bottle'),1200);esfx('splash',.7,x);
    setTimeout(()=>toast(what==='fish'?'A fine fish!':what==='boot'?'An old boot. Again.':'A message in a bottle: "'+bottleNote()+'" – The '+monarch()),900);return true}}
  if(EGG.lost&&!EGG.shep&&Math.hypot(x-EGG.lost.s.x,y-EGG.lost.s.y+2)<10){const s=EGG.lost.s;let T0w=null,bd=1e9;for(const T of world.towns){if(T.icon==='royal')continue;const d=Math.hypot(T.cx-s.x,T.cy-s.y);if(d<bd){bd=d;T0w=T}}
    if(T0w){EGG.shep={x:T0w.cx,y:T0w.y+T0w.h,ox:T0w.cx,oy:T0w.y+T0w.h,ph:'fetch'};achieve('shepherd');esfx('baa',1,x)}return true}
  if(EGG.rainbow&&EGG.rainbow.end&&!EGG.pot&&Math.hypot(x-EGG.rainbow.end.x,y-EGG.rainbow.end.y)<18){EGG.pot={x:Math.round(EGG.rainbow.end.x),y:Math.round(EGG.rainbow.end.y)};esfx('coin',1,x);setTimeout(()=>esfx('coin',1,x),150);setTimeout(()=>esfx('coin',1,x),300);toast('A pot of gold at the end of the rainbow!');achieve('pot');return true}
  const V=world.volcano;if(V&&Math.abs(x-V.cx)<34&&y>V.cy-44&&y<V.cy+14&&!EGG.erupt){EGG.vtaps=EGG.vtaps.filter(k=>t-k<4);EGG.vtaps.push(t);EGG.ring.push({t0:t});esfx('whoosh',.4,x);
    if(EGG.vtaps.length>=5){EGG.vtaps=[];EGG.erupt={t0:t};achieve('volcano');esfx('thunder',1,x);esfx('roar',.4,x);const D=world.dragon;if(D&&!D.ph)D.glare=t+3.2}return true}
  if(isSea(x,y)){EGG.taps=EGG.taps.filter(k=>t-k.t<2.5&&Math.hypot(k.x-x,k.y-y)<60);EGG.taps.push({x,y,t});if(EGG.taps.length>=3&&!EGG.serpent){EGG.taps=[];EGG.serpent={x,y,t0:t,dir:hash('sd'+Math.floor(t))%2?1:-1};achieve('serpent')}}
  return false}
function bottleNote(){const s=['Ship something small today.','The best roadmap is the one you finish.','Remember to drink water.','Your kingdom is doing fine. Really.','Who keeps feeding the dragon?','Write it down before you forget it.'];return s[hash('bn'+Date.now())%s.length]}

// ---------- towns ----------
// 9. a cat naps on one roof in every town, moving each day
function catSpot(v){const L=v.lanes.filter(l=>l.g&&l.T);if(!L.length)return null;const l=L[hash('cat'+v.name+eggDay())%L.length];return {x:l.g.bx+Math.round(l.T.W*.62),y:l.g.B-l.T.H+8,id:v.name}}
// 10. the capital's fountain is a wishing well
const FORTUNES=['A lane will ship before Friday.','The bug you fear is a typo.','A small fix will save a big day.','Someone in this kingdom is about to say thank you.','The next roadmap item is easier than it looks.','Rest is also progress.','A sheep will be avenged.'];
// 11. chickens: tap them and they scatter; tap enough and the big one comes for you
function townEggSetup(v){if(v.egg&&v.egg.seed===v.seed)return v.egg;const E={seed:v.seed,hens:[],cockerel:null,taps:[],coin:null,cat:null,dance:0,ptr:null};
  const cx=v.camp?v.camp.x:v.tav?v.tav.X+v.tav.w+40:v.W/2,cy=v.camp?v.camp.y+30:v.tav?v.tav.Y+v.tav.h-30:v.H/2;
  for(let i=0;i<3;i++)E.hens.push({x:cx-30+i*24,y:cy+((i%2)*10),hx:cx-30+i*24,hy:cy,dir:i%2?1:-1,run:0,tx:null,ty:null,k:i});v.egg=E;return E}
function drawHen(c,h,t,big){const z=big?2:1,P=(dx,dy,w,hh,col)=>px(c,Math.round(h.x+(h.dir<0?-dx-w:dx)*z),Math.round(h.y+dy*z),w*z,hh*z,col),step=h.run>0?Math.floor(t*12)%2:0;
  ellipseShadow(c,h.x,h.y,4*z,1*z,.25);P(-3,-6,6,5,'#f4f0e6');P(-4,-5,2,3,'#f4f0e6');P(-3,-6,6,1,'#ffffff');P(2,-9,3,4,'#f4f0e6');P(3,-10,2,1,'#e0302a');P(5,-8,2,1,'#f2a020');P(3,-8,1,1,'#1a1a1a');P(-1,-1,1,1+step,'#f2a020');P(1,-1,1,2-step,'#f2a020');
  if(h.run>0&&Math.floor(t*10)%2)P(-4,-7,3,2,'#e8e4d8');if(big){P(3,-10,2,1,'#ff2a2a');P(4,-9,1,1,'#ff2a2a')}}
function outOfInn(v,h){const T=v.tav;if(!T)return;const x0=T.X-6,x1=T.X+T.w+6,y0=T.Y-4,y1=T.Y+T.h+8;if(h.x>x0&&h.x<x1&&h.y>y0&&h.y<y1){const d=[h.x-x0,x1-h.x,h.y-y0,y1-h.y],m=Math.min(...d);if(m===d[0])h.x=x0;else if(m===d[1])h.x=x1;else if(m===d[2])h.y=y0;else h.y=y1}}
function eggTown(v,c,t,dt,L,lights,actors){if(v===COURT||!v.lanes)return;const E=townEggSetup(v);dt=Math.min(dt||0,.1);const H=eggHour();
  // cat
  const cs=catSpot(v);if(cs){const st=E.cat&&t-E.cat<1.5,x=cs.x,y=cs.y;px(c,x-5,y-3,10,4,'#3a3440');px(c,x-5,y-3,10,1,'#5a5466');px(c,x+3,y-6-(st?2:0),4,4,'#3a3440');px(c,x+3,y-7-(st?2:0),1,1,'#3a3440');px(c,x+6,y-7-(st?2:0),1,1,'#3a3440');
    px(c,x+4,y-5-(st?2:0),1,1,st?'#a0e060':'#2a2430');px(c,x+6,y-5-(st?2:0),1,1,st?'#a0e060':'#2a2430');for(let i=0;i<5;i++)px(c,x-6-Math.round(Math.sin(i*.6+t*(st?6:1))),y-1-i,1,1,'#3a3440');if(st)px(c,x-4,y+1,8,1,'#3a3440')}
  // fountain coin
  if(E.coin){const e=t-E.coin.t0,F=v.fount;if(F&&e<.8){const x=F.x-20+e/.8*20,y=F.y-6-Math.sin(e/.8*Math.PI)*24;px(c,Math.round(x)-1,Math.round(y)-1,3,3,'#f2c94c')}else if(F&&e<1.6){const k=(e-.8)/.8;for(let i=0;i<6;i++){const a=i/6*Math.PI*2;px(c,F.x+Math.cos(a)*k*8,F.y-4+Math.sin(a)*k*3,1,1,'#cfe6ff')}}}
  // milestone statues round the fountain
  if(v.thKey==='capital'&&v.fount){const n=Math.min(6,Math.floor(shippedTally()/10));for(let i=0;i<n;i++){const s=statueAt(v,i);px(c,s.x-6,s.y-4,12,5,'#8a847a');px(c,s.x-6,s.y-4,12,1,'#c4beb2');px(c,s.x-3,s.y-18,6,14,'#c8a040');px(c,s.x-3,s.y-18,2,14,'#e8c868');px(c,s.x-2,s.y-22,4,4,'#c8a040');px(c,s.x-5,s.y-15,2,6,'#c8a040');px(c,s.x+3,s.y-20,1,9,'#a07a2a');px(c,s.x-2,s.y-2,4,1,'#5a564e')}}
  // snowmen by the keeps on a snow day, from late morning
  if(snowDay()&&H>=11||eggFlag('snow'))for(const l of v.lanes){if(!l.g||!l.info||l.info.type!=='keep')continue;const x=l.g.ox+LOTW*TS-12,y=l.g.B+8;disc(c,x,y-4,5,'#f4f6fc');disc(c,x,y-12,4,'#ffffff');px(c,x-1,y-13,1,1,'#1a1a1a');px(c,x+1,y-13,1,1,'#1a1a1a');px(c,x,y-11,2,1,'#f28a2a');px(c,x-3,y-17,6,2,'#2a2430');px(c,x-2,y-20,4,3,'#2a2430');px(c,x+4,y-8,4,1,'#6a4228')}
  // hens and the cockerel
  for(const h of E.hens){if(h.run>0){h.run-=dt;const dx=h.tx-h.x,dy=h.ty-h.y,d=Math.hypot(dx,dy);if(d>1){h.x+=dx/d*Math.min(d,dt*60);h.y+=dy/d*Math.min(d,dt*60);h.dir=dx<0?-1:1}}
    else if(Math.random()<dt*.4){h.x+=(Math.random()-.5)*4;h.y+=(Math.random()-.5)*2;h.x=clamp(h.x,h.hx-30,h.hx+30);h.y=clamp(h.y,h.hy-10,h.hy+14)}
    outOfInn(v,h);actors.push({y:h.y,f:()=>drawHen(c,h,t,false)})}
  const K=E.cockerel;if(K){const e=t-K.t0;if(e>9){K.x+=(K.x<v.W/2?-1:1)*dt*80;if(K.x<-40||K.x>v.W+40)E.cockerel=null}else if(E.ptr){const dx=E.ptr.x-K.x,dy=E.ptr.y-K.y,d=Math.hypot(dx,dy);if(d>6){K.x+=dx/d*Math.min(d,dt*55);K.y+=dy/d*Math.min(d,dt*55);K.dir=dx<0?-1:1}else if(Math.floor(t*4)!==K.pk){K.pk=Math.floor(t*4);esfx('cluck',1)}}
    outOfInn(v,K);K.run=1;if(E.cockerel)actors.push({y:K.y,f:()=>drawHen(c,K,t,true),bub:e<9?{x:K.x,y:K.y+14,k:'!'}:null})}
  // after midnight the tavern dances
  if(v.tav&&(H<4||eggFlag('late'))){if(Math.random()<dt*2)spawn(v,v.tav.X+20+Math.random()*(v.tav.w-40),v.tav.Y,1,['#f2c94c','#e88ad8','#5ad0ff'],-24);
    if(Math.floor(t/9)!==E.songN&&active===v){E.songN=Math.floor(t/9);esfx('sing',.5)}}
  if(v.tav&&t<E.dance){const tv=v.tav,x0=tv.X+18,w=tv.w-36,y0=tv.Y+8;px(c,x0,y0,w,16,'#ffd27a');for(let i=0;i<6;i++){const x=x0+6+i*(w-12)/6,b=Math.abs(Math.sin(t*6+i))*3;px(c,x,y0+6-b,3,10,'#2a1a20');px(c,x-1,y0+3-b,5,4,'#2a1a20');if(Math.floor(t*6+i)%2)px(c,x+3,y0+5-b,2,1,'#2a1a20');else px(c,x-2,y0+5-b,2,1,'#2a1a20')}lights.push([x0+w/2,y0+8,50])}}
// the busiest worker wears a crown (drawn over the townsfolk)
function crownedLane(){let best=null;for(const l of lanes){if(/overseer|global/i.test(l.role))continue;const s=(l.state==='done'?200:0)+l.progress;if(!best||s>best.s)best={id:l.id,s}}return best&&best.id}
function eggTownOver(v,c,t){if(v===COURT||!v.lanes)return;const id=crownedLane(),p=id&&v.people&&v.people[id];if(p&&!p.away){const x=Math.round(p.x),y=Math.round(p.y-37-(p.hop||0));px(c,x-4,y,9,3,'#f2c94c');px(c,x-4,y-2,1,2,'#f2c94c');px(c,x,y-3,1,3,'#f2c94c');px(c,x+4,y-2,1,2,'#f2c94c');px(c,x-1,y+1,2,1,'#e0302a');px(c,x-4,y+2,9,1,'#c9a03a')}}
// the statues stand in a ring round the fountain, between its flower pots: the sides first, then behind, then in front
function statueAt(v,i){const F=v.fount,a=[150,30,210,330,270,90][i]*Math.PI/180;return {x:Math.round(F.x+Math.cos(a)*54),y:Math.round(F.y+4+Math.sin(a)*32)}}
function shippedTally(){const k=eggGet('shipped',[]);let n=k.length;for(const l of lanes)if(l.state==='done'){const id=l.id+'@'+String(l.updated||'').slice(0,13);if(!k.includes(id)){k.push(id);n++}}if(k.length>500)k.splice(0,k.length-500);eggSet('shipped',k);return n+(mode==='sample'?23:0)}
function eggTownTap(v,x,y,t){if(v===COURT||!v.lanes)return false;const E=townEggSetup(v);
  const cs=catSpot(v);if(cs&&Math.hypot(x-cs.x,y-cs.y)<10){E.cat=t;esfx('meow',1);const f=eggGet('cats',[]),k=v.name+'@'+eggDay();if(!f.includes(k)){f.push(k);eggSet('cats',f)}toast(`You found ${f.length===1?'a cat':'another cat'}! ${f.length} found so far.`);eggCats();achieve('cat');if(new Set(f.map(k=>String(k).split('@')[0])).size>=5)achieve('cats');return true}
  if(v.thKey==='capital'&&v.fount&&Math.abs(x-v.fount.x)<28&&Math.abs(y-v.fount.y)<16){E.coin={t0:t};esfx('coin',1);achieve('wish');setTimeout(()=>{esfx('splash',.6);toast(FORTUNES[hash('ft'+Date.now())%FORTUNES.length])},800);return true}
  if(v.thKey==='capital'&&v.fount){const n=Math.min(6,Math.floor(shippedTally()/10));for(let i=0;i<n;i++){const s=statueAt(v,i);if(Math.abs(x-s.x)<8&&y>s.y-24&&y<s.y+4){toast(`A monument to ${(i+1)*10} things shipped across the kingdom.`);achieve('monument');esfx('fanfare',.5);return true}}}
  for(const h of E.hens)if(Math.hypot(x-h.x,y-h.y+4)<9){const a=Math.random()*Math.PI*2;h.tx=clamp(h.x+Math.cos(a)*60,10,v.W-10);h.ty=clamp(h.y+Math.sin(a)*30,h.hy-16,h.hy+24);h.run=1;esfx('cluck',1);
    E.taps=E.taps.filter(k=>t-k<6);E.taps.push(t);if(E.taps.length>=5&&!E.cockerel){E.taps=[];E.cockerel={x:-20,y:h.y,t0:t,dir:1};esfx('cluck',1.5);toast('You have angered the chickens.');achieve('chickens')}return true}
  if(v.tav&&(eggHour()<4||eggFlag('late'))&&x>=v.tav.X&&x<v.tav.X+v.tav.w&&y>=v.tav.Y-10&&y<v.tav.Y+v.tav.h){E.dance=t+6;esfx('sing',1);achieve('dance');return true}
  return false}
function eggCats(){if(typeof renderMenu==='function')renderMenu()}

// 15. ↑↑↓↓←→←→BA turns everyone into a knight for a minute
const KONAMI=['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
addEventListener('keydown',e=>{const k=e.key.length===1?e.key.toLowerCase():e.key;if(k===KONAMI[EGG.konami]){EGG.konami++;if(EGG.konami===KONAMI.length){EGG.konami=0;EGG.knightUntil=Date.now()+60000;esfx('fanfare',1);toast('For the realm! Everyone is a knight for a minute.');achieve('konami')}}else EGG.konami=k===KONAMI[0]?1:0});
{const _ho=heroOpts;heroOpts=function(spec,p,extra){const o=_ho(spec,p,extra);if(Date.now()<EGG.knightUntil)Object.assign(o,{head:'helm',headCol:'#c4cad4',outfit:'armor',top:'#a8b0bc',bottom:'#4a3a6a',item:'spear',cape:o.trim||'#c43a3a'});return o}}
setTimeout(eggCats,500);

// ===================== the throne room =====================
// The King is the Global overseer lane. His scroll grows with your open asks; each project's banner fills with its roadmap.
const EMBLEM={capital:'castle',port:'anchor',village:'mill',river:'wave',arcane:'crystal',cave:'coin'};
const FONT={'0':'111101101101111','1':'010110010010111','2':'111001111100111','3':'111001111001111','4':'101101111001001','5':'111100111001111','6':'111100111101111','7':'111001010010010','8':'111101111101111','9':'111101111001111','%':'101001010100101'};
function pixText(c,str,x,y,col){let cx=x;for(const ch of String(str)){const g=FONT[ch];if(g){for(let i=0;i<15;i++)if(g[i]==='1')px(c,cx+(i%3),y+Math.floor(i/3),1,1,col);cx+=4}else cx+=2}return cx-x}
function emblem(c,kind,x,y,col){
  const G=RAMP.gold[3];
  if(kind==='castle'){px(c,x,y+3,8,5,G);for(const k of [0,3,6])px(c,x+k,y+1,2,2,G);px(c,x+3,y+5,2,3,col)}
  else if(kind==='anchor'){px(c,x+3,y,2,8,G);px(c,x+1,y+1,6,1,G);px(c,x,y+6,2,1,G);px(c,x+6,y+6,2,1,G);px(c,x+1,y+7,6,1,G)}
  else if(kind==='mill'){px(c,x+3,y+3,2,5,G);px(c,x,y,2,2,G);px(c,x+6,y,2,2,G);px(c,x,y+6,2,2,G);px(c,x+6,y+6,2,2,G);px(c,x+2,y+2,4,4,G)}
  else if(kind==='wave'){px(c,x,y+3,3,1,G);px(c,x+2,y+2,3,1,G);px(c,x+4,y+3,3,1,G);px(c,x+6,y+2,2,1,G);px(c,x,y+6,3,1,G);px(c,x+2,y+5,3,1,G);px(c,x+4,y+6,4,1,G)}
  else if(kind==='crystal'){px(c,x+3,y,2,1,G);px(c,x+2,y+1,4,5,G);px(c,x+3,y+6,2,2,G);px(c,x+3,y+2,1,3,'#ffffff')}
  else {disc(c,x+4,y+4,3,G);px(c,x+3,y+2,2,4,shade(G,-.3))}
}
function banner(c,x,y,col,kind,pct,t){
  const H=44,W=22,sway=Math.round(Math.sin(t*.8+x)*.6);
  px(c,x-3,y,W+6,2,RAMP.gold[2]);px(c,x-3,y,W+6,1,RAMP.gold[4]);disc(c,x-3,y+1,2,RAMP.gold[3]);disc(c,x+W+3,y+1,2,RAMP.gold[3]);
  const D=shade(col,-.45),M=shade(col,-.2),F=col;
  for(let yy=0;yy<H;yy++){const tail=yy>H-8?Math.round((yy-(H-8))*1.4):0,xx=x+(yy>20?sway:0);
    if(tail<W/2){if(tail){px(c,xx,yy+y+2,W/2-tail,1,D);px(c,xx+W/2+tail,yy+y+2,W/2-tail,1,D)}else px(c,xx,yy+y+2,W,1,D)}}
  // embroidery rises from the hem as the roadmap completes
  const fillH=Math.round((H-10)*clamp(pct/100));
  for(let k=0;k<fillH;k++){const yy=y+2+H-9-k,xx=x+(H-9-k>20?sway:0);px(c,xx+2,yy,W-4,1,k%4===0?M:F);px(c,xx+2,yy,1,1,RAMP.gold[3]);px(c,xx+W-3,yy,1,1,RAMP.gold[3])}
  if(pct>=100){px(c,x+2,y+3,W-4,2,RAMP.gold[4])}
  px(c,x+2,y+4,W-4,1,RAMP.gold[3]);px(c,x+1,y+2,1,H-8,RAMP.gold[2]);px(c,x+W-2,y+2,1,H-8,RAMP.gold[1]);
  emblem(c,kind,x+7,y+10,col);
  // brass plaque with the percentage
  const txt=Math.round(pct)+'%',tw=txt.length*4-1;px(c,x+W/2-tw/2-2,y+H+6,tw+4,9,RAMP.wood[1]);px(c,x+W/2-tw/2-1,y+H+7,tw+2,7,RAMP.gold[2]);pixText(c,txt,x+W/2-tw/2,y+H+8,RAMP.wood[0]);
}
function court(){return COURT}
var CDY=14;// the throne, dais and everything on them sit this far below the banners, so each banner's plaque shows above the throne
const COURT={cv:null,ctx:null,W:432,H:320,OX:0,OY:0,t0:0,sent:null,hit:null,parts:[],people:{},banners:[],cam:null};
// the hall carries on past the dais in every direction, so zooming out fills the screen with castle
function courtBG(){
  const {W,H,OX,OY,FW,FH}=COURT,[cv,c]=mk(FW,FH),S=RAMP.stone,WB=OY+86+CDY,cx=OX+W/2;
  // back wall, carried up and out
  px(c,0,0,FW,WB,S[1]);for(let yy=WB-82;yy>-6;yy-=6){px(c,0,yy,FW,1,S[0]);for(let xx=(((WB-82-yy)/6)%2?8:0)+((OX)%16);xx<FW;xx+=16)px(c,xx,yy-5,1,5,S[0])}
  for(let yy=WB-86;yy>-6;yy-=6)px(c,0,yy+1,FW,1,shade(S[1],.12));
  for(let yy=WB-120;yy>0;yy-=72){px(c,0,yy,FW,4,S[0]);px(c,0,yy,FW,1,S[2])}
  px(c,0,WB-6,FW,6,S[0]);px(c,0,WB-6,FW,1,S[2]);
  // tall arched windows all along the hall
  const win=wx=>{const y0=OY+14;px(c,wx,y0,22,48,S[0]);px(c,wx+2,y0+4,18,42,'#7ab0e0');disc(c,wx+11,y0+6,9,'#7ab0e0');px(c,wx+10,y0,2,46,S[0]);px(c,wx+2,y0+22,18,2,S[0]);px(c,wx+4,y0+8,4,10,'#b8dcf8');px(c,wx,y0+46,22,3,S[2])};
  win(OX+18);win(OX+W-40);for(let wx=OX+18-96;wx>-30;wx-=96)win(wx);for(let wx=OX+W-40+96;wx<FW+10;wx+=96)win(wx);
  // checked floor everywhere, red carpet running the length of the hall
  for(let y=WB;y<FH;y+=16)for(let x=OX%16-16;x<FW;x+=16){const d=(((x-OX)+(y-OY))/16)%2!==0;px(c,x,y,16,16,d?S[2]:S[3]);px(c,x,y,16,1,d?S[3]:S[4]);px(c,x,y+15,16,1,S[1])}
  px(c,cx-18,OY+110+CDY,36,FH-OY-110,'#8a2030');px(c,cx-16,OY+110+CDY,32,FH-OY-110,'#b02a3a');px(c,cx-18,OY+110+CDY,2,FH-OY-110,RAMP.gold[2]);px(c,cx+16,OY+110+CDY,2,FH-OY-110,RAMP.gold[2]);for(let y=OY+118+CDY;y<FH;y+=12)px(c,cx-2,y,4,4,RAMP.gold[2]);
  // dais and steps
  for(let s=0;s<3;s++){const w=150-s*20,y=OY+88+CDY+s*8;px(c,cx-w/2,y,w,8,S[3]);px(c,cx-w/2,y,w,1,S[4]);px(c,cx-w/2,y+7,w,1,S[1])}
  px(c,cx-30,OY+88+CDY,60,22,'#b02a3a');px(c,cx-30,OY+88+CDY,60,2,'#d04050');px(c,cx-30,OY+108+CDY,60,2,RAMP.gold[2]);
  // rows of pillars down both sides of the hall
  COURT.sconces=[];
  const pillar=(x,y)=>{px(c,x,y-60,16,70,S[3]);px(c,x,y-60,3,70,S[4]);px(c,x+13,y-60,3,70,S[1]);px(c,x-2,y-62,20,4,S[4]);px(c,x-2,y+6,20,4,S[2])};
  const cols=[OX+44,OX+W-60];for(let x=OX+44-112;x>-20;x-=112)cols.push(x);for(let x=OX+W-60+112;x<FW+4;x+=112)cols.push(x);
  for(const x of cols)for(let y=WB;y<FH+128;y+=128){pillar(x,y);if(true)COURT.sconces.push([x+8-OX,y-40-OY])}
  return cv;
}
function drawCourt(t,dt){
  const C=COURT,c=C.ctx;if(!c)return;
  if(!C.bg)C.bg=courtBG();
  c.setTransform(1,0,0,1,0,0);c.drawImage(C.bg,0,0);c.setTransform(1,0,0,1,C.OX,C.OY);
  const {W,H}=C,cx=W/2,L=lighting(),lights=[];
  // light through the windows by day
  if(!L.night){c.fillStyle='rgba(255,240,190,.14)';for(const wx of [18,W-40]){c.beginPath();c.moveTo(wx+2,60);c.lineTo(wx+20,60);c.lineTo(wx+60*(wx<cx?1:-1)+20,H);c.lineTo(wx+60*(wx<cx?1:-1),H);c.fill()}}
  // a banner per project
  const projs=[...villages.values()].filter(v=>v.thKey!=='crown');
  const n=projs.length,span=W-150,gap=n>1?span/(n-1):0;
  C.banners=[];projs.forEach((v,i)=>{const bx=Math.round(64+i*gap)-11,rm=ROADMAPS[v.name],pct=projectProgress(v).pct;banner(c,bx,8,themeColour(v),EMBLEM[v.thKey]||'coin',pct,t);C.banners.push({x:bx-3,y:6,w:28,h:62,v,pct,next:rm&&rm.next||''})});
  // wall sconces along the hall
  for(const [sx,sy] of C.sconces||[]){const f=Math.floor(t*8+sx)%2;px(c,sx-2,sy+4,4,3,RAMP.gold[1]);px(c,sx-2,sy-1-f,4,5,'#ff9a3c');px(c,sx-1,sy-3-f,2,3,'#ffe07a');lights.push([sx,sy,34])}
  // braziers, throne, the monarch and the scroll table sit CDY lower than the banners
  const nL=lights.length,nB=bubbleQ2.length;c.translate(0,CDY);
  // braziers
  for(const bx of [cx-62,cx+62]){px(c,bx-6,96,12,4,RAMP.gold[1]);px(c,bx-2,100,4,12,RAMP.gold[0]);px(c,bx-8,92,16,5,RAMP.gold[2]);const f=Math.floor(t*10+bx)%3;px(c,bx-5,84-f,10,9+f,'#ff7a2a');px(c,bx-3,80-f,6,8,'#ffb03a');px(c,bx-1,77-f,2,5,'#ffe07a');lights.push([bx,88,58]);if(Math.random()<.2)C.parts.push({x:bx+rnd(-3,3),y:80,vx:rnd(-4,4),vy:-18,life:.8,c:'#ffd86b'})}
  // the throne
  px(c,cx-14,58,28,40,RAMP.gold[1]);px(c,cx-12,60,24,36,RAMP.gold[2]);px(c,cx-9,64,18,28,'#8a2030');px(c,cx-8,65,16,26,'#b02a3a');for(const k of [-12,0,10])px(c,cx+k,54,3,6,RAMP.gold[3]);px(c,cx-1,52,2,3,'#c43a3a');
  px(c,cx-16,86,32,10,RAMP.gold[2]);px(c,cx-16,86,32,2,RAMP.gold[3]);
  // the King: the overseer lane
  const kingL=(villages.get('The Crown')||{lanes:[]}).lanes[0];const ks=kingL?effState(kingL):'working';
  const sentRecently=C.sent&&t-C.sent>4&&t-C.sent<8;if(typeof SND!=='undefined'&&SND.on&&active===COURT){if(Math.random()<dt*2.2)sfx3(C,cx-62,88,'crackle',.7);if(Math.random()<dt*2.2)sfx3(C,cx+62,88,'crackle',.7);if(sentRecently&&Math.random()<dt*1.6)sfx3(C,cx,70,'chatter')}
  const kingPose=ks==='idle'?'sit':(sentRecently||Math.floor(t/3)%3===0)?'talk':'sit';
  const kspec=classFor('overseer','#f2c94c','overseer');
  drawHero(c,cx,96,Object.assign({},kspec,{dir:'down',pose:sentRecently?'talk':'sit',frame:Math.floor(t*4),sleep:ks==='idle'&&Math.floor(t/2)%2===0,breath:Math.floor(t*1.5)%2}));
  if(ks==='idle')bubbleQ2.push([cx,56,'z']);else if(sentRecently)bubbleQ2.push([cx,56,'chat']);
  // a small table beside the throne, the scroll of asks rolled on it with its end hanging over the edge
  {const open=ASKS.filter(a=>a.status!=='answered'),tx=cx+24,ty=90,Wd=RAMP.wood,hang=6+Math.min(open.length,5)*4;
   ellipseShadow(c,tx+11,ty+18,12,2,.3);px(c,tx+2,ty+4,2,14,Wd[0]);px(c,tx+18,ty+4,2,14,Wd[0]);px(c,tx,ty,22,5,Wd[2]);px(c,tx,ty,22,1,Wd[3]);px(c,tx,ty+4,22,1,Wd[0]);
   for(let yy=0;yy<hang;yy++)px(c,tx+6,ty+2+yy,10,1,yy%2?'#f2e6c4':'#ece0bc');px(c,tx+6,ty+2+hang,10,1,'#c8b48a');
   open.slice(0,5).forEach((a,i)=>{const pv=villages.get(a.project);px(c,tx+7,ty+4+i*4,2,2,pv?themeColour(pv):'#8a7a5a');px(c,tx+10,ty+5+i*4,5,1,'#8a7a5a');if(a.urgent)px(c,tx+15,ty+4+i*4,1,2,'#c43a3a')});
   px(c,tx+4,ty-3,14,4,'#ece0bc');px(c,tx+4,ty-3,14,1,'#fff6dc');disc(c,tx+4,ty-1,2,'#c8b48a');disc(c,tx+18,ty-1,2,'#c8b48a');
   if(open.length&&Math.floor(t*2)%2===0)px(c,tx+10,ty-8,2,3,'#f0b440');
   C.hit={x:tx-3,y:ty-8+CDY,w:28,h:hang+20}}
  c.translate(0,-CDY);for(let k=nL;k<lights.length;k++)lights[k][1]+=CDY;for(let k=nB;k<bubbleQ2.length;k++)bubbleQ2[k][1]+=CDY;
  gameCourtDraw(c,t);
  if(typeof drawCouncilTable==='function'){drawCouncilTable(c,t);drawCourtQueue(c,t)}
  // guards by the door and a herald who runs out when a decree is sent
  [[cx-36,184],[cx+36,184],[cx-36,244],[cx+36,244],[cx-36,304],[cx+36,304]].forEach(([gx,gy],k)=>drawHero(c,gx,gy,Object.assign(guardSpec(k),{dir:gx<cx?'right':'left',pose:'idle',breath:Math.floor(t*1.4+k)%2})));
  // one messenger per town the decree goes to: they file in up the carpet, line up before the throne, take their scrolls and leave
  const nM=Math.min(8,C.sentN||1);if(C.sent&&t-C.sent<13+nM*.6){const far=H+(C.OY?Math.min(C.OY,90):40);
    for(let k=0;k<nM;k++){const e=t-C.sent-k*.6;if(e<0||e>13)continue;const lx=cx+6+Math.round((k-(nM-1)/2)*18),near=118+CDY+(k%2)*6;let y,x,dir,walk=true,pose='idle',item='none';
      if(e<4.5){const f=e/4.5;y=far+(near-far)*f;x=f<.7?cx+6:cx+6+(lx-cx-6)*((f-.7)/.3);dir=f<.7||Math.abs(lx-cx-6)<2?'up':(lx>cx+6?'right':'left')}
      else if(e<8){y=near;x=lx;dir='up';walk=false;pose=Math.floor(e*2+k)%2?'talk':'idle';if(e>6)item='scroll'}
      else{const f=(e-8)/5;y=near+(far-near)*f;x=f<.3?lx+(cx+6-lx)*(f/.3):cx+6;dir=f<.3&&Math.abs(lx-cx-6)>2?(lx>cx+6?'left':'right'):'down';item='scroll'}
      drawHero(c,x,y,Object.assign(heraldSpec(),{dir,walk,frame:Math.floor(t*8+k),pose,item,breath:Math.floor(t*1.5+k)%2}));
      if(walk&&k===0&&Math.floor(t*4)!==C.stepK){C.stepK=Math.floor(t*4);sfx3(C,x,y,'step',.8)}
      if(!walk&&k===0)bubbleQ2.push([x,y-40,e<6?'...':'scroll'])}}
  C.parts=C.parts.filter(q=>(q.life-=dt)>0);for(const q of C.parts){q.x+=q.vx*dt;q.y+=q.vy*dt;px(c,q.x,q.y+CDY,1,1,q.c)}
  c.setTransform(1,0,0,1,0,0);
  applyLight(c,C.FW,C.FH,{dark:L.night?.38:.12,tint:'30,20,46',night:1,indoor:1},lights.map(([x,y,r])=>[x+C.OX,y+C.OY,r]));
  c.setTransform(1,0,0,1,C.OX,C.OY);
  for(const [x,y,k] of bubbleQ2.splice(0))bubble(c,x,y,k,t);
  if(C.sel==='king'){const ay=46+CDY-Math.round(Math.abs(Math.sin(t*4))*3);px(c,cx-5,ay-5,11,2,'#f0b440');px(c,cx-4,ay-3,9,2,'#f0b440');px(c,cx-2,ay-1,5,2,'#f0b440');px(c,cx-1,ay+1,3,1,'#f0b440')}
  c.setTransform(1,0,0,1,0,0);
}
const bubbleQ2=[];
function themeColour(v){const L=v.lanes.find(l=>/owner|coord|lead|product/.test(l.role.toLowerCase()));return ({capital:'#c43a3a',port:'#2f8a8a',village:'#d8a63a',river:'#3f6ea8',arcane:'#7a4ab0',cave:'#8a6a3a'})[v.thKey]||'#6a6a8a'}

// ===================== Asset Pack sheet =====================
const PACK_CLASSES=[['owner','#e8c547'],['design','#b07ad6'],['content','#e8a0b0'],['ios','#9fc0e6'],['android','#7ccf6b'],['website','#f08a4b'],['backend','#c58a4a'],['qa','#5fb3c9'],['analyst','#8fa6e8'],['exercise','#f06f5a'],['recipes','#e07b8a'],['trading desk','#d8b24a']];
function packSections(){return [
  {title:'PALETTE',h:64,draw:(c,W,y)=>{let x=0,row=0;for(const [k,r] of Object.entries(RAMP)){r.forEach((col,i)=>px(c,x+i*6,y+row*20,6,12,col));x+=36;if(x+36>W){x=0;row++}}}},
  {title:'GROUND AND PATHS',h:40,draw:(c,W,y)=>{const tiles=[(c,x,y)=>grassTile(c,x,y,1),(c,x,y)=>grassTile(c,x,y,2),(c,x,y)=>grassTile(c,x,y,4),(c,x,y)=>tallGrassTile(c,x,y),(c,x,y)=>grassTile(c,x,y,5,RAMP.moss),(c,x,y)=>{px(c,x,y,16,16,RAMP.cave[2])},(c,x,y)=>cobbleTile(c,x,y,7,RAMP.cobble),(c,x,y)=>cobbleTile(c,x,y,9,RAMP.stone),(c,x,y)=>flagTile(c,x,y,3,RAMP.stone),(c,x,y)=>plankTile(c,x,y,5),(c,x,y)=>dirtTile(c,x,y,6),(c,x,y)=>dirtTile(c,x,y,6,RAMP.cave)];
    tiles.forEach((f,i)=>{for(let k=0;k<2;k++)for(let j=0;j<2;j++)f(c,i*36+k*16,y+j*16)})}},
  {title:'TREES',h:52,draw:(c,W,y)=>{let x=0;for(const v of [0,1,2,3]){drawTree(c,x,y,v);x+=42}for(const v of [0,1]){drawPine(c,x,y+2,v);x+=32}for(const v of [0,1]){drawBush(c,x,y+30,v);x+=26}}},
  {title:'PROPS',h:40,draw:(c,W,y)=>{let x=4,row=0;for(const k of Object.keys(PROPS)){const w=PROPS[k][0];if(x+w>W){x=4;row++}drawProp(c,k,x+w/2,y+row*40+34);x+=w+8}}},
  {title:'CHARACTERS',h:PACK_CLASSES.length*0+0,draw:null},
]}
function renderPack(cv,W){
  const secs=packSections();
  const propRows=(()=>{let x=4,rows=1;for(const k of Object.keys(PROPS)){const w=PROPS[k][0];if(x+w>W){x=4;rows++}x+=w+8}return rows})();
  secs[3].h=propRows*40;
  const charH=PACK_CLASSES.length*46+3*46+140, bH=typeof TYPES!=='undefined'?6*120+80:0;
  const H=secs.reduce((s,a)=>s+a.h+18,0)+charH+bH+40;
  cv.width=W;cv.height=H;const c=cv.getContext('2d');c.imageSmoothingEnabled=false;
  px(c,0,0,W,H,'#2a2a3a');
  let y=4;
  const label=(t)=>{c.fillStyle='#f0b440';c.font='8px monospace';c.fillText(t,2,y+8);y+=14};
  for(const s of secs.slice(0,4)){label(s.title);s.draw(c,W,y);y+=s.h+4}
  label('CHARACTERS · down, left, up, right · walk frames · variety');
  PACK_CLASSES.forEach(([r,col],i)=>{const base=classFor(r,col,r);const yy=y+i*46+40;
    ['down','left','up','right'].forEach((d,j)=>drawHero(c,14+j*26,yy,Object.assign({},base,{dir:d})));
    [0,1,2,3].forEach((f,j)=>drawHero(c,124+j*26,yy,Object.assign({},base,{dir:'down',walk:1,frame:f})));
    [1,2,3].forEach((k,j)=>{const v=classFor(r,col,r+'#'+k);drawHero(c,236+j*26,yy,Object.assign({},v,{dir:'down'}))});
    c.fillStyle='#d8d4c8';c.font='8px monospace';c.fillText(base.title,320,yy-14)});
  y+=charH+6;
  label('POSES · idle, walk, work, talk, cheer, sit, carry, wave');
  {const poses=[['idle',{}],['walk',{walk:1,frame:1}],['swing',{pose:'swing',frame:0}],['talk',{pose:'talk',frame:1}],['cheer',{pose:'cheer',frame:0}],['sit',{pose:'sit'}],['carry',{pose:'carry'}],['wave',{pose:'wave',frame:1}]];
   ['owner','android','analyst'].forEach((r,row)=>{const col=PACK_CLASSES.find(x=>x[0]===r)[1],b=classFor(r,col,r);poses.forEach(([n,o],j)=>drawHero(c,16+j*30,y+row*46+40,Object.assign({},b,{dir:'down'},o)))});
   y+=3*46+6}
  label('STRIKES · wind up, hit, recover · hammer, pick, hoe, sword');
  {let x=16;[['android','left'],['android','down'],['backend','up'],['recipes','down'],['qa','left']].forEach(([r,d])=>{const col=PACK_CLASSES.find(q=>q[0]===r)[1],b=classFor(r,col,r);[0,2,3].forEach(fr=>{drawHero(c,x,y+40,Object.assign({},b,{dir:d,pose:'swing',frame:fr}));x+=26});x+=10});y+=52}
  label('MESSENGERS AND TOWNSFOLK · couriers, the Royal Herald, the barmaid · on the map: mounted courier and herald, four facings');
  {const cols=['#c43a3a','#2f8a8a','#d8b45a','#4a6ab0'];cols.forEach((col,j)=>drawHero(c,16+j*30,y+40,Object.assign(courierSpec(col,'pk'+j),{dir:['down','left','down','right'][j],walk:j%2,frame:1})));
   ['down','left','up'].forEach((d,j)=>drawHero(c,150+j*30,y+40,Object.assign(heraldSpec(),{dir:d})));
   [0,1,2].forEach(j=>drawHero(c,260+j*30,y+40,Object.assign(barmaidSpec('pk'+j),{dir:'down'})));
   ['down','left','up','right'].forEach((d,j)=>{drawRider(c,370+j*30,y+40,'courier','#c43a3a',d,j%2);drawRider(c,500+j*30,y+40,'royal','#6a2a9a',d,j%2)});y+=52}
  if(bH){label('BUILDINGS · rows: capital, harbour, village, riverside, glade, cave · finished, then half built');
    const mats=['capital','port','village','river','arcane','cave'],types=['keep','guild','smithy','shop','farm','inn','cottage','tower','mage','mine','yard','vault'];
    let yy=y;for(const m of mats){let x=0,rowH=0;for(const t of types){if((m==='cave')!==(t==='vault'||t==='mine'||t==='yard'))continue;const T=TYPES[t],img=buildingBody(T,m,100,false,false,'#c43a3a');if(x+img.width>W){x=0;yy+=rowH;rowH=0}c.drawImage(img,x,yy);x+=img.width-6;rowH=Math.max(rowH,img.height)}
      const half=buildingBody(TYPES.cottage,m==='cave'?'cave':m,55,false,false,'');if(x+half.width<=W)c.drawImage(half,x,yy);yy+=rowH}
    y=yy}
  const keep=Math.min(H,y+12),[tc,tx]=mk(W,keep);tx.drawImage(cv,0,0);cv.height=keep;cv.getContext('2d').drawImage(tc,0,0);
  return keep;
}

