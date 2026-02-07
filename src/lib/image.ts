import imageCompression from 'browser-image-compression';

interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
}

const DEFAULT_OPTIONS: CompressionOptions = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
};

/**
 * Compress an image file before upload
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  try {
    const compressedFile = await imageCompression(file, mergedOptions);
    
    console.log(
      `Image compressed: ${(file.size / 1024 / 1024).toFixed(2)}MB -> ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`
    );
    
    return compressedFile;
  } catch (error) {
    console.warn('Image compression failed, using original:', error);
    return file;
  }
}

/**
 * Validate if a file is an acceptable image
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB

  if (!ACCEPTED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Please upload a valid image (JPEG, PNG, WebP, or GIF)',
    };
  }

  if (file.size > MAX_SIZE) {
    return {
      valid: false,
      error: 'Image size must be less than 10MB',
    };
  }

  return { valid: true };
}

/**
 * Create a preview URL for an image file
 */
export function createImagePreview(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Revoke a preview URL to free memory
 */
export function revokeImagePreview(url: string): void {
  URL.revokeObjectURL(url);
}
