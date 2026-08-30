# Site audit — `react-touch-drag-slider` docs site

Status: findings only (no fixes applied). Audit date 2026-08-29, ahead of
Netlify deployment.

- `[ ]` indicates pending work.
- `[x]` indicates resolved (done or explicitly out of scope).

## 1. A11y

- [x] **1.1 Contrast fails WCAG AA (highest priority).** Computed ratios:
  - Light `fg-muted #707280` on bg = **3.86:1** (nav links, hero copy at
    text-sm/text-lg — fails 4.5:1 for normal text).
  - Light `fg-faint #9da0ab` = **2.11:1** (footer, BrowserFrame titles,
    "Slide X of Y" counter, callbacks hint).
  - Dark `fg-faint #565f89` = **2.76–2.91:1**.
  - Fix in `site/src/styles/global.css` `@theme` blocks. Resolved: light
    `fg-muted` → `#5c5f70` (5.12:1), light `fg-faint` → `#606374` (4.82:1),
    dark `fg-faint` → `#7e89b0` (4.96:1), light `code-bg` → `#dfe1e9`
    (console hint now 4.55:1). Added a `:focus-visible` outline rule.
- [x] **1.2 Two unnamed `<nav>` landmarks** (`Header.astro:18`,
  `MobileMenu.astro:13`) expose identical link sets. Add distinct
  `aria-label`s (e.g. "Primary" / "Mobile").
- [x] **1.3 "Slide X of Y" counter** (`DemoSlider.tsx:41`) isn't announced on
  slide change — add `aria-live="polite"`.
- [x] **1.4 MobileMenu** closes on Escape (`MobileMenu.astro:38`) but focus is
  never returned to the toggle button. Now returns focus to `#menu-toggle`
  when Escape closes the open menu.
- [x] **1.5 Minor:** no custom `focus-visible` styling on nav/links beyond
  browser default. Added a global `:focus-visible` outline (accent).
- [x] **1.6 Out of scope:** demo image alt text (`images.ts` uses "Nature
  Image1") — sample code for documentation purposes only.

## 2. SEO

- [x] **2.1 No `site` in `astro.config.mjs`** and no `@astrojs/sitemap` → no
  canonical URLs, no sitemap.xml. Resolved: `site` set to the Netlify URL,
  `@astrojs/sitemap` added (sitemap-index.xml + sitemap-0.xml generated);
  canonical + `og:url` emitted per page from `Astro.site`.
- [x] **2.2 No `public/` directory** → no favicon (404 every page), no
  `robots.txt`, no `og:image`. Resolved: `site/public/` added with
  `favicon.svg` (the header-logo glyph; linked + apple-touch-icon),
  `robots.txt` (allow-all + Sitemap line), and a 1200×630 `og-image.png`
  (RGB) captured from a live screenshot of the site.
- [x] **2.3 No Open Graph / Twitter meta** in `SiteLayout.astro` head → bare
  share cards on social. Resolved: `og:title/description/type/site_name/
  image/url` + `twitter:card=summary_large_image` etc., driven by
  `title`/`description`/`ogImage` layout props.
- [x] **2.4 Index `<title>`** is just the brand; now keyword-first "Touch and
  drag slider for React" → "Touch and drag slider for React ·
  react-touch-drag-slider".
- [x] **2.5 Per-page titles/layouts are otherwise good**; anchor links have
  proper `aria-label`s and `tabIndex={-1}`. Note: MDX `title` frontmatter was
  silently dropped by the layout (Astro 7 passes it via `frontmatter`, not
  top-level props) — `DocLayout` now reads `frontmatter.title`, so per-page
  titles render correctly.

## 3. Component reuse / redundancy

- [x] **3.1 Four near-identical islands** — `ExampleThreshold`,
  `ExampleTransition`, `ExampleScaleOnDrag`, `ExampleKeyboard` differ only in
  Slider props, and the `<div class="h-64 …"><Slider>…</Slider></div>` block
  is repeated 5× across examples. Extract a single prop-driven
  `SliderExample.tsx`. Resolved: new `SliderExample.tsx` (forwarded
  `ComponentProps<typeof Slider>`, shared wrapper + images map); the four
  islands are deleted and their props inlined at the MDX call sites;
  `ExampleCallbacks` now renders `SliderExample` too (5× → 1× wrapper).
- [x] **3.2 Unused CSS tokens** — `--color-surface-2` is defined
  (`global.css`) but never referenced; `--color-code-border` used once and
  equals `--color-border`. Resolved: both tokens deleted; code-block border
  now uses `--color-border`.
- [x] **3.3 Duplicated `.astro-code` / `.dark .astro-code`** rules
  (`global.css`) — four identical declarations, mergeable into one selector
  list. Resolved: shared bg/border/radius merged into `.astro-code,
  .dark .astro-code`; `.dark` only overrides color. `.astro-code span` rules
  kept separate — their `font-style/weight/decoration` use per-theme shiki
  vars and are not mergeable.
- [x] **3.4 `src/icons/` is dead** — only `.gitkeep`; astro-icon uses the
  Iconify sets. Resolved: no local icons exist, but the empty dir is kept —
  astro-icon's default local-icon scan expects it and otherwise warns per
  build.
- [x] **3.5 `DemoSlider` prev/next buttons** share identical class strings
  (minor). Resolved: hoisted to a shared `buttonClass` const.

## 4. Code practice

- [x] **4.1 Docs verified accurate** against `Slider.tsx` (props table,
  defaults, a11y claims all match); self-hosted fonts; external links
  `rel="noopener noreferrer"`; recent `BrowserFrame` extraction is clean.
- [x] **4.2 Gap vs. plan:** `docs/site-plan.md` step 5 calls for a `ci.yml`
  site-build step, but `.github/` has only `FUNDING.yml` — Netlify is
  currently deploy-only with no quality gate (per plan this was intended to
  be CI's job). Worth flagging before relying on the deploy. Resolved: a
  `ci.yml` workflow now exists (`.github/workflows/ci.yml`) with a
  `pnpm --filter site build` step; the audit predates it.
- [ ] **4.3 No unit tests, a11y checks, or Lighthouse step** in the site
  pipeline (acceptable for a docs site, but noted).
- [x] **4.4 Window-keydown listener caveat** accurately documented in both
  `a11y.mdx` and `examples/index.mdx`.

## Suggested deployment-time order

1. Contrast fixes (1.1).
2. `public/` favicon + `robots.txt` + OG meta (2.2, 2.3).
3. Nav landmark labels (1.2).
4. Sitemap / `site` config once the URL is fixed (2.1).

The rest are refactors with no user-facing risk.