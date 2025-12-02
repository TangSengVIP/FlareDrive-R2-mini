import React, { useEffect, useState } from 'react'
import { Cloud, Apple, Laptop, Smartphone, Cpu } from 'lucide-react'
import { FileList } from '../components/FileList'
import { FileService } from '../services/fileService'
import { MockFileService } from '../services/mockFileService'
import { FileItem } from '../types'
import { useDownloadStore } from '../stores/downloadStore'
import { DownloadManager } from '../utils/downloadUtils'

export const DownloadPage: React.FC = () => {
  const { files, setFiles, setLoading, setError, isLoading: storeLoading } = useDownloadStore()
  const [isLoading, setIsLoading] = useState(false)
  const [activePlatform, setActivePlatform] = useState<'macos' | 'windows' | 'android'>('macos')
  const [macSub, setMacSub] = useState<'apple' | 'intel'>('apple')
  const [bgImages, setBgImages] = useState<string[]>([])
  const [bgIndex, setBgIndex] = useState(0)

  useEffect(() => {
    loadFiles()
    ;(async () => {
      try {
        const res = await fetch('/api/bing?count=20&mkt=zh-CN')
        const data = await res.json()
        const urls: string[] = Array.isArray(data.urls) ? data.urls : []
        if (urls.length > 0) {
          setBgImages(urls)
          setBgIndex(Math.floor(Math.random() * urls.length))
        }
      } catch (err) { console.warn('bing images load failed', err) }
    })()
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
    <div
      className="min-h-screen"
      style={{
        backgroundImage: bgImages.length ? `url(${bgImages[bgIndex % bgImages.length]})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="min-h-screen flex flex-col bg-white/50">
        <div className="max-w-6xl mx-auto px-4 py-8 flex-1">
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
            <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200">
              {/* Platform Tabs */}
              <div className="px-6 py-4 border-b border-gray-200">
                {(() => {
                  const macFiles = files.filter(f => DownloadManager.categorizePlatform(f.path || f.name) === 'macos')
                  const winFiles = files.filter(f => DownloadManager.categorizePlatform(f.path || f.name) === 'windows')
                  const androidFiles = files.filter(f => DownloadManager.categorizePlatform(f.path || f.name) === 'android')
                  const baseBtn = 'px-3 py-1 text-xs sm:text-sm sm:px-5 sm:py-2 font-medium rounded-full transition focus:outline-none focus:ring-2 focus:ring-offset-2 inline-flex items-center gap-1.5 sm:gap-2 whitespace-nowrap'
                  return (
                    <div className="flex items-center justify-center">
                      <div className="bg-white/80 backdrop-blur-sm rounded-full p-0.5 sm:p-1 border border-gray-200 flex flex-wrap gap-0.5 sm:gap-1 justify-center w-full sm:w-auto">
                        <button
                          onClick={() => setActivePlatform('macos')}
                          className={`${baseBtn} ${activePlatform === 'macos' ? 'bg-blue-600 text-white ring-blue-500' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                        >
                          <Apple className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          macOS ({macFiles.length})
                        </button>
                        <button
                          onClick={() => setActivePlatform('windows')}
                          className={`${baseBtn} ${activePlatform === 'windows' ? 'bg-blue-600 text-white ring-blue-500' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                        >
                          <Laptop className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          Windows ({winFiles.length})
                        </button>
                        <button
                          onClick={() => setActivePlatform('android')}
                          className={`${baseBtn} ${activePlatform === 'android' ? 'bg-blue-600 text-white ring-blue-500' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                        >
                          <Smartphone className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          Android ({androidFiles.length})
                        </button>
                      </div>
                    </div>
                  )
                })()}
              </div>
              <div className="px-6 py-4">
                {(() => {
                  const loading = storeLoading || isLoading
                  let visibleFiles = files.filter(f => DownloadManager.categorizePlatform(f.path || f.name) === activePlatform)
                  if (loading) {
                    return (
                      <div className="space-y-3">
                        {[1,2,3].map(i => (
                          <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/5"></div>
                          </div>
                        ))}
                      </div>
                    )
                  }

                  // macOS 子分类切换与过滤
                  if (activePlatform === 'macos') {
                    const appleCount = visibleFiles.filter(f => DownloadManager.macArchLabel(f.path || f.name) === 'Apple M CPU').length
                    const intelCount = visibleFiles.filter(f => DownloadManager.macArchLabel(f.path || f.name) === 'Intel CPU').length
                    visibleFiles = visibleFiles.filter(f => {
                      const arch = DownloadManager.macArchLabel(f.path || f.name)
                      return macSub === 'apple' ? arch === 'Apple M CPU' : arch === 'Intel CPU'
                    })
                    return (
                      <div className="space-y-4">
                        <div className="flex items-center justify-center">
                          <div className="bg-gray-50 rounded-full p-0.5 sm:p-1 border border-gray-200 flex flex-wrap gap-0.5 sm:gap-1 justify-center w-full sm:w-auto">
                            <button
                              onClick={() => setMacSub('apple')}
                              className={`px-3 py-1 text-xs sm:text-sm sm:px-5 sm:py-2 font-medium rounded-full inline-flex items-center gap-1.5 sm:gap-2 whitespace-nowrap ${macSub === 'apple' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                            >
                              <Apple className="h-3.5 w-3.5" /> Apple M CPU ({appleCount})
                            </button>
                            <button
                              onClick={() => setMacSub('intel')}
                              className={`px-3 py-1 text-xs sm:text-sm sm:px-5 sm:py-2 font-medium rounded-full inline-flex items-center gap-1.5 sm:gap-2 whitespace-nowrap ${macSub === 'intel' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                            >
                              <Cpu className="h-3.5 w-3.5" /> Intel CPU ({intelCount})
                            </button>
                          </div>
                        </div>
                        {visibleFiles.length === 0 ? (
                          <div className="text-center py-12">
                            <p className="text-gray-500">当前子分类暂无可下载客户端</p>
                          </div>
                        ) : (
                          <FileList files={visibleFiles} onDownloadStart={handleDownloadStart} />
                        )}
                      </div>
                    )
                  }

                  if (visibleFiles.length === 0) {
                    return (
                      <div className="text-center py-12">
                        <p className="text-gray-500">当前分类暂无可下载客户端</p>
                      </div>
                    )
                  }
                  return <FileList files={visibleFiles} onDownloadStart={handleDownloadStart} />
                })()}
              </div>
            </div>
          </div>
        </div>
        </div>
        <div className="w-full border-t border-white/20 py-4 text-center text-xs bg-gray-900/60 text-white backdrop-blur-sm drop-shadow-sm">© 2025 ViewNet, Inc.</div>
      </div>
    </div>
  )
}
