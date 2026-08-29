import { useRef, useState } from 'react'
import Slider from 'react-touch-drag-slider'
import images from '../images'

interface LogEntry {
  event: string
  index: number
  id: number
}

function ExampleCallbacks() {
  const [log, setLog] = useState<LogEntry[]>([])
  const nextId = useRef(0)

  const handleSlideStart = (index: number) => {
    setLog((prev) => [
      ...prev,
      { event: 'onSlideStart', index, id: nextId.current++ },
    ])
  }

  const handleSlideComplete = (index: number) => {
    setLog((prev) => [
      ...prev,
      { event: 'onSlideComplete', index, id: nextId.current++ },
    ])
  }

  return (
    <div className="space-y-4">
      <div className="h-64 w-full overflow-hidden rounded-lg">
        <Slider
          onSlideStart={handleSlideStart}
          onSlideComplete={handleSlideComplete}
          threshold={100}
          transition={0.3}
        >
          {images.map(({ url, title }) => (
            <img src={url} key={title} alt={title} />
          ))}
        </Slider>
      </div>
      <ul className="space-y-1 font-mono text-sm">
        {log.length === 0 ? (
          <li className="text-neutral-400">Drag or use the arrow keys to see the callbacks fire.</li>
        ) : (
          log.slice(-4).map((entry) => (
            <li key={entry.id} className="text-neutral-700">
              {entry.event} → slide {entry.index}
            </li>
          ))
        )}
      </ul>
    </div>
  )
}

export default ExampleCallbacks