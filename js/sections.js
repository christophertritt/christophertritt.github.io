/* One bit of logic per portfolio page theme. Runs before home.js; sounds use home.js's tone() at click time. */
(()=>{
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
const beep=(...a)=>{if(typeof tone==="function")tone(...a)};
const B=document.body.classList;

/* ---------- Projects: airport departures board, boarding-pass cards, gate chime ---------- */
if(B.contains("theme-airport")&&typeof projects!=="undefined"){
  const head=$("#work .head");
  const codes={ctr:"BEL",roslyn:"RSL",grayland:"GRY","south-hill":"SHL",detroit:"DTW"};
  const fmtT=d=>d.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:false,timeZone:"America/Los_Angeles"});
  const now=new Date();
  const rows=projects.map((p,i)=>{const dep=new Date(now.getTime()+(12+i*17)*60000);
    const remark=p.status?["DELAYED","delayed"]:i===0?["BOARDING","boarding"]:["ON TIME","ontime"];
    return {p,time:fmtT(dep),flight:"CT "+(101+i*7),gate:"A"+(i+1),remark}});
  const board=document.createElement("div");board.className="fids";
  board.innerHTML=`<div class="fids-head"><span><span class="plane-ic" aria-hidden="true">✈</span> Departures</span><span id="fidsClock"></span></div>
    <div class="fids-scroll"><table><thead><tr><th>Time</th><th>Flight</th><th>Destination</th><th>Gate</th><th>Remarks</th></tr></thead><tbody>${rows.map(r=>
      `<tr class="row" tabindex="0" data-id="${r.p.id}" aria-label="Open the ${r.p.title} case study"><td>${r.time}</td><td>${r.flight}</td><td><span class="flap" data-text="${r.p.title.toUpperCase()}"></span></td><td>${r.gate}</td><td class="${r.remark[1]}">${r.remark[0]}</td></tr>`).join("")}</tbody></table></div>
    <div class="fids-foot"><span>Now boarding at gate A1: ${projects[0].title}. Passengers for ${projects.find(p=>p.status)?.title||"all destinations"}, please check the board for updates. Select any flight to read its case study.</span></div>`;
  head.after(board);
  /* split-flap letters: each tile flips through the alphabet before it lands */
  const A=" ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-";
  $$(".flap",board).forEach((el,k)=>{const target=el.dataset.text;
    const paint=t=>el.innerHTML=[...t].map(c=>`<span>${c===" "?"&nbsp;":c}</span>`).join("");
    if(reduce){paint(target);return}
    let step=0;const iv=setInterval(()=>{step++;const t=[...target].map((ch,i)=>step>i*.5+6+k*3?ch:(ch===" "?" ":A[Math.floor(Math.random()*A.length)])).join("");paint(t);if(t===target)clearInterval(iv)},50)});
  const open=r=>{beep(660,660,.25,"sine",.08);beep(523,523,.35,"sine",.08,.22);if(typeof openCase==="function")openCase(r.dataset.id)};
  board.addEventListener("click",e=>{const r=e.target.closest("tr.row");if(r)open(r)});
  board.addEventListener("keydown",e=>{const r=e.target.closest("tr.row");if(r&&(e.key==="Enter"||e.key===" ")){e.preventDefault();open(r)}});
  const clk=$("#fidsClock",board);const t=()=>clk.textContent=fmtT(new Date())+" PT";t();setInterval(t,15000);
  /* each project card gets a boarding-pass header */
  const decorate=()=>$$("#grid .card").forEach((c,i)=>{if(c.querySelector(".pass-top"))return;const r=rows.find(x=>x.p.id===c.dataset.id)||rows[i];
    c.insertAdjacentHTML("afterbegin",`<div class="pass-top"><span>BOARDING PASS · ${r.flight}</span><b>SEA → ${codes[c.dataset.id]||"XXX"}</b></div>`)});
  decorate();addEventListener("DOMContentLoaded",decorate);
  const f=location.hash.slice(1);if(f&&typeof T!=="undefined"&&T[f])addEventListener("load",()=>typeof filter==="function"&&filter(f));
}

/* ---------- Skills: Bloomberg-style terminal ---------- */
if(B.contains("theme-terminal")){
  const body=$("#skills .win-body"), head=$("#skills .head");
  const keys=document.createElement("div");keys.className="fkeys";
  keys.innerHTML=`<button type="button" class="red" data-k="cancel">CANCEL</button><button type="button" data-k="help">HELP</button><button type="button" data-k="demand">1) DEMAND</button><button type="button" data-k="spatial">2) SPATIAL</button><button type="button" data-k="data">3) DATA</button><button type="button" class="grn" data-k="go">GO</button>`;
  body.prepend(keys);
  const cmd=document.createElement("div");cmd.className="cmdline";cmd.innerHTML=`<span>&gt;</span><span id="cmdText"></span><span class="cur" aria-hidden="true"></span><span class="go">&lt;GO&gt;</span>`;
  head.before(cmd);
  const clocks=document.createElement("div");clocks.className="worldclock";clocks.setAttribute("aria-label","World clocks");
  const zones=[["SEA","America/Los_Angeles"],["NY","America/New_York"],["LDN","Europe/London"],["TYO","Asia/Tokyo"]];
  const tickC=()=>clocks.innerHTML=zones.map(([n,z])=>`<span>${n}<b>${new Date().toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit",timeZone:z})}</b></span>`).join("");tickC();setInterval(tickC,20000);
  head.before(clocks);
  $$("#skills .cols h3").forEach((h,i)=>h.dataset.n=i+1);
  const news=document.createElement("p");news.className="newsline";news.innerHTML=`<b>NEWS</b> Tools in use: ArcGIS Pro, QGIS, Python, SQL, R, Blender, Power BI, Power Apps, SharePoint, Tableau, Adobe Creative Cloud.`;
  $("#skills .cols").after(news);
  /* type a command, the way you'd pull up a function */
  const type=(txt)=>{const el=$("#cmdText");el.textContent="";if(reduce){el.textContent=txt;return}let i=0;const iv=setInterval(()=>{el.textContent=txt.slice(0,++i);if(i>=txt.length)clearInterval(iv)},45)};
  type("CTRITT SKILLS");
  const cards=$$("#skills .cols>div");
  const flash=n=>{cards.forEach((c,i)=>c.style.outline=i===n?"2px solid #ffd84a":"");cards[n]?.scrollIntoView({block:"nearest",behavior:reduce?"auto":"smooth"})};
  keys.addEventListener("click",e=>{const k=e.target.closest("[data-k]")?.dataset.k;if(!k)return;beep(1200,1200,.04,"square",.04);
    if(k==="demand"){type("CTRITT TDM <GO>");flash(0)}else if(k==="spatial"){type("CTRITT GIS <GO>");flash(1)}else if(k==="data"){type("CTRITT DATA <GO>");flash(2)}
    else if(k==="help"){type("HELP: PRESS 1, 2 OR 3, THEN GO");flash(-1)}else if(k==="cancel"){type("");flash(-1)}else if(k==="go"){location.href="/portfolio/projects/"}});
  addEventListener("keydown",e=>{if(/INPUT|TEXTAREA/.test(document.activeElement.tagName))return;const m={"1":"demand","2":"spatial","3":"data"}[e.key];if(m)keys.querySelector(`[data-k=${m}]`).click()});
}

/* ---------- About: is the mountain out? (real cloud cover over Tacoma) ---------- */
if(B.contains("theme-waterfront")){
  const pill=document.createElement("p");pill.className="mtn-pill";pill.textContent="🏔️ Checking if the mountain is out…";
  const first=$("#about .win-body > div");if(first)first.prepend(pill);
  (async()=>{try{
    const c=(await (await fetch("https://api.open-meteo.com/v1/forecast?latitude=47.2529&longitude=-122.4443&current=cloud_cover,is_day")).json()).current;
    if(typeof c.cloud_cover!=="number")throw new Error("no cloud cover");const out=c.cloud_cover<45;
    B.toggle("mountain-out",out);
    pill.textContent=out?(c.is_day?"🏔️ The mountain is out over Tacoma right now.":"🌙 Clear night over Tacoma. Rainier's out there."):`☁️ Rainier is hiding behind ${c.cloud_cover}% cloud cover today.`;
  }catch(e){pill.textContent="🏔️ Rainier is probably hiding. It usually is."}})();
}

/* ---------- Resume: a rubber stamp ---------- */
if(B.contains("theme-desk")){
  const head=$("#resume .head");
  const btn=document.createElement("button");btn.type="button";btn.className="btn primary stamp-btn";btn.textContent="Stamp it";
  head&&head.appendChild(btn);
  const words=["APPROVED","HIRE ME","AICP-ELIGIBLE","ON TIME","594 PASS"];let i=0;
  btn.addEventListener("click",()=>{$$(".stamped").forEach(s=>s.remove());const s=document.createElement("div");s.className="stamped";s.textContent=words[i++%words.length];
    s.style.top=(100+Math.random()*180)+"px";s.style.right=(4+Math.random()*20)+"%";$("#resume .win").appendChild(s);beep(90,50,.18,"square",.12);beep(160,70,.08,"triangle",.06,.02)});
}

/* ---------- Contact: Y2K buddy list ---------- */
if(B.contains("theme-messenger")){
  const mail=$("#contact .mail");
  const email=$("#contact a[href^='mailto:']")?.getAttribute("href")||"";
  const li=$("#linkedin")?.getAttribute("href")||"#";
  const buddy=document.createElement("div");buddy.className="buddy";
  buddy.innerHTML=`<div class="buddy-head"><span class="runner" aria-hidden="true">🏃</span>Buddy List</div>
    <div class="buddy-body"><div class="buddy-group">Planners (1/1)</div>
      <div class="buddy-row"><span class="on" aria-hidden="true"></span><b>ChristopherT</b><a href="${email}">Message</a></div>
      <p class="away" id="away">Away message: probably on the 594. Leave a message!</p>
      <div class="typing" id="typing" aria-live="polite"></div>
      <div class="buddy-group">Also find me</div>
      <div class="buddy-row"><span class="on" aria-hidden="true" style="filter:hue-rotate(160deg)"></span><b>LinkedIn</b><a href="${li}" target="_blank" rel="noopener">Profile</a></div></div>`;
  (mail||$("#contact .win-body")).after(buddy);
  const aways=["Away message: probably on the 594. Leave a message!","Away message: at an ORCA sign-up table. BRB.","Away message: geocoding. Do not disturb (but do email).","Away message: watching for the mountain to come out."];
  let k=0;setInterval(()=>{$("#away").textContent=aways[++k%aways.length]},9000);
  const typing=$("#typing");
  setInterval(()=>{typing.innerHTML='ChristopherT is typing<i></i><i></i><i></i>';setTimeout(()=>typing.textContent="",2600)},12000);
  /* the classic door-opening sound, if sound is on */
  addEventListener("load",()=>setTimeout(()=>{try{if(localStorage.getItem("ct-sound")==="on"){beep(330,330,.12,"square",.04);beep(440,660,.18,"triangle",.05,.12)}}catch(e){}},600));
}
})();
