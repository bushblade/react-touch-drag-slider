export function getElementDimensions(element: HTMLDivElement) {
  const width = element.clientWidth
  const height = element.clientHeight
  return { width, height }
}
