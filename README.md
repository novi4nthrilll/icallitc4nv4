# Layout Web Builder

A visual drag and drop layout builder for creating website layouts. Design your layout visually and export clean HTML and CSS code.

## Features

Canvas Editor
- Full screen white canvas for designing
- Drag elements to position them anywhere
- Resize elements using corner and edge handles
- Rotate elements with the rotation handle
- Multi select elements using Shift click or drag selection box
- Grid system with snap to grid option

Shape Elements
- Square
- Circle
- Triangle
- Pentagon
- Hexagon
- Star
- Line
- Oval
- Rounded Rectangle

Text Elements
- Double click to edit text
- Multiple font families
- Text alignment options left center right justify
- Auto height adjustment when typing

Image Elements
- Upload images from your computer
- Images maintain their aspect ratio
- Change image after adding

Styling Options
- Color picker with solid colors and gradients
- Border width and color controls
- Border radius for rounded corners

Layer Management
- Move elements up or down one layer
- Bring to front or send to back
- Right click context menu for layer controls

History
- Undo and redo support
- Keyboard shortcuts Ctrl Z and Ctrl Y

Project Management
- Save project to browser storage
- Load saved projects
- Export as PNG image

Code Export
- Generate clean HTML code
- Generate responsive CSS with percentage based positioning
- Download images separately for use with exported code

## Keyboard Shortcuts

- Ctrl Z to undo
- Ctrl Y to redo
- Ctrl C to copy selected elements
- Ctrl V to paste
- Ctrl D to duplicate
- Ctrl A to select all
- Ctrl S to save project
- Ctrl O to load project
- Delete or Backspace to delete selected
- Escape to deselect all
- Shift click to multi select

## Getting Started

Install dependencies

npm install

Start development server

npm run dev

Build for production

npm run build

## Tech Stack

- React
- Vite
- CSS

## Export Instructions

When exporting your layout

1. Click Export Code button
2. Copy the HTML code and save as index.html
3. Copy the CSS code and save as style.css
4. If your layout has images click the Images button to download them
5. Create an images folder and place the downloaded images inside
6. Open index.html in a browser to see your layout
