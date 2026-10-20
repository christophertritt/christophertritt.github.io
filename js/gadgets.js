/* Start page sidebar gadgets: feed headlines, notes, live transit departures and alerts
   near wherever weather.js thinks you are, and a front page of feed stories with pictures. */
(() => {
const $ = (s, r = document) => r.querySelector(s);
if (!$(".start-grid")) return;
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const ls = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
};
const ago = iso => { const s = (Date.now() - new Date(iso)) / 1000;
  if (s < 3600) return Math.max(1, Math.round(s / 60)) + " min ago"; if (s < 86400) return Math.round(s / 3600) + " h ago";
  if (s < 86400 * 7) return Math.round(s / 86400) + " d ago"; return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" }); };

/* ===================== feeds: headlines + front page ===================== */
let feedData = null, srcIdx = ls.get("start-gh-src", 0), topic = ls.get("start-fp-topic", "All");
const readSet = () => new Set(ls.get("start-read", []));
function markRead(id) { const r = ls.get("start-read", []); if (!r.includes(id)) { r.push(id); ls.set("start-read", r.slice(-3000)); } }
const sources = () => [{ id: "all", name: "All feeds", color: "#3d93dc" }, ...(feedData?.feeds || []).filter(f => f.ok !== false)];

function renderHeads() {
  const list = $("#ghList"); if (!list || !feedData) return;
  const srcs = sources(); srcIdx = ((srcIdx % srcs.length) + srcs.length) % srcs.length; const src = srcs[srcIdx];
  const read = readSet(), F = Object.fromEntries(feedData.feeds.map(f => [f.id, f]));
  const items = feedData.items.filter(i => src.id === "all" || i.feed === src.id).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7);
  $("#ghSrc").innerHTML = `<span class="dot" style="--c:${esc(src.color)}"></span><span>${esc(src.name)}</span><span class="g-count">${srcIdx + 1} of ${srcs.length}</span>`;
  list.innerHTML = items.length ? items.map(i => { const f = F[i.feed] || {};
    return `<li class="${read.has(i.id) ? "read" : ""}"><a href="${esc(i.link)}" target="_blank" rel="noopener" data-id="${esc(i.id)}">
      <span class="gh-t">${esc(i.title)}</span><span class="gh-m"><span class="dot" style="--c:${esc(f.color || "#3d93dc")}"></span>${src.id === "all" ? esc(f.name) + " · " : ""}${ago(i.date)}</span></a></li>`; }).join("")
    : `<li class="g-empty">Nothing new here.</li>`;
  $("#ghUpd").textContent = "Updated " + ago(feedData.updated);
}
function renderFront() {
  const grid = $("#fpGrid"); if (!grid || !feedData) return;
  const F = Object.fromEntries(feedData.feeds.map(f => [f.id, f]));
  const topics = ["All", ...new Set(feedData.feeds.filter(f => f.ok !== false).map(f => f.topic))];
  if (!topics.includes(topic)) topic = "All";
  $("#fpTabs").innerHTML = topics.map(t => `<button type="button" aria-pressed="${t === topic}" data-topic="${esc(t)}">${esc(t)}</button>`).join("");
  const perFeed = {}, read = readSet();
  const items = feedData.items.filter(i => i.image && (topic === "All" || F[i.feed]?.topic === topic))
    .sort((a, b) => b.date.localeCompare(a.date))
    .filter(i => (perFeed[i.feed] = (perFeed[i.feed] || 0) + 1) <= (topic === "All" ? 2 : 4)).slice(0, 8);
  grid.innerHTML = items.length ? items.map(i => { const f = F[i.feed] || {};
    return `<li class="fp-card${read.has(i.id) ? " read" : ""}"><a href="${esc(i.link)}" target="_blank" rel="noopener" data-id="${esc(i.id)}">
      <span class="fp-img"><img src="${esc(i.image)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.parentNode.classList.add('noimg');this.remove()"></span>
      <span class="fp-meta"><span class="dot" style="--c:${esc(f.color || "#3d93dc")}"></span>${esc(f.name || i.feed)} · ${ago(i.date)}</span>
      <span class="fp-t">${esc(i.title)}</span></a></li>`; }).join("")
    : `<li class="g-empty">No picture stories in ${esc(topic)} right now.</li>`;
}
async function loadFeeds() {
  try {
    const r = await fetch("/feeds/items.json?t=" + Math.floor(Date.now() / 300000), { cache: "no-cache" });
    if (!r.ok) throw new Error("HTTP " + r.status);
    feedData = await r.json(); renderHeads(); renderFront();
  } catch (e) { $("#ghList").innerHTML = `<li class="g-empty">Couldn't load headlines.</li>`; console.warn(e); }
}
$("#ghPrev")?.addEventListener("click", () => { srcIdx--; ls.set("start-gh-src", srcIdx); renderHeads(); });
$("#ghNext")?.addEventListener("click", () => { srcIdx++; ls.set("start-gh-src", srcIdx); renderHeads(); });
$("#fpTabs")?.addEventListener("click", e => { const b = e.target.closest("[data-topic]"); if (!b) return; topic = b.dataset.topic; ls.set("start-fp-topic", topic); renderFront(); });
document.addEventListener("click", e => { const a = e.target.closest("#ghList a[data-id], #fpGrid a[data-id]"); if (!a) return;
  markRead(a.dataset.id); a.closest("li").classList.add("read"); });
loadFeeds(); setInterval(() => { if (!document.hidden) loadFeeds(); }, 15 * 60 * 1000);

/* ===================== notes ===================== */
const note = $("#noteText");
if (note) { note.value = ls.get("start-notes", ""); let t;
  note.addEventListener("input", () => { clearTimeout(t); $("#noteSaved").textContent = "Saving…";
    t = setTimeout(() => { ls.set("start-notes", note.value); $("#noteSaved").textContent = "Saved in this browser"; }, 400); }); }

/* ===================== transit (OneBusAway Puget Sound) ===================== */
const OBA = "https://api.pugetsound.onebusaway.org/api/where/";
const key = () => (ls.get("ct-oba-key", "") || "TEST").trim();
const FALLBACK = { key: "home", label: "Home", city: "Tacoma", lat: 47.2529, lon: -122.4443 };
const AGENCY_COLOR = { "1": "#00704a", "40": "#2b376e", "3": "#2c6e3f", "29": "#0f6db3", "95": "#5a2d82", "97": "#e3742b", "98": "#c8102e", "19": "#1f6f9e", "23": "#1a5ea6" };
let place = null, stops = [], deps = [], situations = new Map(), lastOk = 0, timer = 0, busy = false, backoff = 0;

const wait = ms => new Promise(r => setTimeout(r, ms));
async function oba(path, params = {}) {
  const u = new URL(OBA + path); u.searchParams.set("key", key());
  Object.entries(params).forEach(([k, v]) => u.searchParams.set(k, v));
  for (let tries = 0; tries < 3; tries++) {
    const r = await fetch(u); let j = null; try { j = await r.json(); } catch (e) {}
    if (j && j.code === 200) return j.data;
    if ((j && j.code === 429) || r.status === 429) { await wait((key() === "TEST" ? 9000 : 2500) * (tries + 1)); continue; }
    throw new Error((j && j.text) || "HTTP " + r.status);
  }
  const err = new Error("rate limited"); err.rate = true; throw err;
}
const km = (a, b, c, d) => { const R = 6371, x = (c - a) * Math.PI / 180, y = (d - b) * Math.PI / 180;
  const h = Math.sin(x / 2) ** 2 + Math.cos(a * Math.PI / 180) * Math.cos(c * Math.PI / 180) * Math.sin(y / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); };

/* one call returns every departure around a point; group them into a board of
   route + destination, each from its nearest stop, with the next two times */
async function refreshTransit() {
  if (busy || !place) return; busy = true;
  try {
    const d = await oba("arrivals-and-departures-for-location.json", { lat: place.lat, lon: place.lon, radius: 600, minutesBefore: 0, minutesAfter: 75 });
    const refs = d.references || {}, routes = Object.fromEntries((refs.routes || []).map(r => [r.id, r]));
    const stopRef = Object.fromEntries((refs.stops || []).map(s => [s.id, { ...s, m: km(place.lat, place.lon, s.lat, s.lon) * 1000 }]));
    const groups = new Map(), now = Date.now();
    for (const a of d.entry.arrivalsAndDepartures || []) {
      if (a.departureEnabled === false) continue;
      const live = a.predicted && (a.predictedDepartureTime > 0 || a.predictedArrivalTime > 0);
      const t = live ? (a.predictedDepartureTime > 0 ? a.predictedDepartureTime : a.predictedArrivalTime) : (a.scheduledDepartureTime || a.scheduledArrivalTime);
      if (t < now - 30000) continue;
      const st = stopRef[a.stopId] || { name: "", m: 9e9 }, r = routes[a.routeId] || {};
      const k = a.routeId + "|" + (a.tripHeadsign || ""), g = groups.get(k);
      const dep = { t, live, trip: a.tripId };
      if (!g || st.m < g.m - 25) groups.set(k, { k, m: st.m, stopId: a.stopId, stop: st.name, route: a.routeShortName || r.shortName || r.nullSafeShortName || "?",
          head: a.tripHeadsign || r.description || "", color: r.color ? "#" + r.color : AGENCY_COLOR[(a.routeId || "").split("_")[0]] || "#3d93dc",
          text: r.textColor ? "#" + r.textColor : "#fff", times: [dep], situ: new Set(a.situationIds || []) });
      else if (Math.abs(st.m - g.m) <= 25 && !g.times.some(x => x.trip === dep.trip)) { g.times.push(dep); (a.situationIds || []).forEach(x => g.situ.add(x)); }
    }
    deps = [...groups.values()].map(g => (g.times.sort((a, b) => a.t - b.t), { ...g, t: g.times[0].t, situ: [...g.situ] })).sort((a, b) => a.t - b.t);
    stops = [...new Set(deps.slice(0, 7).map(g => g.stopId))];
    situations = new Map((refs.situations || []).map(x => [x.id, x]));
    lastOk = Date.now(); backoff = 0;
    if (!Object.keys(stopRef).length && !deps.length) { showNoStops(); return; }
    renderTransit(); renderAlerts();
  } catch (e) {
    backoff = Math.min(backoff + 1, 4);
    $("#gtUpd").textContent = e.rate ? (key() === "TEST" ? "Busy (shared test key). Retrying soon." : "Busy. Retrying soon.") : "Couldn't reach OneBusAway.";
    if (!deps.length) $("#gtList").innerHTML = `<li class="g-empty">${e.rate ? "OneBusAway is rate-limiting the shared key. Arrivals will show up on the next try, or add your own key below." : "Arrivals aren't available right now."}</li>`;
    console.warn("transit:", e.message);
  } finally { busy = false; schedule(); }
}
function showNoStops() {
  $("#gtWhere").textContent = place.key === "away" ? `${place.city || "Here"} is outside OneBusAway's Puget Sound area.` : `No stops within a short walk of ${place.label}.`;
  $("#gtList").innerHTML = `<li class="g-empty">Pick Home or Work above to see those departures instead.</li>`; $("#gtLive").hidden = true;
}
function schedule() { clearTimeout(timer); timer = setTimeout(() => { if (!document.hidden) refreshTransit(); else schedule(); }, (key() === "TEST" ? 90 : 45) * 1000 * (1 + backoff)); }

function mins(t) { const m = Math.round((t - Date.now()) / 60000); return m <= 0 ? "Now" : m < 60 ? m + " min" : new Date(t).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/Los_Angeles" }); }
function renderTransit() {
  const list = $("#gtList"); if (!list) return;
  const now = Date.now(), rows = deps.map(g => ({ ...g, times: g.times.filter(x => x.t > now - 30000) })).filter(g => g.times.length).sort((a, b) => a.times[0].t - b.times[0].t).slice(0, 7);
  const short = s => s.replace(/ - Bay (\d+)/i, " · Bay $1").replace(/\bStation\b/, "Stn");
  const n = new Set(rows.map(r => r.stopId)).size;
  $("#gtWhere").innerHTML = `<span class="pin" aria-hidden="true"></span>${esc(place.label)}${place.city && place.city !== place.label ? " · " + esc(place.city) : ""} <span class="g-count">${n} stop${n === 1 ? "" : "s"}</span>`;
  const when = x => `<span class="${x.live ? "live" : "sched"}" title="${x.live ? "Real-time prediction" : "Scheduled time"}">${mins(x.t)}${x.live ? '<i aria-hidden="true"></i>' : ""}<span class="vh">${x.live ? " live" : " scheduled"}</span></span>`;
  list.innerHTML = rows.length ? rows.map(d => `<li><span class="rt" style="--rc:${esc(d.color)};--rt:${esc(d.text)}">${esc(d.route)}</span>
      <span class="gt-dest"><b>${esc(d.head)}</b><small>${esc(short(d.stop))} · ${Math.max(1, Math.round(d.m / 80))} min walk</small></span>
      <span class="gt-when">${when(d.times[0])}${d.times[1] ? `<small>then ${mins(d.times[1].t)}</small>` : ""}</span></li>`).join("")
    : `<li class="g-empty">No departures in the next hour.</li>`;
  $("#gtLive").hidden = !rows.some(d => d.times[0].live);
  if (lastOk) $("#gtUpd").textContent = "Updated " + new Date(lastOk).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/Los_Angeles" });
  if (rows[0]) $("#gtMore").href = `https://pugetsound.onebusaway.org/where/standard/stop.action?id=${encodeURIComponent(rows[0].stopId)}`;
}
function renderAlerts() {
  const box = $(".g-alerts"); if (!box) return;
  const shown = new Set(deps.slice(0, 10).flatMap(d => d.situ));
  const list = [...situations.values()].filter(s => shown.has(s.id) || !shown.size).slice(0, 3);
  box.hidden = !list.length; if (!list.length) return;
  $("#gaList").innerHTML = list.map(s => { const sum = s.summary?.value || "Service change", desc = (s.description?.value || "").replace(/\s+/g, " ").trim();
    const url = s.url?.value || "";
    return `<li class="sev-${esc((s.severity || "unknown").toLowerCase())}"><b>${esc(sum)}</b>${desc && desc !== sum ? `<span>${esc(desc.length > 160 ? desc.slice(0, 157) + "…" : desc)}</span>` : ""}${url ? `<a href="${esc(url)}" target="_blank" rel="noopener">Details ↗</a>` : ""}</li>`; }).join("");
}
setInterval(() => { if (deps.length && !document.hidden) renderTransit(); }, 20000);
document.addEventListener("visibilitychange", () => { if (!document.hidden && place && Date.now() - lastOk > 60000) refreshTransit(); });

function setPlace(p) {
  if (!p || p.lat == null) return;
  if (place && Math.abs(place.lat - p.lat) < 1e-3 && Math.abs(place.lon - p.lon) < 1e-3) { place = { ...place, label: p.label, city: p.city }; if (deps.length) renderTransit(); return; }
  place = { key: p.key, label: p.label || "Here", city: p.city || "", lat: +p.lat, lon: +p.lon };
  stops = []; deps = []; $("#gtWhere").textContent = `Finding stops near ${place.label}…`; $("#gtList").innerHTML = "";
  refreshTransit();
}
/* Here follows weather.js's idea of where you are; Home and Work pin the gadget to those places */
const PLACES = { home: FALLBACK, work: { key: "work", label: "Work", city: "Bellevue", lat: 47.6148, lon: -122.1925 } };
let pick = ls.get("ct-transit-place", "auto");
const herePlace = () => window.Weather?.place || null;
function applyPick() {
  document.querySelectorAll(".gt-places [data-tp]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.tp === pick)));
  if (pick !== "auto") return setPlace(PLACES[pick]);
  const h = herePlace(); if (h) setPlace(h);
}
$(".gt-places")?.addEventListener("click", e => { const b = e.target.closest("[data-tp]"); if (!b) return; pick = b.dataset.tp; ls.set("ct-transit-place", pick); applyPick(); });
document.addEventListener("weather:update", () => { if (pick === "auto") applyPick(); });
applyPick();
setTimeout(() => { if (!place) setPlace(herePlace() || FALLBACK); }, 5000);

const kf = $("#gtKeyForm");
if (kf) { $("#gtKey").value = ls.get("ct-oba-key", "");
  kf.addEventListener("submit", e => { e.preventDefault(); ls.set("ct-oba-key", $("#gtKey").value.trim()); backoff = 0; kf.closest("details").open = false; refreshTransit(); }); }
})();
