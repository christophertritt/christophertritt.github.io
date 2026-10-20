# christophertritt.github.io

Personal static site for https://christophertritt.github.io.

## Repository layout

- `index.html`: start page
- `portfolio/`: portfolio desktop and section pages
- `reader/`: feed reader page
- `feeds/feeds.json`: feed source configuration
- `feeds/items.json`: generated feed items consumed by the site
- `scripts/build_portfolio.py`: builds published portfolio pages from `portfolio/_source.html`
- `scripts/fetch-feeds.mjs`: fetches configured RSS/Atom feeds and regenerates `feeds/items.json`

## Content workflows

### Portfolio pages

1. Edit `/home/runner/work/christophertritt.github.io/christophertritt.github.io/portfolio/_source.html`.
2. Run:

   ```bash
   python3 /home/runner/work/christophertritt.github.io/christophertritt.github.io/scripts/build_portfolio.py
   ```

3. Commit updated files under `portfolio/`.

### Feed data

1. Edit `/home/runner/work/christophertritt.github.io/christophertritt.github.io/feeds/feeds.json`.
2. Regenerate feed items locally:

   ```bash
   npm install --no-save --no-package-lock --ignore-scripts fast-xml-parser@4.5.0
   node /home/runner/work/christophertritt.github.io/christophertritt.github.io/scripts/fetch-feeds.mjs
   ```

3. Commit `feeds/items.json`.

The same script runs hourly in `.github/workflows/feeds.yml`.

## Developer notes

See `DEVELOPMENT.md` for implementation and security details.
