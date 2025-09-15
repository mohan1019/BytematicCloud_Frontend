'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Download, Image, Video, FileText, Eye, Music, Archive } from 'lucide-react'

interface PublicFileInfo {
  fileName: string
  mimeType: string
  size: number
  downloadCount: number
  isImage: boolean
  isVideo: boolean
  hasThumbnail?: boolean
}

export default function PublicFilePage() {
  const params = useParams()
  const shareToken = params.shareToken as string
  const [fileInfo, setFileInfo] = useState<PublicFileInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadFileInfo()
  }, [shareToken])

  const loadFileInfo = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/files/public/${shareToken}/info`)
      
      if (!response.ok) {
        throw new Error('File not found or link expired')
      }

      const data = await response.json()
      setFileInfo(data)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    // Create a temporary link element and trigger download
    const link = document.createElement('a')
    link.href = `${process.env.NEXT_PUBLIC_API_URL}/api/files/public/${shareToken}`
    link.download = fileInfo?.fileName || 'download'
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="h-16 w-16 text-green-500" />
    if (mimeType.startsWith('video/')) return <Video className="h-16 w-16 text-purple-500" />
    if (mimeType.startsWith('audio/')) return <Music className="h-16 w-16 text-orange-500" />
    if (mimeType === 'application/pdf') return <FileText className="h-16 w-16 text-red-500" />
    if (mimeType.startsWith('text/')) return <FileText className="h-16 w-16 text-blue-500" />
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('archive')) {
      return <Archive className="h-16 w-16 text-yellow-500" />
    }
    return <FileText className="h-16 w-16 text-gray-500" />
  }

  const isPDF = (mimeType: string) => mimeType === 'application/pdf'
  const isAudio = (mimeType: string) => mimeType.startsWith('audio/')
  const isText = (mimeType: string) => mimeType.startsWith('text/') || mimeType === 'application/json'
  const isPreviewable = (mimeType: string) => 
    fileInfo?.isImage || fileInfo?.isVideo || isPDF(mimeType) || isAudio(mimeType)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔗</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Link Not Found</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  if (!fileInfo) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">ByteCloud</h1>
            <span className="text-sm text-gray-500">Shared File</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* File Preview */}
          {fileInfo.isImage && (
            <div className="bg-gray-100 flex items-center justify-center min-h-[400px] max-h-[600px]">
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL}/api/files/public/${shareToken}/view`}
                alt={fileInfo.fileName}
                className="max-w-full max-h-full object-contain rounded"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  const parent = target.parentElement
                  if (parent) {
                    parent.innerHTML = `
                      <div class="text-center">
                        <div class="h-16 w-16 text-gray-400 mx-auto mb-4">
                          <svg fill="currentColor" viewBox="0 0 24 24">
                            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                          </svg>
                        </div>
                        <p class="text-gray-600">Image preview not available</p>
                      </div>
                    `
                  }
                }}
              />
            </div>
          )}

          {fileInfo.isVideo && (
            <div className="bg-gray-100">
              <video
                controls
                className="w-full max-h-[600px]"
                preload="metadata"
                poster={fileInfo.hasThumbnail ? `${process.env.NEXT_PUBLIC_API_URL}/api/files/public/${shareToken}/thumbnail` : undefined}
              >
                <source src={`${process.env.NEXT_PUBLIC_API_URL}/api/files/public/${shareToken}/view`} type={fileInfo.mimeType} />
                Your browser does not support the video tag.
              </video>
            </div>
          )}

          {isPDF(fileInfo.mimeType) && (
            <div className="bg-gray-100 min-h-[600px]">
              <iframe
                src={`${process.env.NEXT_PUBLIC_API_URL}/api/files/public/${shareToken}/view`}
                className="w-full h-[600px] border-0"
                title={fileInfo.fileName}
              />
            </div>
          )}

          {isAudio(fileInfo.mimeType) && (
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-8 min-h-[300px] flex items-center justify-center">
              <div className="text-center max-w-md">
                <div className="mb-6">
                  <Music className="h-20 w-20 text-purple-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{fileInfo.fileName}</h3>
                </div>
                <audio
                  controls
                  className="w-full mb-4"
                  preload="metadata"
                >
                  <source src={`${process.env.NEXT_PUBLIC_API_URL}/api/files/public/${shareToken}/view`} type={fileInfo.mimeType} />
                  Your browser does not support the audio tag.
                </audio>
                <p className="text-sm text-gray-600">Audio file - {formatFileSize(fileInfo.size)}</p>
              </div>
            </div>
          )}

          {isText(fileInfo.mimeType) && (
            <div className="bg-gray-50 border border-gray-200">
              <div className="p-4 border-b bg-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Text Content Preview</span>
                  <Eye className="h-4 w-4 text-gray-500" />
                </div>
              </div>
              <iframe
                src={`${process.env.NEXT_PUBLIC_API_URL}/api/files/public/${shareToken}/view`}
                className="w-full h-[400px] border-0"
                title={fileInfo.fileName}
              />
            </div>
          )}

          {!isPreviewable(fileInfo.mimeType) && (
            <div className="bg-gray-100 flex items-center justify-center min-h-[300px]">
              <div className="text-center max-w-md">
                {getFileIcon(fileInfo.mimeType)}
                <h3 className="mt-4 text-lg font-medium text-gray-900">{fileInfo.fileName}</h3>
                <p className="mt-2 text-gray-600">Preview not available for this file type</p>
                <p className="mt-1 text-sm text-gray-500">Click download to view the file</p>
                <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
                  {fileInfo.mimeType}
                </div>
              </div>
            </div>
          )}

          {/* File Info */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-semibold text-gray-900 truncate">{fileInfo.fileName}</h2>
                <div className="flex items-center flex-wrap gap-x-4 gap-y-2 mt-2 text-sm text-gray-500">
                  <span>Size: {formatFileSize(fileInfo.size)}</span>
                  <span>Downloads: {fileInfo.downloadCount}</span>
                  <span>Type: {fileInfo.mimeType}</span>
                  {isPreviewable(fileInfo.mimeType) && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <Eye className="w-3 h-3 mr-1" />
                      Previewable
                    </span>
                  )}
                </div>
              </div>
              
              <button
                onClick={handleDownload}
                className="flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 transition-colors"
              >
                <Download className="h-5 w-5" />
                <span>Download</span>
              </button>
            </div>

            {/* Additional Info */}
            <div className="border-t pt-4">
              <div className="text-center text-sm text-gray-500">
                <p>This file was shared via ByteCloud</p>
                <p className="mt-1">
                  <a 
                    href="/" 
                    className="text-primary-600 hover:text-primary-700"
                  >
                    Create your own ByteCloud account
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}