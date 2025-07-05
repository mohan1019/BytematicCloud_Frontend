'use client'

import { useState, useEffect } from 'react'

interface AuthenticatedThumbnailProps {
  fileId: number
  alt: string
  className?: string
  onLoad?: () => void
  onError?: () => void
}

export default function AuthenticatedThumbnail({ 
  fileId, 
  alt, 
  className = '', 
  onLoad, 
  onError 
}: AuthenticatedThumbnailProps) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchThumbnail = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          setError(true)
          setLoading(false)
          onError?.()
          return
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/files/${fileId}/thumbnail`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const blob = await response.blob()
          const url = URL.createObjectURL(blob)
          setThumbnailUrl(url)
        } else {
          setError(true)
          onError?.()
        }
      } catch (err) {
        setError(true)
        onError?.()
      } finally {
        setLoading(false)
      }
    }

    fetchThumbnail()

    // Cleanup function to revoke object URL
    return () => {
      if (thumbnailUrl) {
        URL.revokeObjectURL(thumbnailUrl)
      }
    }
  }, [fileId, onError])

  if (loading || error || !thumbnailUrl) {
    return null
  }

  return (
    <img
      src={thumbnailUrl}
      alt={alt}
      className={className}
      onLoad={onLoad}
      onError={() => {
        setError(true)
        onError?.()
      }}
    />
  )
}