# Development notes

## Feed refresh automation

The `Refresh feeds` workflow (`.github/workflows/feeds.yml`) runs hourly and on manual dispatch, and also on pushes that modify:

- `feeds/feeds.json`
- `scripts/fetch-feeds.mjs`

It runs `scripts/fetch-feeds.mjs`, then commits `feeds/items.json` when feed content changes.

## Feed fetch security guardrails

`scripts/fetch-feeds.mjs` now enforces these constraints for every configured feed URL and redirect target:

- protocol must be `http` or `https`
- URL credentials are rejected
- localhost and private/local network hosts are blocked
- redirect chains are limited

These checks reduce SSRF risk if feed configuration is accidentally changed to an unsafe endpoint.

## Site build script

`scripts/build_site.py` builds every page from `src/` and the shared shell, and builds the Projects departures board and boarding passes from `js/home-data.js` (it runs Node to read the data). Run it after any change to `src/`, the shell, or the case studies.
