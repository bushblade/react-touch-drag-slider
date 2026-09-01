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
import Spring from './spring'

export interface SliderProps {
  children: ReactElement[]
  /** An optional function that will be called when the slide is in its finished position */
  onSlideComplete?: (index: number) => void
  /** An optional function that will be called when the slide starts its movement */
  onSlideStart?: (index: number) => void
  /** Use to set the starting index or to update the current shown slide */
  activeIndex?: number | null
  /** A pixel value that must be dragged before slide snaps into place */
  threshold?: number
  /** The transition delay in seconds */
  transition?: number
  /** Choose if the slide should have a scale animation while moving */
  scaleOnDrag?: boolean
  /** Choose if arrow keys should navigate when the slider is focused */
  navigateOnArrowKeys?: boolean
  /** Choose if the slide should settle with spring physics instead of a CSS transition */
  spring?: boolean
  /** The spring stiffness when spring is enabled */
  stiffness?: number
  /** The spring damping when spring is enabled */
  damping?: number
  /** The spring mass when spring is enabled */
  mass?: number
}

const MAX_VELOCITY = 5000
const MAX_FRAME_TIME = 1 / 30

/**
 * A touch-drag slider carousel component for React.
 * @param onSlideComplete - An optional function that will be called when the slide is in its finished position
 * @param onSlideStart - An optional function that will be called when the slide starts its movement
 * @param activeIndex - Use to set the starting index or to update the current shown slide
 * @param threshold - A pixel value that must be dragged before slide snaps into place
 * @param transition - The transition delay in seconds
 * @param scaleOnDrag - Choose if the slide should have a scale animation while moving
 * @param navigateOnArrowKeys - Choose if arrow keys should navigate when the slider is focused
 * @param spring - Choose if the slide should settle with spring physics instead of a CSS transition
 * @param stiffness - The spring stiffness when spring is enabled
 * @param damping - The spring damping when spring is enabled
 * @param mass - The spring mass when spring is enabled
 * @example
 * <Slider
 *   activeIndex={0}
 *   onSlideComplete={(i) => console.log(i)}
 *   threshold={100}
 *   spring
 *   scaleOnDrag
 * >
 *   <img src="image1.jpg" alt="Slide 1" />
 *   <img src="image2.jpg" alt="Slide 2" />
 * </Slider>
 */
function Slider({
  children,
  onSlideComplete,
  onSlideStart,
  activeIndex = null,
  threshold = 100,
  transition = 0.3,
  scaleOnDrag = false,
  navigateOnArrowKeys = true,
  spring = false,
  stiffness = 180,
  damping = 16,
  mass = 1,
}: SliderProps) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [currentIndex, setCurrentIndex] = useState(activeIndex ?? 0)

  const dragging = useRef(false)
  const startPos = useRef(0)
  const currentTranslate = useRef(0)
  const prevTranslate = useRef(0)
  const sliderRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | null>(null)
  const velocityRef = useRef(0)
  const lastMoveTimeRef = useRef(0)
  const lastMoveTranslateRef = useRef(0)
  const springRef = useRef<number | null>(null)
  const springStateRef = useRef<Spring | null>(null)
  const springFrameTimeRef = useRef(0)
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
      initialIndex: sliderPositionRef.current?.currentIndex ?? activeIndex ?? 0,
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

  const springFrame = useCallback(
    (now: number) => {
      const springObj = springStateRef.current
      if (!springObj) return
      if (springFrameTimeRef.current === 0) springFrameTimeRef.current = now
      let dt = (now - springFrameTimeRef.current) / 1000
      springFrameTimeRef.current = now
      dt = Math.min(Math.max(dt, 0), MAX_FRAME_TIME)
      springObj.step(dt)
      currentTranslate.current = springObj.position
      setSliderPosition()
      if (springObj.isResting()) {
        springObj.settle()
        currentTranslate.current = springObj.position
        prevTranslate.current = springObj.position
        setSliderPosition()
        springRef.current = null
        springStateRef.current = null
        return
      }
      springRef.current = requestAnimationFrame(springFrame)
    },
    [setSliderPosition]
  )

  const cancelSpring = useCallback(() => {
    if (springRef.current !== null) {
      cancelAnimationFrame(springRef.current)
      springRef.current = null
    }
    springStateRef.current = null
  }, [])

  const startSpring = useCallback(
    (target: number, initialVelocity = 0) => {
      if (springRef.current !== null) {
        cancelAnimationFrame(springRef.current)
        springRef.current = null
      }
      springStateRef.current = null
      const currentPosition = currentTranslate.current
      if (Math.abs(target - currentPosition) < 0.5) {
        currentTranslate.current = target
        prevTranslate.current = target
        setSliderPosition()
        return
      }
      transitionOff()
      const springObj = new Spring(
        { stiffness, damping, mass },
        currentPosition
      )
      springObj.setTarget(target)
      springObj.setVelocity(initialVelocity)
      springStateRef.current = springObj
      springFrameTimeRef.current = 0
      springRef.current = requestAnimationFrame(springFrame)
    },
    [stiffness, damping, mass, setSliderPosition, transitionOff, springFrame]
  )

  const animateTo = useCallback(
    (target: number, initialVelocity = 0) => {
      if (spring) {
        startSpring(target, initialVelocity)
      } else {
        transitionOn()
        currentTranslate.current = target
        prevTranslate.current = target
        setSliderPosition()
      }
    },
    [spring, startSpring, transitionOn, setSliderPosition]
  )

  // watch for a change in activeIndex prop
  useEffect(() => {
    if (activeIndex !== sliderPosition.currentIndex) {
      sliderPosition.goTo(activeIndex ?? 0)
      animateTo(sliderPosition.currentIndex * -dimensions.width)
      syncIndex()
    }
  }, [activeIndex, sliderPosition, animateTo, syncIndex, dimensions.width])

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
      if (springRef.current) cancelAnimationFrame(springRef.current)
    }
  }, [])

  // add event listeners
  useEffect(() => {
    // set width if window resizes
    const handleResize = () => {
      cancelSpring()
      transitionOff()
      if (sliderRef.current) {
        const { width, height } = getElementDimensions(sliderRef.current)
        setDimensions({ width, height })
        setPositionByIndex(width)
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [cancelSpring, setPositionByIndex, transitionOff])

  const handleKeyDown = useCallback(
    ({ key }: React.KeyboardEvent) => {
      if (!navigateOnArrowKeys) return
      const arrowsPressed = ['ArrowRight', 'ArrowLeft'].includes(key)
      if (arrowsPressed && onSlideStart) {
        onSlideStart(sliderPosition.currentIndex)
      }
      if (key === 'ArrowRight')
        sliderPosition.goTo(sliderPosition.currentIndex + 1)
      if (key === 'ArrowLeft')
        sliderPosition.goTo(sliderPosition.currentIndex - 1)
      if (arrowsPressed) {
        animateTo(sliderPosition.currentIndex * -dimensions.width)
        if (onSlideComplete) onSlideComplete(sliderPosition.currentIndex)
      }
      syncIndex()
    },
    [
      navigateOnArrowKeys,
      onSlideComplete,
      onSlideStart,
      sliderPosition,
      syncIndex,
      animateTo,
      dimensions.width,
    ]
  )

  function pointerStart(index: number) {
    return (event: React.PointerEvent) => {
      cancelSpring()
      if (!spring) transitionOn()
      sliderPosition.goTo(index)
      prevTranslate.current = spring
        ? currentTranslate.current
        : sliderPosition.currentIndex * -dimensions.width
      currentTranslate.current = prevTranslate.current
      startPos.current = event.pageX
      dragging.current = true
      velocityRef.current = 0
      lastMoveTimeRef.current = 0
      lastMoveTranslateRef.current = currentTranslate.current
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
      const now = performance.now()
      const dt = now - lastMoveTimeRef.current
      if (dt > 0 && lastMoveTimeRef.current !== 0) {
        const instantaneousVelocity =
          ((currentTranslate.current - lastMoveTranslateRef.current) / dt) *
          1000
        velocityRef.current =
          velocityRef.current * 0.7 + instantaneousVelocity * 0.3
        velocityRef.current = Math.max(
          -MAX_VELOCITY,
          Math.min(MAX_VELOCITY, velocityRef.current)
        )
      }
      lastMoveTimeRef.current = now
      lastMoveTranslateRef.current = currentTranslate.current
    }
  }

  function pointerEnd() {
    // HACK: Non-Null Assertion operator
    cancelAnimationFrame(animationRef.current!)
    dragging.current = false
    const movedBy = currentTranslate.current - prevTranslate.current

    // if moved enough negative then snap to next slide if there is one
    // if moved enough positive then snap to previous slide if there is one
    sliderPosition.snapBy(movedBy)

    animateTo(
      sliderPosition.currentIndex * -dimensions.width,
      velocityRef.current
    )
    velocityRef.current = 0
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
      <style>
        {`
          .rtds-single-slide-styles img {
            max-width: 100%;
            max-height: 100%;
          }
        `}
      </style>
      <div
        data-testid="slider"
        ref={sliderRef}
        role="slider"
        aria-valuemin={0} // The first slide index
        aria-valuemax={children.length - 1} // The last slide index
        aria-valuenow={currentIndex} // The current slide index
        tabIndex={0}
        onKeyDown={handleKeyDown}
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
              key={child.key ?? index}
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
                touchAction: 'pan-y pinch-zoom',
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
