import React, { useState, useRef, useEffect, useCallback } from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import Slide from './Slide'
import { getElementDimensions, getPositionX } from '../utils'

const SliderStyles = styled.div`
  all: initial;
  width: 100%;
  height: 100%;
  max-height: 100vh;
  display: inline-flex;
  will-change: transform, scale;
  // only want the transition after first loaded
  transition: transform ${(props) => (props.canTransition ? '0.3s' : '0')}
      ease-out,
    scale 0.3s ease-out;
  cursor: grab;
  .slide-outer {
    display: flex;
    align-items: center;
  }
`

const SliderWrapper = styled.div`
  overflow: hidden;
  width: 100%;
  height: 100%;
  max-height: 100vh;
`

function Slider({
  children,
  onSlideComplete,
  onSlideStart,
  activeIndex = null,
  threshHold = 100,
}) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [canTransition, setCanTransition] = useState(false)

  const dragging = useRef(false)
  const startPos = useRef(0)
  const currentTranslate = useRef(0)
  const prevTranslate = useRef(0)
  const currentIndex = useRef(activeIndex || 0)
  const sliderRef = useRef('slider')
  const animationRef = useRef(null)

  const setPositionByIndex = useCallback(
    (w = dimensions.width) => {
      currentTranslate.current = currentIndex.current * -w
      prevTranslate.current = currentTranslate.current
      setSliderPosition()
    },
    [dimensions.width]
  )

  // watch for a change in activeIndex prop
  useEffect(() => {
    if (activeIndex !== currentIndex.current) {
      currentIndex.current = activeIndex
      setPositionByIndex()
    }
  }, [activeIndex, setPositionByIndex])

  // set width after first render
  // set position by startIndex
  // no animation on startIndex
  useEffect(() => {
    setDimensions(getElementDimensions(sliderRef))

    setPositionByIndex(getElementDimensions(sliderRef).width)

    if (!canTransition) setTimeout(() => setCanTransition(true), 0)
  }, [canTransition, setPositionByIndex])

  // add event listeners
  useEffect(() => {
    // set width if window resizes
    const handleResize = () => {
      const { width, height } = getElementDimensions(sliderRef)
      setDimensions({ width, height })
      setPositionByIndex(width)
    }

    const handleKeyDown = ({ key }) => {
      const arrowsPressed = ['ArrowRight', 'ArrowLeft'].includes(key)
      if (arrowsPressed && onSlideStart) onSlideStart(currentIndex.current)
      if (key === 'ArrowRight' && currentIndex.current < children.length - 1) {
        currentIndex.current += 1
      }
      if (key === 'ArrowLeft' && currentIndex.current > 0) {
        currentIndex.current -= 1
      }
      if (arrowsPressed && onSlideComplete)
        onSlideComplete(currentIndex.current)
      setPositionByIndex()
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [children.length, setPositionByIndex, onSlideComplete, onSlideStart])

  function touchStart(index) {
    return function (event) {
      currentIndex.current = index
      startPos.current = getPositionX(event)
      dragging.current = true
      animationRef.current = requestAnimationFrame(animation)
      sliderRef.current.style.scale = 0.9
      sliderRef.current.style.cursor = 'grabbing'
      // if onSlideStart prop - call it
      if (onSlideStart) onSlideStart(currentIndex.current)
    }
  }

  function touchMove(event) {
    if (dragging.current) {
      const currentPosition = getPositionX(event)
      currentTranslate.current =
        prevTranslate.current + currentPosition - startPos.current
    }
  }

  function touchEnd() {
    cancelAnimationFrame(animationRef.current)
    dragging.current = false
    const movedBy = currentTranslate.current - prevTranslate.current

    // if moved enough negative then snap to next slide if there is one
    if (movedBy < -threshHold && currentIndex.current < children.length - 1)
      currentIndex.current += 1

    // if moved enough positive then snap to previous slide if there is one
    if (movedBy > threshHold && currentIndex.current > 0)
      currentIndex.current -= 1

    setPositionByIndex()
    sliderRef.current.style.scale = 1
    sliderRef.current.style.cursor = 'grab'
    // if onSlideComplete prop - call it
    if (onSlideComplete) onSlideComplete(currentIndex.current)
  }

  function animation() {
    setSliderPosition()
    if (dragging.current) requestAnimationFrame(animation)
  }

  function setSliderPosition() {
    sliderRef.current.style.transform = `translateX(${currentTranslate.current}px)`
  }

  return (
    <SliderWrapper className='SliderWrapper'>
      <SliderStyles
        ref={sliderRef}
        className='SliderStyles'
        canTransition={canTransition}
      >
        {children.map((child, index) => {
          return (
            <div
              key={child.key}
              onTouchStart={touchStart(index)}
              onMouseDown={touchStart(index)}
              onTouchMove={touchMove}
              onMouseMove={touchMove}
              onTouchEnd={touchEnd}
              onMouseUp={touchEnd}
              onMouseLeave={() => {
                if (dragging.current) touchEnd()
              }}
              onContextMenu={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
              className='slide-outer'
            >
              <Slide
                child={child}
                sliderWidth={dimensions.width}
                sliderHeight={dimensions.height}
              />
            </div>
          )
        })}
      </SliderStyles>
    </SliderWrapper>
  )
}

Slider.propTypes = {
  children: PropTypes.node.isRequired,
  onSlideComplete: PropTypes.func,
  onSlideStart: PropTypes.func,
  activeIndex: PropTypes.number,
  threshHold: PropTypes.number,
}

export default Slider
