/* weather.js: current conditions for every page.
   Works out where you are (Home in Tacoma, Work in Bellevue, or the city
   your network is in), fetches conditions from Open-Meteo once per place
   every 15 minutes (shared across pages), and shows °C in Canada mode.
   It draws nothing itself: the taskbar chip (shell.js) and the Start page's
   orbs (start.js) read Weather.summary(). Weather.openPanel(anchor) shows
   the details and the Home / Work picker. */
(()=>{
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const ls={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};

/* ---------- places ---------- */
const PLACES={home:{key:"home",label:"Home",icon:"🏠",city:"Tacoma",lat:47.2529,lon:-122.4443},
              work:{key:"work",label:"Work",icon:"🏢",city:"Bellevue",lat:47.6148,lon:-122.1925}};
if(ls.get("ct-place",null)==null&&ls.get("start-place",null)!=null)ls.set("ct-place",ls.get("start-place","auto"));
if(ls.get("ct-networks",null)==null&&ls.get("start-networks",null)!=null)ls.set("ct-networks",ls.get("start-networks",{}));
const km=(a,b,c,d)=>{const R=6371,r=x=>x*Math.PI/180,dl=r(c-a),dn=r(d-b);return 2*R*Math.asin(Math.sqrt(Math.sin(dl/2)**2+Math.cos(r(a))*Math.cos(r(c))*Math.sin(dn/2)**2))};
async function lookupIP(){
  try{const c=JSON.parse(sessionStorage.getItem("ct-ip")||"null");if(c&&Date.now()-c.t<30*60*1000)return c}catch(e){}
  let g=null;
  try{const j=await (await fetch("https://ipwho.is/?fields=ip,success,city,region,latitude,longitude,connection")).json();
    if(j.success!==false)g={ip:j.ip,city:j.city,region:j.region,lat:j.latitude,lon:j.longitude,org:[j.connection?.org,j.connection?.isp].filter(Boolean).join(" · ")}}catch(e){}
  if(!g){try{const j=await (await fetch("https://ipapi.co/json/")).json();if(!j.error)g={ip:j.ip,city:j.city,region:j.region_code,lat:j.latitude,lon:j.longitude,org:j.org||""}}catch(e){}}
  if(g){g.t=Date.now();try{sessionStorage.setItem("ct-ip",JSON.stringify(g))}catch(e){}}
  return g;
}
function classify(g){
  const learned=ls.get("ct-networks",{});
  if(g.ip&&learned[g.ip]) return {...PLACES[learned[g.ip]],why:"a network you saved"};
  if(/city of bellevue|bellevuewa/i.test(g.org||"")) return {...PLACES.work,why:"the City of Bellevue network"};
  if(g.lat!=null&&km(g.lat,g.lon,PLACES.work.lat,PLACES.work.lon)<8) return {...PLACES.work,why:"a Bellevue network"};
  if(g.lat!=null&&km(g.lat,g.lon,PLACES.home.lat,PLACES.home.lon)<14) return {...PLACES.home,why:"a Tacoma network"};
  return {key:"away",label:g.city||"Here",icon:"📍",city:g.city||"",lat:g.lat,lon:g.lon,why:"your network"};
}

/* ---------- words and icons ---------- */
const weatherCode={0:"clear",1:"mostly clear",2:"partly cloudy",3:"overcast",45:"fog",48:"rime fog",51:"light drizzle",53:"drizzle",55:"heavy drizzle",56:"freezing drizzle",57:"freezing drizzle",61:"light rain",63:"rain",65:"heavy rain",66:"freezing rain",67:"freezing rain",71:"light snow",73:"snow",75:"heavy snow",77:"snow grains",80:"showers",81:"showers",82:"heavy showers",85:"snow showers",86:"snow showers",95:"thunderstorms",96:"thunderstorms",99:"thunderstorms"};
const sunny=c=>c<=1;
const ICON={
  sun:'<svg width="34" height="26" viewBox="0 0 34 26"><circle cx="17" cy="13" r="7" fill="#ffd23a" stroke="#e08a0c"/><g stroke="#f2b01e" stroke-width="2" stroke-linecap="round"><path d="M17 1v3M17 22v3M5 13h3M26 13h3M8.5 4.5l2 2M23.5 19.5l2 2M8.5 21.5l2-2M23.5 6.5l2-2"/></g></svg>',
  moon:'<svg width="34" height="26" viewBox="0 0 34 26"><path d="M20 3a10 10 0 1 0 8 15A8 8 0 0 1 20 3z" fill="#fff3b8" stroke="#d9b74a"/></svg>',
  partly:'<svg width="34" height="26" viewBox="0 0 34 26"><circle cx="11" cy="10" r="7" fill="#ffd23a"/><path d="M8 24h18a6 6 0 0 0 0-12 8 8 0 0 0-15 2 5 5 0 0 0-3 10z" fill="#fff" stroke="#9cc5e6"/></svg>',
  cloud:'<svg width="34" height="26" viewBox="0 0 34 26"><path d="M7 23h20a6 6 0 0 0 0-12 9 9 0 0 0-17 1 5.5 5.5 0 0 0-3 11z" fill="#fff" stroke="#9cb3c9"/></svg>',
  rain:'<svg width="34" height="26" viewBox="0 0 34 26"><path d="M7 16h20a5 5 0 0 0 0-10 8 8 0 0 0-15 1 4.5 4.5 0 0 0-5 9z" fill="#fff" stroke="#7f98b4"/><g stroke="#3f9cd9" stroke-width="2" stroke-linecap="round"><path d="M11 19l-1 4M17 19l-1 4M23 19l-1 4"/></g></svg>',
  snow:'<svg width="34" height="26" viewBox="0 0 34 26"><path d="M7 16h20a5 5 0 0 0 0-10 8 8 0 0 0-15 1 4.5 4.5 0 0 0-5 9z" fill="#fff" stroke="#8fa9c4"/><g fill="#fff" stroke="#8fb3d6"><circle cx="11" cy="21" r="2"/><circle cx="17" cy="23" r="2"/><circle cx="23" cy="21" r="2"/></g></svg>',
  fog:'<svg width="34" height="26" viewBox="0 0 34 26"><g stroke="#8fa9c4" stroke-width="3" stroke-linecap="round"><path d="M4 8h24M8 14h22M4 20h22"/></g></svg>',
  storm:'<svg width="34" height="26" viewBox="0 0 34 26"><path d="M7 15h20a5 5 0 0 0 0-10 8 8 0 0 0-15 1 4.5 4.5 0 0 0-5 9z" fill="#9fb2c8" stroke="#62788f"/><path d="M17 14l-4 6h4l-2 5 7-8h-4l2-3z" fill="#ffd84a" stroke="#d99a0c"/></svg>'
};
const iconFor=(c,day)=>c<=1?(day?"sun":"moon"):c===2?(day?"partly":"cloud"):c===3?"cloud":c<=48?"fog":((c>=71&&c<=77)||c===85||c===86)?"snow":c>=95?"storm":"rain";

/* ---------- details panel ---------- */
const panel=document.createElement("div");panel.className="wx-panel glass";panel.id="wxPanel";panel.hidden=true;
panel.setAttribute("role","dialog");panel.setAttribute("aria-label","Weather details and location");
panel.innerHTML=`<button type="button" class="wp-x wx-close" aria-label="Close weather details">×</button>
  <p class="wpn-title" id="wpTitle">Weather</p><p class="wpn-why" id="wpWhy">Finding you…</p>
  <div class="wpn-grid" id="wpGrid"></div>
  <fieldset class="wpn-place"><legend>Where are you?</legend>
    <label><input type="radio" name="wxplace" value="auto"> Detect from my network</label>
    <label><input type="radio" name="wxplace" value="home"> 🏠 Home · Tacoma</label>
    <label><input type="radio" name="wxplace" value="work"> 🏢 Work · Bellevue</label>
    <label><input type="checkbox" id="wpLearn" checked> Remember this network as Home or Work</label></fieldset>
  <p class="wpn-foot"><a id="wpForecast" href="https://forecast.weather.gov/" target="_blank" rel="noopener">Full forecast ↗</a><span id="wpUpdated"></span></p>`;
document.body.appendChild(panel);
let anchor=null;
function placePanel(){
  if(panel.hidden||!anchor)return;
  const r=anchor.getBoundingClientRect(), w=panel.offsetWidth||300, h=panel.offsetHeight||320;
  let x=r.left-w-14; if(x<10)x=Math.min(innerWidth-w-10,r.right+14); if(x<10)x=10;
  const y=Math.max(10,Math.min(innerHeight-h-10,r.top));
  panel.style.left=x+"px";panel.style.top=y+"px";
}
function openPanel(el){anchor=el||anchor;const cur=ls.get("ct-place","auto");$$('input[name=wxplace]',panel).forEach(r=>r.checked=r.value===cur);
  panel.hidden=false;placePanel();anchor?.setAttribute("aria-expanded","true");$('input[name=wxplace]:checked',panel)?.focus({preventScroll:true})}
function closePanel(){if(panel.hidden)return;panel.hidden=true;anchor?.setAttribute("aria-expanded","false")}
$(".wx-close",panel).addEventListener("click",()=>{closePanel();anchor?.focus()});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!panel.hidden){closePanel();anchor?.focus()}});
document.addEventListener("pointerdown",e=>{if(!panel.hidden&&!e.target.closest("#wxPanel")&&!(anchor&&anchor.contains(e.target)))closePanel()});
addEventListener("resize",placePanel);addEventListener("scroll",placePanel,{passive:true});
panel.addEventListener("change",async e=>{
  if(e.target.name!=="wxplace")return;const v=e.target.value;ls.set("ct-place",v);
  if(v!=="auto"&&$("#wpLearn",panel).checked){const g=ipInfo||await lookupIP();if(g&&g.ip){const n=ls.get("ct-networks",{});n[g.ip]=v;ls.set("ct-networks",n);ls.set("ct-place","auto")}}
  await refresh();
});

/* ---------- data ---------- */
let here=null, ipInfo=null, last=null, failed=false;
const metric=()=>document.body.classList.contains("canada");
async function locate(){
  const choice=ls.get("ct-place","auto");
  if(choice!=="auto"&&PLACES[choice])return {...PLACES[choice],why:"your choice"};
  ipInfo=await lookupIP();
  return ipInfo?classify(ipInfo):{...PLACES.home,why:"a guess, because the network lookup didn't answer"};
}
function summary(){
  if(!last||!here)return null;
  const {c,a}=last, m=metric(), T=f=>Math.round(m?(f-32)*5/9:f), W=v=>Math.round(m?v*1.609344:v);
  return {temp:T(c.temperature_2m),feels:T(c.apparent_temperature),unit:m?"C":"F",wind:W(c.wind_speed_10m),windUnit:m?"km/h":"mph",
    humidity:c.relative_humidity_2m,aqi:a&&a.us_aqi!=null?Math.round(a.us_aqi):null,code:c.weather_code,day:!!c.is_day,
    cond:sunny(c.weather_code)&&c.is_day?"sunny":(weatherCode[c.weather_code]||"changing"),
    icon:ICON[iconFor(c.weather_code,c.is_day)],label:here.label,city:here.city||here.label,placeIcon:here.icon,time:c.time};
}
function render(){
  if(!here)return;
  $("#wpTitle",panel).textContent=`${here.icon} ${here.label}${here.city&&here.city!==here.label?` · ${here.city}`:""}`;
  $("#wpWhy",panel).textContent=`Showing ${here.label} because of ${here.why}.${ipInfo&&ls.get("ct-place","auto")==="auto"?` Network: ${[ipInfo.city,ipInfo.region].filter(Boolean).join(", ")}.`:""}`;
  if(here.lat!=null)$("#wpForecast",panel).href=`https://forecast.weather.gov/MapClick.php?lat=${here.lat.toFixed(4)}&lon=${here.lon.toFixed(4)}`;
  document.body.dataset.place=here.key;
  const s=summary();if(!s)return;
  const rows=[["Temperature",`${s.temp}°${s.unit}`],["Feels like",`${s.feels}°${s.unit}`],["Conditions",s.cond],["Humidity",`${s.humidity}%`],["Wind",`${s.wind} ${s.windUnit}`],["Air quality",s.aqi!=null?`${s.aqi} AQI`:"—"]];
  $("#wpGrid",panel).innerHTML=rows.map(([k,v])=>`<div><b>${k}</b><span>${v}</span></div>`).join("");
  $("#wpUpdated",panel).textContent="Updated "+new Date(s.time).toLocaleTimeString(metric()?"en-CA":"en-US",{hour:"numeric",minute:"2-digit"});
  document.dispatchEvent(new CustomEvent("weather:update",{detail:last}));
}
async function refresh(){
  here=await locate();render();
  if(here.lat==null){failed=true;document.dispatchEvent(new Event("weather:error"));return}
  try{
    const key=`ct-wx:${here.lat.toFixed(2)},${here.lon.toFixed(2)}`;
    let cached=null;try{cached=JSON.parse(sessionStorage.getItem(key)||"null")}catch(e){}
    let w,q;
    if(cached&&Date.now()-cached.t<15*60*1000){w=cached.w;q=cached.q}
    else{
      const json=r=>{if(!r.ok)throw new Error("HTTP "+r.status);return r.json()};
      [w,q]=await Promise.all([
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${here.lat}&longitude=${here.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,is_day&temperature_unit=fahrenheit&wind_speed_unit=mph`).then(json),
        fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${here.lat}&longitude=${here.lon}&current=us_aqi`).then(json).catch(()=>null)]);
      if(!w||!w.current)throw new Error("no current conditions");
      try{sessionStorage.setItem(key,JSON.stringify({t:Date.now(),w,q}))}catch(e){}
    }
    last={c:w.current,a:q&&q.current,place:here};failed=false;render();
  }catch(e){failed=true;document.dispatchEvent(new Event("weather:error"));console.warn("Weather unavailable",e)}
}
refresh();setInterval(()=>{if(!document.hidden)refresh()},15*60*1000);
window.Weather={render,refresh,summary,openPanel,closePanel,get last(){return last},get place(){return here},get failed(){return failed}};
})();
