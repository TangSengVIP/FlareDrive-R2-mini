import React from 'react'
import { Download } from 'lucide-react'
import { FileItem } from '../types'
import { DownloadManager } from '../utils/downloadUtils'

interface FileListProps {
  files: FileItem[]
  onDownloadStart: (file: FileItem) => void
}

export const FileList: React.FC<FileListProps> = ({ files, onDownloadStart }) => {
  const handleDownload = (file: FileItem) => {
    onDownloadStart(file)
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">暂无可下载文件</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {files.map((file) => (
        <div
          key={file.id}
          className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h3
                className="text-sm font-medium text-blue-600 hover:underline truncate cursor-pointer"
                onClick={() => handleDownload(file)}
                title="点击下载"
              >
                {file.name}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {DownloadManager.formatFileSize(file.size)}
              </p>
            </div>
            <div className="ml-4 flex-shrink-0">
              <button
                onClick={() => handleDownload(file)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                下载
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
