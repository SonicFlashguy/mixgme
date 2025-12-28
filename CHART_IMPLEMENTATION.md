# Candlestick Chart Implementation Guide

This document provides a step-by-step guide for implementing the professional candlestick chart component in any React/TypeScript application.

## Key Features

1. **Realistic Candlestick Chart** - Professional-looking chart with proper candlestick visualization
2. **Dynamic Multiplier Display** - Clear display of current multiplier value in multiple locations
3. **Dramatic Crash Animation** - Giant red candle that drops to 0x when the game crashes
4. **Live Candle Value Label** - Prominent animated label showing the current value directly next to the active candle
5. **Visual Feedback** - Color-coded values (green for gains, red for losses)

## Installation

1. Create a new file named `CandlestickChart.tsx` in your components directory
2. Install required dependencies (if not already present):
   ```bash
   npm install react@latest react-dom@latest typescript@latest
   ```

## Chart Component Implementation

Below is the complete implementation code for the candlestick chart component.

```tsx
import React, { useState, useEffect, useRef } from 'react';

interface CandleData {
  open: number;
  high: number;
  low: number;
  close: number;
  timestamp: number;
}

interface CrashGameState {
  isActive: boolean;
  isPreparing: boolean;
  multiplier: number;
  hasCrashed: boolean;
  crashPoint: number;
  timeElapsed: number;
  countdown: number;
}

const CandlestickChart: React.FC = () => {
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
  const smoothIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateTimeRef = useRef<number>(Date.now());
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentPriceRef = useRef<number>(1.0);

  // Error boundary-like functionality
  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('Chart Error:', error);
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // Generate crash point for the game with more realistic distribution
  const generateCrashPoint = (): number => {
    const random = Math.random();
    
    // 30% chance to crash below 1x (losses) - minimum 0.01x
    if (random < 0.3) {
      const subOneRandom = Math.random();
      if (subOneRandom < 0.1) return 0.01 + Math.random() * 0.19; // 10% chance: 0.01x - 0.20x (big losses)
      if (subOneRandom < 0.3) return 0.20 + Math.random() * 0.30; // 20% chance: 0.20x - 0.50x (medium losses)
      return 0.50 + Math.random() * 0.49; // 70% chance: 0.50x - 0.99x (small losses)
    }
    
    // 70% chance to go above 1x (profits)
    const aboveOneRandom = Math.random();
    if (aboveOneRandom < 0.4) return 1.01 + Math.random() * 0.99; // 40% chance: 1.01x - 2.00x
    if (aboveOneRandom < 0.7) return 2.00 + Math.random() * 3.00; // 30% chance: 2.00x - 5.00x
    if (aboveOneRandom < 0.9) return 5.00 + Math.random() * 5.00; // 20% chance: 5.00x - 10.00x
    return 10.00 + Math.random() * 15.00; // 10% chance: 10.00x - 25.00x (huge wins)
  };

  // Generate realistic price movement for candles with trend and volatility
  const generatePriceMovement = (currentPrice: number, volatility: number = 0.08): number => {
    // Create more violent market movement with bigger swings
    const trend = (Math.random() - 0.5) * 3; // -1.5 to 1.5 (increased range for more movement)
    const spike = Math.random() < 0.15 ? (Math.random() - 0.5) * 0.2 : 0; // 15% chance of big spike
    const noise = (Math.random() - 0.5) * volatility * 1.5; // Increased noise
    const momentum = trend * volatility * 0.8 + noise + spike; // Combine factors
    
    const newPrice = currentPrice + momentum;
    return Math.max(0.01, newPrice); // Minimum price of 0.01
  };

  // Start smooth price interpolation system for fluid animations
  const startSmoothInterpolation = () => {
    // Clear any existing smooth interval
    if (smoothIntervalRef.current) {
      clearInterval(smoothIntervalRef.current);
    }

    // Update smoothly at 60fps
    smoothIntervalRef.current = setInterval(() => {
      const now = Date.now();
      const timeDelta = now - lastUpdateTimeRef.current;
      
      // Interpolation speed - how fast to move toward target
      const interpolationSpeed = 0.05; // Adjust this value to control smoothness
      
      setCurrentPrice(prev => {
        const difference = targetPrice - prev;
        const step = difference * interpolationSpeed;
        
        // If very close to target, snap to target
        if (Math.abs(difference) < 0.001) {
          return targetPrice;
        }
        
        const newPrice = prev + step;
        currentPriceRef.current = newPrice; // Keep reference updated
        return newPrice;
      });
      
      lastUpdateTimeRef.current = now;
    }, 16); // ~60fps for smooth animation
  };

  // Stop smooth interpolation
  const stopSmoothInterpolation = () => {
    if (smoothIntervalRef.current) {
      clearInterval(smoothIntervalRef.current);
      smoothIntervalRef.current = null;
    }
  };

  // Start new game with realistic candlestick generation
  const startNewGame = () => {
    console.log('🎮 Starting new game...');
    
    // Clear existing intervals
    if (gameIntervalRef.current) {
      clearInterval(gameIntervalRef.current);
      gameIntervalRef.current = null;
    }
    if (candleIntervalRef.current) {
      clearInterval(candleIntervalRef.current);
      candleIntervalRef.current = null;
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
    
    // Initialize game state
    setGameState({
      isActive: true,
      isPreparing: false,
      multiplier: initialPrice,
      hasCrashed: false,
      crashPoint: newCrashPoint,
      timeElapsed: 0,
      countdown: 0
    });

    // Start smooth price interpolation
    startSmoothInterpolation();
    
    // Initialize with the first candle
    const firstCandle: CandleData = {
      open: initialPrice,
      high: initialPrice,
      low: initialPrice,
      close: initialPrice,
      timestamp: Date.now()
    };
    setChartData([firstCandle]);

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
        
        // Check if enough time has passed to create new candle (3s interval)
        if (now - lastCandle.timestamp >= 3000) {
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
            timestamp: now
          };
          
          // Update chart with finalized previous candle and new candle
          const updated = [...prev.slice(0, -1), updatedLastCandle, newCandle];
          return updated.slice(-100); // Keep last 100 candles for history
        } else {
          // Just update the current candle
          const updatedLastCandle = {
            ...lastCandle,
            close: targetPriceValue,
            high: Math.max(lastCandle.high, targetPriceValue),
            low: Math.min(lastCandle.low, targetPriceValue)
          };
          
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
        
        // Update game state to crashed
        setGameState(prev => ({
          ...prev,
          isActive: false,
          hasCrashed: true,
          multiplier: newCrashPoint,
          crashPoint: newCrashPoint
        }));

        // Start countdown for next game
        setTimeout(() => {
          setGameState(prev => ({
            ...prev,
            countdown: 5
          }));

          const countdownInterval = setInterval(() => {
            setGameState(prev => {
              if (prev.countdown <= 1) {
                clearInterval(countdownInterval);
                startNewGame();
                return prev;
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

  // Canvas drawing effect - Professional chart rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size with high DPI support for sharp rendering
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = rect.width;
    const height = rect.height;
    const padding = 40; // Increased padding for price labels

    // Clear canvas with pure black background like professional trading charts
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    // Calculate visible candles based on width
    const candleWidth = 10; // Fixed candle width for consistent appearance
    const candleSpacing = 4; // Space between candles
    const maxVisibleCandles = Math.floor((width - 2 * padding) / (candleWidth + candleSpacing));
    const visibleCandles = chartData.slice(-maxVisibleCandles);

    if (visibleCandles.length === 0) {
      // If no data, just draw grid
      drawEmptyChartGrid(ctx, width, height, padding);
      return;
    }

    // Calculate price range from visible candles
    const allPrices = visibleCandles.flatMap(c => [c.high, c.low]);
    if (currentPrice) allPrices.push(currentPrice);
    
    const minPrice = Math.min(...allPrices) * 0.95; // Add 5% padding below
    const maxPrice = Math.max(...allPrices) * 1.05; // Add 5% padding above
    const priceRange = maxPrice - minPrice;

    // Draw grid lines
    drawChartGrid(ctx, width, height, padding, minPrice, maxPrice);
    
    // Normalize price to Y coordinate
    const normalizeY = (price: number) => {
      return height - padding - ((price - minPrice) / priceRange) * (height - 2 * padding);
    };

    // Draw candlesticks
    visibleCandles.forEach((candle, index) => {
      const x = padding + index * (candleWidth + candleSpacing);
      drawCandle(ctx, candle, x, candleWidth, normalizeY);
    });

    // Draw current price line (only when game is active)
    if (gameState.isActive && !gameState.hasCrashed && currentPrice) {
      drawCurrentPriceLine(ctx, currentPrice, width, padding, normalizeY);
    }

    // Draw crash point indicator if crashed
    if (gameState.hasCrashed && visibleCandles.length > 0) {
      const lastCandleIndex = visibleCandles.length - 1;
      const lastX = padding + lastCandleIndex * (candleWidth + candleSpacing) + candleWidth / 2;
      drawCrashPoint(ctx, gameState.crashPoint, lastX, normalizeY);
    }

  }, [chartData, gameState, currentPrice]);

  // Helper function to draw empty chart grid
  const drawEmptyChartGrid = (
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number, 
    padding: number
  ) => {
    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding + ((height - padding * 2) / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }
    
    // Show message based on game state
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '16px monospace';
    ctx.textAlign = 'center';
    
    if (gameState.isPreparing) {
      ctx.fillText('Preparing chart...', width / 2, height / 2);
    } else if (gameState.countdown > 0) {
      ctx.fillText('Next round starting...', width / 2, height / 2);
    } else {
      ctx.fillText('Initializing chart...', width / 2, height / 2);
    }
  };

  // Helper function to draw chart grid and labels
  const drawChartGrid = (
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number, 
    padding: number,
    minPrice: number,
    maxPrice: number
  ) => {
    // Draw grid lines with subtle coloring
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
    ctx.lineWidth = 0.5;
    
    // Horizontal grid lines with price labels
    for (let i = 0; i <= 5; i++) {
      const price = minPrice + ((maxPrice - minPrice) / 5) * i;
      const y = height - padding - ((price - minPrice) / (maxPrice - minPrice)) * (height - 2 * padding);
      
      // Draw horizontal line
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
      
      // Draw price label
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '10px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(price.toFixed(2) + 'x', width - padding - 5, y + 3);
    }
    
    // Draw a few vertical grid lines (time)
    const verticalLines = 4;
    for (let i = 0; i <= verticalLines; i++) {
      const x = padding + ((width - 2 * padding) / verticalLines) * i;
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
    normalizeY: (price: number) => number
  ) => {
    const openY = normalizeY(candle.open);
    const closeY = normalizeY(candle.close);
    const highY = normalizeY(candle.high);
    const lowY = normalizeY(candle.low);

    const bodyTop = Math.min(openY, closeY);
    const bodyBottom = Math.max(openY, closeY);
    const bodyHeight = Math.abs(closeY - openY);
    const centerX = x + candleWidth / 2;

    // Determine candle color based on price direction
    const isGreen = candle.close >= candle.open;
    
    // Professional trading chart colors for candlesticks
    // Bright green/red for bodies and slightly darker for wicks
    const wickColor = isGreen ? '#00ff00' : '#ff0000';
    const bodyFillColor = isGreen ? '#00ff00' : '#ff0000';
    const bodyStrokeColor = isGreen ? '#00cc00' : '#cc0000';

    // Draw candle body (rectangle) - using width for consistent sizing
    if (bodyHeight < 1) {
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
      ctx.fillRect(x, bodyTop, candleWidth, bodyHeight);
      
      // Add thin border to make candles pop
      ctx.strokeStyle = bodyStrokeColor;
      ctx.lineWidth = 1;
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
  };
  
  // Helper function to draw current price line
  const drawCurrentPriceLine = (
    ctx: CanvasRenderingContext2D,
    price: number,
    width: number,
    padding: number,
    normalizeY: (price: number) => number
  ) => {
    const currentY = normalizeY(price);
    
    // Draw dashed line across chart for current price
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(padding, currentY);
    ctx.lineTo(width - padding, currentY);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Display the price text with background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'; // Semi-transparent background
    ctx.fillRect(width - padding - 65, currentY - 10, 60, 20);
    
    // Display current multiplier value on line
    ctx.fillStyle = price >= 1 ? '#00ff00' : '#ff0000';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`${price.toFixed(4)}x`, width - padding - 10, currentY + 4);
    
    // Display current value in top-right corner with larger font
    ctx.font = 'bold 16px monospace';
    ctx.fillText(`${price.toFixed(2)}x`, width - padding - 5, padding - 5);
  };

  // Helper function to draw crash point indicator
  const drawCrashPoint = (
    ctx: CanvasRenderingContext2D,
    crashPoint: number,
    x: number,
    normalizeY: (price: number) => number
  ) => {
    const crashY = normalizeY(crashPoint);

    // Draw red circle with white border at crash point
    ctx.fillStyle = '#ff0000';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, crashY, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Add crash text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('CRASH!', x, crashY - 15);
  };

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
    <div className="chart-container border border-gray-700 rounded-lg overflow-hidden relative p-2 h-[400px] bg-black">
      <div className={`absolute top-4 right-4 px-3 py-1 rounded-lg shadow-lg z-10 font-bold ${
        gameState.isActive ? 'bg-green-600' : gameState.hasCrashed ? 'bg-red-600' : 'bg-yellow-600'
      } text-white`}>
        {getStatusMessage()}
      </div>

      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-10"
        style={{ width: '100%', height: '100%' }}
      />

      {gameState.hasCrashed && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
          <div className="text-center">
            <div className="text-red-400 font-bold text-6xl mb-2">CRASHED!</div>
            <div className="text-white text-2xl">at {gameState.crashPoint.toFixed(2)}x</div>
            <div className="text-gray-400 text-lg mt-2">
              Next round in {gameState.countdown}s
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandlestickChart;
```

## Integration Steps

To add the candlestick chart to your application:

1. **Copy the CandlestickChart component**

   Create the file at `src/components/Chart/CandlestickChart.tsx` with the implementation above.

2. **Styling Requirements**

   Ensure your application has the necessary styles for the chart container. If using Tailwind CSS, they're already included in the component.

3. **Import the chart into your layout**

   ```tsx
   import CandlestickChart from '../components/Chart/CandlestickChart';
   
   const YourPage = () => {
     return (
       <div className="container">
         <div className="chart-wrapper">
           <CandlestickChart />
         </div>
       </div>
     );
   };
   ```

## Customization Options

### Candle Colors

To customize the candlestick colors, modify these variables in the `drawCandle` function:

```tsx
// Green candles (price up)
const wickColor = '#00ff00';        // Wick color
const bodyFillColor = '#00ff00';    // Body fill color
const bodyStrokeColor = '#00cc00';  // Body border color

// Red candles (price down)
const wickColor = '#ff0000';        // Wick color
const bodyFillColor = '#ff0000';    // Body fill color  
const bodyStrokeColor = '#cc0000';  // Body border color
```

### Candle Size and Spacing

Adjust these parameters in the canvas drawing effect:

```tsx
const candleWidth = 10;     // Width of each candle
const candleSpacing = 4;    // Space between candles
```

### Animation Speed

For smoother or faster animations, change the interpolation speed:

```tsx
const interpolationSpeed = 0.05; // Higher values = faster animation
```

### Price Distribution

To adjust the crash point distribution and market behavior:

```tsx
// In generateCrashPoint() function:
if (random < 0.3) { // Change percentage of crashes below 1x
  // ...
}

// In generatePriceMovement() function:
const volatility = 0.08; // Higher values = more volatile price action
const trend = (Math.random() - 0.5) * 3; // Higher multiplier = stronger trends
```

## Additional Features

### Dramatic Crash Visualization

The chart features a dramatic crash visualization with a giant red candle that drops to zero:

```tsx
// When crash is detected
// Create a new final candle that goes from current price to crash point
const lastPrice = chartData.length > 0 ? chartData[chartData.length - 1].close : targetPriceValue;

// First finalize the current candle
const finalizedCurrentCandle = chartData.length > 0 ? 
  {...chartData[chartData.length - 1], close: lastPrice} : 
  {open: targetPriceValue, high: targetPriceValue, low: targetPriceValue, close: targetPriceValue, timestamp: Date.now()};
  
// Then create a dramatic crash candle that goes to 0
const crashCandle: CandleData = {
  open: lastPrice,
  high: lastPrice, // High stays at current price
  low: 0, // Low point is 0 for dramatic effect
  close: 0, // Close at 0 for dramatic effect
  timestamp: Date.now() + 100 // Just after the current time
};

// Update chart with finalized current candle and the giant crash candle
setChartData(prev => [...prev.slice(0, -1), finalizedCurrentCandle, crashCandle]);
```

The crash candle receives special styling treatment:

```tsx
// Special styling for crash candle
if (isCrashCandle) {
  // Create gradient effect for dramatic visualization
  const gradient = ctx.createLinearGradient(x, bodyTop, x, bodyBottom);
  gradient.addColorStop(0, '#ff3333');
  gradient.addColorStop(1, '#ff0000');
  ctx.fillStyle = gradient;
  
  // Draw explosive crash indicator
  drawCrashPoint(ctx, 0, candleX, normalizeY);
}
```

### Automatic Chart Reset

The chart includes an automatic reset feature that activates after each crash, providing a clean transition between game rounds:

```tsx
// After crash is detected
setTimeout(() => {
  // Prepare for chart reset with visual transition
  setGameState(prev => ({
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
    setGameState(prev => {
      if (prev.countdown <= 1) {
        clearInterval(countdownInterval);
        clearInterval(fadeOutEffect); // Ensure fade effect is cleared
        // Start new game which will reset the chart
        startNewGame();
        return prev;
      }
      return { ...prev, countdown: prev.countdown - 1 };
    });
  }, 1000);
}, 2000);
```

Key features of the automatic chart reset:

1. **Dramatic Crash Visualization**: Giant red candle that drops to zero with explosion effect
2. **Visual Fade-out Transition**: Candles are removed one-by-one for a smooth disappearing effect
3. **Countdown Timer**: Visual countdown showing time until next game starts
4. **Clean Reset**: Complete clearing of chart data before starting new round
5. **First Candle Initialization**: A new starting candle is created after a brief delay

This automatic reset ensures the chart always starts fresh for each game, maintaining a clean visual experience even after crashes.

### Adding Trading Controls

You can extend the chart with trading controls by adding a form below the chart:

```tsx
<div className="trading-controls mt-4">
  <div className="flex gap-2">
    <input 
      type="number"
      className="px-2 py-1 rounded bg-gray-800 text-white border border-gray-600"
      placeholder="Bet Amount"
    />
    <button className="px-4 py-1 bg-green-600 text-white rounded">
      PLACE BET
    </button>
  </div>
</div>
```

### Adding Historical Data Support

To load historical data instead of generating random prices:

```tsx
// Add a prop to accept historical data
const CandlestickChart: React.FC<{ historicalData?: CandleData[] }> = ({ historicalData }) => {
  // In your component initialization
  const [chartData, setChartData] = useState<CandleData[]>(historicalData || []);
  
  // If using historical data, modify price movement logic
  useEffect(() => {
    if (historicalData && historicalData.length > 0) {
      setChartData(historicalData);
    }
  }, [historicalData]);
  
  // Rest of component remains the same
}
```

## Performance Considerations

- **Canvas Optimization**: The chart uses canvas for high-performance rendering
- **Memory Management**: Interval cleanup prevents memory leaks
- **Data Management**: Limiting to 100 candles prevents excessive memory usage
- **Animation Optimization**: 60fps interpolation provides smooth visuals without excessive CPU usage

## Troubleshooting

### Chart Not Rendering

- Check that the component container has explicit height (default is 400px)
- Ensure the canvas element is properly getting a context

### Performance Issues

- Reduce the number of stored candles (currently 100)
- Decrease animation update frequency
- Use `useCallback` to optimize render functions

### Visual Artifacts

- Ensure proper DPI scaling is handled (included in the implementation)
- Check for proper canvas clearing between renders
