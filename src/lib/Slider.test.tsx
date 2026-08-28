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

  test('It should update aria-valuenow as the slide changes via keyboard', () => {
    const result = render(
      <Slider>
        {images.map((image) => (
          <img src={image.url} alt={image.title} key={image.url} />
        ))}
      </Slider>
    )
    const slider = result.container.querySelector('[data-testid="slider"]')
    if (!slider) throw new Error('slider not found')
    expect(slider.getAttribute('aria-valuenow')).toBe('0')

    fireEvent.keyDown(slider, { key: 'ArrowRight' })
    expect(slider.getAttribute('aria-valuenow')).toBe('1')

    fireEvent.keyDown(slider, { key: 'ArrowRight' })
    expect(slider.getAttribute('aria-valuenow')).toBe('2')

    fireEvent.keyDown(slider, { key: 'ArrowLeft' })
    expect(slider.getAttribute('aria-valuenow')).toBe('1')
  })
})

describe('Slider drag interaction', () => {
  const renderSlider = (activeIndex?: number) => {
    const result = render(
      <Slider activeIndex={activeIndex}>
        {images.map((image) => (
          <img src={image.url} alt={image.title} key={image.url} />
        ))}
      </Slider>
    )
    const slides = () =>
      result.container.querySelectorAll<HTMLElement>('.slide-outer')
    const slider = () =>
      result.container.querySelector<HTMLElement>('[data-testid="slider"]')
    return { result, slides, slider }
  }

  const drag = (slide: HTMLElement, from: number, to: number) => {
    fireEvent.pointerDown(slide, { clientX: from })
    fireEvent.pointerMove(slide, { clientX: to })
    fireEvent.pointerUp(slide)
  }

  test('It snaps to the next slide when dragged left past the threshold', () => {
    const { result, slides, slider } = renderSlider()
    const el = slides()[0]
    const sliderEl = slider()
    if (!el || !sliderEl) throw new Error('elements not found')

    drag(el, 200, 50) // movedBy -150 < -threshold(100)
    expect(sliderEl.getAttribute('aria-valuenow')).toBe('1')
    result.unmount()
  })

  test('It snaps to the previous slide when dragged right past the threshold', () => {
    const { result, slides, slider } = renderSlider(1)
    const el = slides()[1]
    const sliderEl = slider()
    if (!el || !sliderEl) throw new Error('elements not found')
    expect(sliderEl.getAttribute('aria-valuenow')).toBe('1')

    drag(el, 50, 200) // movedBy +150 > threshold(100)
    expect(sliderEl.getAttribute('aria-valuenow')).toBe('0')
    result.unmount()
  })

  test('It does not snap when the drag is below the threshold', () => {
    const { result, slides, slider } = renderSlider()
    const el = slides()[0]
    const sliderEl = slider()
    if (!el || !sliderEl) throw new Error('elements not found')

    drag(el, 200, 150) // movedBy -50, magnitude < threshold(100)
    expect(sliderEl.getAttribute('aria-valuenow')).toBe('0')
    result.unmount()
  })
})
