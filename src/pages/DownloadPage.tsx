import React, { useEffect, useState } from 'react'
import { Cloud } from 'lucide-react'
import { FileList } from '../components/FileList'
import { FileService } from '../services/fileService'
import { MockFileService } from '../services/mockFileService'
import { FileItem } from '../types'
import { useDownloadStore } from '../stores/downloadStore'

export const DownloadPage: React.FC = () => {
  const { files, setFiles, setLoading, setError } = useDownloadStore()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadFiles()
  }, [])

  const loadFiles = async () => {
    try {
      setLoading(true)
      setIsLoading(true)
      
      // Use mock service if Supabase is not configured
      const service = import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('placeholder')
        ? FileService
        : MockFileService
      
      const files = await service.getFiles()
      setFiles(files)
    } catch (error) {
      console.error('Error loading files:', error)
      setError('加载文件列表失败')
    } finally {
      setLoading(false)
      setIsLoading(false)
    }
  }

  const handleDownloadStart = async (file: FileItem) => {
    try {
      const service = import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('placeholder')
        ? FileService
        : MockFileService

      const url = await service.getDownloadUrl(file.id)
      const a = document.createElement('a')
      a.href = url
      a.download = file.name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error starting download:', error)
      setError('开始下载失败')
    }
  }

  // 下载管理模块已移除，用户点击文件或下载按钮直接下载

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Cloud className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">用户下载中心</h1>
          </div>
          
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-8">
          <div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4">
                <FileList files={files} onDownloadStart={handleDownloadStart} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
