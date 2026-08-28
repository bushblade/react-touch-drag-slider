// jsdom has no PointerEvent; alias it to MouseEvent so pointer events carry
// coordinates (clientX/pageX) through React's synthetic event system.
Object.defineProperty(window, 'PointerEvent', {
  value: MouseEvent,
  configurable: true,
})