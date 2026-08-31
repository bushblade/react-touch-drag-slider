import { describe, expect, test } from 'vitest'
import Spring from './spring'

const run = (spring: Spring, dt = 1 / 60, maxSteps = 10_000): number[] => {
  const positions: number[] = []
  for (let i = 0; i < maxSteps && !spring.isResting(); i++) {
    positions.push(spring.step(dt))
  }
  spring.settle()
  return positions
}

describe('Spring', () => {
  const config = { stiffness: 180, damping: 14, mass: 1 }

  test('it converges on the target position', () => {
    const spring = new Spring(config, 0)
    spring.setTarget(-300)
    run(spring)
    expect(spring.position).toBe(-300)
  })

  test('it overshoots the target before settling (underdamped)', () => {
    const spring = new Spring(config, 0)
    spring.setTarget(-300)
    const positions = run(spring)
    expect(Math.min(...positions)).toBeLessThan(-300)
    expect(spring.position).toBe(-300)
  })

  test('it settles in place when already at the target', () => {
    const spring = new Spring(config, 0)
    spring.setTarget(0)
    expect(spring.isResting()).toBe(true)
  })

  test('it seeds an initial velocity so a throw travels further', () => {
    const still = new Spring(config, 0)
    still.setTarget(-300)
    const thrown = new Spring(config, 0)
    thrown.setTarget(-300)
    thrown.setVelocity(-1500)
    const stillPositions = run(still)
    const thrownPositions = run(thrown)
    expect(Math.min(...thrownPositions)).toBeLessThan(
      Math.min(...stillPositions)
    )
  })

  test('settle snaps the position exactly to the target', () => {
    const spring = new Spring(config, 0)
    spring.setTarget(-300)
    spring.step(1 / 60)
    spring.settle()
    expect(spring.position).toBe(-300)
  })
})
