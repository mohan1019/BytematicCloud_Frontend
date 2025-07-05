'use client'

import { useState } from 'react'
import { api } from '@/lib/auth-context'
import { X, Gift, Sparkles, Check } from 'lucide-react'

interface CouponModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function CouponModal({ isOpen, onClose, onSuccess }: CouponModalProps) {
  const [couponCode, setCouponCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState<{
    message: string
    storageGranted: string
    couponCode: string
    couponName?: string
  } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!couponCode.trim()) return

    setLoading(true)
    setError('')

    try {
      const response = await api.post('/api/storage/redeem-coupon', {
        code: couponCode.trim().toUpperCase()
      })

      setSuccess({
        message: response.data.message,
        storageGranted: response.data.storageGrantedFormatted,
        couponCode: response.data.couponCode,
        couponName: response.data.couponName
      })
      setCouponCode('')
      
      // Call onSuccess after a short delay to show the success state
      setTimeout(() => {
        onSuccess()
        handleClose()
      }, 2000)

    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to redeem coupon')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setCouponCode('')
    setError('')
    setSuccess(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Gift className="h-6 w-6 mr-2 text-purple-600" />
            Redeem Storage Coupon
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {success ? (
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Coupon Redeemed!</h3>
            <p className="text-gray-600 mb-4">{success.message}</p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-green-800 font-medium">Storage Added:</span>
                <span className="text-green-600 font-bold text-lg">{success.storageGranted}</span>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              {success.couponName ? (
                <>Coupon <strong>{success.couponName}</strong> has been applied to your account.</>
              ) : (
                <>Coupon <strong>{success.couponCode}</strong> has been applied to your account.</>
              )}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Enter a coupon code to increase your storage quota. Coupons can provide additional storage space for your files.
              </p>
              
              {/* Info about coupons */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center">
                  <Sparkles className="h-4 w-4 mr-1" />
                  How Coupons Work
                </h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>• Each coupon can only be redeemed once per account</p>
                  <p>• Storage bonus is added to your current quota</p>
                  <p>• Enter the exact coupon code (case-sensitive)</p>
                  <p>• Some coupons may have expiration dates</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="couponCode" className="block text-sm font-medium text-gray-700 mb-2">
                  Coupon Code
                </label>
                <input
                  id="couponCode"
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 font-mono text-center text-lg tracking-wider"
                  placeholder="ENTER-COUPON-CODE"
                  maxLength={20}
                  required
                />
              </div>

              {error && (
                <div className="mb-4 text-red-600 text-sm bg-red-50 border border-red-200 rounded-md p-3">
                  {error}
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !couponCode.trim()}
                  className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Redeeming...
                    </>
                  ) : (
                    <>
                      <Gift className="h-4 w-4 mr-2" />
                      Redeem Coupon
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}