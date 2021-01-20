import React, { useRef } from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'

const SlideStyles = styled.div`
  transition: transform 0.2s ease-out;
  div {
    padding: 1rem;
    height: 100%;
    width: ${(props) => props.sliderWidth};
    height: ${(props) => props.sliderHeight};
    display: flex;
    align-items: center;
    justify-content: center;
  }
  img {
    max-width: 100%;
    max-height: 100%;
  }
`

function Slide({ child, sliderWidth, sliderHeight, scaleOnDrag = false }) {
  // remove default image drag
  // find any images in the slide and prevent default drag
  const slideRef = useRef('slide')

  const onMouseDown = () => {
    if (scaleOnDrag) slideRef.current.style.transform = 'scale(0.9)'
  }

  const onMouseUp = () => {
    if (scaleOnDrag) slideRef.current.style.transform = 'scale(1)'
  }
  return (
    <SlideStyles
      ref={slideRef}
      sliderWidth={`${sliderWidth}px`}
      sliderHeight={`${sliderHeight}px`}
      className='SlideStyles'
    >
      <div
        className='slide-inner'
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onTouchStart={onMouseDown}
        onTouchEnd={onMouseUp}
        onMouseLeave={onMouseUp}
        onDragStart={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
      >
        {child}
      </div>
    </SlideStyles>
  )
}

Slide.propTypes = {
  child: PropTypes.element.isRequired,
  sliderWidth: PropTypes.number.isRequired,
  sliderHeight: PropTypes.number.isRequired,
  scaleOnDrag: PropTypes.bool,
}

export default Slide
