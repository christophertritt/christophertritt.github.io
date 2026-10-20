/* One bit of logic per portfolio page theme. Runs before home.js; sounds use home.js's tone() at click time. */
(()=>{
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
const beep=(...a)=>{if(typeof tone==="function")tone(...a)};
const B=document.body.classList;

/* ---------- Projects: a split-flap departure board of the case studies ---------- */
if(B.contains("theme-transit")&&typeof projects!=="undefined"){
  const head=$("#work .head");
  const lines={transportation:["#2f86d6","T"],environment:["#4a9a3a","E"],housing:["#7a4f96","H"],data:["#e08a0c","D"],health:["#c25b7d","PH"]};
  const board=document.createElement("div");board.className="dboard";
  board.innerHTML=`<div class="dboard-head"><span>Case study departures</span><span id="dbClock"></span></div>
    <table><thead><tr><th>Line</th><th>Destination</th><th>Platform</th><th>Status</th></tr></thead><tbody>${projects.map((p,i)=>{const l=lines[p.tags[0]]||["#3d93dc","X"];
      return `<tr class="row" tabindex="0" data-id="${p.id}" aria-label="Open the ${p.title} case study"><td><span class="rt" style="background:${l[0]}">${l[1]}</span></td><td><span class="flap" data-text="${p.title.toUpperCase()}"></span></td><td>${i+1}</td><td class="${p.status?"wip":"ok"}">${p.status?"DELAYED: IN PROGRESS":"ON TIME"}</td></tr>`}).join("")}</tbody></table>`;
  head.after(board);
  /* letters flip through the alphabet before landing */
  const A=" ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-";
  $$(".flap",board).forEach((el,k)=>{const target=el.dataset.text;if(reduce){el.textContent=target;return}
    let step=0;const iv=setInterval(()=>{step++;el.textContent=[...target].map((ch,i)=>step>i*.6+8+k*2?ch:(ch===" "?" ":A[Math.floor(Math.random()*A.length)])).join("");
      if(el.textContent===target)clearInterval(iv)},45)});
  board.addEventListener("click",e=>{const r=e.target.closest("tr.row");if(r&&typeof openCase==="function")openCase(r.dataset.id)});
  board.addEventListener("keydown",e=>{const r=e.target.closest("tr.row");if(r&&(e.key==="Enter"||e.key===" ")){e.preventDefault();openCase(r.dataset.id)}});
  const clk=$("#dbClock",board);const t=()=>clk.textContent=new Date().toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit",timeZone:"America/Los_Angeles"})+" PT";t();setInterval(t,15000);
  /* a #transportation style link from the old single page still filters */
  const f=location.hash.slice(1);if(f&&typeof T!=="undefined"&&T[f])addEventListener("load",()=>typeof filter==="function"&&filter(f));
}

/* ---------- Skills: GeoCities, 1999 ---------- */
if(B.contains("theme-geocities")){
  const sec=$("#skills .win-body"), h2=$("#skills h2");
  if(h2)h2.innerHTML=`<span class="wordart">${h2.textContent}</span>`;
  let n=594;try{n=(+localStorage.getItem("ct-visits")||593)+1;localStorage.setItem("ct-visits",n)}catch(e){}
  const strip=document.createElement("div");strip.className="geo-strip";
  strip.innerHTML=`<div class="uc"><span>🚧 This page is always under construction 🚧</span></div>
    <span class="counter">You are visitor <b>${String(n).padStart(6,"0").split("").map(d=>`<i>${d}</i>`).join("")}</b></span>
    <span class="badge88">Best viewed at 800×600</span>`;
  $("#skills .head").after(strip);
  const dt=$$("#skills .cols h3").find(h=>/data/i.test(h.textContent));if(dt)dt.insertAdjacentHTML("beforeend",'<span class="newstar" aria-hidden="true">NEW!</span>');
  /* a sparkle trail follows the cursor, like it's 1999 */
  if(!reduce){let last=0;addEventListener("pointermove",e=>{const now=performance.now();if(now-last<40)return;last=now;
    const s=document.createElement("span");s.className="sparkle";s.textContent=["✦","✧","★","✩"][Math.floor(Math.random()*4)];
    s.style.left=e.clientX+"px";s.style.top=e.clientY+"px";s.style.color=["#ffe68a","#9fe8ff","#ff9fd2","#b9ff8a"][Math.floor(Math.random()*4)];
    document.body.appendChild(s);setTimeout(()=>s.remove(),900)},{passive:true})}
}

/* ---------- About: is the mountain out? (real cloud cover over Tacoma) ---------- */
if(B.contains("theme-waterfront")){
  const pill=document.createElement("p");pill.className="mtn-pill";pill.textContent="🏔️ Checking if the mountain is out…";
  const first=$("#about .win-body > div");if(first)first.prepend(pill);
  (async()=>{try{
    const c=(await (await fetch("https://api.open-meteo.com/v1/forecast?latitude=47.2529&longitude=-122.4443&current=cloud_cover,is_day")).json()).current;
    const out=c.cloud_cover<45;
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
