/* Start page and reader: the Christophergle search, the weather orbs, and a feed reader over feeds/items.json (plus the unread badge on the Feeds icon). */
(()=>{
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
const store={get(k,d){try{const v=localStorage.getItem("start-"+k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem("start-"+k,JSON.stringify(v))}catch(e){}}};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

/* weather orbs in the search window: weather.js has the data, select the big one for details */
const orb=id=>$("#"+id);
function renderOrbs(){
  const s=window.Weather?.summary?.(); if(!s||!orb("wxoTemp"))return;
  orb("wxoIc").innerHTML=s.icon; orb("wxoTemp").textContent=s.temp+"°"; orb("wxoCond").textContent=s.cond;
  orb("wxoFeels").textContent=s.feels+"°"; orb("wxoWind").textContent=s.wind; orb("wxoWindU").textContent=s.windUnit;
  orb("wxoPlace").textContent=s.city; orb("wxoAqi").textContent=s.aqi??"—";
}
document.addEventListener("weather:update",renderOrbs);renderOrbs();
document.addEventListener("weather:error",()=>{if(orb("wxoCond")&&!window.Weather?.summary?.()){orb("wxoTemp").textContent="?";orb("wxoCond").textContent="weather's napping"}});
orb("wxoMain")?.addEventListener("click",e=>window.Weather?.openPanel(e.currentTarget));

/* ---------- search ---------- */
const form=$("#search"), q=$("#q"), tbm=$("#tbm");
if(form){
let mode=store.get("mode","web");
const modeBtns=$$(".modes [data-mode]");
function setMode(m){mode=m;store.set("mode",m);modeBtns.forEach(b=>b.setAttribute("aria-checked",String(b.dataset.mode===m)));
  q.placeholder={web:"Search the World Wide Web…",news:"Search the news…",images:"Search for pictures…",scholar:"Search Google Scholar…",maps:"Search the map…",mrsc:"Search MRSC…",m365:"Search SharePoint and your Microsoft 365 files…"}[m]||"Search the World Wide Web…";q.dataset.enPh=q.placeholder}
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
    :mode==="m365"?"https://www.microsoft365.com/search?q="+encodeURIComponent(v)
    :"https://www.google.com/search?q="+encodeURIComponent("site:mrsc.org "+v);
  location.href=url;
});
addEventListener("keydown",e=>{if(e.key==="/"&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)&&!e.metaKey&&!e.ctrlKey){e.preventDefault();q.focus();q.select()}});
}

/* ---------- feed reader (on /reader/) and the unread badge (on the desktop) ---------- */
const isReader=!!$("#feedlist");
let data={feeds:[],items:[]}, view=store.get("view","all"), cur=-1, shown=[];
let read=new Set(store.get("read",[])), starred=new Map(store.get("starred",[]));
const saveRead=()=>{store.set("read",[...read].slice(-3000))}, saveStar=()=>store.set("starred",[...starred]);
const feedsById=()=>Object.fromEntries(data.feeds.map(f=>[f.id,f]));
const ago=iso=>{const s=(Date.now()-new Date(iso))/1000;if(s<60)return"just now";if(s<3600)return Math.round(s/60)+" min ago";if(s<86400)return Math.round(s/3600)+" h ago";if(s<86400*7)return Math.round(s/86400)+" d ago";
  return new Date(iso).toLocaleDateString("en-US",{month:"short",day:"numeric"})};
const filterEl=$("#filter"), unreadEl=$("#unreadOnly");
if(unreadEl)unreadEl.checked=store.get("unreadOnly",false);

function pool(){const all=[...data.items];
  /* starred items stay even after they drop out of the feeds */
  starred.forEach((it,id)=>{if(!all.some(x=>x.id===id))all.push(it)});
  return all.sort((a,b)=>b.date.localeCompare(a.date))}
function renderFeeds(){
  const all=pool(), un=f=>all.filter(i=>(!f||i.feed===f)&&!read.has(i.id)).length;
  const rows=[["all","All feeds","#3d93dc",un()],["starred","Starred","#febc2e",starred.size],"sep",...data.feeds.map(f=>[f.id,f.name,f.color,un(f.id),f.ok===false?f.error:""])];
  $("#feedlist").innerHTML=rows.map(r=>r==="sep"?'<li class="sep" aria-hidden="true"></li>':
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

if(isReader){
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

}
async function load(){
  if(isReader)$("#updated").textContent="Loading feeds…";
  try{
    const r=await fetch("/feeds/items.json?t="+Math.floor(Date.now()/300000),{cache:"no-cache"});
    if(!r.ok)throw new Error("HTTP "+r.status);
    data=await r.json();
    if(view!=="all"&&view!=="starred"&&!data.feeds.some(f=>f.id===view))view="all";
    if(!isReader){const live=new Set(data.items.map(i=>i.id)), n=data.items.filter(i=>!read.has(i.id)).length, b=$("#feedBadge");
      /* the count is read as part of the link text, so the accessible name matches what is on screen */
      if(b){b.hidden=!n;b.innerHTML=`${n>99?"99+":n}<span class="vh"> unread</span>`}return}
    const bad=data.feeds.filter(f=>f.ok===false).length, sub=$("#readerSub");
    if(sub)sub.textContent=`${data.items.length} stories from ${data.feeds.filter(f=>f.ok!==false).length} feeds`;
    $("#updated").textContent=`Updated ${ago(data.updated)}${bad?` · ${bad} feed${bad>1?"s":""} couldn't refresh`:""}.`;
    /* forget read marks for items that have aged out */
    const live=new Set(data.items.map(i=>i.id));read=new Set([...read].filter(id=>live.has(id)));saveRead();
    renderAll();
  }catch(e){if(isReader)$("#updated").textContent="Couldn't load feeds. Try ↻ in a minute.";console.warn(e)}
}
if(isReader)$("#refresh").addEventListener("click",load);
if(isReader||$("#feedBadge")){if(isReader)load();else (window.requestIdleCallback||setTimeout)(load)}
setInterval(()=>{if(!document.hidden&&(isReader||$("#feedBadge")))load()},15*60*1000);

})();
