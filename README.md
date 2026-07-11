# 🥗 Nourish

A clean, minimal recipe finder. Search any dish, ingredient, or cuisine and get full ingredient lists with step‑by‑step instructions — no clutter, no ads, no sign‑up.

<p>
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/API-TheMealDB-3F5D3F?style=flat-square" alt="TheMealDB API">
  <img src="https://img.shields.io/badge/dependencies-none-brightgreen?style=flat-square" alt="No dependencies">
  <img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="MIT License">
  <img src="https://img.shields.io/badge/PRs-welcome-ff69b4?style=flat-square" alt="PRs Welcome">
</p>

---

## Features

- **Instant search** — look up recipes by name, ingredient, or cuisine
- **Quick filters** — one‑tap chips for popular categories (Chicken, Pasta, Soup, Vegetarian, Dessert)
- **Surprise me** — pulls a random recipe when you don't know what to cook
- **Recipe detail view** — full ingredient list with measurements, plus complete cooking instructions
- **Light & dark mode** — respects your system preference, with a manual toggle
- **Responsive** — works cleanly on mobile, tablet, and desktop
- **Accessible** — keyboard navigable, visible focus states, reduced‑motion support
- **Zero dependencies** — no build tools, no package manager, no framework

---

## Demo

Open `index.html` in any modern browser — that's the whole app.

<p align="center">
  <img src="https://i.postimg.cc/wTZRhrmL/naurish1.png" width="48%">
  <img src="https://i.postimg.cc/x8FJpxFc/naurish2.png" width="48%">
</p>
Visit this URL : https://akash098p.github.io/Nourish/

---

## Project structure

```
nourish/
├── index.html     # page markup and structure
├── style.css      # theming, layout and component styles
└── script.js      # search logic, API calls and modal behavior
```

---

## Getting started

### Option 1 — Clone the repo

```bash
git clone https://github.com/akash098p/Nourish.git
cd Nourish 
```

Then just open `index.html` in your browser — no install step, no server required.

### Option 2 — Download directly

Grab `index.html`, `style.css`, and `script.js` and keep them in the same folder, then open `index.html`.

> **Note:** Requires an internet connection — recipe data is fetched live from TheMealDB, nothing is bundled locally.

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

## How theming works

Colors are defined once as CSS custom properties in `style.css` on `:root`, then overridden under `[data-theme="dark"]`. Toggling dark mode simply flips a `data-theme` attribute on `<body>` — no class juggling, no duplicate stylesheets.

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

On load, `script.js` checks `prefers-color-scheme` to match your system setting, then remembers your manual choice for the session.

---

## API reference

Nourish uses these [TheMealDB](https://www.themealdb.com/api.php) endpoints:

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

MIT — free to use, modify and share. Recipe content and images belong to TheMealDB and their respective contributors.
