'use client'

import React, { useState } from 'react'
import { Share2, Copy, Check, Link, Clock, X, ExternalLink } from 'lucide-react'

interface ShareLinkModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateLink: (expiresIn: number) => Promise<string>
  fileName: string
  isLoading?: boolean
}

export default function ShareLinkModal({
  isOpen,
  onClose,
  onCreateLink,
  fileName,
  isLoading = false
}: ShareLinkModalProps) {
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [expiresIn, setExpiresIn] = useState(24) // Default 24 hours
  const [copied, setCopied] = useState(false)
  const [creating, setCreating] = useState(false)

  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleCreateLink = async () => {
    try {
      setCreating(true)
      const url = await onCreateLink(expiresIn)
      setShareUrl(url)
    } catch (error) {
      console.error('Failed to create share link:', error)
    } finally {
      setCreating(false)
    }
  }

  const handleCopyLink = async () => {
    if (shareUrl) {
      try {
        await navigator.clipboard.writeText(shareUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (error) {
        console.error('Failed to copy link:', error)
      }
    }
  }

  const handleOpenLink = () => {
    if (shareUrl) {
      window.open(shareUrl, '_blank')
    }
  }

  const handleClose = () => {
    setShareUrl(null)
    setCopied(false)
    setExpiresIn(24)
    onClose()
  }

  const expirationOptions = [
    { value: 1, label: '1 hour' },
    { value: 6, label: '6 hours' },
    { value: 24, label: '24 hours' },
    { value: 72, label: '3 days' },
    { value: 168, label: '1 week' },
    { value: 720, label: '30 days' }
  ]

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Share2 className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Share File</h3>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={creating}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* File Info */}
          <div className="bg-gray-50 rounded-md p-3 mb-4">
            <p className="text-sm text-gray-700">
              <span className="font-medium">File:</span> {fileName}
            </p>
          </div>

          {!shareUrl ? (
            <>
              {/* Expiration Settings */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Link expires in:
                </label>
                <select
                  value={expiresIn}
                  onChange={(e) => setExpiresIn(Number(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={creating}
                >
                  {expirationOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-6">
                <div className="flex">
                  <Link className="w-5 h-5 text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium mb-1">Public Share Link</p>
                    <p>Anyone with this link will be able to view and download the file. The link will expire after the selected time period.</p>
                  </div>
                </div>
              </div>

              {/* Create Link Button */}
              <button
                onClick={handleCreateLink}
                disabled={creating}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating Link...</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    <span>Create Share Link</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              {/* Generated Link */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Share Link:
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 p-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md transition-colors flex items-center space-x-1"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span className="text-sm">Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Link Info */}
              <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
                <div className="flex">
                  <Check className="w-5 h-5 text-green-400 mt-0.5 mr-2 flex-shrink-0" />
                  <div className="text-sm text-green-700">
                    <p className="font-medium">Link Created Successfully!</p>
                    <p>This link will expire in {expirationOptions.find(opt => opt.value === expiresIn)?.label.toLowerCase()}.</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={handleOpenLink}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open Link</span>
                </button>
                <button
                  onClick={handleCopyLink}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {shareUrl && (
          <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  )
}