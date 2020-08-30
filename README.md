# lit-brite: a web based Lite Brite editor

Demo: https://banksean.com/projects/lit-brite/

## Overview
My partner recently got a Lite Brite, and asked me to code up something to help her make designs that will fit on it. 
This particular model is a modern version that’s illuminated by LEDs, and probably has some other differences from other models.

### Problems/constraints:
- Trying out different physical peg arrangements can be tedious IRL
- It’s hard to know a priori if you have enough pegs of each color to draw the picture you have in mind

### Functional requirements for a solution:
- No app install steps; one click to start
- Dead-simple UX: should look as much like an actual Lite Brite as is practical 
- Use the mouse to ‘draw’ pegs with point and click
- Automatically count how many pegs of each color have been used so far (as the physical Lite Brite only has so many pegs of each in reality)
- Ability to save designs and load them later/share with others

### Non-functional requirements:
- Doesn’t offend my visual aesthetic preferences
- 1/5 of a SWE
  - I want to help but only have limited time to dedicate to hobby projects on my days off. 
  - Clean wrap-up, no ongoing maintenance burden once deployed


## Implementation Choices
### LitHtml, LitElement
- I've used [LitHtml](https://lit-html.polymer-project.org/) and [LitElement](https://lit-element.polymer-project.org/) on a few projects in the past so I'm already familiar with them.
- Yes, hence the name lit-brite instead of lite-brite. :)
- Web platform satisfies the low development effort requirement
- Direct DOM manipulation is tedious and this provides easy templating.
- ${framewor.duJour} is tedious and this pair works without all the baggage.
- No build steps

### CSS
- Constraints
  - N pegs total, in a hex-like layout
  - Alternating row lengths differ: e.g. 30 and 31 pegs
  - Rows offset so pegs on row r centered on midpoint between pegs on row r+1.
  - Simple DOM structure preferred: entire grid just a list of `<lit-brite-peg>` elements
- Flexbox: container for lit-brite-peg elements is display:flex etc
- CSS rules add left and right padding to force wrapping at specific intervals using two `nth-child` selectors on `lit-brite-peg` elements
- “Lighting” effects achieved with box-shadow etc

### Permalinks for ‘Save’ feature
- Constraints
  - Store nothing on a server
  - Represent a drawing’s entire set of pegs in a permalink
  - Automatically populate peg colors from permalink on page load
- Naive solution: append query param with N chars, each representing the color at peg position n. Size: N.
- Smarter solution: compress! Size: m < N.
  - Currently no native browser support for compression e.g. LZW/Deflate etc.
  - Encode peg list with RLE or Huffman encoding, written in JS. 
  - Choose encoding at runtime, based on whichever produces the smallest output.
  - Could use WASM, but that adds otherwise unnecessary build complexity

## Known issues

- Huffman encoding is broken when you set the very first peg in the grid.  OFF BY ONE!!!!!!1.
- No Undo
- Only tried out on latest Chrome desktop, OSX. Phones etc probably don't work.