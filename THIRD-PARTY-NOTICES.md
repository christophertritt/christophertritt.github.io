# Third-party notices

## Start page

- The start page reads headlines and short excerpts from public RSS feeds listed in `feeds/feeds.json`. A GitHub Action (`.github/workflows/feeds.yml`) fetches them twice a day (7 AM and 5 PM Pacific) with [fast-xml-parser](https://github.com/NaturalIntelligence/fast-xml-parser) (MIT) and saves `feeds/items.json`. Every item links back to the original article; the content belongs to each publisher.
- Search sends your query to Google, Google Scholar, Google Maps or Microsoft 365 search. The weather on every page uses [Open-Meteo](https://open-meteo.com/). To tell Home from Work, the page looks up the visitor's approximate location from their IP address with [ipwho.is](https://ipwho.is/) (falling back to [ipapi.co](https://ipapi.co/)); the result stays in that browser for 30 minutes and saved networks stay in that browser only.
- The Christophergle wordmark, globe and desktop icons are original artwork for## Portfolio (`/portfolio/`)

- Project photographs are credited on the Projects page, in each case study, and in the Credits window. Their source links and licenses are stored in `js/home-data.js`.
- Every page loads Tinos, Comic Neue, IBM Plex Mono and (on the resume) EB Garamond from [Google Fonts](https://fonts.google.com/). Google Fonts distributes these families under their individual open-source licenses; see the family pages for the current license text.
- The South Hill case study links to the publicly published [UW Livable City Year report](https://lcy.be.uw.edu/wp-content/uploads/sites/35/2026/06/2026-HIA-Report_FINAL_public.pdf). The site does not reproduce that report.
- The SBB-style station clock and platform sign are original drawings in tribute to the Swiss railways' designs; no SBB files are used.
- Vendored libraries, unmodified with their license headers, in `js/vendor/` and `css/vendor/`:
  - [canvas-confetti](https://github.com/catdad/canvas-confetti) 1.9.3, ISC, bubble, star and maple-leaf bursts.
  - [Leaflet](https://github.com/Leaflet/Leaflet) 1.9.4, BSD-2-Clause, the route map. Map tiles are © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors (ODbL), loaded from the OpenStreetMap tile servers with attribution shown on the map.
  - [Driver.js](https://github.com/kamranahmedse/driver.js) 1.8.0, MIT, Hieye's guided tour.
- The terminal, wayfinding kiosk, Hieye interactions, and hidden debug route are original implementations for this site; no third-party repository code is bundled.
