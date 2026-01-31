import { PDFDocument } from 'pdf-lib'
import { DPI, MM_TO_PX } from './constants'
import { loadAndProcessImageLanyardCol1, loadAndProcessImageLanyardCol2 } from './imageProcessor'

/**
 * Generate Dual Column Lanyard PDF
 * Rewritten to separate Short and Long layouts onto distinct pages to avoid layout conflicts.
 * 
 * @param {Array} shortFiles - Array of { original: File, cropped: File, quantity: number }
 * @param {Array} longFiles - Array of { file: File, quantity: number }
 * @param {number} heightCm - Height preset (2, 2.25, 2.3, 2.4)
 * @param {Function} setProgress - Progress callback
 * @param {Object} customerInfo - Customer information
 */
export async function generateDualColumnLanyardPDF(
    shortFiles,
    longFiles,
    heightCm,
    setProgress,
    customerInfo = null
) {
    console.log('=== Starting Dual Column PDF Generation (Separate Pages) ===')
    console.log('Short files:', shortFiles.length)
    console.log('Long files:', longFiles.length)
    console.log('Height:', heightCm, 'cm')

    const pdfDoc = await PDFDocument.create()

    // Configuration
    const CANVAS_DPI = 150
    const CANVAS_SCALE = CANVAS_DPI / DPI

    // Page: 912mm x 210mm
    const pageWidthMM = 912
    const pageHeightMM = 210

    const pageWidthPoints = (pageWidthMM * 72) / 25.4
    const pageHeightPoints = (pageHeightMM * 72) / 25.4

    const pageWidthPx = Math.round((pageWidthMM * DPI) / 25.4)
    const pageHeightPx = Math.round((pageHeightMM * DPI) / 25.4)

    const canvasWidth = Math.round(pageWidthPx * CANVAS_SCALE)
    const canvasHeight = Math.round(pageHeightPx * CANVAS_SCALE)

    // Dimensions
    const shortColWidthMM = 95 // 9.5cm
    const longColWidthMM = 900  // 90cm
    const rowHeightMM = heightCm * 10

    const shortColWidth = Math.round((shortColWidthMM * CANVAS_DPI) / 25.4)
    const longColWidth = Math.round((longColWidthMM * CANVAS_DPI) / 25.4)
    const rowHeight = Math.round((rowHeightMM * CANVAS_DPI) / 25.4)

    // Margins (2mm + 5mm shift = 7mm) and Spacing (3mm rows, 1mm cols)
    const topMargin = Math.round(MM_TO_PX(5) * CANVAS_SCALE)
    const leftMargin = Math.round(MM_TO_PX(7) * CANVAS_SCALE)
    // Reduce spacing for taller heights to fit 8 rows
    const rowSpacing = Math.round(MM_TO_PX(heightCm >= 2.3 ? 2 : 3) * CANVAS_SCALE)
    const shortColGap = Math.round(MM_TO_PX(1) * CANVAS_SCALE)

    // All heights now use 8 rows with adjusted spacing
    const rowsPerPage = 8

    // Expand Short Files
    const shortImagesToLayout = []
    for (const fileItem of shortFiles) {
        for (let q = 0; q < fileItem.quantity; q++) {
            shortImagesToLayout.push(fileItem)
        }
    }

    // Expand Long Files
    const longImagesToLayout = []
    for (const fileItem of longFiles) {
        for (let q = 0; q < fileItem.quantity; q++) {
            longImagesToLayout.push(fileItem)
        }
    }

    const totalShortImages = shortImagesToLayout.length
    const totalLongImages = longImagesToLayout.length

    if (totalShortImages === 0 && totalLongImages === 0) {
        throw new Error('Tidak ada gambar untuk di-layout')
    }

    // Calculate Pages
    const shortItemsPerPage = rowsPerPage * 9 // 9 columns per page
    const numShortPages = totalShortImages > 0 ? Math.ceil(totalShortImages / shortItemsPerPage) : 0

    const longItemsPerPage = rowsPerPage * 1 // 1 column per page
    const numLongPages = totalLongImages > 0 ? Math.ceil(totalLongImages / longItemsPerPage) : 0

    const totalPages = numShortPages + numLongPages
    console.log(`Pages: ${numShortPages} Short + ${numLongPages} Long = ${totalPages} Total`)

    let pagesDone = 0
    let shortImageIndex = 0
    let longImageIndex = 0
    const imageCache = new Map()

    // --- PHASE 1: SHORT PAGES ---
    for (let p = 0; p < numShortPages; p++) {
        const page = pdfDoc.addPage([pageWidthPoints, pageHeightPoints])
        const canvas = document.createElement('canvas')
        canvas.width = canvasWidth
        canvas.height = canvasHeight
        const ctx = canvas.getContext('2d')

        // Background
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, canvasWidth, canvasHeight)

        // Draw 9 Columns of Short Images
        for (let row = 0; row < rowsPerPage; row++) {
            for (let col = 0; col < 9; col++) {
                if (shortImageIndex >= totalShortImages) break

                const fileItem = shortImagesToLayout[shortImageIndex]
                // Added shortColGap to X calculation
                const x = leftMargin + (col * (shortColWidth + shortColGap))
                const y = topMargin + (row * (rowHeight + rowSpacing))

                try {
                    const cacheKey = `short_${fileItem.cropped.name}_${shortColWidth}`
                    let img = imageCache.get(cacheKey)
                    if (!img) {
                        img = await loadAndProcessImageLanyardCol1(fileItem.cropped, shortColWidth, rowHeight)
                        imageCache.set(cacheKey, img)
                    }

                    ctx.drawImage(img, x, y, shortColWidth, rowHeight)

                    ctx.save()
                    ctx.strokeStyle = '#808080'
                    ctx.lineWidth = 1
                    ctx.strokeRect(x, y, shortColWidth, rowHeight)
                    ctx.restore()

                    shortImageIndex++
                } catch (err) {
                    console.error('Error drawing short image:', err)
                    shortImageIndex++
                }
            }
        }

        // Finalize Page
        await finalizePage(ctx, pdfDoc, page, pagesDone + 1, customerInfo, canvas)
        pagesDone++
        setProgress((pagesDone / totalPages) * 100)
    }

    // --- PHASE 2: LONG PAGES ---
    for (let p = 0; p < numLongPages; p++) {
        const page = pdfDoc.addPage([pageWidthPoints, pageHeightPoints])
        const canvas = document.createElement('canvas')
        canvas.width = canvasWidth
        canvas.height = canvasHeight
        const ctx = canvas.getContext('2d')

        // Background
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, canvasWidth, canvasHeight)

        // Draw 1 Column of Long Images (Left Aligned)
        for (let row = 0; row < rowsPerPage; row++) {
            if (longImageIndex >= totalLongImages) break

            const fileItem = longImagesToLayout[longImageIndex]
            const x = leftMargin // STRICTLY LEFT MARGIN
            const y = topMargin + (row * (rowHeight + rowSpacing))

            try {
                const cacheKey = `long_${fileItem.file.name}_${longColWidth}`
                let img = imageCache.get(cacheKey)
                if (!img) {
                    img = await loadAndProcessImageLanyardCol2(fileItem.file, longColWidth, rowHeight)
                    imageCache.set(cacheKey, img)
                }

                ctx.drawImage(img, x, y, longColWidth, rowHeight)

                ctx.save()
                ctx.strokeStyle = '#808080'
                ctx.lineWidth = 1
                ctx.strokeRect(x, y, longColWidth, rowHeight)
                ctx.restore()

                longImageIndex++
            } catch (err) {
                console.error('Error drawing long image:', err)
                longImageIndex++
            }
        }

        // Finalize Page
        await finalizePage(ctx, pdfDoc, page, pagesDone + 1, customerInfo, canvas)
        pagesDone++
        setProgress((pagesDone / totalPages) * 100)
    }

    // Save
    const pdfBytes = await pdfDoc.save()
    const filename = generateFilename(customerInfo, totalShortImages, totalLongImages)
    downloadPDF(pdfBytes, filename)
}

// Helpers
async function finalizePage(ctx, pdfDoc, page, pageNum, customerInfo, canvas) {
    const canvasHeight = canvas.height

    // Page Number
    ctx.save()
    ctx.font = '24px Helvetica'
    ctx.fillStyle = 'black'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText(pageNum.toString(), 30, canvasHeight - 30)
    ctx.restore()

    // Tracking Info
    if (customerInfo) {
        const timestamp = new Date().toLocaleString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
        const text = `${customerInfo.name} | ${customerInfo.instansi} | ${timestamp}`
        ctx.save()
        ctx.font = 'bold 16px Arial'
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
        ctx.textAlign = 'left'
        ctx.textBaseline = 'top'
        ctx.fillText(text, 20, 15)
        ctx.restore()
    }

    const pageImageData = await canvasToImageData(canvas)
    const pageImage = await pdfDoc.embedPng(pageImageData)
    page.drawImage(pageImage, {
        x: 0,
        y: 0,
        width: page.getWidth(),
        height: page.getHeight(),
    })
}

async function canvasToImageData(canvas) {
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) reject(new Error('Canvas blob failed'))
            else blob.arrayBuffer().then(buf => resolve(new Uint8Array(buf))).catch(reject)
        }, 'image/png')
    })
}

function generateFilename(customerInfo, totalShort, totalLong) {
    const totalQty = totalShort + totalLong
    if (!customerInfo) return `dual-lanyard-${totalQty}pcs.pdf`
    const safeName = customerInfo.name.replace(/[^a-zA-Z0-9]/g, '-')
    return `${safeName}-${totalQty}pcs.pdf`
}

function downloadPDF(pdfBytes, filename) {
    const blob = new Blob([pdfBytes], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
}
