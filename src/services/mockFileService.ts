import { FileItem, DownloadItem } from '../types'

// Mock data for testing
const mockFiles: FileItem[] = [
  {
    id: '1',
    name: '示例文档.pdf',
    size: 1048576,
    path: 'documents/sample-document.pdf',
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    name: '项目模板.zip',
    size: 5242880,
    path: 'templates/project-template.zip',
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    name: '用户手册.docx',
    size: 2097152,
    path: 'manuals/user-manual.docx',
    created_at: new Date().toISOString()
  },
  {
    id: '4',
    name: '安装包.exe',
    size: 10485760,
    path: 'installers/setup-package.exe',
    created_at: new Date().toISOString()
  },
  {
    id: '5',
    name: '配置文件.json',
    size: 524288,
    path: 'configs/default-config.json',
    created_at: new Date().toISOString()
  }
]

export class MockFileService {
  static async getFiles(): Promise<FileItem[]> {
    // Try to load from public files.json for Cloudflare Pages compatibility
    try {
      await new Promise(resolve => setTimeout(resolve, 200))
      const res = await fetch('/files.json')
      if (!res.ok) throw new Error('files.json not found')
      const list = await res.json() as Array<{ id?: string; name: string; size?: number; path: string }>
      return list.map((item, idx) => ({
        id: item.id ?? String(idx + 1),
        name: item.name,
        size: item.size ?? 0,
        path: item.path,
        created_at: new Date().toISOString()
      }))
    } catch (e) {
      // Fallback to built-in mock list
      await new Promise(resolve => setTimeout(resolve, 200))
      return mockFiles
    }
  }

  static async createDownload(fileId: string): Promise<DownloadItem> {
    await new Promise(resolve => setTimeout(resolve, 200))
    return {
      id: `download-${Date.now()}`,
      file_id: fileId,
      status: 'pending',
      progress: 0,
      started_at: new Date().toISOString()
    }
  }

  static async updateDownloadProgress(downloadId: string, progress: number, status: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 100))
    console.log(`Updated download ${downloadId}: progress=${progress}, status=${status}`)
  }

  static async getDownloadUrl(fileId: string): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 100))
    // Try to find file from current list
    const fileList = await this.getFiles()
    const file = fileList.find(f => f.id === fileId)
    if (!file) throw new Error('File not found')

    // Prefer Cloudflare R2 public bucket URL if provided
    const pub = import.meta.env.VITE_PUBURL as string | undefined
    if (pub && typeof pub === 'string') {
      const base = pub.endsWith('/') ? pub.slice(0, -1) : pub
      return `${base}/${file.path}`
    }

    // Fallback: create a temporary blob URL for local testing
    const mockContent = `Mock content for ${file.name}`
    const blob = new Blob([mockContent], { type: 'application/octet-stream' })
    return URL.createObjectURL(blob)
  }
}
