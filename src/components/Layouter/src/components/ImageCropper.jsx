import { useState, useRef, useEffect } from 'react'
import { X, Check, RotateCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import './ImageCropper.css'

function ImageCropper({ file, onSave, onCancel, diameter }) {
  const [image, setImage] = useState(null)
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const canvasRef = useRef(null)
  const previewCanvasRef = useRef(null)

  useEffect(() => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        setImage(img)
        
        // Auto-fit image to canvas
        const canvas = canvasRef.current
        if (canvas) {
          const canvasSize = canvas.width
          const radius = canvasSize / 2 - 20
          const maxImageSize = radius * 2
          
          // Calculate scale to fit image within circle
          const imgAspect = img.width / img.height
          let fitWidth = maxImageSize
          let fitHeight = maxImageSize
          
          if (imgAspect > 1) {
            // Image is wider
            fitHeight = maxImageSize / imgAspect
          } else {
            // Image is taller
            fitWidth = maxImageSize * imgAspect
          }
          
          // Calculate scale to fit
          const scaleX = fitWidth / img.width
          const scaleY = fitHeight / img.height
          const initialScale = Math.min(scaleX, scaleY) * 0.9 // 90% to leave some padding
          
          setScale(initialScale)
          setPosition({ x: 0, y: 0 })
          setRotation(0)
        }
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  }, [file])

  useEffect(() => {
    if (image && canvasRef.current) {
      drawCanvas()
    }
  }, [image, scale, rotation, position])

  const drawCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Fill background with checkered pattern (transparent indicator)
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
    const radius = canvas.width / 2 - 20
    
    // Draw semi-transparent overlay outside circle
    ctx.save()
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
    
    // Save context for image drawing
    ctx.save()
    
    // Create circular clipping path
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
    ctx.clip()
    
    // Apply transformations for image
    ctx.translate(centerX + position.x, centerY + position.y)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.scale(scale, scale)
    
    // Draw image centered (preserve original colors)
    ctx.drawImage(
      image,
      -image.width / 2,
      -image.height / 2,
      image.width,
      image.height
    )
    
    ctx.restore()
    
    // Draw circle outline
    ctx.save()
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()
  }

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    
    // Calculate mouse position relative to canvas center
    const mouseX = e.clientX - rect.left - centerX
    const mouseY = e.clientY - rect.top - centerY
    
    setIsDragging(true)
    setDragStart({
      x: mouseX - position.x,
      y: mouseY - position.y
    })
  }

  const handleMouseMove = (e) => {
    if (!isDragging || !canvasRef.current) return
    
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    
    // Calculate mouse position relative to canvas center
    const mouseX = e.clientX - rect.left - centerX
    const mouseY = e.clientY - rect.top - centerY
    
    setPosition({
      x: mouseX - dragStart.x,
      y: mouseY - dragStart.y
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

  const handleSave = () => {
    const canvas = canvasRef.current
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = canvas.width / 2 - 20
    
    // Create output canvas (square, sized to diameter)
    const outputCanvas = document.createElement('canvas')
    const size = radius * 2 // Use actual radius size
    outputCanvas.width = size
    outputCanvas.height = size
    const outputCtx = outputCanvas.getContext('2d')
    
    // Clear with transparent background
    outputCtx.clearRect(0, 0, size, size)
    
    // Create circular clipping
    outputCtx.save()
    outputCtx.beginPath()
    outputCtx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
    outputCtx.clip()
    
    // Draw the image with transformations applied
    outputCtx.translate(size / 2 + position.x, size / 2 + position.y)
    outputCtx.rotate((rotation * Math.PI) / 180)
    outputCtx.scale(scale, scale)
    
    // Draw image centered (preserve original colors)
    outputCtx.drawImage(
      image,
      -image.width / 2,
      -image.height / 2,
      image.width,
      image.height
    )
    
    outputCtx.restore()
    
    // Convert to blob with transparency support
    outputCanvas.toBlob((blob) => {
      const croppedFile = new File([blob], file.name, { type: 'image/png' })
      onSave(croppedFile)
    }, 'image/png')
  }

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-4 pt-4 pb-2">
          <DialogTitle className="text-base">Crop Gambar ke Lingkaran</DialogTitle>
          <DialogDescription className="text-xs">
            Geser, zoom, dan putar gambar untuk posisi yang pas
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto px-4 pb-2">
          <div className="image-cropper-content">
            <div className="image-cropper-canvas-wrapper">
              <canvas
                ref={canvasRef}
                width={350}
                height={350}
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
                  <label className="control-label text-xs">Zoom: {Math.round(scale * 100)}%</label>
                  <input
                    type="range"
                    min="0.1"
                    max="3"
                    step="0.01"
                    value={scale}
                    onChange={handleZoomChange}
                    className="control-slider"
                  />
                </div>
              </div>
              
              <div className="control-group">
                <div className="control-row">
                  <label className="control-label text-xs">Rotasi: {rotation}°</label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRotate}
                    className="control-btn text-xs h-8"
                  >
                    <RotateCw className="w-3 h-3 mr-1" />
                    Putar 90°
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-2 px-4 pb-4 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
          >
            <X className="w-4 h-4 mr-1" />
            Batal
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
          >
            <Check className="w-4 h-4 mr-1" />
            Simpan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ImageCropper

