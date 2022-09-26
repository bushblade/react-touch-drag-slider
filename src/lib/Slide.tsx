import React, { useRef } from 'react'
// import './Slide.styles.css'

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
        transition: 'transform 0.2s ease-out',
      }}
      className='rtds-single-slide-styles'
    >
      <div
        style={{
          padding: '1rem',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          userSelect: 'none',
        }}
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
