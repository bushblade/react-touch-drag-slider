import Slider from 'react-touch-drag-slider'
import images from '../images'

function ExampleThreshold() {
  return (
    <div className="h-64 w-full overflow-hidden rounded-lg">
      <Slider threshold={50} transition={0.3}>
        {images.map(({ url, title }) => (
          <img src={url} key={title} alt={title} />
        ))}
      </Slider>
    </div>
  )
}

export default ExampleThreshold