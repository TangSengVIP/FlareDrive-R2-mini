import { supabase } from '../lib/supabase'
import { FileItem, DownloadItem } from '../types'

export class FileService {
  static async getFiles(): Promise<FileItem[]> {
    try {
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching files:', error)
      throw error
    }
  }

  static async createDownload(fileId: string): Promise<DownloadItem> {
    try {
      const { data, error } = await supabase
        .from('downloads')
        .insert({
          file_id: fileId,
          status: 'pending',
          progress: 0
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating download:', error)
      throw error
    }
  }

  static async updateDownloadProgress(downloadId: string, progress: number, status: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('downloads')
        .update({ 
          progress, 
          status,
          completed_at: status === 'completed' ? new Date().toISOString() : null
        })
        .eq('id', downloadId)

      if (error) throw error
    } catch (error) {
      console.error('Error updating download progress:', error)
      throw error
    }
  }

  static async getDownloadUrl(fileId: string): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('files')
        .select('path')
        .eq('id', fileId)
        .single()

      if (error) throw error
      if (!data) throw new Error('File not found')

      const { data: { publicUrl } } = supabase
        .storage
        .from('files')
        .getPublicUrl(data.path)

      return publicUrl
    } catch (error) {
      console.error('Error getting download URL:', error)
      throw error
    }
  }
}