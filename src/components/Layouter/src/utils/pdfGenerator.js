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
  ID_CARD_WIDTH_PX
} from './constants'
import { loadAndProcessImage, imageToUint8Array } from './imageProcessor'

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
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      blob.arrayBuffer().then(buffer => {
        resolve(new Uint8Array(buffer))
      })
    }, 'image/png')
  })
}

/**
 * Draw tiny tracking text on canvas
 */
function drawTrackingText(ctx, customerInfo, pageNum, totalPages) {
  const fontSize = 8
  const text = `${customerInfo.name} | ${customerInfo.instansi} | Page ${pageNum}/${totalPages} | ${new Date().toLocaleString('id-ID')}`
  const x = 20
  const y = CANVAS_HEIGHT_PX - 15
  
  ctx.save()
  ctx.font = `${fontSize}px Arial`
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
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

