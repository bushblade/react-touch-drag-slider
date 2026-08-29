import { useRef, useState } from 'react'
import Slider from 'react-touch-drag-slider'
import images from '../images'

const LOG_LENGTH = 4

interface LogEntry {
  event: string
  index: number
  id: number
}

const blankEntry = (id: number): LogEntry => ({ event: '', index: -1, id })

function ExampleCallbacks() {
  const [log, setLog] = useState<LogEntry[]>(() =>
    Array.from({ length: LOG_LENGTH }, (_, i) => blankEntry(i - LOG_LENGTH)),
  )
  const nextId = useRef(0)

  const addEntry = (event: string, index: number) => {
    setLog((prev) => [
      ...prev.slice(1),
      { event, index, id: nextId.current++ },
    ])
  }

  const handleSlideStart = (index: number) => addEntry('onSlideStart', index)

  const handleSlideComplete = (index: number) =>
    addEntry('onSlideComplete', index)

  const isEmpty = log.every((entry) => entry.id < 0)

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
        {log.map((entry, index) => {
          const isBlank = entry.id < 0
          const isHint =
            isBlank && isEmpty && index === LOG_LENGTH - 1
          return (
            <li
              key={entry.id}
              aria-hidden={isBlank && !isHint}
              className={
                isBlank
                  ? isHint
                    ? 'text-neutral-400'
                    : undefined
                  : 'text-neutral-700'
              }
            >
              {isBlank
                ? isHint
                  ? 'Drag or use the arrow keys to see the callbacks fire.'
                  : ''
                : `${entry.event} → slide ${entry.index}`}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default ExampleCallbacks