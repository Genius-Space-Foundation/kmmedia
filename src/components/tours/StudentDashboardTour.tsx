"use client";

import React from 'react';
import Joyride, { Step, CallBackProps, STATUS, EVENTS } from 'react-joyride';
import { useTour } from './TourProvider';

const TOUR_NAME = 'student-dashboard';

const steps: Step[] = [
  {
    target: '.overview-tab',
    content: 'Welcome to your learning dashboard! Start here to see your personalized overview, progress, and upcoming deadlines.',
    disableBeacon: true,
    placement: 'bottom',
  },
  {
    target: '.courses-tab',
    content: 'Access all your enrolled courses here. Click on any course to view lessons, assignments, and track your progress.',
    placement: 'bottom',
  },
  {
    target: '.assignments-tab',
    content: 'View and submit your assignments here. Keep track of deadlines and submission status.',
    placement: 'bottom',
  },
  {
    target: '.assessments-tab',
    content: 'Take quizzes and assessments to test your knowledge. Your scores are recorded automatically.',
    placement: 'bottom',
  },
  {
    target: '.attendance-tab',
    content: 'Track your attendance records and check-in to live sessions from here.',
    placement: 'bottom',
  },
  {
    target: '.payments-tab',
    content: 'Manage your course payments, view payment history, and handle installments.',
    placement: 'bottom',
  },
  {
    target: '.profile-menu',
    content: 'Access your profile, settings, and logout from here. Good luck with your learning journey!',
    placement: 'bottom',
  },
];

export function StudentDashboardTour() {
  const { currentTour, stopTour, markTourComplete } = useTour();
  const isRunning = currentTour === TOUR_NAME;

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
