import React, {
  useState,
  useRef,
  useLayoutEffect,
  useEffect,
  useCallback,
} from 'react'
import Slide from './Slide'
import { getElementDimensions } from '../utils'

interface SliderProps {
  children: JSX.Element[]
  onSlideComplete?: (index: number) => void
  onSlideStart?: (index: number) => void
  activeIndex?: number | null
  threshHold?: number
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
 * @param props.threshHold - A pixel value that must be dragged before slide
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
  threshHold = 100,
  transition = 0.3,
  scaleOnDrag = false,
}: SliderProps) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  const dragging = useRef(false)
  const startPos = useRef(0)
  const currentTranslate = useRef(0)
  const prevTranslate = useRef(0)
  const currentIndex = useRef<number | null>(0)
  const sliderRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | null>(null)

  const setPositionByIndex = useCallback(
    (w = dimensions.width) => {
      currentTranslate.current = currentIndex.current! * -w
      prevTranslate.current = currentTranslate.current
      setSliderPosition()
    },
    [dimensions.width]
  )

  const transitionOn = useCallback(() => {
    if (sliderRef.current)
      sliderRef.current.style.transition = `transform ${transition}s ease-out`
  }, [transition])

  const transitionOff = () => {
    if (sliderRef.current) sliderRef.current.style.transition = 'none'
  }

  // watch for a change in activeIndex prop
  useEffect(() => {
    if (activeIndex !== currentIndex.current) {
      transitionOn()
      currentIndex.current = activeIndex
      setPositionByIndex()
    }
  }, [activeIndex, setPositionByIndex, transitionOn])

  useLayoutEffect(() => {
    if (sliderRef.current) {
      // no animation on startIndex
      transitionOff()
      // set width after first render
      setDimensions(getElementDimensions(sliderRef.current))

      // set position by startIndex
      setPositionByIndex(getElementDimensions(sliderRef.current).width)
    }
  }, [setPositionByIndex])

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
      // HACK: Non-Null Assertion operator
      const arrowsPressed = ['ArrowRight', 'ArrowLeft'].includes(key)
      if (arrowsPressed) transitionOn()
      if (arrowsPressed && onSlideStart) {
        onSlideStart(currentIndex.current!)
      }
      if (key === 'ArrowRight' && currentIndex.current! < children.length - 1) {
        currentIndex.current! += 1
      }
      if (key === 'ArrowLeft' && currentIndex.current! > 0) {
        currentIndex.current! -= 1
      }
      if (arrowsPressed && onSlideComplete)
        onSlideComplete(currentIndex.current!)
      setPositionByIndex()
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [
    children.length,
    setPositionByIndex,
    onSlideComplete,
    onSlideStart,
    transitionOn,
  ])

  function pointerStart(index: number) {
    return function (event: React.PointerEvent) {
      transitionOn()
      currentIndex.current = index
      startPos.current = event.pageX
      dragging.current = true
      animationRef.current = requestAnimationFrame(animation)
      if (sliderRef.current) sliderRef.current.style.cursor = 'grabbing'
      // if onSlideStart prop - call it
      if (onSlideStart) onSlideStart(currentIndex.current)
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
    if (movedBy < -threshHold && currentIndex.current! < children.length - 1)
      currentIndex.current! += 1

    // if moved enough positive then snap to previous slide if there is one
    if (movedBy > threshHold && currentIndex.current! > 0)
      currentIndex.current! -= 1

    transitionOn()

    setPositionByIndex()
    sliderRef.current!.style.cursor = 'grab'
    // if onSlideComplete prop - call it
    if (onSlideComplete) onSlideComplete(currentIndex.current!)
  }

  function animation() {
    setSliderPosition()
    if (dragging.current) requestAnimationFrame(animation)
  }

  function setSliderPosition() {
    if (!sliderRef.current) return
    sliderRef.current.style.transform = `translateX(${currentTranslate.current}px)`
  }

  return (
    <div
      className='rtds-slider-wrapper'
      style={{
        overflow: 'hidden',
        width: '100%',
        height: '100%',
        maxHeight: '100vh',
      }}
    >
      <div
        data-testid='slider'
        ref={sliderRef}
        className='rtds-slider-styles'
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
            <div
              key={child.key}
              onPointerDown={pointerStart(index)}
              onPointerMove={pointerMove}
              onPointerUp={pointerEnd}
              onPointerLeave={() => {
                if (dragging.current) pointerEnd()
              }}
              onContextMenu={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
              className='slide-outer'
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
