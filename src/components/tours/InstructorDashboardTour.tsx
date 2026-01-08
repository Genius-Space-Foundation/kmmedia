"use client";

import React from 'react';
import Joyride, { Step, CallBackProps, STATUS, EVENTS } from '@list-labs/react-joyride';
import { useTour } from './TourProvider';

const TOUR_NAME = 'instructor-dashboard';

const steps: Step[] = [
  {
    target: '.create-course-button',
    content: 'Welcome! Start by creating your first course here. Click this button to begin building your teaching portfolio.',
    disableBeacon: true,
    placement: 'bottom',
  },
  {
    target: '.courses-tab',
    content: 'View and manage all your courses in the Courses tab. You can edit, publish, and track course performance.',
    placement: 'bottom',
  },
  {
    target: '.students-tab',
    content: 'Monitor your students\' progress, engagement, and performance in the Students tab.',
    placement: 'bottom',
  },
  {
    target: '.assessments-tab',
    content: 'Create quizzes and assignments, then grade student submissions in the Assessments tab.',
    placement: 'bottom',
  },
  {
    target: '.analytics-tab',
    content: 'Track detailed analytics about course performance, student engagement, and learning outcomes.',
    placement: 'bottom',
  },
  {
    target: '.announcements-tab',
    content: 'Communicate with your students by posting announcements that they\'ll see on their dashboards.',
    placement: 'bottom',
  },
];

export function InstructorDashboardTour() {
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

    // Log events for debugging
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
          primaryColor: '#6366f1', // brand-primary color
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
