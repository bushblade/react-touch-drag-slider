import type { ComponentProps } from 'react'
import Slider from 'react-touch-drag-slider'
import images from '../images'

function SliderExample(props: Omit<ComponentProps<typeof Slider>, 'children'>) {
  return (
    <div className="h-64 w-full overflow-hidden rounded-lg">
      <Slider {...props}>
        {images.map(({ url, title }) => (
          <img src={url} key={title} alt={title} />
        ))}
      </Slider>
    </div>
  )
}

export default SliderExample
