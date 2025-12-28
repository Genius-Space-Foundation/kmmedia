"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { useTour } from './TourProvider';
import { HelpCircle, RotateCcw } from 'lucide-react';

interface TourButtonProps {
  tourName: string;
  label?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function TourButton({
  tourName,
  label,
  variant = 'outline',
  size = 'sm',
  className = '',
}: TourButtonProps) {
  const { runTour, isTourComplete, resetTour } = useTour();
  const isComplete = isTourComplete(tourName);

  const handleClick = () => {
    if (isComplete) {
      resetTour(tourName);
    }
    runTour(tourName);
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={`gap-2 ${className}`}
    >
      {isComplete ? (
        <>
          <RotateCcw className="h-4 w-4" />
          {label || 'Restart Tour'}
        </>
      ) : (
        <>
          <HelpCircle className="h-4 w-4" />
          {label || 'Take a Tour'}
        </>
      )}
    </Button>
  );
}
