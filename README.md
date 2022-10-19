# react-touch-drag-slider

> Touch and drag slider carousel component for React

![Slider Gif](./touch-slider-001.gif)

- Touch friendly on mobile
- Responsive to viewport resizing
- Supports mouse drag by default
- Simple API
- Sizes to any size parent container
- small bundle size with zero dependencies

## Install

```bash
npm i react-touch-drag-slider
```

## Usage

```jsx
import React from 'react'
import Slider from 'react-touch-drag-slider'

// here we are importing some images
// but the Slider children can be an array of any element nodes,
// or your own components

import images from './images'

function App() {
  return (
    <Slider
      onSlideComplete={(i) => {
        console.log('finished dragging, current slide is', i)
      }}
      onSlideStart={(i) => {
        console.log('started dragging on slide', i)
      }}
      activeIndex={0}
      threshHold={100}
      transition={0.5}
      scaleOnDrag={true}
    >
      {images.map(({ url, title }, index) => (
        <img src={url} key={index} alt={title} />
      ))}
    </Slider>
  )
}

export default App
```

## Available Props

| Prop            | Type                             | Default | Description                                                         |
| --------------- | -------------------------------- | ------- | ------------------------------------------------------------------- |
| onSlideComplete | (completedIndex: number) => void |         | A function that gets called when finished                           |
| onSlideStart    | (startIndex: number) => void     |         | A function that gets called on start                                |
| activeIndex     | number                           | 0       | Set to start on this index or use state to update the current index |
| threshHold      | number                           | 100     | A pixel value that must be dragged before slide snaps to position   |
| transition      | number                           | 0.3     | The transition delay in seconds                                     |
| scaleOnDrag     | boolean                          | false   | Should the individual slide scale while dragging                    |

## Examples

Most basic example with no props - [CodeSandBox link](https://codesandbox.io/s/react-touch-drag-slider-example-basic-ttohy?file=/src/App.js)

With props, local state and buttons (you provide the buttons) - [CodeSandbox link](https://codesandbox.io/s/react-touch-drag-slider-example-04cdz?file=/src/App.js)

For example of use in a full screen modal with a gallery, please checkout any of the galleries in [Bushblade Knives](https://bushblade.co.uk)

## License

MIT © [bushblade](https://github.com/bushblade)
