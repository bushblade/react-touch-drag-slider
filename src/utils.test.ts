import { describe, expect, it } from 'vitest'

import { getElementDimensions } from './utils'

describe('getElementDimensions', () => {
  it('Gets an elements dimensions', () => {
    const div = document.createElement('div')
    expect(getElementDimensions(div)).toStrictEqual({
      width: 0,
      height: 0,
    })
  })
})
