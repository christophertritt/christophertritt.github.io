// Fetches every feed in feeds/feeds.json and writes feeds/items.json for the start page.
// Run by .github/workflows/feeds.yml every hour. Needs Node 20+ and fast-xml-parser.
import { readFile, writeFile } from "node:fs/promises";
import { XMLParser } from "fast-xml-parser";

const config = JSON.parse(await readFile(new URL("../feeds/feeds.json", import.meta.url), "utf8"));
const perFeed = config.perFeed || 25;
const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@", textNodeName: "#text", cdataPropName: "#cdata" });

const text = v => {
  if (v == null) return "";
  if (Array.isArray(v)) return text(v[0]);
  if (typeof v === "object") return text(v["#cdata"] ?? v["#text"] ?? "");
  return String(v);
};
const entities = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", hellip: "…", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", mdash: "—", ndash: "–" };
const decode = s => s.replace(/&(#x?[0-9a-f]+|\w+);/gi, (m, e) => e[0] === "#" ? String.fromCodePoint(parseInt(e[1].toLowerCase() === "x" ? e.slice(2) : e.slice(1), e[1].toLowerCase() === "x" ? 16 : 10)) : (entities[e.toLowerCase()] ?? m));
const plain = html => decode(text(html).replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
const clip = (s, n) => s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, "") + "…" : s;
const firstImg = html => { const m = /<img[^>]+src=["']([^"']+)["']/i.exec(text(html)); return m ? m[1] : ""; };
const privateIpv4 = /^(10\.|127\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.)/;
const privateIpv6 = /^(::1|fc[0-9a-f]{2}:|fd[0-9a-f]{2}:|fe8[0-9a-f]:|fe9[0-9a-f]:|fea[0-9a-f]:|feb[0-9a-f]:)/i;
const safeHost = host => {
  if (!host) return false;
  const h = host.toLowerCase();
  if (h === "localhost" || h.endsWith(".local")) return false;
  if (privateIpv4.test(h)) return false;
  if (privateIpv6.test(h.replace(/^\[|\]$/g, ""))) return false;
  return true;
};
const safeFeedUrl = (input, context) => {
  const u = new URL(input, context);
  if (!/^https?:$/.test(u.protocol)) throw new Error(`Unsupported protocol: ${u.protocol}`);
  if (u.username || u.password) throw new Error("Credentials in URL are not allowed");
  if (!safeHost(u.hostname)) throw new Error(`Blocked host: ${u.hostname}`);
  return u;
};
const linkOf = l => {
  if (!l) return "";
  if (Array.isArray(l)) { const alt = l.find(x => typeof x === "object" && (!x["@rel"] || x["@rel"] === "alternate")); return linkOf(alt || l[0]); }
  if (typeof l === "object") return l["@href"] || text(l);
  return String(l);
};

async function fetchWithSafeRedirects(url, options, maxRedirects = 5) {
  let current = safeFeedUrl(url);
  for (let i = 0; i <= maxRedirects; i++) {
    const res = await fetch(current, { ...options, redirect: "manual" });
    if ([301, 302, 303, 307, 308].includes(res.status)) {
      if (i === maxRedirects) throw new Error("Too many redirects");
      const location = res.headers.get("location");
      if (!location) throw new Error("Redirect missing Location header");
      current = safeFeedUrl(location, current);
      continue;
    }
    return res;
  }
  throw new Error("Redirect handling failed");
}

async function fetchFeed(f) {
  const res = await fetchWithSafeRedirects(f.url, { headers: { "user-agent": "christophertritt.github.io feed reader (+https://christophertritt.github.io)", accept: "application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.5" }, signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const doc = parser.parse(await res.text());
  const rss = doc.rss?.channel || doc["rdf:RDF"]?.channel;
  const raw = rss ? [].concat(doc.rss?.channel?.item || doc["rdf:RDF"]?.item || []) : [].concat(doc.feed?.entry || []);
  if (!rss && !doc.feed) throw new Error("Not an RSS or Atom feed");
  return raw.slice(0, perFeed).map(it => {
    const link = linkOf(it.link) || text(it.guid);
    const body = it["content:encoded"] ?? it.content ?? it.description ?? it.summary ?? "";
    const date = new Date(text(it.pubDate || it.published || it.updated || it["dc:date"]) || Date.now());
    const media = it["media:content"]?.["@url"] || it["media:thumbnail"]?.["@url"] || (it.enclosure?.["@type"]?.startsWith("image") ? it.enclosure["@url"] : "") || firstImg(body);
    const title = plain(it.title) || "(untitled)";
    let summary = plain(body);
    if (summary.startsWith(title)) summary = summary.slice(title.length).trim();
    for (let k = 0; k < 2; k++) {
      summary = summary.replace(/^[A-Z][\w.'-]+(?: [A-Z][\w.'-]+){0,3} (Mon|Tue|Wed|Thu|Fri|Sat|Sun), \d{1,2}\/\d{1,2}\/\d{4} - \d{1,2}:\d{2}\s*/, "");
      summary = summary.replace(/^(Primary Image(?: Caption)?\s*)+/i, "");
    }
    return {
      id: f.id + ":" + (text(it.guid) || link).slice(-120),
      feed: f.id,
      title: clip(title, 180),
      link,
      date: isNaN(date) ? new Date().toISOString() : date.toISOString(),
      summary: clip(summary, 320),
      image: /^https:\/\//.test(media) ? media : ""
    };
  }).filter(i => /^https?:\/\//.test(i.link));
}

const status = [], items = [];
for (const f of config.feeds) {
  try { const got = await fetchFeed(f); items.push(...got); status.push({ id: f.id, ok: true, count: got.length }); console.log(`ok   ${f.name}: ${got.length}`); }
  catch (e) { status.push({ id: f.id, ok: false, error: String(e.message || e) }); console.log(`fail ${f.name}: ${e.message || e}`); }
}
items.sort((a, b) => b.date.localeCompare(a.date));
const out = { updated: new Date().toISOString(), feeds: config.feeds.map(({ id, name, site, color, topic }) => ({ id, name, site, color, topic, ...status.find(s => s.id === id) })), items };
await writeFile(new URL("../feeds/items.json", import.meta.url), JSON.stringify(out, null, 1) + "\n");
console.log(`wrote ${items.length} items`);
