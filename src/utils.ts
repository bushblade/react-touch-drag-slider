export function getElementDimensions(element: HTMLDivElement) {
  const width = element.clientWidth
  const height = element.clientHeight
  return { width, height }
}

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest
  const div = document.createElement('div')
  it('Gets an elements dimensions', () => {
    expect(getElementDimensions(div)).toStrictEqual({
      width: 0,
      height: 0,
    })
  })
}
