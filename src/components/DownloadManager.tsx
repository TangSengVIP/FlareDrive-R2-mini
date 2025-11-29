import React from 'react'
import { X, Pause, Play, Download } from 'lucide-react'
import { DownloadProgress } from '../types'
import { DownloadManager } from '../utils/downloadUtils'
import { useDownloadStore } from '../stores/downloadStore'

interface DownloadManagerProps {
  downloads: DownloadProgress[]
  onCancel: (downloadId: string) => void
}

export const DownloadManagerComponent: React.FC<DownloadManagerProps> = ({ downloads, onCancel }) => {
  if (downloads.length === 0) {
    return null
  }

  const getStatusColor = (status: DownloadProgress['status']) => {
    switch (status) {
      case 'downloading':
        return 'text-blue-600'
      case 'completed':
        return 'text-green-600'
      case 'failed':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusText = (status: DownloadProgress['status']) => {
    switch (status) {
      case 'downloading':
        return '下载中'
      case 'completed':
        return '已完成'
      case 'failed':
        return '下载失败'
      default:
        return '等待中'
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">下载管理</h2>
      <div className="space-y-4">
        {downloads.map((download) => (
          <div key={download.downloadId} className="border border-gray-100 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <Download className="h-5 w-5 text-blue-600" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {download.fileName}
                  </p>
                  <p className={`text-sm ${getStatusColor(download.status)}`}>
                    {getStatusText(download.status)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {download.status === 'downloading' && (
                  <span className="text-sm text-gray-600">
                    {DownloadManager.formatProgress(download.progress)}
                  </span>
                )}
                {download.status === 'downloading' && (
                  <button
                    onClick={() => onCancel(download.downloadId)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="取消下载"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            
            {download.status === 'downloading' && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${download.progress}%` }}
                />
              </div>
            )}
            
            {download.status === 'completed' && (
              <div className="text-xs text-gray-500 mt-2">
                文件大小: {DownloadManager.formatFileSize(download.totalBytes)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}