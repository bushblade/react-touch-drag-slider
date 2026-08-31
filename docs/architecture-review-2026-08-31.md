# Architecture review — react-touch-drag-slider

Status: findings only (no changes applied). Review date 2026-08-31.

- `[ ]` indicates pending work.
- `[x]` indicates resolved.

The pure **Slider position** module (ADR-0001) is in good shape. The friction is
on the other side of its seam: the adapter it was meant to keep thin has
absorbed the drag gesture, the translate arithmetic, the rAF lifecycle, and the
index mirror. Recent history agrees — the last four fixes to the library (rAF
cancel on unmount, aria sync, arrow-key focus gating, prevTranslate resync) all
landed in `src/lib/Slider.tsx`.

Architecture vocabulary: module, interface, implementation, depth, seam,
adapter, leverage, locality. Domain vocabulary from `CONTEXT.md`: **Slider
position**, **Slide**, **Threshold**, **Drag**.

## 1. Slider motion module

Recommendation: **Strong** · in-process

Files: `src/lib/Slider.tsx`, `src/lib/sliderPosition.ts`, `src/lib/Slider.test.tsx`

ADR-0001 calls Slider a thin adapter, but the drag interaction — pointer deltas,
the rAF loop, the mode switch between "settled at an index" and "following the
pointer", the unmount cancellation — all live in the component body, untested
behind a mounted-DOM interface. Deepen: move the drag interaction, the translate
derivation, and the settle-to-index rule behind one small seam the component
calls, so the adapter keeps only what touches the DOM. This *completes*
ADR-0001; callbacks still fire from the adapter.

Explored 2026-08-31 on branch `feature/slider-motion-module` and abandoned.
A `SliderMotion` module was extracted and unit-tested, but the candidate broke
the package in both environments: live dragging stopped working (the rAF loop
called `window.requestAnimationFrame` with the wrong `this`, throwing
`Illegal invocation`, so the translate was only applied on release — the slide
snapped instead of following the cursor) and Astro SSR crashed (`window`
referenced in the module constructor, which runs during server render). The
existing tests could not catch either bug because they injected mock rAF
functions, never exercising the real browser paths. Judged not worth the added
complexity; no changes shipped. Re-attempt only with real-browser and SSR test
coverage.

- `[ ]` 1.1 Extract the drag interaction (pointer deltas, rAF loop, mode
  switch, settle-on-release) into a module behind the Slider seam.
- `[ ]` 1.2 Move the translate derivation (index → translateX, mid-drag
  pointer-following) into the module.
- `[ ]` 1.3 Move the threshold hand-off — `snapBy(movedBy)` — into the module's
  settle operation.
- `[ ]` 1.4 Reduce the adapter to DOM-only work: dimensions, pointer/keyboard
  wiring, applying the translate, firing callbacks, mirroring the aria value.
- `[ ]` 1.5 Test drag arithmetic (deltas, threshold snap, clamping) through the
  module's interface instead of mounted-DOM aria proxies.
- `[ ]` 1.6 Verify `onSlideStart`/`onSlideComplete` still fire from the adapter
  (ADR-0001: callbacks fire from the adapter, not the module).

## 2. Slide fold

Recommendation: **Worth exploring** · in-process

Files: `src/lib/Slide.tsx`, `src/lib/Slider.tsx`

`Slide` is shallow — interface nearly as wide as its implementation (two styled
wrappers) — and its only real behaviour, scale-on-drag, is a second pointer
listener on a nested element, wired to the same gesture as the translate with
nothing connecting them. Deepen: make the scale a derivative of the drag
lifecycle and let Slide's markup collapse back into the Slider's slide map.

- `[ ]` 2.1 Make scale-on-drag a derivative of the drag lifecycle — one
  listener for both the translate and the scale transform.
- `[ ]` 2.2 Collapse Slide's markup into the Slider's slide map.
- `[ ]` 2.3 Reduce `scaleOnDrag` to one flag consumed at one seam.
- `[ ]` 2.4 Delete `src/lib/Slide.tsx` once folded (deletion test: it passes
  through, so fold it in).

## 3. Single source of truth for the slider index

Recommendation: **Worth exploring** · in-process

Files: `src/lib/Slider.tsx`

The authoritative index lives in `SliderPosition`; React state mirrors it purely
for aria-valuenow, and every handler re-mirrors manually — four scattered
`syncIndex()` calls that drifted once and shipped the aria bug (4b5b5f5).
Deepen: derive the translate and the aria value from one position read at a
single point in the adapter.

- `[ ]` 3.1 Derive translate + aria-valuenow from one position read at a single
  point in the adapter.
- `[ ]` 3.2 Replace the four hand-synced `syncIndex()` sites with one
  subscription.
- `[ ]` 3.3 Add a regression test for the aria drift bug class (4b5b5f5).

## Top recommendation

Start with candidate 1 — the Slider motion module. It is where the recent bugs
keep landing, it is the largest behaviour still sitting on the wrong side of the
seam, and candidates 2 and 3 become natural consequences of it: once the drag
lifecycle is a module, the scale and the index mirror are just derivatives of
its state. Do not stop at SliderPosition — ADR-0001's job is only half done.