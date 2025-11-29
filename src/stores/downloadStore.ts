import { create } from 'zustand'
import { FileItem, DownloadProgress } from '../types'

interface DownloadStore {
  files: FileItem[]
  downloads: DownloadProgress[]
  isLoading: boolean
  error: string | null
  
  // Actions
  setFiles: (files: FileItem[]) => void
  addDownload: (download: DownloadProgress) => void
  updateDownloadProgress: (downloadId: string, progress: number, status: DownloadProgress['status']) => void
  removeDownload: (downloadId: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useDownloadStore = create<DownloadStore>((set) => ({
  files: [],
  downloads: [],
  isLoading: false,
  error: null,
  
  setFiles: (files) => set({ files }),
  
  addDownload: (download) => set((state) => ({
    downloads: [...state.downloads, download]
  })),
  
  updateDownloadProgress: (downloadId, progress, status) => set((state) => ({
    downloads: state.downloads.map(download =>
      download.downloadId === downloadId
        ? { ...download, progress, status }
        : download
    )
  })),
  
  removeDownload: (downloadId) => set((state) => ({
    downloads: state.downloads.filter(download => download.downloadId !== downloadId)
  })),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error })
}))