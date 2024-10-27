import React, { createContext, useContext } from 'react';
import {
  usePerformanceStatus,
  ThrottleDetectionConfig,
} from './usePerformanceStatus';

interface PerformanceContextType {
  isLagging: boolean;
  resetLagging: () => void;
}

const PerformanceContext = createContext<PerformanceContextType>({
  isLagging: false,
  resetLagging: () => {},
});

interface PerformanceProviderProps extends React.PropsWithChildren {
  config?: ThrottleDetectionConfig;
}

export const PerformanceProvider: React.FC<PerformanceProviderProps> = ({
  config,
  children,
}) => {
  const performanceStatus = usePerformanceStatus(config);

  return (
    <PerformanceContext.Provider value={performanceStatus}>
      {children}
    </PerformanceContext.Provider>
  );
};

export const usePerformance = () => useContext(PerformanceContext);
