# Third-party notices

## Homepage

- The portrait is a dynamically generated AI image provided by [This Person Does Not Exist](https://thispersondoesnotexist.com/). It is used as a clearly labeled placeholder and is not presented as Christopher Tritt.
- Homepage project photographs are credited in the project cards and case studies. Their source links and licenses are stored in `js/home.js`.
- The homepage loads Tinos, IBM Plex Mono, Silkscreen, Parisienne, Comic Neue, Caveat, Cabin Sketch, and Dancing Script from [Google Fonts](https://fonts.google.com/). Google Fonts distributes these families under their individual open-source licenses; see the family pages for the current license text.
- The South Hill case study links to the publicly published [UW Livable City Year report](https://lcy.be.uw.edu/wp-content/uploads/sites/35/2026/06/2026-HIA-Report_FINAL_public.pdf). The site does not reproduce that report.
- The floating weather bubbles use the public [Open-Meteo API](https://open-meteo.com/), queried from the browser for Bellevue, Washington conditions. No API key is used.
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

## Legacy projects

- `blog/` credits Sasha Ann's photographs under CC BY-NC-SA 2.0 in `blog/index.html`.
- `school-site/` credits Shari Thompson's Flickr photograph under CC BY-NC-SA 2.0 in `school-site/index.html`.
- `wanted-poster/` credits Christopher's Flickr photograph under CC BY-SA 2.0 in `wanted-poster/index.html`.
- `planets-table/` credits NASA's [Planetary Fact Sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/) for factual data. Embedded metadata identifies these Wikimedia Commons sources: [Mercury](https://commons.wikimedia.org/wiki/File:Mercury_in_color_-_Prockter07-edit1.jpg), [Earth](https://commons.wikimedia.org/wiki/File:Africa_and_Europe_from_a_Million_Miles_Away_(cropped).png), [Mars](https://commons.wikimedia.org/wiki/File:Mars_23_aug_2003_hubble_(cropped).jpg), [Jupiter](https://commons.wikimedia.org/wiki/File:Jupiter_and_its_shrunken_Great_Red_Spot_(cropped).jpg), [Neptune](https://commons.wikimedia.org/wiki/File:Neptune_Full_(cropped).jpg), and [Pluto](https://commons.wikimedia.org/wiki/File:Nh-pluto-in-true-color_2x_JPEG-edit.jpg). The Venus, Saturn, and Uranus files contain no source metadata; do not reuse those three images outside this legacy page until their provenance and licenses are confirmed.
