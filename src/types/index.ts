export interface FileItem {
  id: string
  name: string
  size: number
  path: string
  created_at: string
}

export interface DownloadItem {
  id: string
  file_id: string
  status: 'pending' | 'downloading' | 'completed' | 'failed'
  progress: number
  started_at: string
  completed_at?: string
}

export interface DownloadProgress {
  downloadId: string
  fileId: string
  fileName: string
  progress: number
  status: 'pending' | 'downloading' | 'completed' | 'failed'
  bytesDownloaded: number
  totalBytes: number
}