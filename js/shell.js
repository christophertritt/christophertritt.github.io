/* shell.js: everything the shared shell does, on every page.
   The eye (Hieye) and his poke sequence, Hieye's balloon, the menu, the SBB
   clock and its platform sign, the themed weather chip, Quiet mode, the
   hidden Canada and Quebec modes (Canadian spelling, Celsius, French), and
   the credits window. Page scripts talk to it through window.Shell. */
(()=>{
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const ls={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:v}catch(e){return d}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
const reduceMQ=matchMedia("(prefers-reduced-motion: reduce)");
const calm=()=>reduceMQ.matches||document.body.classList.contains("quiet-mode");
const TZ="America/Los_Angeles";

/* ================= Quiet ================= */
const quietBtn=$("#quiet");
function setQuiet(on){
  document.body.classList.toggle("quiet-mode",on);
  if(quietBtn){quietBtn.setAttribute("aria-pressed",String(on));quietBtn.textContent=on?"Quiet on":"Quiet"}
  ls.set("ct-quiet",on?"on":"off");
}
setQuiet(ls.get("ct-quiet",reduceMQ.matches?"on":"off")==="on");
quietBtn?.addEventListener("click",()=>setQuiet(!document.body.classList.contains("quiet-mode")));

/* ================= Hieye's balloon ================= */
const wp=$("#wp"), wpLine=$("#wpLine"), wpActs=$("#wpActs");
const eye=$("#eye"), iris=$("#iris");
let wpT=0;
function placeBalloon(){
  if(!wp||wp.hidden||!eye)return;
  const r=eye.getBoundingClientRect(), w=wp.offsetWidth||300;
  wp.style.left=Math.max(8,Math.min(innerWidth-w-8,r.left+r.width*.3))+"px";
  wp.style.top=Math.max(8,r.bottom+14)+"px";
}
function say(line,{actions=[],ms=actions.length?0:5200}={}){
  if(!wp)return;
  clearTimeout(wpT);
  wpLine.textContent=line;
  wpActs.innerHTML="";
  actions.forEach(a=>{const b=document.createElement("button");b.type="button";b.className="jelly sm"+(a.clear?" clear":"");b.textContent=a.label;
    b.addEventListener("click",()=>{hush();a.run&&a.run()});wpActs.appendChild(b)});
  wp.hidden=false;placeBalloon();
  wp.classList.remove("out","in");void wp.offsetWidth;wp.classList.add("in");
  if(ms)wpT=setTimeout(hush,ms);
  if(actions.length)wpActs.firstChild.focus({preventScroll:true});
}
function hush(){
  if(!wp||wp.hidden)return;clearTimeout(wpT);
  if(calm()){wp.hidden=true;return}
  wp.classList.add("out");setTimeout(()=>{wp.hidden=true;wp.classList.remove("out")},300);
}
$("#wpX")?.addEventListener("click",hush);
addEventListener("resize",placeBalloon);addEventListener("scroll",placeBalloon,{passive:true});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&wp&&!wp.hidden)hush()});

/* ================= the eye ================= */
let lastLook=0, popped=false;
function aim(dx,dy,ease){if(!iris)return;iris.style.transition=ease?"transform .45s cubic-bezier(.3,1.4,.5,1)":"transform .09s linear";iris.style.transform=`translate(${dx.toFixed(1)}px,${dy.toFixed(1)}px)`}
function look(x,y){
  if(!eye||popped)return;
  const r=eye.getBoundingClientRect(),dx=x-r.left-r.width/2,dy=y-r.top-r.height/2,d=Math.hypot(dx,dy)||1,m=Math.min(r.width*.2,d/18);
  aim(dx/d*m,dy/d*m,false);lastLook=Date.now();
}
function blink(n=1){if(!eye)return;eye.classList.add("blink");setTimeout(()=>{eye.classList.remove("blink");if(n>1)setTimeout(()=>blink(n-1),140)},140)}
if(eye){
  addEventListener("pointermove",e=>look(e.clientX,e.clientY),{passive:true});
  setInterval(()=>{if(Date.now()-lastLook>3000&&!popped){const a=Math.random()*Math.PI*2,m=Math.random()*eye.offsetWidth*.18;aim(Math.cos(a)*m,Math.sin(a)*m,true)}},1900);
  (function idle(){setTimeout(()=>{if(!popped)blink(Math.random()<.2?2:1);idle()},2600+Math.random()*4200)})();
  document.addEventListener("pointerover",e=>eye.classList.toggle("curious",!!e.target.closest("a,button")));
}

/* poke sequence: pokes within 2 s of each other count up.
   1-2 blink and flinch, 3-4 startled and protesting, 5 pops him off the
   taskbar; he bounces across the page and rolls home. Quiet: only blinks. */
const pokeLines=["Hey. Easy.","That's my eye!","Okay, I see you.","One more and I'm out of here."];
let pokes=0, pokeT=0;
function poke(){
  if(!eye||popped)return;
  clearTimeout(pokeT);pokeT=setTimeout(()=>pokes=0,2000);pokes++;
  if(calm()){blink(2);return}
  if(pokes<=2){eye.classList.add("flinch");blink();setTimeout(()=>eye.classList.remove("flinch"),180);return}
  if(pokes<=4){eye.classList.remove("shake");void eye.offsetWidth;eye.classList.add("shake","startled");
    say(pokeLines[pokes-3]+(pokes===4?" Seriously.":""),{ms:2200});setTimeout(()=>eye.classList.remove("startled"),900);return}
  pokes=0;popOff();
}
function popOff(){
  popped=true;hush();
  const r=eye.getBoundingClientRect();
  const fly=eye.cloneNode(true);fly.removeAttribute("id");fly.querySelector("#iris")?.removeAttribute("id");
  fly.classList.add("eye-fly");fly.setAttribute("aria-hidden","true");fly.tabIndex=-1;
  Object.assign(fly.style,{left:r.left+"px",top:r.top+"px",width:r.width+"px",height:r.height+"px"});
  document.body.appendChild(fly);eye.classList.add("gone");
  const W=innerWidth,H=innerHeight,s=r.width, floor=H-s-12;
  /* up and out, then three bounces along the bottom of the window, then a roll home */
  const x0=0,y0=0,peakX=Math.min(W*.45,520)-r.left,peakY=-r.top+20,b1=W*.6-r.left,b2=W*.75-r.left,b3=W*.86-r.left;
  const fy=floor-r.top;
  const k=[
    {transform:`translate(${x0}px,${y0}px) rotate(0)`,offset:0,easing:"cubic-bezier(.2,.8,.4,1)"},
    {transform:`translate(${peakX}px,${Math.min(peakY,-60)}px) rotate(220deg)`,offset:.22,easing:"cubic-bezier(.6,0,1,.6)"},
    {transform:`translate(${b1}px,${fy}px) rotate(400deg) scale(1.08,.86)`,offset:.42,easing:"cubic-bezier(.2,.8,.4,1)"},
    {transform:`translate(${(b1+b2)/2}px,${fy-H*.22}px) rotate(520deg)`,offset:.52,easing:"cubic-bezier(.6,0,1,.6)"},
    {transform:`translate(${b2}px,${fy}px) rotate(620deg) scale(1.06,.9)`,offset:.62,easing:"cubic-bezier(.2,.8,.4,1)"},
    {transform:`translate(${(b2+b3)/2}px,${fy-H*.09}px) rotate(700deg)`,offset:.69,easing:"cubic-bezier(.6,0,1,.6)"},
    {transform:`translate(${b3}px,${fy}px) rotate(760deg)`,offset:.75,easing:"ease-in-out"},
    {transform:`translate(${x0}px,${y0}px) rotate(0deg)`,offset:1}
  ];
  fly.animate(k,{duration:4200,fill:"forwards"}).onfinish=()=>{
    fly.remove();eye.classList.remove("gone");popped=false;blink(2);
    say("Whew. Back in my socket. Let's keep the poking to a minimum.",{ms:3600});
  };
}
eye?.addEventListener("click",poke);

/* ================= menu ================= */
const menu=$("#menu"), menuBtns=$$('[aria-controls="menu"]');
let menuFrom=null;
function placeMenu(btn){
  if(!menu||!btn)return;
  const bar=$("#taskbar").getBoundingClientRect(), b=btn.getBoundingClientRect(), wrap=menu.offsetParent?.getBoundingClientRect()||{left:0};
  menu.style.top=(bar.bottom-wrap.top+10)+"px";
  if(innerWidth>620){menu.style.right="auto";menu.style.left=Math.max(0,Math.min(b.right-260,innerWidth-276)-wrap.left)+"px"}
  else{menu.style.left="";menu.style.right=""}
}
function setMenu(open,btn){
  if(!menu)return;
  menu.hidden=!open;menuBtns.forEach(b=>b.setAttribute("aria-expanded",String(open&&b===btn)));
  if(open){menuFrom=btn;placeMenu(btn);menu.querySelector("a,button")?.focus({preventScroll:true})}
}
menuBtns.forEach(b=>b.addEventListener("click",e=>{e.stopPropagation();setMenu(menu.hidden,b)}));
document.addEventListener("click",e=>{if(menu&&!menu.hidden&&!e.target.closest("#menu"))setMenu(false)});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&menu&&!menu.hidden){setMenu(false);menuFrom?.focus()}});
menu?.addEventListener("click",e=>{if(e.target.closest("a,button"))setMenu(false)});
addEventListener("resize",()=>{if(menu&&!menu.hidden)placeMenu(menuFrom)});
/* tour and kiosk entries: run here when the page supports them, else go to the overview */
document.addEventListener("click",e=>{
  const t=e.target.closest("[data-tour]");
  if(t){e.preventDefault();if(window.Shell.startTour)window.Shell.startTour();else location.href="/portfolio/#tour";return}
  const p=e.target.closest("[data-palette]");
  if(p){e.preventDefault();if(window.Shell.openPalette)window.Shell.openPalette();else location.href="/portfolio/#kiosk"}
});

/* ================= dialogs: credits and the close buttons ================= */
const credits=$("#credits");
function openDlg(d){if(d&&!d.open)d.showModal()}
document.addEventListener("click",e=>{
  if(e.target.closest("[data-credits]")){e.preventDefault();openDlg(credits);return}
  const x=e.target.closest("dialog [data-close]");if(x){x.closest("dialog").close();return}
  if(e.target.tagName==="DIALOG")e.target.close();
});
if(location.hash==="#credits")openDlg(credits);

/* ================= SBB clock and platform sign ================= */
const clock=$("#clock"), sign=$("#sbbSign");
const hh=clock?.querySelector(".hh"), mh=clock?.querySelector(".mh"), sh=clock?.querySelector(".sh");
const partsFmt=new Intl.DateTimeFormat("en-US",{year:"numeric",month:"numeric",day:"numeric",hour:"numeric",minute:"numeric",second:"numeric",hour12:false,timeZone:TZ});
const nowParts=(d=new Date())=>{const p=Object.fromEntries(partsFmt.formatToParts(d).map(x=>[x.type,x.value]));return {y:+p.year,mo:+p.month,d:+p.day,h:(+p.hour)%24,m:+p.minute,s:+p.second}};
let lastMin=-1;
function tick(){
  if(!clock)return;
  const now=new Date(), p=nowParts(now), sec=p.s+now.getMilliseconds()/1000;
  sh.style.transform=`rotate(${Math.min(sec/58.5,1)*360}deg)`;
  if(p.m!==lastMin){
    if(lastMin>=0&&!calm()){mh.classList.add("jump");setTimeout(()=>mh.classList.remove("jump"),300)}
    lastMin=p.m;
    mh.style.transform=`rotate(${p.m*6}deg)`;hh.style.transform=`rotate(${(p.h%12+p.m/60)*30}deg)`;
    clock.setAttribute("aria-label",`${(p.h%12)||12}:${String(p.m).padStart(2,"0")} ${p.h<12?"AM":"PM"} Pacific. Shows the platform sign.`);
    if(sign&&!sign.hidden)drawSign();
  }
}
if(clock){tick();(function loop(){tick();setTimeout(()=>requestAnimationFrame(loop),calm()?1000:60)})()}

/* sunrise and sunset for Tacoma (NOAA's simple solar equations), as Pacific clock times */
function sunTimes(date,lat=47.2529,lon=-122.4443){
  const rad=Math.PI/180, start=Date.UTC(date.getUTCFullYear(),0,0), n=Math.floor((date-start)/864e5);
  const g=2*Math.PI/365*(n-1);
  const eqt=229.18*(.000075+.001868*Math.cos(g)-.032077*Math.sin(g)-.014615*Math.cos(2*g)-.040849*Math.sin(2*g));
  const decl=.006918-.399912*Math.cos(g)+.070257*Math.sin(g)-.006758*Math.cos(2*g)+.000907*Math.sin(2*g)-.002697*Math.cos(3*g)+.00148*Math.sin(3*g);
  const ha=Math.acos(Math.cos(90.833*rad)/(Math.cos(lat*rad)*Math.cos(decl))-Math.tan(lat*rad)*Math.tan(decl))/rad;
  const mid=Date.UTC(date.getUTCFullYear(),date.getUTCMonth(),date.getUTCDate());
  const at=min=>new Date(mid+min*60000);
  return [at(720-4*(lon+ha)-eqt),at(720-4*(lon-ha)-eqt)];
}
function isoWeek(y,mo,d){const t=new Date(Date.UTC(y,mo-1,d));const day=(t.getUTCDay()+6)%7;t.setUTCDate(t.getUTCDate()-day+3);const f=new Date(Date.UTC(t.getUTCFullYear(),0,4));return 1+Math.round(((t-f)/864e5-3+((f.getUTCDay()+6)%7))/7)}
function loc(){const m=document.documentElement.dataset.mode;return m==="quebec"?"fr-CA":m==="canada"?"en-CA":"en-US"}
function drawSign(){
  if(!sign)return;
  const now=new Date(), p=nowParts(now), L=loc(), fr=L==="fr-CA";
  const t=new Intl.DateTimeFormat(L,{hour:"2-digit",minute:"2-digit",hour12:false,timeZone:TZ}).format(now);
  const zone=new Intl.DateTimeFormat("en-US",{timeZone:TZ,timeZoneName:"short"}).formatToParts(now).find(x=>x.type==="timeZoneName")?.value||"PT";
  const date=new Intl.DateTimeFormat(L,{weekday:"long",day:"numeric",month:"long",timeZone:TZ}).format(now);
  const [rise,set]=sunTimes(now), hm=d=>new Intl.DateTimeFormat(L,{hour:"2-digit",minute:"2-digit",hour12:false,timeZone:TZ}).format(d);
  const wk=isoWeek(p.y,p.mo,p.d);
  const today=(new Date(Date.UTC(p.y,p.mo-1,p.d)).getUTCDay()+6)%7;
  const days=[...Array(7)].map((_,i)=>new Intl.DateTimeFormat(L,{weekday:"short",timeZone:"UTC"}).format(new Date(Date.UTC(2024,0,1+i))).replace(".","").toUpperCase());
  sign.innerHTML=`<div class="sbb-main">
      <div><div class="sbb-time">${t}</div><div class="sbb-badge">${zone}</div></div>
      <div class="sbb-dest-wrap"><div class="sbb-dest">${date[0].toUpperCase()+date.slice(1)}</div>
        <div class="sbb-via">${fr?"Semaine":"Week"} ${wk} · ${fr?"Lever":"Sunrise"} ${hm(rise)} · ${fr?"Coucher":"Sunset"} ${hm(set)}</div></div>
      <div class="sbb-pl"><small>${fr?"VOIE":"PLATFORM"}</small><b>${p.d}</b></div>
    </div>
    <ol class="sbb-cars" aria-label="${fr?"Cette semaine":"This week"}">${days.map((d,i)=>`<li class="${i>4?"we":""}${i===today?" today":""}"${i===today?' aria-current="date"':""}>${d}</li>`).join("")}</ol>`;
}
let signT=0, signPinned=false;
function placeSign(){
  const r=clock.getBoundingClientRect(), w=sign.offsetWidth||640;
  sign.style.left=Math.max(12,Math.min(r.right-w,innerWidth-w-12))+"px";
  sign.style.top=(r.bottom+14)+"px";
}
function showSign(open){
  if(!sign)return;clearTimeout(signT);
  if(open===!sign.hidden)return;
  sign.hidden=!open;clock.setAttribute("aria-expanded",String(open));
  if(open){drawSign();placeSign()}else signPinned=false;
}
if(clock&&sign){
  const hoverable=matchMedia("(hover:hover) and (pointer:fine)");
  clock.addEventListener("pointerenter",()=>{if(hoverable.matches)showSign(true)});
  clock.addEventListener("pointerleave",()=>{if(hoverable.matches&&!signPinned)signT=setTimeout(()=>showSign(false),250)});
  sign.addEventListener("pointerenter",()=>clearTimeout(signT));
  sign.addEventListener("pointerleave",()=>{if(hoverable.matches&&!signPinned)signT=setTimeout(()=>showSign(false),250)});
  clock.addEventListener("click",()=>{if(!sign.hidden&&signPinned){showSign(false);return}signPinned=true;showSign(true)});
  clock.addEventListener("focus",()=>{if(clock.matches(":focus-visible"))showSign(true)});
  clock.addEventListener("blur",()=>{if(!signPinned)showSign(false)});
  document.addEventListener("click",e=>{if(!sign.hidden&&!e.target.closest("#sbbSign,#clock"))showSign(false)});
  document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!sign.hidden){showSign(false);clock.focus()}});
  addEventListener("resize",()=>{if(!sign.hidden)placeSign()});
  addEventListener("scroll",()=>{if(!sign.hidden)placeSign()},{passive:true});
}

/* ================= hidden modes: Canada and Quebec ================= */
const FR={
  "nav.start":"Accueil","nav.portfolio":"Portfolio","nav.projects":"Projets","nav.skills":"Compétences",
  "nav.about":"À propos","nav.resume":"CV","nav.contact":"Contact","nav.reader":"Lecteur","menu.desktop":"Vue d'ensemble",
  "gle.tag":"votre porte d'entrée sur l'autoroute de l'information!","search.btn":"Chercher!","search.ph":"Chercher sur le Web…",
  "mode.web":"Web","mode.news":"Actualités","mode.images":"Images","mode.scholar":"Universitaire","mode.maps":"Cartes","mode.mrsc":"MRSC","mode.m365":"SharePoint",
  "desk.feeds":"Flux","desk.bus":"OneBusAway","desk.road":"Trafic WSDOT","desk.m365":"Applis de travail","desk.scholar":"Universitaire","desk.mrsc":"MRSC","desk.repo":"Dépôt du site",
  "gh.t":"Titres","gn.t":"Notes","gt.t":"Départs près d'ici","ga.t":"Alertes de service","fp.t":"Première page","gh.open":"Ouvrir le lecteur",
  "status.start":"Les flux se rafraîchissent à 7 h et à 17 h","status.credits":"Crédits et sources",
  "notes.ph":"Notez quelque chose!","notes.saved":"Reste dans ce navigateur","gt.here":"Ici","gt.home":"Maison","gt.work":"Travail",
  "rd.unread":"Non lus seulement","rd.markall":"Tout marquer comme lu","rd.ph":"Rechercher dans vos flux…",
  "rd.keys1":"Touches : ","rd.keys2":" suivant et précédent, ","rd.keys3":" ouvrir, ","rd.keys4":" favori, ","rd.keys5":" lu ou non lu.",
  "tb.home":"Accueil","tb.route":"Parcours","hero.view":"Voir les projets","route.h":"Le parcours jusqu'ici",
  "skills.h":"Trois sortes de travail","skills.c1":"Gestion de la demande","skills.c2":"Analyse spatiale","skills.c3":"Outils de données",
  "about.eyebrow":"À propos","about.h":"Pourquoi le transport","resume.h":"Expérience et formation","cv.exp":"Expérience","cv.edu":"Formation",
  "contact.h":"Parlons-nous! Je suis en ligne.","contact.email":"Écrivez-moi","gwx.feels":"ressenti"
};
const TITLES={"/":"Accueil","/reader/":"Lecteur","/portfolio/":"Portfolio","/portfolio/projects/":"Projets","/portfolio/skills/":"Compétences","/portfolio/about/":"À propos","/portfolio/resume/":"CV","/portfolio/contact/":"Contact"};
const enTitle=document.title;
function applyI18n(fr){
  $$("[data-i18n]").forEach(el=>{if(el.dataset.en===undefined)el.dataset.en=el.textContent;el.textContent=(fr&&FR[el.dataset.i18n])||el.dataset.en});
  $$("[data-i18n-ph]").forEach(el=>{if(el.dataset.enPh===undefined)el.dataset.enPh=el.getAttribute("placeholder")||"";el.setAttribute("placeholder",(fr&&FR[el.dataset.i18nPh])||el.dataset.enPh)});
  document.title=fr&&TITLES[location.pathname]?TITLES[location.pathname]+" · Christopher A. Tritt":enTitle;
  greet();
}
function greet(){
  const hello=$("#hello");if(!hello)return;
  const h=nowParts().h, fr=document.documentElement.dataset.mode==="quebec";
  hello.textContent=fr?(h<5?"Encore debout":h<12?"Bonjour":h<17?"Bon après-midi":"Bonsoir")+", Christopher"
                     :(h<5?"Up late":h<12?"Good morning":h<17?"Good afternoon":"Good evening")+", Christopher";
}
/* Canadian spelling, applied to text nodes and undone when the mode goes off */
const caWords={color:"colour",colors:"colours",colorful:"colourful",favorite:"favourite",neighbor:"neighbour",neighbors:"neighbours",neighborhood:"neighbourhood",
  neighborhoods:"neighbourhoods",honor:"honour",labor:"labour",behavior:"behaviour",humor:"humour",center:"centre",centers:"centres",theater:"theatre",
  meter:"metre",meters:"metres",kilometer:"kilometre",kilometers:"kilometres",modeling:"modelling",modeled:"modelled",traveled:"travelled",traveling:"travelling",
  canceled:"cancelled",labeled:"labelled",catalog:"catalogue",defense:"defence",gray:"grey"};
const caRe=new RegExp("\\b("+Object.keys(caWords).join("|")+")\\b","gi");
const caKeep=/Transit Center|Grays Harbor|Grayland/;
const caOrig=new Map();
function caCase(src,rep){return src===src.toUpperCase()&&src.length>1?rep.toUpperCase():src[0]===src[0].toUpperCase()?rep[0].toUpperCase()+rep.slice(1):rep}
function canadianize(root){
  const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.parentElement&&!n.parentElement.closest("script,style,code,pre,input,textarea,.f")&&(caRe.lastIndex=0,caRe.test(n.nodeValue))?1:2});
  const nodes=[];while(w.nextNode())nodes.push(w.currentNode);
  nodes.forEach(n=>{const v=n.nodeValue;caRe.lastIndex=0;
    const out=v.replace(caRe,(mt,_,off)=>caKeep.test(v.slice(Math.max(0,off-12),off+mt.length+8))?mt:caCase(mt,caWords[mt.toLowerCase()]));
    if(out!==v){if(!caOrig.has(n))caOrig.set(n,v);n.nodeValue=out}});
}
let caObs=null;
const modeOff=$("#modeOff");
function applyMode(m,announce){
  const html=document.documentElement, was=html.dataset.mode||"off";
  if(m==="off")delete html.dataset.mode;else html.dataset.mode=m;
  html.lang=m==="quebec"?"fr-CA":m==="canada"?"en-CA":"en";
  ls.set("ct-mode",m);ls.set("ct-canada",m==="off"?"off":"on");
  document.body.classList.toggle("canada",m!=="off");
  if(modeOff){modeOff.hidden=m==="off";modeOff.setAttribute("aria-label",m==="quebec"?"Désactiver le mode Québec":"Turn off Canada mode")}
  if(m!=="off"){canadianize(document.body);
    caObs=caObs||new MutationObserver(ms=>{caObs.disconnect();ms.forEach(x=>x.addedNodes.forEach(n=>{if(n.nodeType===1)canadianize(n);else if(n.nodeType===3&&n.parentNode)canadianize(n.parentNode)}));if(document.body.classList.contains("canada"))caObs.observe(document.body,{subtree:true,childList:true})});
    caObs.observe(document.body,{subtree:true,childList:true});
  }else{caObs?.disconnect();caOrig.forEach((v,n)=>n.nodeValue=v);caOrig.clear()}
  applyI18n(m==="quebec");
  if(sign&&!sign.hidden)drawSign();
  window.Weather?.render?.();renderChip();
  document.dispatchEvent(new CustomEvent("mode:change",{detail:{mode:m,was}}));
  if(announce&&m!==was){
    const lines={canada:"Welcome to the True North. Celsius, Canadian spelling, and a little more colour. Sorry, eh?",
                 quebec:"Bienvenue au Québec! Le site parle français maintenant.",off:"Back across the border. Fahrenheit is back."};
    say(lines[m],{ms:4200});
    if(m!=="off"&&window.confetti&&!calm())confetti({particleCount:60,spread:80,origin:{y:.2},colors:m==="quebec"?["#003da5","#ffffff"]:["#d52b1e","#ffffff"],zIndex:150,disableForReducedMotion:true});
  }
}
const mode=()=>document.documentElement.dataset.mode||"off";
modeOff?.addEventListener("click",()=>applyMode("off",true));
/* type "eh" anywhere for Canada; in Canada mode, "oui" for Quebec */
let typed="";
addEventListener("keydown",e=>{
  if(e.metaKey||e.ctrlKey||e.altKey||e.key.length!==1)return;
  if(/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName)||document.activeElement?.isContentEditable)return;
  typed=(typed+e.key.toLowerCase()).slice(-3);
  if(typed.endsWith("eh")&&mode()==="off"){typed="";applyMode("canada",true)}
  else if(typed==="oui"&&mode()==="canada"){typed="";applyMode("quebec",true)}
});
/* on a phone: tap the clock's red disc (or the clock) three times quickly */
let clockTaps=[];
clock?.addEventListener("pointerdown",e=>{if(e.pointerType==="mouse")return;const t=Date.now();clockTaps=clockTaps.filter(x=>t-x<900);clockTaps.push(t);
  if(clockTaps.length>=3){clockTaps=[];applyMode(mode()==="off"?"canada":mode()==="canada"?"quebec":"off",true)}});

/* ================= weather chip ================= */
const chip=$("#wxChip");
const kind=chip?.className.match(/wx-(\w+)/)?.[1];
const oldWords=c=>c<=1?"Fair":c<=3?"Cloudy":c<=48?"Foggy":c>=95?"Stormy":(c>=71&&c<=77)||c===85||c===86?"Snow":"Rain";
const codeOf=s=>{const c=(s.city||s.label||"").toLowerCase();return c.includes("tacoma")?"TAC":c.includes("bellevue")?"BEL":c.includes("seattle")?"SEA":(s.city||s.label||"WX").slice(0,3).toUpperCase()};
function renderChip(){
  if(!chip)return;
  const s=window.Weather?.summary?.();
  const t=chip.querySelector(".wx-t");
  if(!s){if(window.Weather?.failed){chip.dataset.state="error";t.textContent=kind==="im"?"WeatherBot is away":"Weather";chip.title="Weather is unavailable right now"}return}
  chip.dataset.state="ready";
  const place=s.city||s.label, deg=`${s.temp}°`;
  const ic=chip.querySelector(".wx-ic");
  if(kind==="solari"){t.textContent=`WX ${codeOf(s)} ${s.temp}°${s.unit}`}
  else if(kind==="terminal"){t.innerHTML=`WX ${codeOf(s)}<b>${s.temp}${s.unit}</b>`}
  else if(kind==="solar"){ic.innerHTML=s.icon;t.textContent=`${deg} and ${s.cond}`}
  else if(kind==="antique"){t.textContent=`${oldWords(s.code)} · ${deg}`}
  else if(kind==="im"){t.innerHTML=`<b>WeatherBot:</b> ${deg} in ${place}`}
  else{t.textContent=`${deg} ${place}`}
  chip.title=`${place}: ${s.temp}°${s.unit}, ${s.cond}`;
}
document.addEventListener("weather:update",renderChip);
document.addEventListener("weather:error",renderChip);

/* ================= startup ================= */
greet();
applyMode(["canada","quebec"].includes(ls.get("ct-mode","off"))?ls.get("ct-mode","off"):"off",false);

window.Shell={say,hush,blink,look,aim,applyMode,mode,openDlg,calm,setQuiet,startTour:null,openPalette:null,
  get eye(){return eye}};
})();
