import { useState } from 'react'
import Slider from 'react-touch-drag-slider'
import images from '../images'

const buttonClass =
  'rounded border border-border px-4 py-1.5 text-sm font-medium transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:text-fg'

function DemoSlider() {
  const [index, setIndex] = useState(0)
  const maxIndex = images.length - 1

  const next = () => {
    if (index < maxIndex) setIndex(index + 1)
  }

  const prev = () => {
    if (index > 0) setIndex(index - 1)
  }

  return (
    <div className="space-y-6">
      <div className="h-80 w-full overflow-hidden rounded-lg">
        <Slider
          activeIndex={index}
          onSlideComplete={setIndex}
          threshold={100}
          spring
          scaleOnDrag
        >
          {images.map(({ url, title }) => (
            <img src={url} key={title} alt={title} />
          ))}
        </Slider>
      </div>
      <div className="flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={prev}
          disabled={index === 0}
          className={buttonClass}
        >
          Previous
        </button>
        <span aria-live="polite" className="text-sm text-fg-faint">
          Slide {index + 1} of {maxIndex + 1}
        </span>
        <button
          type="button"
          onClick={next}
          disabled={index === maxIndex}
          className={buttonClass}
        >
          Next
        </button>
      </div>
    </div>
  )
}

export default DemoSlider
