interface SliderPositionConfig {
  count: number
  threshold: number
  initialIndex: number
}

class SliderPosition {
  private readonly count: number
  private readonly threshold: number
  private index: number

  constructor({ count, threshold, initialIndex }: SliderPositionConfig) {
    this.count = count
    this.threshold = threshold
    this.index = this.clamp(initialIndex)
  }

  get currentIndex(): number {
    return this.index
  }

  goTo(index: number): number {
    this.index = this.clamp(index)
    return this.index
  }

  snapBy(movedBy: number): number {
    if (movedBy < -this.threshold) {
      this.index = this.clamp(this.index + 1)
    } else if (movedBy > this.threshold) {
      this.index = this.clamp(this.index - 1)
    }
    return this.index
  }

  private clamp(index: number): number {
    return Math.min(Math.max(index, 0), this.count - 1)
  }
}

export default SliderPosition