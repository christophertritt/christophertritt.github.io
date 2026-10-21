/* portfolio.js: the portfolio pages (overview, the five sections, 404).
   Case studies, the wayfinding kiosk (Ctrl-K), the route594 terminal and
   hidden routes, Hieye's tour, the route map, and each page's own bit:
   the departures board, the terminal keys, the mountain check, the seal,
   and the messenger. Data comes from js/home-data.js. */
(()=>{
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const S=window.Shell||{say(){},hush(){},calm:()=>true};
const calm=()=>S.calm();
const page=(document.body.className.match(/page-(\S+)/)||[])[1];
const PAGES={work:"/portfolio/projects/",projects:"/portfolio/projects/",skills:"/portfolio/skills/",about:"/portfolio/about/",resume:"/portfolio/resume/",contact:"/portfolio/contact/"};
const party=(opts,el)=>{if(!window.confetti||calm())return;const r=el?el.getBoundingClientRect():{left:innerWidth/2,top:innerHeight/2,width:0,height:0};
  confetti({particleCount:60,spread:75,startVelocity:30,zIndex:150,disableForReducedMotion:true,origin:{x:(r.left+r.width/2)/innerWidth,y:(r.top+r.height/2)/innerHeight},...opts})};

/* ================= case studies ================= */
const dlg=$("#case"), cs=$("#cs"), prog=$("#csProg");
const filled=v=>typeof v==="string"&&v.replace(/<[^>]*>/g,"").trim()!=="";
const part=(h,v)=>filled(v)?`<h3>${h}</h3><p>${v}</p>`:"";
function openCase(id){
  const p=typeof projects!=="undefined"&&projects.find(x=>x.id===id); if(!p||!dlg) return false;
  $("#cs-file").textContent=p.file;
  cs.innerHTML=`<p class="eyebrow">Case study${p.status?" · "+p.status:""}</p><h2 id="cs-title">${p.title}</h2>
  <p class="lede">${p.lede}</p>
  <dl class="glance">${Object.entries(p.glance).filter(([,v])=>filled(v)).map(([k,v])=>`<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl>
  <div class="shot">${thumb(p.id,true)}</div>
  ${part("The problem",p.problem)}${part("My role",p.role)}
  ${(p.approach||[]).filter(filled).length?`<h3>Approach</h3><ol>${p.approach.filter(filled).map(a=>`<li>${a}</li>`).join("")}</ol>`:""}
  ${part("Outcome",p.outcome)}${part("Reflection",p.reflect)}
  ${p.note?`<p class="note">${p.note}</p>`:""}`;
  if(!dlg.open)dlg.showModal();
  dlg.scrollTop=0;prog.style.width="0%";
  return true;
}
dlg?.addEventListener("scroll",()=>{const max=dlg.scrollHeight-dlg.clientHeight,pct=max>0?Math.round(dlg.scrollTop/max*100):100;prog.style.width=pct+"%";prog.parentElement.setAttribute("aria-valuenow",pct)},{passive:true});
dlg?.addEventListener("close",()=>{if(projects.some(p=>"#"+p.id===location.hash))history.replaceState(null,"",location.pathname+location.search)});
document.addEventListener("click",e=>{
  const a=e.target.closest("[data-case]");if(!a)return;
  e.preventDefault();
  if(page==="projects"&&!calm()){const row=a.closest(".row");if(row){row.querySelectorAll(".f").forEach(f=>{f.classList.remove("flip");void f.offsetWidth;f.classList.add("flip")})}}
  history.replaceState(null,"","#"+a.dataset.case);openCase(a.dataset.case);
});

/* ================= routes: #project, #credits, #terminal, #debug, #tour, #kiosk, unknown ================= */
const known=new Set(["","main","top","tour","kiosk","credits","terminal","debug","connect",...Object.keys(PAGES),...(typeof allProjects!=="undefined"?allProjects.map(p=>p.id):[]),...(typeof T!=="undefined"?Object.keys(T):[])]);
function route(){
  const h=decodeURIComponent(location.hash.slice(1));
  if(typeof projects!=="undefined"&&projects.some(p=>p.id===h)){
    if(page==="projects")openCase(h);else location.href=PAGES.projects+"#"+h;return}
  if(PAGES[h]&&page!==h&&!(h==="work"&&page==="projects")&&!document.getElementById(h)){location.replace(PAGES[h]);return}
  if(h==="terminal"||h==="debug"){S.openDlg($("#"+h));return}
  if(h==="tour"){setTimeout(startTour,600);return}
  if(h==="kiosk"){openPalette();return}
  if(!known.has(h)&&!document.getElementById(h))S.openDlg($("#lost"));
}
route();addEventListener("hashchange",route);

/* ================= wayfinding kiosk (Ctrl-K) ================= */
const pal=$("#palette"), palIn=$("#paletteIn"), palOut=$("#paletteResults");
const commands=[["Overview","The portfolio front door","/portfolio/"],["Projects","Departures: the case studies",PAGES.projects],["Skills","The terminal",PAGES.skills],
  ["About","Why transportation",PAGES.about],["Resume","Experience and education",PAGES.resume],["Contact","Send a message",PAGES.contact],
  ["Start page","Search, transit and headlines","/"],["Reader","All the feeds","/reader/"],
  ["Tour","Let Hieye show you around","#tour"],["Terminal","Try route594 commands","#terminal"],["Credits","Sources and licenses","#credits"],["Debug page","The hidden vim route","#debug"]];
function renderCommands(q=""){
  q=q.trim().toLowerCase();
  const hits=commands.filter(([n,d])=>!q||`${n} ${d}`.toLowerCase().includes(q));
  palOut.innerHTML=hits.map(([n,d,h])=>`<button type="button" data-go="${h}"><span>${n}</span><small>${d}</small></button>`).join("")||"<p>No stop by that name.</p>";
}
function openPalette(){if(!pal)return;renderCommands();palIn.value="";S.openDlg(pal);setTimeout(()=>palIn.focus(),0)}
palIn?.addEventListener("input",()=>renderCommands(palIn.value));
palIn?.addEventListener("keydown",e=>{if(e.key==="Escape"){e.preventDefault();pal.close()}if(e.key==="Enter"){const b=palOut.querySelector("button");if(b){e.preventDefault();b.click()}}});
palOut?.addEventListener("click",e=>{const b=e.target.closest("[data-go]");if(!b)return;pal.close();const g=b.dataset.go;
  if(g==="#tour")startTour();else if(g==="#credits")S.openDlg($("#credits"));else if(g.startsWith("#"))location.hash=g.slice(1);else location.href=g});
document.addEventListener("keydown",e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"){e.preventDefault();openPalette()}});

/* ================= route594 terminal ================= */
const term=$("#terminal"), tOut=$("#termOut"), tForm=$("#termForm"), tIn=$("#termIn");
const tw=(t,err)=>{const d=document.createElement("div");d.textContent=t;if(err)d.className="err";tOut.appendChild(d);tOut.scrollTop=tOut.scrollHeight};
tForm?.addEventListener("submit",e=>{e.preventDefault();const raw=tIn.value,c=raw.trim().toLowerCase();tIn.value="";if(!c)return;
  tw(`route594@christopher:~$ ${raw}`);
  const go=u=>{term.close();location.href=u};
  if(c==="help")tw("help  projects  skills  about  resume  contact  route 594  credits  vim  clear  exit");
  else if(PAGES[c])go(PAGES[c]);
  else if(c==="route 594"){tw("Next stop: Seattle via Tacoma. The bus says hi.");S.say("The terminal found the 594. It's running on schedule.")}
  else if(c==="credits"){term.close();S.openDlg($("#credits"))}
  else if(c==="vim"){term.close();S.openDlg($("#debug"))}
  else if(c==="clear")tOut.replaceChildren();
  else if(c==="exit"||c===":q")term.close();
  else tw(`command not found: ${raw}`,true);
});
term?.addEventListener("close",()=>{if(location.hash==="#terminal")history.replaceState(null,"",location.pathname)});
$("#debug")?.addEventListener("close",()=>{if(location.hash==="#debug")history.replaceState(null,"",location.pathname)});
window.route594=()=>{location.hash="terminal"};
console.log("%cWelcome aboard route594.%c Try Ctrl-K, or run window.route594().","color:#1f78d1;font-weight:bold","color:inherit");

/* ================= Hieye's tour ================= */
function startTour(){
  if(!window.driver?.js){location.href="/portfolio/";return}
  const vis=sel=>{const el=$(sel);if(!el)return null;const r=el.getBoundingClientRect();return r.width&&r.height?el:null};
  const steps=[
    ["#eye","Hi, I'm Hieye","I'm the eye in the corner. I follow your pointer and pop up with tips. Poke me if you like, but not too much."],
    ["#nav","The five sections","Each section has its own theme: a departures board, a terminal, a solarpunk town, an antique desk and a messenger."],
    ["#menuBtn","Menu","On a phone, everything lives in this menu."],
    ["#wxChip","Weather","The weather for wherever you are, dressed for each page. Select it for the start page."],
    ["#clock","Station clock","A Swiss railway clock. The red hand pauses at the top of each minute. Hover or select it for the platform sign."],
    [".hub-desk","Pick a window","Every icon opens a page. Start with Projects if you're short on time."],
    ["#routeMap","Route so far","A real map of where I've lived, studied and worked. Select a stop to fly there."]
  ].map(([sel,title,description])=>{const el=vis(sel);return el?{element:el,popover:{title,description}}:null}).filter(Boolean);
  steps.push({popover:{title:"That's the tour",description:"Press Ctrl-K or ⌘K any time for the wayfinding kiosk. There are a few secrets too. Have fun, and say hi from Contact."}});
  S.hush();
  driver.js.driver({showProgress:true,progressText:"{{current}} of {{total}}",nextBtnText:"Next",prevBtnText:"Back",doneBtnText:"Done",
    popoverClass:"hieye-tour",stagePadding:8,stageRadius:14,smoothScroll:!calm(),animate:!calm(),steps,
    onHighlighted:()=>S.blink?.(),onDestroyed:()=>{try{localStorage.setItem("ct-toured","yes")}catch(e){}if(location.hash==="#tour")history.replaceState(null,"",location.pathname)}}).drive();
}
S.startTour=startTour;S.openPalette=openPalette;

/* first visit to the overview: Hieye offers the tour, once per browser */
if(page==="hub"&&location.hash!=="#tour")setTimeout(()=>{
  if(document.querySelector("dialog[open]"))return;
  try{if(localStorage.getItem("ct-greeted"))return;localStorage.setItem("ct-greeted","1")}catch(e){return}
  S.say("Welcome to my little corner. First time here? I can show you around.",{actions:[{label:"Show me around",run:startTour},{label:"Not now",clear:true}]});
},2600);

/* Konami code: the 594 says hi */
const code=["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];let ki=0;
addEventListener("keydown",e=>{const k=e.key.length===1?e.key.toLowerCase():e.key;ki=k===code[ki]?ki+1:(k===code[0]?1:0);
  if(ki===code.length){ki=0;S.say("You found the cheat code. The 594 says hi.");party({shapes:["star"],colors:["#ffd84a","#ff9fd2","#7fe3ff","#9fe3a8"]})}});

/* mail links: a burst of bubbles */
document.addEventListener("click",e=>{const a=e.target.closest('a[href^="mailto:"]');if(a)party({shapes:["circle"],colors:["#bfe8ff","#7fcdf0","#ffffff","#c9f0a8"],gravity:.35,scalar:1.4},a)});

/* ================= overview: the route map ================= */
const mapEl=$("#routeMap");
if(mapEl&&window.L){
  const stops=[["Tacoma",47.2529,-122.4443],["Ellensburg",46.9965,-120.5478],["Seattle",47.6062,-122.3321],["Bellevue",47.6101,-122.2015]];
  const map=L.map(mapEl,{scrollWheelZoom:false,zoomSnap:.25,zoomControl:false});L.control.zoom({position:"topright"}).addTo(map);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:18,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);
  const ll=stops.map(s=>[s[1],s[2]]);
  L.polyline(ll,{color:"#ffffff",weight:10,opacity:.7}).addTo(map);
  L.polyline(ll,{color:"#1f78d1",weight:4,dashArray:"10 8"}).addTo(map);
  stops.forEach((s,i)=>L.marker([s[1],s[2]],{keyboard:false,title:s[0],icon:L.divIcon({className:"stop-pin"+(i===3?" now":""),iconSize:[20,20],iconAnchor:[10,10]})})
    .addTo(map).bindTooltip(s[0],{direction:["bottom","top","left","right"][i],offset:[[0,10],[0,-10],[-10,0],[10,0]][i],className:"stop-tip"}));
  const fit=()=>map.fitBounds(L.latLngBounds(ll),{paddingTopLeft:[60,30],paddingBottomRight:[60,30]});fit();
  new ResizeObserver(()=>{map.invalidateSize();fit()}).observe(mapEl);
  $$(".stops li").forEach((li,i)=>{const b=document.createElement("button");b.type="button";b.className="stopbtn";b.append(...li.childNodes);li.append(b);
    b.setAttribute("aria-label",`${b.textContent.trim()}. Show ${stops[i][0]} on the map.`);
    b.addEventListener("click",()=>{map.flyTo([stops[i][1],stops[i][2]],11,{duration:calm()?0:1.2});$$(".stops li").forEach(x=>x.classList.toggle("sel",x===li))})});
}

/* ================= Projects: the departures board ================= */
if(page==="projects"){
  const fmt=d=>new Intl.DateTimeFormat("en-GB",{hour:"2-digit",minute:"2-digit",hour12:false,timeZone:"America/Los_Angeles"}).format(d);
  const A=" ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:";
  const setTiles=(el,text)=>{const sp=el.querySelectorAll("span");[...text].forEach((c,i)=>{if(sp[i])sp[i].textContent=c===" "?" ":c})};
  /* the board clock and the departure times follow the real time */
  const clk=$("#fidsClock");
  const now=new Date();
  $$(".row[data-dep]").forEach(r=>{const t=fmt(new Date(now.getTime()+(12+(+r.dataset.dep)*17)*60000));setTiles(r.querySelector(".f.t"),t);const m=r.querySelector(".m-t");if(m)m.textContent=t});
  const tickClk=()=>clk&&setTiles(clk,fmt(new Date()));tickClk();setInterval(tickClk,15000);
  /* split-flap: each tile riffles through the alphabet before it lands */
  if(!calm())$$(".board .f").forEach((f,k)=>{
    const sp=[...f.querySelectorAll("span")],target=sp.map(s=>s.textContent);let step=0;
    const iv=setInterval(()=>{step++;let done=true;
      sp.forEach((s,i)=>{if(step>i*.5+5+k*.6)s.textContent=target[i];else{done=false;if(target[i].trim())s.textContent=A[Math.floor(Math.random()*A.length)]}});
      if(done)clearInterval(iv)},55)});
}

/* ================= Skills: function keys and the command line ================= */
if(page==="skills"){
  const msg=$("#termMsg"), cmd=$("#cmdIn"), panels=$$(".panel"), keys=$$(".fk[data-k]");
  const zones=$$("#worldClocks [data-tz]");
  const tickZ=()=>zones.forEach(b=>b.textContent=new Date().toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit",timeZone:b.dataset.tz}));tickZ();setInterval(tickZ,20000);
  const type=t=>{if(calm()){cmd.value=t;return}cmd.value="";let i=0;const iv=setInterval(()=>{cmd.value=t.slice(0,++i);if(i>=t.length)clearInterval(iv)},40)};
  function pick(n){
    panels.forEach((p,i)=>p.classList.toggle("on",i===n-1));
    keys.forEach(k=>{if(/^\d$/.test(k.dataset.k))k.setAttribute("aria-pressed",String(+k.dataset.k===n))});
    if(n){const p=panels[n-1];p.focus({preventScroll:true});p.scrollIntoView({block:"nearest",behavior:calm()?"auto":"smooth"});
      msg.textContent=`Panel ${n}: ${p.querySelector(".ph span").textContent}. Press GO for the work behind it.`}
    else msg.textContent="Press 1, 2 or 3 to pull one up";
  }
  let cur=0;
  const run=raw=>{const c=raw.trim().toUpperCase().replace(/<GO>|^CTRITT\s*/g,"").trim();
    if(/^(1|TDM|DEMAND)/.test(c)){cur=1;pick(1)}else if(/^(2|GIS|SPATIAL)/.test(c)){cur=2;pick(2)}else if(/^(3|DATA)/.test(c)){cur=3;pick(3)}
    else if(/^(PROJECTS|WORK|GO)$/.test(c)||c==="")location.href=cur===2?"/portfolio/projects/#grayland":"/portfolio/projects/#ctr";
    else if(PAGES[c.toLowerCase()])location.href=PAGES[c.toLowerCase()];
    else if(/^HELP/.test(c))msg.textContent="Type TDM, GIS or DATA, or PROJECTS, RESUME, CONTACT. Function keys work too.";
    else msg.textContent=`${c}: not a function. Type HELP.`};
  $("#cmdForm").addEventListener("submit",e=>{e.preventDefault();run(cmd.value)});
  keys.forEach(k=>k.addEventListener("click",()=>{const v=k.dataset.k;
    if(/^\d$/.test(v)){cur=+v;type(`CTRITT ${["TDM","GIS","DATA"][v-1]} <GO>`);pick(cur)}
    else if(v==="help"){type("HELP");msg.textContent="Press 1, 2 or 3, then GO. Or type a command and press Enter."}
    else if(v==="cancel"){cur=0;type("CTRITT SKILLS");pick(0)}
    else if(v==="print")window.print();
    else if(v==="go")run(cmd.value)}));
  addEventListener("keydown",e=>{if(/INPUT|TEXTAREA/.test(document.activeElement.tagName)||e.metaKey||e.ctrlKey||e.altKey)return;
    if(["1","2","3"].includes(e.key)){keys.find(k=>k.dataset.k===e.key).click()}});
}

/* ================= About: is the mountain out? ================= */
if(page==="about"){
  const t=$("#mtnText");
  (async()=>{try{
    const c=(await (await fetch("https://api.open-meteo.com/v1/forecast?latitude=47.2529&longitude=-122.4443&current=cloud_cover,is_day")).json()).current;
    if(typeof c.cloud_cover!=="number")throw 0;const out=c.cloud_cover<45;document.body.classList.toggle("mountain-out",out);
    t.textContent=out?(c.is_day?"Rainier is out over Tacoma right now":"Clear night over Tacoma. Rainier's out there."):`Rainier is hiding behind ${c.cloud_cover}% cloud cover today`;
  }catch(e){t.textContent="Rainier is probably hiding. It usually is."}})();
}

/* ================= Resume: the wax seal and the stamp ================= */
if(page==="resume"){
  const parch=$("#parch"), stamp=$("#stamp"), words=["APPROVED","HIRE ME","AICP-ELIGIBLE","ON TIME","594 PASS"];let i=0;
  $("#sealBtn").addEventListener("click",()=>{
    $$(".seal",parch).forEach(s=>s.remove());
    const s=document.createElement("div");s.className="seal";s.setAttribute("aria-hidden","true");s.textContent="CT";
    s.style.left=(18+Math.random()*60)+"%";s.style.top=(40+Math.random()*40)+"%";parch.appendChild(s);
    i++;stamp.textContent=words[i%words.length];stamp.classList.remove("thunk");void stamp.offsetWidth;stamp.classList.add("thunk");
    S.say(["Sealed and delivered.","Very official.","The wax is still warm."][i%3],{ms:2000});
  });
}

/* ================= Contact: the messenger ================= */
if(page==="contact"){
  const base=Date.now()-60000, tf=d=>d.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit",second:"2-digit"});
  $$(".log .ts").forEach(s=>s.textContent=`(${tf(new Date(base+(+s.dataset.ts)*1000))})`);
  const aways=["Away: probably on the 594","Away: at an ORCA sign-up table. BRB","Away: geocoding. Do not disturb (but do email)","Away: watching for the mountain to come out"];
  let k=0;setInterval(()=>{if(!calm())$("#away").textContent=aways[++k%aways.length]},9000);
  const typing=$("#typing");
  setInterval(()=>{if(calm()||document.hidden)return;typing.textContent="ChristopherT is typing...";setTimeout(()=>typing.textContent="",2600)},12000);
  const im=$("#im"), form=$("#imForm");
  $$(".tool").forEach(b=>b.addEventListener("click",()=>{const f=b.dataset.fmt;
    if(f==="smaller"||f==="larger"){const s=parseFloat(getComputedStyle(im).fontSize);im.style.fontSize=Math.max(12,Math.min(22,s+(f==="larger"?2:-2)))+"px"}
    else if(f==="link"||f==="smile"){const ins=f==="link"?"https://":" :-)";const p=im.selectionStart??im.value.length;im.value=im.value.slice(0,p)+ins+im.value.slice(p);im.focus();im.selectionStart=im.selectionEnd=p+ins.length}
    else{const on=!im.classList.contains(f);im.classList.toggle(f,on);b.setAttribute("aria-pressed",String(on))}}));
  $("[data-focus-im]")?.addEventListener("click",()=>im.focus());
  form.addEventListener("submit",e=>{
    e.preventDefault();
    const text=im.value.trim();
    if(!text){im.focus();S.say("Type a message first, then Send opens it in your email.",{ms:3000});return}
    const p=document.createElement("p");p.innerHTML=`<b class="me-msg">You</b> <span class="ts">(${tf(new Date())})</span>: `;p.append(text);$("#imLog").appendChild(p);$("#imLog").scrollTop=1e9;
    location.href="mailto:christopheratritt@gmail.com?subject="+encodeURIComponent("Hello from your website")+"&body="+encodeURIComponent(text);
    im.value="";
  });
  im.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();form.requestSubmit()}});
}
})();
