# StreamGlass for FreshRSS

The [StreamRSS](https://github.com/s39n/StreamRSS) look for the FreshRSS web UI: a dark aurora
background, frosted glass panels and cards, read items faded back, and a soft blue accent (`#8AB4FF`).

It's a style-only FreshRSS extension designed to sit on top of
[Youlag](https://github.com/civilblur/youlag): it re-skins Youlag's design tokens (`--yl-*`), so
both Youlag's article mode and its video grid pick up the glass style. It also works without Youlag.

## Install

Copy `xExtension-StreamGlass/` into FreshRSS's `extensions/` folder
(on the NAS: `/share/Docker/FreshRSS/extenshions/`), then enable **StreamGlass** under
FreshRSS → Settings → Extensions.

Keep Youlag's own theme setting on **dark**; StreamGlass is a dark theme.

## Tweak

All colours are variables at the top of `static/streamglass.css` (`--sg-*`), e.g.
`--sg-glass` for card opacity, `--sg-reader` for the reading pane, and the aurora blobs in
`html body { background: … }`.

## Files

- `metadata.json`, `extension.php` — registers the stylesheet
- `static/streamglass.css` — the theme
