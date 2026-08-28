/** biome-ignore-all lint/style/noNonNullAssertion: <explanation> they won't be
 * null*/
import type { ReactElement } from 'react'
import {
  useState,
  useRef,
  useLayoutEffect,
  useEffect,
  useCallback,
} from 'react'
import { getElementDimensions } from '../utils'
import Slide from './Slide'
import SliderPosition from './sliderPosition'

interface SliderProps {
  children: ReactElement[]
  onSlideComplete?: (index: number) => void
  onSlideStart?: (index: number) => void
  activeIndex?: number | null
  threshold?: number
  transition?: number
  scaleOnDrag?: boolean
}

/**
 *
 * @param props.children - An array of valid React Children
 * @param props.onSlideComplete - An optional function that will be called when
 * the slide is in it's finished position
 * @param props.onSlideStart - An optional function that will be called when the
 * slide starts it's movement
 * @param props.activeIndex - Use to set the starting index or to upate the
 * current shown slide
 * @param props.threshold - A pixel value that must be dragged before slide
 * snaps into place
 * @param props.transition - The transition delay in seconds
 * @param props.scaleOnDrag - Choose if the slide should have a scale animation
 * while moving
 *
 */

function Slider({
  children,
  onSlideComplete,
  onSlideStart,
  activeIndex = null,
  threshold = 100,
  transition = 0.3,
  scaleOnDrag = false,
}: SliderProps) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [currentIndex, setCurrentIndex] = useState(activeIndex ?? 0)

  const dragging = useRef(false)
  const startPos = useRef(0)
  const currentTranslate = useRef(0)
  const prevTranslate = useRef(0)
  const sliderRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | null>(null)
  const sliderPositionRef = useRef<SliderPosition | null>(null)
  const sliderConfigRef = useRef({ count: 0, threshold: 100 })

  if (
    !sliderPositionRef.current ||
    sliderConfigRef.current.count !== children.length ||
    sliderConfigRef.current.threshold !== threshold
  ) {
    sliderPositionRef.current = new SliderPosition({
      count: children.length,
      threshold,
      initialIndex:
        sliderPositionRef.current?.currentIndex ?? activeIndex ?? 0,
    })
    sliderConfigRef.current = { count: children.length, threshold }
  }
  const sliderPosition = sliderPositionRef.current

  const syncIndex = useCallback(() => {
    setCurrentIndex(sliderPosition.currentIndex)
  }, [sliderPosition])

  const setSliderPosition = useCallback(() => {
    if (!sliderRef.current) return
    sliderRef.current.style.transform = `translateX(${currentTranslate.current}px)`
  }, [])

  const setPositionByIndex = useCallback(
    (w = dimensions.width) => {
      currentTranslate.current = sliderPosition.currentIndex * -w
      prevTranslate.current = currentTranslate.current
      setSliderPosition()
    },
    [dimensions.width, sliderPosition, setSliderPosition]
  )

  const transitionOn = useCallback(() => {
    if (sliderRef.current)
      sliderRef.current.style.transition = `transform ${transition}s ease-out`
  }, [transition])

  const transitionOff = useCallback(() => {
    if (sliderRef.current) sliderRef.current.style.transition = 'none'
  }, [])

  // watch for a change in activeIndex prop
  useEffect(() => {
    if (activeIndex !== sliderPosition.currentIndex) {
      transitionOn()
      sliderPosition.goTo(activeIndex ?? 0)
      setPositionByIndex()
      syncIndex()
    }
  }, [activeIndex, sliderPosition, setPositionByIndex, transitionOn, syncIndex])

  useLayoutEffect(() => {
    if (sliderRef.current) {
      // no animation on startIndex
      transitionOff()
      // set width after first render
      setDimensions(getElementDimensions(sliderRef.current))

      // set position by startIndex
      setPositionByIndex(getElementDimensions(sliderRef.current).width)
    }
  }, [setPositionByIndex, transitionOff])

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [])

  // add event listeners
  useEffect(() => {
    // set width if window resizes
    const handleResize = () => {
      transitionOff()
      if (sliderRef.current) {
        const { width, height } = getElementDimensions(sliderRef.current)
        setDimensions({ width, height })
        setPositionByIndex(width)
      }
    }

    const handleKeyDown = ({ key }: KeyboardEvent) => {
      const arrowsPressed = ['ArrowRight', 'ArrowLeft'].includes(key)
      if (arrowsPressed) transitionOn()
      if (arrowsPressed && onSlideStart) {
        onSlideStart(sliderPosition.currentIndex)
      }
      if (key === 'ArrowRight')
        sliderPosition.goTo(sliderPosition.currentIndex + 1)
      if (key === 'ArrowLeft') sliderPosition.goTo(sliderPosition.currentIndex - 1)
      if (arrowsPressed && onSlideComplete)
        onSlideComplete(sliderPosition.currentIndex)
      setPositionByIndex()
      syncIndex()
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [
    setPositionByIndex,
    onSlideComplete,
    onSlideStart,
    transitionOn,
    transitionOff,
    sliderPosition,
    syncIndex,
  ])

  function pointerStart(index: number) {
    return (event: React.PointerEvent) => {
      transitionOn()
      sliderPosition.goTo(index)
      startPos.current = event.pageX
      dragging.current = true
      animationRef.current = requestAnimationFrame(animation)
      if (sliderRef.current) sliderRef.current.style.cursor = 'grabbing'
      // if onSlideStart prop - call it
      if (onSlideStart) onSlideStart(sliderPosition.currentIndex)
      syncIndex()
    }
  }

  function pointerMove(event: React.PointerEvent) {
    if (dragging.current) {
      const currentPosition = event.pageX
      currentTranslate.current =
        prevTranslate.current + currentPosition - startPos.current
    }
  }

  function pointerEnd() {
    // HACK: Non-Null Assertion operator
    transitionOn()
    cancelAnimationFrame(animationRef.current!)
    dragging.current = false
    const movedBy = currentTranslate.current - prevTranslate.current

    // if moved enough negative then snap to next slide if there is one
    // if moved enough positive then snap to previous slide if there is one
    sliderPosition.snapBy(movedBy)

    transitionOn()

    setPositionByIndex()
    sliderRef.current!.style.cursor = 'grab'
    // if onSlideComplete prop - call it
    if (onSlideComplete) onSlideComplete(sliderPosition.currentIndex)
    syncIndex()
  }

  function animation() {
    setSliderPosition()
    if (dragging.current)
      animationRef.current = requestAnimationFrame(animation)
  }

  return (
    <div
      style={{
        overflow: 'hidden',
        width: '100%',
        height: '100%',
        maxHeight: '100vh',
      }}
    >
      <div
        data-testid="slider"
        ref={sliderRef}
        role="slider"
        aria-valuemin={0} // The first slide index
        aria-valuemax={children.length - 1} // The last slide index
        aria-valuenow={currentIndex} // The current slide index
        tabIndex={0}
        style={{
          all: 'initial',
          width: '100%',
          height: '100%',
          maxHeight: '100vh',
          display: 'inline-flex',
          willChange: 'transform, scale',
          cursor: 'grab',
        }}
      >
        {children.map((child, index) => {
          return (
            // biome-ignore lint/a11y/noStaticElementInteractions: <explanation only parent should be focusable>
            <div
              key={child.key}
              onPointerDown={pointerStart(index)}
              onPointerMove={pointerMove}
              onPointerUp={pointerEnd}
              onPointerLeave={() => {
                if (dragging.current) pointerEnd()
              }}
              onContextMenu={e => {
                e.preventDefault()
                e.stopPropagation()
              }}
              className="slide-outer"
              style={{
                touchAction: 'none',
              }}
            >
              <Slide
                child={child}
                sliderWidth={dimensions.width}
                sliderHeight={dimensions.height}
                scaleOnDrag={scaleOnDrag}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Slider
