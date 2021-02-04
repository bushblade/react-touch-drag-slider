import React, { useState } from 'react'
import Slider from 'react-touch-drag-slider'
import styled, { createGlobalStyle, css } from 'styled-components/macro'
import images from './images'

// define some basic styles
const GlobalStyles = createGlobalStyle`
  * {
    box-sizing: border-box;
  }
  html,body {
    padding: 0;
    margin: 0;
  }
`
// The slider will fit any size container, lets go full screen...
const AppStyles = styled.main`
  height: 100vh;
  width: 100vw;
`

// create some buttons for none drag slide change
const Button = styled.button`
  font-size: 2rem;
  z-index: 10;
  position: fixed;
  top: 50%;
  ${(props) =>
    props.right
      ? css`
          right: 0.5rem;
        `
      : css`
          left: 0.5rem;
        `}
`
// Whatever you render out in the Slider will be draggable 'slides'
function App() {
  // state should start with the index you want to start the slide on
  const [index, setIndex] = useState(1)

  const increment = () => {
    if (index < images.length - 1) setIndex(index + 1)
  }

  const decrement = () => {
    if (index > 0) setIndex(index - 1)
  }

  return (
    <>
      <GlobalStyles />
      <AppStyles>
        <Button onClick={decrement} left disabled={index === 0}>
          〈
        </Button>
        <Button
          onClick={increment}
          right
          disabled={index === images.length - 1}
        >
          〉
        </Button>
        <Slider
          onSlideComplete={setIndex}
          onSlideStart={(i) => {
            console.log('started dragging on slide', i)
          }}
          activeIndex={index}
          threshHold={100}
          transition={0.3}
          scaleOnDrag={true}
        >
          {images.map(({ url, title }, index) => (
            <img src={url} key={index} alt={title} />
          ))}
        </Slider>
      </AppStyles>
    </>
  )
}

export default App
