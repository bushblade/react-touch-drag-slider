import React from 'react'
import { describe, expect, test } from 'vitest'
import { render } from '@testing-library/react'

import Slider from './Slider'
import images from '../images'

describe('Slider test', () => {
  test('It should render', () => {
    const result = render(
      <Slider>
        {images.map((image) => (
          <img src={image.url} alt={image.title} key={image.url} />
        ))}
      </Slider>
    )
    expect(result).toMatchSnapshot()
  })
})
