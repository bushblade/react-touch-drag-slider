// FIX: don't use any
export function getPositionX(event: React.TouchEvent | React.MouseEvent | any) {
  return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX
}

export function getElementDimensions(element: HTMLDivElement) {
  const width = element.clientWidth
  const height = element.clientHeight
  return { width, height }
}
