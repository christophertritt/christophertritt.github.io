#!/usr/bin/env python3
"""Builds every page of the site from src/ and one shared shell.

Each file in src/ holds only a page's own content. This script wraps it in
the shell every page shares (head, scene art, taskbar, menu, footer, Hieye,
dialogs, scripts), so the taskbar and footer are written once.

Run from anywhere:
    python3 scripts/build_site.py
It writes index.html, reader/index.html, portfolio/index.html,
portfolio/<page>/index.html and 404.html. Commit them with the src change.

The Projects board and boarding passes are built from js/home-data.js
(read with Node), so the case-study list has a single source.
"""
import html
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src"
VERSION = "20261020g"
YEAR = 2026

def v(path):
    return f"{path}?v={VERSION}"

# ---------------------------------------------------------------- pages
FOLIO_NAV = [
    ("projects", "Projects", "/portfolio/projects/", "nav.projects"),
    ("skills", "Skills", "/portfolio/skills/", "nav.skills"),
    ("about", "About", "/portfolio/about/", "nav.about"),
    ("resume", "Resume", "/portfolio/resume/", "nav.resume"),
    ("contact", "Contact", "/portfolio/contact/", "nav.contact"),
]

PAGES = [
    dict(key="start", out="index.html", src="start.html", bar="site", chip=None, theme="aero",
         title="Start · Christopher A. Tritt", noindex=True, skip="#q", skip_label="Skip to search",
         desc="Christopher Tritt's start page: search, transit, and the day's planning news."),
    dict(key="reader", out="reader/index.html", src="reader.html", bar="site", chip="aero", theme="aero",
         title="Reader · Christopher A. Tritt", noindex=True, skip="#items", skip_label="Skip to stories",
         desc="A feed reader for planning, transit and Northwest news."),
    dict(key="hub", out="portfolio/index.html", src="hub.html", bar="folio", chip="aero", theme="aero",
         title="Portfolio · Christopher A. Tritt",
         desc="Christopher A. Tritt, transportation planner with the City of Bellevue: projects, skills, resume and contact."),
    dict(key="projects", out="portfolio/projects/index.html", src="projects.html", bar="folio", chip="solari", theme="airport",
         title="Projects · Christopher A. Tritt", desc="Case studies in transportation demand management, spatial analysis and housing."),
    dict(key="skills", out="portfolio/skills/index.html", src="skills.html", bar="folio", chip="terminal", theme="terminal",
         title="Skills · Christopher A. Tritt", desc="Demand management, spatial analysis and data tools."),
    dict(key="about", out="portfolio/about/index.html", src="about.html", bar="folio", chip="solar", theme="solarpunk",
         title="About · Christopher A. Tritt", desc="Why transportation: the 594, six generations in Pierce County, and the work at Bellevue."),
    dict(key="resume", out="portfolio/resume/index.html", src="resume.html", bar="folio", chip="antique", theme="antique",
         title="Resume · Christopher A. Tritt", desc="Experience and education.", garamond=True),
    dict(key="contact", out="portfolio/contact/index.html", src="contact.html", bar="folio", chip="im", theme="im",
         title="Contact · Christopher A. Tritt", desc="Email, LinkedIn and a contact card."),
    dict(key="404", out="404.html", src="404.html", bar="folio", chip="aero", theme="aero404",
         title="Page not found · Christopher A. Tritt", noindex=True, desc="This route has been discontinued."),
]

# ---------------------------------------------------------------- shell parts
MODE_BOOT = ('try{var m=localStorage.getItem("ct-mode")||(localStorage.getItem("ct-canada")==="on"?"canada":"off");'
             'if(m==="canada"||m==="quebec")document.documentElement.dataset.mode=m}catch(e){}')

CLOCK_SVG = ('<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="49" fill="#cfd5db"/>'
             '<circle cx="50" cy="50" r="46" fill="#fff"/>'
             '<circle cx="50" cy="50" r="40" fill="none" stroke="#111" stroke-width="5" stroke-dasharray=".9 3.289" transform="rotate(-90.64 50 50)"/>'
             '<circle cx="50" cy="50" r="38.5" fill="none" stroke="#111" stroke-width="8" stroke-dasharray="3 17.16" transform="rotate(-92.23 50 50)"/>'
             '<g class="hand hh"><path d="M48 58h4l-.6-34h-2.8z" fill="#111"/></g>'
             '<g class="hand mh"><path d="M48.6 60h2.8l-.4-46h-2z" fill="#111"/></g>'
             '<g class="hand sh"><path d="M49.4 66h1.2V24h-1.2z" fill="#eb0000"/><circle class="disc" cx="50" cy="23" r="5.4" fill="#eb0000"/></g>'
             '<circle cx="50" cy="50" r="1.4" fill="#111"/>'
             '<ellipse cx="34" cy="24" rx="22" ry="10" fill="#fff" opacity=".4" transform="rotate(-28 34 24)"/></svg>')

MAPLE = ('<svg viewBox="2480 300 4640 4200" aria-hidden="true"><path fill="#d52b1e" d="m4890 4430-45-863a95 95 0 0 1 111-98l859 151-116-320a65 65 0 0 1 20-73l941-762-212-99a65 65 0 0 1-34-79l186-572-542 115a65 65 0 0 1-73-38l-105-247-423 454a65 65 0 0 1-111-57l204-1052-327 189a65 65 0 0 1-91-27l-332-652-332 652a65 65 0 0 1-91 27l-327-189 204 1052a65 65 0 0 1-111 57l-423-454-105 247a65 65 0 0 1-73 38l-542-115 186 572a65 65 0 0 1-34 79l-212 99 941 762a65 65 0 0 1 20 73l-116 320 859-151a95 95 0 0 1 111 98l-45 863z"/></svg>')


def eye():
    return ('<button class="eye" id="eye" type="button" aria-label="Hieye, the eye. Poke him.">'
            '<span class="iris" id="iris"><span class="pupil"></span></span><span class="lid"></span></button>')


def menu(cur):
    def a(href, label, key, i18n=None):
        c = ' aria-current="page"' if key == cur else ""
        d = f' data-i18n="{i18n}"' if i18n else ""
        return f'<a href="{href}"{c}><span{d}>{label}</span></a>'
    items = ['<span class="sec" data-i18n="nav.portfolio">Portfolio</span>',
             a("/portfolio/", "Overview", "hub", "menu.desktop")]
    items += [a(h, l, k, i) for k, l, h, i in FOLIO_NAV]
    items += ['<span class="sec">Site</span>', a("/", "Start", "start", "nav.start"),
              a("/reader/", "Reader", "reader", "nav.reader"),
              '<span class="sec">More</span>', '<button type="button" data-tour>Take the tour</button>',
              '<button type="button" data-palette>Search the site (Ctrl K)</button>']
    return '<nav class="menu glass" id="menu" aria-label="Site menu" hidden>' + "".join(items) + "</nav>"


def chip(kind):
    if not kind:
        return ""
    return (f'<a class="wxchip wx-{kind}" id="wxChip" href="/" data-state="loading">'
            '<span class="wx-ic" aria-hidden="true"></span><span class="wx-t">Weather</span>'
            '<span class="vh"> (weather; opens the start page)</span></a>')


def taskbar(p):
    cur = p["key"]
    btn_cls = "jelly sm menu-btn" + ("" if p["theme"] in ("aero", "aero404") else "")
    mbtn = (f'<button class="{btn_cls}" id="menuBtn" type="button" aria-expanded="false" aria-controls="menu">'
            '<span>Menu</span> <span class="caret" aria-hidden="true">▾</span></button>')
    if p["bar"] == "folio":
        hub_cur = ' aria-current="page"' if cur == "hub" else ""
        who = (f'<a class="who" id="name" href="/portfolio/"{hub_cur}><b>Christopher Tritt</b>'
               '<small>transportation planner who builds the tools</small></a>')
        links = "".join(
            f'<a href="{h}"' + (' aria-current="page"' if k == cur else "") + f'><span data-i18n="{i}">{l}</span></a>'
            for k, l, h, i in FOLIO_NAV)
        nav = f'<nav class="nav" id="nav" aria-label="Portfolio">{links}</nav>'
        hint = ""
    else:
        if cur == "start":
            who = '<div class="who" id="name"><b id="hello">Hello, Christopher</b></div>'
            hint = ('<p class="hint" id="hint"><b>Hieye:</b>&nbsp;press <kbd>/</kbd> to search from anywhere!</p>')
        else:
            who = ('<div class="who" id="name"><b data-i18n="nav.reader">Reader</b>'
                   '<small id="readerSub">planning, transit and Northwest news</small></div>')
            hint = ""
        links = "".join(
            f'<a href="{h}"' + (' aria-current="page"' if k == cur else "") + f'><span data-i18n="{i}">{l}</span></a>'
            for k, l, h, i in [("start", "Start", "/", "nav.start"), ("reader", "Reader", "/reader/", "nav.reader")])
        nav = (f'<nav class="nav" id="nav" aria-label="Site">{links}'
               '<button class="menu-btn inline" id="menuBtn2" type="button" aria-expanded="false" aria-controls="menu">'
               '<span data-i18n="nav.portfolio">Portfolio</span>&nbsp;<span class="caret" aria-hidden="true">▾</span></button></nav>')
    clock = ('<button class="clock" id="clock" type="button" aria-expanded="false" aria-controls="sbbSign" '
             'aria-label="Clock, Pacific time. Shows the platform sign.">' + CLOCK_SVG + "</button>")
    bar = (f'<div class="bar glass" id="taskbar">{eye()}{who}{hint}{nav}{mbtn}{chip(p["chip"])}{clock}</div>'
           + menu(cur) +
           '<div class="sbb" id="sbbSign" hidden role="region" aria-label="Platform sign: time and date"></div>')
    return f'<header class="top"><div class="wrap">{bar}</div></header>'


def footer(p):
    extra = ""
    if p["key"] == "start":
        extra = '<span data-i18n="status.start">Feeds refresh at 7 AM and 5 PM</span>'
    elif p["bar"] == "folio":
        extra = '<a href="/" data-i18n="nav.start">Start</a><a href="/reader/" data-i18n="nav.reader">Reader</a>'
    else:
        extra = '<a href="/portfolio/" data-i18n="nav.portfolio">Portfolio</a>'
    return ('<footer class="foot glass">'
            f'<span id="done">© {YEAR} Christopher Tritt</span>'
            '<a href="#credits" data-credits><span data-i18n="status.credits">Credits and sources</span></a>'
            f'{extra}<span class="grow"></span>'
            f'<button class="leaf" id="modeOff" type="button" hidden aria-label="Turn off Canada mode">{MAPLE}</button>'
            '<button class="jelly clear sm" id="quiet" type="button" aria-pressed="false">Quiet</button>'
            '</footer>')


CREDITS = '''<dialog class="glass-dlg" id="credits" aria-labelledby="crH">
  <div class="aquatb"><span class="lights" aria-hidden="true"><i></i><i></i><i></i></span>third_party_notices.txt<button class="dlg-x" type="button" data-close aria-label="Close credits">×</button></div>
  <div class="dlg-body">
    <h2 id="crH">Credits and sources</h2>
    <h3>Photos</h3>
    <ul>{photos}</ul>
    <h3>Data</h3>
    <ul>
      <li>Weather and air quality from <a href="https://open-meteo.com/" target="_blank" rel="noopener">Open-Meteo</a>. Approximate location from <a href="https://ipwho.is/" target="_blank" rel="noopener">ipwho.is</a> (or <a href="https://ipapi.co/" target="_blank" rel="noopener">ipapi.co</a>), kept in your browser for 30 minutes.</li>
      <li>Transit departures from <a href="https://pugetsound.onebusaway.org/" target="_blank" rel="noopener">OneBusAway Puget Sound</a>.</li>
      <li>Headlines link back to each publisher; the stories belong to them.</li>
      <li>Map tiles © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors.</li>
    </ul>
    <h3>Code and type</h3>
    <ul>
      <li><a href="https://leafletjs.com/" target="_blank" rel="noopener">Leaflet</a> (BSD-2-Clause), <a href="https://driverjs.com/" target="_blank" rel="noopener">Driver.js</a> (MIT) and <a href="https://github.com/catdad/canvas-confetti" target="_blank" rel="noopener">canvas-confetti</a> (ISC), vendored unmodified.</li>
      <li>Tinos, Comic Neue, IBM Plex Mono and EB Garamond from <a href="https://fonts.google.com/" target="_blank" rel="noopener">Google Fonts</a>, under their open-source licenses.</li>
      <li>The eye, the icons, the SBB-style clock and every page theme are original artwork for this site. The station clock and platform sign are a tribute to the Swiss railways' designs, not their files.</li>
    </ul>
  </div>
</dialog>'''

FOLIO_DIALOGS = '''<dialog class="glass-dlg wide" id="case" aria-labelledby="cs-title">
  <div class="aquatb"><span class="lights" aria-hidden="true"><i></i><i></i><i></i></span><span id="cs-file">case_study.pdf</span><button class="dlg-x" type="button" data-close aria-label="Close case study">×</button></div>
  <div class="progress" role="progressbar" aria-label="Reading progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i id="csProg"></i></div>
  <div class="dlg-body cs" id="cs"></div>
</dialog>
<dialog class="glass-dlg palette" id="palette" aria-labelledby="paletteH">
  <div class="aquatb"><span class="lights" aria-hidden="true"><i></i><i></i><i></i></span>Wayfinding kiosk<button class="dlg-x" type="button" data-close aria-label="Close">×</button></div>
  <div class="dlg-body">
    <h2 id="paletteH">Where to next?</h2>
    <label class="vh" for="paletteIn">Search pages and commands</label>
    <input id="paletteIn" type="search" placeholder="Try projects, terminal or contact" autocomplete="off">
    <div class="results" id="paletteResults"></div>
  </div>
</dialog>
<dialog class="glass-dlg term" id="terminal" aria-labelledby="termH">
  <div class="aquatb"><span class="lights" aria-hidden="true"><i></i><i></i><i></i></span>route594 terminal<button class="dlg-x" type="button" data-close aria-label="Close">×</button></div>
  <div class="dlg-body">
    <h2 id="termH" class="vh">Terminal</h2>
    <div class="out" id="termOut" aria-live="polite">Type help for the commands.</div>
    <form id="termForm"><label for="termIn">route594@christopher:~$</label><input id="termIn" type="text" autocomplete="off" spellcheck="false"></form>
  </div>
</dialog>
<dialog class="glass-dlg" id="debug" aria-labelledby="debugH">
  <div class="aquatb"><span class="lights" aria-hidden="true"><i></i><i></i><i></i></span>debug.vim<button class="dlg-x" type="button" data-close aria-label="Close">×</button></div>
  <div class="dlg-body term">
    <h2 id="debugH">:help christopher</h2>
    <pre>" A tiny field guide to this site
g projects     jump to selected work
g about        read the route story
g resume       open experience
:q             close this window

" Tip: press Ctrl-K or ⌘K for the wayfinding kiosk.</pre>
  </div>
</dialog>
<dialog class="glass-dlg" id="lost" aria-labelledby="lostH">
  <div class="aquatb"><span class="lights" aria-hidden="true"><i></i><i></i><i></i></span>404.html<button class="dlg-x" type="button" data-close aria-label="Close">×</button></div>
  <div class="dlg-body">
    <h2 id="lostH">This route has been discontinued</h2>
    <p>The stop you were looking for isn't on the schedule anymore. Transfers are free, so try one of these.</p>
    <div class="ctas"><a class="jelly" href="/portfolio/projects/">Projects</a><a class="jelly clear" href="/portfolio/about/">About</a><a class="jelly clear" href="/portfolio/resume/">Resume</a></div>
  </div>
</dialog>'''

HIEYE = ('<div class="wp" id="wp" hidden role="status" aria-live="polite"><b class="wp-name">Hieye</b>'
         '<p id="wpLine"></p><div class="wp-acts" id="wpActs"></div>'
         '<button class="wp-x" type="button" id="wpX" aria-label="Dismiss Hieye">×</button></div>')

# ---------------------------------------------------------------- scenes
BUBBLE = ('<span class="bub" style="{s}"></span>')
SPARK = '<svg class="spark" viewBox="0 0 20 20" style="{s}"><path d="M10 0l2.2 7.8L20 10l-7.8 2.2L10 20l-2.2-7.8L0 10l7.8-2.2z" fill="#fff"/></svg>'

AERO_SCENE = ('<div class="scene scene-aero" aria-hidden="true">'
              '<div class="rays"></div><div class="sun"></div>'
              '<svg class="swoosh" viewBox="0 0 1280 300" preserveAspectRatio="none"><defs><linearGradient id="swooshG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".75"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>'
              '<path d="M-20 200C200 80 420 260 680 150S1100 40 1300 120" fill="none" stroke="url(#swooshG)" stroke-width="26" stroke-linecap="round"/>'
              '<path d="M-20 236C220 120 460 290 720 186S1120 86 1300 160" fill="none" stroke="url(#swooshG)" stroke-width="8" stroke-linecap="round"/></svg>'
              + BUBBLE.format(s="left:3%;top:470px;width:130px;height:130px")
              + BUBBLE.format(s="right:2%;top:820px;width:90px;height:90px;animation-delay:-6s")
              + BUBBLE.format(s="left:47%;top:1290px;width:54px;height:54px;animation-delay:-3s")
              + BUBBLE.format(s="right:30%;top:210px;width:46px;height:46px;animation-delay:-9s")
              + SPARK.format(s="left:12%;top:150px;width:26px")
              + SPARK.format(s="right:16%;top:420px;width:18px;animation-delay:-1.5s")
              + '</div>')

SCENES = {
    "aero": AERO_SCENE,
    "aero404": AERO_SCENE,
    "airport": '''<div class="scene scene-airport" aria-hidden="true">
  <div class="mullions"></div><div class="lintel"></div><div class="grass"></div><div class="stripe"></div>
  <svg class="plane taxi" viewBox="0 0 260 80"><path d="M0 40Q10 24 40 24H210Q240 24 250 40 240 54 210 54H40Q10 54 0 40Z" fill="#fff" stroke="#14274e" stroke-width="3"/><path d="M90 40L60 78H86L140 40ZM200 26L230 -6H244L230 26Z" fill="#2f86d6" stroke="#14274e" stroke-width="3"/><g fill="#14274e"><circle cx="70" cy="34" r="3"/><circle cx="90" cy="34" r="3"/><circle cx="110" cy="34" r="3"/><circle cx="130" cy="34" r="3"/><circle cx="150" cy="34" r="3"/><circle cx="170" cy="34" r="3"/></g></svg>
  <svg class="plane takeoff" viewBox="0 0 260 80"><path d="M0 40Q10 24 40 24H210Q240 24 250 40 240 54 210 54H40Q10 54 0 40Z" fill="#fff" stroke="#14274e" stroke-width="3"/><path d="M90 40L60 78H86L140 40ZM200 26L230 -6H244L230 26Z" fill="#e24a3b" stroke="#14274e" stroke-width="3"/></svg>
  <div class="glare"></div>
</div>''',
    "terminal": '<div class="scene scene-terminal" aria-hidden="true"></div>',
    "solarpunk": '''<div class="scene scene-solar" aria-hidden="true">
  <svg viewBox="0 0 1600 760" preserveAspectRatio="xMidYMax slice">
    <circle cx="1250" cy="170" r="150" fill="#fff6c8" opacity=".75"/><circle cx="1250" cy="170" r="70" fill="#fffbe2"/>
    <g class="rainier"><path d="M700 520L960 250Q990 220 1020 250L1320 520Z" fill="#a7b8cf"/><path d="M905 310L960 250Q990 220 1020 250L1080 315 1050 300 1020 330 990 295 960 330 935 300Z" fill="#fff"/></g>
    <g class="mtn-clouds" fill="#fff"><ellipse cx="1000" cy="300" rx="220" ry="46"/><ellipse cx="880" cy="340" rx="170" ry="40"/><ellipse cx="1140" cy="340" rx="190" ry="44"/></g>
    <path d="M0 520Q300 440 620 500T1260 470T1600 500V760H0Z" fill="#7fbf5a"/>
    <path d="M0 590Q400 540 800 580T1600 560V760H0Z" fill="#5aa23e"/>
    <g stroke="#3e7a2a" stroke-width="2" fill="none" opacity=".55"><path d="M60 600h300M80 620h300M100 640h300"/><path d="M1180 600h320M1200 620h320"/></g>
    <g><rect x="380" y="430" width="150" height="100" fill="#f3e2c0" stroke="#8a6a3a" stroke-width="3"/><path d="M370 432L455 380 540 432Z" fill="#2a4a7a" stroke="#1a2a4a" stroke-width="2"/><g fill="#5f9fe0" stroke="#e8f4ff" stroke-width="1.5"><path d="M392 424L428 400 442 410 406 432Z"/><path d="M438 398L474 376 488 386 452 408Z"/><path d="M470 400L506 418 494 428 458 410Z"/></g><rect x="400" y="460" width="22" height="24" fill="#bfe3f7" stroke="#8a6a3a"/><rect x="480" y="460" width="22" height="24" fill="#bfe3f7" stroke="#8a6a3a"/><path d="M380 430q20-20 40-4q16-18 38 0" fill="none" stroke="#3e8a2a" stroke-width="5" stroke-linecap="round"/></g>
    <g transform="translate(1440 300)"><rect x="-3" y="0" width="6" height="230" fill="#e8ece6"/><g class="blades"><g fill="#f4f6f2" stroke="#b9c2b4"><path d="M0 0L-8 -80 0 -86 8 -80Z"/><path d="M0 0L70 34 74 26 8 -4Z"/><path d="M0 0L-66 44 -72 36 -6 -2Z"/></g></g><circle r="7" fill="#d9ded6"/></g>
    <path d="M0 662H1600" stroke="#6a6f74" stroke-width="6"/><path d="M0 672H1600" stroke="#6a6f74" stroke-width="3"/>
    <g class="rail"><g transform="translate(760 612)"><rect width="260" height="48" rx="14" fill="#f4f8ee" stroke="#2f5a22" stroke-width="3"/><rect y="28" width="260" height="8" fill="#3f8f2f"/><g fill="#bfe3f7" stroke="#2f5a22" stroke-width="2"><rect x="16" y="8" width="34" height="16" rx="3"/><rect x="62" y="8" width="34" height="16" rx="3"/><rect x="108" y="8" width="34" height="16" rx="3"/><rect x="154" y="8" width="34" height="16" rx="3"/><rect x="200" y="8" width="44" height="16" rx="3"/></g><path d="M120 0V-26M100 -26H140" stroke="#2f5a22" stroke-width="3"/></g></g>
    <g fill="#2f7a2a"><circle cx="160" cy="520" r="46"/><circle cx="210" cy="500" r="38"/><rect x="176" y="530" width="10" height="60" fill="#6a4a2a"/><circle cx="1120" cy="540" r="40"/><rect x="1116" y="560" width="9" height="50" fill="#6a4a2a"/></g>
    <g fill="#ffd23a"><circle cx="300" cy="610" r="7"/><circle cx="330" cy="630" r="6"/><circle cx="1240" cy="625" r="7"/></g>
  </svg>
</div>''',
    "antique": '''<div class="scene scene-antique" aria-hidden="true">
  <div class="inlay"></div>
  <svg class="inkwell" viewBox="0 0 120 160"><ellipse cx="60" cy="150" rx="40" ry="8" fill="rgba(0,0,0,.4)"/><path d="M28 70h64l-6 78H34z" fill="#1a1a2a" stroke="#c9a24a" stroke-width="3"/><ellipse cx="60" cy="70" rx="32" ry="8" fill="#0a0a14" stroke="#c9a24a" stroke-width="3"/><path d="M62 72C70 40 90 14 112 4C96 30 80 52 66 74z" fill="#f4ecd8" stroke="#b9a37a"/><path d="M64 72L108 8" stroke="#8a7a5a"/></svg>
  <svg class="envelope" viewBox="0 0 160 110"><rect x="4" y="4" width="152" height="102" fill="#e9d6a6" stroke="#8a6a3a" stroke-width="2"/><path d="M4 4L80 64 156 4" fill="none" stroke="#8a6a3a" stroke-width="2"/><circle cx="80" cy="64" r="20" fill="#a3201a"/><circle cx="80" cy="64" r="13" fill="none" stroke="#6a0e0a" stroke-width="2"/><text x="80" y="70" text-anchor="middle" font-family="EB Garamond, Garamond, serif" font-size="16" font-weight="600" fill="#f2c8b8">CT</text></svg>
</div>''',
    "im": '''<div class="scene scene-im" aria-hidden="true"><div class="cloud c1"></div><div class="cloud c2"></div><div class="cloud c3"></div></div>''',
}

# ---------------------------------------------------------------- projects from js/home-data.js
def project_data():
    js = ("global.location={search:''};"
          "eval(require('fs').readFileSync(process.argv[1],'utf8')+"
          "';process.stdout.write(JSON.stringify({all:allProjects,photos}))')")
    out = subprocess.run(["node", "-e", js, str(ROOT / "js/home-data.js")], capture_output=True, text=True, check=True)
    return json.loads(out.stdout)


def flap(text, cls=""):
    tiles = "".join(f"<span>{'&#160;' if c == ' ' else html.escape(c)}</span>" for c in text)
    return f'<span class="f{(" " + cls) if cls else ""}" aria-hidden="true">{tiles}</span>'


def projects_page(src):
    d = project_data()
    pub = [p for p in d["all"] if not p.get("draft")]
    drafts = [p for p in d["all"] if p.get("draft")]
    # on time first, delayed (in progress) last
    pub.sort(key=lambda p: 1 if p.get("status") else 0)
    rows, passes, credits = [], [], []
    base = 9 * 60 + 46
    for i, p in enumerate(pub):
        t = base + i * 17
        time = f"{t // 60:02d}:{t % 60:02d}"
        flight, gate = f"CT {101 + i * 7}", f"A{i + 1}"
        remark, rcls = (("DELAYED", "delayed") if p.get("status") else ("BOARDING", "boarding") if i == 0 else ("ON TIME", "ontime"))
        board = p.get("board", p["title"]).upper()
        label = f'{flight} to {p["title"]}, gate {gate}, {remark.lower()}. Open the case study.'
        rows.append(f'        <li><a class="row" href="#{p["id"]}" data-case="{p["id"]}" data-dep="{i}">'
                    f'<span class="vh">{html.escape(label)}</span>'
                    f'{flap(time, "t")}{flap(flight)}{flap(board, "dest")}{flap(gate)}{flap(remark, "rem " + rcls)}'
                    f'<span class="m-line" aria-hidden="true"><span class="m-t">{time}</span> · {gate} · <span class="{rcls}">{remark}</span></span></a></li>')
        g = p.get("glance", {})
        role = (g.get("Role") or "").split(",")[0]
        tools = ", ".join([x.strip() for x in (g.get("Tools") or "").split(",")][:3])
        ph = d["photos"].get(p["id"])
        img = (f'<img src="{ph["src"]}" alt="{html.escape(ph["alt"])}" loading="lazy" width="760" height="380">' if ph else "")
        if ph:
            credits.append(f'{html.escape(p["title"])} photo: <a href="{ph["href"]}" target="_blank" rel="noopener">{html.escape(ph["credit"])}</a>')
        status = f'<p class="status">{html.escape(p["status"])}</p>' if p.get("status") else ""
        passes.append(f'''    <article class="pass" id="{p["id"]}" aria-labelledby="{p["id"]}-h">
      <div class="ptop"><span>BOARDING PASS · {flight}</span><b>SEA → {p.get("code", "XXX")}</b></div>
      {img}
      <div class="pbody">
        {status}<h3 id="{p["id"]}-h">{html.escape(p["title"])}</h3>
        <p>{p["blurb"]}</p>
        <dl class="meta"><div><dt>Role</dt><dd>{html.escape(role)}</dd></div><div><dt>Tools</dt><dd>{html.escape(tools)}</dd></div></dl>
        <a class="jelly" href="#{p["id"]}" data-case="{p["id"]}">Read case study<span class="vh">: {html.escape(p["title"])}</span></a>
      </div>
    </article>''')
    arrivals = "\n".join(
        f'          <li class="arr">{flap(p.get("board", p["title"]).upper())}<span class="vh">{html.escape(p["title"])}</span><span class="exp">EXPECTED</span></li>'
        for p in drafts) or '          <li class="arr"><span class="exp">NO ARRIVALS</span></li>'
    delayed = [p for p in pub if p.get("status")]
    note = "".join(f' The {html.escape(p["title"])} is delayed: {html.escape(p["status"].lower())}.' for p in delayed)
    nums = {1: "One", 2: "Two", 3: "Three", 4: "Four", 5: "Five", 6: "Six", 7: "Seven", 8: "Eight"}
    return (src.replace("{{BOARD_ROWS}}", "\n".join(rows))
               .replace("{{PASSES}}", "\n".join(passes))
               .replace("{{ARRIVALS}}", arrivals)
               .replace("{{DELAY_NOTE}}", note)
               .replace("{{CASE_STUDY_COUNT}}", nums.get(len(pub), str(len(pub))))
               .replace("{{CLOCK_TILES}}", "".join(f"<span>{c}</span>" for c in "--:--"))
               .replace("{{PHOTO_CREDITS}}", " · ".join(credits))), d


def credits_photos(d):
    items = []
    for p in d["all"]:
        ph = d["photos"].get(p["id"])
        if ph and not p.get("draft"):
            items.append(f'<li>{html.escape(ph["alt"])}: <a href="{ph["href"]}" target="_blank" rel="noopener">{html.escape(ph["credit"])}</a></li>')
    return "".join(items)

# ---------------------------------------------------------------- assemble
def scripts(p):
    s = [v("/js/weather.js"), v("/js/shell.js")]
    if p["bar"] == "folio":
        s += [v("/js/vendor/driver.js.iife.js"), v("/js/vendor/confetti.browser.js"), v("/js/home-data.js")]
        if p["key"] == "hub":
            s.append(v("/js/vendor/leaflet.js"))
        s.append(v("/js/portfolio.js"))
    if p["key"] == "start":
        s += [v("/js/gadgets.js"), v("/js/lens.js"), v("/js/start.js")]
    if p["key"] == "reader":
        s.append(v("/js/start.js"))
    return "\n".join(f'<script src="{x}" defer></script>' for x in s)


def head(p):
    fonts = ("https://fonts.googleapis.com/css2?family=Comic+Neue:ital,wght@0,400;0,700;1,400;1,700"
             "&family=IBM+Plex+Mono:wght@400;600;700&family=Tinos:ital,wght@0,400;0,700;1,400"
             + ("&family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,600" if p.get("garamond") else "")
             + "&display=swap")
    css = []
    if p["bar"] == "folio":
        css.append(v("/css/vendor/driver.css"))
    if p["key"] == "hub":
        css.append(v("/css/vendor/leaflet.css"))
    css += [v("/css/aero.css"), v("/css/pages.css")]
    links = "\n".join(f'  <link rel="stylesheet" href="{c}">' for c in css)
    robots = '  <meta name="robots" content="noindex">\n' if p.get("noindex") else ""
    return f'''<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
{robots}  <meta name="description" content="{html.escape(p["desc"])}">
  <title>{p["title"]}</title>
  <script>{MODE_BOOT}</script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="{html.escape(fonts)}">
{links}
</head>'''


def build():
    d = None
    for p in PAGES:
        src = (SRC / p["src"]).read_text()
        if p["key"] == "projects":
            src, d = projects_page(src)
        if d is None:
            d = project_data()
        body_cls = f'page-{p["key"]} theme-{p["theme"]}' + (" folio" if p["bar"] == "folio" else " site")
        skip = p.get("skip", "#main")
        out = "\n".join([
            head(p),
            f'<body class="{body_cls}">',
            f'<a class="skip" href="{skip}">{p.get("skip_label", "Skip to content")}</a>',
            '<div class="fleur" aria-hidden="true"></div>',
            SCENES[p["theme"]],
            taskbar(p),
            f'<main class="wrap" id="main">\n{src.rstrip()}\n</main>',
            f'<div class="wrap">{footer(p)}</div>',
            CREDITS.replace("{photos}", credits_photos(d)),
            FOLIO_DIALOGS if p["bar"] == "folio" else "",
            HIEYE,
            scripts(p),
            "</body>",
            "</html>",
            "",
        ])
        f = ROOT / p["out"]
        f.parent.mkdir(parents=True, exist_ok=True)
        f.write_text(out)
        print("wrote", p["out"])


if __name__ == "__main__":
    build()
