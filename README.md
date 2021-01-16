# react-touch-drag-slider

> Touch and drag slider carousel component for React

- Touch friendly on mobile
- Responsive to viewport resizing
- Supports mouse drag by default
- Simple API

## Install

```bash
npm install --save react-touch-drag-slider
```

## Usage

```jsx
import React from 'react'
import Slider from 'react-touch-drag-slider'

import images from './images'

function App() {

  return (
    <>
        <Slider
          onSlideComplete={(i) => {
            console.log('finished dragging, current slide is', i)
          }}
          onSlideStart={(i) => {
            console.log('started dragging on slide', i)
          }}
          activeIndex={0}
          threshHold={100}
        >
          {images.map(({ url, title }, index) => (
            <img src={url} key={index} alt={title} />
          ))}
        </Slider>
    </>
  )
}

export default App
```

## Available Props

| Prop       | Type        | Default       | Description
|----        |----         |----           | ----
|onSlideComplete | (completedIndex) => completedIndex | null | function that gets called when finished
|onSlideStart | (startIndex) => startIndex | null | function that gets called on start
|activeIndex | Number | 0 | set to start on this index or use state to update the current index
|threshHold | Number | 100 | pixel value that must be dragged before slide snaps to position

## License

MIT © [bushblade](https://github.com/bushblade)
