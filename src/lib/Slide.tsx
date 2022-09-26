import React, { useRef } from 'react'
import './Slide.styles.css'

interface SlideProps {
  child: JSX.Element
  sliderWidth: number
  sliderHeight: number
  scaleOnDrag?: boolean
}

function Slide({
  child,
  sliderWidth,
  sliderHeight,
  scaleOnDrag = false,
}: SlideProps) {
  const slideRef = useRef<HTMLDivElement>(null)

  const onPointerDown = () => {
    if (scaleOnDrag && slideRef.current)
      slideRef.current.style.transform = 'scale(0.9)'
  }

  const onPointerUp = () => {
    if (scaleOnDrag && slideRef.current)
      slideRef.current.style.transform = 'scale(1)'
  }
  return (
    <div
      ref={slideRef}
      style={{
        width: `${sliderWidth}px`,
        height: `${sliderHeight}px`,
      }}
      className='rtds-single-slide-styles'
    >
      <div
        className='slide-inner'
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onDragStart={(e) => {
          e.preventDefault()
          e.stopPropagation()
          return false
        }}
      >
        {child}
      </div>
    </div>
  )
}

export default Slide
