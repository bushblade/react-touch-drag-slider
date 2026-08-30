# Site Plan: Astro + MDX docs site for react-touch-drag-slider

Status: accepted (grilled and hardened 2026-08-29); implemented and deployed to
https://react-touch-drag-slider.netlify.app/ on 2026-08-30. Retained as the
decision record; see docs/site-audit.md for the post-deployment audit.

## Goal

Add a documentation and demo website for the published package
(`react-touch-drag-slider`), deployed to Netlify. The site lives inside this
repo as a second pnpm workspace package (`site/`).

## Decisions

- **Location**: `site/` in this repo, a pnpm workspace package alongside the
  existing root library package. A separate repo was considered and rejected:
  for a single-component library it means two repos, two pipelines, and a
  permanent sync tax on every API change. The publish boundary is already
  safe — `package.json` `files: ["dist"]` whitelists only `dist/`, so `site/`
  can never ship to npm.
- **Tooling**: Astro 7 (Vite 8 / Rolldown, Node >= 22.12) with `@astrojs/react`
  and `@astrojs/mdx`, plus **Tailwind CSS 4** via the `@tailwindcss/vite`
  plugin (NOT the deprecated `@astrojs/tailwind`) and `@tailwindcss/typography`
  for `prose` styling of MDX content. `@astrojs/react` supports React 19; the
  site uses **React 19**.
- **How the site consumes the package**: `workspace:*` + dev-only alias.
  - Production resolves the bare import `react-touch-drag-slider` to the
    package's `exports` -> `dist/lib.es.js`, so the site exercises the actual
    published artifact (a build-time smoke test).
  - Dev aliases the import to `../src/lib/index.ts` keyed on
    `process.env.NODE_ENV !== 'production'` (Astro sets `NODE_ENV` to
    `development`/`production` before loading `astro.config.mjs`), so
    `site dev` needs no build and never serves a stale `dist`.
  - Netlify's build runs `pnpm build` (lib) before `pnpm --filter site build`.
- **Version tracking**: `workspace:*` means the site documents `main`, which
  can be ahead of the latest npm release. This is the intended behaviour —
  docs and code move together.
- **Hosting**: Netlify, **deploy-only** (no checks — GitHub Actions CI is the
  quality gate). `netlify.toml` lives at the **repo root** (a toml in `site/`
  would need the package directory set in the Netlify UI); `publish` is
  `site/dist`. Node pinned to **24** in `[build.environment]`.

## Repo structure after this work

```
repo root  (react-touch-drag-slider, the lib — build/scripts mostly untouched)
├── netlify.toml                    + build cmd (lib + site), publish site/dist, Node 24
├── pnpm-workspace.yaml             + packages: ['site'], allowBuilds + sharp
├── package.json                    + dev:site / build:site scripts; lint covers site ts/tsx
├── .github/workflows/ci.yml        + site build step
├── docs/adr/0002-site-docs-website.md   new ADR
└── site/                           new pnpm workspace package
    ├── package.json                private; deps: astro, @astrojs/react, @astrojs/mdx,
    │                               react 19, react-touch-drag-slider (workspace:*)
    ├── astro.config.mjs            react() + mdx() + @tailwindcss/vite;
    │                               dev-only vite alias -> ../src/lib/index.ts
    ├── tsconfig.json               extends astro/tsconfigs/strict (jsx react-jsx)
    └── src/
        ├── styles/global.css       @import 'tailwindcss'; @plugin '@tailwindcss/typography'
        ├── layouts/                SiteLayout.astro (nav / chrome), DocLayout.astro (prose)
        ├── components/             DemoSlider.tsx (controlled w/ buttons),
        │                           SliderExample.tsx (shared example island),
        │                           ExampleCallbacks.tsx (on-slide log)
        └── pages/
            ├── index.astro         hero + live gallery demo
            ├── usage.mdx           install + minimal example
            ├── props.mdx           7-prop reference table (hand-written)
            ├── examples/index.mdx  all six examples on one page: threshold,
            │                       transition, scale-on-drag, controlled w/
            │                       buttons, callbacks, keyboard
            └── a11y.mdx            keyboard + aria behaviour, incl. window-listener caveat
```

## Implementation steps

1. **Workspace wiring**
   - `pnpm-workspace.yaml`: add `packages: ['site']`; add `sharp: true` to
     `allowBuilds` (esbuild already present).
   - Root scripts: `dev:site` (`pnpm --filter site dev`), `build:site`
     (`pnpm build && pnpm --filter site build`).
   - Root `netlify.toml` (deploy-only, Node 24).
   - ci.yml: add `pnpm --filter site build` after the lib build step.

2. **Scaffold `site/` package**
   - `package.json`: private, `type: module`; scripts `dev`, `build`
     (`astro check && astro build`), `preview`.
   - Dependencies: `astro`, `@astrojs/react`, `@astrojs/mdx`, `react` 19,
     `react-dom` 19, `react-touch-drag-slider` (`workspace:*`).
   - Dev dependencies: `@astrojs/check`, `typescript` (`^6` — TS 7/tsgo is
     unsupported by `astro check`), `@types/react`, `@types/react-dom`,
     `tailwindcss`, `@tailwindcss/vite`, `@tailwindcss/typography`.
   - `astro.config.mjs`: `react()`, `mdx()`, `@tailwindcss/vite` in
     `vite.plugins`; `vite.resolve.alias` maps `react-touch-drag-slider` to
     `../src/lib/index.ts` only when `process.env.NODE_ENV !== 'production'`.
   - `tsconfig.json`: extend `astro/tsconfigs/strict`; `jsx: react-jsx`,
     `jsxImportSource: react`. Root `tsc` is unaffected (site outside root
     tsconfig `include`).

3. **Netlify config** (root `netlify.toml`)
   - `[build]`: `command = "pnpm build && pnpm --filter site build"`,
     `publish = "site/dist"`.
   - `[build.environment]`: `NODE_VERSION = "24"`.
   - pnpm install is auto-detected via corepack + the repo's `packageManager`
     field (lockfile lives at the repo root, matching the default base dir).

4. **Site content**
   - `global.css`: `@import 'tailwindcss'` + `@plugin '@tailwindcss/typography'`.
   - `SiteLayout.astro`: header/nav/footer chrome. `DocLayout.astro` wraps MDX
     content in `prose`; `index.astro` uses bespoke markup.
   - `DemoSlider.tsx`: gallery island (`client:load`) — controlled
      `activeIndex` with prev/next buttons, ported from `src/App.tsx`.
   - A single prop-driven `SliderExample.tsx` island covers threshold,
     transition, scale-on-drag and keyboard; `ExampleCallbacks.tsx` (on-slide
     log) renders it too. All examples consolidated onto one
     `examples/index.mdx` page.
   - `usage.mdx`, `props.mdx` (7-prop hand-written table), `a11y.mdx`.

5. **Consolidation**
   - Port the two StackBlitz examples (`rtds-example-basic`,
     `rtds-advanced-example`) into `examples/` pages.
   - Retain both StackBlitz repos (deleting them would 404 existing npm/README
     links). README links updated to point at the site (commit 92650d2).
     PENDING (external): deprecation note on each repo's README.
   - Keep the busbhlade.co.uk gallery link as a real-world example.

6. **Housekeeping**
   - `site/dist` is covered by the global `dist` ignore in `.gitignore`.
   - `pnpm lint` becomes `biome lint src/ site/src` (Biome has
      `files.ignoreUnknown: false`; `.astro`/`.mdx` are `astro check`'s job;
      file scoping lives in biome.json `includes`).
   - ADR `0002` documents this architecture.

## Implementation notes & gotchas (verified)

- pnpm 11 `allowBuilds`: esbuild (already) and **sharp** (Astro's image
  service) both need approval or `pnpm install` fails with
  `ERR_PNPM_IGNORED_BUILDS`. Tailwind packages have no lifecycle scripts — no
  entry needed.
- `@tailwindcss/typography` must be a **declared dependency of the site
  package** (pnpm doesn't hoist) or `@plugin "@tailwindcss/typography"` fails
  to resolve from `global.css`.
- `astro check` needs `typescript` pinned to `^6` (TS 7 native compiler
  unsupported).
- Site `build` script is `astro check && astro build`; CI runs
  `pnpm --filter site build`. Prod-mode site build requires `dist` to exist,
  so `build:site` and Netlify's command build the lib first.

## Open items (resolved)

- ~~Exact Netlify Node version~~ → 24.
- ~~Whether to extend `pnpm lint` to the site~~ → yes, ts/tsx scoped.
- ~~Whether to keep or retire the StackBlitz example repos~~ → keep repos,
  drop README links, deprecation note per repo (external follow-up).
- `navigateOnArrowKeys` prop idea (default `true`) → tracked as a GitHub
  issue; lib scope, not part of the site work.
- Site URL → deployed at the Netlify default subdomain
  (https://react-touch-drag-slider.netlify.app/); custom domain not set.

## Implemented beyond the plan

- `site` set in `astro.config.mjs` + `@astrojs/sitemap` (canonical URLs,
  sitemap-index.xml); `public/` with favicon, robots.txt, og-image.png; OG/Twitter
  meta in `SiteLayout.astro`.
- Self-hosted fonts (`@fontsource-variable/inter`, `@fontsource-variable/space-
  grotesk`, `@fontsource/jetbrains-mono`); astro-icon with lucide/simple-icons;
  light/dark theme toggle (tokyo-night shiki themes); heading anchors + smooth
  scroll; 404 page; `BrowserFrame.astro` example wrapper.
- A11y pass from `docs/site-audit.md` (contrast fixes, aria-labels, focus
  return, `:focus-visible` outline).
- GitHub Actions `ci.yml` added as the quality gate (lint, typecheck, tests,
  lib + site build); Netlify remains deploy-only.