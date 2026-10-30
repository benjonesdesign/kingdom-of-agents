// Kingdom of Agents, part 1 of 3. The parts share one scope and load in order from kingdom.html.
// ===================== Kingdom pack: core kit =====================
// Style rules: hue-shifted ramps (shadows lean purple-blue, highlights lean warm), light from the top-left,
// selective coloured outlines (each edge takes a dark version of the colour it borders, heavier on the shadow side),
// calm ground with sparse detail, soft drop shadows under everything.
const TS=16;
const hash=s=>{let h=2166136261;for(const ch of String(s)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0};
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const rnd=(a,b)=>a+Math.random()*(b-a);
function hexRgb(h){const n=parseInt(h.slice(1),16);return[n>>>16&255,n>>>8&255,n&255]}
function rgbHex(r,g,b){return '#'+[r,g,b].map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('')}
function mixHex(a,b,t){const A=hexRgb(a),B=hexRgb(b);return rgbHex(A[0]+(B[0]-A[0])*t,A[1]+(B[1]-A[1])*t,A[2]+(B[2]-A[2])*t)}
const SH={};function shade(c,a){const k=c+a;if(SH[k])return SH[k];return SH[k]=a<0?mixHex(c,'#2a1c48',-a):mixHex(c,'#fff2c4',a)}
function px(c,x,y,w,h,col){c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))}
function mk(w,h){const cv=document.createElement('canvas');cv.width=w;cv.height=h;const c=cv.getContext('2d');c.imageSmoothingEnabled=false;return [cv,c]}
// selective coloured outline: each new outline pixel is a dark, cool version of the pixel it borders
function outline(cv){
  const c=cv.getContext('2d'),w=cv.width,h=cv.height,d=c.getImageData(0,0,w,h),a=d.data,o=new Uint8ClampedArray(a);
  const dark=(i,k)=>[a[i]*k+26*(1-k),a[i+1]*k+16*(1-k),a[i+2]*k+46*(1-k)];
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;if(a[i+3]>40)continue;
    let src=-1,k=.34;
    if(y>0&&a[i-w*4+3]>200){src=i-w*4;k=.26}            // pixel above: we are its bottom edge (shadow side)
    else if(x>0&&a[i-1]>200){src=i-4;k=.3}               // pixel left: right edge
    else if(x<w-1&&a[i+7]>200){src=i+4;k=.42}            // pixel right: left edge (lit)
    else if(y<h-1&&a[i+w*4+3]>200){src=i+w*4;k=.46}      // pixel below: top edge (lit)
    if(src<0)continue;const [r,g,b]=dark(src,k);o[i]=r;o[i+1]=g;o[i+2]=b;o[i+3]=255}
  d.data.set(o);c.putImageData(d,0,0);return cv;
}
const CACHE=new Map();
function cached(key,w,h,fn,line=true){let cv=CACHE.get(key);if(cv)return cv;const [nc,c]=mk(w,h);fn(c);if(line)outline(nc);CACHE.set(key,nc);if(CACHE.size>1400)CACHE.delete(CACHE.keys().next().value);return nc}
function ellipseShadow(c,cx,cy,rx,ry,a=.25){c.fillStyle=`rgba(30,18,52,${a})`;for(let y=-ry;y<=ry;y++){const hw=Math.round(rx*Math.sqrt(1-(y*y)/(ry*ry+.01)));c.fillRect(Math.round(cx-hw),Math.round(cy+y),hw*2,1)}}
function disc(c,cx,cy,r,col){for(let y=-r;y<=r;y++){const hw=Math.round(Math.sqrt(r*r-y*y));px(c,cx-hw,cy+y,hw*2,1,col)}}

// ---- master palette (ramps run dark → light) ----
const RAMP={
  grass:['#3c6a3a','#4e8a3e','#68a648','#86c056','#acd870'],
  leaf: ['#1e4a36','#2a6440','#3e8446','#5ea650','#8cc864'],
  autumn:['#6a2a2a','#a43e2a','#d0642e','#e8963e','#f6c45a'],
  pine: ['#163a34','#1e5040','#2a6a4a','#3e8a54','#62a85e'],
  dirt: ['#6a4430','#8a5c3a','#ab7a4c','#c99a62','#e0bc80'],
  cobble:['#7a4a34','#a8683e','#cc8a52','#e0a868','#f0c884'],
  stone:['#4a4858','#686878','#8c8c9a','#adadb8','#cfcfd6'],
  slate:['#2c3458','#3e4a78','#56669a','#7486b8','#9aaad0'],
  tile: ['#6a2a2a','#9a3a30','#c4523a','#dc7650','#eca070'],
  thatch:['#7a5a2a','#a07a36','#c8a04a','#e0c068','#f2dc90'],
  wood: ['#4a2e22','#6a4228','#8e5a34','#b07a48','#d09c64'],
  plaster:['#b8a68a','#d6c6a6','#ebdfc4','#f6eedc','#fffaee'],
  water:['#1c3470','#24489a','#3266c0','#4c8ad8','#8cc4f0'],
  gold: ['#7a4a1a','#b4741e','#e0a62a','#f4cc4a','#fff09a'],
  moss: ['#2a5440','#3a6e4a','#4e8a56','#6aa862','#94c878'],
  cave: ['#2a2420','#3a322c','#4c4238','#62564a','#7a6c5c'],
};
const PAL={grass:RAMP.grass[2],grassD:RAMP.grass[1],grassDD:RAMP.grass[0],grassL:RAMP.grass[3],
  tall:RAMP.leaf[2],tallD:RAMP.leaf[1],tallL:RAMP.leaf[3],
  sand:'#e6cc8e',sandD:'#c8a86a',sandDD:'#a8884e',sandL:'#f4e2b2',
  leafDD:RAMP.leaf[0],leafD:RAMP.leaf[1],leaf:RAMP.leaf[2],leafL:RAMP.leaf[3],leafLL:RAMP.leaf[4],trunk:RAMP.wood[1],trunkL:RAMP.wood[2],
  water:RAMP.water[2],waterD:RAMP.water[1],waterDD:RAMP.water[0],waterL:RAMP.water[3],foam:'#e4f4ff',
  stone:RAMP.stone[2],stoneD:RAMP.stone[1],stoneDD:RAMP.stone[0],stoneL:RAMP.stone[3],
  wood:RAMP.wood[2],woodD:RAMP.wood[1],woodDD:RAMP.wood[0],woodL:RAMP.wood[3],
  dirt:RAMP.dirt[2],dirtD:RAMP.dirt[1],dirtL:RAMP.dirt[3],metal:'#4e5466',metalL:'#8a92a6'};

// ---- ground: calm base, sparse detail ----
function grassTile(c,x,y,h,R=RAMP.grass){
  px(c,x,y,16,16,R[2]);
  const k=h%13;
  if(k<3){const bx=x+2+(h>>>4)%10,by=y+4+(h>>>8)%9;px(c,bx,by,1,2,R[1]);px(c,bx+1,by-1,1,3,R[1]);px(c,bx+3,by,1,2,R[1]);px(c,bx+1,by-1,1,1,R[3]);px(c,bx+3,by,1,1,R[3])}
  else if(k===3){const bx=x+3+(h>>>4)%9,by=y+3+(h>>>8)%9;px(c,bx,by,1,1,R[3]);px(c,bx+4,by+3,1,1,R[3])}
  else if(k===4){const bx=x+3+(h>>>4)%9,by=y+5+(h>>>8)%7;px(c,bx,by,3,2,RAMP.stone[2]);px(c,bx,by,2,1,RAMP.stone[3]);px(c,bx,by+2,3,1,R[1])}
}
// soft large patches of lighter / darker grass, dithered at the edges
function groundPatches(c,W,H,seed,R=RAMP.grass,skip){
  for(let k=0;k<Math.round(W*H/5000);k++){const hh=hash(seed+'gp'+k),cx=hh%W,cy=(hh>>>9)%H,r=10+(hh>>>18)%18,col=(k%3===0)?R[3]:R[1];
    for(let y=-r;y<=r;y++){const hw=Math.round(r*1.4*Math.sqrt(1-(y*y)/(r*r)));for(let x=-hw;x<=hw;x++){const xx=cx+x,yy=cy+y;if(xx<0||yy<0||xx>=W||yy>=H)continue;if(skip&&skip(xx,yy))continue;
      const edge=(Math.abs(x)>hw-3||Math.abs(y)>r-2);if(edge&&((xx+yy)%2))continue;c.fillStyle=col;c.fillRect(xx,yy,1,1)}}}
}
function tallGrassTile(c,x,y,R=RAMP.leaf){
  for(let i=0;i<4;i++)for(let j=0;j<2;j++){const ox=x+i*4,oy=y+j*8;
    px(c,ox,oy+3,1,5,R[1]);px(c,ox+1,oy+1,1,7,R[2]);px(c,ox+2,oy+2,1,6,R[2]);px(c,ox+3,oy+4,1,4,R[1]);
    px(c,ox+1,oy+1,1,1,R[4]);px(c,ox+2,oy+2,1,1,R[3]);px(c,ox,oy+3,1,1,R[3])}
}
// ---- paths: rounded cobbles / flagstones / planks / packed dirt ----
function stoneBlob(c,x,y,w,h,R){px(c,x+1,y,w-2,h,R[2]);px(c,x,y+1,w,h-2,R[2]);px(c,x+1,y,w-2,1,R[3]);px(c,x,y+1,1,h-3,R[3]);px(c,x+2,y+1,Math.max(1,w-5),1,R[4]);px(c,x+1,y+h-1,w-2,1,R[1]);px(c,x+w-1,y+2,1,h-3,R[1])}
function cobbleTile(c,x,y,h,R){
  px(c,x,y,16,16,R[0]);
  const rows=[[0,8],[8,8]];
  rows.forEach(([yy,hh],r)=>{let xx=-((h>>>(r*3))%7);while(xx<16){const w=7+((h>>>(Math.abs(xx)+r*7+8))%4);const sx=Math.max(0,xx),ew=Math.min(16,xx+w)-sx;if(ew>2)stoneBlob(c,x+sx,y+yy,ew,hh-1,R);xx+=w}});
}
function plankTile(c,x,y,h,R=RAMP.wood){px(c,x,y,16,16,R[2]);for(let r=0;r<4;r++){px(c,x,y+r*4+3,16,1,R[0]);px(c,x,y+r*4,16,1,R[3]);const n=(h>>>(r*4))%12;px(c,x+n,y+r*4,1,3,R[1]);px(c,x+(n+7)%16,y+r*4+1,1,1,R[1])}}
function flagTile(c,x,y,h,R){px(c,x,y,16,16,R[0]);stoneBlob(c,x,y,9,8,R);stoneBlob(c,x+9,y,7,8,R);stoneBlob(c,x,y+8,6,8,R);stoneBlob(c,x+6,y+8,10,8,R)}
function dirtTile(c,x,y,h,R=RAMP.dirt){px(c,x,y,16,16,R[3]);for(let k=0;k<4;k++){const hh=hash(h+'dt'+k),bx=x+1+hh%13,by=y+1+(hh>>>5)%13;if(k<2){px(c,bx,by,3,2,R[2]);px(c,bx,by,2,1,R[4])}else px(c,bx,by,1,1,R[1])}}
// ragged edge where a path meets grass: grass bites in, a few stones stray out
function pathEdges(c,x,y,h,e,GR,PR){
  const g=GR[2],gd=GR[1];
  if(e.t){for(let i=0;i<16;i+=2){const d=(hash(h+'t'+i)%3);px(c,x+i,y,2,d,g);if(d)px(c,x+i,y+d,2,1,gd)}}
  if(e.b){for(let i=0;i<16;i+=2){const d=(hash(h+'b'+i)%3);px(c,x+i,y+16-d,2,d,g)}px(c,x,y+15,16,1,'rgba(30,18,52,.18)')}
  if(e.l){for(let i=0;i<16;i+=2){const d=(hash(h+'l'+i)%3);px(c,x,y+i,d,2,g);if(d)px(c,x+d,y+i,1,2,gd)}}
  if(e.r){for(let i=0;i<16;i+=2){const d=(hash(h+'r'+i)%3);px(c,x+16-d,y+i,d,2,g)}}
}
// ---- trees ----
function oakSprite(v,R=RAMP.leaf,s=0){return cached('oak'+v+R[2]+'s'+s,42,46,c=>{c.translate(1,0);
  px(c,17,30,6,14,RAMP.wood[1]);px(c,17,30,2,14,RAMP.wood[2]);px(c,21,32,2,12,RAMP.wood[0]);px(c,14,42,4,2,RAMP.wood[1]);px(c,22,42,5,2,RAMP.wood[1]);
  const clumps=[[20,17,13],[11,21,8],[29,21,8],[14,11,8],[26,11,8],[20,7,7],[20,25,9]];
  const sx=(cy)=>cy<16?s:cy<22?Math.round(s/2):0;
  for(const [cx,cy,r] of clumps)disc(c,cx+sx(cy),cy,r,R[1]);
  for(const [cx,cy,r] of clumps){const o=sx(cy);disc(c,cx-1+o,cy-1,r-2,R[2]);disc(c,cx-2+o,cy-3,Math.max(2,r-5),R[3]);px(c,cx-3+o,cy-r+2,2,1,R[4])}
  for(let k=0;k<10;k++){const hh=hash('ok'+v+k);px(c,8+hh%24,8+(hh>>>5)%22,2,1,(k%2)?R[1]:R[4])}
  px(c,18,29,4,2,R[0]);
})}
function pineSprite(v,R=RAMP.pine,s=0){return cached('pn'+v+R[2]+'s'+s,32,44,c=>{c.translate(1,0);
  px(c,13,34,4,9,RAMP.wood[1]);px(c,13,34,1,9,RAMP.wood[2]);
  const tiers=[[15,30,13],[15,22,11],[15,15,9],[15,8,6]];
  for(const [cx0,cy,r] of tiers)for(let y=0;y<r;y++){const cx=cx0+(cy<16?s:0),w=Math.round((y+1)*1.9+2),xx=cx-Math.floor(w/2),yy=cy+y-r+4;px(c,xx,yy,w,1,R[1]);px(c,xx,yy,Math.ceil(w*.45),1,R[2]);px(c,xx,yy,2,1,R[3]);if(y===r-1)px(c,xx,yy,w,1,R[0])}
  px(c,14+s,2,2,4,R[2]);px(c,14+s,2,1,2,R[4]);
})}
function bushSprite(v,R=RAMP.leaf){return cached('bs'+v+R[2],22,16,c=>{for(const [cx,cy,r] of [[7,9,6],[14,8,6],[11,6,5]]){disc(c,cx,cy,r,R[1]);disc(c,cx-1,cy-1,r-2,R[2]);px(c,cx-2,cy-3,2,1,R[3])}if(v%2){px(c,6,6,2,2,'#e85a5a');px(c,14,4,2,2,'#e85a5a')}})}
function drawTree(c,x,y,v,s=0){const autumn=v>=2;const sp=oakSprite(v%2,autumn?RAMP.autumn:RAMP.leaf,s);ellipseShadow(c,x+20,y+44,13,3,.28);c.drawImage(sp,x-1,y)}
function drawPine(c,x,y,v,s=0){ellipseShadow(c,x+15,y+42,9,3,.28);c.drawImage(pineSprite(v%2,RAMP.pine,s),x-1,y)}
// wind follows the weather; each tree has its own phase
function windAt(t,ph){const k=typeof wxKind==='function'?wxKind():'';const sp=k==='storm'?3.4:(k==='rain'||k==='drizzle')?1.8:1;const amp=k==='storm'?1.4:1;return Math.max(-1,Math.min(1,Math.round(Math.sin(t*sp+ph)*amp*.85)))}
function drawBush(c,x,y,v){ellipseShadow(c,x+11,y+15,9,2,.22);c.drawImage(bushSprite(v),x,y)}
// ---- props library (bottom-centre anchored, cached, outlined) ----
const PROPS={
  barrel:[12,14,c=>{const W=RAMP.wood;px(c,2,1,8,12,W[2]);px(c,2,1,2,12,W[3]);px(c,8,1,2,12,W[1]);px(c,2,3,8,1,RAMP.stone[1]);px(c,2,9,8,1,RAMP.stone[1]);px(c,3,0,6,2,W[3]);px(c,4,0,4,1,W[1])}],
  crate:[14,13,c=>{const W=RAMP.wood;px(c,1,1,12,11,W[2]);px(c,1,1,12,2,W[3]);px(c,1,11,12,1,W[0]);px(c,1,6,12,1,W[1]);px(c,6,3,1,8,W[1]);px(c,2,3,1,8,W[3])}],
  sack:[12,12,c=>{px(c,2,3,8,8,'#c8b07a');px(c,3,2,6,2,'#d8c48e');px(c,8,4,2,7,'#a88e5a');px(c,5,1,2,2,'#8a6e44');px(c,4,6,2,2,'#e0d0a0')}],
  logs:[18,10,c=>{const W=RAMP.wood;for(const [x,y] of [[1,5],[7,5],[4,1]]){px(c,x,y,7,4,W[2]);px(c,x,y,7,1,W[3]);disc(c,x+1,y+2,2,W[3]);px(c,x+1,y+2,1,1,W[1])}}],
  stump:[14,12,c=>{const W=RAMP.wood;px(c,2,5,10,6,W[1]);px(c,2,5,3,6,W[2]);disc(c,7,5,5,W[3]);disc(c,7,5,3,W[4]);px(c,6,4,2,1,W[2]);px(c,9,0,1,5,W[0]);px(c,8,0,4,2,RAMP.stone[3])}],
  cart:[26,16,c=>{const W=RAMP.wood;px(c,2,4,20,6,W[2]);px(c,2,4,20,1,W[3]);px(c,2,9,20,1,W[0]);px(c,20,6,6,2,W[1]);for(const x of [5,16]){disc(c,x,11,4,W[1]);disc(c,x,11,2,W[3]);px(c,x,11,1,1,W[0])}px(c,4,1,6,3,'#c8b07a');px(c,11,2,5,2,RAMP.autumn[3])}],
  well:[26,28,c=>{const S=RAMP.stone,W=RAMP.wood;px(c,3,14,20,12,S[2]);for(let y=16;y<26;y+=4){px(c,3,y,20,1,S[1])}px(c,3,14,20,2,S[3]);px(c,6,12,14,3,RAMP.water[1]);px(c,4,2,2,13,W[1]);px(c,20,2,2,13,W[1]);px(c,2,0,22,3,RAMP.tile[2]);px(c,2,0,22,1,RAMP.tile[3]);px(c,12,3,1,8,'#c8b07a');px(c,10,9,5,4,W[2])}],
  lamp:[10,28,c=>{px(c,4,8,2,19,'#4e5466');px(c,4,8,1,19,'#8a92a6');px(c,2,26,6,2,'#4e5466');px(c,1,1,8,8,'#4e5466');px(c,2,2,6,6,'#ffe07a');px(c,2,2,2,2,'#fff6c8');px(c,3,0,4,1,'#4e5466')}],
  fence:[16,12,c=>{const W=RAMP.wood;for(const x of [1,7,13]){px(c,x,1,2,11,W[2]);px(c,x,1,1,11,W[3]);px(c,x,0,2,1,W[3])}px(c,0,4,16,2,W[3]);px(c,0,8,16,2,W[2])}],
  picket:[16,10,c=>{for(const x of [1,5,9,13]){px(c,x,1,2,9,'#f4eee0');px(c,x+1,1,1,9,'#d8d0c0');px(c,x,0,2,1,'#ffffff')}px(c,0,3,16,1,'#e8e0d0');px(c,0,7,16,1,'#e8e0d0')}],
  palisade:[16,16,c=>{const W=RAMP.wood;for(let x=0;x<16;x+=4){px(c,x,3,4,13,W[2]);px(c,x,3,1,13,W[3]);px(c,x+3,3,1,13,W[1]);px(c,x+1,0,2,3,W[2]);px(c,x+1,0,1,1,W[3])}px(c,0,8,16,1,W[0])}],
  hay:[20,14,c=>{const T=RAMP.thatch;disc(c,10,9,8,T[2]);px(c,2,9,16,5,T[2]);disc(c,8,7,5,T[3]);for(let k=0;k<8;k++){const hh=hash('hy'+k);px(c,3+hh%14,4+(hh>>>5)%9,1,2,T[1])}px(c,2,13,16,1,T[0])}],
  pot:[10,12,c=>{px(c,2,6,6,6,RAMP.tile[2]);px(c,2,6,2,6,RAMP.tile[3]);px(c,1,5,8,2,RAMP.tile[3]);disc(c,5,3,3,RAMP.leaf[2]);px(c,3,1,2,2,'#e85a8a');px(c,6,2,2,2,'#f2c94c')}],
  rock:[16,11,c=>{const S=RAMP.stone;disc(c,8,7,6,S[1]);disc(c,7,6,5,S[2]);disc(c,6,5,3,S[3]);px(c,5,3,2,1,S[4]);px(c,2,9,12,2,S[1])}],
  rocks:[20,10,c=>{const S=RAMP.stone;disc(c,6,6,4,S[2]);disc(c,5,5,2,S[3]);disc(c,14,7,3,S[2]);disc(c,13,6,1,S[4]);px(c,2,8,16,2,S[1])}],
  mushroom:[12,12,c=>{px(c,5,6,2,6,'#f0e6d4');disc(c,6,5,5,'#c8402e');px(c,1,6,10,1,'#9a2a20');px(c,3,2,2,2,'#ffffff');px(c,7,3,2,1,'#ffffff')}],
  glowshroom:[12,12,c=>{px(c,5,6,2,6,'#e0d8f0');disc(c,6,5,5,'#8a5ae0');px(c,1,6,10,1,'#5a3ab0');px(c,3,2,2,2,'#e8dcff');px(c,7,3,2,1,'#c0a8ff')}],
  stall:[34,30,c=>{const W=RAMP.wood;px(c,3,10,2,20,W[1]);px(c,29,10,2,20,W[1]);for(let i=0;i<34;i++){const on=((i>>>2)%2)===0;px(c,i,4,1,7,on?'#3f6ea8':'#f4eee0');px(c,i,11,1,1,on?'#2c4e80':'#d0c8b8')}for(let i=0;i<34;i+=4)px(c,i,12,2,1,'#3f6ea8');px(c,4,20,26,4,W[2]);px(c,4,20,26,1,W[3]);px(c,4,24,26,6,W[1]);for(let k=0;k<6;k++)px(c,6+k*4,17,3,3,['#e85a5a','#f2c94c','#7ac862','#e88a3a','#e85a5a','#c0a8ff'][k])}],
  bench:[18,8,c=>{const W=RAMP.wood;px(c,1,1,16,3,W[3]);px(c,1,3,16,1,W[1]);px(c,2,4,2,4,W[0]);px(c,14,4,2,4,W[0])}],
  chest:[16,12,c=>{const W=RAMP.wood;px(c,1,4,14,8,W[2]);px(c,1,1,14,4,W[3]);px(c,1,4,14,1,RAMP.gold[2]);px(c,7,4,2,3,RAMP.gold[3]);px(c,1,11,14,1,W[0]);px(c,1,1,1,11,RAMP.gold[2]);px(c,14,1,1,11,RAMP.gold[2])}],
  gold:[24,12,c=>{const G=RAMP.gold;for(let y=0;y<9;y++){const w=Math.round(22-y*2.2);px(c,12-w/2,11-y,w,1,y%3?G[2]:G[1])}for(let k=0;k<9;k++){const hh=hash('gp'+k);px(c,4+hh%16,4+(hh>>>5)%6,2,1,G[4])}}],
  minecart:[22,16,c=>{px(c,2,3,18,9,'#5a5e6e');px(c,2,3,18,2,'#8a92a6');px(c,4,1,14,3,RAMP.gold[2]);px(c,6,0,3,2,RAMP.gold[4]);for(const x of [6,16]){disc(c,x,13,2,'#2a2a34')}}],
  torch:[8,20,c=>{px(c,3,8,2,12,RAMP.wood[1]);px(c,2,6,4,3,'#5a5e6e');px(c,2,1,4,5,'#ff8a2a');px(c,3,0,2,4,'#ffd86b')}],
  sign:[14,16,c=>{const W=RAMP.wood;px(c,6,8,2,8,W[1]);px(c,1,1,12,8,W[1]);px(c,2,2,10,6,W[3]);px(c,3,3,6,1,W[1]);px(c,3,5,8,1,W[1])}],
  woodpile:[20,14,c=>{const W=RAMP.wood;for(let r=0;r<3;r++)for(let k=0;k<3-r;k++){const x=2+k*6+r*3,y=9-r*4;disc(c,x+2,y+2,2,W[3]);px(c,x+2,y+2,1,1,W[1])}px(c,1,12,18,2,W[1])}],
  flowers:[14,8,c=>{for(let k=0;k<4;k++){const x=1+k*3,col=['#e85a5a','#f2c94c','#f4f0e0','#e88ad8'][k];px(c,x+1,3,1,5,RAMP.leaf[1]);px(c,x,2,3,1,col);px(c,x+1,1,1,3,col);px(c,x+1,2,1,1,'#fff09a')}}],
  anvil:[16,12,c=>{px(c,1,1,14,4,'#4e5466');px(c,1,1,14,1,'#8a92a6');px(c,0,1,3,2,'#4e5466');px(c,5,5,6,4,'#3a3e4c');px(c,3,9,10,3,'#2e3240')}],
  rail:[16,10,c=>{for(let x=0;x<16;x+=4)px(c,x,2,3,8,RAMP.wood[1]);px(c,0,3,16,1,'#8a92a6');px(c,0,7,16,1,'#8a92a6')}],
};
function propSprite(name){const p=PROPS[name];return cached('pr'+name,p[0]+2,p[1]+2,c=>{c.translate(1,1);p[2](c)})}
function drawProp(c,name,x,y){const p=PROPS[name];if(!p)return;ellipseShadow(c,x,y,Math.max(3,p[0]*.42),2,.24);c.drawImage(propSprite(name),Math.round(x-p[0]/2-1),Math.round(y-p[1]-1))}
// legacy helpers used by scenes
function flower(c,x,y,col,t){const f=Math.floor(t*1.5+x*.3)%2;px(c,x,y+1,1,4,RAMP.leaf[1]);px(c,x+1,y+3,2,1,RAMP.leaf[2]);const cx=x+(f?1:0);px(c,cx-1,y,1,1,col);px(c,cx+1,y,1,1,col);px(c,cx,y-1,1,1,col);px(c,cx,y+1,1,1,shade(col,-.25));px(c,cx,y,1,1,'#fff09a')}
function signpost(c,x,y,col){px(c,x+4,y+5,2,7,PAL.woodD);px(c,x,y,10,7,PAL.woodDD);px(c,x+1,y+1,8,5,PAL.woodL);px(c,x+2,y+2,6,3,col);px(c,x+2,y+2,6,1,shade(col,.3))}
function lamp(c,x,y,on){drawProp(c,'lamp',x+1,y+1);if(on){px(c,x-1,y-26,6,6,'#ffe07a');px(c,x,y-25,3,3,'#fff6c8')}}
function bench(c,x,y){drawProp(c,'bench',x+9,y+8)}
function barrel(c,x,y){drawProp(c,'barrel',x+6,y+14)}
function crate(c,x,y){drawProp(c,'crate',x+7,y+13)}
// ---- speech bubble ----
function bubble(c,x,y,kind,t){ // x = centre, y = bottom of bubble tail
  const bx=Math.round(x-8),by=Math.round(y-15);
  const art=cached('bub'+kind+(kind==='!'&&Math.floor(t*3)%3===0?'0':'')+(kind==='...'?Math.floor(t*2)%3:''),18,18,cc=>{
    px(cc,1,1,15,11,'#fffaf0');px(cc,2,0,13,1,'#fffaf0');px(cc,2,12,13,1,'#fffaf0');px(cc,6,13,3,1,'#fffaf0');px(cc,7,14,1,1,'#fffaf0');
    px(cc,2,10,13,2,'#e8e0d0');
    const k=kind;
    if(k==='!'&&!(Math.floor(t*3)%3===0)){px(cc,7,2,3,6,'#d63c34');px(cc,7,2,1,6,'#f06a5e');px(cc,7,9,3,2,'#d63c34')}
    else if(k==='?'){px(cc,5,2,6,2,'#3a6fd8');px(cc,9,4,2,2,'#3a6fd8');px(cc,7,6,2,2,'#3a6fd8');px(cc,7,9,2,2,'#3a6fd8')}
    else if(k==='z'){px(cc,4,3,8,2,'#6a78b0');px(cc,9,5,2,1,'#6a78b0');px(cc,7,6,2,1,'#6a78b0');px(cc,5,7,2,1,'#6a78b0');px(cc,4,8,8,2,'#6a78b0')}
    else if(k==='♪'){px(cc,5,7,3,3,'#e0587a');px(cc,8,2,2,7,'#e0587a');px(cc,8,2,4,2,'#e0587a');px(cc,5,7,1,1,'#f598ae')}
    else if(k==='mug'){px(cc,5,3,6,7,'#c88a3c');px(cc,5,3,6,2,'#fffaf0');px(cc,11,5,2,3,'#c88a3c');px(cc,6,5,1,4,'#e8b060')}
    else if(k==='scroll'){px(cc,4,3,10,7,'#f2e6c4');px(cc,3,2,12,2,'#c8a46a');px(cc,3,9,12,2,'#c8a46a');px(cc,6,5,6,1,'#8a7a5a');px(cc,6,7,4,1,'#8a7a5a')}
    else if(k==='chat'){px(cc,3,4,11,1,'#8a8296');px(cc,3,6,8,1,'#8a8296');px(cc,3,8,10,1,'#8a8296')}
    else {const n=1+(Math.floor(t*2)%3);for(let i=0;i<n;i++)px(cc,4+i*4,6,2,2,'#e8963a')}
  });
  c.drawImage(art,bx,by);
}


// the ruler on the throne is a King or a Queen, as chosen when the realm is founded
function isQueen(){try{return REALM.monarch==='queen'}catch(e){return false}}
function monarch(){return isQueen()?'Queen':'King'}
function monarchHis(){return isQueen()?'her':'his'}
// ===================== characters (Kingdom pack) =====================
// 1x2 tile figures, head about a third of the height, big readable hair silhouettes, 3-tone shading lit from the top-left.
// Three views (down, up, left) with right mirrored; 4-frame walk (contact, pass, contact, pass) with a 1px body bob.
const SKIN=[['#f8d8b8','#e8b08a','#c08060'],['#eec094','#d4966c','#a8684a'],['#c88c5e','#a86a44','#7a4a30'],['#8e5a3a','#6e4228','#4e2c1c'],['#f2d0b0','#dca88a','#b47c62']];
const HAIRS=['#3a2418','#6a3a1e','#a8642e','#e0b04a','#f0e2b0','#2a2634','#c44a34','#e8e8ee','#7a4ab0','#3a7a6a'];
const EYES=['#3e6ab0','#3a8a4a','#7a4a2a','#5a5a6a','#8a3ab0'];
const BUILDS={normal:{leg:6,tor:8,tw:10,hw:12,hh:11},tall:{leg:7,tor:9,tw:9,hw:11,hh:11},dwarf:{leg:4,tor:8,tw:13,hw:13,hh:10},small:{leg:4,tor:6,tw:9,hw:12,hh:10},squire:{leg:3,tor:5,tw:8,hw:10,hh:9}};
const ACCS=['none','scarf','pouch','necklace','pauldron','none','earring'];
function classFor(role,col,id){
  const r=(role||'').toLowerCase(),h=hash(id||role);
  const pick=(arr,k)=>arr[(h>>>k)%arr.length];
  const base={skin:pick(SKIN,0),hair:pick(HAIRS,3),eye:pick(EYES,7),hs:'short',head:'none',build:'normal',outfit:'tunic',bottom:'#4a4060',trim:'#f2c94c',item:'hammer',acc:pick(ACCS,11)};
  let s;
  if(/overseer|king|queen|crown|global/.test(r)) s=isQueen()?{cls:'Queen',title:'Queen',hair:'#b5542e',hs:'long',head:'crown',headCol:'#f2c94c',outfit:'dress',top:'#a8323a',bottom:'#6a1e2a',trim:'#f2c94c',cape:'#f4f0e8',item:'scepter',acc:'necklace',build:'normal'}:{cls:'King',title:'King',hair:'#e6e2da',hs:'long',head:'crown',headCol:'#f2c94c',outfit:'robe',top:'#a8323a',bottom:'#6a1e2a',trim:'#f2c94c',cape:'#f4f0e8',beard:'#ecebe4',item:'scepter',acc:'necklace',build:'normal'};
  else   if(/trad|desk|ledger|finance/.test(r)) s={cls:'Hermit',title:'Hermit',hair:'#ecebe4',hs:'long',head:'hood',headCol:'#8a6ab0',outfit:'robe',top:'#7a5aa0',bottom:'#4e3a6a',trim:col,beard:'#f4f2ec',item:'lantern',acc:'none'};
  else if(/qa|test|quality/.test(r)) s={cls:'Ranger',title:'Ranger',hs:pick(['short','ponytail','braid'],5),head:'hood',headCol:col,outfit:'cloak',top:pick(['#4e6a3a','#5a5a3a','#3e5a4a'],9),bottom:'#5a4630',cape:shade(col,-.15),item:'sword'};
  else if(/analy|insight|metric/.test(r)) s={cls:'Wizard',title:'Wizard',hair:pick(['#dcd8d0','#a8a4b0','#e8e8ee'],5),hs:'long',head:'wizard',headCol:col,outfit:'robe',top:col,bottom:shade(col,-.35),beard:'#ecebe4',item:'staff',acc:'none'};
  else if(/exercise|fitness|workout/.test(r)) s={cls:'Knight',title:'Knight',head:'helm',headCol:'#c4cad4',outfit:'armor',top:'#b0b8c4',bottom:'#5a6070',trim:col,cape:col,item:'sword',acc:'none'};
  else if(/owner|pm|lead|coord|product|steward/.test(r)) s={cls:'Lord',title:/coord/.test(r)?'Steward':'Lord',hs:pick(['short','long','curly'],5),head:'crown',headCol:'#f2c94c',outfit:'tunic',top:'#6a4c9c',bottom:'#3e3060',cape:'#c43a3a',trim:'#f2c94c',item:'scroll',acc:'necklace'};
  else if(/content|copy|writ|edit/.test(r)) s={cls:'Scribe',title:'Scribe',hs:pick(['bun','braid','short'],5),outfit:'robe',top:pick(['#7a5a3a','#5a4a6a','#4a5a6a'],9),bottom:'#5a4028',trim:col,glasses:1,item:'quill'};
  else if(/design|ux|ui/.test(r)) s={cls:'Bard',title:'Bard',hs:pick(['curly','long','short'],5),head:'feather',headCol:col,outfit:'tunic',top:col,bottom:'#4a3a5a',trim:'#f2c94c',cape:shade(col,-.35),item:'brush'};
  else if(/ios|iphone|swift/.test(r)) s={cls:'Elf',title:'Elven Artificer',build:'tall',hair:pick(['#e8eef8','#f0e2b0','#c8d8f0'],5),hs:pick(['long','ponytail'],9),head:'circlet',headCol:'#cfe0f6',outfit:'tunic',top:col,bottom:'#3a4a6a',trim:'#e8eef8',elf:1,item:'hammer'};
  else if(/android|kotlin/.test(r)) s={cls:'Dwarf',title:'Dwarf Tinker',build:'dwarf',hair:pick(['#c8642a','#a8642e','#6a3a1e'],5),beard:null,hs:'short',head:'bandana',headCol:col,outfit:'apron',top:'#7a5a44',bottom:'#3e3a5e',item:'hammer'};
  else if(/web|front|site/.test(r)) s={cls:'Halfling',title:'Halfling Merchant',build:'small',hs:pick(['curly','short','ponytail'],5),head:'cap',headCol:col,outfit:'tunic',top:'#e6d6b2',bottom:'#5a4630',trim:col,pack:1,item:'hammer'};
  else if(/back|api|server|data|infra|engine/.test(r)) s={cls:'Miner',title:'Dwarf Miner',build:'dwarf',hair:pick(['#5a3a22','#3a2418','#6a6a72'],5),beard:pick(['#8a6a4a','#5a3a22','#a8a4b0'],9),head:'minerhelm',headCol:'#d8a63a',outfit:'tunic',top:col,bottom:'#3e3a5e',item:'pick'};
  else if(/recipe|cook|food|farm/.test(r)) s={cls:'Druid',title:'Druid Cook',hs:pick(['bun','braid','long'],5),head:'straw',headCol:'#e8c870',outfit:'apron',top:'#5a8a4a',bottom:'#6a4a30',trim:col,item:'hoe'};
  else s={cls:'Adventurer',title:'Adventurer',outfit:'tunic',top:col,item:'hammer'};
  const out=Object.assign(base,s);
  if(out.cls==='Dwarf'&&out.beard===null)out.beard=out.hair;
  return out;
}
function heroSprite(o){
  const f=o.walk?(o.frame%4):0,sw=o.pose==='swing'?[1,1,2,3][o.frame%4]:0,br=!o.walk&&o.pose!=='swing'&&o.breath?1:0;
  const beat=['talk','wave','cheer'].includes(o.pose)?(o.frame%2):0;
  const key=['h',o.cls,o.gem||'',o.small?1:0,o.top,o.skin[0],o.hair,o.hs,o.eye,o.headCol,o.acc,o.dir,f,sw,br,o.item,o.carry?1:0,o.paint||'',o.sleep?1:0,o.pose||'',beat].join('|');
  return cached(key,28,42,c=>{if(o.dir==='right'){c.translate(28,0);c.scale(-1,1)}paintHero(c,o,o.dir==='right'?'left':o.dir,f,sw,br,beat)});
}
function paintHero(c,o,d,f,sw,br,beat){
  const pose=o.pose||'idle',sit=pose==='sit';
  const B=BUILDS[o.small?'squire':(o.build||'normal')],cx=14,feet=40;
  const bob=(f===1||f===3)?1:0;
  const legTop=feet-B.leg,torTop=sit?feet-3-B.tor:legTop-B.tor-bob,ht=torTop-B.hh+2-br;
  const [S,Sd,Sdd]=o.skin;const T=o.top,Td=shade(T,-.3),Tdd=shade(T,-.5),Tl=shade(T,.25),P=o.bottom,Pd=shade(P,-.3),Pl=shade(P,.2),H=o.hair,Hd=shade(H,-.32),Hl=shade(H,.3),SHOE='#3a2a30',SHOEl='#5a4448';
  const tw=B.tw,tl=cx-Math.floor(tw/2),hw=B.hw,hl=cx-Math.floor(hw/2);
  const side=d==='left';
  // cape behind
  if(o.cape&&d!=='up'){px(c,tl-1,torTop+1,tw+2,B.tor+B.leg-3,shade(o.cape,-.3));if(side)px(c,tl+tw-3,torTop+1,5,B.tor+B.leg-2,o.cape)}
  // legs
  if(sit){
    if(side){px(c,cx-5,feet-4,7,3,P);px(c,cx-5,feet-4,7,1,Pl);px(c,cx-7,feet-3,3,3,SHOE)}
    else if(d==='up'){px(c,tl+1,feet-3,tw-2,2,Pd)}
    else{px(c,tl,feet-4,4,3,P);px(c,tl+tw-4,feet-4,4,3,Pd);px(c,tl,feet-4,1,2,Pl);px(c,tl,feet-2,4,2,SHOE);px(c,tl+tw-4,feet-2,4,2,SHOE)}
  } else if(o.outfit==='robe'||o.outfit==='dress'){
    const sway=f===0?-1:f===2?1:0,K=o.outfit==='dress'?[P,Pd,Pl,shade(P,-.5)]:[T,Td,Tl,Tdd];
    for(let y=legTop-1;y<feet-1;y++){const k=(y-legTop)/B.leg,w=tw+Math.round(k*3),xx=cx-Math.floor(w/2)+(k>.5?sway:0);px(c,xx,y,w,1,K[0]);px(c,xx+w-3,y,3,1,K[1]);px(c,xx,y,1,1,K[2])}
    px(c,cx-Math.floor((tw+3)/2)+sway,feet-2,tw+3,1,K[3]);
    if(f===0||f===2){const fx=f===0?cx-4:cx+1;px(c,fx,feet-1,3,2,SHOE)}else{px(c,cx-4,feet-1,3,2,SHOE);px(c,cx+1,feet-1,3,2,SHOE)}
  } else if(side){
    const spread=f===0?3:f===2?-3:0;
    px(c,cx-1+spread,legTop,3,B.leg-1,P);px(c,cx-1+spread,legTop,1,B.leg-1,Pl);px(c,cx-2+spread,feet-2,5,2,SHOE);px(c,cx-2+spread,feet-2,5,1,SHOEl);
    if(spread){px(c,cx-1-spread,legTop,3,B.leg-1,Pd);px(c,cx-1-spread,feet-2,4,2,SHOE)}
  } else {
    const lw=Math.max(2,Math.floor(tw/2)-1),la=f===0?-1:f===2?1:0;
    const lx=tl+1,rx=tl+tw-1-lw;
    px(c,lx,legTop,lw,B.leg-1+(la<0?0:-1),P);px(c,lx,legTop,1,B.leg-2,Pl);px(c,lx-(d==='down'?0:0),feet-2-(la>0?1:0),lw+1,2,SHOE);px(c,lx,feet-2-(la>0?1:0),lw+1,1,SHOEl);
    px(c,rx,legTop,lw,B.leg-1+(la>0?0:-1),Pd);px(c,rx,feet-2-(la<0?1:0),lw+1,2,SHOE);
  }
  // torso
  const tx=side?tl+1:tl,tww=side?tw-2:tw;
  px(c,tx,torTop,tww,B.tor,T);px(c,tx,torTop,1,B.tor-1,Tl);px(c,tx+1,torTop,tww-3,1,Tl);px(c,tx+tww-2,torTop,2,B.tor,Td);px(c,tx,torTop+B.tor-1,tww,1,Td);
  if(o.outfit==='armor'){for(let y=torTop+2;y<torTop+B.tor-1;y+=3)px(c,tx+1,y,tww-3,1,Tl);px(c,tl-2,torTop,4,3,Tl);px(c,tl+tw-2,torTop,4,3,T);px(c,tl-2,torTop+2,4,1,Td);px(c,tl+tw-2,torTop+2,4,1,Tdd);px(c,tx,torTop+B.tor-3,tww,1,o.trim)}
  else if(o.outfit==='apron'&&d!=='up'){px(c,tx+2,torTop+2,tww-4,B.tor+1,'#8e6038');px(c,tx+2,torTop+2,tww-4,1,'#b07a48');px(c,tx+tww-4,torTop+2,2,B.tor+1,'#6e4828');px(c,tx+2,torTop,1,2,'#6a4224');px(c,tx+tww-3,torTop,1,2,'#6a4224')}
  else if(o.outfit==='cloak'){const cp=o.cape||Td;px(c,tl-1,torTop,tw+2,3,cp);px(c,tl-1,torTop+2,tw+2,1,shade(cp,-.35));px(c,tl-1,torTop,3,1,shade(cp,.25));if(d==='down')px(c,cx-1,torTop+1,2,2,'#d8c890')}
  else if(o.outfit==='robe'){if(d==='down')px(c,cx-1,torTop+1,2,B.tor+B.leg-3,o.trim);px(c,tx,torTop+B.tor-3,tww,1,Tdd)}
  else if(o.outfit==='tabard'){const Tb=o.tab||'#6a2a9a',Tbd=shade(Tb,-.35),G=o.trim||'#f2c94c';
    if(d==='down'||d==='up'){const w=tww-4;px(c,tx+2,torTop,w,B.tor+3,Tb);px(c,tx+2,torTop,1,B.tor+3,G);px(c,tx+1+w,torTop,1,B.tor+3,G);px(c,tx+2,torTop+B.tor+2,w,1,G);px(c,tx+w,torTop+1,1,B.tor+1,Tbd);
      if(d==='down'){px(c,cx-2,torTop+3,4,2,G);px(c,cx-2,torTop+2,1,1,G);px(c,cx+1,torTop+2,1,1,G);px(c,cx-1,torTop+3,2,1,'#d63c34')}}
    else{px(c,tx+1,torTop,tww-3,B.tor+3,Tb);px(c,tx+1,torTop,1,B.tor+3,G);px(c,tx+1,torTop+B.tor+2,tww-3,1,G)}}
  else if(o.outfit==='dress'){if(d!=='up'){px(c,tx+2,torTop+B.tor-2,tww-4,B.leg+1,'#f4eee0');px(c,tx+2,torTop+B.tor-2,tww-4,1,'#ffffff');px(c,tx+tww-4,torTop+B.tor-2,2,B.leg+1,'#d8d0c0');px(c,tx,torTop+B.tor-3,tww,1,'#f4eee0');
      if(d==='down'){for(let k=0;k<3;k++){px(c,cx-2,torTop+1+k*2,1,1,'#f4eee0');px(c,cx+1,torTop+1+k*2,1,1,'#f4eee0')}px(c,cx-1,torTop,2,1,'#f4eee0')}}
    else px(c,cx-1,torTop+B.tor-3,3,2,'#f4eee0')}
  else {px(c,tx,torTop+B.tor-3,tww,2,'#5a3a22');px(c,tx,torTop+B.tor-3,tww,1,'#7a5432');if(d==='down'){px(c,cx-1,torTop+B.tor-3,2,2,o.trim);px(c,cx-1,torTop,2,3,Tl);px(c,cx,torTop+1,1,1,Td)}}
  // accessory
  if(d!=='up'){if(o.acc==='scarf'){px(c,tx,torTop,tww,2,o.trim);px(c,tx+tww-3,torTop+2,2,3,o.trim)}else if(o.acc==='necklace'&&d==='down'){px(c,cx-2,torTop+1,4,1,'#f2c94c');px(c,cx-1,torTop+2,2,1,'#d63c34')}else if(o.acc==='pouch'){px(c,side?tx+1:tx+tww-3,torTop+B.tor-3,3,3,'#8e6038');px(c,side?tx+1:tx+tww-3,torTop+B.tor-3,3,1,'#b07a48')}else if(o.acc==='satchel'){if(d==='down'){for(let k=0;k<B.tor;k++)px(c,tx+1+Math.round(k*(tww-3)/B.tor),torTop+k,1,1,'#6a4224');px(c,tx+tww-3,torTop+B.tor-3,5,5,'#8e6038');px(c,tx+tww-3,torTop+B.tor-3,5,1,'#b07a48');px(c,tx+tww-2,torTop+B.tor-1,2,1,'#d8b060')}else{px(c,tx+tww-3,torTop+B.tor-4,6,5,'#8e6038');px(c,tx+tww-3,torTop+B.tor-4,6,1,'#b07a48');px(c,cx-1,torTop,1,B.tor-3,'#6a4224')}}else if(o.acc==='pauldron'&&o.outfit!=='armor'){px(c,tl-2,torTop,3,3,'#a8aeb8');px(c,tl-2,torTop,3,1,'#d8dce4')}}
  if(o.acc==='satchel'&&d==='up'){px(c,tl+tw-4,torTop+B.tor-4,6,5,'#8e6038');px(c,tl+tw-4,torTop+B.tor-4,6,1,'#b07a48');for(let k=0;k<B.tor;k++)px(c,tl+1+Math.round(k*(tw-3)/B.tor),torTop+k,1,1,'#6a4224')}
  if(o.pack){if(d==='up'){px(c,tl+1,torTop,tw-2,B.tor-1,'#8e6038');px(c,tl+1,torTop,tw-2,2,'#b07a48');px(c,tl+2,torTop+4,tw-4,1,'#6a4224')}
    else if(side){px(c,tl+tw-2,torTop,5,B.tor-1,'#8e6038');px(c,tl+tw-2,torTop,5,2,'#b07a48')}
    else{px(c,tl+1,torTop,1,B.tor-2,'#6a4224');px(c,tl+tw-2,torTop,1,B.tor-2,'#6a4224');px(c,tl-1,torTop-1,2,3,'#8e6038');px(c,tl+tw-1,torTop-1,2,3,'#8e6038')}}
  if(o.cape&&d==='up'){px(c,tl-1,torTop,tw+2,B.tor+B.leg-3,o.cape);px(c,tl-1,torTop,tw+2,2,shade(o.cape,.25));px(c,tl+tw-2,torTop,3,B.tor+B.leg-3,shade(o.cape,-.25))}
  // arms (swing opposite the legs), or a pose
  const swingA=f===0?1:f===2?-1:0,TOOL=sw&&STRIKE[o.item]&&!['carry','cheer','wave','sit'].includes(pose);let ay=sw&&!TOOL?-5:0;
  if(pose==='talk'&&beat)ay=-3;
  if(pose==='cheer'||pose==='wave'||pose==='carry'){
    if(pose==='wave'&&!side){px(c,tl-2,torTop+1,2,B.tor-3,Td);px(c,tl-2,torTop+B.tor-3,2,2,S)}
    else if(pose==='carry'){if(d!=='up'){const cy0=torTop+2;px(c,tl-1,cy0,tw+2,8,PAL.wood);px(c,tl-1,cy0,tw+2,2,PAL.woodL);px(c,tl-1,cy0+7,tw+2,1,PAL.woodDD);px(c,tl,cy0+4,tw,1,PAL.woodD);px(c,cx,cy0+2,1,5,PAL.woodD);px(c,tl-2,cy0+3,2,3,S);px(c,tl+tw,cy0+3,2,3,Sd)}else{px(c,tl-2,torTop+1,2,B.tor-3,Td);px(c,tl+tw,torTop+1,2,B.tor-3,Td)}}
  } else
  if(TOOL){strikeArm(c,o,d,sw,cx,tl,tw,torTop,ht,B,Td,T,S,Sd)}
  else if(side){const ax=cx-2+(o.walk?swingA*2:0);px(c,ax,torTop+1+ay,3,B.tor-3,Td);px(c,ax,torTop+1+ay,1,B.tor-3,T);px(c,ax,torTop+B.tor-3+ay,3,2,S)}
  else{const la=d==='down'?-swingA:swingA;px(c,tl-2,torTop+1,2,B.tor-3+la,Td);px(c,tl-2,torTop+1,1,B.tor-4+la,T);px(c,tl-2,torTop+B.tor-3+la,2,2,S);
    px(c,tl+tw,torTop+1+ay,2,B.tor-3-la,Td);px(c,tl+tw,torTop+B.tor-3-la+ay,2,2,Sd)}
  // head (rounded) with cheek shading
  px(c,hl+1,ht,hw-2,B.hh,S);px(c,hl,ht+1,hw,B.hh-2,S);px(c,hl+hw-2,ht+1,2,B.hh-2,Sd);px(c,hl+1,ht+B.hh-1,hw-2,1,Sd);px(c,hl+hw-3,ht+B.hh-2,2,1,Sdd);
  if(o.elf){px(c,hl-2,ht+5,2,1,S);px(c,hl-3,ht+4,1,1,S);if(!side){px(c,hl+hw,ht+5,2,1,Sd);px(c,hl+hw+2,ht+4,1,1,Sd)}}
  hair(c,o,d,hl,hw,ht,B,cx,H,Hd,Hl,torTop);
  // face
  const ey=ht+5;
  if(d==='down'){
    const lx=hl+2,rx=hl+hw-4;
    if(o.sleep){px(c,lx,ey+1,2,1,'#2a1e36');px(c,rx,ey+1,2,1,'#2a1e36')}
    else{for(const ex of [lx,rx]){px(c,ex,ey,2,1,'#2a1e36');px(c,ex,ey+1,2,2,o.eye);px(c,ex,ey+1,1,1,'#ffffff');px(c,ex+1,ey+2,1,1,shade(o.eye,-.35))}}
    if(o.glasses){px(c,lx-1,ey,4,1,'#c9b98f');px(c,rx-1,ey,4,1,'#c9b98f');px(c,lx+3,ey+1,rx-lx-3,1,'#c9b98f');px(c,lx-1,ey+3,4,1,'#c9b98f');px(c,rx-1,ey+3,4,1,'#c9b98f')}
    px(c,hl+1,ey+3,2,1,'#f0a0a0');px(c,hl+hw-3,ey+3,2,1,'#e89090');
    if((pose==='talk'&&beat)||pose==='cheer'){px(c,cx-1,ey+4,2,2,'#6a2a3a');px(c,cx-1,ey+4,2,1,'#3a1a24')}else px(c,cx-1,ey+4,2,1,Sd);
    if(o.acc==='earring')px(c,hl-1,ey+3,1,2,'#f2c94c');
  } else if(side){
    if(o.sleep)px(c,hl+1,ey+1,2,1,'#2a1e36');else{px(c,hl+1,ey,2,1,'#2a1e36');px(c,hl+1,ey+1,2,2,o.eye);px(c,hl+1,ey+1,1,1,'#ffffff')}
    px(c,hl-1,ey+2,1,2,S);px(c,hl+1,ey+4,2,1,'#f0a0a0');if((pose==='talk'&&beat)||pose==='cheer')px(c,hl,ey+4,2,1,'#6a2a3a');
  }
  if(o.beard&&d!=='up'){const b=o.beard,bd=shade(b,-.28),bl=shade(b,.25);
    if(side){px(c,hl-1,ht+7,Math.ceil(hw/2)+1,B.hh-5,b);px(c,hl,ht+B.hh,5,3,b);px(c,hl+2,ht+B.hh+2,2,2,bd);px(c,hl,ht+7,2,1,bl)}
    else{px(c,hl+1,ht+7,hw-2,B.hh-6,b);px(c,hl+2,ht+B.hh-1,hw-4,4,b);px(c,cx-1,ht+B.hh+3,3,2,b);px(c,hl+hw-3,ht+7,2,B.hh-4,bd);px(c,hl+3,ht+6,hw-6,1,b);px(c,hl+2,ht+7,2,1,bl);px(c,cx-1,ht+8,2,1,Sd)}}
  headgear(c,o,d,hl,hw,ht,B,cx);
  // raised arms go outside the head silhouette and on top of it
  if(pose==='cheer'||pose==='wave'){const up=beat?-1:0,arm=(x,col,sk)=>{px(c,x,ht+1+up,2,torTop-ht+2,col);px(c,x,ht-2+up,2,3,sk);px(c,x,ht-2+up,1,1,shade(sk,.2))};
    if(side){arm(hl-3,Td,S)}
    else if(pose==='cheer'){arm(hl-3,Td,S);arm(hl+hw+1,Td,Sd)}
    else{// a real wave: upper arm out to the elbow, forearm up, open palm swinging side to side about the elbow
      const ph=[0,1,2,1,0,-1,-2,-1][(o.frame||0)%8],sx=tl+tw,sy=torTop+1,ex=sx+4,ey=sy-1,L=Math.max(5,torTop-ht-3),hx=ex+ph,hy=ey-L;
      px(c,sx,sy,2,2,Td);px(c,sx+2,sy-1,2,2,Td);px(c,sx+2,sy+1,2,1,shade(Td,-.25));
      for(let k=0;k<=L;k++)px(c,ex+Math.round(ph*k/L),ey-k,2,1,k<L*.35?Td:S);
      px(c,hx-1,hy-3,3,3,S);px(c,hx-1,hy-4,1,1,S);px(c,hx+1,hy-4,1,1,S);px(c,hx+2,hy-2,1,1,S);px(c,hx-1,hy-1,3,1,Sd);px(c,hx-1,hy-3,1,1,shade(S,.2));
      if(Math.abs(ph)===2){c.save();c.globalAlpha=.75;const dir=ph>0?-1:1,mx=ph>0?hx-3:hx+3;px(c,mx,hy-4,1,2,'#fff8e6');px(c,mx+dir,hy-1,1,1,'#fff8e6');c.restore()}}}
  if(o.item&&o.item!=='none'&&!TOOL&&!['carry','cheer'].includes(pose)&&!(pose==='wave'&&!side)){const hx=side?cx-1+(o.walk?swingA*2:0):tl+tw+1,hy=torTop+B.tor-2+ay;drawItem(c,o.item,hx,hy,o,d,sw)}
  if(o.carry){px(c,tl-4,ht-4,tw+8,3,PAL.woodL);px(c,tl-4,ht-2,tw+8,1,PAL.woodD);px(c,tl-3,ht-1,2,3,S);px(c,tl+tw+1,ht-1,2,3,S)}
}
function hair(c,o,d,hl,hw,ht,B,cx,H,Hd,Hl,torTop){
  const hs=o.hs,side=d==='left',hatted=o.head!=='none';
  // crown of the head: 1px wider than the skull for volume
  px(c,hl,ht-1,hw,4,H);px(c,hl+1,ht-2,hw-2,1,H);px(c,hl-1,ht+1,1,3,H);px(c,hl+hw,ht+1,1,3,Hd);
  px(c,hl+2,ht-2,4,1,Hl);px(c,hl+1,ht-1,2,1,Hl);px(c,hl+hw-3,ht,3,3,Hd);
  if(d==='up'){px(c,hl-1,ht,hw+2,B.hh-1,H);px(c,hl+1,ht,4,2,Hl);px(c,hl+hw-2,ht+1,3,B.hh-2,Hd);
    if(hs==='long'||hs==='braid')px(c,hl,ht+B.hh-2,hw,7,H);if(hs==='ponytail')px(c,cx-1,ht+B.hh-2,3,6,H);if(hs==='bun'&&!hatted){disc(c,cx,ht-2,3,H)}return}
  if(side){px(c,hl+Math.floor(hw/2)-1,ht+1,Math.ceil(hw/2)+2,B.hh-3,H);px(c,hl+hw-1,ht+2,2,B.hh-4,Hd);
    if(hs==='long')px(c,hl+Math.floor(hw/2),ht+B.hh-3,Math.ceil(hw/2)+1,7,H);if(hs==='ponytail'){px(c,hl+hw,ht+3,3,2,H);px(c,hl+hw+1,ht+5,2,5,Hd)}if(hs==='braid')px(c,hl+hw-2,ht+B.hh-2,2,7,Hd)}
  else{
    // fringe with a ragged lower edge
    for(let i=0;i<hw;i+=2){const dd=(hash(o.hair+hs+i)%2);px(c,hl+i,ht+3,2,1+dd,i<hw/2?H:Hd)}
    px(c,hl-1,ht+3,2,4,H);px(c,hl+hw-1,ht+3,2,4,Hd);
    if(hs==='long'){px(c,hl-1,ht+4,2,B.hh+3,H);px(c,hl+hw-1,ht+4,2,B.hh+3,Hd)}
    if(hs==='braid'){px(c,hl+hw-1,ht+4,2,B.hh+4,Hd);px(c,hl+hw-1,ht+B.hh+5,2,1,o.trim||'#c43a3a')}
    if(hs==='curly'){for(let i=-1;i<=hw;i+=3)disc(c,hl+i,ht,2,H);px(c,hl-2,ht+3,2,4,H);px(c,hl+hw,ht+3,2,4,Hd)}
  }
  if(hs==='bun'&&!hatted){disc(c,cx,ht-3,3,H);px(c,cx-1,ht-5,2,1,Hl)}
  if(hs==='spiky'&&!hatted)for(let k=0;k<4;k++)px(c,hl+1+k*3,ht-4+(k%2),2,3,H);
}
function headgear(c,o,d,hl,hw,ht,B,cx){
  const C=o.headCol||'#888',Cd=shade(C,-.3),Cl=shade(C,.3),side=d==='left';
  switch(o.head){
    case 'hood':px(c,hl-1,ht-2,hw+2,5,C);px(c,hl,ht-3,hw,1,C);
      if(d==='up')px(c,hl-1,ht,hw+2,B.hh+1,C);else if(side){px(c,hl+3,ht,hw-2,B.hh,C);px(c,hl+hw-1,ht,2,B.hh+2,Cd)}else{px(c,hl-1,ht+2,2,B.hh,C);px(c,hl+hw-1,ht+2,2,B.hh,Cd)}
      px(c,hl,ht-3,4,1,Cl);px(c,hl-1,ht+2,hw+2,1,Cd);break;
    case 'wizard':px(c,hl-4,ht+1,hw+8,2,C);px(c,hl-4,ht+2,hw+8,1,Cd);px(c,hl-4,ht+1,hw+8,1,Cl);
      for(let i=0;i<13;i++){const w=Math.max(2,Math.round((hw-1)*(1-i/13))),xo=Math.round(i*.4);px(c,cx-Math.floor(w/2)+xo,ht-i,w,1,i%4===0?Cl:C);px(c,cx-Math.floor(w/2)+xo+w-1,ht-i,1,1,Cd)}
      px(c,cx+5,ht-13,2,2,C);px(c,cx-1,ht-4,1,1,'#f2c94c');px(c,cx+2,ht-8,1,1,'#f2c94c');break;
    case 'helm':px(c,hl-1,ht-2,hw+2,7,C);px(c,hl,ht-3,hw,1,C);px(c,hl,ht-2,4,1,Cl);px(c,hl+hw-2,ht-1,2,6,Cd);
      if(d==='down'){px(c,cx-1,ht+3,2,4,Cd);px(c,hl-1,ht+4,hw+2,1,Cd)}else if(side)px(c,hl-1,ht+4,3,1,Cd);else px(c,hl-1,ht-2,hw+2,B.hh,C);
      px(c,cx-1,ht-7,3,5,o.trim||'#c43a3a');px(c,cx+1,ht-8,3,2,o.trim||'#c43a3a');break;
    case 'crown':px(c,hl,ht-2,hw,3,C);px(c,hl,ht-2,hw,1,Cl);for(const k of [0,Math.floor(hw/2)-1,hw-2])px(c,hl+k,ht-5,2,3,C);if(d!=='up')px(c,cx-1,ht-1,2,1,'#d63c34');break;
    case 'tophat':px(c,hl-3,ht,hw+6,2,C);px(c,hl-3,ht,hw+6,1,Cl);px(c,hl+1,ht-9,hw-2,9,C);px(c,hl+1,ht-9,2,9,Cl);px(c,hl+hw-3,ht-9,2,9,Cd);px(c,hl+1,ht-3,hw-2,2,o.trim||'#c43a3a');break;
    case 'circlet':px(c,hl,ht+2,hw,1,C);if(d==='down')px(c,cx-1,ht+1,2,2,'#7ad0f0');break;
    case 'feather':px(c,hl-2,ht-2,hw+4,3,C);px(c,hl,ht-4,hw,2,C);px(c,hl,ht-4,4,1,Cl);px(c,hl-2,ht,hw+4,1,Cd);
      {const fx=side?hl+hw-1:hl+hw-2;px(c,fx,ht-8,2,5,'#f8f0e0');px(c,fx+1,ht-10,2,3,'#f8f0e0');px(c,fx+2,ht-11,1,2,'#e8e0d0');px(c,fx,ht-7,1,4,'#e0d4c0')}break;
    case 'bandana':px(c,hl,ht-1,hw,3,C);px(c,hl,ht-1,hw,1,Cl);px(c,hl,ht+1,hw,1,Cd);if(d==='up'||side){px(c,hl+hw-1,ht+1,2,4,C);px(c,hl+hw+1,ht+3,2,3,Cd)}break;
    case 'cap':px(c,hl,ht-3,hw,4,C);px(c,hl+1,ht-4,hw-2,1,C);px(c,hl+1,ht-3,3,1,Cl);if(d==='down')px(c,hl-1,ht+1,hw+2,1,Cd);else if(side)px(c,hl-3,ht+1,5,1,Cd);break;
    case 'minerhelm':px(c,hl-1,ht-3,hw+2,5,C);px(c,hl,ht-4,hw,1,C);px(c,hl,ht-3,4,1,Cl);px(c,hl-2,ht+1,hw+4,1,Cd);
      if(d==='down'){px(c,cx-2,ht-2,4,3,'#6a6a72');px(c,cx-1,ht-1,2,1,'#fff6b0')}else if(side){px(c,hl-2,ht-2,3,3,'#6a6a72');px(c,hl-2,ht-1,1,1,'#fff6b0')}break;
    case 'wingcap':px(c,hl,ht-3,hw,4,C);px(c,hl+1,ht-4,hw-2,1,C);px(c,hl+1,ht-3,3,1,Cl);px(c,hl,ht,hw,1,Cd);
      {const wing=(x,flip)=>{for(let k=0;k<4;k++)px(c,flip?x-k:x+k,ht-2-k,1,3-Math.floor(k/2),k%2?'#e8e8f0':'#ffffff');px(c,flip?x-1:x,ht,2,1,'#c8c8d4')};
       if(d==='down'||d==='up'){wing(hl-2,1);wing(hl+hw+1,0)}else wing(hl+hw-1,0)}break;
    case 'plume':px(c,hl-2,ht-2,hw+4,3,C);px(c,hl-1,ht-4,hw+2,2,C);px(c,hl,ht-5,hw,1,C);px(c,hl-2,ht,hw+4,1,Cd);px(c,hl,ht-4,4,1,Cl);px(c,hl-1,ht-1,hw+2,1,o.trim||'#f2c94c');
      {const fx=side?hl+hw-2:hl+hw-3;for(let k=0;k<7;k++)px(c,fx+Math.round(k*.6),ht-5-k,2,2,k%2?'#f2c94c':'#fff0a8');px(c,fx+4,ht-12,2,2,'#ffffff')}break;
    case 'straw':px(c,hl-4,ht,hw+8,2,C);px(c,hl-4,ht+1,hw+8,1,shade(C,-.25));px(c,hl,ht-4,hw,4,C);px(c,hl+1,ht-5,hw-2,1,C);px(c,hl,ht-1,hw,1,o.trim||'#c43a3a');for(let k=0;k<hw+6;k+=3)px(c,hl-3+k,ht,1,1,Cl);break;
  }
}
function drawItem(c,item,hx,hy,o,d,sw){
  const G='#cfd4de',Gd='#7a8090',W=PAL.woodD,WL=PAL.woodL;
  switch(item){
    case 'hammer':px(c,hx,hy-6,2,7,W);px(c,hx,hy-6,1,7,WL);px(c,hx-2,hy-9,6,4,G);px(c,hx-2,hy-6,6,1,Gd);px(c,hx-2,hy-9,2,1,'#ffffff');break;
    case 'pick':px(c,hx,hy-7,2,8,W);px(c,hx-4,hy-9,10,2,G);px(c,hx-4,hy-8,2,2,G);px(c,hx+4,hy-8,2,2,G);px(c,hx-4,hy-8,10,1,Gd);break;
    case 'brush':px(c,hx,hy-6,1,7,'#e6cfa4');px(c,hx,hy-8,1,2,o.paint||'#b07ad6');px(c,hx-1,hy-7,3,1,'#9a9aa6');break;
    case 'sword':px(c,hx,hy-10,2,9,'#e6eaf2');px(c,hx,hy-10,1,9,'#ffffff');px(c,hx-2,hy-1,6,2,'#c9a03a');px(c,hx,hy+1,2,2,W);break;
    case 'staff':px(c,hx,hy-15,2,19,W);px(c,hx,hy-15,1,19,WL);px(c,hx-1,hy-19,4,4,o.headCol||'#7ad0f0');px(c,hx,hy-18,1,1,'#ffffff');break;
    case 'quill':px(c,hx,hy-7,1,7,'#f8f4ea');px(c,hx+1,hy-8,1,6,'#e8e0d0');px(c,hx-1,hy-6,1,4,'#e8e0d0');px(c,hx,hy,1,1,'#2a2236');break;
    case 'scroll':px(c,hx-2,hy-3,6,6,'#f6eed6');px(c,hx-2,hy-3,6,1,'#c9b98f');px(c,hx-2,hy+2,6,1,'#c9b98f');px(c,hx-1,hy-1,4,1,'#9a8e70');break;
    case 'lantern':px(c,hx,hy-2,1,2,'#3a3040');px(c,hx-2,hy,5,6,'#5a5260');px(c,hx-1,hy+1,3,4,'#ffd86b');px(c,hx-1,hy+1,1,1,'#fff6c8');break;
    case 'hoe':px(c,hx,hy-8,2,11,W);px(c,hx,hy-8,1,11,WL);px(c,hx-2,hy+2,4,2,G);break;
    case 'mug':px(c,hx-1,hy-5,5,6,'#c88a3c');px(c,hx-1,hy-5,5,2,'#fffaf0');px(c,hx+4,hy-3,2,3,'#c88a3c');px(c,hx,hy-3,1,3,'#e8b060');break;
    case 'ledger':px(c,hx-3,hy-4,7,6,'#7a2a2a');px(c,hx-3,hy-4,7,1,'#a84a3a');px(c,hx-2,hy-3,5,4,'#f6eed6');break;
    case 'spear':px(c,hx,hy-16,1,22,PAL.woodD);px(c,hx+1,hy-16,1,22,PAL.wood);px(c,hx-1,hy-20,3,4,'#d8dce4');px(c,hx,hy-21,1,1,'#ffffff');px(c,hx-1,hy-15,3,1,'#7a3ab0');break;
    case 'scepter':px(c,hx,hy-8,1,10,'#f2c94c');px(c,hx+1,hy-8,1,10,'#c9a03a');px(c,hx-1,hy-11,4,4,'#c43a3a');px(c,hx,hy-10,1,1,'#ffb0b0');break;
    case 'letter':px(c,hx-3,hy-3,7,5,'#f6eed6');px(c,hx-3,hy-3,7,1,'#ffffff');for(let k=0;k<3;k++){px(c,hx-3+k,hy-2+k,1,1,'#c9b98f');px(c,hx+3-k,hy-2+k,1,1,'#c9b98f')}px(c,hx,hy,2,2,'#c43a3a');px(c,hx,hy,1,1,'#ff7a6a');break;
    case 'banner':{px(c,hx,hy-22,1,26,'#c9a03a');px(c,hx+1,hy-22,1,26,'#8a6a1e');px(c,hx-1,hy-24,3,2,'#f2c94c');const w=Math.floor(Date.now()/250)%2;
      px(c,hx+2,hy-21,9,9,'#6a2a9a');px(c,hx+2,hy-21,9,1,'#8a4ac0');px(c,hx+2,hy-13,9,1,'#f2c94c');px(c,hx+2,hy-12,4,2+w,'#6a2a9a');px(c,hx+7,hy-12,4,3-w,'#6a2a9a');
      px(c,hx+5,hy-18,4,2,'#f2c94c');px(c,hx+5,hy-19,1,1,'#f2c94c');px(c,hx+8,hy-19,1,1,'#f2c94c');break}
    case 'gem':{const G=(typeof GEMS!=='undefined'&&GEMS[o.gem])||['#f2c94c','#c8901a','#fff09a'];px(c,hx-1,hy-3,4,4,G[0]);px(c,hx,hy-4,2,1,G[0]);px(c,hx+2,hy-2,1,3,G[1]);px(c,hx,hy-3,1,1,G[2]);break}
    case 'crate':px(c,5,19,18,11,PAL.wood);px(c,5,19,18,2,PAL.woodL);px(c,5,29,18,1,PAL.woodDD);px(c,6,24,16,1,PAL.woodD);px(c,13,21,1,8,PAL.woodD);break;
  }
}
function drawHero(c,x,y,o){
  const b=o.small?BUILDS.squire:BUILDS[o.build||'normal'];
  ellipseShadow(c,x,y,o.small?4:Math.max(5,Math.round(b.tw*.6)),2,.3);
  c.drawImage(heroSprite(o),Math.round(x-14),Math.round(y-40-(o.hop||0)));
}
function apprenticeOf(o,k){const h=hash((o.id||o.cls)+'ap'+k);return {cls:'Squire',small:1,skin:SKIN[h%5],hair:HAIRS[(h>>>4)%10],eye:EYES[(h>>>8)%5],hs:['short','curly','ponytail'][(h>>>12)%3],head:'cap',headCol:o.col||o.trim,outfit:'tunic',top:'#d8c8a8',bottom:'#4a4060',trim:o.col||'#f2c94c',item:'none',acc:'none'}}

// messengers: a guild courier in the sending town's colour, and the King's herald in royal purple and gold
function courierSpec(col,seed){const h=hash('cr'+(seed||col));return {cls:'Courier'+col,title:'Courier',skin:SKIN[h%5],hair:HAIRS[(h>>>4)%10],eye:EYES[(h>>>8)%5],hs:['short','ponytail','curly'][(h>>>12)%3],head:'wingcap',headCol:col,build:'normal',outfit:'tunic',top:shade(col,.12),bottom:'#5a4630',trim:'#f4eee0',item:'letter',acc:'satchel'}}
function heraldSpec(){return {cls:'Herald',title:'Royal Herald',skin:SKIN[1],hair:'#3a2418',eye:EYES[0],hs:'long',head:'plume',headCol:'#5a2a8a',build:'tall',outfit:'tabard',top:'#f2c94c',tab:'#6a2a9a',bottom:'#ece6f4',trim:'#f2c94c',cape:'#4a1e78',item:'banner',acc:'none'}}
function barmaidSpec(seed){const h=hash('bm'+seed);return {cls:'Barmaid'+(h%3),title:'Barmaid',skin:SKIN[(h>>>3)%5],hair:['#c8642a','#e8c070','#3a2418'][h%3],eye:EYES[(h>>>6)%5],hs:'bun',head:'none',build:'normal',outfit:'dress',top:['#3a6a9a','#4a8a5a','#8a3a4a'][h%3],bottom:['#7a2a3a','#2a4a6a','#4a3a6a'][h%3],trim:'#f4eee0',item:'mug',acc:'none'}}

// swings with a real arc: phase 1 winds the tool up behind the head, phase 2 brings it forward and down onto the work, phase 3 recovers
const STRIKE={hammer:{len:7,head:'block'},pick:{len:8,head:'pick'},hoe:{len:10,head:'blade'},sword:{len:10,head:'sword'},brush:{len:6,head:'brush'},spear:{len:12,head:'tip'}};
function strikeArm(c,o,d,ph,cx,tl,tw,torTop,ht,B,Td,T,S,Sd){
  const side=d==='left',sh=torTop+2;let hx,hy,dir;
  if(side){ // facing left: forward is -x
    if(ph===1){px(c,cx,ht+2,3,sh-ht,Td);px(c,cx,ht+2,1,sh-ht,T);hx=cx+1;hy=ht+1;dir=[.55,-1]}
    else if(ph===2){px(c,cx-7,sh,8,3,Td);px(c,cx-7,sh,8,1,T);hx=cx-8;hy=sh+1;dir=[-1,.35]}
    else{px(c,cx-4,sh,5,3,Td);px(c,cx-4,sh+2,3,3,Td);hx=cx-5;hy=sh+4;dir=[-.5,-1]}
    px(c,hx-1,hy-1,3,3,S)}
  else{ // facing the viewer (or away): the tool comes over the shoulder and down in front
    const ax=tl+tw;
    if(ph===1){px(c,ax,ht,2,sh-ht+2,Td);hx=ax+1;hy=ht-1;dir=[.35,-1]}
    else if(ph===2){px(c,ax-4,sh+1,6,3,Td);px(c,ax-4,sh+1,6,1,T);hx=ax-5;hy=sh+3;dir=[-1,.55]}
    else{px(c,ax,sh,2,B.tor-3,Td);hx=ax+1;hy=sh+B.tor-3;dir=[.3,-1]}
    px(c,hx-1,hy-1,2,2,d==='up'?Sd:S)}
  strikeTool(c,o,hx,hy,dir,ph)}
function strikeTool(c,o,hx,hy,[dx,dy],ph){
  const k=STRIKE[o.item],n=Math.hypot(dx,dy);dx/=n;dy/=n;const nx=-dy,ny=dx,W=PAL.woodD,WL=PAL.woodL,G='#cfd4de',Gd='#7a8090';
  const P=(x,y,col)=>px(c,Math.round(x),Math.round(y),1,1,col);
  if(k.head==='sword'){for(let t=-2;t<=2;t++)P(hx+nx*t,hy+ny*t,'#c9a03a');for(let t=1;t<=k.len;t++){P(hx+dx*t,hy+dy*t,'#e6eaf2');P(hx+dx*t+nx,hy+dy*t+ny,'#ffffff')}return}
  for(let t=0;t<=k.len;t++){P(hx+dx*t,hy+dy*t,W);P(hx+dx*t+nx*.8,hy+dy*t+ny*.8,WL)}
  const ex=hx+dx*k.len,ey=hy+dy*k.len;
  if(k.head==='block'){for(let a=-1;a<=2;a++)for(let b=-3;b<=3;b++)P(ex+dx*a+nx*b,ey+dy*a+ny*b,a===2?Gd:b===-3?'#ffffff':G)}
  else if(k.head==='pick'){for(let b=-5;b<=5;b++){const bend=Math.abs(b)>3?-1:0;P(ex+nx*b+dx*bend,ey+ny*b+dy*bend,G);P(ex+nx*b+dx*(bend+1),ey+ny*b+dy*(bend+1),Gd)}}
  else if(k.head==='blade'){const s=dy>0?1:-1;for(let b=0;b<=4;b++){P(ex+nx*b*s,ey+ny*b*s,G);P(ex+nx*b*s+dx,ey+ny*b*s+dy,Gd)}}
  else if(k.head==='brush'){P(ex,ey,o.paint||'#b07ad6');P(ex+dx,ey+dy,o.paint||'#b07ad6');P(ex-dx+nx,ey-dy+ny,'#9a9aa6')}
  else if(k.head==='tip'){for(let a=0;a<3;a++)for(let b=-1;b<=1;b++)if(Math.abs(b)<=2-a)P(ex+dx*a+nx*b,ey+dy*a+ny*b,'#d8dce4')}
  if(ph===2&&(k.head==='block'||k.head==='pick')){P(ex+dx*4,ey+dy*4,'#fff6c8');P(ex+dx*4+nx*3,ey+dy*4+ny*3,'#ffd86b');P(ex+dx*4-nx*3,ey+dy*4-ny*3,'#ffd86b')}
}

// ===================== buildings (shape by role, materials by place) =====================
const TYPES={
 keep:  {W:80,H:64,roofH:32,style:'gable',chimney:0,turrets:1,banner:1,name:'Keep'},
 guild: {W:64,H:48,roofH:26,style:'gable',sign:'palette',name:'Guild Hall'},
 script:{W:64,H:48,roofH:26,style:'gable',sign:'book',name:'Scriptorium'},
 smithy:{W:64,H:48,roofH:24,style:'gable',chimney:1,anvil:1,forge:1,name:'Smithy'},
 shop:  {W:64,H:44,roofH:20,style:'gable',awning:1,crates:1,name:'Trading Post'},
 mine:  {W:64,H:48,style:'rock',name:'Mine'},
 tower: {W:32,H:64,roofH:22,style:'cone',lantern:1,mat:'stone',name:'Watchtower'},
 mage:  {W:40,H:76,roofH:30,style:'cone',crystal:1,mat:'stone',name:'Mage Tower'},
 farm:  {W:48,H:48,roofH:26,style:'gable',field:1,name:'Farmstead'},
 yard:  {W:80,H:48,style:'yard',name:'Training Grounds'},
 inn:   {W:80,H:52,roofH:28,style:'gable',chimney:1,sign:'mug',name:'Inn'},
 vault: {W:64,H:48,style:'alcove',name:'Counting Vault'},
 cottage:{W:64,H:48,roofH:26,style:'gable',chimney:1,name:'Cottage'},
};
function roleInfo(role,id,full){
  const r=(role||'').toLowerCase();let type,kind,col;
  if(/trad|desk|ledger|finance/.test(r)){type='vault';kind='count';col='#d8b24a'}
  else if(/qa|test|quality/.test(r)){type='tower';kind='qa';col=/android/.test(r)?'#4fc79a':'#5fb3c9'}
  else if(/analy|insight|metric/.test(r)){type='mage';kind='gaze';col='#8fa6e8'}
  else if(/exercise|fitness|workout/.test(r)){type='yard';kind='jog';col='#f06f5a'}
  else if(/owner|pm|lead|coord|product|steward/.test(r)){type='keep';kind='mayor';col='#e8c547'}
  else if(/content|copy|writ|edit/.test(r)){type='script';kind='paint';col='#e8a0b0'}
  else if(/design|ux|ui/.test(r)){type='guild';kind='paint';col='#b07ad6'}
  else if(/ios|iphone|swift/.test(r)){type='smithy';kind='smith';col='#9fc0e6'}
  else if(/android|kotlin/.test(r)){type='smithy';kind='smith';col='#7ccf6b'}
  else if(/web|front|site/.test(r)){type='shop';kind='smith';col=/app/.test(r)?'#f2c14e':'#f08a4b'}
  else if(/back|api|server|data|infra|engine/.test(r)){type='mine';kind='dig';col='#c58a4a'}
  else if(/recipe|cook|food|farm/.test(r)){type='farm';kind='farm';col='#e07b8a'}
  else {type='cottage';kind='smith';col='#cfcfcf'}
  if(!full&&!premium()&&!/overseer|king|crown|global/.test(r)){if(/owner|pm|lead|coord|product|steward/.test(r)){type='keep';kind='mayor'}else{const cls=classFor('adventurer',col,id);return {type:'cottage',kind:'smith',col,cls,title:cls.title,prop:cls.item}}}
  const cls=classFor(role,col,id);
  return {type,kind,col,cls,title:cls.title,prop:cls.item};
}
// materials per place
const MATS={
  capital:{wall:'stone',wallCol:'#d2ccbe',trim:'#5c4a3a',roof:'tile',roofs:{keep:'#c8453a',guild:'#3f6ea8',script:'#2f8a6a',smithy:'#5a6478',shop:'#d4822e',farm:'#a8402e',inn:'#9a5a2e',cottage:'#c8453a'}},
  port:   {wall:'timber',wallCol:'#f2eadb',trim:'#5a3a22',roof:'tile',roofs:{keep:'#2f8a8a',guild:'#c8453a',script:'#3f6ea8',smithy:'#4a5a6a',shop:'#2f8a8a',farm:'#a8402e',inn:'#2f6a8a',cottage:'#c8453a'}},
  village:{wall:'timber',wallCol:'#efe2c6',trim:'#6a4628',roof:'thatch',roofs:{}},
  river:  {wall:'log',wallCol:'#a2703f',trim:'#5a3a20',roof:'wood',roofs:{keep:'#6a8a3a',guild:'#7a5a3a',inn:'#7a5a3a'}},
  arcane: {wall:'stone',wallCol:'#b4b0c4',trim:'#3e3a58',roof:'slate',moss:1,roofs:{keep:'#5a4a9a',guild:'#4a6ab0',script:'#6a4a9a',smithy:'#3e4a6a',shop:'#5a4a9a',farm:'#4a6a5a',inn:'#4a3a7a',cottage:'#5a4a9a'}},
  cave:   {wall:'rock',wallCol:'#7a7064',trim:'#4a3a2a',roof:'wood',roofs:{}},
};
const BOX=8,BOY=36;
function buildingBody(T,mk_,p,night,blocked,flag){
  const M=MATS[mk_]||MATS.village,pb=p>=100?100:Math.floor(p/5)*5;
  const style=(mk_==='cave'&&T.style!=='yard')?'alcove':T.style;
  const key=['b',T.name,mk_,pb,night?1:0,blocked?1:0,flag||''].join('|');
  return cached(key,T.W+16,T.H+44,c=>{
    const x=BOX,y=BOY,W=T.W,H=T.H,B=y+H;
    if(style==='rock')return mineBody(c,pb,night,blocked,x,y,W,H);
    if(style==='yard')return yardBody(c,pb,x,y,W,H,mk_);
    if(style==='alcove')return alcoveBody(c,T,pb,night,blocked,x,y,W,H,flag);
    if(pb<10){plot(c,x,y,W,H);return}
    const wallH=H-T.roofH,rt=y;
    const mat={wall:T.mat||M.wall,wallCol:T.mat==='stone'&&M.wall!=='stone'?'#c8c2b4':M.wallCol,trim:M.trim,moss:M.moss};
    const roofKind=T.style==='cone'?(mk_==='village'||mk_==='river'?'wood':'slate'):M.roof;
    const roofCol=T.name==='Mage Tower'?'#5a3a9a':T.name==='Watchtower'?(M.roofs.guild||'#3f6ea8'):(M.roofs[typeKey(T)]||defaultRoof(M.roof));
    // foundation + ground
    // just the footprint on the ground: the scaffold and the walls rise from it, with grass behind until they do
    {const D=Math.min(H-8,28);px(c,x-2,B-D-2,W+4,D+3,PAL.stoneD);px(c,x,B-D,W,D-1,PAL.dirt);px(c,x,B-D,W,1,PAL.dirtL);for(let i=x;i<x+W;i+=6)px(c,i,B-1,4,1,PAL.stone)}
    if(pb>=25){for(let i=x+2;i<x+W-1;i+=10){px(c,i,y+8,3,T.roofH-6,PAL.wood);px(c,i,y+8,1,T.roofH-6,PAL.woodL)}
      for(const yy of [y+8,y+8+Math.floor(T.roofH/2)]){px(c,x,yy,W,3,PAL.wood);px(c,x,yy,W,1,PAL.woodL)}}
    const wv=Math.round(wallH*clamp((pb-15)/35));
    if(T.style==='cone'){ // towers are walls all the way up
      const tv=Math.round((H-T.roofH)*clamp((pb-15)/50));
      if(tv>0)wallFace(c,mat,x,B-tv,W,tv,H-T.roofH,true);
      const rows=Math.round(T.roofH*clamp((pb-65)/25));
      if(rows>0)roofCone(c,x,y,W,T.roofH,rows,roofKind,roofCol);
    } else {
      if(wv>0)wallFace(c,mat,x,B-wv,W,wv,wallH,false);
      const rows=Math.round(T.roofH*clamp((pb-40)/45));
      if(rows>0)roofGable(c,x,y,W,T.roofH,rows,roofKind,roofCol);
    }
    const lit=night&&pb>=30;
    if(pb>=60&&(T.style==='cone'||wv>=wallH)){
      const dx=x+Math.floor(W/2)-6;
      px(c,dx-2,B-18,16,18,shade(mat.trim,-.1));px(c,dx-1,B-19,14,1,shade(mat.trim,-.2));
      px(c,dx,B-17,12,17,'#5a3622');px(c,dx+1,B-16,4,16,'#7a4a2a');px(c,dx+7,B-16,4,16,'#6a4024');px(c,dx,B-17,12,2,'#3e2414');px(c,dx+9,B-9,2,2,'#f2c94c');
      if(T.style==='cone'){windowAt(c,x+W/2-4,y+T.roofH+6,8,10,mat,lit,true);if(H>66)windowAt(c,x+W/2-4,y+T.roofH+22,8,8,mat,lit,true)}
      else{const wins=W>=64?[x+7,x+W-21]:W>=48?[x+5]:[];for(const wx of wins){windowAt(c,wx,B-17,14,10,mat,lit,false);
        if(pb>=100){px(c,wx-1,B-6,16,3,PAL.woodD);for(let k=0;k<6;k++)px(c,wx+k*2+1,B-8,2,2,['#f05a5a','#f2c94c','#fff6e4','#e88ad8','#f05a5a','#f2c94c'][k])}}}
      if(T.forge){px(c,x+W-22,B-16,12,9,'#2a1a14');px(c,x+W-21,B-14,10,6,lit||night?'#ff8a3a':'#d8602a');px(c,x+W-21,B-14,10,2,'#ffd06a')}
    }
    if(pb>15&&pb<90){for(const sx of [x-5,x+W+3]){px(c,sx,y+4,2,H-4,PAL.woodL);px(c,sx+1,y+4,1,H-4,PAL.woodD)}
      for(const yy of [B-Math.max(wv,6)-2,y+10]){px(c,x-5,yy,W+10,2,PAL.woodL);px(c,x-5,yy+1,W+10,1,PAL.woodD)}}
    if(T.chimney&&pb>=88){const cx=x+W-18,cy=y-6;px(c,cx,cy,9,16,'#9a5a48');px(c,cx,cy,2,16,'#b87a62');px(c,cx+7,cy,2,16,'#6e3e30');for(let k=0;k<4;k++)px(c,cx,cy+3+k*4,9,1,'#6e3e30');px(c,cx-1,cy-2,11,3,PAL.stoneD);px(c,cx-1,cy-2,11,1,PAL.stoneL)}
    if(T.turrets&&pb>=70){for(const tx of [x-6,x+W-10]){const th=Math.round(44*clamp((pb-70)/25));wallFace(c,{wall:'stone',wallCol:'#c8c2b4',trim:'#5c4a3a'},tx,B-th,16,th,th,true);
        if(pb>=90){roofCone(c,tx,B-th-18,16,18,18,'slate',roofCol);windowAt(c,tx+5,B-th+6,6,8,mat,lit,true)}}}
    if(T.banner&&pb>=80){for(const bx2 of [x+18,x+W-24]){px(c,bx2,B-wallH+2,7,14,flag||'#c43a3a');px(c,bx2,B-wallH+2,7,2,shade(flag||'#c43a3a',.3));px(c,bx2+2,B-wallH+6,3,3,'#f2c94c');px(c,bx2,B-wallH+16,3,2,flag||'#c43a3a');px(c,bx2+4,B-wallH+16,3,2,flag||'#c43a3a')}}
    if(T.awning&&pb>=80){const ay=B-wallH-1;for(let i=0;i<W+8;i++){const on=((i>>>2)%2)===0;px(c,x-4+i,ay,1,7,on?(M.roofs.shop||'#d4822e'):'#f8f0e0');px(c,x-4+i,ay+7,1,1,on?shade(M.roofs.shop||'#d4822e',-.3):'#d8d0c0')}for(let i=0;i<W+8;i+=4)px(c,x-4+i,ay+8,2,1,M.roofs.shop||'#d4822e')}
    if(T.sign&&pb>=70){const sx=x+W-4,sy=B-wallH+4;px(c,sx-2,sy-2,8,2,PAL.woodDD);px(c,sx,sy,12,12,PAL.woodDD);px(c,sx+1,sy+1,10,10,PAL.woodL);
      if(T.sign==='mug'){px(c,sx+3,sy+3,5,6,'#c88a3c');px(c,sx+3,sy+3,5,2,'#fffaf0');px(c,sx+8,sy+5,2,3,'#c88a3c')}
      else if(T.sign==='book'){px(c,sx+2,sy+3,8,6,'#7a2a2a');px(c,sx+3,sy+4,3,4,'#f6eed6');px(c,sx+6,sy+4,3,4,'#f6eed6')}
      else{px(c,sx+2,sy+3,8,6,'#e8d8b0');px(c,sx+3,sy+4,2,2,'#e04a3c');px(c,sx+6,sy+4,2,2,'#3f6ea8');px(c,sx+4,sy+7,2,1,'#f2c94c')}}
    if(T.crystal&&pb>=95){const cx=x+W/2,cy=y-6;px(c,cx-3,cy-6,6,10,'#9a7af0');px(c,cx-2,cy-9,4,3,'#c0a8ff');px(c,cx-1,cy-6,2,8,'#e8dcff');px(c,cx-3,cy+4,6,1,'#5a3a9a')}
    if(T.lantern&&pb>=95){px(c,x+W/2-3,y-4,6,6,PAL.metal);px(c,x+W/2-2,y-3,4,4,night?'#ffe07a':'#d8d0bc')}
    if(blocked){const dx=x+Math.floor(W/2)-9;px(c,dx,B-13,18,3,PAL.woodL);px(c,dx,B-12,18,1,PAL.woodD);px(c,dx+2,B-8,15,3,PAL.woodL);px(c,dx+2,B-7,15,1,PAL.woodD)}
    if(pb>=100&&flag&&!T.turrets&&!T.crystal){const fx=x+W/2+(T.style==='cone'?-1:-14),fy=y-(T.style==='cone'?8:2);px(c,fx,fy-16,2,18,'#ece6d6');px(c,fx,fy-16,1,18,'#ffffff')}
    if(pb>=100&&T.turrets){for(const tx of [x-6,x+W-10])px(c,tx+7,B-44-34,2,16,'#ece6d6')}
  });
}
function typeKey(T){for(const k in TYPES)if(TYPES[k]===T)return k;return 'cottage'}
function defaultRoof(kind){return kind==='thatch'?'#d8b45a':kind==='wood'?'#7a5a3a':kind==='slate'?'#4a5a78':'#c8453a'}
function plot(c,x,y,W,H){
  px(c,x+2,y+H-30,W-4,28,PAL.dirt);px(c,x+2,y+H-30,W-4,2,PAL.dirtL);
  for(let k=0;k<8;k++){const hh=hash('pl'+W+k);px(c,x+4+hh%(W-10),y+H-26+(hh>>>6)%22,3,1,PAL.dirtD)}
  for(const [sx,sy] of [[x+2,y+H-34],[x+W-4,y+H-34],[x+2,y+H-6],[x+W-4,y+H-6]]){px(c,sx,sy,2,6,PAL.woodD);px(c,sx,sy,1,6,PAL.woodL)}
  for(let i=x+4;i<x+W-4;i+=3)px(c,i,y+H-33,2,1,'#f4eee0');
}
function wallFace(c,M,x,y,W,h,full,tower){
  const kind=M.wall;
  const stoneCourse=(x0,y0,w,hh,R)=>{px(c,x0,y0,w,hh,R[2]);for(let yy=y0+hh-1,r=0;yy>=y0;yy-=5,r++){px(c,x0,yy,w,1,R[1]);for(let xx=x0+(r%2?5:0);xx<x0+w;xx+=10){px(c,xx,yy-4,1,4,R[1]);px(c,xx+1,yy-4,3,1,R[3])}}px(c,x0,y0,w,1,R[3])};
  if(kind==='stone'){
    const R=M.moss?RAMP.stone:[shade(M.wallCol,-.45),shade(M.wallCol,-.25),M.wallCol,shade(M.wallCol,.22),shade(M.wallCol,.4)];stoneCourse(x,y,W,h,R);
    if(M.moss)for(let k=0;k<W/5;k++){const hh=hash('ms'+x+k);px(c,x+hh%(W-2),y+h-2-(hh>>>6)%6,3,2,RAMP.moss[2]);px(c,x+hh%(W-2),y+h-2-(hh>>>6)%6,2,1,RAMP.moss[3])}
  } else if(kind==='timber'){
    const base=Math.min(h,Math.max(6,Math.round(full*.42)));
    stoneCourse(x,y+h-base,W,base,RAMP.stone);
    const up=h-base;
    if(up>0){const P=RAMP.plaster,Wd=RAMP.wood;px(c,x,y,W,up,P[2]);px(c,x,y,W,1,P[3]);
      for(let xx=x;xx<x+W;xx+=13){px(c,xx,y,3,up,Wd[1]);px(c,xx,y,1,up,Wd[2])}
      if(up>8){const mid=y+Math.floor(up/2);px(c,x,mid,W,2,Wd[1]);for(let xx=x+3;xx+10<x+W;xx+=13)for(let k=0;k<Math.min(10,mid-y);k++)px(c,xx+k,mid-1-k,2,1,Wd[1])}
      px(c,x-1,y+up-1,W+2,2,Wd[0]);px(c,x-1,y+up+1,W+2,1,'rgba(30,18,52,.28)')}
  } else if(kind==='log'){
    const R=RAMP.wood;for(let yy=y+h-1,r=0;yy>=y;yy-=5,r++){px(c,x,yy-4,W,5,r%2?R[2]:R[3]);px(c,x,yy-4,W,1,R[4]);px(c,x,yy,W,1,R[0]);disc(c,x,yy-2,2,R[3]);disc(c,x+W,yy-2,2,R[2]);px(c,x,yy-2,1,1,R[1]);px(c,x+W,yy-2,1,1,R[0])}
  } else px(c,x,y,W,h,M.wallCol);
  if(!tower){px(c,x,y,3,h,RAMP.wood[1]);px(c,x+W-3,y,3,h,RAMP.wood[0]);px(c,x,y,1,h,RAMP.wood[2])}
  else{px(c,x,y,3,h,'rgba(255,240,200,.15)');px(c,x+W-4,y,4,h,'rgba(30,18,52,.25)')}
  px(c,x+W-14,y,11,h,'rgba(30,18,52,.1)');
  if(h>=full&&!tower)px(c,x,y,W,3,'rgba(30,18,52,.38)');
}
function windowAt(c,x,y,w,h,M,lit,arch){
  const fr=RAMP.wood[1];
  px(c,x-1,y-1,w+2,h+2,fr);if(arch){px(c,x,y-2,w,1,fr);px(c,x+1,y-3,w-2,1,fr)}
  const g=lit?'#ffd86b':RAMP.slate[1],gl=lit?'#fff2b0':RAMP.slate[3];
  px(c,x,y,w,h,g);if(arch)px(c,x+1,y-2,w-2,2,g);
  if(!lit){px(c,x+1,y+1,2,1,gl);px(c,x+1,y+2,1,1,gl);px(c,x+w-3,y+h-3,1,1,gl)}else px(c,x+1,y+1,w-2,2,gl);
  px(c,x+Math.floor(w/2)-1,y,1,h,fr);if(!arch)px(c,x,y+Math.floor(h/2),w,1,fr);
  if(!arch&&w>=10){const S=M.shutter||RAMP.wood;for(const sx of [x-5,x+w+1]){px(c,sx,y-1,4,h+2,S[2]);px(c,sx,y-1,4,1,S[3]);px(c,sx+1,y+2,2,1,S[1]);px(c,sx+1,y+h-3,2,1,S[1])}px(c,x-2,y+h+1,w+4,2,RAMP.wood[2]);px(c,x-2,y+h+2,w+4,1,RAMP.wood[0])}
}
function roofGable(c,x,y,W,H,rows,kind,R0){
  const L=x-4,WW=W+8,yb=y+H;
  const R=kind==='thatch'?RAMP.thatch:kind==='slate'?[shade(R0,-.5),shade(R0,-.28),R0,shade(R0,.25),shade(R0,.45)]:kind==='wood'?RAMP.wood:[shade(R0,-.5),shade(R0,-.28),R0,shade(R0,.25),shade(R0,.42)];
  for(let i=0;i<rows;i++){
    const yy=yb-1-i;
    if(kind==='thatch'){const bundle=Math.floor(i/5),inB=i%5;px(c,L,yy,WW,1,inB===0?R[1]:R[2]);for(let k=(bundle%2)*3;k<WW;k+=6){px(c,L+k,yy,1,1,R[1]);if(inB===4)px(c,L+k+1,yy,3,1,R[3])}if(inB===4)px(c,L,yy,WW,1,R[3]);px(c,L+WW-12,yy,12,1,inB===0?R[0]:R[1]);continue}
    const sh=kind==='slate'?3:4,band=Math.floor(i/sh),inB=i%sh,off=(band%2)?3:0,step=kind==='slate'?5:6;
    px(c,L,yy,WW,1,inB===0?R[0]:inB===sh-1?R[3]:R[2]);
    if(inB>0)for(let xx=L+off;xx<L+WW;xx+=step){px(c,xx,yy,1,1,R[1]);if(inB===sh-1)px(c,xx+1,yy,1,1,R[4])}
    px(c,L+WW-12,yy,12,1,inB===0?R[0]:R[1]);px(c,L,yy,2,1,R[3]);
  }
  if(rows>=H){px(c,L,y,WW,3,R[4]);px(c,L,y+3,WW,1,R[1]);px(c,L+WW-12,y,12,3,R[3]);for(let xx=L+2;xx<L+WW-2;xx+=8)px(c,xx,y+1,2,1,R[2])}
  px(c,L,yb-1,WW,1,R[0]);px(c,L,yb,WW,1,'rgba(30,18,52,.3)');
}
function roofCone(c,x,y,W,H,rows,kind,R){
  const Rd=shade(R,-.3),Rl=shade(R,.3);
  for(let i=0;i<rows;i++){const yy=y+H-1-i,hw=Math.max(1,Math.round((W/2+3)*(1-i/H)));
    const base=kind==='wood'?'#7a5a3a':R;px(c,x+W/2-hw,yy,hw*2,1,base);px(c,x+W/2-hw,yy,Math.max(1,Math.round(hw*.7)),1,shade(base,.25));px(c,x+W/2+Math.round(hw*.45),yy,Math.round(hw*.55),1,shade(base,-.3));if(i%3===0)px(c,x+W/2-hw,yy,hw*2,1,shade(base,-.35))}
}
function mineBody(c,pb,night,blocked,x,y,W,H){
  const B=y+H,prof=[16,10,6,3,1,0,0,0,0,0,0,0];
  for(let yy=y+4;yy<B;yy++){const i=Math.min(prof.length-1,Math.floor((yy-y-4)/3.4)),o=prof[i],ww=W-o*2;px(c,x+o,yy,ww,1,PAL.stone);px(c,x+o,yy,Math.round(ww*.3),1,PAL.stoneL);px(c,x+o+Math.round(ww*.72),yy,Math.round(ww*.28),1,PAL.stoneD)}
  for(let k=0;k<16;k++){const hh=hash('rk'+k),rx=x+6+hh%(W-14),ry=y+12+(hh>>>6)%(H-20);px(c,rx,ry,4,1,PAL.stoneDD);px(c,rx,ry-1,3,1,PAL.stoneL)}
  px(c,x,B-2,W,2,PAL.stoneDD);
  const g=clamp((pb-10)/60),ew=Math.round(8+12*g),eh=Math.round(6+14*g),ex=x+W/2-ew/2;
  if(pb>=10){px(c,ex,B-eh,ew,eh,'#140e0c');px(c,ex+2,B-eh+2,ew-4,eh-2,'#241a14')}
  if(pb>=35){px(c,ex-3,B-eh-3,ew+6,3,PAL.wood);px(c,ex-3,B-eh-3,ew+6,1,PAL.woodL);px(c,ex-3,B-eh,3,eh,PAL.wood);px(c,ex+ew,B-eh,3,eh,PAL.woodD)}
  if(pb>=55)for(let yy=B;yy<B+16;yy+=3)px(c,ex+2,yy,ew-4,1,PAL.woodD);
  if(pb>=50)for(let k=0;k<5;k++){const hh=hash('ore'+k);px(c,x+8+hh%(W-16),y+16+(hh>>>7)%(H-26),2,2,'#f2c94c')}
  if(night&&pb>=40)px(c,ex-7,B-eh-2,3,4,'#ffe07a');
  if(blocked)for(let k=0;k<4;k++)px(c,ex+k*5-2,B-6+(k%2)*2,6,6,PAL.stoneD);
  if(pb>=100)px(c,x+W/2,y-8,2,16,'#ece6d6');
}
function alcoveBody(c,T,pb,night,blocked,x,y,W,H,flag){
  const B=y+H;
  for(let yy=y;yy<B;yy++){const k=(yy-y)/H,o=Math.round(8*(1-Math.min(1,k*2.5)));px(c,x+o-4,yy,W+8-o*2,1,'#5a5248');px(c,x+o-4,yy,6,1,'#7a7064');px(c,x+W-2-o,yy,6,1,'#3e3830')}
  for(let k=0;k<14;k++){const hh=hash('al'+k);px(c,x+hh%W,y+6+(hh>>>6)%(H-10),4,1,'#3e3830')}
  const g=clamp((pb-5)/60),ew=Math.round(24+20*g),eh=Math.round(16+16*g),ex=x+W/2-ew/2;
  px(c,ex,B-eh,ew,eh,'#1a1410');px(c,ex+2,B-eh+2,ew-4,eh-2,night?'#3a2a1c':'#2a2018');
  if(pb>=30){px(c,ex-4,B-eh-4,ew+8,4,PAL.wood);px(c,ex-4,B-eh-4,ew+8,1,PAL.woodL);px(c,ex-4,B-eh,4,eh,PAL.wood);px(c,ex+ew,B-eh,4,eh,PAL.woodD)}
  if(pb>=50){px(c,ex+6,B-12,ew-12,4,PAL.woodL);px(c,ex+6,B-8,2,8,PAL.woodD);px(c,ex+ew-8,B-8,2,8,PAL.woodD);px(c,ex+10,B-15,8,3,'#f6eed6');px(c,ex+20,B-16,6,4,'#f2c94c')}
  if(pb>=70){for(let k=0;k<6;k++)px(c,ex+ew-14+k*2,B-3-(k%3),3,3,k%2?'#f2c94c':'#d8a63a')}
  if(flag&&pb>=60){px(c,ex+ew/2-5,B-eh-12,10,8,flag);px(c,ex+ew/2-5,B-eh-12,10,2,shade(flag,.3))}
  if(blocked)px(c,ex,B-eh/2,ew,3,PAL.woodL);
}
function yardBody(c,pb,x,y,W,H,mk_){
  const B=y+H,top=y+6,gd=mk_==='cave'?'#5a5044':PAL.dirt;
  px(c,x,top,W,H-6,gd);for(let k=0;k<16;k++){const hh=hash('yd'+k);px(c,x+2+hh%(W-4),top+2+(hh>>>6)%(H-10),2,1,shade(gd,-.2))}
  if(pb>=60){for(const yy of [top+8,B-10])px(c,x+8,yy,W-16,2,'#f4eee0');for(const xx of [x+8,x+W-10])px(c,xx,top+8,2,H-16,'#f4eee0')}
  const per=[];for(let i=x;i<=x+W-2;i+=8)per.push([i,top]);for(let j=top+8;j<=B-2;j+=8)per.push([x+W-2,j]);for(let i=x+W-10;i>=x;i-=8)per.push([i,B-2]);for(let j=B-10;j>top;j-=8)per.push([x,j]);
  const n=Math.round(per.length*clamp(pb/85));
  for(let i=1;i<n;i++){const [x1,y1]=per[i-1],[x2,y2]=per[i];if(Math.abs(y1-y2)<1){px(c,Math.min(x1,x2),y1-5,Math.abs(x2-x1)+2,2,PAL.woodL);px(c,Math.min(x1,x2),y1-2,Math.abs(x2-x1)+2,2,PAL.wood)}else px(c,x1,Math.min(y1,y2)-5,2,Math.abs(y2-y1)+2,PAL.wood)}
  for(let i=0;i<n;i++){const [fx,fy]=per[i];px(c,fx,fy-8,2,9,PAL.woodD);px(c,fx,fy-8,1,9,PAL.woodL)}
  if(pb>=40)for(const dx of [x+W/2-14,x+W/2+8]){const dy=top+H/2-6;px(c,dx+3,dy,2,14,PAL.woodD);px(c,dx-2,dy+5,12,2,PAL.woodD);px(c,dx,dy-6,8,8,'#d8c08a');px(c,dx,dy-6,8,2,'#ecd8a6');px(c,dx+3,dy-3,2,2,'#d63c34')}
  if(pb>=70){px(c,x+W-16,top+10,10,2,PAL.woodD);for(let k=0;k<3;k++){px(c,x+W-15+k*3,top+4,1,8,'#d8dce4')}}
  if(pb>=100)px(c,x+4,y-10,2,18,'#ece6d6');
}
function drawField(c,x,y,w,h,p){
  px(c,x,y,w,h,PAL.dirtD);px(c,x,y,w,1,PAL.dirtL);
  const rows=Math.floor(h/9);
  for(let r=0;r<rows;r++){const ry=y+3+r*9;px(c,x+1,ry+5,w-2,2,PAL.dirt);px(c,x+1,ry+5,w-2,1,PAL.dirtL);
    for(let k=0;k<Math.floor((w-4)/6);k++){const gx=x+3+k*6,g=clamp((p-r*8)/75);if(g<=0)continue;const hh=1+Math.round(g*5);
      px(c,gx,ry+6-hh,1,hh,'#3f9a3a');px(c,gx+1,ry+6-hh,2,1,'#6cc25a');px(c,gx-1,ry+7-hh,1,1,'#6cc25a');
      if(g>.85){px(c,gx,ry+5-hh,3,3,p>=100?'#f2c94c':'#ee7b4a');px(c,gx,ry+5-hh,1,1,'#fff09a')}}}
}

// ===================== weather + light (shared by town and world) =====================
let WX={kind:'partly',tempC:null,place:'',updated:'',auto:true};
let WX_PICK='auto',WX_FORCE=null;
// local weather comes with the Royal Charter: a free kingdom keeps a fair, partly cloudy sky (the snow-day egg still falls for everyone)
function wxKind(){if(WX_FORCE)return WX_FORCE;if(typeof snowDay==='function'&&world.W&&snowDay())return 'snow';if(!premium())return 'partly';return WX_PICK==='auto'?WX.kind:WX_PICK}
let LIGHT_DAY=false; // postcards are always painted at midday
function lighting(indoor){
  if(LIGHT_DAY&&!indoor)return {dark:0,tint:'0,0,0',night:0};
  if(indoor)return {dark:.34,tint:'22,14,34',night:1,indoor:1};
  const d=new Date(),h=d.getHours()+d.getMinutes()/60, k=wxKind();
  let L;
  if(h>=21||h<5) L={dark:.56,tint:'18,26,74',night:1};
  else if(h<6.5) L={dark:.3,tint:'70,40,96',night:1};
  else if(h<8) L={dark:.06,tint:'255,200,140',night:0};
  else if(h<17) L={dark:0,tint:'0,0,0',night:0};
  else if(h<18.5) L={dark:.07,tint:'255,190,120',night:0};
  else L={dark:.44,tint:'44,30,96',night:1};
  const extra={cloudy:.08,rain:.14,drizzle:.1,storm:.24,fog:.1,snow:.06}[k]||0;
  if(extra){L.dark=Math.min(.6,L.dark+extra);if(!L.night&&L.dark>.05)L.tint='40,50,80'}
  if(k==='storm'||k==='rain')L.night=L.night||0;
  return L;
}
function weatherState(o){return o.wxs||(o.wxs={drops:[],flakes:[],flash:0,next:6+Math.random()*8,flies:[]})}
function drawWeather(c,W,H,t,dt,o,L){
  if(L.indoor)return;
  const k=wxKind(), s=weatherState(o);
  // drifting cloud shadows
  const cover={partly:3,cloudy:6,rain:7,drizzle:6,storm:8,fog:2,snow:5}[k]||0;
  for(let i=0;i<cover;i++){const hh=hash('cl'+i);const r=40+hh%50, sp=4+(hh>>>8)%6;
    const x=((hh%(W+200))+t*sp)%(W+200)-100, y=(hh>>>12)%H;
    c.fillStyle=`rgba(24,20,48,${k==='partly'?.1:.14})`;
    for(let yy=-r*.45;yy<r*.45;yy+=2){const hw=Math.round(r*Math.sqrt(1-(yy*yy)/(r*r*.2025)));c.fillRect(Math.round(x-hw),Math.round(y+yy),hw*2,2)}}
  if(k==='fog'){for(let i=0;i<4;i++){const y=((i*H/4)+t*3)%H, x=(t*6*(i%2?1:-1))%W;c.fillStyle='rgba(230,234,244,.16)';c.fillRect(0,y,W,18+i*4);for(let xx=(Math.floor(x)%4+4)%4;xx<W;xx+=4)c.fillRect(xx,y-2,2,2)}}
  if(k==='rain'||k==='drizzle'||k==='storm'){
    const want=Math.round(W*H/(k==='drizzle'?2600:k==='storm'?520:900));
    while(s.drops.length<want)s.drops.push({x:Math.random()*W,y:Math.random()*H,v:rnd(160,230),l:rnd(4,8)});
    s.drops.length=Math.min(s.drops.length,want);
    c.fillStyle=k==='storm'?'rgba(200,220,255,.55)':'rgba(190,215,255,.5)';
    for(const d of s.drops){d.y+=d.v*dt;d.x-=d.v*dt*.18;if(d.y>H){d.y=-8;d.x=Math.random()*W*1.1;
        if(Math.random()<.5)s.flakes.push({x:d.x,y:Math.random()*H,life:.25,splash:1})}
      if(d.x<0)d.x+=W;for(let i=0;i<d.l;i++)c.fillRect(Math.round(d.x+i*.18),Math.round(d.y-i),1,1)}
    c.fillStyle='rgba(220,235,255,.6)';
    s.flakes=s.flakes.filter(f=>{if(!f.splash)return true;f.life-=dt;if(f.life<=0)return false;const r=f.life>.12?1:2;c.fillRect(Math.round(f.x-r),Math.round(f.y),1,1);c.fillRect(Math.round(f.x+r),Math.round(f.y),1,1);c.fillRect(Math.round(f.x),Math.round(f.y-r),1,1);return true});
  }
  if(k==='snow'){
    c.fillStyle='rgba(255,255,255,.18)';c.fillRect(0,0,W,H);
    const want=Math.round(W*H/700);
    while(s.flakes.length<want)s.flakes.push({x:Math.random()*W,y:Math.random()*H,v:rnd(10,22),p:Math.random()*6,s:Math.random()<.3?2:1});
    for(const f of s.flakes){if(f.splash)continue;f.y+=f.v*dt;f.x+=Math.sin(t*1.5+f.p)*.3;if(f.y>H){f.y=-2;f.x=Math.random()*W}
      c.fillStyle='#ffffff';c.fillRect(Math.round(f.x),Math.round(f.y),f.s,f.s)}
  }
  if(k==='storm'){s.next-=dt;if(s.next<=0){s.flash=1;s.next=rnd(7,15);if(typeof SND!=='undefined'&&SND.on&&((o===world&&!active)||o===active))sfx('thunder',1)}
    if(s.flash>0){c.fillStyle=`rgba(255,255,255,${s.flash*.55})`;c.fillRect(0,0,W,H);s.flash=Math.max(0,s.flash-dt*3.5)}}
  if(L.night&&(k==='clear'||k==='partly')){
    while(s.flies.length<Math.round(W*H/9000))s.flies.push({x:Math.random()*W,y:Math.random()*H,p:Math.random()*6});
    for(const f of s.flies){f.x+=Math.sin(t*.7+f.p)*.25;f.y+=Math.cos(t*.5+f.p)*.2;if(Math.sin(t*2+f.p*3)>.2){c.fillStyle='#d8ff7a';c.fillRect(Math.round(f.x),Math.round(f.y),1,1)}}
  }
}
function applyLight(c,W,H,L,lights,holes){
  if(L.dark<=0){c.globalCompositeOperation='lighter';for(const [x,y,r,col,s=1] of lights){if(!col||s<.4||r<30)continue;const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(${col},${.14*s})`);g.addColorStop(1,`rgba(${col},0)`);c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2)}c.globalCompositeOperation='source-over';return}
  // rooms with their own light (the inn) are shaded far less than the night outside
  c.fillStyle=`rgba(${L.tint},${L.dark})`;if(holes&&holes.length){c.beginPath();c.rect(0,0,W,H);for(const [x,y,w,h] of holes)c.rect(x+w,y,-w,h);c.fill('evenodd');c.fillStyle=`rgba(${L.tint},${L.dark*.3})`;for(const [x,y,w,h] of holes)c.fillRect(x,y,w,h)}else c.fillRect(0,0,W,H);
  if(!L.night&&L.dark<.2)return;
  c.globalCompositeOperation='lighter';
  for(const [x,y,r,col,s=1] of lights){const k=col||'255,196,110',g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(${k},${.38*s})`);g.addColorStop(.6,`rgba(${k},${.13*s})`);g.addColorStop(1,`rgba(${k},0)`);c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2)}
  c.globalCompositeOperation='source-over';
}


// shade a layer of sprites only (their own pixels), with the same night and the same pools of light as the ground under them
function shadeLayer(c,W,H,L,lights,holes){c.save();c.globalCompositeOperation='source-atop';c.fillStyle=`rgba(${L.tint},${L.dark})`;
  if(holes&&holes.length){c.beginPath();c.rect(0,0,W,H);for(const [x,y,w,h] of holes)c.rect(x+w,y,-w,h);c.fill('evenodd');c.fillStyle=`rgba(${L.tint},${L.dark*.3})`;for(const [x,y,w,h] of holes)c.fillRect(x,y,w,h)}else c.fillRect(0,0,W,H);
  if(L.night||L.dark>=.2)for(const [x,y,r,col,s=1] of lights){const k=col||'255,196,110',g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(${k},${.3*s})`);g.addColorStop(1,`rgba(${k},0)`);c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2)}
  c.restore()}

// ===================== sound: a 16-bit style chip synth =====================
// Everything is synthesised live with Web Audio: pulse waves (12.5/25/50%), a triangle bass, and a noise channel,
// the same palette as SNES/Genesis-era RPG soundtracks. Music is a small tracker with an original theme per place.
const SND={ctx:null,on:false,want:false,scene:null,track:null,pending:null,step:0,next:0,timer:null,last:{},amb:{}};
const NOTE_I={C:0,'C#':1,Db:1,D:2,'D#':3,Eb:3,E:4,F:5,'F#':6,Gb:6,G:7,'G#':8,Ab:8,A:9,'A#':10,Bb:10,B:11};
function nfreq(n){const m=/^([A-G](?:#|b)?)(-?\d)$/.exec(n);if(!m)return 0;return 440*Math.pow(2,(NOTE_I[m[1]]+(+m[2]+1)*12-69)/12)}
function chordTones(ch){const m=/^([A-G](?:#|b)?)(m|7|dim|m7)?$/.exec(ch)||['','C',''];const r=NOTE_I[m[1]],q=m[2]||'';
  const iv=q==='m'?[0,3,7]:q==='dim'?[0,3,6]:q==='7'?[0,4,7,10]:q==='m7'?[0,3,7,10]:[0,4,7];return {root:r,iv}}
const midiF=m=>440*Math.pow(2,(m-69)/12);
// ---- the themes (original compositions). '-' holds the previous note, '.' is a rest; one token per step.
const TRACKS={
  world:{bpm:120,spb:8,wave:.25,arp:'updown',bass:'root5',drum:'k.h.s.hh',
    chords:'C Am F G C Am F G',
    lead:'E5 - G5 - C6 - B5 A5 | A5 - - G5 E5 - C5 - | F5 - A5 - C6 - A5 F5 | G5 - - - D5 - G5 - | E5 - G5 - C6 - D6 E6 | D6 - C6 - A5 - E5 - | F5 - A5 C6 B5 - G5 - | C6 - - - . . . .'},
  capital:{bpm:108,spb:8,wave:.5,arp:'up',bass:'root5',drum:'k.s.kks.',
    chords:'D A Bm G D G A D',
    lead:'F#5 - A5 - D6 - - - | E6 - C#6 - A5 - - - | D6 - B5 - F#5 - B5 - | G5 - - - . . . . | F#5 - A5 - D6 - F#6 - | E6 - D6 - B5 - G5 - | A5 - C#6 - E6 - C#6 - | D6 - - - . . . .'},
  port:{bpm:150,spb:6,wave:.25,arp:'up',bass:'root',drum:'k.hs.h',
    chords:'Am G Am E Am G C E',
    lead:'A4 - - C5 - E5 | D5 - B4 G4 - - | A4 - C5 E5 - A5 | G#5 - - E5 - - | A5 - G5 E5 - C5 | D5 - B4 G4 - B4 | C5 - E5 G5 - E5 | E5 - D5 B4 - G#4'},
  village:{bpm:96,spb:8,wave:'tri',arp:'updown',bass:'root5',drum:'k...h...',
    chords:'F C Dm Bb F C Bb C',
    lead:'A4 - C5 - F5 - - E5 | D5 - - C5 G4 - - - | D5 - F5 - A5 - G5 F5 | D5 - - - . . . . | A4 - C5 - F5 - A5 - | G5 - E5 - C5 - - - | D5 - F5 - E5 - G5 - | F5 - - - . . . .'},
  river:{bpm:88,spb:8,wave:.125,arp:'updown',bass:'root',drum:null,
    chords:'G Em C D G Em Am D',
    lead:'B4 - - - D5 - G5 - | . . E5 - - - B4 - | C5 - E5 - G5 - - - | F#5 - - - . . . . | G5 - F#5 - E5 - D5 - | B4 - - - G4 - - - | A4 - C5 - E5 - D5 - | D5 - - - . . . .'},
  arcane:{bpm:80,spb:8,wave:.125,arp:'up',bass:'drone',drum:null,
    chords:'Dm Bb Gm A Dm Bb Gm A7',
    lead:'D5 - - F5 - A5 - - | Bb5 - A5 - F5 - - - | G5 - - Bb5 - D6 - - | C#6 - - - A5 - - - | D6 - - C#6 - A5 - - | F5 - G5 - Bb5 - A5 - | G5 - F5 - E5 - D5 - | C#5 - - - . . . .'},
  cave:{bpm:70,spb:8,wave:'tri',arp:'none',bass:'drone',drum:'d.......',
    chords:'Em Em C B',
    lead:'E4 - - - . . G4 - | F#4 - - - . . . . | E4 - - - B3 - - - | D#4 - - - . . . .'},
  curio:{bpm:150,spb:6,wave:.5,arp:'none',bass:'root',drum:'k.hk.h',
    chords:'C G7 G7 C C F G7 C',
    lead:'E5 - - G5 - - | F5 - D5 - B4 - | D5 - - F5 - - | E5 - C5 - G4 - | E5 - G5 - C6 - | A5 - - F5 - - | G5 - F5 - D5 - | C5 - - . . .'},
  court:{bpm:90,spb:8,wave:.25,arp:'up',bass:'root5',drum:'T...s..T',
    chords:'Bb F Gm Eb Bb F Eb F',
    lead:'F5 - - D5 F5 - Bb5 - | A5 - - - F5 - - - | G5 - Bb5 - D6 - C6 Bb5 | G5 - - - . . . . | Bb5 - - A5 Bb5 - D6 - | C6 - - - A5 - F5 - | G5 - Eb5 - C5 - Eb5 - | F5 - - - . . . .'},
};
for(const k in TRACKS){const T=TRACKS[k];T.lead=T.lead.replace(/\|/g,' ').trim().split(/\s+/);T.chords=T.chords.split(' ');T.len=T.lead.length;T.dur=60/T.bpm/2}
// ---- voices
const PULSE={};
function pulseWave(ctx,d){if(PULSE[d])return PULSE[d];const n=40,re=new Float32Array(n),im=new Float32Array(n);for(let i=1;i<n;i++)re[i]=2/(i*Math.PI)*Math.sin(i*Math.PI*d);return PULSE[d]=ctx.createPeriodicWave(re,im)}
function out(dest,pan){const c=SND.ctx;if(!pan||!c.createStereoPanner)return dest;const p=c.createStereoPanner();p.pan.value=clamp(pan,-1,1);p.connect(dest);return p}
function tone(f,t,dur,o={}){const c=SND.ctx;if(!c||!f)return;const g=c.createGain(),v=o.vol??.2,a=o.a??.004,dest=out(o.dest||SND.sfx,o.pan);
  const osc=c.createOscillator();if(o.wave==='tri')osc.type='triangle';else if(o.wave==='sine')osc.type='sine';else if(o.wave==='saw')osc.type='sawtooth';else osc.setPeriodicWave(pulseWave(c,o.wave||.5));
  osc.frequency.setValueAtTime(f,t);if(o.slide)osc.frequency.exponentialRampToValueAtTime(Math.max(20,o.slide),t+dur);
  if(o.vib){const l=c.createOscillator(),lg=c.createGain();l.frequency.value=o.vib;lg.gain.value=o.vibD||f*.02;l.connect(lg);lg.connect(osc.frequency);l.start(t);l.stop(t+dur+.05)}
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+a);g.gain.setValueAtTime(v,t+Math.max(a,dur*(o.hold??.6)));g.gain.linearRampToValueAtTime(0,t+dur);
  osc.connect(g);g.connect(dest);osc.start(t);osc.stop(t+dur+.02)}
function noise(t,dur,o={}){const c=SND.ctx;if(!c)return;const s=c.createBufferSource();s.buffer=SND.nbuf;s.loop=true;s.playbackRate.value=o.rate||1;
  const f=c.createBiquadFilter();f.type=o.type||'highpass';f.frequency.setValueAtTime(o.f||1000,t);if(o.f2)f.frequency.exponentialRampToValueAtTime(o.f2,t+dur);f.Q.value=o.q||.7;
  const g=c.createGain(),v=o.vol??.2,a=o.a??.002;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+a);g.gain.exponentialRampToValueAtTime(.0005,t+dur);
  s.connect(f);f.connect(g);g.connect(out(o.dest||SND.sfx,o.pan));s.start(t,Math.random()*.5);s.stop(t+dur+.05)}
// ---- music sequencer
function playStep(T,i,t){const d=T.dur,bar=Math.floor(i/T.spb),pos=i%T.spb,ch=chordTones(T.chords[bar%T.chords.length]),M=SND.music;
  const n=T.lead[i];if(n&&n!=='-'&&n!=='.'){let h=1;while(T.lead[(i+h)%T.len]==='-'&&h<16)h++;tone(nfreq(n),t,h*d*.94,{wave:T.wave==='tri'?'tri':T.wave,vol:T.wave==='tri'?.2:.11,dest:M,hold:.5,vib:h>2?5.5:0,vibD:nfreq(n)*.012})}
  const base=48+ch.root;
  if(T.bass==='drone'){if(pos===0)tone(midiF(36+ch.root),t,d*T.spb*.98,{wave:'tri',vol:.16,dest:M,hold:.9})}
  else if(T.bass==='root'){if(pos%3===0||(T.spb===8&&pos%4===0))tone(midiF(36+ch.root),t,d*1.7,{wave:'tri',vol:.17,dest:M})}
  else if(pos%2===0){tone(midiF(36+ch.root+(pos%4===2?7:0)),t,d*1.6,{wave:'tri',vol:.17,dest:M})}
  if(T.arp!=='none'){const tones=[...ch.iv,12],k=T.arp==='updown'?[0,1,2,3,2,1][pos%6]:pos%tones.length;tone(midiF(60+ch.root+tones[k%tones.length]),t,d*.8,{wave:.125,vol:.035,dest:M,hold:.2})}
  if(T.drum){const p=T.drum[pos%T.drum.length];
    if(p==='k')tone(140,t,.12,{wave:'sine',vol:.28,slide:45,dest:M,hold:.1});
    else if(p==='T')tone(98,t,.35,{wave:'tri',vol:.3,slide:70,dest:M,hold:.2});
    else if(p==='s')noise(t,.12,{f:1800,vol:.09,dest:M});
    else if(p==='h')noise(t,.035,{f:7000,vol:.04,dest:M});
    else if(p==='d')tone(1760,t,.09,{wave:'sine',vol:.06,slide:1100,dest:M,hold:.1})}}
function sched(){const c=SND.ctx;if(!c||!SND.on)return;
  if(SND.pending){const now=c.currentTime;if(!SND.fadeAt){SND.fadeAt=now;SND.music.gain.setTargetAtTime(0,now,.18)}
    if(now-SND.fadeAt>.6){SND.track=SND.pending;SND.pending=null;SND.fadeAt=0;SND.step=0;SND.next=now+.05;SND.music.gain.setTargetAtTime(SND.musicVol,now,.25)}}
  if(!SND.track)return;while(SND.next<c.currentTime+.3){playStep(SND.track,SND.step,SND.next);SND.next+=SND.track.dur;SND.step=(SND.step+1)%SND.track.len}}
function sndScene(key){SND.scene=key;const T=TRACKS[key]||TRACKS.world;if(!SND.on){SND.track=T;return}if(SND.track!==T&&SND.pending!==T){SND.pending=T;SND.fadeAt=0}}
// ---- sound effects
const SFX={
  blip:(t,v,p)=>tone(1320,t,.05,{wave:.25,vol:.12*v,pan:p}),
  ok:(t,v,p)=>{tone(880,t,.07,{wave:.25,vol:.13*v,pan:p});tone(1319,t+.07,.12,{wave:.25,vol:.13*v,pan:p})},
  whoosh:(t,v)=>noise(t,.5,{type:'bandpass',f:3200,f2:240,q:1.2,vol:.22*v,a:.15}),
  arrive:(t,v)=>[523,659,784,1047].forEach((f,i)=>tone(f,t+i*.09,i<3?.09:.35,{wave:.25,vol:.12*v})),
  fanfare:(t,v)=>{[[392,0,.12],[523,.12,.12],[659,.24,.12],[784,.36,.3],[659,.7,.1],[784,.8,.5]].forEach(([f,o,d])=>{tone(f,t+o,d,{wave:.25,vol:.13*v});tone(f/2,t+o,d,{wave:'tri',vol:.12*v})})},
  cheer:(t,v,p)=>{[523,659,784,1047,1319].forEach((f,i)=>tone(f,t+i*.07,i<4?.07:.4,{wave:.25,vol:.12*v,pan:p,vib:i===4?7:0}));for(let k=0;k<5;k++)tone(2093+k*300,t+.35+k*.05,.06,{wave:'tri',vol:.05*v,pan:p})},
  anvil:(t,v,p)=>{tone(1568,t,.22,{wave:.25,vol:.13*v,pan:p,hold:.05});tone(2349,t,.16,{wave:.125,vol:.07*v,pan:p,hold:.05});noise(t,.05,{f:4000,vol:.12*v,pan:p})},
  hammer:(t,v,p)=>{tone(220,t,.08,{wave:'tri',vol:.22*v,slide:110,pan:p});noise(t,.06,{type:'lowpass',f:1200,vol:.16*v,pan:p})},
  pick:(t,v,p)=>{noise(t,.12,{type:'bandpass',f:900,q:1.5,vol:.24*v,pan:p});tone(330,t,.05,{wave:.25,vol:.07*v,pan:p})},
  hoe:(t,v,p)=>noise(t,.14,{type:'lowpass',f:500,vol:.24*v,pan:p}),
  brush:(t,v,p)=>noise(t,.18,{type:'bandpass',f:3500,q:.8,vol:.07*v,a:.06,pan:p}),
  zap:(t,v,p)=>tone(880,t,.16,{wave:.25,vol:.12*v,slide:110,pan:p,hold:.2}),
  coin:(t,v,p)=>{tone(988,t,.06,{wave:.5,vol:.1*v,pan:p});tone(1319,t+.06,.18,{wave:.5,vol:.1*v,pan:p})},
  chatter:(t,v,p)=>{const n=3+Math.floor(Math.random()*4),b=260+Math.random()*220;for(let i=0;i<n;i++)tone(b*(.85+Math.random()*.4),t+i*.075,.05,{wave:.25,vol:.09*v,pan:p})},
  sing:(t,v,p)=>{const s=[0,2,4,7,9,12],b=440+Math.random()*120;let o=0;for(let i=0;i<4;i++){const d=.16+Math.random()*.12;tone(b*Math.pow(2,s[Math.floor(Math.random()*6)]/12),t+o,d,{wave:'tri',vol:.13*v,pan:p,vib:6});o+=d+.02}},
  snore:(t,v,p)=>noise(t,.7,{type:'lowpass',f:320,vol:.07*v,a:.35,pan:p}),
  baa:(t,v,p)=>{tone(470,t,.42,{wave:.25,vol:.1*v,slide:360,vib:9,vibD:22,pan:p,hold:.7});tone(940,t,.42,{wave:.125,vol:.03*v,slide:720,vib:9,vibD:40,pan:p,hold:.7})},
  crackle:(t,v,p)=>{const n=1+Math.floor(Math.random()*3);for(let i=0;i<n;i++)noise(t+Math.random()*.12,.02,{f:2500+Math.random()*3000,vol:.12*v,pan:p})},
  wave:(t,v,p)=>noise(t,1.6,{type:'lowpass',f:700,vol:.09*v,a:.7,pan:p}),
  clink:(t,v,p)=>{tone(2637,t,.12,{wave:'tri',vol:.08*v,pan:p,hold:.05});tone(3136,t+.04,.1,{wave:'tri',vol:.06*v,pan:p,hold:.05})},
  step:(t,v,p)=>noise(t,.05,{type:'lowpass',f:600,vol:.1*v,pan:p}),
  chain:(t,v)=>{for(let i=0;i<8;i++){noise(t+i*.07,.03,{f:3000,vol:.08*v});tone(1800+(i%2)*200,t+i*.07,.03,{wave:.125,vol:.03*v})}tone(110,t,.6,{wave:'tri',vol:.08*v,slide:90})},
  grumble:(t,v,p)=>{tone(90,t,.9,{wave:.125,vol:.14*v,slide:70,vib:11,vibD:8,pan:p,hold:.5});noise(t,.9,{type:'lowpass',f:380,vol:.12*v,a:.2,pan:p})},
  flap:(t,v,p)=>{noise(t,.22,{type:'lowpass',f:520,f2:160,vol:.26*v,a:.03,pan:p});tone(70,t,.12,{wave:'tri',vol:.12*v,slide:45,pan:p})},
  swoop:(t,v,p)=>{noise(t,1.1,{type:'bandpass',f:2600,f2:420,q:1.4,vol:.24*v,a:.25,pan:p});tone(700,t,1,{wave:'sine',vol:.04*v,slide:180,pan:p})},
  bleat:(t,v,p)=>{for(let i=0;i<4;i++){const s=t+i*.24,f=620+Math.random()*120;tone(f,s,.2,{wave:.25,vol:.11*v,slide:f*1.25,vib:16,vibD:40,pan:p,hold:.7})}},
  chomp:(t,v,p)=>{noise(t,.09,{type:'bandpass',f:1300,q:1.2,vol:.26*v,pan:p});tone(140,t,.07,{wave:'tri',vol:.16*v,slide:80,pan:p});noise(t+.07,.05,{f:3200,vol:.08*v,pan:p})},
  gulp:(t,v,p)=>{tone(240,t,.18,{wave:'sine',vol:.16*v,slide:110,pan:p});tone(180,t+.14,.14,{wave:'sine',vol:.12*v,slide:90,pan:p})},
  meow:(t,v,p)=>{tone(700,t,.35,{wave:.25,vol:.1*v,slide:520,vib:6,vibD:30,pan:p,hold:.5});tone(1400,t,.3,{wave:.125,vol:.03*v,slide:1000,pan:p})},
  cluck:(t,v,p)=>{for(let i=0;i<3;i++){tone(560+i*40,t+i*.09,.06,{wave:.25,vol:.1*v,slide:380,pan:p});noise(t+i*.09,.04,{f:1800,vol:.05*v,pan:p})}},
  caw:(t,v,p)=>{for(let i=0;i<2;i++){noise(t+i*.32,.22,{type:'bandpass',f:1300,q:2.5,vol:.18*v,a:.02,pan:p});tone(420,t+i*.32,.22,{wave:.125,vol:.08*v,slide:300,pan:p})}},
  bonk:(t,v,p)=>{tone(320,t,.12,{wave:'tri',vol:.2*v,slide:160,pan:p});noise(t,.05,{f:2400,vol:.1*v,pan:p})},
  splash:(t,v,p)=>{noise(t,.5,{type:'bandpass',f:1400,f2:400,q:.8,vol:.22*v,a:.01,pan:p});for(let i=0;i<4;i++)tone(1200+Math.random()*900,t+.05+i*.06,.05,{wave:'sine',vol:.04*v,pan:p})},
  pop:(t,v,p)=>{noise(t,.35,{type:'lowpass',f:1600,vol:.3*v,a:.005,pan:p});for(let i=0;i<5;i++)noise(t+.15+Math.random()*.4,.03,{f:4000,vol:.06*v,pan:p})},
  hoot:(t,v,p)=>{tone(330,t,.6,{wave:'sine',vol:.12*v,vib:5,vibD:20,pan:p,hold:.6});tone(311,t+.65,.8,{wave:'sine',vol:.1*v,vib:5,vibD:20,pan:p,hold:.6})},
  roar:(t,v)=>{tone(150,t,1.3,{wave:.125,vol:.2*v,slide:60,vib:18,vibD:30,hold:.4});noise(t,1.4,{type:'lowpass',f:700,vol:.32*v,a:.08});noise(t+.1,1,{type:'bandpass',f:1800,q:.7,vol:.12*v,a:.1})},
  thunder:(t,v)=>{noise(t,.15,{f:1500,vol:.2*v});noise(t+.05,2.2,{type:'lowpass',f:260,vol:.42*v,a:.12})},
  chirp:(t,v)=>{tone(3000,t,.05,{wave:'sine',vol:.05*v,slide:4200});tone(3200,t+.09,.05,{wave:'sine',vol:.05*v,slide:4400})},
};
function sfx(name,vol=1,pan=0){if(!SND.on||!SND.ctx||vol<=.02)return;const f=SFX[name];if(!f)return;const now=SND.ctx.currentTime,k=name+(pan>0?'r':'l');
  if(SND.last[k]&&now-SND.last[k]<.06)return;SND.last[k]=now;f(now+.01,Math.min(1,vol),pan)}
// how loud a sound at a point in the current scene is: only when you've zoomed in enough, and louder near the middle of the view
function hearAt(x,y){const v=typeof active!=='undefined'?active:null;if(!SND.on||!v||!v.cam||typeof fitZoom!=='function')return [0,0];
  const zf=fitZoom(v),zr=v.cam.z/zf;if(zr<1.6)return [0,0];const s=toScreen(v,x,y),f=freeRect(),cx=f.x+f.w/2,cy=f.y+f.h/2;
  const d=Math.hypot(s.x-cx,s.y-cy)/(Math.min(f.w,f.h)*.62);if(d>1.05||s.x<-40||s.y<-40||s.x>TV.cw+40||s.y>TV.ch+40)return [0,0];
  return [clamp(1-d*.85)*clamp(.35+(zr-1.6)*.45),clamp((s.x-cx)/(f.w/2),-1,1)*.7]}
function sfx3(v,x,y,name,k=1){if(!SND.on||v!==active)return;const [vol,pan]=hearAt(x,y);if(vol>0)sfx(name,vol*k,pan)}
// ---- ambience: rain and wind/sea beds
function ambBed(type,f){const c=SND.ctx,s=c.createBufferSource();s.buffer=SND.nbuf;s.loop=true;const fl=c.createBiquadFilter();fl.type=type;fl.frequency.value=f;const g=c.createGain();g.gain.value=0;s.connect(fl);fl.connect(g);g.connect(SND.amb.bus);s.start();return {g,fl}}
function sndAmbient(){if(!SND.on||!SND.ctx)return;const c=SND.ctx,now=c.currentTime,k=wxKind(),indoor=active===COURT||(active&&active.th&&active.th.indoor);
  const rain=k==='storm'?.34:k==='rain'?.24:k==='drizzle'?.1:0,wind=k==='fog'||k==='snow'?.08:k==='storm'?.12:.03,sea=!active?.05:active&&active.water?.07:0;
  SND.amb.rain.g.gain.setTargetAtTime(rain*(indoor?.35:1),now,.6);SND.amb.rain.fl.frequency.setTargetAtTime(indoor?900:5000,now,.5);
  SND.amb.wind.g.gain.setTargetAtTime((wind+sea)*(indoor?.3:1),now,.8)}
// ---- turning it on and off
function sndInit(){if(SND.ctx)return;const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;const c=SND.ctx=new AC();
  SND.master=c.createGain();SND.master.gain.value=.7;SND.master.connect(c.destination);
  SND.musicVol=.42;SND.music=c.createGain();SND.music.gain.value=SND.musicVol;SND.music.connect(SND.master);
  SND.sfx=c.createGain();SND.sfx.gain.value=.9;SND.sfx.connect(SND.master);
  SND.amb.bus=c.createGain();SND.amb.bus.gain.value=1;SND.amb.bus.connect(SND.master);
  const b=c.createBuffer(1,c.sampleRate,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;SND.nbuf=b;
  SND.amb.rain=ambBed('highpass',5000);SND.amb.wind=ambBed('lowpass',420);
  SND.timer=setInterval(()=>{sched();sndAmbient()},60)}
function setSound(on){SND.on=on;try{localStorage.setItem('pl-sound',on?'1':'0')}catch(e){}
  if(on){sndInit();if(!SND.ctx){SND.on=false;return}SND.ctx.resume();SND.next=SND.ctx.currentTime+.1;SND.step=0;if(!SND.track)SND.track=TRACKS[SND.scene]||TRACKS.world;SND.music.gain.value=SND.musicVol;sfx('ok')}
  else if(SND.ctx){SND.ctx.suspend()}
  document.querySelectorAll('.sndBtn').forEach(b=>{b.setAttribute('aria-pressed',String(on));const l=b.querySelector('.lbl');if(l)l.textContent=on?' SOUND ON':' SOUND OFF'})}
try{SND.want=localStorage.getItem('pl-sound')!=='0'}catch(e){SND.want=true}
// browsers only allow audio after a tap: if sound was left on last time, it starts at the first touch
addEventListener('pointerdown',e=>{if(e.target&&e.target.closest&&e.target.closest('.sndBtn')){SND.want=false;return}if(SND.want&&!SND.on){SND.want=false;setSound(true)}},{capture:true});

// ===================== places: one theme per product =====================
const THEMES={
  capital:{label:'Capital City',mat:'capital',road:'brick',ground:'grass',border:'wall',feature:'fountain',icon:'city'},
  crown:  {label:'Royal Castle',mat:'capital',road:'brick',ground:'grass',border:'wall',feature:'fountain',icon:'royal',indoor:1},
  port:   {label:'Harbour Town',mat:'port',road:'plank',ground:'grass',border:'trees',feature:'harbour',icon:'port'},
  village:{label:'Meadow Village',mat:'village',road:'dirt',ground:'grass',border:'trees',feature:'windmill',icon:'village'},
  river:  {label:'Riverside Hamlet',mat:'river',road:'dirt',ground:'grass',border:'trees',feature:'river',icon:'hamlet'},
  arcane: {label:'Arcane Glade',mat:'arcane',road:'flag',ground:'moss',border:'pines',feature:'crystal',icon:'tower'},
  cave:   {label:"Hermit's Cave",mat:'cave',road:'cave',ground:'cave',border:'rock',feature:'hoard',icon:'cave',indoor:1},
};
// names and themes come from what each project reports: see realm.js
// a town's decorations: the free kit for everyone, the themed sets and packs with a Royal Charter
function dressFor(k,full){const D=DRESS[k]||DRESS.village;if(full||premium())return D;const f=a=>(a||[]).filter(p=>BASE_PROPS.has(p));return {back:f(D.back),meadow:f(D.meadow),out:f(D.out)}}

// ---- ground + road tiles per theme ----
function groundRamp(th){return th.ground==='cave'?RAMP.cave:th.ground==='moss'?RAMP.moss:RAMP.grass}
function groundTile(c,x,y,h,th){
  if(th.ground==='cave'){const R=RAMP.cave;px(c,x,y,16,16,R[2]);for(let k=0;k<3;k++){const hh=hash(h+'cv'+k);px(c,x+hh%13,y+(hh>>>5)%13,3,2,R[1]);px(c,x+hh%13,y+(hh>>>5)%13,2,1,R[3])}return}
  grassTile(c,x,y,h,groundRamp(th));
}
function roadTile(c,x,y,h,e,th){
  const k=th.road;
  if(k==='brick')cobbleTile(c,x,y,h,RAMP.cobble);
  else if(k==='plank')plankTile(c,x,y,h);
  else if(k==='flag')flagTile(c,x,y,h,RAMP.stone);
  else if(k==='cave')dirtTile(c,x,y,h,RAMP.cave);
  else dirtTile(c,x,y,h);
  if(k!=='plank')pathEdges(c,x,y,h,e,groundRamp(th));
}
const DRESS={
  capital:{back:['barrel','crate','pot','barrel','sack'],meadow:['pot','pot','bench','flowers','bush']},
  port:{back:['crate','barrel','sack','crate','barrel'],meadow:['crate','barrel','sack','logs']},
  village:{back:['hay','logs','stump','woodpile','flowers'],meadow:['hay','cart','flowers','stump']},
  river:{back:['logs','woodpile','stump','sack','barrel'],meadow:['logs','stump','rocks','flowers']},
  arcane:{back:['glowshroom','rock','mushroom','pot','glowshroom'],meadow:['glowshroom','rock','glowshroom','rocks']},
  cave:{back:['rocks','crate','sack','minecart','torch'],meadow:['minecart','crate','sack','rocks']},
};
function dressTown(c,v,th){
  const D=dressFor(v.thKey,v.full);
  v.lanes.forEach((L,i)=>{const g=lotGeo(v,i),T=L.T,top=g.B-T.H;const hh=hash(v.seed+'dr'+i);
    const left=D.back[hh%D.back.length],right=D.back[(hh>>>4)%D.back.length];
    if(g.bx-g.ox>=16)drawProp(c,left,g.ox+9,g.B-4);
    if(g.ox+96-(g.bx+T.W)>=18&&!T.anvil&&!T.crates&&!T.field)drawProp(c,right,g.ox+88,g.B-6);
    if(top>g.oy+20&&v.thKey!=='cave'){(hh%3?drawBush:(c,x,y,k)=>drawProp(c,'rocks',x+10,y+12))(c,g.ox+(hh%2?4:70),g.oy+4,hh%2)}
  });
  const sy=v.sy;
  D.meadow.forEach((p,k)=>{const hh=hash(v.seed+'md'+k);const x=v.tavR+14+(hh%Math.max(20,v.W-v.tavR-40)),y=sy+24+((hh>>>7)%(v.water?70:84));
    if(Math.hypot(x-v.featX,(y-sy-60)*1.4)<(v.fount?72:46))return;if(x<v.W-22)drawProp(c,p,x,y)});
  if(th.feature==='hoard'){drawProp(c,'rail',v.hoard.x-44,v.hoard.y+2);drawProp(c,'rail',v.hoard.x-28,v.hoard.y+2);drawProp(c,'minecart',v.hoard.x-36,v.hoard.y);drawProp(c,'sack',v.hoard.x+52,v.hoard.y+2);drawProp(c,'crate',v.hoard.x+64,v.hoard.y-2)}
}
function rockWall(c,x,y,w,h,seed){px(c,x,y,w,h,'#3a322a');for(let k=0;k<w*h/40;k++){const hh=hash(seed+'rw'+k);const rx=x+hh%w,ry=y+(hh>>>8)%h;px(c,rx,ry,5,3,'#4e443a');px(c,rx,ry,5,1,'#665a4e')}}
function cityWall(c,x,y,w,h,face){
  px(c,x,y,w,h,'#9a948a');
  for(let yy=y;yy<y+h;yy+=5){px(c,x,yy,w,1,'#6e6a62');for(let xx=x+((yy/5)%2?4:0);xx<x+w;xx+=9)px(c,xx,yy,1,5,'#6e6a62')}
  px(c,x,y,w,2,'#c4beb2');
  if(face){for(let xx=x;xx<x+w;xx+=10){px(c,xx,y-6,6,6,'#a8a298');px(c,xx,y-6,6,1,'#cac4b8');px(c,xx+5,y-6,1,6,'#6e6a62')}px(c,x,y+h-2,w,2,'#5a564e')}
}

// ===================== town scene =====================
const LOTW=6,LOTH=6,VX=24;
function lotGeo(v,i){const r=Math.floor(i/v.lpr),cc=i%v.lpr,ox=(2+cc*LOTW)*TS,oy=(1+r*LOTH)*TS;return {r,cc,ox,oy,B:oy+4*TS,pathY:oy+5*TS+12}}
function pathYRow(r){return (1+r*LOTH)*TS+5*TS+12}
function gateRow(v){return 1+(v.nRows-1)*LOTH+5}
// where a courier leaves town: out through the gate that matches the town's door on the world map
function gateOut(v){const ox=v.OX||0,oy=v.OY||0;if(v.gate==='W'){const y=pathYRow(v.nRows-1);return [{x:VX,y},{x:-ox-10,y}]}return [{x:VX,y:v.gate==='S'?v.H+oy+10:-oy-10}]}
function rowOf(v,y){return clamp(Math.floor((y-TS)/(LOTH*TS)),0,v.nRows-1)}
const STRIP=8;
function layoutTown(v){
  const n=Math.max(1,v.lanes.length),lpr=n<=6?3:4,nRows=Math.ceil(n/lpr),wet=v.th.feature==='harbour'||v.th.feature==='river';
  const mg=townMargin(v,lpr,nRows,wet);
  // the gate faces the same way as this town's door on the world map, so the road you see leaving it is the road on the map
  const wt=world.towns&&world.towns.find(t=>t.name===v.name),south=!!(wt&&wt.door&&wt.door.south),gate=south?(wet?'W':'S'):'N',gateS=gate==='S';
  if(v.lpr===lpr&&v.nRows===nRows&&v.bg&&v.bgSig===v.sig&&v.gate===gate&&v.OX>=mg[0]&&v.OY>=mg[1])return;
  v.gate=gate;v.gateS=gateS;
  v.lpr=lpr;v.nRows=nRows;v.cols=3+lpr*LOTW;v.rows=1+nRows*LOTH+STRIP+(wet?2:1);v.W=v.cols*TS;v.H=v.rows*TS;v.bgSig=v.sig;
  v.OX=mg[0];v.OY=mg[1];v.FW=v.W+2*v.OX;v.FH=v.H+2*v.OY;
  v.cv.width=v.FW;v.cv.height=v.FH;v.ctx.imageSmoothingEnabled=false;
  v.lanes.forEach((L,i)=>{
    const g=lotGeo(v,i);L.info=roleInfo(L.role,L.id,v.full);L.T=TYPES[L.info.type];
    g.bx=L.info.type==='farm'?g.ox+2:g.ox+Math.floor((LOTW*TS-L.T.W)/2);
    g.doorX=g.bx+L.T.W/2;g.homeX=g.doorX;g.homeY=g.B+12;L.g=g;L.i=i;
    v.people[L.id]={x:g.homeX,y:g.homeY,dir:'down',route:[],frame:0,timer:rnd(0,3),trip:0,pause:0};
    if(L.info.kind==='paint'&&!v.dabs[L.id])v.dabs[L.id]=[];
  });
  const sy=(1+nRows*LOTH)*TS;
  v.sy=sy;v.rowY=pathYRow(nRows-1);
  v.tav=v.th.feature==='hoard'?null:tavernGeo(sy,v.lanes.length);v.tavR=v.tav?v.tav.X+v.tav.w:120;
  v.camp={x:72,y:sy+48};v.featX=clamp(Math.round((v.tavR+v.W)/2),v.tavR+40,v.W-50);
  v.helpers={};v.bugs=[];v.parts=[];v.sheep=[];v.barmaid=null;
  if(v.th.feature==='windmill')for(let k=0;k<3;k++)v.sheep.push({x:v.tavR+24+k*22,y:sy+96+k*5,dir:1,t:rnd(0,3)});
  v.trees=[];const core=townBG(v),[full,fc]=mk(v.FW,v.FH);outskirts(fc,v);fc.drawImage(core,v.OX,v.OY);v.bg=full;v.trees.sort((a,b)=>a.y-b.y);
}
// the tavern is drawn open, with its front wall and roof cut away so you can see who is inside
// the tavern grows a table for every three lanes beyond the bar stools, so everyone has a seat when the whole town is idle
function tavernGeo(sy,n){const X=40,Y=sy+8,h=104,tc=Math.max(2,Math.ceil((Math.max(1,n)-3)/3)),w=86+(tc-1)*46+36;
  const S=(x,y,dir,via)=>({x:X+x,y:Y+y,dir,via:Y+via,sit:1,tav:1}),tables=[],seats=[];
  for(let i=0;i<tc;i++){const tx=86+i*46,ty=i%2?84:66;tables.push({x:X+tx,y:Y+ty});seats.push(S(tx-14,ty+2,'right',42),S(tx+14,ty+2,'left',42),S(tx,ty-10,'down',42))}
  seats.push(S(16,70,'up',78),S(32,70,'up',78),S(48,70,'up',78));
  return {X,Y,w,h,hx:X+w-36,doorX:X+112,floorY:Y+34,tables,seats,bar:{x0:X+14,x1:X+52,y:Y+44}}}
function tavernBG(c,v){
  const t=v.tav,{X,Y,w,h,hx}=t,R={capital:RAMP.tile,port:RAMP.tile,village:RAMP.thatch,river:RAMP.wood,arcane:RAMP.slate}[v.thKey]||RAMP.tile,W=RAMP.wood,P=RAMP.plaster;
  px(c,t.doorX-7,v.rowY,14,Y-v.rowY+6,RAMP.dirt[2]);px(c,t.doorX-7,v.rowY,1,Y-v.rowY+6,RAMP.dirt[1]);px(c,t.doorX+6,v.rowY,1,Y-v.rowY+6,RAMP.dirt[1]);
  ellipseShadow(c,X+w/2,Y+h-1,w/2+4,5,.28);
  for(let y=Y+34;y<Y+h-6;y+=4){px(c,X+4,y,w-8,4,(y/4)%2?W[3]:W[2]);px(c,X+4,y+3,w-8,1,W[1]);for(let x=X+4+((y/4)%3)*11;x<X+w-4;x+=33)px(c,x,y,1,3,W[1])}
  for(let j=-8;j<=8;j++){const hw=Math.round(26*Math.sqrt(1-j*j/64));px(c,X+86-hw,Y+68+j,hw*2,1,Math.abs(j)>6||hw>23?'#e0b04a':'#a83a3a')}
  for(let j=-5;j<=5;j++){const hw=Math.round(16*Math.sqrt(1-j*j/25));px(c,X+86-hw,Y+68+j,1,1,'#e0b04a');px(c,X+86+hw-1,Y+68+j,1,1,'#e0b04a')}
  px(c,X,Y,w,6,R[2]);px(c,X,Y,w,1,R[4]);for(let x=X;x<X+w;x+=5)px(c,x,Y+2,3,1,R[1]);px(c,X,Y+5,w,1,R[0]);
  px(c,X+4,Y+6,w-8,28,P[2]);px(c,X+4,Y+6,w-8,2,W[1]);px(c,X+4,Y+31,w-8,3,W[1]);px(c,X+4,Y+30,w-8,1,W[3]);
  for(const bx of [X+4,X+62,X+124,X+w-8])px(c,bx,Y+6,4,26,W[1]);
  for(const sy2 of [Y+15,Y+25]){px(c,X+10,sy2,48,2,W[3]);px(c,X+10,sy2+2,48,1,W[0]);for(let k=0;k<8;k++){const hh=hash(v.seed+'bt'+sy2+k),col=['#3a8a5a','#8a3a3a','#c8a04a','#5a6aa8','#e8e0d0'][hh%5];px(c,X+12+k*6,sy2-5,3,5,col);px(c,X+13+k*6,sy2-7,1,2,col);px(c,X+12+k*6,sy2-5,1,4,shade(col,.4))}}
  px(c,X+70,Y+10,20,16,W[1]);px(c,X+72,Y+12,16,12,'#5a8ad0');px(c,X+72,Y+12,16,3,'#8ab8f0');px(c,X+79,Y+12,2,12,W[1]);px(c,X+72,Y+17,16,1,W[1]);
  for(let wx=X+128;wx+20<hx-6;wx+=46){px(c,wx,Y+10,20,16,W[1]);px(c,wx+2,Y+12,16,12,'#5a8ad0');px(c,wx+2,Y+12,16,3,'#8ab8f0');px(c,wx+9,Y+12,2,12,W[1]);px(c,wx+2,Y+17,16,1,W[1])}
  px(c,X+69,Y+9,4,18,'#a83a3a');px(c,X+87,Y+9,4,18,'#a83a3a');px(c,X+69,Y+9,22,2,W[2]);
  px(c,t.doorX-9,Y+6,18,28,W[0]);px(c,t.doorX-7,Y+9,14,25,RAMP.dirt[2]);px(c,t.doorX-7,Y+9,14,6,RAMP.grass[1]);px(c,t.doorX-7,Y+15,14,1,RAMP.dirt[1]);px(c,t.doorX-9,Y+6,18,3,W[2]);
  px(c,t.doorX-6,Y+1,12,7,W[3]);px(c,t.doorX-6,Y+7,12,1,W[0]);px(c,t.doorX-4,Y+2,3,4,'#f2c94c');px(c,t.doorX+1,Y+2,3,4,'#f2c94c');px(c,t.doorX-4,Y+2,3,1,'#fffaf0');px(c,t.doorX+1,Y+2,3,1,'#fffaf0');
  const S=RAMP.stone;px(c,hx,Y+4,30,30,S[2]);for(let yy=Y+4;yy<Y+34;yy+=4){px(c,hx,yy,30,1,S[1]);for(let xx=hx+((yy/4)%2?3:0);xx<hx+30;xx+=7)px(c,xx,yy,1,4,S[1])}
  px(c,hx,Y+4,30,1,S[3]);px(c,hx-3,Y+17,36,3,W[2]);px(c,hx-3,Y+17,36,1,W[4]);px(c,hx-3,Y+19,36,1,W[0]);
  px(c,hx+6,Y+22,18,12,'#1a1210');px(c,hx+7,Y+21,16,1,'#1a1210');px(c,hx+4,Y+33,22,2,S[3]);
  px(c,hx+2,Y+12,4,5,'#c9a03a');px(c,hx+24,Y+12,4,5,'#c9a03a');
  for(const sx of [X,X+w-4]){px(c,sx,Y+6,4,h-12,W[1]);px(c,sx,Y+6,4,1,W[3]);px(c,sx+1,Y+6,1,h-12,W[2])}
  const F=RAMP.stone;px(c,X,Y+h-6,w,6,F[2]);for(let xx=X;xx<X+w;xx+=8){px(c,xx,Y+h-6,1,6,F[1]);px(c,xx+4,Y+h-3,1,3,F[1])}px(c,X,Y+h-6,w,1,F[3]);px(c,X,Y+h-3,w,1,F[1]);px(c,X,Y+h-1,w,1,F[0]);
  for(const st of t.seats){if(st.dir==='up'){px(c,st.x-4,st.y-3,8,3,W[3]);px(c,st.x-4,st.y-3,8,1,W[4]);px(c,st.x-3,st.y,1,3,W[0]);px(c,st.x+2,st.y,1,3,W[0])}
    else{px(c,st.x-4,st.y-4,8,4,W[2]);px(c,st.x-4,st.y-4,8,1,W[3]);px(c,st.x-4,st.y,1,3,W[0]);px(c,st.x+3,st.y,1,3,W[0])}}
  drawProp(c,'barrel',X+w-16,Y+96);drawProp(c,'barrel',X+w-16,Y+84);drawProp(c,'barrel',X+16,Y+96);drawProp(c,'crate',X+30,Y+96);
}
function drawCounter(c,t){const {X,Y}=t,W=RAMP.wood;
  px(c,X+6,Y+39,58,7,W[3]);px(c,X+6,Y+39,58,1,W[4]);px(c,X+6,Y+45,58,1,W[1]);
  px(c,X+6,Y+46,58,11,W[2]);for(let x=X+10;x<X+64;x+=6)px(c,x,Y+46,1,11,W[1]);px(c,X+6,Y+56,58,1,W[0]);px(c,X+62,Y+39,2,18,W[1]);
  px(c,X+10,Y+31,10,9,W[2]);px(c,X+10,Y+31,10,1,W[4]);px(c,X+10,Y+33,10,1,'#8a8a96');px(c,X+10,Y+37,10,1,'#8a8a96');px(c,X+20,Y+35,3,2,'#c9a03a');
  for(const mx of [X+34,X+46,X+56]){px(c,mx,Y+35,4,5,'#c88a3c');px(c,mx,Y+35,4,1,'#fffaf0');px(c,mx+4,Y+36,1,3,'#c88a3c')}}
function drawTable(c,x,y,mugs){const W=RAMP.wood;ellipseShadow(c,x,y+8,10,2,.3);px(c,x-1,y+1,3,7,W[0]);
  for(let j=-5;j<=5;j++){const hw=Math.round(11*Math.sqrt(1-j*j/30));px(c,x-hw,y+j-2,hw*2,1,j<-3?W[4]:j>3?W[1]:W[3])}
  for(let k=0;k<mugs;k++){const mx=x-6+k*5,my=y-4+(k%2)*2;px(c,mx,my,3,4,'#c88a3c');px(c,mx,my,3,1,'#fffaf0')}}
function townBG(v){
  const th=v.th,[cv,c]=mk(v.W,v.H),C=v.cols,R=v.rows,sy=v.sy;
  const path=[...Array(R)].map(()=>Array(C).fill(0));
  for(let y=0;y<R;y++)path[y][1]=1;
  for(let r=0;r<v.nRows;r++){const y0=1+r*LOTH+5;for(let x=1;x<C-1;x++)path[y0][x]=1}
  if(v.gate==='W')path[gateRow(v)][0]=1;
  for(let y=0;y<R;y++)for(let x=0;x<C;x++){const X=x*TS,Y=y*TS,h=hash(v.seed+':'+x+','+y);
    if(path[y][x])roadTile(c,X,Y,h,{t:!path[y-1]?.[x],b:!path[y+1]?.[x],l:x>0&&!path[y][x-1],r:x<C-1&&!path[y][x+1]},th);else groundTile(c,X,Y,h,th)}
  if(th.ground!=='cave')groundPatches(c,v.W,v.H,v.seed,groundRamp(th),(xx,yy)=>path[Math.floor(yy/TS)]?.[Math.floor(xx/TS)]);
  // empty lots
  for(let i=v.lanes.length;i<v.nRows*v.lpr;i++){const g=lotGeo(v,i);
    if(th.ground==='cave'){rockWall(c,g.ox+8,g.oy+8,80,48,v.seed+i);for(let k=0;k<5;k++)px(c,g.ox+20+k*12,g.oy+56,6,4,'#5e544a')}
    else{for(let ty=0;ty<4;ty++)for(let tx=0;tx<LOTW;tx++){if((tx*3+ty)%4&&th.ground!=='moss')tallGrassTile(c,g.ox+tx*TS,g.oy+ty*TS)}v.trees=v.trees||[];v.trees.push(th.border==='pines'?{p:1,x:g.ox+34,y:g.oy+12,k:1}:{p:0,x:g.ox+32,y:g.oy+10,k:1})}}
  // yard fences
  if(th.ground!=='cave')for(let i=0;i<v.lanes.length;i++){const g=lotGeo(v,i),fc=th.border==='wall'?'#c8c2b4':'#f6f0e2',fd=th.border==='wall'?'#8e887e':'#dcd4c2';
    for(const fx of [g.ox+1,g.ox+LOTW*TS-9]){px(c,fx,g.B+2,8,2,fc);px(c,fx,g.B+8,8,2,fc);px(c,fx,g.B,2,13,fd);px(c,fx+6,g.B,2,13,fd);px(c,fx,g.B+12,8,1,'rgba(30,20,50,.25)')}}
  // feature strip
  feature(c,v,th,sy);
  dressTown(c,v,th);
  if(v.tav)tavernBG(c,v);
  // borders
  border(c,v,th);
  v.flowers=[];
  if(th.ground==='grass'){for(let i=0;i<10;i++){const hh=hash(v.seed+'f'+i);v.flowers.push({x:v.tavR+10+hh%Math.max(20,v.W-v.tavR-30),y:sy+6+(hh>>>9)%10,c:['#f05a5a','#fff6e4','#f2c94c','#e88ad8'][hh%4]})}
    for(let i=0;i<v.lanes.length;i++){const g=lotGeo(v,i),hh=hash(v.seed+'yf'+i);v.flowers.push({x:g.ox+14+hh%8,y:g.B+12,c:['#f05a5a','#f2c94c','#e88ad8'][hh%3]})}}
  return cv;
}
function feature(c,v,th,sy){
  const W=v.W;
  if(th.feature==='fountain'){const fx=v.featX,fy=sy+58;v.fount={x:fx,y:fy};
    for(let yy=-16;yy<=16;yy++){const hw=Math.round(30*Math.sqrt(1-(yy*yy)/256));px(c,fx-hw,fy+yy,hw*2,1,'#a8a298')}
    for(let yy=-12;yy<=12;yy++){const hw=Math.round(25*Math.sqrt(1-(yy*yy)/144));px(c,fx-hw,fy+yy,hw*2,1,yy<-8?PAL.waterD:PAL.water)}
    px(c,fx-4,fy-14,8,16,'#c4beb2');px(c,fx-4,fy-14,2,16,'#ddd8cc');px(c,fx-7,fy-16,14,3,'#a8a298');
    for(let k=0;k<6;k++){const a=k/6*Math.PI*2;px(c,fx+Math.cos(a)*34-3,fy+Math.sin(a)*20-2,6,4,'#5aa83e');px(c,fx+Math.cos(a)*34-1,fy+Math.sin(a)*20-3,2,2,['#f05a5a','#f2c94c','#e88ad8'][k%3])}}
  if(th.feature==='windmill'){const mx=v.featX,my=sy+76;v.mill={x:mx,y:my};
    for(let yy=0;yy<44;yy++){const w=Math.round(14+yy*.25);px(c,mx-w/2,my-yy,w,1,yy%5===0?'#c8b08a':'#e6d6b4')}
    px(c,mx-4,my-12,8,12,'#6a4228');px(c,mx-2,my-30,4,5,'#3e5e98');
    for(let yy=0;yy<12;yy++){const w=Math.round(10+yy*1.4);px(c,mx-w/2,my-56+yy,w,1,yy%3?'#a8402e':'#7a2a20')}
    const fx0=v.tavR+14,fx1=W-24;for(let x2=fx0;x2<fx1;x2+=6){px(c,x2,sy+116,2,10,PAL.woodD);}px(c,fx0,sy+118,fx1-fx0,2,PAL.woodL);px(c,fx0,sy+123,fx1-fx0,2,PAL.woodL)}
  if(th.feature==='crystal'){const cx=v.featX,cy=sy+66;v.crys={x:cx,y:cy};
    for(let yy=-10;yy<=10;yy++){const hw=Math.round(34*Math.sqrt(1-(yy*yy)/100));px(c,cx-hw,cy+yy,hw*2,1,'#6a6a88')}
    for(let k=0;k<8;k++){const a=k/8*Math.PI*2;px(c,cx+Math.cos(a)*26-1,cy+Math.sin(a)*7-1,3,2,'#b0a0ff')}
    px(c,cx-5,cy-30,10,30,'#7a5ae0');px(c,cx-3,cy-36,6,6,'#9a7af0');px(c,cx-1,cy-39,2,3,'#c0a8ff');px(c,cx-3,cy-28,2,26,'#c0a8ff');px(c,cx+3,cy-28,2,28,'#5a3ab0')}
  if(th.feature==='harbour'||th.feature==='river'){
    const wy=sy+118, H=v.H;v.water={y:wy};
    for(let yy=wy;yy<H;yy++)px(c,0,yy,W,1,yy<wy+3?PAL.sandD:yy<wy+5?PAL.foam:(yy-wy)%7===0?PAL.waterD:PAL.water);
    if(th.feature==='harbour'){const px0=Math.min(W-70,v.tavR+40);px(c,px0,wy-4,16,H-wy+4,'#ad7c4c');for(let yy=wy-4;yy<H;yy+=4)px(c,px0,yy,16,1,'#6e4a2a');for(const xx of [px0,px0+14])for(let yy=wy+4;yy<H;yy+=10)px(c,xx,yy,2,6,'#5a3a20');v.boat={x:px0+40,y:wy+18};v.water.skip=[px0-2,px0+18]}
    else{for(let k=0;k<10;k++){const hh=hash(v.seed+'rd'+k);px(c,40+hh%(W-80),wy-2,1,5,'#3f8a3a');px(c,41+hh%(W-80),wy-4,1,3,'#6a5a3a')}
      px(c,14,wy-2,22,H-wy+2,'#ad7c4c');for(let yy=wy;yy<H;yy+=4)px(c,14,yy,22,1,'#6e4a2a');px(c,12,wy-2,2,H-wy+2,'#6e4a2a');px(c,36,wy-2,2,H-wy+2,'#6e4a2a');v.wheel={x:Math.min(W-40,v.tavR+50),y:wy-2};v.water.skip=[10,40]}
  }
  if(th.feature==='hoard'){const gx=Math.min(W-70,190),gy=sy+64;v.hoard={x:gx,y:gy};
    for(let yy=0;yy<16;yy++){const w=Math.round(44-yy*2.4);px(c,gx-w/2,gy-yy,w,1,yy%3?'#e8b83a':'#c8901a')}for(let k=0;k<14;k++){const hh=hash('gd'+k);px(c,gx-18+hh%36,gy-12+(hh>>>6)%12,2,2,'#fff09a')}
    px(c,gx+26,gy-12,16,12,'#7a4a24');px(c,gx+26,gy-12,16,4,'#9a6a34');px(c,gx+26,gy-8,16,1,'#c9a03a');px(c,gx+32,gy-9,4,3,'#c9a03a');
    px(c,v.camp.x-14,v.camp.y+6,28,4,'#5a4030');
    // three-legged stools round the fire, one under each place the hermits sit
    for(let k=0;k<5;k++){const sp=idleSpot(v,k),x=sp.x,y=sp.y;ellipseShadow(c,x,y+1,6,2,.3);
      px(c,x-4,y-2,1,3,'#3a2414');px(c,x+3,y-2,1,3,'#3a2414');px(c,x,y-2,1,2,'#4a2e1a');
      px(c,x-5,y-5,11,3,'#7a4a28');px(c,x-5,y-5,11,1,'#a8743e');px(c,x-5,y-3,11,1,'#4a2e1a')}}
}
function border(c,v,th){
  const W=v.W,H=v.H;
  if(th.border==='wall'){
    cityWall(c,0,0,W,14,false);px(c,0,10,W,6,'#5a564e');
    for(let xx=0;xx<W;xx+=10){px(c,xx,0,6,4,'#cac4b8')}
    if(!v.gateS){px(c,VX-12,0,24,16,'#1a1410');px(c,VX-12,0,24,2,'#6e6a62');for(let xx=VX-10;xx<VX+12;xx+=4)px(c,xx,2,1,10,'#5a564e')}
    cityWall(c,0,0,14,H,false);cityWall(c,W-14,0,14,H,false);
    if(v.gate==='W'){const gy=gateRow(v)*TS;roadTile(c,0,gy,hash(v.seed+'gw'),{t:1,b:1,l:0,r:0},th);for(const yy of [gy-6,gy+TS+2]){px(c,0,yy,16,4,'#a8a298');px(c,0,yy,16,1,'#cac4b8')}}
    if(!v.water){cityWall(c,0,H-22,W,22,true);if(v.gateS){for(let y=H-22;y<H;y+=TS)roadTile(c,VX-8,y,hash(v.seed+'gs'+y),{t:0,b:0,l:1,r:1},th);for(const gx of [VX-14,VX+10]){px(c,gx,H-30,4,30,'#a8a298');px(c,gx,H-30,4,2,'#cac4b8');px(c,gx+3,H-30,1,30,'#6e6a62')}}}
    for(const [tx,ty] of [[-4,-4],[W-22,-4],[-4,H-34],[W-22,H-34]]){px(c,tx,ty,26,30,'#a8a298');px(c,tx,ty,26,3,'#cac4b8');px(c,tx+20,ty,6,30,'#6e6a62');for(let k=0;k<3;k++)px(c,tx+3+k*8,ty-4,5,5,'#b4aea2')}
    return;
  }
  if(th.border==='rock'){rockWall(c,0,0,W,18,v.seed);rockWall(c,0,0,14,H,v.seed+1);rockWall(c,W-14,0,14,H,v.seed+2);rockWall(c,0,H-18,W,18,v.seed+3);
    if(v.gate==='W')px(c,0,gateRow(v)*TS,14,TS,'#1a1410');else if(v.gateS)px(c,VX-10,H-18,20,18,'#1a1410');else px(c,VX-10,0,20,18,'#1a1410');for(let k=0;k<W/12;k++){const hh=hash(v.seed+'st'+k);px(c,(hh%W),18,3,4+(hh>>>5)%6,'#3a322a')}
    v.torches=[];for(let y=TS*3;y<H-30;y+=TS*5){v.torches.push([10,y]);v.torches.push([W-12,y])}return}
  v.trees=v.trees||[];const tree=th.border==='pines'?(x,y,k)=>v.trees.push({p:1,x,y,k}):(x,y,k)=>v.trees.push({p:0,x,y,k:(hash(v.seed+'tv'+x+','+y)%5===0)?2+k:k});
  const bottomOpen=!!v.water;
  const gwy=v.gate==='W'?gateRow(v)*TS:-999;for(let y=-6;y<(bottomOpen?v.water.y-20:H);y+=22){if(Math.abs(y+30-gwy)>26)tree(-16,y,y%2);tree(W-16,y,(y+1)%2)}
  for(let x=10;x<W-10;x+=26){const atGate=Math.abs(x+16-VX)<26;if(!(atGate&&v.gate==='N'))tree(x,-22,x%2);if(!bottomOpen&&!(atGate&&v.gateS))tree(x,H-26,(x+1)%2)}
}
function spawn(v,x,y,n,cols,g=90){for(let i=0;i<n;i++)v.parts.push({x,y,vx:rnd(-22,22),vy:rnd(-40,-10),life:rnd(.4,.9),c:cols[i%cols.length],g})}
function routePts(v,x,y,tx,ty){
  const r1=rowOf(v,y),r2=rowOf(v,ty),y1=pathYRow(r1),y2=pathYRow(r2);
  const pts=[{x,y:y1}];if(r1===r2)pts.push({x:tx,y:y1});else pts.push({x:VX,y:y1},{x:VX,y:y2},{x:tx,y:y2});
  pts.push({x:tx,y:ty});return pts;
}
function routeTo(v,p,tx,ty){p.route=routePts(v,p.x,p.y,tx,ty)}
function inTavern(v,p){const t=v.tav;return !!t&&p.y>t.Y+8&&p.x>t.X&&p.x<t.X+t.w}
function follow(p,dt,spd){
  if(!p.route.length)return true;
  const q=p.route[0],dx=q.x-p.x,dy=q.y-p.y,st=spd*dt;
  if(Math.abs(dx)>.5){p.x+=Math.sign(dx)*Math.min(st,Math.abs(dx));p.dir=dx>0?'right':'left'}
  else if(Math.abs(dy)>.5){p.x=q.x;p.y+=Math.sign(dy)*Math.min(st,Math.abs(dy));p.dir=dy>0?'down':'up'}
  else{p.x=q.x;p.y=q.y;p.route.shift()}
  p.walk=true;return !p.route.length;
}
function goTo(v,p,tx,ty,dt,spd=26,sp){
  const key=Math.round(tx)+','+Math.round(ty);
  if(Math.abs(p.x-tx)<.6&&Math.abs(p.y-ty)<.6){p.x=tx;p.y=ty;p.route=[];p.walk=false;p.dest=key;return true}
  if(p.dest!==key||!p.route.length){
    const t=v.tav,inside=inTavern(v,p),toTav=!!(sp&&sp.tav&&t);
    if(inside||toTav){const r=[];
      if(inside){const via=p.via||t.Y+42;r.push({x:p.x,y:via},{x:t.doorX,y:via});if(!toTav)r.push({x:t.doorX,y:v.rowY})}
      else r.push(...routePts(v,p.x,p.y,t.doorX,v.rowY));
      if(toTav){r.push({x:t.doorX,y:sp.via},{x:sp.x,y:sp.via},{x:sp.x,y:sp.y});p.via=sp.via}
      else r.push(...routePts(v,t.doorX,v.rowY,tx,ty));
      p.route=r;
    } else {
      const sameLot=rowOf(v,p.y)===rowOf(v,ty)&&Math.abs(p.y-ty)<30&&Math.abs(p.x-tx)<110&&p.y<pathYRow(rowOf(v,p.y))+2;
      if(sameLot)p.route=[{x:tx,y:p.y},{x:tx,y:ty}];else routeTo(v,p,tx,ty);
    }
    p.dest=key;
  }
  return follow(p,dt,spd);
}
function travelPhase(L,t){
  if(!L.talkingTo||L.talkingTo===L.product||!villages.has(L.talkingTo))return null;
  const s=effState(L);if(s!=='working'&&s!=='waiting')return null;
  // a slow round trip by horse and cart: two minutes from loading up to coming home again
  const c=(t+hash(L.id)%120)%120;
  if(c<36)return {k:'home'};if(c<72)return {k:'out',f:(c-36)/36};if(c<84)return {k:'there'};return {k:'back',f:(c-84)/36};
}
function idleSpot(v,k){
  if(!v.tav){const a=k/5*Math.PI*2+.6;return {x:Math.round(v.camp.x+Math.cos(a)*26),y:Math.round(v.camp.y+12+Math.sin(a)*10),dir:Math.cos(a)>0?'left':'right',sit:1}}
  const t=v.tav;if(k<t.seats.length)return t.seats[k];
  return {x:t.X+150-((k-t.seats.length)%6)*12,y:t.Y+54,dir:'left',via:t.Y+42,tav:1};
}
// a shipped lane celebrates for a short while (only if it shipped recently), then heads to the tavern until it picks up new work
function resting(o){const s=effState(o);return s==='idle'||(s==='done'&&!!o._rest)}
function stepTown(v,dt,t){
  for(const L of v.lanes){const p=v.people[L.id];if(!p)continue;
    if(effState(L)==='done'){if(p.doneT==null){const age=L.updated?(Date.now()-Date.parse(L.updated))/1000:1e9;p.doneT=age<300?t:t-999;if(age<300)sfx3(v,p.x,p.y-20,'cheer')}L._rest=t-p.doneT>18}else{p.doneT=null;L._rest=false}}
  for(const L of v.lanes){
    // a lane that arrived since the town was laid out has no plot yet: it joins on the next layout
    const p=v.people[L.id];if(!p||!L.g)continue;
    p.walk=false;p.hop=0;p.sleep=false;p.pose='idle';p.item=L.info.prop;p.bub=null;p.anvil=0;
    const s=effState(L),g=L.g,kind=L.info.kind;
    p.timer-=dt;
    if(s==='working'){
      if(kind==='mayor'){
        const blocked=v.lanes.find(o=>effState(o)==='blocked');
        if(blocked&&blocked.g){if(goTo(v,p,blocked.g.homeX+20,blocked.g.homeY,dt,30)){p.dir='left';p.bub='?';p.pose='hold'}}
        else{if(!p.target||(p.timer<=0&&p.atTarget)){const o=v.lanes[Math.floor(Math.random()*v.lanes.length)];p.target=o.g?{x:o.g.homeX+20,y:o.g.pathY}:{x:p.x,y:p.y};p.timer=rnd(3,5);p.atTarget=false}
          if(goTo(v,p,p.target.x,p.target.y,dt,26)){if(!p.atTarget){p.atTarget=true;p.timer=rnd(2.5,4)}p.dir='up';p.pose='talk'}}
      } else if(kind==='qa'){
        if(Math.random()<dt*.35&&v.bugs.filter(b=>b.lane===L.id).length<2)v.bugs.push({lane:L.id,x:g.ox+rnd(12,84),y:g.B+rnd(6,12),dir:Math.random()<.5?-1:1});
        const bug=v.bugs.find(b=>b.lane===L.id);
        if(bug){const tx=Math.round(bug.x+(p.x<bug.x?-10:10));if(goTo(v,p,tx,Math.round(bug.y+2),dt,32)){p.dir=p.x<bug.x?'right':'left';p.pose='swing';
          if(p.frame%4===2){spawn(v,bug.x,bug.y-2,7,['#7fd06a','#e5584b','#fffaf0']);sfx3(v,bug.x,bug.y,'zap');v.bugs.splice(v.bugs.indexOf(bug),1);p.bubT=1}}}
        else if(goTo(v,p,g.homeX+18,g.homeY,dt,18)){p.dir='down';p.pose='hold'}
        if(p.bubT>0){p.bubT-=dt;p.bub='♪'}
      } else if(kind==='jog'){
        const W=L.T.W,H=L.T.H,bx=g.bx,top=g.B-H,loop=[[bx+8,top+18],[bx+W-8,top+18],[bx+W-8,g.B-2],[bx+8,g.B-2]];
        p.lap=p.lap||0;const [tx,ty]=loop[p.lap%4];
        if(Math.abs(p.x-tx)<.6&&Math.abs(p.y-ty)<.6)p.lap++;else{p.route=[{x:tx,y:ty}];p.dest=null;follow(p,dt,40);p.hop=Math.floor(t*10)%2}
      } else if(kind==='gaze'){
        if(goTo(v,p,g.doorX+26,g.homeY,dt,22)){p.dir=['up','left','up','right'][Math.floor(t/2.2+L.i)%4];p.pose=Math.floor(t)%4===0?'swing':'hold';if(p.pose==='swing'&&Math.random()<dt*3)spawn(v,p.x+8,p.y-30,2,['#c0a8ff','#fff6c8'],-20)}
      } else if(kind==='paint'){
        if(goTo(v,p,g.ox+24,g.B+12,dt,22)){p.dir='left';p.pose='swing';
          if(p.frame%4===2&&!p.hit){p.hit=1;const pal=L.T.sign==='book'?['#2a2236','#3a3448']:['#f2b544','#e07b8a','#5fb3c9','#7fd06a','#b07ad6'];const pc=pal[Math.floor(Math.random()*pal.length)];p.paint=pc;sfx3(v,p.x,p.y-14,'brush');
            const ds=v.dabs[L.id];ds.push({x:Math.floor(rnd(1,9)),y:Math.floor(rnd(1,8)),c:pc});if(ds.length>30)ds.shift()}else if(p.frame%4!==2)p.hit=0}
      } else if(kind==='farm'){
        const fx=g.ox+56,fy=g.B-40;
        if(!p.spot||p.timer<=0){p.spot={x:fx+6+Math.floor(rnd(0,4))*7,y:fy+12+Math.floor(rnd(0,4))*9};p.timer=rnd(2,4)}
        if(goTo(v,p,p.spot.x,p.spot.y,dt,20)){p.dir='down';p.pose='swing';if(p.frame%4===2&&!p.hit){p.hit=1;spawn(v,p.x+6,p.y,3,['#946a3c','#7fd06a']);sfx3(v,p.x,p.y,'hoe')}else if(p.frame%4!==2)p.hit=0}
      } else if(kind==='count'){
        if(goTo(v,p,g.doorX+4,g.B+6,dt,18)){p.dir='up';p.pose=Math.floor(t*1.2)%3===0?'swing':'hold';p.item='ledger';if(Math.random()<dt*.8){spawn(v,g.doorX+10,g.B-6,1,['#f2c94c'],120);sfx3(v,g.doorX,g.B,'coin',.6)}}
      } else {
        const tx=kind==='dig'?g.doorX:g.ox+88,ty=g.B+12;
        if(goTo(v,p,tx,ty,dt,24)){p.dir=kind==='dig'?'up':'left';p.pose='swing';if(kind==='smith'&&p.item==='hammer')p.anvil=1;
          if(p.frame%4===2&&!p.hit){p.hit=1;
            if(kind==='smith'){if(p.anvil){spawn(v,p.x-15,p.y-10,6,['#ffd86b','#ff9a3c','#fff6c8']);sfx3(v,p.x,p.y,'anvil');p.anvHot=t}else{spawn(v,p.x-14,p.y-6,4,['#d39d62','#7e5230']);sfx3(v,p.x,p.y,'hammer')}}
            else{spawn(v,g.doorX,g.B-4,6,['#7e796f','#a6a196','#b98b56']);sfx3(v,p.x,p.y,'pick')}}
          else if(p.frame%4!==2)p.hit=0}
      }
    } else if(s==='blocked'){
      if(goTo(v,p,g.homeX-14,g.homeY,dt,26)){p.dir='down';p.bub='!'}
    } else if(s==='waiting'){
      const tgt=L.waitingOn&&v.lanes.find(o=>o!==L&&o.role.toLowerCase().includes(L.waitingOn.toLowerCase()));
      if(tgt&&tgt.g){p.item='none';p.pose='carry';const there=p.trip%2===0,dx=there?tgt.g.homeX+20:g.homeX,dy=there?tgt.g.homeY:g.homeY;
        if(p.pause>0){p.pause-=dt;p.bub='...';p.dir=there?'up':'down'}else if(goTo(v,p,dx,dy,dt,22)){p.pause=there?4:2.5;p.trip++;p.route=[];p.dest=null}}
      else if(goTo(v,p,g.homeX,g.homeY,dt,24)){p.dir='down';p.bub='...'}
    } else if(s==='idle'||(s==='done'&&L._rest)){
      const idle=v.lanes.filter(resting),k=idle.indexOf(L),sp=idleSpot(v,k);
      if(goTo(v,p,sp.x,sp.y,dt,24,sp)){p.dir=sp.dir||'down';p.item='mug';
        const ph=Math.floor(t/2.6+L.i*1.3)%4;p.bub=ph===0?'z':ph===2?'♪':null;p.sleep=ph===0;p.pose=sp.sit?'sit':ph===1?'swing':'idle';if(ph===3&&!sp.sit)p.pose='talk'}
    } else if(s==='done'){
      if(goTo(v,p,g.homeX,g.homeY,dt,26)){p.hop=Math.round(Math.abs(Math.sin(t*5+L.i))*4);p.dir=['down','down','left','down','right'][Math.floor(t*1.2+L.i)%5];p.pose='cheer';
        if(Math.random()<dt*.7)spawn(v,g.bx+L.T.W/2,g.B-L.T.H,10,['#f2b544','#e07b8a','#5fb3c9','#7fd06a','#fffaf0'])}
    }
    if(v.waveReq===L.id){v.wave={id:L.id,until:t+2.6};v.waveReq=null}
    if(v.wave&&v.wave.id===L.id&&t<v.wave.until&&!p.walk&&p.pose!=='sit'){p.pose='wave';p.dir='down';p.bub=null}
    p.frame=Math.floor(t*(p.walk?8:4)+L.i);
    stepHelpers(v,L,s,dt,t);
  }
  stepBarmaid(v,dt,t);townAudio(v,dt,t);
  for(const b of v.bugs){b.x+=b.dir*6*dt;if(Math.random()<dt)b.dir*=-1}
  for(const sh of v.sheep){sh.t-=dt;if(sh.t<0){sh.dir=Math.random()<.5?-1:1;sh.t=rnd(2,5)}sh.x=clamp(sh.x+sh.dir*4*dt,v.tavR+16,v.W-30)}
  v.parts=v.parts.filter(q=>(q.life-=dt)>0);for(const q of v.parts){q.x+=q.vx*dt;q.y+=q.vy*dt;q.vy+=q.g*dt}
}
// the barmaid works the bar, and carries drinks out to whoever is sitting at the tables
function stepBarmaid(v,dt,t){
  const tv=v.tav;if(!tv)return;
  const B=v.barmaid=v.barmaid||{x:tv.bar.x0+16,y:tv.bar.y,dir:'down',route:[],t:rnd(2,4),mode:'bar',spec:barmaidSpec(v.seed)};
  B.walk=false;B.pose='idle';B.item='mug';B.bub=null;
  const idle=v.lanes.filter(resting).length;
  if(B.mode==='bar'){B.t-=dt;
    if(B.goal!=null&&Math.abs(B.x-B.goal)>.6){B.route=[{x:B.goal,y:tv.bar.y}];follow(B,dt,18)}
    else if(B.t<=0){const tables=tv.tables.map((_,i)=>idle>i*3);const pick=tables.map((on,i)=>on?i:-1).filter(i=>i>=0);
      if(pick.length&&Math.random()<.55){const tb=tv.tables[pick[Math.floor(Math.random()*pick.length)]],fy=tb.y+14;B.mode='out';B.route=[{x:tv.X+68,y:tv.bar.y},{x:tv.X+68,y:fy},{x:tb.x,y:fy}];B.back=[{x:tv.X+68,y:fy},{x:tv.X+68,y:tv.bar.y},{x:tv.bar.x0+16,y:tv.bar.y}]}
      else{B.goal=Math.round(rnd(tv.bar.x0,tv.bar.x1));B.t=rnd(2.5,5)}}
    else{B.dir='down';B.pose=idle>5&&Math.floor(t/1.4)%3===0?'talk':Math.floor(t*2)%5===0?'swing':'idle';B.item=B.pose==='swing'?'none':'mug'}}
  else if(B.mode==='out'){if(follow(B,dt,22)){B.mode='serve';B.t=2.2;sfx3(v,B.x,B.y-14,'clink')}}
  else if(B.mode==='serve'){B.t-=dt;B.dir='up';B.pose='talk';B.item='none';if(B.t<=0){B.mode='home';B.route=B.back.map(q=>({...q}))}}
  else if(B.mode==='home'){if(follow(B,dt,22)){B.mode='bar';B.goal=null;B.t=rnd(3,6)}}
  B.frame=Math.floor(t*(B.walk?8:4));
}
// couriers carry a lane's letters between towns: out through the gate, and back to the lane's door
function townCouriers(v,t){
  const out=[];
  for(const L of v.lanes){const tp=travelPhase(L,t);if(!tp||!L.g)continue;const g=L.g,col=themeColour(v);
    const path=[{x:g.doorX,y:g.homeY},{x:g.doorX,y:g.pathY},{x:VX,y:g.pathY},...gateOut(v)];
    if(tp.k==='out'&&tp.f<.5){const pos=along(path,tp.f/.5);out.push({x:pos.x,y:pos.y,dir:pos.dir,walk:1,spec:courierSpec(col,L.id),L})}
    else if(tp.k==='back'&&tp.f>.5){const pos=along([...path].reverse(),(tp.f-.5)/.5);out.push({x:pos.x,y:pos.y,dir:pos.dir,walk:1,spec:courierSpec(col,L.id),L})}
    else if(tp.k==='home'){const c=(t+hash(L.id)%120)%120;if(c>30){out.push({x:g.doorX+12,y:g.homeY,dir:'left',walk:0,pose:'talk',spec:courierSpec(col,L.id),L,bub:'scroll'})}}}
  return out;
}
function stepHelpers(v,L,s,dt,t){
  const want=s==='working'?L.helpers.length:0,list=v.helpers[L.id]=v.helpers[L.id]||[];
  while(list.length<want){const k=list.length;list.push({x:L.g.ox+16+k*18,y:L.g.pathY,dir:'up',leg:k%2,frame:0,spec:apprenticeOf({col:L.info.col,cls:L.info.cls.cls,id:L.id},k),pause:rnd(0,1.5)})}
  if(list.length>want)list.length=want;
  if(L.info.type==='mine'&&L.g){mineHelpers(v,L,list,dt,t,mineSpots(L),{x:L.g.ox+80,y:L.g.B+12},L);return}
  if(v.thKey==='cave'&&v.hoard&&L.g){mineHelpers(v,L,list,dt,t,caveSpots(v),{x:v.hoard.x-30,y:v.hoard.y+10},v);return}
  list.forEach((h,k)=>{h.walk=false;h.pose='idle';h.item=null;
    const pick={x:L.g.ox+14+k*20,y:L.g.pathY+2},drop={x:L.g.bx+10+k*14,y:L.g.B+8},tgt=h.leg?drop:pick;
    if(h.pause>0){h.pause-=dt;h.dir=h.leg?'up':'down';if(h.leg&&h.pause<.2&&!h.dropped){h.dropped=1;spawn(v,tgt.x,tgt.y-8,3,['#d39d62','#fffaf0'],60)}}
    else{const dx=tgt.x-h.x,dy=tgt.y-h.y,st=28*dt;h.walk=true;
      if(Math.abs(dx)>.5){h.x+=Math.sign(dx)*Math.min(st,Math.abs(dx));h.dir=dx>0?'right':'left'}
      else if(Math.abs(dy)>.5){h.y+=Math.sign(dy)*Math.min(st,Math.abs(dy));h.dir=dy>0?'down':'up'}
      else{h.leg^=1;h.pause=rnd(.6,1.4);h.dropped=0}}
    h.carry=h.leg===1;h.frame=Math.floor(t*8+k)});
}
function heroOpts(spec,p,extra){return Object.assign({},spec,{dir:p.dir,walk:p.walk,frame:p.frame,pose:p.pose,item:p.item??spec.item,sleep:p.sleep,hop:p.hop,paint:p.paint,carry:p.carry,breath:Math.floor(p.frame/3)%2},extra||{})}
function drawTown(v,t,dt){
  let c=v.ctx;const th=v.th,L=lighting(th.indoor),lights=[];v.light=L;
  c.setTransform(1,0,0,1,0,0);c.drawImage(v.bg,0,0);c.setTransform(1,0,0,1,v.OX,v.OY);
  liveFeature(c,v,th,t,lights,L);
  if(v.thKey==='cave')drawCaveSeams(c,v,t,lights,L);
  for(const f of v.flowers)flower(c,f.x,f.y,f.c,t);
  for(const tr of v.trees){const s=windAt(t,(tr.x*.13+tr.y*.07));tr.p?drawPine(c,tr.x,tr.y,tr.k,s):drawTree(c,tr.x,tr.y,tr.k,s)}
  if(th.ground!=='cave')for(let r=0;r<v.nRows;r++)for(let cc=0;cc<=v.lpr;cc++){const x=(2+cc*LOTW)*TS-3,y=(1+r*LOTH)*TS+5*TS-1;lamp(c,x,y,L.night);if(L.night)lights.push([x+1,y-16,20])}
  if(v.torches)for(const [x,y] of v.torches){px(c,x-1,y,3,8,PAL.woodD);const fl=Math.floor(t*8+x)%3;px(c,x-2,y-5-fl,5,5,'#ff9a3c');px(c,x-1,y-6-fl,3,3,'#ffd86b');lights.push([x,y-4,30])}
  // tavern / campfire
  const idleN=v.lanes.filter(resting).length;
  if(!v.tav){const cx=v.camp.x,cy=v.camp.y;px(c,cx-10,cy+6,20,3,PAL.woodD);px(c,cx-8,cy+3,16,3,PAL.wood);const fl=Math.floor(t*10)%3;
    px(c,cx-6,cy-4-fl,12,8+fl,'#ff7a2a');px(c,cx-4,cy-8-fl,8,8,'#ffb03a');px(c,cx-2,cy-11-fl,4,6,'#ffe07a');lights.push([cx,cy,60]);if(Math.random()<.3)spawn(v,cx,cy-10,1,['#ffd86b'],-30)}
  else{const tv=v.tav,{X,Y,hx}=tv,fl=Math.floor(t*9)%3;
    px(c,hx+8,Y+26-fl,14,8+fl,'#ff7a2a');px(c,hx+10,Y+23-fl,10,6,'#ffb03a');px(c,hx+13,Y+21-fl,4,5,'#ffe07a');px(c,hx+7,Y+32,16,2,PAL.woodD);
    lights.push([hx+15,Y+30,L.dark>.15?52:30]);
    for(const cx of [X+66,X+98]){const f2=Math.floor(t*6+cx)%2;px(c,cx,Y+16,2,4,'#f4eee0');px(c,cx,Y+13-f2,2,3,'#ffd86b');px(c,cx-1,Y+20,4,1,'#c9a03a');if(L.dark>.2)lights.push([cx+1,Y+14,16])}
    if(L.dark>.2)lights.push([X+80,Y+18,18]);
    // a candle chandelier over the middle of the room, and warm light filling the inn whatever the hour
    // it hangs from the ceiling, so it is drawn last of all, in front of everyone in the room
    {const cx=Math.round(X+tv.w*.5),cy=Math.round(Y+tv.h*.45),sw=Math.round(Math.sin(t*1.3));
     for(let k=0;k<6;k++){const an=k/6*Math.PI*2,x=Math.round(cx+Math.cos(an)*9)+sw,y=Math.round(cy+Math.sin(an)*4);lights.push([x+1,y-5,L.dark>.15?16:10,'255,200,120',.45])}
     tv.chand={cx,cy,draw:c=>{px(c,cx,Y+2,1,cy-Y-6,'#3a2a20');
       for(let a=0;a<12;a++){const an=a/12*Math.PI*2;px(c,Math.round(cx+Math.cos(an)*9)+sw,Math.round(cy+Math.sin(an)*4),2,1,a%2?'#5a3a22':'#7a5230')}
       for(let k=0;k<6;k++){const an=k/6*Math.PI*2,x=Math.round(cx+Math.cos(an)*9)+sw,y=Math.round(cy+Math.sin(an)*4),f=Math.floor(t*8+k)%3;px(c,x,y-4,2,4,'#f4eee0');px(c,x,y-6-f%2,2,2,f?'#ffd86b':'#fff2b0')}}}}
    lights.push([X+tv.w*.5,Y+tv.h*.5,Math.max(tv.w,tv.h)*.6,'255,190,110',L.dark>.15?.3:.5]);
    for(let i=0;i<3;i++){const k=(t*.5+i/3)%1;px(c,hx+15+Math.sin(k*6+i)*2,Y-2-k*18,3+Math.round(k*2),3,`rgba(220,220,232,${.6*(1-k)})`)}}
  const winGlow=[];
  // the fountain at night: lamps on four posts round the basin and the water lit from below
  if(v.fount){const F=v.fount;for(const [dx,dy] of [[-34,-6],[34,-6],[-30,12],[30,12]]){const x=F.x+dx,y=F.y+dy;px(c,x,y-12,2,13,'#3a3440');px(c,x-1,y-14,4,3,'#2a2430');px(c,x-1,y-15,4,1,'#5a5466');
      if(L.night){lights.push([x+1,y-12,22,'255,200,120',.6]);winGlow.push([null,x,y])}else px(c,x,y-13,2,1,'#9aa4b8')}
    if(L.night){lights.push([F.x,F.y-2,40,'120,190,255',.6]);winGlow.push(['water',F.x,F.y])}}
  for(const Ln of v.lanes){const g=Ln.g,T=Ln.T,s=effState(Ln);
    const bimg=buildingBody(T,th.mat,Ln.progress,L.night,s==='blocked',Ln.info.col),bx0=g.bx-BOX,by0=g.B-T.H-BOY;c.drawImage(bimg,bx0,by0);
    if(L.night){const G=litOf(bimg);winGlow.push([G.img,bx0,by0]);for(const [gx,gy] of G.pts)lights.push([bx0+gx,by0+gy+2,14,'255,180,90',.3])}
    liveExtras(c,v,Ln,t,lights,L);signpost(c,g.ox+4,g.B+3,Ln.info.col)}
  for(const b of v.bugs){px(c,b.x-3,b.y-4,6,4,'#5a2a5a');px(c,b.x-2,b.y-5,4,1,'#8a4a8a');px(c,b.x+(b.dir>0?3:-4),b.y-4,1,1,'#ffe07a');if(Math.floor(t*8)%2){px(c,b.x-4,b.y-1,1,1,'#3b2a2a');px(c,b.x+3,b.y-1,1,1,'#3b2a2a')}}
  const actors=[];
  for(const Ln of v.lanes){const p=v.people[Ln.id];if(!p||p.away)continue;const spec=Ln.info.cls;
    actors.push({y:p.y,f:()=>drawHero(c,p.x,p.y,heroOpts(spec,p))});
    if(p.anvil)actors.push({y:p.y-1,f:()=>drawAnvil(c,p.x-21,p.y-8,t-(p.anvHot||-9)<.35,lights)});
    if(spec.head==='minerhelm'&&L.night)lights.push([p.x,p.y-30,14]);
    if(spec.item==='lantern'&&L.dark>.2)lights.push([p.x+6,p.y-14,22]);
    for(const h of (v.helpers[Ln.id]||[]))actors.push({y:h.y,f:()=>drawHero(c,h.x,h.y,Object.assign({},h.spec,{dir:h.dir,walk:h.walk,frame:h.frame,carry:h.carry,pose:h.pose||'idle',item:h.item||h.spec.item,gem:h.gem}))})}
  if(v.tav){const tv=v.tav,B=v.barmaid;
    actors.push({y:tv.Y+47,f:()=>drawCounter(c,tv)});
    const seated=v.lanes.filter(resting).length;
    tv.tables.forEach((tb,i)=>actors.push({y:tb.y+3,f:()=>drawTable(c,tb.x,tb.y,Math.max(0,Math.min(3,seated-i*3)))}));
    if(B)actors.push({y:B.y,f:()=>drawHero(c,B.x,B.y,Object.assign({},B.spec,{dir:B.dir,walk:B.walk,frame:B.frame,pose:B.pose,item:B.item,breath:Math.floor(t*1.5)%2}))})}
  for(const m of townCouriers(v,t))actors.push({y:m.y,f:()=>drawHero(c,m.x,m.y,Object.assign({},m.spec,{dir:m.dir,walk:!!m.walk,frame:Math.floor(t*(m.walk?9:4)),pose:m.pose||'idle',breath:Math.floor(t*1.5)%2})),bub:m.bub?{x:m.x,y:m.y,k:m.bub}:null});
  {const hd=heraldFor(v);if(hd){const o=v.lanes[0],g=o&&o.g;if(g){const x=g.homeX+22,y=g.homeY;actors.push({y,f:()=>drawHero(c,x,y,Object.assign(heraldSpec(),{dir:'left',pose:Math.floor(t/1.6)%3===0?'talk':'idle',frame:Math.floor(t*4),breath:Math.floor(t*1.5)%2})),bub:{x,y,k:'scroll'}})}}}
  for(const sh of v.sheep){actors.push({y:sh.y,f:()=>{ellipseShadow(c,sh.x,sh.y,6,2,.25);const b=Math.floor(t*2+sh.x)%2;px(c,sh.x-6,sh.y-9,12,7,'#f4f0e6');px(c,sh.x-5,sh.y-10,10,1,'#ffffff');px(c,sh.x-5,sh.y-3,2,3,'#3a3040');px(c,sh.x+3,sh.y-3,2,3,'#3a3040');const hx=sh.dir>0?sh.x+5:sh.x-9;px(c,hx,sh.y-9+b,4,4,'#3a3040');px(c,hx+(sh.dir>0?2:1),sh.y-8+b,1,1,'#ffffff')}})}
  v.visitors=lanes.filter(o=>o.talkingTo===v.name&&travelPhase(o,t)?.k==='there');
  v.visitors.forEach((o,k)=>{const from=villages.get(o.product),spec=courierSpec(from?themeColour(from):'#8a7a5a',o.id),x=VX+26+k*20,y=pathYRow(v.gate==='N'?0:v.nRows-1);
    actors.push({y,f:()=>drawHero(c,x,y,Object.assign({},spec,{dir:k%2?'left':'right',walk:false,frame:Math.floor(t*4),pose:(Math.floor(t/1.5+k)%2)?'talk':'idle'})),bub:{x,y,k:(Math.floor(t/1.5+k)%2)?'chat':'...'}})});
  eggTown(v,c,t,dt,L,lights,actors);
  if(v.tav&&v.tav.chand&&v.tav.chand.draw){const ch=v.tav.chand;actors.push({y:1e9,f:()=>ch.draw(c)})}
  actors.sort((a,b)=>a.y-b.y);
  const holes=v.tav&&!th.indoor?tavHoles(v):null,lightsAbs=()=>lights.map(([x,y,r,col,s])=>[x+v.OX,y+v.OY,r,col,s]);
  if(L.dark>0){
    // Night: shade the town first and light its windows, then draw the townsfolk on a layer of their own, shaded to match,
    // so people walk in front of glowing windows and lamps instead of being painted over by them
    c.setTransform(1,0,0,1,0,0);applyLight(c,v.FW,v.FH,L,lightsAbs(),holes);c.setTransform(1,0,0,1,v.OX,v.OY);
  if(L.night){c.save();c.globalAlpha=.55;for(const [img,x,y] of winGlow){if(img===null){px(c,x,y-13,2,1,'#ffe08a');px(c,x,y-12,2,1,'#ffd27a')}else if(img==='water'){for(let k=0;k<10;k++){const a=k/10*Math.PI*2+t*.6,r=8+((k*7)%12);px(c,Math.round(x+Math.cos(a)*r),Math.round(y+Math.sin(a)*r*.45),2,1,(Math.floor(t*3)+k)%3?'#7ac0ff':'#d8f0ff')}px(c,x-1,y-12,2,4,'#bfe4ff')}else c.drawImage(img,x,y)}c.restore()}
    const main=c;if(!v.actorCv||v.actorCv.width!==v.FW||v.actorCv.height!==v.FH){v.actorCv=document.createElement('canvas');v.actorCv.width=v.FW;v.actorCv.height=v.FH;v.actorCtx=v.actorCv.getContext('2d');v.actorCtx.imageSmoothingEnabled=false}
    c=v.actorCtx;c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,v.FW,v.FH);c.setTransform(1,0,0,1,v.OX,v.OY);
    actors.forEach(a=>a.f());for(const q of v.parts)px(c,q.x,q.y,2,2,q.c);
    c.setTransform(1,0,0,1,0,0);drawWeather(c,v.FW,v.FH,t,dt,v,L);shadeLayer(c,v.FW,v.FH,L,lightsAbs(),holes);
    c=main;c.setTransform(1,0,0,1,0,0);c.drawImage(v.actorCv,0,0);c.setTransform(1,0,0,1,v.OX,v.OY);
  }else{
    actors.forEach(a=>a.f());for(const q of v.parts)px(c,q.x,q.y,2,2,q.c);
    c.setTransform(1,0,0,1,0,0);drawWeather(c,v.FW,v.FH,t,dt,v,L);applyLight(c,v.FW,v.FH,L,lightsAbs(),holes);c.setTransform(1,0,0,1,v.OX,v.OY);
  }
  for(const Ln of v.lanes){const p=v.people[Ln.id];if(!p||p.away)continue;const top=p.y-40-(p.hop||0);
    if(p.bub)bubble(c,p.x,top,p.bub,t);
    if(v.sel===Ln.id){const ay=top-(p.bub?20:2)-Math.round(Math.abs(Math.sin(t*4))*3);px(c,p.x-5,ay-5,11,2,'#f0b440');px(c,p.x-4,ay-3,9,2,'#f0b440');px(c,p.x-2,ay-1,5,2,'#f0b440');px(c,p.x-1,ay+1,3,1,'#f0b440');px(c,p.x-5,ay-6,11,1,'#6b3f10')}}
  for(const a of actors)if(a.bub)bubble(c,a.bub.x,a.bub.y-40,a.bub.k,t);
  eggTownOver(v,c,t);
  c.setTransform(1,0,0,1,0,0);
}
function liveFeature(c,v,th,t,lights,L){
  if(v.fount){const {x,y}=v.fount;for(let k=0;k<2;k++){const r=((t*6+k*9)%18)+4,a=1-r/22;c.fillStyle=`rgba(220,240,255,${a*.8})`;for(let i=0;i<24;i++){const an=i/24*Math.PI*2;c.fillRect(Math.round(x+Math.cos(an)*r),Math.round(y+Math.sin(an)*r*.45),1,1)}}for(let k=0;k<10;k++){const ph=(t*1.4+k/10)%1,a=k/10*Math.PI*2;px(c,x+Math.cos(a)*ph*18,y-14+ph*ph*20-ph*12,2,2,ph<.5?PAL.foam:PAL.waterL)}px(c,x-2,y-20+Math.floor(t*6)%2,4,4,PAL.foam)}
  if(v.mill){const {x,y}=v.mill,a=t*.9,hx=x,hy=y-40;for(let k=0;k<4;k++){const aa=a+k*Math.PI/2,ca=Math.cos(aa),sa=Math.sin(aa),na=Math.cos(aa+1.57),nb=Math.sin(aa+1.57);for(let r=3;r<24;r++){px(c,hx+ca*r,hy+sa*r,1,1,PAL.woodD);if(r>7)for(let w=1;w<5;w++)px(c,hx+ca*r+na*w,hy+sa*r+nb*w,1,1,(r+w)%3===0?PAL.woodD:(w===4?'#d8d0c0':'#f4eee0'))}}disc(c,hx,hy,2,PAL.woodDD)}
  if(v.crys){const {x,y}=v.crys,g=.5+.5*Math.sin(t*2);lights.push([x,y-24,40+g*10]);if(Math.random()<.3)spawn(v,x+rnd(-20,20),y-rnd(0,30),1,['#c0a8ff','#e8dcff'],-15);c.fillStyle=`rgba(190,160,255,${.15+.15*g})`;c.fillRect(x-6,y-40,12,40)}
  if(v.water){const y0=v.water.y,sk=v.water.skip||[-1,-1],fr=Math.floor(t*2.2),inSkip=x=>x>=sk[0]&&x<=sk[1];
    // rolling crests: each cell steps its crest along on a shared beat, offset by its own phase
    for(let yy=y0+10;yy<v.H+v.OY-2;yy+=9)for(let xx=-v.OX;xx<v.W+v.OX;xx+=16){const hh=hash(v.seed+'cr'+xx+','+yy),k=(fr+hh)%6;if(k>3)continue;const cx=xx+(hh%6)+k*2,cy=yy+((hh>>>4)%3);if(inSkip(cx)||inSkip(cx+5))continue;
      px(c,cx,cy,4,1,PAL.waterL);px(c,cx+1,cy-1,2,1,k===1?'#d8ecff':PAL.waterL);if(k===3)px(c,cx+4,cy,1,1,PAL.waterL)}
    // foam laps the shore on a slow two-beat
    const lap=Math.floor(t*1.2)%2;for(let xx=-v.OX;xx<v.W+v.OX;xx+=3){if(inSkip(xx))continue;px(c,xx,y0+3+lap,2,1,PAL.foam);if((xx/3+lap)%2)px(c,xx+1,y0+5+lap,1,1,'#c8e4ff')}
    for(let k=0;k<4;k++){const hh=hash(v.seed+'gl'+k+Math.floor(t*1.5));if(hh%3===0){const gx=hh%v.W;if(!inSkip(gx))px(c,gx,y0+12+(hh>>>8)%Math.max(4,v.H-y0-16),1,1,'#ffffff')}}}
  if(v.boat){const {x,y}=v.boat,b=Math.round(Math.sin(t*1.5)*1.5);px(c,x-16,y+b,32,8,'#7a4a24');px(c,x-16,y+b,32,2,'#9a6a34');px(c,x-12,y+8+b,24,2,'#5a3418');px(c,x-1,y-26+b,2,26,PAL.woodD);px(c,x+1,y-24+b,14,18,'#f4eee0');px(c,x+1,y-24+b,14,2,'#ffffff');px(c,x+4,y-18+b,8,4,'#c43a3a');if(L.night)lights.push([x,y-4,16])}
  if(v.wheel)drawWaterWheel(c,v.wheel.x,v.wheel.y,t,L,lights);
  if(v.hoard){if(Math.floor(t*3)%2){const hh=hash('gl'+Math.floor(t*3));px(c,v.hoard.x-16+hh%32,v.hoard.y-12+(hh>>>6)%10,1,1,'#ffffff')}lights.push([v.hoard.x,v.hoard.y-6,30])}
}
function liveExtras(c,v,Ln,t,lights,L){
  const g=Ln.g,T=Ln.T,p=Ln.progress,s=effState(Ln),bx=g.bx,B=g.B,top=B-T.H,cave=v.th.mat==='cave';
  if(T.chimney&&!cave&&p>=88&&(s==='working'||p>=100)){const cx=bx+T.W-14,cy=top-8;for(let i=0;i<4;i++){const k=(t*.6+i/4)%1;px(c,cx+Math.sin(k*6+i)*3,cy-k*22,3+Math.round(k*3),3,`rgba(236,236,244,${.7*(1-k)})`)}}
  if(T.forge&&p>=60&&!cave){lights.push([bx+T.W-16,B-10,s==='working'?22:12])}
  // (the anvil now appears only while someone is hammering at it)
  if(T.crates&&p>=30){crate(c,g.ox+72,B+1);crate(c,g.ox+82,B+4);barrel(c,g.ox+4,B-12)}
  if(T.sign&&(T.sign==='palette'||T.sign==='book')&&p>=30){const ex=g.ox+4,ey=B-10;
    if(T.sign==='book'){px(c,ex+5,ey+8,4,12,PAL.woodD);px(c,ex,ey+2,14,7,PAL.wood);px(c,ex,ey+2,14,2,PAL.woodL);px(c,ex+1,ey,12,4,'#f6eed6');for(const d of (v.dabs[Ln.id]||[]).slice(-10))px(c,ex+2+d.x,ey+1+(d.y%3),1,1,d.c)}
    else{px(c,ex+2,ey+10,2,10,PAL.woodD);px(c,ex+10,ey+10,2,10,PAL.woodD);px(c,ex+6,ey+8,2,12,PAL.woodDD);px(c,ex,ey,14,12,'#fbf7ee');px(c,ex,ey+11,14,1,'#d8d0c0');for(const d of (v.dabs[Ln.id]||[]).slice(-16))px(c,ex+2+d.x,ey+1+d.y,2,2,d.c)}}
  if(T.field)drawField(c,g.ox+54,B-46,40,46,p);
  if(T.lantern&&p>=95&&L.night)lights.push([bx+T.W/2,top-1,30]);
  if(T.crystal&&p>=95){lights.push([bx+T.W/2,top-10,26]);if(Math.random()<.15)spawn(v,bx+T.W/2+rnd(-4,4),top-12,1,['#c0a8ff'],-20)}
  if(L.night&&p>=70&&T.style!=='rock'&&T.style!=='yard')lights.push([g.doorX,B-8,22]);
  if(T.style==='rock'&&L.night&&p>=40)lights.push([g.doorX-12,B-16,18]);
  if(cave&&p>=50)lights.push([g.doorX,B-12,26]);
  if(Ln.info.type==='mine')drawMineSeams(c,v,Ln,t,lights,L);
  if(p>=100){const w=Math.floor(t*4)%2;let fx,fy;
    if(cave||T.style==='alcove'){fx=null}
    else if(T.turrets){for(const tx of [bx-6,bx+T.W-10]){px(c,tx+9,B-78,9,6,Ln.info.col);px(c,tx+9,B-74,9,2,shade(Ln.info.col,-.3));px(c,tx+18,B-77+w,3,4,Ln.info.col)}}
    else if(T.style==='rock'){fx=bx+T.W/2+2;fy=top-8}else if(T.style==='yard'){fx=bx+6;fy=top-10}else if(T.crystal){fx=null}
    else{fx=bx+T.W/2+(T.style==='cone'?-1:-14)+2;fy=top-(T.style==='cone'?8:2)-16}
    if(fx!=null){px(c,fx,fy,9,6,Ln.info.col);px(c,fx,fy+4,9,2,shade(Ln.info.col,-.3));px(c,fx+9,fy+1+w,3,4,Ln.info.col);px(c,fx,fy,9,1,shade(Ln.info.col,.3))}}
  if(s==='blocked'){const sx=g.doorX+14,sy=B+2;px(c,sx+4,sy+8,2,8,PAL.woodD);for(let i=0;i<6;i++)px(c,sx+4-i,sy+i,2+i*2,1,'#f2c94c');for(let i=0;i<5;i++)px(c,sx+i,sy+6+i,10-i*2,1,'#f2c94c');px(c,sx+4,sy+2,2,5,'#2a1e14');px(c,sx+4,sy+8,2,1,'#2a1e14')}
}

// a herald stands at the owner's door while a decree for this town is on the road
function heraldFor(v){if(typeof DECREES==='undefined')return null;return DECREES.find(d=>d.status==='queued'&&(d.to===v.name||d.to==='all'))||answersOnRoad().find(a=>a.to===v.name)||null}

// the countryside: the town scene itself carries on past its walls, so zooming out never shows an edge.
// Same ground, the road north out of the gate, woods thickening with distance (live, swaying trees), the sea for harbour towns.
function outskirts(c,v){
  const th=v.th,seed=v.seed+'out',OX=v.OX,OY=v.OY,W=v.FW,H=v.FH,wy=v.water?OY+v.water.y:Infinity,cave=th.ground==='cave';
  const D=dressFor(v.thKey,v.full).out||[],placed=[];
  const scatter=()=>{const per=2*(v.W+v.H),n=Math.round(per/34);for(let k=0;k<n;k++){const hh=hash(seed+'pr'+k),u=(hh%1000)/1000*per,d=18+(hh>>>10)%80;let x,y;
      if(u<v.W){x=OX+u;y=OY-d}else if(u<v.W+v.H){x=OX+v.W+d;y=OY+(u-v.W)}else if(u<2*v.W+v.H){x=OX+(u-v.W-v.H);y=OY+v.H+d}else{x=OX-d;y=OY+(u-2*v.W-v.H)}
      if(y+4>wy||x<8||y<12||x>W-8||y>H-4)continue;if(v.gate==='W'?(x<OX&&Math.abs(y-(OY+gateRow(v)*TS+8))<22):(Math.abs(x-(OX+VX))<22&&(v.gateS?y>OY+v.H:y<OY)))continue;if(placed.some(q=>Math.hypot(q[0]-x,q[1]-y)<22))continue;
      drawProp(c,D[(hh>>>4)%D.length],x,y);placed.push([x,y])}};
  if(cave){rockWall(c,0,0,W,H,seed);for(let k=0;k<W*H/900;k++){const hh=hash(seed+'cr'+k);px(c,hh%W,(hh>>>9)%H,2,2,'#2a2420')}scatter();return}
  for(let y=0;y<H;y+=16)for(let x=0;x<W;x+=16){if(y>=wy)break;groundTile(c,x,y,hash(seed+x+','+y),th)}
  const gx=OX+VX-8;if(v.gate==='W'){const gy=OY+gateRow(v)*TS;for(let x=0;x<OX+8;x+=16)roadTile(c,x,gy,hash(seed+'rd'+x),{t:1,b:1,l:0,r:0},th)}else if(v.gateS){for(let y=OY+v.H-8;y<H;y+=16)roadTile(c,gx,y,hash(seed+'rd'+y),{t:0,b:0,l:1,r:1},th)}else for(let y=0;y<OY+8;y+=16)roadTile(c,gx,y,hash(seed+'rd'+y),{t:0,b:0,l:1,r:1},th);
  if(v.water){for(let y=wy;y<H;y++)px(c,0,y,W,1,y<wy+3?PAL.sandD:y<wy+5?PAL.foam:(y-wy)%7===0?PAL.waterD:PAL.water)}
  const inTown=(x,y)=>x>OX-30&&x<OX+v.W+2&&y>OY-40&&y<OY+v.H+2;
  scatter();
  for(let y=-24;y<H;y+=20)for(let x=-24;x<W;x+=22){const hh=hash(seed+'t'+x+','+y),tx=x+(hh%12),ty=y+((hh>>>5)%10);
    if(inTown(tx,ty)||ty+34>wy)continue;if(placed.some(q=>Math.abs(q[0]-(tx+16))<22&&q[1]-(ty+40)>-10&&q[1]-(ty+40)<26))continue;if(v.gate==='W'?(tx+16<OX+4&&Math.abs(ty+40-(OY+gateRow(v)*TS+8))<30):(Math.abs(tx+16-(OX+VX))<28&&(v.gateS?ty+40>OY+v.H:ty<OY)))continue;
    const dx=Math.max(OX-tx,tx-(OX+v.W),0),dy=Math.max(OY-ty,ty-(OY+v.H),0),d=Math.hypot(dx,dy),p=clamp(.16+d/240,.16,.9);
    if((hh>>>12)%1000/1000<p){const k=(hh>>>3)%29===0?2+((hh>>>2)&1):(hh>>>2)&1;v.trees.push(th.border==='pines'?{p:1,x:tx-OX,y:ty-OY,k:k&1}:{p:0,x:tx-OX,y:ty-OY,k})}
    else if((hh>>>14)%9===0)drawBush(c,tx+8,ty+20,(hh>>>4)&1)}
}

// what you hear when you zoom in close: talk, song and snores from the speech bubbles, sheep, the fire, the sea
function townAudio(v,dt,t){if(typeof SND==='undefined'||!SND.on||v!==active)return;
  for(const L of v.lanes){const p=v.people[L.id];if(!p)continue;const r=Math.random();
    if((p.bub==='chat'||p.bub==='...')&&r<dt*.9)sfx3(v,p.x,p.y-20,'chatter');
    else if(p.pose==='talk'&&!p.bub&&r<dt*.5)sfx3(v,p.x,p.y-20,'chatter',.8);
    else if(p.bub==='♪'&&r<dt*.6)sfx3(v,p.x,p.y-20,'sing');
    else if(p.bub==='z'&&r<dt*.3)sfx3(v,p.x,p.y-20,'snore')}
  (v.visitors||[]).forEach((o,k)=>{if(Math.random()<dt*.7)sfx3(v,VX+26+k*20,pathYRow(v.gate==='N'?0:v.nRows-1)-20,'chatter')});
  for(const sh of v.sheep)if(Math.random()<dt*.13)sfx3(v,sh.x,sh.y,'baa');
  if(v.tav&&Math.random()<dt*2.4)sfx3(v,v.tav.hx+15,v.tav.Y+30,'crackle',.9);
  if(!v.tav&&v.camp&&Math.random()<dt*3)sfx3(v,v.camp.x,v.camp.y,'crackle');
  if(v.torches)for(const [x,y] of v.torches)if(Math.random()<dt*.4)sfx3(v,x,y,'crackle',.5);
  if(v.water&&v.cam&&Math.random()<dt*.3)sfx3(v,v.cam.cx,v.water.y+16,'wave');
}

// the mine's rock face is seamed with gold and gems; apprentices pick them out and carry them to the ore pile by the door
const GEMS={gold:['#f2c94c','#c8901a','#fff09a'],ruby:['#e0404a','#9a1e2a','#ffb0b0'],sapphire:['#4a7ae0','#1e3a9a','#c0d8ff'],emerald:['#3ec070','#1a7a40','#c0ffd8'],amethyst:['#a060e0','#5a2a9a','#e8c8ff']};
function mineSpots(L){if(L.mspots)return L.mspots;const g=L.g,bx=g.bx,top=g.B-L.T.H;
  return L.mspots||(L.mspots=[[8,34,'gold'],[16,25,'ruby'],[21,38,'gold'],[44,38,'sapphire'],[49,26,'gold'],[57,34,'emerald'],[12,42,'amethyst'],[54,43,'gold']].map(([x,y,kind])=>({x:bx+x,y:top+y,kind,has:1,t:0})))}
function drawMineSeams(c,v,L,t,lights,Lt){if(L.progress<20)return;
  for(const sp of mineSpots(L)){if(!sp.has){if(t>sp.t)sp.has=1;else continue}const G=GEMS[sp.kind];
    if(sp.kind==='gold'){px(c,sp.x-2,sp.y,4,2,G[0]);px(c,sp.x-1,sp.y-1,2,1,G[0]);px(c,sp.x+1,sp.y+1,2,1,G[1]);px(c,sp.x-1,sp.y,1,1,G[2])}
    else{px(c,sp.x-1,sp.y-2,2,1,G[0]);px(c,sp.x-2,sp.y-1,4,2,G[0]);px(c,sp.x-1,sp.y+1,2,1,G[1]);px(c,sp.x+1,sp.y-1,1,2,G[1]);px(c,sp.x-1,sp.y-1,1,1,G[2])}
    if(Math.floor(t*3+sp.x)%7===0)px(c,sp.x+2,sp.y-3,1,1,'#ffffff');
    if(Lt.dark>.25)lights.push([sp.x,sp.y,6])}
  const n=Math.min(14,L.ore||0),g=L.g,ox=g.ox+86,oy=g.B+10;
  if(n){for(let k=0;k<n;k++){const hh=hash(L.id+'ore'+k),x=ox-7+hh%14-Math.floor(k/5),y=oy-2-Math.floor(k/4)*2-((hh>>>4)%2);const G=GEMS[['gold','gold','ruby','sapphire','emerald','amethyst'][hh%6]];px(c,x,y,3,2,G[0]);px(c,x,y,1,1,G[2])}}}
function mineHelpers(v,L,list,dt,t,spots,pile,store){const g=L.g;
  list.forEach((h,k)=>{h.walk=false;h.pose='idle';h.item='none';h.carry=false;h.frame=Math.floor(t*8+k);
    const walkTo=(x,y)=>{const dx=x-h.x,dy=y-h.y,st=26*dt;if(Math.abs(dx)>.5){h.x+=Math.sign(dx)*Math.min(st,Math.abs(dx));h.dir=dx>0?'right':'left';h.walk=true;return false}
      if(Math.abs(dy)>.5){h.y+=Math.sign(dy)*Math.min(st,Math.abs(dy));h.dir=dy>0?'down':'up';h.walk=true;return false}h.x=x;h.y=y;return true};
    h.ms=h.ms||'pick';
    if(h.ms==='pick'){const free=spots.filter(sp=>sp.has&&!sp.claim);if(free.length){h.spot=free[Math.floor(Math.random()*free.length)];h.spot.claim=1;h.ms='go'}else{if(walkTo(pile.x-10-k*10,pile.y+4))h.dir='up'}}
    else if(h.ms==='go'){h.item='pick';const st=h.spot.stand||{x:h.spot.x,y:g.B+6};if(walkTo(st.x,st.y)){h.ms='dig';h.dig=rnd(1.4,2.2)}}
    else if(h.ms==='dig'){h.item='pick';h.dir=(h.spot.stand&&h.spot.stand.dir)||'up';h.pose='swing';h.dig-=dt;
      if(h.frame%4===2&&!h.hit){h.hit=1;spawn(v,h.spot.x,h.spot.y,3,['#a6a196','#fff6c8',GEMS[h.spot.kind][0]]);sfx3(v,h.x,h.y,'pick',.7)}else if(h.frame%4!==2)h.hit=0;
      if(h.dig<=0){const sp=h.spot;sp.has=0;sp.claim=0;sp.t=t+rnd(9,16);h.gem=sp.kind;h.ms='carry';spawn(v,sp.x,sp.y,6,GEMS[sp.kind],70);sfx3(v,h.x,h.y,'coin',.7)}}
    else if(h.ms==='carry'){h.item='gem';if(walkTo(pile.x,pile.y)){store.ore=(store.ore||0)+1;h.gem=null;h.ms='pick';spawn(v,pile.x+6,pile.y-6,3,['#f2c94c','#fff09a'],60)}}
  });
}

// an anvil, set down in front of whoever is hammering; it glows for a moment after each strike
function drawAnvil(c,ax,ay,hot,lights){ellipseShadow(c,ax+6,ay+10,7,2,.3);
  px(c,ax,ay,12,4,'#4a4e5e');px(c,ax,ay,12,1,'#8a92a6');px(c,ax-3,ay,4,2,'#4a4e5e');px(c,ax+3,ay+4,6,4,'#363a46');px(c,ax+1,ay+8,10,2,'#2a2e38');
  px(c,ax+3,ay-1,6,1,hot?'#ff9a3c':'#c86a3a');px(c,ax+4,ay-2,4,1,hot?'#ffd86b':'#a8502e');if(hot)lights.push([ax+6,ay,14])}

function caveSpots(v){if(v.cspots)return v.cspots;const out=[],kinds=['gold','ruby','gold','sapphire','emerald','gold','amethyst'];
  for(let i=v.lanes.length;i<v.nRows*v.lpr;i++){const g=lotGeo(v,i);for(let k=0;k<4;k++){const hh=hash(v.seed+'cs'+i+','+k),x=g.ox+16+k*18+hh%6,y=g.oy+40+(hh>>>4)%12;out.push({x,y,kind:kinds[(hh>>>8)%kinds.length],has:1,t:0,stand:{x,y:g.oy+64,dir:'up'}})}}
  for(let y=TS*4;y<v.sy-20;y+=TS*3){const hh=hash(v.seed+'cw'+y);out.push({x:v.W-10,y:y+hh%10,kind:kinds[hh%kinds.length],has:1,t:0,stand:{x:v.W-26,y:y+hh%10+8,dir:'right'}})}
  return v.cspots=out}
function drawCaveSeams(c,v,t,lights,Lt){if(!v.hoard)return;const fake={progress:100,mspots:caveSpots(v),g:{ox:v.hoard.x-116,B:v.hoard.y-2},ore:v.ore,id:v.name};drawMineSeams(c,v,fake,t,lights,Lt)}

// the riverside mill: a log mill house on the bank and a big undershot wheel turning in the stream beside it
function drawWaterWheel(c,x,y,t,L,lights){const W=RAMP.wood,D='#2a1a12',a=-t*.9,cx=x+32,cy=y+2,R=17;
  const line=(x0,y0,x1,y1,col,w=1)=>{const n=Math.ceil(Math.max(Math.abs(x1-x0),Math.abs(y1-y0)));for(let k=0;k<=n;k++)px(c,Math.round(x0+(x1-x0)*k/n),Math.round(y0+(y1-y0)*k/n),w,w,col)};
  const ring=(r,col,w=1)=>{for(let k=0;k<96;k++){const an=k/96*Math.PI*2;px(c,Math.round(cx+Math.cos(an)*r),Math.round(cy+Math.sin(an)*r),w,w,col)}};
  // the mill house: log walls, a shingle roof, a door and a little window
  ellipseShadow(c,x,y,20,3,.25);
  for(let yy=y-22,r=0;yy<y;yy+=4,r++){px(c,x-16,yy,30,4,r%2?W[2]:W[3]);px(c,x-16,yy,30,1,W[4]);px(c,x-16,yy+3,30,1,W[0])}
  for(let i=0;i<14;i++){const hw=18-Math.round(i*1.1);px(c,x-1-hw,y-23-i,hw*2,1,i%3===0?'#5a3a22':'#7a5232');px(c,x-1-hw,y-23-i,2,1,'#3a2414')}
  px(c,x-4,y-11,7,11,D);px(c,x-4,y-12,7,1,W[1]);px(c,x+6,y-18,5,5,W[0]);px(c,x+7,y-17,3,3,L&&L.night?'#ffd86b':'#3e4a78');if(L&&L.night)lights.push([x+8,y-15,16]);
  // the axle beam from the house to the wheel, on a timber trestle
  px(c,x+13,cy-2,cx-x-13,4,W[1]);px(c,x+13,cy-2,cx-x-13,1,W[3]);px(c,cx+R+2,cy-R-4,3,R+8,W[0]);px(c,cx+R+1,cy-R-5,5,2,W[2]);
  // the wheel: the back rim, spokes, paddles round the rim, the front rim and the hub
  ring(R-5,D,2);ring(R-5,W[1]);
  for(let k=0;k<8;k++){const an=a+k*Math.PI/4;line(cx,cy,cx+Math.cos(an)*(R-2),cy+Math.sin(an)*(R-2),D,2);line(cx,cy,cx+Math.cos(an)*(R-2),cy+Math.sin(an)*(R-2),k%2?W[2]:W[3])}
  // paddles: flat boards standing out from the rim, dark edged so they read against the grass
  for(let k=0;k<12;k++){const an=a+k*Math.PI/6,ca=Math.cos(an),sa=Math.sin(an),ta=-sa,tb=ca;
    for(let r=R-2;r<=R+5;r++)for(let w=-2;w<=2;w++){const X=Math.round(cx+ca*r+ta*w),Y=Math.round(cy+sa*r+tb*w);px(c,X,Y,1,1,Math.abs(w)===2||r===R+5?D:w<0?W[3]:W[2])}}
  ring(R+1,D,2);ring(R,W[2],2);ring(R-1,W[4]);
  px(c,cx-3,cy-3,6,6,D);px(c,cx-2,cy-2,4,4,'#5a5a66');px(c,cx-1,cy-1,1,1,'#9a9aa6');
  // the part of the wheel under the water, and the white water it churns up
  for(let yy=cy+6;yy<=cy+R+4;yy++){const hw=Math.round(Math.sqrt(Math.max(0,(R+4)*(R+4)-(yy-cy)*(yy-cy))));c.fillStyle='rgba(40,90,170,.55)';c.fillRect(cx-hw,yy,hw*2,1)}
  px(c,cx-R-6,cy+6,(R+6)*2,1,'#cfe6ff');
  for(let k=0;k<7;k++){const ph=(t*2+k*.37)%1,sx=cx-R+((k*11)%(R*2)),sy=cy+6-Math.round(Math.sin(ph*Math.PI)*5);px(c,sx,sy,2,2,ph<.5?'#ffffff':'#cfe6ff')}
  for(let k=0;k<4;k++){const ph=(t*1.3+k*.25)%1;px(c,cx-R-8-Math.round(ph*14),cy+8+(k%2),3,1,`rgba(240,250,255,${1-ph})`)}}

// the inn's lit floor: inside its walls only, leaving out the grass above the back wall and the open doorway
function tavHoles(v){const T=v.tav,ox=v.OX,oy=v.OY,top=T.Y+TAV_TOP,dl=T.doorX-TAV_DOOR[0],dr=T.doorX+TAV_DOOR[1],db=T.Y+TAV_DOOR[2],bot=T.Y+T.h;
  return [[T.X+ox,top+oy,dl-T.X,bot-top],[dr+ox,top+oy,T.X+T.w-dr,bot-top],[dl+ox,db+oy,dr-dl,bot-db]]}
const TAV_TOP=10,TAV_DOOR=[7,8,34];

// ===================== the realm: everything is generated from what the projects report =====================
// realm/config names the kingdom; projects/<id> is each project's own profile (what it is, its lanes and their roles, its links).
// Nothing about a particular person's projects is written into the game: an explicit `kind` or `place` in a profile wins,
// otherwise the theme comes from the profile's words and the town's size, and the name from the project's name.
let REALM={kingdom:'',castle:'',ruler:'',url:''};
const PROJECTS=new Map();          // lower-case project name -> cleaned profile
const KINDS=['capital','port','village','river','arcane','cave'];
const STAGES=['idea','building','beta','live'];
function gameName(){return REALM.kingdom||(REALM.ruler?REALM.ruler+"'s Kingdom":'Your Kingdom')}
function castleName(){return REALM.castle||'The Castle'}
function rulerName(){return REALM.ruler||'the ruler'}
const str=(x,n)=>String(x==null?'':x).trim().slice(0,n);
function cleanRealm(d){return {kingdom:str(d.kingdom,32),castle:str(d.castle,32),ruler:str(d.ruler,24),monarch:d.monarch==='queen'?'queen':'king',url:/^https:\/\/claude\.ai\//.test(String(d.url||''))?str(d.url,120):'',kid:/^k[a-z0-9]{12,40}$/.test(String(d.kid||''))?String(d.kid):'',unlocked:Array.isArray(d.unlocked)?d.unlocked.slice(0,40).map(x=>str(x,24)):[],tentDone:Array.isArray(d.tentDone)?d.tentDone.slice(0,40).map(x=>str(x,24)):[]}}
function cleanProject(id,d){
  const arr=(x,n,k)=>Array.isArray(x)?x.slice(0,n).map(y=>str(y,k)).filter(Boolean):[];
  const lanes=Array.isArray(d.lanes)?d.lanes.slice(0,16).map((l,i)=>({id:slug(str(l&&l.id,30)||str(l&&l.role,24)||'lane-'+i),role:str(l&&l.role,24)||'lane',owns:str(l&&l.owns,140),handsTo:arr(l&&l.handsTo,4,30)})):[];
  const links=Array.isArray(d.links)?d.links.slice(0,6).map(l=>typeof l==='string'?{to:str(l,64),why:''}:{to:str(l&&l.to,64),why:str(l&&l.why,100)}).filter(l=>l.to):[];
  return {id,name:str(d.name,64)||id,pitch:str(d.pitch,160),audience:str(d.audience,80),stage:STAGES.includes(String(d.stage).toLowerCase())?String(d.stage).toLowerCase():'',
    platforms:arr(d.platforms,6,16),tags:arr(d.tags,8,24),lanes,links,kind:KINDS.includes(String(d.kind).toLowerCase())?String(d.kind).toLowerCase():'',place:str(d.place,28),updated:str(d.updated,30)}}
function profileOf(name){return PROJECTS.get(String(name||'').toLowerCase())||null}

// ---- what kind of place each project is ----
// a project's own words pick its world: trade means a harbour, families a meadow village, media a riverside, research an arcane glade,
// money a cave full of gold. The biggest project is the capital, where the castle stands.
const THEME_WORDS={
  port:/market|\btrade\b|trading card|\btcg\b|commerce|\bshop|store|resale|\bsell|\bbuy|logistic|shipping|travel|booking|auction|collect/g,
  village:/family|famil|baby|parent|\bkid|child|\bcare\b|carer|community|household|\bhome\b|\bpet|wedding|neighbo|rota|chores|school/g,
  river:/stream|video|music|media|podcast|\bshare|social|chat|messag|photo|watch|\btv\b|film|movie|creator/g,
  arcane:/research|\bux\b|ux |design|learn|educat|course|teach|knowledge|\bai\b|consult|insight|coach|newsletter|writing|magic|science/g,
  cave:/financ|trading desk|invest|stock|crypto|ledger|\bbank|secur|quant|backtest|portfolio|\bdesk\b|mining|money|budget|tax/g,
};
function themeScores(p,name){
  const txt=[name,p&&p.pitch,p&&p.audience,...(p?p.tags:[]),...(p?p.platforms:[])].join(' ').toLowerCase();
  const s={};for(const k in THEME_WORDS)s[k]=(txt.match(THEME_WORDS[k])||[]).length;return s}
// names: product -> number of lanes. Returns product -> theme, one capital, and as few repeats as the words allow.
function assignThemes(sizes){
  const out=new Map(),used=new Set(),names=[...sizes.keys()].filter(n=>n!=='The Crown');
  for(const n of names){const p=profileOf(n);if(p&&p.kind){out.set(n,p.kind);used.add(p.kind)}}
  const rest=names.filter(n=>!out.has(n));
  const stageRank=n=>STAGES.indexOf(profileOf(n)?.stage||'')/10;
  const size=n=>(sizes.get(n)||0)+stageRank(n);
  rest.sort((a,b)=>size(b)-size(a)||a.localeCompare(b));
  if(!used.has('capital')&&rest.length){const c=rest.shift();out.set(c,'capital');used.add('capital')}
  // projects whose words clearly say what world they belong to choose first, strongest first; the rest take what is left
  const ks0=['port','village','river','arcane','cave'],sc=new Map(rest.map(n=>[n,themeScores(profileOf(n),n)]));
  const best=n=>Math.max(...ks0.map(k=>sc.get(n)[k]));
  for(const n of [...rest].sort((a,b)=>best(b)-best(a)||size(b)-size(a))){const s1=sc.get(n),ks=[...ks0];
    ks.sort((a,b)=>s1[b]-s1[a]||(used.has(a)-used.has(b))||((hash(n+a)%7)-(hash(n+b)%7)));
    const k=ks.find(x=>s1[x]>0&&!used.has(x))||(s1[ks[0]]>1?ks[0]:null)||ks.find(x=>!used.has(x))||ks[0];
    out.set(n,k);used.add(k)}
  out.set('The Crown','crown');return out}
function themeFor(name){const k=THEME_PICK.get(name)||'village';return k==='crown'||premium()||FREE_KINDS.includes(k)?k:'village'}
let THEME_PICK=new Map();

// ---- what each place is called ----
function townWord(name){
  const ws=String(name).replace(/^the\s+/i,'').split(/[\s\-_.]+/).filter(w=>/^[a-z]{3,}$/i.test(w)&&!/^(app|the|and|for|hq|desk|labs?|inc|ltd)$/i.test(w));
  if(!ws.length){const any=String(name).replace(/[^a-z ]/gi,' ').trim().split(/\s+/).filter(w=>w.length>1);return cap(any.pop()||'New')}
  let best=ws[0];for(const w of ws)if(w.length>=best.length)best=w;return cap(best)}
function cap(w){return w===w.toUpperCase()&&w.length<=4?w:w[0].toUpperCase()+w.slice(1)}
function placeName(v){
  if(v.thKey==='crown')return castleName();
  const p=profileOf(v.name);if(p&&p.place)return p.place;
  const w=townWord(v.name),lw=w.toLowerCase(),h=hash(v.name);
  const glue=(sfx)=>w+(lw.endsWith(sfx[0])?sfx.slice(1):sfx);
  const pools={capital:[glue('polis'),glue('chester'),'High '+w],port:['Port '+w,w+' Harbour',glue('haven')],village:['Little '+glue('bury'),glue('ham'),w+' Green'],
    river:[glue('brook'),glue('ford'),w+' Mill'],arcane:[w+' Spire',w+' Tower',glue('mere')],cave:[w+' Hollow',w+' Deep',w+' Delve']};
  const pool=pools[v.thKey]||[glue('ton')];return pool[h%pool.length]}

// ---- every lane in a project's roster has a building, even before it has reported ----
function rosterLanes(reported){
  const out=[];
  for(const p of PROJECTS.values()){
    const mine=reported.filter(L=>L.product.toLowerCase()===p.name.toLowerCase()),taken=new Set();
    for(const r of p.lanes){
      const hit=mine.find(L=>!taken.has(L)&&(L.lane===r.id||L.id.toLowerCase().endsWith(r.id)))||mine.find(L=>!taken.has(L)&&L.role.toLowerCase()===r.role.toLowerCase());
      if(hit){taken.add(hit);if(!hit.owns)hit.owns=r.owns;if(!hit.lane)hit.lane=r.id;continue}
      out.push({id:slug(p.name)+'--'+r.id,lane:r.id,product:p.name,role:r.role,task:r.owns||'Has not reported yet',owns:r.owns,state:'idle',progress:0,waitingOn:'',talkingTo:'',updated:'',helpers:[],unreported:true})}
    // a surveyed project with no roster and no reports still gets its owner
    if(!p.lanes.length&&!mine.length)out.push({id:slug(p.name)+'--owner',lane:'owner',product:p.name,role:'owner',task:'Has not reported yet',owns:'',state:'idle',progress:0,waitingOn:'',talkingTo:'',updated:'',helpers:[],unreported:true})}
  return out}
// project names as the profile spells them, so a lane that says "seek tcg" lands in "Seek TCG"
function canonProduct(n){const p=profileOf(n);return p?p.name:n}
function projectLinks(){const out=[];for(const p of PROJECTS.values())for(const l of p.links){const q=profileOf(l.to);out.push([p.name,q?q.name:l.to,l.why])}return out}
function projectLine(v){const p=profileOf(v.name);if(!p)return '';return [p.pitch,p.stage&&(p.stage[0].toUpperCase()+p.stage.slice(1)),p.platforms.join(', ')].filter(Boolean).join(' · ')}
function applyRealmNames(){
  const g=gameName().toUpperCase();document.title=gameName();
  document.querySelectorAll('[data-realm="kingdom"]').forEach(e=>e.textContent=g);
  document.querySelectorAll('[data-realm="castle"]').forEach(e=>e.textContent=castleName().toUpperCase());
  document.querySelectorAll('[data-realm="ruler"]').forEach(e=>e.textContent=rulerName());
  document.querySelectorAll('[data-realm="monarch"]').forEach(e=>e.textContent=monarch())}

const BASE_PROPS=new Set(Object.keys(PROPS));  // the free kit; everything added after this is part of the Royal Charter
// ===================== scenery for each kind of place =====================
// More props in the same kit style (one palette, light from the top left, selective outline), grouped by the place they belong to.
Object.assign(PROPS,{
  // the capital: civic pride
  statue:[16,28,c=>{const S=RAMP.stone;px(c,2,20,12,8,S[2]);px(c,2,20,12,1,S[4]);px(c,11,20,3,8,S[1]);px(c,5,4,6,16,S[3]);px(c,5,4,2,16,S[4]);px(c,9,4,2,16,S[1]);px(c,6,0,4,5,S[3]);px(c,6,0,2,2,S[4]);px(c,3,7,3,2,S[3]);px(c,10,6,3,2,S[2]);px(c,12,1,1,7,S[2]);px(c,4,24,8,1,RAMP.gold[3])}],
  planter:[16,11,c=>{const S=RAMP.stone;px(c,1,5,14,6,S[2]);px(c,1,5,14,1,S[4]);px(c,12,5,3,6,S[1]);for(let k=0;k<5;k++){px(c,2+k*3,2,3,3,RAMP.leaf[2]);px(c,3+k*3,1,1,1,['#f05a5a','#f2c94c','#e88ad8','#fff6e4','#f05a5a'][k])}}],
  bannerpost:[10,28,c=>{px(c,1,0,2,28,RAMP.wood[1]);px(c,1,0,1,28,RAMP.wood[3]);px(c,0,0,4,2,RAMP.gold[3]);px(c,3,3,7,12,'#c43a3a');px(c,3,3,7,1,'#e05a50');px(c,5,6,3,3,RAMP.gold[3]);px(c,3,15,3,2,'#c43a3a');px(c,7,15,3,1,'#c43a3a')}],
  umbrella:[20,20,c=>{px(c,9,6,2,14,RAMP.wood[1]);for(let y=0;y<6;y++){const hw=Math.round(3+y*1.3);px(c,10-hw,y,hw*2,1,y%2?'#f4eee0':'#c43a3a')}px(c,3,12,14,5,RAMP.wood[2]);px(c,3,12,14,1,RAMP.wood[3]);px(c,5,10,3,2,'#f2c94c');px(c,10,10,3,2,'#7ac862');px(c,14,10,2,2,'#e05a50')}],
  // the harbour
  anchor:[14,14,c=>{const I='#5a6070',L='#8a92a6';px(c,6,0,2,12,I);px(c,6,0,1,12,L);px(c,4,1,6,2,I);px(c,1,9,2,3,I);px(c,11,9,2,3,I);px(c,2,11,10,2,I);px(c,2,11,10,1,L);px(c,5,-1,4,2,I)}],
  nets:[20,16,c=>{const W=RAMP.wood;px(c,1,0,2,16,W[1]);px(c,17,0,2,16,W[1]);px(c,1,1,18,2,W[2]);for(let y=3;y<13;y+=2)for(let x=3;x<17;x+=2)px(c,x+(y%4?1:0),y,1,1,'#c8b890');px(c,3,12,14,1,'#a89870');px(c,6,6,3,2,'#c0c8d0')}],
  rope:[12,7,c=>{for(let r=0;r<3;r++){px(c,1+r,1+r,10-r*2,1,'#c8a870');px(c,1+r,5-r,10-r*2,1,'#a88850')}px(c,5,2,2,2,'#7a6040')}],
  lobsterpot:[12,10,c=>{const W=RAMP.wood;px(c,1,2,10,8,W[1]);for(let x=1;x<11;x+=2)px(c,x,2,1,8,W[3]);px(c,1,2,10,1,W[3]);px(c,4,4,4,3,'#2a1e14');px(c,7,0,3,3,'#d8402e')}],
  rowboat:[26,11,c=>{px(c,2,4,22,5,'#8e5a34');px(c,0,4,26,2,'#b07a48');px(c,4,9,18,2,'#5e3a20');px(c,6,5,14,3,'#6a4228');px(c,10,5,1,3,'#b07a48');px(c,16,5,1,3,'#b07a48');px(c,8,2,10,1,'#d8c8a0')}],
  // the meadow village
  scarecrow:[16,26,c=>{px(c,7,6,2,20,RAMP.wood[1]);px(c,1,9,14,2,RAMP.wood[2]);px(c,4,9,8,9,'#a84a3a');px(c,4,9,8,1,'#c8604a');px(c,1,10,2,4,'#e0c068');px(c,13,10,2,4,'#e0c068');px(c,5,1,6,6,'#e8d8a0');px(c,6,3,1,1,'#2a1e14');px(c,9,3,1,1,'#2a1e14');px(c,3,0,10,2,'#c8a04a');px(c,5,-1,6,2,'#a07a36')}],
  beehive:[12,13,c=>{for(let y=0;y<11;y++){const hw=Math.round(5*Math.sqrt(Math.min(1,(y+2)/6)));px(c,6-hw,y,hw*2,1,y%3===0?'#a07a36':'#e0b858')}px(c,5,8,2,2,'#3a2418');px(c,1,11,10,2,RAMP.wood[1])}],
  hen:[9,8,c=>{px(c,1,2,6,5,'#f4f0e6');px(c,1,2,6,1,'#ffffff');px(c,6,0,2,3,'#f4f0e6');px(c,8,1,1,1,'#f2a030');px(c,6,0,1,1,'#e04a3a');px(c,7,1,1,1,'#2a1e14');px(c,2,7,1,1,'#f2a030');px(c,5,7,1,1,'#f2a030');px(c,0,3,1,2,'#d8d0c0')}],
  pumpkins:[16,9,c=>{for(const [x,s] of [[1,6],[7,8]]){px(c,x,9-s,s,s-1,'#e0802a');px(c,x,9-s,2,s-1,'#f0a04a');px(c,x+s-2,9-s,1,s-1,'#b05a1a');px(c,x+s/2-1,8-s,2,2,'#5a8a3a')}px(c,14,6,2,3,'#5a8a3a')}],
  churn:[8,12,c=>{px(c,1,2,6,10,'#c8ccd4');px(c,1,2,2,10,'#e8ecf2');px(c,5,2,2,10,'#9aa0ac');px(c,2,0,4,2,'#9aa0ac');px(c,1,6,6,1,'#8a909c')}],
  // the riverside hamlet
  fishrack:[20,17,c=>{const W=RAMP.wood;px(c,1,2,2,15,W[1]);px(c,17,2,2,15,W[1]);px(c,0,2,20,2,W[2]);for(let k=0;k<4;k++){px(c,3+k*4,4,2,8,'#9ab0c0');px(c,3+k*4,4,1,8,'#c8d8e4');px(c,3+k*4,11,2,2,'#7a8a9a')}}],
  canoe:[26,8,c=>{px(c,2,2,22,4,'#a2703f');px(c,0,3,2,2,'#a2703f');px(c,24,3,2,2,'#a2703f');px(c,3,2,20,1,'#c8904e');px(c,4,5,18,2,'#6e4a2a');px(c,10,0,1,4,'#6e4a2a');px(c,10,0,5,1,'#c8a870')}],
  reeds:[10,14,c=>{for(let k=0;k<5;k++){const x=1+k*2,h=8+(k*5)%6;px(c,x,14-h,1,h,k%2?'#4a8a3a':'#3a6a2e');if(k%2===0)px(c,x,14-h-2,1,3,'#7a5a3a')}}],
  bucket:[8,8,c=>{px(c,1,2,6,6,RAMP.wood[2]);px(c,1,2,2,6,RAMP.wood[3]);px(c,1,4,6,1,RAMP.stone[1]);px(c,2,0,4,1,'#5a5260');px(c,2,2,4,1,'#3270c4')}],
  // the arcane glade
  runestone:[12,20,c=>{px(c,2,2,8,18,'#6a6a88');px(c,2,2,3,18,'#8a8aa8');px(c,8,2,2,18,'#4e4e6a');px(c,3,0,6,3,'#7a7a98');px(c,5,6,2,1,'#c0a8ff');px(c,4,7,1,3,'#c0a8ff');px(c,6,9,2,1,'#c0a8ff');px(c,5,13,2,2,'#9a7af0')}],
  cauldron:[16,13,c=>{px(c,2,4,12,8,'#3a3440');px(c,2,4,3,8,'#5a5460');px(c,1,3,14,2,'#4a4450');px(c,3,3,10,1,'#7aff8a');px(c,5,1,2,2,'#7aff8a');px(c,9,0,2,2,'#aaffb8');px(c,3,12,2,1,'#2a2430');px(c,11,12,2,1,'#2a2430')}],
  crystals:[14,13,c=>{for(const [x,h,col] of [[1,8,'#9a7af0'],[5,12,'#c0a8ff'],[9,9,'#7a5ae0']]){px(c,x,13-h,4,h,col);px(c,x+1,12-h,2,1,col);px(c,x,13-h,1,h,'#e8dcff');px(c,x+3,13-h,1,h,shade(col,-.3))}}],
  owlpost:[10,24,c=>{px(c,4,8,2,16,RAMP.wood[1]);px(c,2,7,6,2,RAMP.wood[2]);px(c,2,0,6,7,'#8a6a4a');px(c,3,2,1,1,'#f2c94c');px(c,6,2,1,1,'#f2c94c');px(c,4,4,2,1,'#e0a040');px(c,2,0,1,1,'#6a4a2a');px(c,7,0,1,1,'#6a4a2a');px(c,3,5,4,2,'#c8a878')}],
  // the hermit's cave
  stalagmite:[10,18,c=>{for(let y=0;y<18;y++){const hw=Math.max(1,Math.round(y*.28));px(c,5-hw,y,hw*2,1,y%4===0?'#5e544a':'#4c4238');px(c,5-hw,y,1,1,'#7a6c5c')}}],
  orepile:[16,9,c=>{for(let y=0;y<7;y++){const hw=8-y;px(c,8-hw,y+2,hw*2,1,'#5e544a')}for(const [x,y,col] of [[4,6,'#f2c94c'],[8,4,'#e0404a'],[11,6,'#f2c94c'],[6,3,'#4a7ae0'],[9,7,'#3ec070']]){px(c,x,y,2,2,col);px(c,x,y,1,1,'#ffffff')}}],
  gemcluster:[12,11,c=>{px(c,1,7,10,4,'#4c4238');for(const [x,h,col] of [[2,6,'#e0404a'],[5,9,'#4a7ae0'],[8,5,'#3ec070']]){px(c,x,11-h,3,h,col);px(c,x,11-h,1,h,'#ffffff')}}],
});
// what each place is dressed with, inside the town and out in its countryside
Object.assign(DRESS,{
  capital:{back:['barrel','crate','pot','planter','sack'],meadow:['statue','planter','bench','bannerpost','umbrella','flowers','planter'],out:['bannerpost','statue','cart','well','woodpile','flowers']},
  port:{back:['crate','barrel','rope','lobsterpot','sack'],meadow:['anchor','nets','rope','lobsterpot','crate','barrel','rowboat'],out:['nets','rowboat','anchor','lobsterpot','rope','crate']},
  village:{back:['hay','logs','churn','woodpile','flowers'],meadow:['scarecrow','beehive','hen','pumpkins','hay','hen','churn'],out:['scarecrow','hay','beehive','pumpkins','hen','cart']},
  river:{back:['logs','woodpile','bucket','sack','barrel'],meadow:['fishrack','canoe','reeds','bucket','logs','reeds'],out:['reeds','fishrack','canoe','logs','reeds','stump']},
  arcane:{back:['glowshroom','crystals','mushroom','cauldron','glowshroom'],meadow:['runestone','cauldron','crystals','owlpost','glowshroom','runestone'],out:['runestone','crystals','glowshroom','owlpost','mushroom']},
  cave:{back:['rocks','crate','orepile','minecart','torch'],meadow:['stalagmite','orepile','gemcluster','minecart','stalagmite'],out:['stalagmite','gemcluster','stalagmite','orepile','rocks']},
});

