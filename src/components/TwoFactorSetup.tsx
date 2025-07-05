'use client'

import React, { useState } from 'react'
import { api } from '@/lib/auth-context'

interface TwoFactorSetupProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const TwoFactorSetup: React.FC<TwoFactorSetupProps> = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState<'setup' | 'verify'>('setup')
  const [qrCode, setQrCode] = useState<string>('')
  const [manualKey, setManualKey] = useState<string>('')
  const [verificationCode, setVerificationCode] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const handleSetup = async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await api.post('/api/auth/2fa/setup')
      setQrCode(response.data.qrCode)
      setManualKey(response.data.manualEntryKey)
      setStep('verify')
    } catch (error: any) {
      setError(error.response?.data?.error || 'Setup failed')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    try {
      setLoading(true)
      setError('')
      
      if (!verificationCode) {
        setError('Please enter the verification code')
        return
      }

      await api.post('/api/auth/2fa/enable', { code: verificationCode })
      onSuccess()
      onClose()
    } catch (error: any) {
      setError(error.response?.data?.error || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setStep('setup')
    setQrCode('')
    setManualKey('')
    setVerificationCode('')
    setError('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {step === 'setup' ? 'Setup Two-Factor Authentication' : 'Verify Setup'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        {step === 'setup' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Two-factor authentication adds an extra layer of security to your account.
              You'll need an authenticator app like Google Authenticator or Authy.
            </p>
            <button
              onClick={handleSetup}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Setting up...' : 'Setup 2FA'}
            </button>
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Scan this QR code with your authenticator app, or use your existing ByteCloud entry if you've set up 2FA before:
              </p>
              {qrCode && (
                <img
                  src={qrCode}
                  alt="QR Code"
                  className="mx-auto border rounded"
                />
              )}
              <p className="text-xs text-gray-500 mt-2">
                Manual entry key: <code className="bg-gray-100 px-1 rounded text-xs">{manualKey}</code>
              </p>
              <p className="text-xs text-blue-600 mt-2">
                💡 If you previously had 2FA enabled, your existing authenticator entry should still work!
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter verification code from your authenticator app:
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-400"
                placeholder="000000"
                maxLength={6}
              />
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setStep('setup')}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
              >
                Back
              </button>
              <button
                onClick={handleVerify}
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify & Enable'}
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}

export default TwoFactorSetup