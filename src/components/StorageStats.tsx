'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/auth-context'
import { 
  HardDrive, 
  Image, 
  Video, 
  Music, 
  FileText, 
  Archive,
  File,
  TrendingUp,
  Gift,
  Plus
} from 'lucide-react'

interface StorageStats {
  storage: {
    quota: number
    used: number
    available: number
    percentage: number
  }
  files: {
    total: number
    breakdown: {
      images: { count: number; size: number }
      videos: { count: number; size: number }
      audio: { count: number; size: number }
      documents: { count: number; size: number }
      archives: { count: number; size: number }
      other: { count: number; size: number }
    }
  }
  coupons: Array<{
    code: string
    name: string
    storageGranted: number
    redeemedAt: string
  }>
}

interface StorageStatsProps {
  onRedeemCoupon: () => void
}

export default function StorageStats({ onRedeemCoupon }: StorageStatsProps) {
  const [stats, setStats] = useState<StorageStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/storage/stats')
      setStats(response.data)
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to load storage statistics')
    } finally {
      setLoading(false)
    }
  }

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 75) return 'bg-yellow-500'
    return 'bg-blue-500'
  }

  const fileTypeIcons = {
    images: <Image className="h-5 w-5 text-green-500" />,
    videos: <Video className="h-5 w-5 text-red-500" />,
    audio: <Music className="h-5 w-5 text-purple-500" />,
    documents: <FileText className="h-5 w-5 text-blue-500" />,
    archives: <Archive className="h-5 w-5 text-orange-500" />,
    other: <File className="h-5 w-5 text-gray-500" />
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center text-red-600">
          <p className="font-medium">Error loading storage statistics</p>
          <p className="text-sm mt-1">{error}</p>
          <button
            onClick={fetchStats}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="space-y-6">
      {/* Storage Overview */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <HardDrive className="h-6 w-6 mr-2 text-blue-600" />
            Storage Usage
          </h2>
          <button
            onClick={onRedeemCoupon}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm"
          >
            <Gift className="h-4 w-4" />
            <span>Redeem Coupon</span>
          </button>
        </div>

        <div className="space-y-4">
          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>{formatBytes(stats.storage.used)} used</span>
              <span>{formatBytes(stats.storage.quota)} total</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(stats.storage.percentage)}`}
                style={{ width: `${Math.min(stats.storage.percentage, 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{stats.storage.percentage}% used</span>
              <span>{formatBytes(stats.storage.available)} available</span>
            </div>
          </div>

          {/* Storage Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{formatBytes(stats.storage.used)}</div>
              <div className="text-sm text-gray-500">Used Space</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{formatBytes(stats.storage.available)}</div>
              <div className="text-sm text-gray-500">Available</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-700">{stats.files.total}</div>
              <div className="text-sm text-gray-500">Total Files</div>
            </div>
          </div>
        </div>
      </div>

      {/* File Breakdown */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
          File Breakdown
        </h3>
        <div className="space-y-3">
          {Object.entries(stats.files.breakdown).map(([type, data]) => (
            <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                {fileTypeIcons[type as keyof typeof fileTypeIcons]}
                <div>
                  <div className="font-medium text-gray-900 capitalize">{type}</div>
                  <div className="text-sm text-gray-500">{data.count} files</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-gray-900">{formatBytes(data.size)}</div>
                <div className="text-sm text-gray-500">
                  {stats.storage.used > 0 ? ((data.size / stats.storage.used) * 100).toFixed(1) : 0}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Coupons */}
      {stats.coupons.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Gift className="h-5 w-5 mr-2 text-purple-600" />
            Redeemed Coupons
          </h3>
          <div className="space-y-3">
            {stats.coupons.map((coupon, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div>
                  <div className="font-medium text-gray-900">{coupon.name || coupon.code}</div>
                  <div className="text-sm text-gray-500">
                    Redeemed on {new Date(coupon.redeemedAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-green-600">+{formatBytes(coupon.storageGranted)}</div>
                  <div className="text-sm text-green-500">Storage Added</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Storage Tips */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Storage Tips</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Delete unused files to free up space</li>
          <li>• Use coupons to increase your storage quota</li>
          <li>• Compress large files before uploading</li>
          <li>• Clean up old documents and duplicates regularly</li>
        </ul>
      </div>
    </div>
  )
}