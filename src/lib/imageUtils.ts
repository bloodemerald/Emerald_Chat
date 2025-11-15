import {
  SCREENSHOT_MAX_WIDTH,
  SCREENSHOT_MAX_HEIGHT,
  SCREENSHOT_QUALITY,
  SCREENSHOT_FORMAT,
} from './constants';

/**
 * Compress and resize an image from a video stream
 */
export async function compressScreenshot(
  video: HTMLVideoElement,
  quality: number = SCREENSHOT_QUALITY
): Promise<string> {
  const canvas = document.createElement('canvas');

  // Calculate scaled dimensions while maintaining aspect ratio
  const videoWidth = video.videoWidth;
  const videoHeight = video.videoHeight;
  const aspectRatio = videoWidth / videoHeight;

  let targetWidth = videoWidth;
  let targetHeight = videoHeight;

  if (videoWidth > SCREENSHOT_MAX_WIDTH) {
    targetWidth = SCREENSHOT_MAX_WIDTH;
    targetHeight = Math.round(SCREENSHOT_MAX_WIDTH / aspectRatio);
  }

  if (targetHeight > SCREENSHOT_MAX_HEIGHT) {
    targetHeight = SCREENSHOT_MAX_HEIGHT;
    targetWidth = Math.round(SCREENSHOT_MAX_HEIGHT * aspectRatio);
  }

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // Enable image smoothing for better quality when downscaling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Draw the video frame to canvas with scaled dimensions
  ctx.drawImage(video, 0, 0, targetWidth, targetHeight);

  // Convert to compressed format (WebP or JPEG with quality setting)
  return canvas.toDataURL(SCREENSHOT_FORMAT, quality);
}

/**
 * Get the size of a base64 image in bytes
 */
export function getBase64Size(base64String: string): number {
  // Remove data URL prefix if present
  const base64 = base64String.replace(/^data:image\/\w+;base64,/, '');

  // Calculate size (base64 is ~33% larger than original)
  const padding = (base64.match(/=/g) || []).length;
  return Math.floor((base64.length * 3) / 4) - padding;
}

/**
 * Format bytes to human readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Validate that a string is a valid base64 image
 */
export function isValidBase64Image(str: string): boolean {
  if (!str || typeof str !== 'string') return false;

  // Check for data URL format
  const base64Regex = /^data:image\/(png|jpeg|jpg|webp|gif);base64,/;
  if (!base64Regex.test(str)) return false;

  // Try to decode the base64 part
  try {
    const base64 = str.split(',')[1];
    if (!base64) return false;

    // Check if it's valid base64
    const decoded = atob(base64);
    return decoded.length > 0;
  } catch {
    return false;
  }
}

/**
 * Create a thumbnail from a base64 image
 */
export async function createThumbnail(
  base64Image: string,
  maxWidth: number = 200,
  maxHeight: number = 200
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // Calculate scaled dimensions
      const aspectRatio = img.width / img.height;
      let targetWidth = img.width;
      let targetHeight = img.height;

      if (targetWidth > maxWidth) {
        targetWidth = maxWidth;
        targetHeight = Math.round(maxWidth / aspectRatio);
      }

      if (targetHeight > maxHeight) {
        targetHeight = maxHeight;
        targetWidth = Math.round(maxHeight * aspectRatio);
      }

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = base64Image;
  });
}
