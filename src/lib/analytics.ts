// Basic analytics tracking
// For production, integrate with Google Analytics, Mixpanel, or similar

interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  timestamp?: string;
}

class AnalyticsTracker {
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 15)}`;
  }

  track(event: AnalyticsEvent): void {
    const enrichedEvent = {
      ...event,
      sessionId: this.sessionId,
      timestamp: event.timestamp || new Date().toISOString(),
      url: typeof window !== "undefined" ? window.location.href : undefined,
      userAgent:
        typeof window !== "undefined" ? navigator.userAgent : undefined,
    };

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.log("Analytics Event:", enrichedEvent);
    }

    // Send to analytics service (implement based on your choice)
    this.sendToAnalytics(enrichedEvent);
  }

  private sendToAnalytics(event: AnalyticsEvent): void {
    // Example: Send to Google Analytics
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", event.event, event.properties);
    }

    // Example: Send to custom analytics endpoint
    if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
      fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      }).catch((error) => {
        console.error("Analytics tracking failed:", error);
      });
    }
  }

  // Common event tracking methods
  trackPageView(page: string, properties?: Record<string, any>): void {
    this.track({
      event: "page_view",
      properties: {
        page,
        ...properties,
      },
    });
  }

  trackUserAction(action: string, properties?: Record<string, any>): void {
    this.track({
      event: "user_action",
      properties: {
        action,
        ...properties,
      },
    });
  }

  trackCourseView(courseId: string, courseTitle: string): void {
    this.track({
      event: "course_view",
      properties: {
        course_id: courseId,
        course_title: courseTitle,
      },
    });
  }

  trackApplicationSubmit(courseId: string, applicationId: string): void {
    this.track({
      event: "application_submit",
      properties: {
        course_id: courseId,
        application_id: applicationId,
      },
    });
  }

  trackPaymentInitiated(amount: number, type: string, courseId?: string): void {
    this.track({
      event: "payment_initiated",
      properties: {
        amount,
        payment_type: type,
        course_id: courseId,
      },
    });
  }

  trackPaymentCompleted(amount: number, type: string, courseId?: string): void {
    this.track({
      event: "payment_completed",
      properties: {
        amount,
        payment_type: type,
        course_id: courseId,
      },
    });
  }

  trackCourseEnrollment(courseId: string, courseTitle: string): void {
    this.track({
      event: "course_enrollment",
      properties: {
        course_id: courseId,
        course_title: courseTitle,
      },
    });
  }

  trackLessonCompletion(
    courseId: string,
    lessonId: string,
    lessonTitle: string
  ): void {
    this.track({
      event: "lesson_completion",
      properties: {
        course_id: courseId,
        lesson_id: lessonId,
        lesson_title: lessonTitle,
      },
    });
  }
}

// Global analytics instance
export const analytics = new AnalyticsTracker();

// React hook for analytics
export function useAnalytics() {
  return analytics;
}

// Server-side analytics tracking
export async function trackServerEvent(event: AnalyticsEvent): Promise<void> {
  try {
    // Send to your analytics service
    console.log("Server Analytics Event:", event);

    // Example: Send to external analytics service
    if (process.env.ANALYTICS_WEBHOOK_URL) {
      await fetch(process.env.ANALYTICS_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      });
    }
  } catch (error) {
    console.error("Server analytics tracking failed:", error);
  }
}

