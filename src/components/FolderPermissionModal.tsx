'use client'

import React from 'react'
import { FolderOpen, Shield, Info, X, Upload, AlertTriangle } from 'lucide-react'

interface FolderPermissionModalProps {
  isOpen: boolean
  onClose: () => void
  onProceed: () => void
}

export default function FolderPermissionModal({
  isOpen,
  onClose,
  onProceed
}: FolderPermissionModalProps) {
  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 transform transition-all max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <FolderOpen className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Folder Upload Permission</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Info Section */}
          <div className="mb-6">
            <div className="flex items-start space-x-3 mb-4">
              <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-1">
                  About Folder Uploads
                </h4>
                <p className="text-sm text-gray-600">
                  To upload folders with all their files, your browser needs permission to access the folder contents. This is a security feature to protect your files.
                </p>
              </div>
            </div>
          </div>

          {/* What happens next */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-medium text-blue-900 mb-3 flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              What happens next?
            </h4>
            <ol className="text-sm text-blue-800 space-y-2">
              <li className="flex items-start">
                <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mr-3 mt-0.5 flex-shrink-0">1</span>
                <span>Your browser will ask for permission to access the folder</span>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mr-3 mt-0.5 flex-shrink-0">2</span>
                <span>A dialog will show: "Upload [X] files for this site?"</span>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mr-3 mt-0.5 flex-shrink-0">3</span>
                <span>Click <strong>"Upload"</strong> to proceed with folder selection</span>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mr-3 mt-0.5 flex-shrink-0">4</span>
                <span>You'll then see our upload options for the selected folder</span>
              </li>
            </ol>
          </div>

          {/* Security notice */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-green-900 mb-1">
                  Your Privacy is Protected
                </h4>
                <p className="text-sm text-green-800">
                  This permission only applies to the folder you select. We cannot access any other files or folders on your device. The browser ensures your data remains secure.
                </p>
              </div>
            </div>
          </div>

          {/* Browser notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-amber-900 mb-1">
                  Browser Security Feature
                </h4>
                <p className="text-sm text-amber-800">
                  The permission dialog is shown by your browser (not by us) to ensure you're aware of what files are being accessed. This is normal and expected behavior.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            onClick={onProceed}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>I Understand - Select Folder</span>
          </button>
        </div>
      </div>
    </div>
  )
}