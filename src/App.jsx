import { useState, useRef, useEffect } from 'react'
import Canvas from './components/Canvas'
import Toolbar from './components/Toolbar'
import CodeModal from './components/CodeModal'
import ContextMenu from './components/ContextMenu'
import './App.css'

function App() {
  const [elements, setElements] = useState([])
  const [selectedIds, setSelectedIds] = useState([]) // Multi-select support
  const [showCode, setShowCode] = useState(false)
  const [clipboard, setClipboard] = useState(null)
  const [contextMenu, setContextMenu] = useState(null)
  const [gridSnap, setGridSnap] = useState(false)
  const [gridSize, setGridSize] = useState(20)
  const [showGrid, setShowGrid] = useState(false)
  const idCounter = useRef(1)

  // History management for undo/redo
  const [history, setHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  // Save to history when elements change
  const saveToHistory = (newElements) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(JSON.parse(JSON.stringify(newElements)))
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  // Undo
  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setElements(JSON.parse(JSON.stringify(history[historyIndex - 1])))
    }
  }

  // Redo
  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setElements(JSON.parse(JSON.stringify(history[historyIndex + 1])))
    }
  }

  // Snap to grid helper
  const snapToGrid = (value) => {
    if (!gridSnap) return value
    return Math.round(value / gridSize) * gridSize
  }

  // Save to localStorage
  const saveProject = () => {
    const project = {
      elements,
      idCounter: idCounter.current,
      timestamp: new Date().toISOString()
    }
    localStorage.setItem('layout-web-project', JSON.stringify(project))
    alert('Project saved!')
  }

  // Load from localStorage
  const loadProject = () => {
    const saved = localStorage.getItem('layout-web-project')
    if (saved) {
      const project = JSON.parse(saved)
      setElements(project.elements)
      idCounter.current = project.idCounter
      setSelectedIds([])
      saveToHistory(project.elements)
      alert('Project loaded!')
    } else {
      alert('No saved project found!')
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Prevent shortcuts when typing in input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return

      // Ctrl+Z - Undo
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      }
      // Ctrl+Y or Ctrl+Shift+Z - Redo
      if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
        e.preventDefault()
        redo()
      }
      // Ctrl+C - Copy
      if (e.ctrlKey && e.key === 'c') {
        e.preventDefault()
        if (selectedIds.length > 0) copyElements()
      }
      // Ctrl+V - Paste
      if (e.ctrlKey && e.key === 'v') {
        e.preventDefault()
        pasteElements()
      }
      // Ctrl+D - Duplicate
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault()
        if (selectedIds.length > 0) duplicateElements()
      }
      // Delete or Backspace - Delete
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIds.length > 0) {
        e.preventDefault()
        deleteElements()
      }
      // Ctrl+A - Select All
      if (e.ctrlKey && e.key === 'a') {
        e.preventDefault()
        setSelectedIds(elements.map(el => el.id))
      }
      // Ctrl+S - Save
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault()
        saveProject()
      }
      // Ctrl+O - Load
      if (e.ctrlKey && e.key === 'o') {
        e.preventDefault()
        loadProject()
      }
      // Escape - Deselect
      if (e.key === 'Escape') {
        setSelectedIds([])
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedIds, elements, historyIndex, history, clipboard])

  const addElement = (type, imageData = null) => {
    const newElement = {
      id: idCounter.current++,
      type,
      x: snapToGrid(window.innerWidth / 2 - 75),
      y: snapToGrid(window.innerHeight / 2 - 75),
      width: type === 'text' ? 200 : (type === 'line' ? 200 : 150),
      height: type === 'text' ? 50 : (type === 'line' ? 4 : (type === 'oval' ? 100 : 150)),
      backgroundColor: type === 'text' ? 'transparent' : '#000000',
      borderRadius: type === 'circle' ? '50%' : (type === 'rounded-rect' ? '20px' : '0px'),
      borderColor: '#000000',
      borderWidth: 0,
      text: type === 'text' ? 'Double click to edit' : '',
      fontSize: 24,
      fontColor: '#000000',
      fontWeight: 'normal',
      textAlign: 'center',
      fontFamily: 'Arial',
      rotation: 0,
      locked: false,
      imageUrl: type === 'image' ? (imageData || '') : undefined,
    }
    const newElements = [...elements, newElement]
    setElements(newElements)
    setSelectedIds([newElement.id])
    saveToHistory(newElements)
  }

  const addImageElement = (imageData, width = 150, height = 150) => {
    const newElement = {
      id: idCounter.current++,
      type: 'image',
      x: snapToGrid(window.innerWidth / 2 - width / 2),
      y: snapToGrid(window.innerHeight / 2 - height / 2),
      width,
      height,
      backgroundColor: 'transparent',
      borderRadius: '0px',
      borderColor: '#000000',
      borderWidth: 0,
      rotation: 0,
      locked: false,
      imageUrl: imageData,
    }
    const newElements = [...elements, newElement]
    setElements(newElements)
    setSelectedIds([newElement.id])
    saveToHistory(newElements)
  }

  const updateElement = (id, updates, save = true) => {
    const newElements = elements.map(el => el.id === id ? { ...el, ...updates } : el)
    setElements(newElements)
    if (save) saveToHistory(newElements)
  }

  const updateElements = (ids, updates) => {
    const newElements = elements.map(el =>
      ids.includes(el.id) ? { ...el, ...updates } : el
    )
    setElements(newElements)
    saveToHistory(newElements)
  }

  const deleteElements = () => {
    const newElements = elements.filter(el => !selectedIds.includes(el.id))
    setElements(newElements)
    setSelectedIds([])
    saveToHistory(newElements)
  }

  const copyElements = () => {
    const els = elements.filter(e => selectedIds.includes(e.id))
    if (els.length > 0) setClipboard(els.map(el => ({ ...el })))
  }

  const pasteElements = (x, y) => {
    if (clipboard && clipboard.length > 0) {
      const newElements = clipboard.map(el => ({
        ...el,
        id: idCounter.current++,
        x: snapToGrid((x !== undefined ? x : el.x + 20)),
        y: snapToGrid((y !== undefined ? y : el.y + 20)),
      }))
      const updatedElements = [...elements, ...newElements]
      setElements(updatedElements)
      setSelectedIds(newElements.map(el => el.id))
      saveToHistory(updatedElements)
    }
  }

  const duplicateElements = () => {
    const els = elements.filter(e => selectedIds.includes(e.id))
    if (els.length > 0) {
      const newElements = els.map(el => ({
        ...el,
        id: idCounter.current++,
        x: snapToGrid(el.x + 20),
        y: snapToGrid(el.y + 20),
      }))
      const updatedElements = [...elements, ...newElements]
      setElements(updatedElements)
      setSelectedIds(newElements.map(el => el.id))
      saveToHistory(updatedElements)
    }
  }

  const toggleLock = () => {
    if (selectedIds.length > 0) {
      const firstEl = elements.find(e => e.id === selectedIds[0])
      const newLocked = !firstEl.locked
      updateElements(selectedIds, { locked: newLocked })
    }
  }

  const bringToFront = () => {
    if (selectedIds.length > 0) {
      const selected = elements.filter(e => selectedIds.includes(e.id))
      const others = elements.filter(e => !selectedIds.includes(e.id))
      const newElements = [...others, ...selected]
      setElements(newElements)
      saveToHistory(newElements)
    }
  }

  const sendToBack = () => {
    if (selectedIds.length > 0) {
      const selected = elements.filter(e => selectedIds.includes(e.id))
      const others = elements.filter(e => !selectedIds.includes(e.id))
      const newElements = [...selected, ...others]
      setElements(newElements)
      saveToHistory(newElements)
    }
  }

  // Move layer up (one step forward)
  const moveLayerUp = () => {
    if (selectedIds.length !== 1) return
    const index = elements.findIndex(e => e.id === selectedIds[0])
    if (index < elements.length - 1) {
      const newElements = [...elements]
      const temp = newElements[index]
      newElements[index] = newElements[index + 1]
      newElements[index + 1] = temp
      setElements(newElements)
      saveToHistory(newElements)
    }
  }

  // Move layer down (one step backward)
  const moveLayerDown = () => {
    if (selectedIds.length !== 1) return
    const index = elements.findIndex(e => e.id === selectedIds[0])
    if (index > 0) {
      const newElements = [...elements]
      const temp = newElements[index]
      newElements[index] = newElements[index - 1]
      newElements[index - 1] = temp
      setElements(newElements)
      saveToHistory(newElements)
    }
  }

  const handleContextMenu = (e, elementId = null) => {
    e.preventDefault()
    if (elementId && !selectedIds.includes(elementId)) {
      setSelectedIds([elementId])
    }
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      hasElement: elementId !== null || selectedIds.length > 0
    })
  }

  const closeContextMenu = () => setContextMenu(null)

  const selectedElements = elements.filter(el => selectedIds.includes(el.id))
  const selectedElement = selectedElements.length === 1 ? selectedElements[0] : null

  return (
    <div className="app" onClick={closeContextMenu}>
      <Canvas
        elements={elements}
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
        updateElement={updateElement}
        onContextMenu={handleContextMenu}
        snapToGrid={snapToGrid}
        gridSnap={gridSnap}
        showGrid={showGrid}
        gridSize={gridSize}
        onHistorySave={() => saveToHistory(elements)}
      />
      <Toolbar
        addElement={addElement}
        selectedElement={selectedElement}
        selectedElements={selectedElements}
        updateElement={updateElement}
        updateElements={updateElements}
        deleteElements={deleteElements}
        onShowCode={() => setShowCode(true)}
        onDuplicate={duplicateElements}
        onUndo={undo}
        onRedo={redo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onSave={saveProject}
        onLoad={loadProject}
        gridSnap={gridSnap}
        setGridSnap={setGridSnap}
        showGrid={showGrid}
        setShowGrid={setShowGrid}
        gridSize={gridSize}
        setGridSize={setGridSize}
        onAddImage={addImageElement}
      />
      {showCode && <CodeModal elements={elements} onClose={() => setShowCode(false)} />}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          hasElement={contextMenu.hasElement}
          hasClipboard={!!clipboard}
          isLocked={selectedElement?.locked}
          onCopy={copyElements}
          onPaste={() => pasteElements(contextMenu.x, contextMenu.y)}
          onDuplicate={duplicateElements}
          onDelete={deleteElements}
          onLock={toggleLock}
          onBringToFront={bringToFront}
          onSendToBack={sendToBack}
          onMoveLayerUp={moveLayerUp}
          onMoveLayerDown={moveLayerDown}
          onClose={closeContextMenu}
        />
      )}
    </div>
  )
}

export default App
