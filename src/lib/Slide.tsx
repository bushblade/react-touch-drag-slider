import React, { useRef } from 'react'
import styled from 'styled-components'

const SlideStyles = styled.div`
  transition: transform 0.2s ease-out;
  div {
    padding: 1rem;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    user-select: none;
  }
  img {
    max-width: 100%;
    max-height: 100%;
  }
`

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

  const onMouseDown = () => {
    if (scaleOnDrag && slideRef.current)
      slideRef.current.style.transform = 'scale(0.9)'
  }

  const onMouseUp = () => {
    if (scaleOnDrag && slideRef.current)
      slideRef.current.style.transform = 'scale(1)'
  }
  return (
    <SlideStyles
      ref={slideRef}
      style={{
        width: `${sliderWidth}px`,
        height: `${sliderHeight}px`,
      }}
      className='SlideStyles'
    >
      <div
        unselectable='on'
        className='slide-inner'
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onTouchStart={onMouseDown}
        onTouchEnd={onMouseUp}
        onMouseLeave={onMouseUp}
        onDragStart={(e) => {
          e.preventDefault()
          e.stopPropagation()
          return false
        }}
      >
        {child}
      </div>
    </SlideStyles>
  )
}

export default Slide
