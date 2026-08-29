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

const makeBlankLog = () =>
  Array.from({ length: LOG_LENGTH }, (_, i) => blankEntry(-(i + 1)))

function ExampleCallbacks() {
  const [log, setLog] = useState<LogEntry[]>(makeBlankLog)
  const nextId = useRef(0)

  const addEntry = (event: string, index: number) => {
    setLog((prev) => [
      ...prev.slice(1),
      { event, index, id: nextId.current++ },
    ])
  }

  const clearLog = () => setLog(makeBlankLog)

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
      <div className="overflow-hidden rounded-lg bg-neutral-950 font-mono text-sm shadow-inner">
        <div className="flex items-center gap-1.5 border-b border-neutral-800 bg-neutral-900 px-4 py-2">
          <span className="h-3 w-3 rounded-full bg-red-500" />
          <span className="h-3 w-3 rounded-full bg-yellow-500" />
          <span className="h-3 w-3 rounded-full bg-green-500" />
          <span className="ml-2 text-xs text-neutral-400">Console</span>
          <button
            type="button"
            onClick={clearLog}
            aria-label="Clear console"
            title="Clear console"
            className="ml-auto rounded p-1 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-neutral-200"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <circle cx="8" cy="8" r="6.5" />
              <line x1="4.5" y1="4.5" x2="11.5" y2="11.5" />
            </svg>
          </button>
        </div>
        <ul className="space-y-1 px-4 py-3" aria-live="polite">
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
                      ? 'italic text-neutral-500'
                      : undefined
                    : entry.event === 'onSlideStart'
                      ? 'text-sky-400'
                      : 'text-neutral-300'
                }
              >
                {isBlank
                  ? isHint
                    ? 'Drag or use the arrow keys to see the callbacks fire.'
                    : ''
                  : `> ${entry.event} → slide ${entry.index}`}
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

export default ExampleCallbacks