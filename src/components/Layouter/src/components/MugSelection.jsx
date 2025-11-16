import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ArrowLeft, Cloud, Download, Trash2, ChevronDown, ChevronUp, AlertCircle, User, Search, X, Check, Edit, Building2, Calendar, Plus, Minus } from 'lucide-react'
import { generateLayoutMug } from '../utils/pdfGenerator'
import ProgressBar from './ProgressBar'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import processCompleteSound from '@/components/process-complete.mp3'
import './FileSelection.css'

function MugSelection({ onBack }) {
  const [files, setFiles] = useState([]) // Array of { file: File, quantity: number }
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [instansi, setInstansi] = useState('')
  const [customerNameError, setCustomerNameError] = useState('')
  const [customers, setCustomers] = useState([])
  const [filteredCustomers, setFilteredCustomers] = useState([])
  const [selectedCustomerId, setSelectedCustomerId] = useState('')
  const [customerSearchTerm, setCustomerSearchTerm] = useState('')
  const [showCustomerSelector, setShowCustomerSelector] = useState(false)
  const [isFileListExpanded, setIsFileListExpanded] = useState(false)
  const [imagePreviews, setImagePreviews] = useState({}) // Store preview URLs by file name
  const inputRef = useRef(null)

  // Load customers from order history (same as FileSelection)
  useEffect(() => {
    const loadCustomers = () => {
      try {
        const orderHistory = localStorage.getItem('orderHistory')
        if (!orderHistory) {
          setCustomers([])
          return
        }

        const history = JSON.parse(orderHistory)
        const customerMap = new Map()

        // Extract unique customers from order history, keeping the most recent order
        history.forEach((order) => {
          if (order.customer && order.customer.name) {
            const key = `${order.customer.name}_${order.customer.instansi || ''}`
            const existingCustomer = customerMap.get(key)
            const orderTimestamp = new Date(order.timestamp).getTime()
            
            if (!existingCustomer) {
              customerMap.set(key, {
                id: key,
                name: order.customer.name,
                instansi: order.customer.instansi || '',
                phone: order.customer.phone || '',
                timestamp: order.timestamp,
                receiptId: order.receiptId
              })
            } else {
              const existingTimestamp = new Date(existingCustomer.timestamp).getTime()
              if (orderTimestamp > existingTimestamp) {
                customerMap.set(key, {
                  ...existingCustomer,
                  timestamp: order.timestamp,
                  receiptId: order.receiptId
                })
              }
            }
          }
        })

        const customersList = Array.from(customerMap.values()).sort((a, b) => {
          const dateA = new Date(a.timestamp).getTime()
          const dateB = new Date(b.timestamp).getTime()
          return dateB - dateA
        })

        setCustomers(customersList)
        setFilteredCustomers(customersList)
      } catch (error) {
        console.error('Error loading customers from localStorage:', error)
      }
    }

    loadCustomers()
  }, [])

  // Filter customers based on search term
  useEffect(() => {
    if (!customerSearchTerm.trim()) {
      setFilteredCustomers(customers)
      return
    }

    const searchLower = customerSearchTerm.toLowerCase().trim()
    const filtered = customers.filter(customer => {
      const nameMatch = customer.name.toLowerCase().includes(searchLower)
      const instansiMatch = customer.instansi.toLowerCase().includes(searchLower)
      const phoneMatch = customer.phone && customer.phone.includes(searchLower)
      const receiptMatch = customer.receiptId.toLowerCase().includes(searchLower)
      
      return nameMatch || instansiMatch || phoneMatch || receiptMatch
    })

    setFilteredCustomers(filtered)
  }, [customerSearchTerm, customers])

  const handleCustomerSelect = (customerId) => {
    setSelectedCustomerId(customerId)
    const selectedCustomer = customers.find(c => c.id === customerId)
    if (selectedCustomer) {
      setCustomerName(selectedCustomer.name)
      setInstansi(selectedCustomer.instansi)
      setCustomerNameError('')
      setCustomerSearchTerm('')
    }
  }

  const handleConfirmCustomerInfo = () => {
    if (!validateCustomerInfo()) {
      return
    }
    setShowCustomerSelector(false)
    processWithCustomerInfo()
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Byte'
    const k = 1024
    const sizes = ['Byte', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const getFileType = (file) => {
    if (file.type.startsWith('image/')) {
      const ext = file.name.split('.').pop().toUpperCase()
      return ext === 'JPG' ? 'JPEG' : ext
    }
    return 'FILE'
  }

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files)
    const imageFiles = selectedFiles.filter(file => 
      file.type.startsWith('image/') && 
      ['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)
    )
    
    if (imageFiles.length > 0) {
      const newFiles = imageFiles.map(file => ({ file, quantity: 1 }))
      setFiles(prev => [...prev, ...newFiles])
    }
  }

  // Load image previews when files change
  useEffect(() => {
    const loadPreviews = () => {
      files.forEach(fileItem => {
        const file = fileItem.file
        setImagePreviews(prev => {
          // Skip if already loaded
          if (prev[file.name]) {
            return prev
          }
          // Load preview
          const reader = new FileReader()
          reader.onload = (e) => {
            setImagePreviews(current => ({ ...current, [file.name]: e.target.result }))
          }
          reader.readAsDataURL(file)
          return prev
        })
      })
    }
    if (files.length > 0) {
      loadPreviews()
    }
  }, [files])

  // Clean up preview URLs when files are removed
  useEffect(() => {
    const fileNames = new Set(files.map(item => item.file.name))
    setImagePreviews(prev => {
      const updated = {}
      Object.keys(prev).forEach(key => {
        if (fileNames.has(key)) {
          updated[key] = prev[key]
        }
      })
      return updated
    })
  }, [files])

  const handleRemoveFile = (index) => {
    const fileToRemove = files[index]
    // Clean up preview URL
    if (imagePreviews[fileToRemove.file.name]) {
      URL.revokeObjectURL(imagePreviews[fileToRemove.file.name])
      setImagePreviews(prev => {
        const updated = { ...prev }
        delete updated[fileToRemove.file.name]
        return updated
      })
    }
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleQuantityChange = (index, delta) => {
    setFiles(prev => prev.map((item, i) => {
      if (i === index) {
        const newQuantity = Math.max(1, item.quantity + delta)
        return { ...item, quantity: newQuantity }
      }
      return item
    }))
  }

  const handleQuantityInput = (index, value) => {
    const numValue = parseInt(value) || 1
    const quantity = Math.max(1, numValue)
    setFiles(prev => prev.map((item, i) => {
      if (i === index) {
        return { ...item, quantity }
      }
      return item
    }))
  }

  // Calculate total pages needed
  const calculateTotalPages = () => {
    // A4 landscape can hold 3 columns horizontally
    const columnsPerPage = 3
    let totalImages = 0
    
    files.forEach(item => {
      totalImages += item.quantity
    })
    
    return Math.ceil(totalImages / columnsPerPage)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFiles = Array.from(e.dataTransfer.files)
    const imageFiles = droppedFiles.filter(file => 
      file.type.startsWith('image/') && 
      ['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)
    )
    
    if (imageFiles.length > 0) {
      const newFiles = imageFiles.map(file => ({ file, quantity: 1 }))
      setFiles(prev => [...prev, ...newFiles])
    }
  }

  const validateCustomerInfo = () => {
    let isValid = true
    setCustomerNameError('')

    if (!customerName.trim()) {
      setCustomerNameError('Nama pelanggan wajib diisi')
      isValid = false
    } else if (customerName.trim().length < 2) {
      setCustomerNameError('Nama pelanggan minimal 2 karakter')
      isValid = false
    }

    return isValid
  }

  const handleLanjut = () => {
    setShowCustomerSelector(true)
  }

  const handleProcess = async () => {
    if (files.length === 0) {
      alert('Silakan pilih minimal satu file gambar')
      return
    }

    if (!customerName.trim()) {
      setShowCustomerSelector(true)
      return
    }

    if (!validateCustomerInfo()) {
      setShowCustomerSelector(true)
      return
    }

    await processWithCustomerInfo()
  }

  const getTotalImages = () => {
    return files.reduce((sum, item) => sum + item.quantity, 0)
  }

  const processWithCustomerInfo = async () => {
    setIsProcessing(true)
    setProgress(0)
    let success = false

    try {
      const customerInfo = {
        name: customerName.trim(),
        instansi: instansi.trim() || 'N/A'
      }

      await generateLayoutMug(files.map(item => item.file), files.map(item => item.quantity), setProgress, customerInfo)
      success = true
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error saat menghasilkan PDF: ' + error.message)
      success = false
    } finally {
      setIsProcessing(false)
      setProgress(0)
      
      if (success) {
        try {
          const audio = new Audio(processCompleteSound)
          audio.play().catch(err => {
            console.log('Could not play sound:', err)
          })
        } catch (err) {
          console.log('Error playing sound:', err)
        }
      }
    }
  }

  return (
    <div className="file-selection">
      <div className="file-selection-header">
        <h2 className="file-selection-title">Layout Mug</h2>
        <p className="file-selection-subtitle">Unggah gambar 20x10 cm untuk menghasilkan layout PDF mug</p>
      </div>

      {/* Customer Info Dialog */}
      <Dialog open={showCustomerSelector} onOpenChange={setShowCustomerSelector}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-4 md:p-6">
          <DialogHeader className="px-0 md:px-0">
            <DialogTitle className="text-lg md:text-xl">Informasi Pelanggan</DialogTitle>
            <DialogDescription className="text-xs md:text-sm">
              Pilih pelanggan dari riwayat pesanan atau masukkan informasi secara manual.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden flex flex-col px-0 md:px-0">
            {/* Manual Input Fields */}
            <div className="mb-4 md:mb-6">
              <div className="customer-info-fields">
                <div>
                  <label className="customer-info-label">
                    Nama Pelanggan <span className="required-asterisk">*</span>
                  </label>
                  <input
                    type="text"
                    className={`customer-info-input ${customerNameError ? 'input-error' : ''}`}
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value)
                      setSelectedCustomerId('')
                      if (customerNameError) {
                        setCustomerNameError('')
                      }
                    }}
                    placeholder="Masukkan nama pelanggan"
                    disabled={isProcessing}
                    required
                  />
                  {customerNameError && (
                    <div className="error-message">
                      <AlertCircle className="error-icon" />
                      <span>{customerNameError}</span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="customer-info-label">Instansi</label>
                  <input
                    type="text"
                    className="customer-info-input"
                    value={instansi}
                    onChange={(e) => {
                      setInstansi(e.target.value)
                      setSelectedCustomerId('')
                    }}
                    placeholder="Masukkan instansi (opsional)"
                    disabled={isProcessing}
                  />
                </div>
              </div>
            </div>

            {/* Customer History Section */}
            {customers.length > 0 && (
              <div className="mb-4 md:mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-700">Atau pilih dari riwayat</h4>
                </div>
                <div className="customer-search-wrapper mb-3">
                  <Search className="customer-search-icon" />
                  <input
                    type="text"
                    className="customer-search-input"
                    placeholder="Cari berdasarkan nama, instansi, telepon, atau ID struk..."
                    value={customerSearchTerm}
                    onChange={(e) => setCustomerSearchTerm(e.target.value)}
                    disabled={isProcessing}
                  />
                  {customerSearchTerm && (
                    <button
                      type="button"
                      className="customer-search-clear"
                      onClick={() => setCustomerSearchTerm('')}
                      disabled={isProcessing}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="max-h-48 overflow-y-auto">
                  {filteredCustomers.length > 0 ? (
                    <div className="customer-list-container">
                      {filteredCustomers.map((customer) => {
                        const formatDate = (timestamp) => {
                          if (!timestamp) return ''
                          try {
                            const date = timestamp instanceof Date ? timestamp : new Date(timestamp)
                            if (isNaN(date.getTime())) {
                              return typeof timestamp === 'string' ? timestamp : String(timestamp)
                            }
                            return date.toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })
                          } catch {
                            return typeof timestamp === 'string' ? timestamp : String(timestamp)
                          }
                        }
                        
                        return (
                          <div
                            key={customer.id}
                            className={`customer-list-item ${selectedCustomerId === customer.id ? 'selected' : ''}`}
                            onClick={() => !isProcessing && handleCustomerSelect(customer.id)}
                          >
                            <div className="customer-list-content">
                              <div className="customer-list-main">
                                <div className="customer-list-info-row">
                                  <User className="customer-list-icon" />
                                  <span className="customer-list-name">{customer.name}</span>
                                </div>
                                {customer.instansi && (
                                  <div className="customer-list-info-row">
                                    <Building2 className="customer-list-icon" />
                                    <span className="customer-list-instansi">{customer.instansi}</span>
                                  </div>
                                )}
                                <div className="customer-list-info-row">
                                  <Calendar className="customer-list-icon" />
                                  <span className="customer-list-date">{formatDate(customer.timestamp)}</span>
                                </div>
                              </div>
                              {selectedCustomerId === customer.id && (
                                <div className="customer-list-check">
                                  <Check className="w-4 h-4" />
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="customer-search-no-results">
                      {customerSearchTerm ? `Tidak ada pelanggan yang cocok dengan "${customerSearchTerm}"` : 'Tidak ada riwayat pelanggan'}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowCustomerSelector(false)}
                disabled={isProcessing}
              >
                Batal
              </Button>
              <Button
                onClick={handleConfirmCustomerInfo}
                disabled={isProcessing || !customerName.trim()}
              >
                <Check className="w-4 h-4 mr-2" />
                Konfirmasi & Proses
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* File Upload Area */}
      <div className="file-upload-container">
        <div className="upload-section">
          <div className="upload-section-header">
            <div className="upload-section-header-left">
              <h3 className="upload-section-title">Pilih Gambar</h3>
              <p className="upload-section-subtitle">Unggah gambar 20x10 cm untuk mug</p>
            </div>
          </div>

          <div
            className={`drop-zone ${isDragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <Cloud className="drop-zone-icon" />
            <p className="drop-zone-text">Jatuhkan file Anda di sini atau jelajahi</p>
            <p className="drop-zone-hint">Ukuran file maksimal hingga 1 GB</p>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept="image/png,image/jpeg,image/jpg"
              onChange={handleFileChange}
              disabled={isProcessing}
              className="file-input"
            />
          </div>

          {files.length > 0 && (
            <div className="file-list-container">
              <button
                className="file-list-header"
                onClick={() => setIsFileListExpanded(!isFileListExpanded)}
              >
                <span className="file-list-count">
                  {files.length} file dipilih • {getTotalImages()} total gambar • {calculateTotalPages()} halaman
                </span>
                {isFileListExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {isFileListExpanded && (
                <div className="file-list-grid">
                  {files.map((item, index) => (
                    <div key={`${item.file.name}-${index}`} className="file-item">
                      {imagePreviews[item.file.name] && (
                        <img 
                          src={imagePreviews[item.file.name]} 
                          alt={item.file.name}
                          className="w-12 h-12 object-cover rounded border border-gray-200 flex-shrink-0"
                        />
                      )}
                      <div className="file-info flex-1 min-w-0 flex flex-col">
                        <p className="file-name truncate">{item.file.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <label className="text-xs text-gray-600 whitespace-nowrap">QTY:</label>
                          <div className="flex items-center gap-1 border rounded">
                            <button
                              type="button"
                              className="p-1 hover:bg-gray-100 disabled:opacity-50 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleQuantityChange(index, -1)
                              }}
                              disabled={isProcessing || item.quantity <= 1}
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => {
                                e.stopPropagation()
                                handleQuantityInput(index, e.target.value)
                              }}
                              onClick={(e) => e.stopPropagation()}
                              disabled={isProcessing}
                              className="w-12 text-center text-sm border-0 focus:outline-none bg-transparent"
                            />
                            <button
                              type="button"
                              className="p-1 hover:bg-gray-100 disabled:opacity-50 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleQuantityChange(index, 1)
                              }}
                              disabled={isProcessing}
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <button
                        className="file-delete-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemoveFile(index)
                        }}
                        disabled={isProcessing}
                        title="Hapus file"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {isProcessing && (
        <div className="processing-section">
          <ProgressBar progress={progress} />
        </div>
      )}

      {/* Floating Action Buttons */}
      {createPortal(
        <div className="floating-action-buttons-container">
          <div className="floating-action-buttons-pill">
            <Button
              variant="outline"
              onClick={onBack}
              disabled={isProcessing}
              className="floating-action-btn-back"
            >
              <ArrowLeft className="mr-1 md:mr-2 h-4 w-4" />
              Kembali
            </Button>
            <div className="floating-action-btn-process-wrapper">
              <Button
                className="floating-action-btn-process"
                onClick={customerName ? handleProcess : handleLanjut}
                disabled={isProcessing || files.length === 0}
                size="lg"
              >
                {isProcessing ? (
                  <span className="text-sm md:text-base">Memproses...</span>
                ) : customerName ? (
                  <>
                    <Download className="mr-1 md:mr-2 h-4 w-4" />
                    <span className="text-sm md:text-base">Proses</span>
                  </>
                ) : (
                  <>
                    <span className="text-sm md:text-base">Lanjut</span>
                  </>
                )}
              </Button>
              {customerName && !isProcessing && (
                <Button
                  className="floating-action-btn-edit"
                  onClick={() => setShowCustomerSelector(true)}
                  title="Edit informasi pelanggan"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

export default MugSelection

