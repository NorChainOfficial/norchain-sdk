/**
 * API Batch Utility
 * Batches multiple API requests to reduce network overhead
 */

interface BatchRequest {
  url: string;
  options?: RequestInit;
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

class ApiBatcher {
  private batchQueue: Map<string, BatchRequest[]> = new Map();
  private batchTimeout: number = 50; // 50ms batching window
  private timers: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Add request to batch queue
   */
  async batch<T>(
    url: string,
    options?: RequestInit,
    batchKey?: string,
  ): Promise<T> {
    const key = batchKey || url;

    return new Promise<T>((resolve, reject) => {
      if (!this.batchQueue.has(key)) {
        this.batchQueue.set(key, []);
      }

      this.batchQueue.get(key)!.push({
        url,
        options,
        resolve,
        reject,
      });

      // Clear existing timer
      const existingTimer = this.timers.get(key);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      // Set new timer
      const timer = setTimeout(() => {
        this.processBatch(key);
      }, this.batchTimeout);

      this.timers.set(key, timer);
    });
  }

  /**
   * Process batched requests
   */
  private async processBatch(key: string): Promise<void> {
    const requests = this.batchQueue.get(key);
    if (!requests || requests.length === 0) return;

    this.batchQueue.delete(key);
    this.timers.delete(key);

    // For now, process requests individually
    // In the future, we can implement actual batching if the API supports it
    requests.forEach(async (request) => {
      try {
        const response = await fetch(request.url, request.options);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        request.resolve(data);
      } catch (error) {
        request.reject(error);
      }
    });
  }

  /**
   * Clear all pending batches
   */
  clear(): void {
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
    this.batchQueue.clear();
  }
}

export const apiBatcher = new ApiBatcher();

