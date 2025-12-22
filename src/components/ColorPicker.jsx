import { useState, useRef, useEffect } from 'react'
import './ColorPicker.css'

function ColorPicker({ color, onChange, onClose }) {
  const [tab, setTab] = useState('solid')
  const [hue, setHue] = useState(0)
  const [saturation, setSaturation] = useState(100)
  const [lightness, setLightness] = useState(50)
  const [hexInput, setHexInput] = useState(color)
  const [gradientColors, setGradientColors] = useState([color, '#ffffff'])
  const [gradientAngle, setGradientAngle] = useState(90)
  
  const pickerRef = useRef(null)
  const isDragging = useRef(false)

  useEffect(() => {
    setHexInput(color)
    const rgb = hexToRgb(color)
    if (rgb) {
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
      setHue(hsl.h)
      setSaturation(hsl.s)
      setLightness(hsl.l)
    }
  }, [color])

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }

  const rgbToHsl = (r, g, b) => {
    r /= 255; g /= 255; b /= 255
    const max = Math.max(r, g, b), min = Math.min(r, g, b)
    let h, s, l = (max + min) / 2
    if (max === min) { h = s = 0 }
    else {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
        case g: h = ((b - r) / d + 2) / 6; break
        case b: h = ((r - g) / d + 4) / 6; break
        default: h = 0
      }
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
  }

  const hslToHex = (h, s, l) => {
    s /= 100; l /= 100
    const a = s * Math.min(l, 1 - l)
    const f = n => {
      const k = (n + h / 30) % 12
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
      return Math.round(255 * color).toString(16).padStart(2, '0')
    }
    return `#${f(0)}${f(8)}${f(4)}`
  }

  const handlePickerClick = (e) => {
    if (!pickerRef.current) return
    const rect = pickerRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height))
    const newS = Math.round(x * 100)
    const newL = Math.round((1 - y) * 50 + (1 - x) * (1 - y) * 50)
    setSaturation(newS)
    setLightness(newL)
    const newColor = hslToHex(hue, newS, newL)
    setHexInput(newColor)
    onChange(newColor)
  }

  const handleHueChange = (e) => {
    const newHue = Number(e.target.value)
    setHue(newHue)
    const newColor = hslToHex(newHue, saturation, lightness)
    setHexInput(newColor)
    onChange(newColor)
  }

  const handleHexChange = (e) => {
    const val = e.target.value
    setHexInput(val)
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      onChange(val)
    }
  }

  const handleGradientChange = () => {
    const gradient = `linear-gradient(${gradientAngle}deg, ${gradientColors[0]}, ${gradientColors[1]})`
    onChange(gradient)
  }

  const presetColors = ['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4']

  return (
    <div className="color-picker" onClick={(e) => e.stopPropagation()}>
      <div className="picker-tabs">
        <button className={tab === 'solid' ? 'active' : ''} onClick={() => setTab('solid')}>Solid</button>
        <button className={tab === 'gradient' ? 'active' : ''} onClick={() => setTab('gradient')}>Gradient</button>
      </div>

      {tab === 'solid' ? (
        <>
          <div 
            className="picker-area" 
            ref={pickerRef}
            style={{ background: `linear-gradient(to bottom, transparent, #000), linear-gradient(to right, #fff, hsl(${hue}, 100%, 50%))` }}
            onClick={handlePickerClick}
            onMouseDown={() => isDragging.current = true}
            onMouseUp={() => isDragging.current = false}
            onMouseMove={(e) => isDragging.current && handlePickerClick(e)}
          >
            <div 
              className="picker-cursor" 
              style={{ 
                left: `${saturation}%`, 
                top: `${100 - lightness * 2}%`,
                background: hexInput
              }}
            />
          </div>

          <input 
            type="range" 
            className="hue-slider" 
            min="0" 
            max="360" 
            value={hue} 
            onChange={handleHueChange}
          />

          <div className="hex-input">
            <div className="color-dot" style={{ background: hexInput }}></div>
            <input type="text" value={hexInput} onChange={handleHexChange} />
          </div>

          <div className="preset-colors">
            {presetColors.map(c => (
              <button 
                key={c} 
                className="preset-color" 
                style={{ background: c }}
                onClick={() => { setHexInput(c); onChange(c) }}
              />
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="gradient-preview" style={{ background: `linear-gradient(${gradientAngle}deg, ${gradientColors[0]}, ${gradientColors[1]})` }}></div>
          <div className="gradient-controls">
            <div className="gradient-color">
              <label>Color 1</label>
              <input type="color" value={gradientColors[0]} onChange={(e) => { setGradientColors([e.target.value, gradientColors[1]]); handleGradientChange() }} />
            </div>
            <div className="gradient-color">
              <label>Color 2</label>
              <input type="color" value={gradientColors[1]} onChange={(e) => { setGradientColors([gradientColors[0], e.target.value]); handleGradientChange() }} />
            </div>
          </div>
          <div className="gradient-angle">
            <label>Angle: {gradientAngle}°</label>
            <input type="range" min="0" max="360" value={gradientAngle} onChange={(e) => { setGradientAngle(Number(e.target.value)); handleGradientChange() }} />
          </div>
        </>
      )}
    </div>
  )
}

export default ColorPicker
