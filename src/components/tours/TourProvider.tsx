"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface TourContextType {
  runTour: (tourName: string) => void;
  stopTour: () => void;
  resetTour: (tourName: string) => void;
  isTourComplete: (tourName: string) => boolean;
  currentTour: string | null;
  markTourComplete: (tourName: string) => void;
  isInitialized: boolean;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

const TOUR_STORAGE_KEY = 'lms_completed_tours';

export function TourProvider({ children }: { children: ReactNode }) {
  const [currentTour, setCurrentTour] = useState<string | null>(null);
  const [completedTours, setCompletedTours] = useState<Set<string>>(new Set());
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Load completed tours from localStorage
    const stored = localStorage.getItem(TOUR_STORAGE_KEY);
    if (stored) {
      try {
        const tours = JSON.parse(stored);
        setCompletedTours(new Set(tours));
      } catch (error) {
        console.error('Failed to load tour state:', error);
      }
    }
    setIsInitialized(true);
  }, []);

  const runTour = (tourName: string) => {
    setCurrentTour(tourName);
  };

  const stopTour = () => {
    setCurrentTour(null);
  };

  const resetTour = (tourName: string) => {
    const updated = new Set(completedTours);
    updated.delete(tourName);
    setCompletedTours(updated);
    localStorage.setItem(TOUR_STORAGE_KEY, JSON.stringify(Array.from(updated)));
  };

  const isTourComplete = (tourName: string): boolean => {
    return completedTours.has(tourName);
  };

  const markTourComplete = (tourName: string) => {
    const updated = new Set(completedTours);
    updated.add(tourName);
    setCompletedTours(updated);
    localStorage.setItem(TOUR_STORAGE_KEY, JSON.stringify(Array.from(updated)));
  };

  // Expose markTourComplete through context if needed
  const contextValue: TourContextType = {
    runTour,
    stopTour,
    resetTour,
    isTourComplete,
    currentTour,
    markTourComplete,
    isInitialized,
  };

  return (
    <TourContext.Provider value={contextValue}>
      {children}
    </TourContext.Provider>
  );
}

export function useTour() {
  const context = useContext(TourContext);
  if (context === undefined) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
}
