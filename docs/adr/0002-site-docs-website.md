# 0002 - Docs site lives in-repo as a pnpm workspace package

The documentation and demo site is a second package (`site/`) in this repo,
built with Astro 7, MDX, React islands, and Tailwind CSS 4, deployed to
Netlify. A separate docs repo was rejected: for a single-component library it
means two repos and two pipelines, and the publish boundary is already safe —
the library's `files: ["dist"]` whitelists only `dist/`, so `site/` can never
ship to npm.

The site consumes the package in two ways:

- **Production** resolves the bare import `react-touch-drag-slider` to the
  package's `exports` -> `dist/lib.es.js`, so the site exercises the actual
  published artifact (a build-time smoke test).
- **Development** aliases the import to `src/lib/index.ts` (keyed on
  `process.env.NODE_ENV`), so `site dev` needs no build and never serves a
  stale `dist`.

`workspace:*` pins the site to `main`, which can be ahead of the latest npm
release. This is intended: docs and code move together. Pin to released
versions instead if the site must only document shipped behaviour.

Netlify deploys from a root-level `netlify.toml` (publish dir `site/dist`);
the build command builds the library first, then the site. GitHub Actions CI
is the quality gate (lint, typecheck, tests, lib build, site build + `astro
check`); Netlify is deploy-only.

The two public StackBlitz example repos are retained but no longer linked
from the README; their content is ported to the site's example pages.

Status: accepted