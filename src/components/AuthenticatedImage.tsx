'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/auth-context'

interface AuthenticatedImageProps {
  fileId: number
  alt: string
  className?: string
  onError?: () => void
}

export default function AuthenticatedImage({ fileId, alt, className, onError }: AuthenticatedImageProps) {
  const [imageSrc, setImageSrc] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    loadImage()
  }, [fileId])

  const loadImage = async () => {
    try {
      setLoading(true)
      setError(false)
      
      const response = await api.get(`/api/files/${fileId}/view`, {
        responseType: 'blob'
      })
      
      const imageBlob = new Blob([response.data], { type: response.headers['content-type'] })
      const imageUrl = URL.createObjectURL(imageBlob)
      setImageSrc(imageUrl)
    } catch (error) {
      console.error('Failed to load image:', error)
      setError(true)
      onError?.()
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Cleanup blob URL when component unmounts
    return () => {
      if (imageSrc && imageSrc.startsWith('blob:')) {
        URL.revokeObjectURL(imageSrc)
      }
    }
  }, [imageSrc])

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <div className="text-gray-500 text-sm">Failed to load image</div>
      </div>
    )
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      onError={() => {
        setError(true)
        onError?.()
      }}
    />
  )
}