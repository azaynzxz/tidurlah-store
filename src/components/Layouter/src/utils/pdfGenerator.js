import { PDFDocument } from 'pdf-lib'
import {
  CANVAS_WIDTH_PX,
  CANVAS_HEIGHT_PX,
  BOX_COORDS,
  BORDER_GREY_WIDTH,
  BORDER_GREY_HEIGHT,
  BORDER_BLACK_WIDTH,
  BORDER_BLACK_HEIGHT,
  PAGE_NUMBER_X,
  PAGE_NUMBER_Y,
  BORDER_GREY_COLOR,
  BORDER_BLACK_COLOR,
  ID_CARD_WIDTH_PX,
  A4_WIDTH_PX,
  A4_HEIGHT_PX,
  GANCI_3CM_DIAMETER_PX,
  GANCI_5CM_DIAMETER_PX,
  GANCI_OFFSET_PX,
  MUG_WIDTH_PX,
  MUG_HEIGHT_PX,
  A4_LANDSCAPE_WIDTH_PX,
  A4_LANDSCAPE_HEIGHT_PX,
  LANYARD_PAGE_WIDTH_PX,
  LANYARD_PAGE_HEIGHT_PX,
  LANYARD_COL1_WIDTH_PX,
  LANYARD_COL2_WIDTH_PX,
  LANYARD_ROW_HEIGHT_PX,
  LANYARD_COLS,
  LANYARD_ROWS,
  MM_TO_PX,
  DPI
} from './constants'
import { loadAndProcessImage, loadAndProcessImageGanci, loadAndProcessImageMug, loadAndProcessImageLanyardCol1, loadAndProcessImageLanyardCol2, imageToUint8Array } from './imageProcessor'

/**
 * Generate Layout 1S - Single-sided layout (10 cards per page, all rotated 90°)
 */
export async function generateLayout1S(files, setProgress, customerInfo = null) {
  const pdfDoc = await PDFDocument.create()
  const totalFiles = files.length
  const totalPages = Math.ceil(totalFiles / 10)
  
  let fileIndex = 0
  
  for (let pageNum = 0; pageNum < totalPages; pageNum++) {
    const page = pdfDoc.addPage([CANVAS_WIDTH_PX, CANVAS_HEIGHT_PX])
    const { width, height } = page.getSize()
    
    // Create canvas for this page
    const canvas = document.createElement('canvas')
    canvas.width = CANVAS_WIDTH_PX
    canvas.height = CANVAS_HEIGHT_PX
    const ctx = canvas.getContext('2d')
    
    // White background
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, CANVAS_WIDTH_PX, CANVAS_HEIGHT_PX)
    
    let cardsOnPage = 0
    
    // Place up to 10 cards on this page
    for (let i = 0; i < 10 && fileIndex < totalFiles; i++) {
      const file = files[fileIndex]
      const [boxX, boxY] = BOX_COORDS[i]
      
      try {
        // Load and process image (rotate 90°)
        const processedImg = await loadAndProcessImage(file, 90)
        
        // Draw image on canvas
        ctx.drawImage(processedImg, boxX, boxY)
        
        cardsOnPage++
        fileIndex++
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error)
        fileIndex++
      }
    }
    
    // Draw borders
    drawBorders(ctx, cardsOnPage)
    
    // Draw mirrored page number on canvas
    drawMirroredPageNumberOnCanvas(ctx, pageNum + 1)
    
    // Draw tracking text if customer info provided
    if (customerInfo) {
      drawTrackingText(ctx, customerInfo, pageNum + 1, totalPages)
    }
    
    // Convert canvas to image and add to PDF
    const pageImageData = await canvasToImageData(canvas)
    const pageImage = await pdfDoc.embedPng(pageImageData)
    page.drawImage(pageImage, {
      x: 0,
      y: 0,
      width: CANVAS_WIDTH_PX,
      height: CANVAS_HEIGHT_PX,
    })
    
    setProgress(((pageNum + 1) / totalPages) * 100)
  }
  
  // Download PDF
  const pdfBytes = await pdfDoc.save()
  const filename = generateFilename(customerInfo, '1s')
  downloadPDF(pdfBytes, filename)
}

/**
 * Generate Layout 2S Sama - Double-sided same image (5 pairs per page)
 */
export async function generateLayout2SSama(files, setProgress, customerInfo = null) {
  const pdfDoc = await PDFDocument.create()
  const totalFiles = files.length
  const totalPages = Math.ceil(totalFiles / 5)
  
  let fileIndex = 0
  
  for (let pageNum = 0; pageNum < totalPages; pageNum++) {
    const page = pdfDoc.addPage([CANVAS_WIDTH_PX, CANVAS_HEIGHT_PX])
    
    const canvas = document.createElement('canvas')
    canvas.width = CANVAS_WIDTH_PX
    canvas.height = CANVAS_HEIGHT_PX
    const ctx = canvas.getContext('2d')
    
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, CANVAS_WIDTH_PX, CANVAS_HEIGHT_PX)
    
    let cardsOnPage = 0
    
    // Place up to 5 pairs (10 cards) on this page
    for (let i = 0; i < 5 && fileIndex < totalFiles; i++) {
      const file = files[fileIndex]
      const leftBox = BOX_COORDS[i * 2]
      const rightBox = BOX_COORDS[i * 2 + 1]
      
      try {
        // Left box (front): rotate -90° counterclockwise (270°)
        const leftImg = await loadAndProcessImage(file, 270)
        ctx.drawImage(leftImg, leftBox[0], leftBox[1])
        
        // Right box (back): rotate 90° clockwise (same image)
        const rightImg = await loadAndProcessImage(file, 90)
        ctx.drawImage(rightImg, rightBox[0], rightBox[1])
        
        cardsOnPage += 2
        fileIndex++
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error)
        fileIndex++
      }
    }
    
    drawBorders(ctx, cardsOnPage)
    
    // Draw mirrored page number on canvas
    drawMirroredPageNumberOnCanvas(ctx, pageNum + 1)
    
    // Draw tracking text if customer info provided
    if (customerInfo) {
      drawTrackingText(ctx, customerInfo, pageNum + 1, totalPages)
    }
    
    const pageImageData = await canvasToImageData(canvas)
    const pageImage = await pdfDoc.embedPng(pageImageData)
    page.drawImage(pageImage, {
      x: 0,
      y: 0,
      width: CANVAS_WIDTH_PX,
      height: CANVAS_HEIGHT_PX,
    })
    
    setProgress(((pageNum + 1) / totalPages) * 100)
  }
  
  const pdfBytes = await pdfDoc.save()
  const filename = generateFilename(customerInfo, '2s-sama')
  downloadPDF(pdfBytes, filename)
}

/**
 * Generate Layout Kanan Kiri Beda - Double-sided different images (5 pairs per page)
 */
export async function generateLayoutKananKiriBeda(frontFiles, backFiles, setProgress, customerInfo = null) {
  const pdfDoc = await PDFDocument.create()
  const totalFrontFiles = frontFiles.length
  const totalPages = Math.ceil(totalFrontFiles / 5)
  
  // Sort front files alphabetically
  const sortedFrontFiles = [...frontFiles].sort((a, b) => a.name.localeCompare(b.name))
  // Use backFiles in the order provided (user can reorder them via UI)
  const orderedBackFiles = [...backFiles]
  
  // If only one back file, reuse it for all
  const hasSingleBackFile = orderedBackFiles.length === 1
  let singleBackImage = null
  if (hasSingleBackFile) {
    singleBackImage = await loadAndProcessImage(orderedBackFiles[0], 90)  // Back: 90° clockwise
  }
  
  let frontIndex = 0
  let backIndex = 0
  
  for (let pageNum = 0; pageNum < totalPages; pageNum++) {
    const page = pdfDoc.addPage([CANVAS_WIDTH_PX, CANVAS_HEIGHT_PX])
    
    const canvas = document.createElement('canvas')
    canvas.width = CANVAS_WIDTH_PX
    canvas.height = CANVAS_HEIGHT_PX
    const ctx = canvas.getContext('2d')
    
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, CANVAS_WIDTH_PX, CANVAS_HEIGHT_PX)
    
    let cardsOnPage = 0
    
    // Place up to 5 pairs (10 cards) on this page
    for (let i = 0; i < 5 && frontIndex < totalFrontFiles; i++) {
      const frontFile = sortedFrontFiles[frontIndex]
      const leftBox = BOX_COORDS[i * 2]
      const rightBox = BOX_COORDS[i * 2 + 1]
      
      try {
        // Front (left): rotate -90° counterclockwise (270°)
        const frontImg = await loadAndProcessImage(frontFile, 270)
        ctx.drawImage(frontImg, leftBox[0], leftBox[1])
        
        // Back (right): rotate 90° clockwise
        if (hasSingleBackFile && singleBackImage) {
          ctx.drawImage(singleBackImage, rightBox[0], rightBox[1])
        } else if (backIndex < orderedBackFiles.length) {
          const backImg = await loadAndProcessImage(orderedBackFiles[backIndex], 90)
          ctx.drawImage(backImg, rightBox[0], rightBox[1])
          backIndex++
        }
        
        cardsOnPage += 2
        frontIndex++
      } catch (error) {
        console.error(`Error processing file ${frontFile.name}:`, error)
        frontIndex++
        if (!hasSingleBackFile) backIndex++
      }
    }
    
    drawBorders(ctx, cardsOnPage)
    
    // Draw mirrored page number on canvas
    drawMirroredPageNumberOnCanvas(ctx, pageNum + 1)
    
    // Draw tracking text if customer info provided
    if (customerInfo) {
      drawTrackingText(ctx, customerInfo, pageNum + 1, totalPages)
    }
    
    const pageImageData = await canvasToImageData(canvas)
    const pageImage = await pdfDoc.embedPng(pageImageData)
    page.drawImage(pageImage, {
      x: 0,
      y: 0,
      width: CANVAS_WIDTH_PX,
      height: CANVAS_HEIGHT_PX,
    })
    
    setProgress(((pageNum + 1) / totalPages) * 100)
  }
  
  const pdfBytes = await pdfDoc.save()
  const filename = generateFilename(customerInfo, 'kanan-kiri-beda')
  downloadPDF(pdfBytes, filename)
}

/**
 * Generate Layout Ganci/Pin - Circular images in grid layout
 * @param {File[]} files - Image files to process
 * @param {Function} setProgress - Progress callback
 * @param {Object} customerInfo - Customer information
 * @param {number} diameterCm - Diameter in cm (3 or 5)
 */
export async function generateLayoutGanciPin(files, setProgress, customerInfo = null, diameterCm = 3) {
  const pdfDoc = await PDFDocument.create()
  const totalFiles = files.length
  
  // Grid configuration based on diameter
  const is3cm = diameterCm === 3
  const diameterPx = is3cm ? GANCI_3CM_DIAMETER_PX : GANCI_5CM_DIAMETER_PX
  const radiusPx = diameterPx / 2
  const offsetRadiusPx = radiusPx + GANCI_OFFSET_PX
  
  // Grid: 4x5 for 3cm, 3x5 for 5cm
  const cols = is3cm ? 4 : 3
  const rows = 5
  const itemsPerPage = cols * rows
  
  // Calculate cell dimensions
  const cellWidth = A4_WIDTH_PX / cols
  const cellHeight = A4_HEIGHT_PX / rows
  
  // Total pages = one page per file (each file fills entire page)
  const totalPages = totalFiles
  
  // Process each file - each file gets its own page filled with copies
  for (let fileIndex = 0; fileIndex < totalFiles; fileIndex++) {
    const file = files[fileIndex]
    const page = pdfDoc.addPage([A4_WIDTH_PX, A4_HEIGHT_PX])
    
    // Create canvas for this page
    const canvas = document.createElement('canvas')
    canvas.width = A4_WIDTH_PX
    canvas.height = A4_HEIGHT_PX
    const ctx = canvas.getContext('2d')
    
    // White background
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, A4_WIDTH_PX, A4_HEIGHT_PX)
    
    // Load and cache the image once per page
    let img = null
    try {
      img = await loadAndProcessImageGanci(file, diameterPx)
    } catch (error) {
      console.error(`Error processing file ${file.name}:`, error)
      continue // Skip this file and move to next
    }
    
    // Fill entire grid with the same image
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        try {
          // Calculate center position of the cell
          const centerX = (col + 0.5) * cellWidth
          const centerY = (row + 0.5) * cellHeight
          
          // Create circular clipping path
          ctx.save()
          ctx.beginPath()
          ctx.arc(centerX, centerY, radiusPx, 0, Math.PI * 2)
          ctx.clip()
          
          // Draw image centered in circle (1:1 ratio)
          const imgSize = diameterPx
          const imgX = centerX - imgSize / 2
          const imgY = centerY - imgSize / 2
          ctx.drawImage(img, imgX, imgY, imgSize, imgSize)
          
          ctx.restore()
          
          // Draw offset circle line (0.5cm offset, thin grey line)
          ctx.save()
          ctx.strokeStyle = '#808080' // Grey color
          ctx.lineWidth = 1 // Thin line
          ctx.beginPath()
          ctx.arc(centerX, centerY, offsetRadiusPx, 0, Math.PI * 2)
          ctx.stroke()
          ctx.restore()
        } catch (error) {
          console.error(`Error drawing image at row ${row}, col ${col}:`, error)
        }
      }
    }
    
    // Draw page number
    drawPageNumberOnCanvas(ctx, fileIndex + 1, A4_WIDTH_PX, A4_HEIGHT_PX)
    
    // Draw tracking text if customer info provided
    if (customerInfo) {
      drawTrackingTextGanci(ctx, customerInfo, fileIndex + 1, totalPages, A4_WIDTH_PX, A4_HEIGHT_PX)
    }
    
    // Convert canvas to image and add to PDF
    const pageImageData = await canvasToImageData(canvas)
    const pageImage = await pdfDoc.embedPng(pageImageData)
    page.drawImage(pageImage, {
      x: 0,
      y: 0,
      width: A4_WIDTH_PX,
      height: A4_HEIGHT_PX,
    })
    
    setProgress(((fileIndex + 1) / totalPages) * 100)
  }
  
  // Download PDF
  const pdfBytes = await pdfDoc.save()
  const filename = generateFilename(customerInfo, `ganci-pin-${diameterCm}cm`)
  downloadPDF(pdfBytes, filename)
}

/**
 * Generate Layout Mug - A4 landscape, images rotated 90°
 * Images: 20x10 cm horizontal, rotated 90° to become 10x20 cm vertical
 * PDF: A4 landscape (297mm x 210mm), height auto-adjusts up to 1m
 * @param {File[]} files - Array of image files
 * @param {number[]} quantities - Array of quantities for each file
 * @param {Function} setProgress - Progress callback
 * @param {Object} customerInfo - Customer information
 */
export async function generateLayoutMug(files, quantities, setProgress, customerInfo = null) {
  const pdfDoc = await PDFDocument.create()
  
  // Mug image dimensions (20x10 cm horizontal)
  // Original: 20cm wide x 10cm tall
  // After 90° rotation: 10cm wide x 20cm tall
  const originalWidthPx = MUG_WIDTH_PX   // 2362px (20cm - original width)
  const originalHeightPx = MUG_HEIGHT_PX  // 1181px (10cm - original height)
  
  // After rotation dimensions (what we'll see)
  const rotatedWidthPx = originalHeightPx   // 1181px (10cm - becomes width after rotation)
  const rotatedHeightPx = originalWidthPx  // 2362px (20cm - becomes height after rotation)
  
  // Page dimensions
  // Height: Fixed at 21cm (A4 landscape height)
  const pageHeight = A4_LANDSCAPE_HEIGHT_PX  // 2480px (210mm = 21cm)
  // Width: Will be calculated based on number of rows, max 90cm
  const maxPageWidth = MM_TO_PX(900)  // 10630px (900mm = 90cm maximum)
  const minPageWidth = A4_LANDSCAPE_WIDTH_PX  // 3508px (297mm = A4 landscape width minimum)
  
  // Layout: 3 columns horizontally (right to left) per row
  const columnsPerRow = 3
  const rightMarginPx = MM_TO_PX(10)  // 118px (10mm)
  const columnSpacingPx = MM_TO_PX(5)  // 59px (5mm spacing between columns)
  const rowSpacingPx = MM_TO_PX(5)  // 59px (5mm spacing between rows)
  
  // Border width (thin grey line)
  const borderWidth = 2
  
  // Spacing between images within a column (vertical gap)
  const imageSpacingPx = MM_TO_PX(5)  // 59px (5mm spacing)
  
  // Calculate max images per page: 8 images max (90cm page)
  const maxImagesPerPage = 8
  
  // Build flat list of all images to layout
  const imagesToLayout = []
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const quantity = quantities[i] || 1
    for (let q = 0; q < quantity; q++) {
      imagesToLayout.push({ file, fileIndex: i })
    }
  }
  
  const totalImages = imagesToLayout.length
  
  // Process pages: distribute different files across columns first
  // Each page gets up to 3 different files (one per column)
  // All copies of each file stack vertically in their column
  let processedImages = 0
  let totalPages = 0
  
  while (processedImages < totalImages) {
    totalPages++
    const pageIndex = totalPages - 1
    
    // Get images for this page
    const startIndex = processedImages
    const remainingImages = totalImages - processedImages
    const imagesThisPage = Math.min(maxImagesPerPage, remainingImages)
    const pageImages = imagesToLayout.slice(startIndex, startIndex + imagesThisPage)
    
    processedImages += imagesThisPage
    
    // Determine page size
    let pageWidth, pageHeight
    
    if (pageImages.length < 3) {
      // Use A4 horizontal size if less than 3 images
      pageWidth = A4_LANDSCAPE_WIDTH_PX  // 3508px (297mm)
      pageHeight = A4_LANDSCAPE_HEIGHT_PX  // 2480px (210mm)
    } else {
      // Calculate page width based on number of images
      // Page height is fixed at 21cm, width extends horizontally
      const calculatedWidth = pageImages.length * (rotatedWidthPx + columnSpacingPx) - columnSpacingPx + MM_TO_PX(20) // Add 20mm padding
      pageWidth = Math.min(calculatedWidth, maxPageWidth)
      pageHeight = A4_LANDSCAPE_HEIGHT_PX  // 2480px (210mm = 21cm)
    }
    
    const page = pdfDoc.addPage([pageWidth, pageHeight])
    
    // Create canvas for this page
    const canvas = document.createElement('canvas')
    canvas.width = pageWidth
    canvas.height = pageHeight
    const ctx = canvas.getContext('2d')
    
    // White background
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, pageWidth, pageHeight)
    
    // Cache loaded images to avoid reloading the same file multiple times
    const imageCache = new Map()
    
    // Calculate image positions (right to left, single row)
    const totalImagesWidth = pageImages.length * (rotatedWidthPx + columnSpacingPx) - columnSpacingPx
    const startX = pageWidth - rightMarginPx - totalImagesWidth  // Start from right
    
    // Draw each image (right to left, single row)
    for (let imgIndex = 0; imgIndex < pageImages.length; imgIndex++) {
      const { file } = pageImages[imgIndex]
      
      // Load image (use cache if already loaded)
      let img = imageCache.get(file.name)
      if (!img) {
        try {
          img = await loadAndProcessImageMug(file, originalWidthPx, originalHeightPx)
          imageCache.set(file.name, img)
        } catch (error) {
          console.error(`Error processing file ${file.name}:`, error)
          continue // Skip this image and move to next
        }
      }
      
      // Calculate X position for this image (right to left)
      // Image 0 is rightmost, image 1 is to its left, etc.
      const imageX = startX + (pageImages.length - 1 - imgIndex) * (rotatedWidthPx + columnSpacingPx)
      
      // Calculate Y position (centered vertically)
      const imageY = (pageHeight - rotatedHeightPx) / 2
      
      // Draw image rotated 90 degrees clockwise
      ctx.save()
      
      // Translate to position
      const rotationCenterX = imageX + rotatedWidthPx / 2
      const rotationCenterY = imageY + rotatedHeightPx / 2
      ctx.translate(rotationCenterX, rotationCenterY)
      
      // Rotate 90 degrees clockwise (Math.PI / 2)
      ctx.rotate(Math.PI / 2)
      
      // Draw image centered at origin with ORIGINAL dimensions
      ctx.drawImage(
        img,
        -originalWidthPx / 2,
        -originalHeightPx / 2,
        originalWidthPx,
        originalHeightPx
      )
      
      ctx.restore()
      
      // Draw grey border around rotated image
      ctx.save()
      ctx.strokeStyle = '#808080' // Grey color
      ctx.lineWidth = borderWidth
      ctx.strokeRect(
        imageX - borderWidth / 2,
        imageY - borderWidth / 2,
        rotatedWidthPx + borderWidth,
        rotatedHeightPx + borderWidth
      )
      ctx.restore()
    }
    
    // Draw page number
    drawPageNumberOnCanvas(ctx, pageIndex + 1, pageWidth, pageHeight)
    
    // Draw tracking text if customer info provided
    if (customerInfo) {
      drawTrackingTextMug(ctx, customerInfo, pageIndex + 1, totalPages, pageWidth, pageHeight)
    }
    
    // Convert canvas to image and add to PDF
    const pageImageData = await canvasToImageData(canvas)
    const pageImage = await pdfDoc.embedPng(pageImageData)
    page.drawImage(pageImage, {
      x: 0,
      y: 0,
      width: pageWidth,
      height: pageHeight,
    })
    
    setProgress((processedImages / totalImages) * 100)
  }
  
  // Download PDF
  const pdfBytes = await pdfDoc.save()
  const filename = generateFilename(customerInfo, 'mug')
  downloadPDF(pdfBytes, filename)
}

/**
 * Draw page number on canvas (for Ganci/Pin layout)
 */
function drawPageNumberOnCanvas(ctx, pageNum, width, height) {
  const text = pageNum.toString()
  const fontSize = 24
  const x = width / 2
  const y = height - 30
  
  ctx.save()
  ctx.font = `${fontSize}px Helvetica`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = 'black'
  ctx.fillText(text, x, y)
  ctx.restore()
}

/**
 * Draw page number on canvas for Lanyard layout (bottom left)
 */
function drawPageNumberOnCanvasLanyard(ctx, pageNum, width, height) {
  const text = pageNum.toString()
  const fontSize = 24
  const x = 30 // Left side with margin
  const y = height - 30 // Bottom
  
  ctx.save()
  ctx.font = `${fontSize}px Helvetica`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = 'black'
  ctx.fillText(text, x, y)
  ctx.restore()
}

/**
 * Draw tracking text for Mug layout
 * Format: {Customer Name} | {Instansi} | {Time the layout Generated}
 * Consistent styling across all layouts
 */
function drawTrackingTextMug(ctx, customerInfo, pageNum, totalPages, width, height) {
  const fontSize = 16
  const timestamp = new Date().toLocaleString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
  const text = `${customerInfo.name} | ${customerInfo.instansi} | ${timestamp}`
  
  // Position at bottom-left (same as regular layouts)
  const x = 20
  const y = height - 15
  
  ctx.save()
  ctx.font = `bold ${fontSize}px Arial`
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'bottom'
  ctx.fillText(text, x, y)
  ctx.restore()
}

/**
 * Draw tracking text for Ganci/Pin layout
 * Rotated 90 degrees at middle-right of page
 */
function drawTrackingTextGanci(ctx, customerInfo, pageNum, totalPages, width, height) {
  const fontSize = 16
  const timestamp = new Date().toLocaleString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
  const text = `${customerInfo.name} | ${customerInfo.instansi} | ${timestamp}`
  
  // Position at middle-right of page
  const x = width - 30 // 30px from right edge (increased for larger text)
  const y = height / 2 // Middle of page vertically
  
  ctx.save()
  ctx.font = `bold ${fontSize}px Arial`
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  
  // Translate to position and rotate 90 degrees
  ctx.translate(x, y)
  ctx.rotate(-Math.PI / 2) // Rotate -90 degrees (counter-clockwise)
  
  ctx.fillText(text, 0, 0)
  ctx.restore()
}

/**
 * Draw borders around ID cards
 */
function drawBorders(ctx, numCards) {
  for (let i = 0; i < numCards; i++) {
    const [boxX, boxY] = BOX_COORDS[i]
    
    // Grey border (1016px × 661px)
    ctx.strokeStyle = `rgb(${BORDER_GREY_COLOR[0] * 255}, ${BORDER_GREY_COLOR[1] * 255}, ${BORDER_GREY_COLOR[2] * 255})`
    ctx.lineWidth = 2
    ctx.strokeRect(boxX, boxY, BORDER_GREY_WIDTH, BORDER_GREY_HEIGHT)
    
    // Black border (1126px × 661px) - centered around grey border
    const blackBorderX = boxX - (BORDER_BLACK_WIDTH - BORDER_GREY_WIDTH) / 2
    ctx.strokeStyle = 'black'
    ctx.lineWidth = 2
    ctx.strokeRect(blackBorderX, boxY, BORDER_BLACK_WIDTH, BORDER_BLACK_HEIGHT)
  }
}

/**
 * Draw mirrored page number on canvas
 */
function drawMirroredPageNumberOnCanvas(ctx, pageNum) {
  const text = pageNum.toString()
  const fontSize = 35
  const x = PAGE_NUMBER_X
  const y = PAGE_NUMBER_Y
  
  ctx.save()
  
  // Set font to measure text width
  ctx.font = `${fontSize}px Helvetica`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  
  // Measure text width
  const metrics = ctx.measureText(text)
  const textWidth = metrics.width
  const padding = 10
  const bgWidth = textWidth + (padding * 2)
  const bgHeight = fontSize + (padding * 2)
  
  // Draw white background rectangle
  ctx.fillStyle = 'white'
  ctx.fillRect(x - bgWidth / 2, y - bgHeight / 2, bgWidth, bgHeight)
  
  // Draw black text
  ctx.fillStyle = 'black'
  ctx.translate(x, y)
  ctx.scale(-1, 1)  // Mirror horizontally
  ctx.fillText(text, 0, 0)
  
  ctx.restore()
}

/**
 * Convert canvas to PNG image data
 */
async function canvasToImageData(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to convert canvas to blob'))
        return
      }
      blob.arrayBuffer().then(buffer => {
        resolve(new Uint8Array(buffer))
      }).catch(err => {
        reject(new Error('Failed to convert blob to array buffer: ' + err.message))
      })
    }, 'image/png')
  })
}

/**
 * Draw tracking text on canvas
 * Format: {Customer Name} | {Instansi} | {Time the layout Generated}
 * Consistent styling across all layouts
 */
function drawTrackingText(ctx, customerInfo, pageNum, totalPages) {
  const fontSize = 16
  const timestamp = new Date().toLocaleString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
  const text = `${customerInfo.name} | ${customerInfo.instansi} | ${timestamp}`
  const x = 20
  const y = CANVAS_HEIGHT_PX - 15
  
  ctx.save()
  ctx.font = `bold ${fontSize}px Arial`
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'bottom'
  ctx.fillText(text, x, y)
  ctx.restore()
}

/**
 * Generate filename with customer info and timestamp
 */
function generateFilename(customerInfo, layoutType) {
  if (!customerInfo) {
    return `id-card-layout-${layoutType}.pdf`
  }
  
  const now = new Date()
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
  const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '')
  const timestamp = `${dateStr}_${timeStr}`
  
  const name = customerInfo.name.replace(/[^a-zA-Z0-9]/g, '_')
  const instansi = customerInfo.instansi.replace(/[^a-zA-Z0-9]/g, '_')
  
  return `${name}_${instansi}_${timestamp}.pdf`
}

/**
 * Generate Layout Lanyard - 2 columns x 8 rows
 * Page: 1020mm width x 210mm height
 * Column 1: 10cm x 2.25cm (cropped image)
 * Column 2: 90cm x 2.25cm (original image)
 * @param {Array} files - Array of { original: File, cropped: File }
 * @param {Array} quantities - Array of quantities for each file
 * @param {Function} setProgress - Progress callback
 * @param {Object} customerInfo - Customer information
 * @param {string} printingSide - '1-side' or '2-side' printing
 */
export async function generateLayoutLanyard(files, quantities, setProgress, customerInfo = null, printingSide = '1-side') {
  const pdfDoc = await PDFDocument.create()
  
  // Calculate total images across all files
  let totalImages = 0
  for (let i = 0; i < files.length; i++) {
    totalImages += quantities[i] || 1
  }
  
  // Use lower DPI for canvas rendering to avoid browser limits (150 DPI instead of 300)
  const CANVAS_DPI = 150
  const CANVAS_SCALE = CANVAS_DPI / DPI
  
  // Page dimensions in mm
  const pageWidthMM = 1020  // 1020mm = 102cm
  const pageHeightMM = 210   // 210mm = 21cm
  
  // Convert mm to PDF points
  const pageWidthPoints = (pageWidthMM * 72) / 25.4   // ~2,891 points
  const pageHeightPoints = (pageHeightMM * 72) / 25.4  // ~595 points
  
  // Page dimensions in pixels at 300 DPI
  const pageWidthPx = Math.round((pageWidthMM * DPI) / 25.4)  // ~12,047px
  const pageHeightPx = Math.round((pageHeightMM * DPI) / 25.4)  // ~2,480px
  
  // Canvas dimensions (150 DPI)
  const canvasWidth = Math.round(pageWidthPx * CANVAS_SCALE)  // ~6,024px
  const canvasHeight = Math.round(pageHeightPx * CANVAS_SCALE)  // ~1,240px
  
  // Column dimensions in mm
  const col1WidthMM = 100   // 10cm = 100mm
  const col2WidthMM = 900   // 90cm = 900mm
  const rowHeightMM = 22.5  // 2.25cm = 22.5mm
  
  // Column dimensions (scaled for canvas at 150 DPI)
  const col1Width = Math.round((col1WidthMM * CANVAS_DPI) / 25.4)  // ~591px
  const col2Width = Math.round((col2WidthMM * CANVAS_DPI) / 25.4)  // ~5,315px
  const rowHeight = Math.round((rowHeightMM * CANVAS_DPI) / 25.4)  // ~133px
  
  // Spacing (scaled for canvas)
  const columnSpacing = Math.round(MM_TO_PX(5) * CANVAS_SCALE)  // ~30px
  const rowSpacing = Math.round(MM_TO_PX(3) * CANVAS_SCALE)  // ~18px (increased from 2mm to 3mm)
  const topMargin = Math.round(MM_TO_PX(5) * CANVAS_SCALE)  // ~30px
  const leftMargin = Math.round(MM_TO_PX(5) * CANVAS_SCALE)  // ~30px
  
  // Use original column widths
  const finalCol1Width = col1Width
  const finalCol2Width = col2Width
  const finalColumnSpacing = columnSpacing
  
  const rowsPerPage = 8 // 8 rows per page (each row = 2 columns = 2 images)
  const imagesPerRow = 2 // Column 1 + Column 2
  
  let pageIndex = 0
  let totalPagesCreated = 0
  
  // Helper function to draw a single row
  const drawRow = async (ctx, fileItem, rowIndex, imageCache) => {
    const { original, cropped } = fileItem
    const rowY = topMargin + rowIndex * (rowHeight + rowSpacing)
    
    // Column 1: Draw cropped image (use adjusted width)
    let col1Img = imageCache.get(`col1_${cropped.name}_${finalCol1Width}`)
    if (!col1Img) {
      try {
        col1Img = await loadAndProcessImageLanyardCol1(cropped, finalCol1Width, rowHeight)
        imageCache.set(`col1_${cropped.name}_${finalCol1Width}`, col1Img)
      } catch (error) {
        console.error(`Error processing cropped file ${cropped.name}:`, error)
        return false
      }
    }
    
    if (col1Img) {
      const col1X = leftMargin
      ctx.drawImage(col1Img, col1X, rowY, finalCol1Width, rowHeight)
      
      // Draw thin grey border around column 1
      ctx.save()
      ctx.strokeStyle = '#808080' // Grey color
      ctx.lineWidth = 1 // Thin line
      ctx.strokeRect(col1X, rowY, finalCol1Width, rowHeight)
      ctx.restore()
    }
    
    // Column 2: Draw original image (use adjusted width)
    let col2Img = imageCache.get(`col2_${original.name}_${finalCol2Width}`)
    if (!col2Img) {
      try {
        col2Img = await loadAndProcessImageLanyardCol2(original, finalCol2Width, rowHeight)
        imageCache.set(`col2_${original.name}_${finalCol2Width}`, col2Img)
      } catch (error) {
        console.error(`Error processing original file ${original.name}:`, error)
        return false
      }
    }
    
    if (col2Img) {
      const col2X = leftMargin + finalCol1Width + finalColumnSpacing
      ctx.drawImage(col2Img, col2X, rowY, finalCol2Width, rowHeight)
      
      // Draw thin grey border around column 2
      ctx.save()
      ctx.strokeStyle = '#808080' // Grey color
      ctx.lineWidth = 1 // Thin line
      ctx.strokeRect(col2X, rowY, finalCol2Width, rowHeight)
      ctx.restore()
    }
    
    return true
  }
  
  // Helper function to draw combined info (print times, customer info, timestamp, page number) in one row, rotated 90 degrees, right side
  const drawCombinedInfo = (ctx, pageNum, totalPages, printCount, customerInfo, width, height) => {
    const fontSize = 16
    const printText = `Print ${printCount} X`
    const pageText = `${pageNum}`
    
    const timestamp = new Date().toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
    
    // Combine all text with separators: Print X Kali | Customer Name | Instansi | Timestamp | Page Number
    const combinedText = `${printText} | ${customerInfo.name} | ${customerInfo.instansi} | ${timestamp} | ${pageText}`
    
    const x = width - 30 // Right side with smaller margin (shifted right to avoid overlap)
    const y = height / 2 // Vertically centered
    
    ctx.save()
    ctx.font = `bold ${fontSize}px Arial`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    
    // Measure text to calculate background size
    const metrics = ctx.measureText(combinedText)
    const padding = 10
    const textWidth = metrics.width
    const textHeight = fontSize
    
    // Translate to rotation point (right side, middle)
    ctx.translate(x, y)
    ctx.rotate(Math.PI / 2) // Rotate 90 degrees clockwise
    
    // Draw white background for better visibility (rotated)
    ctx.fillStyle = 'white'
    ctx.fillRect(
      -textWidth / 2 - padding,
      -textHeight / 2 - padding,
      textWidth + padding * 2,
      textHeight + padding * 2
    )
    
    // Draw text (rotated)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
    ctx.fillText(combinedText, 0, 0)
    
    ctx.restore()
  }
  
  // Build array of leftover rows from all images
  const leftoverRows = []
  let templatePageCount = 0
  
  // Store print counts for each image's template page
  const templatePrintCounts = []
  
  // First pass: collect leftover rows and count template pages
  for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
    const quantity = quantities[fileIndex] || 1
    const totalRowsForThisImage = Math.ceil(quantity / imagesPerRow)
    const fullPagesForThisImage = Math.floor(totalRowsForThisImage / rowsPerPage)
    const remainingRowsForThisImage = totalRowsForThisImage % rowsPerPage
    
    if (fullPagesForThisImage > 0) {
      templatePageCount++
      templatePrintCounts.push(fullPagesForThisImage)
    } else {
      templatePrintCounts.push(0)
    }
    
    if (remainingRowsForThisImage > 0) {
      for (let row = 0; row < remainingRowsForThisImage; row++) {
        leftoverRows.push({
          fileItem: files[fileIndex],
          fileIndex
        })
      }
    }
  }
  
  // Calculate leftover pages
  const leftoverPages = Math.ceil(leftoverRows.length / rowsPerPage)
  const totalPages = templatePageCount + leftoverPages
  
  // Second pass: create template pages
  let templatePageIdx = 0
  for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
    const fileItem = files[fileIndex]
    const quantity = quantities[fileIndex] || 1
    
    // Calculate pages needed for this image
    const totalRowsForThisImage = Math.ceil(quantity / imagesPerRow)
    const fullPagesForThisImage = Math.floor(totalRowsForThisImage / rowsPerPage)
    const remainingRowsForThisImage = totalRowsForThisImage % rowsPerPage
    
    // Create template page for full pages if any
    if (fullPagesForThisImage > 0) {
      const page = pdfDoc.addPage([pageWidthPoints, pageHeightPoints])
      const canvas = document.createElement('canvas')
      canvas.width = canvasWidth
      canvas.height = canvasHeight
      const ctx = canvas.getContext('2d')
      
      // White background
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, canvasWidth, canvasHeight)
      
      const imageCache = new Map()
      
      // Fill all 8 rows with this image
      for (let rowIndex = 0; rowIndex < 8; rowIndex++) {
        await drawRow(ctx, fileItem, rowIndex, imageCache)
      }
      
      // Draw combined info
      if (customerInfo) {
        // Calculate print count: how many times this template page needs to be printed
        // For 1-side: print count = fullPagesForThisImage * 2
        // For 2-side: print count = fullPagesForThisImage * 2 * 2
        let printCount = fullPagesForThisImage * 2
        if (printingSide === '2-side') {
          printCount = fullPagesForThisImage * 2 * 2 // Double for 2-side
        }
        drawCombinedInfo(ctx, pageIndex + 1, totalPages, printCount, customerInfo, canvasWidth, canvasHeight)
      }
      
      templatePageIdx++
      
      // Draw page number
      drawPageNumberOnCanvasLanyard(ctx, pageIndex + 1, canvasWidth, canvasHeight)
      
      // Convert to PDF
      const pageImageData = await canvasToImageData(canvas)
      const pageImage = await pdfDoc.embedPng(pageImageData)
      page.drawImage(pageImage, {
        x: 0,
        y: 0,
        width: pageWidthPoints,
        height: pageHeightPoints,
      })
      
      pageIndex++
      setProgress((pageIndex / totalPages) * 100)
    }
  }
  
  // Combine leftover rows efficiently into pages
  if (leftoverRows.length > 0) {
    for (let leftoverPageNum = 0; leftoverPageNum < leftoverPages; leftoverPageNum++) {
      const page = pdfDoc.addPage([pageWidthPoints, pageHeightPoints])
      const canvas = document.createElement('canvas')
      canvas.width = canvasWidth
      canvas.height = canvasHeight
      const ctx = canvas.getContext('2d')
      
      // White background
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, canvasWidth, canvasHeight)
      
      const imageCache = new Map()
      
      // Get rows for this leftover page
      const startRow = leftoverPageNum * rowsPerPage
      const endRow = Math.min(startRow + rowsPerPage, leftoverRows.length)
      let pageRows = leftoverRows.slice(startRow, endRow)
      
      // For 2-side printing, duplicate rows to fill the page (maximize page usage)
      if (printingSide === '2-side' && pageRows.length > 0 && pageRows.length < rowsPerPage) {
        // Duplicate rows to fill up to 8 rows
        const rowsToAdd = rowsPerPage - pageRows.length
        const duplicatedRows = []
        for (let i = 0; i < rowsToAdd; i++) {
          // Cycle through existing rows to duplicate
          duplicatedRows.push(pageRows[i % pageRows.length])
        }
        pageRows = [...pageRows, ...duplicatedRows]
      }
      
      // Calculate print count for leftover page
      // Group rows by file to determine print count
      const rowsByFile = new Map()
      for (const row of pageRows) {
        if (!rowsByFile.has(row.fileIndex)) {
          rowsByFile.set(row.fileIndex, [])
        }
        rowsByFile.get(row.fileIndex).push(row)
      }
      
      // Calculate print count: how many times this leftover page needs to be printed
      let leftoverPrintCount = 1
      
      if (printingSide === '1-side') {
        // For 1-side: calculate based on how many leftover pages each file needs
        for (const [fileIdx, rows] of rowsByFile.entries()) {
          const quantity = quantities[fileIdx] || 1
          const totalRowsForFile = Math.ceil(quantity / imagesPerRow)
          const fullPagesForFile = Math.floor(totalRowsForFile / rowsPerPage)
          const remainingRowsForFile = totalRowsForFile % rowsPerPage
          
          if (remainingRowsForFile > 0) {
            // Count how many leftover rows this file has across all leftover pages
            const fileLeftoverRows = []
            for (let i = 0; i < leftoverRows.length; i++) {
              if (leftoverRows[i].fileIndex === fileIdx) {
                fileLeftoverRows.push(leftoverRows[i])
              }
            }
            
            // Check if this leftover page contains all remaining rows for this file
            const allFileRowsInThisPage = fileLeftoverRows.length === rows.length
            
            if (allFileRowsInThisPage) {
              // This leftover page contains all remaining rows for this file
              // Calculate how many times we need to print this leftover page
              // Since each row represents 2 images, and we have remainingRowsForFile rows
              // We need to print this page enough times to fulfill the remaining quantity
              const remainingQuantity = quantity - (fullPagesForFile * rowsPerPage * imagesPerRow)
              const rowsNeeded = Math.ceil(remainingQuantity / imagesPerRow)
              // Print count should be doubled (same as template pages)
              const printCountForThisFile = Math.ceil(rowsNeeded / remainingRowsForFile) * 2
              leftoverPrintCount = Math.max(leftoverPrintCount, printCountForThisFile)
            } else {
              // Multiple leftover pages for this file, this one prints once
              leftoverPrintCount = Math.max(leftoverPrintCount, 1)
            }
          }
        }
      } else {
        // For 2-side: print count is 1 (rows are duplicated to fill page)
        leftoverPrintCount = 1
      }
      
      // Draw rows for this page
      for (let i = 0; i < pageRows.length; i++) {
        const row = pageRows[i]
        await drawRow(ctx, row.fileItem, i, imageCache)
      }
      
      // Draw combined info
      if (customerInfo) {
        drawCombinedInfo(ctx, pageIndex + 1, totalPages, leftoverPrintCount, customerInfo, canvasWidth, canvasHeight)
      }
      
      // Draw page number
      drawPageNumberOnCanvasLanyard(ctx, pageIndex + 1, canvasWidth, canvasHeight)
      
      // Convert to PDF
      const pageImageData = await canvasToImageData(canvas)
      const pageImage = await pdfDoc.embedPng(pageImageData)
      page.drawImage(pageImage, {
        x: 0,
        y: 0,
        width: pageWidthPoints,
        height: pageHeightPoints,
      })
      
      pageIndex++
      setProgress((pageIndex / totalPages) * 100)
    }
  }
  
  setProgress(100)
  
  // Download PDF
  const pdfBytes = await pdfDoc.save()
  const filename = generateFilename(customerInfo, 'lanyard')
  downloadPDF(pdfBytes, filename)
}

/**
 * Draw tracking text for Lanyard layout (rotated 90 degrees, right side, vertically centered, next to print note)
 */
function drawTrackingTextLanyard(ctx, customerInfo, pageNum, totalPages, width, height) {
  const fontSize = 16
  const timestamp = new Date().toLocaleString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
  const text = `${customerInfo.name} | ${customerInfo.instansi} | ${timestamp}`
  
  // Position next to print note (which is at width - 50), so place it a bit further left
  const x = width - 120 // Right side with margin, positioned left of print note
  const y = height / 2 // Vertically centered
  
  ctx.save()
  ctx.font = `bold ${fontSize}px Arial`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  
  // Measure text to calculate background size
  const metrics = ctx.measureText(text)
  const padding = 10
  const textWidth = metrics.width
  const textHeight = fontSize
  
  // Translate to rotation point (right side, middle)
  ctx.translate(x, y)
  ctx.rotate(Math.PI / 2) // Rotate 90 degrees clockwise (to match print note)
  
  // Draw white background for better visibility (rotated)
  ctx.fillStyle = 'white'
  ctx.fillRect(
    -textWidth / 2 - padding,
    -textHeight / 2 - padding,
    textWidth + padding * 2,
    textHeight + padding * 2
  )
  
  // Draw text (rotated)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
  ctx.fillText(text, 0, 0)
  
  ctx.restore()
}

/**
 * Download PDF file
 */
function downloadPDF(pdfBytes, filename) {
  const blob = new Blob([pdfBytes], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

