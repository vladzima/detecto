import { useEffect, useState, useCallback } from 'react';

export interface ThrottleDetectionConfig {
  fpsThreshold?: number; // e.g., below 20 FPS
  longTaskThreshold?: number; // e.g., tasks longer than 50ms
  checkInterval?: number; // Interval to check for lag (e.g., every 1 second)
  initialSamplingDuration?: number; // Time period for extended initial sampling (in milliseconds)
  lagRecoveryDelay?: number; // Cooldown for switching back from lagging state
  autoRecover?: boolean; // Option to control if lagging state should auto-recover
  onFeatureNotAvailable?: () => void; // Callback if a required feature is not available
}

const defaultConfig: ThrottleDetectionConfig = {
  fpsThreshold: 20,
  longTaskThreshold: 50,
  checkInterval: 1000,
  initialSamplingDuration: 5000,
  lagRecoveryDelay: 3000,
  autoRecover: true,
};

export function usePerformanceStatus(config?: ThrottleDetectionConfig) {
  const [isLagging, setIsLagging] = useState(false);
  const effectiveConfig = { ...defaultConfig, ...config };

  let lastLaggingTime = 0;

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

    if (process.env.NODE_ENV === 'development') {
      console.log('Detecto has started monitoring performance.');
    }

    let fpsSamples: number[] = [];
    let initialSamplingComplete = false;

    // Set timeout for the initial sampling period
    setTimeout(() => {
      initialSamplingComplete = true;
    }, effectiveConfig.initialSamplingDuration);

    function trackFrameRate() {
      if (document.hidden) {
        return;
      }

      const start = performance.now();
      requestAnimationFrame(() => {
        const end = performance.now();
        const fps = 1000 / (end - start);
        fpsSamples.push(fps);
      });
    }

    function checkPerformance() {
      if (fpsSamples.length === 0) {
        // No frames were sampled, possibly due to inactivity.
        return;
      }

      const averageFPS =
        fpsSamples.reduce((a, b) => a + b, 0) / fpsSamples.length;

      if (initialSamplingComplete) {
        const now = Date.now();

        if (averageFPS < effectiveConfig.fpsThreshold!) {
          setIsLagging(true);
          lastLaggingTime = now;
        } else if (
          effectiveConfig.autoRecover &&
          isLagging &&
          now - lastLaggingTime > effectiveConfig.lagRecoveryDelay!
        ) {
          setIsLagging(false);
        }
      }

      if (process.env.NODE_ENV === 'development') {
        const currentTime = Date.now();
        if (currentTime - lastLaggingTime > 10000) {
          // Log every 10 seconds
          if (!isNaN(averageFPS)) {
            console.log(`Average FPS: ${averageFPS.toFixed(2)}`);
            if (isLagging) {
              console.warn('Performance warning: FPS is below the threshold.');
            }
          } else {
            console.log(
              'No frames rendered during this interval (page possibly idle).'
            );
          }
          lastLaggingTime = currentTime;
        }
      }

      fpsSamples = [];
    }

    const observer = new PerformanceObserver(list => {
      if (document.hidden) {
        return;
      }

      list.getEntries().forEach(entry => {
        if (
          entry.duration > effectiveConfig.longTaskThreshold! &&
          initialSamplingComplete
        ) {
          setIsLagging(true);

          if (process.env.NODE_ENV === 'development') {
            console.warn(`Long task detected: ${entry.duration.toFixed(2)}ms`);
          }
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

  const resetLagging = useCallback(() => {
    setIsLagging(false);
  }, []);

  return { isLagging, resetLagging };
}
