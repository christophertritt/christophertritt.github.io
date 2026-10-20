/* Round 2 shared layer, loaded on every page:
   Canada / Quebec modes (localStorage "ct-mode", synced with the older
   "ct-canada" flag that js/home.js and js/weather.js already use),
   the Portfolio pop-out nav, the bottom flag bar, the SBB clock sign,
   the floating eye (start page), the Christophergle wordmark, the
   weather bubbles inside the search box, and French UI translation.
   Vanilla, no dependencies. */
(()=>{
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
const ls={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:v}catch(e){return d}},
          set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};

/* ================= French dictionary (Quebec mode) ================= */
const FR={
  "nav.start":"Accueil","nav.portfolio":"Portfolio","nav.projects":"Projets","nav.skills":"Compétences",
  "nav.about":"À propos","nav.resume":"CV","nav.contact":"Contact","nav.reader":"Lecteur",
  "menu.desktop":"Bureau",
  "gle.tag":"votre porte d'entrée sur l'autoroute de l'information",
  "search.btn":"Rechercher","search.ph":"Rechercher sur Christophergle",
  "search.hint1":"Appuyez sur ","search.hint2":" pour rechercher de partout. Les recherches Web s'ouvrent dans Google. SharePoint cherche dans vos fichiers et sites Microsoft 365.",
  "mode.web":"Web","mode.news":"Actualités","mode.images":"Images","mode.scholar":"Universitaire","mode.maps":"Cartes","mode.mrsc":"MRSC","mode.m365":"SharePoint",
  "desk.feeds":"Flux","desk.bus":"OneBusAway","desk.road":"Trafic WSDOT","desk.m365":"Applis de travail","desk.scholar":"Universitaire","desk.mrsc":"MRSC","desk.repo":"Dépôt du site",
  "gh.t":"Titres","gn.t":"Notes","gt.t":"Départs près d'ici","ga.t":"Alertes de service","fp.t":"Première page",
  "gh.open":"Ouvrir les flux","status.start":"Les flux se rafraîchissent chaque heure",
  "notes.ph":"Notez quelque chose. Ça reste dans ce navigateur.","notes.saved":"Enregistré dans ce navigateur",
  "gt.here":"Ici","gt.home":"Maison","gt.work":"Travail",
  "rd.unread":"Non lus seulement","rd.markall":"Tout marquer comme lu","rd.ph":"Rechercher dans vos flux",
  "rd.keys1":"Touches : ","rd.keys2":" suivant et précédent, ","rd.keys3":" ouvrir, ","rd.keys4":" favori, ","rd.keys5":" lu ou non lu.",
  "tb.home":"Accueil","tb.route":"Parcours",
  "hero.view":"Voir les projets",
  "route.h":"Le parcours jusqu'ici",
  "work.eyebrow":"Travaux choisis",
  "skills.eyebrow":"Ce que je fais","skills.h":"Trois sortes de travail",
  "skills.c1":"Gestion de la demande","skills.c2":"Analyse spatiale","skills.c3":"Outils de données",
  "about.eyebrow":"À propos","about.h":"Pourquoi le transport",
  "resume.eyebrow":"CV","resume.h":"Expérience et formation","cv.exp":"Expérience","cv.edu":"Formation",
  "contact.h":"Parlons-nous","contact.email":"Écrivez-moi","contact.vcf":"Télécharger la carte de contact (vCard)","contact.linkedin":"LinkedIn",
  "status.credits":"Crédits et sources",
  "gwx.feels":"ressenti"
};
const TITLES={"/":"Accueil · Christopher A. Tritt","/portfolio/":"Portfolio · Christopher A. Tritt",
  "/portfolio/projects/":"Projets · Christopher A. Tritt","/portfolio/skills/":"Compétences · Christopher A. Tritt",
  "/portfolio/about/":"À propos · Christopher A. Tritt","/portfolio/resume/":"CV · Christopher A. Tritt",
  "/portfolio/contact/":"Contact · Christopher A. Tritt","/reader/":"Lecteur · Christopher A. Tritt"};
const enTitle=document.title;

/* ================= mode state ================= */
let mode=ls.get("ct-mode",null)||(ls.get("ct-canada","off")==="on"?"canada":"off");
if(!["off","canada","quebec"].includes(mode))mode="off";
const flagCA=$("#flagCA"), flagQC=$("#flagQC"), flagQCUnit=$("#flagQCUnit");

function syncCanada(on){
  ls.set("ct-canada",on?"on":"off");
  if(document.body.classList.contains("canada")!==on){
    if(typeof window.setCanada==="function")window.setCanada(on,false);
    else document.body.classList.toggle("canada",on);
  }
}
function applyMode(m){
  mode=m; ls.set("ct-mode",m);
  if(m==="off")document.documentElement.removeAttribute("data-mode");
  else document.documentElement.dataset.mode=m;
  document.documentElement.lang=m==="quebec"?"fr-CA":m==="canada"?"en-CA":"en";
  syncCanada(m!=="off");
  if(flagCA)flagCA.setAttribute("aria-pressed",String(m!=="off"));
  if(flagQC)flagQC.setAttribute("aria-pressed",String(m==="quebec"));
  if(flagQCUnit)flagQCUnit.hidden=m==="off";
  applyI18n(m==="quebec");
  renderWordmark();
  renderGleWx();
  document.title=m==="quebec"?(TITLES[location.pathname]||enTitle):enTitle;
}
if(flagCA)flagCA.addEventListener("click",()=>applyMode(mode==="off"?"canada":"off"));
if(flagQC)flagQC.addEventListener("click",()=>applyMode(mode==="quebec"?"canada":"quebec"));
/* the portfolio taskbar flag (js/home.js) toggles body.canada directly; follow it */
new MutationObserver(()=>{
  const on=document.body.classList.contains("canada");
  if(on&&mode==="off")applyMode("canada");
  else if(!on&&mode!=="off")applyMode("off");
}).observe(document.body,{attributes:true,attributeFilter:["class"]});

/* ================= i18n ================= */
function applyI18n(fr){
  $$("[data-i18n]").forEach(el=>{
    if(el.dataset.en===undefined)el.dataset.en=el.textContent;
    const t=fr?FR[el.dataset.i18n]:null;
    el.textContent=t||el.dataset.en;
  });
  $$("[data-i18n-ph]").forEach(el=>{
    if(el.dataset.enPh===undefined)el.dataset.enPh=el.getAttribute("placeholder")||"";
    const t=fr?FR[el.dataset.i18nPh]:null;
    el.setAttribute("placeholder",t||el.dataset.enPh);
  });
  setGreeting(fr);
}
function pacificHour(){
  return +new Intl.DateTimeFormat("en-US",{hour:"numeric",hour12:false,timeZone:"America/Los_Angeles"}).format(new Date())%24;
}
function setGreeting(fr){
  const hello=$("#hello"); if(!hello)return;
  const hr=pacificHour();
  hello.textContent=fr
    ?(hr<5?"Encore debout":hr<12?"Bonjour":hr<17?"Bon après-midi":"Bonsoir")+", Christopher"
    :(hr<5?"Up late":hr<12?"Good morning":hr<17?"Good afternoon":"Good evening")+", Christopher";
}
/* the reader's stream title is set by js/start.js; translate its known values */
const DYN={"All feeds":"Tous les flux","Starred":"Favoris"};
const streamTitle=$("#streamTitle");
if(streamTitle)new MutationObserver(()=>{
  if(mode==="quebec"&&DYN[streamTitle.textContent])streamTitle.textContent=DYN[streamTitle.textContent];
}).observe(streamTitle,{childList:true,characterData:true,subtree:true});
/* start.js rewrites the search placeholder when a search mode is picked; re-apply French after it */
const modesBox=$(".modes");
if(modesBox)modesBox.addEventListener("click",()=>setTimeout(()=>{if(mode==="quebec")applyI18n(true)},0));

/* ================= Portfolio pop-out nav ================= */
const pnavBtn=$("#pnavBtn"), pnavPanel=$("#pnavPanel");
if(pnavBtn&&pnavPanel){
  const setOpen=o=>{pnavPanel.hidden=!o;pnavBtn.setAttribute("aria-expanded",String(o));pnavPanel.classList.toggle("open",o)};
  pnavBtn.addEventListener("click",e=>{e.stopPropagation();setOpen(pnavPanel.hidden)});
  document.addEventListener("click",e=>{if(!e.target.closest(".pnav"))setOpen(false)});
  document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!pnavPanel.hidden){setOpen(false);pnavBtn.focus()}});
  pnavPanel.addEventListener("click",e=>{if(e.target.closest("a"))setOpen(false)});
  const path=location.pathname.endsWith("/")?location.pathname:location.pathname+"/";
  $$("a",pnavPanel).forEach(a=>{if(a.getAttribute("href")===path)a.setAttribute("aria-current","page")});
}

/* ================= Christophergle wordmark ================= */
const gleWord=$("#gleWord"), gleTb=$("#gleTb");
const GLE_COLORS=["c-b","c-r","c-y","c-b","c-g","c-r"];
function renderWordmark(){
  if(gleTb)gleTb.textContent=mode==="quebec"?"christophergle.ca/fr":mode==="canada"?"christophergle.ca/en":"Christophergle";
  if(!gleWord)return;
  const name=mode==="off"?"Christophergle":"christophergle";
  gleWord.innerHTML=[...name].map((ch,i)=>`<span class="${GLE_COLORS[i%GLE_COLORS.length]}">${ch}</span>`).join("")
    +(mode==="off"?"":`<span class="sfx">.ca/${mode==="quebec"?"fr":"en"}</span>`);
  gleWord.setAttribute("aria-label",gleWord.textContent);
}

/* ================= weather bubbles in the search box ================= */
/* Data comes from js/weather.js only: this mirrors the floating cluster's
   rendered values (which already handle place, units and Canada mode). */
const gwxT=$("#gwxTemp"), gwxC=$("#gwxCond"), gwxF=$("#gwxFeels"), gwxW=$("#gwxWind"), gwxWU=$("#gwxWindU"), gwxP=$("#gwxPlace");
function renderGleWx(){
  if(!gwxT)return;
  const main=$(".wxb.main"), feels=$(".wxb.feels"), wind=$(".wxb.wind"), place=$(".wxb.place");
  if(!main)return;
  const b=$("b",main); if(b&&b.textContent.trim()&&b.textContent!=="…")gwxT.textContent=b.textContent;
  const c=$("small",main); if(c)gwxC.textContent=c.textContent;
  const fb=$("b",feels); if(fb&&fb.textContent!=="…")gwxF.textContent=fb.textContent;
  const wb=$("b",wind); if(wb&&wb.textContent!=="…")gwxW.textContent=wb.textContent;
  const wu=$("small",wind); if(wu)gwxWU.textContent=wu.textContent;
  if(place&&gwxP)gwxP.textContent=place.textContent.replace(/\s+/g," ").trim();
}
const wxAside=$("#wx");
if(wxAside&&gwxT){
  let queued=false;
  new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;renderGleWx()})})
    .observe(wxAside,{subtree:true,childList:true,characterData:true});
  document.addEventListener("weather:update",renderGleWx);
}

/* ================= floating eye assistant (start page) ================= */
const eyeFloat=$("#eyeFloat");
if(eyeFloat){
  const iris=$(".iris",eyeFloat), eyeEl=$(".eye",eyeFloat), line=$("#eyeLine"), prompt=$("#eyePrompt");
  addEventListener("pointermove",e=>{
    const r=eyeEl.getBoundingClientRect(),dx=e.clientX-r.left-r.width/2,dy=e.clientY-r.top-r.height/2,d=Math.hypot(dx,dy)||1,m=Math.min(r.width*.22,d/18);
    iris.style.transform=`translate(${(dx/d*m).toFixed(1)}px,${(dy/d*m).toFixed(1)}px)`;
  },{passive:true});
  (function blink(){setTimeout(()=>{eyeEl.classList.add("blink");setTimeout(()=>eyeEl.classList.remove("blink"),150);blink()},2800+Math.random()*4000)})();
  const LINES={
    en:["Hi, I'm Hieye. I float here now.","Try a search. The weather moved into the box.","Click Portfolio. The menu pops out.","Psst: the little flag at the bottom changes everything."],
    fr:["Salut, je suis Hieye. Je flotte ici maintenant.","Essayez une recherche. La météo est dans la boîte.","Cliquez Portfolio. Le menu jaillit.","Psst : le petit drapeau en bas change tout."]};
  let li=0;
  const say=()=>{if(line)line.textContent=LINES[mode==="quebec"?"fr":"en"][li%4]};
  say();
  setInterval(()=>{if(!document.hidden){li++;say();if(prompt&&!reduce){prompt.classList.remove("pop");void prompt.offsetWidth;prompt.classList.add("pop")}}},9000);
  eyeEl.addEventListener("click",()=>{li++;say();eyeEl.classList.add("blink");setTimeout(()=>eyeEl.classList.remove("blink"),160)});
  new MutationObserver(()=>say()).observe(document.documentElement,{attributes:true,attributeFilter:["data-mode"]});
}

/* ================= SBB platform sign (expanded clock) ================= */
const clockEl=$("#clock");
if(clockEl){
  const sign=document.createElement("div");
  sign.className="sbb"; sign.id="sbbSign"; sign.hidden=true; sign.setAttribute("role","dialog"); sign.setAttribute("aria-label","Clock and calendar");
  sign.innerHTML=`<div class="sbb-bar"></div>
    <div class="sbb-head"><span class="sbb-logo">SBB CFF FFS</span><span class="sbb-place" id="sbbPlace">Pacific Time</span><button type="button" class="sbb-x" aria-label="Close clock and calendar">×</button></div>
    <div class="sbb-time" id="sbbTime">--:--:--</div>
    <div class="sbb-date" id="sbbDate"></div>
    <div class="sbb-cal"><div class="sbb-cal-t" id="sbbCalT"></div><div id="sbbCalGrid"></div></div>`;
  document.body.appendChild(sign);
  const timeEl=$("#sbbTime",sign), dateEl=$("#sbbDate",sign), calT=$("#sbbCalT",sign), calG=$("#sbbCalGrid",sign), placeEl=$("#sbbPlace",sign);
  const loc=()=>mode==="quebec"?"fr-CA":mode==="canada"?"en-CA":"en-US";
  let timer=null;
  function draw(){
    const now=new Date(), L=loc();
    timeEl.textContent=new Intl.DateTimeFormat(L,{hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false,timeZone:"America/Los_Angeles"}).format(now);
    dateEl.textContent=new Intl.DateTimeFormat(L,{weekday:"long",day:"numeric",month:"long",year:"numeric",timeZone:"America/Los_Angeles"}).format(now);
    placeEl.textContent=L==="fr-CA"?"Heure du Pacifique":"Pacific Time";
    /* month grid for the current Pacific month; today highlighted */
    const parts=Object.fromEntries(new Intl.DateTimeFormat("en-US",{year:"numeric",month:"numeric",day:"numeric",timeZone:"America/Los_Angeles"}).formatToParts(now).map(x=>[x.type,x.value]));
    const y=+parts.year, mo=+parts.month-1, today=+parts.day;
    calT.textContent=new Intl.DateTimeFormat(L,{month:"long",year:"numeric",timeZone:"America/Los_Angeles"}).format(now);
    const first=new Date(Date.UTC(y,mo,1)), startDay=(first.getUTCDay()+6)%7; /* Monday first */
    const days=new Date(Date.UTC(y,mo+1,0)).getUTCDate(), prevDays=new Date(Date.UTC(y,mo,0)).getUTCDate();
    const wd=[...Array(7)].map((_,i)=>new Intl.DateTimeFormat(L,{weekday:"narrow",timeZone:"UTC"}).format(new Date(Date.UTC(2024,0,1+i))));
    let cells=[];
    for(let i=startDay-1;i>=0;i--)cells.push(`<td class="dim">${prevDays-i}</td>`);
    for(let d=1;d<=days;d++)cells.push(d===today?`<td class="today">${d}</td>`:`<td>${d}</td>`);
    const trail=(7-cells.length%7)%7;
    for(let d=1;d<=trail;d++)cells.push(`<td class="dim">${d}</td>`);
    let rows=""; for(let i=0;i<cells.length;i+=7)rows+=`<tr>${cells.slice(i,i+7).join("")}</tr>`;
    calG.innerHTML=`<table><thead><tr>${wd.map(d=>`<th>${d}</th>`).join("")}</tr></thead><tbody>${rows}</tbody></table>`;
  }
  function place(){
    const r=clockEl.getBoundingClientRect(), w=sign.offsetWidth||344;
    let x=Math.min(Math.max(8,r.right-w),innerWidth-w-8), y=r.bottom+12;
    if(y+sign.offsetHeight>innerHeight-8)y=Math.max(8,r.top-sign.offsetHeight-12);
    sign.style.left=x+"px"; sign.style.top=y+"px";
  }
  function toggle(open){
    sign.hidden=!open; sign.classList.toggle("open",open);
    clockEl.setAttribute("aria-expanded",String(open));
    if(open){draw();place();timer=setInterval(draw,1000)}else if(timer){clearInterval(timer);timer=null}
  }
  clockEl.addEventListener("click",()=>toggle(sign.hidden));
  if(clockEl.tagName==="SPAN"){
    clockEl.setAttribute("role","button"); clockEl.tabIndex=0;
    clockEl.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();toggle(sign.hidden)}});
  }
  $(".sbb-x",sign).addEventListener("click",()=>toggle(false));
  document.addEventListener("click",e=>{if(!sign.hidden&&!e.target.closest(".sbb")&&!clockEl.contains(e.target))toggle(false)});
  document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!sign.hidden)toggle(false)});
  addEventListener("resize",()=>{if(!sign.hidden)place()});
}

/* ================= fleur-de-lis layer + init ================= */
const fl=document.createElement("div");
fl.className="fleur-layer"; fl.setAttribute("aria-hidden","true");
document.body.appendChild(fl);

applyMode(mode);
/* other scripts (start.js, home.js) set some strings during their own init,
   which runs after this file; re-apply once the DOM is ready so the mode
   wins on first paint too. */
addEventListener("DOMContentLoaded",()=>applyMode(mode));
})();
