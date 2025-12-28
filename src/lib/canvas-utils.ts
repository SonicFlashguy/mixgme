/**
 * Canvas Optimization Utilities for Ultra-Smooth Rendering
 * Dirty rectangles, layer management, and performance optimizations
 */

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CanvasLayer {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  isDirty: boolean;
  zIndex: number;
  name: string;
}

/**
 * Dirty Rectangle Manager
 * Only redraws regions that have changed
 */
export class DirtyRectManager {
  private dirtyRects: Rectangle[] = [];
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
    this.canvas = canvas;
    this.context = context;
  }

  /**
   * Mark a region as dirty (needs redraw)
   */
  markDirty(rect: Rectangle): void {
    // Expand rect slightly to avoid edge artifacts
    const expandedRect = {
      x: Math.max(0, rect.x - 2),
      y: Math.max(0, rect.y - 2),
      width: Math.min(this.canvas.width - rect.x + 2, rect.width + 4),
      height: Math.min(this.canvas.height - rect.y + 2, rect.height + 4)
    };

    this.dirtyRects.push(expandedRect);
  }

  /**
   * Get consolidated dirty rectangles (merged overlapping areas)
   */
  getDirtyRects(): Rectangle[] {
    if (this.dirtyRects.length === 0) return [];
    
    // Simple merge algorithm - can be optimized further
    const merged: Rectangle[] = [];
    
    for (const rect of this.dirtyRects) {
      let wasMerged = false;
      
      for (let i = 0; i < merged.length; i++) {
        if (this.rectsOverlap(rect, merged[i])) {
          merged[i] = this.mergeRects(rect, merged[i]);
          wasMerged = true;
          break;
        }
      }
      
      if (!wasMerged) {
        merged.push(rect);
      }
    }
    
    return merged;
  }

  /**
   * Clear dirty rectangles and prepare for next frame
   */
  clearDirtyRects(): void {
    const rects = this.getDirtyRects();
    
    // Clear each dirty rectangle
    for (const rect of rects) {
      this.context.clearRect(rect.x, rect.y, rect.width, rect.height);
    }
    
    this.dirtyRects = [];
  }

  /**
   * Check if two rectangles overlap
   */
  private rectsOverlap(a: Rectangle, b: Rectangle): boolean {
    return !(a.x + a.width < b.x || b.x + b.width < a.x || 
             a.y + a.height < b.y || b.y + b.height < a.y);
  }

  /**
   * Merge two rectangles into one
   */
  private mergeRects(a: Rectangle, b: Rectangle): Rectangle {
    const x = Math.min(a.x, b.x);
    const y = Math.min(a.y, b.y);
    const right = Math.max(a.x + a.width, b.x + b.width);
    const bottom = Math.max(a.y + a.height, b.y + b.height);
    
    return {
      x,
      y,
      width: right - x,
      height: bottom - y
    };
  }
}

/**
 * Multi-Layer Canvas Manager
 * Separates static and dynamic content for optimal rendering
 */
export class LayerManager {
  private layers: Map<string, CanvasLayer> = new Map();
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  /**
   * Create a new canvas layer
   */
  createLayer(name: string, zIndex = 0): CanvasLayer {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    
    // Set up canvas for high-DPI displays
    const rect = this.container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.zIndex = zIndex.toString();
    
    context.scale(dpr, dpr);
    
    // Enable hardware acceleration
    canvas.style.willChange = 'transform';
    canvas.style.transform = 'translateZ(0)';
    
    const layer: CanvasLayer = {
      canvas,
      context,
      isDirty: true,
      zIndex,
      name
    };
    
    this.layers.set(name, layer);
    this.container.appendChild(canvas);
    
    return layer;
  }

  /**
   * Get a layer by name
   */
  getLayer(name: string): CanvasLayer | undefined {
    return this.layers.get(name);
  }

  /**
   * Mark a layer as dirty
   */
  markLayerDirty(name: string): void {
    const layer = this.layers.get(name);
    if (layer) {
      layer.isDirty = true;
    }
  }

  /**
   * Get all dirty layers
   */
  getDirtyLayers(): CanvasLayer[] {
    return Array.from(this.layers.values()).filter(layer => layer.isDirty);
  }

  /**
   * Clear a layer's dirty flag
   */
  clearLayerDirty(name: string): void {
    const layer = this.layers.get(name);
    if (layer) {
      layer.isDirty = false;
    }
  }

  /**
   * Resize all layers
   */
  resizeLayers(width: number, height: number): void {
    const dpr = window.devicePixelRatio || 1;
    
    for (const layer of this.layers.values()) {
      layer.canvas.width = width * dpr;
      layer.canvas.height = height * dpr;
      layer.canvas.style.width = `${width}px`;
      layer.canvas.style.height = `${height}px`;
      layer.context.scale(dpr, dpr);
      layer.isDirty = true;
    }
  }

  /**
   * Clean up all layers
   */
  destroy(): void {
    for (const layer of this.layers.values()) {
      this.container.removeChild(layer.canvas);
    }
    this.layers.clear();
  }
}

/**
 * Canvas rendering optimizations
 */
export class CanvasOptimizer {
  private context: CanvasRenderingContext2D;

  constructor(context: CanvasRenderingContext2D) {
    this.context = context;
    this.setupOptimizations();
  }

  /**
   * Set up canvas optimizations
   */
  private setupOptimizations(): void {
    // Enable image smoothing for better visual quality
    this.context.imageSmoothingEnabled = true;
    this.context.imageSmoothingQuality = 'high';
    
    // Optimize text rendering
    this.context.textBaseline = 'middle';
    this.context.textAlign = 'center';
  }

  /**
   * Optimized line drawing with subpixel precision
   */
  drawLine(x1: number, y1: number, x2: number, y2: number, color: string, width = 1): void {
    this.context.save();
    this.context.strokeStyle = color;
    this.context.lineWidth = width;
    this.context.lineCap = 'round';
    this.context.lineJoin = 'round';
    
    this.context.beginPath();
    this.context.moveTo(x1, y1);
    this.context.lineTo(x2, y2);
    this.context.stroke();
    
    this.context.restore();
  }

  /**
   * Optimized rectangle drawing
   */
  drawRect(x: number, y: number, width: number, height: number, fillColor?: string, strokeColor?: string): void {
    this.context.save();
    
    if (fillColor) {
      this.context.fillStyle = fillColor;
      this.context.fillRect(x, y, width, height);
    }
    
    if (strokeColor) {
      this.context.strokeStyle = strokeColor;
      this.context.strokeRect(x, y, width, height);
    }
    
    this.context.restore();
  }

  /**
   * Optimized text drawing with caching
   */
  drawText(text: string, x: number, y: number, font: string, color: string): void {
    this.context.save();
    this.context.font = font;
    this.context.fillStyle = color;
    this.context.fillText(text, x, y);
    this.context.restore();
  }

  /**
   * Batch drawing operations for better performance
   */
  batchDraw(operations: (() => void)[]): void {
    this.context.save();
    
    for (const operation of operations) {
      operation();
    }
    
    this.context.restore();
  }
}

/**
 * Performance-optimized path drawing for candlesticks
 */
export function drawOptimizedCandlestick(
  context: CanvasRenderingContext2D,
  x: number,
  open: number,
  high: number,
  low: number,
  close: number,
  candleWidth: number,
  isGreen: boolean
): void {
  const halfWidth = candleWidth / 2;
  const bodyTop = Math.min(open, close);
  const bodyBottom = Math.max(open, close);
  const bodyHeight = Math.abs(close - open);
  
  context.save();
  
  // Draw wick (single path for efficiency)
  context.strokeStyle = isGreen ? '#10b981' : '#ef4444';
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(x, high);
  context.lineTo(x, low);
  context.stroke();
  
  // Draw body
  if (bodyHeight > 0.5) { // Only draw body if visible
    context.fillStyle = isGreen ? '#10b981' : '#ef4444';
    context.fillRect(x - halfWidth, bodyTop, candleWidth, bodyHeight);
  } else {
    // For very small bodies, draw a line
    context.strokeStyle = isGreen ? '#10b981' : '#ef4444';
    context.lineWidth = candleWidth;
    context.beginPath();
    context.moveTo(x, open);
    context.lineTo(x, close);
    context.stroke();
  }
  
  context.restore();
}
