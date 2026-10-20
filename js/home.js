const T = {transportation:"Transportation",environment:"Environment",housing:"Housing and design",data:"Data tools",health:"Public health"};
const todo = s => `<em class="todo">${s}</em>`;

const art = {
  ctr: `<svg viewBox="0 0 320 180" aria-hidden="true"><rect width="320" height="180" fill="var(--map-land)"/>
    <g stroke="var(--line)" stroke-width="1">${[40,80,120,160,200,240,280].map(x=>`<line x1="${x}" y1="0" x2="${x}" y2="180"/>`).join("")}${[45,90,135].map(y=>`<line x1="0" y1="${y}" x2="320" y2="${y}"/>`).join("")}</g>
    <path d="M0 120 C60 110 90 60 160 70 S260 40 320 30" fill="none" stroke="var(--green)" stroke-width="5"/>
    ${[[60,108],[118,72],[176,66],[232,52],[286,36]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="7" fill="var(--surface)" stroke="var(--green)" stroke-width="4"/>`).join("")}
    <rect x="18" y="138" width="22" height="30" fill="var(--signal)"/><rect x="46" y="128" width="22" height="40" fill="var(--green)"/><rect x="74" y="146" width="22" height="22" fill="var(--muted)"/></svg>`,
  roslyn: `<svg viewBox="0 0 320 180" aria-hidden="true"><rect width="320" height="180" fill="var(--map-land)"/>
    ${[[70,110,0],[120,85,0],[170,60,1],[220,85,0],[120,135,1],[170,110,0],[220,135,0]].map(([x,y,n])=>{
      const c=n?"var(--signal)":"var(--surface)";return `<g stroke="var(--ink)" stroke-width="1.2" stroke-linejoin="round"><path d="M${x} ${y} l25 -14 l25 14 l-25 14z" fill="${c}"/><path d="M${x} ${y} v-${n?30:18} l25 -14 v${n?30:18}" fill="${n?"var(--signal)":"var(--green-soft)"}"/><path d="M${x+25} ${y-14-(n?30:18)} l25 14 v${n?30:18}" fill="${n?"var(--signal)":"var(--map-water)"}"/><path d="M${x} ${y-(n?30:18)} l25 -14 l25 14 l-25 14z" fill="${c}"/></g>`}).join("")}</svg>`,
  grayland: `<svg viewBox="0 0 320 180" aria-hidden="true"><rect width="320" height="180" fill="var(--map-land)"/>
    <path d="M0 0 H70 C60 60 80 120 60 180 H0z" fill="var(--map-water)"/>
    <path d="M70 0 C95 60 85 120 100 180 H60 C80 120 60 60 70 0z" fill="var(--green)" opacity=".35"/>
    ${[0,1,2,3,4,5].map(i=>`<path d="M${120+i*32} 0 C${100+i*32} 60 ${140+i*32} 110 ${115+i*32} 180" fill="none" stroke="var(--muted)" stroke-width="1"/>`).join("")}
    <path d="M190 0 C200 50 240 90 230 180" fill="none" stroke="var(--green)" stroke-width="3"/>
    <path d="M190 0 C200 50 240 90 230 180" fill="none" stroke="var(--green)" stroke-width="22" opacity=".18"/>
    <rect x="150" y="60" width="90" height="70" fill="none" stroke="var(--signal)" stroke-width="2.5" stroke-dasharray="6 4"/></svg>`,
  "south-hill": `<svg viewBox="0 0 320 180" aria-hidden="true"><rect width="320" height="180" fill="var(--map-land)"/>
    <g stroke="var(--line)" stroke-width="2">${[30,70,110,150].map(y=>`<line x1="0" y1="${y}" x2="320" y2="${y}"/>`).join("")}${[50,110,170,230,290].map(x=>`<line x1="${x}" y1="0" x2="${x}" y2="180"/>`).join("")}</g>
    <path d="M70 40 L160 22 L250 50 L262 120 L200 160 L95 150 L58 100z" fill="var(--green)" fill-opacity=".16" stroke="var(--green)" stroke-width="3"/>
    <circle cx="160" cy="92" r="20" fill="none" stroke="var(--signal)" stroke-width="3"/><path d="M160 80 v24 M148 92 h24" stroke="var(--signal)" stroke-width="3"/></svg>`,
  detroit: `<svg viewBox="0 0 320 180" aria-hidden="true"><rect width="320" height="180" fill="var(--map-land)"/>
    ${Array.from({length:7},(_,c)=>Array.from({length:4},(_,r)=>`<rect x="${12+c*44}" y="${10+r*42}" width="36" height="34" fill="var(--surface)" stroke="var(--line)"/>`).join("")).join("")}
    <path d="M-5 150 C70 140 110 100 150 92 S230 60 330 20" fill="none" stroke="var(--green)" stroke-width="14" opacity=".25"/>
    <path d="M-5 150 C70 140 110 100 150 92 S230 60 330 20" fill="none" stroke="var(--green)" stroke-width="4"/>
    <circle cx="150" cy="92" r="9" fill="var(--signal)"/></svg>`
};

const photos={"ctr": {"src": "/images/homepage/photo-1.jpg", "alt": "Buses under the canopy at Bellevue Transit Center", "credit": "Dweymouth, CC BY-SA 4.0", "href": "https://commons.wikimedia.org/wiki/File:Bellevue_Transit_Center_west_end.jpg"}, "roslyn": {"src": "/images/homepage/photo-2.jpg", "alt": "Historic storefronts along downtown Roslyn's main street", "credit": "Flytzjl93, CC BY-SA 4.0", "href": "https://commons.wikimedia.org/wiki/File:Downtown_Roslyn_2026.jpg"}, "grayland": {"src": "/images/homepage/photo-3.jpg", "alt": "Driftwood on the sand at Grayland Beach at sunset", "credit": "Steve Ginn, CC0", "href": "https://commons.wikimedia.org/wiki/File:Grayland_Beach_State_Park_(33475037010).jpg"}, "south-hill": {"src": "/images/homepage/photo-4.jpg", "alt": "USGS aerial view of Puyallup and South Hill", "credit": "USGS, public domain", "href": "https://commons.wikimedia.org/wiki/File:Aerial_view_of_Puyallup_and_South_Hill,_Washington,_August_16,_2023.jpg"}};
const thumb=(id,big)=>photos[id]?`<img src="${photos[id].src}" alt="${photos[id].alt}" loading="lazy">`+(big?`<a class="credit" href="${photos[id].href}" target="_blank" rel="noopener">Photo: ${photos[id].credit}</a>`:`<span class="credit">${photos[id].credit}</span>`):(big?art[id]:art[id].replace("<svg ",'<svg preserveAspectRatio="xMidYMid slice" '));
const projects = [
  {id:"ctr", file:"ctr_dashboard.pbix", title:"Bellevue CTR dashboard", tags:["transportation","data"],
   blurb:"A multi-page Power BI dashboard and Python pipeline that lets employer transportation coordinators see their own commute results.",
   lede:"One clean data source and a Python pipeline now feed a dashboard that each employer coordinator can open to see their own site's commute trip reduction results.",
   glance:{Role:"Lead developer, Assistant Planner",Context:"City of Bellevue TDM, Commute Trip Reduction",Date:"2025 – 2026",Tools:"Power BI, Python, ArcGIS Pro, GTFS"},
   problem:"Commute Trip Reduction survey results lived in several spreadsheets. Employer transportation coordinators had no simple way to see how their own worksite was doing, and the team rebuilt the same summaries by hand.",
   role:"I designed and built the dashboard, wrote the data pipeline, and geocoded every CTR worksite. "+todo("Name anyone who reviewed or supplied data."),
   approach:["Consolidated survey exports into one cleaned source file that every dashboard version reads.","Moved transformation logic into a Python script, ctr_transform.py, so updates rerun in one step.","Geocoded worksites in ArcGIS Pro and layered GTFS stops and routes plus pedestrian and bike facilities.","Built pages for drive-alone rate, vehicle miles traveled, mode share, amenities, a savings calculator, and a map.","Filtered each employer's view by CTR ID with row-level security, versioned as 0.2, 0.3, and onward."],
   outcome:todo("Add: number of worksites covered, who uses it, and what it replaced."),
   reflect:"Next I want to add a network analysis that scores each worksite's real transit and bike access, so coordinators can see why their numbers look the way they do.",
   note:"Figures and employer names in the screenshots are sample data."},
  {id:"roslyn", file:"roslyn_model.blend", title:"Roslyn middle housing model", tags:["housing"], status:"In progress",
   blurb:"A 3D model of Roslyn, WA showing existing conditions and HB 1110 middle housing infill.",
   lede:"A rebuilt 3D model of Roslyn that shows where middle housing allowed under HB 1110 could fit within the town's existing fabric.",
   glance:{Role:"Sole author",Context:"Independent portfolio project",Date:"2026",Tools:"QGIS, Blender, open-source code"},
   problem:"Washington's middle housing law changes what small towns must allow, but it is hard for residents to picture what a duplex or fourplex would look like on their own street.",
   role:"I am rebuilding an earlier model from scratch, handling the data, modeling, and rendering.",
   approach:["Assemble parcel, building footprint, and terrain data in QGIS.","Model existing conditions in Blender from that data.","Test infill scenarios against the comprehensive plan goals and HB 1110.","Render before-and-after views and an interactive viewer."],
   outcome:todo("Add renders and findings when the rebuild is finished."),
   reflect:"The same method will extend to Long Beach, Ilwaco, Raymond, and South Bend so the four Pacific County cities can be compared side by side."},
  {id:"grayland", file:"grayland_constraints.qgz", title:"Grayland environmental constraints", tags:["environment"],
   blurb:"Constraints and regulatory analysis for a large coastal property in Grays Harbor County.",
   lede:"A constraints analysis that maps where development is limited on a large coastal property in Grayland, and why.",
   glance:{Role:"Analyst",Context:"UW graduate coursework",Date:"2025 – 2026",Tools:"QGIS, Excel"},
   problem:"Coastal land in Grays Harbor County carries overlapping limits from slope, soils, flooding, streams, and county critical areas code. Those limits need to be read together before any site decision.",
   role:"I gathered the data, ran the overlay analysis, and produced the deliverables.",
   approach:["Collected slope, soils, FEMA flood zone, and stream data.","Applied stream buffers and Grays Harbor County critical areas regulations.","Combined the layers into a single constraints picture.","Packaged the results as an Excel workbook and a QGIS-ready data package."],
   outcome:"A workbook and data package that show buildable and constrained areas with the regulation behind each one. Related work converted tsunami hazard layers into GeoJSON for web mapping.",
   reflect:todo("Add what you would change or test next.")},
  {id:"south-hill", file:"south_hill_hia.pdf", title:"South Hill Health Impact Assessment", tags:["health","transportation"],
   blurb:"How incorporating South Hill as a city could affect residents' health, prepared with Pierce County.",
   lede:"A health impact assessment of South Hill's possible incorporation, completed for Pierce County through UW's Livable City Year program.",
   glance:{Role:"Team member",Context:"UW ENV H / URBAN 536 with Pierce County Planning and Public Works",Date:"2026",Tools:"Literature review, GIS, stakeholder input"},
   problem:"South Hill is one of Pierce County's largest unincorporated communities and is weighing incorporation. The county wanted to understand how a change in governance could affect residents' health.",
   role:"I was one of sixteen graduate students on the assessment. "+todo("Describe your section and what you produced."),
   approach:["Scoped health pathways tied to governance and services.","Assessed existing conditions in the community.","Compared no-action and incorporation scenarios.","Wrote recommendations for the county."],
   outcome:`The final report is published by UW Livable City Year. <a href="https://lcy.be.uw.edu/wp-content/uploads/sites/35/2026/06/2026-HIA-Report_FINAL_public.pdf" target="_blank" rel="noopener">Read the report (PDF)</a>.`,
   reflect:todo("Add one lesson from working with a county client.")},
  {id:"detroit", file:"joe_louis_greenway.pdf", title:"Joe Louis Greenway plan", tags:["housing"],
   blurb:"A UW team entry for the 2026 APA Student Planning and Design Competition in Detroit.",
   lede:"A small-area plan for the Davison-Schoolcraft neighborhood along Detroit's Joe Louis Greenway, made for the 2026 APA Student Planning and Design Competition.",
   glance:{Role:"Team member",Context:"APA Student Planning and Design Competition",Date:"2026",Tools:todo("Add tools")},
   problem:"The competition site is a 47-acre stretch of Davison-Schoolcraft cut by a new section of the greenway, with light industry, vacant schools, and established neighborhoods side by side.",
   role:"I worked on a four-person UW team with Yasmeen Sobaih and two classmates. "+todo("Describe your part of the plan."),
   approach:[todo("Add the team's main moves and one process graphic.")],
   outcome:todo("Add the submission boards and how the entry placed."),
   reflect:todo("Add what you would do differently.")}
];

const grid = document.getElementById("grid");
grid.innerHTML = projects.map(p=>`<button class="card glass" type="button" data-c="${p.tags[0]}" data-id="${p.id}" data-tags="${p.tags.join(" ")}">
  <div class="screen">${thumb(p.id,false)}</div>
  <div class="body">${p.status?`<span class="status">${p.status}</span>`:""}<h3>${p.title}</h3><p>${p.blurb}</p>
  <div class="tags">${p.tags.map(t=>`<span class="tag" data-c="${t}">${T[t]}</span>`).join("")}</div></div></button>`).join("");

function filter(f){
  let shown=0;
  document.querySelectorAll(".chip").forEach(c=>c.setAttribute("aria-pressed",String(c.dataset.f===f)));
  grid.querySelectorAll(".card").forEach(c=>{const on=f==="all"||c.dataset.tags.split(" ").includes(f);c.hidden=!on;if(on)shown++});
  grid.classList.toggle("filtered",f!=="all");
  document.getElementById("empty").hidden=shown>0;
}
document.querySelectorAll(".chip").forEach(c=>c.addEventListener("click",()=>filter(c.dataset.f)));

const dlg=document.getElementById("case"), cs=document.getElementById("cs");
document.getElementById("cs-close").onclick=()=>dlg.close();
function openCase(id){
  const p=projects.find(x=>x.id===id); if(!p) return;
  document.getElementById("cs-file").textContent=p.file;
  cs.innerHTML=`<p class="eyebrow">Case study${p.status?" · "+p.status:""}</p><h2 id="cs-title">${p.title}</h2>
  <p class="lede">${p.lede}</p>
  <dl class="glance">${Object.entries(p.glance).map(([k,v])=>`<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl>
  <div class="screen big">${thumb(p.id,true)}</div>
  <h3>The problem</h3><p>${p.problem}</p>
  <h3>My role</h3><p>${p.role}</p>
  <h3>Approach</h3><ol>${p.approach.map(a=>`<li>${a}</li>`).join("")}</ol>
  <h3>Outcome</h3><p>${p.outcome}</p>
  <h3>Reflection</h3><p>${p.reflect}</p>
  ${p.note?`<p class="note">${p.note}</p>`:""}`;
  if(!dlg.open) dlg.showModal();
  dlg.scrollTop=0;
}
grid.addEventListener("click",e=>{const c=e.target.closest(".card");if(c)openCase(c.dataset.id)});
dlg.addEventListener("click",e=>{if(e.target===dlg)dlg.close()});

const h=(location.hash||"").slice(1);
if(projects.some(p=>p.id===h)) openCase(h);
else if(T[h]){filter(h);document.getElementById("work").scrollIntoView()}

const menuBtn=document.getElementById("menuBtn"), nav=document.getElementById("nav");
const setMenu=open=>{nav.classList.toggle("open",open);menuBtn.setAttribute("aria-expanded",String(open))};
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
const chime=()=>{[660,880,1180].forEach((f,i)=>tone(f,f*1.01,.35,"triangle",.09,i*.09))};
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
  if(soundOn){jingle();notes()}else bwomp();
});
const pop=()=>{tone(900+Math.random()*300,300,.09,"sine",.12);tone(1800,1800,.04,"triangle",.03,.02)};
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

/* Waypoint, the site helper */
const wp=document.getElementById("wp"), wpLine=document.getElementById("wp-line");
const wpPin=wp.querySelector(".pin");
wpPin.innerHTML='<g class="pinbody"><path d="M5 48C25 8 105 8 125 48C105 88 25 88 5 48Z" fill="#f5efe0" stroke="#6e1f3b" stroke-width="3"/><ellipse cx="65" cy="48" rx="25" ry="25" fill="#c25b7d" stroke="#3a0f20" stroke-width="2"/><circle class="wpp" cx="65" cy="48" r="11" fill="#0b1630"/><circle cx="61" cy="44" r="3" fill="#fff"/><path d="M24 36C38 20 56 16 65 16C75 16 93 20 107 36" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="3" stroke-linecap="round"/></g>';
const tips=["I am Hieye. I watch the windows, notice your clicks, and know where the next stop is.","Click a ticker to ask me about live Puget Sound conditions.","Press Cmd-K or Ctrl-K to open the wayfinding kiosk.","Minimize a window and I will keep it orbiting nearby.","Try the terminal command `route 594`.","Every project card opens a full case study. The CTR dashboard is a good first stop."];
let tipI=0;
let wpBack=null;
const backLines=["I'm back. Did you miss me?","Sixty seconds felt like a long layover.","Back on schedule. Where were we?"];
function summon(line){
  clearTimeout(wpBack);
  wpLine.textContent=line||"I am Hieye. I watch the windows, notice your clicks, and know where the next stop is.";
  wp.hidden=false;wp.classList.remove("out");wp.classList.remove("in");void wp.offsetWidth;wp.classList.add("in");chime();
}
function dismiss(){wp.classList.add("out");setTimeout(()=>{wp.hidden=true;wp.classList.remove("out")},500)}
wp.addEventListener("click",e=>{
  const b=e.target.closest("[data-go]");
  if(e.target.closest(".pin")){wp.classList.add("blinky");setTimeout(()=>wp.classList.remove("blinky"),160);wpLine.textContent="Hey, that tickles. I see everything.";return}
  if(!b) return;
  const g=b.dataset.go;
  if(g==="ctr"){openCase("ctr");dismiss()}
  else if(g==="resume"){document.getElementById("resume").scrollIntoView();dismiss()}
  else if(g==="tip"){wpLine.textContent=tips[tipI++%tips.length]}
  else{dismiss();clearTimeout(wpBack);wpBack=setTimeout(()=>summon(backLines[Math.floor(Math.random()*backLines.length)]),60000)}
});
setInterval(()=>{if(!wp.hidden){wp.classList.add("blinky");setTimeout(()=>wp.classList.remove("blinky"),150)}},3800);
setTimeout(()=>{if(wp.hidden&&!document.querySelector("dialog[open]"))summon("Welcome to my little corner. Click things. I will notice.");},5200);
setInterval(()=>{if(wp.hidden&&!document.querySelector("dialog[open]")&&!document.hidden)summon(tips[tipI++%tips.length])},42000);
addEventListener("pointermove",e=>{
  if(wp.hidden) return;
  const svg=wp.querySelector(".pin"), r=svg.getBoundingClientRect(), k=r.width/132;
  const cx=r.left+(35+30)*k, cy=r.top+(36+8)*k, dx=e.clientX-cx, dy=e.clientY-cy, d=Math.hypot(dx,dy)||1, m=Math.min(2.6,d/40);
  const tx=(dx/d*m).toFixed(2), ty=(dy/d*m).toFixed(2);
  wp.querySelectorAll(".wpp").forEach(c=>c.style.transform=`translate(${tx}px,${ty}px)`);
},{passive:true});

/* triple-tap the eye to summon Waypoint */
let eyeTaps=[];
eye.addEventListener("click",()=>{const now=Date.now();eyeTaps=eyeTaps.filter(t=>now-t<900);eyeTaps.push(now);if(eyeTaps.length>=3){eyeTaps=[];summon()}});

/* Konami code: the 594 drives by and Waypoint pops up */
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
const known=new Set(["","top","work","skills","about","resume","contact","credits","debug","terminal","environment",...Object.keys(T),...projects.map(p=>p.id)]);
const routeWindows={credits:"credits",debug:"debug",terminal:"terminal",environment:"environment"};
function checkRoute(){const h=(location.hash||"").slice(1);if(routeWindows[h]){const w=document.getElementById(routeWindows[h]);if(!w.open)w.showModal()}else if(!known.has(h))document.getElementById("lost").showModal()}
checkRoute();addEventListener("hashchange",checkRoute);

/* Keyboard-friendly navigation and a local terminal for the site's hidden routes. */
const palette=document.getElementById("palette"), paletteInput=document.getElementById("palette-input"), paletteResults=document.getElementById("palette-results");
const commands=[["Projects","Browse selected work","#work"],["Skills","Tools and methods","#skills"],["About","Read the route story","#about"],["Resume","Experience and education","#resume"],["Contact","Send a message","#contact"],["Terminal","Try route594 commands","#terminal"],["Credits","Sources and licenses","#credits"],["Debug page","Open the hidden vim route","#debug"]];
function renderCommands(query=""){
  const q=query.trim().toLowerCase();
  paletteResults.innerHTML=commands.filter(([name,desc])=>!q||`${name} ${desc}`.toLowerCase().includes(q)).map(([name,desc,href])=>`<button type="button" data-command="${href}"><span>${name}</span><small>${desc}</small></button>`).join("")||"<small>No matching route.</small>";
}
function openPalette(){if(!palette.open)palette.showModal();renderCommands();setTimeout(()=>paletteInput.focus(),0)}
renderCommands();
paletteInput.addEventListener("input",()=>renderCommands(paletteInput.value));
paletteResults.addEventListener("click",e=>{const b=e.target.closest("[data-command]");if(!b)return;palette.close();location.hash=b.dataset.command.slice(1)});
document.addEventListener("keydown",e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"){e.preventDefault();openPalette()}});

const terminal=document.getElementById("terminal"), terminalOutput=document.getElementById("terminal-output"), terminalForm=document.getElementById("terminal-form"), terminalInput=document.getElementById("terminal-input");
const terminalWrite=(text,error=false)=>{const line=document.createElement("div");line.textContent=text;line.className=error?"terminal-error":"";terminalOutput.appendChild(line);terminalOutput.scrollTop=terminalOutput.scrollHeight};
function runCommand(raw){
  const command=raw.trim().toLowerCase();
  if(!command)return;
  terminalWrite(`route594@christopher:~$ ${raw}`);
  if(command==="help")terminalWrite("help  projects  route 594  about  resume  contact  credits  vim  clear  exit");
  else if(command==="projects"){terminalWrite("Opening selected work…");terminal.close();location.hash="work"}
  else if(command==="route 594"){terminalWrite("Next stop: Seattle via Tacoma. The bus says hi.");summon("The terminal found the 594. It is running on schedule.")}
  else if(command==="about"){terminal.close();location.hash="about"}
  else if(command==="resume"){terminal.close();location.hash="resume"}
  else if(command==="contact"){terminal.close();location.hash="contact"}
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


/* minimized windows collapse into an OS X style dock */
const dock=document.getElementById("dock");
const iconFor={"index.html":"i-home","route.svg":"i-route","projects.html":"i-work","skills.md":"i-skills","about.md":"i-about","resume.pdf":"i-resume","contact.vcf":"i-contact"};
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
  const item=document.createElement("button");item.type="button";item.className="dock-item";item.setAttribute("aria-label","Restore "+name);
  item.innerHTML=`<svg viewBox="0 0 64 56" aria-hidden="true"><use href="#${iconFor[name]||"i-work"}"/></svg><span class="dock-label">${name}</span>`;
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
/* OS X window controls: close, minimize, maximize */
document.querySelectorAll("main .win > .tb").forEach(tb=>{
  const win=tb.parentElement, name=tb.querySelector(".tb-t").textContent;
  const lights=document.createElement("span"); lights.className="lights";
  lights.innerHTML=`<button type="button" class="l close" aria-label="Close ${name}">×</button><button type="button" class="l min" aria-label="Minimize ${name}" aria-expanded="true">−</button><button type="button" class="l max" aria-label="Maximize ${name}" aria-pressed="false">+</button>`;
  tb.prepend(lights);
  const setMax=on=>{win.classList.toggle("maxed",on);document.body.classList.toggle("has-max",!!document.querySelector(".win.maxed"));lights.querySelector(".max").setAttribute("aria-pressed",String(on))};
  lights.querySelector(".min").addEventListener("click",()=>{setMax(false);toDock(win,name)});
  lights.querySelector(".max").addEventListener("click",()=>{win.classList.remove("minimized");setMax(!win.classList.contains("maxed"))});
  lights.querySelector(".close").addEventListener("click",()=>{
    setMax(false);win.classList.add("closing");
    setTimeout(()=>{
      win.classList.remove("closing");win.hidden=true;
      const r=document.createElement("button");r.type="button";r.className="reopen";
      r.innerHTML=`<span class="tb-t">${name}</span><span>Closed. Reopen window</span>`;
      win.after(r);r.focus();
      r.addEventListener("click",()=>{r.remove();win.hidden=false;win.classList.add("opening");setTimeout(()=>win.classList.remove("opening"),400);win.querySelector(".l.close").focus()});
    },reduce?0:280);
  });
});
addEventListener("keydown",e=>{if(e.key==="Escape"){const m=document.querySelector(".win.maxed");if(m)m.querySelector(".l.max").click()}});

/* the eye and Waypoint react when you click icons, menu links, and buttons */
const reactLines={work:"Ooh, the projects. The CTR dashboard is a good first stop.",skills:"Spin that globe while you're there.",about:"The 594 story is my favorite part.",resume:"Pen's ready. Signing time.",contact:"Say hi. The envelope's already open.",card:"Good pick. That case study opens right up.",win:"Careful with those window buttons.",other:"Nice click."};
document.addEventListener("click",e=>{
  const t=e.target.closest(".desk a, nav.links a, .btn, .card, .l, .dock-item");
  if(!t||t.closest("#wp")||reduce) return;
  look(e.clientX,e.clientY);
  eye.classList.add("curious");
  eye.animate([{transform:"scale(1)"},{transform:"scale(1.2) translateY(-3px)"},{transform:"scale(.96)"},{transform:"scale(1)"}],{duration:420,easing:"cubic-bezier(.3,1.6,.5,1)"});
  setTimeout(()=>{blink();eye.classList.remove("curious")},380);
  if(!wp.hidden && !wp.classList.contains("out")){
    const pb=wp.querySelector(".pinbody");
    pb.animate([{transform:"translateY(0)"},{transform:"translateY(-14px) rotate(-6deg)"},{transform:"translateY(2px) rotate(3deg)"},{transform:"translateY(0)"}],{duration:520,easing:"cubic-bezier(.3,1.5,.5,1)"});
    wp.classList.add("blinky");setTimeout(()=>wp.classList.remove("blinky"),140);
    const h=(t.getAttribute("href")||"").slice(1);
    wpLine.textContent=reactLines[h]||(t.classList.contains("card")?reactLines.card:t.matches(".l,.dock-item")?reactLines.win:reactLines.other);
  }
});

/* The ticker is a live, clickable environmental window rather than decoration. */
const environment=document.getElementById("environment"), environmentStatus=document.getElementById("environment-status"), environmentData=document.getElementById("environment-data"), liveTicker=document.querySelector(".live-ticker");
const weatherCode={0:"clear sky",1:"mostly clear",2:"partly cloudy",3:"overcast",45:"fog",48:"rime fog",51:"light drizzle",53:"drizzle",55:"heavy drizzle",61:"light rain",63:"rain",65:"heavy rain",71:"light snow",73:"snow",75:"heavy snow",80:"rain showers",81:"rain showers",82:"heavy showers",95:"thunderstorm"};
function showEnvironment(){if(!environment.open)environment.showModal();loadEnvironment()}
async function loadEnvironment(){
  environmentStatus.textContent="Loading current conditions from Open-Meteo for Bellevue, Washington.";
  try{
    const r=await fetch("https://api.open-meteo.com/v1/forecast?latitude=47.6101&longitude=-122.2015&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&temperature_unit=fahrenheit&wind_speed_unit=mph");
    if(!r.ok)throw new Error(`Weather service returned ${r.status}`);
    const d=await r.json(), c=d.current;
    const values=[["Temperature",`${Math.round(c.temperature_2m)}°F`],["Feels like",`${Math.round(c.apparent_temperature)}°F`],["Conditions",weatherCode[c.weather_code]||"changing"],["Humidity",`${c.relative_humidity_2m}%`],["Wind",`${Math.round(c.wind_speed_10m)} mph`],["Precipitation",`${c.precipitation} mm`]];
    environmentData.innerHTML=values.map(([label,value])=>`<div><b>${label}</b><span>${value}</span></div>`).join("");
    environmentStatus.textContent=`Updated ${new Date(c.time).toLocaleString("en-US",{hour:"numeric",minute:"2-digit"})} Pacific.`;
    document.querySelectorAll(".live-condition").forEach(el=>{el.textContent=`PUGET SOUND: ${Math.round(c.temperature_2m)}°F · ${weatherCode[c.weather_code]||"changing"} · ${Math.round(c.wind_speed_10m)} MPH`});
  }catch(error){environmentStatus.textContent="Live conditions are temporarily unavailable. Hieye is still watching.";environmentData.replaceChildren();console.warn("Could not load Open-Meteo conditions.",error)}
}
liveTicker.addEventListener("click",showEnvironment);
liveTicker.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" ")showEnvironment()});

const clock=document.getElementById("clock");
const fmt=new Intl.DateTimeFormat("en-US",{hour:"numeric",minute:"numeric",second:"numeric",hour12:false,timeZone:"America/Los_Angeles"});
const hh=document.getElementById("hh"),mh=document.getElementById("mh"),sh=document.getElementById("sh");
let hourNow=12;
const tick=()=>{
  const parts=Object.fromEntries(fmt.formatToParts(new Date()).map(x=>[x.type,x.value]));
  const h=(+parts.hour)%24, m=+parts.minute, sec=+parts.second;
  hourNow=(h%12)||12;
  hh.style.transform=`rotate(${(h+m/60)*30}deg)`;mh.style.transform=`rotate(${(h*60+m+sec/60)*6}deg)`;sh.style.transform=`rotate(${(h*3600+m*60+sec)*6}deg)`;
  clock.setAttribute("aria-label",`${hourNow}:${String(m).padStart(2,"0")} ${h<12?"AM":"PM"} Pacific. Select for a cuckoo.`);
};
const cuckoo=document.getElementById("cuckoo"), say=document.getElementById("cuckooSay");
let cuckooBusy=false;
clock.addEventListener("click",()=>{
  if(cuckooBusy) return; cuckooBusy=true;
  const n=hourNow; let i=0;
  clock.classList.add("cuckooing");
  const call=()=>{
    i++; say.textContent=n>1?`Cuckoo ${i} of ${n}`:"Cuckoo!";
    cuckoo.classList.remove("chirp");void cuckoo.offsetWidth;cuckoo.classList.add("chirp");
    tone(784,784,.18,"sine",.12);tone(659,659,.24,"sine",.12,.2);
    if(i<n) setTimeout(call,reduce?250:520);
    else setTimeout(()=>{clock.classList.remove("cuckooing");cuckooBusy=false},900);
  };
  setTimeout(call,250);
});
tick(); setInterval(tick,1000);
