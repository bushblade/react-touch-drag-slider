# 0001 - Slider position is a pure internal module

The slider's position logic (index, threshold snapping, clamping) is a
standalone module (`SliderPosition`) with no React or DOM dependency, kept
internal to the package rather than exported. The `Slider` component is a
thin adapter that wires pointer events, keyboard input, and the activeIndex
prop to its `goTo` / `snapBy` interface, derives the translate from the index,
and applies it to the DOM. Callbacks (`onSlideStart` / `onSlideComplete`)
fire from the adapter, not the module.

We chose this so the snapping and clamping rules — the behaviour bugs live in
— are testable through a pure interface without mounting React or a DOM, and
so the logic concentrates in one place instead of spreading across handlers.
The module is recreated when the slide count or threshold changes, preserving
the current index.

Status: accepted