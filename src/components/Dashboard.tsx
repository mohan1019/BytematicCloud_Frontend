'use client'

import { useState, useEffect } from 'react'
import { useAuth, api } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { 
  Upload, 
  FolderPlus, 
  LogOut, 
  User, 
  Share2, 
  MoreVertical, 
  Folder,
  Download,
  Eye,
  ExternalLink,
  Copy,
  Trash2,
  CheckSquare,
  Square,
  Settings
} from 'lucide-react'
import UploadModal from './UploadModal'
import CreateFolderModal from './CreateFolderModal'
import ShareModal from './ShareModal'
import FileThumbnail from './FileThumbnail'
import FilePreviewModal from './FilePreviewModal'
import StorageIndicator from './StorageIndicator'

interface FileItem {
  id: number
  name: string
  original_name: string
  mime_type: string
  size: number
  backblaze_url: string
  thumbnail_path: string
  has_thumbnail: boolean
  created_at: string
  access_level: string
}

interface FolderItem {
  id: number
  name: string
  created_at: string
  access_level: string
  subfolder_count: number
  file_count: number
}

export default function Dashboard() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [files, setFiles] = useState<FileItem[]>([])
  const [folders, setFolders] = useState<FolderItem[]>([])
  const [currentFolder, setCurrentFolder] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [selectedFolder, setSelectedFolder] = useState<FolderItem | null>(null)
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{id: number | null, name: string}>>([
    { id: null, name: 'Home' }
  ])
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)
  const [shareLinks, setShareLinks] = useState<{[key: number]: string}>({})
  const [showFileMenu, setShowFileMenu] = useState<number | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<Set<number>>(new Set())
  const [selectedFolders, setSelectedFolders] = useState<Set<number>>(new Set())
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false)
  const [isSelectMode, setIsSelectMode] = useState(false)

  useEffect(() => {
    loadData()
  }, [currentFolder])

  useEffect(() => {
    const handleClickOutside = () => {
      setShowFileMenu(null)
    }
    
    if (showFileMenu !== null) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showFileMenu])

  const loadData = async () => {
    try {
      setLoading(true)
      const [filesResponse, foldersResponse] = await Promise.all([
        api.get(`/api/files${currentFolder ? `?folder_id=${currentFolder}` : ''}`),
        api.get(`/api/folders${currentFolder ? `?parent_folder_id=${currentFolder}` : ''}`)
      ])
      
      setFiles(filesResponse.data.files)
      setFolders(foldersResponse.data.folders)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFolderClick = async (folder: FolderItem) => {
    setCurrentFolder(folder.id)
    setBreadcrumbs(prev => [...prev, { id: folder.id, name: folder.name }])
  }

  const handleBreadcrumbClick = (breadcrumb: {id: number | null, name: string}) => {
    setCurrentFolder(breadcrumb.id)
    const index = breadcrumbs.findIndex(b => b.id === breadcrumb.id)
    setBreadcrumbs(breadcrumbs.slice(0, index + 1))
  }

  const handleShare = (folder: FolderItem) => {
    setSelectedFolder(folder)
    setShowShareModal(true)
  }

  const handleFilePreview = (file: FileItem) => {
    setSelectedFile(file)
    setShowPreviewModal(true)
  }


  const handleDownload = async (file: FileItem) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        alert('Please log in to download files')
        return
      }
      
      // Create download URL with token
      const downloadUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/files/${file.id}/download?token=${token}`
      
      // Create a temporary link element and trigger download
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = file.original_name
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error: any) {
      alert('Download failed: ' + (error.message || 'Unknown error'))
    }
  }

  const handleCreatePublicLink = async (file: FileItem) => {
    try {
      const response = await api.post(`/api/files/${file.id}/share`, {
        expiresIn: 24
      })
      
      // Create proper frontend URL for public sharing
      const frontendShareUrl = `${window.location.origin}/public/${response.data.shareToken}`
      
      setShareLinks(prev => ({
        ...prev,
        [file.id]: frontendShareUrl
      }))

      // Copy to clipboard
      await navigator.clipboard.writeText(frontendShareUrl)
      alert('Public share link created and copied to clipboard!')
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to create share link')
    }
  }

  const copyShareLink = async (fileId: number) => {
    const shareUrl = shareLinks[fileId]
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl)
      alert('Share link copied to clipboard!')
    }
  }

  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode)
    if (isSelectMode) {
      setSelectedFiles(new Set())
      setSelectedFolders(new Set())
    }
  }

  const toggleFileSelection = (fileId: number) => {
    const newSelected = new Set(selectedFiles)
    if (newSelected.has(fileId)) {
      newSelected.delete(fileId)
    } else {
      newSelected.add(fileId)
    }
    setSelectedFiles(newSelected)
  }

  const toggleFolderSelection = (folderId: number) => {
    const newSelected = new Set(selectedFolders)
    if (newSelected.has(folderId)) {
      newSelected.delete(folderId)
    } else {
      newSelected.add(folderId)
    }
    setSelectedFolders(newSelected)
  }

  const selectAllFiles = () => {
    if (selectedFiles.size === files.length) {
      setSelectedFiles(new Set())
    } else {
      setSelectedFiles(new Set(files.map(f => f.id)))
    }
  }

  const selectAllFolders = () => {
    if (selectedFolders.size === folders.length) {
      setSelectedFolders(new Set())
    } else {
      setSelectedFolders(new Set(folders.map(f => f.id)))
    }
  }

  const handleBulkDelete = async () => {
    if (selectedFiles.size === 0 && selectedFolders.size === 0) {
      alert('Please select items to delete')
      return
    }

    const fileCount = selectedFiles.size
    const folderCount = selectedFolders.size
    const totalCount = fileCount + folderCount

    if (!confirm(`Are you sure you want to delete ${totalCount} item${totalCount > 1 ? 's' : ''}? This action cannot be undone.`)) {
      return
    }

    setBulkDeleteLoading(true)
    try {
      const response = await api.delete('/api/folders/bulk/mixed', {
        data: {
          fileIds: Array.from(selectedFiles),
          folderIds: Array.from(selectedFolders)
        }
      })

      const results = response.data.results
      let message = response.data.message

      if (results.files.unauthorized.length > 0 || results.folders.unauthorized.length > 0) {
        message += '\n\nSome items could not be deleted due to insufficient permissions.'
      }

      if (results.folders.nonEmpty.length > 0) {
        message += `\n\n${results.folders.nonEmpty.length} folder(s) could not be deleted because they are not empty.`
      }

      if (results.files.failed.length > 0 || results.folders.failed.length > 0) {
        message += `\n\n${results.files.failed.length + results.folders.failed.length} item(s) failed to delete due to errors.`
      }

      alert(message)
      
      setSelectedFiles(new Set())
      setSelectedFolders(new Set())
      setIsSelectMode(false)
      await loadData()
    } catch (error: any) {
      console.error('Bulk delete error:', error)
      if (error.response?.status === 403) {
        alert('You do not have permission to delete some of the selected items.')
      } else {
        alert('Failed to delete items: ' + (error.response?.data?.error || error.message || 'Unknown error'))
      }
    } finally {
      setBulkDeleteLoading(false)
    }
  }


  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">ByteCloud</h1>
            </div>
            
            <div className="flex items-center space-x-6">
              {/* Storage Indicator */}
              <div className="hidden md:block">
                <StorageIndicator 
                  onClick={() => router.push('/storage')}
                  className="w-48"
                />
              </div>

              {/* User Info */}
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">{user?.name}</span>
              </div>

              {/* Navigation */}
              <button
                onClick={() => router.push('/storage')}
                className="text-gray-500 hover:text-gray-700 text-sm font-medium"
              >
                Storage
              </button>

              <button
                onClick={() => router.push('/settings')}
                className="flex items-center space-x-2 text-gray-500 hover:text-gray-700"
              >
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </button>

              <button
                onClick={logout}
                className="flex items-center space-x-2 text-gray-500 hover:text-gray-700"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            {breadcrumbs.map((breadcrumb, index) => (
              <li key={breadcrumb.id || 'home'} className="flex items-center">
                {index > 0 && <span className="mx-2 text-gray-400">/</span>}
                <button
                  onClick={() => handleBreadcrumbClick(breadcrumb)}
                  className="text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  {breadcrumb.name}
                </button>
              </li>
            ))}
          </ol>
        </nav>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
            >
              <Upload className="h-5 w-5" />
              <span>Upload Files</span>
            </button>
            <button
              onClick={() => setShowCreateFolderModal(true)}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              <FolderPlus className="h-5 w-5" />
              <span>New Folder</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleSelectMode}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md border ${
                isSelectMode 
                  ? 'bg-blue-50 text-blue-700 border-blue-200' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {isSelectMode ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
              <span>{isSelectMode ? 'Exit Select' : 'Select'}</span>
            </button>
            
            {isSelectMode && (
              <>
                {(files.length > 0 || folders.length > 0) && (
                  <div className="flex space-x-2">
                    {files.length > 0 && (
                      <button
                        onClick={selectAllFiles}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        {selectedFiles.size === files.length ? 'Deselect All Files' : 'Select All Files'}
                      </button>
                    )}
                    {folders.length > 0 && (
                      <button
                        onClick={selectAllFolders}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        {selectedFolders.size === folders.length ? 'Deselect All Folders' : 'Select All Folders'}
                      </button>
                    )}
                  </div>
                )}
                
                {(selectedFiles.size > 0 || selectedFolders.size > 0) && (
                  <button
                    onClick={handleBulkDelete}
                    disabled={bulkDeleteLoading}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md ${
                      bulkDeleteLoading
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    <Trash2 className="h-5 w-5" />
                    <span>
                      {bulkDeleteLoading 
                        ? 'Deleting...' 
                        : `Delete (${selectedFiles.size + selectedFolders.size})`
                      }
                    </span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Files and Folders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* Folders */}
          {folders.map((folder) => (
            <div
              key={folder.id}
              className={`bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4 relative ${
                isSelectMode && selectedFolders.has(folder.id) ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              {isSelectMode && (
                <div className="absolute top-2 left-2 z-10">
                  <button
                    onClick={() => toggleFolderSelection(folder.id)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    {selectedFolders.has(folder.id) ? (
                      <CheckSquare className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Square className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              )}
              <div className="flex items-center justify-between mb-2">
                <div 
                  className={`flex items-center space-x-3 cursor-pointer flex-1 ${
                    isSelectMode ? 'ml-8' : ''
                  }`}
                  onClick={() => !isSelectMode && handleFolderClick(folder)}
                >
                  <Folder className="h-8 w-8 text-blue-500" />
                  <div>
                    <h3 className="font-medium text-gray-900">{folder.name}</h3>
                    <p className="text-sm text-gray-500">
                      {folder.file_count} files, {folder.subfolder_count} folders
                    </p>
                  </div>
                </div>
                {!isSelectMode && folder.access_level === 'owner' && (
                  <div className="relative">
                    <button
                      onClick={() => handleShare(folder)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Share2 className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                )}
              </div>
              <div className="text-xs text-gray-400">
                Created {formatDate(folder.created_at)}
              </div>
            </div>
          ))}

          {/* Files */}
          {files.map((file) => (
            <div
              key={file.id}
              className={`bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4 relative ${
                isSelectMode && selectedFiles.has(file.id) ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              {isSelectMode && (
                <div className="absolute top-2 left-2 z-10">
                  <button
                    onClick={() => toggleFileSelection(file.id)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    {selectedFiles.has(file.id) ? (
                      <CheckSquare className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Square className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              )}
              <div 
                className={`flex flex-col items-center mb-2 ${isSelectMode ? 'ml-8' : ''} ${
                  !isSelectMode ? 'cursor-pointer' : ''
                }`}
                onClick={() => !isSelectMode && handleFilePreview(file)}
              >
                <FileThumbnail file={file} size="large" className="mb-2" />
                <div className="w-full text-center">
                  <h3 className="font-medium text-gray-900 truncate text-sm">{file.original_name}</h3>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <div className={`flex items-center justify-between ${isSelectMode ? 'ml-8' : ''}`}>
                <div className="flex-1"></div>
                {!isSelectMode && (
                  <div className="relative">
                    <button
                      onClick={() => setShowFileMenu(showFileMenu === file.id ? null : file.id)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <MoreVertical className="h-4 w-4 text-gray-500" />
                    </button>
                  
                  {showFileMenu === file.id && (
                    <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-md shadow-lg z-10 w-48">
                      {(file.mime_type.startsWith('image/') || 
                        file.mime_type.startsWith('video/') || 
                        file.mime_type === 'application/pdf' ||
                        file.mime_type.includes('document') ||
                        file.mime_type.includes('word') ||
                        file.mime_type.includes('excel') ||
                        file.mime_type.includes('powerpoint') ||
                        file.mime_type === 'text/plain') && (
                        <button
                          onClick={() => {
                            handleFilePreview(file)
                            setShowFileMenu(null)
                          }}
                          className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Eye className="h-4 w-4" />
                          <span>Preview</span>
                        </button>
                      )}
                      <button
                        onClick={() => {
                          handleDownload(file)
                          setShowFileMenu(null)
                        }}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Download className="h-4 w-4" />
                        <span>Download</span>
                      </button>
                      {file.access_level === 'owner' && (
                        <>
                          {shareLinks[file.id] ? (
                            <button
                              onClick={() => {
                                copyShareLink(file.id)
                                setShowFileMenu(null)
                              }}
                              className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <Copy className="h-4 w-4" />
                              <span>Copy Share Link</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                handleCreatePublicLink(file)
                                setShowFileMenu(null)
                              }}
                              className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <ExternalLink className="h-4 w-4" />
                              <span>Create Public Link</span>
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  )}
                  </div>
                )}
              </div>
              <div className="text-xs text-gray-400">
                {formatDate(file.created_at)}
              </div>
              {shareLinks[file.id] && (
                <div className="mt-2 text-xs text-green-600">
                  Public link created
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {files.length === 0 && folders.length === 0 && (
          <div className="text-center py-12">
            <Folder className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No files or folders</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by uploading files or creating a folder.</p>
          </div>
        )}
      </main>

      {/* Modals */}
      {showUploadModal && (
        <UploadModal
          currentFolder={currentFolder}
          onClose={() => setShowUploadModal(false)}
          onUploadComplete={loadData}
        />
      )}

      {showCreateFolderModal && (
        <CreateFolderModal
          currentFolder={currentFolder}
          onClose={() => setShowCreateFolderModal(false)}
          onFolderCreated={loadData}
        />
      )}

      {showShareModal && selectedFolder && (
        <ShareModal
          folder={selectedFolder}
          onClose={() => {
            setShowShareModal(false)
            setSelectedFolder(null)
          }}
        />
      )}

      {/* File Preview Modal */}
      {showPreviewModal && selectedFile && (
        <FilePreviewModal
          file={selectedFile}
          onClose={() => {
            setShowPreviewModal(false)
            setSelectedFile(null)
          }}
          onDownload={handleDownload}
          onCreatePublicLink={handleCreatePublicLink}
          formatFileSize={formatFileSize}
        />
      )}
    </div>
  )
}