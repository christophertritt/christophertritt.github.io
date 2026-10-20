/* the portfolio is a hub plus one page per window */
const PAGES={work:"/portfolio/projects/",skills:"/portfolio/skills/",about:"/portfolio/about/",resume:"/portfolio/resume/",contact:"/portfolio/contact/"};
const isSectionPage=document.body.classList.contains("section-page");
/* links from the old single-page portfolio (#work, #about…) forward to their pages */
(()=>{const h=location.hash.slice(1);if(!isSectionPage&&PAGES[h]&&!document.getElementById(h))location.replace(PAGES[h])})();
function goSection(id){const el=document.getElementById(id);if(el&&!el.closest("[hidden]"))el.scrollIntoView();else if(PAGES[id])location.href=PAGES[id]}
const grid = document.getElementById("grid") || document.createElement("div");
grid.innerHTML = projects.map(p=>`<button class="card glass" type="button" data-c="${p.tags[0]}" data-id="${p.id}" data-tags="${p.tags.join(" ")}">
  <div class="screen">${thumb(p.id,false)}</div>
  <div class="body">${p.status?`<span class="status">${p.status}</span>`:""}<h3>${p.title}</h3><p>${p.blurb}</p>
  <div class="tags">${p.tags.map(t=>`<span class="tag" data-c="${t}">${T[t]}</span>`).join("")}</div></div></button>`).join("");

function filter(f){
  let shown=0;
  document.querySelectorAll(".chip").forEach(c=>c.setAttribute("aria-pressed",String(c.dataset.f===f)));
  grid.querySelectorAll(".card").forEach(c=>{const on=f==="all"||c.dataset.tags.split(" ").includes(f);c.hidden=!on;if(on)shown++});
  grid.classList.toggle("filtered",f!=="all");
  const em=document.getElementById("empty");if(em)em.hidden=shown>0;
}
document.querySelectorAll(".chip").forEach(c=>c.addEventListener("click",()=>filter(c.dataset.f)));

const dlg=document.getElementById("case"), cs=document.getElementById("cs");
document.getElementById("cs-close").onclick=()=>dlg.close();
/* a case-study section with no text yet (draft notes are hidden) is left out entirely */
const filled=v=>typeof v==="string"&&v.replace(/<[^>]*>/g,"").trim()!=="";
const part=(h,v)=>filled(v)?`<h3>${h}</h3><p>${v}</p>`:"";
function openCase(id){
  const p=projects.find(x=>x.id===id); if(!p) return;
  document.getElementById("cs-file").textContent=p.file;
  cs.innerHTML=`<p class="eyebrow">Case study${p.status?" · "+p.status:""}</p><h2 id="cs-title">${p.title}</h2>
  <p class="lede">${p.lede}</p>
  <dl class="glance">${Object.entries(p.glance).filter(([k,v])=>filled(v)).map(([k,v])=>`<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl>
  <div class="screen big">${thumb(p.id,true)}</div>
  ${part("The problem",p.problem)}
  ${part("My role",p.role)}
  ${(p.approach||[]).filter(filled).length?`<h3>Approach</h3><ol>${p.approach.filter(filled).map(a=>`<li>${a}</li>`).join("")}</ol>`:""}
  ${part("Outcome",p.outcome)}
  ${part("Reflection",p.reflect)}
  ${p.note?`<p class="note">${p.note}</p>`:""}`;
  if(!dlg.open) dlg.showModal();
  dlg.scrollTop=0;csProg.style.width="0%";
}
grid.addEventListener("click",e=>{const c=e.target.closest(".card");if(c)openCase(c.dataset.id)});
dlg.addEventListener("click",e=>{if(e.target===dlg)dlg.close()});
/* Windows 7 progress bar (7.css) tracks how far through the case study you are */
const csProg=document.getElementById("csProg");
dlg.addEventListener("scroll",()=>{const max=dlg.scrollHeight-dlg.clientHeight, pct=max>0?Math.round(dlg.scrollTop/max*100):100;csProg.style.width=pct+"%";csProg.parentElement.setAttribute("aria-valuenow",pct);csProg.parentElement.classList.toggle("done",pct>=99)},{passive:true});

const h=(location.hash||"").slice(1);
if(projects.some(p=>p.id===h)) openCase(h);
else if(T[h]){if(document.getElementById("work")){filter(h);document.getElementById("work").scrollIntoView()}else location.href=PAGES.work+"#"+h}

const menuBtn=document.getElementById("menuBtn"), nav=document.getElementById("nav");
const setMenu=open=>{nav.classList.toggle("open",open);menuBtn.setAttribute("aria-expanded",String(open));if(open&&typeof dismiss==="function"&&!askCb)dismiss()};
menuBtn.addEventListener("click",e=>{e.stopPropagation();setMenu(!nav.classList.contains("open"))});
nav.addEventListener("click",e=>{if(e.target.closest("a"))setMenu(false)});
document.addEventListener("click",e=>{if(!e.target.closest(".taskbar"))setMenu(false)});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&nav.classList.contains("open")){setMenu(false);menuBtn.focus()}});

/* eye orb: follows the pointer or finger, blinks, reacts to links */
const eye=document.getElementById("eye"), iris=document.getElementById("iris");
let lastLook=Date.now();
function aim(dx,dy,ease){iris.style.transition=ease?"transform .45s cubic-bezier(.3,1.4,.5,1)":"transform .09s linear";iris.style.transform=`translate(${dx.toFixed(1)}px,${dy.toFixed(1)}px)`}
setInterval(()=>{if(Date.now()-lastLook>3000){const a=Math.random()*Math.PI*2,m=Math.random()*eye.offsetWidth*.24;aim(Math.cos(a)*m,Math.sin(a)*m,true)}},1700);
function look(x,y){
  const r=eye.getBoundingClientRect(), cx=r.left+r.width/2, cy=r.top+r.height/2;
  const dx=x-cx, dy=y-cy, d=Math.hypot(dx,dy)||1, m=Math.min(r.width*.22,d/18);
  aim(dx/d*m,dy/d*m,false);
  lastLook=Date.now();
}
addEventListener("pointermove",e=>look(e.clientX,e.clientY),{passive:true});
addEventListener("pointerdown",e=>look(e.clientX,e.clientY),{passive:true});
addEventListener("scroll",()=>{if(Date.now()-lastLook>1500){const r=eye.getBoundingClientRect();look(r.left+r.width/2,r.top+400)}},{passive:true});
function blink(n=1){eye.classList.add("blink");setTimeout(()=>{eye.classList.remove("blink");if(n>1)setTimeout(()=>blink(n-1),140)},150)}
(function idle(){setTimeout(()=>{blink(Math.random()<.2?2:1);idle()},2600+Math.random()*4200)})();
document.addEventListener("pointerover",e=>eye.classList.toggle("curious",!!e.target.closest("a,button,.card")));
/* click the eye: a dropper swings in and puts in eye drops */
let dropBusy=false;
const dropperSVG='<svg viewBox="0 0 24 52" width="24" height="52"><rect x="5" y="1" width="14" height="13" rx="2" fill="#2f6fb0"/><path d="M5 5h14M5 9h14" stroke="#24578c" stroke-width="1"/><rect x="3" y="13" width="18" height="24" rx="4" fill="#f7f9fb" stroke="#b9c3cc"/><rect x="6" y="19" width="12" height="11" rx="1.5" fill="#d9ecf8"/><path d="M8 22h8M8 25h6" stroke="#2f6fb0" stroke-width="1.2"/><path d="M8 37h8l-2.5 11a1.5 1.5 0 0 1-3 0z" fill="#f7f9fb" stroke="#b9c3cc"/><path d="M6 15v20" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".9"/></svg>';
eye.addEventListener("click",()=>{
  if(dropBusy) return; dropBusy=true;
  if(reduce){blink(2);setTimeout(()=>dropBusy=false,400);return}
  const r=eye.getBoundingClientRect(), cx=r.left+r.width/2, cy=r.top+r.height/2;
  const tipX=cx+r.width*.36, tipY=cy-r.height*.16;
  aim(0,-r.width*.12,true); lastLook=Date.now()+1500;
  const d=document.createElement("div");d.className="dropper";d.innerHTML=dropperSVG;
  d.style.left=(tipX-12)+"px";d.style.top=(tipY-52)+"px";fx.appendChild(d);
  d.animate([
    {transform:"translate(50px,-8px) rotate(68deg)",opacity:0},
    {transform:"translate(0,0) rotate(68deg)",opacity:1,offset:.28},
    {transform:"translate(0,0) rotate(68deg) scale(.88,1)",offset:.46},
    {transform:"translate(0,0) rotate(68deg)",offset:.6},
    {transform:"translate(0,0) rotate(68deg)",opacity:1,offset:.75},
    {transform:"translate(50px,-8px) rotate(68deg)",opacity:0}
  ],{duration:1500,easing:"ease-in-out"}).onfinish=()=>d.remove();
  setTimeout(()=>{
    const dr=document.createElement("span");dr.className="drop";dr.style.left=tipX+"px";dr.style.top=tipY+"px";fx.appendChild(dr);
    dr.animate([{transform:"translate(0,0) scale(.4)",opacity:1},{transform:`translate(${cx-tipX}px,${cy-tipY}px) scale(1)`,opacity:1}],{duration:280,easing:"cubic-bezier(.5,0,1,.6)"}).onfinish=()=>{
      dr.remove(); tone(1500,700,.12,"sine",.1); tone(2200,1800,.06,"sine",.04,.03);
      eye.classList.add("wet"); setTimeout(()=>blink(2),120);
      const t=document.createElement("span");t.className="drop tear";t.style.left=(r.left+r.width*.3)+"px";t.style.top=(r.bottom-6)+"px";fx.appendChild(t);
      t.animate([{transform:"translate(0,0) scale(.5)",opacity:0},{transform:"translate(-2px,6px) scale(.8)",opacity:1,offset:.25},{transform:"translate(-4px,34px) scale(.7)",opacity:0}],{duration:1300,delay:500,easing:"ease-in",fill:"both"}).onfinish=()=>t.remove();
      setTimeout(()=>{eye.classList.remove("wet");dropBusy=false;aim(0,0,true)},1700);
    };
  },560);
});

/* ===================== whimsy ===================== */
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
const fx=document.getElementById("fx");

/* sound: tiny synthesized bloops, off by default */
let soundOn=false, ac=null;
try{soundOn=localStorage.getItem("ct-sound")==="on"}catch(e){}
const snd=document.getElementById("snd");
snd.setAttribute("aria-pressed",String(soundOn));
function tone(f1,f2,dur,type="sine",vol=.12,delay=0){
  if(!soundOn) return;
  try{
    ac=ac||new (window.AudioContext||window.webkitAudioContext)();
    const t=ac.currentTime+delay, o=ac.createOscillator(), g=ac.createGain();
    o.type=type;o.frequency.setValueAtTime(f1,t);o.frequency.exponentialRampToValueAtTime(f2,t+dur*.7);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    o.connect(g).connect(ac.destination);o.start(t);o.stop(t+dur+.02);
  }catch(e){}
}
const bloop=()=>tone(420+Math.random()*120,760+Math.random()*160,.16);
const chime=()=>{if(TV&&soundOn){const n=Tone.now();TV.glass.triggerAttackRelease(["E5","B5"],"8n",n);TV.glass.triggerAttackRelease(["G#5","E6"],"8n",n+.16);TV.glass.triggerAttackRelease(["B5","F#6"],"4n",n+.32);return}[660,880,1180].forEach((f,i)=>tone(f,f*1.01,.35,"triangle",.09,i*.09))};
const jingle=()=>{[[523,0],[659,.11],[784,.22],[1047,.33],[988,.52],[1319,.62]].forEach(([f,t],i)=>{tone(f,f,.28,i%2?"triangle":"sine",.1,t);tone(f*2,f*2,.12,"sine",.03,t)})};
const bwomp=()=>{const was=soundOn;soundOn=true;tone(392,98,.5,"sawtooth",.05);tone(196,49,.55,"sine",.08,.05);soundOn=was};
function notes(){
  if(reduce) return;
  const r=snd.getBoundingClientRect(), cols=["var(--c-transport)","var(--c-env)","var(--c-housing)","var(--c-data)","var(--c-health)"];
  for(let i=0;i<9;i++){const n=document.createElement("span");n.className="mnote";n.textContent=["♪","♫","♬","♩"][i%4];n.style.color=cols[i%5];fx.appendChild(n);
    const x=r.left+r.width/2-6,y=r.top+r.height/2-8,a=(Math.random()*160+10)*Math.PI/180,d=50+Math.random()*70;
    n.animate([{transform:`translate(${x}px,${y}px) scale(.3) rotate(0)`,opacity:1},{transform:`translate(${x+Math.cos(a)*d}px,${y+Math.sin(a)*d}px) scale(1.2) rotate(${Math.random()*80-40}deg)`,opacity:0}],{duration:900+Math.random()*500,easing:"cubic-bezier(.2,.8,.3,1)"}).onfinish=()=>n.remove()}
}
snd.addEventListener("click",()=>{
  soundOn=!soundOn;snd.setAttribute("aria-pressed",String(soundOn));snd.setAttribute("aria-label",soundOn?"Sound effects on":"Sound effects off");
  try{localStorage.setItem("ct-sound",soundOn?"on":"off")}catch(e){}
  snd.classList.remove("party");void snd.offsetWidth;snd.classList.add("party");
  if(soundOn){ensureTone().then(()=>{if(TV)chime();else jingle()});notes()}else bwomp();
});
const quiet=document.getElementById("quiet");
let quietOn=false;
try{quietOn=localStorage.getItem("ct-quiet")==="on"}catch(e){}
function setQuiet(on){quietOn=on;document.body.classList.toggle("quiet-mode",on);quiet.setAttribute("aria-pressed",String(on));quiet.textContent=on?"Quiet on":"Quiet";quiet.setAttribute("aria-label",on?"Quiet mode on":"Quiet mode off");if(on)dismiss();try{localStorage.setItem("ct-quiet",on?"on":"off")}catch(e){}}
setQuiet(quietOn);
quiet.addEventListener("click",()=>setQuiet(!quietOn));
const pop=()=>{if(TV&&soundOn){TV.pluck.triggerAttackRelease(["C5","E5","G5","A5"][Math.floor(Math.random()*4)],"16n");return}tone(900+Math.random()*300,300,.09,"sine",.12);tone(1800,1800,.04,"triangle",.03,.02)};
const chirp=()=>{tone(1400,2200,.07,"sine",.07);tone(1700,2600,.07,"sine",.06,.08)};
const boing=()=>{tone(180,520,.25,"triangle",.1)};
document.addEventListener("pointerdown",e=>{
  if(e.target.closest("#snd")) return;
  if(e.target.closest(".card")) pop();
  else if(e.target.closest(".l,.x")) boing();
  else if(e.target.closest("nav a,.desk a")) chirp();
  else if(e.target.closest("#eye")) boing();
  else if(e.target.closest("a,button")) bloop();
});

/* particles: bubbles and leaves fling out in an upward cone */
function burst(x,y,n=14){
  if(reduce) return;
  for(let i=0;i<n;i++){
    const leaf=Math.random()<.35, el=document.createElement("span");
    el.className="pt"+(leaf?" leafpt":"");
    if(leaf) el.innerHTML='<svg viewBox="0 0 100 160"><use href="#leafshape"/></svg>';
    const size=leaf?1:(.6+Math.random()*1.2);
    el.style.transform=`translate(${x}px,${y}px)`;
    fx.appendChild(el);
    const a=(-90+(Math.random()*80-40))*Math.PI/180, dist=70+Math.random()*110;
    const dx=Math.cos(a)*dist, dy=Math.sin(a)*dist, rot=leaf?(Math.random()*360-180):0;
    el.animate([
      {transform:`translate(${x}px,${y}px) scale(${size*.4}) rotate(0deg)`,opacity:1},
      {transform:`translate(${x+dx}px,${y+dy}px) scale(${size}) rotate(${rot}deg)`,opacity:.9,offset:.7},
      {transform:`translate(${x+dx*1.1}px,${y+dy*1.1-20}px) scale(${size*1.1}) rotate(${rot*1.3}deg)`,opacity:0}
    ],{duration:800+Math.random()*500,easing:"cubic-bezier(.2,.8,.3,1)"}).onfinish=()=>el.remove();
  }
}
document.querySelectorAll(".btn.primary").forEach(b=>b.addEventListener("click",e=>{const r=b.getBoundingClientRect();burst(r.left+r.width/2,r.top+r.height/3)}));

/* boop: the eye does a double-take when you hover the name */
const nameEl=document.getElementById("name");
nameEl.addEventListener("pointerenter",()=>{
  if(reduce) return;
  nameEl.animate([{transform:"rotate(0)"},{transform:"rotate(-3deg) scale(1.04)"},{transform:"rotate(2deg)"},{transform:"rotate(0)"}],{duration:450,easing:"ease-out"});
  aim(-7,0,true);setTimeout(()=>aim(7,0,true),180);setTimeout(()=>{aim(-7,-2,true);blink()},360);lastLook=Date.now();
});

/* Hieye, the site helper: the eye's speech bubble */
const wp=document.getElementById("wp"), wpLine=document.getElementById("wp-line"), wpActs=wp.querySelector(".wp-acts");
const wpActsHTML=wpActs.innerHTML;
const tips=["I am Hieye. I watch the windows, notice your clicks, and know where the next stop is.","Press Cmd-K or Ctrl-K to open the wayfinding kiosk.","Minimize a window and I will keep it orbiting nearby.","Try the terminal command `route 594`.","Every project card opens a full case study. The CTR dashboard is a good first stop.","The station clock pauses at the top of every minute. Real Swiss trains do that too."];
let tipI=0;
let wpBack=null, askCb=null;
const backLines=["I'm back. Did you miss me?","Sixty seconds felt like a long layover.","Back on schedule. Where were we?"];
function positionHieye(){
  const r=eye.getBoundingClientRect(), w=wp.offsetWidth||300;
  /* keep the balloon clear of the Portfolio menu button below the taskbar */
  const pn=document.getElementById("pnavBtn"), clear=pn?pn.getBoundingClientRect().right+12:8;
  wp.style.left=Math.max(8,Math.min(innerWidth-w-8,Math.max(clear,r.left+r.width*.55)))+"px";
  wp.style.top=Math.max(64,r.bottom+14)+"px";
}
function resetActs(){if(askCb){askCb=null;wpActs.innerHTML=wpActsHTML}}
function summon(line){
  clearTimeout(wpBack);resetActs();
  wpLine.textContent=line||"I am Hieye. I watch the windows, notice your clicks, and know where the next stop is.";
  wp.hidden=false;positionHieye();wp.classList.remove("out");wp.classList.remove("in");void wp.offsetWidth;wp.classList.add("in");chime();
}
/* Hieye asks a yes/no question; cb(true|false) */
function ask(line,yes,no,cb){
  summon(line);askCb=cb;
  wpActs.innerHTML=`<button type="button" class="btn danger" data-go="yes">${yes}</button><button type="button" class="btn primary" data-go="no">${no}</button>`;
  wpActs.querySelector("[data-go=no]").focus({preventScroll:true});
}
function dismiss(){if(wp.hidden)return;wp.classList.add("out");setTimeout(()=>{wp.hidden=true;wp.classList.remove("out");resetActs()},450)}
wp.addEventListener("click",e=>{
  const b=e.target.closest("[data-go]");
  if(!b) return;
  const g=b.dataset.go;
  if(g==="yes"||g==="no"){const cb=askCb;askCb=null;dismiss();if(cb)cb(g==="yes");return}
  if(g==="ctr"){openCase("ctr");dismiss()}
  else if(g==="resume"){dismiss();goSection("resume")}
  else if(g==="tip"){wpLine.textContent=tips[tipI++%tips.length]}
  else if(g==="tour"){dismiss();setTimeout(startTour,450)}
  else{dismiss();clearTimeout(wpBack);wpBack=setTimeout(()=>summon(backLines[Math.floor(Math.random()*backLines.length)]),60000)}
});
/* Hieye greets once per browser, on the hub only, and never on a timer:
   it used to reappear in every new tab and every 42 seconds, covering the menu. */
if(!isSectionPage)setTimeout(()=>{if(!wp.hidden||document.querySelector("dialog[open]")||document.querySelector(".driver-popover"))return;
  try{if(localStorage.getItem("ct-greeted"))return;localStorage.setItem("ct-greeted","1")}catch(e){return}
  ask("Welcome to my little corner. First time here? I can show you around.","Show me around","Not now",yes=>{try{localStorage.setItem("ct-toured","yes")}catch(e){}if(yes)setTimeout(startTour,450)});
},4200);
/* triple-tap the eye to summon Hieye */
let eyeTaps=[];
eye.addEventListener("click",()=>{const now=Date.now();eyeTaps=eyeTaps.filter(t=>now-t<900);eyeTaps.push(now);if(eyeTaps.length>=3){eyeTaps=[];summon()}});

/* a single tear rolls out of the eye */
function tear(){
  if(reduce){blink(2);return}
  const r=eye.getBoundingClientRect();
  eye.classList.add("wet");aim(-2,4,true);lastLook=Date.now()+1800;setTimeout(()=>blink(1),500);
  const t=document.createElement("span");t.className="drop tear";t.style.left=(r.left+r.width*.3)+"px";t.style.top=(r.bottom-6)+"px";fx.appendChild(t);
  t.animate([{transform:"translate(0,0) scale(.5)",opacity:0},{transform:"translate(-2px,6px) scale(.9)",opacity:1,offset:.3},{transform:"translate(-5px,40px) scale(.7)",opacity:0}],{duration:1500,delay:300,easing:"ease-in",fill:"both"}).onfinish=()=>t.remove();
  tone(520,330,.4,"sine",.06);
  setTimeout(()=>{eye.classList.remove("wet");aim(0,0,true)},2000);
}

/* Konami code: the 594 drives by and Hieye pops up */
const code=["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];let ki=0;
const bus=document.getElementById("bus");
function driveBus(){bus.classList.remove("go");void bus.offsetWidth;bus.classList.add("go");tone(220,180,.5,"sawtooth",.05);setTimeout(()=>tone(330,330,.18,"square",.05),2900);setTimeout(()=>tone(330,330,.18,"square",.05),3150)}
addEventListener("keydown",e=>{
  const k=e.key.length===1?e.key.toLowerCase():e.key;
  ki=(k===code[ki])?ki+1:(k===code[0]?1:0);
  if(ki===code.length){ki=0;driveBus();setTimeout(()=>summon("You found the cheat code. The 594 says hi."),1800)}
});

/* tap "Done" five times to open transit.exe */
const done=document.getElementById("done"), transit=document.getElementById("transit");
let doneTaps=0,doneT;
done.addEventListener("click",()=>{doneTaps++;clearTimeout(doneT);doneT=setTimeout(()=>doneTaps=0,1500);
  if(!reduce)done.animate([{transform:"none"},{transform:"translateX(-3px) rotate(-1deg)"},{transform:"translateX(3px) rotate(1deg)"},{transform:"none"}],{duration:220});
  if(doneTaps>=5){doneTaps=0;chime();transit.showModal();driveBus()}});
setInterval(()=>{if(!transit.open)return;transit.querySelectorAll(".due[data-min]").forEach(d=>{let m=+d.dataset.min-1;if(m<0)m=Math.floor(Math.random()*12)+3;d.dataset.min=m;d.textContent=m?m+" min":"Now"})},4000);

/* shake or tilt a phone to scatter the bubbles */
function scatter(){
  if(reduce) return;
  document.querySelectorAll(".bubble").forEach(b=>{const dx=(Math.random()-.5)*300,dy=(Math.random()-.5)*300;
    b.animate([{translate:"0 0"},{translate:`${dx}px ${dy}px`},{translate:"0 0"}],{duration:1600,easing:"cubic-bezier(.2,.9,.3,1)",composite:"add"})});
  bloop();
}
let lastShake=0;
addEventListener("devicemotion",e=>{const a=e.accelerationIncludingGravity||e.acceleration;if(!a)return;const f=Math.abs(a.x||0)+Math.abs(a.y||0)+Math.abs(a.z||0);if(f>32&&Date.now()-lastShake>1500){lastShake=Date.now();scatter()}});
document.querySelector(".sky").style.pointerEvents="none";
addEventListener("dblclick",e=>{if(!e.target.closest("a,button,.card,input,dialog,.wp,p,h1,h2,h3,li,dd,dt,span"))scatter()});

/* close buttons on the small windows */
document.querySelectorAll("dialog.mini").forEach(d=>{d.addEventListener("click",e=>{if(e.target===d||e.target.closest("[data-close]"))d.close()})});

/* unknown #route: show the discontinued-route window */
const known=new Set(["","top","tour","work","skills","about","resume","contact","credits","debug","terminal",...Object.keys(T),...projects.map(p=>p.id)]);
const routeWindows={credits:"credits",debug:"debug",terminal:"terminal"};
/* (a second positionHieye used to be declared here and silently replaced the one above) */
addEventListener("scroll",positionHieye,{passive:true});addEventListener("resize",positionHieye);
function checkRoute(){const h=(location.hash||"").slice(1);if(routeWindows[h]){const w=document.getElementById(routeWindows[h]);if(!w.open)w.showModal()}else if(!known.has(h))document.getElementById("lost").showModal()}
checkRoute();addEventListener("hashchange",checkRoute);

/* Keyboard-friendly navigation and a local terminal for the site's hidden routes. */
const palette=document.getElementById("palette"), paletteInput=document.getElementById("palette-input"), paletteResults=document.getElementById("palette-results");
const commands=[["Tour","Let Hieye show you around","#tour"],["Projects","Browse selected work","#work"],["Skills","Tools and methods","#skills"],["About","Read the route story","#about"],["Resume","Experience and education","#resume"],["Contact","Send a message","#contact"],["Terminal","Try route594 commands","#terminal"],["Credits","Sources and licenses","#credits"],["Debug page","Open the hidden vim route","#debug"]];
function renderCommands(query=""){
  const q=query.trim().toLowerCase();
  paletteResults.innerHTML=commands.filter(([name,desc])=>!q||`${name} ${desc}`.toLowerCase().includes(q)).map(([name,desc,href])=>`<button type="button" data-command="${href}"><span>${name}</span><small>${desc}</small></button>`).join("")||"<small>No matching route.</small>";
}
function openPalette(){if(!palette.open)palette.showModal();renderCommands();setTimeout(()=>paletteInput.focus(),0)}
renderCommands();
paletteInput.addEventListener("input",()=>renderCommands(paletteInput.value));
/* a search field eats the first Escape to clear itself; close the palette on the first press instead */
paletteInput.addEventListener("keydown",e=>{if(e.key==="Escape"){e.preventDefault();palette.close()}});
paletteResults.addEventListener("click",e=>{const b=e.target.closest("[data-command]");if(!b)return;palette.close();const c=b.dataset.command.slice(1);if(c==="tour"){startTour();return}if(PAGES[c]){goSection(c);return}location.hash=c});
document.addEventListener("keydown",e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"){e.preventDefault();openPalette()}});

const terminal=document.getElementById("terminal"), terminalOutput=document.getElementById("terminal-output"), terminalForm=document.getElementById("terminal-form"), terminalInput=document.getElementById("terminal-input");
const terminalWrite=(text,error=false)=>{const line=document.createElement("div");line.textContent=text;line.className=error?"terminal-error":"";terminalOutput.appendChild(line);terminalOutput.scrollTop=terminalOutput.scrollHeight};
function runCommand(raw){
  const command=raw.trim().toLowerCase();
  if(!command)return;
  terminalWrite(`route594@christopher:~$ ${raw}`);
  if(command==="help")terminalWrite("help  projects  route 594  about  resume  contact  credits  vim  clear  exit");
  else if(command==="projects"){terminalWrite("Opening selected work…");terminal.close();goSection("work")}
  else if(command==="route 594"){terminalWrite("Next stop: Seattle via Tacoma. The bus says hi.");summon("The terminal found the 594. It is running on schedule.")}
  else if(command==="about"){terminal.close();goSection("about")}
  else if(command==="resume"){terminal.close();goSection("resume")}
  else if(command==="contact"){terminal.close();goSection("contact")}
  else if(command==="credits"){terminal.close();location.hash="credits"}
  else if(command==="vim"){terminal.close();location.hash="debug"}
  else if(command==="clear"){terminalOutput.replaceChildren()}
  else if(command==="exit")terminal.close();
  else terminalWrite(`command not found: ${raw}`,true);
  terminalInput.value="";
}
terminalForm.addEventListener("submit",e=>{e.preventDefault();runCommand(terminalInput.value)});
console.log("%cWelcome aboard route594.%c Try Ctrl-K, type `terminal`, or run `window.route594()` for a hidden route.","color:#3f9cb8;font-weight:bold","color:inherit");
window.route594=()=>{location.hash="terminal"};
/* the terminal "boots" with a Windows 7 progress bar each time it opens */
const termBoot=document.getElementById("termBoot"), termProg=document.getElementById("termProg");
new MutationObserver(()=>{if(!terminal.open)return;termBoot.hidden=false;termProg.style.width="0%";let p=0;
  const step=()=>{p+=8+Math.random()*18;termProg.style.width=Math.min(100,p)+"%";if(p<100)setTimeout(step,reduce?0:110);else setTimeout(()=>{termBoot.hidden=true;terminalInput.focus()},reduce?0:350)};step()}).observe(terminal,{attributes:true,attributeFilter:["open"]});


/* minimized windows collapse into an OS X style dock */
const dock=document.getElementById("dock");
const iconFor={"index.html":"i-home","route.svg":"i-route","projects.html":"i-work","skills.md":"i-skills","about.md":"i-about","resume.pdf":"i-resume","contact.vcf":"i-contact"};
/* window title bars show proper names; this maps them back to the iconFor keys */
const fileFor={"Home":"index.html","Route":"route.svg","Projects":"projects.html","Skills":"skills.md","About":"about.md","Resume":"resume.pdf","Contact":"contact.vcf"};
function toDock(win,name){
  dock.hidden=false;
  dock.classList.add("orbiting");
  const positionDock=()=>{
    const r=eye.getBoundingClientRect();
    dock.style.left=Math.max(12,Math.min(window.innerWidth-180,r.left+r.width/2-70))+"px";
    dock.style.top=Math.max(70,r.bottom+12)+"px";
  };
  positionDock();
  addEventListener("resize",positionDock,{once:true});
  const item=document.createElement("button");item.type="button";item.className="dock-item";item._win=win;item.setAttribute("aria-label","Restore "+name);
  item.innerHTML=`<svg viewBox="0 0 64 56" aria-hidden="true"><use href="#${iconFor[fileFor[name]||name]||"i-work"}"/></svg><span class="dock-label">${name}</span>`;
  item.style.visibility="hidden";dock.appendChild(item);
  const wr=win.getBoundingClientRect(), ir=item.getBoundingClientRect();
  const done=()=>{win.hidden=true;win.style.transformOrigin="";item.style.visibility="";if(!reduce)item.animate([{transform:"translateY(-18px) scale(1.2)"},{transform:"translateY(4px) scale(.95)"},{transform:"none"}],{duration:450,easing:"ease-out"});item.focus()};
  if(reduce){done()}else{
    win.style.transformOrigin="50% 100%";
    const dx=(ir.left+ir.width/2)-(wr.left+wr.width/2), dy=ir.bottom-wr.bottom;
    win.animate([{transform:"none",opacity:1},{transform:`translate(${dx*.5}px,${dy*.55}px) scale(.45,.3)`,opacity:.85,offset:.55},{transform:`translate(${dx}px,${dy}px) scale(.04,.03)`,opacity:.2}],{duration:520,easing:"cubic-bezier(.5,0,.75,.4)"}).onfinish=done;
  }
  item.addEventListener("click",()=>{
    const ir2=item.getBoundingClientRect();item.remove();    if(!dock.children.length){dock.hidden=true;dock.classList.remove("orbiting");dock.style.left="";dock.style.top=""}
    win.hidden=false;const wr2=win.getBoundingClientRect();
    if(!reduce){win.style.transformOrigin="50% 100%";const dx=(ir2.left+ir2.width/2)-(wr2.left+wr2.width/2),dy=ir2.bottom-wr2.bottom;
      win.animate([{transform:`translate(${dx}px,${dy}px) scale(.04,.03)`,opacity:.2},{transform:`translate(${dx*.4}px,${dy*.45}px) scale(.55,.4)`,opacity:.85,offset:.45},{transform:"none",opacity:1}],{duration:480,easing:"cubic-bezier(.25,.6,.4,1)"}).onfinish=()=>{win.style.transformOrigin=""}}
    win.scrollIntoView({block:"nearest"});win.querySelector(".l.min").focus({preventScroll:true});
  });
}
/* closed windows: the matching desktop icon or menu link brings them back, and Hieye's halo points it out */
const halo=document.getElementById("halo"), closedWins=new Map();
function placeHalo(){halo.style.left=(eye.offsetLeft+eye.offsetWidth/2)+"px";halo.style.top=(eye.offsetTop+eye.offsetHeight/2)+"px"}
const scribbles=new Map();
function refreshHalo(){placeHalo();halo.classList.toggle("on",closedWins.size>0);
  document.querySelectorAll(".desk a").forEach(a=>{const id=a.getAttribute("href").slice(1), on=closedWins.has(id);a.classList.toggle("beckon",on);
    /* Rough Notation: Hieye circles the icon in red marker */
    if(on&&!scribbles.has(id)&&window.RoughNotation){const an=RoughNotation.annotate(a,{type:"circle",color:document.body.classList.contains("canada")?"#d52b1e":"#e24a3b",strokeWidth:2.5,padding:4,animationDuration:reduce?0:700,iterations:2});scribbles.set(id,an);setTimeout(()=>an.show(),reduce?0:250)}
    if(!on&&scribbles.has(id)){scribbles.get(id).remove();scribbles.delete(id)}})}
addEventListener("resize",placeHalo);
const iconNames={work:"folder",skills:"globe",about:"profile card",resume:"resume page",contact:"envelope"};
function closeWin(win,name){whoosh();
  const sec=win.closest("section"), id=sec&&sec.id;
  setMaxFor(win,false);win.classList.add("closing");
  setTimeout(()=>{
    win.classList.remove("closing");win.hidden=true;
    const r=document.createElement("button");r.type="button";r.className="reopen";
    r.innerHTML=`<span class="tb-t">${name}</span><span>Closed. Reopen window</span>`;
    win.after(r);r.focus({preventScroll:true});
    const key=id&&id!=="top"?id:name;
    const reopen=()=>{r.remove();closedWins.delete(key);refreshHalo();win.hidden=false;win.classList.add("opening");burstAt(win);setTimeout(()=>win.classList.remove("opening"),400);win.querySelector(".l.close").focus({preventScroll:true})};
    closedWins.set(key,reopen);refreshHalo();
    r.addEventListener("click",reopen);
    if(iconNames[key]&&!askCb)summon(`${name} is tucked away. Click the ${iconNames[key]} icon and I'll bring it back.`);
  },reduce?0:280);
}
function burstAt(el){const r=el.getBoundingClientRect();burst(r.left+r.width/2,Math.max(80,r.top+30),18)}
/* clicking a desktop icon or menu link for a closed (or docked) window restores it */
document.addEventListener("click",e=>{
  const a=e.target.closest('.desk a[href^="#"], nav.links a[href^="#"]'); if(!a) return;
  const id=a.getAttribute("href").slice(1);
  if(closedWins.has(id)){closedWins.get(id)();tone(523,1047,.25,"triangle",.08);summon("Back where it belongs.");setTimeout(dismiss,2200);return}
  const sec=document.getElementById(id), win=sec&&sec.querySelector(".win");
  if(win&&win.hidden){const item=[...dock.children].find(d=>d._win===win);if(item)item.click();return}
  /* on a big screen, a desktop icon opens its window as a real floating window */
  if(a.closest(".desk")&&popOut(id)) e.preventDefault();
});

/* WinBox: real draggable, resizable windows. The window's contents move into the floating window and go back when it closes. */
const floating=new Map();
const canFloat=()=>!!window.WinBox&&innerWidth>=900&&!reduce&&!isSectionPage;
function popOut(id){
  if(!canFloat()) return false;
  if(floating.has(id)){const w=floating.get(id);if(w.min)w.restore();w.focus();return true}
  const sec=document.getElementById(id), win=sec&&sec.querySelector(".win"), body=win&&win.querySelector(".win-body");
  if(!body||win.classList.contains("maxed")) return false;
  const name=win.querySelector(".tb-t").textContent;
  const ph=document.createElement("button");ph.type="button";ph.className="reopen floated";
  ph.innerHTML=`<span class="tb-t">${name}</span><span>Floating on your desktop. Bring it back</span>`;
  body.before(ph);
  const n=floating.size, W=Math.min(900,innerWidth-120), H=Math.min(640,innerHeight-140);
  const wb=new WinBox(name,{class:["aqua","no-full"],index:50,mount:body,width:W,height:H,
    x:Math.round((innerWidth-W)/2)+n*28,y:96+n*28,top:70,
    onclose(){ph.replaceWith(body);floating.delete(id);tone(700,350,.18,"triangle",.06);return false}});
  wb.body.classList.add(id+"-float");
  floating.set(id,wb);
  ph.addEventListener("click",()=>wb.close());
  whoosh();
  if(!askCb)summon(`${name} is floating now. Drag the title bar, pull a corner, or press the red button to tuck it back in.`);
  return true;
}
/* double-click a title bar to float that window too */
document.querySelectorAll("main section.block .win > .tb").forEach(tb=>tb.addEventListener("dblclick",e=>{if(e.target.closest(".lights"))return;const id=tb.closest("section").id;popOut(id)}));
const setMaxFor=(win,on)=>{win.classList.toggle("maxed",on);document.body.classList.toggle("has-max",!!document.querySelector(".win.maxed"));const b=win.querySelector(".l.max");if(b)b.setAttribute("aria-pressed",String(on))};

/* OS X window controls: close, minimize, maximize */
document.querySelectorAll("main .win > .tb").forEach(tb=>{
  const win=tb.parentElement, name=tb.querySelector(".tb-t").textContent;
  const lights=document.createElement("span"); lights.className="lights";
  lights.innerHTML=`<button type="button" class="l close" aria-label="Close ${name}">×</button><button type="button" class="l min" aria-label="Minimize ${name}" aria-expanded="true">−</button><button type="button" class="l max" aria-label="Maximize ${name}" aria-pressed="false">+</button>`;
  tb.prepend(lights);
  const setMax=on=>{win.classList.toggle("maxed",on);document.body.classList.toggle("has-max",!!document.querySelector(".win.maxed"));lights.querySelector(".max").setAttribute("aria-pressed",String(on))};
  if(isSectionPage&&win.classList.contains("fullwin")){
    const goHub=()=>{whoosh();win.classList.add("closing");setTimeout(()=>location.href="/portfolio/",reduce?0:240)};
    lights.querySelector(".close").addEventListener("click",goHub);lights.querySelector(".min").addEventListener("click",goHub);
    lights.querySelector(".close").setAttribute("aria-label",`Close ${name} and go back to the portfolio desktop`);
    lights.querySelector(".min").setAttribute("aria-label",`Minimize ${name} to the portfolio desktop`);
    lights.querySelector(".max").addEventListener("click",()=>setMax(!win.classList.contains("maxed")));
    return;
  }
  lights.querySelector(".min").addEventListener("click",()=>{setMax(false);toDock(win,name)});
  lights.querySelector(".max").addEventListener("click",()=>{win.classList.remove("minimized");setMax(!win.classList.contains("maxed"))});
  lights.querySelector(".close").addEventListener("click",()=>{
    const roll=Math.random();
    if(!reduce&&!document.body.classList.contains("quiet-mode")&&roll<.3){
      ask(`Wait, close ${name}? It was just getting comfortable.`,"Close it","Keep it",yes=>{if(yes)closeWin(win,name);else{tone(660,990,.2,"triangle",.08);summon(`Phew. ${name} thanks you.`);setTimeout(dismiss,2400)}});
      eye.classList.add("startled");setTimeout(()=>eye.classList.remove("startled"),500);
    }else if(roll<.55){tear();setTimeout(()=>closeWin(win,name),reduce?0:350)}
    else{eye.classList.add("startled");setTimeout(()=>eye.classList.remove("startled"),500);closeWin(win,name)}
  });
});
addEventListener("keydown",e=>{if(e.key==="Escape"){const m=document.querySelector(".win.maxed");if(m)m.querySelector(".l.max").click()}});

/* the eye and Hieye react when you click icons, menu links, and buttons */
const reactLines={work:"Ooh, the projects. The CTR dashboard is a good first stop.",skills:"Spin that globe while you're there.",about:"The 594 story is my favorite part.",resume:"Pen's ready. Signing time.",contact:"Say hi. The envelope's already open.",card:"Good pick. That case study opens right up.",win:"Careful with those window buttons.",other:"Nice click."};
document.addEventListener("click",e=>{
  const t=e.target.closest(".desk a, nav.links a, .btn, .card, .l:not(.close), .dock-item");
  if(!t||t.closest("#wp")||reduce) return;
  look(e.clientX,e.clientY);
  eye.classList.add("curious");
  eye.animate([{transform:"scale(1)"},{transform:"scale(1.2) translateY(-3px)"},{transform:"scale(.96)"},{transform:"scale(1)"}],{duration:420,easing:"cubic-bezier(.3,1.6,.5,1)"});
  setTimeout(()=>{blink();eye.classList.remove("curious")},380);
  if(!wp.hidden && !wp.classList.contains("out") && !askCb){
    const hr=(t.getAttribute("href")||"").replace(/^#/,""), h=Object.keys(PAGES).find(k=>PAGES[k]===hr)||hr;
    wpLine.textContent=reactLines[h]||(t.classList.contains("card")?reactLines.card:t.matches(".l,.dock-item")?reactLines.win:reactLines.other);
  }
});

/* weather bubbles live in /js/weather.js so every page has them; this keeps Canada mode and the sky in step */
let wxLast=null;
function renderWx(){if(window.Weather)Weather.render()}
document.addEventListener("weather:update",e=>{wxLast=e.detail;if(typeof vanta!=="undefined"&&vanta)vanta.setOptions(skyFor())});


const clock=document.getElementById("clock");
/* SBB station clock: the red second hand sweeps round in 58.5 s, waits at 12, then the minute hand jumps */
const fmt=new Intl.DateTimeFormat("en-US",{hour:"numeric",minute:"numeric",second:"numeric",hour12:false,timeZone:"America/Los_Angeles"});
const hh=document.getElementById("hh"),mh=document.getElementById("mh"),sh=document.getElementById("sh");
let hourNow=12, lastMin=-1;
function tick(){
  const now=new Date(), parts=Object.fromEntries(fmt.formatToParts(now).map(x=>[x.type,x.value]));
  const h=(+parts.hour)%24, m=+parts.minute, sec=+parts.second+now.getMilliseconds()/1000;
  hourNow=(h%12)||12;
  sh.style.transform=`rotate(${Math.min(sec/58.5,1)*360}deg)`;
  if(m!==lastMin){
    if(lastMin>=0&&!reduce){mh.classList.add("jump");setTimeout(()=>mh.classList.remove("jump"),400)}
    lastMin=m;
    mh.style.transform=`rotate(${(h*60+m)*6}deg)`;hh.style.transform=`rotate(${(h+m/60)*30}deg)`;
    clock.setAttribute("aria-label",`${hourNow}:${String(m).padStart(2,"0")} ${h<12?"AM":"PM"} Pacific. Select for a cuckoo.`);
  }
}
const cuckoo=document.getElementById("cuckoo"), say=document.getElementById("cuckooSay");
let cuckooBusy=false;
clock.addEventListener("click",()=>{
  if(cuckooBusy) return; cuckooBusy=true;
  const n=hourNow; let i=0;
  clock.classList.add("cuckooing");
  const call=()=>{
    i++; say.textContent=n>1?`Cuckoo ${i} of ${n}`:"Cuckoo!";
    cuckoo.classList.remove("chirp");void cuckoo.offsetWidth;cuckoo.classList.add("chirp");
    if(TV&&soundOn){const t0=Tone.now();TV.wood.triggerAttackRelease("E5","8n",t0);TV.wood.triggerAttackRelease("C5","8n",t0+.26)}else{tone(784,784,.18,"sine",.12);tone(659,659,.24,"sine",.12,.2)}
    if(i<n) setTimeout(call,reduce?250:520);
    else setTimeout(()=>{clock.classList.remove("cuckooing");cuckooBusy=false},900);
  };
  setTimeout(call,250);
});
tick();(function loop(){tick();setTimeout(()=>requestAnimationFrame(loop),reduce?1000:60)})();


/* ===== Canada mode: glossy flag → Rockies sky, Celsius, Canadian spelling, maple leaves ===== */
const canadaBtn=document.getElementById("canada");
const caWords={color:"colour",colors:"colours",colored:"coloured",colorful:"colourful",favorite:"favourite",favorites:"favourites",
  neighbor:"neighbour",neighbors:"neighbours",neighborhood:"neighbourhood",neighborhoods:"neighbourhoods",honor:"honour",labor:"labour",
  behavior:"behaviour",behaviors:"behaviours",humor:"humour",flavor:"flavour",center:"centre",centers:"centres",theater:"theatre",
  meter:"metre",meters:"metres",kilometer:"kilometre",kilometers:"kilometres",modeling:"modelling",modeled:"modelled",traveled:"travelled",
  traveling:"travelling",traveler:"traveller",canceled:"cancelled",labeled:"labelled",labeling:"labelling",fulfill:"fulfil",enrollment:"enrolment",
  catalog:"catalogue",defense:"defence",gray:"grey",jewelry:"jewellery",program:"program",check:"check"};
const caKeep=/\b(Transit Center|Grays Harbor|Harbor)\b/;
const caRe=new RegExp("\\b("+Object.keys(caWords).filter(k=>caWords[k]!==k).join("|")+")\\b","gi");
const caOrig=new WeakMap();
function caCase(src,rep){return src===src.toUpperCase()&&src.length>1?rep.toUpperCase():src[0]===src[0].toUpperCase()?rep[0].toUpperCase()+rep.slice(1):rep}
function canadianize(root){
  if(!root||!root.nodeType) return;
  const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.parentElement&&!n.parentElement.closest("script,style,code,pre,input,textarea,.wxb")&&caRe.test(n.nodeValue)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT});
  const nodes=[];while(w.nextNode())nodes.push(w.currentNode);
  nodes.forEach(n=>{caRe.lastIndex=0;const v=n.nodeValue;
    const out=v.replace(caRe,(mt,_,off)=>{const around=v.slice(Math.max(0,off-12),off+mt.length+8);if(caKeep.test(around)&&/^(Center|Harbor)$/.test(mt))return mt;return caCase(mt,caWords[mt.toLowerCase()])});
    if(out!==v){if(!caOrig.has(n))caOrig.set(n,v);n.nodeValue=out}});
  caRe.lastIndex=0;
}
const caTouched=new Set();
let caObs=null;
function setCanada(on,fromClick){
  document.body.classList.toggle("canada",on);
  document.documentElement.lang=on?"en-CA":"en";
  canadaBtn.setAttribute("aria-pressed",String(on));canadaBtn.setAttribute("aria-label",on?"Canada mode on":"Canada mode off");
  document.querySelectorAll(".sky .leaf use").forEach(u=>u.setAttribute("href",on?"#mapleshape":"#leafshape"));
  if(on){
    const track=root=>{if(!root||!root.nodeType)return;const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);while(w.nextNode())caTouched.add(w.currentNode)};
    track(document.body);canadianize(document.body);
    caObs=caObs||new MutationObserver(ms=>{if(!document.body.classList.contains("canada"))return;caObs.disconnect();
      ms.forEach(m=>{m.addedNodes.forEach(n=>{if(n.nodeType===1||n.nodeType===3){track(n.nodeType===3?n.parentNode:n);canadianize(n.nodeType===3?n.parentNode:n)}});if(m.type==="characterData")canadianize(m.target.parentNode)});
      caObs.observe(document.body,{subtree:true,childList:true,characterData:true})});
    caObs.observe(document.body,{subtree:true,childList:true,characterData:true});
  }else{
    if(caObs)caObs.disconnect();
    caTouched.forEach(n=>{if(caOrig.has(n)){n.nodeValue=caOrig.get(n);caOrig.delete(n)}});caTouched.clear();
  }
  renderWx();
  try{localStorage.setItem("ct-canada",on?"on":"off")}catch(e){}
  if(fromClick){
    const r=canadaBtn.getBoundingClientRect();
    if(on&&!reduce&&!window.confetti){for(let i=0;i<12;i++){const el=document.createElement("span");el.className="pt leafpt";el.innerHTML='<svg viewBox="2480 300 4640 4200"><use href="#mapleshape" x="2480" y="300" width="4640" height="4200"/></svg>';el.style.width=el.style.height=(12+Math.random()*12)+"px";fx.appendChild(el);
      const a=(Math.random()*140+20)*Math.PI/180,d=60+Math.random()*160,x=r.left+r.width/2,y=r.bottom;
      el.animate([{transform:`translate(${x}px,${y}px) rotate(0) scale(.4)`,opacity:1},{transform:`translate(${x+Math.cos(a)*d}px,${y+Math.sin(a)*d+60}px) rotate(${Math.random()*540-270}deg) scale(1)`,opacity:0}],{duration:1400+Math.random()*700,easing:"cubic-bezier(.2,.7,.4,1)"}).onfinish=()=>el.remove()}}
    if(on){[[523,0],[659,.14],[784,.28],[1047,.42]].forEach(([f,t])=>tone(f,f,.4,"triangle",.08,t));summon("Welcome to the True North. Weather's in Celsius now, and the spelling has a little more colour. Sorry, eh?");setTimeout(()=>{if(!askCb)dismiss()},5200)}
    else{tone(784,392,.35,"triangle",.07);summon("Back across the border. Fahrenheit and favorite are back.");setTimeout(()=>{if(!askCb)dismiss()},3600)}
  }
}
canadaBtn.addEventListener("click",()=>setCanada(!document.body.classList.contains("canada"),true));
try{if(localStorage.getItem("ct-canada")==="on")setCanada(true,false)}catch(e){}

/* ===================== bundled third-party libraries ===================== */
function loadScript(src){return new Promise((res,rej)=>{const s=document.createElement("script");s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s)})}

/* Tone.js: warmer, glassier sounds, loaded only once sound is switched on */
var TV=null; let tonePromise=null;
function ensureTone(){
  if(TV) return Promise.resolve(TV);
  tonePromise=tonePromise||loadScript("/js/vendor/tone.js").then(async()=>{
    await Tone.start();
    const verb=new Tone.Reverb({decay:2.6,wet:.32}).toDestination();
    TV={glass:new Tone.PolySynth(Tone.FMSynth,{harmonicity:3,modulationIndex:6,envelope:{attack:.01,decay:.6,sustain:.1,release:1.2},volume:-16}).connect(verb),
        pluck:new Tone.MembraneSynth({pitchDecay:.02,octaves:4,volume:-14}).connect(verb),
        wood:new Tone.Synth({oscillator:{type:"triangle"},envelope:{attack:.005,decay:.25,sustain:0,release:.2},volume:-10}).connect(verb),
        noise:new Tone.NoiseSynth({noise:{type:"pink"},envelope:{attack:.12,decay:.4,sustain:0},volume:-22}).connect(new Tone.AutoFilter(4).connect(verb).start())};
    return TV;
  }).catch(e=>{console.warn("Tone.js could not load; using simple sounds.",e);return null});
  return tonePromise;
}
function whoosh(){if(!soundOn)return;if(TV)TV.noise.triggerAttackRelease(".45");else tone(500,200,.25,"triangle",.05)}
/* if sound was left on last visit, warm Tone up on the first click */
if(soundOn)addEventListener("pointerdown",()=>ensureTone(),{once:true});

/* canvas-confetti: bubbles, stars and maple leaves */
const mapleShape=window.confetti&&confetti.shapeFromPath?confetti.shapeFromPath({path:"M48.9 44.3l-.45-8.63a.95.95 0 0 1 1.11-.98l8.59 1.51-1.16-3.2a.65.65 0 0 1 .2-.73l9.41-7.62-2.12-.99a.65.65 0 0 1-.34-.79l1.86-5.72-5.42 1.15a.65.65 0 0 1-.73-.38l-1.05-2.47-4.23 4.54a.65.65 0 0 1-1.11-.57l2.04-10.52-3.27 1.89a.65.65 0 0 1-.91-.27L48 3l-3.32 6.52a.65.65 0 0 1-.91.27l-3.27-1.89 2.04 10.52a.65.65 0 0 1-1.11.57l-4.23-4.54-1.05 2.47a.65.65 0 0 1-.73.38l-5.42-1.15 1.86 5.72a.65.65 0 0 1-.34.79l-2.12.99 9.41 7.62a.65.65 0 0 1 .2.73l-1.16 3.2 8.59-1.51a.95.95 0 0 1 1.11.98l-.45 8.63z"}):null;
function party(kind,el){
  if(!window.confetti||reduce||document.body.classList.contains("quiet-mode")) return;
  const r=el?el.getBoundingClientRect():{left:innerWidth/2,top:innerHeight/2,width:0,height:0};
  const origin={x:(r.left+r.width/2)/innerWidth,y:(r.top+r.height/2)/innerHeight};
  const base={origin,particleCount:60,spread:75,startVelocity:32,zIndex:90,disableForReducedMotion:true};
  if(kind==="bubbles")confetti({...base,shapes:["circle"],colors:["#bfe8ff","#7fcdf0","#ffffff","#c9f0a8"],gravity:.35,drift:.3,ticks:260,scalar:1.5});
  if(kind==="stars")confetti({...base,shapes:["star"],colors:["#ffd84a","#ff9fd2","#7fe3ff","#9fe3a8"],scalar:1.2});
  if(kind==="maple"&&mapleShape)confetti({...base,particleCount:45,shapes:[mapleShape],colors:["#d52b1e","#ff6a5a","#ffffff"],scalar:2,gravity:.55,spread:110});
}
document.querySelectorAll('.mail a[href^="mailto:"]').forEach(a=>a.addEventListener("click",()=>party("bubbles",a)));
document.getElementById("canada").addEventListener("click",e=>{if(document.body.classList.contains("canada"))party("maple",e.currentTarget)});
new MutationObserver(()=>{if(transit.open)party("stars",transit.querySelector(".board"))}).observe(transit,{attributes:true,attributeFilter:["open"]});
const _driveBus=driveBus;driveBus=function(){_driveBus();setTimeout(()=>party("stars",bus),1500)};

/* vanilla-tilt: project cards tilt and catch the light */
if(window.VanillaTilt&&!reduce&&matchMedia("(hover:hover) and (pointer:fine)").matches)
  VanillaTilt.init(document.querySelectorAll("#grid .card"),{max:7,speed:500,glare:true,"max-glare":.35,scale:1.02});

/* Leaflet: the Route so far window becomes a real map */
const routeMapEl=document.getElementById("routeMap");
if(window.L&&routeMapEl){
  const stops=[["Tacoma",47.2529,-122.4443],["Ellensburg",46.9965,-120.5478],["Seattle",47.6062,-122.3321],["Bellevue",47.6101,-122.2015]];
  const map=L.map(routeMapEl,{scrollWheelZoom:false,attributionControl:true,zoomSnap:.25,zoomControl:false});L.control.zoom({position:"topright"}).addTo(map);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:18,
    attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);
  const ll=stops.map(s=>[s[1],s[2]]);
  L.polyline(ll,{color:"#2f86d6",weight:9,opacity:.28,className:"route-glow"}).addTo(map);
  L.polyline(ll,{color:"#ffffff",weight:2.5,dashArray:"6 8",className:"route-dash"}).addTo(map);
  const markers=stops.map((s,i)=>L.marker([s[1],s[2]],{keyboard:false,title:s[0],icon:L.divIcon({className:"stop-pin"+(i===3?" now":""),iconSize:[22,22],iconAnchor:[11,11]})})
    .addTo(map).bindTooltip(s[0],{direction:["bottom","top","left","right"][i],offset:[[0,10],[0,-10],[-10,0],[10,0]][i],className:"stop-tip",permanent:false}));
  const fit=()=>map.fitBounds(L.latLngBounds(ll),{paddingTopLeft:[70,30],paddingBottomRight:[70,30]});fit();
  new ResizeObserver(()=>{map.invalidateSize();fit()}).observe(routeMapEl);
  document.querySelectorAll(".route li").forEach((li,i)=>{
    const btn=document.createElement("button");btn.type="button";btn.className="stopbtn";btn.append(...li.childNodes);li.append(btn);
    btn.setAttribute("aria-label",`${btn.textContent.trim()}. Show ${stops[i][0]} on the map.`);
    btn.addEventListener("click",()=>{map.flyTo([stops[i][1],stops[i][2]],11,{duration:reduce?0:1.2});document.querySelectorAll(".route li").forEach(x=>x.classList.toggle("sel",x===li));pop()})});
  routeMapEl.addEventListener("dblclick",e=>{e.stopPropagation();fit()});
}

/* Vanta clouds: a live 3D sky on big screens that follows the Bellevue weather */
let vanta=null, vantaBusy=false;
function skyFor(){
  const night=wxLast?!wxLast.c.is_day:matchMedia("(prefers-color-scheme: dark)").matches, code=wxLast?wxLast.c.weather_code:1;
  if(night) return {skyColor:0x1d3557,cloudColor:0x4d5f7a,cloudShadowColor:0x0d1b30,sunColor:0x9fb8ff,sunGlareColor:0x3a4f80,sunlightColor:0x8aa0d0,speed:.5};
  if(code===45||code===48) return {skyColor:0xc5d2dc,cloudColor:0xe3e8ec,cloudShadowColor:0x8c9aa6,sunColor:0xe8e0cf,sunGlareColor:0xd8d0c0,sunlightColor:0xeeeeee,speed:.35};
  if(code>=51) return {skyColor:0x93abc2,cloudColor:0xb4c2d0,cloudShadowColor:0x4f6276,sunColor:0xd9cfb8,sunGlareColor:0xa8a090,sunlightColor:0xd8d8d8,speed:1.1};
  if(code===3) return {skyColor:0xa9c3d9,cloudColor:0xd0dbe5,cloudShadowColor:0x6d8197,sunColor:0xf0d9a8,sunGlareColor:0xe0b080,sunlightColor:0xf2e6cc,speed:.7};
  return {skyColor:0x7cc6ee,cloudColor:0xd6e6f4,cloudShadowColor:0x5f87ad,sunColor:0xffc466,sunGlareColor:0xff8a4a,sunlightColor:0xffe0a8,speed:.6};
}
/* themed section pages paint their own art over the sky, so the 630 KB WebGL sky only loads on the hub */
const vantaWanted=()=>!isSectionPage&&innerWidth>=900&&!reduce&&!document.body.classList.contains("quiet-mode")&&!document.body.classList.contains("canada");
async function syncVanta(){
  if(vantaBusy) return;
  if(!vantaWanted()){if(vanta){vanta.destroy();vanta=null;document.querySelector(".vanta-sky")?.remove()}return}
  if(vanta){vanta.setOptions(skyFor());return}
  vantaBusy=true;
  try{
    if(!window.THREE)await loadScript("/js/vendor/three.r134.min.js");
    if(!window.VANTA||!VANTA.CLOUDS)await loadScript("/js/vendor/vanta.clouds.min.js");
    if(vantaWanted()){const el=document.createElement("div");el.className="vanta-sky";el.setAttribute("aria-hidden","true");document.querySelector(".sky").prepend(el);
      vanta=VANTA.CLOUDS({el,THREE:window.THREE,mouseControls:false,touchControls:false,gyroControls:false,minHeight:200,minWidth:200,...skyFor()})}
  }catch(e){console.warn("Vanta clouds could not load; keeping the flat sky.",e)}
  vantaBusy=false;
}
new MutationObserver(syncVanta).observe(document.body,{attributes:true,attributeFilter:["class"]});
let vantaT;addEventListener("resize",()=>{clearTimeout(vantaT);vantaT=setTimeout(syncVanta,400)});

if("requestIdleCallback" in window)requestIdleCallback(syncVanta,{timeout:2500});else setTimeout(syncVanta,1200);

/* Driver.js: Hieye's guided tour of the desktop */
function startTour(){
  if(!window.driver||!driver.js) return;
  const vis=sel=>{const el=document.querySelector(sel);if(!el)return null;const r=el.getBoundingClientRect();return r.width&&r.height&&getComputedStyle(el).visibility!=="hidden"?el:null};
  const steps=[
    ["#eye","Hi, I'm Hieye","I'm the eye in the corner. I watch your clicks and pop up with tips. Click me for eye drops, or three times to call me."],
    [".desk","Desktop icons","Each icon opens its window as a page of its own, each with its own theme. Red or yellow on any window brings you back here."],
    ["#routeMap","Route so far","A real map of where I've lived, studied and worked. Click a stop in the list to fly there."],
    ["#clock","Station clock","A Swiss railway clock. The red hand pauses at the top of each minute. Click it for a cuckoo."],
    ["#canada","Canada mode","Click the flag for the Rockies, Celsius and Canadian spelling."],
    ["#snd","Sound","Sounds are off until you turn them on here."],
    ["#menuBtn","Menu","On phones the menu hangs here like a bistro chalkboard."],
    ["#nav","Menu","The bistro chalkboard menu. Every window is a dish."],
    ["#work .win","Projects","Five case studies. Every card opens the full story. The CTR dashboard is a good first stop."]
  ].map(([sel,title,description])=>{const el=vis(sel);return el?{element:el,popover:{title,description}}:null}).filter(Boolean);
  steps.push({popover:{title:"That's the tour",description:"Press Ctrl-K or ⌘-K any time for the wayfinding kiosk. Have fun, and say hi from the contact window."}});
  dismiss();
  const d=driver.js.driver({showProgress:true,progressText:"{{current}} of {{total}}",nextBtnText:"Next",prevBtnText:"Back",doneBtnText:"Done",
    popoverClass:"hieye-tour",stagePadding:8,stageRadius:14,smoothScroll:!reduce,animate:!reduce,steps,
    onHighlighted:()=>{blink();pop()},onDestroyed:()=>{try{localStorage.setItem("ct-toured","yes")}catch(e){}}});
  d.drive();
}
if(location.hash==="#tour")setTimeout(startTour,800);
addEventListener("hashchange",()=>{if(location.hash==="#tour")startTour()});
