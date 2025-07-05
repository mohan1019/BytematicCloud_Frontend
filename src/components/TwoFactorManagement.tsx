'use client'

import React, { useState, useEffect } from 'react'
import { api } from '@/lib/auth-context'
import TwoFactorSetup from './TwoFactorSetup'

const TwoFactorManagement: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState(false)
  const [isSetupOpen, setIsSetupOpen] = useState(false)
  const [disablePassword, setDisablePassword] = useState('')
  const [showDisableForm, setShowDisableForm] = useState(false)
  const [removePassword, setRemovePassword] = useState('')
  const [showRemoveForm, setShowRemoveForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    checkStatus()
  }, [])

  const checkStatus = async () => {
    try {
      const response = await api.get('/api/auth/2fa/status')
      setIsEnabled(response.data.enabled)
    } catch (error) {
      console.error('Failed to check 2FA status:', error)
    }
  }

  const handleDisable = async () => {
    try {
      setLoading(true)
      setError('')
      
      if (!disablePassword) {
        setError('Password is required')
        return
      }

      await api.post('/api/auth/2fa/disable', { password: disablePassword })
      setIsEnabled(false)
      setShowDisableForm(false)
      setDisablePassword('')
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to disable 2FA')
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async () => {
    try {
      setLoading(true)
      setError('')
      
      if (!removePassword) {
        setError('Password is required')
        return
      }

      await api.post('/api/auth/2fa/remove', { password: removePassword })
      setIsEnabled(false)
      setShowRemoveForm(false)
      setRemovePassword('')
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to remove 2FA')
    } finally {
      setLoading(false)
    }
  }

  const handleSetupSuccess = () => {
    setIsEnabled(true)
    checkStatus()
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Two-Factor Authentication</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">
              Status: {isEnabled ? 'Enabled' : 'Disabled'}
            </p>
            <p className="text-sm text-gray-600">
              {isEnabled 
                ? 'Your account is protected with two-factor authentication'
                : 'Add an extra layer of security to your account'
              }
            </p>
          </div>
          <div className="flex items-center">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isEnabled 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {isEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>

        {!isEnabled && (
          <button
            onClick={() => setIsSetupOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Enable 2FA
          </button>
        )}

        {isEnabled && !showDisableForm && !showRemoveForm && (
          <div className="space-x-2">
            <button
              onClick={() => setShowDisableForm(true)}
              className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
            >
              Disable 2FA
            </button>
            <button
              onClick={() => setShowRemoveForm(true)}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Remove 2FA Completely
            </button>
          </div>
        )}

        {showDisableForm && (
          <div className="border rounded-lg p-4 bg-yellow-50">
            <h4 className="font-medium text-yellow-800 mb-2">Disable Two-Factor Authentication</h4>
            <p className="text-sm text-yellow-700 mb-4">
              Enter your password to disable 2FA. Your authenticator app entry will remain valid for easy re-enabling later.
            </p>
            
            <div className="space-y-3">
              <input
                type="password"
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900 bg-white placeholder-gray-400"
              />
              
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setShowDisableForm(false)
                    setDisablePassword('')
                    setError('')
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDisable}
                  disabled={loading}
                  className="flex-1 bg-yellow-600 text-white py-2 px-4 rounded hover:bg-yellow-700 disabled:opacity-50"
                >
                  {loading ? 'Disabling...' : 'Disable 2FA'}
                </button>
              </div>
            </div>
          </div>
        )}

        {showRemoveForm && (
          <div className="border rounded-lg p-4 bg-red-50">
            <h4 className="font-medium text-red-800 mb-2">Completely Remove Two-Factor Authentication</h4>
            <p className="text-sm text-red-700 mb-4">
              This will completely remove your 2FA setup. You'll need to delete the entry from your authenticator app and set up fresh when re-enabling.
            </p>
            
            <div className="space-y-3">
              <input
                type="password"
                value={removePassword}
                onChange={(e) => setRemovePassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 bg-white placeholder-gray-400"
              />
              
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setShowRemoveForm(false)
                    setRemovePassword('')
                    setError('')
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRemove}
                  disabled={loading}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? 'Removing...' : 'Remove Completely'}
                </button>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
            {error}
          </div>
        )}
      </div>

      <TwoFactorSetup
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        onSuccess={handleSetupSuccess}
      />
    </div>
  )
}

export default TwoFactorManagement