# CryptoCash 2.0 - Professional Candlestick Chart

A React/TypeScript application featuring a professional-grade candlestick chart that simulates cryptocurrency trading experiences. This application includes a modern trading interface with real-time price updates and dynamic candlestick rendering.



## Features

- **Professional Candlestick Chart**: OHLC (Open, High, Low, Close) data visualization
- **Real-time Price Updates**: Smooth 60fps animations for fluid price movements
- **Dynamic Market Simulation**: Realistic price action with volatility and trends
- **Crash Game Mechanics**: Price multiplier with random crash points and dramatic zero-drop red candle
- **Clear Value Display**: Current candle value shown prominently with animated label directly next to the active candle
- **Accurate Multiplier Display**: Multiplier values always correctly reflect current candle position
- **Automatic Chart Reset**: Chart automatically resets with smooth fade-out transition and countdown timer after each crash
- **Responsive Design**: Works on various screen sizes

## Quick Links

- [Comprehensive Documentation](#candlestick-chart-implementation-guide): Complete chart implementation details
- [Chart Components Catalog](#chart-components-and-functions): Catalog of all chart functions
- [Implementation Guide](./CHART_IMPLEMENTATION.md): Step-by-step implementation instructions
- [Source Code](/src/components/Chart/CandlestickChart.tsx): Complete chart component code

# Candlestick Chart Implementation Guide

This document provides a comprehensive catalog of the chart functions and code elements that make the professional candlestick chart work in CryptoCash 2.0.

## Table of Contents

1. [Chart Components and Functions](#chart-components-and-functions)
2. [Core Interfaces](#core-interfaces)
3. [Chart State Management](#chart-state-management)
4. [Price Generation and Animation](#price-generation-and-animation)
5. [Canvas Rendering System](#canvas-rendering-system)
6. [Implementation Guide](#implementation-guide)
7. [Complete Source Code](#complete-source-code)

## Chart Components and Functions

| Function | Description |
|----------|-------------|
| `CandlestickChart` | Main React component that manages the chart state and rendering |
| `generateCrashPoint` | Creates realistic crash points based on statistical distribution |
| `generatePriceMovement` | Generates realistic price movements with trends and volatility |
| `startSmoothInterpolation` | Implements 60fps smooth animation for price movements |
| `startNewGame` | Initializes a new game session with candlestick generation and resets chart data |
| `drawEmptyChartGrid` | Renders empty chart with grid when no data is available |
| `drawChartGrid` | Creates the grid system with price labels for the chart |
| `drawCandle` | Renders a single candlestick with body and wicks |
| `drawCurrentPriceLine` | Shows the current price line with labels |
| `drawCrashPoint` | Visualizes the crash point with indicator |
| `handleChartReset` | Manages the visual transition between games with fade-out effect and countdown |

## Core Interfaces

```typescript
// Data structure for candlestick OHLC data
interface CandleData {
  open: number;   // Opening price of the candle
  high: number;   // Highest price during candle period
  low: number;    // Lowest price during candle period
  close: number;  // Closing price of the candle
  timestamp: number; // Timestamp when candle was created
}

// Game state management interface
interface CrashGameState {
  isActive: boolean;    // Whether game is running
  isPreparing: boolean; // Preparation phase before game
  multiplier: number;   // Current price multiplier
  hasCrashed: boolean;  // Whether the game has crashed
  crashPoint: number;   // Target crash point value
  timeElapsed: number;  // Time elapsed in current game
  countdown: number;    // Countdown to next game
}
```

# Chart State Management

The chart component manages several important state variables that control the behavior and appearance:

1. **Game State:** Tracks the current status of the chart game
   ```typescript
   const [gameState, setGameState] = useState<CrashGameState>({
     isActive: false,
     isPreparing: false,
     multiplier: 1.00,
     hasCrashed: false,
     crashPoint: 0,
     timeElapsed: 0,
     countdown: 0
   });
   ```

2. **Chart Data:** Stores all candlestick information
   ```typescript
   const [chartData, setChartData] = useState<CandleData[]>([]);
   ```

3. **Price Animation:** Manages smooth price transitions
   ```typescript
   const [currentPrice, setCurrentPrice] = useState<number>(1.0);
   const [targetPrice, setTargetPrice] = useState<number>(1.0);
   ```

## Price Generation and Animation

The chart uses sophisticated algorithms to create realistic price movements:

1. **Crash Point Generation:** Creates statistically distributed crash points
   ```typescript
   const generateCrashPoint = (): number => {
     const random = Math.random();
     // 30% chance to crash below 1x (losses)
     if (random < 0.3) {
       // Distribution logic for losses
     }
     // 70% chance to go above 1x (profits)
     // Distribution logic for profits
   };
   ```

2. **Price Movement:** Simulates realistic price action with trends and volatility
   ```typescript
   const generatePriceMovement = (currentPrice: number, volatility: number = 0.08): number => {
     const trend = (Math.random() - 0.5) * 3;
     const spike = Math.random() < 0.15 ? (Math.random() - 0.5) * 0.2 : 0;
     const noise = (Math.random() - 0.5) * volatility * 1.5;
     const momentum = trend * volatility * 0.8 + noise + spike;
     return Math.max(0.01, currentPrice + momentum);
   };
   ```

3. **Smooth Animation:** Provides fluid 60fps price transitions
   ```typescript
   // Update smoothly at 60fps
   smoothIntervalRef.current = setInterval(() => {
     const interpolationSpeed = 0.05;
     setCurrentPrice(prev => {
       const difference = targetPrice - prev;
       const step = difference * interpolationSpeed;
       // Animation logic
     });
   }, 16); // ~60fps
   ```

## Canvas Rendering System

The chart uses HTML5 Canvas for high-performance rendering:

1. **Canvas Setup:** Initializes the drawing surface with proper DPI handling
   ```typescript
   const canvas = canvasRef.current;
   const ctx = canvas.getContext('2d');
   canvas.width = rect.width * window.devicePixelRatio;
   canvas.height = rect.height * window.devicePixelRatio;
   ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
   ```

2. **Candlestick Rendering:** Draws professional OHLC candlesticks with proper styling
   ```typescript
   // Draw candle body
   ctx.fillStyle = bodyFillColor;
   ctx.fillRect(x, bodyTop, candleWidth, bodyHeight);
   
   // Draw wicks
   ctx.strokeStyle = wickColor;
   ctx.beginPath();
   ctx.moveTo(centerX, highY);
   ctx.lineTo(centerX, bodyTop);
   ctx.stroke();
   ```

3. **Price Line Visualization:** Shows current price with dashed line and labels
   ```typescript
   ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
   ctx.setLineDash([5, 5]);
   ctx.beginPath();
   ctx.moveTo(padding, currentY);
   ctx.lineTo(width - padding, currentY);
   ctx.stroke();
   ```

## Implementation Guide

To implement this chart in your application:

1. Create the CandlestickChart component file
2. Import and add the component to your layout
3. Style the container appropriately (the chart adapts to container size)

```typescript
import CandlestickChart from '../components/Chart/CandlestickChart';

// In your layout component:
<div className="chart-container">
  <CandlestickChart />
</div>
```

For detailed implementation instructions, see the separate [CHART_IMPLEMENTATION.md](./CHART_IMPLEMENTATION.md) file.

## Complete Source Code

The full source code for the candlestick chart implementation is available in:
- `/src/components/Chart/CandlestickChart.tsx`

The chart is used in the main layout at:
- `/src/components/Layout/MainLayout.tsx`
```
