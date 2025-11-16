import { useState, useRef, useEffect } from 'react'
import { X, Check, RotateCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { LANYARD_COL1_WIDTH_PX, LANYARD_ROW_HEIGHT_PX } from '../utils/constants'
import './ImageCropper.css'

function LanyardRectangularCropper({ file, onSave, onCancel }) {
  const [image, setImage] = useState(null)
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const canvasRef = useRef(null)

  const cropWidth = LANYARD_COL1_WIDTH_PX  // 10cm
  const cropHeight = LANYARD_ROW_HEIGHT_PX  // 2.25cm
  const canvasWidth = Math.max(cropWidth + 40, 500)
  const canvasHeight = Math.max(cropHeight + 40, 300)

  useEffect(() => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        setImage(img)
        
        // Auto-fit image to crop area
        const imgAspect = img.width / img.height
        const cropAspect = cropWidth / cropHeight
        
        let fitWidth = cropWidth
        let fitHeight = cropHeight
        
        if (imgAspect > cropAspect) {
          // Image is wider - fit to height
          fitHeight = cropHeight
          fitWidth = cropHeight * imgAspect
        } else {
          // Image is taller - fit to width
          fitWidth = cropWidth
          fitHeight = cropWidth / imgAspect
        }
        
        const scaleX = fitWidth / img.width
        const scaleY = fitHeight / img.height
        const initialScale = Math.min(scaleX, scaleY) * 0.9 // 90% to leave some padding
        
        setScale(initialScale)
        setPosition({ x: 0, y: 0 }) // Y locked to 0 (center vertically)
        setRotation(0)
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  }, [file])

  // Calculate X position range dynamically based on image size and scale
  // This allows scrolling to the left and right edges of the image
  const calculateXRange = () => {
    if (!image) {
      return { min: -cropWidth, max: cropWidth }
    }
    
    // Calculate the scaled image width
    const scaledImageWidth = image.width * scale
    
    // If scaled image is smaller than crop width, no need to scroll
    if (scaledImageWidth <= cropWidth) {
      return { min: 0, max: 0 }
    }
    
    // Calculate how far we can move to show left edge (positive x)
    // Left edge of image should align with left edge of crop
    const maxX = (scaledImageWidth / 2) - (cropWidth / 2)
    
    // Calculate how far we can move to show right edge (negative x)
    // Right edge of image should align with right edge of crop
    const minX = -(scaledImageWidth / 2) + (cropWidth / 2)
    
    return { min: minX, max: maxX }
  }

  useEffect(() => {
    if (image && canvasRef.current) {
      drawCanvas()
    }
  }, [image, scale, rotation, position])

  // Clamp X position when scale or image changes
  useEffect(() => {
    if (image) {
      const xRange = calculateXRange()
      setPosition(prev => ({
        x: Math.max(xRange.min, Math.min(xRange.max, prev.x)),
        y: 0
      }))
    }
  }, [image, scale])

  const drawCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Fill background with checkered pattern
    const checkSize = 20
    ctx.fillStyle = '#f0f0f0'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#e0e0e0'
    for (let x = 0; x < canvas.width; x += checkSize * 2) {
      for (let y = 0; y < canvas.height; y += checkSize * 2) {
        ctx.fillRect(x, y, checkSize, checkSize)
        ctx.fillRect(x + checkSize, y + checkSize, checkSize, checkSize)
      }
    }
    
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    
    // Draw semi-transparent overlay outside rectangle
    ctx.save()
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.globalCompositeOperation = 'destination-out'
    ctx.fillRect(
      centerX - cropWidth / 2,
      centerY - cropHeight / 2,
      cropWidth,
      cropHeight
    )
    ctx.restore()
    
    // Save context for image drawing
    ctx.save()
    
    // Create rectangular clipping path
    ctx.beginPath()
    ctx.rect(
      centerX - cropWidth / 2,
      centerY - cropHeight / 2,
      cropWidth,
      cropHeight
    )
    ctx.clip()
    
    // Apply transformations for image
    ctx.translate(centerX + position.x, centerY + position.y)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.scale(scale, scale)
    
    // Draw image centered
    ctx.drawImage(
      image,
      -image.width / 2,
      -image.height / 2,
      image.width,
      image.height
    )
    
    ctx.restore()
    
    // Draw rectangle outline
    ctx.save()
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 3
    ctx.strokeRect(
      centerX - cropWidth / 2,
      centerY - cropHeight / 2,
      cropWidth,
      cropHeight
    )
    ctx.restore()
  }

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const centerX = canvas.width / 2
    
    const mouseX = e.clientX - rect.left - centerX
    
    setIsDragging(true)
    setDragStart({
      x: mouseX - position.x,
      y: 0 // Y is locked, not used
    })
  }

  const handleMouseMove = (e) => {
    if (!isDragging || !canvasRef.current) return
    
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const centerX = canvas.width / 2
    
    const mouseX = e.clientX - rect.left - centerX
    
    // Calculate new X position
    let newX = mouseX - dragStart.x
    
    // Clamp to valid range
    const xRange = calculateXRange()
    newX = Math.max(xRange.min, Math.min(xRange.max, newX))
    
    // Only update X position, Y is locked to 0 (center vertically)
    setPosition({
      x: newX,
      y: 0
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleWheel = (e) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.01 : 0.01
    setScale(prev => Math.max(0.1, Math.min(5, prev + delta)))
  }

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360)
  }

  const handleZoomChange = (e) => {
    setScale(parseFloat(e.target.value))
  }

  const handleXPositionChange = (e) => {
    setPosition({
      x: parseFloat(e.target.value),
      y: 0 // Y is always locked to 0
    })
  }

  // Get X range for slider bounds
  const xRange = calculateXRange()
  const minXOffset = xRange.min
  const maxXOffset = xRange.max

  const handleSave = () => {
    const canvas = canvasRef.current
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    
    // Create output canvas (rectangular, sized to crop dimensions)
    const outputCanvas = document.createElement('canvas')
    outputCanvas.width = cropWidth
    outputCanvas.height = cropHeight
    const outputCtx = outputCanvas.getContext('2d')
    
    // Clear with white background
    outputCtx.fillStyle = 'white'
    outputCtx.fillRect(0, 0, cropWidth, cropHeight)
    
    // Create rectangular clipping
    outputCtx.save()
    outputCtx.beginPath()
    outputCtx.rect(0, 0, cropWidth, cropHeight)
    outputCtx.clip()
    
    // Draw the image with transformations applied
    outputCtx.translate(cropWidth / 2 + position.x, cropHeight / 2 + position.y)
    outputCtx.rotate((rotation * Math.PI) / 180)
    outputCtx.scale(scale, scale)
    
    // Draw image centered
    outputCtx.drawImage(
      image,
      -image.width / 2,
      -image.height / 2,
      image.width,
      image.height
    )
    
    outputCtx.restore()
    
    // Convert to blob
    outputCanvas.toBlob((blob) => {
      const croppedFile = new File([blob], file.name, { type: 'image/png' })
      onSave(croppedFile)
    }, 'image/png')
  }

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="max-w-xl max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-4 pt-4 pb-2">
          <DialogTitle className="text-base">Crop Gambar untuk Kolom 1 (10cm x 2.25cm)</DialogTitle>
          <DialogDescription className="text-xs">
            Geser horizontal (X), zoom, dan putar gambar untuk posisi yang pas
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto px-4 pb-2">
          <div className="image-cropper-content">
            <div className="image-cropper-canvas-wrapper">
              <canvas
                ref={canvasRef}
                width={canvasWidth}
                height={canvasHeight}
                className="image-cropper-canvas"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
              />
            </div>
            
            <div className="image-cropper-controls">
              <div className="control-group">
                <div className="control-row">
                  <label className="control-label">Zoom:</label>
                  <input
                    type="range"
                    min="0.1"
                    max="5"
                    step="0.01"
                    value={scale}
                    onChange={handleZoomChange}
                    className="control-slider"
                  />
                  <span className="text-xs text-gray-600 w-12 text-right">
                    {Math.round(scale * 100)}%
                  </span>
                </div>
                
                <div className="control-row">
                  <label className="control-label">Posisi X:</label>
                  <input
                    type="range"
                    min={minXOffset}
                    max={maxXOffset}
                    step="1"
                    value={Math.max(minXOffset, Math.min(maxXOffset, position.x))}
                    onChange={handleXPositionChange}
                    className="control-slider"
                  />
                  <span className="text-xs text-gray-600 w-12 text-right">
                    {Math.round(position.x)}px
                  </span>
                </div>
                
                <div className="control-row">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRotate}
                    className="flex items-center gap-1"
                  >
                    <RotateCw className="w-3 h-3" />
                    Putar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-2 px-4 pb-4 border-t pt-3">
          <Button variant="outline" onClick={onCancel} size="sm">
            <X className="w-4 h-4 mr-1" />
            Batal
          </Button>
          <Button onClick={handleSave} size="sm">
            <Check className="w-4 h-4 mr-1" />
            Simpan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default LanyardRectangularCropper

