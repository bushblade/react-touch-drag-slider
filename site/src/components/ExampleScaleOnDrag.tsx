import Slider from 'react-touch-drag-slider'
import images from '../images'

function ExampleScaleOnDrag() {
  return (
    <div className="h-64 w-full overflow-hidden rounded-lg">
      <Slider threshold={80} transition={0.4} scaleOnDrag>
        {images.map(({ url, title }) => (
          <img src={url} key={title} alt={title} />
        ))}
      </Slider>
    </div>
  )
}

export default ExampleScaleOnDrag