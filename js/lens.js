/* Glass-bubble magnifier for the desktop icons.
   The bubble itself is CSS (.desk a::before / ::after). This adds the warp:
   an SVG displacement filter per icon whose strength springs up on hover/focus
   and eases back down on leave, so the icon bulges like it's under a lens. */
(() => {
  const links = [...document.querySelectorAll(".desk a")];
  if (!links.length) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const NS = "http://www.w3.org/2000/svg";

  // Displacement map: R/G encode x/y offsets that pull samples toward the
  // center inside the lens (magnify) and fade to neutral at the rim.
  const N = 160, LENS = 0.8, map = document.createElement("canvas");
  map.width = map.height = N;
  const g = map.getContext("2d"), img = g.createImageData(N, N);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const u = ((x + 0.5) / N * 2 - 1) / LENS, v = ((y + 0.5) / N * 2 - 1) / LENS;
    const r2 = u * u + v * v, w = r2 < 1 ? (1 - r2) * (1 - r2 * 0.35) : 0;
    const i = (y * N + x) * 4;
    img.data[i] = Math.round(127.5 - 127 * u * w);
    img.data[i + 1] = Math.round(127.5 - 127 * v * w);
    img.data[i + 2] = 128; img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  const href = map.toDataURL();

  const defs = document.createElementNS(NS, "svg");
  defs.setAttribute("width", "0"); defs.setAttribute("height", "0");
  defs.setAttribute("aria-hidden", "true");
  defs.style.cssText = "position:absolute;width:0;height:0;overflow:hidden";
  document.body.appendChild(defs);

  const SHADOW = " drop-shadow(0 3px 3px rgba(11,22,48,.22)) drop-shadow(0 8px 10px rgba(11,22,48,.16))";
  const easeOutBack = t => 1 + 2.4 * Math.pow(t - 1, 3) + 1.4 * Math.pow(t - 1, 2);
  const easeIn = t => t * t;

  links.forEach((a, n) => {
    const svg = a.querySelector("svg"); if (!svg) return;
    const id = "lens-warp-" + n;
    // square filter region centered on the icon (icons are 64x56)
    const f = document.createElementNS(NS, "filter");
    f.id = id;
    f.setAttribute("x", "-40%"); f.setAttribute("width", "180%");
    f.setAttribute("y", "-53%"); f.setAttribute("height", "206%");
    f.setAttribute("color-interpolation-filters", "sRGB");
    const fi = document.createElementNS(NS, "feImage");
    fi.setAttribute("href", href);
    fi.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", href);
    fi.setAttribute("preserveAspectRatio", "none");
    fi.setAttribute("result", "map");
    const dm = document.createElementNS(NS, "feDisplacementMap");
    dm.setAttribute("in", "SourceGraphic"); dm.setAttribute("in2", "map");
    dm.setAttribute("xChannelSelector", "R"); dm.setAttribute("yChannelSelector", "G");
    dm.setAttribute("scale", "0");
    f.append(fi, dm); defs.appendChild(f);

    let cur = 0, raf = 0, on = false;
    const peak = () => svg.getBoundingClientRect().width * 0.42;
    const set = s => {
      cur = s; dm.setAttribute("scale", s.toFixed(2));
      svg.style.filter = s > 0.05 ? `url(#${id})` + SHADOW : "";
    };
    const tween = (to, ms, ease) => {
      cancelAnimationFrame(raf);
      if (reduce.matches || document.body.classList.contains("quiet-mode")) { set(to); return; }
      const from = cur, t0 = performance.now();
      const step = now => {
        const t = Math.min(1, (now - t0) / ms);
        set(from + (to - from) * ease(t));
        if (t < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };
    const enter = () => { if (on) return; on = true; tween(peak(), 520, easeOutBack); };
    const leave = force => {
      if (!on) return;
      if (!force && a.matches(":focus-visible")) return; // keyboard focus keeps the lens
      on = false; tween(0, 200, easeIn);
    };
    a.addEventListener("pointerenter", e => { if (e.pointerType !== "touch") enter(); });
    a.addEventListener("pointerleave", () => leave(false));
    a.addEventListener("focus", () => { if (a.matches(":focus-visible")) enter(); });
    a.addEventListener("blur", () => leave(true));
  });
})();
