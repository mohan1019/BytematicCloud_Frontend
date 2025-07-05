'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import StorageStats from '@/components/StorageStats'
import CouponModal from '@/components/CouponModal'
import { ArrowLeft } from 'lucide-react'

export default function StoragePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [showCouponModal, setShowCouponModal] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  const handleCouponSuccess = () => {
    setRefreshKey(prev => prev + 1) // Force refresh of storage stats
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Dashboard</span>
            </button>
          </div>
          <div className="border-b border-gray-200 pb-4">
            <h1 className="text-3xl font-bold text-gray-900">Storage Management</h1>
            <p className="text-gray-600 mt-2">
              Monitor your storage usage and manage your cloud storage quota
            </p>
          </div>
        </div>

        {/* Storage Statistics */}
        <StorageStats 
          key={refreshKey}
          onRedeemCoupon={() => setShowCouponModal(true)} 
        />

        {/* Coupon Modal */}
        <CouponModal
          isOpen={showCouponModal}
          onClose={() => setShowCouponModal(false)}
          onSuccess={handleCouponSuccess}
        />
      </div>
    </div>
  )
}