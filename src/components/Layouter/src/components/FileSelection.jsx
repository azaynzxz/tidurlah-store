import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ArrowLeft, ArrowRight, Cloud, Download, Trash2, ChevronDown, ChevronUp, AlertCircle, User, Search, X, Check, ArrowUpDown, Building2, Calendar, Edit } from 'lucide-react'
import { generateLayout1S, generateLayout2SSama, generateLayoutKananKiriBeda } from '../utils/pdfGenerator'
import ProgressBar from './ProgressBar'
import BackFileReorder from './BackFileReorder'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import processCompleteSound from '@/components/process-complete.mp3'
import './FileSelection.css'

function FileSelection({ layout, onBack }) {
  const [files, setFiles] = useState([])
  const [backFiles, setBackFiles] = useState([])
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
  const [isBackFileListExpanded, setIsBackFileListExpanded] = useState(false)
  const [showReorderDialog, setShowReorderDialog] = useState(false)
  const [orderedBackFiles, setOrderedBackFiles] = useState([])
  const frontInputRef = useRef(null)
  const backInputRef = useRef(null)

  // Load customers from order history
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
              // First time seeing this customer
              customerMap.set(key, {
                id: key,
                name: order.customer.name,
                instansi: order.customer.instansi || '',
                phone: order.customer.phone || '',
                timestamp: order.timestamp,
                receiptId: order.receiptId
              })
            } else {
              // Customer exists, check if this order is more recent
              const existingTimestamp = new Date(existingCustomer.timestamp).getTime()
              if (orderTimestamp > existingTimestamp) {
                // Update with more recent order
                customerMap.set(key, {
                  ...existingCustomer,
                  timestamp: order.timestamp,
                  receiptId: order.receiptId
                })
              }
            }
          }
        })

        // Convert to array and sort by most recent first (newest orders at the top)
        const customersList = Array.from(customerMap.values()).sort((a, b) => {
          const dateA = new Date(a.timestamp).getTime()
          const dateB = new Date(b.timestamp).getTime()
          // Sort descending: newest first (b - a)
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

  // Sync orderedBackFiles with backFiles when backFiles change
  useEffect(() => {
    if (backFiles.length > 0) {
      setOrderedBackFiles([...backFiles])
    } else {
      setOrderedBackFiles([])
    }
  }, [backFiles])

  // Handle customer selection
  const handleCustomerSelect = (customerId) => {
    setSelectedCustomerId(customerId)
    const selectedCustomer = customers.find(c => c.id === customerId)
    if (selectedCustomer) {
      setCustomerName(selectedCustomer.name)
      setInstansi(selectedCustomer.instansi)
      setCustomerNameError('') // Clear any errors
      setCustomerSearchTerm('') // Clear search after selection
    }
  }

  // Handle confirm customer info from dialog
  const handleConfirmCustomerInfo = () => {
    if (!validateCustomerInfo()) {
      return
    }
    setShowCustomerSelector(false)
    processWithCustomerInfo()
  }

  // Clear customer selection
  const handleClearCustomerSelection = () => {
    setSelectedCustomerId('')
    setCustomerName('')
    setInstansi('')
    setCustomerSearchTerm('')
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

  const handleFileChange = (e, isBack = false) => {
    const selectedFiles = Array.from(e.target.files)
    const imageFiles = selectedFiles.filter(file => 
      file.type.startsWith('image/') && 
      ['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)
    )
    if (isBack) {
      setBackFiles(prev => [...prev, ...imageFiles])
    } else {
      setFiles(prev => [...prev, ...imageFiles])
    }
  }

  const handleRemoveFile = (index, isBack = false) => {
    if (isBack) {
      setBackFiles(prev => prev.filter((_, i) => i !== index))
      setOrderedBackFiles(prev => prev.filter((_, i) => i !== index))
    } else {
      setFiles(prev => prev.filter((_, i) => i !== index))
    }
  }

  const handleSaveBackFileOrder = (orderedFiles) => {
    setOrderedBackFiles(orderedFiles)
    setBackFiles(orderedFiles) // Also update the original backFiles to keep them in sync
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e, isBack = false) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFiles = Array.from(e.dataTransfer.files)
    const imageFiles = droppedFiles.filter(file => 
      file.type.startsWith('image/') && 
      ['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)
    )
    if (isBack) {
      setBackFiles(prev => [...prev, ...imageFiles])
    } else {
      setFiles(prev => [...prev, ...imageFiles])
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
    // Open customer selector dialog
    setShowCustomerSelector(true)
  }

  const handleProcess = async () => {
    if (files.length === 0) {
      alert('Silakan pilih minimal satu file gambar')
      return
    }

    if (layout === 'kanan-kiri-beda' && backFiles.length === 0) {
      alert('Silakan pilih file gambar belakang')
      return
    }

    // Customer must be selected before processing
    if (!customerName.trim()) {
      setShowCustomerSelector(true)
      return
    }

    // If customer info exists but invalid, show popup
    if (!validateCustomerInfo()) {
      setShowCustomerSelector(true)
      return
    }

    // Proceed with processing
    await processWithCustomerInfo()
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

      if (layout === '1s') {
        await generateLayout1S(files, setProgress, customerInfo)
      } else if (layout === '2s-sama') {
        await generateLayout2SSama(files, setProgress, customerInfo)
      } else if (layout === 'kanan-kiri-beda') {
        // Use orderedBackFiles if available, otherwise use backFiles
        const backFilesToUse = orderedBackFiles.length > 0 ? orderedBackFiles : backFiles
        await generateLayoutKananKiriBeda(files, backFilesToUse, setProgress, customerInfo)
      }
      success = true
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error saat menghasilkan PDF: ' + error.message)
      success = false
    } finally {
      setIsProcessing(false)
      setProgress(0)
      
      // Play completion sound if processing was successful
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

  const getLayoutName = () => {
    if (layout === '1s') return 'IDC 1S'
    if (layout === '2s-sama') return 'IDC 2S (Sama Sisi)'
    if (layout === 'kanan-kiri-beda') return 'IDC 2S (Sisi Berbeda)'
    return 'Layout Tidak Dikenal'
  }

  const renderFileUploadArea = (title, fileList, isBack = false) => {
    const inputRef = isBack ? backInputRef : frontInputRef

    return (
      <div className="upload-section">
        <div className="upload-section-header">
          <div className="upload-section-header-left">
            <h3 className="upload-section-title">{title}</h3>
            <p className="upload-section-subtitle">
              {layout === 'kanan-kiri-beda' && isBack 
                ? 'Unggah gambar sisi belakang Anda' 
                : 'Unggah gambar ID card Anda'}
            </p>
          </div>
          {isBack && fileList.length > 1 && (
            <div className="upload-section-header-right">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowReorderDialog(true)}
                disabled={isProcessing}
                className="file-reorder-button-header"
              >
                <ArrowUpDown className="w-4 h-4 mr-2" />
                Atur Urutan ID Card Belakang
              </Button>
            </div>
          )}
        </div>

        <div
          className={`drop-zone ${isDragging ? 'dragging' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, isBack)}
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
            onChange={(e) => handleFileChange(e, isBack)}
            disabled={isProcessing}
            className="file-input"
          />
        </div>

        {fileList.length > 0 && (
          <div className="file-list-container">
            <button
              className="file-list-header"
              onClick={() => isBack ? setIsBackFileListExpanded(!isBackFileListExpanded) : setIsFileListExpanded(!isFileListExpanded)}
            >
              <span className="file-list-count">{fileList.length} file dipilih</span>
              {isBack ? (
                isBackFileListExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
              ) : (
                isFileListExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
              )}
            </button>
            {(isBack ? isBackFileListExpanded : isFileListExpanded) && (
              <>
                <div className="file-list-grid">
                  {fileList.map((file, index) => (
                    <div key={`${file.name}-${index}`} className="file-item">
                      <div className="file-type-badge">{getFileType(file)}</div>
                      <div className="file-info">
                        <p className="file-name">{file.name}</p>
                        <p className="file-size">{formatFileSize(file.size)}</p>
                      </div>
                      <button
                        className="file-delete-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemoveFile(index, isBack)
                        }}
                        disabled={isProcessing}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="file-selection">
      <div className="file-selection-header">
        <h2 className="file-selection-title">{getLayoutName()}</h2>
        <p className="file-selection-subtitle">Unggah gambar ID card Anda untuk menghasilkan layout PDF</p>
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
                      setSelectedCustomerId('') // Clear selection when manually editing
                      if (customerNameError) {
                        setCustomerNameError('')
                      }
                    }}
                    onBlur={() => {
                      if (!customerName.trim()) {
                        setCustomerNameError('Nama pelanggan wajib diisi')
                      } else if (customerName.trim().length < 2) {
                        setCustomerNameError('Nama pelanggan minimal 2 karakter')
                      } else {
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
                      setSelectedCustomerId('') // Clear selection when manually editing
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
                {/* Search Input */}
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

                {/* Customer List */}
                <div className="max-h-48 overflow-y-auto">
                  {filteredCustomers.length > 0 ? (
                    <div className="customer-list-container">
                      {filteredCustomers.map((customer) => {
                        // Format date - handle both string and Date object
                        const formatDate = (timestamp) => {
                          if (!timestamp) return ''
                          try {
                            const date = timestamp instanceof Date ? timestamp : new Date(timestamp)
                            if (isNaN(date.getTime())) {
                              // If invalid date, try to return original timestamp
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

            {/* Action Buttons */}
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

      <div className="file-upload-container">
        {renderFileUploadArea(
          layout === 'kanan-kiri-beda' ? 'Gambar Depan' : 'Pilih Gambar',
          files,
          false
        )}

        {layout === 'kanan-kiri-beda' && renderFileUploadArea('Gambar Belakang', backFiles, true)}
      </div>

      {isProcessing && (
        <div className="processing-section">
          <ProgressBar progress={progress} />
        </div>
      )}

      {/* Back File Reorder Dialog */}
      {showReorderDialog && layout === 'kanan-kiri-beda' && backFiles.length > 1 && (
        <BackFileReorder
          files={backFiles}
          frontFiles={files}
          onClose={() => setShowReorderDialog(false)}
          onSave={handleSaveBackFileOrder}
        />
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
                disabled={isProcessing || files.length === 0 || (layout === 'kanan-kiri-beda' && backFiles.length === 0)}
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
                    <ArrowRight className="mr-1 md:mr-2 h-4 w-4" />
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

export default FileSelection

