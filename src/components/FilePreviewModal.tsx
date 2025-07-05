'use client'

import { useState, useEffect } from 'react'
import { X, Download, ExternalLink } from 'lucide-react'
import AuthenticatedImage from './AuthenticatedImage'

interface FileItem {
  id: number
  name: string
  original_name: string
  mime_type: string
  size: number
  backblaze_url: string
  thumbnail_path: string
  has_thumbnail: boolean
  created_at: string
  access_level: string
}

interface FilePreviewModalProps {
  file: FileItem
  onClose: () => void
  onDownload: (file: FileItem) => Promise<void>
  onCreatePublicLink: (file: FileItem) => Promise<void>
  formatFileSize: (size: number) => string
}

export default function FilePreviewModal({ 
  file, 
  onClose, 
  onDownload, 
  onCreatePublicLink, 
  formatFileSize 
}: FilePreviewModalProps) {
  const isImage = file.mime_type.startsWith('image/')
  const isVideo = file.mime_type.startsWith('video/')
  const isPDF = file.mime_type === 'application/pdf'
  const isDocument = isDocumentType(file.mime_type)
  
  const [error, setError] = useState(false)
  const [blobUrl, setBlobUrl] = useState<string | null>(null)

  function isDocumentType(mimeType: string) {
    const documentTypes = [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain'
    ]
    return documentTypes.includes(mimeType)
  }

  // Fetch blob data for videos and PDFs
  useEffect(() => {
    if (isVideo || isPDF) {
      const fetchFileData = async () => {
        try {
          setError(false)
          
          const token = localStorage.getItem('token')
          if (!token) {
            setError(true)
            return
          }

          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/files/${file.id}/view`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })

          if (response.ok) {
            const blob = await response.blob()
            console.log(`Successfully loaded ${isVideo ? 'video' : 'PDF'} blob:`, blob.size, 'bytes', blob.type)
            const url = URL.createObjectURL(blob)
            setBlobUrl(url)
            console.log(`Created blob URL for ${isVideo ? 'video' : 'PDF'}:`, url)
          } else {
            console.error('Failed to load file:', response.status, response.statusText)
            setError(true)
          }
        } catch (err) {
          console.error('Failed to load file:', err)
          setError(true)
        } finally {
          // Loading is handled by individual components
        }
      }

      fetchFileData()
    }

    // Cleanup function
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl)
      }
    }
  }, [file.id, isVideo, isPDF])

  // Cleanup blob URL when component unmounts
  useEffect(() => {
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl)
      }
    }
  }, [blobUrl])



  const renderPreviewContent = () => {
    if (isImage) {
      return (
        <div className="flex items-center justify-center">
          <AuthenticatedImage
            fileId={file.id}
            alt={file.original_name}
            className="max-w-full max-h-[80vh] object-contain"
            onError={() => setError(true)}
          />
        </div>
      )
    }

    if (isVideo) {
      if (!blobUrl) {
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-500">Loading video...</p>
            </div>
          </div>
        )
      }
      
      return (
        <div className="flex items-center justify-center">
          <video
            className="max-w-full max-h-[80vh]"
            controls
            src={blobUrl}
            onError={() => setError(true)}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      )
    }

    if (isPDF) {
      if (!blobUrl) {
        return (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-500">Loading PDF...</p>
            </div>
          </div>
        )
      }
      
      return (
        <iframe
          src={blobUrl}
          className="w-full h-[80vh] border-0"
          onError={() => setError(true)}
          title={file.original_name}
        />
      )
    }

    if (isDocument) {
      return (
        <div className="text-center py-16">
          <div className="mb-4">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Document Preview</h3>
          <p className="text-gray-500 mb-6">
            Preview for {getFileTypeName(file.mime_type)} files is not yet supported.
          </p>
          <p className="text-sm text-gray-400 mb-4">
            You can download the file to view it in your default application.
          </p>
        </div>
      )
    }

    // Fallback for unsupported file types
    return (
      <div className="text-center py-16">
        <div className="mb-4">
          <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Preview Not Available</h3>
        <p className="text-gray-500 mb-4">
          Preview for this file type is not supported.
        </p>
        <p className="text-sm text-gray-400">
          Download the file to view it in your default application.
        </p>
      </div>
    )
  }

  const getFileTypeName = (mimeType: string) => {
    if (mimeType.includes('word')) return 'Word Document'
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'Excel Spreadsheet'
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'PowerPoint Presentation'
    if (mimeType === 'text/plain') return 'Text File'
    return 'Document'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="relative max-h-[95vh] max-w-[95vw] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 min-w-0">
          <div className="text-white min-w-0 flex-1">
            <h2 className="text-lg font-medium truncate">{file.original_name}</h2>
            <p className="text-sm text-gray-300">{formatFileSize(file.size)}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 p-2 ml-4 flex-shrink-0"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Preview Content */}
        <div className="bg-white rounded-lg overflow-hidden relative min-w-0">
          {error ? (
            <div className="text-center py-16">
              <div className="mb-4">
                <svg className="mx-auto h-16 w-16 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Preview Error</h3>
              <p className="text-gray-500">Failed to load preview for this file.</p>
            </div>
          ) : (
            renderPreviewContent()
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2 mt-4">
          <button
            onClick={() => onDownload(file)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            <Download className="h-4 w-4" />
            <span>Download</span>
          </button>
          {file.access_level === 'owner' && (
            <button
              onClick={() => onCreatePublicLink(file)}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Share</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}