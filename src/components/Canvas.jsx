import { useState, useRef } from 'react'
import './Canvas.css'

function Canvas({ elements, selectedIds, setSelectedIds, updateElement, onContextMenu, snapToGrid, gridSnap, showGrid, gridSize, onHistorySave }) {
  const canvasRef = useRef(null)
  const [dragging, setDragging] = useState(null)
  const [resizing, setResizing] = useState(null)
  const [rotating, setRotating] = useState(null)
  const [editingText, setEditingText] = useState(null)
  const [selectionBox, setSelectionBox] = useState(null)

  const handleMouseDown = (e, element, action = 'drag', handle = null) => {
    e.stopPropagation()
    if (element.locked) return

    // Multi-select with Shift
    if (e.shiftKey && action === 'drag') {
      if (selectedIds.includes(element.id)) {
        setSelectedIds(selectedIds.filter(id => id !== element.id))
      } else {
        setSelectedIds([...selectedIds, element.id])
      }
      return
    }

    if (!selectedIds.includes(element.id)) {
      setSelectedIds([element.id])
    }

    if (action === 'drag') {
      // Prepare drag for all selected elements
      const offsets = selectedIds.includes(element.id)
        ? elements.filter(el => selectedIds.includes(el.id)).map(el => ({
          id: el.id,
          offsetX: e.clientX - el.x,
          offsetY: e.clientY - el.y,
        }))
        : [{
          id: element.id,
          offsetX: e.clientX - element.x,
          offsetY: e.clientY - element.y,
        }]
      setDragging(offsets)
    } else if (action === 'resize') {
      setResizing({
        id: element.id,
        handle,
        startMouseX: e.clientX,
        startMouseY: e.clientY,
        startX: element.x,
        startY: element.y,
        startWidth: element.width,
        startHeight: element.height
      })
    } else if (action === 'rotate') {
      const centerX = element.x + element.width / 2
      const centerY = element.y + element.height / 2
      setRotating({
        id: element.id,
        centerX,
        centerY,
      })
    }
  }

  const handleMouseMove = (e) => {
    if (dragging) {
      dragging.forEach(({ id, offsetX, offsetY }) => {
        updateElement(id, {
          x: snapToGrid(Math.max(0, e.clientX - offsetX)),
          y: snapToGrid(Math.max(0, e.clientY - offsetY))
        }, false)
      })
    }


    if (resizing) {
      const { handle, startMouseX, startMouseY, startX, startY, startWidth, startHeight } = resizing
      const deltaX = e.clientX - startMouseX
      const deltaY = e.clientY - startMouseY

      let newX = startX
      let newY = startY
      let newWidth = startWidth
      let newHeight = startHeight

      if (handle.includes('e')) newWidth = Math.max(20, startWidth + deltaX)
      if (handle.includes('w')) {
        newWidth = Math.max(20, startWidth - deltaX)
        if (newWidth > 20) newX = startX + deltaX
      }
      if (handle.includes('s')) newHeight = Math.max(20, startHeight + deltaY)
      if (handle.includes('n')) {
        newHeight = Math.max(20, startHeight - deltaY)
        if (newHeight > 20) newY = startY + deltaY
      }

      // Auto-height for text elements when resizing width
      const element = elements.find(el => el.id === resizing.id)
      if (element && element.type === 'text' && (handle.includes('e') || handle.includes('w'))) {
        const measureDiv = document.createElement('div')
        measureDiv.style.position = 'absolute'
        measureDiv.style.visibility = 'hidden'
        measureDiv.style.height = 'auto'
        measureDiv.style.width = newWidth + 'px'
        measureDiv.style.fontSize = element.fontSize + 'px'
        measureDiv.style.fontFamily = element.fontFamily || 'Arial'
        measureDiv.style.fontWeight = element.fontWeight
        measureDiv.style.whiteSpace = 'pre-wrap'
        measureDiv.style.wordWrap = 'break-word'
        measureDiv.style.padding = '5px'
        measureDiv.style.boxSizing = 'border-box'
        measureDiv.innerText = element.text + (element.text.endsWith('\n') ? '.' : '')

        document.body.appendChild(measureDiv)
        const autoHeight = Math.max(element.fontSize * 1.5, measureDiv.scrollHeight)
        document.body.removeChild(measureDiv)

        // Adjust Y to keep vertical center anchored if we want, or just update height
        // For resizing, usually users expect Top-Left anchor (unless dragging N/W handles)
        // But since we want "melebar sendiri dari sisi atas + bawah" feeling, we should probably adjust Y 
        // to keep the center relatively stable, OR just let height snap. 
        // Given the user complained about "sisi bawahnya kaga mengikuti", simply updating height is the primary fix.
        newHeight = autoHeight
      }

      updateElement(resizing.id, { x: newX, y: newY, width: newWidth, height: newHeight }, false)
    }

    if (rotating) {
      const { centerX, centerY } = rotating
      const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI) + 90
      updateElement(rotating.id, { rotation: Math.round(angle) }, false)
    }

    if (selectionBox) {
      const { startX, startY } = selectionBox
      setSelectionBox({
        startX,
        startY,
        endX: e.clientX,
        endY: e.clientY
      })
    }
  }

  const handleMouseUp = () => {
    if (dragging || resizing || rotating) {
      onHistorySave()
    }

    if (selectionBox) {
      const { startX, startY, endX, endY } = selectionBox
      const minX = Math.min(startX, endX)
      const maxX = Math.max(startX, endX)
      const minY = Math.min(startY, endY)
      const maxY = Math.max(startY, endY)

      const selected = elements.filter(el => {
        const elCenterX = el.x + el.width / 2
        const elCenterY = el.y + el.height / 2
        return elCenterX >= minX && elCenterX <= maxX && elCenterY >= minY && elCenterY <= maxY
      })

      setSelectedIds(selected.map(el => el.id))
      setSelectionBox(null)
    }

    setDragging(null)
    setResizing(null)
    setRotating(null)
  }

  const handleCanvasClick = (e) => {
    if (e.target === canvasRef.current) {
      setSelectedIds([])
      setEditingText(null)
    }
  }

  const handleCanvasMouseDown = (e) => {
    if (e.target === canvasRef.current && !e.shiftKey) {
      setSelectionBox({
        startX: e.clientX,
        startY: e.clientY,
        endX: e.clientX,
        endY: e.clientY
      })
    }
  }

  const handleRightClick = (e, elementId = null) => {
    e.preventDefault()
    onContextMenu(e, elementId)
  }

  const handleDoubleClick = (e, element) => {
    if (element.type === 'text') {
      e.stopPropagation()
      setEditingText(element.id)
    }
  }

  const renderShape = (element) => {
    const { type, width, height, backgroundColor, borderColor, borderWidth } = element
    const border = borderWidth > 0 ? { stroke: borderColor, strokeWidth: borderWidth } : {}

    switch (type) {
      case 'triangle':
        return (
          <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: 'absolute', top: 0, left: 0 }}>
            <polygon points={`${width / 2},0 ${width},${height} 0,${height}`} fill={backgroundColor} {...border} />
          </svg>
        )
      case 'pentagon':
        return (
          <svg width={width} height={height} viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
            <polygon points="50,0 100,38 82,100 18,100 0,38" fill={backgroundColor} {...border} />
          </svg>
        )
      case 'hexagon':
        return (
          <svg width={width} height={height} viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
            <polygon points="25,0 75,0 100,50 75,100 25,100 0,50" fill={backgroundColor} {...border} />
          </svg>
        )
      case 'star':
        return (
          <svg width={width} height={height} viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
            <polygon points="50,0 61,35 98,35 68,57 79,91 50,70 21,91 32,57 2,35 39,35" fill={backgroundColor} {...border} />
          </svg>
        )
      case 'oval':
        return null // Handled by CSS borderRadius
      case 'image':
        return element.imageUrl ? (
          <img src={element.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f0f0', color: '#999' }}>
            No Image
          </div>
        )
      default:
        return null
    }
  }

  const getShapeStyle = (element) => {
    const rotation = element.rotation || 0
    const baseStyle = {
      left: element.x,
      top: element.y,
      width: element.width,
      height: element.height,
      transform: `rotate(${rotation}deg)`,
      border: element.borderWidth > 0 ? `${element.borderWidth}px solid ${element.borderColor}` : 'none',
    }

    switch (element.type) {
      case 'triangle':
      case 'pentagon':
      case 'hexagon':
      case 'star':
        return { ...baseStyle, backgroundColor: 'transparent', border: 'none' }
      case 'circle':
        return { ...baseStyle, backgroundColor: element.backgroundColor, borderRadius: '50%' }
      case 'oval':
        return { ...baseStyle, backgroundColor: element.backgroundColor, borderRadius: '50%' }
      case 'rounded-rect':
        return { ...baseStyle, backgroundColor: element.backgroundColor, borderRadius: element.borderRadius || '20px' }
      case 'line':
        return { ...baseStyle, backgroundColor: element.backgroundColor, borderRadius: '2px', border: 'none' }
      case 'image':
        return { ...baseStyle, backgroundColor: 'transparent', overflow: 'hidden', borderRadius: element.borderRadius || '0px' }
      default:
        return { ...baseStyle, backgroundColor: element.backgroundColor, borderRadius: element.borderRadius || '0px' }
    }
  }

  const gridStyle = showGrid ? {
    backgroundImage: `
      linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)
    `,
    backgroundSize: `${gridSize}px ${gridSize}px`
  } : {}

  return (
    <div
      className="canvas"
      ref={canvasRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseDown={handleCanvasMouseDown}
      onMouseLeave={handleMouseUp}
      onClick={handleCanvasClick}
      onContextMenu={(e) => handleRightClick(e)}
      style={gridStyle}
    >
      {elements.map(element => (
        <div
          key={element.id}
          className={`element ${selectedIds.includes(element.id) ? 'selected' : ''} ${element.locked ? 'locked' : ''}`}
          style={getShapeStyle(element)}
          onMouseDown={(e) => handleMouseDown(e, element, 'drag')}
          onDoubleClick={(e) => handleDoubleClick(e, element)}
          onContextMenu={(e) => handleRightClick(e, element.id)}
        >
          {renderShape(element)}

          {element.type === 'text' && (
            editingText === element.id ? (
              <textarea
                className="text-input"
                value={element.text}
                onChange={(e) => {
                  const newText = e.target.value;
                  const measureDiv = document.createElement('div');
                  measureDiv.style.position = 'absolute';
                  measureDiv.style.visibility = 'hidden';
                  measureDiv.style.height = 'auto';
                  measureDiv.style.width = element.width + 'px';
                  measureDiv.style.fontSize = element.fontSize + 'px';
                  measureDiv.style.fontFamily = element.fontFamily || 'Arial';
                  measureDiv.style.fontWeight = element.fontWeight;
                  measureDiv.style.whiteSpace = 'pre-wrap';
                  measureDiv.style.wordWrap = 'break-word';
                  measureDiv.style.padding = '5px';
                  measureDiv.style.boxSizing = 'border-box';
                  measureDiv.innerText = newText + (newText.endsWith('\n') ? '.' : '');

                  document.body.appendChild(measureDiv);
                  const newHeight = Math.max(element.fontSize * 1.5, measureDiv.scrollHeight);
                  document.body.removeChild(measureDiv);

                  const heightDiff = newHeight - element.height;

                  if (Math.abs(heightDiff) > 1) {
                    updateElement(element.id, {
                      text: newText,
                      height: newHeight,
                      y: element.y - (heightDiff / 2) // Maintain center by adjusting Y
                    }, false);
                  } else {
                    updateElement(element.id, { text: newText }, false);
                  }
                }}
                onBlur={() => {
                  onHistorySave()
                  setEditingText(null)
                }}
                autoFocus
                style={{
                  fontSize: element.fontSize,
                  color: element.fontColor,
                  fontWeight: element.fontWeight,
                  textAlign: element.textAlign || 'center',
                  fontFamily: element.fontFamily || 'Arial'
                }}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="text-content" style={{
                fontSize: element.fontSize,
                color: element.fontColor,
                fontWeight: element.fontWeight,
                textAlign: element.textAlign || 'center',
                fontFamily: element.fontFamily || 'Arial',
                display: 'block',
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                wordWrap: 'break-word',
                whiteSpace: 'pre-wrap'
              }}>
                {element.text}
              </span>
            )
          )}

          {selectedIds.includes(element.id) && !element.locked && (
            <>
              <div className="rotate-handle" onMouseDown={(e) => handleMouseDown(e, element, 'rotate')}></div>
              <div className="rotate-line"></div>
              {element.type !== 'line' && (
                <>
                  <div className="resize-handle nw" onMouseDown={(e) => handleMouseDown(e, element, 'resize', 'nw')}></div>
                  <div className="resize-handle ne" onMouseDown={(e) => handleMouseDown(e, element, 'resize', 'ne')}></div>
                  <div className="resize-handle sw" onMouseDown={(e) => handleMouseDown(e, element, 'resize', 'sw')}></div>
                  <div className="resize-handle se" onMouseDown={(e) => handleMouseDown(e, element, 'resize', 'se')}></div>
                  <div className="resize-handle n" onMouseDown={(e) => handleMouseDown(e, element, 'resize', 'n')}></div>
                  <div className="resize-handle s" onMouseDown={(e) => handleMouseDown(e, element, 'resize', 's')}></div>
                </>
              )}
              <div className="resize-handle e" onMouseDown={(e) => handleMouseDown(e, element, 'resize', 'e')}></div>
              <div className="resize-handle w" onMouseDown={(e) => handleMouseDown(e, element, 'resize', 'w')}></div>
            </>
          )}
        </div>
      ))}

      {selectionBox && (
        <div
          className="selection-box"
          style={{
            left: Math.min(selectionBox.startX, selectionBox.endX),
            top: Math.min(selectionBox.startY, selectionBox.endY),
            width: Math.abs(selectionBox.endX - selectionBox.startX),
            height: Math.abs(selectionBox.endY - selectionBox.startY),
          }}
        />
      )}
    </div>
  )
}

export default Canvas
