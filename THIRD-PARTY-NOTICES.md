# Third-party notices

## Start page

- The start page reads headlines and short excerpts from public RSS feeds listed in `feeds/feeds.json`. A GitHub Action (`.github/workflows/feeds.yml`) fetches them twice a day (7 AM and 5 PM Pacific) with [fast-xml-parser](https://github.com/NaturalIntelligence/fast-xml-parser) (MIT) and saves `feeds/items.json`. Every item links back to the original article; the content belongs to each publisher.
- Search sends your query to Google, Google Scholar, Google Maps or Microsoft 365 search. The weather bubbles on every page use [Open-Meteo](https://open-meteo.com/). To tell Home from Work, the page looks up the visitor's approximate location from their IP address with [ipwho.is](https://ipwho.is/) (falling back to [ipapi.co](https://ipapi.co/)); the result stays in that browser for 30 minutes and saved networks stay in that browser only.
- The WebSearch wordmark and globe are original artwork for this site.

## Portfolio (`/portfolio/`)

- Homepage project photographs are credited in the project cards and case studies. Their source links and licenses are stored in `js/home.js`.
- The homepage loads Tinos, IBM Plex Mono, Silkscreen, Parisienne, Comic Neue, Caveat, Cabin Sketch, and Dancing Script from [Google Fonts](https://fonts.google.com/). Google Fonts distributes these families under their individual open-source licenses; see the family pages for the current license text.
- The South Hill case study links to the publicly published [UW Livable City Year report](https://lcy.be.uw.edu/wp-content/uploads/sites/35/2026/06/2026-HIA-Report_FINAL_public.pdf). The site does not reproduce that report.

- Floating desktop windows use [WinBox.js](https://github.com/nextapps-de/winbox) v0.2.82 by Thomas Wilkerling / Nextapps GmbH, licensed under the Apache License 2.0. The unmodified bundle is vendored at `js/vendor/winbox.bundle.min.js` with its license header intact.
- Windows 7 progress bars and the crash box use [7.css](https://github.com/khang-nd/7.css) v0.21.1 by Khang Nguyen Duy, licensed under the MIT License. The unmodified scoped stylesheet is vendored at `css/vendor/7.scoped.css` with its header intact.
- Other vendored libraries, all unmodified with their license headers where the authors include one, in `js/vendor/` and `css/vendor/`:
  - [vanilla-tilt.js](https://github.com/micku7zu/vanilla-tilt.js) 1.8.1, MIT, card tilt and glare.
  - [canvas-confetti](https://github.com/catdad/canvas-confetti) 1.9.3, ISC, bubble, star and maple-leaf bursts.
  - [Rough Notation](https://github.com/rough-stuff/rough-notation) 0.5.1, MIT, hand-drawn circles around desktop icons.
  - [Leaflet](https://github.com/Leaflet/Leaflet) 1.9.4, BSD-2-Clause, the route map. Map tiles are © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors (ODbL) and are loaded from the OpenStreetMap tile servers with attribution shown on the map.
  - [Vanta.js](https://github.com/tengbao/vanta) 0.5.24 (clouds), MIT, and [three.js](https://github.com/mrdoob/three.js) r134, MIT, the animated sky on large screens.
  - [Driver.js](https://github.com/kamranahmedse/driver.js) 1.8.0, MIT, Hieye's guided tour.
  - [Tone.js](https://github.com/Tonejs/Tone.js) 15.1.22, MIT, sound effects when sound is turned on.
- The terminal, command palette, Hieye interactions, and hidden debug route are original implementations for this site, informed by common portfolio patterns; no third-party repository code is bundled.
