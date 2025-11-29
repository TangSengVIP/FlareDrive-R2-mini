import { FileService } from '../services/fileService'
import { MockFileService } from '../services/mockFileService'
import { DownloadProgress } from '../types'

export class DownloadManager {
  private static downloads = new Map<string, XMLHttpRequest>()

  static async startDownload(
    fileId: string,
    fileName: string,
    fileSize: number,
    onProgress: (progress: DownloadProgress) => void
  ): Promise<string> {
    try {
      // Use mock service if Supabase is not configured
      const service = import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('placeholder')
        ? FileService
        : MockFileService

      // Create download record in database
      const downloadRecord = await service.createDownload(fileId)
      const downloadId = downloadRecord.id

      // Get download URL
      const downloadUrl = await service.getDownloadUrl(fileId)

      // Create initial progress object
      const progress: DownloadProgress = {
        downloadId,
        fileId,
        fileName,
        progress: 0,
        status: 'downloading',
        bytesDownloaded: 0,
        totalBytes: fileSize
      }

      // Start the download
      const xhr = new XMLHttpRequest()
      this.downloads.set(downloadId, xhr)

      xhr.open('GET', downloadUrl, true)
      xhr.responseType = 'blob'

      xhr.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100)
          progress.progress = percentComplete
          progress.bytesDownloaded = event.loaded
          progress.totalBytes = event.total
          onProgress(progress)
        }
      }

      xhr.onload = async () => {
        if (xhr.status === 200) {
          // Create blob and download
          const blob = new Blob([xhr.response])
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = fileName
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          window.URL.revokeObjectURL(url)

          // Update progress to completed
          progress.progress = 100
          progress.status = 'completed'
          onProgress(progress)

          // Update database
          await service.updateDownloadProgress(downloadId, 100, 'completed')
        } else {
          throw new Error('Download failed')
        }
      }

      xhr.onerror = async () => {
        progress.status = 'failed'
        onProgress(progress)
        await service.updateDownloadProgress(downloadId, 0, 'failed')
      }

      xhr.send()

      return downloadId
    } catch (error) {
      console.error('Error starting download:', error)
      throw error
    }
  }

  static cancelDownload(downloadId: string): void {
    const xhr = this.downloads.get(downloadId)
    if (xhr) {
      xhr.abort()
      this.downloads.delete(downloadId)
    }
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  static formatProgress(progress: number): string {
    return `${Math.round(progress)}%`
  }

  static categorizePlatform(nameOrPath: string): 'macos' | 'windows' | 'android' | 'other' {
    const name = nameOrPath.toLowerCase()
    if (/(^|\/)macos(\/|$)/.test(name)) return 'macos'
    if (/(^|\/)windows(\/|$)/.test(name)) return 'windows'
    if (/(^|\/)android(\/|$)/.test(name)) return 'android'
    const ext = (() => {
      if (name.endsWith('.tar.gz')) return 'tar.gz'
      const i = name.lastIndexOf('.')
      return i >= 0 ? name.slice(i + 1) : ''
    })()

    if (ext === 'dmg' || ext === 'pkg' || ext === 'app' || ext === 'tar.gz') return 'macos'
    if (ext === 'exe' || ext === 'msi') return 'windows'
    if (ext === 'apk' || ext === 'aab') return 'android'
    return 'other'
  }

  static macArchLabel(nameOrPath: string): 'Apple M CPU' | 'Intel CPU' | null {
    const s = nameOrPath.toLowerCase()
    if (/(arm64|aarch64|apple|silicon|m1|m2|m3)/.test(s)) return 'Apple M CPU'
    if (/(x64|x86_64|amd64|intel)/.test(s)) return 'Intel CPU'
    return null
  }
}
