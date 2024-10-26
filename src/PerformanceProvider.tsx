import React, { createContext, useContext } from 'react';
import {
  usePerformanceStatus,
  ThrottleDetectionConfig,
} from './usePerformanceStatus';

const PerformanceContext = createContext<boolean>(false);

interface PerformanceProviderProps extends React.PropsWithChildren {
  config?: ThrottleDetectionConfig;
}

export const PerformanceProvider: React.FC<PerformanceProviderProps> = ({
  config,
  children,
}) => {
  const isLagging = usePerformanceStatus(config);
  return (
    <PerformanceContext.Provider value={isLagging}>
      {children}
    </PerformanceContext.Provider>
  );
};

export const usePerformance = () => useContext(PerformanceContext);
