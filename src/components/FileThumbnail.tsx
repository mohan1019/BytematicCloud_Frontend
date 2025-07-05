'use client'

import { useState } from 'react'
import { Image, Video, FileText, File } from 'lucide-react'
import AuthenticatedThumbnail from './AuthenticatedThumbnail'

interface FileThumbnailProps {
  file: {
    id: number
    mime_type: string
    has_thumbnail: boolean
    original_name: string
  }
  size?: 'small' | 'medium' | 'large'
  className?: string
}

export default function FileThumbnail({ file, size = 'medium', className = '' }: FileThumbnailProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  const sizeClasses = {
    small: 'w-12 h-12',
    medium: 'w-16 h-16', 
    large: 'w-24 h-24'
  }

  const iconSizes = {
    small: 'h-6 w-6',
    medium: 'h-8 w-8',
    large: 'h-12 w-12'
  }

  const getFileIcon = (mimeType: string) => {
    const iconClass = `${iconSizes[size]} text-gray-400`
    
    if (mimeType.startsWith('image/')) {
      return <Image className={iconClass} />
    } else if (mimeType.startsWith('video/')) {
      return <Video className={iconClass} />
    } else if (mimeType === 'application/pdf') {
      return <FileText className={iconClass} />
    } else {
      return <File className={iconClass} />
    }
  }

  const getPlaceholderColor = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return 'bg-blue-100'
    if (mimeType.startsWith('video/')) return 'bg-red-100'
    if (mimeType === 'application/pdf') return 'bg-yellow-100'
    if (mimeType.includes('word')) return 'bg-blue-200'
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'bg-green-100'
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'bg-orange-100'
    return 'bg-gray-100'
  }

  if (file.has_thumbnail && !imageError) {
    return (
      <div className={`${sizeClasses[size]} ${className} relative overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center`}>
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        )}
        <AuthenticatedThumbnail
          fileId={file.id}
          alt={file.original_name}
          className={`w-full h-full object-cover ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity`}
          onLoad={() => setImageLoading(false)}
          onError={() => {
            setImageError(true)
            setImageLoading(false)
          }}
        />
      </div>
    )
  }

  // Fallback to icon
  return (
    <div className={`${sizeClasses[size]} ${className} ${getPlaceholderColor(file.mime_type)} rounded-lg flex items-center justify-center`}>
      {getFileIcon(file.mime_type)}
    </div>
  )
}