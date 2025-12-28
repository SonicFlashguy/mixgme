/**
 * Performance Monitoring and Optimization Utilities
 * FPS tracking, memory management, and performance profiling
 */

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage: number;
  renderTime: number;
  updateTime: number;
}

/**
 * FPS Monitor for tracking rendering performance
 */
export class FPSMonitor {
  private frames: number[] = [];
  private lastTime: number = performance.now();
  private frameCount = 0;
  private currentFPS = 60;

  /**
   * Update FPS calculation
   */
  update(): number {
    const now = performance.now();
    const deltaTime = now - this.lastTime;
    
    this.frames.push(deltaTime);
    this.frameCount++;
    
    // Keep only last 60 frame times for rolling average
    if (this.frames.length > 60) {
      this.frames.shift();
    }
    
    // Calculate FPS every 10 frames
    if (this.frameCount % 10 === 0) {
      const averageFrameTime = this.frames.reduce((a, b) => a + b, 0) / this.frames.length;
      this.currentFPS = Math.round(1000 / averageFrameTime);
    }
    
    this.lastTime = now;
    return this.currentFPS;
  }

  /**
   * Get current FPS
   */
  getFPS(): number {
    return this.currentFPS;
  }

  /**
   * Get average frame time in milliseconds
   */
  getAverageFrameTime(): number {
    if (this.frames.length === 0) return 16.67; // 60fps default
    return this.frames.reduce((a, b) => a + b, 0) / this.frames.length;
  }

  /**
   * Check if performance is below threshold
   */
  isPerformanceLow(threshold = 30): boolean {
    return this.currentFPS < threshold;
  }
}

/**
 * Performance Profiler for measuring specific operations
 */
export class PerformanceProfiler {
  private marks: Map<string, number> = new Map();
  private measurements: Map<string, number[]> = new Map();

  /**
   * Start measuring an operation
   */
  start(name: string): void {
    this.marks.set(name, performance.now());
  }

  /**
   * End measuring an operation and record the duration
   */
  end(name: string): number {
    const startTime = this.marks.get(name);
    if (!startTime) {
      console.warn(`Performance mark '${name}' not found`);
      return 0;
    }

    const duration = performance.now() - startTime;
    
    // Store measurement
    if (!this.measurements.has(name)) {
      this.measurements.set(name, []);
    }
    
    const measurements = this.measurements.get(name)!;
    measurements.push(duration);
    
    // Keep only last 100 measurements
    if (measurements.length > 100) {
      measurements.shift();
    }
    
    this.marks.delete(name);
    return duration;
  }

  /**
   * Get average duration for an operation
   */
  getAverageDuration(name: string): number {
    const measurements = this.measurements.get(name);
    if (!measurements || measurements.length === 0) return 0;
    
    return measurements.reduce((a, b) => a + b, 0) / measurements.length;
  }

  /**
   * Get all performance metrics
   */
  getMetrics(): Record<string, { average: number; recent: number; count: number }> {
    const metrics: Record<string, { average: number; recent: number; count: number }> = {};
    
    for (const [name, measurements] of this.measurements) {
      metrics[name] = {
        average: this.getAverageDuration(name),
        recent: measurements[measurements.length - 1] || 0,
        count: measurements.length
      };
    }
    
    return metrics;
  }
}

/**
 * Memory Monitor for tracking memory usage
 */
export class MemoryMonitor {
  /**
   * Get current memory usage (if available)
   */
  getMemoryUsage(): number {
    // @ts-ignore - performance.memory is not in all browsers
    if (performance.memory) {
      // @ts-ignore
      return performance.memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    return 0;
  }

  /**
   * Check if memory usage is high
   */
  isMemoryHigh(thresholdMB = 100): boolean {
    const usage = this.getMemoryUsage();
    return usage > 0 && usage > thresholdMB;
  }
}

/**
 * Adaptive Quality Manager
 * Automatically adjusts rendering quality based on performance
 */
export class AdaptiveQualityManager {
  private fpsMonitor: FPSMonitor;
  private qualityLevel = 1.0; // 0.5 to 1.0
  private minFPS: number;
  private targetFPS: number;

  constructor(minFPS = 30, targetFPS = 60) {
    this.fpsMonitor = new FPSMonitor();
    this.minFPS = minFPS;
    this.targetFPS = targetFPS;
  }

  /**
   * Update quality based on current performance
   */
  update(): number {
    const currentFPS = this.fpsMonitor.update();
    
    // Adjust quality based on FPS
    if (currentFPS < this.minFPS) {
      // Performance is poor, reduce quality
      this.qualityLevel = Math.max(0.5, this.qualityLevel - 0.1);
    } else if (currentFPS > this.targetFPS && this.qualityLevel < 1.0) {
      // Performance is good, can increase quality
      this.qualityLevel = Math.min(1.0, this.qualityLevel + 0.05);
    }
    
    return this.qualityLevel;
  }

  /**
   * Get current quality level
   */
  getQualityLevel(): number {
    return this.qualityLevel;
  }

  /**
   * Get current FPS
   */
  getCurrentFPS(): number {
    return this.fpsMonitor.getFPS();
  }

  /**
   * Get rendering recommendations based on quality level
   */
  getRenderingConfig(): {
    enableSubpixelRendering: boolean;
    enableLayerSeparation: boolean;
    enableDirtyRects: boolean;
    candleDetailLevel: number;
    animationQuality: number;
  } {
    return {
      enableSubpixelRendering: this.qualityLevel > 0.8,
      enableLayerSeparation: this.qualityLevel > 0.6,
      enableDirtyRects: this.qualityLevel > 0.7,
      candleDetailLevel: this.qualityLevel,
      animationQuality: this.qualityLevel
    };
  }
}

/**
 * Animation Frame Manager
 * Optimized requestAnimationFrame handling
 */
export class AnimationFrameManager {
  private callbacks: Set<(deltaTime: number) => void> = new Set();
  private isRunning = false;
  private lastTime = 0;
  private rafId = 0;

  /**
   * Add a callback to be executed on each frame
   */
  addCallback(callback: (deltaTime: number) => void): void {
    this.callbacks.add(callback);
    
    if (!this.isRunning) {
      this.start();
    }
  }

  /**
   * Remove a callback
   */
  removeCallback(callback: (deltaTime: number) => void): void {
    this.callbacks.delete(callback);
    
    if (this.callbacks.size === 0) {
      this.stop();
    }
  }

  /**
   * Start the animation loop
   */
  private start(): void {
    this.isRunning = true;
    this.lastTime = performance.now();
    this.tick();
  }

  /**
   * Stop the animation loop
   */
  private stop(): void {
    this.isRunning = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
  }

  /**
   * Animation tick
   */
  private tick = (): void => {
    if (!this.isRunning) return;
    
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;
    
    // Execute all callbacks
    for (const callback of this.callbacks) {
      try {
        callback(deltaTime);
      } catch (error) {
        console.error('Error in animation callback:', error);
      }
    }
    
    this.rafId = requestAnimationFrame(this.tick);
  };

  /**
   * Force stop all animations
   */
  destroy(): void {
    this.callbacks.clear();
    this.stop();
  }
}

/**
 * Global performance utilities
 */
export const performanceUtils = {
  /**
   * Debounce function for performance optimization
   */
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  },

  /**
   * Throttle function for performance optimization
   */
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  /**
   * Create a performance-optimized interval
   */
  createOptimizedInterval(callback: () => void, ms: number): () => void {
    let rafId: number;
    let lastTime = 0;
    
    const tick = (currentTime: number) => {
      if (currentTime - lastTime >= ms) {
        callback();
        lastTime = currentTime;
      }
      rafId = requestAnimationFrame(tick);
    };
    
    rafId = requestAnimationFrame(tick);
    
    return () => cancelAnimationFrame(rafId);
  }
};
