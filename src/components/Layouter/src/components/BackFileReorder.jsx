import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X, GripVertical, Check, RefreshCw, ZoomIn, ZoomOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import './BackFileReorder.css'

const BackFileReorder = ({ files, frontFiles, onClose, onSave }) => {
  const [orderedFiles, setOrderedFiles] = useState([])
  const [draggedIndex, setDraggedIndex] = useState(null)
  const [dragOverIndex, setDragOverIndex] = useState(null)
  const [backImagePreviews, setBackImagePreviews] = useState({})
  const [frontImagePreviews, setFrontImagePreviews] = useState({})
  const [cardScale, setCardScale] = useState(100) // Scale percentage (50% to 150%)
  const fileInputRefs = useRef({})

  // Initialize ordered files from props
  useEffect(() => {
    if (files && files.length > 0) {
      setOrderedFiles([...files])
    } else {
      setOrderedFiles([])
    }
  }, [files])

  // Prevent body scroll when component is mounted
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
      // Clean up file input refs
      Object.values(fileInputRefs.current).forEach(input => {
        if (input && input.parentNode) {
          input.parentNode.removeChild(input)
        }
      })
      fileInputRefs.current = {}
    }
  }, [])

  // Load back image previews
  useEffect(() => {
    const loadPreviews = async () => {
      const previews = {}
      for (let i = 0; i < orderedFiles.length; i++) {
        const file = orderedFiles[i]
        const reader = new FileReader()
        reader.onload = (e) => {
          previews[i] = e.target.result
          setBackImagePreviews({ ...previews })
        }
        reader.readAsDataURL(file)
      }
    }
    if (orderedFiles.length > 0) {
      loadPreviews()
    }
  }, [orderedFiles])

  // Load front image previews
  useEffect(() => {
    const loadPreviews = async () => {
      const previews = {}
      // Sort front files alphabetically to match PDF generation order
      const sortedFrontFiles = [...frontFiles].sort((a, b) => a.name.localeCompare(b.name))
      for (let i = 0; i < sortedFrontFiles.length; i++) {
        const file = sortedFrontFiles[i]
        const reader = new FileReader()
        reader.onload = (e) => {
          previews[i] = e.target.result
          setFrontImagePreviews({ ...previews })
        }
        reader.readAsDataURL(file)
      }
    }
    if (frontFiles && frontFiles.length > 0) {
      loadPreviews()
    }
  }, [frontFiles])

  const handleDragStart = (e, index) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', e.target.outerHTML)
    e.target.style.opacity = '0.5'
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIndex(index)
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = (e, dropIndex) => {
    e.preventDefault()
    setDragOverIndex(null)

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      return
    }

    const newOrderedFiles = [...orderedFiles]
    const draggedFile = newOrderedFiles[draggedIndex]
    
    // Remove dragged item
    newOrderedFiles.splice(draggedIndex, 1)
    
    // Insert at new position
    newOrderedFiles.splice(dropIndex, 0, draggedFile)
    
    setOrderedFiles(newOrderedFiles)
    setDraggedIndex(null)
  }

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1'
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleSave = () => {
    onSave(orderedFiles)
    onClose()
  }

  const handleCancel = () => {
    setOrderedFiles([...files]) // Reset to original order
    onClose()
  }

  const handleReplaceFile = (index) => {
    // Create a file input if it doesn't exist for this index
    if (!fileInputRefs.current[index]) {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/png,image/jpeg,image/jpg'
      input.style.display = 'none'
      document.body.appendChild(input)
      fileInputRefs.current[index] = input
    }

    const input = fileInputRefs.current[index]
    input.onchange = (e) => {
      const selectedFile = e.target.files?.[0]
      if (selectedFile && selectedFile.type.startsWith('image/')) {
        // Replace the file at the specified index
        const newOrderedFiles = [...orderedFiles]
        newOrderedFiles[index] = selectedFile
        setOrderedFiles(newOrderedFiles)

        // Update preview immediately
        const reader = new FileReader()
        reader.onload = (event) => {
          setBackImagePreviews(prev => ({
            ...prev,
            [index]: event.target.result
          }))
        }
        reader.readAsDataURL(selectedFile)
      }
      // Reset input value to allow selecting the same file again
      input.value = ''
    }
    input.click()
  }

  const content = (
    <div className="back-file-reorder-overlay">
      <div className="back-file-reorder-container">
        <div className="back-file-reorder-header">
          <div>
            <h2 className="back-file-reorder-title">Atur Urutan ID Card Belakang</h2>
            <p className="back-file-reorder-subtitle">
              Lihat pasangan depan dan belakang, lalu seret gambar belakang untuk mengatur urutan sesuai kebutuhan
            </p>
          </div>
          <div className="back-file-reorder-header-right">
            <div className="back-file-reorder-zoom-control">
              <ZoomOut className="w-4 h-4 text-gray-500" />
              <Slider
                value={[cardScale]}
                onValueChange={(value) => setCardScale(value[0])}
                min={50}
                max={150}
                step={5}
                className="back-file-reorder-zoom-slider"
              />
              <ZoomIn className="w-4 h-4 text-gray-500" />
              <span className="back-file-reorder-zoom-value">{cardScale}%</span>
            </div>
            <button
              className="back-file-reorder-close"
              onClick={handleCancel}
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div 
          className="back-file-reorder-content"
          style={{ '--card-scale': cardScale / 100 }}
        >
          {!orderedFiles || orderedFiles.length === 0 ? (
            <div className="back-file-reorder-empty">
              <p>Tidak ada file yang dipilih</p>
            </div>
          ) : (
            <div className="back-file-reorder-pairs-grid">
              {orderedFiles.map((file, index) => {
                // Get corresponding front file (sorted alphabetically to match PDF generation)
                const sortedFrontFiles = frontFiles ? [...frontFiles].sort((a, b) => a.name.localeCompare(b.name)) : []
                const frontFile = sortedFrontFiles[index] || null
                
                return (
                  <div
                    key={`pair-${file.name}-${index}`}
                    className="back-file-reorder-pair"
                  >
                    {/* Front Card (Left) */}
                    <div className="back-file-reorder-pair-card front-card">
                      <div className="back-file-reorder-pair-header">
                        <div className="back-file-reorder-pair-label">Depan</div>
                        <div className="back-file-reorder-pair-number">{index + 1}</div>
                      </div>
                      <div className="back-file-reorder-pair-preview">
                        {frontFile && frontImagePreviews[index] ? (
                          <img
                            src={frontImagePreviews[index]}
                            alt={frontFile.name}
                            className="back-file-reorder-pair-image"
                          />
                        ) : (
                          <div className="back-file-reorder-pair-loading">Memuat...</div>
                        )}
                      </div>
                      <div className="back-file-reorder-pair-info">
                        {frontFile ? (
                          <>
                            <p className="back-file-reorder-pair-name" title={frontFile.name}>
                              {frontFile.name}
                            </p>
                            <p className="back-file-reorder-pair-size">
                              {(frontFile.size / 1024).toFixed(2)} KB
                            </p>
                          </>
                        ) : (
                          <p className="back-file-reorder-pair-name">Tidak ada file depan</p>
                        )}
                      </div>
                    </div>

                    {/* Back Card (Right) - Draggable */}
                    <div
                      className={`back-file-reorder-pair-card back-card ${
                        draggedIndex === index ? 'dragging' : ''
                      } ${dragOverIndex === index ? 'drag-over' : ''}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragEnd={handleDragEnd}
                    >
                      <div className="back-file-reorder-pair-header">
                        <div className="back-file-reorder-pair-label">Belakang</div>
                        <div className="back-file-reorder-pair-grip">
                          <GripVertical className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="back-file-reorder-pair-preview">
                        {backImagePreviews[index] ? (
                          <img
                            src={backImagePreviews[index]}
                            alt={file.name}
                            className="back-file-reorder-pair-image"
                          />
                        ) : (
                          <div className="back-file-reorder-pair-loading">Memuat...</div>
                        )}
                      </div>
                      <div className="back-file-reorder-pair-info">
                        <p className="back-file-reorder-pair-name" title={file.name}>
                          {file.name}
                        </p>
                        <p className="back-file-reorder-pair-size">
                          {(file.size / 1024).toFixed(2)} KB
                        </p>
                        <button
                          type="button"
                          className="back-file-reorder-replace-btn"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleReplaceFile(index)
                          }}
                          title="Ganti dengan file lain"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Replace</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="back-file-reorder-footer">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="back-file-reorder-btn-cancel"
          >
            Batal
          </Button>
          <Button
            onClick={handleSave}
            className="back-file-reorder-btn-save"
            disabled={orderedFiles.length === 0}
          >
            <Check className="w-4 h-4 mr-2" />
            Simpan Urutan
          </Button>
        </div>
      </div>
    </div>
  )

  return createPortal(content, document.body)
}

export default BackFileReorder