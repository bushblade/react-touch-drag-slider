export interface SpringConfig {
  /** The spring stiffness when spring is enabled */
  stiffness: number
  /** The spring damping when spring is enabled */
  damping: number
  /** The spring mass when spring is enabled */
  mass: number
}

interface SpringState {
  position: number
  velocity: number
  target: number
}

class Spring {
  private readonly config: SpringConfig
  private readonly state: SpringState

  constructor(config: SpringConfig, position: number) {
    this.config = config
    this.state = { position, velocity: 0, target: position }
  }

  setTarget(target: number): void {
    this.state.target = target
  }

  setVelocity(velocity: number): void {
    this.state.velocity = velocity
  }

  step(dt: number): number {
    const { stiffness, damping, mass } = this.config
    const { position, velocity, target } = this.state
    const acceleration =
      (-stiffness * (position - target) - damping * velocity) / mass
    this.state.velocity += acceleration * dt
    this.state.position += this.state.velocity * dt
    return this.state.position
  }

  settle(): void {
    this.state.position = this.state.target
    this.state.velocity = 0
  }

  isResting(): boolean {
    return (
      Math.abs(this.state.position - this.state.target) < 0.5 &&
      Math.abs(this.state.velocity) < 0.5
    )
  }

  get position(): number {
    return this.state.position
  }
}

export default Spring
