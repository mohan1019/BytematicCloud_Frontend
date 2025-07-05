'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/auth-context'
import { HardDrive, TrendingUp } from 'lucide-react'

interface StorageIndicatorProps {
  onClick?: () => void
  className?: string
}

export default function StorageIndicator({ onClick, className = '' }: StorageIndicatorProps) {
  const [storage, setStorage] = useState<{
    used: number
    quota: number
    percentage: number
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStorageStats()
  }, [])

  const fetchStorageStats = async () => {
    try {
      const response = await api.get('/api/storage/stats')
      setStorage(response.data.storage)
    } catch (error) {
      console.error('Failed to fetch storage stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
  }

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 75) return 'bg-yellow-500'
    return 'bg-blue-500'
  }

  const getTextColor = (percentage: number): string => {
    if (percentage >= 90) return 'text-red-600'
    if (percentage >= 75) return 'text-yellow-600'
    return 'text-blue-600'
  }

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </div>
    )
  }

  if (!storage) return null

  return (
    <div 
      className={`cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors ${className}`}
      onClick={onClick}
      title="Click to view detailed storage statistics"
    >
      <div className="flex items-center space-x-2">
        <HardDrive className="h-4 w-4 text-gray-500" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>{formatBytes(storage.used)}</span>
            <span>{formatBytes(storage.quota)}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${getProgressColor(storage.percentage)}`}
              style={{ width: `${Math.min(storage.percentage, 100)}%` }}
            ></div>
          </div>
          <div className={`text-xs mt-1 font-medium ${getTextColor(storage.percentage)}`}>
            {storage.percentage}% used
          </div>
        </div>
      </div>
    </div>
  )
}