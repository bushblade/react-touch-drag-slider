# FINDINGS.md

Audit of `react-touch-drag-slider` — Aug 2026.
Each finding can be picked off independently. Mark `[x]` when resolved.

---

- [ ] **Narrow React peer dep** — `peerDependencies.react` is `^19.1.1`. React 18 users get peer dep warnings on install. Broaden to `>=18` if no React 19-specific APIs are used (currently none are).

- [x] **Dead `styled-components` externalization** — `vite.config.ts` lists `styled-components` in `rollupOptions.external` and `output.globals`, but the library never imports it. Remove it to avoid confusion.

- [x] **No CI workflow** — `.github/` only has `FUNDING.yml`. Add a GitHub Actions workflow that runs `pnpm lint`, `npx tsc --noEmit`, and `pnpm test` on PRs and pushes to main.

- [ ] **Snapshot-only test** — `src/lib/Slider.test.tsx` has one snapshot render. No interaction tests exist for drag, swipe, keyboard navigation, or threshold snapping. Consider adding `@testing-library/user-event` tests for core interactions.

- [x] **`tsconfig` moduleResolution** — `tsconfig.json` uses `"moduleResolution": "Node"`. For a Vite project, `"Bundler"` is more accurate and avoids subtle resolution differences.

- [ ] **UMD output may be unnecessary** — UMD is increasingly niche; most bundlers consume ESM. Consider dropping UMD in a future major version to simplify the build.

- [ ] **Inline vitest test in `src/utils.ts`** — Uses `import.meta.vitest` pattern (Vite plugin feature). Works but is unusual; contributors may not notice it. Consider moving to a separate test file for discoverability.

### Accessibility (a11y)

- [ ] **Stale `aria-valuenow`** — `Slider.tsx:223` sets `aria-valuenow={activeIndex ?? 0}`, reflecting only the prop, not the live position. It never updates during drag or keyboard navigation, defeating the `role="slider"` semantics. Track `sliderPosition.currentIndex` and update it live as the slide changes.

- [ ] **No live announcement of slide changes** — when the slide changes via keyboard or drag, screen readers get no announcement. Consider `aria-live` or updating `aria-valuenow` (above) on every change.

### Code quality / bugs

- [ ] **Duplicate `<style>` injection** — `Slide.tsx:32` emits a `<style>` tag for every slide, duplicating identical CSS N times in the DOM. Hoist it once (e.g. render in the Slider or as a single global style).

- [ ] **Redundant `transitionOn()` in `pointerEnd`** — `Slider.tsx:186` and `:195` call it back-to-back; one call is dead.

- [ ] **`child.key` may be undefined** — `Slider.tsx:239` maps with `key={child.key}`; if a consumer omits keys React warns and behavior is undefined. Derive a stable key (e.g. index) or document the requirement.

- [ ] **rAF not cancelled on unmount** — `animationRef` (`Slider.tsx:58`) is never cleaned up if the component unmounts mid-drag, leaving a `requestAnimationFrame` loop running against a detached node. Cancel it in a cleanup effect.

- [ ] **Drag offset edge case** — `pointerStart` (`Slider.tsx:163`) calls `goTo(index)` without resyncing `prevTranslate`, so pressing a partially-visible non-current slide starts the drag from the wrong offset. Recompute `prevTranslate` for the newly selected index.

### DX / API polish

- [x] **`threshHold` typo** — the public prop was misspelled (acknowledged in `CONTEXT.md`). Renamed to correctly-spelled `threshold` as a breaking change (v3.0.0).

---

Resolved:

- [x] **Created AGENTS.md** — Added compact agent instruction file with commands, code style, source layout, build notes, and gotchas.
