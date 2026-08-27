import { describe, expect, test } from 'vitest'

import SliderPosition from './sliderPosition'

describe('SliderPosition', () => {
  test('initializes at the given index', () => {
    const position = new SliderPosition({
      count: 5,
      threshold: 100,
      initialIndex: 2,
    })

    expect(position.currentIndex).toBe(2)
  })

  test('clamps the initial index into range', () => {
    const tooHigh = new SliderPosition({
      count: 3,
      threshold: 100,
      initialIndex: 99,
    })
    const tooLow = new SliderPosition({
      count: 3,
      threshold: 100,
      initialIndex: -5,
    })

    expect(tooHigh.currentIndex).toBe(2)
    expect(tooLow.currentIndex).toBe(0)
  })

  test('goTo moves to a valid index', () => {
    const position = new SliderPosition({
      count: 3,
      threshold: 100,
      initialIndex: 0,
    })

    expect(position.goTo(1)).toBe(1)
    expect(position.currentIndex).toBe(1)
  })

  test('goTo clamps to the last slide', () => {
    const position = new SliderPosition({
      count: 3,
      threshold: 100,
      initialIndex: 0,
    })

    expect(position.goTo(5)).toBe(2)
  })

  test('goTo clamps to the first slide', () => {
    const position = new SliderPosition({
      count: 3,
      threshold: 100,
      initialIndex: 2,
    })

    expect(position.goTo(-1)).toBe(0)
  })

  test('snapBy advances when dragged past the threshold', () => {
    const position = new SliderPosition({
      count: 3,
      threshold: 100,
      initialIndex: 0,
    })

    expect(position.snapBy(-150)).toBe(1)
  })

  test('snapBy goes back when dragged positively past the threshold', () => {
    const position = new SliderPosition({
      count: 3,
      threshold: 100,
      initialIndex: 2,
    })

    expect(position.snapBy(150)).toBe(1)
  })

  test('snapBy does not move when dragged below the threshold', () => {
    const position = new SliderPosition({
      count: 3,
      threshold: 100,
      initialIndex: 1,
    })

    expect(position.snapBy(-50)).toBe(1)
    expect(position.snapBy(50)).toBe(1)
  })

  test('snapBy does not snap past the last slide', () => {
    const position = new SliderPosition({
      count: 3,
      threshold: 100,
      initialIndex: 2,
    })

    expect(position.snapBy(-150)).toBe(2)
  })

  test('snapBy does not snap before the first slide', () => {
    const position = new SliderPosition({
      count: 3,
      threshold: 100,
      initialIndex: 0,
    })

    expect(position.snapBy(150)).toBe(0)
  })
})