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

## Portfolio build script

`scripts/build_portfolio.py` reads from `portfolio/_source.html` and regenerates:

- `portfolio/index.html`
- `portfolio/projects/index.html`
- `portfolio/skills/index.html`
- `portfolio/about/index.html`
- `portfolio/resume/index.html`
- `portfolio/contact/index.html`

Run this script after editing `_source.html` so published section pages stay in sync.
