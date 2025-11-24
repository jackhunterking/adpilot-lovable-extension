/**
 * Feature: Image Upload Hook
 * Purpose: Reusable hook for uploading ad images to Supabase Storage
 * References:
 *   - API: /api/v1/ads/images/upload
 *   - Storage: ad-images bucket
 */

import { useState, useCallback } from 'react';

export interface UploadResult {
  success: boolean;
  url?: string;
  filename?: string;
  size?: number;
  path?: string;
  error?: string;
  message?: string;
}

export interface DeleteResult {
  success: boolean;
  message?: string;
  error?: string;
}

export interface UploadProgress {
  fileIndex: number;
  fileName: string;
  progress: number; // 0-100
  status: 'pending' | 'uploading' | 'completed' | 'error';
  url?: string;
  error?: string;
}

/**
 * Hook for uploading images to Supabase Storage
 * Supports single and multiple file uploads with progress tracking
 */
export function useImageUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgresses, setUploadProgresses] = useState<UploadProgress[]>([]);

  /**
   * Upload a single image
   * @param file File to upload
   * @param adId Ad ID to associate with image
   * @param campaignId Campaign ID to associate with image
   * @returns Upload result with public URL
   */
  const uploadImage = useCallback(async (
    file: File,
    adId: string,
    campaignId: string
  ): Promise<UploadResult> => {
    setIsUploading(true);
    setError(null);
    setProgress(0);

    try {
      // Validate file size (10MB limit)
      const MAX_SIZE = 10 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        throw new Error(`File size must be less than ${MAX_SIZE / 1024 / 1024}MB`);
      }

      // Validate file type
      const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
      if (!ALLOWED_TYPES.includes(file.type)) {
        throw new Error('Only PNG, JPEG, and WebP images are allowed');
      }

      // Prepare form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('adId', adId);
      formData.append('campaignId', campaignId);

      // Upload with progress tracking (simulated for now)
      setProgress(25);

      const response = await fetch('/api/v1/ads/images/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      setProgress(75);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Upload failed');
      }

      setProgress(100);

      return {
        success: true,
        url: data.url,
        filename: data.filename,
        size: data.size,
        path: data.path,
        message: data.message,
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      
      return {
        success: false,
        error: errorMessage,
      };

    } finally {
      setIsUploading(false);
      // Reset progress after a delay
      setTimeout(() => setProgress(0), 1000);
    }
  }, []);

  /**
   * Upload multiple images with progress tracking
   * @param files Array of files to upload
   * @param adId Ad ID to associate with images
   * @param campaignId Campaign ID to associate with images
   * @returns Array of upload results
   */
  const uploadMultipleImages = useCallback(async (
    files: File[],
    adId: string,
    campaignId: string
  ): Promise<UploadResult[]> => {
    setIsUploading(true);
    setError(null);

    // Initialize progress tracking
    const initialProgresses: UploadProgress[] = files.map((file, index) => ({
      fileIndex: index,
      fileName: file.name,
      progress: 0,
      status: 'pending' as const,
    }));
    setUploadProgresses(initialProgresses);

    const results: UploadResult[] = [];

    try {
      // Upload files sequentially to avoid overwhelming the server
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Update status to uploading
        setUploadProgresses(prev => prev.map((p, idx) =>
          idx === i ? { ...p, status: 'uploading' as const, progress: 10 } : p
        ));

        try {
          const result = await uploadImage(file, adId, campaignId);

          if (result.success) {
            // Update status to completed
            setUploadProgresses(prev => prev.map((p, idx) =>
              idx === i ? { 
                ...p, 
                status: 'completed' as const, 
                progress: 100,
                url: result.url 
              } : p
            ));
          } else {
            // Update status to error
            setUploadProgresses(prev => prev.map((p, idx) =>
              idx === i ? { 
                ...p, 
                status: 'error' as const,
                error: result.error 
              } : p
            ));
          }

          results.push(result);

        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Upload failed';
          
          // Update status to error
          setUploadProgresses(prev => prev.map((p, idx) =>
            idx === i ? { 
              ...p, 
              status: 'error' as const,
              error: errorMessage 
            } : p
          ));

          results.push({
            success: false,
            error: errorMessage,
          });
        }
      }

      // Check if any uploads failed
      const failedCount = results.filter(r => !r.success).length;
      if (failedCount > 0) {
        setError(`${failedCount} of ${files.length} uploads failed`);
      }

      return results;

    } finally {
      setIsUploading(false);
      // Clear progress after delay
      setTimeout(() => setUploadProgresses([]), 3000);
    }
  }, [uploadImage]);

  /**
   * Delete an image from storage
   * @param storagePath Storage path of the image
   * @returns Delete result
   */
  const deleteImage = useCallback(async (
    storagePath: string
  ): Promise<DeleteResult> => {
    try {
      const response = await fetch(
        `/api/v1/ads/images/upload?path=${encodeURIComponent(storagePath)}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Delete failed');
      }

      return {
        success: true,
        message: data.message,
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Delete failed';
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }, []);

  /**
   * Validate file before upload
   * @param file File to validate
   * @returns Validation result
   */
  const validateFile = useCallback((file: File): { valid: boolean; error?: string } => {
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

    if (file.size > MAX_SIZE) {
      return {
        valid: false,
        error: `File "${file.name}" is too large. Maximum size is ${MAX_SIZE / 1024 / 1024}MB`,
      };
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: `File "${file.name}" has an unsupported format. Only PNG, JPEG, and WebP are allowed`,
      };
    }

    return { valid: true };
  }, []);

  /**
   * Validate multiple files
   * @param files Files to validate
   * @returns Validation results
   */
  const validateFiles = useCallback((files: File[]): {
    valid: boolean;
    errors: string[];
    validFiles: File[];
  } => {
    const errors: string[] = [];
    const validFiles: File[] = [];

    for (const file of files) {
      const result = validateFile(file);
      if (result.valid) {
        validFiles.push(file);
      } else if (result.error) {
        errors.push(result.error);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      validFiles,
    };
  }, [validateFile]);

  return {
    // Single upload
    uploadImage,
    
    // Multiple upload
    uploadMultipleImages,
    uploadProgresses,
    
    // Delete
    deleteImage,
    
    // Validation
    validateFile,
    validateFiles,
    
    // State
    isUploading,
    progress,
    error,
  };
}

