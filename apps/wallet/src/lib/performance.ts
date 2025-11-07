/**
 * Performance utilities
 * For monitoring and optimizing performance
 */

export interface PerformanceMetrics {
  pageLoadTime: number;
  renderTime: number;
  interactionTime: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    pageLoadTime: 0,
    renderTime: 0,
    interactionTime: 0,
  };

  /**
   * Measure page load time
   */
  measurePageLoad(): void {
    if (typeof window === 'undefined') return;

    if (window.performance && window.performance.timing) {
      const timing = window.performance.timing;
      this.metrics.pageLoadTime =
        timing.loadEventEnd - timing.navigationStart;
    }
  }

  /**
   * Measure render time
   */
  measureRender(componentName: string): () => void {
    if (typeof window === 'undefined') {
      return () => {};
    }

    const start = performance.now();

    return () => {
      const end = performance.now();
      const renderTime = end - start;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Performance] ${componentName} rendered in ${renderTime.toFixed(2)}ms`);
      }
    };
  }

  /**
   * Get current metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Reset metrics
   */
  reset(): void {
    this.metrics = {
      pageLoadTime: 0,
      renderTime: 0,
      interactionTime: 0,
    };
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Auto-measure page load
if (typeof window !== 'undefined') {
  if (document.readyState === 'complete') {
    performanceMonitor.measurePageLoad();
  } else {
    window.addEventListener('load', () => {
      performanceMonitor.measurePageLoad();
    });
  }
}

