export function getPositionX(event) {
  return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX
}

export function getElementDimensions(ref) {
  const width = ref.current.clientWidth
  const height = ref.current.clientHeight
  return { width, height }
}
