import { ID_CARD_WIDTH_PX, ID_CARD_HEIGHT_PX, LANYARD_COL1_WIDTH_PX, LANYARD_COL2_WIDTH_PX, LANYARD_ROW_HEIGHT_PX } from './constants'

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
 * Load and process an image for Ganci/Pin: resize to square (1:1 ratio)
 * @param {File} file - Image file
 * @param {number} sizePx - Target size in pixels (diameter)
 * @returns {Promise<HTMLImageElement>} Processed image element
 */
/**
 * Load and process an image for Lanyard Column 1: resize to 10cm x heightCm (cover mode)
 * Cover mode ensures the image fills the entire area without gaps, maintaining aspect ratio
 * @param {File} file - Image file
 * @param {number} widthPx - Target width in pixels
 * @param {number} heightPx - Target height in pixels
 * @returns {Promise<HTMLImageElement>} Processed image element
 */
export async function loadAndProcessImageLanyardCol1(file, widthPx, heightPx) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()

      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        canvas.width = widthPx
        canvas.height = heightPx

        // White background
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, widthPx, heightPx)

        // Use cover mode to fill the entire area (like Ganci images)
        // This ensures the image fills the full height without gaps
        const imgAspect = img.width / img.height
        const targetAspect = widthPx / heightPx

        let drawWidth, drawHeight, drawX, drawY

        if (imgAspect > targetAspect) {
          // Image is wider - fit to height, crop width
          drawHeight = heightPx
          drawWidth = heightPx * imgAspect
          drawX = (widthPx - drawWidth) / 2
          drawY = 0
        } else {
          // Image is taller - fit to width, crop height
          drawWidth = widthPx
          drawHeight = widthPx / imgAspect
          drawX = 0
          drawY = (heightPx - drawHeight) / 2
        }

        // Draw image centered, covering the full area
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight)

        const processedImg = new Image()
        processedImg.onload = () => resolve(processedImg)
        processedImg.onerror = reject
        processedImg.src = canvas.toDataURL()
      }

      img.onerror = reject
      img.src = e.target.result
    }

    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Load and process an image for Lanyard Column 2: resize to 90cm x 2.25cm (contain mode)
 * @param {File} file - Image file
 * @param {number} widthPx - Target width in pixels
 * @param {number} heightPx - Target height in pixels
 * @returns {Promise<HTMLImageElement>} Processed image element
 */
export async function loadAndProcessImageLanyardCol2(file, widthPx, heightPx) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()

      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        canvas.width = widthPx
        canvas.height = heightPx

        // White background
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, widthPx, heightPx)

        // Stretch image to exact dimensions (fill mode - no aspect ratio preservation)
        ctx.drawImage(img, 0, 0, widthPx, heightPx)

        const processedImg = new Image()
        processedImg.onload = () => resolve(processedImg)
        processedImg.onerror = reject
        processedImg.src = canvas.toDataURL()
      }

      img.onerror = reject
      img.src = e.target.result
    }

    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export async function loadAndProcessImageMug(file, widthPx, heightPx) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()

      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        canvas.width = widthPx
        canvas.height = heightPx

        // White background
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, widthPx, heightPx)

        // Calculate scaling to fit 20x10 cm (contain mode - auto-fit)
        const imgAspect = img.width / img.height
        const targetAspect = widthPx / heightPx // 2:1 ratio

        let drawWidth, drawHeight, drawX, drawY

        if (imgAspect > targetAspect) {
          // Image is wider - fit to width, maintain aspect ratio
          drawWidth = widthPx
          drawHeight = widthPx / imgAspect
          drawX = 0
          drawY = (heightPx - drawHeight) / 2 // Center vertically
        } else {
          // Image is taller - fit to height, maintain aspect ratio
          drawHeight = heightPx
          drawWidth = heightPx * imgAspect
          drawX = (widthPx - drawWidth) / 2 // Center horizontally
          drawY = 0
        }

        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight)

        const processedImg = new Image()
        processedImg.onload = () => resolve(processedImg)
        processedImg.onerror = reject
        processedImg.src = canvas.toDataURL()
      }

      img.onerror = reject
      img.src = e.target.result
    }

    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export async function loadAndProcessImageGanci(file, sizePx) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()

      img.onload = () => {
        // Create canvas for processing
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        // Set canvas size to square (1:1 ratio)
        canvas.width = sizePx
        canvas.height = sizePx

        // Calculate how to fit the image (cover mode - fill the square)
        const imgAspect = img.width / img.height
        let drawWidth = sizePx
        let drawHeight = sizePx
        let drawX = 0
        let drawY = 0

        if (imgAspect > 1) {
          // Image is wider - fit to height, crop width
          drawHeight = sizePx
          drawWidth = sizePx * imgAspect
          drawX = (sizePx - drawWidth) / 2
        } else {
          // Image is taller - fit to width, crop height
          drawWidth = sizePx
          drawHeight = sizePx / imgAspect
          drawY = (sizePx - drawHeight) / 2
        }

        // Draw and resize image (centered, covering the square)
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight)

        // Convert to image
        const processedImg = new Image()
        processedImg.onload = () => resolve(processedImg)
        processedImg.onerror = reject
        processedImg.src = canvas.toDataURL()
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

