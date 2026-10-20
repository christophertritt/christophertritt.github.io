/* Weather bubbles for every page: a floating cluster of glass bubbles you can hover, grab, fling and pop.
   It works out where you are (Home in Tacoma, Work in Bellevue, or the city your network is in),
   fetches the conditions there from Open-Meteo, and shows °C in Canada mode.
   Tap the big bubble for details and to change or teach the location. */
(()=>{
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
const ls={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const sound=(...a)=>{if(typeof window.tone==="function")window.tone(...a)};
const pop=(x,y)=>{if(typeof window.burst==="function")window.burst(x,y,12)};

/* ---------- places ---------- */
const PLACES={home:{key:"home",label:"Home",icon:"🏠",city:"Tacoma",lat:47.2529,lon:-122.4443},
              work:{key:"work",label:"Work",icon:"🏢",city:"Bellevue",lat:47.6148,lon:-122.1925}};
/* settings from the earlier start-page chip carry over */
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

/* ---------- icons ---------- */
const weatherCode={0:"clear sky",1:"mostly clear",2:"partly cloudy",3:"overcast",45:"fog",48:"rime fog",51:"light drizzle",53:"drizzle",55:"heavy drizzle",56:"freezing drizzle",57:"freezing drizzle",61:"light rain",63:"rain",65:"heavy rain",66:"freezing rain",67:"freezing rain",71:"light snow",73:"snow",75:"heavy snow",77:"snow grains",80:"rain showers",81:"rain showers",82:"heavy showers",85:"snow showers",86:"snow showers",95:"thunderstorm",96:"thunderstorm",99:"thunderstorm"};
const svg={
  sun:`<svg width="40" height="40" viewBox="0 0 40 40"><g class="sunrays" stroke="#f4a51c" stroke-width="3" stroke-linecap="round">${[0,45,90,135,180,225,270,315].map(a=>`<path d="M20 3v5" transform="rotate(${a} 20 20)"/>`).join("")}</g><circle cx="20" cy="20" r="9" fill="url(#wxSun)" stroke="#e08a0c" stroke-width="1.2"/><ellipse cx="17" cy="16.5" rx="4" ry="2.4" fill="#fff" opacity=".7"/></svg>`,
  moon:`<svg width="40" height="40" viewBox="0 0 40 40"><g class="moonbit"><path d="M25 6a14 14 0 1 0 9 22A11 11 0 0 1 25 6z" fill="#fff3b8" stroke="#d9b74a" stroke-width="1.2"/><circle cx="17" cy="22" r="1.8" fill="#e8d48a"/><circle cx="22" cy="28" r="1.2" fill="#e8d48a"/></g><path d="M31 9l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" fill="#fff"/></svg>`,
  cloud:`<svg width="44" height="36" viewBox="0 0 44 36"><g class="cloudbit"><path d="M12 30a8 8 0 0 1-.6-16A11 11 0 0 1 32 12a8 8 0 0 1 1 18z" fill="url(#wxCloud)" stroke="#8fa9c4" stroke-width="1.2"/><ellipse cx="18" cy="15" rx="6" ry="2.6" fill="#fff" opacity=".85"/></g></svg>`,
  partly:`<svg width="44" height="40" viewBox="0 0 44 40"><g class="sunrays" stroke="#f4a51c" stroke-width="2.6" stroke-linecap="round">${[0,60,120,180,240,300].map(a=>`<path d="M15 2v4" transform="rotate(${a} 15 14)"/>`).join("")}</g><circle cx="15" cy="14" r="7" fill="url(#wxSun)" stroke="#e08a0c"/><g class="cloudbit"><path d="M14 36a7 7 0 0 1-.5-14A10 10 0 0 1 33 20a7 7 0 0 1 1 16z" fill="url(#wxCloud)" stroke="#8fa9c4" stroke-width="1.2"/><ellipse cx="20" cy="23" rx="5" ry="2.2" fill="#fff" opacity=".85"/></g></svg>`,
  rain:`<svg width="44" height="42" viewBox="0 0 44 42"><g class="cloudbit"><path d="M12 26a8 8 0 0 1-.6-16A11 11 0 0 1 32 8a8 8 0 0 1 1 18z" fill="url(#wxCloud)" stroke="#7f98b4" stroke-width="1.2"/><ellipse cx="18" cy="11" rx="6" ry="2.4" fill="#fff" opacity=".85"/></g><g class="raindrops" fill="#3f9cd9">${[[13,31],[21,35],[29,31],[17,39],[25,40]].map(([x,y])=>`<path d="M${x} ${y-4}q2.4 3 0 4.6q-2.4-1.6 0-4.6z"/>`).join("")}</g></svg>`,
  snow:`<svg width="44" height="42" viewBox="0 0 44 42"><g class="cloudbit"><path d="M12 26a8 8 0 0 1-.6-16A11 11 0 0 1 32 8a8 8 0 0 1 1 18z" fill="url(#wxCloud)" stroke="#8fa9c4" stroke-width="1.2"/></g><g class="raindrops" fill="#fff" stroke="#8fb3d6" stroke-width=".8">${[[13,32],[22,36],[30,32]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="2.4"/>`).join("")}</g></svg>`,
  fog:`<svg width="44" height="36" viewBox="0 0 44 36"><g class="cloudbit" stroke="#8fa9c4" stroke-width="3.2" stroke-linecap="round"><path d="M6 10h28M10 18h28M6 26h26"/></g></svg>`,
  storm:`<svg width="44" height="42" viewBox="0 0 44 42"><g class="cloudbit"><path d="M12 26a8 8 0 0 1-.6-16A11 11 0 0 1 32 8a8 8 0 0 1 1 18z" fill="#9fb2c8" stroke="#62788f" stroke-width="1.2"/></g><path class="raindrops" d="M22 24l-5 9h5l-3 8 9-11h-5l3-6z" fill="#ffd84a" stroke="#d99a0c"/></svg>`,
  therm:`<svg width="22" height="30" viewBox="0 0 22 30"><rect x="7" y="2" width="8" height="20" rx="4" fill="#fff" stroke="#b4512a" stroke-width="1.4"/><rect class="thermbit" x="9.5" y="9" width="3" height="13" rx="1.5" fill="#e24a3b"/><circle cx="11" cy="23" r="5.4" fill="#e24a3b" stroke="#b4512a" stroke-width="1.4"/><circle cx="9.3" cy="21.5" r="1.4" fill="#fff" opacity=".8"/></svg>`,
  wind:`<svg width="28" height="28" viewBox="0 0 28 28"><g class="pinwheel">${["#4fb3e8","#7ed36b","#ffcf4a","#ff7fb0"].map((c,i)=>`<path d="M14 14V3a7 7 0 0 1 0 11z" fill="${c}" stroke="#fff" stroke-width=".8" transform="rotate(${i*90} 14 14)"/>`).join("")}<circle cx="14" cy="14" r="2" fill="#fff"/></g></svg>`,
  drop:`<svg width="22" height="28" viewBox="0 0 22 28"><path class="dropbit" d="M11 2C11 2 3 12 3 18a8 8 0 0 0 16 0C19 12 11 2 11 2z" fill="url(#wxDrop)" stroke="#2c7fb8" stroke-width="1.2"/><ellipse cx="8" cy="17" rx="2" ry="3.4" fill="#fff" opacity=".7"/></svg>`,
  leaf:`<svg width="24" height="28" viewBox="0 0 24 28"><path class="leafbit" d="M12 2C21 8 22 19 12 26C2 19 3 8 12 2z" fill="currentColor" stroke="rgba(0,0,0,.25)" stroke-width="1"/><path d="M12 6v19" stroke="#fff" stroke-opacity=".7" stroke-width="1.4"/></svg>`
};
document.body.insertAdjacentHTML("beforeend",`<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<radialGradient id="wxSun" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#fff6b0"/><stop offset=".6" stop-color="#ffcf3a"/><stop offset="1" stop-color="#f29c12"/></radialGradient>
<linearGradient id="wxCloud" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#d5e3f2"/></linearGradient>
<linearGradient id="wxDrop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe8ff"/><stop offset="1" stop-color="#3f9cd9"/></linearGradient></defs></svg>`);
const skyIcon=(code,day)=>code<=1?(day?"sun":"moon"):code===2?(day?"partly":"cloud"):code===3?"cloud":code<=48?"fog":((code>=71&&code<=77)||code===85||code===86)?"snow":code>=95?"storm":"rain";
const aqiInfo=a=>a<=50?["#5cc96b","good air"]:a<=100?["#f2c94c","ok air"]:a<=150?["#f2994a","meh air"]:["#e0523f","bad air"];

/* ---------- bubbles ---------- */
let wx=$("#wx");
if(!wx){wx=document.createElement("aside");wx.className="wx";wx.id="wx";document.body.appendChild(wx)}
wx.setAttribute("aria-label","Current weather. Drag the bubbles to move them; select the big one for details.");
const spec=[
  {k:"main",r:50,x:0,y:0,tint:"#7fcdf0",s:.16},
  {k:"feels",r:30,x:72,y:-40,tint:"#ffb98a",s:.09},
  {k:"wind",r:31,x:82,y:30,tint:"#9fe3a8",s:.07},
  {k:"hum",r:28,x:-14,y:74,tint:"#8fd8f2",s:.08},
  {k:"aqi",r:28,x:50,y:84,tint:"#5cc96b",s:.06},
  {k:"place",r:24,x:-64,y:-28,tint:"#f4b8e4",s:.11}
];
const calmNow=()=>reduce||document.body.classList.contains("quiet-mode");
const bubbles=spec.map((b,i)=>{const el=document.createElement("div");el.className="wxb "+b.k;el.tabIndex=b.k==="main"?0:-1;
  el.style.width=el.style.height=b.r*2+"px";el.style.setProperty("--tint",b.tint);wx.appendChild(el);return {...b,el,px:0,py:0,vx:0,vy:0,phase:i*1.7,popped:false}});
const B=Object.fromEntries(bubbles.map(b=>[b.k,b]));
B.main.el.setAttribute("role","button");B.main.el.setAttribute("aria-haspopup","dialog");B.main.el.setAttribute("aria-label","Current weather. Select for details.");
const fill=(k,h)=>{B[k].el.innerHTML=h};
fill("main",`<span class="ic">${svg.cloud}</span><b>…</b><small>finding you</small>`);
fill("feels",`<span class="ic">${svg.therm}</span><b>…</b><small>feels</small>`);
fill("wind",`<span class="ic">${svg.wind}</span><b>…</b><small>wind</small>`);
fill("hum",`<span class="ic">${svg.drop}</span><b>…</b>`);
fill("aqi",`<span class="ic" style="color:#3e8a4f">${svg.leaf}</span><b>…</b>`);
fill("place","…");

let ax,ay,avx=0,avy=0;
const small=()=>innerWidth<620, scale=()=>small()?.72:1;
const homeSpot=()=>small()?[innerWidth-110,innerHeight-150]:[innerWidth-150,innerHeight-170];
try{const p=JSON.parse(localStorage.getItem("ct-wx")||"null");if(p){ax=p[0]*innerWidth;ay=p[1]*innerHeight}}catch(e){}
if(ax==null)[ax,ay]=homeSpot();
function clamp(bounce){const pad=60*scale(),minX=pad,maxX=innerWidth-pad-70*scale(),minY=small()?130:150,maxY=innerHeight-pad-80*scale();
  if(ax<minX){ax=minX;if(bounce)avx=Math.abs(avx)*.6} if(ax>maxX){ax=maxX;if(bounce)avx=-Math.abs(avx)*.6}
  if(ay<minY){ay=minY;if(bounce)avy=Math.abs(avy)*.6} if(ay>maxY){ay=maxY;if(bounce)avy=-Math.abs(avy)*.6}}
clamp();bubbles.forEach(b=>{b.px=ax+b.x*scale();b.py=ay+b.y*scale()});
addEventListener("resize",()=>clamp());
const saveSpot=()=>{try{localStorage.setItem("ct-wx",JSON.stringify([ax/innerWidth,ay/innerHeight]))}catch(e){}};

let drag=null;
wx.addEventListener("pointerdown",e=>{const el=e.target.closest(".wxb");if(!el)return;const b=bubbles.find(x=>x.el===el);
  drag={b,id:e.pointerId,sx:e.clientX,sy:e.clientY,ox:e.clientX-ax,oy:e.clientY-ay,lx:e.clientX,ly:e.clientY,moved:false};el.setPointerCapture(e.pointerId);avx=avy=0});
wx.addEventListener("pointermove",e=>{if(!drag||e.pointerId!==drag.id)return;
  if(!drag.moved&&Math.hypot(e.clientX-drag.sx,e.clientY-drag.sy)>6){drag.moved=true;wx.classList.add("dragging");closePanel();sound(300,500,.12,"sine",.05)}
  if(!drag.moved)return;avx=e.clientX-drag.lx;avy=e.clientY-drag.ly;drag.lx=e.clientX;drag.ly=e.clientY;ax=e.clientX-drag.ox;ay=e.clientY-drag.oy;clamp()});
function endDrag(e){if(!drag||e.pointerId!==drag.id)return;const d=drag;drag=null;wx.classList.remove("dragging");
  if(!d.moved){tap(d.b);return}if(Math.hypot(avx,avy)>2)sound(500,900,.15,"triangle",.05);else avx=avy=0;saveSpot()}
wx.addEventListener("pointerup",endDrag);wx.addEventListener("pointercancel",endDrag);
bubbles.forEach(b=>b.el.addEventListener("pointerenter",e=>{if(drag||calmNow())return;const dx=b.px-e.clientX,dy=b.py-e.clientY,d=Math.hypot(dx,dy)||1;
  b.vx+=dx/d*5;b.vy+=dy/d*5;bubbles.forEach(o=>{if(o!==b){o.vx+=(Math.random()-.5)*2;o.vy+=(Math.random()-.5)*2}});sound(700+b.r*8,900+b.r*8,.06,"sine",.03)}));
B.main.el.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();togglePanel()}});
function tap(b){
  if(b.k==="main"||b.k==="place"){b.vy-=6;togglePanel();return}
  if(b.popped)return;b.popped=true;b.el.classList.add("popping");
  const r=b.el.getBoundingClientRect();pop(r.left+r.width/2,r.top+r.height/2);sound(1200,300,.08,"square",.06);
  if(reduce)b.el.style.opacity=0;else b.el.animate([{opacity:1,scale:"1"},{opacity:.9,scale:"1.35"},{opacity:0,scale:"1.6"}],{duration:180,fill:"forwards"});
  setTimeout(()=>{b.px=ax;b.py=ay;b.vx=(Math.random()-.5)*8;b.vy=-4;b.el.getAnimations().forEach(a=>a.cancel());b.el.style.opacity="";
    if(!reduce)b.el.animate([{scale:"0"},{scale:"1.2",offset:.6},{scale:"1"}],{duration:500,easing:"cubic-bezier(.3,1.6,.5,1)"});
    b.el.classList.remove("popping");b.popped=false;sound(400,800,.2,"sine",.05)},2200);
}
let t=0;
function frame(){t+=1/60;const calm=calmNow(),sc=scale();
  if(!drag&&(avx||avy)){ax+=avx;ay+=avy;avx*=.93;avy*=.93;clamp(true);if(Math.abs(avx)<.05&&Math.abs(avy)<.05){avx=avy=0;saveSpot()}}
  for(const b of bubbles){const bob=calm?0:Math.sin(t*1.3+b.phase)*4,bobx=calm?0:Math.cos(t*.9+b.phase)*2.5;
    b.vx+=(ax+b.x*sc+bobx-b.px)*(drag&&drag.b===b?.5:b.s);b.vy+=(ay+b.y*sc+bob-b.py)*(drag&&drag.b===b?.5:b.s);
    b.vx*=calm?.6:.8;b.vy*=calm?.6:.8;b.px+=b.vx;b.py+=b.vy;const sq=calm?1:1+Math.min(.12,Math.hypot(b.vx,b.vy)*.012);
    b.el.style.transform=`translate(${(b.px-b.r).toFixed(1)}px,${(b.py-b.r).toFixed(1)}px) scale(${(sc*sq).toFixed(3)},${(sc/sq).toFixed(3)})`}
  if(!panel.hidden)placePanel();
  requestAnimationFrame(frame)}

/* ---------- details panel: conditions plus where you are ---------- */
const panel=document.createElement("div");panel.className="wx-panel glass";panel.id="wxPanel";panel.hidden=true;
panel.setAttribute("role","dialog");panel.setAttribute("aria-label","Weather details and location");
panel.innerHTML=`<p class="wp-title" id="wpTitle">Weather</p><p class="wp-why" id="wpWhy">Finding you…</p>
  <div class="wp-grid" id="wpGrid"></div>
  <fieldset class="wp-place"><legend>Where are you?</legend>
    <label><input type="radio" name="wxplace" value="auto"> Detect from my network</label>
    <label><input type="radio" name="wxplace" value="home"> 🏠 Home · Tacoma</label>
    <label><input type="radio" name="wxplace" value="work"> 🏢 Work · Bellevue</label>
    <label class="wp-learn"><input type="checkbox" id="wpLearn" checked> Remember this network as Home or Work</label></fieldset>
  <div class="wp-foot"><a id="wpForecast" href="https://forecast.weather.gov/" target="_blank" rel="noopener">Full forecast ↗</a><span id="wpUpdated"></span><button type="button" class="wp-close" aria-label="Close weather details">×</button></div>`;
document.body.appendChild(panel);
requestAnimationFrame(frame);
function placePanel(){const w=panel.offsetWidth||300,h=panel.offsetHeight||320,sc=scale();
  let x=ax-w-70*sc, y=ay-h/2; if(x<10)x=Math.min(innerWidth-w-10,ax+100*sc); y=Math.max(70,Math.min(innerHeight-h-10,y));
  panel.style.left=x+"px";panel.style.top=y+"px"}
function openPanel(){const cur=ls.get("ct-place","auto");$$('input[name=wxplace]',panel).forEach(r=>r.checked=r.value===cur);panel.hidden=false;placePanel();
  B.main.el.setAttribute("aria-expanded","true");$('input[name=wxplace]:checked',panel)?.focus({preventScroll:true})}
function closePanel(){if(panel.hidden)return;panel.hidden=true;B.main.el.setAttribute("aria-expanded","false")}
function togglePanel(){panel.hidden?openPanel():closePanel()}
$(".wp-close",panel).addEventListener("click",()=>{closePanel();B.main.el.focus()});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!panel.hidden){closePanel();B.main.el.focus()}});
document.addEventListener("pointerdown",e=>{if(!panel.hidden&&!e.target.closest("#wxPanel,.wx"))closePanel()});
panel.addEventListener("change",async e=>{
  if(e.target.name!=="wxplace")return;const v=e.target.value;ls.set("ct-place",v);
  /* picking Home or Work while "remember" is ticked teaches this network, then goes back to detecting */
  if(v!=="auto"&&$("#wpLearn",panel).checked){const g=ipInfo||await lookupIP();if(g&&g.ip){const n=ls.get("ct-networks",{});n[g.ip]=v;ls.set("ct-networks",n);ls.set("ct-place","auto")}}
  await refresh();
});

/* ---------- data ---------- */
let here=null, ipInfo=null, last=null;
const metric=()=>document.body.classList.contains("canada");
async function locate(){
  const choice=ls.get("ct-place","auto");
  if(choice!=="auto")return {...PLACES[choice],why:"your choice"};
  ipInfo=await lookupIP();
  return ipInfo?classify(ipInfo):{...PLACES.home,why:"a guess, because the network lookup didn't answer"};
}
function render(){
  if(!here)return;
  const short=here.label.length>9?here.label.split(/[ ,]/)[0].slice(0,9):here.label;
  fill("place",`${here.icon}<br>${short}`);B.place.el.title=here.label;
  $("#wpTitle",panel).textContent=`${here.icon} ${here.label}${here.city&&here.city!==here.label?` · ${here.city}`:""}`;
  $("#wpWhy",panel).textContent=`Showing ${here.label} because of ${here.why}.${ipInfo&&ls.get("ct-place","auto")==="auto"?` Network: ${[ipInfo.city,ipInfo.region].filter(Boolean).join(", ")}.`:""}`;
  if(here.lat!=null)$("#wpForecast",panel).href=`https://forecast.weather.gov/MapClick.php?lat=${here.lat.toFixed(4)}&lon=${here.lon.toFixed(4)}`;
  document.body.dataset.place=here.key;
  if(!last){return}
  const {c,a}=last, m=metric();
  const T=f=>Math.round(m?(f-32)*5/9:f), W=v=>Math.round(m?v*1.609344:v), tu=m?"°C":"°F", wu=m?"km/h":"mph";
  const cond=weatherCode[c.weather_code]||"changing", aq=a?Math.round(a.us_aqi):null, [aqCol,aqWord]=aq!=null?aqiInfo(aq):["#9fb2c8","air n/a"];
  fill("main",`<span class="ic">${svg[skyIcon(c.weather_code,c.is_day)]}</span><b>${T(c.temperature_2m)}°</b><small>${cond}</small>`);
  fill("feels",`<span class="ic">${svg.therm}</span><b>${T(c.apparent_temperature)}°</b><small>feels</small>`);
  fill("wind",`<span class="ic">${svg.wind}</span><b>${W(c.wind_speed_10m)}</b><small>${wu}</small>`);
  fill("hum",`<span class="ic">${svg.drop}</span><b>${c.relative_humidity_2m}%</b>`);
  fill("aqi",`<span class="ic" style="color:${aqCol}">${svg.leaf}</span><b>${aq??"—"}</b><small>${aqWord}</small>`);
  B.aqi.el.style.setProperty("--tint",aqCol);
  B.wind.el.querySelector(".pinwheel").style.animation=c.wind_speed_10m>3&&!reduce?`spinslow ${Math.max(.4,6/c.wind_speed_10m).toFixed(2)}s linear infinite`:"";
  B.main.el.setAttribute("aria-label",`${here.label} weather: ${T(c.temperature_2m)} degrees ${m?"Celsius":"Fahrenheit"}, ${cond}. Select for details.`);
  const rows=[["Temperature",`${T(c.temperature_2m)}${tu}`],["Feels like",`${T(c.apparent_temperature)}${tu}`],["Conditions",cond],["Humidity",`${c.relative_humidity_2m}%`],["Wind",`${W(c.wind_speed_10m)} ${wu}`],["Air quality",aq!=null?`${aq} AQI`:"—"]];
  $("#wpGrid",panel).innerHTML=rows.map(([k,v])=>`<div><b>${k}</b><span>${v}</span></div>`).join("");
  $("#wpUpdated",panel).textContent="Updated "+new Date(c.time).toLocaleTimeString(m?"en-CA":"en-US",{hour:"numeric",minute:"2-digit"});
}
async function refresh(){
  here=await locate();render();
  if(here.lat==null){fill("main",`<span class="ic">${svg.cloud}</span><b>?</b><small>no location</small>`);return}
  try{
    /* one fetch per place every 15 minutes, shared across pages, so moving
       between pages doesn't trip Open-Meteo's rate limit (it answers 429) */
    const key=`ct-wx:${here.lat.toFixed(2)},${here.lon.toFixed(2)}`;
    let cached=null;try{cached=JSON.parse(sessionStorage.getItem(key)||"null")}catch(e){}
    let w,q;
    if(cached&&Date.now()-cached.t<15*60*1000){w=cached.w;q=cached.q}
    else{
      const json=r=>{if(!r.ok)throw new Error("HTTP "+r.status);return r.json()};
      [w,q]=await Promise.all([
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${here.lat}&longitude=${here.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,is_day&temperature_unit=fahrenheit&wind_speed_unit=mph`).then(json),
        fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${here.lat}&longitude=${here.lon}&current=us_aqi,pm2_5`).then(json).catch(()=>null)]);
      if(!w||!w.current)throw new Error("no current conditions");
      try{sessionStorage.setItem(key,JSON.stringify({t:Date.now(),w,q}))}catch(e){}
    }
    last={c:w.current,a:q&&q.current,place:here};render();
    document.dispatchEvent(new CustomEvent("weather:update",{detail:last}));
  }catch(e){fill("main",`<span class="ic">${svg.cloud}</span><b>?</b><small>weather's napping</small>`);console.warn("Weather unavailable",e)}
}
/* Canada mode switches units straight away */
new MutationObserver(render).observe(document.body,{attributes:true,attributeFilter:["class"]});
refresh();setInterval(()=>{if(!document.hidden)refresh()},15*60*1000);
window.Weather={render,refresh,get last(){return last},get place(){return here}};
})();
