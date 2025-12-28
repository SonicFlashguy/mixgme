/**
 * Enhanced Type Definitions for Ultra-Smooth Chart Rendering
 */

import type { EasingFunction } from '../lib/easing';

export interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface SmoothCandleData extends CandleData {
  // Smooth interpolation targets
  targetOpen: number;
  targetHigh: number;
  targetLow: number;
  targetClose: number;
  
  // Animation state
  isAnimating: boolean;
  animationProgress: number;
  animationDuration: number;
  animationStartTime: number;
  easingFunction: EasingFunction;
}

export interface ChartDimensions {
  width: number;
  height: number;
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  candleWidth: number;
  candleSpacing: number;
}

export interface PriceRange {
  min: number;
  max: number;
  range: number;
}

export interface AnimationConfig {
  enabled: boolean;
  duration: number;
  easingFunction: EasingFunction;
  interpolationSpeed: number;
  adaptiveSmoothing: boolean;
  subpixelRendering: boolean;
}

export interface RenderConfig {
  // Layer separation
  enableLayers?: boolean;
  staticLayerName?: string;
  dynamicLayerName?: string;
  
  // Dirty rectangle optimization
  enableDirtyRects?: boolean;
  
  // Performance settings
  maxFPS?: number;
  adaptiveQuality?: boolean;
  qualityThreshold?: number;
  
  // Ultra-smooth rendering features
  enableSubpixelRendering?: boolean;
  lineSmoothing?: boolean;
  antiAliasing?: boolean;
  qualityScale?: number;
  
  // Visual settings
  enableAntialiasing?: boolean;
  lineWidth?: number;
  colors?: {
    bullish: string;
    bearish: string;
    grid: string;
    text: string;
    background: string;
  };
}

export interface ChartState {
  // Data
  candleData: SmoothCandleData[];
  currentPrice: number;
  targetPrice: number;
  
  // View state
  priceRange: PriceRange;
  timeRange: {
    start: number;
    end: number;
  };
  
  // Animation state
  isAnimating: boolean;
  lastUpdateTime: number;
  frameCount: number;
  
  // Performance metrics
  fps: number;
  renderTime: number;
  updateTime: number;
}

export interface SmoothInterpolationState {
  // Current interpolation values
  currentPrice: number;
  targetPrice: number;
  lastPrice: number;
  
  // Animation timing
  startTime: number;
  duration: number;
  progress: number;
  
  // Easing configuration
  easingFunction: EasingFunction;
  adaptiveSpeed: boolean;
  baseSpeed: number;
  
  // Movement characteristics
  distance: number;
  velocity: number;
  acceleration: number;
}

export interface LayerRenderState {
  // Layer dirty flags
  staticLayerDirty: boolean;
  dynamicLayerDirty: boolean;
  overlayLayerDirty: boolean;
  
  // Last render timestamps
  staticLastRender: number;
  dynamicLastRender: number;
  overlayLastRender: number;
  
  // Render counts for debugging
  staticRenderCount: number;
  dynamicRenderCount: number;
  overlayRenderCount: number;
}

export interface PerformanceState {
  // FPS tracking
  currentFPS: number;
  targetFPS: number;
  frameTime: number;
  
  // Quality level (0.5 to 1.0)
  qualityLevel: number;
  adaptiveQualityEnabled: boolean;
  
  // Memory usage
  memoryUsage: number;
  memoryThreshold: number;
  
  // Optimization flags
  subpixelRenderingEnabled: boolean;
  layerSeparationEnabled: boolean;
  dirtyRectsEnabled: boolean;
}

export interface ChartEvent {
  type: 'priceUpdate' | 'candleUpdate' | 'rangeChange' | 'qualityChange';
  timestamp: number;
  data: any;
}

export interface SmoothAnimationOptions {
  // Animation timing
  duration?: number;
  delay?: number;
  
  // Easing configuration
  easing?: EasingFunction | 'auto';
  
  // Adaptive settings
  adaptToDistance?: boolean;
  adaptToVelocity?: boolean;
  
  // Performance settings
  maxDuration?: number;
  minDuration?: number;
  qualityScaling?: boolean;
}

export interface RenderQualityConfig {
  // Level 1.0 = highest quality, 0.5 = lowest acceptable quality
  level: number;
  
  // Feature toggles based on quality
  subpixelRendering: boolean;
  layerSeparation: boolean;
  dirtyRectOptimization: boolean;
  antialiasing: boolean;
  smoothInterpolation: boolean;
  
  // Quality-dependent settings
  candleDetailLevel: number; // 0.5 to 1.0
  animationSmoothness: number; // 0.5 to 1.0
  renderPrecision: number; // 0.5 to 1.0
}

export interface CandlestickRenderProps {
  x: number;
  open: number;
  high: number;
  low: number;
  close: number;
  width: number;
  isGreen: boolean;
  opacity?: number;
  quality?: number;
}

export interface GridRenderProps {
  xLines: number[];
  yLines: number[];
  color: string;
  opacity: number;
  lineWidth: number;
}

export interface TextRenderProps {
  text: string;
  x: number;
  y: number;
  font: string;
  color: string;
  align?: CanvasTextAlign;
  baseline?: CanvasTextBaseline;
}

export type RenderOperation = 
  | { type: 'candlestick'; props: CandlestickRenderProps }
  | { type: 'grid'; props: GridRenderProps }
  | { type: 'text'; props: TextRenderProps }
  | { type: 'line'; props: { x1: number; y1: number; x2: number; y2: number; color: string; width: number } }
  | { type: 'rect'; props: { x: number; y: number; width: number; height: number; fill?: string; stroke?: string } };

export interface BatchRenderOptions {
  operations: RenderOperation[];
  layer?: string;
  clearFirst?: boolean;
  applyClipping?: boolean;
  clipRect?: { x: number; y: number; width: number; height: number };
}
