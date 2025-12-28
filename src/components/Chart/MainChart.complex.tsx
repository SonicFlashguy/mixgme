import type React from 'react';
import { useState, useEffect, useRef } from 'react';

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

const MainChart: React.FC = () => {
  const [gameState, setGameState] = useState<CrashGameState>({
    isActive: false,
    isPreparing: false,
    multiplier: 1.00,
    hasCrashed: false,
    crashPoint: 0,
    timeElapsed: 0,
    countdown: 0
  });

  const [currentPrice, setCurrentPrice] = useState<number>(1.0);
  const [chartData, setChartData] = useState<CandleData[]>([]);
  const [hasError, setHasError] = useState<boolean>(false);
  
  const gameIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const candleIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentPriceRef = useRef<number>(1.0);

  // Error boundary-like functionality
  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('MainChart Error:', error);
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // Generate crash point for the game
  const generateCrashPoint = (): number => {
    try {
      const rand = Math.random();
      let crashPoint: number;
      
      if (rand < 0.4) {
        crashPoint = 0.1 + Math.random() * 1.4;
      } else if (rand < 0.7) {
        crashPoint = 1.5 + Math.random() * 1.5;
      } else if (rand < 0.9) {
        crashPoint = 3 + Math.random() * 7;
      } else {
        crashPoint = 10 + Math.random() * 90;
      }
      
      console.log(`🎯 New game starting with crash point: ${crashPoint.toFixed(3)}`);
      return crashPoint;
    } catch (error) {
      console.error('Error generating crash point:', error);
      return 2.0; // Fallback
    }
  };

  const startNewGame = () => {
    try {
      console.log('🎮 Starting new game...');
      
      // Clear existing intervals
      if (gameIntervalRef.current) {
        clearInterval(gameIntervalRef.current);
      }
      if (candleIntervalRef.current) {
        clearInterval(candleIntervalRef.current);
      }

      // Generate new crash point
      const newCrashPoint = generateCrashPoint();
      
      // Reset price tracking
      const initialPrice = 1.0;
      setCurrentPrice(initialPrice);
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

      // Start price simulation with crash detection
      const startTime = Date.now();
      const crashPointToCheck = newCrashPoint;

      gameIntervalRef.current = setInterval(() => {
        try {
          setCurrentPrice(prev => {
            const elapsed = (Date.now() - startTime) / 1000;
            const step = 0.005 + (Math.random() * 0.01);
            const volatility = 0.02 * (Math.random() - 0.5);
            
            const newPrice = prev + step + volatility;
            currentPriceRef.current = newPrice;
            
            return Math.max(0.01, newPrice);
          });

          // Check crash condition using ref for current price
          const currentMultiplier = currentPriceRef.current;
          
          // Debug logging (less frequent to avoid spam)
          if (Math.random() < 0.1) {
            console.log(`💹 Current: ${currentMultiplier.toFixed(3)}, Target: ${crashPointToCheck.toFixed(3)}`);
          }
          
          // Check if we should crash
          if (currentMultiplier >= crashPointToCheck) {
            console.log(`💥 CRASH TRIGGERED! Current: ${currentMultiplier.toFixed(3)} Target: ${crashPointToCheck.toFixed(3)}`);
            
            // Clear the game interval
            if (gameIntervalRef.current) {
              clearInterval(gameIntervalRef.current);
              gameIntervalRef.current = null;
            }

            // Update game state to crashed
            setGameState(prev => ({
              ...prev,
              isActive: false,
              hasCrashed: true,
              multiplier: crashPointToCheck,
              crashPoint: crashPointToCheck
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
        } catch (error) {
          console.error('Error in game interval:', error);
          if (gameIntervalRef.current) {
            clearInterval(gameIntervalRef.current);
          }
        }
      }, 100);

      // Start candle generation
      candleIntervalRef.current = setInterval(() => {
        try {
          const now = Date.now();
          const currentMultiplier = currentPriceRef.current;
          
          setChartData(prev => {
            const newCandle: CandleData = {
              open: currentMultiplier,
              high: currentMultiplier + (Math.random() * 0.05),
              low: Math.max(0.01, currentMultiplier - (Math.random() * 0.05)),
              close: currentMultiplier,
              timestamp: now
            };
            
            const updated = [...prev, newCandle];
            return updated.slice(-50); // Keep last 50 candles
          });
        } catch (error) {
          console.error('Error in candle generation:', error);
        }
      }, 1000);

    } catch (error) {
      console.error('Error starting new game:', error);
      setHasError(true);
    }
  };

  // Auto-start first game
  useEffect(() => {
    try {
      const timer = setTimeout(() => {
        startNewGame();
      }, 1000);

      return () => {
        clearTimeout(timer);
        if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
        if (candleIntervalRef.current) clearInterval(candleIntervalRef.current);
      };
    } catch (error) {
      console.error('Error in useEffect:', error);
      setHasError(true);
    }
  }, []);

  // Canvas drawing effect
  useEffect(() => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      const width = rect.width;
      const height = rect.height;
      const padding = 20;

      // Clear canvas
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, width, height);

      // Draw grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      
      for (let i = 0; i <= 10; i++) {
        const y = padding + (i * (height - 2 * padding)) / 10;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
      }

      if (chartData.length === 0) return;

      // Calculate visible candles
      const maxCandles = Math.floor((width - 2 * padding) / 8);
      const visibleCandles = chartData.slice(-maxCandles);

      // Calculate price range
      const allPrices = visibleCandles.flatMap(c => [c.high, c.low]);
      if (currentPrice) allPrices.push(currentPrice);
      
      if (allPrices.length === 0) return;

      const minPrice = Math.min(...allPrices) * 0.95;
      const maxPrice = Math.max(...allPrices) * 1.05;
      const priceRange = maxPrice - minPrice;

      if (priceRange === 0) return;

      const normalizeY = (price: number) => {
        return height - padding - ((price - minPrice) / priceRange) * (height - 2 * padding);
      };

      // Draw candles
      const candleWidth = Math.max(4, (width - 2 * padding) / maxCandles - 2);
      
      visibleCandles.forEach((candle, index) => {
        const x = padding + (index * (width - 2 * padding)) / maxCandles;
        const openY = normalizeY(candle.open);
        const closeY = normalizeY(candle.close);
        const highY = normalizeY(candle.high);
        const lowY = normalizeY(candle.low);

        const bodyTop = Math.min(openY, closeY);
        const bodyHeight = Math.abs(closeY - openY);

        // Determine candle color
        const isGreen = candle.close > candle.open;
        const candleColor = isGreen ? '#22c55e' : '#ef4444';

        // Draw wick
        ctx.strokeStyle = candleColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + candleWidth / 2, highY);
        ctx.lineTo(x + candleWidth / 2, lowY);
        ctx.stroke();

        // Draw body
        ctx.fillStyle = candleColor;
        ctx.fillRect(x, bodyTop, candleWidth, bodyHeight);
      });

      // Draw current multiplier line
      if (gameState.isActive && !gameState.hasCrashed && currentPrice) {
        const currentY = normalizeY(currentPrice);
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(padding, currentY);
        ctx.lineTo(width - padding, currentY);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Draw multiplier text
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'left';
        const multiplierText = `${currentPrice.toFixed(2)}x`;
        ctx.fillText(multiplierText, width - 80, currentY - 5);
      }

    } catch (error) {
      console.error('Error drawing canvas:', error);
    }
  }, [chartData, gameState, currentPrice]);

  const getStatusMessage = () => {
    if (gameState.isPreparing) return "Preparing launch...";
    if (gameState.isActive) return "🚀 Flying!";
    if (gameState.hasCrashed) return "💥 Crashed!";
    return "Ready";
  };

  if (hasError) {
    return (
      <div className="chart-container border border-red-500 rounded-lg overflow-hidden relative p-4 h-[325px] bg-red-900">
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
    <div className="chart-container border border-border-light rounded-lg overflow-hidden relative p-4 h-[325px]">
      <div className="absolute left-0 top-0 w-full h-full opacity-10 gradient-chart" />

      <div className={`absolute top-4 left-4 px-3 py-1 rounded-lg shadow-lg z-10 font-bold ${
        gameState.isActive ? 'bg-green-600' : gameState.hasCrashed ? 'bg-red-600' : 'bg-yellow-600'
      } text-white`}>
        {getStatusMessage()}
      </div>

      <canvas
        ref={canvasRef}
        className="absolute inset-4 z-10"
        style={{ width: 'calc(100% - 2rem)', height: 'calc(100% - 2rem)' }}
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

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[#be191c] font-bold text-5xl opacity-5 z-0">
        RUGS.FUN
      </div>
    </div>
  );
};

export default MainChart;
