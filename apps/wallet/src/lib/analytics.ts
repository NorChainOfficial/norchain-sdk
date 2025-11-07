/**
 * Analytics utilities
 * For tracking user events and errors (optional)
 */

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
}

class Analytics {
  private enabled: boolean = false;

  constructor() {
    // Only enable in production if analytics is configured
    this.enabled = process.env.NODE_ENV === 'production' && 
                   typeof window !== 'undefined' && 
                   !!process.env.NEXT_PUBLIC_ANALYTICS_ID;
  }

  /**
   * Track an event
   */
  track(event: AnalyticsEvent): void {
    if (!this.enabled) return;

    try {
      // TODO: Integrate with analytics service (e.g., Google Analytics, Mixpanel)
      // Example:
      // gtag('event', event.name, event.properties);
      console.log('Analytics event:', event);
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
    }
  }

  /**
   * Track page view
   */
  pageView(path: string): void {
    this.track({
      name: 'page_view',
      properties: { path },
    });
  }

  /**
   * Track wallet creation
   */
  walletCreated(): void {
    this.track({
      name: 'wallet_created',
    });
  }

  /**
   * Track transaction sent
   */
  transactionSent(chain: string, amount: string): void {
    this.track({
      name: 'transaction_sent',
      properties: { chain, amount },
    });
  }

  /**
   * Track error
   */
  error(error: Error, context?: string): void {
    this.track({
      name: 'error',
      properties: {
        message: error.message,
        stack: error.stack,
        context,
      },
    });
  }
}

export const analytics = new Analytics();

