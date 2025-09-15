'use client'

import { useState, useRef } from 'react'
import { api } from '@/lib/auth-context'
import { X, Upload, FileIcon, FolderOpen } from 'lucide-react'
import FolderUploadModal from './FolderUploadModal'
import { useToast } from '@/lib/toast-context'

interface UploadModalProps {
  currentFolder: number | null
  onClose: () => void
  onUploadComplete: () => void
}

export default function UploadModal({ currentFolder, onClose, onUploadComplete }: UploadModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [error, setError] = useState('')
  const [showFolderModal, setShowFolderModal] = useState(false)
  const [pendingFolderName, setPendingFolderName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { showSuccess, showError, showWarning } = useToast()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      
      // Check if this is a folder upload by checking if files have webkitRelativePath
      const isFolder = files.length > 0 && files[0].webkitRelativePath !== ''
      
      if (isFolder) {
        // Extract folder name from the first file's path
        const folderName = files[0].webkitRelativePath.split('/')[0]
        setPendingFolderName(folderName)
        setSelectedFiles(files)
        setShowFolderModal(true)
      } else {
        setSelectedFiles(files)
        setError('')
      }
    }
  }

  const handleFolderUploadConfirm = (preserveStructure: boolean, overwriteExisting: boolean) => {
    setShowFolderModal(false)
    setError('')
    showSuccess(
      'Folder selected successfully', 
      `${selectedFiles.length} files from "${pendingFolderName}" ready for upload`
    )
  }

  const handleSelectFolder = () => {
    if (fileInputRef.current) {
      fileInputRef.current.webkitdirectory = true
      fileInputRef.current.click()
      // Reset after use
      setTimeout(() => {
        if (fileInputRef.current) {
          fileInputRef.current.webkitdirectory = false
        }
      }, 100)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    const items = Array.from(e.dataTransfer.items)
    const files: File[] = []
    let hasDirectories = false

    // Handle both files and folders
    for (const item of items) {
      if (item.kind === 'file') {
        if (item.webkitGetAsEntry) {
          const entry = item.webkitGetAsEntry()
          if (entry) {
            if (entry.isDirectory) {
              hasDirectories = true
            }
            await processEntry(entry, files)
          }
        } else {
          const file = item.getAsFile()
          if (file) files.push(file)
        }
      }
    }

    if (hasDirectories && files.length > 0) {
      // Extract folder name from the first file's path (if it has one)
      const folderName = files.find(f => f.webkitRelativePath)?.webkitRelativePath.split('/')[0] || 'Dropped Folder'
      setPendingFolderName(folderName)
      setSelectedFiles(files)
      setShowFolderModal(true)
    } else {
      setSelectedFiles(files)
      setError('')
    }
  }

  // Process directory entries recursively for folder uploads
  const processEntry = async (entry: any, files: File[]): Promise<void> => {
    return new Promise((resolve) => {
      if (entry.isFile) {
        entry.file((file: File) => {
          files.push(file)
          resolve()
        })
      } else if (entry.isDirectory) {
        const reader = entry.createReader()
        reader.readEntries(async (entries: any[]) => {
          for (const childEntry of entries) {
            await processEntry(childEntry, files)
          }
          resolve()
        })
      } else {
        resolve()
      }
    })
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return

    setUploading(true)
    setError('')

    try {
      // Check for oversized files (1GB limit)
      const oversizedFiles = selectedFiles.filter(file => file.size > 1024 * 1024 * 1024)
      if (oversizedFiles.length > 0) {
        setError(`The following files exceed the 1GB limit: ${oversizedFiles.map(f => f.name).join(', ')}`)
        setUploading(false)
        return
      }

      // Use the new multiple upload endpoint if more than one file
      if (selectedFiles.length > 1) {
        const formData = new FormData()
        selectedFiles.forEach(file => {
          formData.append('files', file)
        })
        if (currentFolder) {
          formData.append('folder_id', currentFolder.toString())
        }

        const response = await api.post('/api/files/upload/multiple', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1)
            )
            // Set progress for all files during batch upload
            const progressUpdate: { [key: string]: number } = {}
            selectedFiles.forEach(file => {
              progressUpdate[file.name] = progress
            })
            setUploadProgress(progressUpdate)
          }
        })

        onUploadComplete()
        onClose()
      } else {
        // Single file upload using existing endpoint
        const file = selectedFiles[0]
        const formData = new FormData()
        formData.append('file', file)
        if (currentFolder) {
          formData.append('folder_id', currentFolder.toString())
        }

        const response = await api.post('/api/files/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1)
            )
            setUploadProgress({
              [file.name]: progress
            })
          }
        })

        onUploadComplete()
        onClose()
      }
    } catch (error: any) {
      if (error.response?.status === 413) {
        // Storage limit exceeded
        const details = error.response?.data?.details
        let errorMessage = error.response?.data?.error || 'Insufficient storage space'
        
        if (details) {
          errorMessage += `\n\nUpload size: ${details.totalUploadSize || details.fileSize}\nAvailable space: ${details.availableSpace}\nTotal quota: ${details.quotaLimit}`
        }
        
        setError(errorMessage)
      } else {
        const errorMessage = error.response?.data?.error || 
                            error.response?.data?.message || 
                            'Upload failed'
        setError(errorMessage)
      }
    } finally {
      setUploading(false)
      setUploadProgress({})
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Upload Files</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6 hover:border-primary-400 transition-colors"
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              Drop files or folders here or click to browse
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Supports all file types up to 1GB each (images, videos, documents, archives, audio, etc.)
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
              >
                Select Files
              </button>
              <button
                onClick={handleSelectFolder}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Select Folder
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept="*/*"
            />
          </div>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Selected Files ({selectedFiles.length})
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <FileIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>

                    {uploading && uploadProgress[file.name] !== undefined && (
                      <div className="flex items-center space-x-2 ml-4">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full transition-all"
                            style={{ width: `${uploadProgress[file.name]}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">{uploadProgress[file.name]}%</span>
                      </div>
                    )}

                    {!uploading && (
                      <button
                        onClick={() => removeFile(index)}
                        className="text-gray-400 hover:text-red-500 ml-4"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 text-red-600 text-sm bg-red-50 border border-red-200 rounded-md p-3">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              disabled={uploading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={uploadFiles}
              disabled={selectedFiles.length === 0 || uploading}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} file${selectedFiles.length !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      </div>

      {/* Folder Upload Modal */}
      <FolderUploadModal
        isOpen={showFolderModal}
        onClose={() => {
          setShowFolderModal(false)
          setSelectedFiles([])
          setPendingFolderName('')
        }}
        onConfirm={handleFolderUploadConfirm}
        folderName={pendingFolderName}
        fileCount={selectedFiles.length}
        isLoading={false}
      />
    </div>
  )
}