# Nourish

A clean, minimal recipe finder. Search any dish, ingredient, or cuisine and get full ingredient lists with step‑by‑step instructions — no clutter, no ads, no sign‑up.

Built as a single self‑contained HTML file with light and dark mode, powered by [TheMealDB](https://www.themealdb.com/api.php).

---

## Features

- **Instant search** — look up recipes by name, ingredient, or cuisine
- **Quick filters** — one‑tap chips for popular categories (Chicken, Pasta, Soup, Vegetarian, Dessert)
- **Surprise me** — pulls a random recipe when you don't know what to cook
- **Recipe detail view** — full ingredient list with measurements, plus complete cooking instructions
- **Light & dark mode** — respects your system preference, with a manual toggle
- **Responsive** — works cleanly on mobile, tablet, and desktop
- **Accessible** — keyboard navigable, visible focus states, reduced‑motion support
- **Zero dependencies** — no build step, no framework, no install

---

## Getting started

Nourish is a single HTML file. No build tools, no package manager, no server required.

1. Download `recipe_finder.html`
2. Open it in any modern browser

That's it. The app fetches live data from TheMealDB's public API on search.

> **Note:** Requires an internet connection — recipe data is fetched in real time, nothing is bundled locally.

---

## Tech stack

| Layer | Choice |
|---|---|
| Markup | Semantic HTML5 |
| Styling | Vanilla CSS with custom properties (CSS variables) for theming |
| Logic | Vanilla JavaScript (no framework) |
| Fonts | [Fraunces](https://fonts.google.com/specimen/Fraunces) (display) + [Inter](https://fonts.google.com/specimen/Inter) (body), via Google Fonts |
| Data | [TheMealDB API](https://www.themealdb.com/api.php) (free tier, no key required) |

---

## Project structure

```
nourish/
└── recipe_finder.html   # entire app — markup, styles, and logic in one file
```

---

## How theming works

Colors are defined once as CSS custom properties on `:root`, then overridden under `[data-theme="dark"]`. Toggling dark mode simply flips a `data-theme` attribute on `<body>` — no class juggling, no duplicate stylesheets.

```css
:root {
  --bg: #FAF9F6;
  --accent: #3F5D3F;
  /* ... */
}

[data-theme="dark"] {
  --bg: #121210;
  --accent: #7FAE7A;
  /* ... */
}
```

On load, Nourish checks `prefers-color-scheme` to match your system setting, then remembers your manual choice for the session.

---

## API reference

Nourish uses three TheMealDB endpoints:

| Purpose | Endpoint |
|---|---|
| Search by name | `GET /search.php?s={query}` |
| Random recipe | `GET /random.php` |
| (Available, not yet wired up) Filter by ingredient | `GET /filter.php?i={ingredient}` |

No API key is needed for the free tier used here.

---

## Roadmap

- [ ] Filter by ingredient, not just dish name
- [ ] Save favorite recipes locally
- [ ] Adjustable serving sizes
- [ ] Print‑friendly recipe view
- [ ] Offline caching of recently viewed recipes

---

## Credits

Recipe data and images courtesy of [TheMealDB](https://www.themealdb.com/).

---

## License

For personal and educational use. Recipe content and images belong to TheMealDB and their respective contributors.
