'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Download, Image, Video, FileText } from 'lucide-react'

interface PublicFileInfo {
  fileName: string
  mimeType: string
  size: number
  downloadCount: number
  isImage: boolean
  isVideo: boolean
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
    return <FileText className="h-16 w-16 text-blue-500" />
  }

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
            <div className="aspect-video bg-gray-100 flex items-center justify-center">
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL}/api/files/public/${shareToken}/view`}
                alt={fileInfo.fileName}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          )}

          {fileInfo.isVideo && (
            <div className="aspect-video bg-gray-100">
              <video
                controls
                className="w-full h-full"
                preload="metadata"
              >
                <source src={`${process.env.NEXT_PUBLIC_API_URL}/api/files/public/${shareToken}/view`} type={fileInfo.mimeType} />
                Your browser does not support the video tag.
              </video>
            </div>
          )}

          {!fileInfo.isImage && !fileInfo.isVideo && (
            <div className="aspect-video bg-gray-100 flex items-center justify-center">
              <div className="text-center">
                {getFileIcon(fileInfo.mimeType)}
                <p className="mt-4 text-gray-600">Preview not available</p>
              </div>
            </div>
          )}

          {/* File Info */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{fileInfo.fileName}</h2>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                  <span>Size: {formatFileSize(fileInfo.size)}</span>
                  <span>Downloads: {fileInfo.downloadCount}</span>
                  <span>Type: {fileInfo.mimeType}</span>
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