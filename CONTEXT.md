# react-touch-drag-slider

A touch and drag slider carousel component for React. Renders draggable
slides, snaps them into place past a threshold, and supports keyboard
navigation.

## Language

**Slider position**:
The index of the currently shown slide together with the rules for changing
it — threshold snapping and clamping to the slide count. Lives as a pure
module behind the Slider's seam.
_Avoid_: currentIndex, activeIndex

**Slide**:
A single child element rendered as a draggable card in the slider.
_Avoid_: child, panel

**Threshold**:
The pixel distance a drag must exceed before the slider snaps to the next or
previous slide.
_Avoid_: threshHold (previously misspelt prop name; now renamed to threshold)

**Drag**:
A pointer press-and-move interaction that shifts the slider's translate before
the threshold decides where it snaps.
_Avoid_: swipe, gesture