// Kingdom of Agents, part 3 of 4. The parts share one scope and load in order from kingdom.html.
// ===================== the court: asks, decrees, roadmaps =====================
let LOCAL_URL='';try{LOCAL_URL=localStorage.getItem('kingdom-url')||''}catch{}
function artUrl(){return REALM.url||LOCAL_URL||"(this page's claude.ai artifact link: copy it from the Share menu)"}
let ASKS=[],DECREES=[],ROADMAPS={},STORE=null,courtLive=false;
// what we can see of the link to the overseer and the lanes: the store, the overseer's heartbeat, and live lane records
const LINK={store:false,overseer:null,lanes:0,newest:null,projects:0};
const SAMPLE_ASKS=[
 {id:'s-ask-1',project:'Stream Share',title:'Which where-to-watch source should we use?',detail:'The cheaper one has no links straight into the streaming apps.',recommendation:'Launch on the one with deep links; look at pricing again after the beta.',urgent:1,status:'open'},
 {id:'s-ask-2',project:'Baby Rota',title:'Invite the first family to the beta now?',detail:'The first build is ready.',recommendation:'Yes, add them to the internal test group today.',status:'open'},
 {id:'s-ask-3',project:'Seek TCG',title:'Charge per listing or a monthly plan?',detail:'Sellers in interviews were split.',recommendation:'Start with a monthly plan and a free tier of 20 listings.',status:'open'},
 {id:'s-ask-4',project:'Pip',title:'Approve the new landing page copy',detail:'Draft is ready for review.',recommendation:'Approve and let the website lane publish.',status:'open'},
 {id:'s-ask-5',project:'Coinage',title:'Round shared bills up or to the penny?',detail:'Both pass the totals cross-check.',recommendation:'To the penny, with the odd penny going to whoever paid.',urgent:1,status:'open'},
];
const SAMPLE_DECREES=[{id:'s-dec-1',to:'Pip',text:'Get the weaning food list ready for Baby Rota before the movement plans.',status:'delivered',createdAt:new Date(Date.now()-3600e3).toISOString(),note:'Owner moved it to the top of the recipes lane.'}];
ASKS=SAMPLE_ASKS.map(a=>({...a}));DECREES=SAMPLE_DECREES.map(d=>({...d}));
function cleanAsk(id,a){return {id,project:String(a.project||'').slice(0,40),title:String(a.title||a.question||'').slice(0,160),detail:String(a.detail||'').slice(0,400),recommendation:String(a.recommendation||'').slice(0,400),urgent:!!a.urgent,status:a.status==='answered'?'answered':'open',answer:String(a.answer||'').slice(0,600),action:String(a.action||''),answeredAt:String(a.answeredAt||''),relayed:a.relayed!==false,createdAt:String(a.createdAt||''),ref:String(a.ref||'').slice(0,40)}}
function cleanDecree(id,d){const st=['queued','delivered','done','unreachable'].includes(d.status)?d.status:'queued';return {id,lanes:Array.isArray(d.lanes)?d.lanes.slice(0,24).map(x=>String(x).slice(0,80)):[],kind:['message','nudge'].includes(d.kind)?d.kind:'decree',to:String(d.to||'all').slice(0,64),text:String(d.text||'').slice(0,1200),status:st,createdAt:String(d.createdAt||''),note:String(d.note||'').slice(0,300),deliveredTo:String(d.deliveredTo||'').slice(0,80)}}
function toast(msg){document.querySelectorAll('.toast').forEach(x=>x.remove());const t=document.createElement('div');t.className='toast';t.setAttribute('role','status');t.textContent=msg;document.body.appendChild(t);setTimeout(()=>t.remove(),2600)}
function projectNames(){return [...villages.values()].filter(v=>v.thKey!=='crown').map(v=>v.name)}
function renderCourt(){
  if(!$('askList'))return;
  const open=ASKS.filter(a=>a.status!=='answered'),done=ASKS.filter(a=>a.status==='answered');
  $('scrollH').textContent=`THE ${monarch().toUpperCase()}'S SCROLL · ${open.length} ASK${open.length===1?'':'S'}`;
  $('scrollHint').textContent=open.length?(courtLive?'Your open asks from every project. Approve the recommendation or reply in your own words.':'Sample asks. Connect the overseer below to see your real ones.'):'Nothing is waiting on you.';
  const ul=$('askList');ul.innerHTML='';
  for(const a of (typeof audienceOrder==='function'?audienceOrder(open):open)){const v=villages.get(a.project),col=v?themeColour(v):'#8a7a5a',li=document.createElement('li');li.className='ask';li.style.setProperty('--ac',col);
    const who=document.createElement('div');who.className='who';const pj=document.createElement('span');pj.className='proj';pj.style.background=col;pj.style.color='#fffaf0';pj.textContent=(a.project||'ALL').toUpperCase();who.appendChild(pj);
    if(a.urgent){const u=document.createElement('span');u.className='urg';u.textContent='URGENT';who.appendChild(u)}
    {const bl=typeof blockingFor==='function'?blockingFor(a):0;if(bl){const u=document.createElement('span');u.className='blk';u.textContent=`HOLDING UP ${bl}`;u.title=`${bl} lane${bl>1?'s':''} in this project ${bl>1?'are':'is'} waiting or blocked`;who.appendChild(u)}}
    const q=document.createElement('div');q.className='q';q.textContent=a.title;
    li.append(who,q);
    if(a.detail){const d=document.createElement('div');d.className='rec';d.textContent=a.detail;li.appendChild(d)}
    if(a.recommendation){const r=document.createElement('div');r.className='rec';r.innerHTML='<b>Recommended:</b> ';r.appendChild(document.createTextNode(a.recommendation));li.appendChild(r)}
    const acts=document.createElement('div');acts.className='acts';
    const ok=document.createElement('button');ok.type='button';ok.className='btn primary';ok.textContent='APPROVE';
    const rp=document.createElement('button');rp.type='button';rp.className='btn';rp.textContent='REPLY';
    acts.append(ok,rp);li.appendChild(acts);
    const box=document.createElement('div');box.hidden=true;const ta=document.createElement('textarea');ta.id='reply-'+a.id;ta.setAttribute('aria-label','Your reply to: '+a.title);ta.placeholder='Your answer';
    const send=document.createElement('button');send.type='button';send.className='btn primary';send.textContent='SEND REPLY';send.style.marginTop='8px';box.append(ta,send);li.appendChild(box);
    ok.onclick=()=>answerAsk(a,'approve',a.recommendation);
    rp.onclick=()=>{box.hidden=!box.hidden;if(!box.hidden)ta.focus()};
    send.onclick=()=>{if(!ta.value.trim()){ta.focus();return}answerAsk(a,'reply',ta.value.trim())};
    ul.appendChild(li)}
  $('answeredSum').textContent=`ANSWERED · ${done.length}`;
  const al=$('answeredList');al.innerHTML='';
  for(const a of done.slice(-12).reverse()){const li=document.createElement('li');const to=document.createElement('span');to.className='to';to.textContent=(a.project||'ALL').toUpperCase();const st=document.createElement('span');st.className='st answered';st.textContent=a.action==='approve'?'APPROVED':'REPLIED';const tx=document.createElement('span');tx.className='txt';tx.textContent=a.title;const nt=document.createElement('span');nt.className='note';nt.textContent=a.answer;li.append(to,st,tx,nt);al.appendChild(li)}
  // decree recipients
  // one checkbox per town; a herald rides to each town ticked
  const box=$('decreeTo'),was=new Set([...box.querySelectorAll('input:checked')].map(i=>i.value));box.innerHTML='';
  for(const v of [...villages.values()].filter(x=>x.thKey!=='crown')){const l=document.createElement('label');l.className='recip';
    const i=document.createElement('input');i.type='checkbox';i.value=v.name;i.checked=was.has(v.name);i.addEventListener('change',syncRecipAll);
    const k=document.createElement('i'),sw=document.createElement('span');sw.className='sw2';sw.style.background=themeColour(v);const tx=document.createElement('span');tx.textContent=placeName(v);
    l.title=v.name+' owner';l.append(i,k,sw,tx);box.appendChild(l)}
  syncRecipAll();
  const dl=$('decreeList');dl.innerHTML='';
  const ds=[...DECREES].sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt))).slice(0,10);
  if(!ds.length){const e=document.createElement('li');e.className='empty2';e.style.cssText='background:none;border:0;padding:0';e.textContent='No decrees sent yet.';dl.appendChild(e)}
  for(const d of ds){const li=document.createElement('li');const to=document.createElement('span');to.className='to';const dl2=d.lanes||[],lv=dl2.length?villages.get(d.to):null,ln=lv?dl2.map(id=>{const L=lv.lanes.find(x=>x.id===id);return L?L.role:id.split('--').pop()}).join(', '):'';to.textContent=(d.to==='all'?'ALL OWNERS':d.to==='overseer'?'OVERSEER':d.to.toUpperCase())+(ln?' · '+(d.kind==='nudge'?'BACK TO WORK: ':'')+ln.toUpperCase():'')+(d.createdAt?' · '+fmtAgo(d.createdAt):'');
    const st=document.createElement('span');st.className='st '+d.status;const seen=LINK.overseer&&Date.parse(LINK.overseer)>=Date.parse(d.createdAt||0);st.textContent=d.status==='queued'?(seen?'ON THE ROAD':'WAITING FOR OVERSEER'):d.status.toUpperCase();
    const tx=document.createElement('span');tx.className='txt';tx.textContent=d.text;li.append(to,st,tx);
    if(d.note){const nt=document.createElement('span');nt.className='note';nt.textContent=d.note;li.appendChild(nt)}dl.appendChild(li)}
  const q=DECREES.filter(d=>d.status==='queued').length;
  $('courtMeta').textContent=`${open.length} ask${open.length===1?'':'s'} · ${q} decree${q===1?'':'s'} on the road · ${LINK.overseer?(overseerQuick()?'overseer checking every minute while you watch':'overseer checked in '+fmtAgo(LINK.overseer)+' ago'):'overseer not connected yet'}`;
  renderLink();
  $('brief').textContent=overseerBrief();
  if(active===COURT)renderCourtHUD();
  // a lane's speech bubble and the message window show how your last message is getting on
  if(active&&active!==COURT&&active.sel){const L=active.lanes.find(x=>x.id===active.sel);if(L)laneActions(active,L)}
  if(!$('msgView').hidden&&document.activeElement!==$('msgText'))renderMsg();
  if(typeof councilCourt==='function')councilCourt();
}
async function answerAsk(a,action,text){achieve('answer');
  const patch={status:'answered',action,answer:text||'',answeredAt:new Date().toISOString(),relayed:false};
  if(STORE&&mode!=='sample'&&!a.id.startsWith('s-')){try{await STORE.doc('asks/'+a.id).update(patch);if(isCloud(a.project)){const w=await wakeProject(a.project,'Ben answered an ask');toast('Answer sent.'+wakeNote(w,a.project))}else toast('Answer sent to the overseer')}catch(e){toast('Could not save the answer. Try again.');return}}
  else{Object.assign(a,patch);toast('Sample answer recorded on this page only')}
  // the herald rides out with the answer, as with a decree
  COURT.sent=(performance.now()-T0)/1000;COURT.sentN=1;sfx('fanfare');renderCourt();renderLabels();
}
// answers the overseer has not yet passed on travel like decrees: the herald carries each to its project's town
function answersOnRoad(){return ASKS.filter(a=>a.status==='answered'&&a.relayed===false&&a.project).map(a=>({to:a.project,createdAt:a.answeredAt,status:'queued',answer:1}))}
function recipBoxes(){return [...$('decreeTo').querySelectorAll('input')]}
function syncRecipAll(){const b=recipBoxes(),all=b.length&&b.every(i=>i.checked);$('recipAll').textContent=all?'UNSELECT ALL':'SELECT ALL';$('recipAll').setAttribute('aria-pressed',String(all));
  const n=b.filter(i=>i.checked).length;$('decreeSend').textContent=n>1?`SEND ${n} DECREES ▸`:'SEND DECREE ▸'}
// While the ruler has the kingdom open, the page says so in realm/watch once a minute. A self-paced overseer reads it
// and checks every minute while someone is watching (and while a decree waits), and every 15 minutes otherwise.
var WATCH={last:0};
function watchPing(force){if(!STORE||mode==='sample'||!OB.editor||!USER)return;if(document.visibilityState!=='visible'&&!force)return;
  const now=Date.now();if(!force&&now-WATCH.last<55e3)return;WATCH.last=now;STORE.doc('realm/watch').set({at:new Date(now).toISOString()}).catch(()=>{})}
// how soon a herald should arrive: quick when the overseer has checked in within the last few minutes
// quick means the overseer is on the self-paced loop: its last two check-ins came close together, and the latest was recent
function overseerQuick(){const a=Date.parse(LINK.overseer),b=Date.parse(LINK.prevOverseer);return !!LINK.overseer&&Date.now()-a<4*60e3&&b>0&&a-b<4*60e3}
function heraldEta(){return overseerQuick()?' It should arrive within a minute or two.':LINK.overseer?' It leaves at your overseer’s next check-in.':' It leaves once your overseer is running.'}
// Cloud projects: their Product Owner runs as a scheduled task in the cloud and keeps its own town. When the ruler sends
// it something, the page starts that task at once through the ruler's Claude Code connector, instead of waiting for its next run.
var WAKE={mcp:undefined,err:''};
function isCloud(name){const p=profileOf(name);return !!(p&&p.cloud)}
async function wakeMcp(){if(WAKE.mcp!==undefined)return WAKE.mcp;try{WAKE.mcp=window.claude&&window.claude.use?await window.claude.use('mcp'):null}catch(e){WAKE.mcp=null}return WAKE.mcp}
async function wakeProject(name,what){const p=profileOf(name);if(!p||!p.cloud||!p.wake||mode==='sample'||!STORE||!OB.editor)return '';
  const m=await wakeMcp();if(!m)return 'none';
  try{await m.callTool('Claude Code Remote','fire_trigger',{trigger_id:p.wake,text:`Kingdom of Agents: ${what}. Run your kingdom steps (part K) first.`});return 'ok'}
  catch(e){return (e&&e.code)||'error'}}
// what to tell the ruler after a wake attempt
function wakeNote(r,name){const po=`${name}’s Product Owner`;
  if(r==='ok')return ` ${po} has been woken and is on it now.`;
  if(r==='approval_required')return ` Allow this page to use Claude Code to wake ${po} at once; until then it picks this up at its next run.`;
  if(r==='server_not_connected'||r==='needs_reauth')return ` Connect Claude Code in claude.ai to wake ${po} at once; until then it picks this up at its next run.`;
  if(r)return ` ${po} picks this up at its next run.`;return ''}
// one decree per town, so each owner gets their own herald and their own delivery status
// a message or a nudge for chosen lanes of one project: the overseer delivers it to each lane, or through its owner if a lane has gone quiet
async function sendToLanes(v,ids,text,kind){const now=new Date().toISOString(),d={to:v.name,lanes:ids,kind,text,status:'queued',createdAt:now,from:rulerName()};
  if(STORE&&mode!=='sample'){try{await STORE.collection('decrees').add(d)}catch(e){toast('Could not send. Try again.');return false}watchPing(true);const w=await wakeProject(v.name,kind==='nudge'?'Ben asked lanes to get back to work':'a message from Ben for some lanes');toast((kind==='nudge'?'The herald is off to get them back to work.':'Message sent. A herald is on the road.')+(w?wakeNote(w,v.name):heraldEta()))}
  else{DECREES.push(Object.assign({id:'local-'+Date.now()},d));toast(kind==='nudge'?'Sample: a herald rides out, on this page only':'Sample message: shown on this page only')}
  COURT.sent=(performance.now()-T0)/1000;COURT.sentN=1;sfx(kind==='nudge'?'fanfare':'ok');renderCourt();if(active&&active!==COURT)renderStatus(active);if(!$('msgView').hidden)renderMsg();return true}
function lanePost(L){return DECREES.filter(d=>d.lanes&&d.lanes.includes(L.id)).sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)))[0]||null}
async function sendDecree(list,text){achieve('decree');
  const now=new Date().toISOString(),docs=list.map(to=>({to,text,status:'queued',createdAt:now,from:rulerName()}));
  if(STORE&&mode!=='sample'){try{for(const d of docs)await STORE.collection('decrees').add(d);watchPing(true);const cl=list.filter(isCloud),ws=await Promise.all(cl.map(n=>wakeProject(n,'a decree from Ben')));const w=ws.find(x=>x)||'';
    toast((docs.length>1?`${docs.length} decrees sent. ${docs.length} heralds are on the road.`:'Decree sent. The Royal Herald is on the road.')+(cl.length===list.length&&w?wakeNote(w,cl[0]):heraldEta()))}catch(e){toast('Could not send the decree. Try again.');return false}}
  else{docs.forEach((d,k)=>DECREES.push(Object.assign({id:'local-'+Date.now()+'-'+k},d)));toast(docs.length>1?`Sample: ${docs.length} heralds, shown on this page only`:'Sample decree: shown on this page only')}
  COURT.sent=(performance.now()-T0)/1000;COURT.sentN=docs.length;sfx('fanfare');renderCourt();return true;
}
// The one prompt the whole game runs on. It is pasted into whichever Claude session coordinates the others (the overseer);
// it surveys every project once so the realm can be built, then keeps it live every cycle.
function ownerSurvey(){return `${rulerName()==='the ruler'?'Your lead':rulerName()} is mapping every project into a live kingdom view. Answer from what you already know about your project: do not open files, run tools or start subagents for this. Reply with only this JSON, filled in, nothing else:
{
  "name": "the project's name, exactly as you call it",
  "pitch": "one sentence: what the product is and who it is for",
  "audience": "who uses it",
  "stage": "idea | building | beta | live",
  "platforms": ["ios", "android", "web", "api", ...],
  "tags": ["3 to 6 single words for the product's world, e.g. marketplace, health, family, streaming, research, finance"],
  "lanes": [
    {"id": "short-id", "role": "one of: owner, coordinator, design, content, ios, android, web, website, web app, backend, data, qa, analyst, recipes, exercise, trading desk", "owns": "one short sentence: what this lane is responsible for", "handsTo": ["ids of lanes it passes work to"]}
  ],
  "links": [{"to": "another project's name", "why": "what the two share"}],
  "roadmap": {"done": 0, "total": 0, "next": "the next milestone", "steps": [{"step": "each checklist item in ROADMAP.md, in order, under 80 characters", "done": false, "phase": "the heading it sits under, or empty"}]}
}
List every lane you run, including yourself as role "owner" and lanes that are idle or paused. Leave links empty if there are none.`}
function surveySteps(){const K=gameName(),R=rulerName();return `SURVEY THE REALM
 1. Get realm/config. If it is missing, set {kingdom: "${K}", castle: "${castleName()}", ruler: "${R}", url: the artifact link}; otherwise leave it alone.
 2. Send each project's owner the OWNER SURVEY below, word for word, the way you normally pass messages to owners. Then set realm/progress to {asked: [every project's name], answered: [], updated: now}: the page shows ${R} who has replied while they wait.
 3. If a reply is prose, turn it into the fields yourself. If stage, audience, tags or lanes are missing, ask that owner once for just those; never invent them. handsTo, links and roadmap are optional.
 4. As soon as each owner answers, write THAT project straight away in one batch; don't wait for the others, so its town appears for ${R} at once:
    - projects/<project-slug>: the fields as given, plus updated. Leave out roadmap. Never remove an existing "kind" or "place": ${R} chose those on the page.
    - roadmaps/<project-slug> for each roadmap answer: project, done, total, pct (round(done/total*100)), next, steps (the checklist as given, at most 120 items).
    - lanes/<project-slug>--<lane id> for every roster lane: product (the project's name exactly as in its projects doc), lane, role, task, state, progress, stepsDone, stepsTotal, updated (stepsDone and stepsTotal come from the task's checklist; leave them out if the task has none). If you already have the lane's current status, use it; otherwise task = its "owns" sentence, state "idle", progress 0.
    - delete any older lanes doc for the same lane under a different id.
    - realm/progress: add the project's name to answered, and set updated.
 5. Check from each batch result, without reading again: the project has a projects doc, every roster lane has exactly one lanes doc, every product name matches a project exactly.
 6. If an owner hasn't answered by your next cycle, ask once more; carry on with everything else meanwhile.

OWNER SURVEY (send this to each owner):
"""
${ownerSurvey()}
"""`}
function overseerBrief(){const K=gameName(),R=rulerName(),U=artUrl();return `You are the Global overseer for ${K}, a live game-world view of ${R}'s Claude projects: ${U}
Each project is drawn as a town, each lane as a character with a building, and ${R} answers your asks and sends decrees from the castle. The page draws everything itself from a fixed set of town styles, buildings and characters: you only ever write short data records, never art, layouts or names for towns (${R} picks those on the page).

Use the ArtifactData tool on that URL. Collections: realm, projects, lanes, roadmaps, asks, decrees. Use "update" (merge) on docs that exist, so you never wipe fields someone else set. Writes to an existing doc need its version: keep the versions each write result gives you, and only read a doc again if a write is refused. Slugs: lower-case, each run of spaces or punctuation becomes one dash, no dash at either end ("Moss & Stone" is moss-stone). Times: ISO 8601 UTC, taken from a clock once per cycle.

KEEP IT RUNNING: run yourself with /loop and no interval (/loop Run the ${K} overseer cycle), so you set your own pace and ${K} stays live without ${R} prompting you. Keep Remote Control on so your owners can reach you.
PACE: at the end of every cycle, get realm/watch. If its "at" is under 3 minutes old (${R} has ${K} open), or a decree is still queued, wake again in 1 minute; otherwise in 15 minutes. A 1-minute wake is a QUICK LOOK: run only B1, B2 and B3, plus the heartbeat (task "Watching for decrees"); do the rest of the cycle only when 10 minutes have passed since the last full one.

KEEP IT CHEAP: this runs every cycle, so spend as few tokens as you can.
 - Never read the page itself. Read only what the steps below name; prefer get or a filtered query to listing a whole collection.
 - All of a cycle's writes go in one batch (the survey is the exception: each project is written as its owner answers). If nothing changed, the heartbeat is the only write.
 - Ask owners in one short message each, for one-line answers about only what changed since their last report. A task is one line, under 80 characters.
 - Survey only when part A says so.

CLOUD PROJECTS: a project whose projects doc has cloud true is kept by its own Product Owner in the cloud. Leave it alone: don't survey it, and don't touch its lanes, roadmap, asks or decrees.

A. SURVEY: the first time you read this, whenever a project or lane is added, removed or changes role, and when a decree to "overseer" asks for it: get realm/survey and follow its steps. If that doc doesn't exist yet, ask ${R} to open ${K} once, then carry on with part B.

B. EVERY CYCLE
 1. Two queries first: decrees where status == "queued", and asks where status == "answered" and relayed == false.
 2. decrees with a "lanes" list are for those lanes of that project ("to"), sent from a lane's speech bubble or the town's message button:
    - kind "message": deliver the text to each listed lane, quoted exactly and saying it came from ${R} via ${K}.
    - kind "nudge": tell each listed lane to check with its owner for its next task now; tell that project's owner to give those lanes their next task, and to restart its /loop if it has stopped.
    - A lane you can't reach (its session has stopped or Remote Control is off): pass its part to the owner instead, and set that lane's asleep true. If neither lane nor owner answers, set status "unreachable" with a one-line note on what ${R} should do (for example: reopen the Pip iOS session in Claude Code and turn Remote Control back on).
    - Otherwise set status "delivered", deliveredAt and deliveredTo, then "done" with a one-line note once the lane confirms.
    Other decrees: "to" is a project name, "all" (every owner) or "overseer" (for you: do it, then set status "done", deliveredTo "overseer" and a one-line note). Deliver the others to that project's owner the way you normally pass on ${R}'s instructions, quoting the text exactly and saying it came from ${R} via the throne room. Then set status "delivered", deliveredAt and deliveredTo (the lane you sent it to). If you can't reach that owner, leave it queued with a note saying why. When the owner reports back, set status "done" with a one-line note.
 3. answered asks: pass the answer to that project's owner, then set relayed true. If the project has its own roadmap and asks page, the owner records the answer there as if ${R} had replied on that page.
 4. lanes: ask each owner what changed for any lane in their project since their last report. For each changed lane update task, state (working | waiting | blocked | idle | done), stepsDone and stepsTotal (the lane's task checklist: steps ticked and steps in total; set progress to round(stepsDone/stepsTotal*100)), or progress 0-100 only for a task with no checklist, waitingOn (a few words on what it waits on or is blocked by), talkingTo (another project's name, if it works with one), helpers (running subagent tasks). Clear what stopped being true: waitingOn "", talkingTo "", helpers [], and asleep false for any lane that answered. Keep product and lane as they are.
 5. asks: each new question only ${R} can answer becomes asks/<project-slug>--<short-topic-slug> with project (exact name), title, detail, recommendation, urgent (true/false), status "open", createdAt, and ref (its id on the project's own asks page, if it has one). When an owner says ${R} answered one on the project's own page, set it status "answered", answer "Answered on the project's page", relayed true. Once per project, set projects/<slug>.page to the project's own roadmap and asks page, if it has one.
 6. roadmaps: when an owner reports roadmap progress, update that project's roadmaps doc: done, total, pct, next and steps (every ROADMAP.md checklist item in order as {step, done, phase}, at most 120). If a doc has no steps yet, ask its owner for the checklist once.
 7. One batch for everything above that changed, plus the HEARTBEAT: lanes/global-overseer with product "The Crown", role "global overseer", task (one line on this cycle), state "idle", updated now. The heartbeat goes in every cycle: it is how ${K} shows ${R} you are connected.

C. THE ROYAL COUNCIL (full cycles only; fold these into the same batch)
 1. LAWS: get realm/laws whenever its version changes. Tell each owner their project's laws (byProject[name], else the kingdom's level and crossings), and tell them again when they change. level "ask-all": lanes ask before anything ships; "ask-risky": lanes ship ordinary work and ask before crossing a listed law; "free": only the listed laws need an ask. Crossings: deploy, money, payments, data, delete, deps, secrets. A lane about to cross one raises an ask (with "law": the crossing) and waits for the answer.
 2. CURFEW: realm/laws.curfew. If maxLanes is above 0, don't let more than that many lanes work at once: tell owners to park the rest as waiting, waitingOn "curfew". If quiet is true, between from and to (${R}'s local time) hold non-urgent asks until the end and don't start new tasks.
 3. PROOF: every roadmap step marked done gets proof: "tested" if its tests or checks ran and passed, otherwise "unchecked". Never set "checked" and never remove it: only ${R} sets that, on the page.
 4. QUESTS: get realm/quests whenever its version changes. Tag each roadmap step with quest (a quest's id) when the step clearly serves it; leave it out when it serves none.
 5. REPORT: once a week per project (when report.updated is 7 days old or missing), ask its owner for a short update and set roadmaps/<slug>.report to {week (ISO week number), summary (two plain sentences for someone non-technical), shipped (up to 5), next (up to 5), risks (up to 3), updated}.
 6. CROSSROADS: when two lanes are changing the same files or area, or a project waits on another, set realm/crossroads to {clashes: [{a: lanes doc id, b: lanes doc id, area: a few words}], deps: [{from: project, to: project it waits on, why}], updated}. Remove entries that stopped being true.
 7. TREASURY (only if you can measure it, never guess): roadmaps/<slug>.spend = {usd7d (cost of the project's lanes over the last 7 days) or tokens7d, updated}.
 8. TEAM: lanes docs may carry lord (the teammate who runs them). Leave a lord you didn't set alone.`}
// For a project run in the cloud: its Product Owner (a scheduled task) keeps its town itself, so the overseer on
// the ruler's computer never has to. Pasted into that PO's prompt as part K.
function cloudBrief(name){const K=gameName(),R=rulerName(),U=artUrl(),sl=slug(name||'your-project'),N=name||'Your project';return `K. ${K.toUpperCase()}: ${U} shows ${N} as a town in ${R}'s kingdom. You keep that town current; the Global overseer leaves cloud projects alone. Use the artifact database tools (db_get, db_query, db_write) on that URL. Use "update" (merge) on docs that exist. Times are ISO 8601 UTC.
K1. ONCE, and whenever it changes: update projects/${sl} with name "${N}", cloud true, wake (this scheduled task's id, from list_triggers: it starts with trig_), page (your roadmap and asks page, if you have one), and lanes [{id, role, owns}] for every lane.
K2. DECREES FIRST: query decrees where to == "${N}" and status == "queued". Turn each into a GitHub issue for the right lane ("lanes" names them; otherwise choose), quoting the text exactly and saying it came from ${R} via the throne room. kind "nudge": comment on that lane's in-progress issue instead. Set status "delivered", deliveredTo "#<issue>", deliveredAt; when the issue closes, status "done" with a one-line note. Start any lane a decree concerns now (fire_trigger with its scheduled task's id) rather than waiting for its next run.
K3. ANSWERS FROM THE THRONE ROOM: query asks where project == "${N}", status == "answered" and relayed == false. Treat each exactly like ${R}'s reply on your own page (action "approve" means Approve; "reply" means the answer is his comment), close it on your page as usual, then set relayed true.
K4. EVERY CHECK-IN, one batch:
 - lanes/${sl}--<lane>: product "${N}", role, where ("cloud", or "local" for a lane on ${R}'s computer), task (its in-progress issue, as "#12 Farming loop", under 80 characters), state (working: an issue in progress; waiting: its PR waits on review, waitingOn "QA"; blocked: status:blocked, waitingOn a few words; idle: nothing in progress), updated now.
 - roadmaps/${sl}: done, total, pct, next, and steps (each roadmap item as {step, done, phase}, at most 120).
 - asks: every open ask for ${R} on your page becomes asks/${sl}--<ask id in lower case> with project "${N}", title, detail, recommendation, urgent, status "open", ref (the ask's id), createdAt. When an ask closes on your page (${R} replied there), set it status "answered", answer "Answered on the project's page", relayed true.
K5. When your run starts with a message beginning "Kingdom of Agents:", ${R} has just sent something from the kingdom: do K2 and K3 first, then the rest of your check-in.`}
function initCourt(){
setInterval(()=>watchPing(),60e3);document.addEventListener('visibilitychange',()=>watchPing());
$('decreeForm').addEventListener('submit',async e=>{e.preventDefault();const ta=$('decreeText'),txt=ta.value.trim();if(!txt){ta.focus();return}
  const to=recipBoxes().filter(i=>i.checked).map(i=>i.value);if(!to.length){toast('Choose at least one town');recipBoxes()[0]?.focus();return}
  $('decreeSend').disabled=true;const ok=await sendDecree(to,txt);$('decreeSend').disabled=false;if(ok)ta.value=''});
$('recipAll').addEventListener('click',()=>{const b=recipBoxes(),all=b.every(i=>i.checked);b.forEach(i=>i.checked=!all);syncRecipAll()});
const copyBrief=async(btn,pre,label)=>{try{await navigator.clipboard.writeText(overseerBrief());btn.textContent='COPIED'}catch{const r=document.createRange();r.selectNodeContents(pre);const s=getSelection();s.removeAllRanges();s.addRange(r);btn.textContent='SELECTED, PRESS COPY'}setTimeout(()=>btn.textContent=label,2000)};
$('briefCopy').addEventListener('click',async e=>{try{await navigator.clipboard.writeText(overseerBrief());e.target.textContent='COPIED'}catch{const r=document.createRange();r.selectNodeContents($('brief'));const s=getSelection();s.removeAllRanges();s.addRange(r);e.target.textContent='SELECTED, PRESS COPY'}setTimeout(()=>e.target.textContent='COPY BRIEF',2000)});
}
function layoutCourt(){const mg=viewMargin(COURT.W,COURT.H);
  if(COURT.cv&&COURT.OX>=mg[0]&&COURT.OY>=mg[1])return;
  COURT.OX=mg[0];COURT.OY=mg[1];COURT.FW=COURT.W+2*COURT.OX;COURT.FH=COURT.H+2*COURT.OY;
  if(!COURT.cv)COURT.cv=document.createElement('canvas');COURT.cv.width=COURT.FW;COURT.cv.height=COURT.FH;COURT.ctx=COURT.cv.getContext('2d');COURT.ctx.imageSmoothingEnabled=false;COURT.bg=null}

function renderLink(){const el=document.getElementById('linkState');if(!el)return;el.textContent='';
  const q=DECREES.filter(d=>d.status==='queued'&&!String(d.id).startsWith('s-')),oldest=q.map(d=>d.createdAt).sort()[0];
  const row=(ok,txt)=>{const li=document.createElement('li');const b=document.createElement('b');b.textContent=ok===true?'●':ok===false?'●':'○';b.style.color=ok===true?'var(--ok)':ok===false?'var(--block)':'var(--wait)';li.append(b,document.createTextNode(' '+txt));el.appendChild(li)};
  row(LINK.store,LINK.store?'Connected to the shared store.':'Not connected to the shared store: open the page from claude.ai to go live.');
  row(LINK.overseer?(Date.now()-Date.parse(LINK.overseer)<3*3600e3):false,LINK.overseer?`Global overseer last checked in ${fmtAgo(LINK.overseer)==='now'?'just now':fmtAgo(LINK.overseer)+' ago'}.`:'The Global overseer has never checked in. Paste the setup prompt (in the throne room, or on the welcome card before the first survey) into your overseer session.');
  {const ros=[...PROJECTS.values()].reduce((n,p)=>n+p.lanes.length,0),quiet=lanes.filter(l=>l.unreported).length;
   const sv=[...PROJECTS.values()].filter(p=>p.lanes.length||p.pitch).length;
   row(LINK.store?(sv>0&&sv===PROJECTS.size):null,PROJECTS.size?(sv?`${sv} of ${PROJECTS.size} project${PROJECTS.size>1?'s':''} surveyed, ${ros} lane${ros===1?'':'s'} on the rosters${quiet?`, ${quiet} not reporting yet`:''}.`:`${PROJECTS.size} project${PROJECTS.size>1?'s':''} named, none surveyed yet: towns show only the lanes that report.`):LINK.store?'No projects surveyed yet. Towns are guessed from lane names until the overseer runs the survey.':'Showing the demo kingdom.')}
  row(LINK.lanes>0,LINK.lanes?`${LINK.lanes} live lane records, newest ${fmtAgo(LINK.newest)==='now'?'just now':fmtAgo(LINK.newest)+' ago'}.`:'No live lane records yet.');
  if(q.length)row(LINK.overseer&&oldest&&Date.parse(LINK.overseer)>=Date.parse(oldest)?null:false,`${q.length} decree${q.length>1?'s':''} waiting to be picked up${oldest?', oldest sent '+fmtAgo(oldest)+' ago':''}.`);
  if(STORE&&mode!=='sample'){const li=document.createElement('li'),b=document.createElement('button');b.type='button';b.className='btn small';b.textContent='ASK FOR A NEW SURVEY';b.style.marginTop='6px';
    b.onclick=()=>sendDecree(['overseer'],'Run the realm survey again: ask every owner for their project profile and lane roster, and update projects and lanes.');li.appendChild(b);el.appendChild(li)}}

// ===================== founding the realm: a short guided setup =====================
// 1 who rules  2 name the kingdom and castle  3 connect the overseer  4 (after the survey) style and name each town.
// Everything the person picks is written to the store by this page, so the overseer spends no tokens on it.
const ENGINE_VERSION='2.10.2';
const STYLE_INFO={
  capital:['Capital City','Stone walls, a keep and a fountain square. For your flagship.'],
  port:['Harbour Town','Docks, boats and nets. For marketplaces and anything that trades.'],
  village:['Meadow Village','Thatch, hay and hens. For family, care and community.'],
  river:['Riverside Hamlet','Log houses by the water. For media, sharing and social.'],
  arcane:['Arcane Glade','Stone towers in the pines. For research, learning and design.'],
  cave:["Hermit's Cave",'A lantern-lit cave with gold in the walls. For money, data and trading.'],
};
let REALM_LOADED=false,SURVEY_DOC=null,SURVEY_SEEN=false,SURVEY_PROGRESS=null;
// what step 3 says while the overseer works: checked in yet, and which owners have answered the survey
function connectState(){const P=SURVEY_PROGRESS;if(P&&P.asked.length){const got=P.asked.filter(n=>P.answered.includes(n)),wait=P.asked.filter(n=>!P.answered.includes(n));
    return `Survey sent to ${P.asked.length} project${P.asked.length>1?'s':''}. ${got.length} answered${got.length?': '+got.join(', '):''}.${wait.length?' Waiting on '+wait.join(', ')+'. Each town appears here as its owner answers.':''}`}
  return LINK.overseer?`Your overseer checked in ${fmtAgo(LINK.overseer)==='now'?'just now':fmtAgo(LINK.overseer)+' ago'}. It is asking each project's owner about their work; the first town appears here as soon as one answers.`:'Waiting for your overseer to check in\u2026'}
// written by the page (as its editor), read by the overseer only when it surveys: the long instructions stay out of every cycle
function syncSurvey(){if(!STORE||!SURVEY_SEEN||!USER||!OB.editor||!REALM.ruler)return;const steps=surveySteps();
  if(SURVEY_DOC&&SURVEY_DOC.engine===ENGINE_VERSION&&SURVEY_DOC.steps===steps)return;SURVEY_DOC={engine:ENGINE_VERSION,steps};STORE.doc('realm/survey').set({engine:ENGINE_VERSION,steps,updated:new Date().toISOString()}).catch(()=>{})}
// shown once the towns are built, and kept in the menu: how the kingdom stays busy and how the game updates
function LIVE_TIPS(){return [
  ['Keep the lanes running.','Give every session Remote Control and let each Owner run on a /loop. The Set up your lanes guide has a prompt for every role.'],
  ['Cloud projects.','A project run in the cloud from its GitHub repo keeps its own town: its Product Owner adds one part to its prompt (Set up your lanes has it), and your decrees and answers wake it straight away.'],
  ['Decrees in a minute.',`Run your overseer on /loop with no time (/loop Run the ${gameName()} overseer cycle). It checks every minute while this page is open, so decrees and answers arrive in a minute or two.`],
  ['Wake the idle ones.','A lane resting in the tavern has run out of work or gone quiet. Tap it and choose Get back to work.'],
  ['Get new versions.',UPDATE_TIP]]}
const UPDATE_TIP='Kingdom of Agents comes as a Claude plugin, and new versions reach the plugin on their own. To bring this page up to date, say “Update my Kingdom of Agents” to Claude: it republishes the page and keeps your towns, lanes and charter.';
const OB={step:null,welcomed:(()=>{try{return localStorage.getItem('kingdom-welcomed')==='1'}catch{return false}})(),monarch:'',ruler:'',kingdom:'',castle:'',kSeed:0,cSeed:0,towns:{},tSeed:{},dismissed:false,restyle:false,editor:true,saving:false};
let USER=null;

// ---- name generators: only words from the person's own name, set in a few classic patterns ----
function nameWords(n){return String(n||'').replace(/[^a-z0-9 '-]/gi,' ').split(/\s+/).filter(w=>w.length>2&&!/^(ltd|inc|llc|plc|gmbh|the|and)$/i.test(w)).map(cap)}
function pickN(arr,n,seed){const a=[...new Set(arr)].filter(Boolean);const out=[];let s=seed*7919+13;while(a.length&&out.length<n){s=(s*1103515245+12345)>>>0;out.push(a.splice(s%a.length,1)[0])}return out}
function kingdomIdeas(ruler,seed){const ws=nameWords(ruler);if(!ws.length)return [];const full=ws.join(' '),last=ws[ws.length-1],first=ws[0],lw=last.toLowerCase();
  const dom=lw.endsWith('ing')||lw.endsWith('ly')||last.length>=5?ws.slice(0,-1).concat(last+'dom').join(' '):null;
  return pickN([dom,'Kingdom of '+full,'The '+full+' Realm',first+'shire',last+'land','The '+last+' Reach','Isles of '+last,first+'heim','Greater '+last,'The '+first+' Marches','Free Cities of '+last,last+'vale'],6,seed)}
function castleIdeas(ruler,kingdom,seed){const ws=nameWords(ruler).concat(nameWords(kingdom).filter(w=>!/^(kingdom|of|the|realm|isles|greater|free|cities|reach|marches)$/i.test(w)));if(!ws.length)return [];
  const a=ws[ws.length-1].replace(/dom$/,''),b=ws[0],al=a.toLowerCase();
  return pickN(['Castle '+a+'stone','Castle '+b,b+'hold',a+' Keep','Fort '+a,'The '+b+' Bastion',a+'spire Citadel','Castle '+a,b+'gard'],6,seed)}
function townIdeas(name,kind,seed){const w=townWord(name),lw=w.toLowerCase(),g=s=>w+(lw.endsWith(s[0])?s.slice(1):s);
  const pools={capital:[g('polis'),g('chester'),'High '+w,'Kings '+w,g('ton'),w+' Royal'],port:['Port '+w,w+' Harbour',g('haven'),w+' Quay','Saint '+w,g('mouth')],
    village:['Little '+g('bury'),g('ham'),w+' Green',g('wick'),'Upper '+w,g('field')],river:[g('brook'),g('ford'),w+' Mill',g('water'),w+' Crossing',g('bridge')],
    arcane:[w+' Spire',w+' Tower',g('mere'),'The '+w+' Observatory',w+' Glade',g('hallow')],cave:[w+' Hollow',w+' Deep',w+' Delve',w+' Vault',w+' Mines',w+' Undercroft']};
  return pickN(pools[kind]||pools.village,4,seed)}
// why a style is recommended, in the project's own words
function styleReason(p,kind){if(kind==='capital')return 'your biggest project';const re=THEME_WORDS[kind];if(!re||!p)return '';
  const txt=[p.name,p.pitch,p.audience,...p.tags].join(' ').toLowerCase();const m=[...new Set((txt.match(new RegExp(re.source,'g'))||[]).map(x=>x.trim()))].slice(0,3);return m.length?'it mentions '+m.join(', '):''}

// ---- postcards: each style drawn from the game's own town art, so what you pick is exactly what you get ----
const POSTCARD={};
function townPostcard(kind){if(POSTCARD[kind])return POSTCARD[kind];
  const v=makeVillage('Postcard '+kind);v.thKey=kind;v.th=THEMES[kind];v.sig='postcard';
  v.lanes=['owner','design','ios','backend','website','analyst'].map((r,i)=>{const L=sanitize({id:'pc-'+kind+'-'+r,product:v.name,role:r,state:'working',progress:100});L.info=roleInfo(L.role,L.id,true);L.T=TYPES[L.info.type];return L});v.full=true;
  // one real frame of the town, buildings and all, cropped to its walls
  LIGHT_DAY=true;WX_FORCE='clear';try{layoutTown(v);for(let k=0;k<3;k++)stepTown(v,.05,k*.05);drawTown(v,.2,.05)}catch(e){try{layoutTown(v)}catch(_){return null}}finally{LIGHT_DAY=false;WX_FORCE=null}
  const c=document.createElement('canvas');c.width=v.W;c.height=v.H;const x=c.getContext('2d');x.imageSmoothingEnabled=false;x.drawImage(v.cv,v.OX,v.OY,v.W,v.H,0,0,v.W,v.H);
  return POSTCARD[kind]=c}
function postcardInto(cv,kind){const src=townPostcard(kind);if(!src)return;const w=cv.width,h=cv.height;
  // always the top rows of buildings: every town's inn sits lower down, so cropping from the top keeps the styles apart
  const sh=Math.min(src.height,src.width*h/w),sw=sh*w/h;const x=cv.getContext('2d');x.imageSmoothingEnabled=false;x.drawImage(src,(src.width-sw)/2,0,sw,sh,0,0,w,h)}

// ---- which step, if any ----
function unclaimed(){return [...PROJECTS.values()].filter(p=>!p.place)}
function obStep(){
  if(!STORE||!REALM_LOADED||mode==='sample'||active)return null;
  if(OB.restyle)return 'towns';
  if(!REALM.ruler&&!OB.ruler||OB.step==='ruler')return 'ruler';
  if(OB.step==='names'||((REALM.ruler||OB.ruler)&&!REALM.kingdom))return 'names';
  if(mode==='empty')return 'connect';
  if(unclaimed().length&&!OB.dismissed&&OB.editor)return 'towns';
  if(OB.editor&&!OB.welcomed&&PROJECTS.size&&!unclaimed().length)return 'live';
  return null}
function renderOnboard(){const el=document.getElementById('onboard');if(!el)return;
  const db=$('demoBar');if(db){db.hidden=!(STORE&&mode==='sample'&&!active);if(!db.onclick)db.onclick=()=>window.__leaveDemo&&window.__leaveDemo()}
  const step=obStep();el.hidden=!step;document.body.classList.toggle('onboarding',!!step);if(!step)return;
  const card=$('obCard');const keepFocus=document.activeElement&&card.contains(document.activeElement)?document.activeElement.id:null;
  if(card.dataset.step===step&&step==='ruler')return;
  if(step==='connect'&&card.dataset.step==='connect'&&card.dataset.ready==='1'){$('obState').textContent=connectState();return}
  if(step==='towns'&&card.dataset.step==='towns'&&card.dataset.sig===unclaimed().map(p=>p.id).join(',')+OB.restyle)return;
  card.dataset.step=step;card.dataset.ready='';card.innerHTML='';const add=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;card.appendChild(e);return e};
  const dots=add('div','obdots');if(step==='live')dots.hidden=true;['ruler','names','connect','towns'].forEach((s,i)=>{const d=document.createElement('i');if(s===step)d.className='on';dots.appendChild(d)});dots.setAttribute('aria-label','Step '+(['ruler','names','connect','towns'].indexOf(step)+1)+' of 4');
  if(!OB.editor&&step!=='connect'){add('p','obkick','A NEW REALM');add('h2',null,'This kingdom is still being founded');add('p',null,'The person who owns this page will set it up. Check back soon.');return}
  if(step==='ruler'){
    add('p','obkick','FOUND YOUR REALM · 1 OF 4');add('h2',null,'Every project you run with Claude becomes a town');
    add('p',null,'Each lane becomes a character at work in it, and you rule from the castle: answer their questions and send decrees. First, who rules?');
    const l=add('label','f','YOUR NAME OR YOUR COMPANY’S');l.htmlFor='obRuler';const i=add('input');i.id='obRuler';i.placeholder='e.g. Ben, or Pip Living';i.value=OB.ruler||REALM.ruler||'';i.autocomplete='organization';
    // King or Queen: the ruler on the throne, and every title in the game, follow this
    if(!OB.monarch)OB.monarch=REALM.monarch||'king';
    const ml=add('p','obflabel','RULE AS');ml.id='obMonLbl';const mg=add('div','monarchs');mg.setAttribute('role','radiogroup');mg.setAttribute('aria-labelledby','obMonLbl');
    for(const [k,lab] of [['king','KING'],['queen','QUEEN']]){const b=document.createElement('button');b.type='button';b.className='monarch'+(OB.monarch===k?' on':'');b.setAttribute('role','radio');b.setAttribute('aria-checked',String(OB.monarch===k));
      const cv=document.createElement('canvas');cv.width=36;cv.height=50;const c=cv.getContext('2d');c.imageSmoothingEnabled=false;const prev=REALM.monarch;REALM.monarch=k;const sp=classFor('overseer','#f2c94c','overseer');REALM.monarch=prev;
      drawHero(c,18,47,Object.assign({},sp,{dir:'down',pose:'idle',frame:0,breath:1}));const t=document.createElement('b');t.textContent=lab;b.append(cv,t);
      b.onclick=()=>{OB.monarch=k;mg.querySelectorAll('.monarch').forEach(x=>{const on=x===b;x.classList.toggle('on',on);x.setAttribute('aria-checked',String(on))});sfx('blip',.6)};mg.appendChild(b)}
    const acts=add('div','obacts'),go=document.createElement('button');go.type='button';go.className='btn primary';go.textContent='NEXT ▸';
    const demo=document.createElement('button');demo.type='button';demo.className='btn';demo.textContent='LOOK AROUND A DEMO FIRST';demo.onclick=()=>window.__showDemo&&window.__showDemo();acts.append(go,demo);
    const next=()=>{const v=i.value.trim();if(!v){i.focus();i.setAttribute('aria-invalid','true');return}OB.ruler=v.slice(0,24);OB.step='names';OB.kingdom='';OB.castle='';sfx('blip');renderOnboard()};
    go.onclick=next;i.onkeydown=e=>{if(e.key==='Enter')next()};setTimeout(()=>i.focus(),50);return}
  if(step==='names'){
    const ruler=OB.ruler||REALM.ruler;
    add('p','obkick','FOUND YOUR REALM · 2 OF 4');add('h2',null,'Name your kingdom and its castle');add('p',null,'Pick a suggestion or write your own. You can change them later.');
    const field=(label,id,val,ideas,onPick,onShuffle)=>{const l=add('label','f',label);l.htmlFor=id;const i=add('input');i.id=id;i.value=val;
      const row=add('div','chips2');for(const n of ideas){const b=document.createElement('button');b.type='button';b.className='chip'+(n===i.value?' on':'');b.textContent=n;b.setAttribute('aria-pressed',String(n===i.value));b.onclick=()=>{onPick(n);sfx('blip',.6);renderOnboard()};row.appendChild(b)}
      const sh=document.createElement('button');sh.type='button';sh.className='chip shuffle';sh.textContent='↻ MORE';sh.setAttribute('aria-label','More '+label.toLowerCase()+' ideas');sh.onclick=()=>{onShuffle();renderOnboard()};row.appendChild(sh);return i};
    const kIdeas=kingdomIdeas(ruler,OB.kSeed);if(!OB.kingdom)OB.kingdom=REALM.kingdom||kIdeas[0]||'';
    const cIdeas=castleIdeas(ruler,OB.kingdom,OB.cSeed);if(!OB.castle)OB.castle=REALM.castle||cIdeas[0]||'';
    card.dataset.step='';
    const ki=field('KINGDOM','obKingdom',OB.kingdom,kIdeas,n=>{OB.kingdom=n},()=>OB.kSeed++);ki.oninput=()=>{OB.kingdom=ki.value.slice(0,32)};
    const ci=field('CASTLE','obCastle',OB.castle,cIdeas,n=>{OB.castle=n},()=>OB.cSeed++);ci.oninput=()=>{OB.castle=ci.value.slice(0,32)};
    const acts=add('div','obacts'),back=document.createElement('button'),go=document.createElement('button');back.type='button';back.className='btn';back.textContent='◂ BACK';go.type='button';go.className='btn primary';go.textContent='FOUND THE KINGDOM ▸';acts.append(back,go);
    back.onclick=()=>{OB.step='ruler';renderOnboard()};
    go.onclick=async()=>{const k=(OB.kingdom||'').trim(),c=(OB.castle||'').trim();if(!k){ki.focus();return}if(!c){ci.focus();return}
      go.disabled=true;const cfg={ruler:ruler,monarch:OB.monarch||REALM.monarch||'king',kingdom:k,castle:c,kid:REALM.kid||(CHARTER.p&&CHARTER.p.k)||newKid()};if(LOCAL_URL&&!REALM.url)cfg.url=LOCAL_URL;
      try{await STORE.doc('realm/config').set(Object.assign({},REALM,cfg));REALM=Object.assign({},REALM,cfg);applyRealmNames();OB.step=null;sfx('fanfare');renderOnboard();renderCourt()}catch(e){go.disabled=false;toast('Could not save. Try again.')}};
    if(keepFocus&&$(keepFocus))$(keepFocus).focus();return}
  if(step==='connect'){
    card.dataset.ready='1';
    add('p','obkick','FOUND YOUR REALM · 3 OF 4');add('h2',null,`Summon the overseer of ${gameName()}`);
    add('p',null,'Your overseer is one Claude Code session that looks after all your projects. Give it one prompt: it asks each project about its work, builds the towns here, and keeps them up to date from then on.');
    const ol=add('ol','obsteps');const li=(head,body)=>{const e=document.createElement('li');const b=document.createElement('b');b.textContent=head;e.append(b,document.createTextNode(' '+body));ol.appendChild(e);return e};
    li('Open your overseer.','In Claude Code, open the session that coordinates your projects, or start one in the folder that holds them. Turn on Remote Control (/remote-control) so it can reach your other sessions.');
    let u=null;if(!REALM.url){const l2=li('Paste this page’s link.','Copy it from the Share menu, so the overseer knows where to write.');u=document.createElement('input');u.id='obUrl';u.type='url';u.inputMode='url';u.placeholder='https://claude.ai/artifact/…';u.setAttribute('aria-label','This page’s link');u.value=LOCAL_URL;l2.appendChild(u)}
    const l3=li('Paste the setup prompt into it.','Copy it here, then paste it as a message to your overseer.');const cp=document.createElement('button');cp.type='button';cp.className='btn primary';cp.id='obCopy';cp.textContent='COPY THE SETUP PROMPT';const cpw=document.createElement('div');cpw.className='obinline';cpw.appendChild(cp);l3.appendChild(cpw);
    li('Keep it running.',`When the first cycle is done, send it: /loop Run the ${gameName()} overseer cycle. Leave out the time, so it checks every minute while this page is open (decrees and answers arrive in a minute or two) and every 15 minutes otherwise. Keep that Claude Code window open and your computer awake.`);
    li('Watch the towns arrive.','Leave this page open. Each town appears as its owner answers, then you choose how it looks.');
    const st=add('p','obstate');st.id='obState';st.setAttribute('role','status');st.textContent=connectState();
    const det=add('details');const sm=document.createElement('summary');sm.textContent='SHOW THE SETUP PROMPT';const pre=document.createElement('pre');pre.id='obBrief';pre.textContent=overseerBrief();det.append(sm,pre);
    const acts=add('div','obacts'),back=document.createElement('button'),gd=document.createElement('button');back.type='button';back.className='btn';back.textContent='◂ BACK';back.onclick=()=>{OB.step='names';card.dataset.ready='';renderOnboard()};
    gd.type='button';gd.className='btn';gd.textContent='NEW TO LANES? SET THEM UP';gd.onclick=()=>openGuide(0);acts.append(back,gd);
    if(u)u.oninput=()=>{const v=u.value.trim();LOCAL_URL=/^https:\/\/claude\.ai\//.test(v)?v:'';try{localStorage.setItem('kingdom-url',LOCAL_URL)}catch{}pre.textContent=overseerBrief();u.setAttribute('aria-invalid',String(!!v&&!LOCAL_URL));
      if(LOCAL_URL&&STORE&&OB.editor&&REALM.ruler&&REALM.url!==LOCAL_URL){STORE.doc('realm/config').update({url:LOCAL_URL}).catch(()=>{})}};
    cp.onclick=async()=>{if(u&&!LOCAL_URL&&!REALM.url){u.focus();u.setAttribute('aria-invalid','true');toast('Paste this page’s link first');return}try{await navigator.clipboard.writeText(overseerBrief());cp.textContent='COPIED'}catch{const r=document.createRange();r.selectNodeContents(pre);det.open=true;const s=getSelection();s.removeAllRanges();s.addRange(r);cp.textContent='SELECTED, PRESS COPY'}setTimeout(()=>cp.textContent='COPY THE SETUP PROMPT',2000)};
    return}
  if(step==='live'){
    add('p','obkick','YOUR REALM IS LIVE');add('h2',null,`Long live ${rulerName()}`);
    add('p',null,'Your towns are built. Three things keep the kingdom busy:');
    const ul=add('ul','obsteps');for(const [h,t] of LIVE_TIPS()){const e=document.createElement('li');const b=document.createElement('b');b.textContent=h;e.append(b,document.createTextNode(' '+t));ul.appendChild(e)}
    const acts=add('div','obacts'),go=document.createElement('button'),gd=document.createElement('button');go.type='button';go.className='btn primary';go.textContent='ENTER THE KINGDOM ▸';gd.type='button';gd.className='btn';gd.textContent='SET UP YOUR LANES';acts.append(go,gd);
    const done=()=>{OB.welcomed=true;try{localStorage.setItem('kingdom-welcomed','1')}catch{}card.dataset.step='';renderOnboard()};go.onclick=()=>{sfx('fanfare');done()};gd.onclick=()=>{done();openGuide(0)};setTimeout(()=>go.focus(),50);return}
  if(step==='towns'){
    const list=OB.restyle?[...PROJECTS.values()]:unclaimed();card.dataset.sig=unclaimed().map(p=>p.id).join(',')+OB.restyle;
    add('p','obkick',OB.restyle?'RESTYLE YOUR TOWNS':'FOUND YOUR REALM · 4 OF 4');add('h2',null,OB.restyle?'Choose how each town looks':(list.length>1?`${list.length} towns have answered the call`:'A town has answered the call'));
    add('p',null,'We’ve picked a style for each from what its owner told us. Change any you like, and choose a name.');
    {const P=SURVEY_PROGRESS,wait=P&&!OB.restyle?P.asked.filter(n=>!P.answered.includes(n)&&!PROJECTS.has(n.toLowerCase())):[];if(wait.length)add('p','obstate','Still waiting on '+wait.join(', ')+'. Their towns will appear when they answer; you can carry on meanwhile.')}
    for(const p of list){const v=villages.get(p.name),rec=THEME_PICK.get(p.name)||'village',cur=OB.towns[p.id]||(OB.towns[p.id]={kind:p.kind||rec,place:p.place||''});
      const box=add('section','obtown');const h=document.createElement('h3');h.textContent=p.name;const sub=document.createElement('p');sub.className='obsub';sub.textContent=[p.pitch,p.lanes.length?p.lanes.length+' lanes':''].filter(Boolean).join(' · ');box.append(h,sub);
      const grid=document.createElement('div');grid.className='styles';grid.setAttribute('role','radiogroup');grid.setAttribute('aria-label','Town style for '+p.name);
      for(const k of KINDS){const b=document.createElement('button');b.type='button';b.className='style'+(cur.kind===k?' on':'');b.setAttribute('role','radio');b.setAttribute('aria-checked',String(cur.kind===k));
        const cv=document.createElement('canvas');cv.width=176;cv.height=110;postcardInto(cv,k);const t=document.createElement('b');t.textContent=STYLE_INFO[k][0];const d=document.createElement('span');d.textContent=STYLE_INFO[k][1];b.append(cv,t,d);
        if(!premium()&&!FREE_KINDS.includes(k)){const lk=document.createElement('i');lk.className='lockb';lk.textContent='🔒 ROYAL CHARTER';b.appendChild(lk);b.setAttribute('aria-label',STYLE_INFO[k][0]+', part of the Royal Charter')}
        if(k===rec){const r=document.createElement('em');r.textContent='RECOMMENDED';b.appendChild(r);const why=styleReason(p,k);if(why)b.title='Recommended because '+why}
        b.onclick=()=>{cur.kind=k;if(!cur.custom)cur.place='';sfx('blip',.6);card.dataset.sig='';renderOnboard()};grid.appendChild(b)}
      box.appendChild(grid);
      const why=styleReason(p,rec);if(why){const w=document.createElement('p');w.className='obsub';w.textContent=`We recommend ${STYLE_INFO[rec][0]} because ${why}.`;box.appendChild(w)}
      if(!premium()&&!FREE_KINDS.includes(cur.kind)){const w=document.createElement('p');w.className='obsub';w.textContent=`${STYLE_INFO[cur.kind][0]} is part of the Royal Charter. Until your kingdom holds one, this town shows as a Meadow Village; buy it any time from the Curiosity Tent.`;box.appendChild(w)}
      const ideas=townIdeas(p.name,cur.kind,OB.tSeed[p.id]||0);if(!cur.place)cur.place=ideas[0];
      const l=document.createElement('label');l.className='f';l.textContent='TOWN NAME';l.htmlFor='obTown-'+p.id;const i=document.createElement('input');i.id='obTown-'+p.id;i.value=cur.place;i.oninput=()=>{cur.place=i.value.slice(0,28);cur.custom=true};
      const row=document.createElement('div');row.className='chips2';for(const n of ideas){const b=document.createElement('button');b.type='button';b.className='chip'+(n===cur.place?' on':'');b.textContent=n;b.setAttribute('aria-pressed',String(n===cur.place));b.onclick=()=>{cur.place=n;cur.custom=false;card.dataset.sig='';renderOnboard()};row.appendChild(b)}
      const sh=document.createElement('button');sh.type='button';sh.className='chip shuffle';sh.textContent='↻ MORE';sh.setAttribute('aria-label','More names for '+p.name);sh.onclick=()=>{OB.tSeed[p.id]=(OB.tSeed[p.id]||0)+1;if(!cur.custom)cur.place='';card.dataset.sig='';renderOnboard()};row.appendChild(sh);
      box.append(l,i,row)}
    const acts=add('div','obacts'),go=document.createElement('button'),later=document.createElement('button');go.type='button';go.className='btn primary';go.textContent=OB.restyle?'SAVE ▸':'BUILD THE TOWNS ▸';later.type='button';later.className='btn';later.textContent=OB.restyle?'CANCEL':'DECIDE LATER';acts.append(go,later);
    later.onclick=()=>{OB.dismissed=true;OB.restyle=false;card.dataset.step='';renderOnboard()};
    go.onclick=async()=>{go.disabled=true;try{for(const p of list){const c=OB.towns[p.id];if(!c||!c.place.trim())continue;await STORE.doc('projects/'+p.id).update({kind:c.kind,place:c.place.trim()})}
      OB.restyle=false;OB.towns={};card.dataset.step='';sfx('fanfare');toast('The towns are being built');renderOnboard()}catch(e){go.disabled=false;toast('Could not save. Try again.')}};
    if(keepFocus&&$(keepFocus))$(keepFocus).focus();return}
}
function openRestyle(){if(!STORE||mode!=='live'||!PROJECTS.size){toast('Towns can be restyled once your projects have reported in');return}OB.restyle=true;OB.towns={};$('obCard').dataset.step='';closeMenuIfOpen();renderOnboard()}
function closeMenuIfOpen(){const m=$('menu');if(m&&!m.hidden){const x=$('menuClose');x&&x.click()}}
(async()=>{try{if(!window.claude||!window.claude.use)return;const u=await window.claude.use('user');if(!u)return;USER=u;OB.editor=await u.canEdit();renderOnboard();syncSurvey()}catch(e){}})();

document.getElementById('restyleBtn').addEventListener('click',openRestyle);
document.getElementById('renameBtn').addEventListener('click',()=>{if(!STORE||mode==='sample'){toast('Rename your own kingdom once it is connected');return}OB.ruler=REALM.ruler;OB.monarch=REALM.monarch||'king';OB.kingdom=REALM.kingdom;OB.castle=REALM.castle;OB.step='ruler';closeMenuIfOpen();renderOnboard()});
document.getElementById('engineVer').textContent='Engine '+ENGINE_VERSION;{const u=document.getElementById('updTip');if(u)u.textContent='Updates: '+UPDATE_TIP}

// ===================== lane setup guide =====================
// A short walkthrough for setting up Claude the way the kingdom reads it best: one shared folder, a folder per project,
// a session per lane started in its project's folder, an overseer at the top, and a starter prompt for every lane.
const GROLES=[['owner','Owner','keeps the roadmap and hands work to the other lanes'],['design','Design','screens, flows and the design system'],['ios','iOS','the iPhone and iPad app'],['android','Android','the Android app'],
  ['web app','Web app','the web app'],['website','Website','the marketing site and landing pages'],['backend','Backend','APIs, data and services'],['data','Data','data pipelines and imports'],['qa','QA','testing and release checks'],
  ['content','Content','copy, help articles and guides'],['analyst','Analyst','analytics and reports'],['support','Support','the support inbox and user feedback'],['recipes','Recipes','food and recipe content'],['exercise','Exercise','fitness and exercise content'],['trading desk','Finance','finance and trading work']];
const GUIDE={page:0,open:false,root:'',projects:[]};
function guideLoad(){try{const g=JSON.parse(localStorage.getItem('pl-guide')||'null');if(g){GUIDE.root=g.root||'';GUIDE.projects=Array.isArray(g.projects)?g.projects:[]}}catch(e){}
  if(!GUIDE.root)GUIDE.root='~/Claude/'+(slug(gameName())||'kingdom');
  if(!GUIDE.projects.length){const real=[...PROJECTS.values()].filter(p=>mode!=='sample');GUIDE.projects=real.length?real.map(p=>({name:p.name,roles:(p.lanes||[]).map(l=>l.role).filter(r=>GROLES.some(g=>g[0]===r)),extra:''})):[{name:'',roles:['owner','design','backend'],extra:''}]}
  for(const p of GUIDE.projects)if(!p.roles.includes('owner'))p.roles.unshift('owner')}
function guideSave(){try{localStorage.setItem('pl-guide',JSON.stringify({root:GUIDE.root,projects:GUIDE.projects}))}catch(e){}}
const gFolder=n=>(slug(n)||'project');
const gRole=r=>(GROLES.find(g=>g[0]===r)||[r,r,''])[1];
const gProjects=()=>GUIDE.projects.filter(p=>p.name.trim());
function guideTree(){const ps=gProjects(),R=GUIDE.root.replace(/\/+$/,'');let s=R+'/            ← the overseer session starts here\n';
  ps.forEach((p,i)=>{const last=i===ps.length-1;s+=(last?'└── ':'├── ')+gFolder(p.name)+'/'+'\n';p.roles.forEach((r,k)=>{s+=(last?'    ':'│   ')+(k===p.roles.length-1?'└── ':'├── ')+'session: '+p.name.trim()+' · '+gRole(r)+(p.extra&&r!=='owner'&&/web|site/.test(r)?'   (+ '+p.extra+')':'')+'\n'})});
  if(!ps.length)s+='└── your-project/\n    └── session: Your project · Owner\n';return s}
function guideMkdir(){const ps=gProjects();if(!ps.length)return 'mkdir -p '+GUIDE.root+'/your-project';return 'mkdir -p '+GUIDE.root+'/'+(ps.length>1?'{'+ps.map(p=>gFolder(p.name)).join(',')+'}':gFolder(ps[0].name))}
function ownerPrompt(p){const R=rulerName(),others=p.roles.filter(r=>r!=='owner').map(r=>`${gRole(r)} (${(GROLES.find(g=>g[0]===r)||[])[2]||'its own area'})`);
  return `You are the Owner lane for ${p.name.trim()}. You keep the roadmap, decide what each lane works on next and hand work to them.
The other lanes for this project are separate sessions in this folder: ${others.length?others.join('; '):'none yet'}.

- Run yourself on a loop so the project never stalls: start with /loop 15m Check in with each lane, give any lane without work its next task, update ROADMAP.md and report anything new. If the loop stops, start it again.
- Keep Remote Control on (/remote-control), so the overseer and your lanes can reach you.
- Keep a short ROADMAP.md in this folder: the milestones as a checklist, so you can always say how many steps are done out of the total and what is next. When you report roadmap progress, send the checklist too: each item, whether it is done and the heading it sits under.
- Give every lane its task as a roadmap item broken into 3 to 8 small steps, written as a checklist under that item in ROADMAP.md. Each lane ticks its steps as it finishes them, and its building in the kingdom grows one stage per step. When you report a lane, say how many of its steps are done out of the total. Read it at the start of every session.
- Give each lane one clear next task at a time, and check in on what changed when you start.
- When the overseer asks for a report, give each lane in one line: its task, its state (working, waiting, blocked, idle or done), progress as a percentage, and what it is waiting on.
- If something needs ${R}'s decision, write it as one short question with your recommendation, so the overseer can put it in front of ${R}.
- Instructions from ${R} reach you through the overseer as decrees. Act on those first.
- Keep your replies short. Don't read files or run tools just to answer a status question.`}
function lanePrompt(p,r){const what=(GROLES.find(g=>g[0]===r)||[])[2]||'its own area',extra=p.extra&&/web|site/.test(r)?` You also work in ${p.extra}; it's added to this session as a second folder.`:'';
  return `You are the ${gRole(r)} lane for ${p.name.trim()}. You own ${what}.${extra}

- Keep Remote Control on (/remote-control), so the Owner and the overseer can reach you.
- Work through your task as the checklist of steps the Owner gave you, and tick each step in ROADMAP.md as you finish it. Report your progress as steps done out of the total, for example 2 of 5.
- Take your next task from the Owner lane. Work on one task at a time. When you finish, ask the Owner for the next one straight away rather than waiting.
- When you finish something or get stuck, tell the Owner in one line: what you did, what is next, and anything you're waiting on.
- Stay within your role. If work belongs to another lane, hand it back to the Owner rather than doing it yourself.
- Use sub-agents for side jobs (tests, research, clean-up). They show up in the kingdom as apprentices beside your building.
- Keep updates short.`}
function guidePlan(){const ps=gProjects();let s=`# ${gameName()}: lane setup\n\nShared folder: ${GUIDE.root}\n\nCreate the folders:\n\n    ${guideMkdir()}\n\n## Overseer\nStart one session in ${GUIDE.root}, turn on Remote Control and paste the overseer prompt from the kingdom's setup card. Then keep it running with /loop Run the ${gameName()} overseer cycle (no time: it checks every minute while the kingdom is open, every 15 minutes otherwise).\n`;
  for(const p of ps){s+=`\n## ${p.name.trim()} (${GUIDE.root}/${gFolder(p.name)})\n`;for(const r of p.roles){s+=`\n### Session: ${p.name.trim()} · ${gRole(r)}\n\n${(r==='owner'?ownerPrompt(p):lanePrompt(p,r)).replace(/^/gm,'    ')}\n`}}return s}
async function gCopy(btn,text,label){try{await navigator.clipboard.writeText(text);btn.textContent='COPIED'}catch(e){btn.textContent='COPY FAILED, SELECT THE TEXT'}setTimeout(()=>btn.textContent=label,1800)}
function openGuide(page){guideLoad();GUIDE.open=true;GUIDE.page=page||0;$('guide').hidden=false;document.body.classList.add('in-guide');renderGuide();sfx('blip')}
function closeGuide(){GUIDE.open=false;$('guide').hidden=true;document.body.classList.remove('in-guide');guideSave()}
function renderGuide(){const card=$('guideCard');card.textContent='';const N=5,pg=GUIDE.page;
  const add=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;card.appendChild(e);return e};
  const x=add('button','x guideX');setIcon(x,'close');x.type='button';x.setAttribute('aria-label','Close the guide');x.onclick=closeGuide;
  add('p','obkick',`SET UP YOUR LANES · ${pg+1} OF ${N}`);
  if(pg===0){add('h2',null,'How your kingdom is wired');
    add('p',null,'Each project is a town and each lane is a separate Claude session working on one part of it. The kingdom reads best when it is set up like this:');
    const ul=add('ul');[['The overseer','one session at the top that looks after every project, reports to this page and brings you their questions.'],['An Owner lane per project','keeps the roadmap and hands work to the other lanes.'],['A lane per role','design, iOS, backend and so on, each in its own session, taking work from the Owner.']].forEach(([b,t])=>{const li=document.createElement('li'),s=document.createElement('b');s.textContent=b+': ';li.append(s,document.createTextNode(t));ul.appendChild(li)});
    add('pre','gtree','You (in the castle)\n   │ decrees ▼        ▲ asks\nOverseer session\n   │ ▼ status        ▲ reports\nOwner lane, one per project\n   │ ▼ tasks         ▲ one-line updates\nDesign · iOS · Backend · QA · … lanes');
    add('p','obstate','The next steps build your folder layout, show how to keep each project’s lanes together in Claude’s Code view, and write a starter prompt for every lane.')}
  if(pg===1){add('h2',null,'One shared folder, a folder per project');
    add('p',null,'Put every project in one parent folder. The overseer starts there; each project’s lanes start in that project’s folder.');
    const l=add('label','glabel','Shared folder');const ri=document.createElement('input');ri.value=GUIDE.root;ri.setAttribute('aria-label','Shared folder');l.appendChild(ri);
    const list=add('div','gprojects');const draw=()=>{list.textContent='';GUIDE.projects.forEach((p,i)=>{const row=document.createElement('div');row.className='grow';const n=document.createElement('input');n.placeholder='Project name';n.value=p.name;n.setAttribute('aria-label','Project '+(i+1)+' name');
      n.oninput=()=>{p.name=n.value.slice(0,40);tree.textContent=guideTree();mk.textContent=guideMkdir();guideSave()};const rm=document.createElement('button');rm.type='button';rm.className='btn small';rm.textContent='REMOVE';rm.setAttribute('aria-label','Remove project '+(p.name||i+1));
      rm.onclick=()=>{GUIDE.projects.splice(i,1);if(!GUIDE.projects.length)GUIDE.projects.push({name:'',roles:['owner'],extra:''});draw();tree.textContent=guideTree();mk.textContent=guideMkdir();guideSave()};row.append(n,rm);list.appendChild(row)})};
    const addP=add('button','btn small','+ ADD A PROJECT');addP.type='button';addP.onclick=()=>{GUIDE.projects.push({name:'',roles:['owner','design','backend'],extra:''});draw();list.lastChild&&list.lastChild.querySelector('input').focus()};
    const tree=add('pre','gtree',guideTree());add('p','obstate','To create the folders in a terminal:');const mk=add('pre','gtree',guideMkdir());
    const cpm=add('button','btn small','COPY THE COMMAND');cpm.type='button';cpm.onclick=()=>gCopy(cpm,guideMkdir(),'COPY THE COMMAND');
    ri.oninput=()=>{GUIDE.root=ri.value.trim().slice(0,80)||'~/Claude';tree.textContent=guideTree();mk.textContent=guideMkdir();guideSave()};draw()}
  if(pg===2){add('h2',null,'Choose each project’s lanes');
    add('p',null,'Every project needs an Owner. Add a lane for each role someone (or something) works on. Each lane becomes a character in the town.');
    for(const p of gProjects().length?gProjects():GUIDE.projects){const box=add('fieldset','gfs');const lg=document.createElement('legend');lg.textContent=p.name.trim()||'Your project';box.appendChild(lg);const chips=document.createElement('div');chips.className='gchips';
      for(const [r,lab] of GROLES){const b=document.createElement('button');b.type='button';b.className='gchip';b.textContent=lab;const on=p.roles.includes(r);b.setAttribute('aria-pressed',String(on));if(r==='owner')b.disabled=true;
        b.onclick=()=>{const i=p.roles.indexOf(r);if(i>=0)p.roles.splice(i,1);else p.roles.push(r);b.setAttribute('aria-pressed',String(i<0));guideSave()};chips.appendChild(b)}
      box.appendChild(chips);const ex=document.createElement('input');ex.placeholder='Optional: another folder the web lanes work in, e.g. ~/Code/site';ex.value=p.extra||'';ex.setAttribute('aria-label',`Extra folder for ${p.name||'this project'}’s web lanes`);ex.oninput=()=>{p.extra=ex.value.trim().slice(0,80);guideSave()};box.appendChild(ex)}
    add('p','obstate','Free kingdoms show Owners as Lords and every other lane as an Adventurer. With the Royal Charter each role gets its own character and workshop.')}
  if(pg===3){add('h2',null,'Keep each project together in the Code view');
    const ol=add('ol');[
      ['Start each lane in its project’s folder.','In Claude’s Code view, sessions are grouped by the folder they run in, so a project’s lanes sit together under its folder.'],
      ['Name each session “Project · Role”.','Click the session title at the top to rename it, for example “'+((gProjects()[0]||{}).name||'Pip').trim()+' · Design”. The overseer and the kingdom use these names.'],
      ['Group the list by folder.','Hover over a heading in the session list and choose Group and sort if your list isn’t already grouped by folder.'],
      ['A lane that works in another repo?','Start it in the project’s folder anyway, then add the other folder from the + next to the prompt box (Add folder). It stays grouped with its project.'],
      ['Start the overseer in the shared folder.','It sits above the projects in the list, and that’s where you paste its setup prompt.']].forEach(([b,t])=>{const li=document.createElement('li'),s=document.createElement('b');s.textContent=b+' ';li.append(s,document.createTextNode(t));ol.appendChild(li)});
    add('pre','gtree',guideTree())}
  if(pg===4){add('h2',null,'Starter prompts for every lane');add('p',null,'Paste each one as the first message in that lane’s session. They tell the lane its job and how to report, so it shows up properly in your kingdom.');
    add('p','obstate','Keep them running: give every session Remote Control (/remote-control) so lanes can talk to each other, and let each Owner run on a /loop. A session that stops or loses Remote Control goes quiet and its adventurer heads to the tavern. Tap them in town and choose GET BACK TO WORK, or reopen that session in Claude Code.');
    add('p','obstate','Projects run in the cloud (lanes as scheduled tasks working from a GitHub repo) keep their own town: add the “Product Owner in the cloud” part to that project’s Product Owner prompt. Decrees and answers for it then wake its Product Owner straight away, even with your computer off. Lanes that need your computer (a game engine, a phone simulator) stay local sessions as above.');
    const ps=gProjects();const sel=add('select','gsel');sel.setAttribute('aria-label','Choose a lane');const opts=[['overseer','Overseer (shared folder)']];
    for(const p of ps)for(const r of p.roles)opts.push([p.name+'|'+r,p.name.trim()+' · '+gRole(r)]);if(!ps.length)opts.push(['demo|owner','Your project · Owner']);
    for(const p of (ps.length?ps:[{name:''}]))opts.push(['cloud|'+p.name,(p.name.trim()||'A cloud project')+' · Product Owner in the cloud (add to its prompt)']);
    for(const [v,l] of opts){const o=document.createElement('option');o.value=v;o.textContent=l;sel.appendChild(o)}if(opts[1])sel.value=opts[1][0];
    const pre=add('pre','gprompt');const show=()=>{const v=sel.value;if(v==='overseer'){pre.textContent=overseerBrief();return}if(v.startsWith('cloud|')){pre.textContent=cloudBrief(v.slice(6));return}const [pn,r]=v.split('|'),p=ps.find(x=>x.name===pn)||{name:'Your project',roles:['owner'],extra:''};pre.textContent=r==='owner'?ownerPrompt(p):lanePrompt(p,r)};sel.onchange=show;show();
    const acts=add('div','obacts');const cp=document.createElement('button');cp.type='button';cp.className='btn primary';cp.textContent='COPY THIS PROMPT';cp.onclick=()=>gCopy(cp,pre.textContent,'COPY THIS PROMPT');
    const all=document.createElement('button');all.type='button';all.className='btn';all.textContent='COPY THE WHOLE PLAN';all.onclick=()=>gCopy(all,guidePlan(),'COPY THE WHOLE PLAN');acts.append(cp,all);
    add('p','obstate','The whole plan is a checklist with your folders, every session’s name and its prompt, ready to keep in a note.')}
  const nav=add('div','obacts gnav');if(pg>0){const b=document.createElement('button');b.type='button';b.className='btn';b.textContent='◂ BACK';b.onclick=()=>{GUIDE.page--;renderGuide();sfx('blip')};nav.appendChild(b)}
  const nx=document.createElement('button');nx.type='button';nx.className='btn primary';nx.textContent=pg<N-1?'NEXT ▸':'DONE';nx.onclick=()=>{if(pg<N-1){GUIDE.page++;renderGuide();sfx('blip')}else{closeGuide();sfx('ok')}};nav.appendChild(nx);
  card.scrollTop=0;(card.querySelector('h2')||card).setAttribute('tabindex','-1');card.querySelector('h2')&&card.querySelector('h2').focus({preventScroll:true})}
// top level runs before app.js defines $, so look elements up directly here
document.getElementById('guideBtn').addEventListener('click',()=>{setMenu(false);openGuide(0)});
document.getElementById('guide').addEventListener('click',e=>{if(e.target.id==='guide')closeGuide()});
addEventListener('keydown',e=>{if(e.key==='Escape'&&GUIDE.open){e.stopImmediatePropagation();closeGuide()}},true);

// ===================== the Curiosity Tent: new things arrive as a show =====================
// When an update brings a pack of new things, they stay packed away until the ruler opens them. A travelling merchant
// walks onto the map and pitches a striped tent. Inside, everything is under dust sheets; the chest holds the key.
// Opening it unlocks the pack (saved in realm/config.unlocked), the sheets come off, and each treasure has its own card.

// ---- what the Royal Charter adds, as data: each update appends to this, and the cages and cards follow ----
const FREE_KINDS=['capital','village'];
const THEMED_PROPS=Object.keys(PROPS).filter(k=>!BASE_PROPS.has(k));
const PROP_NAMES={statue:'Statue',planter:'Flower planter',bannerpost:'Banner post',umbrella:'Market umbrella',anchor:'Anchor',nets:'Fishing nets',rope:'Rope coil',lobsterpot:'Lobster pot',rowboat:'Rowing boat',scarecrow:'Scarecrow',beehive:'Beehive',hen:'Hen',pumpkins:'Pumpkins',churn:'Butter churn',fishrack:'Fish rack',canoe:'Canoe',reeds:'Reeds',bucket:'Bucket',runestone:'Runestone',cauldron:'Cauldron',crystals:'Crystals',owlpost:'Owl post',stalagmite:'Stalagmite',orepile:'Ore pile',gemcluster:'Gem cluster'};
const PROP_HOME={};for(const k in DRESS)for(const s of ['back','meadow','out'])for(const p of (DRESS[k][s]||[]))if(!PROP_HOME[p])PROP_HOME[p]=k;
// characters the charter adds, each with the role that summons them and the workshop they build
const CHARACTERS=[['design','Bard','design lanes'],['content','Scribe','content and copy lanes'],['ios','Elven Artificer','iOS lanes'],['android','Dwarf Tinker','Android lanes'],['website','Halfling Merchant','web lanes'],['backend','Dwarf Miner','backend and data lanes'],['analyst','Wizard','analytics lanes'],['qa','Ranger','QA lanes'],['exercise','Knight','fitness lanes'],['recipes','Druid Cook','food and recipe lanes'],['trading desk','Hermit','finance and trading lanes']];
function premium(){return chartered()}
// packs: each update adds one. Its items are new decorations (or styles and characters, when a pack brings them)
Object.assign(PROPS,{
  lighthouse:[16,36,c=>{px(c,1,32,14,4,'#7a7064');px(c,1,32,14,1,'#9a9084');
    for(let y=10;y<32;y++){const hw=Math.round(3+(y-10)*.14),band=Math.floor((y-10)/5)%2;px(c,8-hw,y,hw*2,1,band?'#c43a3a':'#f4f0e8');px(c,8-hw,y,1,1,band?'#e05a50':'#ffffff');px(c,8+hw-1,y,1,1,band?'#8a2a2a':'#c8c4bc')}
    px(c,3,8,10,2,'#3a3440');px(c,5,4,6,4,'#ffe07a');px(c,6,4,2,4,'#fff6c8');px(c,5,4,1,4,'#3a3440');px(c,10,4,1,4,'#3a3440');px(c,4,2,8,2,'#c43a3a');px(c,6,0,4,2,'#c43a3a');px(c,6,25,3,5,'#5a3a22')}],
  maypole:[20,34,c=>{px(c,9,3,2,31,'#c8a070');px(c,9,3,1,31,'#e8c890');px(c,6,2,8,3,'#5a9a3a');px(c,7,1,6,1,'#7ac862');px(c,7,2,1,1,'#f05a5a');px(c,12,2,1,1,'#f2c94c');px(c,10,0,1,2,'#f05a5a');
    const cols=['#f05a5a','#f2c94c','#5aa0f0','#e88ad8'];[1,5,14,18].forEach((ex,k)=>{for(let i=0;i<=24;i++)px(c,Math.round(10+(ex-10)*i/24),5+i,1,1,cols[k])});
    px(c,6,31,8,3,'#5a8a3a');px(c,7,31,1,1,'#fff6e4');px(c,11,32,1,1,'#f2c94c');px(c,13,31,1,1,'#f05a5a')}],
  waterwheel:[26,24,c=>{const W='#7a4a28',L='#a8743e',cx=13,cy=12;for(let a=0;a<16;a++){const t=a/16*Math.PI*2;px(c,Math.round(cx+Math.cos(t)*10)-1,Math.round(cy+Math.sin(t)*10)-1,3,3,a%2?W:L)}
    for(let a=0;a<4;a++){const t=a/4*Math.PI;for(let r=-9;r<=9;r++)px(c,Math.round(cx+Math.cos(t)*r),Math.round(cy+Math.sin(t)*r),1,1,W)}px(c,cx-2,cy-2,4,4,'#5a3a20');
    px(c,0,0,13,3,L);px(c,0,2,13,1,W);px(c,11,3,2,6,'#5a94dc');px(c,11,3,1,6,'#a8d0f8');px(c,1,21,24,3,'#3270c4');px(c,4,21,6,1,'#a8d0f8');px(c,16,22,5,1,'#a8d0f8')}],
  telescope:[22,22,c=>{const B='#c9a03a',BL='#f2d070',BD='#8a6a2a';for(const dx of [-1,0,1])for(let i=0;i<9;i++)px(c,10+dx*Math.round(i*.8),13+i,1,1,'#6a5040');px(c,9,11,3,3,'#5a5260');
    for(let i=0;i<14;i++){const x=3+i,y=15-Math.round(i*.8);px(c,x,y-1,2,3,i>10?BD:B);px(c,x,y-1,1,1,BL)}px(c,16,2,5,5,B);px(c,17,3,3,3,'#7ad0f0');px(c,18,3,1,1,'#ffffff');px(c,1,13,3,4,BD)}],
  goldscale:[20,18,c=>{const G='#d8a63a',GL='#f2d070',GD='#8a6a2a';px(c,6,16,8,2,GD);px(c,9,4,2,12,G);px(c,9,4,1,12,GL);px(c,1,4,18,1,G);px(c,9,1,2,3,GL);
    for(const x of [1,12]){px(c,x+1,5,1,5,'#6a5a3a');px(c,x+5,5,1,5,'#6a5a3a');px(c,x,10,7,2,G);px(c,x,10,7,1,GL)}
    px(c,2,8,2,2,'#f2c94c');px(c,4,7,2,3,'#f2c94c');px(c,4,7,1,1,'#fff6c8');px(c,14,8,3,2,'#e0404a');px(c,14,8,1,1,'#ffffff')}],
  bandstand:[32,28,c=>{px(c,2,22,28,5,'#d2ccbe');px(c,2,22,28,1,'#f0ece2');px(c,2,26,28,1,'#9a948a');for(const x of [4,11,19,26])px(c,x,13,2,9,'#f4f0e8');
    for(let y=0;y<11;y++){const hw=Math.round(3+y*1.3);for(let x=16-hw;x<16+hw;x++)px(c,x,y+2,1,1,(Math.floor((x-16+40)/3))%2?'#c43a3a':'#f4f0e8')}px(c,1,12,30,2,'#8a2a2a');px(c,15,0,2,3,'#3a3440');px(c,17,0,4,2,'#f2c94c');
    px(c,13,17,2,5,'#3a3440');px(c,12,16,4,2,'#d8a63a')}],
});
const PACKS=[
  {id:'curio-1',title:'The Curiosity Pack',golden:'key',goldenName:'the Golden Key of Curiosities',items:[
    {prop:'lighthouse',theme:'port',slot:'out',name:'The Lighthouse',summary:'A red and white lighthouse now stands on the shore outside every harbour town, keeping watch over the ships.'},
    {prop:'bandstand',theme:'capital',slot:'meadow',name:'The Bandstand',summary:'Capital cities get a striped bandstand on the green, the proudest spot in town for a summer concert.'},
    {prop:'maypole',theme:'village',slot:'meadow',name:'The Maypole',summary:'Meadow villages raise a maypole wound with ribbons and crowned with flowers.'},
    {prop:'waterwheel',theme:'river',slot:'meadow',name:'The Waterwheel',summary:'Riverside hamlets turn a wooden waterwheel, fed by its own little trough.'},
    {prop:'telescope',theme:'arcane',slot:'meadow',name:'The Star Glass',summary:'A brass telescope on a tripod, so the arcane glades can read the night sky.'},
    {prop:'goldscale',theme:'cave',slot:'meadow',name:'The Gold Scales',summary:'The hermits weigh their gold and rubies on a gleaming set of scales.'},
  ]},
];
PACKS.forEach(p=>p.items.forEach(it=>PACK_PROPS.add(it.prop)));
const CURIO={local:{unlocked:[],tentDone:[]},open:false,phase:'intro',t0:0,openT:0,sel:-1,cages:[0,0,0,0],anims:[],arrive:null,last:0,cv:null,ctx:null,raf:0,hits:[],rays:0};
// the four cages: what the charter holds today, with the newest pack's things marked
function catalogue(){const lp=latestPack(),isNew=id=>!!lp&&id===lp.id;
  const styles=KINDS.filter(k=>!FREE_KINDS.includes(k)).map(k=>({key:k,name:STYLE_INFO[k][0],note:STYLE_INFO[k][1],isNew:false}));
  const characters=CHARACTERS.map(([role,name,note])=>({key:role,name,note:'Arrives for '+note+', and builds its own '+TYPES[roleInfo(role,'cat',true).type].name.toLowerCase()+'.',isNew:false}));
  const decorations=THEMED_PROPS.map(k=>({key:k,name:PROP_NAMES[k]||k,note:'For the '+(STYLE_INFO[PROP_HOME[k]]||['towns'])[0].toLowerCase()+'.',isNew:false}));
  for(const p of PACKS)for(const it of p.items)decorations.push({key:it.prop,name:it.name,note:it.summary,isNew:isNew(p.id),pack:p.id});
  return [{id:'styles',title:'Town styles',sub:`${styles.length} more kinds of town, on the map and inside`,items:styles},
    {id:'characters',title:'Characters',sub:`${characters.length} characters and their workshops`,items:characters},
    {id:'decorations',title:'Decorations',sub:`${decorations.length} decorations, and every pack to come`,items:decorations},
    {id:'weather',title:'Local weather',sub:'Your kingdom’s sky follows the real weather where you are',items:WEATHER_ITEMS}]}
// the weather cage: each sky shown over a different kind of town
const WEATHER_ITEMS=[{key:'clear',town:'capital',name:'Clear skies',note:'Sunshine where you are means sunshine over every town.'},
  {key:'drizzle',town:'village',name:'Drizzle',note:'A light shower over the meadows.'},{key:'rain',town:'river',name:'Rain',note:'Puddles splash and the clouds roll over.'},
  {key:'storm',town:'port',name:'Thunderstorm',note:'Lashing rain, lightning and thunder over the harbour.'},{key:'snow',town:'arcane',name:'Snow',note:'Flakes drift down over the glades when it snows outside.'},
  {key:'fog',town:'capital',name:'Fog',note:'A morning mist that rolls through the streets.'}];
const latestPack=()=>PACKS[PACKS.length-1];
function curioState(){return mode==='sample'||!STORE?CURIO.local:{unlocked:REALM.unlocked||[],tentDone:REALM.tentDone||[]}}
function packUnlocked(id){return curioState().unlocked.includes(id)}
function canRule(){return mode==='sample'||!STORE||OB.editor}
// the tent is up while the newest pack is waiting, and stays as a gallery until the ruler packs it away
// without a charter the tent is the shop and always stands; with one it comes back for each new pack
function tentWanted(){const p=latestPack();if(!p||!world.towns||!world.towns.length&&!villages.size)return false;if(mode==='empty')return false;if(STORE&&mode!=='sample'&&!REALM_LOADED)return false;
  if(!tentOwned())return true;return !curioState().tentDone.includes(p.id)}
function tentKey(){return tentWanted()?latestPack().id+(packUnlocked(latestPack().id)?'u':'')+(chartered()?'c':''):''}
// put each unlocked pack's things into the towns they belong to
function applyPacks(){let changed=false;
  for(const p of PACKS){if(!packUnlocked(p.id)||!premium())continue;for(const it of p.items){const D=DRESS[it.theme];if(!D)continue;for(const s of [it.slot]){D[s]=D[s]||[];if(!D[s].includes(it.prop)){D[s].push(it.prop);changed=true}}}}
  if(changed){for(const v of villages.values())v.bg=null;if(active&&active!==COURT)layoutTown(active)}}
async function saveCurio(patch){const st=curioState();Object.assign(st,patch);
  if(mode==='sample'||!STORE){CURIO.local=Object.assign({},st);return true}
  if(!OB.editor)return false;try{await STORE.doc('realm/config').update(patch);REALM=Object.assign({},REALM,patch);return true}catch(e){toast('Could not save. Try again.');return false}}

// ---- the merchant ----
function merchantSpec(){return {cls:'Curio',title:'Curio Merchant',skin:SKIN[0],hair:'#3a2418',eye:EYES[2],hs:'short',head:'tophat',headCol:'#2e2238',build:'tall',outfit:'robe',top:'#7a2a6a',bottom:'#2e2238',trim:'#f2c94c',cape:'#c43a3a',beard:'#3a2418',item:'lantern',acc:'necklace'}}

// ---- the tent on the world map ----
function tentSprite(night){return cached('tentmap'+(night?1:0),52,48,c=>{
  const R='#c43a3a',Rd='#8a2a2a',W='#f4eee0',Wd='#c8bfae';
  for(let y=20;y<44;y++)for(let x=6;x<46;x++){const k=Math.floor((x-6)/5)%2;px(c,x,y,1,1,k?(x>36?Rd:R):(x>36?Wd:W))}
  for(let y=0;y<22;y++){const hw=Math.round(2+y*1.05);for(let x=26-hw;x<26+hw;x++){const k=Math.floor((x-26+60)/4)%2;px(c,x,y+4,1,1,k?(x>30?Rd:R):(x>30?Wd:W))}}
  for(let x=4;x<48;x+=4){px(c,x,24,4,2,'#f2c94c');px(c,x+1,26,2,1,'#c9a03a')}
  px(c,21,30,10,14,'#2a1a24');px(c,20,29,12,1,'#f2c94c');px(c,20,29,1,15,'#f2c94c');px(c,31,29,1,15,'#f2c94c');px(c,23,34,2,2,night?'#ffd86b':'#6a4a3a');
  px(c,25,0,2,6,'#3a3440');px(c,27,0,7,4,'#7a2a6a');px(c,28,1,2,2,'#f2c94c');
  px(c,4,43,44,1,'#5a3a22')})}
function drawTentOnMap(c,t,dt,lights,L){const T=world.tent;if(!T)return;
  const now=performance.now()/1000,a=CURIO.arrive;let k=1,mx=T.cx-30,my=T.cy+20,walking=false,dir='right';
  let boat=null;const J=world.jetty;
  if(a){const e=now-a.t,P=J?a.path:null,bT=P?2.4:0,wT=P?a.walkT:6.5;if(a.path&&!J&&a.x==null){a.x=T.cx<world.W/2?-10:world.W+10;a.y=T.cy+20}
    if(P&&e<bT){k=0;const f=clamp(e/bT);boat={x:J.x+10,y:-24+(J.y-22+24)*f};mx=boat.x;my=boat.y-2;dir='down'}
    else if(e<bT+wT){walking=true;k=0;const f=(e-bT)/wT;if(P){const p=along(P,f);mx=p.x;my=p.y;dir=p.dir}else{mx=a.x+(T.cx-30-a.x)*f;my=a.y+(T.cy+20-a.y)*f;dir=Math.abs(T.cx-30-a.x)>Math.abs(T.cy+20-a.y)?(T.cx>a.x?'right':'left'):(T.cy>a.y?'down':'up')}}
    else if(e<bT+wT+2.5){k=clamp((e-bT-wT)/2.5);if(!a.built&&k>.02){a.built=true;sfx('chain',.7)}}else{if(!a.done){a.done=true;sfx('cheer',.8)}k=1}}
  // the merchant's rowing boat, moored at the north jetty while the tent is up
  if(J){const bx=boat?boat.x:J.x+10,by=boat?boat.y:J.y-22,W=RAMP.wood;px(c,bx-8,by-2,16,5,W[2]);px(c,bx-8,by-2,16,1,W[3]);px(c,bx-6,by+3,12,1,W[0]);px(c,bx-3,by-1,6,2,W[1])}
  const img=tentSprite(L.night);
  if(k>0){const h=Math.max(1,Math.round(img.height*k)),ox=Math.round(T.cx-img.width/2),oy=Math.round(T.cy+18-h);
    ellipseShadow(c,T.cx,T.cy+18,24*Math.max(.3,k),4,.25);c.drawImage(img,0,img.height-h,img.width,h,ox,oy,img.width,h);
    if(k>=1)tentBulbs(c,ox,oy,t,L,lights);
    if(k>=1){const w=Math.floor(t*4)%2;px(c,ox+34,oy+1+w,2,2,'#7a2a6a');if(Math.floor(t*3)%4===0)px(c,ox+8+((Math.floor(t*3)*13)%36),oy+14,1,1,'#ffffff');if(L.night)lights.push([T.cx,T.cy+10,36])}}
  drawMini(c,mx,my,merchantSpec(),walking?dir:'down',walking?Math.floor(t*4):0);
  if(k>=1&&!(tentOwned()&&packUnlocked(latestPack().id)))bubbleQ.push([mx,my-22,'!']);
}
function tentAt(e){const T=world.tent;if(!T)return false;const r=world.cv.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*world.W,y=(e.clientY-r.top)/r.height*world.H;return x>T.cx-40&&x<T.cx+28&&y>T.cy-30&&y<T.cy+24}
function tentLabel(){const T=world.tent,b=document.createElement('button');b.type='button';b.className='tlabel curio';b.style.left=(T.cx/world.W*100)+'%';b.style.top=((T.cy+22)/world.H*100)+'%';
  const n=document.createElement('b');n.textContent='CURIOSITY TENT';const m=document.createElement('i');const sp=document.createElement('span');sp.className='part new';const opened=tentOwned()&&packUnlocked(latestPack().id);sp.textContent=!tentOwned()?'ROYAL CHARTER':opened?'Now open':'NEW ARRIVALS';m.appendChild(sp);
  b.append(n,m);b.setAttribute('aria-label',!tentOwned()?'Curiosity tent: see what the Royal Charter adds to your kingdom':opened?'Curiosity tent: see the treasures you unlocked':'Curiosity tent: a travelling merchant has brought new things. Enter');b.addEventListener('click',openTent);return b}
// the merchant arrives the first time this browser sees this pack's tent
function maybeArrive(){const T=world.tent;if(!T)return;const key='curio-arrived-'+latestPack().id;let seen=false;try{seen=localStorage.getItem(key)==='1'}catch{}
  if(seen||CURIO.arrive)return;const ex=T.cx<world.W/2?-10:world.W+10;
  // with a jetty he rows in from the top of the map and walks the north road down to the fairground
  const R=world.fairRoad&&world.jetty?[...world.fairRoad].reverse().concat([{x:T.cx-30,y:T.cy-26},{x:T.cx-30,y:T.cy+20}]):null;
  const L=R?R.reduce((s,p,i)=>i?s+Math.abs(p.x-R[i-1].x)+Math.abs(p.y-R[i-1].y):0,0):0;
  CURIO.arrive=R?{t:performance.now()/1000+1,path:R,walkT:clamp(L/70,3,12)}:{t:performance.now()/1000+1,x:ex,y:T.cy+20};try{localStorage.setItem(key,'1')}catch{}}

// ---- inside the tent ----
function openTent(){if(CURIO.open)return;achieve('tent');sfx('whoosh');const el=$('tentView');CURIO.open=true;el.hidden=false;document.body.classList.add('in-tent');
  CURIO.cv=$('tentCv');CURIO.ctx=CURIO.cv.getContext('2d');sizeTent();const p=latestPack(),done=tentOwned()&&packUnlocked(p.id);
  CURIO.phase=done?'gallery':'intro';CURIO.cages=[0,1,2,3].map(()=>done?1:0);CURIO.sel=-1;CURIO.t0=performance.now()/1000;hideTentCard();
  say(done?'Welcome back! Everything in these cages is out in your kingdom now. Tap a cage for a closer look.':!canRule()?'I’ve brought wonders for this realm, but only its ruler holds the key to these cages.':tentOwned()?'Roll up, roll up! I’ve travelled far with new and amazing things. Peek through the bars, then tap the chest!':showcase()?showcasePitch():charterPitch());$('tcForm').hidden=true;
  renderTentUI();sndScene('curio');CURIO.last=0;cancelAnimationFrame(CURIO.raf);CURIO.raf=requestAnimationFrame(tentLoop);setTimeout(()=>$('tentBack').focus({preventScroll:true}),60)}
function closeTent(){if(!CURIO.open)return;CURIO.open=false;cancelAnimationFrame(CURIO.raf);$('tentView').hidden=true;document.body.classList.remove('in-tent');hideTentCard();sndScene('world');sfx('whoosh',.7);world.sig=null;layoutWorld()}
function sizeTent(){CURIO.dlgTop=0;const cv=CURIO.cv,W=innerWidth,H=innerHeight,d=Math.min(2,devicePixelRatio||1);cv.width=Math.round(W*d);cv.height=Math.round(H*d);
  const s=Math.max(1.6,Math.min(W/330,H/235));CURIO.s=s*d;CURIO.RW=cv.width/CURIO.s;CURIO.RH=cv.height/CURIO.s}
let sayT=null;function say(txt){const el=$('tentSay');{el.textContent=txt;const dl=el.closest('.tentDlg');if(dl&&dl.offsetParent){const top=dl.getBoundingClientRect().top;if(top>0)CURIO.dlgTop=Math.min(CURIO.dlgTop||1e9,top)}}el.textContent='';clearInterval(sayT);let i=0;if(reduce){el.textContent=txt;return}sayT=setInterval(()=>{i+=2;el.textContent=txt.slice(0,i);if(i%6===0)sfx('blip',.25);if(i>=txt.length)clearInterval(sayT)},22)}
function renderTentUI(){const p=latestPack(),ph=CURIO.phase;$('tentBanner').hidden=ph!=='banner';
  const offer=ph==='intro'&&canRule()&&!tentOwned();$('tentCharter').hidden=!offer;if(offer){const b=$('tcBuy'),sc=showcase();b.hidden=!sc&&(!CHARTER_PAY_URL||!REALM.kid);b.href=sc?FREE_URL:payUrl();b.textContent=sc?'GET YOUR KINGDOM FREE ↗':'BUY THE ROYAL CHARTER · '+CHARTER_PRICE+' ↗';$('tcHave').hidden=sc;$('tcNote').hidden=!sc}
  const list=$('tentItems');list.hidden=ph==='build'||ph==='open'||ph==='item'||ph==='banner';list.innerHTML='';
  if(!list.hidden)catalogue().forEach((cg,i)=>{const b=document.createElement('button');b.type='button';b.className='chip';b.textContent=(CURIO.cages[i]>=1?'':'🔒 ')+cg.title+(cg.items.some(x=>x.isNew)?' · NEW':'');b.onclick=()=>showTentCard(i);list.appendChild(b)});
  $('tentPack').hidden=!(ph==='gallery'&&canRule());$('tentChest').hidden=!(ph==='intro'&&canRule()&&tentOwned());}
// layout in scene units: the floor line, the chest, the merchant and the pedestals all hang off the centre
function tentLayout(){const RW=CURIO.RW,RH=CURIO.RH,cx=RW/2,narrow=RW<330;
  // the back wall gives way so the merchant and the chest always stand clear of the merchant's message box
  let lim=RH-96;{const dl=document.querySelector('.tentDlg');if(dl&&dl.offsetParent){const top=dl.getBoundingClientRect().top;if(top>0)CURIO.dlgTop=Math.min(CURIO.dlgTop||1e9,top)}
    if(CURIO.dlgTop&&CURIO.dlgTop<1e9)lim=Math.min(lim,CURIO.dlgTop/(CURIO.s/Math.min(2,devicePixelRatio||1))-(narrow?66:56))}
  const floor=Math.round(Math.max(84,Math.min(RH*.58,lim))),gap=Math.min(70,(RW-12)/4),peds=[0,1,2,3].map(i=>({x:cx+(i-1.5)*gap,y:floor+4}));
  return {cx,floor,peds,chest:{x:cx,y:floor+(narrow?52:42)},merch:{x:cx-(narrow?44:52),y:floor+(narrow?56:46)}}}
// a gilded cage on a plinth: what's inside shows through the bars; the lock drops and the door lifts when it opens
function drawCage(c,x,yb,open,i,t,hasNew){x=Math.round(x);yb=Math.round(yb);const G='#d8a63a',GL='#f2d070',GD='#8a6a2a',top=yb-58;
  px(c,x-25,yb-6,50,9,'#5a3a22');px(c,x-25,yb-6,50,2,'#8a5a30');px(c,x-23,yb+1,46,2,'#3a2414');
  c.fillStyle='#2e1626';c.beginPath();c.moveTo(x-20,yb-7);c.lineTo(x-20,top+14);c.quadraticCurveTo(x-20,top,x,top);c.quadraticCurveTo(x+20,top,x+20,top+14);c.lineTo(x+20,yb-7);c.closePath();c.fill();
  cageObject(c,x,yb-8,i,t);
  const lift=Math.round(open*46);
  if(open<1){c.save();c.beginPath();c.rect(x-21,top-2,42,yb-top);c.clip();c.globalAlpha=1-open*.6;
    for(let bx=x-18;bx<=x+18;bx+=12){px(c,bx,top+6-lift,2,yb-top-12,G);px(c,bx,top+6-lift,1,yb-top-12,GL)}px(c,x-20,yb-30-lift,40,2,G);c.restore()}
  for(let k=0;k<14;k++){const a=Math.PI*(k/13),rx=Math.round(x-Math.cos(a)*20),ry=Math.round(top+14-Math.sin(a)*14);px(c,rx-1,ry-1,3,3,k%2?G:GL)}
  px(c,x-21,top+13,2,yb-top-20,G);px(c,x+19,top+13,2,yb-top-20,GD);px(c,x-21,yb-9,42,3,G);px(c,x-21,yb-9,42,1,GL);
  px(c,x-1,top-6,2,5,G);px(c,x-3,top-9,6,4,GL);px(c,x-2,top-8,4,2,'#2e1626');
  if(open<.5){const drop=Math.round(open*60),ly=yb-30+drop;c.globalAlpha=1-open*2;px(c,x-5,ly,10,9,G);px(c,x-5,ly,10,2,GL);px(c,x-3,ly-5,6,6,GD);px(c,x-2,ly-4,4,4,'#2e1626');px(c,x-1,ly+3,2,3,'#3a2414');c.globalAlpha=1}
  if(hasNew&&open<1&&Math.floor(t*3+i)%3){px(c,x+16,top+2,3,3,'#fff6c8');px(c,x+17,top+1,1,5,'#fff6c8');px(c,x+15,top+3,5,1,'#fff6c8')}
  if(open>=1&&Math.floor(t*2+i)%4===0)px(c,x-12+((Math.floor(t*2)*7+i*5)%24),top+20,2,2,'#fff6c8')}
// what stands for each cage: a snow globe with a little harbour, two of the new characters, two decorations, a storm in a jar
function cageObject(c,x,y,i,t){
  if(i===0){px(c,x-11,y-6,22,6,'#7a4a28');px(c,x-11,y-6,22,1,'#a8743e');
    c.fillStyle='rgba(207,232,255,.28)';c.beginPath();c.arc(x,y-20,14,0,Math.PI*2);c.fill();
    c.save();c.beginPath();c.arc(x,y-20,13,0,Math.PI*2);c.clip();px(c,x-14,y-14,28,8,'#3270c4');px(c,x-14,y-14,28,1,'#a8d0f8');
      miniHouse(c,x-12,y-31,12,7,6,'port','#2f8a8a',{});miniHouse(c,x+1,y-29,11,6,6,'port','#c8453a',{});
      for(let k=0;k<5;k++){const sy=((t*12+k*11)%26);px(c,x-10+k*5,y-33+sy,1,1,'#ffffff')}c.restore();
    c.strokeStyle='#e8f4ff';c.lineWidth=1;c.beginPath();c.arc(x,y-20,13.5,0,Math.PI*2);c.stroke();px(c,x-8,y-29,3,2,'#ffffff');return}
  if(i===1){const a=classFor('ios','#9fc0e6','cage-elf'),b=classFor('android','#7ccf6b','cage-dwarf');
    drawHero(c,x-7,y,Object.assign({},a,{dir:'down',pose:Math.floor(t)%4===0?'wave':'idle',frame:Math.floor(t*(Math.floor(t)%4===0?12:3)),breath:1}));
    drawHero(c,x+8,y,Object.assign({},b,{dir:'down',pose:'idle',frame:Math.floor(t*3),breath:1}));return}
  if(i===2){drawProp(c,'lighthouse',x-7,y);drawProp(c,'beehive',x+10,y);return}
  // a bell jar holding its own little weather: a cloud that rains, and now and then a flash of lightning
  px(c,x-11,y-5,22,5,'#7a4a28');px(c,x-11,y-5,22,1,'#a8743e');c.fillStyle='rgba(207,232,255,.22)';c.fillRect(x-9,y-36,18,31);c.beginPath();c.arc(x,y-36,9,Math.PI,0);c.fill();
  const fl=(t*.7+i)%3<.08;for(const [dx,dy,r] of [[-4,-30,4],[2,-31,5],[6,-28,3],[-6,-27,3]]){c.fillStyle=fl?'#f4f0ff':'#8a90a8';c.beginPath();c.arc(x+dx,y+dy,r,0,Math.PI*2);c.fill()}
  px(c,x-8,y-28,16,3,fl?'#d8d8f0':'#6a7088');for(let k=0;k<6;k++){const ry=(t*30+k*7)%16;px(c,x-7+k*3,y-24+ry,1,2,'#a8d0f8')}
  if(fl){px(c,x,y-25,2,4,'#fff6a0');px(c,x-1,y-21,2,4,'#fff6a0');px(c,x,y-17,2,3,'#fff6a0')}
  c.strokeStyle='#e8f4ff';c.lineWidth=1;c.beginPath();c.moveTo(x-9.5,y-5);c.lineTo(x-9.5,y-36);c.arc(x,y-36,9.5,Math.PI,0);c.lineTo(x+9.5,y-5);c.stroke();px(c,x-7,y-40,2,6,'#ffffff')}
function tentLoop(ms){if(!CURIO.open)return;const now=ms/1000,dt=CURIO.last?Math.min(.1,now-CURIO.last):.016;CURIO.last=now;drawTent(now-CURIO.t0,dt);if(CURIO.anims.length){const t=now-CURIO.t0;for(const a of CURIO.anims)a(t,dt)}CURIO.raf=requestAnimationFrame(tentLoop)}
function drawTent(t,dt){const c=CURIO.ctx,RW=CURIO.RW,RH=CURIO.RH,Lo=tentLayout(),{cx,floor}=Lo;c.setTransform(CURIO.s,0,0,CURIO.s,0,0);c.imageSmoothingEnabled=false;
  // canvas walls: red and cream stripes gathering towards the top, gold valance, string lights
  for(let x=0;x<RW;x+=1){const k=Math.floor((x-cx+400)/18)%2;px(c,x,0,1,floor,k?'#9a2a3a':'#e2d2b0')}
  for(let b=0;b<6;b++){c.fillStyle=`rgba(24,8,22,${.5-b*.08})`;c.fillRect(0,b*floor*.08,RW,floor*.08)}
  for(let x=-6;x<RW+12;x+=12){c.fillStyle='#c9a03a';c.beginPath();c.arc(x,10,6,0,Math.PI);c.fill();px(c,x-6,4,12,6,'#7a2a3a')}
  px(c,0,0,RW,5,'#5a1a2a');
  // two swags of string lights, each dipping between the tent's poles
  for(let s=0;s<2;s++){const y0=15+s*9,span=RW/(2+s);for(let i=0;i<=RW;i++){const ph=((i+s*span/2)%span)/span,y=Math.round(y0+Math.sin(ph*Math.PI)*7);px(c,i,y,1,1,'#2a1a14');
      if(i%12===6){const k=Math.floor(i/12)+s,on=(Math.floor(t*2)+k)%4!==0;px(c,i-1,y+1,3,3,on?['#ffd86b','#ff8a8a','#8ad0ff','#a8f08a'][k%4]:'#5a4a3a');if(on)px(c,i-1,y+1,1,1,'#ffffff')}}}
  // floor: sawdust, a round rug
  px(c,0,floor,RW,RH-floor,'#c8a868');for(let k=0;k<RW*(RH-floor)/90;k++){const h=hash('sd'+k);px(c,h%Math.ceil(RW),floor+(h>>>9)%Math.ceil(RH-floor),2,1,k%2?'#b8945a':'#dcc088')}
  px(c,0,floor,RW,2,'#8a6a3a');
  c.fillStyle='#8a2a3a';c.beginPath();c.ellipse(cx,Lo.chest.y-4,RW*.3,22,0,0,Math.PI*2);c.fill();c.strokeStyle='#d8a63a';c.lineWidth=2;c.stroke();
  // the three cages: town styles, characters, decorations
  CURIO.hits=[];const cats=catalogue();
  Lo.peds.forEach((q,i)=>{drawCage(c,q.x,q.y,Math.min(1,CURIO.cages[i]),i,t,cats[i].items.some(x=>x.isNew));
    if(CURIO.sel===i){const b=Math.floor(t*4)%2;c.strokeStyle='#f2c94c';c.lineWidth=1;c.strokeRect(Math.round(q.x)-24-b,Math.round(q.y)-68-b,48+b*2,72+b*2)}
    CURIO.hits.push({x:q.x-25,y:q.y-68,w:50,h:74,i})});

  // the chest
  const ch=Lo.chest,ph=CURIO.phase,e=ph==='build'||ph==='open'||ph==='item'||ph==='banner'?t-CURIO.openT:0;
  let shake=0,lid=0,glow=0;if(ph==='build'){shake=Math.sin(e*40)*Math.min(2,e*1.1);glow=e/2.2}else if(ph!=='intro'){lid=Math.min(1,(e-2.2)*4);glow=1}
  if(ph==='intro'){const b=Math.round(Math.sin(t*3)*1.5);if(canRule()){px(c,ch.x-2,ch.y-34+b,5,5,'#f2c94c');px(c,ch.x-1,ch.y-29+b,3,2,'#f2c94c');px(c,ch.x,ch.y-27+b,1,1,'#f2c94c')}}
  if(ph!=='intro'&&ph!=='gallery'&&ph!=='reveal'){c.fillStyle=`rgba(10,4,16,${Math.min(.55,glow*.55)})`;c.fillRect(0,0,RW,RH)}
  if(lid>0&&ph!=='gallery'&&ph!=='reveal'){c.save();c.translate(ch.x,ch.y-18);c.rotate(t*.6);for(let k=0;k<12;k++){c.rotate(Math.PI/6);c.fillStyle=k%2?'rgba(255,224,122,.28)':'rgba(255,246,200,.16)';c.beginPath();c.moveTo(0,0);c.lineTo(-10,-RH);c.lineTo(10,-RH);c.closePath();c.fill()}c.restore()}
  const X=Math.round(ch.x-16+shake),Y=Math.round(ch.y-20);ellipseShadow(c,ch.x,ch.y,18,3,.35);
  px(c,X,Y+8,32,14,'#7a4a28');px(c,X,Y+8,32,2,'#a8743e');for(const bx of [X+3,X+26])px(c,bx,Y+8,3,14,'#d8a63a');px(c,X,Y+20,32,2,'#5a3a20');
  if(glow>0&&lid<=0){const g=Math.floor(t*10)%2;px(c,X+2,Y+8,28,1,g?'#fff6c8':'#ffe07a')}
  if(lid<=0){px(c,X-1,Y,34,9,'#8a5a30');px(c,X-1,Y,34,2,'#b07a48');for(const bx of [X+3,X+26])px(c,bx,Y,3,9,'#f2c94c');px(c,X+13,Y+6,6,6,'#f2c94c');px(c,X+15,Y+8,2,3,'#3a2418')}
  else{px(c,X-1,Y+8-Math.round(10*lid),34,Math.max(2,Math.round(9*(1-lid))+2),'#5a3a20');px(c,X+1,Y+9,30,4,'#fff6c8');px(c,X+2,Y+10,28,2,'#ffe07a')}
  CURIO.chestHit={x:X-4,y:Y-6,w:40,h:34};
  if(!tentOwned()&&lid<=0){const ly=Y+3;px(c,X+11,ly,10,9,'#d8a63a');px(c,X+11,ly,10,2,'#f2d070');px(c,X+13,ly-5,6,6,'#8a6a2a');px(c,X+14,ly-4,4,4,'#7a4a28');px(c,X+15,ly+3,2,3,'#3a2414')}
  // the merchant
  const ms=merchantSpec();drawHero(c,Lo.merch.x,Lo.merch.y,Object.assign({},ms,{dir:ph==='intro'?'right':'down',pose:ph==='banner'||ph==='item'?'cheer':ph==='intro'||ph==='gallery'?'talk':'idle',frame:Math.floor(t*3),breath:1}));
  // the golden key rises out of the chest
  if(ph==='item'||ph==='banner'){const k=clamp((e-2.4)/1.6),ky=ch.y-24-k*46+Math.sin(t*3)*(k>=1?2:0);goldenKey(c,ch.x,ky,t);
    for(let s=0;s<8;s++){const a=t*1.5+s/8*Math.PI*2,r=20+6*Math.sin(t*4+s);if((Math.floor(t*8)+s)%3)px(c,ch.x+Math.cos(a)*r,ky+Math.sin(a)*r*.6,2,2,'#fff6c8')}}
  if(ph==='open'||(ph==='item'&&e<2.6)){const f=clamp(1-(e-2.2)/.4);if(f>0){c.fillStyle=`rgba(255,250,230,${f*.85})`;c.fillRect(0,0,RW,RH)}}
  // timing
  if(ph==='build'&&e>=2.2){CURIO.phase='open';sfx('anvil',1);flashChime();say('There it is!')}
  if(ph==='open'&&e>=2.4){CURIO.phase='item';itemJingle();say('Behold: '+latestPack().goldenName+'!')}
  if(ph==='item'&&e>=4.4){CURIO.phase='banner';const [h,b]=bannerCopy();$('tbH').textContent=h;$('tbP').textContent=b;renderTentUI();$('tentGo').focus({preventScroll:true})}
  if(ph==='reveal'){let all=true;CURIO.cages=CURIO.cages.map((v,i)=>{const start=(t-CURIO.revealAt)-i*.6;if(start>0&&v===0)sfx('chain',.45);const nv=start>0?Math.min(1,start*1.2):0;if(nv<1)all=false;return nv});if(all){CURIO.phase='gallery';renderTentUI();say('All yours! Everything in these cages is out in your kingdom now. Tap a cage for a closer look.')}}
}
function goldenKey(c,x,y,t){const G='#f2c94c',GL='#fff6c8',GD='#b8862a';x=Math.round(x);y=Math.round(y);
  px(c,x-12,y-5,10,10,G);px(c,x-9,y-2,4,4,'#2a1a24');px(c,x-12,y-5,10,2,GL);px(c,x-12,y+3,10,2,GD);
  px(c,x-2,y-1,16,3,G);px(c,x-2,y-1,16,1,GL);px(c,x+8,y+2,2,4,G);px(c,x+12,y+2,2,3,G);px(c,x+12,y+4,2,1,GD);
  if(Math.floor(t*3)%2)px(c,x-11,y-4,2,2,'#ffffff')}
function flashChime(){if(!SND.on||!SND.ctx)return;const t=SND.ctx.currentTime+.01;noise(t,.4,{f:5000,vol:.12});[1568,2093,2637].forEach((f,i)=>tone(f,t+i*.04,.5,{wave:'tri',vol:.07}))}
// an original rising "you found it" jingle: a quick climb, a held chord, and a sparkle
function itemJingle(){if(!SND.on||!SND.ctx)return;const t=SND.ctx.currentTime+.02;
  [[392,0],[440,.09],[494,.18],[523,.27],[587,.36],[659,.45],[740,.54]].forEach(([f,o])=>tone(f,t+o,.09,{wave:.25,vol:.1}));
  [[784,.66,1.3],[988,.66,1.3],[1175,.66,1.3]].forEach(([f,o,d])=>tone(f,t+o,d,{wave:.25,vol:.08,vib:5}));tone(196,t+.66,1.3,{wave:'tri',vol:.16});
  for(let k=0;k<6;k++)tone(2349+k*240,t+1.2+k*.06,.08,{wave:'tri',vol:.05})}
function buildUp(){if(!SND.on||!SND.ctx)return;const t=SND.ctx.currentTime+.02;for(let i=0;i<16;i++)tone(196*Math.pow(2,i/12),t+i*.13,.12,{wave:.125,vol:.04+i*.004});noise(t,2.2,{type:'lowpass',f:200,f2:900,vol:.12,a:1.6})}
function tapChest(){if(CURIO.phase!=='intro')return;if(!canRule()){say('Only the ruler of this realm holds the key to this chest.');return}
  if(!tentOwned()){say(charterPitch());sfx('chain',.4);return}
  CURIO.phase='build';CURIO.openT=performance.now()/1000-CURIO.t0;renderTentUI();say('Ooh, it’s waking up…');buildUp()}
async function unlockAndReveal(){const p=latestPack();const ok=await saveCurio({unlocked:[...new Set([...curioState().unlocked,p.id])]});if(!ok)return;applyPacks();
  CURIO.phase='reveal';CURIO.revealAt=performance.now()/1000-CURIO.t0;renderTentUI();say('Off come the locks!');sfx('cheer')}
function bannerCopy(){const p=latestPack(),first=!curioState().unlocked.length,cats=catalogue();
  if(first)return ['THE ROYAL CHARTER',`The Golden Key opens every cage: ${cats.map(c=>c.id==='weather'?'your local weather':c.items.length+' '+c.title.toLowerCase()).join(', ')}, and every pack to come.`];
  const n=cats.reduce((s,c)=>s+c.items.filter(x=>x.isNew).length,0);return [p.title.toUpperCase(),`The Golden Key opens ${n} new treasure${n===1?'':'s'} for your realm.`]}
async function packUpTent(){const p=latestPack();const ok=await saveCurio({tentDone:[...new Set([...curioState().tentDone,p.id])]});if(!ok)return;toast('The merchant packs up and waves goodbye');closeTent()}
// ---- the cage cards: everything inside, drawn from the game's own art ----
function showTentCard(i){const cg=catalogue()[i],open=CURIO.cages[i]>=1;CURIO.sel=i;sfx('blip');
  const card=$('tentCard');card.hidden=false;$('tcName').textContent=cg.title;
  $('tcWhere').textContent=(open?'In your kingdom · ':'Locked · ')+cg.sub;
  const grid=$('tcGrid');grid.innerHTML='';grid.className='tcGrid '+cg.id;CURIO.anims=[];
  for(const it of cg.items){const f=document.createElement('figure');const cv=document.createElement('canvas');const a=itemPreview(cv,cg.id,it);if(a){CURIO.anims.push(a);a(0,0)}
    const cap=document.createElement('figcaption');const b=document.createElement('b');b.textContent=it.name;cap.appendChild(b);
    if(it.isNew){const n=document.createElement('em');n.textContent='NEW';cap.appendChild(n)}
    const s2=document.createElement('span');s2.textContent=it.note;cap.appendChild(s2);f.append(cv,cap);grid.appendChild(f)}
  const cta=$('tcCta');cta.innerHTML='';
  if(!open){const p=document.createElement('p');
    if(showcase()){p.textContent=`Free to start in your own Claude. All four cages open with one Royal Charter, ${CHARTER_PRICE} paid once, bought inside your kingdom.`;cta.appendChild(p);
      const a=document.createElement('a');a.className='btn primary';a.target='_blank';a.rel='noopener';a.href=FREE_URL;a.textContent='GET YOUR KINGDOM FREE ↗';cta.appendChild(a)}
    else if(!tentOwned()){p.textContent=`All four cages open with one Royal Charter: ${CHARTER_PRICE}, paid once, for this kingdom and every pack to come.`;cta.appendChild(p);
      if(canRule()&&CHARTER_PAY_URL&&REALM.kid){const a=document.createElement('a');a.className='btn primary';a.target='_blank';a.rel='noopener';a.href=payUrl();a.textContent='BUY THE ROYAL CHARTER · '+CHARTER_PRICE+' ↗';a.onclick=()=>{sfx('coin');setTimeout(()=>{$('tcForm').hidden=false},400)};cta.appendChild(a)}}
    else{p.textContent='Your charter holds the key: tap the chest to open the cages.';cta.appendChild(p)}}
  $('tcClose').focus({preventScroll:true})}
function hideTentCard(){const c=$('tentCard');if(c)c.hidden=true;CURIO.sel=-1;CURIO.anims=[]}
// every card is drawn live from the game's own art: towns from the top row of buildings, skies over a town, characters going about their day, decorations as they stand
// a town card is the real town at full size, pixel for pixel: the top rows of buildings, from the middle of the street
const PCW=200,PCH=125;
function cardCrop(cv,kind){const src=townPostcard(kind);if(!src)return;const x=cv.getContext('2d');x.imageSmoothingEnabled=false;x.drawImage(src,Math.max(0,Math.round((src.width-PCW)/2)),0,PCW,PCH,0,0,PCW,PCH)}
function cardGround(w,h,key,th){const g=document.createElement('canvas');g.width=w;g.height=h;const c=g.getContext('2d');for(let y=0;y<h;y+=16)for(let x=0;x<w;x+=16)groundTile(c,x,y,hash(key+x+','+y),th);return g}
function itemPreview(cv,cat,it){const c=cv.getContext('2d');
  if(cat==='styles'){cv.width=PCW;cv.height=PCH;cardCrop(cv,it.key);return null}
  if(cat==='weather'){cv.width=PCW;cv.height=PCH;const bg=document.createElement('canvas');bg.width=PCW;bg.height=PCH;cardCrop(bg,it.town);
    const o={},dim={cloudy:.08,drizzle:.1,rain:.16,storm:.26,fog:.06,snow:.04}[it.key]||0;let last=0;
    return (t,dt)=>{c.imageSmoothingEnabled=false;c.drawImage(bg,0,0);if(dim){c.fillStyle=`rgba(40,50,80,${dim})`;c.fillRect(0,0,PCW,PCH)}
      WX_FORCE=it.key;try{drawWeather(c,PCW,PCH,t+hash(it.key)%40,Math.min(.1,dt),o,{dark:dim,tint:'40,50,80',night:0})}finally{WX_FORCE=null}
      if(it.key==='fog'){c.fillStyle='rgba(226,232,242,.28)';c.fillRect(0,0,PCW,PCH);for(let q=0;q<5;q++){const y=Math.round((q*31+t*4)%(PCH+30))-20,x=Math.round(((t*(q%2?7:-7))%PCW+PCW)%PCW);c.fillStyle='rgba(240,244,250,.22)';c.fillRect(x-PCW,y,PCW*2,10+q%3*4)}}
      if(it.key==='clear'){for(let k=0;k<3;k++){const a=t*.4+k*2.1;c.fillStyle='rgba(255,246,200,.10)';c.beginPath();c.moveTo(150,-10);c.lineTo(150+Math.cos(a)*220,Math.sin(a)*40+70);c.lineTo(150+Math.cos(a+.18)*220,Math.sin(a+.18)*40+76);c.fill()}}}}
  if(cat==='characters'){cv.width=64;cv.height=60;const info=roleInfo(it.key,'card-'+it.key,true),bg=cardGround(64,60,it.key,THEMES.village);
    const ACTS=[{pose:'idle'},{walk:1},{walk:1},{pose:'talk'},{pose:'cheer'},{pose:'wave'},{pose:'carry'},{pose:'swing'},{pose:'sit'}],S={x:32,dir:'down',a:ACTS[0],until:0};
    return (t,dt)=>{if(t>=S.until){let a;do a=ACTS[Math.floor(Math.random()*ACTS.length)];while(a===S.a&&!a.walk);S.a=a;S.until=t+(a.walk?2.2:1.4)+Math.random()*1.6;
        S.dir=a.walk?['left','right','down','up'][Math.floor(Math.random()*4)]:a.pose==='sit'?(Math.random()<.5?'left':'right'):a.pose==='wave'||a.pose==='cheer'?'down':['down','left','right'][Math.floor(Math.random()*3)]}
      if(S.a.walk&&(S.dir==='left'||S.dir==='right')){S.x+=(S.dir==='left'?-1:1)*16*Math.min(.1,dt);if(S.x<14){S.x=14;S.dir='right'}if(S.x>50){S.x=50;S.dir='left'}}
      c.imageSmoothingEnabled=false;c.drawImage(bg,0,0);const x=Math.round(S.x),y=S.a.walk&&S.dir!=='left'&&S.dir!=='right'?52+Math.round(Math.sin(t*3)):52;
      if(S.a.pose==='sit'){ellipseShadow(c,x,y+1,6,2,.3);px(c,x-4,y-2,1,3,'#3a2414');px(c,x+3,y-2,1,3,'#3a2414');px(c,x-5,y-5,11,3,'#7a4a28');px(c,x-5,y-5,11,1,'#a8743e')}
      drawHero(c,x,y,Object.assign({},info.cls,{dir:S.dir,pose:S.a.pose||'idle',walk:!!S.a.walk,frame:Math.floor(t*(S.a.walk?8:3)),breath:1}))}}
  const theme=PROP_HOME[it.key]||(PACKS.flatMap(p=>p.items).find(x=>x.prop===it.key)||{}).theme||'village',home=THEMES[theme]||THEMES.village;
  cv.width=64;cv.height=60;const bg=cardGround(64,60,it.key,home),sp=propSprite(it.key);if(!sp)return null;
  const s=sp.width*2<=60&&sp.height*2<=50?2:1,W=sp.width,H=sp.height,L=Math.round(32-W*s/2),T=Math.round(52-H*s),k=it.key;
  const glint=(t,n,col)=>{for(let q=0;q<n;q++){const h=hash(k+q+Math.floor(t*1.5+q*.37)),ph=(t*1.5+q*.37)%1;if(ph>.5)continue;const gx=L+(h%W)*s,gy=T+((h>>>8)%Math.max(1,H-2))*s,r=ph<.25?1:2;px(c,gx-r,gy,r*2+1,1,col);px(c,gx,gy-r,1,r*2+1,col)}};
  return (t,dt)=>{c.imageSmoothingEnabled=false;c.drawImage(bg,0,0);
    const boat=k==='rowboat'||k==='canoe';if(boat){px(c,0,40,64,20,'#3270c4');for(let q=0;q<6;q++){const wx=(q*13+t*6)%70-4;px(c,Math.round(wx),44+(q%3)*5,6,1,'#a8d0f8')}}
    if(k==='hen'){const h={x:32+Math.round(Math.sin(t*.6)*12),y:52,dir:Math.cos(t*.6)>0?1:-1,run:Math.sin(t*2.2)>.6?1:0};drawHen(c,h,t,true);if(!h.run&&Math.floor(t*3)%3===0)px(c,h.x+h.dir*12-1,52,2,1,'#c8a868');return}
    const bob=boat?Math.round(Math.sin(t*2)):0;ellipseShadow(c,32,52,W*.4*s,2,boat?0:.3);
    if(k==='reeds'||k==='scarecrow'||k==='maypole'||k==='planter'){for(let r=0;r<H;r++){const off=Math.round(Math.sin(t*2+r*.08)*(1-r/H)*(k==='reeds'?2:1));c.drawImage(sp,0,r,W,1,L+off*s,T+r*s,W*s,s)}}
    else if(k==='bannerpost'){c.drawImage(sp,0,0,4,H,L,T,4*s,H*s);for(let q=4;q<W;q++){const off=Math.round(Math.sin(t*5-q*.7)*1.2*(q-3)/(W-3));c.drawImage(sp,q,0,1,H,L+q*s,T+off*s,s,H*s)}}
    else c.drawImage(sp,L,T+bob*s,W*s,H*s);
    if(k==='beehive')for(let q=0;q<4;q++){const a=t*(2+q*.5)+q*1.6;px(c,Math.round(32+Math.cos(a)*(10+q*2)),Math.round(T+6+Math.sin(a*1.3)*6),2,1,'#2a2014');px(c,Math.round(32+Math.cos(a)*(10+q*2)),Math.round(T+6+Math.sin(a*1.3)*6),1,1,'#f2c94c')}
    if(k==='cauldron'){for(let q=0;q<4;q++){const ph=(t*.8+q/4)%1;px(c,Math.round(L+(4+q*2.4)*s+Math.sin(t*3+q)*2),Math.round(T+3*s-ph*16),2,2,`rgba(150,230,120,${1-ph})`)}}
    if(k==='lighthouse'){const on=Math.floor(t*1.2)%2;px(c,L+5*s,T+3*s,6*s,3*s,on?'#fff6a0':'#c8a040');if(on){c.fillStyle='rgba(255,246,180,.25)';c.beginPath();c.moveTo(L+8*s,T+4*s);c.lineTo(Math.cos(t)>0?64:0,T-6);c.lineTo(Math.cos(t)>0?64:0,T+16);c.fill()}}
    if(k==='telescope'||k==='runestone'||k==='owlpost')for(let q=0;q<4;q++){const h=hash(k+'st'+q);if(Math.sin(t*2+q*1.7)>.3)px(c,h%60+2,(h>>>8)%14+2,1,1,'#fff6c8')}
    if(k==='runestone'){const g=(Math.sin(t*2)+1)/2;c.fillStyle=`rgba(140,200,255,${.15+g*.25})`;c.fillRect(L+3*s,T+5*s,6*s,10*s)}
    if(k==='bandstand')for(let q=0;q<3;q++){const ph=(t*.5+q/3)%1,nx=Math.round(16+q*14+Math.sin(t*2+q)*3),ny=Math.round(T+4-ph*14);c.globalAlpha=1-ph;px(c,nx,ny,1,4,'#2a2014');px(c,nx-2,ny+3,2,2,'#2a2014');px(c,nx+1,ny,2,1,'#2a2014');c.globalAlpha=1}
    if(k==='waterwheel'||k==='fishrack'||k==='stalagmite')for(let q=0;q<3;q++){const ph=(t*1.2+q/3)%1;px(c,L+Math.round((W*(q+1)/4))*s,Math.round(T+H*s*.3+ph*H*s*.6),1,2,'rgba(168,208,248,.9)')}
    if(['crystals','gemcluster','orepile','goldscale','statue','anchor','churn','bucket','umbrella','pumpkins','lobsterpot','nets','rope'].includes(k))glint(t,k==='crystals'||k==='gemcluster'||k==='goldscale'?3:1,'#ffffff');
    if(k==='planter'){const bx=Math.round(32+Math.sin(t*.9)*14),by=Math.round(T-4+Math.sin(t*2.3)*4),f=Math.floor(t*8)%2;px(c,bx-(f?2:1),by,f?2:1,2,'#f08ac0');px(c,bx+1,by,f?2:1,2,'#f08ac0');px(c,bx,by,1,2,'#2a2014')}
    if(k==='scarecrow'){const ph=(t*.25)%1;if(ph<.6){const cx2=Math.round(L+W*s-2+(ph<.1?(.1-ph)*80:0)),cy2=T+2;px(c,cx2,cy2,4,3,'#1a1a22');px(c,cx2+3,cy2-1,2,2,'#1a1a22');px(c,cx2+5,cy2,1,1,'#f2a020')}}
  }}
function tentPoint(e){const r=CURIO.cv.getBoundingClientRect(),k=CURIO.cv.width/r.width/CURIO.s;return {x:(e.clientX-r.left)*k,y:(e.clientY-r.top)*k}}
function initCurio(){
  $('tentBack').addEventListener('click',closeTent);$('tentGo').addEventListener('click',unlockAndReveal);$('tentPack').addEventListener('click',packUpTent);$('tcClose').addEventListener('click',()=>{hideTentCard();sfx('blip',.5)});
  $('tentCv').addEventListener('click',e=>{const p=tentPoint(e),h=CURIO.chestHit;if(h&&p.x>=h.x&&p.x<=h.x+h.w&&p.y>=h.y&&p.y<=h.y+h.h){tapChest();return}
    for(const q of CURIO.hits)if(p.x>=q.x&&p.x<=q.x+q.w&&p.y>=q.y&&p.y<=q.y+q.h){if(['build','open','item','banner'].includes(CURIO.phase))return;showTentCard(q.i);return}});
  $('tentChest').addEventListener('click',tapChest);
  $('tcHave').addEventListener('click',()=>{const f=$('tcForm');f.hidden=!f.hidden;if(!f.hidden){$('tcCode').focus();say('Paste the code from your thank-you page, and I’ll check the seal.')}});
  $('tcSeal').addEventListener('click',sealCharter);
  $('tcBuy').addEventListener('click',()=>{sfx('coin');if(showcase()){say('Splendid! Set up your kingdom in Claude, and I’ll be waiting in your realm with the key to the chest.');return}say('Splendid! When you’ve paid, come back with your charter code and I’ll open the chest.');setTimeout(()=>{$('tcForm').hidden=false},400)});
  addEventListener('keydown',e=>{if(!CURIO.open)return;if(e.key==='Escape'){if(!$('tentCard').hidden)hideTentCard();else closeTent()}});
  addEventListener('resize',()=>{if(CURIO.open)sizeTent()})}

// ---- the Royal Charter: one payment opens every pack's chest, now and future ----
// pipliving.com signs a code for the kingdom that paid (ECDSA P-256); the page checks the signature itself, with the
// public key below, and that the code names this kingdom. The code is kept in charter/current, readable only by the owner.
const CHARTER_PUBKEY={kty:"EC",crv:"P-256",x:"eC_ltPjnLsgLL1h54rYsS8OjpQ4YaQhfXJrLJ8X0XSI",y:"1vWKN93t3k23-nR6G0gkMEcMhpS3h1Tk0XK9AR-zn2M"};
const CHARTER_PRICE='£7.99';
const CHARTER_PAY_URL='https://buy.stripe.com/6oU28r9sp0TU06F4WIc7u00';
const CHARTER={code:'',valid:false};
function b64uDec(s){s=String(s).replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';return Uint8Array.from(atob(s),c=>c.charCodeAt(0))}
async function checkCharter(code){try{const m=/^KGD1\.([A-Za-z0-9_-]+)\.([A-Za-z0-9_-]+)$/.exec(String(code||'').replace(/\s+/g,''));if(!m||!CHARTER_PUBKEY||!crypto.subtle)return null;
  const key=await crypto.subtle.importKey('jwk',CHARTER_PUBKEY,{name:'ECDSA',namedCurve:'P-256'},false,['verify']);
  if(!await crypto.subtle.verify({name:'ECDSA',hash:'SHA-256'},key,b64uDec(m[2]),new TextEncoder().encode(m[1])))return null;
  return JSON.parse(new TextDecoder().decode(b64uDec(m[1])))}catch(e){return null}}
function chartered(){return mode==='sample'||!STORE||CHARTER.valid}
// the website preview: everything is shown, but the tent is the shop window, pointing visitors at the free kingdom and the £7.99 charter
const FREE_URL='https://www.pipliving.com/labs/kingdomofagents';
function showcase(){return !STORE&&mode==='sample'}
function tentOwned(){return chartered()&&!showcase()}
function showcasePitch(){return `Roll up, roll up! Your kingdom is free to build in Claude. Tap a cage to see what one Royal Charter, ${CHARTER_PRICE} once, unlocks.`}
function charterPitch(){return `Roll up, roll up! Tap a cage to peek at what’s inside. One Royal Charter, ${CHARTER_PRICE} once, opens them all.`}
function payUrl(){return CHARTER_PAY_URL+(CHARTER_PAY_URL.includes('?')?'&':'?')+'client_reference_id='+encodeURIComponent(REALM.kid||'')}
async function setCharter(code){CHARTER.code=code||'';CHARTER.checking=(CHARTER.checking||0)+1;let p=null;try{p=code?await checkCharter(code):null}finally{CHARTER.checking--}const was=CHARTER.valid;CHARTER.p=p;CHARTER.valid=!!(p&&REALM.kid&&p.k===REALM.kid);if(was!==CHARTER.valid)onPremiumChange();if(CURIO.open)renderTentUI()}
// the charter changes what the kingdom looks like: rebuild the towns and the map with or without the paid styles, characters and decorations
function onPremiumChange(){applyPacks();for(const v of villages.values())v.wxs=null;world.wxs=null;if(typeof renderWx==='function')renderWx();for(const v of villages.values()){v.bg=null;v.sig=null}if(LAST_RAW&&mode!=='empty')setLanes(LAST_RAW);world.sig=null;if(!active)layoutWorld();else if(active!==COURT)route(true)}
async function sealCharter(){const ta=$('tcCode'),v=ta.value.replace(/\s+/g,'');const p=await checkCharter(v);
  if(!p){ta.setAttribute('aria-invalid','true');say('Hmm, that seal doesn’t look right. Copy the whole code from your thank-you page and try again.');return}
  if(p.k!==REALM.kid){say('That charter was sealed for a different kingdom. Each charter belongs to the kingdom it was bought from.');return}
  try{await STORE.doc('charter/current').set({code:v,kingdom:p.k,savedAt:new Date().toISOString()})}catch(e){toast('Could not save. Try again.');return}
  ta.removeAttribute('aria-invalid');CHARTER.code=v;const was=CHARTER.valid;CHARTER.valid=true;if(!was)onPremiumChange();sfx('fanfare');say('The seal is true! Your kingdom is chartered, now and for every pack to come. Tap the chest!');renderTentUI()}
function newKid(){const a=new Uint8Array(16);crypto.getRandomValues(a);return 'k'+[...a].map(b=>(b%36).toString(36)).join('')}

// ===================== the menu: a home list of sections with a one-line summary each, and a view per section =====================
// Achievements are kept in this browser, beside the other easter-egg progress. Locked ones show as mysteries with a hint.
// [id, name, what you did, the barmaid's gossip that hints at it]
const ACHIEVEMENTS=[
  ['decree','Royal Decree','Send your first decree from the throne room.','Between you and me, the {M} hasn’t sent a single decree yet. That quill in the throne room is gathering dust.'],
  ['answer','Wise Ruler','Answer a question from your lanes.','The lanes keep asking the {M} things and getting no answer. Ever so awkward. It’s all on the scroll in the throne room.'],
  ['tent','Roll Up, Roll Up','Visit the Curiosity Tent.','Have you been to that striped tent on the map? The merchant there talks even more than I do.'],
  ['charter','By Royal Charter','Hold the Royal Charter.','They say whoever holds the Royal Charter gets the fancy towns. The merchant in the tent sells it, if you ask nicely.'],
  ['cat','Here, Kitty','Find a cat napping on a roof.','There’s a cat asleep on one of our roofs. Different roof every day, mind. Give it a tap if you spot it.'],
  ['cats','Cat Herder','Find a cat in five different towns.','My cousin swears there’s a cat in every town. Find five of them and you’d be the talk of the kingdom.'],
  ['wish','Make a Wish','Toss a coin in the capital’s fountain.','Folk say the capital’s fountain grants fortunes, if you spare it a coin. I’ve never had the coin to spare.'],
  ['monument','Monumental','Visit a monument to things shipped.','Ship enough and the capital puts up statues round its fountain. Go and tap one, they love the attention.'],
  ['chickens','Fowl Play','Anger the chickens.','Whatever you do, don’t keep chasing the chickens. The big one has a temper.'],
  ['dance','After Hours','See the tavern dance after midnight.','Don’t tell anyone, but after midnight this place gets lively. Tap the tavern late and see.'],
  ['serpent','Here Be Monsters','Rouse the sea serpent.','A fisherman told me if you knock three times on the same patch of sea, something knocks back.'],
  ['ghost','All Hands','Wave back at the ghost ship.','On foggy nights there’s a ship out at sea that shouldn’t be there. Wave at it. Go on.'],
  ['star','Wish Upon a Star','Catch a shooting star.','On a clear night, if you’re quick, you can catch a shooting star with one tap. Or so I’m told.'],
  ['fallen','Stardust','Find where the fallen star landed.','When a star falls it lands somewhere on the island. Somebody should go and pick it up.'],
  ['fish','Gone Fishing','Tap a fishing boat at sea.','The harbour boats go out at dawn. Tap one and they might let you have a cast.'],
  ['bottle','Message in a Bottle','Fish a bottle out of the sea.','Not everything the boats pull up is a fish. Someone found a letter in a bottle last week, from the {M} no less.'],
  ['pot','Pot of Gold','Find the end of the rainbow.','After the rain there’s a rainbow, and you know what’s at the end of one of those.'],
  ['shepherd','Lost Sheep','Bring a wandering sheep home.','There’s always one sheep that wanders off. Tap it and the shepherd will fetch it home.'],
  ['knight','Sheep Knight','See a sheep take revenge on the dragon.','The dragon keeps eating our sheep. One day the sheep are going to fight back, mark my words.'],
  ['volcano','Wake the Mountain','Make the volcano erupt.','The volcano doesn’t like being poked. Five pokes and it really loses its temper.'],
  ['dragon','Here Be Dragons','Wake the sleeping dragon.','Something big sleeps by the volcano. I wouldn’t tap it. You might.'],
  ['raven','Nevermore','Follow the raven to a waiting question.','When a question’s waited too long, a raven sits on that town. Follow it.'],
  ['fireworks','Encore','Replay a town’s fireworks.','When a town ships, there are fireworks. If you missed them, tap the spent case for an encore.'],
  ['konami','For the Realm','Enter the old code.','An old knight once told me a secret code. Up, up, down, down… then I forget. Something with B and A.']];
function achGot(){const g=eggGet('ach',{});return g&&typeof g==='object'?g:{}}
function achieve(id){if(mode==='sample')return;const g=achGot();if(g[id]||!ACHIEVEMENTS.some(a=>a[0]===id))return;g[id]=new Date().toISOString();eggSet('ach',g);
  const a=ACHIEVEMENTS.find(a=>a[0]===id);setTimeout(()=>{toast(`Achievement unlocked: ${a[1]}`);try{sfx('coin',.6)}catch(e){}},400);renderMenu()}
// achievements earned before the list existed
function achBackfill(){const g=achGot(),c=eggGet('cats',[]);if(c.length&&!g.cat)g.cat=new Date().toISOString();
  if(new Set(c.map(k=>String(k).split('@')[0])).size>=5&&!g.cats)g.cats=new Date().toISOString();if(eggGet('stars',0)>0&&!g.fallen)g.fallen=new Date().toISOString();eggSet('ach',g)}

const MENU={view:null};
function menuView(v){MENU.view=v||null;$('mHome').hidden=!!v;document.querySelectorAll('#menu .mview').forEach(s=>s.hidden=s.dataset.view!==v);renderMenu();
  const m=$('menu');if(m)m.scrollTop=0;setTimeout(()=>{const t=v?document.querySelector(`#menu .mview[data-view="${v}"] .mback`):document.querySelector(`#menu .mrow[data-view="${MENU.last||'status'}"]`);if(t)t.focus({preventScroll:true})},30);if(v)MENU.last=v}
function renderMenu(){if(!$('menu'))return;
  const ruler=REALM.ruler&&REALM.ruler!=='You'?`${monarch()} ${REALM.ruler}`:'';const n=[...villages.values()].filter(v=>v.thKey!=='crown').length,ln=lanes.filter(l=>!/overseer|global/i.test(l.role)).length,asks=ASKS.filter(a=>a.status!=='answered').length;
  $('menuWho').textContent=[ruler?'Ruled by '+ruler:'',n?`${n} town${n===1?'':'s'}`:'',ln?`${ln} lane${ln===1?'':'s'}`:'',asks?`${asks} ask${asks===1?'':'s'} waiting`:''].filter(Boolean).join(' · ');
  $('sumStatus').textContent=mode==='sample'?'Showing the demo kingdom':!LINK.store?'Not connected yet: open the page from claude.ai':LINK.overseer?`Connected · overseer checked in ${fmtAgo(LINK.overseer)==='now'?'just now':fmtAgo(LINK.overseer)+' ago'}`:'Connected · waiting for your overseer';
  const g=achGot(),got=ACHIEVEMENTS.filter(a=>g[a[0]]).length;$('sumAch').textContent=got?`${got} of ${ACHIEVEMENTS.length} found`:`${ACHIEVEMENTS.length} secrets hidden in the kingdom`;
  $('sumSettings').textContent=`Sound ${SND.on?'on':'off'} · ruler, names and town styles`+(premium()?' · weather preview':'');
  {const sc=$('sumCouncil');if(sc&&typeof councilSummary==='function')sc.textContent=councilSummary()}{const sg=$('sumGames');if(sg)sg.textContent=gamesSummary()}if(MENU.view==='games')renderGamesMenu();
  $('sumAbout').textContent=`Engine ${ENGINE_VERSION} · updates and credits`;
  const wx=$('mWx');if(wx)wx.hidden=!premium();
  if(MENU.view==='ach'){$('achLead').textContent=(got?`${got} of ${ACHIEVEMENTS.length} found. `:'Secrets are hidden all over the kingdom. ')+'The barmaid in any tavern loves a gossip, if you want a clue.';
    const ul=$('achGrid');ul.textContent='';for(const [id,name,desc] of ACHIEVEMENTS){const li=document.createElement('li'),on=!!g[id];li.className='ach '+(on?'got':'locked');
      const i=document.createElement('i');i.appendChild(hudIcon(on?'medal':'mystery'));i.setAttribute('aria-hidden','true');const b=document.createElement('b');b.textContent=on?name:'???';li.append(i,b);
      if(on){const s=document.createElement('span');s.textContent=desc;li.appendChild(s)}li.setAttribute('aria-label',on?`${name}: ${desc}`:'Not found yet');ul.appendChild(li)}}}
document.querySelectorAll('#menu .mrow').forEach(b=>b.addEventListener('click',()=>{sfx('blip',.6);menuView(b.dataset.view)}));
document.querySelectorAll('#menu .mback').forEach(b=>b.addEventListener('click',()=>{sfx('blip',.5);menuView(null)}));
achBackfill();

// ---- the barmaid: tap her for a bit of gossip, usually a clue to something not yet found ----
const BARMAIDS=['Maud','Greta','Nell','Bess','Tilly','Rosa','Ada','Peg','Mabel','Edith'];
function barmaidName(v){return BARMAIDS[hash('bmn'+(v.seed||v.name))%BARMAIDS.length]}
const GOSSIP=[
  v=>{const idle=v.lanes.filter(resting).length;return idle>2?`Busy night. ${idle} of them propping up my bar and not a stroke of work between them. Tap one and tell them to get back to it.`:'Quiet in here today. Everyone’s out working, which is good for the kingdom and bad for my tips.'},
  v=>{const b=v.lanes.find(l=>effState(l)==='blocked');return b?`Have you heard? The ${b.role} lane’s been stuck all day${b.waitingOn?', waiting on '+b.waitingOn:''}. Somebody should sort that out.`:'Nobody’s stuck in this town today, touch wood. Makes a nice change.'},
  ()=>`They say the ${monarch()} reads every question the lanes send up. I’ve no idea when they sleep.`,
  ()=>'The couriers are always in a hurry. If you ask me, half those letters could have been one letter.'];
function gossipLine(v){const g=achGot(),left=ACHIEVEMENTS.filter(a=>!g[a[0]]);
  let line=left.length&&Math.random()<.75?left[Math.floor(Math.random()*left.length)][3]:GOSSIP[Math.floor(Math.random()*GOSSIP.length)](v);
  if(line===v.gossip&&left.length>1)return gossipLine(v);return line.replace(/\{M\}/g,monarch())}
function selectBarmaid(v){const B=v.barmaid;if(!B)return;sfx('blip');v.sel=null;v.selTav=false;v.selBar=true;v.gossip=gossipLine(v);v.cam.follow=null;camTo(v,B.x,B.y-14,closeZoom(v));renderStatus(v)}
// ---- feedback: a kind and a message, sent to Pip Living with the version and the screen, nothing from the kingdom ----
var FB={kind:'bug'},FB_HOST='https://www.pipliving.com';
const FB_HINT={bug:'What happened, and what did you expect?',improvement:'What could work better, and how?',idea:'What would you love to see in your kingdom?',other:'What’s on your mind?'};
function fbContext(){return {v:ENGINE_VERSION,where:!active?'world map':active===COURT?'throne room':'town',demo:mode==='sample',screen:innerWidth<700?'phone':innerWidth<1100?'tablet':'desktop'}}
function fbPageUrl(text){const c=fbContext();return FB_HOST+'/kingdom/feedback#'+new URLSearchParams({kind:FB.kind,v:c.v,where:c.where,screen:c.screen,demo:c.demo?'1':'0',m:text}).toString()}
function fbInit(){const f=$('fbForm');if(!f)return;const st=$('fbState'),ta=$('fbText');
  f.querySelectorAll('[data-kind]').forEach(b=>b.addEventListener('click',()=>{FB.kind=b.dataset.kind;f.querySelectorAll('[data-kind]').forEach(x=>{const on=x===b;x.classList.toggle('on',on);x.setAttribute('aria-pressed',String(on))});ta.placeholder=FB_HINT[FB.kind];sfx('blip',.5)}));
  f.addEventListener('submit',async e=>{e.preventDefault();const text=ta.value.trim();if(text.length<3){ta.focus();st.textContent='Write a few words first.';return}
    const send=$('fbSend');send.disabled=true;st.textContent='Sending…';
    // the demo on pipliving.com posts straight to its own server; a kingdom in Claude tries the same, and if its page
    // isn't allowed to reach other sites, hands over to a page on pipliving.com with the message filled in
    const same=/(^|\.)pipliving\.com$/.test(location.hostname),url=(same?'':FB_HOST)+'/api/kingdom/feedback';
    let ok=false;try{const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.assign({kind:FB.kind,message:text},fbContext()))});ok=r.ok}catch(err){ok=false}
    send.disabled=false;
    if(ok){ta.value='';st.textContent='Thank you! Your feedback is on its way to the makers.';sfx('coin',.6);return}
    st.textContent='';const a=document.createElement('a');a.className='btn';a.href=fbPageUrl(text);a.target='_blank';a.rel='noopener';a.textContent='FINISH ON PIPLIVING.COM ↗';
    a.addEventListener('click',()=>{ta.value='';setTimeout(()=>{st.textContent='Thank you! Press Send on that page to deliver it.'},50)});
    st.textContent='This page can’t send it directly, so open it on our site with your message filled in, then press Send there.';{const old=$('fbGo');if(old)old.remove()}const w=document.createElement('div');w.className='obacts';w.id='fbGo';w.appendChild(a);st.after(w);a.addEventListener('click',()=>setTimeout(()=>w.remove(),60))})}

var PIXICO={
 share:['....#....','...###...','..#.#.#..','....#....','....#....','#...#...#','#.......#','#########','.........'],
 menu:['.........','.........','.#######.','.........','.#######.','.........','.#######.','.........','.........'],
 roadmap:['.........','.#######.','.#.....#.','.#.###.#.','.#.....#.','.#.###.#.','.#.....#.','.#######.','.........'],
 up:['.........','....#....','...###...','..#####..','.#######.','...###...','...###...','...###...','.........'],
 next:['.........','...#.....','...##....','...###...','...####..','...###...','...##....','...#.....','.........'],
 prev:['.........','.....#...','....##...','...###...','..####...','...###...','....##...','.....#...','.........'],
 ext:['.........','...#####.','......##.','.....#.#.','....#..#.','...#.....','..#......','.#.......','.........'],
 shuffle:['.........','..####.#.','.#....##.','.#...###.','.#.......','.#.....#.','..#...#..','...###...','.........'],
 medal:['.........','.##...##.','..#...#..','...#.#...','..#####..','.##...##.','.#.....#.','.##...##.','..#####..'],
 mystery:['.........','..#####..','.##...##.','.....##..','....##...','....#....','.........','....#....','.........'],
 scroll:['.#######.','#.......#','.#######.','.#.....#.','.#.###.#.','.#.....#.','.#######.','#.......#','.#######.'],
 status:['.........','.#.#####.','.........','.#.#####.','.........','.#.#####.','.........','.#.#####.','.........'],
 mail:['.........','.........','#########','##.....##','#.#...#.#','#..#.#..#','#...#...#','#########','.........'],
 plus:['.........','....#....','....#....','....#....','.#######.','....#....','....#....','....#....','.........'],
 minus:['.........','.........','.........','.........','.#######.','.........','.........','.........','.........'],
 fit:['.........','.###.###.','.#.....#.','.#.....#.','.........','.#.....#.','.#.....#.','.###.###.','.........'],
 close:['.........','.#.....#.','..#...#..','...#.#...','....#....','...#.#...','..#...#..','.#.....#.','.........'],
 back:['.........','...#.....','..##.....','.#######.','..##.....','...#.....','.........','.........','.........']};
// ===================== data =====================
const STATES=['working','waiting','blocked','idle','done'];
const STATE_COL={working:'#72c96c',waiting:'#e8963a',blocked:'#e5584b',idle:'#8a94ae',done:'#7fd3cf'};
const STATE_LABEL={working:'WORKING',waiting:'WAITING',blocked:'BLOCKED',idle:'IDLE',done:'SHIPPED'};
const ERAS=[[0,'HAMLET'],[25,'VILLAGE'],[50,'TOWN'],[75,'CITY'],[100,'CAPITAL']];
const now0=Date.now(),ago=m=>new Date(now0-m*60000).toISOString();
// the demo kingdom, shown only when the page has no store (the preview, or "view the demo" before the first survey).
// Pip Living's own products with invented work, plus Coinage, a made-up product so every town style appears. None of this is real lane data.
const SAMPLE_PROJECTS=[
 {name:'Pip',pitch:'A gut-health app that spots patterns between food, sleep and symptoms',stage:'beta',platforms:['ios','android','web'],tags:['health','nutrition','wellness'],links:[{to:'Baby Rota',why:'shares its weaning food list'}],
  lanes:[{id:'owner',role:'owner'},{id:'design',role:'design'},{id:'ios',role:'ios'},{id:'android',role:'android'},{id:'backend',role:'backend'},{id:'website',role:'website'},{id:'recipes',role:'recipes'},{id:'exercise',role:'exercise'},{id:'content',role:'content'}]},
 {name:'Seek TCG',pitch:'Pricing and listing tools for trading card sellers',stage:'building',platforms:['ios','android','web'],tags:['marketplace','collectibles','trading cards'],links:[{to:'Coinage',why:'sales totals for the tax year'}],
  lanes:[{id:'owner',role:'owner'},{id:'design',role:'design'},{id:'web-app',role:'web app'},{id:'backend',role:'backend'},{id:'ios',role:'ios'},{id:'android',role:'android'},{id:'website',role:'website'},{id:'qa',role:'qa'}]},
 {name:'Baby Rota',pitch:'A shared rota for new parents: feeds, naps and who is on duty',stage:'building',platforms:['ios','android'],tags:['family','baby','parenting'],
  lanes:[{id:'owner',role:'owner'},{id:'design',role:'design'},{id:'ios',role:'ios'},{id:'ios-qa',role:'ios qa'},{id:'android',role:'android'},{id:'android-qa',role:'android qa'}]},
 {name:'Stream Share',pitch:'Watchlists you share with friends, across every streaming service',stage:'beta',platforms:['ios','web'],tags:['streaming','social','media'],
  lanes:[{id:'owner',role:'owner'},{id:'design',role:'design'},{id:'ios',role:'ios'},{id:'backend',role:'backend'},{id:'support',role:'support'}]},
 {name:'The UXologist',place:'Mages Keep',pitch:'UX research guides and a library of real interface patterns',stage:'live',platforms:['web'],tags:['research','ux','education'],
  lanes:[{id:'coordinator',role:'coordinator'},{id:'web',role:'web'},{id:'analyst',role:'analyst'},{id:'content',role:'content'},{id:'qa',role:'qa'}]},
 {name:'Coinage',place:'Coinal Delve',pitch:'A household budget that splits bills and tracks savings pots',stage:'building',platforms:['web'],tags:['money','budget','finance'],links:[{to:'Baby Rota',why:'childcare costs'}],
  lanes:[{id:'finance',role:'finance'},{id:'data',role:'data'},{id:'analyst',role:'analyst'},{id:'qa',role:'qa'}]},
];
const SAMPLE=[
 {id:'pip--owner',product:'Pip',role:'owner',task:'Planning the spring release',state:'working',progress:64,updated:ago(3),helpers:['Release notes']},
 {id:'pip--design',product:'Pip',role:'design',task:'Weekly insights screen',state:'working',progress:81,updated:ago(6),helpers:['Chart styles','Empty states']},
 {id:'pip--ios',product:'Pip',role:'ios',task:'Quick-add meal sheet',state:'waiting',progress:47,waitingOn:'backend',updated:ago(11)},
 {id:'pip--android',product:'Pip',role:'android',task:'Reminder notifications',state:'working',progress:35,updated:ago(2),helpers:['Writing tests','Fixing lint']},
 {id:'pip--backend',product:'Pip',role:'backend',task:'Pattern finder speed-up',state:'blocked',progress:58,waitingOn:'a data decision',updated:ago(24)},
 {id:'pip--website',product:'Pip',role:'website',task:'New landing page',state:'working',progress:44,updated:ago(9),helpers:['Copy check']},
 {id:'pip--recipes',product:'Pip',role:'recipes',task:'Autumn recipe collection',state:'working',progress:72,talkingTo:'Baby Rota',updated:ago(8),helpers:['Drafting recipes','Checking allergens','Photos']},
 {id:'pip--exercise',product:'Pip',role:'exercise',task:'Gentle movement plans',state:'working',progress:20,updated:ago(15),helpers:['Tagging moves']},
 {id:'pip--content',product:'Pip',role:'content',task:'Help centre articles',state:'idle',progress:60,updated:ago(190)},
 {id:'seek--owner',product:'Seek TCG',role:'owner',task:'Choosing the next three features',state:'working',progress:55,updated:ago(5),helpers:['Seller interviews']},
 {id:'seek--design',product:'Seek TCG',role:'design',task:'Bulk listing flow',state:'working',progress:66,updated:ago(9),helpers:['Card grid']},
 {id:'seek--web-app',product:'Seek TCG',role:'web app',task:'Seller dashboard',state:'working',progress:38,updated:ago(4),helpers:['Sales table','Filters']},
 {id:'seek--backend',product:'Seek TCG',role:'backend',task:'Price history service',state:'working',progress:46,talkingTo:'Coinage',updated:ago(4),helpers:['Price feed','Load testing','Caching']},
 {id:'seek--ios',product:'Seek TCG',role:'ios',task:'Card scanner v2',state:'working',progress:61,updated:ago(7),helpers:['Camera tuning']},
 {id:'seek--android',product:'Seek TCG',role:'android',task:'Listing editor',state:'waiting',progress:25,waitingOn:'backend',updated:ago(13)},
 {id:'seek--website',product:'Seek TCG',role:'website',task:'Pricing page',state:'done',progress:100,updated:ago(50)},
 {id:'seek--qa',product:'Seek TCG',role:'qa',task:'Regression pass on listings',state:'working',progress:80,updated:ago(12),helpers:['Edge cases']},
 {id:'rota--owner',product:'Baby Rota',role:'owner',task:'Beta release plan',state:'working',progress:48,updated:ago(4)},
 {id:'rota--design',product:'Baby Rota',role:'design',task:'Night-feed mode',state:'working',progress:52,updated:ago(5),helpers:['Dark palette']},
 {id:'rota--ios',product:'Baby Rota',role:'ios',task:'Weaning food log',state:'working',progress:42,talkingTo:'Pip',updated:ago(3),helpers:['Food search','Log sheet']},
 {id:'rota--ios-qa',product:'Baby Rota',role:'ios qa',task:'Partner invite flow',state:'working',progress:57,updated:ago(6)},
 {id:'rota--android',product:'Baby Rota',role:'android',task:'Rota widgets',state:'working',progress:18,updated:ago(10),helpers:['Home widget','Shift view']},
 {id:'rota--android-qa',product:'Baby Rota',role:'android qa',task:'Rota screens on test phones',state:'waiting',progress:12,waitingOn:'android',updated:ago(20)},
 {id:'stream--owner',product:'Stream Share',role:'owner',task:'Free and Plus plans',state:'working',progress:52,updated:ago(8)},
 {id:'stream--design',product:'Stream Share',role:'design',task:'Shared list screens',state:'working',progress:70,updated:ago(6),helpers:['Poster grid']},
 {id:'stream--ios',product:'Stream Share',role:'ios',task:'Beta build for testers',state:'blocked',progress:63,waitingOn:'App Store review',updated:ago(30)},
 {id:'stream--backend',product:'Stream Share',role:'backend',task:'Where-to-watch lookups',state:'working',progress:41,updated:ago(4),helpers:['Deep links','Caching']},
 {id:'stream--support',product:'Stream Share',role:'support',task:'Beta tester inbox',state:'working',progress:33,updated:ago(9)},
 {id:'ux--coordinator',product:'The UXologist',role:'coordinator',task:'Membership roadmap',state:'working',progress:70,updated:ago(12)},
 {id:'ux--web',product:'The UXologist',role:'web',task:'Search across the pattern library',state:'working',progress:46,updated:ago(5),helpers:['Search index','Results page']},
 {id:'ux--analyst',product:'The UXologist',role:'analyst',task:'Which guides members finish',state:'working',progress:30,updated:ago(14),helpers:['Reading report']},
 {id:'ux--content',product:'The UXologist',role:'content',task:'New onboarding patterns',state:'working',progress:55,updated:ago(7),helpers:['Screenshots','Pattern notes']},
 {id:'ux--qa',product:'The UXologist',role:'qa',task:'Accessibility audit',state:'idle',progress:90,updated:ago(240)},
 {id:'coin--finance',product:'Coinage',role:'finance',task:'Bill-splitting rules',state:'working',progress:35,updated:ago(6),helpers:['Rounding checks','Shared pots']},
 {id:'coin--data',product:'Coinage',role:'data',task:'Bank export importer',state:'working',progress:62,talkingTo:'Seek TCG',updated:ago(5),helpers:['CSV formats','De-duplicating']},
 {id:'coin--analyst',product:'Coinage',role:'analyst',task:'Monthly spending summary',state:'working',progress:48,updated:ago(10),helpers:['Category trends']},
 {id:'coin--qa',product:'Coinage',role:'qa',task:'Totals cross-check',state:'waiting',progress:20,waitingOn:'data',updated:ago(16)},
 {id:'global-overseer',product:'The Crown',role:'global overseer',task:'Combining every roadmap and your asks',state:'working',progress:60,updated:ago(2)},
];
const SAMPLE_REALM={kingdom:'Pipopolis',castle:'Castle Demesne',ruler:'You',url:''};
const villages=new Map();
let lanes=[],mode='sample';
function sanitize(r){
  const st=STATES.includes(String(r.state).toLowerCase())?String(r.state).toLowerCase():'working';
  let p=Number(r.progress);if(!isFinite(p))p=0;p=clamp(p,0,100);
  // a task broken into steps drives its building: done steps out of the total, not a guess
  const sT=Math.round(Number(r.stepsTotal)),sD=Math.round(Number(r.stepsDone)),hasSteps=sT>0&&sT<=50&&isFinite(sD);if(hasSteps)p=clamp(sD/sT,0,1)*100;
  let helpers=[];if(Array.isArray(r.helpers))helpers=r.helpers.slice(0,4).map(h=>String(h).slice(0,60));else if(Number(r.helpers)>0)helpers=Array.from({length:Math.min(4,Math.floor(Number(r.helpers)))},()=>'Subagent task');
  if(/overseer|global/i.test(String(r.role||'')))r=Object.assign({},r,{product:'The Crown'});
  const prod=canonProduct(String(r.product||r.project||'Unnamed product').slice(0,64));
  return {id:String(r.id||(prod+'-'+(r.role||''))),product:prod,lane:r.lane?String(r.lane).slice(0,30):'',owns:r.owns?String(r.owns).slice(0,140):'',role:String(r.role||'lane').slice(0,24),task:String(r.task||'').slice(0,140),
    state:st,progress:st==='done'?100:p,waitingOn:r.waitingOn?String(r.waitingOn).slice(0,24):'',talkingTo:r.talkingTo?String(r.talkingTo).slice(0,64):'',updated:r.updated?String(r.updated):'',helpers,asleep:!!r.asleep,stepsDone:hasSteps?clamp(sD,0,sT):null,stepsTotal:hasSteps?sT:null,lord:r.lord?String(r.lord).slice(0,30):'',where:r.where==='cloud'||r.where==='local'?r.where:''};
}
function effState(L){if(L.state==='working'&&L.updated){const age=Date.now()-Date.parse(L.updated);if(age>(L.where==='cloud'?6:2)*3600e3)return 'idle'}return L.state}
function fmtAgo(iso){if(!iso)return '';const s=(Date.now()-Date.parse(iso))/1000;if(!isFinite(s))return '';if(s<60)return 'now';if(s<3600)return Math.floor(s/60)+'m';if(s<86400)return Math.floor(s/3600)+'h';return Math.floor(s/86400)+'d'}
const slug=n=>n.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
// a project's progress is its roadmap: steps done out of all its steps. Only a project with no roadmap yet falls back to how far its buildings have risen
function projectProgress(v){const rm=ROADMAPS[v.name];if(rm){const t=rm.total,dn=rm.done;if(t>0&&isFinite(dn))return {pct:Math.round(clamp(dn/t)*100),src:'roadmap',done:Math.round(dn),total:Math.round(t)};
  if(isFinite(rm.pct)&&rm.pct>=0&&!(t===0))return {pct:Math.round(clamp(rm.pct/100)*100),src:'roadmap'}}return {pct:townStats(v).pct,src:'built'}}
function townStats(v){
  const n=v.lanes.length,avg=v.lanes.reduce((s,L)=>s+L.progress,0)/Math.max(1,n);
  const st=v.lanes.map(effState);
  return {pct:Math.round(avg),era:[...ERAS].reverse().find(e=>avg>=e[0])[1],blocked:st.filter(s=>s==='blocked').length,idle:st.filter(s=>s==='idle').length,
    working:st.filter(s=>s==='working').length,helpers:v.lanes.reduce((s,L,i)=>s+(st[i]==='working'?L.helpers.length:0),0),
    out:[...new Set(v.lanes.filter(L=>L.talkingTo&&L.talkingTo!==v.name).map(L=>L.talkingTo))],
    inc:[...new Set(lanes.filter(L=>L.talkingTo===v.name&&L.product!==v.name).map(L=>L.product))]};
}
let LAST_RAW=null;
function setLanes(list){
  LAST_RAW=list;lanes=list.map(sanitize);lanes.push(...rosterLanes(lanes));
  const by=new Map();for(const L of lanes){if(!by.has(L.product))by.set(L.product,[]);by.get(L.product).push(L)}
  const order=['owner','coordinator','design','ios qa','ios','android qa','android','web app','web','backend','analyst','qa','recipes','exercise','content'];
  const rank=r=>{const i=order.findIndex(o=>r.toLowerCase().includes(o));return i<0?99:i};
  for(const a of by.values())a.sort((x,y)=>rank(x.role)-rank(y.role)||x.role.localeCompare(y.role));
  for(const [name] of villages)if(!by.has(name))villages.delete(name);
  THEME_PICK=assignThemes(new Map([...by].map(([n,a])=>[n,a.length])));
  for(const [name,arr] of by){let v=villages.get(name);if(!v){v=makeVillage(name);villages.set(name,v)}
    const sig=arr.map(l=>l.id+':'+l.role).join('|');{const old=new Map((v.lanes||[]).map(l=>[l.id,l]));for(const L of arr){const o=old.get(L.id);if(o&&o.g){L.g=o.g;L.i=o.i}}}v.lanes=arr;v.thKey=themeFor(name);v.th=THEMES[v.thKey];for(const L of arr){L.info=roleInfo(L.role,L.id);L.T=TYPES[L.info.type]}
    const sig2=sig+'|'+v.thKey+'|'+(premium()?1:0);if(v.sig!==sig2){v.sig=sig2;v.bg=null;v.people={};v.lpr=null}}
  world.sig=null;
  updateStatus();renderOnboard();route(true);
}

// ===================== DOM =====================
const $=id=>document.getElementById(id);
function makeVillage(name){const cv=document.createElement('canvas');
  return {name,cv,ctx:cv.getContext('2d'),lanes:[],people:{},parts:[],bugs:[],dabs:{},helpers:{},sel:null,seed:hash(name),cam:null}}
function fillRoster(ul,v,onPick){
  ul.innerHTML='';
  for(const L of v.lanes){const s=effState(L),col=roleInfo(L.role).col,li=document.createElement('li'),b=document.createElement('button');b.type='button';if(v.sel===L.id){b.classList.add('sel');b.setAttribute('aria-current','true')}
    b.innerHTML=`<span class="rsw"></span><span class="rrole"></span><span class="rtask"></span><span class="rright"><span class="bar">${'<i></i>'.repeat(10)}</span><span class="pill"></span><span class="age"></span></span>`;
    b.querySelector('.rsw').style.background=col;
    b.querySelector('.rrole').textContent=L.role+(s==='working'&&L.helpers.length?` +${L.helpers.length}`:'')+(typeof lordOf==='function'&&lordOf(L)?` · ${lordOf(L)}`:'')+(L.where==='cloud'?' · cloud':L.where==='local'?' · local':'');
    const to=L.talkingTo&&L.talkingTo!==v.name?villages.get(L.talkingTo):null;
    b.querySelector('.rtask').textContent=(L.task||'—')+(to?` · letters with ${placeName(to)}`:'');
    b.querySelectorAll('.bar i').forEach((i,k)=>{if(k<Math.round(L.progress/10))i.classList.add('on')});
    const pill=b.querySelector('.pill');pill.textContent=STATE_LABEL[s];pill.style.background=STATE_COL[s];
    b.querySelector('.age').textContent=fmtAgo(L.updated);
    b.setAttribute('aria-label',`${L.role}: ${L.task}, ${STATE_LABEL[s].toLowerCase()}, ${Math.round(L.progress)} percent`);
    b.addEventListener('click',()=>onPick(L));li.appendChild(b);ul.appendChild(li)}
}
function laneLine(v,L){
  const st=effState(L),info=roleInfo(L.role,L.id),T=TYPES[info.type];
  const parts={working:'is building',waiting:'is waiting'+(L.waitingOn?' on '+L.waitingOn:''),blocked:'is blocked'+(L.waitingOn?' by '+L.waitingOn:''),idle:(L.state==='working'?'has gone quiet and is ':'is ')+(v.tav?'drinking in the tavern':'by the campfire'),done:L._rest?`has shipped and is celebrating in the ${v.tav?'tavern':'firelight'}`:'has just shipped'};
  if(L.unreported)return [`${info.title} of the ${T.name}`,` (${L.role}) has not sent a report yet${L.owns?'. Looks after: '+L.owns:''}. The overseer will bring news on its next cycle.`];
  let txt=` (${L.role}) ${parts[st]}: ${L.task||'no task given'} . ${L.stepsTotal?`Step ${Math.min(L.stepsTotal,L.stepsDone+1)} of ${L.stepsTotal}, `:''}${Math.round(L.progress)}% built`+(L.updated?`, last report ${fmtAgo(L.updated)==='now'?'just now':fmtAgo(L.updated)+' ago'}.`:'.');
  const to=L.talkingTo&&L.talkingTo!==v.name?villages.get(L.talkingTo):null;
  if(to)txt+=` Sends couriers to ${placeName(to)} (${to.name}).`;
  if(L.helpers.length&&st==='working')txt+=` Apprentices: ${L.helpers.join(', ')}.`;
  if(L.owns)txt+=` Looks after: ${L.owns}.`;
  return [`${info.title} of the ${T.name}`,txt];
}
// what a lane says when you tap them: their own news, in their own words
function laneSpeech(v,L){const st=effState(L),info=roleInfo(L.role,L.id),T=TYPES[info.type],task=String(L.task||'').trim().replace(/[.!\s]+$/,''),w=task?task.charAt(0).toLowerCase()+task.slice(1):'';
  const head=`${info.title} of the ${T.name} (${L.role})`;
  if(L.asleep)return [head,`My session has gone quiet, so messages can’t reach me right now. Reopen me in Claude Code with Remote Control on, or tap Get back to work and I’ll ask my owner for my next task.`];
  if(L.unreported)return [head,`I haven’t sent my first report yet. The overseer will bring my news on its next round.${L.owns?' I look after '+L.owns+'.':''}`];
  const pct=Math.round(L.progress),rest=v.tav?'having a drink in the tavern':'warming my hands by the fire';
  let q={working:w?`${/^\w+ing\b/.test(w)?'I’m '+w:'I’m working on '+w}. ${L.stepsTotal?`${L.stepsDone} of ${L.stepsTotal} steps done.`:`About ${pct}% there.`}`:`I’m hard at work. ${L.stepsTotal?`${L.stepsDone} of ${L.stepsTotal} steps done.`:`About ${pct}% there.`}`,
    waiting:`I’m waiting${L.waitingOn?' on '+L.waitingOn:''} before I can carry on${w?' with '+w:''}.`,
    blocked:`I’m stuck${L.waitingOn?': '+L.waitingOn+' is in my way':''}.${w?' I can’t finish '+w+' until it’s sorted.':''}`,
    idle:`Nothing on my bench just now, so I’m ${rest}.${w?' Last thing I did was '+w+'.':''}`,
    done:L._rest?`We shipped it${w?': '+w:''}! I’m celebrating ${v.tav?'in the tavern':'by the fire'}.`:`Just shipped${w?' '+w:' it'}!`}[st]||`${w}.`;
  if(L.updated){const a=fmtAgo(L.updated);q+=a==='now'?' I sent my report just now.':` My last report was ${a} ago.`}
  const to=L.talkingTo&&L.talkingTo!==v.name?villages.get(L.talkingTo):null;if(to)q+=` I’m sending couriers to ${placeName(to)}.`;
  if(L.helpers.length&&st==='working'){const hs=L.helpers.map(h=>String(h).charAt(0).toLowerCase()+String(h).slice(1));q+=` ${hs.length>1?'My apprentices are':'My apprentice is'} helping with ${hs.length>1?hs.slice(0,-1).join(', ')+' and '+hs[hs.length-1]:hs[0]}.`}
  if(L.owns)q+=` I look after ${L.owns}.`;
  return [head,q]}
// the dialog box: pops up, then the words come out a few letters at a time with a little blip, the speaker's portrait talking alongside
const SPEAK={key:'',timer:null,face:null};
function speak(head,txt,face){const dl=$('dialog'),el=$('dlgText'),key=head+'|'+txt,fc=$('dlgFace');
  if(SPEAK.key===key&&!dl.hidden)return;const fresh=dl.hidden||SPEAK.head!==head;SPEAK.key=key;SPEAK.head=head;SPEAK.face=face;clearInterval(SPEAK.timer);
  el.textContent='';const b=document.createElement('b');b.textContent=head;const q=document.createElement('q');el.append(b,q);dl.hidden=false;fc.hidden=!face;
  if(fresh){dl.classList.remove('pop');void dl.offsetWidth;dl.classList.add('pop')}
  const drawFace=talk=>{if(!face)return;const c=fc.getContext('2d');c.imageSmoothingEnabled=false;c.fillStyle='#1c2a6a';c.fillRect(0,0,26,30);c.fillStyle='#2c3c96';c.fillRect(0,22,26,8);
    drawHero(c,13,29,Object.assign({},face.cls,{dir:'down',pose:talk?'talk':'idle',frame:talk?Math.floor(performance.now()/120):0,breath:1}))};
  // the same speaker with fresher news (a report came in while you were listening): no need to say it all again
  if(reduce||!fresh){q.textContent=txt;drawFace(false);return}
  let i=0;drawFace(true);SPEAK.timer=setInterval(()=>{i=Math.min(txt.length,i+2);q.textContent=txt.slice(0,i);if(i%8===0)sfx('blip',.15);drawFace(i<txt.length);if(i>=txt.length)clearInterval(SPEAK.timer)},24)}
// under a lane's words: get them back to work, or write to them; and what happened to the last thing you sent
function postLine(d){const what=d.kind==='nudge'?'nudge back to work':'message';
  if(d.status==='queued')return LINK.overseer&&Date.parse(LINK.overseer)>=Date.parse(d.createdAt||0)?`A herald is on the road with your ${what}.`:(overseerQuick()?`Your ${what} is waiting for the overseer, who checks every minute while you watch.`:`Your ${what} is waiting for the overseer's next round. To make that a minute, run it on /loop with no time: see the throne room's setup prompt.`);
  if(d.status==='delivered')return `Your ${what} reached me${d.deliveredTo&&!/^(lane|owner)$/i.test(d.deliveredTo)?' via '+d.deliveredTo:''}.`;
  if(d.status==='done')return '✓ '+(d.note||`Done: your ${what} was dealt with.`);
  return '⚠ '+(d.note||`Your ${what} couldn't reach me. Reopen my session in Claude Code with Remote Control on.`)}
function laneActions(v,L){const a=$('dlgActs'),post=$('dlgPost');if(!a)return;a.textContent='';
  if(!v||!L||v===COURT||L.unreported){a.hidden=true;post.hidden=true;return}
  const st=effState(L),stuck=L.asleep||resting(L)||st==='idle'||st==='blocked'||st==='waiting';
  const mk=(t,fn,pri)=>{const b=document.createElement('button');b.type='button';b.className='btn'+(pri?' primary':'');b.textContent=t;b.onclick=fn;a.appendChild(b)};
  if(stuck)mk('GET BACK TO WORK',()=>sendToLanes(v,[L.id],'Get back to work: check with your owner for your next task.','nudge'),true);
  mk('MESSAGE',()=>openMsg(v,[L.id]));a.hidden=!canRule();
  const d=lanePost(L);post.hidden=!d;if(d)post.textContent=postLine(d)}
// the town's message window: tick lanes, write once, a herald carries it to each
// ---- roadmaps: one project's checklist in a town, every project's at a glance in the throne room ----
const SAMPLE_RM={
 'Pip':[['Foundations',['Family accounts and sign-in','Shared calendar','Push notifications'],3],['Launch',['Weaning food lists','Movement plans','App Store listing','Beta with ten families'],1],['After launch',['Partner sharing','Widgets','Android parity'],0]],
 'Seek TCG':[['Marketplace',['Card catalogue','Price history','Listings and offers','Seller payouts'],3],['Trust',['Grading badges','Disputes flow'],0],['Grow',['Collections','Trade nights map'],0]],
 'Baby Rota':[['MVP',['Rota builder','Reminders','Carer invites'],3],['Polish',['Night-feed mode','Handover notes','Dark mode'],1]],
 'Stream Share':[['Core',['Watch parties','Shared queues','Chat'],2],['Scale',['Creator pages','Clips','Moderation tools'],0]],
 'The UXologist':[['Studio',['Case studies','Booking flow','Newsletter'],3],['Content',['Teardown series','Toolkit downloads'],1]],
 'Coinage':[['Ledger',['Bank sync','Categories','Budgets'],2],['Insights',['Monthly report','Goals','Export'],0]]};
function sampleRoadmaps(){const out={};for(const [name,phases] of Object.entries(SAMPLE_RM)){const steps=[];let next='';for(const [ph,list,n] of phases)list.forEach((t,i)=>{const done=i<n;if(!done&&!next)next=t;steps.push({t,done,ph})});const done=steps.filter(s=>s.done).length;out[name]={done,total:steps.length,pct:Math.round(done/steps.length*100),next,steps}}return out}
function cleanSteps(a){return Array.isArray(a)?a.slice(0,120).map(s=>typeof s==='string'?{t:s.slice(0,100),done:false,ph:''}:{t:String(s&&(s.step||s.t||s.title)||'').slice(0,100),done:!!(s&&s.done),ph:String(s&&(s.phase||s.ph)||'').slice(0,40),proof:['tested','checked'].includes(s&&s.proof)?s.proof:'',q:String(s&&(s.quest||s.q)||'').slice(0,24)}).filter(s=>s.t):[]}
const RMV={v:null};
function openRoadmap(v){RMV.v=v||null;$('rmView').hidden=false;renderRoadmap();sfx('blip');setTimeout(()=>{const x=$('rmX');if(x)x.focus({preventScroll:true})},60)}
function closeRoadmap(){$('rmView').hidden=true;RMV.v=null;sfx('blip',.5)}
function rmBar(pct){const b=document.createElement('span');b.className='rmbar';b.setAttribute('aria-hidden','true');const i=document.createElement('i');i.style.width=Math.max(0,Math.min(100,pct))+'%';b.appendChild(i);return b}
function renderRoadmap(){const card=$('rmCard');if(!card||$('rmView').hidden)return;card.textContent='';const v=RMV.v;
  const add=(tag,cls,txt,par)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;(par||card).appendChild(e);return e};
  const x=add('button','x guideX');setIcon(x,'close');x.type='button';x.id='rmX';x.setAttribute('aria-label','Close');x.onclick=closeRoadmap;
  if(!v){// the throne room: every project at a glance
    add('p','obkick','THE ROYAL ROADMAPS');const h=add('h2',null,'Every project at a glance');h.id='rmH';
    const projs=[...villages.values()].filter(p=>p.thKey!=='crown');
    if(!projs.length){add('p',null,'No projects yet.');return}
    const ul=add('ul','rmall');
    for(const p of projs){const pp=projectProgress(p),rm=ROADMAPS[p.name],li=add('li',null,null,ul),b=document.createElement('button');b.type='button';b.className='rmrow';b.style.setProperty('--ac',themeColour(p));
      const top=add('span','rmtop',null,b);add('b',null,p.name,top);add('span','rmpct',pp.pct+'%',top);b.appendChild(rmBar(pp.pct));
      const ph=rm&&rm.steps&&rm.steps.length?(rm.steps.find(s=>!s.done)||{}).ph:'';
      add('small',null,rm?(pp.total?`${pp.done} of ${pp.total} steps`:'Roadmap')+(ph?' · '+ph:'')+(rm.next?' · Next: '+rm.next:''):'No roadmap yet: '+pp.pct+'% built',b);
      b.onclick=()=>{RMV.v=p;renderRoadmap()};li.appendChild(b)}
    add('p','rmnote','Tap a project to see its full roadmap.');return}
  // one project
  const rm=ROADMAPS[v.name],pp=projectProgress(v);
  if(!RMV.fromTown&&active===COURT){const bk=add('button','btn small rmback','◂ ALL PROJECTS');bk.type='button';bk.onclick=()=>{RMV.v=null;renderRoadmap()}}
  add('p','obkick','ROADMAP · '+placeName(v).toUpperCase());const h=add('h2',null,v.name);h.id='rmH';
  const sum=add('div','rmsum');sum.appendChild(rmBar(pp.pct));add('span',null,pp.src==='roadmap'?(pp.total?`${pp.pct}% · ${pp.done} of ${pp.total} steps done`:`${pp.pct}% done`):`No roadmap yet · ${pp.pct}% built`,sum);
  if(rm&&rm.next){const n=add('p','rmnext');add('b',null,'NEXT ',n);n.appendChild(document.createTextNode(rm.next))}
  const steps=rm&&rm.steps||[];
  if(!steps.length){add('p','rmnote',rm?'The overseer has the totals but not the steps yet. They appear after the owner’s next report.':'This project has no roadmap yet. Ask its Owner lane to keep ROADMAP.md as a checklist; the overseer brings it here on its next round.');return}
  let ul=null,cur=null;const nextT=(steps.find(s=>!s.done)||{}).t;
  for(const s of steps){if(!ul||s.ph!==cur){cur=s.ph;if(cur){const ph=steps.filter(z=>z.ph===cur),d=ph.filter(z=>z.done).length;const hh=add('h3','rmph',null);hh.textContent=cur;add('span',null,` ${d}/${ph.length}`,hh)}ul=add('ul','rmsteps')}
    const li=add('li',(s.done?'done':'')+(s.t===nextT?' next':''),null,ul);add('i',null,s.done?'✓':s.t===nextT?'▸':'',li);add('span',null,s.t,li)}}
const MSG={v:null,sel:new Set()};
function openMsg(v,ids){if(!v||v===COURT||!canRule())return;MSG.v=v;MSG.sel=new Set(ids||[]);const t=$('msgText');if(t)t.value='';$('msgView').hidden=false;renderMsg();sfx('blip');setTimeout(()=>{const x=$('msgText');if(x)x.focus({preventScroll:true})},60)}
function closeMsg(){$('msgView').hidden=true;MSG.v=null;sfx('blip',.5)}
function renderMsg(){const v=MSG.v,card=$('msgCard');if(!v||!card)return;const keep=$('msgText')?$('msgText').value:'';card.textContent='';
  const add=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;card.appendChild(e);return e};
  const x=add('button','x guideX');setIcon(x,'close');x.type='button';x.setAttribute('aria-label','Close');x.onclick=closeMsg;
  add('p','obkick','SEND WORD · '+placeName(v).toUpperCase());add('h2',null,'Message the lanes');x.id='msgX';card.querySelector('h2').id='msgH';
  add('p',null,'Choose who it’s for. Your overseer’s herald carries it on its next round, straight to each lane, or through the owner if a lane has gone quiet.');
  const grid=add('div','mlanes');
  for(const L of v.lanes){const st=effState(L),zz=L.asleep||resting(L)||st==='idle',lab=document.createElement('label');lab.className='mlane'+(zz?' zz':'');
    const cb=document.createElement('input');cb.type='checkbox';cb.checked=MSG.sel.has(L.id);cb.onchange=()=>{cb.checked?MSG.sel.add(L.id):MSG.sel.delete(L.id);syncBtns()};
    const cv=document.createElement('canvas');cv.width=26;cv.height=30;const c=cv.getContext('2d');c.imageSmoothingEnabled=false;drawHero(c,13,29,Object.assign({},roleInfo(L.role,L.id).cls,{dir:'down',pose:'idle',frame:0}));
    const top=document.createElement('span');top.className='mtop';const tx=document.createElement('span');tx.textContent=roleInfo(L.role,L.id).title;top.append(cv,tx);const sm=document.createElement('small');sm.textContent=L.role+' · '+(L.asleep?'gone quiet':zz?'idle':st);
    lab.append(cb,top,sm);grid.appendChild(lab)}
  const all=add('button','btn small','SELECT ALL');all.type='button';
  const ta=add('textarea');ta.id='msgText';ta.value=keep;ta.setAttribute('aria-label','Your message');ta.placeholder='e.g. Ship the bug fixes first, then start the new feature.';ta.oninput=()=>syncBtns();
  const acts=add('div','obacts'),send=document.createElement('button'),nudge=document.createElement('button');send.type='button';send.className='btn primary';send.textContent='SEND ▸';nudge.type='button';nudge.className='btn';acts.append(send,nudge);
  const idle=()=>v.lanes.filter(L=>L.asleep||resting(L)||effState(L)==='idle');
  function syncBtns(){const n=MSG.sel.size;send.disabled=!n||!ta.value.trim();send.textContent=n?`SEND TO ${n} LANE${n>1?'S':''} ▸`:'SEND ▸';
    const tgt=n?[...MSG.sel]:idle().map(L=>L.id);nudge.textContent=n?'GET THEM BACK TO WORK':`GET ${tgt.length} IDLE LANE${tgt.length===1?'':'S'} BACK TO WORK`;nudge.disabled=!tgt.length;
    all.textContent=n===v.lanes.length?'UNSELECT ALL':'SELECT ALL'}
  all.onclick=()=>{const on=MSG.sel.size!==v.lanes.length;MSG.sel=new Set(on?v.lanes.map(L=>L.id):[]);grid.querySelectorAll('input').forEach(i=>i.checked=on);syncBtns()};
  send.onclick=async()=>{const t=ta.value.trim();if(!t||!MSG.sel.size)return;send.disabled=true;if(await sendToLanes(v,[...MSG.sel],t,'message')){ta.value='';MSG.sel=new Set();renderMsg()}else send.disabled=false};
  nudge.onclick=async()=>{const tgt=MSG.sel.size?[...MSG.sel]:idle().map(L=>L.id);if(!tgt.length)return;nudge.disabled=true;if(await sendToLanes(v,tgt,'Get back to work: check with your owner for your next task.','nudge')){MSG.sel=new Set();renderMsg()}};
  syncBtns();
  const ds=DECREES.filter(d=>d.to===v.name&&d.lanes&&d.lanes.length).sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt))).slice(0,5);
  if(ds.length){add('p','obstate','RECENT');const ul=add('ul','mlog');for(const d of ds){const li=document.createElement('li'),b=document.createElement('b');
    b.textContent=d.lanes.map(id=>{const L=v.lanes.find(x=>x.id===id);return L?L.role:id.split('--').pop()}).join(', ')+(d.createdAt?' · '+fmtAgo(d.createdAt):'')+': ';li.append(b,document.createTextNode((d.kind==='nudge'?'Back to work. ':'“'+d.text.slice(0,90)+(d.text.length>90?'…':'')+'” ')+postLine(d)));ul.appendChild(li)}}}
function hushDialog(){clearInterval(SPEAK.timer);SPEAK.key='';SPEAK.head='';$('dialog').hidden=true}
function setRich(el,[head,txt]){el.textContent='';const b=document.createElement('b');b.textContent=head;el.append(b,document.createTextNode(txt))}
function renderVillageDom(v){if(v===active)renderStatus(v)}
function updateStatus(){$('status').className='status '+(mode==='live'?'live':'sample');$('statusText').textContent=mode==='live'?('LIVE · '+lanes.filter(l=>!l.unreported&&l.product!=='The Crown').length+' LANES'):mode==='empty'?'AWAITING SURVEY':'DEMO KINGDOM'}

// ===================== town view: camera, HUD, input =====================
const TV={cv:$('townCv'),view:$('townView')};TV.ctx=TV.cv.getContext('2d');
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
// side panel on wide screens and on phones held sideways; a bottom sheet on phones held upright
const wide=()=>innerWidth>=900||(innerWidth>=640&&innerHeight<=520);
function sizeTownCanvas(){TV.dpr=Math.min(3,devicePixelRatio||1);TV.cw=TV.view.clientWidth||innerWidth;TV.ch=TV.view.clientHeight||innerHeight;TV.cv.width=Math.round(TV.cw*TV.dpr);TV.cv.height=Math.round(TV.ch*TV.dpr)}
function panelOpen(){return TV.view.classList.contains('panel-open')}
function freeRect(){const W=TV.cw,H=TV.ch;if(panelOpen()){if(wide())return {x:0,y:0,w:W-340-28,h:H};return {x:0,y:0,w:W,h:H*(TV.view.classList.contains('tall')?.12:.48)}}return {x:0,y:0,w:W,h:H}}
function fitZoom(v){const f=freeRect();let z=Math.min((f.w-32)/v.W,(f.h-32)/v.H);if(z*TV.dpr>=2)z=Math.floor(z*TV.dpr)/TV.dpr;return Math.max(.3,z)}
function maxZoom(v){return Math.max(fitZoom(v)*4,6)}
function clampCam(v,c){const f=freeRect(),cw=TV.cw,ch=TV.ch,ox=v.OX||0,oy=v.OY||0;
  const l=-ox+(f.x+f.w/2)/c.z,r=v.W+ox-(cw-f.x-f.w/2)/c.z,t=-oy+(f.y+f.h/2)/c.z,b=v.H+oy-(ch-f.y-f.h/2)/c.z;
  c.cx=l>r?v.W/2:clamp(c.cx,l,r);c.cy=t>b?v.H/2:clamp(c.cy,t,b);return c}
function camFit(v){return {cx:v.W/2,cy:v.H/2,z:fitZoom(v)}}
function ensureCam(v,fresh){if(!v.cam||fresh){v.cam=camFit(v);v.cam.target=null;v.cam.follow=null}clampCam(v,v.cam)}
function camTo(v,cx,cy,z){const c=v.cam;c.target=clampCam(v,{cx,cy,z:clamp(z,fitZoom(v)*.98,maxZoom(v))});if(reduce){Object.assign(c,{cx:c.target.cx,cy:c.target.cy,z:c.target.z});c.target=null}}
function closeZoom(v){return Math.max(v.cam.z,fitZoom(v)*2.2,3.2)}
function stepCam(v,dt){const c=v.cam;if(!c)return;
  if(c.follow){const p=v.people[c.follow];if(p){const tz=c.target?c.target.z:c.z;c.target=clampCam(v,{cx:p.x,cy:p.y-16,z:tz})}}
  if(c.target){const k=1-Math.exp(-dt*9);c.cx+=(c.target.cx-c.cx)*k;c.cy+=(c.target.cy-c.cy)*k;c.z+=(c.target.z-c.z)*k;
    if(!c.follow&&Math.abs(c.target.z-c.z)<.002&&Math.abs(c.target.cx-c.cx)<.05&&Math.abs(c.target.cy-c.cy)<.05){c.cx=c.target.cx;c.cy=c.target.cy;c.z=c.target.z;c.target=null}}
  clampCam(v,c)}
function toScene(v,sx,sy){const f=freeRect(),c=v.cam;return {x:c.cx+(sx-f.x-f.w/2)/c.z,y:c.cy+(sy-f.y-f.h/2)/c.z}}
function toScreen(v,x,y){const f=freeRect(),c=v.cam;return {x:f.x+f.w/2+(x-c.cx)*c.z,y:f.y+f.h/2+(y-c.cy)*c.z}}
function zoomAt(v,sx,sy,nz){const c=v.cam;nz=clamp(nz,fitZoom(v)*.98,maxZoom(v));const p=toScene(v,sx,sy),f=freeRect();c.z=nz;c.cx=p.x-(sx-f.x-f.w/2)/nz;c.cy=p.y-(sy-f.y-f.h/2)/nz;c.target=null;clampCam(v,c)}
// how far the town scene must carry on past its walls so that, at the widest zoom, it fills the screen in every layout
function townMargin(v,lpr,nRows,wet){return viewMargin((3+lpr*LOTW)*TS,(1+nRows*LOTH+STRIP+(wet?2:1))*TS)}
function viewMargin(W,H){const cw=TV.cw||innerWidth,ch=TV.ch||innerHeight;
  const zs=[(cw-32)/W,(ch-32)/H];if(cw>=900)zs.push((cw-368-32)/W);else zs.push((ch*.48-32)/H);const z=Math.max(.3,Math.min(...zs))*.97;
  const r=n=>Math.min(1100,Math.ceil(n/16)*16+32);return [r(cw/z),r(ch/z)]}
function drawTownView(v){
  const c=TV.ctx,d=TV.dpr,f=freeRect(),cam=v.cam,z=cam.z*d,ox=(f.x+f.w/2)*d-cam.cx*z,oy=(f.y+f.h/2)*d-cam.cy*z,W=TV.cv.width,H=TV.cv.height;
  c.setTransform(1,0,0,1,0,0);c.imageSmoothingEnabled=false;
  c.fillStyle='#0b0f1a';c.fillRect(0,0,W,H);
  c.imageSmoothingEnabled=z<1;c.setTransform(z,0,0,z,ox,oy);c.drawImage(v.cv,-v.OX,-v.OY);c.setTransform(1,0,0,1,0,0);
}
// pointer input: drag to pan, pinch or wheel to zoom, tap to select
const PTR=new Map();let drag=null,pinch=null;
TV.cv.addEventListener('pointerdown',e=>{const v=active;if(!v||!v.cam)return;TV.cv.setPointerCapture(e.pointerId);PTR.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(PTR.size===1)drag={x:e.clientX,y:e.clientY,cx:v.cam.cx,cy:v.cam.cy,moved:false};
  else if(PTR.size===2){const [a,b]=[...PTR.values()];pinch={d:Math.hypot(a.x-b.x,a.y-b.y),z:v.cam.z};drag=null}});
TV.cv.addEventListener('pointermove',e=>{const v=active;if(!v||!PTR.has(e.pointerId))return;PTR.set(e.pointerId,{x:e.clientX,y:e.clientY});const r=TV.cv.getBoundingClientRect();
  if(pinch&&PTR.size>=2){const [a,b]=[...PTR.values()],d=Math.hypot(a.x-b.x,a.y-b.y);zoomAt(v,(a.x+b.x)/2-r.left,(a.y+b.y)/2-r.top,pinch.z*d/Math.max(10,pinch.d));v.cam.follow=null;return}
  if(drag){const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(!drag.moved&&Math.hypot(dx,dy)>6){drag.moved=true;TV.cv.classList.add('dragging');v.cam.follow=null;v.cam.target=null}
    if(drag.moved){v.cam.cx=drag.cx-dx/v.cam.z;v.cam.cy=drag.cy-dy/v.cam.z;clampCam(v,v.cam)}}});
function endPtr(e){const v=active;if(drag&&!drag.moved&&PTR.size===1&&v&&!wide()&&panelOpen()){setPanel(false);$('statusBtn').focus({preventScroll:true})}
  else if(drag&&!drag.moved&&PTR.size===1&&v){const r=TV.cv.getBoundingClientRect();tapTown(v,e.clientX-r.left,e.clientY-r.top)}
  PTR.delete(e.pointerId);if(PTR.size<2)pinch=null;if(!PTR.size){drag=null;TV.cv.classList.remove('dragging')}}
TV.cv.addEventListener('pointerup',endPtr);TV.cv.addEventListener('pointercancel',e=>{PTR.delete(e.pointerId);drag=null;pinch=null;TV.cv.classList.remove('dragging')});
TV.cv.addEventListener('wheel',e=>{const v=active;if(!v||!v.cam)return;e.preventDefault();const r=TV.cv.getBoundingClientRect();v.cam.follow=null;zoomAt(v,e.clientX-r.left,e.clientY-r.top,v.cam.z*Math.exp(-e.deltaY*(e.ctrlKey?.01:.0018)))},{passive:false});
TV.cv.addEventListener('keydown',e=>{const v=active;if(!v||!v.cam)return;const c=v.cam,s=48/c.z,k=e.key;
  if(k==='+'||k==='='){zoomStep(1.5)}else if(k==='-'||k==='_'){zoomStep(1/1.5)}
  else if(k.startsWith('Arrow')){c.follow=null;c.target=null;c.cx+=k==='ArrowLeft'?-s:k==='ArrowRight'?s:0;c.cy+=k==='ArrowUp'?-s:k==='ArrowDown'?s:0;clampCam(v,c)}else return;e.preventDefault()});
function zoomStep(m){const v=active;if(!v)return;const c=v.cam,b=c.target||c;camTo(v,b.cx,b.cy,b.z*m);c.target&&(c.target.follow=null)}
$('zIn').addEventListener('click',()=>zoomStep(1.5));$('zOut').addEventListener('click',()=>zoomStep(1/1.5));
$('zFit').addEventListener('click',()=>{const v=active;if(!v)return;v.cam.follow=null;const f=camFit(v);camTo(v,f.cx,f.cy,f.z)});
function tapTown(v,sx,sy){const {x,y}=toScene(v,sx,sy);if(v===COURT){tapCourt(x,y);return}if(gameTownTap(v,x,y))return;if(eggTownTap(v,x,y,(performance.now()-T0)/1000))return;
  let best=null,bd=14;for(const L of v.lanes){const p=v.people[L.id];if(!p)continue;const d=Math.hypot(p.x-x,(p.y-14-y)*.8);if(d<bd){bd=d;best=L}}
  {const B=v.barmaid;if(B&&v.tav&&Math.hypot(B.x-x,(B.y-14-y)*.8)<Math.min(bd,14)){selectBarmaid(v);return}}
  if(best){selectLane(v,best.id,'person');return}
  const lot=v.lanes.find(L=>L.g&&x>=L.g.ox&&x<L.g.ox+LOTW*TS&&y>=L.g.oy&&y<L.g.oy+LOTH*TS-8);
  if(lot){selectLane(v,lot.id,'building');return}
  const t=v.tav;if(t&&x>=t.X&&x<t.X+t.w&&y>=t.Y-10&&y<t.Y+t.h){selectTavern(v);return}
  if(v.sel||v.selBar||v.selTav){v.sel=null;v.selBar=false;v.selTav=false;v.cam.follow=null;renderStatus(v)}}
function selectLane(v,id,how){
  const L=v.lanes.find(l=>l.id===id);if(!L)return;sfx('blip');v.sel=id;v.waveReq=id;v.selTav=false;v.selBar=false;
  const p=v.people[id];
  if(how==='building'){const g=L.g;v.cam.follow=null;camTo(v,g.bx+L.T.W/2,g.B-L.T.H/2+8,closeZoom(v))}
  else if(p){v.cam.follow=id;camTo(v,p.x,p.y-16,closeZoom(v))}
  renderStatus(v);
}
function selectTavern(v){v.sel=null;v.selBar=false;v.selTav=true;v.cam.follow=null;const t=v.tav;camTo(v,t.X+t.w/2,t.Y+t.h/2-4,closeZoom(v));renderStatus(v)}
function renderStatus(v){
  if(v!==active)return;
  const s=townStats(v),pn=placeName(v);
  $('sName').textContent=pn.toUpperCase();$('sSub').textContent=`${v.name} · ${v.th.label} · ${s.era.toLowerCase()}`;{const pl=projectLine(v),el=$('sAbout');el.textContent=pl;el.hidden=!pl}
  const st=$('sStats');st.innerHTML='';
  {const pp=projectProgress(v);s.pp=pp}
  for(const [n,l] of [[s.pp.pct+'%',s.pp.src==='roadmap'?(s.pp.total?`roadmap ${s.pp.done}/${s.pp.total}`:'roadmap'):'built'],[v.lanes.length,'lanes'],[s.helpers,'apprentices'],[s.blocked,'blocked']]){const d=document.createElement('div');d.className='stat';const b=document.createElement('b');b.textContent=n;const sp=document.createElement('span');sp.textContent=l;d.append(b,sp);st.appendChild(d)}
  const bits=[`${s.working} working`];{const rest=v.lanes.filter(resting).length;if(rest)bits.push(`${rest} ${v.tav?'in the tavern':'by the fire'}`)}
  const pl=n=>{const x=villages.get(n);return x?placeName(x):n};
  if(s.out.length)bits.push(`writing to ${s.out.map(pl).join(' and ')}`);if(s.inc.length)bits.push(`letters from ${s.inc.map(pl).join(' and ')}`);
  if(heraldFor(v))bits.push('a royal herald is here with a decree');
  $('sSum').textContent=bits.join(' · ')+'.';
  fillRoster($('sRoster'),v,L=>{selectLane(v,L.id,'person');if(!wide())setPanel(false)});
  const L=v.lanes.find(l=>l.id===v.sel),dl=$('dialog'),sel=$('sSel');
  if(L){const [h,q]=laneSpeech(v,L);speak(h,q,{id:L.id,cls:roleInfo(L.role,L.id).cls});laneActions(v,L);setRich(sel,laneLine(v,L));sel.hidden=false}
  else if(v.selBar&&v.barmaid){speak(`${barmaidName(v)}, the barmaid`,v.gossip,{id:'barmaid-'+v.name,cls:v.barmaid.spec});laneActions(null);sel.hidden=true}
  else if(v.selTav){const idle=v.lanes.filter(resting);const line=['The Tavern',idle.length?` ${idle.map(o=>o.role).join(', ')} ${idle.length>1?'are':'is'} resting here with a drink. The barmaid keeps the mugs full.`:' Empty for now: everyone is out working. The barmaid is polishing mugs.'];speak(line[0],line[1].trim(),null);laneActions(null);sel.hidden=true}
  else{hushDialog();laneActions(null);sel.hidden=true}
  const btn=$('statusBtn');btn.textContent='';const bob=document.createElement('span');bob.className='bob';bob.appendChild(hudIcon('up'));btn.appendChild(bob);const a=document.createElement('span');a.textContent=`STATUS · ${pn.toUpperCase()}`;btn.appendChild(a);
  if(s.blocked){const n=document.createElement('span');n.className='n';n.textContent=` · ${s.blocked} BLOCKED`;btn.appendChild(n)}
  btn.setAttribute('aria-expanded',String(panelOpen()));
  TV.cv.setAttribute('aria-label',`${pn}, the ${v.th.label.toLowerCase()} of ${v.name}: ${v.lanes.length} lanes, ${s.pp.pct}% ${s.pp.src==='roadmap'?'of the roadmap done':'built'}, ${s.working} working${s.idle?', '+s.idle+' resting':''}${s.blocked?', '+s.blocked+' blocked':''}. Drag to move around, use the zoom buttons or the status list to find someone.`);
  $('miniCap').textContent=`YOU ARE IN ${pn.toUpperCase()}`;
  if(typeof councilTown==='function')councilTown(v);
}
function setPanel(open){if(open!==panelOpen())sfx('blip',.7);TV.view.classList.toggle('panel-open',open);{const pb=$('panelBtn');if(pb)pb.setAttribute('aria-pressed',String(!!open))}if(!open)TV.view.classList.remove('tall');$('statusBtn').setAttribute('aria-expanded',String(open));const v=active;if(v&&v.cam){const t=v.cam.target||v.cam;v.cam.target=clampCam(v,{cx:t.cx,cy:t.cy,z:Math.max(t.z,fitZoom(v)*.98)})}if(open&&!wide())setTimeout(()=>$(active===COURT?'cClose':'sClose').focus({preventScroll:true}),260);if(active===COURT)renderCourtHUD()}
$('statusBtn').addEventListener('click',()=>setPanel(!panelOpen()));
$('sClose').addEventListener('click',()=>{setPanel(false);$('statusBtn').focus({preventScroll:true})});
document.querySelectorAll('.grabber').forEach(g=>g.addEventListener('click',()=>{const tall=TV.view.classList.toggle('tall');g.setAttribute('aria-label',tall?'Shrink the sheet':'Expand the sheet');sfx('blip',.6);const v=active;if(v&&v.cam){const t=v.cam.target||v.cam;v.cam.target=clampCam(v,{cx:t.cx,cy:t.cy,z:Math.max(t.z,fitZoom(v)*.98)})}}));
$('cClose').addEventListener('click',()=>{setPanel(false);$('statusBtn').focus({preventScroll:true})});
// the castle in the full-screen view: tap the scroll for your asks, the ${monarch()} for ${monarchHis()} report, a banner for that roadmap
function renderCourtHUD(){const open=ASKS.filter(a=>a.status!=='answered').length,q=DECREES.filter(d=>d.status==='queued').length,btn=$('statusBtn');btn.textContent='';
  const a=document.createElement('span');a.textContent=`▴ SCROLL & DECREES`;btn.appendChild(a);if(open){const n=document.createElement('span');n.className='n';n.textContent=` · ${open} ASK${open>1?'S':''}`;btn.appendChild(n)}
  btn.setAttribute('aria-expanded',String(panelOpen()));$('miniCap').textContent='YOU ARE IN '+castleName().toUpperCase();
  TV.cv.setAttribute('aria-label',`${castleName()} throne room: the ${monarch()} on ${monarchHis()} throne, a scroll of ${open} asks, ${q} decree${q===1?'':'s'} on the road, and a banner for each project's roadmap. Use the scroll and decrees panel to answer asks and send decrees.`)}
function tapCourt(x,y){const C=COURT,cx=C.W/2,h=C.hit,dl=$('dialog');if(gameCourtTap(x,y))return;if(typeof courtQueueTap==='function'&&(courtQueueTap(x,y)||councilTableTap(x,y)))return;
  if(h&&x>=h.x&&x<=h.x+h.w&&y>=h.y&&y<=h.y+h.h){setPanel(true);setTimeout(()=>$('scrollCard').scrollIntoView({block:'start',behavior:reduce?'auto':'smooth'}),50);return}
  if(Math.abs(x-cx)<16&&y>50+CDY&&y<100+CDY){C.sel='king';camTo(C,cx,80+CDY,closeZoom(C));const kl=(villages.get('The Crown')||{lanes:[]}).lanes[0];
    {const n=ASKS.filter(a=>a.status!=='answered').length,tk=kl&&String(kl.task||'keeping every roadmap').replace(/[.!\s]+$/,'');speak(`The ${monarch()} (your Global overseer)`,`${kl?(effState(kl)==='idle'?'I’m resting on my throne. Last I was '+tk.charAt(0).toLowerCase()+tk.slice(1)+'.':'I’m at work: '+tk.charAt(0).toLowerCase()+tk.slice(1)+'.'):'I keep every roadmap and gather your asks.'} ${n?`There ${n===1?'is one ask':'are '+n+' asks'} on my scroll for you.`:'My scroll is clear.'}`,null)}return}
  const b=(C.banners||[]).find(b=>x>=b.x&&x<=b.x+b.w&&y>=b.y&&y<=b.y+b.h);
  if(b){C.sel=null;camTo(C,b.x+b.w/2,b.y+b.h/2+10,closeZoom(C));speak(`${placeName(b.v)}'s banner (${b.v.name})`,`The roadmap is ${Math.round(b.pct)}% done.${b.next?' Next: '+b.next+'.':''} The gold embroidery rises from the hem as it fills.`,null);return}
  C.sel=null;hushDialog()}
$('dlgClose').addEventListener('click',()=>{const v=active;if(!v)return;if(v===COURT){COURT.sel=null;hushDialog();return}v.sel=null;v.selTav=false;v.selBar=false;v.cam.follow=null;renderStatus(v)});
// mini map: the realm in the corner, with a pin for every place
function renderMini(v){
  if(!world.bg){world.sig=null;layoutWorld()}if(!world.bg)return;
  const cv=$('miniCv'),k=1/3,CO=world.core||{x:0,y:0,w:world.W,h:world.H},W=Math.round(CO.w*k),H=Math.round(CO.h*k),short=innerHeight<=520,mx=short?150:wide()?248:innerWidth<600?136:168,my=short?84:wide()?170:innerWidth<600?96:150,iw=Math.round(Math.min(mx,my*CO.w/CO.h));$('mini').style.setProperty('--mw',mx+'px');$('mapin').style.width=iw+'px';cv.width=W;cv.height=H;const c=cv.getContext('2d');c.imageSmoothingEnabled=true;
  c.drawImage(world.bg,CO.x,CO.y,CO.w,CO.h,0,0,W,H);for(const T of world.towns){const img=iconSprite(T.icon,false);c.drawImage(img,(T.cx-CO.x-img.width/2)*k,(T.cy-CO.y-img.height/2)*k,img.width*k,img.height*k)}
  const box=$('miniPins');box.innerHTML='';
  for(const T of world.towns){const b=document.createElement('button');b.type='button';b.className='pin'+(T.v===v?' here':'');b.style.left=((T.cx-CO.x)/CO.w*100)+'%';b.style.top=((T.cy-CO.y)/CO.h*100)+'%';b.style.setProperty('--c',themeColour(T.v));
    const i=document.createElement('i'),sp=document.createElement('span');sp.textContent=T.v===v?'YOU ARE HERE':placeName(T.v).toUpperCase();b.append(i,sp);
    b.setAttribute('aria-label',T.v===v?`${placeName(T.v)}, you are here`:`Travel to ${placeName(T.v)} (${T.v.name})`);if(T.v===v)b.setAttribute('aria-current','location');
    b.addEventListener('click',()=>{if(T.v!==v)travelTo(T.v)});box.appendChild(b)}
}
function arrive(v){sfx('arrive',.8);const a=$('arrival');$('arrName').textContent=placeName(v).toUpperCase();$('arrSub').textContent=v.thKey==='crown'?`The ${monarch()}'s throne room`:`${v.name} · ${v.th.label}`;a.classList.remove('show');void a.offsetWidth;a.classList.add('show')}

