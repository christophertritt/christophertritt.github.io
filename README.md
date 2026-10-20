# christophertritt.github.io

Personal website and start page for [christophertritt.github.io](https://christophertritt.github.io/).

## What is in this repo

- `/index.html`: start page with search shortcuts, weather bubbles, and desktop-style links.
- `/reader/`: feed reader UI backed by generated JSON.
- `/portfolio/`: portfolio hub plus section pages (`projects`, `skills`, `about`, `resume`, `contact`).
- `/js` and `/css`: site behavior and styling.
- `/feeds/feeds.json`: feed source list.
- `/feeds/items.json`: generated feed items consumed by the start page and reader.
- `/scripts/build_portfolio.py`: builds portfolio pages from `portfolio/_source.html`.
- `/scripts/fetch-feeds.mjs`: fetches RSS/Atom feeds and regenerates `feeds/items.json`.
- `/.github/workflows/feeds.yml`: hourly feed refresh workflow.

## Local editing workflow

This is a static site (no app framework build step).

### 1) Run locally

From repository root:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

### 2) Edit portfolio content

Edit:

- `portfolio/_source.html`

Then regenerate portfolio pages:

```bash
python3 scripts/build_portfolio.py
```

This updates:

- `portfolio/index.html`
- `portfolio/projects/index.html`
- `portfolio/skills/index.html`
- `portfolio/about/index.html`
- `portfolio/resume/index.html`
- `portfolio/contact/index.html`

### 3) Edit feed sources

Edit:

- `feeds/feeds.json`

To refresh `feeds/items.json` locally:

```bash
npm install --no-save --no-package-lock fast-xml-parser@4.5.0
node scripts/fetch-feeds.mjs
```

The GitHub Actions workflow (`.github/workflows/feeds.yml`) also refreshes feeds hourly and commits updates automatically.

## Notes

- Third-party attributions are tracked in `THIRD-PARTY-NOTICES.md`.
- `node_modules/` is ignored and not committed.
