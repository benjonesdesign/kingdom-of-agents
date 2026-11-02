// Kingdom of Agents, part 4 of 4. The parts share one scope and load in order from kingdom.html.
// ===================== transitions: mosaic + iris, the SNES way =====================
const FX={cv:$('fx'),tmp:document.createElement('canvas'),busy:false,skip:null};FX.ctx=FX.cv.getContext('2d');FX.tc=FX.tmp.getContext('2d');
function irisFill(c,cx,cy,r,W,H){const q=8;c.beginPath();c.rect(0,0,W,H);
  if(r>2){const rows=[];for(let y=-r;y<r;y+=q){const m=Math.min(Math.abs(y),Math.abs(y+q)),hw=Math.floor(Math.sqrt(Math.max(0,r*r-m*m))/q)*q;rows.push([cy+y,hw])}
    c.moveTo(cx+rows[0][1],rows[0][0]);for(const [y,hw] of rows){c.lineTo(cx+hw,y);c.lineTo(cx+hw,y+q)}for(let i=rows.length-1;i>=0;i--){const [y,hw]=rows[i];c.lineTo(cx-hw,y+q);c.lineTo(cx-hw,y)}c.closePath()}
  c.fillStyle='#000';c.fill('evenodd')}
function fxFrame(A,s,b,r){const c=FX.ctx,W=innerWidth,H=innerHeight;c.setTransform(FX.d,0,0,FX.d,0,0);c.clearRect(0,0,W,H);
  if(A.src&&(s>1.002||b>1)){const {rect,focus}=A,dx=focus.x+(rect.x-focus.x)*s,dy=focus.y+(rect.y-focus.y)*s,dw=rect.w*s,dh=rect.h*s;
    if(b>1){const sw=Math.ceil(W/b),sh=Math.ceil(H/b);if(FX.tmp.width!==sw||FX.tmp.height!==sh){FX.tmp.width=sw;FX.tmp.height=sh}FX.tc.imageSmoothingEnabled=true;FX.tc.clearRect(0,0,sw,sh);FX.tc.drawImage(A.src,dx/b,dy/b,dw/b,dh/b);c.imageSmoothingEnabled=false;c.drawImage(FX.tmp,0,0,sw*b,sh*b)}
    else{c.imageSmoothingEnabled=false;c.drawImage(A.src,dx,dy,dw,dh)}}
  irisFill(c,A.focus.x,A.focus.y,r,W,H)}
function fxRun(dur,fn){return new Promise(res=>{const t0=performance.now();const st=n=>{const k=Math.min(1,(n-t0)/dur);fn(k);k<1?requestAnimationFrame(st):res()};requestAnimationFrame(st)})}
const far=(p)=>Math.max(...[[0,0],[innerWidth,0],[0,innerHeight],[innerWidth,innerHeight]].map(([x,y])=>Math.hypot(x-p.x,y-p.y)));
function viewShot(focusV){
  if(active){const f=freeRect(),v=active;let focus={x:f.x+f.w/2,y:f.y+f.h/2};return {src:TV.cv,rect:{x:0,y:0,w:innerWidth,h:innerHeight},focus}}
  const r=world.cv.getBoundingClientRect(),T=focusV&&world.towns.find(t=>t.v===focusV);
  const focus=T?{x:r.left+T.cx/world.W*r.width,y:r.top+T.cy/world.H*r.height}:{x:r.left+r.width/2,y:r.top+r.height/2};
  return {src:world.cv,rect:{x:r.left,y:r.top,w:r.width,h:r.height},focus:{x:clamp(focus.x,0,innerWidth),y:clamp(focus.y,0,innerHeight)}}}
async function transition(go,fromV,toV){
  if(FX.busy)return;
  if(reduce){go();return}
  FX.busy=true;FX.d=Math.min(2,devicePixelRatio||1);FX.cv.width=Math.round(innerWidth*FX.d);FX.cv.height=Math.round(innerHeight*FX.d);FX.cv.hidden=false;
  const A=viewShot(fromV),R0=far(A.focus);
  await fxRun(520,k=>{const e=k*k;fxFrame(A,1+1.4*e,1+Math.floor(e*11),R0*(1-k))});
  go();renderNow();await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
  const B=viewShot(toV),R1=far(B.focus);
  await fxRun(560,k=>{const e=(1-k)*(1-k);renderNow();fxFrame(B,1+1.1*e,1+Math.floor(e*11),R1*Math.min(1,k*1.15))});
  FX.ctx.clearRect(0,0,FX.cv.width,FX.cv.height);FX.cv.hidden=true;FX.busy=false;
}
function goHash(h){FX.skip=h;location.hash=h;route(false)}
function travelTo(v){const h='town-'+slug(v.name);if(location.hash.slice(1)===h)return;sfx('whoosh');transition(()=>goHash(h),active?null:v,v)}
function goWorld(){if(!active&&!location.hash.slice(1))return;sfx('whoosh');const left=active===COURT?[...villages.values()].find(x=>x.thKey==='crown'):active;transition(()=>goHash(''),null,left)}
$('backBtn').addEventListener('click',goWorld);
$('packBack').addEventListener('click',()=>{location.hash=''});
// the menu: everything that used to sit around the map
function setMenu(open){const m=$('menu');if(m.hidden===!open)return;if(open){menuView(null);if(premium())achieve('charter')}sfx('blip',.7);m.hidden=!open;$('scrim').hidden=!open;$('menuBtn').setAttribute('aria-expanded',String(open));
  if(open)$('menuClose').focus({preventScroll:true});else if(!$('worldView').hidden)$('menuBtn').focus({preventScroll:true})}
$('menuBtn').addEventListener('click',()=>setMenu(true));$('panelBtn').addEventListener('click',()=>{if(active)setPanel(!panelOpen())});$('townMap').addEventListener('click',()=>{if(!active)return;RMV.fromTown=active!==COURT;openRoadmap(active===COURT?null:active)});$('rmView').addEventListener('click',e=>{if(e.target.id==='rmView')closeRoadmap()});$('townMsg').addEventListener('click',()=>{if(active&&active!==COURT)openMsg(active,active.sel?[active.sel]:[])});$('msgView').addEventListener('click',e=>{if(e.target.id==='msgView')closeMsg()});document.querySelectorAll('.townMenu').forEach(b=>b.addEventListener('click',()=>setMenu(true)));
document.querySelectorAll('.sndBtn').forEach(b=>b.addEventListener('click',()=>setSound(!SND.on)));{const w=(()=>{try{return localStorage.getItem('pl-sound')!=='0'}catch(e){return true}})();setSound(false);SND.want=w;try{localStorage.setItem('pl-sound',w?'1':'0')}catch(e){}}$('menuClose').addEventListener('click',()=>setMenu(false));$('scrim').addEventListener('click',()=>setMenu(false));

addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('msgView').hidden){closeMsg();return}if(e.key==='Escape'&&!$('rmView').hidden){closeRoadmap();return}if(e.key==='Escape'&&!$('menu').hidden){setMenu(false);return}if(e.key!=='Escape'||FX.busy)return;
  if(active){if(!$('dialog').hidden){$('dlgClose').click();return}if(panelOpen()&&!wide()){setPanel(false);return}goWorld()}});

// ---- routing between map, towns, the castle and the pack ----
let active=null,packDone=false;
function showView(name){$('worldView').hidden=name!=='world';$('townView').hidden=name!=='town'&&name!=='court';$('packView').hidden=name!=='pack';TV.view.classList.toggle('court-mode',name==='court');if(name==='court')name='town';document.body.classList.toggle('in-town',name==='town'||name==='world');if(name!=='world')setMenu(false)}
function route(soft){
  const h=location.hash.slice(1);
  const v=h.startsWith('town-')?[...villages.values()].find(x=>'town-'+slug(x.name)===h):null;
  if(v&&v.thKey==='crown'){const fresh=active!==COURT;active=COURT;$('townMsg').hidden=true;setIcon($('panelBtn'),'scroll');$('panelBtn').setAttribute('aria-label','Scroll and decrees');$('townMap').setAttribute('aria-label','Every project’s roadmap');sndScene('court');showView('court');sizeTownCanvas();layoutCourt();
    if(fresh){COURT.sel=null;hushDialog();setPanel(wide())}ensureCam(COURT,fresh);if(fresh){renderMini(v);arrive(v);TV.cv.focus({preventScroll:true})}renderCourt();renderOnboard();return}
  if(v){const fresh=active!==v;active=v;$('townMsg').hidden=false;setIcon($('panelBtn'),'status');$('panelBtn').setAttribute('aria-label','Town status');$('townMap').setAttribute('aria-label','This project’s roadmap');sndScene(TRACKS[v.thKey]?v.thKey:'village');showView('town');sizeTownCanvas();layoutTown(v);
    if(fresh){v.sel=null;v.selTav=false;v.selBar=false;setPanel(wide())}
    ensureCam(v,fresh);if(fresh){renderMini(v);arrive(v);TV.cv.focus({preventScroll:true})}renderStatus(v);renderOnboard();return}
  active=null;sndScene('world');showView('world');layoutWorld();renderOnboard();
}
addEventListener('hashchange',()=>{const h=location.hash.slice(1);if(FX.skip===h){FX.skip=null;return}FX.skip=null;route(false)});
let rT;addEventListener('resize',()=>{clearTimeout(rT);rT=setTimeout(()=>{world.sig=null;if(active){sizeTownCanvas();ensureCam(active,false);active===COURT?layoutCourt():layoutTown(active);if(active.cam.z<fitZoom(active))active.cam.z=fitZoom(active);clampCam(active,active.cam)}else if(!active)layoutWorld()},150)});

// ---- weather picker ----
const WX_LABEL={clear:'CLEAR',partly:'PARTLY CLOUDY',cloudy:'CLOUDY',drizzle:'DRIZZLE',rain:'RAIN',storm:'STORM',snow:'SNOW',fog:'FOG'};
function renderWx(){
  const k=wxKind(),paid=premium();$('wxPick').hidden=!paid;if(!paid){$('wxText').textContent=WX_LABEL[k];$('wxChip').title='Local weather comes with the Royal Charter';return}$('wxChip').title='';
  $('wxText').textContent=(WX_PICK==='auto'?'':'PREVIEW · ')+WX_LABEL[k]+(WX.tempC!=null&&WX_PICK==='auto'?` · ${Math.round(WX.tempC)}°C`:'')+(WX.place&&WX_PICK==='auto'?` · ${WX.place.toUpperCase()}`:'');
  const pick=$('wxPick');pick.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.k===WX_PICK)));
}
for(const k of ['auto','clear','rain','storm','snow','fog']){const b=document.createElement('button');b.type='button';b.dataset.k=k;b.textContent=k==='auto'?'LIVE':k.toUpperCase();
  b.addEventListener('click',()=>{WX_PICK=k;for(const v of villages.values())v.wxs=null;world.wxs=null;renderWx()});$('wxPick').appendChild(b)}

// ===================== loop =====================
let last=performance.now(),acc=0;const T0=performance.now();const FRAME=reduce?1:1/15;
function renderNow(){const t=(performance.now()-T0)/1000;if(active===COURT){drawCourt(t,0);if(COURT.cam)drawTownView(COURT)}else if(active&&active.bg){drawTown(active,t,0);drawTownView(active)}else if(!active)drawWorld(t,0)}
function loop(n){const dt=Math.min(.5,(n-last)/1000);last=n;acc+=dt;
  if(acc>=FRAME){const t=(n-T0)/1000,step=Math.min(acc,.25);
    if(active===COURT)drawCourt(t,step);else if(active&&active.bg){stepTown(active,step,t);drawTown(active,t,step)}else if(!active)drawWorld(t,step);acc=0}
  if(active&&active.cam&&(active===COURT?active.ctx:active.bg)){stepCam(active,reduce?1:dt);drawTownView(active)}
  requestAnimationFrame(loop)}
setInterval(()=>{if(mode!=='sample')return;
  for(const L of lanes){if(L.state==='working'){if(!L.stepsTotal){L.stepsTotal=3+Math.floor(hash(L.id)%5);L.stepsDone=Math.min(L.stepsTotal-1,Math.floor(L.progress/100*L.stepsTotal))}
      if(Math.random()<.12){L.stepsDone=Math.min(L.stepsTotal,L.stepsDone+1);L.updated=new Date().toISOString()}L.progress=L.stepsDone/L.stepsTotal*100;if(L.stepsDone>=L.stepsTotal){L.state='done';L.progress=100;L._doneAt=Date.now()}}
    else if(L.state==='done'&&L._doneAt&&Date.now()-L._doneAt>75000){L.state='working';L.stepsTotal=3+Math.floor(Math.random()*5);L.stepsDone=0;L.progress=0;L.task='Next roadmap item: '+(L.task||'').replace(/^Next roadmap item: /,'');L._doneAt=null;L.updated=new Date().toISOString()}}
  if(active&&active!==COURT)renderStatus(active);renderLabels()},4000);
setInterval(()=>{if(active&&active!==COURT)renderStatus(active);renderLabels()},60000);
$('copyBtn').addEventListener('click',async e=>{const txt=$('shape').textContent;
  try{await navigator.clipboard.writeText(txt);e.target.textContent='COPIED'}catch{const r=document.createRange();r.selectNodeContents($('shape'));const s=getSelection();s.removeAllRanges();s.addRange(r);e.target.textContent='SELECTED, PRESS COPY'}
  setTimeout(()=>e.target.textContent='COPY FORMAT',2000)});

function loadDemo(){mode='sample';REALM=Object.assign({},SAMPLE_REALM);PROJECTS.clear();SAMPLE_PROJECTS.forEach(p=>{const c=cleanProject(slug(p.name),p);PROJECTS.set(c.name.toLowerCase(),c)});applyRealmNames();ROADMAPS=sampleRoadmaps();try{decorateSample(ROADMAPS);sampleCouncil();setTimeout(sampleCross,300)}catch(e){}/* the council's own start-up does this on first load */setLanes(SAMPLE)}
initCourt();initCurio();fbInit();loadDemo();renderWx();renderCourt();requestAnimationFrame(loop);

// ===================== live store =====================
(async()=>{try{
  if(!window.claude||!window.claude.use)return;
  const db=await window.claude.use('db');if(!db)return;STORE=db;LINK.store=true;if(typeof councilLive==='function')councilLive(db);REALM={kingdom:'',castle:'',ruler:'',url:''};applyRealmNames();renderLink();
  // with a store, the scroll and decrees are always the real ones (empty until the overseer writes); the demo keeps its own
  let askRows=[],decreeRows=[];courtLive=true;ASKS=[];DECREES=[];
  const courtFromStore=()=>{if(mode==='sample')return;ASKS=askRows;DECREES=decreeRows;renderCourt();renderLabels();if(active&&active!==COURT)renderMini(active)};
  db.collection('asks').onSnapshot(snap=>{askRows=snap.docs.map(d=>cleanAsk(d.id,d.data()||{}));courtFromStore()},()=>{});
  db.collection('decrees').onSnapshot(snap=>{decreeRows=snap.docs.map(d=>cleanDecree(d.id,d.data()||{}));courtFromStore()},()=>{});
  db.collection('roadmaps').onSnapshot(snap=>{ROADMAPS={};for(const d of snap.docs){const r=d.data()||{};if(r.project)ROADMAPS[String(r.project)]={pct:Number(r.pct),done:Number(r.done),total:Number(r.total),next:String(r.next||'').slice(0,120),steps:cleanSteps(r.steps),raw:Array.isArray(r.steps)?r.steps.slice(0,120):null,report:typeof cleanReport==='function'?cleanReport(r.report):null,spend:typeof cleanSpend==='function'?cleanSpend(r.spend):null}};if(!active)renderLabels();else if(active!==COURT)renderStatus(active);renderRoadmap()},()=>{});
  // everything below arrives together on the first load, so the world is built once from the whole picture
  let laneRows=[],gotLanes=false,gotProjects=false,demoAsked=false;
  let gotCharter=false,CFG_RAW=null,fixing=false;
  // keeps the engine stamp current and gives the kingdom its id; an id lost from the config is taken back from its charter, never minted afresh over one
  const KID_RE=/^k[a-z0-9]{12,40}$/;
  const fixConfig=()=>{const r=CFG_RAW;if(!r||!gotCharter||CHARTER.checking||fixing||!OB.editor||!USER||!r.ruler)return;const ok=KID_RE.test(String(r.kid||''));if(ok&&r.engine===ENGINE_VERSION)return;
    const u={engine:ENGINE_VERSION};if(!ok){const ck=CHARTER.p&&String(CHARTER.p.k||'');u.kid=KID_RE.test(ck)?ck:newKid()}fixing=true;STORE.doc('realm/config').update(u).catch(()=>{}).finally(()=>{fixing=false})};
  const rebuild=()=>{if(!gotLanes||!gotProjects||!gotCharter)return;const real=laneRows.filter(r=>!/overseer|global/i.test(String(r.role||''))&&r.id!=='global-overseer');
    if(real.length||PROJECTS.size){const was=mode;mode='live';demoAsked=false;if(was==='sample'){REALM=Object.assign({},liveRealm);applyRealmNames()}setLanes(laneRows);courtFromStore()}
    else if(!demoAsked){mode='empty';PROJECTS.clear();setLanes(laneRows)}
    updateStatus();renderOnboard();renderCourt()};
  let liveRealm={kingdom:'',castle:'',ruler:'',url:''};
  window.__showDemo=()=>{demoAsked=true;loadDemo();courtLive=false;ASKS=SAMPLE_ASKS.map(a=>({...a}));DECREES=SAMPLE_DECREES.map(d=>({...d}));renderCourt();renderOnboard();route(true)};
  window.__leaveDemo=()=>{demoAsked=false;courtLive=true;REALM=Object.assign({},liveRealm);applyRealmNames();mode='empty';rebuild();courtFromStore()};
  db.doc('realm/config').onSnapshot(d=>{const r=d.data&&d.data();REALM_LOADED=true;if(!r){renderOnboard();return}CFG_RAW=r;fixConfig();{liveRealm=cleanRealm(r);if(mode==='sample')return;REALM=Object.assign({},liveRealm);applyRealmNames();applyPacks();setCharter(CHARTER.code);world.sig=null;renderCourt();renderLabels();renderOnboard();syncSurvey();if(active)route(true);else layoutWorld()}},()=>{REALM_LOADED=true;renderOnboard()});
  // the survey's wording ships with the page, so an update to the page updates what the overseer asks
  db.doc('charter/current').onSnapshot(d=>{const c=d.data&&d.data();setCharter(c&&c.code).then(()=>{if(!gotCharter){gotCharter=true;rebuild()}fixConfig()})},()=>{gotCharter=true;rebuild();fixConfig()});
  db.doc('realm/survey').onSnapshot(d=>{SURVEY_DOC=(d.data&&d.data())||null;SURVEY_SEEN=true;syncSurvey()},()=>{});
  db.doc('realm/progress').onSnapshot(d=>{const p=d.data&&d.data();SURVEY_PROGRESS=p&&Array.isArray(p.asked)?{asked:p.asked.map(String).slice(0,60),answered:(Array.isArray(p.answered)?p.answered:[]).map(String),updated:String(p.updated||'')}:null;renderOnboard()},()=>{});
  db.collection('projects').onSnapshot(snap=>{PROJECTS.clear();for(const d of snap.docs){const p=cleanProject(d.id,d.data()||{});PROJECTS.set(p.name.toLowerCase(),p)}LINK.projects=PROJECTS.size;gotProjects=true;rebuild()},()=>{gotProjects=true;rebuild()});
  db.collection('lanes').onSnapshot(snap=>{const rows=snap.docs.map(d=>Object.assign({id:d.id},d.data()||{}));
    const ov=rows.find(r=>/overseer|global/i.test(String(r.role||''))||r.id==='global-overseer');{const nu=ov&&ov.updated?String(ov.updated):null;if(nu!==LINK.overseer){LINK.prevOverseer=LINK.overseer;LINK.overseer=nu}}LINK.lanes=rows.filter(r=>r!==ov).length;LINK.newest=rows.filter(r=>r!==ov).map(r=>String(r.updated||'')).sort().pop()||null;renderLink();
    laneRows=rows;gotLanes=true;rebuild()},()=>{gotLanes=true;rebuild()});
  db.doc('weather/now').onSnapshot(d=>{const w=d.data&&d.data();if(!w)return;
    const k=String(w.kind||'').toLowerCase();if(WX_LABEL[k])WX.kind=k;WX.tempC=isFinite(Number(w.tempC))?Number(w.tempC):null;WX.place=String(w.place||'').slice(0,30);WX.updated=String(w.updated||'');renderWx()},()=>{});
}catch(e){}})();

// the angry cockerel follows the pointer
TV.cv.addEventListener('pointermove',e=>{const v=active;if(!v||!v.egg||!v.cam||v===COURT)return;const r=TV.cv.getBoundingClientRect();v.egg.ptr=toScene(v,e.clientX-r.left,e.clientY-r.top)});

// one pixel icon set for every icon button: each drawn on the same 9x9 grid, 2px strokes, centred, so they line up and match

function hudIcon(name){const g=PIXICO[name],ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 9 9');svg.setAttribute('width','18');svg.setAttribute('height','18');svg.setAttribute('aria-hidden','true');svg.setAttribute('shape-rendering','crispEdges');svg.classList.add('pixico');
  g.forEach((row,y)=>[...row].forEach((ch,x)=>{if(ch!=='#')return;const r=document.createElementNS(ns,'rect');r.setAttribute('x',x);r.setAttribute('y',y);r.setAttribute('width',1);r.setAttribute('height',1);svg.appendChild(r)}));return svg}
function setIcon(el,name){if(!el)return;const lbl=el.querySelector('.lbl');el.textContent='';el.appendChild(hudIcon(name));if(lbl)el.appendChild(lbl)}
[['menuBtn','menu'],['zIn','plus'],['zOut','minus'],['zFit','fit'],['wzIn','plus'],['wzOut','minus'],['wzFit','fit']].forEach(([id,n])=>setIcon(document.getElementById(id),n));
document.querySelectorAll('.townMenu').forEach(b=>setIcon(b,'menu'));document.querySelectorAll('button.x').forEach(b=>setIcon(b,'close'));
// text arrows in buttons become pixel icons from the set, so every icon shares one style and size
const GLYPH={'▸':'next','◂':'prev','↗':'ext','↻':'shuffle','▴':'up'},GLYPH_RE=/[▸◂↗↻▴]/;
function glyphIcons(root){const els=root.querySelectorAll?root.querySelectorAll('button,a,.hudbtn'):[];for(const el of [root,...els]){if(!el.matches||!el.matches('button,a,.hudbtn'))continue;
  const w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT),hits=[];while(w.nextNode())if(GLYPH_RE.test(w.currentNode.nodeValue))hits.push(w.currentNode);
  for(const t of hits){const parts=t.nodeValue.split(/([▸◂↗↻▴])/),f=document.createDocumentFragment();for(const p of parts){if(!p)continue;if(GLYPH[p]){const s=document.createElement('span');s.className='gi '+(f.childNodes.length?'trail':'lead');s.appendChild(hudIcon(GLYPH[p]));f.appendChild(s)}else f.appendChild(document.createTextNode(p.replace(/^ | $/g,'')))}t.replaceWith(f)}}}
glyphIcons(document.body);new MutationObserver(ms=>{for(const m of ms){if(m.type==='characterData'){const el=m.target.parentElement;if(el)glyphIcons(el.closest('button,a,.hudbtn')||el)}else for(const n of m.addedNodes){if(n.nodeType===1)glyphIcons(n);else if(n.nodeType===3&&n.parentElement&&GLYPH_RE.test(n.nodeValue))glyphIcons(n.parentElement.closest('button,a,.hudbtn')||n.parentElement)}}}).observe(document.body,{childList:true,subtree:true,characterData:true});setIcon($('townMsg'),'mail');setIcon($('townMap'),'roadmap');

// ===================== mini-games: one for each kind of town, played from a game board beside its landmark =====================
// Pure play: nothing here reads or changes the work. The throne room's game is at the banquet table; every other town has a
// little game board next to its landmark (the landmark itself stays an easter egg). Every game is also listed in the menu.
// The free games live in the free places (throne room, capital, village); the rest come with the towns the Royal Charter adds.
var MGW=240,MGH=160;
// [id, name, town kind, where, free, how to play]
var GAME_LIST=[
  ['feast','The Royal Feast','crown','The throne room · the banquet table',true,'Tap a dish on the menu, then tap a table to slide it along. Give every guest what their bubble asks for before they reach your end.'],
  ['fountain','Wishing Fountain','capital','Capital cities · beside the fountain',true,'Tap to stop the arrow, then tap again to set the power. Land your five coins in the rings, and watch the wind.'],
  ['roundup','Round-Up','village','Meadow villages · beside the windmill',true,'Tap or drag to walk the shepherd. Sheep walk away from you, so get behind them and steer them through the gate before dusk. The black sheep follows you instead.'],
  ['treasure','Ship the Treasure','port','Harbour towns · on the dock',false,'Swap two gems next to each other to line up three or more of a kind. Fill the chest to ship it and earn more moves.'],
  ['runes','Rune Echo','arcane','Arcane glades · beside the crystal',false,'Watch the runes light up, then tap them back in the same order. Every round adds one more note.'],
  ['hunter','Treasure Hunter','cave','Hermit’s caves · beside the hoard',false,'Dig every tile that hides no dynamite. A number counts the dynamite in the eight tiles around it. Mark dynamite with the flag (or a long press).'],
  ['hop','River Hop','river','Riverside hamlets · by the water wheel',false,'Hop across on logs, boats, barrels and lily pads, and post a letter in each of the four post boxes. Lily pads sink now and then.']];
var gameDef=id=>{const a=GAME_LIST.find(g=>g[0]===id);return a&&{id:a[0],name:a[1],kind:a[2],where:a[3],free:a[4],how:a[5]}};
var gameFree=id=>{const g=gameDef(id);return !!(g&&(g.free||premium()))};
var gameBests=()=>{const b=eggGet('games',{});return b&&typeof b==='object'?b:{}};
var gamePlayed=id=>(eggGet('gplayed',[])||[]).includes(id);
ACHIEVEMENTS.push(
  ['feast','Fit for a King','Serve 30 guests at one Royal Feast.','The guests at the royal feast are never satisfied. Somebody who could feed thirty of them would get a knighthood.'],
  ['fountain','Fortune Favours','Score 150 at the Wishing Fountain.','They say the capital’s fountain pays out properly if you can land a hundred and fifty worth of coins in its rings.'],
  ['roundup','Good Shepherd','Pen the whole flock, black sheep and all.','Nobody has ever got the black sheep into the pen. It goes the wrong way on purpose, I’m sure of it.'],
  ['treasure','Treasure Fleet','Ship three chests of treasure in one game.','The harbourmaster says three chests out on one tide is the record. Swap those gems quick.'],
  ['runes','Ten Notes Deep','Echo a song of ten runes.','The runes in the glade sing longer songs the better you listen. Ten notes and a fifth stone wakes up, apparently.'],
  ['hunter','Clean Seam','Dig a whole seam without setting off the dynamite.','The miners leave dynamite all over the cave. Clear a whole seam without a bang and they’ll call you a treasure hunter.'],
  ['hop','First Class Post','Post all four letters across the river in one go.','The river post boxes have never all had a letter in at once. Four in a row, that would be something.']);

var MG={id:null,g:null,state:null,raf:0,last:0,c:null,cv:null,from:null,bg:{},hud:''};

// ---------- entry points ----------
// where each town's game board stands, next to its landmark
function gameSpot(v){if(!v||!v.th)return null;const id=(GAME_LIST.find(g=>g[2]===v.thKey)||[])[0];if(!id||v.thKey==='crown')return null;
  let p=null;
  if(v.fount)p={x:v.fount.x+66,y:v.fount.y+10};
  else if(v.thKey==='port'&&v.boat&&v.water)p={x:v.boat.x-42,y:v.water.y-4};
  else if(v.mill)p={x:v.mill.x+26,y:v.mill.y+8};
  else if(v.wheel)p={x:v.wheel.x-30,y:v.wheel.y-8};
  else if(v.crys)p={x:v.crys.x+34,y:v.crys.y+10};
  else if(v.hoard)p={x:v.hoard.x+34,y:v.hoard.y+2};
  if(!p)return null;p.x=clamp(Math.round(p.x),12,v.W-12);p.y=Math.round(p.y);p.id=id;return p}
function gameIcon(c,id,x,y){// a 7x7 sign painted on the board
  const P=(dx,dy,w,h,col)=>px(c,x+dx,y+dy,w,h,col);
  if(id==='feast'){P(1,1,5,4,'#e8c070');P(1,0,5,1,'#fff4d0');P(2,5,3,1,'#c8a060');P(1,6,5,1,'#c8a060')}
  else if(id==='fountain'){disc(c,x+3,y+3,3,'#f0b440');P(2,2,2,2,'#fff0a0')}
  else if(id==='roundup'){P(1,2,5,3,'#f4f0e6');P(0,2,2,2,'#3a3440');P(2,5,1,2,'#3a3440');P(5,5,1,2,'#3a3440')}
  else if(id==='treasure'){P(2,0,3,1,'#ff9aa0');P(1,1,5,2,'#e0404a');P(2,3,3,2,'#c02a3a');P(3,5,1,1,'#8a1a2a')}
  else if(id==='runes'){P(2,0,3,7,'#c890ff');P(3,1,1,5,'#f0e0ff')}
  else if(id==='hunter'){P(1,2,2,5,'#c43a3a');P(4,2,2,5,'#c43a3a');P(3,0,1,2,'#f0b440');P(1,4,5,1,'#5a2a1a')}
  else if(id==='hop'){P(0,1,7,5,'#f4ecd8');P(0,1,1,1,'#a89a7a');P(1,2,1,1,'#a89a7a');P(2,3,3,1,'#a89a7a');P(5,2,1,1,'#a89a7a');P(6,1,1,1,'#a89a7a');P(3,4,1,1,'#c43a3a')}}
function drawGameBoard(c,x,y,id,t){const W=RAMP.wood;ellipseShadow(c,x,y,8,2,.25);
  px(c,x-7,y-18,2,18,W[0]);px(c,x+5,y-18,2,18,W[0]);px(c,x-7,y-18,1,18,W[1]);
  px(c,x-9,y-21,18,13,W[0]);px(c,x-8,y-20,16,11,W[2]);px(c,x-8,y-20,16,1,W[3]);px(c,x-8,y-10,16,1,W[1]);
  px(c,x-6,y-19,12,9,'#2a2238');gameIcon(c,id,x-3,y-18);
  px(c,x-1,y-26,1,5,W[0]);px(c,x,y-26,4,2,'#c43a3a');px(c,x,y-24,3,1,'#c43a3a');
  if(!gamePlayed(id)){const b=Math.round(Math.abs(Math.sin(t*3))*2),yy=y-38-b;px(c,x-2,yy,5,9,'#140f22');px(c,x-1,yy+1,3,7,'#f0b440');px(c,x,yy+2,1,3,'#140f22');px(c,x,yy+6,1,1,'#140f22')}}
function gameTownTap(v,x,y){const s=gameSpot(v);if(!s)return false;if(Math.abs(x-s.x)<11&&y>s.y-30&&y<s.y+4){openGame(s.id);return true}return false}
// the throne room: a banquet table down the left of the hall
var FEAST_TABLE={x:98,y:176,w:22,h:62};
// the banquet table runs down the hall, the feast laid along it
function gameCourtDraw(c,t){const T=FEAST_TABLE,W=RAMP.wood,x=T.x,y=T.y;
  ellipseShadow(c,x+T.w/2,y+T.h+4,T.w/2+3,3,.3);
  for(const [lx,ly] of [[x+2,y+T.h-2],[x+T.w-5,y+T.h-2]])px(c,lx,ly,3,8,W[0]);
  px(c,x,y,T.w,T.h,'#d8ccb0');px(c,x,y,T.w,T.h-3,'#f4ecd8');px(c,x,y,T.w,1,'#ffffff');for(let k=y+4;k<y+T.h-3;k+=8){px(c,x,k,1,2,'#c43a3a');px(c,x+T.w-1,k,1,2,'#c43a3a')}
  const food=[0,1,4,2,5];food.forEach((k,i)=>foodIcon(c,k,x+5,y+2+i*11));
  if(!gamePlayed('feast')){const b=Math.round(Math.abs(Math.sin(t*3))*2),xx=x+T.w/2,yy=y-14-b;px(c,xx-2,yy,5,9,'#140f22');px(c,xx-1,yy+1,3,7,'#f0b440');px(c,xx,yy+2,1,3,'#140f22');px(c,xx,yy+6,1,1,'#140f22')}}
function gameCourtTap(x,y){const T=FEAST_TABLE;if(x>=T.x-4&&x<=T.x+T.w+4&&y>=T.y-16&&y<=T.y+T.h+6){openGame('feast');return true}return false}

// ---------- the frame: one card, one 240x160 canvas, the same controls for every game ----------
function openGame(id){const G=gameDef(id);if(!G)return;MG.from=document.activeElement;MG.id=id;sfx('ok');
  const el=$('gameView');el.hidden=false;$('gTitle').textContent=G.name.toUpperCase();$('gWhere').textContent=G.where.toUpperCase();$('gHow').textContent=G.how;
  MG.cv=$('gCanvas');MG.c=MG.cv.getContext('2d');MG.c.imageSmoothingEnabled=false;
  MG.g=newGame(id);MG.state='intro';showGameCard();
  cancelAnimationFrame(MG.raf);MG.last=performance.now();MG.raf=requestAnimationFrame(mgLoop);
  setTimeout(()=>{const b=$('gPlay');if(b&&!b.hidden)b.focus({preventScroll:true})},60)}
function closeGame(){if(!MG.id)return;cancelAnimationFrame(MG.raf);MG.id=null;MG.g=null;MG.state=null;$('gameView').hidden=true;sfx('blip',.5);
  if(typeof renderMenu==='function')renderMenu();const f=MG.from;MG.from=null;if(f&&f.focus&&document.contains(f))f.focus({preventScroll:true})}
function newGame(id){const g={t:0,score:0,id};GAMES[id].init(g);return g}
function startGame(){if(!MG.id)return;if(!gameFree(MG.id)){goTent();return}
  MG.g=newGame(MG.id);MG.state='play';$('gOver').hidden=true;sfx('arrive',.7);
  const p=eggGet('gplayed',[])||[];if(!p.includes(MG.id)){p.push(MG.id);eggSet('gplayed',p)}MG.cv.focus({preventScroll:true})}
function goTent(){closeGame();if(location.hash){location.hash=''}setTimeout(()=>{if(typeof openTent==='function')openTent()},location.hash?700:350)}
function showGameCard(over){const G=gameDef(MG.id),o=$('gOver'),bests=gameBests(),best=bests[MG.id]||0;o.hidden=false;
  const free=gameFree(MG.id),t=$('gOverT'),s=$('gOverS'),p=$('gPlay');
  if(!free){t.textContent='ROYAL CHARTER';s.textContent=`${G.name} comes with the towns the Royal Charter adds, along with three more games. The Royal Feast, Wishing Fountain and Round-Up are free.`;p.textContent='VISIT THE CURIOSITY TENT'}
  else if(over){t.textContent=over.title;s.textContent=over.line;p.textContent='PLAY AGAIN'}
  else{t.textContent=G.name.toUpperCase();s.textContent=best?`Your best here is ${best}.`:'How to play is just below.';p.textContent='PLAY'}
  {const sh=$('gShare');if(sh)sh.hidden=!(over&&free&&MG.g&&MG.g.score>0)}
  $('gBack').textContent=active===COURT||(active&&active.lanes)?'BACK TO TOWN':'CLOSE'}
function mgEnd(title,line){const g=MG.g,id=MG.id,b=gameBests(),prev=b[id]||0,score=Math.max(0,Math.round(g.score));
  if(score>prev){b[id]=score;eggSet('games',b)}MG.state='over';
  setTimeout(()=>{if(MG.g!==g)return;showGameCard({title:title||`SCORE ${score}`,line:((line?line+' ':'')+(score>prev&&prev?`A new best (it was ${prev}).`:score>prev?'Your first score here.':prev?`Your best is ${prev}.`:'')).trim()});const p=$('gPlay');if(p)p.focus({preventScroll:true})},700)}
function mgLoop(now){if(!MG.id)return;const dt=Math.min(.05,Math.max(0,(now-MG.last)/1000));MG.last=now;const g=MG.g,G=GAMES[MG.id];
  if(MG.state==='play'&&!document.hidden){g.t+=dt;G.step(g,dt)}
  const c=MG.c;c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,MGW,MGH);G.draw(c,g,now/1000);
  const h=G.hud(g);if(h!==MG.hud){MG.hud=h;$('gHud').textContent=h}
  MG.raf=requestAnimationFrame(mgLoop)}
function mgPoint(e){const r=MG.cv.getBoundingClientRect();return {x:(e.clientX-r.left)/r.width*MGW,y:(e.clientY-r.top)/r.height*MGH}}
function mgBg(key,fn){if(MG.bg[key])return MG.bg[key];const [cv,c]=mk(MGW,MGH);fn(c);MG.bg[key]=cv;return cv}
function chime(f,d=.35,vol=.14){if(!SND.on||!SND.ctx)return;const t=SND.ctx.currentTime+.01;tone(f,t,d,{wave:'tri',vol,hold:.3});tone(f*2,t,d*.6,{wave:.25,vol:vol*.25})}
function mgText(c,s,x,y,col){pixText(c,s,x,y,'#140f22');pixText(c,s,x-1,y-1,col||'#ffe07a')}
function mgFloat(g,x,y,txt,col){(g.fl=g.fl||[]).push({x,y,txt:String(txt),col,life:.9})}
function mgFloats(c,g,dt){if(!g.fl)return;g.fl=g.fl.filter(f=>(f.life-=dt||0)>0);for(const f of g.fl){const w=String(f.txt).length*4;mgText(c,f.txt,Math.round(f.x-w/2),Math.round(f.y-(0.9-f.life)*14),f.col)}}

// ---------- the games ----------
var GAMES={};

// ----- The Royal Feast: guests walk along three tables; send each the dish their bubble asks for -----
var FOOD=['Ale','Roast chicken','Bread','Cheese','Pie','Grapes'];
function foodIcon(c,k,x,y){const P=(dx,dy,w,h,col)=>px(c,x+dx,y+dy,w,h,col);
  if(k===0){P(2,3,7,8,'#8a5a2a');P(3,3,5,7,'#c8a060');P(4,5,3,4,'#e8b850');P(9,5,2,1,'#8a5a2a');P(10,5,1,4,'#8a5a2a');P(9,8,2,1,'#8a5a2a');P(1,1,9,3,'#fff4d0');P(2,0,6,1,'#ffffff');P(3,10,5,1,'#5a3a1a')}
  else if(k===1){disc(c,x+7,y+5,4,'#8a4a1a');disc(c,x+7,y+5,3,'#c87a3a');P(6,3,3,2,'#e8a050');P(1,8,4,2,'#f4ecd8');P(0,7,2,2,'#f4ecd8');P(0,10,2,1,'#f4ecd8');P(3,7,1,1,'#c8bca8')}
  else if(k===2){P(1,4,10,6,'#a86a2a');P(2,3,8,6,'#d8a050');P(3,3,6,2,'#f0c070');P(3,5,1,2,'#a86a2a');P(6,5,1,2,'#a86a2a');P(9,5,1,2,'#a86a2a');P(1,10,10,1,'#6a3a1a')}
  else if(k===3){P(1,5,10,5,'#c89a20');P(1,4,10,5,'#f0c840');for(let i=0;i<5;i++)P(1+i*2,3-Math.floor(i/2),10-i*2,1,'#f8dc70');P(3,6,2,2,'#c89a20');P(7,5,1,1,'#c89a20');P(8,7,2,1,'#c89a20')}
  else if(k===4){P(0,8,12,3,'#8a5a2a');P(1,8,10,1,'#a8763a');P(1,4,10,4,'#d89850');P(2,3,8,2,'#f0c070');P(4,5,1,2,'#8a4a1a');P(7,5,1,2,'#8a4a1a');P(5,4,2,1,'#c43a3a')}
  else{for(const [dx,dy] of [[3,3],[6,3],[9,3],[4,6],[7,6],[5,9],[8,8]])disc(c,x+dx,y+dy,2,'#6a2a90');for(const [dx,dy] of [[3,2],[6,2],[9,2],[4,5],[7,5]])P(dx,dy,1,1,'#c890ff');P(6,0,1,2,'#4a8a2a');P(7,0,3,1,'#6ab84a')}}
var FEAST_ROWS=[46,82,118];
var FEAST_GUESTS=()=>[guardSpec(0),guardSpec(1),shepherdSpec(),squireSpec(),courierSpec('#3a8a8a','fa'),courierSpec('#c43a3a','fb'),barmaidSpec('fc'),heraldSpec(),barmaidSpec('fd')];
GAMES.feast={
  init(g){g.lives=3;g.guests=[];g.food=[];g.sel=0;g.row=1;g.next=1.2;g.served=0;g.combo=0;g.specs=FEAST_GUESTS();g.ruler=classFor('overseer','#f2c94c','overseer')},
  hud:g=>`SERVED ${g.served}   LIVES ${g.lives}`,
  send(g,row){g.row=row;if(g.food.filter(f=>f.row===row).length>=2)return;g.food.push({row,k:g.sel,x:200});sfx('whoosh',.5)},
  step(g,dt){// the feast gets busier: guests arrive more often and everyone walks faster as time goes on
    const pace=Math.min(3.2,1+g.t/70),lvl=g.t/150;if(Math.floor(g.t/30)>Math.floor((g.t-dt)/30)){mgFloat(g,120,30,'FASTER','#ff8a6a');sfx('zap',.4)}
    g.next-=dt;if(g.next<=0){const row=Math.floor(Math.random()*3);if(!g.guests.some(q=>q.row===row&&q.x<16)){const kinds=g.t<25?3:g.t<60?4:6;
      g.guests.push({row,x:-12,sp:8+Math.random()*3,want:Math.floor(Math.random()*kinds),spec:g.specs[Math.floor(Math.random()*g.specs.length)],cross:0,happy:0,f:Math.random()*5})}
      g.next=Math.max(.6,3.2-g.t*.028)*(0.75+Math.random()*.5)}
    for(const q of g.guests){q.f+=dt;if(q.happy){q.x-=60*dt;continue}if(q.cross>0)q.cross-=dt;else q.x+=q.sp*pace*dt;
      if(q.x>=194){q.gone=1;g.lives--;g.combo=0;sfx('grumble',.8);mgFloat(g,200,FEAST_ROWS[q.row]-30,'0','#ff7a6a')}}
    for(const f of g.food){f.x-=120*dt;const front=g.guests.filter(q=>q.row===f.row&&!q.happy&&!q.gone).sort((a,b)=>b.x-a.x)[0];
      if(front&&f.x<=front.x+10){f.gone=1;if(front.want===f.k){front.happy=1;g.served++;g.combo++;const pts=10+Math.min(40,(g.combo-1)*5);g.score+=pts;sfx('ok',.7);mgFloat(g,front.x,FEAST_ROWS[f.row]-36,'+'+pts);if(g.served>=30)achieve('feast')}
        else{front.cross=1.2;g.combo=0;sfx('bonk',.7)}}
      else if(f.x<-10)f.gone=1}
    g.food=g.food.filter(f=>!f.gone);g.guests=g.guests.filter(q=>!q.gone&&q.x>-20);
    if(g.lives<=0&&MG.state==='play'){sfx('grumble');mgEnd(`SERVED ${g.served}`,'The feast is over.')}},
  draw(c,g,t){c.drawImage(mgBg('feast',b=>{const S=RAMP.stone;for(let y=0;y<MGH;y+=16)for(let x=0;x<MGW;x+=16)flagTile(b,x,y,hash('ff'+x+','+y),S);
      px(b,0,0,MGW,20,'#2a2438');px(b,0,20,MGW,2,'#140f22');['#c43a3a','#3a8a8a','#e0b040','#3a5ab0','#8a4ac0','#a8763a'].forEach((col,i)=>{const x=12+i*38;px(b,x,1,14,17,col);px(b,x,1,14,2,'#f0d070');px(b,x+5,7,4,4,'#f0d070')});
      px(b,0,132,MGW,28,'#1a1424');px(b,0,132,MGW,2,'#e8e0cc')}),0,0);
    const W=RAMP.wood;
    FEAST_ROWS.forEach((y,r)=>{
      for(const q of g.guests.filter(q=>q.row===r))drawHero(c,Math.round(q.x),y+2,Object.assign({},q.spec,{dir:q.happy?'left':'right',walk:!q.cross,frame:Math.floor(q.f*8),pose:q.cross>0?'talk':'idle',breath:0}));
      if(r===g.row)drawHero(c,224,y+2,Object.assign({},g.ruler,{dir:'left',pose:'idle',item:'mug',frame:0,breath:Math.floor(t*1.5)%2}));
      px(c,8,y-4,196,7,W[1]);px(c,8,y-4,196,2,W[3]);px(c,8,y+3,196,1,W[0]);for(const lx of [12,104,196])px(c,lx,y+4,3,6,W[0]);
      drawProp(c,'barrel',212,y+8);
      if(r===g.row){const a=Math.round(Math.abs(Math.sin(t*5))*2);px(c,206-a,y-1,3,3,'#f0b440')}
      for(const f of g.food.filter(f=>f.row===r))foodIcon(c,f.k,Math.round(f.x-6),y-14);
      for(const q of g.guests.filter(q=>q.row===r&&!q.happy)){const bx=Math.round(q.x)+6,by=y-46;px(c,bx-1,by-1,17,16,'#140f22');px(c,bx,by,15,14,q.cross>0?'#ffd0c8':'#ffffff');px(c,bx-2,by+12,3,2,'#ffffff');foodIcon(c,q.want,bx+1,by+1)}});
    // the menu along the bottom
    FOOD.forEach((n,k)=>{const x=12+k*37,y=136;const on=k===g.sel;px(c,x,y,30,21,on?'#f0b440':'#323c55');px(c,x+2,y+2,26,17,on?'#4a3410':'#0b0f1a');foodIcon(c,k,x+9,y+5);pixText(c,String(k+1),x+3,y+3,on?'#ffe07a':'#6a7088')});
    mgFloats(c,g,MG.state==='play'?1/60:0)},
  tap(g,x,y){if(y>=134){const k=Math.floor((x-10)/37);if(k>=0&&k<6){g.sel=k;sfx('blip',.6)}return}
    const row=y<64?0:y<100?1:2;this.send(g,row)},
  key(g,k){if(k>='1'&&k<='6'){g.sel=+k-1;sfx('blip',.6)}else if(k==='ArrowLeft'){g.sel=(g.sel+5)%6;sfx('blip',.5)}else if(k==='ArrowRight'){g.sel=(g.sel+1)%6;sfx('blip',.5)}
    else if(k==='ArrowUp')g.row=Math.max(0,g.row-1);else if(k==='ArrowDown')g.row=Math.min(2,g.row+1);else if(k===' '||k==='Enter')this.send(g,g.row);else return false;return true}};

// ----- Ship the Treasure: swap gems to make rows of three; fill the chest to ship it -----
var GEMC=8,GEMR=7,GX=14,GY=26,GS=16;
function gemSprite(k){return cached('gem'+k,14,14,c=>{const P=(x,y,w,h,col)=>px(c,x,y,w,h,col);
  if(k===0){P(4,1,6,12,'#c02a3a');P(1,4,12,6,'#c02a3a');P(2,2,10,10,'#e0404a');P(4,3,3,3,'#ff9aa0');P(3,9,8,2,'#8a1a2a')}
  else if(k===1){for(let i=0;i<7;i++){P(7-i,i,i*2,1,'#3a7ae0');P(7-i,13-i,i*2,1,'#2a52a8')}P(1,6,12,2,'#3a7ae0');P(5,3,2,3,'#a8d0ff')}
  else if(k===2){P(2,2,10,10,'#2a9a5a');P(3,3,8,8,'#3ac070');P(4,4,6,6,'#5ae090');P(4,4,2,2,'#c8ffd8');P(2,11,10,1,'#1a6a3a')}
  else if(k===3){disc(c,7,7,6,'#c8901a');disc(c,7,7,5,'#f0c030');disc(c,6,6,2,'#fff0a0')}
  else if(k===4){for(let i=0;i<12;i++)P(7-Math.ceil(i/2),1+i,Math.ceil(i/2)*2+1,1,i>8?'#6a2aa0':'#a050e0');P(6,4,1,4,'#e0c0ff')}
  else{disc(c,7,7,6,'#c8bcb0');disc(c,7,7,5,'#f4f0e8');P(4,4,3,3,'#ffffff');P(8,9,2,2,'#e8d8e0')}})}
function gemMatches(G){const m=new Set();
  for(let r=0;r<GEMR;r++){let run=1;for(let c=1;c<=GEMC;c++){if(c<GEMC&&G[r][c]&&G[r][c-1]&&G[r][c].k===G[r][c-1].k)run++;else{if(run>=3)for(let k=c-run;k<c;k++)m.add(r+','+k);run=1}}}
  for(let c=0;c<GEMC;c++){let run=1;for(let r=1;r<=GEMR;r++){if(r<GEMR&&G[r][c]&&G[r-1][c]&&G[r][c].k===G[r-1][c].k)run++;else{if(run>=3)for(let k=r-run;k<r;k++)m.add(k+','+c);run=1}}}
  return m}
function gemHasMove(G){const sw=(a,b,c2,d)=>{const t=G[a][b];G[a][b]=G[c2][d];G[c2][d]=t};
  for(let r=0;r<GEMR;r++)for(let c=0;c<GEMC;c++)for(const [dr,dc] of [[0,1],[1,0]]){const r2=r+dr,c2=c+dc;if(r2>=GEMR||c2>=GEMC)continue;sw(r,c,r2,c2);const ok=gemMatches(G).size>0;sw(r,c,r2,c2);if(ok)return true}return false}
function gemFill(){let G;do{G=[];for(let r=0;r<GEMR;r++){G.push([]);for(let c=0;c<GEMC;c++){let k;do k=Math.floor(Math.random()*6);while((c>=2&&G[r][c-1].k===k&&G[r][c-2].k===k)||(r>=2&&G[r-1][c].k===k&&G[r-2][c].k===k));G[r].push({k,oy:0})}}}while(!gemHasMove(G));return G}
GAMES.treasure={
  init(g){g.G=gemFill();g.moves=20;g.chest=0;g.ships=0;g.sel=null;g.phase='idle';g.timer=0;g.clear=null;g.chain=0;g.sail=0;g.bad=null},
  hud:g=>`MOVES ${g.moves}   SHIPS ${g.ships}   SCORE ${g.score}`,
  cell(x,y){const c=Math.floor((x-GX)/GS),r=Math.floor((y-GY)/GS);return c>=0&&c<GEMC&&r>=0&&r<GEMR?{r,c}:null},
  swap(g,a,b){if(g.phase!=='idle'||g.moves<=0)return;const G=g.G,t=G[a.r][a.c];G[a.r][a.c]=G[b.r][b.c];G[b.r][b.c]=t;
    if(!gemMatches(G).size){G[b.r][b.c]=G[a.r][a.c];G[a.r][a.c]=t;g.bad={a,b,t:.25};sfx('bonk',.6)}else{g.moves--;g.chain=0;sfx('blip');this.check(g)}g.sel=null},
  check(g){const m=gemMatches(g.G);if(m.size){g.clear=m;g.phase='flash';g.timer=.2;g.chain++}else{g.phase='idle';if(!gemHasMove(g.G)){g.G=gemFill();mgFloat(g,GX+64,GY+56,'SHUFFLE')}
      if(g.moves<=0&&MG.state==='play')mgEnd(`SCORE ${g.score}`,`You shipped ${g.ships} chest${g.ships===1?'':'s'} of treasure.`)}},
  step(g,dt){if(g.bad&&(g.bad.t-=dt)<=0)g.bad=null;if(g.sail>0)g.sail-=dt;
    if(g.phase==='flash'&&(g.timer-=dt)<=0){const G=g.G,n=g.clear.size;g.score+=n*10*g.chain;g.chest+=n;sfx(g.chain>1?'clink':'coin',.6);
      let cx=0,cy=0;for(const k of g.clear){const [r,c]=k.split(',').map(Number);G[r][c]=null;cx+=c;cy+=r}mgFloat(g,GX+cx/n*GS+8,GY+cy/n*GS+4,'+'+n*10*g.chain);
      for(let c=0;c<GEMC;c++){let w=GEMR-1;for(let r=GEMR-1;r>=0;r--)if(G[r][c]){const q=G[r][c];if(w!==r){G[w][c]=q;G[r][c]=null;q.oy-=(w-r)*GS}w--}
        for(let r=w,i=1;r>=0;r--,i++)G[r][c]={k:Math.floor(Math.random()*6),oy:-(w+1)*GS-i*2}}
      if(g.chest>=40){g.chest-=40;g.ships++;g.moves+=5;g.sail=2.2;sfx('fanfare',.7);mgFloat(g,196,40,'+5 MOVES','#7fd0ff');if(g.ships>=3)achieve('treasure')}
      g.clear=null;g.phase='fall'}
    if(g.phase==='fall'){let moving=false;for(const row of g.G)for(const q of row)if(q&&q.oy<0){q.oy=Math.min(0,q.oy+240*dt);moving=true}if(!moving)this.check(g)}},
  draw(c,g,t){c.drawImage(mgBg('treasure',b=>{for(let y=0;y<MGH;y+=16)for(let x=0;x<MGW;x+=16)waterTile(b,x,y,1,hash('tw'+x+','+y));
      const W=RAMP.wood;px(b,GX-5,GY-5,GEMC*GS+10,GEMR*GS+10,W[0]);px(b,GX-4,GY-4,GEMC*GS+8,GEMR*GS+8,W[2]);px(b,GX-4,GY-4,GEMC*GS+8,1,W[3]);
      for(let r=0;r<GEMR;r++)for(let k=0;k<GEMC;k++)px(b,GX+k*GS,GY+r*GS,GS,GS,(r+k)%2?'#2a1c14':'#34241a');
      for(let x=0;x<MGW;x+=16)plankTile(b,x,0,hash('tp'+x));px(b,0,15,MGW,2,'#4a2c1a')}),0,0);
    // the ship and the chest
    const sx=196,bob=Math.round(Math.sin(t*2)),off=g.sail>0?Math.round((2.2-g.sail)*60):0;
    c.save();c.beginPath();c.rect(152,18,88,142);c.clip();
    const hx=sx-24+off,hy=96+bob,W=RAMP.wood;for(let r=0;r<12;r++){const ins=Math.max(0,r-6);px(c,hx+ins,hy+r,48-ins*2,1,r<2?W[3]:W[1])}px(c,hx+22,hy-46,3,46,W[0]);
    px(c,hx+6,hy-42,16,30,'#f4ecd8');px(c,hx+6,hy-42,16,2,'#ffffff');px(c,hx+25,hy-40,14,24,'#f4ecd8');px(c,hx+24,hy-48,8,4,'#c43a3a');
    for(let i=0;i<3;i++)px(c,hx-6+i*20+Math.round(Math.sin(t*3+i)*2),hy+13,10,1,'#a8d0f8');c.restore();
    // chest with its fill
    const cx0=176,cy0=124;px(c,cx0-1,cy0-1,42,24,'#140f22');px(c,cx0,cy0,40,22,'#8a5a2a');px(c,cx0,cy0,40,7,'#a8763a');px(c,cx0+18,cy0+6,4,5,'#f0b440');
    const fill=Math.round(36*Math.min(1,g.chest/40));px(c,cx0+2,cy0+18,36,2,'#2a1c14');px(c,cx0+2,cy0+18,fill,2,'#f0b440');
    const G=g.G;for(let r=0;r<GEMR;r++)for(let k=0;k<GEMC;k++){const q=G[r][k];if(!q)continue;let x=GX+k*GS+1,y=GY+r*GS+1+Math.round(q.oy);
      if(g.bad&&((g.bad.a.r===r&&g.bad.a.c===k)||(g.bad.b.r===r&&g.bad.b.c===k)))x+=Math.round(Math.sin(g.bad.t*60)*2);
      if(g.clear&&g.clear.has(r+','+k)&&Math.floor(t*20)%2)continue;if(y<GY-14)continue;
      c.save();c.beginPath();c.rect(GX,GY,GEMC*GS,GEMR*GS);c.clip();c.drawImage(gemSprite(q.k),x,y);c.restore()}
    if(g.sel){const x=GX+g.sel.c*GS,y=GY+g.sel.r*GS;c.strokeStyle='#ffe07a';c.lineWidth=1;c.strokeRect(x+.5,y+.5,GS-1,GS-1);if(Math.floor(t*4)%2)c.strokeRect(x+1.5,y+1.5,GS-3,GS-3)}
    if(g.cur&&!MG.touch){const x=GX+g.cur.c*GS,y=GY+g.cur.r*GS;c.strokeStyle='rgba(255,255,255,.5)';c.strokeRect(x+.5,y+.5,GS-1,GS-1)}
    mgFloats(c,g,MG.state==='play'?1/60:0)},
  down(g,x,y){g.press=this.cell(x,y);g.px=x;g.py=y},
  up(g,x,y){const a=g.press;g.press=null;if(!a)return;const dx=x-g.px,dy=y-g.py;
    if(Math.hypot(dx,dy)>7){const b=Math.abs(dx)>Math.abs(dy)?{r:a.r,c:a.c+(dx>0?1:-1)}:{r:a.r+(dy>0?1:-1),c:a.c};if(b.r>=0&&b.r<GEMR&&b.c>=0&&b.c<GEMC)this.swap(g,a,b);return}
    if(g.sel&&Math.abs(g.sel.r-a.r)+Math.abs(g.sel.c-a.c)===1)this.swap(g,g.sel,a);else{g.sel=g.sel&&g.sel.r===a.r&&g.sel.c===a.c?null:a;sfx('blip',.4)}},
  key(g,k){g.cur=g.cur||{r:3,c:3};const C=g.cur,d={ArrowUp:[-1,0],ArrowDown:[1,0],ArrowLeft:[0,-1],ArrowRight:[0,1]}[k];
    if(d){const n={r:clamp(C.r+d[0],0,GEMR-1),c:clamp(C.c+d[1],0,GEMC-1)};if(g.sel&&g.sel.r===C.r&&g.sel.c===C.c&&(n.r!==C.r||n.c!==C.c)){this.swap(g,g.sel,n)}g.cur=n;return true}
    if(k===' '||k==='Enter'){g.sel=g.sel&&g.sel.r===C.r&&g.sel.c===C.c?null:{r:C.r,c:C.c};sfx('blip',.4);return true}return false}};

// ----- Rune Echo: repeat the crystal's song -----
var RUNES=[{x:120,y:40,col:'#f0b440',f:659.25,key:'ArrowUp'},{x:66,y:84,col:'#7fd0ff',f:523.25,key:'ArrowLeft'},{x:174,y:84,col:'#c890ff',f:783.99,key:'ArrowRight'},{x:120,y:128,col:'#5ad07a',f:392,key:'ArrowDown'},{x:206,y:132,col:'#ff8a6a',f:880,key:'5'}];
GAMES.runes={
  init(g){g.seq=[];g.phase='wait';g.timer=1;g.lit=-1;g.litT=0;g.idx=0;g.crack=0;g.five=false},
  hud:g=>`ECHO ${g.score}`,
  light(g,i){g.lit=i;g.litT=.32;chime(RUNES[i].f)},
  add(g){if(g.seq.length>=10&&!g.five){g.five=true;mgFloat(g,206,110,'NEW RUNE','#ff8a6a');sfx('zap',.6)}g.seq.push(Math.floor(Math.random()*(g.five?5:4)));g.phase='show';g.idx=0;g.timer=.6},
  step(g,dt){if(g.litT>0&&(g.litT-=dt)<=0)g.lit=-1;if(g.crack>0)g.crack-=dt;
    const gap=Math.max(.32,.62-g.seq.length*.02);
    if(g.phase==='wait'&&(g.timer-=dt)<=0)this.add(g);
    else if(g.phase==='show'&&(g.timer-=dt)<=0){if(g.idx<g.seq.length){this.light(g,g.seq[g.idx]);g.idx++;g.timer=gap}else{g.phase='input';g.idx=0}}
    else if(g.phase==='next'&&(g.timer-=dt)<=0)this.add(g)},
  press(g,i){if(g.phase!=='input'||i>=(g.five?5:4))return;this.light(g,i);
    if(g.seq[g.idx]===i){g.idx++;if(g.idx===g.seq.length){g.score=g.seq.length;if(g.score>=10)achieve('runes');g.phase='next';g.timer=.75;mgFloat(g,120,74,String(g.score),'#ffe07a')}}
    else{g.phase='done';g.crack=1;sfx('zap',.8);sfx('bonk',.6);g.score=g.seq.length-1;if(MG.state==='play')mgEnd(`ECHO ${g.score}`,`The song was ${g.seq.length} notes long.`)}},
  draw(c,g,t){c.drawImage(mgBg('runes',b=>{for(let y=0;y<MGH;y+=16)for(let x=0;x<MGW;x+=16)grassTile(b,x,y,hash('rm'+x+','+y),RAMP.moss);
      for(const [x,y] of [[8,44],[232,40],[10,158],[232,158]])drawPine(b,x-15,y-42,hash('pn'+x)%2);
      for(const [x,y,p] of [[30,60,'glowshroom'],[208,104,'glowshroom'],[90,140,'mushroom'],[160,26,'crystals'],[46,134,'rocks']])drawProp(b,p,x,y);
      {const cx=120,cy=84;for(let yy=-14;yy<=14;yy++){const hw=Math.round(30*Math.sqrt(1-(yy*yy)/196));px(b,cx-hw,Math.round(cy+8+yy*.5),hw*2,1,'rgba(90,60,150,.35)')}}}),0,0);
    // the crystal
    const cx=120,cy=86,glow=g.lit>=0?RUNES[g.lit].col:'#c890ff',pulse=.35+Math.sin(t*2)*.1+(g.lit>=0?.35:0);
    const gr=c.createRadialGradient(cx,cy-12,2,cx,cy-12,40);gr.addColorStop(0,glow+Math.round(pulse*255).toString(16).padStart(2,'0'));gr.addColorStop(1,glow+'00');c.fillStyle=gr;c.fillRect(cx-40,cy-52,80,80);
    px(c,cx-5,cy-30,10,30,g.crack>0?'#5a4a6a':'#8a4ac0');px(c,cx-3,cy-34,6,4,'#a86ad8');px(c,cx-1,cy-36,2,2,'#e0c0ff');px(c,cx-4,cy-28,2,24,'#c890ff');px(c,cx+2,cy-28,2,24,'#6a2aa0');
    if(g.crack>0){px(c,cx-1,cy-26,1,6,'#ffffff');px(c,cx,cy-20,1,5,'#ffffff');px(c,cx-2,cy-15,1,6,'#ffffff')}
    px(c,cx-8,cy,16,3,'#4a4458');
    // the runestones
    RUNES.forEach((R,i)=>{if(i===4&&!g.five)return;const lit=g.lit===i,x=R.x,y=R.y;
      if(lit){const r2=c.createRadialGradient(x,y-12,2,x,y-12,30);r2.addColorStop(0,R.col+'ff');r2.addColorStop(1,R.col+'00');c.fillStyle=r2;c.fillRect(x-30,y-42,60,60)}
      ellipseShadow(c,x,y,10,3,.3);px(c,x-9,y-26,18,26,'#140f22');px(c,x-8,y-25,16,25,'#7a7488');px(c,x-8,y-25,16,2,'#a8a2b4');px(c,x+5,y-23,3,23,'#5a5468');px(c,x-8,y-2,16,2,'#4a4458');
      const gc=lit?'#ffffff':R.col,G=(dx,dy,w,h)=>px(c,x+dx,y+dy,w,h,gc);
      if(i===0){G(-1,-20,2,14);G(-4,-17,8,2)}else if(i===1){G(-4,-20,2,14);G(-2,-14,6,2);G(2,-20,2,6)}else if(i===2){G(-4,-20,8,2);G(-4,-12,8,2);G(-1,-20,2,10)}else if(i===3){G(-4,-20,2,8);G(2,-20,2,8);G(-4,-12,8,2);G(-1,-12,2,6)}else{G(-1,-20,2,14);G(-4,-20,8,2);G(-4,-8,8,2)}
});
    // one pip per note: lit while showing, filled as you echo
    {const n=g.seq.length,w=Math.min(8,Math.floor(200/Math.max(1,n))),x0=Math.round(120-n*w/2);for(let i=0;i<n;i++){const done=g.phase==='input'?i<g.idx:g.phase==='show'?i<g.idx:true;px(c,x0+i*w,152,w-2,4,done?'#ffe07a':'#323c55')}}
    mgFloats(c,g,MG.state==='play'?1/60:0)},
  tap(g,x,y){let best=-1,bd=24;RUNES.forEach((R,i)=>{const d=Math.hypot(x-R.x,y-(R.y-12));if(d<bd){bd=d;best=i}});if(best>=0)this.press(g,best)},
  key(g,k){const i=RUNES.findIndex(R=>R.key===k);if(i>=0){this.press(g,i);return true}return false}};

// ----- Treasure Hunter: minesweeper in the cave -----
var HC=12,HR=8,HX=8,HY=26,HS=16,HMINES=14;
GAMES.hunter={
  init(g){g.cells=[];for(let r=0;r<HR;r++){g.cells.push([]);for(let c=0;c<HC;c++)g.cells[r].push({mine:0,n:0,open:0,flag:0,gem:0})}g.laid=false;g.tool='dig';g.opened=0;g.cur={r:3,c:5};g.boom=0;g.won=0;g.flags=0;g.parts=[]},
  hud:g=>`DYNAMITE ${HMINES-g.flags}   TIME ${Math.floor(g.t)}`,
  lay(g,r0,c0){const C=g.cells;let n=0;while(n<HMINES){const r=Math.floor(Math.random()*HR),c=Math.floor(Math.random()*HC);if(C[r][c].mine||(Math.abs(r-r0)<=1&&Math.abs(c-c0)<=1))continue;C[r][c].mine=1;n++}
    for(let r=0;r<HR;r++)for(let c=0;c<HC;c++){let k=0;for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){const q=C[r+dr]&&C[r+dr][c+dc];if(q&&q.mine)k++}C[r][c].n=k}
    let gems=0;while(gems<6){const r=Math.floor(Math.random()*HR),c=Math.floor(Math.random()*HC),q=C[r][c];if(!q.mine&&!q.gem){q.gem=1;gems++}}g.laid=true},
  dig(g,r,c){if(g.boom||g.won)return;const C=g.cells,q=C[r][c];if(q.flag)return;if(!g.laid)this.lay(g,r,c);
    if(q.open){// digging an open number with its dynamite all flagged clears around it
      let f=0;this.nb(r,c,(a,b)=>{if(C[a][b].flag)f++});if(f===q.n&&q.n>0)this.nb(r,c,(a,b)=>{if(!C[a][b].open&&!C[a][b].flag)this.dig(g,a,b)});return}
    if(q.mine){q.open=1;g.boom=1.4;sfx('pop',1);sfx('thunder',.5);for(let i=0;i<30;i++)g.parts.push({x:HX+c*HS+8,y:HY+r*HS+8,vx:rnd(-60,60),vy:rnd(-80,20),life:rnd(.4,1),col:['#ff7a2a','#ffe07a','#c43a3a','#6a6a7a'][i%4]});
      for(const row of C)for(const x of row)if(x.mine)x.open=1;return}
    const stack=[[r,c]];let n=0;while(stack.length){const [a,b]=stack.pop(),p=C[a][b];if(p.open||p.flag||p.mine)continue;p.open=1;n++;if(p.gem){g.score+=25;sfx('coin',.6);mgFloat(g,HX+b*HS+8,HY+a*HS+2,'+25','#7fd0ff')}
      if(p.n===0)this.nb(a,b,(x,y)=>stack.push([x,y]))}
    g.opened+=n;g.score+=n*5;sfx('pick',.7);
    if(g.opened===HR*HC-HMINES){g.won=1;const bonus=Math.max(0,300-Math.floor(g.t))+200;g.score+=bonus;sfx('fanfare');achieve('hunter');mgFloat(g,HX+HC*HS/2,HY+HR*HS/2,'+'+bonus);
      for(const row of C)for(const x of row)if(x.mine)x.flag=1;if(MG.state==='play')mgEnd(`SCORE ${g.score}`,`You cleared the seam in ${Math.floor(g.t)} seconds.`)}},
  nb(r,c,fn){for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){if(!dr&&!dc)continue;const a=r+dr,b=c+dc;if(a>=0&&a<HR&&b>=0&&b<HC)fn(a,b)}},
  flag(g,r,c){const q=g.cells[r][c];if(q.open||g.boom||g.won)return;q.flag=q.flag?0:1;g.flags+=q.flag?1:-1;sfx('blip',.6)},
  step(g,dt){if(!g.laid)g.t=0;if(g.boom>0){g.boom-=dt;if(g.boom<=0&&MG.state==='play')mgEnd(`SCORE ${g.score}`,'Boom. The dynamite went off.')}
    g.parts=g.parts.filter(p=>(p.life-=dt)>0);for(const p of g.parts){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=160*dt}
    if(g.press&&!g.press.done&&g.t-g.press.t>.45){g.press.done=1;this.flag(g,g.press.r,g.press.c)}},
  draw(c,g,t){c.drawImage(mgBg('hunter',b=>{const R=RAMP.cave;px(b,0,0,MGW,MGH,R[1]);for(let i=0;i<60;i++){const h=hash('hc'+i);px(b,h%MGW,(h>>>8)%MGH,3,2,R[0]);px(b,(h>>>3)%MGW,(h>>>12)%MGH,2,1,R[3])}
      for(const [x,y,p] of [[214,150,'minecart'],[226,60,'torch'],[216,26,'stalagmite']])drawProp(b,p,x,y);px(b,HX-3,HY-3,HC*HS+6,HR*HS+6,'#140f22')}),0,0);
    const C=g.cells,R=RAMP.cave,sh=g.boom>.9?Math.round(Math.sin(t*80)*2):0;
    for(let r=0;r<HR;r++)for(let k=0;k<HC;k++){const q=C[r][k],x=HX+k*HS+sh,y=HY+r*HS;
      if(q.open){px(c,x,y,HS,HS,'#1a1420');px(c,x,y,HS,1,'#0e0a12');px(c,x,y,1,HS,'#0e0a12');
        if(q.mine){px(c,x+4,y+4,3,9,'#c43a3a');px(c,x+8,y+4,3,9,'#c43a3a');px(c,x+4,y+8,7,1,'#5a2a1a');px(c,x+9,y+1,1,3,'#ffe07a');if(Math.floor(t*10)%2)px(c,x+9,y,2,2,'#ff9a3c')}
        else if(q.gem){c.drawImage(gemSprite(hash('g'+r+k)%6),x+1,y+1);if(q.n)pixText(c,String(q.n),x+11,y+1,['','#7fd0ff','#5ad07a','#f0b440','#ff8a50','#e05050','#c890ff','#ffffff','#ffffff'][q.n])}
        else if(q.n)pixText(c,String(q.n),x+6,y+5,['','#7fd0ff','#5ad07a','#f0b440','#ff8a50','#e05050','#c890ff','#ffffff','#ffffff'][q.n])}
      else{px(c,x,y,HS,HS,R[1]);px(c,x+1,y+1,HS-2,HS-2,R[2]);px(c,x+2,y+2,HS-5,3,R[3]);px(c,x+HS-3,y+3,2,HS-5,R[0]);const h=hash('hr'+r+','+k);px(c,x+3+h%8,y+7+(h>>>4)%5,2,2,R[0]);
        if(q.flag){px(c,x+6,y+3,1,10,'#e8e0cc');px(c,x+7,y+3,5,4,'#e05050');px(c,x+4,y+12,6,1,'#140f22')}}}
    if(!MG.touch&&g.cur){const x=HX+g.cur.c*HS,y=HY+g.cur.r*HS;c.strokeStyle='#ffe07a';c.lineWidth=1;c.strokeRect(x+.5,y+.5,HS-1,HS-1)}
    // the tools
    for(const [tool,y] of [['dig',HY+8],['flag',HY+48]]){const on=g.tool===tool,x=204;px(c,x,y,30,30,on?'#f0b440':'#323c55');px(c,x+2,y+2,26,26,on?'#4a3410':'#0b0f1a');
      if(tool==='dig'){px(c,x+14,y+8,2,16,'#a8763a');px(c,x+7,y+6,16,3,'#c4cad4');px(c,x+6,y+8,3,2,'#c4cad4');px(c,x+21,y+8,3,2,'#c4cad4')}else{px(c,x+11,y+6,2,18,'#e8e0cc');px(c,x+13,y+6,9,7,'#e05050');px(c,x+8,y+23,9,2,'#e8e0cc')}}
    for(const p of g.parts)px(c,p.x,p.y,2,2,p.col);
    mgFloats(c,g,MG.state==='play'?1/60:0)},
  cellAt(x,y){const c=Math.floor((x-HX)/HS),r=Math.floor((y-HY)/HS);return c>=0&&c<HC&&r>=0&&r<HR?{r,c}:null},
  down(g,x,y,btn){if(x>=200){if(y>=HY+4&&y<HY+42)g.tool='dig';else if(y>=HY+44&&y<HY+82)g.tool='flag';sfx('blip',.5);return}
    const q=this.cellAt(x,y);if(!q)return;g.cur=q;if(btn===2){this.flag(g,q.r,q.c);return}g.press={r:q.r,c:q.c,t:g.t,done:0}},
  up(g){const p=g.press;g.press=null;if(!p||p.done)return;if(g.tool==='flag')this.flag(g,p.r,p.c);else this.dig(g,p.r,p.c)},
  key(g,k){const d={ArrowUp:[-1,0],ArrowDown:[1,0],ArrowLeft:[0,-1],ArrowRight:[0,1]}[k];if(d){g.cur={r:clamp(g.cur.r+d[0],0,HR-1),c:clamp(g.cur.c+d[1],0,HC-1)};return true}
    if(k===' '||k==='Enter'){this.dig(g,g.cur.r,g.cur.c);return true}if(k==='f'){this.flag(g,g.cur.r,g.cur.c);return true}return false}};

// ----- River Hop: cross on whatever's floating and post a letter in each box -----
var HOP_LANES=[// row, direction, speed, kind, piece width, group size, gap
  [2,1,16,'log',56,1,40],[3,-1,20,'pad',14,3,46],[4,1,28,'boat',28,1,52],[5,-1,15,'log',72,1,44],[6,1,24,'barrel',14,2,54],[7,-1,19,'crate',14,3,40]];
var HOP_BOXES=[30,90,150,210];
var hopY=r=>r*16;
GAMES.hop={
  init(g){g.lives=3;g.level=1;g.boxes=[0,0,0,0];g.objs=[];g.best=8;this.reset(g);
    for(const [row,dir,sp,kind,w,n,gap] of HOP_LANES){const span=w*n+gap,count=Math.ceil((MGW+2*span)/span),L=count*span,x0=-span+(hash('hl'+row)%span);for(let i=0;i<count;i++)g.objs.push({row,dir,sp,kind,w:w*n,n,L,x:x0+i*span,sink:kind==='pad'&&i%2===0,ph:Math.random()*6})}},
  reset(g){g.p={x:120,row:8,hop:0,dir:'up',from:null};g.best=8},
  hud:g=>`LEVEL ${g.level}   LIVES ${g.lives}   SCORE ${g.score}`,
  sunk:(o,t)=>o.sink&&Math.sin(t*1.3+o.ph)<-.55,
  under(g,x,row){return g.objs.find(o=>o.row===row&&x>=o.x+2&&x<=o.x+o.w-2)},
  die(g,how){g.lives--;g.dead=.9;g.deadHow=how;sfx(how==='splash'?'splash':'bonk',.9);if(g.lives<=0&&MG.state==='play'){mgEnd(`SCORE ${g.score}`,`You posted ${g.posted||0} letter${g.posted===1?'':'s'}.`)}},
  move(g,dx,dy){if(g.dead>0||g.p.hop>0||MG.state!=='play')return;const p=g.p;p.dir=dy<0?'up':dy>0?'down':dx<0?'left':'right';
    const nr=clamp(p.row+dy,1,9),nx=clamp(p.x+dx*16,8,MGW-8);p.from={x:p.x,row:p.row};p.row=nr;p.x=nx;p.hop=.12;sfx('step',.8);
    if(nr<g.best){g.best=nr;g.score+=10}},
  land(g){const p=g.p;if(p.row===1){const i=HOP_BOXES.findIndex(bx=>Math.abs(bx-p.x)<12);
      if(i<0||g.boxes[i]){this.die(g,'bump');return}
      g.boxes[i]=1;g.posted=(g.posted||0)+1;g.score+=50;sfx('ok');mgFloat(g,HOP_BOXES[i],8,'+50');
      if(g.boxes.every(Boolean)){g.score+=200;g.level++;g.boxes=[0,0,0,0];sfx('fanfare',.7);mgFloat(g,120,40,'+200','#7fd0ff');achieve('hop');for(const o of g.objs)o.sp*=1.15}
      this.reset(g);return}
    if(p.row>=2&&p.row<=7){const o=this.under(g,p.x,p.row);if(!o||this.sunk(o,g.t))this.die(g,'splash')}},
  step(g,dt){for(const o of g.objs){o.x+=o.dir*o.sp*dt;if(o.dir>0&&o.x>MGW)o.x-=o.L;if(o.dir<0&&o.x+o.w<0)o.x+=o.L}
    if(g.dead>0){g.dead-=dt;if(g.dead<=0&&g.lives>0)this.reset(g);return}
    const p=g.p;if(p.hop>0){p.hop-=dt;if(p.hop<=0){p.hop=0;this.land(g)}return}
    if(p.row>=2&&p.row<=7){const o=this.under(g,p.x,p.row);if(!o||this.sunk(o,g.t)){this.die(g,'splash');return}p.x+=o.dir*o.sp*dt;if(p.x<2||p.x>MGW-2)this.die(g,'splash')}},
  draw(c,g,t){c.drawImage(mgBg('hop',b=>{for(let x=0;x<MGW;x+=16){grassTile(b,x,0,hash('h0'+x));grassTile(b,x,16,hash('h1'+x));grassTile(b,x,128,hash('h8'+x));grassTile(b,x,144,hash('h9'+x))}
      for(let y=32;y<128;y+=16)for(let x=0;x<MGW;x+=16)waterTile(b,x,y,1,hash('hw'+x+','+y));px(b,0,31,MGW,1,'#3a5a2a');px(b,0,128,MGW,1,'#3a5a2a');
      for(let x=4;x<MGW;x+=26)drawBush(b,x,-2,hash('hb'+x)%3,0);for(const [x,p] of [[12,'reeds'],[60,'flowers'],[110,'stump'],[172,'reeds'],[226,'flowers']])drawProp(b,p,x,158)}),0,0);
    // post boxes
    HOP_BOXES.forEach((bx,i)=>{px(c,bx-1,20,2,10,'#5a3a22');px(c,bx-5,13,10,8,'#140f22');px(c,bx-4,14,8,6,'#c43a3a');px(c,bx-4,14,8,1,'#e05a50');px(c,bx-2,16,4,1,'#140f22');if(g.boxes[i]){px(c,bx+4,8,1,7,'#e8e0cc');px(c,bx+5,8,4,3,'#f0b440')}});
    for(let k=0;k<14;k++){const h=hash('rp'+k),x=(h%MGW+t*((h>>>4)%2?8:-8)+MGW)%MGW,y=36+(h>>>8)%88;px(c,Math.round(x),y,4,1,'rgba(200,230,255,.35)')}
    const W=RAMP.wood;
    for(const o of g.objs){const y=hopY(o.row),x=Math.round(o.x);
      if(o.kind==='log'){px(c,x,y+3,o.w,10,'#7a4a2a');px(c,x,y+3,o.w,2,'#a8763a');px(c,x,y+11,o.w,2,'#4a2c1a');px(c,x,y+5,3,6,'#c89a5a');px(c,x+o.w-3,y+5,3,6,'#c89a5a');for(let k=10;k<o.w-6;k+=13)px(c,x+k,y+7,5,1,'#5a3a20')}
      else if(o.kind==='pad'){const sunk=this.sunk(o,g.t),warn=o.sink&&Math.sin(g.t*1.3+o.ph)<-.2;for(let i=0;i<o.n;i++){const px0=x+i*14+7,py0=y+8;if(sunk){px(c,px0-3,py0,6,1,'rgba(200,230,255,.5)');continue}disc(c,px0,py0,6,warn?'#3a7a3a':'#4a9a4a');disc(c,px0,py0,5,warn?'#4a8a3a':'#6ab84a');px(c,px0,py0-6,1,6,'#3a7a3a');if(i===1)px(c,px0+2,py0-3,2,2,'#f0a0c0')}}
      else if(o.kind==='boat'){const sp=propSprite('rowboat');c.save();if(o.dir<0){c.translate(x*2+o.w,0);c.scale(-1,1)}c.drawImage(sp,x,y+3);c.restore()}
      else for(let i=0;i<o.n;i++)c.drawImage(propSprite(o.kind),x+i*14,y+1)}
    const p=g.p;if(!(g.dead>0&&g.deadHow==='splash')){let x=p.x,y=hopY(p.row);if(p.hop>0&&p.from){const f=1-p.hop/.12;x=p.from.x+(p.x-p.from.x)*f;y=hopY(p.from.row)+(hopY(p.row)-hopY(p.from.row))*f-Math.sin(f*Math.PI)*5}
      c.drawImage(miniSprite(courierSpec('#a86ad0','hop'),p.dir,Math.floor(t*6)),Math.round(x-9),Math.round(y-6))}
    else{const k=1-g.dead/.9,x=p.x,y=hopY(p.row)+8;for(let i=0;i<3;i++)px(c,Math.round(x-1-i*3*k),Math.round(y-i*2*k),2,1,'rgba(220,240,255,.8)');for(let i=0;i<3;i++)px(c,Math.round(x+1+i*3*k),Math.round(y-i*2*k),2,1,'rgba(220,240,255,.8)')}
    mgFloats(c,g,MG.state==='play'?1/60:0)},
  tap(g,x,y){const p=g.p,dx=x-p.x,dy=y-(hopY(p.row)+6);if(Math.abs(dx)<6&&Math.abs(dy)<6)return;if(Math.abs(dy)>=Math.abs(dx))this.move(g,0,dy<0?-1:1);else this.move(g,dx<0?-1:1,0)},
  key(g,k){const d={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0]}[k];if(d){this.move(g,d[0],d[1]);return true}return false}};

// ----- Round-Up: herd the flock into the pen before dusk -----
var PEN={x:166,y:14,w:66,h:58,g0:22,g1:56};
function penInside(x,y){return x>PEN.x+2&&x<PEN.x+PEN.w-2&&y>PEN.y+2&&y<PEN.y+PEN.h-2}
GAMES.roundup={
  init(g){g.sheep=[];const spots=[[40,50],[70,120],[110,90],[30,140],[140,130],[96,40],[60,80]];spots.forEach(([x,y],i)=>g.sheep.push({x:x+rnd(-6,6),y:y+rnd(-6,6),vx:0,vy:0,black:i===6,face:1,wt:Math.random()*2,wx:0,wy:0}));
    g.sh={x:20,y:100,tx:20,ty:100,dir:'right',walk:0};g.time=90;g.done=0},
  hud:g=>`PENNED ${g.sheep.filter(s=>penInside(s.x,s.y)).length} / 7   DUSK ${Math.max(0,Math.ceil(g.time))}`,
  // fences block anything crossing the pen's walls, except through the gate on its left side
  wall(x0,y0,x1,y1){const inA=penInside(x0,y0)||(x0>PEN.x-2&&x0<PEN.x+PEN.w+2&&y0>PEN.y-2&&y0<PEN.y+PEN.h+2),inB=x1>PEN.x-2&&x1<PEN.x+PEN.w+2&&y1>PEN.y-2&&y1<PEN.y+PEN.h+2;
    if(inA===inB)return false;// crossing a wall: only allowed through the gate gap, moving across the left wall
    const ly=(y0+y1)/2;return !(Math.min(x0,x1)<=PEN.x+3&&Math.max(x0,x1)>=PEN.x-3&&ly>PEN.y+PEN.g0&&ly<PEN.y+PEN.g1)},
  // a penned sheep stays penned: it never wanders back out through the gate
  mv(o,dx,dy){const nx=clamp(o.x+dx,6,MGW-6),ny=clamp(o.y+dy,10,MGH-4);if(o.wt!=null&&penInside(o.x,o.y)){if(penInside(nx,ny)){o.x=nx;o.y=ny}else if(penInside(nx,o.y))o.x=nx;else if(penInside(o.x,ny))o.y=ny;return}
    if(!this.wall(o.x,o.y,nx,ny)){o.x=nx;o.y=ny;return}
    if(!this.wall(o.x,o.y,nx,o.y))o.x=nx;else if(!this.wall(o.x,o.y,o.x,ny))o.y=ny},
  step(g,dt){g.time-=dt;const S=g.sh,dx=S.tx-S.x,dy=S.ty-S.y,d=Math.hypot(dx,dy);
    if(g.keys){const kx=(g.keys.ArrowRight?1:0)-(g.keys.ArrowLeft?1:0),ky=(g.keys.ArrowDown?1:0)-(g.keys.ArrowUp?1:0);if(kx||ky){S.tx=S.x+kx*20;S.ty=S.y+ky*20}}
    if(d>1.5){const sp=Math.min(d,54*dt);this.mv(S,dx/d*sp,dy/d*sp);S.walk=1;S.dir=Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up')}else S.walk=0;
    for(const s of g.sheep){const ex=s.x-S.x,ey=s.y-S.y,ed=Math.hypot(ex,ey)||1,inside=penInside(s.x,s.y);let vx=0,vy=0;
      if(!inside&&ed<34){const k=(s.black?-1:1)*(12+22*(1-ed/34));vx=ex/ed*k;vy=ey/ed*k;if(s.black&&ed<12){vx=0;vy=0}}
      else{s.wt-=dt;if(s.wt<=0){s.wt=1+Math.random()*2.5;const a=Math.random()*6.28,m=Math.random()<.4?0:5;s.wx=Math.cos(a)*m;s.wy=Math.sin(a)*m}vx=s.wx;vy=s.wy}
      for(const o of g.sheep){if(o===s)continue;const ox=s.x-o.x,oy=s.y-o.y,od=Math.hypot(ox,oy);if(od>0&&od<9){vx+=ox/od*14;vy+=oy/od*14}}
      s.vx+=(vx-s.vx)*Math.min(1,dt*6);s.vy+=(vy-s.vy)*Math.min(1,dt*6);if(Math.abs(s.vx)>.5)s.face=s.vx>0?1:-1;this.mv(s,s.vx*dt,s.vy*dt);
      if(!s.was&&penInside(s.x,s.y)){s.was=1;sfx('baa',.6)}}
    const n=g.sheep.filter(s=>penInside(s.x,s.y)).length;g.score=n*100;
    if(MG.state==='play'&&!g.done&&(n===7||g.time<=0)){g.done=1;if(n===7){g.score+=Math.ceil(g.time)*10;achieve('roundup');sfx('cheer');mgEnd(`SCORE ${g.score}`,'The whole flock is home.')}else{sfx('hoot',.8);mgEnd(`SCORE ${g.score}`,`Dusk fell with ${n} of 7 sheep in the pen.`)}}},
  draw(c,g,t){c.drawImage(mgBg('roundup',b=>{for(let y=0;y<MGH;y+=16)for(let x=0;x<MGW;x+=16)grassTile(b,x,y,hash('ru'+x+','+y));
      for(const [x,y,p] of [[24,22,'hay'],[120,20,'flowers'],[200,110,'flowers'],[90,150,'flowers'],[150,98,'stump'],[12,96,'flowers'],[220,150,'hay']])drawProp(b,p,x,y);
      const R='#a8763a',P='#6a4228',F=PEN;for(let x=F.x;x<=F.x+F.w;x+=2){px(b,x,F.y,2,1,R);px(b,x,F.y+3,2,1,R);px(b,x,F.y+F.h,2,1,R);px(b,x,F.y+F.h+3,2,1,R)}
      for(let y=F.y;y<=F.y+F.h+3;y+=2)px(b,F.x+F.w,y,1,2,R);for(let y=F.y;y<=F.y+F.g0;y+=2)px(b,F.x,y,1,2,R);for(let y=F.y+F.g1;y<=F.y+F.h+3;y+=2)px(b,F.x,y,1,2,R);
      for(const [x,y] of [[F.x,F.y],[F.x+F.w,F.y],[F.x,F.y+F.h],[F.x+F.w,F.y+F.h],[F.x,F.y+F.g0],[F.x,F.y+F.g1]])px(b,x-1,y-3,3,8,P);
      drawProp(b,'hay',F.x+F.w/2,F.y+F.h-4)}),0,0);
    const items=g.sheep.map(s=>({y:s.y,f:()=>{const x=Math.round(s.x),y=Math.round(s.y),body=s.black?'#3a3440':'#f4f0e6',top=s.black?'#5a5466':'#ffffff',head=s.black?'#1a1420':'#3a3440',leg=Math.floor(t*8+s.x)%2&&Math.hypot(s.vx,s.vy)>3;
      ellipseShadow(c,x,y,5,2,.25);px(c,x-5,y-7,10,6,body);px(c,x-4,y-8,8,1,top);px(c,x-3,y-1,1,leg?2:1,head);px(c,x+2,y-1,1,leg?1:2,head);const hx=s.face>0?x+4:x-7;px(c,hx,y-8,3,4,head)}}));
    items.push({y:g.sh.y,f:()=>c.drawImage(miniSprite(shepherdSpec(),g.sh.dir,g.sh.walk?Math.floor(t*8):0),Math.round(g.sh.x-9),Math.round(g.sh.y-20))});
    items.sort((a,b)=>a.y-b.y).forEach(i=>i.f());
    if(MG.state==='play'){const k=clamp(1-g.time/90);c.fillStyle=`rgba(40,20,70,${(k*k*.5).toFixed(3)})`;c.fillRect(0,0,MGW,MGH)}
    if(g.sh.tx!=null&&Math.hypot(g.sh.tx-g.sh.x,g.sh.ty-g.sh.y)>4){px(c,Math.round(g.sh.tx)-2,Math.round(g.sh.ty),5,1,'rgba(255,224,122,.8)');px(c,Math.round(g.sh.tx),Math.round(g.sh.ty)-2,1,5,'rgba(255,224,122,.8)')}},
  down(g,x,y){g.drag=1;g.sh.tx=x;g.sh.ty=y},move(g,x,y){if(g.drag){g.sh.tx=x;g.sh.ty=y}},up(g){g.drag=0},
  key(g,k,up){if(!k.startsWith('Arrow'))return false;g.keys=g.keys||{};g.keys[k]=!up;if(up){g.sh.tx=g.sh.x;g.sh.ty=g.sh.y}return true}};

// ----- Wishing Fountain: stop the arrow for direction, then the meter for power -----
var FNT={cx:120,cy:66,rx:86,ry:40};
GAMES.fountain={
  init(g){g.coins=5;g.phase='dir';g.dir=0;g.pow=0;g.ph=0;g.rings=[];g.wind=0;g.coin=null;g.hits50=0;this.setup(g)},
  setup(g){g.wind=Math.round(rnd(-1,1)*4)/4;const R=[];for(const [v,r] of [[10,14],[25,10],[50,6]]){let x,y,ok,n=0;do{x=FNT.cx+rnd(-60,60);y=FNT.cy+rnd(-18,22);ok=Math.hypot((x-FNT.cx)/FNT.rx,(y-FNT.cy)/FNT.ry)<.8&&Math.hypot(x-FNT.cx,(y-FNT.cy+6)*2)>26&&R.every(q=>Math.hypot(q.x-x,(q.y-y)*1.6)>q.r+r+8)}while(!ok&&++n<200);R.push({v,r,x,y})}g.rings=R;g.phase='dir';g.ph=Math.random()*3},
  hud:g=>`COINS ${g.coins}   WIND ${g.wind<0?'◀'.repeat(Math.round(-g.wind*4)):g.wind>0?'▶'.repeat(Math.round(g.wind*4)):'CALM'}   SCORE ${g.score}`,
  target(g){const a=g.dir*.95,d=24+g.pow*96;return {x:120+Math.sin(a)*d*1.25+g.wind*16*(.4+g.pow),y:128-Math.cos(a)*d*.78}},
  tap(g){if(g.phase==='dir'){g.phase='pow';g.ph=0;sfx('blip',.7)}else if(g.phase==='pow'){g.phase='fly';g.fly=0;const T=this.target(g);g.coin={x0:120,y0:126,x1:T.x,y1:T.y};sfx('whoosh',.5)}},
  key(g,k){if(k===' '||k==='Enter'){this.tap(g);return true}return false},
  step(g,dt){g.ph+=dt;if(g.phase==='dir')g.dir=Math.sin(g.ph*3.6);else if(g.phase==='pow')g.pow=(1-Math.cos(g.ph*4.2))/2;
    else if(g.phase==='fly'){g.fly+=dt/.85;if(g.fly>=1){const C=g.coin,ring=g.rings.find(R=>Math.hypot((C.x1-R.x)/R.r,(C.y1-R.y)/(R.r*.55))<=1),inW=Math.hypot((C.x1-FNT.cx)/(FNT.rx-6),(C.y1-FNT.cy)/(FNT.ry-4))<1;
        let pts=0;if(ring){pts=ring.v;sfx('coin');if(ring.v===50)g.hits50++}else if(inW){sfx('splash',.6)}else sfx('clink',.8);
        g.score+=pts;mgFloat(g,C.x1,C.y1-6,pts?'+'+pts:'0',pts?'#ffe07a':'#9ea4b6');g.splash={x:C.x1,y:C.y1,t:.6,water:inW||!!ring};g.coins--;g.phase='land';g.ph=0}}
    else if(g.phase==='land'&&g.ph>1){if(g.coins<=0){if(g.score>=150)achieve('fountain');if(MG.state==='play')mgEnd(`SCORE ${g.score}`,g.score>=150?'The fountain grants your wish.':`${g.hits50} coin${g.hits50===1?'':'s'} in the 50 ring.`)}else this.setup(g)}
    if(g.splash&&(g.splash.t-=dt)<=0)g.splash=null},
  draw(c,g,t){c.drawImage(mgBg('fountain',b=>{for(let y=0;y<MGH;y+=16)for(let x=0;x<MGW;x+=16)cobbleTile(b,x,y,hash('fc'+x+','+y),RAMP.cobble);
      const {cx,cy,rx,ry}=FNT;for(let yy=-ry-5;yy<=ry+5;yy++){const hw=Math.round((rx+6)*Math.sqrt(Math.max(0,1-(yy*yy)/((ry+5)*(ry+5)))));px(b,cx-hw,cy+yy,hw*2,1,yy<0?'#c8c2b6':'#a8a298')}
      for(let yy=-ry;yy<=ry;yy++){const hw=Math.round(rx*Math.sqrt(1-(yy*yy)/(ry*ry)));px(b,cx-hw,cy+yy,hw*2,1,yy<-ry+3?'#2a5aa0':'#3a7ac8')}
      for(let k=0;k<26;k++){const h=hash('fw'+k);const x=cx-rx+20+h%(rx*2-40),y=cy-ry+8+(h>>>8)%(ry*2-14);px(b,x,y,4,1,'#6aa8e8')}
      px(b,cx-8,cy-6,16,10,'#8a8478');px(b,cx-8,cy-6,16,2,'#c8c2b6');px(b,cx-4,cy-26,8,22,'#b8b2a6');px(b,cx-4,cy-26,2,22,'#d8d2c6');px(b,cx-7,cy-30,14,5,'#c8c2b6');
      for(const [x,y,p] of [[14,150,'bench'],[226,150,'planter'],[16,24,'planter'],[226,24,'lamp']])drawProp(b,p,x,y)}),0,0);
    const {cx,cy}=FNT;
    // the spout
    for(let i=0;i<6;i++){const k=(t*1.6+i/6)%1,a=i%2?1:-1;px(c,Math.round(cx+a*k*14),Math.round(cy-32+k*k*26-k*10),2,2,'rgba(200,230,255,.85)')}
    // a pennant on the statue shows the wind
    px(c,cx,cy-40,1,10,'#5a3a22');const wl=Math.round(Math.abs(g.wind)*8)+2,wd=g.wind<0?-1:1;for(let i=0;i<wl;i++)px(c,cx+wd*(i+1),cy-40+Math.round(Math.sin(t*8+i)*.6),1,3-Math.floor(i/(wl/2+1)),'#c43a3a');
    // the rings
    for(const R of g.rings){c.strokeStyle='#140f22';c.lineWidth=2;c.beginPath();c.ellipse(R.x,R.y+1,R.r,R.r*.55,0,0,7);c.stroke();c.strokeStyle=R.v===50?'#f0b440':R.v===25?'#c890ff':'#f4ecd8';c.beginPath();c.ellipse(R.x,R.y,R.r,R.r*.55,0,0,7);c.stroke();
      const s=String(R.v),w=s.length*4;mgText(c,s,Math.round(R.x-w/2+1),Math.round(R.y-R.r*.55-7),R.v===50?'#ffe07a':R.v===25?'#e0c0ff':'#ffffff')}
    if(g.splash){const k=1-g.splash.t/.6;if(g.splash.water){c.strokeStyle=`rgba(220,240,255,${(1-k).toFixed(2)})`;c.lineWidth=1;c.beginPath();c.ellipse(g.splash.x,g.splash.y,2+k*10,1+k*5,0,0,7);c.stroke()}}
    // the thrower
    drawHero(c,120,158,Object.assign({},classFor('overseer','#f2c94c','overseer'),{dir:'up',pose:g.phase==='fly'&&g.fly<.3?'swing':'idle',frame:0,breath:Math.floor(t*1.5)%2}));
    // aim line while aiming
    if(g.phase==='dir'||g.phase==='pow'){const a=g.dir*.95;for(let i=1;i<6;i++){const d=i*10;px(c,Math.round(120+Math.sin(a)*d*1.25),Math.round(126-Math.cos(a)*d*.78),2,2,'rgba(255,224,122,.9)')}}
    // the coin in flight
    if(g.phase==='fly'&&g.coin){const C=g.coin,f=g.fly,x=C.x0+(C.x1-C.x0)*f,y=C.y0+(C.y1-C.y0)*f-Math.sin(f*Math.PI)*34;disc(c,Math.round(x),Math.round(y),f<.6?2:1,'#f0b440');px(c,Math.round(x)-1,Math.round(y)-1,1,1,'#fff0a0')}
    // the direction meter (bottom) and the power meter (right)
    const dx0=36,dw=104,dy0=150;px(c,dx0-2,dy0-2,dw+4,9,'#140f22');px(c,dx0,dy0,dw,5,'#323c55');px(c,dx0+dw/2-1,dy0,2,5,'#6a7088');
    const mx=Math.round(dx0+(g.dir+1)/2*(dw-3));px(c,mx,dy0-3,3,11,g.phase==='dir'?'#ffe07a':'#f0b440');
    const py0=34,ph=104,pxx=222;px(c,pxx-2,py0-2,11,ph+4,'#140f22');const gr=c.createLinearGradient(0,py0+ph,0,py0);gr.addColorStop(0,'#5ad07a');gr.addColorStop(.6,'#f0b440');gr.addColorStop(1,'#e05050');c.fillStyle=gr;c.fillRect(pxx,py0,7,ph);
    if(g.phase!=='dir'){const my=Math.round(py0+ph-g.pow*(ph-3)-3);px(c,pxx-4,my,15,3,g.phase==='pow'?'#ffffff':'#e8e0cc')}
    for(let i=0;i<g.coins;i++){disc(c,8+i*8,14,3,'#c8901a');disc(c,8+i*8,14,2,'#f0c030')}
    mgFloats(c,g,MG.state==='play'?1/60:0)}};

// ---------- wiring ----------
(function(){const cv=$('gCanvas');if(!cv)return;
  cv.addEventListener('pointerdown',e=>{if(MG.state!=='play')return;MG.touch=e.pointerType==='touch';e.preventDefault();try{cv.setPointerCapture(e.pointerId)}catch(_){}const p=mgPoint(e),G=GAMES[MG.id];
    if(G.down)G.down(MG.g,p.x,p.y,e.button);else if(G.tap)G.tap(MG.g,p.x,p.y)});
  cv.addEventListener('pointermove',e=>{if(MG.state!=='play')return;const G=GAMES[MG.id];if(G.move&&e.buttons){const p=mgPoint(e);G.move(MG.g,p.x,p.y)}});
  cv.addEventListener('pointerup',e=>{if(MG.state!=='play')return;const G=GAMES[MG.id];if(G.up){const p=mgPoint(e);G.up(MG.g,p.x,p.y)}});
  cv.addEventListener('contextmenu',e=>{if(MG.id)e.preventDefault()});
  $('gPlay').addEventListener('click',startGame);$('gBack').addEventListener('click',closeGame);$('gClose').addEventListener('click',closeGame);setIcon($('gClose'),'close');
  $('gameView').addEventListener('click',e=>{if(e.target===$('gameView'))closeGame()});
  const keyFor=e=>e.key.length===1?e.key.toLowerCase():e.key;
  addEventListener('keydown',e=>{if(!MG.id)return;{const sv=$('shareView');if(sv&&!sv.hidden)return}const k=keyFor(e);
    if(k==='Escape'){e.preventDefault();e.stopImmediatePropagation();closeGame();return}
    if(MG.state==='play'){const G=GAMES[MG.id];if(G.key&&G.key(MG.g,k,false)){e.preventDefault();e.stopImmediatePropagation();return}}
    if(e.target&&e.target.tagName==='BUTTON')return;
    if((k==='Enter'||k===' ')&&MG.state!=='play'){e.preventDefault();e.stopImmediatePropagation();startGame()}
    else if(k.startsWith('Arrow')||k===' ')e.preventDefault(),e.stopImmediatePropagation()},true);
  addEventListener('keyup',e=>{if(!MG.id||MG.state!=='play')return;const G=GAMES[MG.id],k=keyFor(e);if(G.key&&k.startsWith('Arrow')&&MG.id==='roundup'){G.key(MG.g,k,true);e.stopImmediatePropagation()}},true);
  document.addEventListener('visibilitychange',()=>{if(MG.id)MG.last=performance.now()})})();

// ---------- the menu's list of games ----------
function renderGamesMenu(){const ul=$('gameList');if(!ul)return;ul.textContent='';const B=gameBests();
  for(const [id] of GAME_LIST){const G=gameDef(id),li=document.createElement('li'),free=gameFree(id);li.className='gitem'+(free?'':' locked');
    const cv=document.createElement('canvas');cv.width=9;cv.height=9;cv.setAttribute('aria-hidden','true');const cc=cv.getContext('2d');px(cc,0,0,9,9,'#2a2238');gameIcon(cc,id,1,1);
    const b=document.createElement('b');b.textContent=G.name;const s=document.createElement('span');s.textContent=G.where+(B[id]?` · best ${B[id]}`:'');
    const btn=document.createElement('button');btn.type='button';btn.className='btn small';btn.textContent=free?'PLAY':'CHARTER';btn.setAttribute('aria-label',(free?'Play ':'Royal Charter: ')+G.name);
    btn.addEventListener('click',()=>{const m=$('menu');if(m&&!m.hidden&&typeof closeMenuIfOpen==='function')closeMenuIfOpen();openGame(id)});
    li.append(cv,b,s,btn);ul.appendChild(li)}}
function gamesSummary(){if(!GAME_LIST)return '';const B=gameBests(),n=GAME_LIST.filter(g=>gameFree(g[0])).length,best=Object.keys(B).length;return `${n} of ${GAME_LIST.length} to play${best?` · ${best} with a best score`:''}`}

// ===================== sharing: a picture and a line of text, numbers only =====================
// Share cards carry values people can compare (towns, lanes, steps shipped, scores) and never a name: no kingdom,
// ruler, project, task or lane names, and no text from the work. The picture is the scene you're looking at.
// The page can't post anywhere itself, so sharing is copy (picture or text) or save the picture.
var SHARE_URL='https://www.pipliving.com/labs/kingdomofagents',DEMO_URL='https://www.pipliving.com/labs/kingdomofagents/demo';
var SHR={img:null,text:'',blob:null};
var fmtN=n=>Math.round(n).toLocaleString('en-GB');
function kingdomValues(){const towns=[...villages.values()].filter(v=>v.thKey!=='crown'),ln=lanes.filter(l=>!/overseer|global/i.test(l.role)),g=achGot();
  let steps=0;for(const v of towns){const p=projectProgress(v);if(p.done)steps+=p.done}
  return {towns:towns.length,lanes:ln.length,steps,shipped:shippedTally(),decrees:DECREES.length,answered:ASKS.filter(a=>a.status==='answered').length,
    secrets:ACHIEVEMENTS.filter(a=>g[a[0]]).length,games:Object.keys(gameBests()).length}}
// what each share shows: [title line, tiles [[value,label]], text]
function shareModel(kind,arg){const demo=mode==='sample',who=demo?'THE DEMO KINGDOM':'MY KINGDOM';
  if(kind==='game'){const G=gameDef(arg.id),s=fmtN(arg.score),best=fmtN(Math.max(arg.score,gameBests()[arg.id]||0));
    return {kick:'KINGDOM OF AGENTS · MINI-GAME',title:G.name.toUpperCase(),tiles:[[s,arg.unit||'SCORE'],[best,'MY BEST']],
      text:`I scored ${s} at ${G.name} in Kingdom of Agents. Can you beat it? Play the demo: ${DEMO_URL}`}}
  if(kind==='chronicle'){const W=arg.thisW;return {kick:'KINGDOM OF AGENTS · THE CHRONICLE',title:demo?'A WEEK IN THE DEMO KINGDOM':'MY WEEK',tiles:[[fmtN(W.fin),'STEPS FINISHED'],[fmtN(W.re),'STEPS REOPENED'],[fmtN(W.blocked),'BLOCKED LANE-DAYS'],[W.days+'/7','DAYS WITH PROGRESS']],
      text:`This week in my Kingdom of Agents: ${fmtN(W.fin)} roadmap step${W.fin===1?'':'s'} finished across my Claude Code projects. ${demo?'Have a look':'Build yours'}: ${demo?DEMO_URL:SHARE_URL}`}}
  const K=kingdomValues();
  if(kind==='town'){const v=arg,p=projectProgress(v),s=townStats(v),th=v.th.label;
    const tiles=[[v.lanes.length,v.lanes.length===1?'LANE':'LANES'],[p.pct+'%',p.src==='roadmap'?'ROADMAP DONE':'BUILT']];if(p.done!=null)tiles.push([fmtN(p.done),'STEPS SHIPPED']);tiles.push([s.helpers,'APPRENTICES']);
    const an=/^[aeiou]/i.test(th)?'An':'A';
    return {kick:'KINGDOM OF AGENTS · '+who,title:`${an.toUpperCase()} ${th.toUpperCase()}`,tiles,
      text:`${demo?'A Claude Code project':'One of my Claude Code projects'} in Kingdom of Agents: ${an.toLowerCase()} ${th.toLowerCase()} with ${v.lanes.length} lane${v.lanes.length===1?'':'s'} and its roadmap ${p.pct}% done. ${demo?'Have a look':'Build yours'}: ${demo?DEMO_URL:SHARE_URL}`}}
  const tiles=kind==='court'?[[K.towns,'TOWNS'],[K.lanes,'LANES'],[fmtN(K.decrees),'DECREES SENT'],[fmtN(K.answered),'ASKS ANSWERED'],[fmtN(K.steps),'STEPS SHIPPED'],[`${K.secrets}/${ACHIEVEMENTS.length}`,'SECRETS FOUND']]
    :[[K.towns,'TOWNS'],[K.lanes,'LANES'],[fmtN(K.steps),'STEPS SHIPPED'],[fmtN(K.shipped),'THINGS SHIPPED'],[`${K.secrets}/${ACHIEVEMENTS.length}`,'SECRETS FOUND'],[K.games,'GAMES PLAYED']];
  return {kick:'KINGDOM OF AGENTS',title:kind==='court'?(demo?'THE DEMO THRONE ROOM':'MY THRONE ROOM'):who,tiles,
    text:demo?`Exploring the Kingdom of Agents demo, where Claude Code projects become a pixel-art kingdom: ${DEMO_URL}`
      :`My Kingdom of Agents: ${K.towns} town${K.towns===1?'':'s'}, ${K.lanes} lane${K.lanes===1?'':'s'} and ${fmtN(K.steps)} roadmap step${K.steps===1?'':'s'} shipped so far. Turn your Claude Code projects into a kingdom: ${SHARE_URL}`}}
// the picture: 1200x630, the scene behind, the numbers in a panel on the left
async function shareCard(m,src){try{await Promise.all([document.fonts.load('32px "Press Start 2P"'),document.fonts.load('32px VT323')])}catch(e){}
  const W=1200,H=630,[cv,c]=mk(W,H);c.imageSmoothingEnabled=false;c.fillStyle='#12161f';c.fillRect(0,0,W,H);
  if(src&&src.width){const r=Math.max(W/src.width,H/src.height),w=src.width*r,h=src.height*r;c.drawImage(src,(W-w)/2,(H-h)/2,w,h)}
  const g=c.createLinearGradient(0,0,W*.75,0);g.addColorStop(0,'rgba(12,10,26,.94)');g.addColorStop(.62,'rgba(12,10,26,.82)');g.addColorStop(1,'rgba(12,10,26,0)');c.fillStyle=g;c.fillRect(0,0,W,H);
  const F='"Press Start 2P", monospace',B='VT323, monospace',txt=(s,x,y,size,col,font,sh)=>{c.font=`${size}px ${font||F}`;c.textBaseline='top';if(sh!==false){c.fillStyle='rgba(0,0,0,.6)';c.fillText(s,x+3,y+3)}c.fillStyle=col;c.fillText(s,x,y)};
  // a frame like the game's own panels
  c.fillStyle='#e8e0cc';c.fillRect(0,0,W,6);c.fillRect(0,H-6,W,6);c.fillRect(0,0,6,H);c.fillRect(W-6,0,6,H);
  txt(m.kick,56,56,18,'#9ea4b6');
  let size=40;c.font=`${size}px ${F}`;while(c.measureText(m.title).width>640&&size>20){size-=2;c.font=`${size}px ${F}`}
  txt(m.title,56,96,size,'#f0b440');
  const cols=m.tiles.length>4?3:2,tw=cols===3?200:300,th=118;
  m.tiles.forEach(([v,l],i)=>{const x=56+(i%cols)*(tw+16),y=176+Math.floor(i/cols)*(th+16);
    c.fillStyle='rgba(26,32,48,.92)';c.fillRect(x,y,tw,th);c.fillStyle='#323c55';c.fillRect(x,y,tw,3);c.fillRect(x,y+th-3,tw,3);c.fillRect(x,y,3,th);c.fillRect(x+tw-3,y,3,th);
    let vs=34;c.font=`${vs}px ${F}`;while(c.measureText(String(v)).width>tw-36&&vs>16){vs-=2;c.font=`${vs}px ${F}`}
    txt(String(v),x+20,y+24,vs,'#f0b440');txt(l,x+20,y+76,26,'#ece5d3',B,false)});
  txt('pipliving.com/labs/kingdomofagents',56,H-74,26,'#ece5d3',B);txt('Turn your Claude Code projects into a kingdom',56,H-44,22,'#9ea4b6',B,false);
  return cv}
function shareSource(kind){if(kind==='game')return MG.cv;if(kind==='chronicle')return active?TV.cv:$('worldCv');if(kind==='world')return $('worldCv');return TV.cv}
async function openShare(kind,arg){const m=shareModel(kind,arg),cv=await shareCard(m,shareSource(kind));SHR.text=m.text;SHR.blob=null;
  const url=cv.toDataURL('image/png');cv.toBlob(b=>{SHR.blob=b},'image/png');
  $('shImg').src=url;$('shImg').alt=`Share picture: ${m.title}, ${m.tiles.map(t=>t[0]+' '+t[1].toLowerCase()).join(', ')}`;$('shText').value=m.text;$('shNote').textContent='';
  $('shareView').hidden=false;sfx('ok',.6);setTimeout(()=>{const b=$('shCopyImg');if(b)b.focus({preventScroll:true})},60)}
function closeShare(){$('shareView').hidden=true;sfx('blip',.5)}
function shNote(s){$('shNote').textContent=s}
(function(){if(!$('shareView'))return;
  $('shClose').addEventListener('click',closeShare);setIcon($('shClose'),'close');$('shareView').addEventListener('click',e=>{if(e.target===$('shareView'))closeShare()});
  $('shCopyText').addEventListener('click',()=>{const t=SHR.text,el=$('shText');
    const done=()=>{shNote('Text copied. Paste it with the picture wherever you post.');sfx('coin',.5)},fail=()=>{el.focus();el.select();shNote('Copying was blocked here. The text is selected: copy it with Ctrl+C or Cmd+C.')};
    try{navigator.clipboard.writeText(t).then(done,fail)}catch(e){fail()}});
  $('shCopyImg').addEventListener('click',()=>{const fail=()=>shNote('This browser won’t copy pictures from here. Right-click the picture (or press and hold on a phone) to copy or save it.');
    try{if(!window.ClipboardItem||!navigator.clipboard||!navigator.clipboard.write){fail();return}
      const blob=SHR.blob?Promise.resolve(SHR.blob):new Promise(r=>{const i=new Image();i.onload=()=>{const [c2,x]=mk(i.width,i.height);x.drawImage(i,0,0);c2.toBlob(r,'image/png')};i.src=$('shImg').src});
      navigator.clipboard.write([new ClipboardItem({'image/png':blob})]).then(()=>{shNote('Picture copied. Paste it into your post.');sfx('coin',.5)},fail)}catch(e){fail()}});
  addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('shareView').hidden){e.preventDefault();e.stopImmediatePropagation();closeShare()}},true);
  setIcon($('shareWorld'),'share');setIcon($('shareTown'),'share');
  $('shareWorld').addEventListener('click',()=>openShare('world'));
  $('shareTown').addEventListener('click',()=>{if(active===COURT)openShare('court');else if(active&&active.lanes)openShare('town',active)});
  $('gShare').addEventListener('click',()=>{if(MG.g&&MG.id)openShare('game',{id:MG.id,score:Math.max(0,Math.round(MG.g.score)),unit:MG.id==='runes'?'NOTES ECHOED':'SCORE'})})})();

// ===================== the Royal Council: running agents well =====================
// Eight things beside the scroll that help a ruler run many lanes well, each a tab of one Council window:
// Proof (is finished work checked?), Laws (what lanes may do alone, the lane limit and quiet hours), Quests (kingdom goals),
// Chronicle (outcomes week on week), Reports (a plain-English weekly update per project), Crossroads (lanes that clash,
// projects that depend on each other), Treasury (spend against a budget) and Guild (teammates and the lane setups they share).
// The Royal Audience lives in the scroll itself: asks in order of what they hold up, answered one at a time.
// Everything is stored in the collections the kingdom already has (realm docs, and fields on roadmaps and lanes docs),
// so no kingdom needs new permissions. The overseer is told what to report in the setup prompt.
var COUNCIL={laws:null,quests:[],cross:{clashes:[],deps:[]},guild:{setups:[]},treasury:{budgets:{}},chron:{days:{}},tab:'proof',town:null,guardWas:false,live:false};
var LAW_LEVELS=[['ask-all','Ask before shipping anything','Lanes check with you before any work ships or merges.'],['ask-risky','Ask before crossing a law','Lanes ship ordinary work themselves and ask before anything you tick below.'],['free','Free to ship','Lanes ship on their own. Anything you tick below still needs your seal.']];
var LAW_CROSSINGS=[['deploy','Deploying to production or releasing to users'],['money','Spending money or changing prices'],['payments','Changing payments code'],['data','Touching user data or privacy settings'],['delete','Deleting data, files or branches'],['deps','Adding a new dependency or outside service'],['secrets','Using credentials or secrets']];
var LAW_DEFAULT={level:'ask-risky',crossings:['deploy','money','payments','data','delete','secrets'],byProject:{},curfew:{maxLanes:0,quiet:false,from:'22:00',to:'07:00'}};
var QUEST_COLS=['#f0b440','#5ad07a','#7fd0ff','#c890ff'];
var COUNCIL_TABS=[['proof','PROOF'],['laws','LAWS'],['quests','QUESTS'],['chronicle','CHRONICLE'],['reports','REPORTS'],['crossroads','CROSSROADS'],['treasury','TREASURY'],['guild','GUILD']];
function laws(){return Object.assign({},LAW_DEFAULT,COUNCIL.laws||{},{curfew:Object.assign({},LAW_DEFAULT.curfew,(COUNCIL.laws||{}).curfew||{})})}
function lawsFor(name){const L=laws(),p=(L.byProject||{})[name];return p&&p.level?{level:p.level,crossings:Array.isArray(p.crossings)?p.crossings:[],own:true}:{level:L.level,crossings:L.crossings,own:false}}
function cleanReport(r){if(!r||typeof r!=='object'||!r.summary)return null;const a=(x,n)=>(Array.isArray(x)?x:[]).slice(0,n).map(s=>String(s).slice(0,120)).filter(Boolean);
  return {week:String(r.week||'').slice(0,12),summary:String(r.summary).slice(0,400),shipped:a(r.shipped,6),next:a(r.next,6),risks:a(r.risks,4),updated:String(r.updated||'')}}
function cleanSpend(s){if(!s||typeof s!=='object')return null;const usd=Number(s.usd7d),tok=Number(s.tokens7d);if(!(usd>=0)&&!(tok>=0))return null;return {usd7d:usd>=0?usd:null,tokens7d:tok>=0?tok:null,updated:String(s.updated||'')}}
function stepProof(s){return !s.done?'':['tested','checked'].includes(s.proof)?s.proof:'unchecked'}
var RM_DOC=name=>'roadmaps/'+slug(name);
async function realmSave(name,data,msg){if(STORE&&mode!=='sample'){try{await STORE.doc('realm/'+name).set(data);if(msg)toast(msg);return true}catch(e){toast('Could not save. Try again.');return false}}
  toast((msg||'Saved')+' (demo: on this page only)');return true}

// ---------- the Royal Audience: the scroll in order of what each ask holds up ----------
function blockingFor(a){const v=villages.get(a.project);if(!v)return 0;return v.lanes.filter(L=>{const s=effState(L);return s==='blocked'||s==='waiting'}).length}
function audienceOrder(list){const age=a=>{const t=Date.parse(a.createdAt||'');return isFinite(t)?(Date.now()-t)/3600e3:0};
  return [...list].sort((a,b)=>((b.urgent?100:0)+blockingFor(b)*10+Math.min(48,age(b)))-((a.urgent?100:0)+blockingFor(a)*10+Math.min(48,age(a))))}
var AUD={ids:[],i:0,answered:0,later:0};
function openAudience(first,town){let open=audienceOrder(ASKS.filter(a=>a.status!=='answered'&&(!town||a.project===town)));if(!open.length){toast(town?`Nothing from ${town} is waiting on you.`:'Nothing is waiting on you.');return}
  if(typeof first==='string'){const f=open.find(a=>a.id===first);if(f)open=[f,...open.filter(a=>a!==f)]}
  Object.assign(AUD,{ids:open.map(a=>a.id),i:0,answered:0,later:0,town:town||''});$('audienceView').hidden=false;sfx('fanfare',.5);renderAudience()}
function closeAudience(){$('audienceView').hidden=true;sfx('blip',.5);renderCourt();if(active&&active!==COURT&&active.lanes)renderStatus(active)}
function renderAudience(){const body=$('auBody');if(!body||$('audienceView').hidden)return;body.textContent='';const add=(t,c,x,p)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;(p||body).appendChild(e);return e};
  let a=null;while(AUD.i<AUD.ids.length&&!(a=ASKS.find(x=>x.id===AUD.ids[AUD.i]&&x.status!=='answered')))AUD.i++;
  if(!a){$('auKick').textContent='THE AUDIENCE IS OVER';$('auH').textContent=AUD.answered?`${AUD.answered} answered`:'Nothing answered';
    add('p','',AUD.later?`${AUD.later} left for later, still on the scroll.`:'Nothing left waiting on you.');const r=add('div','obacts');const b=add('button','btn primary',AUD.town&&active&&active!==COURT?'BACK TO '+placeName(active).toUpperCase():'BACK TO THE THRONE ROOM',r);b.type='button';b.onclick=closeAudience;setTimeout(()=>b.focus({preventScroll:true}),40);return}
  $('auKick').textContent=`THE ROYAL AUDIENCE · ${AUD.i+1} OF ${AUD.ids.length}`;const v=villages.get(a.project);$('auH').textContent=`A petitioner from ${v?placeName(v):a.project||'the realm'}`;
  {const row=add('div','ausay');const [fc,fx]=mk(30,42);fx.imageSmoothingEnabled=false;drawHero(fx,15,41,Object.assign({},petitionerSpec(a),{dir:'down',pose:'talk',item:'scroll',frame:0,breath:0}));fc.className='auface';fc.setAttribute('aria-hidden','true');row.appendChild(fc);
   const q=add('p','auq',`“${a.title}”`,row)}
  const chips=add('div','auchips');const pj=add('span','proj',(a.project||'ALL').toUpperCase(),chips);pj.style.background=v?themeColour(v):'#8a7a5a';
  if(a.urgent)add('span','urg','URGENT',chips);const bl=blockingFor(a);if(bl)add('span','blk',`HOLDING UP ${bl} LANE${bl>1?'S':''}`,chips);
  if(a.detail)add('p','',a.detail);if(a.recommendation){const r=add('p','aurec');const b=document.createElement('b');b.textContent='Recommended: ';r.append(b,document.createTextNode(a.recommendation))}
  const acts=add('div','obacts');const ok=add('button','btn primary','APPROVE',acts),rp=add('button','btn','REPLY',acts),lt=add('button','btn','LATER',acts);[ok,rp,lt].forEach(b=>b.type='button');
  const box=add('div','aureply');box.hidden=true;const ta=add('textarea','',null,box);ta.id='auReply';ta.setAttribute('aria-label','Your reply');ta.placeholder='Your answer';const sd=add('button','btn primary','SEND REPLY',box);sd.type='button';
  const next=()=>{AUD.i++;renderAudience()};
  ok.onclick=async()=>{await answerAsk(a,'approve',a.recommendation);AUD.answered++;next()};
  rp.onclick=()=>{box.hidden=!box.hidden;if(!box.hidden)ta.focus()};
  sd.onclick=async()=>{if(!ta.value.trim()){ta.focus();return}await answerAsk(a,'reply',ta.value.trim());AUD.answered++;next()};
  lt.onclick=()=>{AUD.later++;sfx('blip',.5);next()};setTimeout(()=>ok.focus({preventScroll:true}),40)}

// ---------- Curfew and the Guard ----------
function workingLanes(){return lanes.filter(L=>!/overseer|global/i.test(L.role)&&effState(L)==='working').length}
function guardOver(){const m=laws().curfew.maxLanes;return m>0&&workingLanes()>m}
function hhmm(s){const m=/^(\d{1,2}):(\d{2})$/.exec(String(s||''));return m?Math.min(23,+m[1])*60+Math.min(59,+m[2]):null}
function inQuiet(){const c=laws().curfew;if(!c.quiet)return false;const a=hhmm(c.from),b=hhmm(c.to);if(a==null||b==null)return false;const d=new Date(),n=d.getHours()*60+d.getMinutes();return a<b?n>=a&&n<b:n>=a||n<b}
function councilWatch(){if(!COUNCIL)return;const over=guardOver();if(over&&!COUNCIL.guardWas){const c=laws().curfew;toast(`The guard: ${workingLanes()} lanes are working, over your limit of ${c.maxLanes}.`);try{sfx('bonk',.5)}catch(e){}}COUNCIL.guardWas=over}
function courtNotes(){if(!COUNCIL)return [];const n=[];const c=laws().curfew;if(guardOver())n.push(`The guard: ${workingLanes()} lanes working, over your limit of ${c.maxLanes}`);if(inQuiet())n.push(`Quiet hours until ${c.to}: lanes hold non-urgent asks`);return n}

// ---------- Proof marks ----------
function proofCounts(names){const out={tested:0,checked:0,unchecked:0};for(const n of names){const r=ROADMAPS[n];if(!r||!r.steps)continue;for(const s of r.steps){const p=stepProof(s);if(p)out[p]++}}return out}
async function markChecked(name,i){const r=ROADMAPS[name];if(!r||!r.steps[i])return;r.steps[i].proof='checked';
  if(STORE&&mode!=='sample'&&Array.isArray(r.raw)&&r.raw[i]){const raw=r.raw.map((s,k)=>k===i?Object.assign({},s,{proof:'checked'}):s);try{await STORE.doc(RM_DOC(name)).update({steps:raw});toast('Marked as checked by you')}catch(e){toast('Could not save. Try again.');r.steps[i].proof='unchecked'}}
  else toast('Marked as checked (demo: on this page only)');sfx('coin',.5);renderCouncil();if(active&&active!==COURT)renderStatus(active)}

// ---------- the Chronicle: a snapshot a day, compared week on week ----------
var dayKey=d=>{const z=new Date(d);return `${z.getFullYear()}-${String(z.getMonth()+1).padStart(2,'0')}-${String(z.getDate()).padStart(2,'0')}`};
function snapNow(){const p={};let done=0,total=0;for(const v of villages.values()){if(v.thKey==='crown')continue;const pp=projectProgress(v);if(pp.done!=null){p[v.name]=pp.done;done+=pp.done;total+=pp.total||0}}
  const real=lanes.filter(L=>!/overseer|global/i.test(L.role));return {done,total,blocked:real.filter(L=>effState(L)==='blocked').length,working:real.filter(L=>effState(L)==='working').length,p}}
async function chronicleTick(){if(!COUNCIL)return;if(mode!=='live'||!STORE||!OB.editor)return;const k=dayKey(Date.now()),days=COUNCIL.chron.days||{};const s=snapNow();
  const old=days[k];if(old&&old.done===s.done&&old.blocked===s.blocked&&JSON.stringify(old.p)===JSON.stringify(s.p))return;
  const keep={};Object.keys(days).sort().slice(-40).forEach(d=>keep[d]=days[d]);keep[k]=s;COUNCIL.chron.days=keep;try{await STORE.doc('realm/chronicle').set({days:keep})}catch(e){}}
function chronicleWeeks(){const days=COUNCIL.chron.days||{},keys=Object.keys(days).sort(),per={};// finished and reopened steps land on the day they were first seen
  for(let i=1;i<keys.length;i++){const a=days[keys[i-1]],b=days[keys[i]];let fin=0,re=0;const pf={};for(const n of Object.keys(b.p||{})){const d=(b.p[n]||0)-((a.p||{})[n]||0);if(d>0){fin+=d;pf[n]=d}else if(d<0)re-=d}per[keys[i]]={fin,re,blocked:b.blocked||0,pf}}
  const now=Date.now(),wk=(from,to)=>{const o={fin:0,re:0,blocked:0,days:0,pf:{}};for(const k of Object.keys(per)){const t=Date.parse(k+'T12:00:00');if(t>now-to*864e5&&t<=now-from*864e5){const d=per[k];o.fin+=d.fin;o.re+=d.re;o.blocked+=d.blocked;if(d.fin)o.days++;for(const n in d.pf)o.pf[n]=(o.pf[n]||0)+d.pf[n]}}return o};
  const bars=[];for(let i=13;i>=0;i--){const k=dayKey(now-i*864e5);bars.push({k,fin:per[k]?per[k].fin:0})}return {thisW:wk(0,7),lastW:wk(7,14),bars,have:keys.length}}

// ---------- Quests ----------
function questStats(){const qs=COUNCIL.quests||[],out=qs.map(q=>({q,done:0,total:0}));let wander=0,wanderDone=0;
  for(const r of Object.values(ROADMAPS)){for(const s of (r.steps||[])){const o=out.find(x=>x.q.id===s.q);if(o){o.total++;if(s.done)o.done++}else{wander++;if(s.done)wanderDone++}}}return {out,wander,wanderDone}}

// ---------- Crossroads (map) ----------
function laneById(id){return lanes.find(L=>L.id===id)}
function crossClashes(){return (COUNCIL.cross.clashes||[]).map(c=>({a:laneById(c.a),b:laneById(c.b),area:c.area})).filter(c=>c.a&&c.b)}
function crossSpots(){if(!COUNCIL)return [];const out=[];if(!world.towns)return out;for(const c of crossClashes()){if(c.a.product===c.b.product)continue;const A=world.towns.find(t=>t.name===c.a.product),B=world.towns.find(t=>t.name===c.b.product);if(!A||!B)continue;const pts=routeBetween(A.name,B.name);if(!pts||!pts.length)continue;const p=along(pts,.5);out.push({x:p.x,y:p.y,c})}return out}
function drawCrossroads(c,t){for(const s of crossSpots()){const x=Math.round(s.x),y=Math.round(s.y),b=Math.floor(t*3)%2;ellipseShadow(c,x,y,6,2,.3);
  // a hooded bandit blocking the road
  px(c,x-3,y-12,6,9,'#3a2a3a');px(c,x-3,y-12,6,2,'#5a3a4a');px(c,x-4,y-16,8,5,'#2a1e2a');px(c,x-1,y-14,1,1,'#ffe07a');px(c,x+1,y-14,1,1,'#ffe07a');px(c,x-3,y-3,2,3,'#2a1e24');px(c,x+1,y-3,2,3,'#2a1e24');px(c,x+3,y-11+b,4,1,'#c4cad4');
  px(c,x-1,y-24-b,3,7,'#140f22');px(c,x,y-23-b,1,4,'#e05050');px(c,x,y-18-b,1,1,'#e05050')}}
function crossroadsTap(e){if(!world.W)return false;const {x,y}=worldPoint(e);for(const s of crossSpots())if(Math.hypot(x-s.x,y-s.y+8)<12){sfx('bonk',.6);openCouncil('crossroads');return true}return false}

// ---------- Treasury ----------
function money(n){return n==null?'':'$'+(n>=100?Math.round(n):n.toFixed(2))}

// ---------- Guild ----------
var SAMPLE_LORDS=['You','Sam','Priya'];
function lordOf(L){if(!COUNCIL)return '';return L.lord||(mode==='sample'?SAMPLE_LORDS[hash('lord'+L.product)%SAMPLE_LORDS.length]:'')}
function teamBrief(name){const n=String(name||'').trim()||'TEAMMATE';return overseerBrief()+`\n\nTEAM KINGDOM: you are ${n}'s overseer in a kingdom shared with ${rulerName()}. Run part A and B only for ${n}'s own projects. Set lord "${n}" on every lanes doc you write, and never change lanes, roadmaps or asks belonging to another lord's projects. Skip the HEARTBEAT: ${rulerName()}'s own overseer writes it.`}

// ---------- the Council window ----------
function openCouncil(tab,town){COUNCIL.tab=tab||COUNCIL.tab||'proof';COUNCIL.town=town||null;$('councilView').hidden=false;sfx('blip');renderCouncil();setTimeout(()=>{const b=document.querySelector('#coTabs [aria-selected="true"]');if(b)b.focus({preventScroll:true})},60)}
function closeCouncil(){$('councilView').hidden=true;sfx('blip',.5);if(typeof renderMenu==='function')renderMenu()}
function projNames(){return COUNCIL.town?[COUNCIL.town]:projectNames()}
function renderCouncil(){if(!COUNCIL)return;if(!$('councilView')||$('councilView').hidden)return;const tabs=$('coTabs');tabs.textContent='';
  for(const [id,lab] of COUNCIL_TABS){const b=document.createElement('button');b.type='button';b.className='cotab';b.setAttribute('role','tab');b.setAttribute('aria-selected',String(COUNCIL.tab===id));b.textContent=lab;b.onclick=()=>{COUNCIL.tab=id;sfx('blip',.5);renderCouncil()};tabs.appendChild(b)}
  const v=COUNCIL.town&&villages.get(COUNCIL.town);$('coKick').textContent=v?`THE ROYAL COUNCIL · ${placeName(v).toUpperCase()}`:'THE ROYAL COUNCIL';
  const body=$('coBody');body.textContent='';const T=COUNCIL_RENDER[COUNCIL.tab]||COUNCIL_RENDER.proof;T(body)}
function el(t,c,x,p){const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;if(p)p.appendChild(e);return e}
function townChip(name,p){const v=villages.get(name),s=el('span','proj',(v?placeName(v):name).toUpperCase(),p);s.style.background=v?themeColour(v):'#8a7a5a';s.title=name;return s}
function coLead(body,h,lead){el('h2','coh',h,body);if(lead)el('p','colead',lead,body)}
function coBar(p,pct,col){const b=el('span','rmbar',null,p);const i=el('i',null,null,b);i.style.width=Math.max(0,Math.min(100,pct))+'%';if(col)i.style.background=col;return b}
var COUNCIL_RENDER={
  proof(body){const names=projNames(),c=proofCounts(names);
    coLead(body,'Proof marks','Every finished step carries a seal: tested (its checks ran and passed), checked (you looked at it yourself) or unchecked. Unchecked work is the place to look first.');
    const tiles=el('div','cotiles',null,body);for(const [k,l] of [['unchecked','UNCHECKED'],['tested','TESTED'],['checked','CHECKED BY YOU']]){const d=el('div','cotile '+k,null,tiles);el('b',null,String(c[k]),d);el('span',null,l,d)}
    for(const n of names){const r=ROADMAPS[n];if(!r||!r.steps)continue;const fin=r.steps.map((s,i)=>({s,i})).filter(o=>o.s.done);if(!fin.length)continue;
      const sec=el('section','cosec',null,body);const hd=el('div','cohd',null,sec);townChip(n,hd);el('span','muted',`${fin.length} finished`,hd);
      const ul=el('ul','coproof',null,sec);for(const {s,i} of fin.sort((a,b)=>({unchecked:0,tested:1,checked:2})[stepProof(a.s)]-({unchecked:0,tested:1,checked:2})[stepProof(b.s)])){const p=stepProof(s),li=el('li',null,null,ul);
        const seal=el('span','seal '+p,p==='checked'?'CHECKED':p==='tested'?'TESTED':'UNCHECKED',li);seal.setAttribute('aria-label',p);el('span','st2',s.t,li);
        if(p!=='checked'){const b=el('button','btn small','MARK CHECKED',li);b.type='button';b.onclick=()=>markChecked(n,i)}}}
    if(!names.some(n=>ROADMAPS[n]&&ROADMAPS[n].steps&&ROADMAPS[n].steps.some(s=>s.done)))el('p','muted','No finished roadmap steps yet. Seals appear as lanes finish steps.',body)},
  laws(body){const L=laws(),town=COUNCIL.town;const cur=town?lawsFor(town):{level:L.level,crossings:L.crossings,own:false};
    coLead(body,town?`Laws for ${placeName(villages.get(town)||{name:town})}`:'Laws of the Realm',town?'This town can follow the kingdom’s laws or have its own. Lanes ask you (on the scroll) before crossing one.':'What lanes may do on their own, and what needs your seal first. The overseer passes these to every project, and lanes ask you on the scroll before crossing one.');
    const form=el('form','coform',null,body);let own=cur.own;
    if(town){const lab=el('label','cocheck',null,form);const cb=el('input',null,null,lab);cb.type='checkbox';cb.id='lawOwn';cb.checked=own;el('span',null,'Give this town its own laws',lab);cb.onchange=()=>{own=cb.checked;fs.disabled=!own}}
    const fs=el('fieldset',null,null,form);fs.disabled=!!town&&!own;el('legend','f','HOW FREE ARE THE LANES?',fs);
    for(const [id,name,desc] of LAW_LEVELS){const lab=el('label','coradio',null,fs);const r=el('input',null,null,lab);r.type='radio';r.name='lawLevel';r.value=id;r.checked=cur.level===id;const t=el('span',null,null,lab);el('b',null,name,t);el('span','muted',desc,t)}
    el('legend','f','ALWAYS ASK BEFORE',fs);for(const [id,name] of LAW_CROSSINGS){const lab=el('label','cocheck',null,fs);const cb=el('input',null,null,lab);cb.type='checkbox';cb.name='lawCross';cb.value=id;cb.checked=cur.crossings.includes(id);el('span',null,name,lab)}
    if(!town){const cf=el('fieldset',null,null,form);el('legend','f','CURFEW AND THE GUARD',cf);el('p','muted','Running many agents at once wears people out. Set how many lanes may work at once, and quiet hours when the kingdom sleeps and lanes hold non-urgent asks until morning.',cf);
      const row=el('label','coinline',null,cf);el('span',null,'Most lanes working at once',row);const mx=el('input',null,null,row);mx.type='number';mx.min='0';mx.max='40';mx.id='lawMax';mx.value=String(L.curfew.maxLanes||0);el('span','muted','0 means no limit',row);
      el('p','muted',`Working right now: ${workingLanes()} lane${workingLanes()===1?'':'s'}.`,cf);
      const qlab=el('label','cocheck',null,cf);const q=el('input',null,null,qlab);q.type='checkbox';q.id='lawQuiet';q.checked=!!L.curfew.quiet;el('span',null,'Quiet hours',qlab);
      const tr=el('div','coinline',null,cf);el('span',null,'From',tr);const f1=el('input',null,null,tr);f1.type='time';f1.id='lawFrom';f1.value=L.curfew.from;el('span',null,'to',tr);const f2=el('input',null,null,tr);f2.type='time';f2.id='lawTo';f2.value=L.curfew.to}
    const acts=el('div','obacts',null,form);const sv=el('button','btn primary','SAVE THE LAWS',acts);sv.type='submit';
    form.onsubmit=async e=>{e.preventDefault();const level=(form.querySelector('input[name=lawLevel]:checked')||{}).value||'ask-risky',crossings=[...form.querySelectorAll('input[name=lawCross]:checked')].map(i=>i.value);
      const next=JSON.parse(JSON.stringify(laws()));if(town){next.byProject=next.byProject||{};if(own)next.byProject[town]={level,crossings};else delete next.byProject[town]}
      else{next.level=level;next.crossings=crossings;next.curfew={maxLanes:Math.max(0,Math.min(40,Math.round(Number($('lawMax').value)||0))),quiet:$('lawQuiet').checked,from:$('lawFrom').value||'22:00',to:$('lawTo').value||'07:00'}}
      next.updated=new Date().toISOString();COUNCIL.laws=next;if(await realmSave('laws',next,'The laws are posted. The overseer passes them on at its next check.')){renderCouncil();renderCourt();councilWatch()}}},
  quests(body){const {out,wander,wanderDone}=questStats();
    coLead(body,'Kingdom Quests','Two to four goals for the whole kingdom. The overseer tags each roadmap step with the quest it serves, so you can see which goals are moving and how much work serves none.');
    if(out.length){const ul=el('ul','coquests',null,body);for(const o of out){const li=el('li',null,null,ul);const sw=el('span','qsw',null,li);sw.style.background=o.q.col;el('b',null,o.q.name,li);coBar(li,o.total?o.done/o.total*100:0,o.q.col);el('span','muted',o.total?`${o.done} of ${o.total} steps`:'No steps tagged yet',li)}
      const w=el('p','cowander',`${wander} step${wander===1?'':'s'} serve no quest (${wanderDone} finished). These are your wanderers: work that may be worth questioning.`,body)}
    else el('p','muted','No quests yet. Set your first below.',body);
    const form=el('form','coform',null,body);el('legend','f','YOUR QUESTS',form);const ins=[];for(let i=0;i<4;i++){const q=(COUNCIL.quests||[])[i];const row=el('label','coinline',null,form);const sw=el('span','qsw',null,row);sw.style.background=QUEST_COLS[i];const inp=el('input',null,null,row);inp.type='text';inp.maxLength=60;inp.id='quest'+i;inp.placeholder=i<2?['e.g. Launch Pip to its first families','e.g. First paying customers'][i]:'Optional';inp.value=q?q.name:'';inp.setAttribute('aria-label','Quest '+(i+1));ins.push(inp)}
    const acts=el('div','obacts',null,form);el('button','btn primary','SAVE QUESTS',acts).type='submit';
    form.onsubmit=async e=>{e.preventDefault();const old=COUNCIL.quests||[];const list=ins.map((inp,i)=>{const n=inp.value.trim();if(!n)return null;const was=old.find(q=>q.name===n)||old[i];return {id:was&&was.name===n?was.id:slug(n).slice(0,24)||('q'+i),name:n.slice(0,60),col:QUEST_COLS[i]}}).filter(Boolean);
      COUNCIL.quests=list;if(await realmSave('quests',{list,updated:new Date().toISOString()},'Quests set. The overseer tags roadmap steps at its next check.'))renderCouncil()}},
  chronicle(body){const W=chronicleWeeks();
    coLead(body,'The Chronicle','Outcomes, not activity: what got finished this week against last week. The kingdom writes down the numbers each day it is opened.');
    const tiles=el('div','cotiles wide',null,body);const tile=(v,l,prev,good)=>{const d=el('div','cotile',null,tiles);el('b',null,String(v),d);el('span',null,l,d);if(prev!=null){const diff=v-prev;const s=el('em',diff===0?'':(diff>0)===good?'up':'down',diff===0?'same as last week':`${diff>0?'+':''}${diff} on last week`,d)}};
    tile(W.thisW.fin,'STEPS FINISHED',W.lastW.fin,true);tile(W.thisW.re,'STEPS REOPENED',W.lastW.re,false);tile(W.thisW.blocked,'BLOCKED LANE-DAYS',W.lastW.blocked,false);tile(W.thisW.days,'DAYS WITH PROGRESS',W.lastW.days,true);
    const mx=Math.max(1,...W.bars.map(b=>b.fin)),bars=el('div','cobars',null,body);bars.setAttribute('role','img');bars.setAttribute('aria-label','Steps finished each day for the last 14 days: '+W.bars.map(b=>b.fin).join(', '));
    for(const b of W.bars){const c=el('div','cobar',null,bars);const i=el('i',null,null,c);i.style.height=Math.round(b.fin/mx*100)+'%';el('span',null,String(Number(b.k.slice(8))),c)}
    el('p','muted','Steps finished each day, last 14 days.',body);
    const pf=Object.entries(W.thisW.pf).sort((a,b)=>b[1]-a[1]);if(pf.length){const ul=el('ul','corows',null,body);for(const [n,k] of pf){const li=el('li',null,null,ul);townChip(n,li);el('span',null,`${k} step${k===1?'':'s'} finished`,li)}}
    if(W.have<2)el('p','muted',mode==='live'?'The Chronicle fills in as the days go by: open the kingdom on a few different days to see the first week.':'',body);
    const acts=el('div','obacts',null,body);const sh=el('button','btn','SHARE THIS WEEK',acts);sh.type='button';sh.onclick=()=>openShare('chronicle',W)},
  reports(body){const names=projNames();coLead(body,'The Herald’s Report','A short weekly update per project in plain English, written by the overseer for anyone you share the kingdom with. Copy one into Slack or an email.');
    let any=false;for(const n of names){const r=ROADMAPS[n]&&ROADMAPS[n].report;if(!r)continue;any=true;const sec=el('section','cosec',null,body);const hd=el('div','cohd',null,sec);townChip(n,hd);el('span','muted',r.week?`Week ${r.week}`:'',hd);
      el('p',null,r.summary,sec);for(const [k,l] of [['shipped','Shipped'],['next','Next'],['risks','Risks']])if(r[k].length){el('h3','f',l.toUpperCase(),sec);const ul=el('ul','colist',null,sec);r[k].forEach(x=>el('li',null,x,ul))}
      const b=el('button','btn small','COPY REPORT',sec);b.type='button';b.onclick=()=>{const txt=`${n}${r.week?' · week '+r.week:''}\n${r.summary}\n`+[['shipped','Shipped'],['next','Next'],['risks','Risks']].filter(([k])=>r[k].length).map(([k,l])=>`\n${l}:\n`+r[k].map(x=>'- '+x).join('\n')).join('\n');
        try{navigator.clipboard.writeText(txt).then(()=>{b.textContent='COPIED';setTimeout(()=>b.textContent='COPY REPORT',1800)},()=>toast('Copying was blocked here.'))}catch(e){toast('Copying was blocked here.')}}}
    if(!any)el('p','muted','No reports yet. The overseer writes one per project each week once you paste the updated setup prompt.',body)},
  crossroads(body){const cl=crossClashes(),deps=COUNCIL.cross.deps||[];coLead(body,'Crossroads','Where lanes get in each other’s way: two lanes changing the same thing, and projects that wait on each other. A clash between two towns shows as a bandit on the road between them.');
    el('h3','f','CLASHES',body);if(cl.length){const ul=el('ul','corows',null,body);for(const c of cl){const li=el('li',null,null,ul);townChip(c.a.product,li);el('span',null,`${c.a.role} and ${c.b.role}`+(c.a.product!==c.b.product?` (${placeName(villages.get(c.b.product)||{name:c.b.product})})`:''),li);el('span','muted',c.area||'',li)}}else el('p','muted','No clashes reported.',body);
    el('h3','f','WAITING ON EACH OTHER',body);if(deps.length){const ul=el('ul','corows',null,body);for(const d of deps){const li=el('li',null,null,ul);townChip(d.from,li);el('span',null,'waits on',li);townChip(d.to,li);el('span','muted',d.why||'',li)}}else el('p','muted','No dependencies reported.',body)},
  treasury(body){const names=projNames(),bud=COUNCIL.treasury.budgets||{};coLead(body,'The Treasury','What each project spent on agents in the last 7 days, against a weekly budget you set. Spend comes from the overseer, only where it can measure it; it never guesses.');
    const W=chronicleWeeks(),form=el('form','coform',null,body);const ul=el('ul','cotreasury',null,form);const ins={};let any=false;
    for(const n of names){const sp=ROADMAPS[n]&&ROADMAPS[n].spend,li=el('li',null,null,ul);townChip(n,li);const b=bud[n]||0;
      if(sp&&sp.usd7d!=null){any=true;el('b',null,money(sp.usd7d),li);coBar(li,b?sp.usd7d/b*100:0,b&&sp.usd7d>b?'#e05050':'#f0b440');const fin=W.thisW.pf[n]||0;el('span','muted',(b&&sp.usd7d>b?'Over budget. ':'')+(sp.usd7d>0&&!fin&&W.have>1?'Spending with no steps finished this week: a leaking chest.':''),li)}
      else if(sp&&sp.tokens7d!=null){any=true;el('b',null,(sp.tokens7d/1e6).toFixed(1)+'M tokens',li);el('span','muted','Cost not reported',li)}else el('span','muted','No spend reported',li);
      const lab=el('label','coinline',null,li);el('span',null,'Budget $/week',lab);const inp=el('input',null,null,lab);inp.type='number';inp.min='0';inp.step='1';inp.value=b?String(b):'';inp.setAttribute('aria-label','Weekly budget for '+n);ins[n]=inp}
    if(!any)el('p','muted','Nothing reported yet. Whether your overseer can measure spend depends on how your lanes run; where it can’t, this stays empty.',form);
    const acts=el('div','obacts',null,form);el('button','btn primary','SAVE BUDGETS',acts).type='submit';
    form.onsubmit=async e=>{e.preventDefault();const budgets=Object.assign({},bud);for(const n in ins){const x=Math.max(0,Math.round(Number(ins[n].value)||0));if(x)budgets[n]=x;else delete budgets[n]}COUNCIL.treasury={budgets};if(await realmSave('treasury',{budgets,updated:new Date().toISOString()},'Budgets saved.'))renderCouncil()}},
  guild(body){coLead(body,'The Guild Hall','A kingdom can be shared by a team. Each teammate is a lord with their own lanes, and the guild keeps lane setups that worked, for anyone to copy.');
    const lords={};for(const L of lanes){if(/overseer|global/i.test(L.role))continue;const k=lordOf(L)||rulerName();lords[k]=(lords[k]||0)+1}
    el('h3','f','LORDS',body);const lu=el('ul','corows',null,body);for(const [k,n] of Object.entries(lords).sort((a,b)=>b[1]-a[1])){const li=el('li',null,null,lu);el('b',null,k,li);el('span','muted',`${n} lane${n===1?'':'s'}`,li)}
    el('h3','f','SHARED LANE SETUPS',body);const su=el('ul','cosetups',null,body);for(const s of (COUNCIL.guild.setups||[])){const li=el('li',null,null,su);el('b',null,s.title,li);el('span','muted',[s.role,s.by].filter(Boolean).join(' · '),li);el('pre',null,s.prompt,li);const b=el('button','btn small','COPY',li);b.type='button';b.onclick=()=>{try{navigator.clipboard.writeText(s.prompt).then(()=>{b.textContent='COPIED';setTimeout(()=>b.textContent='COPY',1500)},()=>toast('Copying was blocked here.'))}catch(e){}}}
    if(!(COUNCIL.guild.setups||[]).length)el('p','muted','None shared yet.',body);
    const form=el('form','coform',null,body);el('legend','f','SHARE A SETUP',form);const t=el('input',null,null,form);t.type='text';t.id='gsTitle';t.placeholder='Name, e.g. A careful QA lane';t.maxLength=60;t.setAttribute('aria-label','Setup name');
    const r=el('input',null,null,form);r.type='text';r.id='gsRole';r.placeholder='Role, e.g. qa';r.maxLength=24;r.setAttribute('aria-label','Role');const p=el('textarea',null,null,form);p.id='gsPrompt';p.placeholder='The prompt you start this lane with';p.maxLength=2000;p.setAttribute('aria-label','Prompt');
    const acts=el('div','obacts',null,form);el('button','btn primary','ADD TO THE GUILD',acts).type='submit';
    form.onsubmit=async e=>{e.preventDefault();if(!t.value.trim()||!p.value.trim()){(t.value.trim()?p:t).focus();return}const setups=[...(COUNCIL.guild.setups||[]),{title:t.value.trim().slice(0,60),role:r.value.trim().slice(0,24),prompt:p.value.trim().slice(0,2000),by:rulerName(),added:new Date().toISOString()}].slice(-40);
      COUNCIL.guild={setups};if(await realmSave('guild',{setups},'Added to the guild hall.'))renderCouncil()};
    el('h3','f','INVITE A TEAMMATE',body);const ol=el('ol','colist',null,body);['Share this kingdom with them from the Share menu, with edit access.','Type their name below and copy their setup prompt.','They paste it into the Claude Code session that coordinates their own projects. Their towns and lanes join yours, marked with their name.'].forEach(x=>el('li',null,x,ol));
    const row=el('div','coinline',null,body);const nm=el('input',null,null,row);nm.type='text';nm.id='gInvite';nm.placeholder='Their name';nm.maxLength=30;nm.setAttribute('aria-label','Teammate name');const cp=el('button','btn','COPY THEIR SETUP PROMPT',row);cp.type='button';
    cp.onclick=()=>{if(!nm.value.trim()){nm.focus();return}try{navigator.clipboard.writeText(teamBrief(nm.value)).then(()=>{cp.textContent='COPIED';setTimeout(()=>cp.textContent='COPY THEIR SETUP PROMPT',1800)},()=>toast('Copying was blocked here.'))}catch(e){}}}};

// ---------- the town panel and the throne room's council card ----------
function councilTown(v){if(!COUNCIL)return;const box=$('sCouncil');if(!box)return;box.textContent='';if(!v||v===COURT||!v.lanes)return;const n=v.name,c=proofCounts([n]),r=ROADMAPS[n],sp=r&&r.spend,lw=lawsFor(n);
  const b=(lab,tab,hot)=>{const x=el('button','btn small'+(hot?' hot':''),lab,box);x.type='button';x.onclick=()=>openCouncil(tab,n)};
  // this town's own asks, heard here without the rest of the kingdom's; and the project's own roadmap and asks page
  {const q=ASKS.filter(a=>a.status!=='answered'&&a.project===n).length;if(q){const x=el('button','btn small hot',`ASKS · ${q}`,box);x.type='button';x.onclick=()=>openAudience(null,n)}}
  {const p=profileOf(n);if(p&&p.page){const x=el('a','btn small','PROJECT PAGE ↗',box);x.href=p.page;x.target='_blank';x.rel='noopener'}}
  b(c.unchecked?`PROOF · ${c.unchecked} UNCHECKED`:'PROOF','proof',c.unchecked>0);b(lw.own?'LAWS · OWN':'LAWS','laws');if(r&&r.report)b('REPORT','reports');if(sp)b('TREASURY','treasury');
  const cl=crossClashes().filter(x=>x.a.product===n||x.b.product===n).length;if(cl)b(`CROSSROADS · ${cl}`,'crossroads',true)}
function councilCourt(){if(!COUNCIL)return;const box=$('councilBtns');if(!box)return;box.textContent='';const names=projectNames(),pc=proofCounts(names),W=chronicleWeeks(),qs=COUNCIL.quests||[],cl=crossClashes().length,reports=names.filter(n=>ROADMAPS[n]&&ROADMAPS[n].report).length;
  const rows=[['proof','PROOF',pc.unchecked?`${pc.unchecked} unchecked`:'all checked'],['laws','LAWS',(LAW_LEVELS.find(l=>l[0]===laws().level)||[])[1]||''],['quests','QUESTS',qs.length?`${qs.length} quest${qs.length>1?'s':''}`:'none set'],['chronicle','CHRONICLE',`${W.thisW.fin} finished this week`],['reports','REPORTS',`${reports} this week`],['crossroads','CROSSROADS',cl?`${cl} clash${cl>1?'es':''}`:'clear'],['treasury','TREASURY',''],['guild','GUILD','teammates and setups']];
  for(const [tab,lab,sub] of rows){const b=el('button','cobtn',null,box);b.type='button';el('b',null,lab,b);if(sub)el('span',null,sub,b);b.onclick=()=>openCouncil(tab)}
  const notes=courtNotes(),nb=$('courtNotes');if(nb){nb.textContent=notes.join(' · ');nb.hidden=!notes.length}
  const ab=$('audBtn'),open=ASKS.filter(a=>a.status!=='answered').length;if(ab){ab.hidden=open<2;ab.textContent=`HOLD AN AUDIENCE · ${open}`}}
function councilSummary(){if(!COUNCIL)return '';const pc=proofCounts(projectNames());return `${pc.unchecked?pc.unchecked+' unchecked · ':''}proof, laws, quests, chronicle, reports and more`}

// ---------- the demo kingdom's council ----------
function decorateSample(R){const reports={
  'Pip':{week:'44',summary:'Weaning food lists are in testing with three families, and push notifications shipped. The App Store listing is the next big job.',shipped:['Push notifications','Shared calendar fixes'],next:['Weaning food lists to all testers','App Store listing'],risks:['Store review could take a week']},
  'Seek TCG':{week:'44',summary:'Sellers can now list and take offers. Payouts are next, waiting on a decision about pricing.',shipped:['Listings and offers','Price history'],next:['Seller payouts'],risks:['Pricing decision is on the scroll']},
  'Baby Rota':{week:'44',summary:'Night-feed mode is in beta and families like it. Handover notes start this week.',shipped:['Night-feed mode beta'],next:['Handover notes','Dark mode'],risks:[]},
  'Stream Share':{week:'44',summary:'Shared queues work end to end. Chat is blocked until the streaming source is chosen.',shipped:['Shared queues'],next:['Chat'],risks:['Blocked on the where-to-watch decision']},
  'The UXologist':{week:'44',summary:'The booking flow and newsletter are live. The teardown series has its first two drafts.',shipped:['Newsletter sign-up'],next:['Teardown series'],risks:[]},
  'Coinage':{week:'44',summary:'Bank sync and categories are done. Budgets are half built.',shipped:['Categories'],next:['Budgets','Monthly report'],risks:['Rounding rule needs a decision']}};
  const spend={'Pip':38.4,'Seek TCG':52.1,'Baby Rota':12.9,'Stream Share':21.6,'The UXologist':6.2,'Coinage':17.8};const qs=['launch','revenue','quality'];
  for(const [n,r] of Object.entries(R)){(r.steps||[]).forEach((s,i)=>{const h=hash(n+'|'+s.t);if(s.done)s.proof=['tested','unchecked','checked','tested'][h%4];s.q=h%5<3?qs[h%3]:''});if(reports[n])r.report=cleanReport(Object.assign({updated:new Date().toISOString()},reports[n]));if(spend[n]!=null)r.spend={usd7d:spend[n],tokens7d:null,updated:''}}return R}
function sampleCouncil(){COUNCIL.laws=null;COUNCIL.quests=[{id:'launch',name:'Launch Pip to its first families',col:QUEST_COLS[0]},{id:'revenue',name:'First paying customers',col:QUEST_COLS[1]},{id:'quality',name:'Nothing ships unchecked',col:QUEST_COLS[2]}];
  COUNCIL.treasury={budgets:{'Pip':50,'Seek TCG':40,'Baby Rota':20}};
  COUNCIL.guild={setups:[{title:'A careful QA lane',role:'qa',by:'Sam',prompt:'You are the QA lane. Before marking any step done, run the tests and the app, and write what you checked in one line. Never fix what you find: report it to the owner.'},{title:'Design review loop',role:'design',by:'Priya',prompt:'You are the design lane. Every change gets a before and after screenshot in the task notes, checked against the design system tokens.'}]};
  const days={};const base=Date.now();let done=40;const names=['Pip','Seek TCG','Baby Rota','Stream Share','The UXologist','Coinage'];const p={};names.forEach(n=>p[n]=4+hash('d'+n)%4);
  for(let i=14;i>=0;i--){const k=dayKey(base-i*864e5),h=hash('chr'+i);const step=i>7?h%3:h%4;for(let j=0;j<step;j++){const n=names[(h>>>(j*3))%names.length];p[n]++;done++}if(i===9){p['Coinage']--;done--}days[k]={done,total:80,blocked:(h>>>6)%3,working:5+(h>>>8)%4,p:Object.assign({},p)}}
  COUNCIL.chron={days}}
function sampleCross(){const L=n=>(villages.get(n)||{lanes:[]}).lanes;const a=L('Pip').find(x=>/web|website/.test(x.role)),b=L('Baby Rota').find(x=>/ios/.test(x.role))||L('Baby Rota')[0];
  COUNCIL.cross={clashes:a&&b?[{a:a.id,b:b.id,area:'the shared sign-in screens'}]:[],deps:[{from:'Baby Rota',to:'Pip',why:'weaning food lists'},{from:'Seek TCG',to:'Coinage',why:'price history service'}]}}

// ---------- the live store ----------
function councilLive(db){COUNCIL.live=true;COUNCIL.laws=null;COUNCIL.quests=[];COUNCIL.cross={clashes:[],deps:[]};COUNCIL.guild={setups:[]};COUNCIL.treasury={budgets:{}};COUNCIL.chron={days:{}};
  const on=(name,fn)=>db.doc('realm/'+name).onSnapshot(d=>{if(mode==='sample')return;const r=(d.data&&d.data())||{};fn(r);renderCouncil();renderCourt();if(active&&active!==COURT)renderStatus(active)},()=>{});
  on('laws',r=>{COUNCIL.laws=r&&r.level?r:null});
  on('quests',r=>{COUNCIL.quests=(Array.isArray(r.list)?r.list:[]).slice(0,4).map((q,i)=>({id:String(q.id||'q'+i).slice(0,24),name:String(q.name||'').slice(0,60),col:QUEST_COLS[i]})).filter(q=>q.name)});
  on('crossroads',r=>{COUNCIL.cross={clashes:(Array.isArray(r.clashes)?r.clashes:[]).slice(0,12).map(c=>({a:String(c.a||''),b:String(c.b||''),area:String(c.area||'').slice(0,80)})),deps:(Array.isArray(r.deps)?r.deps:[]).slice(0,20).map(d=>({from:String(d.from||''),to:String(d.to||''),why:String(d.why||'').slice(0,80)}))}});
  on('guild',r=>{COUNCIL.guild={setups:(Array.isArray(r.setups)?r.setups:[]).slice(-40).map(s=>({title:String(s.title||'').slice(0,60),role:String(s.role||'').slice(0,24),prompt:String(s.prompt||'').slice(0,2000),by:String(s.by||'').slice(0,30)})).filter(s=>s.title&&s.prompt)}});
  on('treasury',r=>{const b={};for(const [k,v] of Object.entries(r.budgets||{}))if(Number(v)>0)b[String(k).slice(0,64)]=Math.round(Number(v));COUNCIL.treasury={budgets:b}});
  on('chronicle',r=>{const days={};for(const [k,v] of Object.entries(r.days||{}))if(/^\d{4}-\d{2}-\d{2}$/.test(k)&&v&&typeof v==='object')days[k]={done:Number(v.done)||0,total:Number(v.total)||0,blocked:Number(v.blocked)||0,working:Number(v.working)||0,p:v.p&&typeof v.p==='object'?v.p:{}};COUNCIL.chron={days};COUNCIL.chronLoaded=true;setTimeout(chronicleTick,4000)})}

// ---------- wiring ----------
(function(){if(!$('councilView'))return;
  $('coClose').addEventListener('click',closeCouncil);setIcon($('coClose'),'close');$('councilView').addEventListener('click',e=>{if(e.target===$('councilView'))closeCouncil()});
  $('auClose').addEventListener('click',closeAudience);setIcon($('auClose'),'close');$('audienceView').addEventListener('click',e=>{if(e.target===$('audienceView'))closeAudience()});
  $('audBtn').addEventListener('click',()=>openAudience());
  const mc=$('mCouncil');if(mc)mc.addEventListener('click',()=>{if(typeof closeMenuIfOpen==='function')closeMenuIfOpen();openCouncil()});
  addEventListener('keydown',e=>{if(e.key!=='Escape')return;if(!$('audienceView').hidden){e.preventDefault();e.stopImmediatePropagation();closeAudience()}else if(!$('councilView').hidden){e.preventDefault();e.stopImmediatePropagation();closeCouncil()}},true);
  if(mode==='sample'){decorateSample(ROADMAPS);sampleCouncil();setTimeout(()=>{sampleCross();renderCourt()},300)}
  setInterval(()=>{councilWatch();if(mode==='live')chronicleTick()},20000);renderCourt()})();

// ---------- the throne room: petitioners queue for an audience, and the council sits at its map table ----------
// each open ask is a petitioner in the town's colours, queueing up the carpet in the order the audience would take them
function petitionerSpec(a){const v=villages.get(a.project);return courierSpec(v?themeColour(v):'#8a7a5a','ask'+a.id)}
var QUEUE={spots:[]};
function drawCourtQueue(c,t){const C=COURT,cx=C.W/2,open=audienceOrder(ASKS.filter(a=>a.status!=='answered'));QUEUE.spots=[];
  if(C.sent&&(performance.now()-T0)/1000-C.sent<13)return;// heralds use the carpet while a decree goes out
  const shown=open.slice(0,4);shown.forEach((a,i)=>{const x=cx+(i%2?1:-1),y=170+i*24,front=i===0;QUEUE.spots.push({x,y,id:a.id});
    drawHero(c,x,y,Object.assign({},petitionerSpec(a),{dir:'up',pose:front&&Math.floor(t/1.8)%2?'talk':'idle',item:'scroll',frame:0,breath:Math.floor(t*1.4+i)%2}));
    if(a.urgent){const b=Math.round(Math.abs(Math.sin(t*4+i))*2);px(c,x+7,y-46-b,5,9,'#140f22');px(c,x+8,y-45-b,3,7,'#e05050');px(c,x+9,y-44-b,1,3,'#fff');px(c,x+9,y-40-b,1,1,'#fff')}});
  if(open.length>4){const y=170+4*24;pixText(c,'+'+(open.length-4),cx-4,y-12,'#f0e0b0')}}
function courtQueueTap(x,y){let best=null,bd=1e9;for(const s of QUEUE.spots){if(Math.abs(x-s.x)<10&&y>s.y-40&&y<s.y+3){const d=Math.abs(y-(s.y-18));if(d<bd){bd=d;best=s}}}if(best){openAudience(best.id);return true}return false}
// the council table: the kingdom carved into its top, a piece standing on each town, councillors around it
var COUNCIL_TABLE={x:318,y:172,w:24,h:72};
function drawCouncilTable(c,t){const T=COUNCIL_TABLE,W=RAMP.wood,x=T.x,y=T.y;
  // four councillors, two along each side, turned to the map
  const seat=(sx,sy,sp,d,k)=>drawHero(c,sx,sy,Object.assign({},sp,{dir:d,pose:Math.floor(t/2.4+k)%3===0?'talk':'idle',frame:0,breath:Math.floor(t*1.2+k)%2}));
  const left=[[x-8,y+20,heraldSpec(),0],[x-8,y+62,classFor('analyst','#7fd0ff','council-a'),1]],right=[[x+T.w+8,y+20,classFor('design','#c890ff','council-b'),2],[x+T.w+8,y+62,classFor('backend','#c4a35a','council-c'),3]];
  for(const [sx,sy,sp,k] of [...left,...right].sort((a,b)=>a[1]-b[1]))seat(sx,sy,sp,sx<x?'right':'left',k);
  ellipseShadow(c,x+T.w/2,y+T.h+4,T.w/2+3,3,.3);
  px(c,x-2,y-2,T.w+4,T.h+4,W[0]);px(c,x-1,y-1,T.w+2,T.h+2,W[2]);px(c,x-1,y-1,T.w+2,1,W[3]);for(const [lx,ly] of [[x+1,y+T.h+1],[x+T.w-4,y+T.h+1]])px(c,lx,ly,3,6,W[0]);
  // the kingdom carved into the top, turned to run along the table
  const mx=x+2,my=y+2,mw=T.w-4,mh=T.h-4;px(c,mx,my,mw,mh,'#3a5a8a');
  if(world.bg){c.save();c.beginPath();c.rect(mx,my,mw,mh);c.clip();c.translate(mx+mw,my);c.rotate(Math.PI/2);c.globalAlpha=.85;c.drawImage(world.bg,0,0,world.bg.width,world.bg.height,0,0,mh,mw);c.restore();c.save();c.globalAlpha=.42;c.fillStyle='#8a5a2a';c.fillRect(mx,my,mw,mh);c.restore()}
  px(c,mx,my,mw,1,'rgba(0,0,0,.35)');px(c,mx,my,1,mh,'rgba(0,0,0,.35)');
  for(const tw of (world.towns||[])){if(!world.W)break;const px0=Math.round(mx+mw-tw.cy/world.H*mw),py0=Math.round(my+tw.cx/world.W*mh),royal=tw.icon==='royal',col=royal?RAMP.gold[3]:(tw.v?themeColour(tw.v):'#c8b48a');
    px(c,px0-1,py0-3,3,4,'#140f22');px(c,px0,py0-4,1,1,'#140f22');px(c,px0,py0-2,1,2,col);px(c,px0-1,py0,3,1,col);if(royal){px(c,px0-1,py0-4,1,1,col);px(c,px0+1,py0-4,1,1,col)}}
  for(const cyl of [y-6,y+T.h+2]){const cxl=x+T.w/2-1;px(c,cxl,cyl+3,2,5,'#f4ecd8');const f=Math.floor(t*9+cyl)%2;px(c,cxl,cyl-f,2,3,'#ffb03a');px(c,cxl,cyl-1-f,1,1,'#ffe07a')}}
function councilTableTap(x,y){const T=COUNCIL_TABLE;if(x>=T.x-18&&x<=T.x+T.w+18&&y>=T.y-14&&y<=T.y+T.h+8){openCouncil();return true}return false}

