/* Shared logic for the archive pages, plus one interactive idea per page. */
(()=>{
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
const page=(location.pathname.split("/").filter(Boolean)[0]||"").toLowerCase();
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const store={get(k,d){try{const v=localStorage.getItem("ct-"+k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem("ct-"+k,JSON.stringify(v))}catch(e){}}};

/* tiny synth, only after a click (browsers require a gesture) */
let ac=null;
function tone(f1,f2,dur,type="sine",vol=.08,delay=0){
  try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();const t=ac.currentTime+delay,o=ac.createOscillator(),g=ac.createGain();
    o.type=type;o.frequency.setValueAtTime(f1,t);o.frequency.exponentialRampToValueAtTime(f2,t+dur*.7);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    o.connect(g).connect(ac.destination);o.start(t);o.stop(t+dur+.02)}catch(e){}
}
const soundOn=()=>{try{return localStorage.getItem("ct-sound")==="on"}catch(e){return false}};
const blip=(a,b,d,t,v,dl)=>{if(soundOn())tone(a,b,d,t,v,dl)};

function burst(x,y,n=14){
  if(reduce) return;
  for(let i=0;i<n;i++){
    const el=document.createElement("span");el.className="ax-pt";document.body.appendChild(el);
    const a=(-90+(Math.random()*120-60))*Math.PI/180,d=60+Math.random()*120,s=.5+Math.random()*1.2;
    el.animate([{transform:`translate(${x}px,${y}px) scale(.3)`,opacity:1},{transform:`translate(${x+Math.cos(a)*d}px,${y+Math.sin(a)*d}px) scale(${s})`,opacity:0}],
      {duration:800+Math.random()*500,easing:"cubic-bezier(.2,.8,.3,1)"}).onfinish=()=>el.remove();
  }
}
const burstFrom=el=>{const r=el.getBoundingClientRect();burst(r.left+r.width/2,r.top+r.height/2)};

let toastT;
function toast(msg){
  let t=$(".ax-toast");if(!t){t=document.createElement("div");t.className="ax-toast";t.setAttribute("role","status");document.body.appendChild(t)}
  t.textContent=msg;t.classList.add("on");clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove("on"),2800);
}

/* back to the desktop, with a little eye that watches you */
const home=document.createElement("a");home.className="ax-home";home.href="/";
home.innerHTML='<span class="ax-eye" aria-hidden="true"><span class="ax-iris"></span><span class="ax-lid"></span></span><span>Back to desktop</span>';
document.body.appendChild(home);
const axEye=$(".ax-eye",home), axIris=$(".ax-iris",home);
addEventListener("pointermove",e=>{const r=axEye.getBoundingClientRect(),dx=e.clientX-r.left-r.width/2,dy=e.clientY-r.top-r.height/2,d=Math.hypot(dx,dy)||1,m=Math.min(6,d/20);
  axIris.style.transform=`translate(${dx/d*m}px,${dy/d*m}px)`},{passive:true});
(function blink(){setTimeout(()=>{axEye.classList.add("blink");setTimeout(()=>axEye.classList.remove("blink"),140);blink()},2500+Math.random()*4000)})();

function panel(html,where,how="beforebegin"){const p=document.createElement("div");p.className="ax-panel";p.innerHTML=html;where.insertAdjacentElement(how,p);return p}
function seg(name,opts,cur,onPick){
  const s=document.createElement("span");s.className="ax-seg";s.setAttribute("role","group");s.setAttribute("aria-label",name);
  s.innerHTML=opts.map(o=>`<button type="button" data-v="${o}" aria-pressed="${o===cur}">${o}</button>`).join("");
  s.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;$$("button",s).forEach(x=>x.setAttribute("aria-pressed",String(x===b)));onPick(b.dataset.v);blip(600,900,.08)});
  return s;
}

/* lightbox for any set of images */
function lightbox(imgs){
  if(!imgs.length) return;
  const lb=document.createElement("div");lb.className="ax-lb";lb.hidden=true;lb.setAttribute("role","dialog");lb.setAttribute("aria-modal","true");lb.setAttribute("aria-label","Image viewer");
  lb.innerHTML='<figure><img alt=""><figcaption></figcaption><div class="ax-nav"><button type="button" class="ax-btn" data-d="-1">‹ Prev</button><button type="button" class="ax-btn green" data-x>Close</button><button type="button" class="ax-btn" data-d="1">Next ›</button></div></figure>';
  document.body.appendChild(lb);
  let i=0;const show=n=>{i=(n+imgs.length)%imgs.length;const im=imgs[i];$("img",lb).src=im.currentSrc||im.src;$("img",lb).alt=im.alt;
    const cap=im.closest("figure")?.querySelector("figcaption");$("figcaption",lb).innerHTML=cap?cap.innerHTML:im.alt;$("figure",lb).style.animation="none";void lb.offsetWidth;$("figure",lb).style.animation=""};
  const close=()=>{lb.hidden=true;imgs[i].focus?.()};
  imgs.forEach((im,n)=>{im.classList.add("ax-zoom");im.tabIndex=0;im.addEventListener("click",()=>{show(n);lb.hidden=false;$("[data-x]",lb).focus();blip(500,900,.12)});
    im.addEventListener("keydown",e=>{if(e.key==="Enter"){im.click()}})});
  lb.addEventListener("click",e=>{if(e.target===lb||e.target.closest("[data-x]"))close();const d=e.target.closest("[data-d]");if(d)show(i+ +d.dataset.d)});
  addEventListener("keydown",e=>{if(lb.hidden)return;if(e.key==="Escape")close();if(e.key==="ArrowRight")show(i+1);if(e.key==="ArrowLeft")show(i-1)});
}

/* ================= per-page logic ================= */
const pages={
  blog(){
    /* reading progress */
    const bar=document.createElement("div");bar.className="ax-progress";document.body.appendChild(bar);
    const upd=()=>{const h=document.documentElement.scrollHeight-innerHeight;bar.style.width=(h>0?scrollY/h*100:0)+"%"};addEventListener("scroll",upd,{passive:true});upd();
    /* sidebar teasers expand and collapse */
    $$("aside a.expand").forEach(a=>{const p=a.closest("p");p.classList.add("ax-clamp");a.setAttribute("role","button");a.setAttribute("aria-expanded","false");a.setAttribute("aria-label","Read more");
      /* keep the dots outside the clamped text */
      p.after(a);
      a.addEventListener("click",e=>{e.preventDefault();const open=p.classList.toggle("ax-clamp")===false;a.setAttribute("aria-expanded",String(open));a.setAttribute("aria-label",open?"Read less":"Read more");blip(open?500:800,open?800:500,.1)})});
    /* subscribe for real-ish */
    const sub=$("article > button");
    if(sub){sub.classList.add("ax-btn","pink");
      const paint=()=>{const on=store.get("blog-sub",false);sub.textContent=on?"Subscribed ✓":"Subscribe";sub.setAttribute("aria-pressed",String(on))};paint();
      sub.addEventListener("click",()=>{const on=!store.get("blog-sub",false);store.set("blog-sub",on);paint();
        if(on){burstFrom(sub);blip(523,1047,.3,"triangle",.08);toast("You're subscribed. There is no newsletter, but the thought counts.")}else{toast("Unsubscribed. The tote bag will miss you.");blip(400,200,.3)}})}
    /* photo lightbox */
    lightbox($$("main img"));
    /* the nav links pretend to work */
    $$("nav a").forEach(a=>a.addEventListener("click",e=>{e.preventDefault();toast(`${a.textContent.trim()} is still being written. Come back after the next pour-over.`)}));
    const t=$("time");if(t&&!t.getAttribute("datetime"))t.setAttribute("datetime","2023-03-13");
  },

  "letter-markup"(){
    /* glossy tooltips for abbreviations */
    let tip=null;
    const show=a=>{hide();tip=document.createElement("span");tip.className="ax-tip";tip.textContent=a.title;document.body.appendChild(tip);
      const r=a.getBoundingClientRect();tip.style.left=Math.max(8,Math.min(innerWidth-tip.offsetWidth-8,r.left+scrollX+r.width/2-tip.offsetWidth/2))+"px";tip.style.top=(r.top+scrollY-tip.offsetHeight-8)+"px"};
    const hide=()=>{if(tip){tip.remove();tip=null}};
    $$("abbr[title]").forEach(a=>{a.dataset.t=a.title;a.tabIndex=0;a.addEventListener("pointerenter",()=>show(a));a.addEventListener("pointerleave",hide);a.addEventListener("focus",()=>show(a));a.addEventListener("blur",hide);
      a.addEventListener("click",()=>{show(a);blip(900,1200,.06)})});
    /* every date says how long ago it was */
    const ago=d=>{const y=(Date.now()-d)/31557600000;return y>=1?`${Math.floor(y)} year${Math.floor(y)===1?"":"s"} ago`:`${Math.round(y*12)} months ago`};
    $$("time[datetime]").forEach(t=>{const d=new Date(t.getAttribute("datetime"));if(isNaN(d))return;const c=document.createElement("span");c.className="ax-ago";c.textContent=ago(d);t.after(c)});
    /* seal the letter into an envelope and send it */
    const env=document.createElement("div");env.className="ax-env";env.innerHTML='<span class="ax-stamp">University<br>of<br>Awesome</span><button type="button" class="ax-seal" aria-label="Open the letter">A</button><p>To: Miss Eileen Dover</p>';
    document.body.appendChild(env);
    const p=panel('<b>Done reading?</b>',$("body > p:last-of-type"),"afterend");
    const seal=document.createElement("button");seal.type="button";seal.className="ax-btn pink";seal.textContent="Seal it in an envelope";p.appendChild(seal);
    const send=document.createElement("button");send.type="button";send.className="ax-btn";send.textContent="Fold it into a paper airplane";p.appendChild(send);
    seal.addEventListener("click",()=>{document.body.classList.add("ax-sealed");scrollTo(0,0);blip(300,150,.25,"triangle",.1);toast("Sealed with wax. Click the seal to open it again.")});
    $(".ax-seal",env).addEventListener("click",()=>{document.body.classList.remove("ax-sealed");blip(600,1200,.2);burstFrom(seal);seal.focus()});
    send.addEventListener("click",()=>{
      const plane=document.createElement("div");plane.textContent="✈";plane.style.cssText="position:fixed;left:40%;top:60%;font-size:64px;z-index:9003;color:#3d93dc;text-shadow:0 6px 12px rgba(0,0,0,.25)";
      document.body.appendChild(plane);plane.classList.add("ax-fly");blip(400,1600,.9,"sine",.06);setTimeout(()=>plane.remove(),1300);toast("Whoosh. Eileen will get it eventually.")});
  },

  "planets-table"(){
    const table=$("table");if(!table) return;
    const wrap=document.createElement("div");wrap.className="ax-scroll";wrap.tabIndex=0;wrap.setAttribute("role","region");wrap.setAttribute("aria-label","Planet data table, scrolls sideways");table.before(wrap);wrap.appendChild(table);
    const head=$$("thead th",table).map(th=>th.textContent.trim());
    const col=name=>head.findIndex(h=>h.startsWith(name));
    const iG=col("Gravity"), iT=col("Mean temperature"), iD=col("Distance from Sun");
    const rows=$$("tbody tr",table).map(tr=>{const tds=$$("td",tr);return {tr,name:$('th[scope=row]',tr).textContent.trim(),tds,
      g:parseFloat(tds[iG-1].textContent),tC:parseFloat(tds[iT-1].textContent),dist:parseFloat(tds[iD-1].textContent.replace(/,/g,"")),tCell:tds[iT-1],dCell:tds[iD-1]}});
    /* your weight on every world */
    const th=document.createElement("th");th.scope="col";th.textContent="Your weight";$("thead tr",table).appendChild(th);
    rows.forEach(r=>{const td=document.createElement("td");td.className="ax-weight";r.tr.appendChild(td);r.w=td});
    const p=panel('<label>I weigh <input type="number" id="axw" min="1" max="2000" inputmode="decimal" style="width:6.5em"> on Earth</label>',wrap);
    let unit=store.get("planet-unit","lb");
    const upd=()=>{const w=parseFloat($("#axw").value)||0;rows.forEach(r=>{r.w.textContent=w?`${(w*r.g/9.8).toFixed(1)} ${unit}`:"—"})};
    p.appendChild(seg("Weight unit",["lb","kg"],unit,v=>{unit=v;store.set("planet-unit",v);upd()}));
    $("#axw").value=store.get("planet-w",150);$("#axw").addEventListener("input",e=>{store.set("planet-w",e.target.value);upd()});upd();
    /* Celsius or Fahrenheit */
    let tu="°C";
    p.appendChild(seg("Temperature unit",["°C","°F"],tu,v=>{tu=v;const thT=$$("thead th",table)[iT];thT.innerHTML=`Mean temperature (${v})`;
      rows.forEach(r=>{r.tCell.textContent=v==="°C"?r.tC:Math.round(r.tC*9/5+32)})}));
    /* how long sunlight takes to get there */
    rows.forEach(r=>{const s=r.dist*1e9/299792458, m=Math.floor(s/60), sec=Math.round(s%60);const sp=document.createElement("span");sp.className="ax-light";
      sp.textContent=m>=60?`☀ light: ${Math.floor(m/60)} h ${m%60} min`:`☀ light: ${m} min ${sec} s`;r.dCell.appendChild(sp)});
    /* click a planet to give it a spin */
    rows.forEach(r=>{const im=$("img",r.tr);if(!im)return;im.tabIndex=0;im.setAttribute("role","button");im.setAttribute("aria-label",`Spin ${r.name}`);
      const go=()=>{im.classList.toggle("spin");if(im.classList.contains("spin")){blip(200+r.g*30,400+r.g*30,.3,"triangle",.07);toast(`${r.name}: a day lasts ${r.tds[col("Length of day")-1].textContent} hours.`)}};
      im.addEventListener("click",go);im.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();go()}})});
  },

  "school-site"(){
    /* search the long list */
    const list=$(".long-list");
    if(list){
      const items=$$("li",list);
      const p=panel('<label style="display:grid;gap:6px;width:100%">Find a program <input type="search" id="axq" placeholder="try “prism”" style="width:100%"></label><span class="ax-count" aria-live="polite"></span>',list);
      const cnt=$(".ax-count",p);
      const run=()=>{const q=$("#axq").value.trim().toLowerCase();let n=0;items.forEach(li=>{const on=!q||li.textContent.toLowerCase().includes(q);li.classList.toggle("ax-hide",!on);if(on)n++});
        cnt.textContent=q?`${n} match${n===1?"":"es"}`:`${items.length} programs`};
      $("#axq").addEventListener("input",run);run();
    }
    /* invent a degree from the site's own words */
    const words=[...new Set($$("nav a, .long-list a, h2").flatMap(a=>a.textContent.trim().split(/\s+/)).filter(w=>w.length>2))];
    const degrees=["B.A. in","M.S. in","Ph.D. in","Certificate in","Minor in"];
    const firstSection=$("main section");
    const p2=panel('<button type="button" class="ax-btn green" id="axdeg">Generate my degree</button><span class="ax-course" aria-live="polite"></span>',firstSection,"afterbegin");
    const pick=a=>a[Math.floor(Math.random()*a.length)];
    $("#axdeg").addEventListener("click",e=>{$(".ax-course",p2).textContent=`${pick(degrees)} ${pick(words)} ${pick(words)} Studies`;burstFrom(e.currentTarget);blip(523,1047,.25,"triangle",.08)});
    $$("nav a").forEach(a=>a.addEventListener("click",e=>{e.preventDefault();toast(`The ${a.textContent.trim()} department is on sabbatical.`)}));
  },

  "wanted-poster"(){
    /* the reward climbs */
    const h2=$$("section h2").find(h=>/reward/i.test(h.textContent));
    let reward=store.get("reward",500000);
    const fmt=n=>"$"+Math.round(n).toLocaleString("en-US");
    if(h2){h2.innerHTML=`<span class="ax-reward">${fmt(0)}</span> Reward`;const el=$(".ax-reward",h2);
      const t0=performance.now(),dur=reduce?1:1600;(function count(t){const k=Math.min(1,(t-t0)/dur);el.textContent=fmt(reward*(1-Math.pow(1-k,3)));if(k<1)requestAnimationFrame(count)})(t0);
      setInterval(()=>{if(document.hidden)return;reward+=Math.round(Math.random()*40+10)*25;store.set("reward",reward);el.textContent=fmt(reward)},7000)}
    /* the caution stars flash */
    $$("h4 span").forEach(s=>s.classList.add("ax-flash"));
    /* boop the suspect */
    const mug=$("figure img");
    if(mug){mug.classList.add("ax-boop");mug.tabIndex=0;mug.setAttribute("role","button");mug.setAttribute("aria-label","Boop the suspect");
      const boops=["Boop. Suspect is now 12% cuter.","He licked the evidence.","Do not make eye contact. Too late.","Suspect requested a belly rub and a lawyer."];
      const boop=()=>{burstFrom(mug);blip(800,1200,.1,"square",.05);blip(600,900,.12,"square",.05,.12);toast(boops[Math.floor(Math.random()*boops.length)])};
      mug.addEventListener("click",boop);mug.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();boop()}})}
    /* report sightings: paw prints everywhere */
    let n=store.get("sightings",0);
    const p=panel(`<button type="button" class="ax-btn orange" id="axsee">🐾 Report a sighting</button><span id="axn" aria-live="polite"></span>`,$("main footer"),"beforebegin");
    p.style.margin="16px";
    const paint=()=>{$("#axn",p).textContent=n?`${n} sighting${n===1?"":"s"} reported from this browser`:"No sightings yet"};paint();
    $("#axsee").addEventListener("click",()=>{n++;store.set("sightings",n);paint();blip(500,350,.12,"sawtooth",.05);blip(520,360,.12,"sawtooth",.05,.15);
      for(let i=0;i<6;i++){const f=document.createElement("span");f.className="ax-paw";f.textContent="🐾";f.style.left=Math.random()*(innerWidth-40)+"px";f.style.top=Math.random()*(innerHeight-40)+"px";
        f.style.setProperty("--r",(Math.random()*80-40)+"deg");f.style.animationDelay=(i*.12)+"s";document.body.appendChild(f);setTimeout(()=>f.remove(),3400)}
      toast(n%5===0?"That's a lot of sightings. He might be your dog.":"Thanks. The Department of Adorable Tiny Dogs has been notified.")});
  }
};
(pages[page]||(()=>{}))();
})();
