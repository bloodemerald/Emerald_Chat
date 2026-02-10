import { useCallback, useEffect, useRef, useState } from 'react';

interface UseTimedNotificationOptions {
  autoDismissMs: number;
  onComplete?: () => void;
  enterDelayMs?: number;
  exitDurationMs?: number;
}

const DEFAULT_ENTER_DELAY_MS = 50;
const DEFAULT_EXIT_DURATION_MS = 300;

export function useTimedNotification({
  autoDismissMs,
  onComplete,
  enterDelayMs = DEFAULT_ENTER_DELAY_MS,
  exitDurationMs = DEFAULT_EXIT_DURATION_MS,
}: UseTimedNotificationOptions) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const isDismissingRef = useRef(false);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    if (isDismissingRef.current) {
      return;
    }

    isDismissingRef.current = true;
    setIsExiting(true);

    if (exitTimerRef.current) {
      clearTimeout(exitTimerRef.current);
    }

    exitTimerRef.current = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, exitDurationMs);
  }, [exitDurationMs, onComplete]);

  useEffect(() => {
    isDismissingRef.current = false;
    setIsExiting(false);

    const enterTimer = setTimeout(() => setIsVisible(true), enterDelayMs);
    const dismissTimer = setTimeout(() => {
      dismiss();
    }, autoDismissMs);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(dismissTimer);
      if (exitTimerRef.current) {
        clearTimeout(exitTimerRef.current);
      }
    };
  }, [autoDismissMs, dismiss, enterDelayMs]);

  return {
    isVisible,
    isExiting,
    dismiss,
  };
}
