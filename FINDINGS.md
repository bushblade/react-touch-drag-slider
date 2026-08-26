# FINDINGS.md

Audit of `react-touch-drag-slider` — Aug 2026.
Each finding can be picked off independently. Mark `[x]` when resolved.

---

- [ ] **Narrow React peer dep** — `peerDependencies.react` is `^19.1.1`. React 18 users get peer dep warnings on install. Broaden to `>=18` if no React 19-specific APIs are used (currently none are).

- [x] **Dead `styled-components` externalization** — `vite.config.ts` lists `styled-components` in `rollupOptions.external` and `output.globals`, but the library never imports it. Remove it to avoid confusion.

- [ ] **No CI workflow** — `.github/` only has `FUNDING.yml`. Add a GitHub Actions workflow that runs `pnpm lint`, `npx tsc --noEmit`, and `pnpm test` on PRs and pushes to main.

- [ ] **Snapshot-only test** — `src/lib/Slider.test.tsx` has one snapshot render. No interaction tests exist for drag, swipe, keyboard navigation, or threshold snapping. Consider adding `@testing-library/user-event` tests for core interactions.

- [x] **`tsconfig` moduleResolution** — `tsconfig.json` uses `"moduleResolution": "Node"`. For a Vite project, `"Bundler"` is more accurate and avoids subtle resolution differences.

- [ ] **UMD output may be unnecessary** — UMD is increasingly niche; most bundlers consume ESM. Consider dropping UMD in a future major version to simplify the build.

- [ ] **Inline vitest test in `src/utils.ts`** — Uses `import.meta.vitest` pattern (Vite plugin feature). Works but is unusual; contributors may not notice it. Consider moving to a separate test file for discoverability.

---

Resolved:

- [x] **Created AGENTS.md** — Added compact agent instruction file with commands, code style, source layout, build notes, and gotchas.
