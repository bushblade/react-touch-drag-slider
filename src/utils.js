export function getPositionX(event) {
  return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX
}

export function getElementDimensions(ref) {
  const { width, height } = ref.current.getBoundingClientRect()
  return { width, height }
}
