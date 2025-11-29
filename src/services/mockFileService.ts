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
    // Priority 1: Pages Functions API (auto list R2 when bound)
    try {
      const apiRes = await fetch('/api/files')
      if (apiRes.ok) {
        const files = await apiRes.json() as FileItem[]
        if (Array.isArray(files) && files.length >= 0) return files
      }
    } catch (_) {}

    // Priority 2: Static public/files.json
    try {
      const res = await fetch('/files.json')
      if (res.ok) {
        const list = await res.json() as Array<{ id?: string; name?: string; size?: number; path: string }>
        const pub = import.meta.env.VITE_PUBURL as string | undefined
        return await Promise.all(list.map(async (item, idx) => {
          const derivedName = item.name ?? (item.path.split('/').pop() ?? item.path)
          let size = item.size ?? 0
          if ((!size || size === 0) && pub) {
            try {
              const base = pub.endsWith('/') ? pub.slice(0, -1) : pub
              const head = await fetch(`${base}/${item.path}`, { method: 'HEAD' })
              const length = head.headers.get('content-length')
              if (length) size = Number(length)
            } catch (_) {}
          }
          return {
            id: item.id ?? String(idx + 1),
            name: derivedName,
            size,
            path: item.path,
            created_at: new Date().toISOString()
          } as FileItem
        }))
      }
    } catch (_) {}

    // Priority 3: Built-in mock list
    return mockFiles
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
