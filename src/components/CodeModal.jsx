import { useState } from 'react'
import './CodeModal.css'

function CodeModal({ elements, onClose }) {
  const [copied, setCopied] = useState('')
  const [activeTab, setActiveTab] = useState('html')

  const toPercent = (value, total) => ((value / total) * 100).toFixed(4)

  // Get image elements with their filenames
  const imageElements = elements
    .map((el, i) => ({ el, index: i }))
    .filter(({ el }) => el.type === 'image' && el.imageUrl)
  
  const hasImages = imageElements.length > 0

  const getImageFilename = (index) => `image-${index + 1}.png`

  const getPolygonPoints = (type) => {
    switch (type) {
      case 'triangle':
        return '50,0 100,100 0,100'
      case 'pentagon':
        return '50,0 100,38 82,100 18,100 0,38'
      case 'hexagon':
        return '25,0 75,0 100,50 75,100 25,100 0,50'
      case 'star':
        return '50,0 61,35 98,35 68,57 79,91 50,70 21,91 32,57 2,35 39,35'
      default:
        return ''
    }
  }

  const generateHTML = () => {
    if (elements.length === 0) return '<!-- No elements yet -->'

    let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Layout</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="container">
`
    // Track image counter for naming
    let imageCounter = 0
    
    elements.forEach((el, i) => {
      const className = `element-${i + 1}`
      
      if (el.type === 'text') {
        const escapedText = el.text
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/\n/g, '<br>')
        html += `    <div class="${className}"><span class="text-content">${escapedText}</span></div>\n`
      } else if (['triangle', 'pentagon', 'hexagon', 'star'].includes(el.type)) {
        const points = getPolygonPoints(el.type)
        html += `    <div class="${className}">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        <polygon points="${points}" />
      </svg>
    </div>\n`
      } else if (el.type === 'image') {
        imageCounter++
        const filename = el.imageUrl ? getImageFilename(imageCounter) : 'placeholder.jpg'
        html += `    <div class="${className}">
      <img src="images/${filename}" alt="">
    </div>\n`
      } else {
        html += `    <div class="${className}"></div>\n`
      }
    })
    
    html += `  </div>
</body>
</html>`
    return html
  }

  const generateCSS = () => {
    if (elements.length === 0) return '/* No elements yet */'

    const vw = window.innerWidth
    const vh = window.innerHeight

    let css = `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.container {
  position: relative;
  width: 100vw;
  min-height: 100vh;
  background: #ffffff;
  overflow: hidden;
}

`

    elements.forEach((el, i) => {
      const rotation = el.rotation || 0
      const leftPercent = toPercent(el.x, vw)
      const topPercent = toPercent(el.y, vh)
      const widthPercent = toPercent(el.width, vw)
      const heightPercent = toPercent(el.height, vh)
      const zIndex = i + 1

      let elementCSS = `.element-${i + 1} {
  position: absolute;
  left: ${leftPercent}%;
  top: ${topPercent}%;
  width: ${widthPercent}%;
  height: ${heightPercent}%;
  z-index: ${zIndex};`

      if (rotation !== 0) {
        elementCSS += `
  transform: rotate(${rotation}deg);
  transform-origin: center;`
      }

      switch (el.type) {
        case 'triangle':
        case 'pentagon':
        case 'hexagon':
        case 'star':
          elementCSS += `
  background: transparent;
}

.element-${i + 1} svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.element-${i + 1} polygon {
  fill: ${el.backgroundColor};`
          if (el.borderWidth > 0) {
            elementCSS += `
  stroke: ${el.borderColor};
  stroke-width: ${el.borderWidth};`
          }
          elementCSS += `
}`
          break

        case 'circle':
        case 'oval':
          elementCSS += `
  background: ${el.backgroundColor};
  border-radius: 50%;`
          if (el.borderWidth > 0) {
            elementCSS += `
  border: ${el.borderWidth}px solid ${el.borderColor};`
          }
          elementCSS += `
}`
          break

        case 'rounded-rect':
          elementCSS += `
  background: ${el.backgroundColor};
  border-radius: ${el.borderRadius || '20px'};`
          if (el.borderWidth > 0) {
            elementCSS += `
  border: ${el.borderWidth}px solid ${el.borderColor};`
          }
          elementCSS += `
}`
          break

        case 'line':
          elementCSS += `
  background: ${el.backgroundColor};
  border-radius: 2px;
}`
          break

        case 'text':
          elementCSS += `
  display: flex;
  align-items: center;
  justify-content: ${el.textAlign === 'left' ? 'flex-start' : el.textAlign === 'right' ? 'flex-end' : 'center'};
  padding: 5px;
  overflow: hidden;
}

.element-${i + 1} .text-content {
  display: block;
  width: 100%;
  font-size: ${el.fontSize}px;
  color: ${el.fontColor};
  font-weight: ${el.fontWeight};
  font-family: ${el.fontFamily || 'Arial'}, sans-serif;
  text-align: ${el.textAlign || 'center'};
  word-wrap: break-word;
  white-space: pre-wrap;
  line-height: 1.2;
}`
          break

        case 'image':
          elementCSS += `
  overflow: hidden;
  border-radius: ${el.borderRadius || '0px'};`
          if (el.borderWidth > 0) {
            elementCSS += `
  border: ${el.borderWidth}px solid ${el.borderColor};`
          }
          elementCSS += `
}

.element-${i + 1} img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}`
          break

        default:
          elementCSS += `
  background: ${el.backgroundColor};`
          if (el.borderRadius && el.borderRadius !== '0px') {
            elementCSS += `
  border-radius: ${el.borderRadius};`
          }
          if (el.borderWidth > 0) {
            elementCSS += `
  border: ${el.borderWidth}px solid ${el.borderColor};`
          }
          elementCSS += `
}`
      }

      css += elementCSS + '\n\n'
    })

    return css.trim()
  }

  const handleCopy = async () => {
    const text = activeTab === 'html' ? generateHTML() : generateCSS()
    
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
      } else {
        // Fallback for older browsers or insecure contexts
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.position = 'fixed'
        textArea.style.opacity = '0'
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
      }
      setCopied(activeTab)
      setTimeout(() => setCopied(''), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
      // Fallback: show text for manual copy
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      alert('Failed to copy automatically. Text has been selected - press Ctrl+C to copy manually.')
      document.body.removeChild(textArea)
    }
  }

  // Download all images as separate files
  const handleDownloadImages = () => {
    let imageCounter = 0
    elements.forEach((el) => {
      if (el.type === 'image' && el.imageUrl) {
        imageCounter++
        const link = document.createElement('a')
        link.download = getImageFilename(imageCounter)
        link.href = el.imageUrl
        link.click()
      }
    })
  }

  const drawPolygonPath = (ctx, type, x, y, width, height) => {
    ctx.beginPath()
    switch (type) {
      case 'triangle':
        ctx.moveTo(x + width / 2, y)
        ctx.lineTo(x + width, y + height)
        ctx.lineTo(x, y + height)
        break
      case 'pentagon': {
        const points = [[50, 0], [100, 38], [82, 100], [18, 100], [0, 38]]
        points.forEach(([px, py], i) => {
          const actualX = x + (px / 100) * width
          const actualY = y + (py / 100) * height
          i === 0 ? ctx.moveTo(actualX, actualY) : ctx.lineTo(actualX, actualY)
        })
        break
      }
      case 'hexagon': {
        const points = [[25, 0], [75, 0], [100, 50], [75, 100], [25, 100], [0, 50]]
        points.forEach(([px, py], i) => {
          const actualX = x + (px / 100) * width
          const actualY = y + (py / 100) * height
          i === 0 ? ctx.moveTo(actualX, actualY) : ctx.lineTo(actualX, actualY)
        })
        break
      }
      case 'star': {
        const points = [[50, 0], [61, 35], [98, 35], [68, 57], [79, 91], [50, 70], [21, 91], [32, 57], [2, 35], [39, 35]]
        points.forEach(([px, py], i) => {
          const actualX = x + (px / 100) * width
          const actualY = y + (py / 100) * height
          i === 0 ? ctx.moveTo(actualX, actualY) : ctx.lineTo(actualX, actualY)
        })
        break
      }
    }
    ctx.closePath()
  }

  const handleExportPNG = async () => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const imagePromises = elements
      .filter(el => el.type === 'image' && el.imageUrl)
      .map(el => {
        return new Promise((resolve) => {
          const img = new Image()
          img.crossOrigin = 'anonymous'
          img.onload = () => resolve({ id: el.id, img })
          img.onerror = () => resolve({ id: el.id, img: null })
          img.src = el.imageUrl
        })
      })

    const loadedImages = await Promise.all(imagePromises)
    const imageMap = {}
    loadedImages.forEach(({ id, img }) => {
      imageMap[id] = img
    })

    elements.forEach(el => {
      ctx.save()

      const centerX = el.x + el.width / 2
      const centerY = el.y + el.height / 2

      if (el.rotation) {
        ctx.translate(centerX, centerY)
        ctx.rotate((el.rotation * Math.PI) / 180)
        ctx.translate(-centerX, -centerY)
      }

      switch (el.type) {
        case 'text': {
          ctx.font = `${el.fontWeight} ${el.fontSize}px ${el.fontFamily || 'Arial'}`
          ctx.fillStyle = el.fontColor
          ctx.textAlign = el.textAlign || 'center'
          ctx.textBaseline = 'middle'
          
          const lines = el.text.split('\n')
          const lineHeight = el.fontSize * 1.2
          const totalHeight = lines.length * lineHeight
          const startY = centerY - totalHeight / 2 + lineHeight / 2
          
          lines.forEach((line, idx) => {
            let textX = centerX
            if (el.textAlign === 'left') textX = el.x + 5
            else if (el.textAlign === 'right') textX = el.x + el.width - 5
            ctx.fillText(line, textX, startY + idx * lineHeight)
          })
          break
        }

        case 'circle':
        case 'oval':
          ctx.fillStyle = el.backgroundColor
          ctx.beginPath()
          ctx.ellipse(centerX, centerY, el.width / 2, el.height / 2, 0, 0, 2 * Math.PI)
          ctx.fill()
          if (el.borderWidth > 0) {
            ctx.strokeStyle = el.borderColor
            ctx.lineWidth = el.borderWidth
            ctx.stroke()
          }
          break

        case 'triangle':
        case 'pentagon':
        case 'hexagon':
        case 'star':
          ctx.fillStyle = el.backgroundColor
          drawPolygonPath(ctx, el.type, el.x, el.y, el.width, el.height)
          ctx.fill()
          if (el.borderWidth > 0) {
            ctx.strokeStyle = el.borderColor
            ctx.lineWidth = el.borderWidth
            ctx.stroke()
          }
          break

        case 'rounded-rect': {
          const radius = parseInt(el.borderRadius) || 20
          ctx.fillStyle = el.backgroundColor
          ctx.beginPath()
          ctx.roundRect(el.x, el.y, el.width, el.height, radius)
          ctx.fill()
          if (el.borderWidth > 0) {
            ctx.strokeStyle = el.borderColor
            ctx.lineWidth = el.borderWidth
            ctx.stroke()
          }
          break
        }

        case 'line':
          ctx.fillStyle = el.backgroundColor
          ctx.beginPath()
          ctx.roundRect(el.x, el.y, el.width, el.height, 2)
          ctx.fill()
          break

        case 'image':
          if (imageMap[el.id]) {
            const radius = parseInt(el.borderRadius) || 0
            if (radius > 0) {
              ctx.beginPath()
              ctx.roundRect(el.x, el.y, el.width, el.height, radius)
              ctx.clip()
            }
            ctx.drawImage(imageMap[el.id], el.x, el.y, el.width, el.height)
            if (el.borderWidth > 0) {
              ctx.strokeStyle = el.borderColor
              ctx.lineWidth = el.borderWidth
              ctx.beginPath()
              ctx.roundRect(el.x, el.y, el.width, el.height, radius)
              ctx.stroke()
            }
          } else {
            ctx.fillStyle = '#f0f0f0'
            ctx.fillRect(el.x, el.y, el.width, el.height)
            ctx.fillStyle = '#999'
            ctx.font = '14px Arial'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText('No Image', centerX, centerY)
          }
          break

        default:
          ctx.fillStyle = el.backgroundColor
          const borderRadius = parseInt(el.borderRadius) || 0
          if (borderRadius > 0) {
            ctx.beginPath()
            ctx.roundRect(el.x, el.y, el.width, el.height, borderRadius)
            ctx.fill()
            if (el.borderWidth > 0) {
              ctx.strokeStyle = el.borderColor
              ctx.lineWidth = el.borderWidth
              ctx.stroke()
            }
          } else {
            ctx.fillRect(el.x, el.y, el.width, el.height)
            if (el.borderWidth > 0) {
              ctx.strokeStyle = el.borderColor
              ctx.lineWidth = el.borderWidth
              ctx.strokeRect(el.x, el.y, el.width, el.height)
            }
          }
      }

      ctx.restore()
    })

    const link = document.createElement('a')
    link.download = 'layout-export.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-tabs">
            <button className={activeTab === 'html' ? 'active' : ''} onClick={() => setActiveTab('html')}>HTML</button>
            <button className={activeTab === 'css' ? 'active' : ''} onClick={() => setActiveTab('css')}>CSS</button>
          </div>
          <div className="modal-actions">
            {hasImages && (
              <button className="download-images-btn" onClick={handleDownloadImages} title="Download all images">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Images
              </button>
            )}
            <button className="export-png-btn" onClick={handleExportPNG} title="Export as PNG">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
              PNG
            </button>
            <button className="copy-btn" onClick={handleCopy}>
              {copied === activeTab ? '✓ Copied!' : 'Copy'}
            </button>
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>
        </div>
        
        {hasImages && (
          <div className="image-notice">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <span>
              This layout uses {imageElements.length} image{imageElements.length > 1 ? 's' : ''}. 
              Click "Images" to download, then place them in the <code>images/</code> folder alongside your HTML & CSS files.
            </span>
          </div>
        )}
        
        <pre className="code-content">
          <code>{activeTab === 'html' ? generateHTML() : generateCSS()}</code>
        </pre>
      </div>
    </div>
  )
}

export default CodeModal
