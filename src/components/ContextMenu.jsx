import './ContextMenu.css'

function ContextMenu({ 
  x, y, hasElement, hasClipboard, isLocked, 
  onCopy, onPaste, onDuplicate, onDelete, onLock, 
  onBringToFront, onSendToBack, onMoveLayerUp, onMoveLayerDown, onClose 
}) {
  const handleClick = (action) => {
    action()
    onClose()
  }

  return (
    <div className="context-menu" style={{ left: x, top: y }} onClick={(e) => e.stopPropagation()}>
      {hasElement && (
        <>
          <button className="context-item" onClick={() => handleClick(onCopy)}>
            <span>Copy</span>
            <span className="shortcut">Ctrl+C</span>
          </button>
          <button className="context-item" onClick={() => handleClick(onDuplicate)}>
            <span>Duplicate</span>
            <span className="shortcut">Ctrl+D</span>
          </button>
        </>
      )}
      <button className="context-item" onClick={() => handleClick(onPaste)} disabled={!hasClipboard}>
        <span>Paste</span>
        <span className="shortcut">Ctrl+V</span>
      </button>
      {hasElement && (
        <>
          <button className="context-item delete" onClick={() => handleClick(onDelete)}>
            <span>Delete</span>
            <span className="shortcut">DEL</span>
          </button>
          <div className="context-divider"></div>
          <button className="context-item" onClick={() => handleClick(onLock)}>
            <span>{isLocked ? 'Unlock' : 'Lock'}</span>
          </button>
          <div className="context-divider"></div>
          <div className="context-submenu">
            <span className="submenu-title">Layer</span>
            <button className="context-item" onClick={() => handleClick(onMoveLayerUp)}>
              <span>Move Up</span>
            </button>
            <button className="context-item" onClick={() => handleClick(onMoveLayerDown)}>
              <span>Move Down</span>
            </button>
            <button className="context-item" onClick={() => handleClick(onBringToFront)}>
              <span>Bring to Front</span>
            </button>
            <button className="context-item" onClick={() => handleClick(onSendToBack)}>
              <span>Send to Back</span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default ContextMenu
