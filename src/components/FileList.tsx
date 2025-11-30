import React from 'react'
import { Download, Apple, Laptop, Smartphone } from 'lucide-react'
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
          className="bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-200 hover:shadow transition"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h3
                className="text-base font-semibold text-blue-700 hover:underline truncate cursor-pointer"
                onClick={() => handleDownload(file)}
                title="点击下载"
              >
                {file.name}
              </h3>
              <div className="mt-1 flex items-center gap-2 flex-wrap">
                <p className="text-xs text-gray-600">
                  {DownloadManager.formatFileSize(file.size)}
                </p>
                {(() => {
                  const platform = DownloadManager.categorizePlatform(file.name)
                  const label = platform === 'macos' ? 'macOS' : platform === 'windows' ? 'Windows' : platform === 'android' ? 'Android' : null
                  const color = platform === 'macos' ? 'text-blue-700 bg-blue-50' : platform === 'windows' ? 'text-green-700 bg-green-50' : platform === 'android' ? 'text-amber-700 bg-amber-50' : ''
                  const arch = platform === 'macos' ? DownloadManager.macArchLabel(file.path || file.name) : null
                  const brand = (() => {
                    const p = (file.path || '').toLowerCase()
                    if (p.includes('flclash')) return 'FlClash'
                    if (p.includes('clash-verge-rev')) return 'Clash Verge'
                    if (p.includes('cmfa') || p.includes('clashmetaforandroid')) return 'CMFA'
                    return null
                  })()
                  return (
                    <>
                      {label && (
                        <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded ${color}`}>
                          {platform === 'macos' && <Apple className="h-3 w-3 mr-1" />}
                          {platform === 'windows' && <Laptop className="h-3 w-3 mr-1" />}
                          {platform === 'android' && <Smartphone className="h-3 w-3 mr-1" />}
                          {label}
                        </span>
                      )}
                      {arch && (
                        <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded ${arch === 'Apple M CPU' ? 'text-purple-700 bg-purple-50' : 'text-gray-700 bg-gray-100'}`}>{arch}</span>
                      )}
                      {brand && (
                        <a
                          href={brand === 'FlClash' ? 'https://github.com/chen08209/FlClash' : brand === 'Clash Verge' ? 'https://github.com/clash-verge-rev/clash-verge-rev' : 'https://github.com/MetaCubeX/ClashMetaForAndroid'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-2 py-0.5 text-xs rounded text-sky-700 bg-sky-50 hover:bg-sky-100"
                          title={`查看 ${brand} 项目说明`}
                        >
                          {brand}
                        </a>
                      )}
                    </>
                  )
                })()}
              </div>
            </div>
            <div className="ml-4 flex-shrink-0">
              <button
                onClick={() => handleDownload(file)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
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
