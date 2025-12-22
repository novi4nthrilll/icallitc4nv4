import { useState, useRef } from 'react'
import ColorPicker from './ColorPicker'
import './Toolbar.css'

function Toolbar({
  addElement,
  selectedElement,
  selectedElements,
  updateElement,
  updateElements,
  deleteElements,
  onShowCode,
  onDuplicate,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onSave,
  onLoad,
  gridSnap,
  setGridSnap,
  showGrid,
  setShowGrid,
  gridSize,
  setGridSize,
  onAddImage
}) {
  const [showShapes, setShowShapes] = useState(false)
  const [showColor, setShowColor] = useState(false)
  const [showBorder, setShowBorder] = useState(false)
  const [showTextAlign, setShowTextAlign] = useState(false)
  const [showMoreShapes, setShowMoreShapes] = useState(false)
  const [showGridSettings, setShowGridSettings] = useState(false)
  const [showFontFamily, setShowFontFamily] = useState(false)
  const imageInputRef = useRef(null)

  const fontFamilies = [
    'Arial',
    'Times New Roman',
    'Courier New',
    'Georgia',
    'Verdana',
    'Comic Sans MS',
    'Impact',
    'Trebuchet MS',
    'Palatino',
    'Garamond'
  ]

  const shapes = [
    { type: 'square', icon: '□', label: 'Square' },
    { type: 'circle', icon: '●', label: 'Circle' },
    { type: 'triangle', icon: '▲', label: 'Triangle' },
    { type: 'pentagon', icon: '⬠', label: 'Pentagon' },
    { type: 'hexagon', icon: '⬡', label: 'Hexagon' },
    { type: 'star', icon: '★', label: 'Star' },
    { type: 'line', icon: '━', label: 'Line' },
  ]

  const moreShapes = [
    { type: 'oval', icon: '⬭', label: 'Oval' },
    { type: 'rounded-rect', icon: '▢', label: 'Rounded Rect' },
  ]

  const closeAll = () => {
    setShowShapes(false)
    setShowColor(false)
    setShowBorder(false)
    setShowTextAlign(false)
    setShowMoreShapes(false)
    setShowGridSettings(false)
    setShowFontFamily(false)
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        // Create image to get natural dimensions
        const img = new Image()
        img.onload = () => {
          // Calculate size to fit in viewport with max 400px
          const maxSize = 400
          let width = img.naturalWidth
          let height = img.naturalHeight
          
          // Scale down if too large
          if (width > maxSize || height > maxSize) {
            const ratio = Math.min(maxSize / width, maxSize / height)
            width = Math.round(width * ratio)
            height = Math.round(height * ratio)
          }
          
          onAddImage(event.target.result, width, height)
        }
        img.src = event.target.result
      }
      reader.readAsDataURL(file)
    }
    e.target.value = ''
  }

  const changeImageInputRef = useRef(null)

  const handleChangeImage = (e) => {
    const file = e.target.files[0]
    if (file && selectedElement && selectedElement.type === 'image') {
      const reader = new FileReader()
      reader.onload = (event) => {
        updateElement(selectedElement.id, { imageUrl: event.target.result })
      }
      reader.readAsDataURL(file)
    }
    e.target.value = ''
  }

  return (
    <div className="toolbar">
      {/* History Controls */}
      <div className="toolbar-section">
        <button
          className="tool-btn"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 7v6h6" />
            <path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13" />
          </svg>
        </button>
        <button
          className="tool-btn"
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 7v6h-6" />
            <path d="M3 17a9 9 0 019-9 9 9 0 016 2.3l3 2.7" />
          </svg>
        </button>
      </div>

      {/* Add Elements */}
      <div className="toolbar-section">
        <div className="divider"></div>
        <div className="tool-wrapper">
          <button
            className={`tool-btn primary ${showShapes ? 'active' : ''}`}
            onClick={() => { setShowShapes(!showShapes); setShowColor(false); setShowBorder(false); setShowTextAlign(false); setShowMoreShapes(false); setShowGridSettings(false) }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
            </svg>
            <span>Shapes</span>
          </button>
          {showShapes && (
            <div className="dropdown shapes-grid">
              {shapes.map(s => (
                <button key={s.type} className="shape-item" onClick={() => { addElement(s.type); closeAll() }}>
                  <span className="shape-icon">{s.icon}</span>
                  <span className="shape-label">{s.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="tool-wrapper">
          <button
            className={`tool-btn primary ${showMoreShapes ? 'active' : ''}`}
            onClick={() => { setShowMoreShapes(!showMoreShapes); setShowShapes(false); setShowColor(false); setShowBorder(false); setShowTextAlign(false); setShowGridSettings(false) }}
            title="More Shapes"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="2" />
              <circle cx="12" cy="5" r="2" />
              <circle cx="12" cy="19" r="2" />
            </svg>
            <span>More</span>
          </button>
          {showMoreShapes && (
            <div className="dropdown shapes-grid">
              {moreShapes.map(s => (
                <button key={s.type} className="shape-item" onClick={() => { addElement(s.type); closeAll() }}>
                  <span className="shape-icon">{s.icon}</span>
                  <span className="shape-label">{s.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button className="tool-btn primary" onClick={() => { addElement('text'); closeAll() }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 7V4h16v3M9 20h6M12 4v16" />
          </svg>
          <span>Text</span>
        </button>

        <button className="tool-btn primary" onClick={() => { imageInputRef.current?.click(); closeAll() }} title="Add Image">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
          <span>Image</span>
        </button>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: 'none' }}
        />
      </div>

      {/* Element Controls */}
      {selectedElements.length > 0 && (
        <div className="toolbar-section">
          <div className="divider"></div>

          {/* Color Picker */}
          <div className="tool-wrapper">
            <button
              className="tool-btn color-btn"
              onClick={() => { setShowColor(!showColor); setShowShapes(false); setShowBorder(false); setShowTextAlign(false); setShowMoreShapes(false); setShowGridSettings(false) }}
              style={{ '--preview-color': selectedElement?.type === 'text' ? selectedElement.fontColor : selectedElement?.backgroundColor }}
            >
              <div className="color-preview"></div>
              <span>Color</span>
            </button>
            {showColor && selectedElement && (
              <ColorPicker
                color={selectedElement.type === 'text' ? selectedElement.fontColor : selectedElement.backgroundColor}
                onChange={(color) => updateElement(selectedElement.id, selectedElement.type === 'text' ? { fontColor: color } : { backgroundColor: color })}
                onClose={() => setShowColor(false)}
              />
            )}
          </div>

          {/* Border Controls */}
          {selectedElement && selectedElement.type !== 'text' && selectedElement.type !== 'line' && (
            <div className="tool-wrapper">
              <button
                className={`tool-btn ${showBorder ? 'active' : ''}`}
                onClick={() => { setShowBorder(!showBorder); setShowColor(false); setShowShapes(false); setShowTextAlign(false); setShowMoreShapes(false); setShowGridSettings(false) }}
                title="Border"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                </svg>
              </button>
              {showBorder && (
                <div className="dropdown border-controls">
                  <label>
                    Width
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={selectedElement.borderWidth || 0}
                      onChange={(e) => updateElement(selectedElement.id, { borderWidth: Number(e.target.value) })}
                    />
                    <span>{selectedElement.borderWidth || 0}px</span>
                  </label>
                  <label>
                    Color
                    <input
                      type="color"
                      value={selectedElement.borderColor || '#000000'}
                      onChange={(e) => updateElement(selectedElement.id, { borderColor: e.target.value })}
                    />
                  </label>
                </div>
              )}
            </div>
          )}

          {/* Text Alignment */}
          {selectedElement && selectedElement.type === 'text' && (
            <div className="tool-wrapper">
              <button
                className={`tool-btn ${showTextAlign ? 'active' : ''}`}
                onClick={() => { setShowTextAlign(!showTextAlign); setShowColor(false); setShowShapes(false); setShowBorder(false); setShowMoreShapes(false); setShowGridSettings(false) }}
                title="Text Align"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="17" y1="10" x2="3" y2="10" />
                  <line x1="21" y1="6" x2="3" y2="6" />
                  <line x1="21" y1="14" x2="3" y2="14" />
                  <line x1="17" y1="18" x2="3" y2="18" />
                </svg>
              </button>
              {showTextAlign && (
                <div className="dropdown text-align-grid">
                  <button
                    className={`align-btn ${selectedElement.textAlign === 'left' ? 'active' : ''}`}
                    onClick={() => updateElement(selectedElement.id, { textAlign: 'left' })}
                    title="Align Left"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="17" y1="10" x2="3" y2="10" />
                      <line x1="21" y1="6" x2="3" y2="6" />
                      <line x1="21" y1="14" x2="3" y2="14" />
                      <line x1="17" y1="18" x2="3" y2="18" />
                    </svg>
                  </button>
                  <button
                    className={`align-btn ${selectedElement.textAlign === 'center' ? 'active' : ''}`}
                    onClick={() => updateElement(selectedElement.id, { textAlign: 'center' })}
                    title="Align Center"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="10" x2="6" y2="10" />
                      <line x1="21" y1="6" x2="3" y2="6" />
                      <line x1="21" y1="14" x2="3" y2="14" />
                      <line x1="18" y1="18" x2="6" y2="18" />
                    </svg>
                  </button>
                  <button
                    className={`align-btn ${selectedElement.textAlign === 'right' ? 'active' : ''}`}
                    onClick={() => updateElement(selectedElement.id, { textAlign: 'right' })}
                    title="Align Right"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="21" y1="10" x2="7" y2="10" />
                      <line x1="21" y1="6" x2="3" y2="6" />
                      <line x1="21" y1="14" x2="3" y2="14" />
                      <line x1="21" y1="18" x2="7" y2="18" />
                    </svg>
                  </button>
                  <button
                    className={`align-btn ${selectedElement.textAlign === 'justify' ? 'active' : ''}`}
                    onClick={() => updateElement(selectedElement.id, { textAlign: 'justify' })}
                    title="Justify"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="21" y1="10" x2="3" y2="10" />
                      <line x1="21" y1="6" x2="3" y2="6" />
                      <line x1="21" y1="14" x2="3" y2="14" />
                      <line x1="21" y1="18" x2="3" y2="18" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Font Family Selector */}
          {selectedElement && selectedElement.type === 'text' && (
            <div className="tool-wrapper">
              <button
                className={`tool-btn ${showFontFamily ? 'active' : ''}`}
                onClick={() => { setShowFontFamily(!showFontFamily); setShowColor(false); setShowShapes(false); setShowBorder(false); setShowTextAlign(false); setShowMoreShapes(false); setShowGridSettings(false) }}
                title="Font Family"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 7V4h16v3M9 20h6M12 4v16" />
                </svg>
              </button>
              {showFontFamily && (
                <div className="dropdown font-family-list">
                  {fontFamilies.map(font => (
                    <button
                      key={font}
                      className={`font-item ${selectedElement.fontFamily === font ? 'active' : ''}`}
                      onClick={() => { updateElement(selectedElement.id, { fontFamily: font }); closeAll() }}
                      style={{ fontFamily: font }}
                    >
                      {font}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Change Image Button */}
          {selectedElement && selectedElement.type === 'image' && (
            <>
              <button
                className="tool-btn"
                onClick={() => changeImageInputRef.current?.click()}
                title="Change Image"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
              </button>
              <input
                ref={changeImageInputRef}
                type="file"
                accept="image/*"
                onChange={handleChangeImage}
                style={{ display: 'none' }}
              />
            </>
          )}

          <button className="tool-btn" onClick={onDuplicate} title="Duplicate (Ctrl+D)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
          </button>

          <button className="tool-btn danger" onClick={deleteElements} title="Delete (Del)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
          </button>
        </div>
      )}

      {/* Grid & Export */}
      <div className="toolbar-section">
        <div className="divider"></div>

        {/* Grid Settings */}
        <div className="tool-wrapper">
          <button
            className={`tool-btn ${showGridSettings ? 'active' : ''}`}
            onClick={() => { setShowGridSettings(!showGridSettings); setShowColor(false); setShowShapes(false); setShowBorder(false); setShowTextAlign(false); setShowMoreShapes(false) }}
            title="Grid Settings"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
          </button>
          {showGridSettings && (
            <div className="dropdown grid-controls">
              <label>
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                />
                Show Grid
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={gridSnap}
                  onChange={(e) => setGridSnap(e.target.checked)}
                />
                Snap to Grid
              </label>
              <label>
                Grid Size
                <input
                  type="range"
                  min="10"
                  max="50"
                  value={gridSize}
                  onChange={(e) => setGridSize(Number(e.target.value))}
                />
                <span>{gridSize}px</span>
              </label>
            </div>
          )}
        </div>

        <button className="tool-btn" onClick={onSave} title="Save Project (Ctrl+S)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
        </button>

        <button className="tool-btn" onClick={onLoad} title="Load Project (Ctrl+O)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="18" x2="12" y2="12" />
            <line x1="9" y1="15" x2="15" y2="15" />
          </svg>
        </button>

        <button className="tool-btn code-btn" onClick={onShowCode}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" />
          </svg>
          <span>Export Code</span>
        </button>
      </div>
    </div>
  )
}

export default Toolbar
