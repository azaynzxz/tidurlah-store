import { useState, useRef } from "react";
import { Upload, File, X, CheckCircle, AlertCircle } from "lucide-react";

interface FileUploaderProps {
  label: string;
  accept?: string;
  maxSize?: number; // in MB
  required?: boolean;
  value?: File | null;
  onChange: (file: File | null) => void;
  error?: string;
  description?: string;
}

const FileUploader = ({
  label,
  accept = ".pdf,.doc,.docx",
  maxSize = 10,
  required = false,
  value,
  onChange,
  error,
  description
}: FileUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `Ukuran file terlalu besar. Maksimal ${maxSize}MB`;
    }

    // Check file type
    const acceptedExtensions = accept.split(",").map(ext => ext.trim().toLowerCase());
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
    
    if (!acceptedExtensions.some(ext => fileExtension === ext || ext === "*")) {
      return `Format file tidak didukung. Gunakan: ${accept}`;
    }

    return null;
  };

  const handleFileSelect = (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setUploadError(validationError);
      onChange(null);
      return;
    }

    setUploadError("");
    onChange(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemove = () => {
    onChange(null);
    setUploadError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const displayError = error || uploadError;

  return (
    <div className="w-full">
      <label className="block text-xs font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      {description && (
        <p className="text-xs text-gray-500 mb-1.5">{description}</p>
      )}

      {!value ? (
        <div
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            relative border-2 border-dashed rounded-lg p-4 cursor-pointer transition-all
            ${isDragging 
              ? "border-[#FF5E01] bg-[#FF5E01]/5" 
              : "border-gray-300 hover:border-[#FF5E01] hover:bg-gray-50"
            }
            ${displayError ? "border-red-500" : ""}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileInputChange}
            className="hidden"
          />
          
          <div className="flex flex-col items-center justify-center text-center">
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center mb-2
              ${isDragging ? "bg-[#FF5E01] text-white" : "bg-gray-100 text-gray-400"}
            `}>
              <Upload className="h-5 w-5" />
            </div>
            <p className="text-xs font-medium text-gray-700 mb-0.5">
              Klik untuk upload atau drag & drop
            </p>
            <p className="text-xs text-gray-500">
              {accept.replace(/\./g, "").replace(/,/g, ", ")} (Maks. {maxSize}MB)
            </p>
          </div>
        </div>
      ) : (
        <div className="border border-gray-300 rounded-lg p-3 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="flex-shrink-0 w-8 h-8 bg-[#FF5E01]/10 rounded-lg flex items-center justify-center">
                <File className="h-4 w-4 text-[#FF5E01]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900 truncate">
                  {value.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(value.size)}
                </p>
              </div>
              <div className="flex-shrink-0">
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="ml-2 flex-shrink-0 p-1 text-gray-400 hover:text-red-500 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {displayError && (
        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600">
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
          <span>{displayError}</span>
        </div>
      )}
    </div>
  );
};

export default FileUploader;

