import React, { useState } from 'react'
import Slider from 'react-touch-drag-slider'
import 'react-touch-drag-slider/dist/index.css'
import styled, { createGlobalStyle, css } from 'styled-components'

// get some cool images...
const images = [
  {
    title: 'Nature Image1',
    url:
      'https://images.unsplash.com/photo-1610047803562-7260ebe516cc?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
  },
  {
    title: 'Nature Image2',
    url:
      'https://images.unsplash.com/photo-1610047803124-64ddfad66909?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=651&q=80',
  },
  {
    title: 'Nature Image3',
    url:
      'https://images.unsplash.com/photo-1609952048180-7b35ea6b083b?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
  },
  {
    title: 'Nature Image4',
    url:
      'https://images.unsplash.com/photo-1608241175281-722a1c6111be?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80',
  },
  {
    title: 'Nature Image5',
    url:
      'https://images.unsplash.com/photo-1523288863878-c79329df9b88?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1386&q=80',
  },
]

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

  const setFinishedIndex = (i) => {
    console.log('finished dragging on slide', i)
    setIndex(i)
  }

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
          onSlideComplete={setFinishedIndex}
          onSlideStart={(i) => {
            console.clear()
            console.log('started dragging on slide', i)
          }}
          activeIndex={index}
          threshHold={100}
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
