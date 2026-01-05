"use client";

import React from 'react';
import Joyride, { Step, CallBackProps, STATUS, EVENTS } from 'react-joyride';
import { useTour } from './TourProvider';

const TOUR_NAME = 'admin-dashboard';

const steps: Step[] = [
  {
    target: '.overview-tab',
    content: 'Welcome to the Admin Dashboard! Get a quick snapshot of your platform\'s performance, recent activities, and key metrics.',
    disableBeacon: true,
    placement: 'bottom',
  },
  {
    target: '.users-tab',
    content: 'Manage all users, instructors, and students. You can filter, search, and perform bulk actions here.',
    placement: 'bottom',
  },
  {
    target: '.courses-tab',
    content: 'Review and approve course submissions. Ensure quality control across your course catalog.',
    placement: 'bottom',
  },
  {
    target: '.applications-tab',
    content: 'Process student applications and manage enrollments efficiently.',
    placement: 'bottom',
  },
  {
    target: '.payments-tab',
    content: 'Monitor all financial transactions, track revenue, and manage refunds.',
    placement: 'bottom',
  },
  {
    target: '.settings-tab',
    content: 'Configure platform settings, manage system configurations, and customize the LMS experience.',
    placement: 'bottom',
  },
];

export function AdminDashboardTour() {
  const { currentTour, stopTour, markTourComplete, runTour, isTourComplete, isInitialized } = useTour();
  const isRunning = currentTour === TOUR_NAME;

  React.useEffect(() => {
    if (isInitialized && !isTourComplete(TOUR_NAME) && !isRunning) {
      runTour(TOUR_NAME);
    }
  }, [isInitialized, isTourComplete, isRunning, runTour]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, type } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      stopTour();
      // Mark tour as complete
      markTourComplete(TOUR_NAME);
    }

    if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      console.log('Tour event:', type, data);
    }
  };

  if (!isRunning) return null;

  return (
    <Joyride
      steps={steps}
      run={isRunning}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: '#6366f1',
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: '12px',
          padding: '20px',
        },
        buttonNext: {
          backgroundColor: '#6366f1',
          borderRadius: '8px',
          padding: '8px 16px',
        },
        buttonBack: {
          color: '#6366f1',
          marginRight: '10px',
        },
        buttonSkip: {
          color: '#9ca3af',
        },
      }}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Finish',
        next: 'Next',
        skip: 'Skip Tour',
      }}
    />
  );
}
