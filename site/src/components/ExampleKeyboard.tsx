import Slider from 'react-touch-drag-slider'
import images from '../images'

function ExampleKeyboard() {
  return (
    <div className="h-64 w-full overflow-hidden rounded-lg">
      <Slider threshold={100} transition={0.3}>
        {images.map(({ url, title }) => (
          <img src={url} key={title} alt={title} />
        ))}
      </Slider>
    </div>
  )
}

export default ExampleKeyboard