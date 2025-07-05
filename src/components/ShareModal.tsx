'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/auth-context'
import { X, Share2, Mail, UserPlus, Trash2 } from 'lucide-react'

interface FolderItem {
  id: number
  name: string
  created_at: string
  access_level: string
  subfolder_count: number
  file_count: number
}

interface Permission {
  id: number
  permission_type: 'view' | 'create' | 'edit'
  name: string
  email: string
  granted_by_name: string
  created_at: string
  shared_with_user_id: number
}

interface ShareModalProps {
  folder: FolderItem
  onClose: () => void
}

export default function ShareModal({ folder, onClose }: ShareModalProps) {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [email, setEmail] = useState('')
  const [permissionType, setPermissionType] = useState<'view' | 'create' | 'edit'>('view')
  const [loading, setLoading] = useState(true)
  const [sharing, setSharing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadPermissions()
  }, [])

  const loadPermissions = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/api/share/folder/${folder.id}`)
      setPermissions(response.data.permissions)
    } catch (error) {
      console.error('Error loading permissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      setError('Email is required')
      return
    }

    setSharing(true)
    setError('')

    try {
      await api.post(`/api/share/folder/${folder.id}`, {
        email: email.trim(),
        permission_type: permissionType
      })
      
      setEmail('')
      setPermissionType('view')
      await loadPermissions()
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to share folder')
    } finally {
      setSharing(false)
    }
  }

  const handleRevokeAccess = async (userId: number) => {
    try {
      await api.delete(`/api/share/folder/${folder.id}/user/${userId}`)
      await loadPermissions()
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to revoke access')
    }
  }

  const getPermissionColor = (permission: string) => {
    switch (permission) {
      case 'view':
        return 'bg-blue-100 text-blue-800'
      case 'create':
        return 'bg-green-100 text-green-800'
      case 'edit':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Share2 className="h-6 w-6 text-primary-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Share Folder</h2>
              <p className="text-sm text-gray-500">{folder.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Share Form */}
          <form onSubmit={handleShare} className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add People</h3>
            
            <div className="flex space-x-3">
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
              
              <select
                value={permissionType}
                onChange={(e) => setPermissionType(e.target.value as 'view' | 'create' | 'edit')}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="view">View</option>
                <option value="create">Create</option>
                <option value="edit">Edit</option>
              </select>
              
              <button
                type="submit"
                disabled={sharing || !email.trim()}
                className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <UserPlus className="h-4 w-4" />
                <span>{sharing ? 'Sharing...' : 'Share'}</span>
              </button>
            </div>
          </form>

          {error && (
            <div className="mb-4 text-red-600 text-sm bg-red-50 border border-red-200 rounded-md p-3">
              {error}
            </div>
          )}

          {/* Permission Types Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-md">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Permission Types:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li><strong>View:</strong> Can view files and folders</li>
              <li><strong>Create:</strong> Can view and upload files</li>
              <li><strong>Edit:</strong> Can view, upload, and delete files</li>
            </ul>
          </div>

          {/* Current Permissions */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              People with Access ({permissions.length})
            </h3>
            
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
              </div>
            ) : permissions.length === 0 ? (
              <p className="text-sm text-gray-500 py-4">No one has been given access to this folder yet.</p>
            ) : (
              <div className="space-y-3">
                {permissions.map((permission) => (
                  <div key={permission.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {permission.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{permission.name}</p>
                        <p className="text-xs text-gray-500">{permission.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPermissionColor(permission.permission_type)}`}>
                        {permission.permission_type}
                      </span>
                      <button
                        onClick={() => handleRevokeAccess(permission.shared_with_user_id)}
                        className="text-red-500 hover:text-red-700"
                        title="Revoke access"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-md"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}