/**
 * Image Context Uploader Service
 * Purpose: Upload user-provided context images to Supabase Storage
 * 
 * ⚠️ BACKEND OPERATION - Requires Supabase Configuration
 * 
 * Requirements:
 * - Supabase Storage bucket: 'ad-context-images'
 * - Bucket configuration: Public access, 7-day lifecycle policy
 * - RLS policies: Users can upload their own images
 * 
 * Flow:
 * 1. Validate image (format, size)
 * 2. Upload to temporary storage bucket
 * 3. Return public URL for passing to Lovable AI
 * 4. Images auto-delete after 7 days (lifecycle policy)
 */

import { supabase } from '@/lib/supabase/client'

export interface UploadContextImageInput {
  file: File
  userId: string
  campaignId?: string
}

export interface UploadContextImageResult {
  success: boolean
  url?: string
  error?: string
}

export class ImageContextUploader {
  private bucketName = 'ad-context-images'
  
  /**
   * Upload a context image to temporary storage
   * 
   * @param input - File and user information
   * @returns Public URL of uploaded image
   */
  async uploadContextImage(
    input: UploadContextImageInput
  ): Promise<UploadContextImageResult> {
    try {
      // Validate file
      const validation = this.validateFile(input.file)
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error
        }
      }

      // Generate unique filename
      const fileName = this.generateFileName(input.file, input.userId)
      const filePath = input.campaignId 
        ? `${input.campaignId}/${fileName}`
        : `temp/${fileName}`

      console.log('[ImageContextUploader] Uploading to:', filePath)

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .upload(filePath, input.file, {
          contentType: input.file.type,
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('[ImageContextUploader] Upload failed:', error)
        return {
          success: false,
          error: error.message || 'Upload failed'
        }
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(filePath)

      console.log('[ImageContextUploader] Upload successful:', urlData.publicUrl)

      return {
        success: true,
        url: urlData.publicUrl
      }
    } catch (error) {
      console.error('[ImageContextUploader] Unexpected error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Upload multiple context images in parallel
   * 
   * @param files - Array of files to upload
   * @param userId - User ID for file path
   * @param campaignId - Optional campaign ID
   * @returns Array of upload results
   */
  async uploadMultipleImages(
    files: File[],
    userId: string,
    campaignId?: string
  ): Promise<UploadContextImageResult[]> {
    const uploads = files.map(file =>
      this.uploadContextImage({ file, userId, campaignId })
    )
    
    return Promise.all(uploads)
  }

  /**
   * Validate image file
   */
  private validateFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg']
    if (!validTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Only PNG and JPG images are supported'
      }
    }

    // Check file size (10MB max)
    const maxSizeBytes = 10 * 1024 * 1024
    if (file.size > maxSizeBytes) {
      return {
        valid: false,
        error: 'File size must be less than 10MB'
      }
    }

    return { valid: true }
  }

  /**
   * Generate unique filename
   */
  private generateFileName(file: File, userId: string): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 9)
    const extension = file.name.split('.').pop() || 'png'
    
    return `${userId}_${timestamp}_${random}.${extension}`
  }

  /**
   * Delete a context image (cleanup)
   * 
   * @param url - Public URL of the image to delete
   */
  async deleteContextImage(url: string): Promise<boolean> {
    try {
      // Extract file path from URL
      const filePath = this.extractFilePathFromUrl(url)
      
      if (!filePath) {
        console.error('[ImageContextUploader] Invalid URL:', url)
        return false
      }

      const { error } = await supabase.storage
        .from(this.bucketName)
        .remove([filePath])

      if (error) {
        console.error('[ImageContextUploader] Delete failed:', error)
        return false
      }

      console.log('[ImageContextUploader] Deleted:', filePath)
      return true
    } catch (error) {
      console.error('[ImageContextUploader] Delete error:', error)
      return false
    }
  }

  /**
   * Extract file path from public URL
   */
  private extractFilePathFromUrl(url: string): string | null {
    try {
      // Format: https://.../storage/v1/object/public/ad-context-images/path/to/file.png
      const parts = url.split(`/${this.bucketName}/`)
      return parts.length > 1 ? parts[1] : null
    } catch {
      return null
    }
  }
}

/**
 * Singleton instance
 */
export const imageContextUploader = new ImageContextUploader()

