/**
 * Performance Logger Utility
 * 
 * Use this to measure and log performance metrics in development
 * Helps identify performance bottlenecks
 */

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, unknown>;
}

class PerformanceLogger {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private enabled: boolean;

  constructor() {
    if (typeof window !== 'undefined' && window.localStorage) {
      this.enabled =
        process.env.NODE_ENV === 'development' ||
        localStorage.getItem('PERF_LOGGING_ENABLED') === 'true';
    } else {
      this.enabled = false;
    }
  }

  start(name: string, metadata?: Record<string, unknown>): void {
    if (!this.enabled) return;

    const startTime = performance.now();
    this.metrics.set(name, {
      name,
      startTime,
      metadata,
    });

    if (typeof window !== 'undefined') {
      console.log(`⏱️ [PERF] Started: ${name}`, metadata || '');
    }
  }

  end(name: string, additionalMetadata?: Record<string, unknown>): number | null {
    if (!this.enabled) return null;

    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`[PERF] No metric found for: ${name}`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - metric.startTime;

    metric.endTime = endTime;
    metric.duration = duration;

    const logData = {
      name,
      duration: `${duration.toFixed(2)}ms`,
      ...metric.metadata,
      ...additionalMetadata,
    };

    if (typeof window !== 'undefined') {
      const emoji = duration > 1000 ? '🐌' : duration > 500 ? '⚠️' : '✅';
      console.log(`${emoji} [PERF] Completed: ${name}`, logData);
    }

    return duration;
  }

  measure<T>(
    name: string,
    fn: () => T,
    metadata?: Record<string, unknown>
  ): T {
    this.start(name, metadata);
    try {
      const result = fn();
      if (result instanceof Promise) {
        return result.then(
          (value) => {
            this.end(name);
            return value;
          },
          (error) => {
            this.end(name, { error: error.message });
            throw error;
          }
        ) as T;
      }
      this.end(name);
      return result;
    } catch (error) {
      this.end(name, {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async measureAsync<T>(
    name: string,
    fn: () => Promise<T>,
    metadata?: Record<string, unknown>
  ): Promise<T> {
    this.start(name, metadata);
    try {
      const result = await fn();
      this.end(name);
      return result;
    } catch (error) {
      this.end(name, {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  getMetric(name: string): PerformanceMetric | undefined {
    return this.metrics.get(name);
  }

  getAllMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values());
  }

  clear(): void {
    this.metrics.clear();
  }

  enable(): void {
    this.enabled = true;
    if (typeof window !== 'undefined') {
      localStorage.setItem('PERF_LOGGING_ENABLED', 'true');
    }
  }

  disable(): void {
    this.enabled = false;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('PERF_LOGGING_ENABLED');
    }
  }

    isEnabled(): boolean {
    return this.enabled;
  }

  logSummary(): void {
    if (!this.enabled) return;

    const completed = this.getAllMetrics().filter((m) => m.duration !== undefined);
    
    if (completed.length === 0) {
      console.log('[PERF] No completed metrics to summarize');
      return;
    }

    console.group('📊 Performance Summary');
    completed.forEach((metric) => {
      const emoji = (metric.duration || 0) > 1000 ? '🐌' : (metric.duration || 0) > 500 ? '⚠️' : '✅';
      console.log(
        `${emoji} ${metric.name}: ${metric.duration?.toFixed(2)}ms`,
        metric.metadata || ''
      );
    });
    console.groupEnd();
  }
}

export const perfLogger = new PerformanceLogger();

// Expose to window for browser console access
if (typeof window !== 'undefined') {
  (window as unknown as { perfLogger: PerformanceLogger }).perfLogger =
    perfLogger;
}

// Enable in browser console: perfLogger.enable()
// Disable: perfLogger.disable()
// View summary: perfLogger.logSummary()

