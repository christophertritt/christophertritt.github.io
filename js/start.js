/* Start page: Google search box, SBB clock, Tacoma weather chip, and a feed reader over feeds/items.json. */
(()=>{
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
const store={get(k,d){try{const v=localStorage.getItem("start-"+k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem("start-"+k,JSON.stringify(v))}catch(e){}}};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

/* greeting by time of day */
const hr=+new Intl.DateTimeFormat("en-US",{hour:"numeric",hour12:false,timeZone:"America/Los_Angeles"}).format(new Date())%24;
$("#hello").textContent=(hr<5?"Up late":hr<12?"Good morning":hr<17?"Good afternoon":"Good evening")+", Christopher";

/* the eye follows the pointer and blinks */
const eye=$("#eye"), iris=$("#iris");
addEventListener("pointermove",e=>{const r=eye.getBoundingClientRect(),dx=e.clientX-r.left-r.width/2,dy=e.clientY-r.top-r.height/2,d=Math.hypot(dx,dy)||1,m=Math.min(r.width*.22,d/18);
  iris.style.transform=`translate(${(dx/d*m).toFixed(1)}px,${(dy/d*m).toFixed(1)}px)`},{passive:true});
(function blink(){setTimeout(()=>{eye.classList.add("blink");setTimeout(()=>eye.classList.remove("blink"),150);blink()},2600+Math.random()*4200)})();

/* SBB clock: second hand sweeps in 58.5 s and waits at 12 */
const ticks=$("#ticks");ticks.innerHTML=Array.from({length:60},(_,i)=>i%5?`<rect x="49.4" y="6" width="1.2" height="3.6" transform="rotate(${i*6} 50 50)"/>`:`<rect x="48.2" y="6" width="3.6" height="11" transform="rotate(${i*6} 50 50)"/>`).join("");
const fmt=new Intl.DateTimeFormat("en-US",{hour:"numeric",minute:"numeric",second:"numeric",hour12:false,timeZone:"America/Los_Angeles"});
const hh=$("#hh"),mh=$("#mh"),sh=$("#sh"),clock=$("#clock");
[hh,mh,sh].forEach(g=>{g.style.transformOrigin="50px 50px";g.style.transformBox="view-box"});
function tick(){const now=new Date(),p=Object.fromEntries(fmt.formatToParts(now).map(x=>[x.type,x.value]));const h=+p.hour%24,m=+p.minute,s=+p.second+now.getMilliseconds()/1000;
  sh.style.transform=`rotate(${Math.min(s/58.5,1)*360}deg)`;mh.style.transform=`rotate(${(h*60+m)*6}deg)`;hh.style.transform=`rotate(${(h+m/60)*30}deg)`;
  clock.setAttribute("aria-label",`${(h%12)||12}:${String(m).padStart(2,"0")} ${h<12?"AM":"PM"} Pacific`)}
(function loop(){tick();setTimeout(()=>requestAnimationFrame(loop),reduce?1000:60)})();

/* Tacoma weather chip */
(async()=>{try{
  const r=await fetch("https://api.open-meteo.com/v1/forecast?latitude=47.2529&longitude=-122.4443&current=temperature_2m,weather_code,is_day&temperature_unit=fahrenheit");
  const c=(await r.json()).current, code=c.weather_code;
  const icon=code<=1?(c.is_day?"☀️":"🌙"):code===2?"⛅":code===3?"☁️":code<=48?"🌫️":code>=95?"⛈️":(code>=71&&code<=86&&code!==80&&code!==81&&code!==82)?"❄️":"🌧️";
  $("#wxChip").textContent=`${icon} Tacoma ${Math.round(c.temperature_2m)}°`;
}catch(e){$("#wxChip").textContent="Tacoma forecast"}})();

/* ---------- Google search ---------- */
const form=$("#search"), q=$("#q"), tbm=$("#tbm");
let mode=store.get("mode","web");
const modeBtns=$$(".modes [data-mode]");
function setMode(m){mode=m;store.set("mode",m);modeBtns.forEach(b=>b.setAttribute("aria-checked",String(b.dataset.mode===m)));
  q.placeholder={web:"Search Google",news:"Search Google News",images:"Search Google Images",scholar:"Search Google Scholar",maps:"Search Google Maps",mrsc:"Search MRSC with Google"}[m]}
modeBtns.forEach(b=>b.addEventListener("click",()=>{setMode(b.dataset.mode);q.focus()}));
/* arrow keys move between modes, like a real radio group */
$(".modes").addEventListener("keydown",e=>{if(!/Arrow(Left|Right)/.test(e.key))return;const i=modeBtns.findIndex(b=>b.dataset.mode===mode),n=modeBtns[(i+(e.key==="ArrowRight"?1:-1)+modeBtns.length)%modeBtns.length];setMode(n.dataset.mode);n.focus()});
setMode(mode);
form.addEventListener("submit",e=>{
  const v=q.value.trim(); if(!v){e.preventDefault();q.focus();return}
  if(mode==="web"||mode==="news"||mode==="images"){tbm.disabled=mode==="web";tbm.value=mode==="news"?"nws":"isch";return}
  e.preventDefault();
  const url=mode==="scholar"?"https://scholar.google.com/scholar?q="+encodeURIComponent(v)
    :mode==="maps"?"https://www.google.com/maps/search/"+encodeURIComponent(v)
    :"https://www.google.com/search?q="+encodeURIComponent("site:mrsc.org "+v);
  location.href=url;
});
addEventListener("keydown",e=>{if(e.key==="/"&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)&&!e.metaKey&&!e.ctrlKey){e.preventDefault();q.focus();q.select()}});

/* ---------- feed reader ---------- */
let data={feeds:[],items:[]}, view=store.get("view","all"), cur=-1, shown=[];
let read=new Set(store.get("read",[])), starred=new Map(store.get("starred",[]));
const saveRead=()=>{store.set("read",[...read].slice(-3000))}, saveStar=()=>store.set("starred",[...starred]);
const feedsById=()=>Object.fromEntries(data.feeds.map(f=>[f.id,f]));
const ago=iso=>{const s=(Date.now()-new Date(iso))/1000;if(s<60)return"just now";if(s<3600)return Math.round(s/60)+" min ago";if(s<86400)return Math.round(s/3600)+" h ago";if(s<86400*7)return Math.round(s/86400)+" d ago";
  return new Date(iso).toLocaleDateString("en-US",{month:"short",day:"numeric"})};
const filterEl=$("#filter"), unreadEl=$("#unreadOnly");
unreadEl.checked=store.get("unreadOnly",false);

function pool(){const all=[...data.items];
  /* starred items stay even after they drop out of the feeds */
  starred.forEach((it,id)=>{if(!all.some(x=>x.id===id))all.push(it)});
  return all.sort((a,b)=>b.date.localeCompare(a.date))}
function renderFeeds(){
  const all=pool(), un=f=>all.filter(i=>(!f||i.feed===f)&&!read.has(i.id)).length;
  const rows=[["all","All feeds","#3d93dc",un()],["starred","Starred","#febc2e",starred.size],"sep",...data.feeds.map(f=>[f.id,f.name,f.color,un(f.id),f.ok===false?f.error:""])];
  $("#feedlist").innerHTML=rows.map(r=>r==="sep"?'<li class="sep" role="presentation"></li>':
    `<li class="${r[4]?"bad":""}"><button type="button" data-view="${esc(r[0])}" aria-current="${view===r[0]}" style="--c:${esc(r[2])}"${r[4]?` title="Couldn't refresh: ${esc(r[4])}"`:""}><span class="dot"></span><span class="nm">${esc(r[1])}</span>${r[3]?`<span class="ct">${r[3]}</span>`:""}</button></li>`).join("");
}
function renderItems(keepCur){
  const F=feedsById(), term=filterEl.value.trim().toLowerCase(), words=term.split(/\s+/).filter(Boolean);
  shown=pool().filter(i=>view==="all"||(view==="starred"?starred.has(i.id):i.feed===view))
    .filter(i=>!unreadEl.checked||!read.has(i.id)||(keepCur&&shown.some(s=>s.id===i.id&&s===shown[cur])))
    .filter(i=>!words.length||words.every(w=>(i.title+" "+i.summary+" "+(F[i.feed]?.name||"")).toLowerCase().includes(w)));
  const hl=s=>{let out=esc(s);words.forEach(w=>{out=out.replace(new RegExp("("+w.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+")","gi"),"<mark>$1</mark>")});return out};
  $("#streamTitle").textContent=view==="all"?"All feeds":view==="starred"?"Starred":(F[view]?.name||"Feed");
  $("#items").innerHTML=shown.slice(0,200).map((i,n)=>{const f=F[i.feed]||{name:i.feed,color:"#3d93dc"};const isRead=read.has(i.id), isStar=starred.has(i.id);
    return `<li class="item${isRead?" read":""}${n===cur?" cur":""}" data-i="${n}">
      <div><p class="imeta"><span class="dot" style="--c:${esc(f.color)}"></span>${esc(f.name)} · <time datetime="${esc(i.date)}">${ago(i.date)}</time></p>
      <h3 class="ititle"><a href="${esc(i.link)}" target="_blank" rel="noopener" data-open="${n}">${hl(i.title)}</a></h3>
      ${i.summary?`<p class="isum">${hl(i.summary)}</p>`:""}</div>
      <div class="iside">${i.image?`<img class="thumb" src="${esc(i.image)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">`:""}
      <span class="iacts"><button type="button" class="star" data-star="${n}" aria-pressed="${isStar}" aria-label="${isStar?"Unstar":"Star"}: ${esc(i.title)}">★</button>
      <button type="button" class="readbtn" data-read="${n}" aria-pressed="${isRead}" aria-label="Mark ${isRead?"unread":"read"}: ${esc(i.title)}">✓</button></span></div></li>`}).join("");
  $("#empty").hidden=shown.length>0;
}
const renderAll=keep=>{renderFeeds();renderItems(keep)};
function markRead(i,on=true){if(!i)return;on?read.add(i.id):read.delete(i.id);saveRead()}
function toggleStar(i){if(!i)return;starred.has(i.id)?starred.delete(i.id):starred.set(i.id,i);saveStar()}

$("#feedlist").addEventListener("click",e=>{const b=e.target.closest("[data-view]");if(!b)return;view=b.dataset.view;store.set("view",view);cur=-1;renderAll();$("#items").scrollIntoView({block:"nearest",behavior:reduce?"auto":"smooth"})});
$("#items").addEventListener("click",e=>{
  const o=e.target.closest("[data-open]"),s=e.target.closest("[data-star]"),r=e.target.closest("[data-read]");
  if(o){cur=+o.dataset.open;markRead(shown[cur]);setTimeout(()=>renderAll(true),0)}
  if(s){toggleStar(shown[+s.dataset.star]);renderAll(true)}
  if(r){const i=shown[+r.dataset.read];markRead(i,!read.has(i.id));renderAll(true)}
});
filterEl.addEventListener("input",()=>{cur=-1;renderItems()});
unreadEl.addEventListener("change",()=>{store.set("unreadOnly",unreadEl.checked);cur=-1;renderItems()});
$("#markAll").addEventListener("click",()=>{shown.forEach(i=>read.add(i.id));saveRead();renderAll()});

/* Google Reader keys */
function focusCur(){const el=$(`.item[data-i="${cur}"]`);$$(".item.cur").forEach(x=>x.classList.remove("cur"));if(el){el.classList.add("cur");el.scrollIntoView({block:"nearest",behavior:reduce?"auto":"smooth"})}}
addEventListener("keydown",e=>{
  if(/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)||e.metaKey||e.ctrlKey||e.altKey)return;
  const n=Math.min(shown.length,200);if(!n)return;
  if(e.key==="j"){cur=Math.min(n-1,cur+1);markRead(shown[cur]);renderAll(true);focusCur()}
  else if(e.key==="k"){cur=Math.max(0,cur-1);renderAll(true);focusCur()}
  else if(e.key==="o"&&shown[cur]){markRead(shown[cur]);window.open(shown[cur].link,"_blank","noopener");renderAll(true);focusCur()}
  else if(e.key==="s"&&shown[cur]){toggleStar(shown[cur]);renderAll(true);focusCur()}
  else if(e.key==="m"&&shown[cur]){markRead(shown[cur],!read.has(shown[cur].id));renderAll(true);focusCur()}
});

async function load(){
  $("#updated").textContent="Loading feeds…";
  try{
    const r=await fetch("/feeds/items.json?t="+Math.floor(Date.now()/300000),{cache:"no-cache"});
    if(!r.ok)throw new Error("HTTP "+r.status);
    data=await r.json();
    if(view!=="all"&&view!=="starred"&&!data.feeds.some(f=>f.id===view))view="all";
    const bad=data.feeds.filter(f=>f.ok===false).length;
    $("#updated").textContent=`Updated ${ago(data.updated)}${bad?` · ${bad} feed${bad>1?"s":""} couldn't refresh`:""}.`;
    /* forget read marks for items that have aged out */
    const live=new Set(data.items.map(i=>i.id));read=new Set([...read].filter(id=>live.has(id)));saveRead();
    renderAll();
  }catch(e){$("#updated").textContent="Couldn't load feeds. Try ↻ in a minute.";console.warn(e)}
}
$("#refresh").addEventListener("click",load);
load();
setInterval(()=>{if(!document.hidden)load()},15*60*1000);
})();
