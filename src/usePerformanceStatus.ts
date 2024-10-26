import { useEffect, useState } from 'react';

export interface ThrottleDetectionConfig {
  fpsThreshold?: number; // e.g., below 20 FPS
  longTaskThreshold?: number; // e.g., tasks longer than 50ms
  checkInterval?: number; // Interval to check for lag (e.g., every 1 second)
  onFeatureNotAvailable?: () => void; // Callback if a required feature is not available
}

const defaultConfig: ThrottleDetectionConfig = {
  fpsThreshold: 20,
  longTaskThreshold: 50,
  checkInterval: 1000,
};

export function usePerformanceStatus(config?: ThrottleDetectionConfig) {
  const [isLagging, setIsLagging] = useState(false);
  const effectiveConfig = { ...defaultConfig, ...config };

  useEffect(() => {
    if (typeof window === 'undefined') {
      console.error(
        'usePerformanceStatus can only be used in the browser environment.'
      );
      if (effectiveConfig.onFeatureNotAvailable) {
        effectiveConfig.onFeatureNotAvailable();
      }
      return;
    }

    if (typeof PerformanceObserver === 'undefined') {
      console.warn(
        'PerformanceObserver is not supported in this environment. Throttling detection will be disabled.'
      );
      if (effectiveConfig.onFeatureNotAvailable) {
        effectiveConfig.onFeatureNotAvailable();
      }
      return;
    }

    let fpsSamples: number[] = [];

    function trackFrameRate() {
      const start = performance.now();
      requestAnimationFrame(() => {
        const end = performance.now();
        const fps = 1000 / (end - start);
        fpsSamples.push(fps);
      });
    }

    function checkPerformance() {
      const averageFPS =
        fpsSamples.reduce((a, b) => a + b, 0) / fpsSamples.length;
      if (averageFPS < effectiveConfig.fpsThreshold!) {
        setIsLagging(true);
      } else {
        setIsLagging(false);
      }
      fpsSamples = [];
    }

    const observer = new PerformanceObserver(list => {
      list.getEntries().forEach(entry => {
        if (entry.duration > effectiveConfig.longTaskThreshold!) {
          setIsLagging(true);
        }
      });
    });

    try {
      observer.observe({ entryTypes: ['longtask'] });
    } catch (error) {
      console.error('Failed to set up PerformanceObserver: ', error);
      if (effectiveConfig.onFeatureNotAvailable) {
        effectiveConfig.onFeatureNotAvailable();
      }
      return;
    }

    const frameInterval = setInterval(trackFrameRate, 1000 / 60);
    const checkInterval = setInterval(
      checkPerformance,
      effectiveConfig.checkInterval
    );

    return () => {
      clearInterval(frameInterval);
      clearInterval(checkInterval);
      observer.disconnect();
    };
  }, [config]);

  return isLagging;
}
