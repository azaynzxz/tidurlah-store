import { ID_CARD_WIDTH_PX, ID_CARD_HEIGHT_PX } from './constants'

/**
 * Load and process an image: resize and rotate
 * @param {File} file - Image file
 * @param {number} rotationAngle - Rotation angle in degrees (90 or 270)
 * @returns {Promise<HTMLImageElement>} Processed image element
 */
export async function loadAndProcessImage(file, rotationAngle = 90) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const img = new Image()
      
      img.onload = () => {
        // Create canvas for processing
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        // Set canvas size to target dimensions
        canvas.width = ID_CARD_WIDTH_PX
        canvas.height = ID_CARD_HEIGHT_PX
        
        // Draw and resize image
        ctx.drawImage(img, 0, 0, ID_CARD_WIDTH_PX, ID_CARD_HEIGHT_PX)
        
        // Create new canvas for rotation
        const rotatedCanvas = document.createElement('canvas')
        const rotatedCtx = rotatedCanvas.getContext('2d')
        
        // Calculate rotated dimensions
        if (rotationAngle === 90 || rotationAngle === 270) {
          rotatedCanvas.width = ID_CARD_HEIGHT_PX
          rotatedCanvas.height = ID_CARD_WIDTH_PX
        } else {
          rotatedCanvas.width = ID_CARD_WIDTH_PX
          rotatedCanvas.height = ID_CARD_HEIGHT_PX
        }
        
        // Rotate
        rotatedCtx.translate(rotatedCanvas.width / 2, rotatedCanvas.height / 2)
        rotatedCtx.rotate((rotationAngle * Math.PI) / 180)
        rotatedCtx.drawImage(
          canvas,
          -ID_CARD_WIDTH_PX / 2,
          -ID_CARD_HEIGHT_PX / 2
        )
        
        // Convert to image
        const processedImg = new Image()
        processedImg.onload = () => resolve(processedImg)
        processedImg.onerror = reject
        processedImg.src = rotatedCanvas.toDataURL()
      }
      
      img.onerror = reject
      img.src = e.target.result
    }
    
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Convert image element to ImageData for PDF
 * @param {HTMLImageElement} img - Image element
 * @returns {Promise<Uint8Array>} Image data as Uint8Array
 */
export async function imageToUint8Array(img) {
  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0)
  
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      blob.arrayBuffer().then(buffer => {
        resolve(new Uint8Array(buffer))
      })
    }, 'image/png')
  })
}

