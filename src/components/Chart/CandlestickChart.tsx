import type React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useBetting } from '../../context/BettingContext';

// Import ultra-smooth rendering utilities
import { 
  easeOutCubic, 
  easeOutExpo, 
  easeInOutCubic, 
  selectEasing, 
  subpixelInterpolate,
  type EasingFunction 
} from '../../lib/easing';
import { 
  DirtyRectManager, 
  CanvasOptimizer, 
  drawOptimizedCandlestick 
} from '../../lib/canvas-utils';
import { 
  AdaptiveQualityManager, 
  PerformanceProfiler, 
  AnimationFrameManager
} from '../../lib/performance';
import type { 
  RenderConfig, 
  PerformanceState 
} from '../../types/chart';

import type { CandleData } from '../../types/chart';

interface CrashGameState {
  isActive: boolean;
  isPreparing: boolean;
  multiplier: number;
  hasCrashed: boolean;
  crashPoint: number;
  timeElapsed: number;
  countdown: number;
}

// Volume generation utility
const generateVolume = (baseVolume = 1000000, volatility = 0.3): number => {
  // Generate realistic volume data with some randomness
  const randomFactor = 0.5 + Math.random(); // Random factor between 0.5 and 1.5
  const volatilityFactor = 1 + (Math.random() - 0.5) * volatility; // ±15% volatility by default
  return Math.floor(baseVolume * randomFactor * volatilityFactor);
};

// Candle aggregation utilities
const aggregateCandles = (candles: CandleData[]): CandleData => {
  if (candles.length === 0) {
    throw new Error("Cannot aggregate empty candle array");
  }
  
  if (candles.length === 1) {
    return candles[0];
  }
  
  const sortedByTime = [...candles].sort((a, b) => a.time - b.time);
  
  const open = sortedByTime[0].open;
  const close = sortedByTime[sortedByTime.length - 1].close;
  
  // Calculate body range for wick limiting
  const bodyHigh = Math.max(open, close);
  const bodyLow = Math.min(open, close);
  const bodyRange = bodyHigh - bodyLow;
  
  // Get all highs and lows
  const allHighs = sortedByTime.map(c => c.high);
  const allLows = sortedByTime.map(c => c.low);
  const maxHigh = Math.max(...allHighs);
  const minLow = Math.min(...allLows);
   // Ultra-conservative wick limiting - much stricter limits
  const priceLevel = (open + close) / 2; // Average price level
  
  // Use very small wick extensions - prioritize body range limit
  let maxWickExtension;
  if (bodyRange > 0) {
    // For non-doji candles: max 20% of body range, capped at 0.5% of price
    maxWickExtension = Math.min(bodyRange * 0.20, priceLevel * 0.005);
  } else {
    // For doji candles: only allow tiny wicks (0.1% of price)
    maxWickExtension = priceLevel * 0.001;
  }

  // Apply ultra-strict wick limits
  const limitedHigh = Math.min(maxHigh, bodyHigh + maxWickExtension);
  const limitedLow = Math.max(minLow, bodyLow - maxWickExtension);

  // No override - stick to the calculated limits strictly
  const finalHigh = limitedHigh;
  const finalLow = limitedLow;
  
  return {
    open,
    close,
    high: finalHigh,
    low: finalLow,
    time: sortedByTime[0].time, // Timestamp of first candle
    volume: sortedByTime.reduce((sum, candle) => sum + (candle.volume || 0), 0) // Sum of all volumes
  };
};

const performCandleAggregation = (chartData: CandleData[]): CandleData[] => {
  // Only aggregate if we have 30 or more candles
  if (chartData.length < 30) {
    return chartData;
  }
  
  console.log(`🔄 Performing candle aggregation - Current count: ${chartData.length}`);
  
  // Take first 3 candles for aggregation
  const candlesToAggregate = chartData.slice(0, 3);
  const remainingCandles = chartData.slice(3);
  
  console.log('📊 Aggregating candles:', {
    firstCandle: candlesToAggregate[0],
    secondCandle: candlesToAggregate[1], 
    thirdCandle: candlesToAggregate[2]
  });
  
  // Create aggregated candle preserving average price action
  const aggregatedCandle = aggregateCandles(candlesToAggregate);
  
  console.log('✅ Aggregated candle created:', aggregatedCandle);
  console.log(`📉 Chart count reduced from ${chartData.length} to ${[aggregatedCandle, ...remainingCandles].length}`);
  
  // Return new array with aggregated candle at the beginning
  return [aggregatedCandle, ...remainingCandles];
};

const CandlestickChart: React.FC = () => {
  // Get trade actions from betting context
  const { tradeActions, playerBet, getCurrentPnL, getCumulativePnL, multiplier, setGameState: setBettingGameState } = useBetting();
  
  // Temporary test mode for faster candle aggregation testing
  const [testMode, setTestMode] = useState<boolean>(false);
  
  const [gameState, setGameState] = useState<CrashGameState>({
    isActive: false,
    isPreparing: false,
    multiplier: 1.00,
    hasCrashed: false,
    crashPoint: 0,
    timeElapsed: 0,
    countdown: 0
  });

  const [chartData, setChartData] = useState<CandleData[]>([]);
  const [hasError, setHasError] = useState<boolean>(false);
  
  // Smooth price interpolation state
  const [currentPrice, setCurrentPrice] = useState<number>(1.0);
  const [targetPrice, setTargetPrice] = useState<number>(1.0);
  
  // References for intervals and animation
  const gameIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const candleIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const smoothIntervalRef = useRef<NodeJS.Timeout | number | null>(null);
  const lastUpdateTimeRef = useRef<number>(Date.now());
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentPriceRef = useRef<number>(1.0);
  const latestCandleValueRef = useRef<number>(1.0); // Track the latest actual candle value

  // Ultra-smooth rendering state and managers
  const dirtyRectManagerRef = useRef<DirtyRectManager | null>(null);
  const canvasOptimizerRef = useRef<CanvasOptimizer | null>(null);
  const qualityManagerRef = useRef<AdaptiveQualityManager | null>(null);
  const profilerRef = useRef<PerformanceProfiler | null>(null);
  const animationManagerRef = useRef<AnimationFrameManager | null>(null);
  
  // Enhanced smooth interpolation state
  const [smoothState, setSmoothState] = useState({
    isAnimating: false,
    easingFunction: easeOutCubic as EasingFunction,
    animationStartTime: 0,
    animationDuration: 150,
    lastFrameTime: 0,
    frameCount: 0
  });
  
  // Performance and quality state
  const [performanceState, setPerformanceState] = useState<PerformanceState>({
    currentFPS: 60,
    targetFPS: 60,
    frameTime: 16.67,
    qualityLevel: 1.0,
    adaptiveQualityEnabled: true,
    memoryUsage: 0,
    memoryThreshold: 100,
    subpixelRenderingEnabled: true,
    layerSeparationEnabled: true,
    dirtyRectsEnabled: true
  });

  // Error boundary-like functionality
  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('Chart Error:', error);
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // Initialize ultra-smooth rendering managers
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize managers
    try {
      dirtyRectManagerRef.current = new DirtyRectManager(canvas, ctx);
      canvasOptimizerRef.current = new CanvasOptimizer(ctx);
      qualityManagerRef.current = new AdaptiveQualityManager();
      profilerRef.current = new PerformanceProfiler();
      animationManagerRef.current = new AnimationFrameManager();

      // Performance monitoring setup
      const updatePerformance = () => {
        if (qualityManagerRef.current) {
          const fps = qualityManagerRef.current.getCurrentFPS();
          const frameTime = 1000 / fps; // Calculate frame time from FPS
          const quality = qualityManagerRef.current.getQualityLevel();
          
          setPerformanceState(prev => ({
            ...prev,
            currentFPS: fps,
            frameTime,
            qualityLevel: quality,
            memoryUsage: (performance as any).memory ? (performance as any).memory.usedJSHeapSize / 1024 / 1024 : 0
          }));
        }
      };

      // Update performance metrics every second
      const performanceInterval = setInterval(updatePerformance, 1000);

      return () => {
        clearInterval(performanceInterval);
        // Cleanup managers
        dirtyRectManagerRef.current = null;
        canvasOptimizerRef.current = null;
        qualityManagerRef.current = null;
        profilerRef.current = null;
        animationManagerRef.current = null;
      };
    } catch (error) {
      console.error('Failed to initialize ultra-smooth rendering managers:', error);
      setHasError(true);
    }
  }, []);

  // Helper function to sync both local and betting context game states
  const updateGameState = (newState: Partial<CrashGameState> | ((prev: CrashGameState) => CrashGameState)) => {
    let updatedState: CrashGameState;
    
    if (typeof newState === 'function') {
      setGameState(prev => {
        updatedState = newState(prev);
        // Sync with betting context
        const syncState = {
          isGameActive: updatedState.isActive,
          currentMultiplier: updatedState.multiplier,
          crashPoint: updatedState.crashPoint
        };
        console.log('🔄 Chart → Betting sync:', syncState);
        setBettingGameState(syncState);
        return updatedState;
      });
    } else {
      setGameState(prev => {
        updatedState = { ...prev, ...newState };
        // Sync with betting context
        const syncState = {
          isGameActive: updatedState.isActive,
          currentMultiplier: updatedState.multiplier,
          crashPoint: updatedState.crashPoint
        };
        console.log('🔄 Chart → Betting sync:', syncState);
        setBettingGameState(syncState);
        return updatedState;
      });
    }
  };

  // Generate crash point for the game with more realistic distribution
  const generateCrashPoint = (): number => {
    const random = Math.random();
    
    // 80% chance to crash below 1x (losses) - TEMPORARY for testing (Original: 0.3)
    if (random < 0.8) {
      const subOneRandom = Math.random();
      if (subOneRandom < 0.1) return 0.01 + Math.random() * 0.19; // 10% chance: 0.01x - 0.20x (big losses)
      if (subOneRandom < 0.3) return 0.20 + Math.random() * 0.30; // 20% chance: 0.20x - 0.50x (medium losses)
      return 0.50 + Math.random() * 0.49; // 70% chance: 0.50x - 0.99x (small losses)
    }
    
    // 20% chance to go above 1x (profits) - TEMPORARY for testing (Original: 70%)
    const aboveOneRandom = Math.random();
    if (aboveOneRandom < 0.4) return 1.01 + Math.random() * 0.99; // 40% chance: 1.01x - 2.00x
    if (aboveOneRandom < 0.7) return 2.00 + Math.random() * 3.00; // 30% chance: 2.00x - 5.00x
    if (aboveOneRandom < 0.9) return 5.00 + Math.random() * 5.00; // 20% chance: 5.00x - 10.00x
    return 10.00 + Math.random() * 15.00; // 10% chance: 10.00x - 25.00x (huge wins)
  };

  // Generate realistic price movement for candles with trend and volatility
  const generatePriceMovement = (currentPrice: number, volatility = 0.08): number => {
    // Create more violent market movement with bigger swings
    const trend = (Math.random() - 0.5) * 3; // -1.5 to 1.5 (increased range for more movement)
    const spike = Math.random() < 0.15 ? (Math.random() - 0.5) * 0.2 : 0; // 15% chance of big spike
    const noise = (Math.random() - 0.5) * volatility * 1.5; // Increased noise
    const momentum = trend * volatility * 0.8 + noise + spike; // Combine factors
    
    const newPrice = currentPrice + momentum;
    return Math.max(0.01, newPrice); // Minimum price of 0.01
  };

  // Ultra-smooth price interpolation system with advanced easing
  const startSmoothInterpolation = () => {
    // Clear any existing animation
    if (smoothIntervalRef.current) {
      if (typeof smoothIntervalRef.current === 'number') {
        cancelAnimationFrame(smoothIntervalRef.current);
      } else {
        clearInterval(smoothIntervalRef.current);
      }
    }

    // Start performance tracking
    if (profilerRef.current) {
      profilerRef.current.start('animation-frame');
    }

    // Set initial animation state
    setSmoothState(prev => ({
      ...prev,
      isAnimating: true,
      animationStartTime: performance.now(),
      lastFrameTime: performance.now(),
      frameCount: 0
    }));

    // Use AnimationFrameManager for optimized frame handling
    const animatePrice = (deltaTime: number) => {
      const now = performance.now();
      
      // End previous frame and start new one for performance tracking
      if (profilerRef.current) {
        profilerRef.current.end('animation-frame');
        profilerRef.current.start('animation-frame');
      }
      
      // Update smooth state with performance metrics
      setSmoothState(prev => {
        const newFrameCount = prev.frameCount + 1;
        
        // Calculate animation progress
        const elapsed = now - prev.animationStartTime;
        const progress = Math.min(elapsed / prev.animationDuration, 1);
        
        // Select optimal easing function based on movement characteristics
        const difference = Math.abs(targetPrice - currentPrice);
        const easingFn = selectEasing(difference, progress);
        
        return {
          ...prev,
          frameCount: newFrameCount,
          lastFrameTime: now,
          easingFunction: easingFn
        };
      });
      
      setCurrentPrice(prev => {
        const difference = targetPrice - prev;
        
        // Calculate animation progress for easing
        const elapsed = now - (smoothState.animationStartTime || now);
        const normalizedProgress = Math.min(elapsed / smoothState.animationDuration, 1);
        
        // Use subpixel interpolation with selected easing function
        const easedValue = subpixelInterpolate(
          prev,
          targetPrice,
          normalizedProgress,
          smoothState.easingFunction
        );
        
        // Adaptive quality scaling based on performance
        if (qualityManagerRef.current) {
          const quality = qualityManagerRef.current.getQualityLevel();
          
          // Scale animation precision based on quality
          const precision = quality * 0.0001; // Higher quality = more precision
          
          if (Math.abs(difference) < precision) {
            return targetPrice;
          }
        }
        
        // Performance-based threshold adjustment
        const threshold = performanceState.currentFPS > 30 ? 0.0001 : 0.001;
        if (Math.abs(difference) < threshold) {
          // Animation complete
          setSmoothState(prev => ({ ...prev, isAnimating: false }));
          return targetPrice;
        }
        
        currentPriceRef.current = easedValue;
        return easedValue;
      });
      
      lastUpdateTimeRef.current = now;
    };
    
    // Register with AnimationFrameManager for optimized performance
    if (animationManagerRef.current) {
      animationManagerRef.current.addCallback(animatePrice);
    } else {
      // Fallback to requestAnimationFrame if manager not available
      const fallbackAnimate = () => {
        const now = performance.now();
        const deltaTime = now - lastUpdateTimeRef.current;
        animatePrice(deltaTime);
        
        if (smoothState.isAnimating) {
          smoothIntervalRef.current = requestAnimationFrame(fallbackAnimate);
        }
      };
      smoothIntervalRef.current = requestAnimationFrame(fallbackAnimate);
    }
  };

  // Stop smooth interpolation with ultra-smooth rendering cleanup
  const stopSmoothInterpolation = () => {
    // End performance tracking
    if (profilerRef.current) {
      profilerRef.current.end('animation-frame');
    }

    // Update animation state
    setSmoothState(prev => ({ ...prev, isAnimating: false }));

    if (smoothIntervalRef.current) {
      // Check if it's a requestAnimationFrame ID (number) or setInterval ID (NodeJS.Timeout)
      if (typeof smoothIntervalRef.current === 'number') {
        cancelAnimationFrame(smoothIntervalRef.current);
      } else {
        clearInterval(smoothIntervalRef.current);
      }
      smoothIntervalRef.current = null;
    }

    // Remove callback from AnimationFrameManager if it was used
    if (animationManagerRef.current) {
      // Note: We need to store the callback reference to remove it properly
      // For now, we'll let the AnimationFrameManager handle cleanup when no callbacks are active
    }
  };

  // Start new game with realistic candlestick generation
  const startNewGame = () => {
    console.log('🎮 Starting new game...');
    
    // Immediately force reset game state to remove any overlays
    updateGameState(prev => ({
      isActive: true,
      isPreparing: false,
      multiplier: 1.00,
      hasCrashed: false,
      crashPoint: 0,
      timeElapsed: 0,
      countdown: 0
    }));
    
    // Clear ALL existing intervals and effects
    if (gameIntervalRef.current) {
      clearInterval(gameIntervalRef.current);
      gameIntervalRef.current = null;
    }
    if (candleIntervalRef.current) {
      clearInterval(candleIntervalRef.current);
      candleIntervalRef.current = null;
    }
    
    // Clear any running countdown or fade effects
    const allIntervals = window.setInterval(() => {}, 9999);
    for (let i = 1000; i <= allIntervals; i++) {
      window.clearInterval(i);
    }
    
    stopSmoothInterpolation();

    // Generate new crash point
    const newCrashPoint = generateCrashPoint();
    console.log(`🎯 New game starting with crash point: ${newCrashPoint.toFixed(3)}`);
    
    // Reset price tracking
    const initialPrice = 1.0;
    setCurrentPrice(initialPrice);
    setTargetPrice(initialPrice);
    currentPriceRef.current = initialPrice;
    
    // Ensure the multiplier is properly set to match the initial price
    updateGameState(prev => ({
      ...prev,
      multiplier: initialPrice
    }));
    
    // Reset chart data for a fresh start
    setChartData([]); // Clear all previous candles
    
    // Initialize game state - ensure all crash-related states are reset
    updateGameState({
      isActive: true,
      isPreparing: false,
      multiplier: initialPrice,
      hasCrashed: false, // Reset crash state
      crashPoint: newCrashPoint,
      timeElapsed: 0,
      countdown: 0 // Ensure countdown is reset
    });
    
    // Initialize with the first candle after a short delay to ensure UI rendering is complete
    setTimeout(() => {
      const firstCandle: CandleData = {
        open: initialPrice,
        high: initialPrice,
        low: initialPrice,
        close: initialPrice,
        time: Date.now(),
        volume: generateVolume()
      };
      console.log('🎯 First candle with volume:', firstCandle);
      setChartData([firstCandle]);
    }, 100);

    // Start smooth price interpolation
    startSmoothInterpolation();

    // Start price simulation with crash detection
    let targetPriceValue = initialPrice;
    
    // Create candles and update price target
    candleIntervalRef.current = setInterval(() => {
      // Generate new target price with more realistic movement
      targetPriceValue = generatePriceMovement(targetPriceValue);
      setTargetPrice(targetPriceValue);
      
      const now = Date.now();
      
      setChartData(prev => {
        // Get previous candle for continuity
        const lastCandle = prev[prev.length - 1];
        
        // Log candle count to monitor aggregation threshold
        if (prev.length >= 25) { // Start logging when approaching 30
          console.log(`📊 Current candle count: ${prev.length} (aggregation threshold: 30)`);
        }
        
        // Check if enough time has passed to create new candle (3s interval, or 500ms in test mode)
        const candleInterval = testMode ? 500 : 3000;
        if (now - lastCandle.time >= candleInterval) {
          // Finalize previous candle with current price
          const updatedLastCandle = {
            ...lastCandle,
            close: targetPriceValue,
            high: Math.max(lastCandle.high, targetPriceValue),
            low: Math.min(lastCandle.low, targetPriceValue)
          };
          
          // Create new candle
          const newCandle: CandleData = {
            open: targetPriceValue,
            high: targetPriceValue,
            low: targetPriceValue,
            close: targetPriceValue,
            time: now,
            volume: generateVolume()
          };
          
          // Update chart with finalized previous candle and new candle
          let updated = [...prev.slice(0, -1), updatedLastCandle, newCandle];
          
          // Apply candle aggregation if we have 30 or more candles
          updated = performCandleAggregation(updated);
          
          // Update our reference with the latest candle value
          latestCandleValueRef.current = targetPriceValue;
          
          // Update the multiplier directly from the latest candle's close value
          updateGameState(currentState => ({
            ...currentState,
            multiplier: targetPriceValue // Set multiplier to actual candle value
          }));
          
          return updated.slice(-100); // Keep last 100 candles for history
        } else {
          // Just update the current candle
          const updatedLastCandle = {
            ...lastCandle,
            close: targetPriceValue,
            high: Math.max(lastCandle.high, targetPriceValue),
            low: Math.min(lastCandle.low, targetPriceValue)
          };
          
          // Update our reference with the latest candle value
          latestCandleValueRef.current = targetPriceValue;
          
          // Update the multiplier directly from the candle's close value
          updateGameState(currentState => ({
            ...currentState,
            multiplier: targetPriceValue // Set multiplier to actual candle value
          }));
          
          return [...prev.slice(0, -1), updatedLastCandle];
        }
      });
      
      // Check for crash condition
      if ((newCrashPoint < 1.0 && targetPriceValue <= newCrashPoint) ||
          (newCrashPoint >= 1.0 && targetPriceValue >= newCrashPoint)) {
        
        console.log(`💥 CRASH TRIGGERED! Current: ${targetPriceValue.toFixed(3)} Target: ${newCrashPoint.toFixed(3)}`);
        
        // Clear the intervals
        if (candleIntervalRef.current) {
          clearInterval(candleIntervalRef.current);
          candleIntervalRef.current = null;
        }
        
        // Create a new final candle that goes from current price to crash point
        const lastPrice = chartData.length > 0 ? chartData[chartData.length - 1].close : targetPriceValue;
        
        // First finalize the current candle
        const finalizedCurrentCandle = chartData.length > 0 ? 
          {...chartData[chartData.length - 1], close: lastPrice} : 
          {open: targetPriceValue, high: targetPriceValue, low: targetPriceValue, close: targetPriceValue, time: Date.now(), volume: generateVolume()};
          
        // Then create a dramatic crash candle that goes to 0
        const crashCandle: CandleData = {
          open: lastPrice,
          high: lastPrice, // High stays at current price
          low: 0, // Low point is 0 for dramatic effect
          close: 0, // Close at 0 for dramatic effect
          time: Date.now() + 100, // Just after the current time
          volume: generateVolume(2000000, 0.5) // Higher volume during crash with more volatility
        };
        
        // Update chart with finalized current candle and the giant crash candle
        setChartData(prev => {
          let updated = [...prev.slice(0, -1), finalizedCurrentCandle, crashCandle];
          // Apply candle aggregation if we have 30 or more candles
          updated = performCandleAggregation(updated);
          return updated;
        });
        
        // Update game state to crashed
        updateGameState(prev => {
          console.log('💥 Setting game state to crashed', {
            crashPoint: newCrashPoint,
            currentPrice: targetPriceValue,
            willSyncToBetting: {
              isGameActive: false,
              currentMultiplier: newCrashPoint, // Send crash point as multiplier for proper sync
              crashPoint: newCrashPoint
            }
          });
          return {
            ...prev,
            isActive: false,
            isPreparing: false,
            hasCrashed: true,
            multiplier: newCrashPoint, // Keep crash point as multiplier for betting context sync
            crashPoint: newCrashPoint // Keep the actual crash point for display in the overlay
          };
        });

        // Start countdown for next game
        setTimeout(() => {
          // Prepare for chart reset with visual transition
          updateGameState(prev => ({
            ...prev,
            countdown: 5,
            isPreparing: true // Set to preparing state for visual transition
          }));

          // Fade out existing chart data gradually
          const fadeOutEffect = setInterval(() => {
            setChartData(prev => {
              // Remove one candle at a time for visual fade-out effect
              if (prev.length > 0) {
                return prev.slice(0, -1);
              } else {
                clearInterval(fadeOutEffect);
                return [];
              }
            });
          }, 100);

          const countdownInterval = setInterval(() => {
            updateGameState(prev => {
              if (prev.countdown <= 1) {
                clearInterval(countdownInterval);
                clearInterval(fadeOutEffect); // Ensure fade effect is cleared
                
                // Force reset the crash UI elements by immediately updating hasCrashed
                const resetState = {
                  ...prev,
                  hasCrashed: false,
                  countdown: 0
                };
                
                // Wait a tick to ensure UI updates before starting a new game
                setTimeout(() => {
                  startNewGame();
                }, 50);
                
                return resetState;
              }
              return { ...prev, countdown: prev.countdown - 1 };
            });
          }, 1000);
        }, 2000);
      }
    }, 100); // Update price target every 100ms for smooth movement
  };

  // Auto-start first game
  useEffect(() => {
    const timer = setTimeout(() => {
      startNewGame();
    }, 1000);

    return () => {
      clearTimeout(timer);
      if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
      if (candleIntervalRef.current) clearInterval(candleIntervalRef.current);
      stopSmoothInterpolation();
    };
  }, []);

  // Canvas drawing effect - Ultra-smooth professional chart rendering with performance optimization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Start performance profiling for rendering
    profilerRef.current?.start('canvas-render');

    // Set canvas size with high DPI support for sharp rendering
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = rect.width;
    const height = rect.height;
    const padding = 40; // Increased padding for price labels

    // Define vertical boundary positions (matches the purple and yellow lines you drew)
    const leftBoundary = padding + 40; // Purple line position (a bit right of regular padding)
    const rightBoundary = width - padding - 100; // Yellow line position (further from right edge to allow space for labels)
    
    // Get current quality level for adaptive rendering
    const qualityLevel = qualityManagerRef.current?.getQualityLevel() || 1.0;
    
    // Apply ultra-smooth rendering optimizations based on quality level
    if (qualityLevel > 0.7) {
      // High quality: enable all smoothing features
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
    } else if (qualityLevel > 0.3) {
      // Medium quality: enable basic smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'medium';
      ctx.lineJoin = 'round';
    } else {
      // Low quality: disable smoothing for performance
      ctx.imageSmoothingEnabled = false;
    }

    // Mark full canvas as dirty for rendering
    dirtyRectManagerRef.current?.markDirty({
      x: 0,
      y: 0,
      width: canvas.width,
      height: canvas.height
    });

    // Clear canvas with optimized background rendering
    if (canvasOptimizerRef.current && qualityLevel > 0.5) {
      canvasOptimizerRef.current.drawRect(0, 0, width, height, '#000000');
    } else {
      // Fallback to standard rendering
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);
    }

    // Always show ALL candles by dynamically adjusting candle width and spacing
    const availableWidth = rightBoundary - leftBoundary;
    const visibleCandles = chartData; // Always show all candles
    
    // Calculate optimal candle width and spacing to fit all candles
    let candleWidth: number;
    let candleSpacing: number;
    
    if (chartData.length === 0) {
      // Default values when no data
      candleWidth = 20;
      candleSpacing = 4;
    } else {
      // Calculate total space needed for all candles with optimal sizing
      const totalCandles = chartData.length;
      
      // Start with preferred sizes and scale down if needed
      const preferredCandleWidth = 20;
      const preferredSpacing = 4;
      const preferredTotalWidth = totalCandles * (preferredCandleWidth + preferredSpacing) - preferredSpacing;
      
      if (preferredTotalWidth <= availableWidth) {
        // Preferred size fits, use it
        candleWidth = preferredCandleWidth;
        candleSpacing = preferredSpacing;
      } else {
        // Need to scale down - calculate optimal sizes
        // Maintain a ratio where spacing is roughly 20% of candle width
        const totalUnits = totalCandles * 1.2 - 0.2; // candles + spacing (spacing = 0.2 * candleWidth)
        const unitWidth = availableWidth / totalUnits;
        
        candleWidth = Math.max(2, unitWidth); // Minimum 2px width
        candleSpacing = Math.max(1, candleWidth * 0.2); // Spacing is 20% of candle width, minimum 1px
        
        // Ensure we don't exceed available width
        const actualTotalWidth = totalCandles * (candleWidth + candleSpacing) - candleSpacing;
        if (actualTotalWidth > availableWidth) {
          // Fine-tune to fit exactly
          const scaleFactor = availableWidth / actualTotalWidth;
          candleWidth *= scaleFactor;
          candleSpacing *= scaleFactor;
        }
      }
    }

    if (visibleCandles.length === 0) {
      // If no data, just draw grid
      drawEmptyChartGrid(ctx, width, height, padding, leftBoundary, rightBoundary);
      
      return;
    }

    // Calculate price range - always include first candle for auto-zoom
    const allPrices = visibleCandles.flatMap(c => [c.high, c.low]);
    if (currentPrice) allPrices.push(currentPrice);
    
    // Always include the first candle in the chart to maintain visibility
    if (chartData.length > 0) {
      const firstCandle = chartData[0];
      allPrices.push(firstCandle.high, firstCandle.low);
    }
    
    // Add more intelligent padding based on price volatility for fluid zoom
    const rawMinPrice = Math.min(...allPrices);
    const rawMaxPrice = Math.max(...allPrices);
    const rawRange = rawMaxPrice - rawMinPrice;
    
    // Dynamic padding: more padding for smaller ranges, less for larger ranges
    const paddingPercent = Math.max(0.05, Math.min(0.15, 0.5 / rawRange));
    const minPrice = rawMinPrice * (1 - paddingPercent);
    const maxPrice = rawMaxPrice * (1 + paddingPercent);
    const priceRange = maxPrice - minPrice;

    // Draw grid lines
    drawChartGrid(ctx, width, height, padding, minPrice, maxPrice, leftBoundary, rightBoundary);
    
    // Normalize price to Y coordinate
    const normalizeY = (price: number) => {
      return height - padding - ((price - minPrice) / priceRange) * (height - 2 * padding);
    };

    // Draw candlesticks with ultra-smooth rendering
    visibleCandles.forEach((candle, index) => {
      // Calculate x position within the bounded area
      const x = leftBoundary + index * (candleWidth + candleSpacing);
      
      // Skip if outside the boundaries
      if (x < leftBoundary || x + candleWidth > rightBoundary) return;
      
      // Detect if this is the special crash candle (close at 0)
      const isCrashCandle = gameState.hasCrashed && index === visibleCandles.length - 1 && candle.close === 0;
      
      // Check if this is the latest active candle (not crashed)
      const isLatestCandle = gameState.isActive && index === visibleCandles.length - 1;
      
      // If it's the crash candle, make it wider for emphasis
      const finalCandleWidth = isCrashCandle ? candleWidth * 1.5 : candleWidth;
      
      // Use optimized rendering for high-quality mode, fallback to standard for lower quality
      const qualityLevel = qualityManagerRef.current?.getQualityLevel() || 1.0;
      
      if (qualityLevel > 0.7 && canvasOptimizerRef.current) {
        // High-quality optimized rendering
        const normalizedOpen = normalizeY(candle.open);
        const normalizedHigh = normalizeY(candle.high);
        const normalizedLow = normalizeY(candle.low);
        const normalizedClose = normalizeY(candle.close);
        const isGreen = candle.close >= candle.open;
        
        drawOptimizedCandlestick(
          ctx,
          x + finalCandleWidth / 2, // Center X position
          normalizedOpen,   // Normalized Y coordinates for canvas drawing
          normalizedHigh,
          normalizedLow,
          normalizedClose,
          finalCandleWidth,
          isGreen
        );
        
        // Mark dirty rectangle for efficient redraws
        if (dirtyRectManagerRef.current) {
          dirtyRectManagerRef.current.markDirty({
            x: x - 2,
            y: Math.min(normalizedHigh, normalizedLow) - 2,
            width: finalCandleWidth + 4,
            height: Math.abs(normalizedHigh - normalizedLow) + 4
          });
        }
      } else {
        // Standard rendering for lower quality modes
        drawCandle(ctx, candle, x, finalCandleWidth, normalizeY, isLatestCandle, rightBoundary, leftBoundary, width, padding);
      }
      
      // If it's the crash candle, draw the crash indicator
      if (isCrashCandle) {
        const candleX = x + finalCandleWidth / 2;
        drawCrashPoint(ctx, 0, candleX, normalizeY);
      }
    });

    // Draw trade arrows for buy/sell actions
    tradeActions.forEach((trade) => {
      // Find the candle that corresponds to this trade timestamp or the closest one
      let closestCandleIndex = -1;
      let closestTimeDiff = Number.POSITIVE_INFINITY;
      
      visibleCandles.forEach((candle, index) => {
        const timeDiff = Math.abs(candle.time - trade.timestamp);
        if (timeDiff < closestTimeDiff) {
          closestTimeDiff = timeDiff;
          closestCandleIndex = index;
        }
      });
      
      if (closestCandleIndex >= 0 && closestTimeDiff < 10000) { // Within 10 seconds
        const x = leftBoundary + closestCandleIndex * (candleWidth + candleSpacing);
        const y = normalizeY(trade.multiplier);
        
        // Adjust arrow position based on type
        const arrowY = trade.type === 'buy' ? y + 20 : y - 20;
        
        // Draw the trade arrow with a slight offset to avoid overlapping with candles
        drawTradeArrow(ctx, trade.type, x + candleWidth / 2, arrowY);
        
        // Draw a small connecting line from arrow to price level
        ctx.strokeStyle = trade.type === 'buy' ? '#FFD700' : '#FF8C00';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(x + candleWidth / 2, arrowY);
        ctx.lineTo(x + candleWidth / 2, y);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });

    // Draw position tracker if there's an active position
    drawPositionTracker(ctx, width, height, padding);

    // Current price line drawing removed by user request

    // Complete performance profiling and update metrics
    profilerRef.current?.end('canvas-render');
    
    // Update performance state with latest metrics
    const renderTime = profilerRef.current?.getAverageDuration('canvas-render') || 0;
    const currentFPS = renderTime > 0 ? 1000 / renderTime : 60; // Calculate FPS from render time
    
    // Update quality manager with performance data
    if (qualityManagerRef.current) {
      qualityManagerRef.current.update(); // This internally updates FPS and adjusts quality
    }
    
    // Update performance state
    setPerformanceState(prev => ({
      ...prev,
      currentFPS: Math.round(currentFPS),
      frameTime: renderTime,
      qualityLevel: qualityManagerRef.current?.getQualityLevel() || 1.0,
      memoryUsage: (performance as any).memory ? (performance as any).memory.usedJSHeapSize / 1024 / 1024 : 0
    }));

  }, [chartData, gameState, currentPrice, tradeActions, playerBet]);
  
  // Helper function to draw empty chart grid
  const drawEmptyChartGrid = (
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number, 
    padding: number,
    leftBoundary: number = padding,
    rightBoundary: number = width - padding
  ) => {
    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding + ((height - padding * 2) / 5) * i;
      ctx.beginPath();
      ctx.moveTo(leftBoundary, y);
      ctx.lineTo(rightBoundary, y);
      ctx.stroke();
    }
    
    // Show message based on game state
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '16px monospace';
    ctx.textAlign = 'center';
    
    // Center message between boundaries
    const centerX = leftBoundary + (rightBoundary - leftBoundary) / 2;
    
    if (gameState.isPreparing) {
      ctx.fillText('Preparing chart...', centerX, height / 2);
    } else if (gameState.countdown > 0) {
      ctx.fillText('Next round starting...', centerX, height / 2);
    } else {
      ctx.fillText('Initializing chart...', centerX, height / 2);
    }
  };

  // Helper function to draw chart grid and labels
  const drawChartGrid = (
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number, 
    padding: number,
    minPrice: number,
    maxPrice: number,
    leftBoundary: number = padding,
    rightBoundary: number = width - padding
  ) => {
    // Draw grid lines with subtle coloring
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
    ctx.lineWidth = 0.5;
    
    // Calculate nice round increments for price labels (like 0.2, 0.4, 0.6, etc.)
    const priceRange = maxPrice - minPrice;
    let increment;
    
    // Determine appropriate increment based on price range
    if (priceRange <= 1) {
      increment = 0.2; // For small ranges, use 0.2 increments
    } else if (priceRange <= 5) {
      increment = 0.5; // For medium ranges, use 0.5 increments
    } else if (priceRange <= 10) {
      increment = 1.0; // For larger ranges, use 1.0 increments
    } else {
      increment = Math.ceil(priceRange / 10); // For very large ranges, use dynamic increments
    }
    
    // Find the starting point (round down to nearest increment)
    const startPrice = Math.floor(minPrice / increment) * increment;
    
    // Draw horizontal grid lines with clean incremental labels
    for (let price = startPrice; price <= maxPrice + increment; price += increment) {
      if (price < minPrice) continue; // Skip prices below our range
      
      const y = height - padding - ((price - minPrice) / (maxPrice - minPrice)) * (height - 2 * padding);
      
      // Skip if y is outside our drawing area
      if (y < padding || y > height - padding) continue;
      
      // Draw horizontal line - EXTENDED to full width for better visibility
      ctx.strokeStyle = 'rgba(128, 128, 128, 0.3)'; // Light grey, more visible than before
      ctx.lineWidth = 1; // Thin but visible line
      ctx.beginPath();
      ctx.moveTo(padding, y); // EXTENDED: Start from left padding (full width)
      ctx.lineTo(width - padding, y); // EXTENDED: Go to right padding (full width)
      ctx.stroke();
      
      // Reset stroke style for other drawing operations
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
      ctx.lineWidth = 0.5;
      
      // Draw price labels on RIGHT side, just moved slightly left to avoid border collision
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = '12px monospace';
      ctx.textAlign = 'left'; // Left-aligned for right side positioning
      
      // Format price to show clean incremental values (like 0.60x, 0.80x, 1.0x, 1.2x, etc.)
      const formattedPrice = price < 1 ? price.toFixed(2) : 
                           price < 10 ? price.toFixed(1) : 
                           Math.round(price).toString();
      ctx.fillText(`${formattedPrice}x`, width - padding - 50, y + 4); // RIGHT side, just moved left from border
    }
    
    // Draw a few vertical grid lines (time) within boundaries
    const verticalLines = 4;
    const boundaryWidth = rightBoundary - leftBoundary;
    for (let i = 0; i <= verticalLines; i++) {
      const x = leftBoundary + (boundaryWidth / verticalLines) * i;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();
    }
  };

  // Helper function to draw a single candle
  const drawCandle = (
    ctx: CanvasRenderingContext2D,
    candle: CandleData,
    x: number,
    candleWidth: number,
    normalizeY: (price: number) => number,
    isLatestCandle = false,
    rightBoundary = 0,
    leftBoundary = 0,
    width = 0,
    padding = 0
  ) => {
    const openY = normalizeY(candle.open);
    const closeY = normalizeY(candle.close);
    const highY = normalizeY(candle.high);
    const lowY = normalizeY(candle.low);

    const bodyTop = Math.min(openY, closeY);
    const bodyBottom = Math.max(openY, closeY);
    const bodyHeight = Math.abs(closeY - openY);
    const centerX = x + candleWidth / 2;

    // Check if this is a crash candle (close at or near 0)
    const isCrashCandle = candle.close === 0;
    
    // Determine candle color based on price direction
    const isGreen = candle.close >= candle.open;
    
    // Professional trading chart colors for candlesticks
    // Bright green/red for bodies and slightly darker for wicks
    let wickColor, bodyFillColor, bodyStrokeColor;
    
    if (isCrashCandle) {
      // Special styling for crash candle - more intense red
      wickColor = '#ff0000';
      bodyFillColor = '#ff0000';
      bodyStrokeColor = '#ffffff'; // White border for emphasis
    } else {
      // Normal candle colors
      wickColor = isGreen ? '#00ff00' : '#ff0000';
      bodyFillColor = isGreen ? '#00ff00' : '#ff0000';
      bodyStrokeColor = isGreen ? '#00cc00' : '#cc0000';
    }

    // Draw candle body (rectangle) - using width for consistent sizing
    if (bodyHeight < 1 && !isCrashCandle) {
      // Very small body (doji) - draw as line
      ctx.strokeStyle = wickColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x, openY);
      ctx.lineTo(x + candleWidth, openY);
      ctx.stroke();
    } else {
      // Regular candle body
      ctx.fillStyle = bodyFillColor;
      
      // For crash candle, add a gradient effect
      if (isCrashCandle) {
        const gradient = ctx.createLinearGradient(x, bodyTop, x, bodyBottom);
        gradient.addColorStop(0, '#ff3333');
        gradient.addColorStop(1, '#ff0000');
        ctx.fillStyle = gradient;
      }
      
      ctx.fillRect(x, bodyTop, candleWidth, bodyHeight);
      
      // Add border to make candles pop
      ctx.strokeStyle = bodyStrokeColor;
      ctx.lineWidth = isCrashCandle ? 2 : 1; // Thicker border for crash candle
      ctx.strokeRect(x, bodyTop, candleWidth, bodyHeight);
    }
    
    // Draw wicks using the same color but thinner lines
    ctx.strokeStyle = wickColor;
    ctx.lineWidth = 1;
    
    // Upper wick
    if (highY < bodyTop) {
      ctx.beginPath();
      ctx.moveTo(centerX, highY);
      ctx.lineTo(centerX, bodyTop);
      ctx.stroke();
    }

    // Lower wick
    if (lowY > bodyBottom) {
      ctx.beginPath();
      ctx.moveTo(centerX, bodyBottom);
      ctx.lineTo(centerX, lowY);
      ctx.stroke();
    }

    // For the latest candle, add a prominent value label
    if (isLatestCandle && !isCrashCandle) {
      // Create a pulse animation effect based on timestamp
      const pulse = Math.sin(Date.now() / 200) * 0.2 + 0.8; // Value between 0.6 and 1.0
      
      // Draw background bubble for latest candle value
      const valueText = `${candle.close.toFixed(2)}x`;
      const textWidth = ctx.measureText(valueText).width + 10;
      const bubbleWidth = Math.max(textWidth, 50);
      const bubbleHeight = 24;
      
      // Position bubble to overlap with static price labels area
      // Moving over the static price labels to show live multiplier
      const bubbleX = width - padding - 50; // Align with static price labels position
      const bubbleY = closeY - bubbleHeight / 2;
      
      // Draw background bubble
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.beginPath();
      ctx.roundRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight, 4);
      ctx.fill();
      
      // Draw border with pulsing effect
      ctx.strokeStyle = isGreen ? 
        `rgba(0, 255, 0, ${pulse})` : 
        `rgba(255, 0, 0, ${pulse})`;
      ctx.lineWidth = 1.5 + pulse; // Width also pulses
      ctx.stroke();
      
      // Draw value text
      ctx.fillStyle = isGreen ? '#00ff00' : '#ff0000';
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(valueText, bubbleX + bubbleWidth / 2, bubbleY + 17);
      
      // Draw a small "LIVE" indicator
      ctx.font = '9px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('LIVE', bubbleX + bubbleWidth / 2, bubbleY + 4);
      
      // Draw horizontal dashed line across the chart to the live price bubble
      ctx.setLineDash([8, 4]); // Dashed pattern: 8px dash, 4px gap
      ctx.strokeStyle = isGreen ? 
        `rgba(0, 255, 0, ${pulse * 0.8})` : 
        `rgba(255, 0, 0, ${pulse * 0.8})`; // Use color matching the candle with pulsing effect
      ctx.lineWidth = 2; // Slightly thinner line
      ctx.beginPath();
      ctx.moveTo(leftBoundary, closeY); // Start from left boundary
      ctx.lineTo(bubbleX, closeY); // End at the bubble position
      ctx.stroke();
      ctx.setLineDash([]); // Reset dash pattern for other drawing operations
    }
  };
  
  // Helper function to draw current price line
  const drawCurrentPriceLine = (
    ctx: CanvasRenderingContext2D,
    price: number,
    width: number,
    padding: number,
    normalizeY: (price: number) => number,
    leftBoundary: number = padding,
    rightBoundary: number = width - padding
  ) => {
    const currentY = normalizeY(price);
    
    // Current price line drawing removed by user request
  };

  // Helper function to draw crash point indicator
  const drawCrashPoint = (
    ctx: CanvasRenderingContext2D,
    crashPoint: number,
    x: number,
    normalizeY: (price: number) => number
  ) => {
    const crashY = normalizeY(crashPoint);
    
    // For the crash to zero effect, we should place the indicator at the bottom
    // of the crash candle (at zero) rather than at the crash point value
    const zeroY = normalizeY(0);
    
    // Draw explosion effect at crash point
    ctx.fillStyle = '#ff0000';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    
    // Larger circle for more dramatic effect
    ctx.beginPath();
    ctx.arc(x, zeroY, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Draw radiating lines for explosion effect
    ctx.strokeStyle = '#ff5555';
    ctx.lineWidth = 2;
    const rayLength = 20;
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 / 8) * i;
      ctx.beginPath();
      ctx.moveTo(x, zeroY);
      ctx.lineTo(
        x + Math.cos(angle) * rayLength,
        zeroY + Math.sin(angle) * rayLength
      );
      ctx.stroke();
    }
    
    // Add crash text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('CRASH!', x, zeroY - 25);
  };

  // Helper function to draw trade arrows
  const drawTradeArrow = (
    ctx: CanvasRenderingContext2D,
    type: 'buy' | 'sell',
    x: number,
    y: number,
    size = 15
  ) => {
    const arrowColor = type === 'buy' ? '#FFD700' : '#FF8C00'; // Yellow for buy, orange for sell
    const shadowColor = type === 'buy' ? '#FFA500' : '#FF6347'; // Darker shadow
    
    // Draw shadow first
    ctx.fillStyle = shadowColor;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    
    if (type === 'buy') {
      // Draw up arrow for buy (offset for shadow)
      ctx.moveTo(x + 1, y - size + 1); // Top point
      ctx.lineTo(x - size/2 + 1, y + 1); // Bottom left
      ctx.lineTo(x - size/4 + 1, y + 1); // Inner left
      ctx.lineTo(x - size/4 + 1, y + size/2 + 1); // Bottom of stem left
      ctx.lineTo(x + size/4 + 1, y + size/2 + 1); // Bottom of stem right
      ctx.lineTo(x + size/4 + 1, y + 1); // Inner right
      ctx.lineTo(x + size/2 + 1, y + 1); // Bottom right
    } else {
      // Draw down arrow for sell (offset for shadow)
      ctx.moveTo(x + 1, y + size + 1); // Bottom point
      ctx.lineTo(x - size/2 + 1, y + 1); // Top left
      ctx.lineTo(x - size/4 + 1, y + 1); // Inner left
      ctx.lineTo(x - size/4 + 1, y - size/2 + 1); // Top of stem left
      ctx.lineTo(x + size/4 + 1, y - size/2 + 1); // Top of stem right
      ctx.lineTo(x + size/4 + 1, y + 1); // Inner right
      ctx.lineTo(x + size/2 + 1, y + 1); // Top right
    }
    
    ctx.closePath();
    ctx.fill();
    
    // Draw main arrow
    ctx.fillStyle = arrowColor;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.5;
    
    ctx.beginPath();
    
    if (type === 'buy') {
      // Draw up arrow for buy
      ctx.moveTo(x, y - size); // Top point
      ctx.lineTo(x - size/2, y); // Bottom left
      ctx.lineTo(x - size/4, y); // Inner left
      ctx.lineTo(x - size/4, y + size/2); // Bottom of stem left
      ctx.lineTo(x + size/4, y + size/2); // Bottom of stem right
      ctx.lineTo(x + size/4, y); // Inner right
      ctx.lineTo(x + size/2, y); // Bottom right
    } else {
      // Draw down arrow for sell
      ctx.moveTo(x, y + size); // Bottom point
      ctx.lineTo(x - size/2, y); // Top left
      ctx.lineTo(x - size/4, y); // Inner left
      ctx.lineTo(x - size/4, y - size/2); // Top of stem left
      ctx.lineTo(x + size/4, y - size/2); // Top of stem right
      ctx.lineTo(x + size/4, y); // Inner right
      ctx.lineTo(x + size/2, y); // Top right
    }
    
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  };

  // Helper function to draw position tracker
  const drawPositionTracker = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    padding: number
  ) => {
    // HIDE PnL tracker when game has crashed - it should disappear until next game
    if (gameState.hasCrashed) {
      console.log('🎯 PNL Tracker HIDDEN - Game has crashed');
      return;
    }
    
    // Show PnL tracker if there have been any trades in this game session OR if there's an active bet
    const hasTradesThisGame = tradeActions.length > 0;
    const hasActiveBet = playerBet.isActive;
    
    console.log('🎯 PNL Tracker Debug:', {
      hasTradesThisGame,
      hasActiveBet,
      tradeActionsLength: tradeActions.length,
      playerBetActive: playerBet.isActive,
      playerBetAmount: playerBet.amount,
      multiplier,
      gameHasCrashed: gameState.hasCrashed
    });
    
    if (!hasTradesThisGame && !hasActiveBet) return;
    
    // Use cumulative PnL across all trades in this game session
    const pnl = getCumulativePnL();
    const isProfit = pnl >= 0;
    
    // Calculate percentage based on total amount invested in this game session
    let totalInvested = 0;
    
    // Count all buy trade actions
    for (const action of tradeActions) {
      if (action.type === 'buy') {
        totalInvested += action.amount;
      }
    }
    
    console.log('💰 PNL Calculation:', {
      pnl,
      totalInvested,
      tradeActions: tradeActions.map(a => ({type: a.type, amount: a.amount, multiplier: a.multiplier}))
    });
    
    const pnlPercent = totalInvested > 0 ? ((pnl / totalInvested) * 100).toFixed(1) : '0.0';
    
    // Position in absolute bottom right corner (outside the chart padding)
    const amountText = `${isProfit ? '+' : ''}${pnl.toFixed(3)} SOL`;
    const percentText = `(${isProfit ? '+' : ''}${pnlPercent}%)`;
    const textColor = isProfit ? '#00ff00' : '#ff0000';
    const bgColor = 'rgba(0, 0, 0, 0.85)';
    const borderColor = isProfit ? '#00ff00' : '#ff0000';
    
    // Measure text
    ctx.font = 'bold 12px monospace';
    const amountMetrics = ctx.measureText(amountText);
    const percentMetrics = ctx.measureText(percentText);
    const maxWidth = Math.max(amountMetrics.width, percentMetrics.width);
    const textHeight = 16;
    const totalHeight = textHeight * 2 + 10;
    
    // Position in absolute bottom right corner (outside chart bounds)
    const boxX = width - maxWidth - 35; // Close to right edge
    const boxY = height - totalHeight - 25; // Close to bottom edge
    const boxWidth = maxWidth + 20;
    
    // Background shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(boxX + 2, boxY + 2, boxWidth, totalHeight);
    
    // Main background
    ctx.fillStyle = bgColor;
    ctx.fillRect(boxX, boxY, boxWidth, totalHeight);
    
    // Border with glow effect
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(boxX, boxY, boxWidth, totalHeight);
    
    // Inner glow
    ctx.strokeStyle = `${borderColor}40`; // 25% opacity
    ctx.lineWidth = 4;
    ctx.strokeRect(boxX - 1, boxY - 1, boxWidth + 2, totalHeight + 2);
    
    // Draw text with glow
    ctx.textAlign = 'center';
    const centerX = boxX + boxWidth / 2;
    
    // Text shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillText(amountText, centerX + 1, boxY + textHeight + 1);
    ctx.fillText(percentText, centerX + 1, boxY + textHeight * 2 + 1);
    
    // Main text
    ctx.fillStyle = textColor;
    ctx.fillText(amountText, centerX, boxY + textHeight);
    ctx.fillText(percentText, centerX, boxY + textHeight * 2);
    
    // Add a small "POSITION" label at the top
    ctx.font = 'bold 9px monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillText('POSITION', centerX, boxY - 5);
  };

  // Debug helper to log state changes
  useEffect(() => {
    console.log('Game state updated:', {
      isActive: gameState.isActive,
      isPreparing: gameState.isPreparing,
      hasCrashed: gameState.hasCrashed,
      countdown: gameState.countdown,
      multiplier: gameState.multiplier,
      showingOverlay: gameState.hasCrashed && gameState.countdown > 0 && !gameState.isActive && !gameState.isPreparing
    });
  }, [gameState]);
  
  // Make sure the multiplier is always synced with the latest candle data
  useEffect(() => {
    if (chartData.length > 0 && gameState.isActive) {
      const latestCandle = chartData[chartData.length - 1];
      latestCandleValueRef.current = latestCandle.close;
      
      // Update the multiplier to match the latest candle close value
      updateGameState(prev => ({
        ...prev,
        multiplier: latestCandle.close
      }));
    }
  }, [chartData]);

  // Status message helper
  const getStatusMessage = () => {
    if (gameState.isPreparing) return "Preparing...";
    if (gameState.isActive) return "🚀 Live";
    if (gameState.hasCrashed) return "💥 Crashed";
    return "Loading";
  };

  // Error fallback UI
  if (hasError) {
    return (
      <div className="chart-container border border-red-500 rounded-lg overflow-hidden relative p-4 h-[400px] bg-black">
        <div className="text-white text-center p-8">
          <h1 className="text-2xl font-bold mb-4">⚠️ Chart Error</h1>
          <p className="text-lg">Something went wrong with the chart component</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`chart-container border border-gray-700 rounded-lg overflow-hidden relative p-2 h-[400px] transition-all duration-500 ${
      gameState.hasCrashed ? 'bg-red-600' : 'bg-black'
    }`}>
      
      {/* Test Mode Toggle Button */}
      <button 
        onClick={() => setTestMode(!testMode)}
        className={`absolute top-4 left-4 px-3 py-1 rounded-lg shadow-lg z-20 font-bold text-xs ${
          testMode ? 'bg-orange-600 text-white' : 'bg-gray-600 text-white'
        } hover:opacity-80 transition-opacity`}
      >
        {testMode ? '🚀 FAST MODE' : '⏱️ NORMAL'}
      </button>
      
      <div className={`absolute top-4 right-4 px-3 py-1 rounded-lg shadow-lg z-10 font-bold ${
        gameState.isActive ? 'bg-green-600' : gameState.hasCrashed ? 'bg-red-600' : 'bg-yellow-600'
      } text-white`}>
        {getStatusMessage()}
      </div>

      <canvas
        ref={canvasRef}
        className={`absolute inset-0 z-10 transition-opacity duration-500 ${
          gameState.hasCrashed ? 'opacity-30' : 'opacity-100'
        }`}
        style={{ width: '100%', height: '100%' }}
      />

      {/* Massive CRASH overlay covering the entire chart */}
      {gameState.hasCrashed && gameState.countdown > 0 && !gameState.isActive && !gameState.isPreparing && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-red-600 bg-opacity-95">
          <div className="text-center">
            {/* Massive CRASH text */}
            <div className="relative">
              {/* Multiple glow layers for dramatic effect */}
              <div className="absolute inset-0 text-red-200 font-black text-8xl md:text-9xl lg:text-[12rem] tracking-widest animate-pulse blur-lg">
                CRASH
              </div>
              <div className="absolute inset-0 text-red-100 font-black text-8xl md:text-9xl lg:text-[12rem] tracking-widest animate-pulse blur-md">
                CRASH
              </div>
              <div className="relative text-white font-black text-8xl md:text-9xl lg:text-[12rem] tracking-widest drop-shadow-2xl animate-bounce">
                CRASH
              </div>
            </div>
            
            {/* Crash details with dramatic styling */}
            <div className="mt-8 bg-black bg-opacity-80 rounded-xl px-8 py-6 border-4 border-red-300 max-w-md mx-auto">
              <div className="text-white text-3xl font-bold mb-2">
                🔥 GAME OVER 🔥
              </div>
              <div className="text-red-200 text-2xl font-semibold mb-3">
                Crashed at {gameState.crashPoint.toFixed(2)}x → 0.00x
              </div>
              <div className="text-yellow-300 text-xl">
                Next round in <span className="text-yellow-100 font-black text-2xl">{gameState.countdown > 0 ? gameState.countdown : '0'}</span>s
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CandlestickChart;
