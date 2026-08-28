import { describe, expect, test, vi, afterEach } from 'vitest'
import { render, fireEvent } from '@testing-library/react'

import Slider from './Slider'
import images from '../images'

describe('Slider test', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

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

  test('It should cancel the animation frame loop on unmount mid-drag', () => {
    const cancelSpy = vi.spyOn(window, 'cancelAnimationFrame')
    const result = render(
      <Slider>
        {images.map((image) => (
          <img src={image.url} alt={image.title} key={image.url} />
        ))}
      </Slider>
    )
    const firstSlide = result.container.querySelector('.slide-outer')
    if (firstSlide) {
      fireEvent.pointerDown(firstSlide, { pageX: 100 })
    }
    result.unmount()
    expect(cancelSpy).toHaveBeenCalled()
  })
})
