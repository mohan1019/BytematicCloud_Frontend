'use client'

import React, { useState } from 'react'
import { FolderOpen, Upload, AlertTriangle, X, CheckCircle, Info } from 'lucide-react'

interface FolderUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (preserveStructure: boolean, overwriteExisting: boolean) => void
  folderName: string
  fileCount: number
  isLoading?: boolean
}

export default function FolderUploadModal({
  isOpen,
  onClose,
  onConfirm,
  folderName,
  fileCount,
  isLoading = false
}: FolderUploadModalProps) {
  const [preserveStructure, setPreserveStructure] = useState(true)
  const [overwriteExisting, setOverwriteExisting] = useState(false)

  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleConfirm = () => {
    onConfirm(preserveStructure, overwriteExisting)
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
            <h3 className="text-lg font-semibold text-gray-900">Upload Folder</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Folder Info */}
          <div className="bg-gray-50 rounded-md p-4 mb-6">
            <div className="flex items-center space-x-3">
              <FolderOpen className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">{folderName}</p>
                <p className="text-sm text-gray-600">{fileCount} files</p>
              </div>
            </div>
          </div>

          {/* Upload Options */}
          <div className="space-y-4 mb-6">
            <h4 className="text-sm font-medium text-gray-900">Upload Options</h4>
            
            {/* Preserve Structure */}
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="preserveStructure"
                checked={preserveStructure}
                onChange={(e) => setPreserveStructure(e.target.checked)}
                className="mt-0.5 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={isLoading}
              />
              <div className="flex-1">
                <label htmlFor="preserveStructure" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Preserve folder structure
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Keep the original folder hierarchy and create subfolders as needed
                </p>
              </div>
            </div>

            {/* Overwrite Existing */}
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="overwriteExisting"
                checked={overwriteExisting}
                onChange={(e) => setOverwriteExisting(e.target.checked)}
                className="mt-0.5 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                disabled={isLoading}
              />
              <div className="flex-1">
                <label htmlFor="overwriteExisting" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Overwrite existing files
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Replace files with the same name. If unchecked, duplicate files will be renamed
                </p>
              </div>
            </div>
          </div>

          {/* Info Boxes */}
          <div className="space-y-3 mb-6">
            {preserveStructure && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <div className="flex">
                  <Info className="w-5 h-5 text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium">Folder Structure</p>
                    <p>Subfolders will be created automatically to match your local folder structure.</p>
                  </div>
                </div>
              </div>
            )}

            {overwriteExisting && (
              <div className="bg-orange-50 border border-orange-200 rounded-md p-3">
                <div className="flex">
                  <AlertTriangle className="w-5 h-5 text-orange-400 mt-0.5 mr-2 flex-shrink-0" />
                  <div className="text-sm text-orange-700">
                    <p className="font-medium">Overwrite Warning</p>
                    <p>Existing files with the same name will be permanently replaced.</p>
                  </div>
                </div>
              </div>
            )}

            {!overwriteExisting && (
              <div className="bg-green-50 border border-green-200 rounded-md p-3">
                <div className="flex">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 mr-2 flex-shrink-0" />
                  <div className="text-sm text-green-700">
                    <p className="font-medium">Safe Upload</p>
                    <p>Duplicate files will be renamed automatically (e.g., "file (1).txt").</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Upload Preview */}
          <div className="bg-gray-50 rounded-md p-3">
            <h5 className="text-sm font-medium text-gray-900 mb-2">Upload Summary</h5>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• {fileCount} files will be uploaded</li>
              <li>• {preserveStructure ? 'Folder structure will be preserved' : 'All files will be placed in the current folder'}</li>
              <li>• {overwriteExisting ? 'Existing files will be overwritten' : 'Duplicate files will be renamed'}</li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Start Upload</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}