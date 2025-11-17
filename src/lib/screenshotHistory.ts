/**
 * Screenshot History Management
 * Tracks multiple screenshots over time and detects changes between frames
 */

export interface ScreenshotFrame {
  id: string;
  timestamp: number;
  image: string; // base64 image data
  detectedContent: string;
  changeDescription?: string; // AI-generated description of what changed from previous frame
  changeScore?: number; // 0-100 score indicating magnitude of change
}

export interface ScreenshotHistory {
  frames: ScreenshotFrame[];
  maxFrames: number;
}

const SCREENSHOT_HISTORY_KEY = 'screenshot_history';
const MAX_HISTORY_FRAMES = 20; // Keep last 20 screenshots

/**
 * Initialize or load screenshot history
 */
export const loadScreenshotHistory = (): ScreenshotHistory => {
  try {
    const stored = localStorage.getItem(SCREENSHOT_HISTORY_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        frames: parsed.frames || [],
        maxFrames: MAX_HISTORY_FRAMES
      };
    }
  } catch (error) {
    console.error('Failed to load screenshot history:', error);
  }

  return {
    frames: [],
    maxFrames: MAX_HISTORY_FRAMES
  };
};

/**
 * Save screenshot history to localStorage
 */
export const saveScreenshotHistory = (history: ScreenshotHistory): void => {
  try {
    localStorage.setItem(SCREENSHOT_HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to save screenshot history:', error);
    // If quota exceeded, try removing oldest frames
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      const reducedHistory = {
        ...history,
        frames: history.frames.slice(-10) // Keep only last 10 frames
      };
      localStorage.setItem(SCREENSHOT_HISTORY_KEY, JSON.stringify(reducedHistory));
    }
  }
};

/**
 * Add a new screenshot frame to history
 */
export const addScreenshotFrame = (
  history: ScreenshotHistory,
  screenshot: string,
  detectedContent: string,
  changeDescription?: string,
  changeScore?: number
): ScreenshotHistory => {
  const newFrame: ScreenshotFrame = {
    id: `frame_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    image: screenshot,
    detectedContent,
    changeDescription,
    changeScore
  };

  const updatedFrames = [...history.frames, newFrame];

  // Keep only the most recent frames
  const trimmedFrames = updatedFrames.slice(-history.maxFrames);

  const newHistory = {
    ...history,
    frames: trimmedFrames
  };

  saveScreenshotHistory(newHistory);
  return newHistory;
};

/**
 * Get the previous frame from history
 */
export const getPreviousFrame = (history: ScreenshotHistory): ScreenshotFrame | null => {
  if (history.frames.length === 0) return null;
  return history.frames[history.frames.length - 1];
};

/**
 * Clear screenshot history
 */
export const clearScreenshotHistory = (): void => {
  localStorage.removeItem(SCREENSHOT_HISTORY_KEY);
};

/**
 * Get frames within a time range
 */
export const getFramesInRange = (
  history: ScreenshotHistory,
  startTime: number,
  endTime: number
): ScreenshotFrame[] => {
  return history.frames.filter(
    frame => frame.timestamp >= startTime && frame.timestamp <= endTime
  );
};

/**
 * Get recent frames (last N frames)
 */
export const getRecentFrames = (
  history: ScreenshotHistory,
  count: number
): ScreenshotFrame[] => {
  return history.frames.slice(-count);
};

/**
 * Get frames with significant changes (change score above threshold)
 */
export const getSignificantChanges = (
  history: ScreenshotHistory,
  threshold: number = 50
): ScreenshotFrame[] => {
  return history.frames.filter(
    frame => frame.changeScore !== undefined && frame.changeScore >= threshold
  );
};

/**
 * Calculate simple visual difference between two base64 images
 * Returns a score from 0-100 (0 = identical, 100 = completely different)
 */
export const calculateVisualDifference = async (
  image1: string,
  image2: string
): Promise<number> => {
  return new Promise((resolve) => {
    try {
      const canvas1 = document.createElement('canvas');
      const canvas2 = document.createElement('canvas');
      const ctx1 = canvas1.getContext('2d');
      const ctx2 = canvas2.getContext('2d');

      if (!ctx1 || !ctx2) {
        resolve(0);
        return;
      }

      const img1 = new Image();
      const img2 = new Image();

      let loadedCount = 0;

      const onImageLoad = () => {
        loadedCount++;
        if (loadedCount === 2) {
          // Set canvas dimensions (use smaller size for faster comparison)
          const width = 160; // Small size for quick comparison
          const height = 90;

          canvas1.width = canvas2.width = width;
          canvas1.height = canvas2.height = height;

          // Draw images
          ctx1.drawImage(img1, 0, 0, width, height);
          ctx2.drawImage(img2, 0, 0, width, height);

          // Get pixel data
          const data1 = ctx1.getImageData(0, 0, width, height).data;
          const data2 = ctx2.getImageData(0, 0, width, height).data;

          // Calculate difference
          let totalDiff = 0;
          const pixelCount = width * height;

          for (let i = 0; i < data1.length; i += 4) {
            const rDiff = Math.abs(data1[i] - data2[i]);
            const gDiff = Math.abs(data1[i + 1] - data2[i + 1]);
            const bDiff = Math.abs(data1[i + 2] - data2[i + 2]);
            totalDiff += (rDiff + gDiff + bDiff) / 3;
          }

          // Normalize to 0-100 scale
          const avgDiff = totalDiff / pixelCount;
          const score = Math.min(100, (avgDiff / 255) * 100);

          resolve(Math.round(score));
        }
      };

      img1.onload = onImageLoad;
      img2.onload = onImageLoad;

      img1.onerror = () => resolve(0);
      img2.onerror = () => resolve(0);

      img1.src = image1;
      img2.src = image2;

      // Timeout after 5 seconds
      setTimeout(() => resolve(0), 5000);
    } catch (error) {
      console.error('Error calculating visual difference:', error);
      resolve(0);
    }
  });
};
