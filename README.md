# christophertritt.github.io

Personal static site for https://christophertritt.github.io.

## Repository layout

- `src/`: each page's own content. `src/start.html` is the start page, `src/reader.html` the feed reader, `src/hub.html` the portfolio overview, and `src/projects.html`, `skills.html`, `about.html`, `resume.html`, `contact.html` and `404.html` the rest.
- `scripts/build_site.py`: wraps every file in `src/` in the one shared shell (taskbar, menu, weather chip, SBB clock, footer, Hieye, dialogs) and writes the published pages: `index.html`, `reader/index.html`, `portfolio/index.html`, `portfolio/<page>/index.html` and `404.html`. Don't edit those by hand.
- `css/aero.css`: the shell and design system every page shares (glass panels, jelly buttons, the taskbar, the SBB platform sign, dialogs, Quiet mode, Canada and Quebec modes).
- `css/pages.css`: each page's theme and content (2002 Aero start page, Solari departures board, financial terminal, solarpunk, antique desk, instant messenger).
- `js/shell.js`: the shell's behavior on every page (Hieye and the poke sequence, menu, clock and platform sign, weather chip, Quiet, the hidden modes: type "eh" for Canada, then "oui" for Quebec, or triple-tap the clock on a phone).
- `js/weather.js`: weather data for the chip and the start page orbs. `js/portfolio.js`: case studies, the Ctrl-K kiosk, terminal, tour, route map and each portfolio page's interactions. `js/home-data.js`: the case studies (the Projects board is built from it). `js/start.js`, `js/gadgets.js`, `js/lens.js`: start page search, reader, and gadgets.
- `contact.vcf`: downloadable vCard. `feeds/feeds.json`: feed sources. `feeds/items.json`: generated feed items (do not edit by hand).
- `scripts/fetch-feeds.mjs`: fetches the feeds and regenerates `feeds/items.json`.

## Content workflows

### Pages

1. Edit the page's file in `src/` (or `js/home-data.js` for case studies, or the shell in `scripts/build_site.py`).
2. From the repository root, run:

   ```bash
   python3 scripts/build_site.py
   ```

   It needs Node to read `js/home-data.js`. Bump `VERSION` in the script when CSS or JS changes so browsers fetch the new files.
3. Commit the regenerated pages together with the source change.

### Feed data

1. Edit `feeds/feeds.json`.
2. To regenerate feed items locally, from the repository root:

   ```bash
   npm install --no-save --no-package-lock --ignore-scripts fast-xml-parser@4.5.0
   node scripts/fetch-feeds.mjs
   ```

3. Commit `feeds/items.json`.

The same script also runs hourly in GitHub Actions (`.github/workflows/feeds.yml`) and on pushes that change `feeds/feeds.json` or `scripts/fetch-feeds.mjs`, so manual regeneration is only needed to preview changes locally.

## Developer notes

See `DEVELOPMENT.md` for implementation and security details, including the feed fetch guardrails.
