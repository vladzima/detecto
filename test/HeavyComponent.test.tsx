import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  PerformanceProvider,
  usePerformance,
} from '../src/PerformanceProvider';

const HeavyComponent: React.FC = () => {
  const isLagging = usePerformance();

  return (
    <div>
      {isLagging
        ? 'Rendering lightweight version...'
        : 'Rendering full version...'}
    </div>
  );
};

test('HeavyComponent renders without crashing', () => {
  render(
    <PerformanceProvider>
      <HeavyComponent />
    </PerformanceProvider>
  );
  expect(screen.getByText('Rendering full version...')).toBeInTheDocument();
});
