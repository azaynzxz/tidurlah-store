import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ArrowLeft, Cloud, Download, Trash2, ChevronDown, ChevronUp, AlertCircle, User, Search, X, Crop, Plus, Minus, ArrowRight, Edit } from 'lucide-react'
import { generateDualColumnLanyardPDF } from '../utils/dualColumnLanyardPdfGenerator'
import ProgressBar from './ProgressBar'
import LanyardRectangularCropper from './LanyardRectangularCropper'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { getDualLanyardMaxRows } from '../utils/constants'
import processCompleteSound from '@/components/process-complete.mp3'
import './FileSelection.css'
import './ImageCropper.css'

function DualColumnLanyardSelection({ onBack }) {
    const [activeTab, setActiveTab] = useState('short') // 'short' or 'long'
    const [shortFiles, setShortFiles] = useState([]) // Array of { original: File, cropped: File, quantity: number }
    const [longFiles, setLongFiles] = useState([]) // Array of { file: File, quantity: number }
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
    const [currentCropFile, setCurrentCropFile] = useState(null)
    const [pendingFiles, setPendingFiles] = useState([])
    const [editingFileIndex, setEditingFileIndex] = useState(null)
    const [lanyardHeight, setLanyardHeight] = useState(2.25) // 2, 2.25, 2.3, 2.4
    const [imagePreviews, setImagePreviews] = useState({}) // Store preview URLs by file name
    const shortInputRef = useRef(null)
    const longInputRef = useRef(null)

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

    // Handle customer selection
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

    // Handle file change for short version (with cropping)
    const handleShortFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files)
        const imageFiles = selectedFiles.filter(file =>
            file.type.startsWith('image/') &&
            ['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)
        )

        if (imageFiles.length > 0) {
            setPendingFiles(prev => [...prev, ...imageFiles])
            if (!currentCropFile) {
                setCurrentCropFile(imageFiles[0])
            }
        }
    }

    // Handle file change for long version (no cropping)
    const handleLongFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files)
        const imageFiles = selectedFiles.filter(file =>
            file.type.startsWith('image/') &&
            ['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)
        )

        if (imageFiles.length > 0) {
            const newFiles = imageFiles.map(file => ({ file, quantity: 1 }))
            setLongFiles(prev => [...prev, ...newFiles])
            setIsFileListExpanded(true) // Auto-expand when files are added
        }
    }

    // Load image previews when files change
    useEffect(() => {
        const loadPreviews = () => {
            // Load short files previews
            shortFiles.forEach(fileItem => {
                const file = fileItem.original
                if (!imagePreviews[file.name]) {
                    const reader = new FileReader()
                    reader.onload = (e) => {
                        setImagePreviews(current => ({ ...current, [file.name]: e.target.result }))
                    }
                    reader.readAsDataURL(file)
                }
            })

            // Load long files previews
            longFiles.forEach(fileItem => {
                const file = fileItem.file
                if (!imagePreviews[file.name]) {
                    const reader = new FileReader()
                    reader.onload = (e) => {
                        setImagePreviews(current => ({ ...current, [file.name]: e.target.result }))
                    }
                    reader.readAsDataURL(file)
                }
            })
        }

        if (shortFiles.length > 0 || longFiles.length > 0) {
            loadPreviews()
        }
    }, [shortFiles, longFiles])

    // Clean up preview URLs when files are removed
    useEffect(() => {
        const shortFileNames = new Set(shortFiles.map(item => item.original.name))
        const longFileNames = new Set(longFiles.map(item => item.file.name))
        const allFileNames = new Set([...shortFileNames, ...longFileNames])

        setImagePreviews(prev => {
            const updated = {}
            Object.keys(prev).forEach(key => {
                if (allFileNames.has(key)) {
                    updated[key] = prev[key]
                }
            })
            return updated
        })
    }, [shortFiles, longFiles])

    const handleRemoveShortFile = (index) => {
        const fileToRemove = shortFiles[index]
        if (imagePreviews[fileToRemove.original.name]) {
            URL.revokeObjectURL(imagePreviews[fileToRemove.original.name])
            setImagePreviews(prev => {
                const updated = { ...prev }
                delete updated[fileToRemove.original.name]
                return updated
            })
        }
        setShortFiles(prev => prev.filter((_, i) => i !== index))
    }

    const handleRemoveLongFile = (index) => {
        const fileToRemove = longFiles[index]
        if (imagePreviews[fileToRemove.file.name]) {
            URL.revokeObjectURL(imagePreviews[fileToRemove.file.name])
            setImagePreviews(prev => {
                const updated = { ...prev }
                delete updated[fileToRemove.file.name]
                return updated
            })
        }
        setLongFiles(prev => prev.filter((_, i) => i !== index))
    }

    const handleShortQuantityChange = (index, delta) => {
        setShortFiles(prev => prev.map((item, i) => {
            if (i === index) {
                const newQuantity = Math.max(1, item.quantity + delta)
                return { ...item, quantity: newQuantity }
            }
            return item
        }))
    }

    const handleLongQuantityChange = (index, delta) => {
        setLongFiles(prev => prev.map((item, i) => {
            if (i === index) {
                const newQuantity = Math.max(1, item.quantity + delta)
                return { ...item, quantity: newQuantity }
            }
            return item
        }))
    }

    const handleShortQuantityInput = (index, value) => {
        const numValue = parseInt(value) || 1
        const quantity = Math.max(1, numValue)
        setShortFiles(prev => prev.map((item, i) => {
            if (i === index) {
                return { ...item, quantity }
            }
            return item
        }))
    }

    const handleLongQuantityInput = (index, value) => {
        const numValue = parseInt(value) || 1
        const quantity = Math.max(1, numValue)
        setLongFiles(prev => prev.map((item, i) => {
            if (i === index) {
                return { ...item, quantity }
            }
            return item
        }))
    }

    // Calculate total pages needed
    const calculateTotalPages = () => {
        const maxRows = getDualLanyardMaxRows(lanyardHeight)
        const imagesPerPage = maxRows * 9 // 9 columns

        let totalShortImages = shortFiles.reduce((sum, item) => sum + item.quantity, 0)
        let totalLongImages = longFiles.reduce((sum, item) => sum + item.quantity, 0)

        const shortPages = Math.ceil(totalShortImages / imagesPerPage)
        const longPages = Math.ceil(totalLongImages / imagesPerPage)

        return Math.max(shortPages, longPages)
    }

    const getTotalShortImages = () => {
        return shortFiles.reduce((sum, item) => sum + item.quantity, 0)
    }

    const getTotalLongImages = () => {
        return longFiles.reduce((sum, item) => sum + item.quantity, 0)
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
            if (activeTab === 'short') {
                setPendingFiles(prev => [...prev, ...imageFiles])
                if (!currentCropFile) {
                    setCurrentCropFile(imageFiles[0])
                }
            } else {
                const newFiles = imageFiles.map(file => ({ file, quantity: 1 }))
                setLongFiles(prev => [...prev, ...newFiles])
            }
        }
    }

    const handleCropSave = (croppedFile) => {
        const originalFile = currentCropFile

        if (editingFileIndex !== null) {
            setShortFiles(prev => prev.map((f, idx) => {
                if (idx === editingFileIndex) {
                    return { original: f.original, cropped: croppedFile, quantity: f.quantity }
                }
                return f
            }))
            setCurrentCropFile(null)
            setEditingFileIndex(null)
            return
        }

        setShortFiles(prev => [...prev, { original: originalFile, cropped: croppedFile, quantity: 1 }])
        setIsFileListExpanded(true) // Auto-expand when file is added

        const currentIndex = pendingFiles.findIndex(f => f === currentCropFile)
        const remaining = pendingFiles.filter((_, i) => i !== currentIndex)
        setPendingFiles(remaining)

        if (remaining.length > 0) {
            setCurrentCropFile(remaining[0])
        } else {
            setCurrentCropFile(null)
        }
    }

    const handleEditCrop = (fileItem, index) => {
        setEditingFileIndex(index)
        setCurrentCropFile(fileItem.original)
    }

    const handleCropCancel = () => {
        if (editingFileIndex !== null) {
            setCurrentCropFile(null)
            setEditingFileIndex(null)
            return
        }

        const currentIndex = pendingFiles.findIndex(f => f === currentCropFile)
        const remaining = pendingFiles.filter((_, i) => i !== currentIndex)
        setPendingFiles(remaining)

        if (remaining.length > 0) {
            setCurrentCropFile(remaining[0])
        } else {
            setCurrentCropFile(null)
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

    const handleProcess = async () => {
        if (shortFiles.length === 0 && longFiles.length === 0) {
            alert('Silakan pilih minimal satu file gambar untuk Layout Pendek atau Layout Panjang')
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

            await generateDualColumnLanyardPDF(
                shortFiles,
                longFiles,
                lanyardHeight,
                setProgress,
                customerInfo
            )
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

    const renderFileList = (files, isShort) => {
        if (files.length === 0) return null

        const totalImages = isShort ? getTotalShortImages() : getTotalLongImages()
        const handleRemove = isShort ? handleRemoveShortFile : handleRemoveLongFile
        const handleQuantityChange = isShort ? handleShortQuantityChange : handleLongQuantityChange
        const handleQuantityInput = isShort ? handleShortQuantityInput : handleLongQuantityInput

        return (
            <div className="file-list-container">
                <button
                    className="file-list-header"
                    onClick={() => setIsFileListExpanded(!isFileListExpanded)}
                >
                    <span className="file-list-count">
                        {files.length} file dipilih • {totalImages} total gambar
                    </span>
                    {isFileListExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {isFileListExpanded && (
                    <>
                        <div className="file-list-grid">
                            {files.map((fileItem, index) => {
                                const file = isShort ? fileItem.original : fileItem.file
                                return (
                                    <div key={`${file.name}-${index}`} className="file-item">
                                        {imagePreviews[file.name] && (
                                            <img
                                                src={imagePreviews[file.name]}
                                                alt={file.name}
                                                className="w-12 h-12 object-cover rounded border border-gray-200 flex-shrink-0"
                                            />
                                        )}
                                        <div className="file-info flex-1 min-w-0 flex flex-col">
                                            <p className="file-name truncate">{file.name}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <label className="text-xs text-gray-600 whitespace-nowrap">QTY:</label>
                                                <div className="flex items-center gap-1 border rounded bg-white">
                                                    <button
                                                        type="button"
                                                        className="p-1 hover:bg-gray-100 disabled:opacity-50 transition-colors"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleQuantityChange(index, -1)
                                                        }}
                                                        disabled={isProcessing || fileItem.quantity <= 1}
                                                    >
                                                        <Minus className="w-3 h-3" />
                                                    </button>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={fileItem.quantity}
                                                        onChange={(e) => {
                                                            e.stopPropagation()
                                                            handleQuantityInput(index, e.target.value)
                                                        }}
                                                        onClick={(e) => e.stopPropagation()}
                                                        disabled={isProcessing}
                                                        className="w-14 text-center text-sm border-0 focus:outline-none bg-transparent"
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
                                        {isShort && (
                                            <button
                                                className="file-delete-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleEditCrop(fileItem, index)
                                                }}
                                                disabled={isProcessing}
                                                title="Edit crop"
                                            >
                                                <Crop className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button
                                            className="file-delete-btn"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleRemove(index)
                                            }}
                                            disabled={isProcessing}
                                            title="Hapus file"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    </>
                )}
            </div>
        )
    }

    return (
        <div className="file-selection">
            <div className="file-selection-header">
                <h2 className="file-selection-title">Layout Lanyard Mesin Panjang</h2>
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
                                                                    <div className="customer-list-info-row text-xs text-gray-600">
                                                                        {customer.instansi}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500 text-center py-4">Tidak ada pelanggan ditemukan</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-2 border-t pt-4">
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
                            Konfirmasi
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Cropper Dialog */}
            {currentCropFile && (
                <LanyardRectangularCropper
                    file={currentCropFile}
                    onSave={handleCropSave}
                    onCancel={handleCropCancel}
                    heightCm={lanyardHeight}
                />
            )}

            <div className="upload-section">
                {/* Height Preset Selector */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tinggi Lanyard
                    </label>
                    <div className="flex gap-2 flex-wrap">
                        {[2, 2.25, 2.3, 2.4].map(height => (
                            <button
                                key={height}
                                type="button"
                                onClick={() => setLanyardHeight(height)}
                                className={`
                  px-6 py-3 rounded-full font-medium text-sm transition-all
                  ${lanyardHeight === height
                                        ? 'bg-primary text-primary-foreground shadow-md'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }
                `}
                                disabled={isProcessing}
                            >
                                {height} cm
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        Maksimal {getDualLanyardMaxRows(lanyardHeight)} baris per halaman
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex border-b mb-4">
                    <button
                        className={`px-6 py-3 font-medium text-sm transition-colors ${activeTab === 'short'
                            ? 'border-b-2 border-primary text-primary'
                            : 'text-gray-600 hover:text-gray-800'
                            }`}
                        onClick={() => {
                            setActiveTab('short')
                            // Reset file inputs to allow reselection
                            if (longInputRef.current) {
                                longInputRef.current.value = ''
                            }
                        }}
                        disabled={isProcessing}
                    >
                        Layout Pendek ({shortFiles.length})
                    </button>
                    <button
                        className={`px-6 py-3 font-medium text-sm transition-colors ${activeTab === 'long'
                            ? 'border-b-2 border-primary text-primary'
                            : 'text-gray-600 hover:text-gray-800'
                            }`}
                        onClick={() => {
                            setActiveTab('long')
                            // Reset file inputs to allow reselection
                            if (shortInputRef.current) {
                                shortInputRef.current.value = ''
                            }
                        }}
                        disabled={isProcessing}
                    >
                        Layout Panjang ({longFiles.length})
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'short' ? (
                    <div>
                        <h3 className="upload-section-title">Layout Pendek</h3>

                        <div
                            className={`drop-zone ${isDragging ? 'dragging' : ''}`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => shortInputRef.current?.click()}
                        >
                            <Cloud className="drop-zone-icon" />
                            <p className="drop-zone-text">Jatuhkan file Anda di sini atau jelajahi</p>
                            <p className="drop-zone-hint">Ukuran file maksimal hingga 1 GB</p>
                            <input
                                ref={shortInputRef}
                                type="file"
                                multiple
                                accept="image/png,image/jpeg,image/jpg"
                                onChange={handleShortFileChange}
                                disabled={isProcessing}
                                className="file-input"
                            />
                        </div>

                        {renderFileList(shortFiles, true)}
                    </div>
                ) : (
                    <div>
                        <h3 className="upload-section-title">Layout Panjang</h3>

                        <div
                            className={`drop-zone ${isDragging ? 'dragging' : ''}`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => longInputRef.current?.click()}
                        >
                            <Cloud className="drop-zone-icon" />
                            <p className="drop-zone-text">Jatuhkan file Anda di sini atau jelajahi</p>
                            <p className="drop-zone-hint">Ukuran file maksimal hingga 1 GB</p>
                            <input
                                ref={longInputRef}
                                type="file"
                                multiple
                                accept="image/png,image/jpeg,image/jpg"
                                onChange={handleLongFileChange}
                                disabled={isProcessing}
                                className="file-input"
                            />
                        </div>

                        {renderFileList(longFiles, false)}
                    </div>
                )}

                {/* Summary and Actions */}

            </div>


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
                                onClick={customerName ? handleProcess : () => setShowCustomerSelector(true)}
                                disabled={isProcessing || (shortFiles.length === 0 && longFiles.length === 0)}
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

            {/* Progress Bar */}
            {isProcessing && createPortal(
                <ProgressBar progress={progress} />,
                document.body
            )}
        </div>
    )
}

export default DualColumnLanyardSelection
