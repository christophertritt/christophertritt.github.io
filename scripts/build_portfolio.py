#!/usr/bin/env python3
"""Builds the portfolio hub and one themed page per window from portfolio/_source.html.

Edit portfolio/_source.html (the whole portfolio as one page), then run:
    python3 scripts/build_portfolio.py
It writes portfolio/index.html (the desktop) and portfolio/<page>/index.html.
Files starting with "_" are not published by GitHub Pages.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = (ROOT / "portfolio/_source.html").read_text()
VERSION = "20261020g"

PAGES = {  # section id -> (folder, page title, theme)
    "work": ("projects", "Projects", "airport"),
    "skills": ("skills", "Skills", "terminal"),
    "about": ("about", "About", "waterfront"),
    "resume": ("resume", "Resume", "desk"),
    "contact": ("contact", "Contact", "messenger"),
}
URL = {sid: f"/portfolio/{folder}/" for sid, (folder, _, _) in PAGES.items()}

def cut(start, end, s=SRC):
    i = s.index(start)
    j = s.index(end, i) + len(end)
    return s[i:j]

head = SRC[: SRC.index('<main class="wrap" id="top">')]
tail = SRC[SRC.index("</main>") + len("</main>"):]
hero = cut('  <section class="hero">', "  </section>")
desk = cut('  <nav class="desk"', "  </nav>")
dock_footer = cut('  <nav class="dock glass"', "  </footer>")
sections = {sid: cut(f'  <section class="block" id="{sid}">', "  </section>") for sid in PAGES}

def relink(html):
    """Point in-page section links at their own pages."""
    for sid, url in URL.items():
        html = html.replace(f'href="#{sid}"', f'href="{url}"')
    return html

def versioned(html):
    return re.sub(r'(\?v=)[0-9a-z]+', r'\g<1>' + VERSION, html)

THEMES = {
"airport": '''<div class="theme-art" aria-hidden="true">
  <svg class="apron" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice">
    <defs><linearGradient id="aSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fc4ee"/><stop offset=".7" stop-color="#d9efff"/></linearGradient>
      <linearGradient id="aGlass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".18"/></linearGradient></defs>
    <rect width="1600" height="900" fill="url(#aSky)"/>
    <g fill="#fff" opacity=".85"><ellipse cx="260" cy="160" rx="120" ry="24"/><ellipse cx="1180" cy="120" rx="160" ry="26"/></g>
    <path d="M0 560 Q400 540 800 556 T1600 548 V600 H0Z" fill="#8fb39a"/><rect y="590" width="1600" height="310" fill="#9aa3ab"/>
    <path d="M0 700 H1600" stroke="#fff" stroke-width="6" stroke-dasharray="60 40"/>
    <g class="tower" transform="translate(1320 360)"><rect x="18" y="60" width="24" height="190" fill="#c9d3df" stroke="#56607a" stroke-width="3"/><path d="M0 60 L60 60 L52 20 L8 20Z" fill="#bfe8ef" stroke="#56607a" stroke-width="3"/><rect x="4" y="10" width="52" height="12" rx="3" fill="#56607a"/><circle class="beacon" cx="30" cy="4" r="6" fill="#ff5f57"/></g>
    <g class="plane taxi" transform="translate(-300 640)"><path d="M0 20 Q10 4 40 4 H210 Q240 4 250 20 Q240 34 210 34 H40 Q10 34 0 20Z" fill="#fff" stroke="#14274e" stroke-width="3"/><path d="M90 20 L60 70 H86 L140 20Z M200 6 L230 -30 H244 L230 6Z" fill="#2f86d6" stroke="#14274e" stroke-width="3"/><g fill="#14274e"><circle cx="70" cy="14" r="3"/><circle cx="90" cy="14" r="3"/><circle cx="110" cy="14" r="3"/><circle cx="130" cy="14" r="3"/><circle cx="150" cy="14" r="3"/><circle cx="170" cy="14" r="3"/></g><path d="M236 14 Q246 18 248 22" stroke="#14274e" stroke-width="3" fill="none"/></g>
    <g class="plane takeoff"><path d="M0 20 Q10 4 40 4 H210 Q240 4 250 20 Q240 34 210 34 H40 Q10 34 0 20Z" fill="#fff" stroke="#14274e" stroke-width="3"/><path d="M90 20 L60 70 H86 L140 20Z M200 6 L230 -30 H244 L230 6Z" fill="#e24a3b" stroke="#14274e" stroke-width="3"/></g>
    <g stroke="#2a3644" stroke-width="18"><path d="M0 0V900M400 0V900M800 0V900M1200 0V900M1600 0V900"/></g><path d="M0 0H1600" stroke="#2a3644" stroke-width="40"/>
    <rect width="1600" height="900" fill="url(#aGlass)"/>
  </svg>
</div>''',
"terminal": '''<div class="theme-art" aria-hidden="true"><div class="scan"></div></div>''',
"waterfront": '''<div class="theme-art" aria-hidden="true">
  <svg class="bay" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice">
    <defs><linearGradient id="bSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fc6ea"/><stop offset=".5" stop-color="#ffd6a8"/><stop offset=".72" stop-color="#ffb08a"/></linearGradient>
      <linearGradient id="bWater" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6fb6cf"/><stop offset="1" stop-color="#2f6f8f"/></linearGradient>
      <radialGradient id="bSun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff6d6"/><stop offset=".4" stop-color="#ffd27a" stop-opacity=".8"/><stop offset="1" stop-color="#ffb06a" stop-opacity="0"/></radialGradient></defs>
    <rect width="1600" height="900" fill="url(#bSky)"/>
    <circle cx="300" cy="520" r="200" fill="url(#bSun)"/>
    <g class="rainier"><path d="M760 600 L1010 330 Q1040 300 1070 330 L1360 600Z" fill="#9aa9c4"/><path d="M955 390 L1010 330 Q1040 300 1070 330 L1130 395 L1100 380 L1070 410 L1040 375 L1010 410 L985 380Z" fill="#fff"/></g>
    <g class="clouds" fill="#fff"><ellipse cx="1040" cy="380" rx="220" ry="46"/><ellipse cx="900" cy="420" rx="170" ry="40"/><ellipse cx="1190" cy="420" rx="190" ry="44"/><ellipse cx="1050" cy="450" rx="260" ry="40"/></g>
    <path d="M0 600 Q200 585 420 600 T900 596 T1600 600 V640 H0Z" fill="#3e5a4c"/>
    <rect y="630" width="1600" height="270" fill="url(#bWater)"/>
    <g stroke="#fff" stroke-opacity=".5" stroke-width="3" stroke-linecap="round" class="shimmer"><path d="M200 680h120M520 700h200M980 690h90M1240 720h160M380 760h140M800 790h220M1300 820h120"/></g>
    <g class="ferry"><path d="M0 0h180l-16 26H14z" fill="#fff" stroke="#14274e" stroke-width="3"/><rect x="28" y="-24" width="120" height="24" rx="4" fill="#fff" stroke="#14274e" stroke-width="3"/><rect x="28" y="-12" width="120" height="6" fill="#2e8b57"/><rect x="74" y="-44" width="22" height="20" fill="#14274e"/><g fill="#bfe8ef" stroke="#14274e" stroke-width="2"><rect x="38" y="-21" width="14" height="7"/><rect x="58" y="-21" width="14" height="7"/><rect x="104" y="-21" width="14" height="7"/><rect x="124" y="-21" width="14" height="7"/></g></g>
    <g class="gulls" fill="none" stroke="#14274e" stroke-width="3" stroke-linecap="round"><path d="M0 0q8-8 16 0q8-8 16 0"/><path d="M50 -20q6-6 12 0q6-6 12 0"/></g>
  </svg>
</div>''',
"desk": '''<div class="theme-art" aria-hidden="true">
  <svg class="mug" viewBox="0 0 120 140"><g class="steam" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".7"><path d="M40 40c-10-12 10-18 0-32"/><path d="M62 40c-10-12 10-18 0-32"/><path d="M84 40c-10-12 10-18 0-32"/></g>
    <path d="M24 50h76v62a20 20 0 0 1-20 20H44a20 20 0 0 1-20-20z" fill="#2f86d6" stroke="#14274e" stroke-width="3"/><path d="M100 64h8a14 14 0 0 1 0 28h-8" fill="none" stroke="#14274e" stroke-width="7"/>
    <ellipse cx="62" cy="52" rx="38" ry="7" fill="#5a3418"/><text x="62" y="100" text-anchor="middle" font-family="Comic Sans MS,cursive" font-size="16" font-weight="700" fill="#fff">GTFS</text></svg>
  <div class="sticky">Ask me about commute trip reduction!</div>
  <svg class="pencil" viewBox="0 0 240 30"><path d="M10 15l26-11h170v22H36z" fill="#ffd84a" stroke="#8a6116" stroke-width="2"/><path d="M10 15l26-11v22z" fill="#f2d3a8"/><path d="M10 15l8-3.4v6.8z" fill="#333"/><rect x="206" y="4" width="18" height="22" fill="#c9cfd6"/><rect x="224" y="4" width="14" height="22" rx="4" fill="#ff8fa3"/></svg>
</div>''',
"messenger": '''<div class="theme-art" aria-hidden="true"><span class="env e1">✉</span><span class="env e2">✉</span><span class="env e3">✉</span><span class="env e4">✉</span><span class="env e5">✉</span></div>''',
}

def page(title, body_class, main_html, theme=None):
    h = head
    h = h.replace("<title>Christopher A. Tritt</title>", f"<title>{title}</title>")
    h = h.replace("<body>", f'<body class="{body_class}">', 1)
    h = h.replace('<link rel="stylesheet" href="/css/home.css', '<link rel="stylesheet" href="/css/sections.css?v=x">\n  <link rel="stylesheet" href="/css/home.css', 1)
    if theme:
        h = h.replace('<div class="sky" aria-hidden="true">', THEMES[theme] + '\n<div class="sky" aria-hidden="true">', 1)
        h = h.replace('<a class="skip" href="#work">Skip to projects</a>', '<a class="skip" href="#main-win">Skip to content</a>')
    else:
        h = h.replace('<a class="skip" href="#work">Skip to projects</a>', '<a class="skip" href="#top">Skip to content</a>')
    t = tail.replace('<script src="/js/home.js', '<script src="/js/sections.js?v=x" defer></script>\n  <script src="/js/home.js', 1)
    return versioned(relink(h + '<main class="wrap" id="top">\n' + main_html + dock_footer + "\n</main>" + t))

# hub: the desktop with the two hero windows and the icons
hub_desk = desk.replace('<nav class="desk" aria-label="Sections">', '<nav class="desk" aria-label="Open a window">')
(ROOT / "portfolio/index.html").write_text(page("Christopher A. Tritt", "portfolio-hub", hero + "\n\n" + hub_desk + "\n\n"))

for sid, (folder, name, theme) in PAGES.items():
    sec = sections[sid]
    sec = sec.replace('<div class="win glass', '<div id="main-win" class="win fullwin glass', 1)
    html = page(f"{name} · Christopher A. Tritt", f"section-page theme-{theme}", sec + "\n\n", theme)
    # mark the current page in the menu
    html = html.replace(f'<a href="{URL[sid]}">', f'<a href="{URL[sid]}" aria-current="page">', 1)
    out = ROOT / "portfolio" / folder / "index.html"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(html)
    print("wrote", out.relative_to(ROOT))
print("wrote portfolio/index.html")
