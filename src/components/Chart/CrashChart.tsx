/**
 * CrashChart - Production Ready
 * Rugs.fun Spec Aligned:
 * - 250ms tick rate (4Hz)
 * - 5 ticks per candle (1.25s)
 * - 60fps render with linear interpolation
 * - Canvas2D rendering
 */

import type React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useBetting } from '../../context/BettingContext';

// ===== CONSTANTS =====
const TICK_MS = 80;                      // ~8ms tick rate (~120Hz) - ultra smooth
const TICKS_PER_CANDLE = 65;           // 375 ticks = 3 second candles at 120Hz
const INTERPOLATION_SPEED = .15;        // Faster interpolation to match 120Hz
const INITIAL_PRICE = 1.0;
const COUNTDOWN_SECONDS = 5;

const COLORS = {
    BACKGROUND: '#15161D',              // Rugs.fun spec
    BULLISH: '#00C853',                 // Material Green
    BEARISH: '#FF1744',                 // Material Red
    GRID: 'rgba(255, 255, 255, 0.07)',
    TEXT: 'rgba(255, 255, 255, 0.6)',
};

// ===== TYPES =====
interface Candle {
    open: number;
    high: number;
    low: number;
    close: number;
    ticks: number;
    // Animated values for smooth rendering
    animatedHigh: number;
    animatedLow: number;
    animatedClose: number;
}

// ===== COMPONENT =====
const CrashChart: React.FC = () => {
    const { setGameState: syncToBetting } = useBetting();

    // Game state
    const [phase, setPhase] = useState<'waiting' | 'running' | 'crashed'>('waiting');
    const [targetPrice, setTargetPrice] = useState(INITIAL_PRICE);  // Actual game price (updates at 4Hz)
    const [displayPrice, setDisplayPrice] = useState(INITIAL_PRICE); // Interpolated display price (60fps)
    const [crashPoint, setCrashPoint] = useState(0);
    const [countdown, setCountdown] = useState(0);
    const [candles, setCandles] = useState<Candle[]>([]);

    // Refs
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const renderLoopRef = useRef<number | null>(null);
    const phaseRef = useRef(phase);
    const targetPriceRef = useRef(targetPrice);
    const candlesRef = useRef(candles);

    // Keep refs in sync
    useEffect(() => { phaseRef.current = phase; }, [phase]);
    useEffect(() => { targetPriceRef.current = targetPrice; }, [targetPrice]);
    useEffect(() => { candlesRef.current = candles; }, [candles]);

    // Generate crash point
    const generateCrashPoint = () => {
        const r = Math.random();
        if (r < 0.3) return 0.5 + Math.random() * 0.49;
        if (r < 0.7) return 1.01 + Math.random() * 1.5;
        if (r < 0.9) return 2.5 + Math.random() * 5;
        return 7.5 + Math.random() * 15;
    };

    // Start game
    const startGame = () => {
        const newCrashPoint = generateCrashPoint();
        console.log(`🎮 Starting game, crash at ${newCrashPoint.toFixed(2)}x`);

        setCrashPoint(newCrashPoint);
        setTargetPrice(INITIAL_PRICE);
        setDisplayPrice(INITIAL_PRICE);
        setPhase('running');
        setCountdown(0);
        setCandles([{
            open: INITIAL_PRICE, high: INITIAL_PRICE, low: INITIAL_PRICE, close: INITIAL_PRICE, ticks: 0,
            animatedHigh: INITIAL_PRICE, animatedLow: INITIAL_PRICE, animatedClose: INITIAL_PRICE
        }]);

        syncToBetting({ isGameActive: true, currentMultiplier: INITIAL_PRICE, crashPoint: newCrashPoint });
    };

    // ===== 60FPS RENDER LOOP WITH LINEAR INTERPOLATION =====
    useEffect(() => {
        let lastTime = performance.now();

        const render = () => {
            const canvas = canvasRef.current;
            if (!canvas) {
                renderLoopRef.current = requestAnimationFrame(render);
                return;
            }

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                renderLoopRef.current = requestAnimationFrame(render);
                return;
            }

            // Linear interpolation toward target price
            setDisplayPrice(prev => {
                const diff = targetPriceRef.current - prev;
                if (Math.abs(diff) < 0.0001) return targetPriceRef.current;
                return prev + diff * INTERPOLATION_SPEED;
            });

            const currentDisplayPrice = displayPrice;
            const currentCandles = candlesRef.current;
            const currentPhase = phaseRef.current;

            // Canvas setup
            const rect = canvas.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            ctx.setTransform(1, 0, 0, 1, 0, 0);

            if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
                canvas.width = rect.width * dpr;
                canvas.height = rect.height * dpr;
            }
            ctx.scale(dpr, dpr);

            const w = rect.width;
            const h = rect.height;
            const pad = 40;
            const padRight = 70;

            // Background
            ctx.fillStyle = COLORS.BACKGROUND;
            ctx.fillRect(0, 0, w, h);

            // Calculate price range
            let minP = currentDisplayPrice * 0.95;
            let maxP = currentDisplayPrice * 1.05;

            if (currentCandles.length > 0) {
                const prices = currentCandles.flatMap(c => [c.high, c.low]).filter(p => p > 0);
                if (prices.length > 0) {
                    minP = Math.min(...prices) * 0.95;
                    maxP = Math.max(...prices, currentDisplayPrice) * 1.05;
                }
            }

            const range = maxP - minP || 0.1;
            const toY = (p: number) => h - pad - ((p - minP) / range) * (h - 2 * pad);

            // Draw grid
            ctx.strokeStyle = COLORS.GRID;
            ctx.lineWidth = 0.5;
            for (let i = 0; i <= 5; i++) {
                const p = minP + (range / 5) * i;
                const y = toY(p);
                ctx.beginPath();
                ctx.moveTo(pad, y);
                ctx.lineTo(w - padRight, y);
                ctx.stroke();

                ctx.fillStyle = COLORS.TEXT;
                ctx.font = '10px monospace';
                ctx.textAlign = 'left';
                ctx.fillText(`${p.toFixed(2)}x`, w - padRight + 5, y + 3);
            }

            // Draw candles
            const candleW = 8;
            const candleGap = 4;
            const chartW = w - pad - padRight;
            const maxCandles = Math.floor(chartW / (candleW + candleGap));
            const visible = currentCandles.slice(-maxCandles);

            visible.forEach((c, i) => {
                const x = pad + i * (candleW + candleGap);
                const openY = toY(c.open);
                // Use ANIMATED values for smooth rendering
                const closeY = toY(c.animatedClose);
                const highY = toY(c.animatedHigh);
                const lowY = toY(c.animatedLow);

                const isGreen = c.animatedClose >= c.open;
                const isCrash = c.close === 0 && c.low === 0;
                const color = isCrash ? COLORS.BEARISH : (isGreen ? COLORS.BULLISH : COLORS.BEARISH);

                // Wick - using animated values
                ctx.strokeStyle = color;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(x + candleW / 2, highY);
                ctx.lineTo(x + candleW / 2, lowY);
                ctx.stroke();

                // Body
                const top = Math.min(openY, closeY);
                const height = Math.max(1, Math.abs(closeY - openY));
                ctx.fillStyle = color;
                ctx.fillRect(x, top, candleW, height);
            });

            // Price line (when running)
            if (currentPhase === 'running') {
                const y = toY(currentDisplayPrice);
                ctx.strokeStyle = 'rgba(255,255,255,0.8)';
                ctx.setLineDash([5, 5]);
                ctx.beginPath();
                ctx.moveTo(pad, y);
                ctx.lineTo(w - padRight, y);
                ctx.stroke();
                ctx.setLineDash([]);

                // Price label
                ctx.fillStyle = '#000';
                ctx.fillRect(w - padRight + 2, y - 10, 48, 20);
                ctx.fillStyle = currentDisplayPrice >= 1 ? COLORS.BULLISH : COLORS.BEARISH;
                ctx.font = 'bold 11px monospace';
                ctx.fillText(`${currentDisplayPrice.toFixed(2)}x`, w - padRight + 5, y + 4);
            }

            renderLoopRef.current = requestAnimationFrame(render);
        };

        renderLoopRef.current = requestAnimationFrame(render);

        return () => {
            if (renderLoopRef.current) cancelAnimationFrame(renderLoopRef.current);
        };
    }, [displayPrice]);

    // ===== GAME TICK (250ms / 4Hz) =====
    useEffect(() => {
        if (phase !== 'running') return;

        const interval = setInterval(() => {
            setTargetPrice(prev => {
                // Lower volatility for 120Hz - smaller per-tick movements
                const volatility = 0.016;                    // Much lower for 120Hz
                const trend = (Math.random() - 0.5) * 0.3;   // Smaller trend
                const spike = Math.random() < 0.02 ? (Math.random() - 0.5) * 0.22 : 0; // Rare small spikes
                const noise = (Math.random() - 0.5) * volatility;
                const momentum = trend * volatility + noise + spike;
                const newPrice = Math.max(0.01, prev + momentum);

                // Check crash
                if ((crashPoint < 1 && newPrice <= crashPoint) || (crashPoint >= 1 && newPrice >= crashPoint)) {
                    console.log(`💥 CRASH at ${newPrice.toFixed(2)}x`);
                    setPhase('crashed');
                    syncToBetting({ isGameActive: false, currentMultiplier: crashPoint, crashPoint });
                    setCandles(prev => [...prev, {
                        open: newPrice, high: newPrice, low: 0, close: 0, ticks: 0,
                        animatedHigh: newPrice, animatedLow: 0, animatedClose: 0
                    }]);
                    setTimeout(() => setCountdown(COUNTDOWN_SECONDS), 2000);
                    return crashPoint;
                }

                // Update candles with animated values
                setCandles(prev => {
                    if (prev.length === 0) return [{
                        open: newPrice, high: newPrice, low: newPrice, close: newPrice, ticks: 1,
                        animatedHigh: newPrice, animatedLow: newPrice, animatedClose: newPrice
                    }];

                    const last = prev[prev.length - 1];
                    const newTicks = last.ticks + 1;

                    // Limit wick length - max extension from body
                    const wickLimit = 0.015;
                    const bodyHigh = Math.max(last.open, newPrice);
                    const bodyLow = Math.min(last.open, newPrice);
                    const maxHigh = bodyHigh + wickLimit;
                    const maxLow = bodyLow - wickLimit;

                    // Calculate actual high/low
                    const actualHigh = Math.min(Math.max(last.high, newPrice), maxHigh);
                    const actualLow = Math.max(Math.min(last.low, newPrice), maxLow);

                    // Smooth interpolation factor for animated values
                    const animSpeed = 0.4;

                    if (newTicks >= TICKS_PER_CANDLE) {
                        const finalized: Candle = {
                            ...last,
                            close: newPrice,
                            high: actualHigh,
                            low: actualLow,
                            ticks: newTicks,
                            // Snap animated to actual on finalize
                            animatedHigh: actualHigh,
                            animatedLow: actualLow,
                            animatedClose: newPrice
                        };
                        const newCandle: Candle = {
                            open: newPrice, high: newPrice, low: newPrice, close: newPrice, ticks: 0,
                            animatedHigh: newPrice, animatedLow: newPrice, animatedClose: newPrice
                        };
                        return [...prev.slice(0, -1), finalized, newCandle].slice(-50);
                    }

                    // Interpolate animated values toward actual values
                    return [...prev.slice(0, -1), {
                        ...last,
                        high: actualHigh,
                        low: actualLow,
                        close: newPrice,
                        ticks: newTicks,
                        // Smooth animation toward target values
                        animatedHigh: last.animatedHigh + (actualHigh - last.animatedHigh) * animSpeed,
                        animatedLow: last.animatedLow + (actualLow - last.animatedLow) * animSpeed,
                        animatedClose: last.animatedClose + (newPrice - last.animatedClose) * animSpeed,
                    }];
                });

                syncToBetting({ isGameActive: true, currentMultiplier: newPrice, crashPoint });
                return newPrice;
            });
        }, TICK_MS);

        return () => clearInterval(interval);
    }, [phase, crashPoint, syncToBetting]);

    // Countdown effect
    useEffect(() => {
        if (countdown <= 0) return;

        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    startGame();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [countdown]);

    // Initial start
    useEffect(() => {
        const timer = setTimeout(startGame, 1000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="relative w-full h-[400px] rounded-lg overflow-hidden" style={{ background: COLORS.BACKGROUND }}>
            {/* Status */}
            <div className={`absolute top-4 right-4 px-3 py-1 rounded-lg z-10 font-bold text-white ${phase === 'running' ? 'bg-green-600' : phase === 'crashed' ? 'bg-red-600' : 'bg-yellow-600'
                }`}>
                {phase === 'running' ? '🚀 Live' : phase === 'crashed' ? 'CRASHED!' : 'Waiting...'}
            </div>

            {/* Multiplier - using interpolated displayPrice for smooth animation */}
            {phase === 'running' && (
                <div className={`absolute top-4 left-4 z-10 text-4xl font-bold ${displayPrice >= 1 ? 'text-green-400' : 'text-red-400'}`}>
                    {displayPrice.toFixed(2)}x
                </div>
            )}

            {/* Canvas */}
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

            {/* Crash overlay */}
            {phase === 'crashed' && (
                <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/50">
                    <div className="text-center">
                        <div className="text-6xl font-bold text-red-500 animate-pulse">CRASHED!</div>
                        <div className="text-2xl text-white mt-2">at {crashPoint.toFixed(2)}x</div>
                        {countdown > 0 && <div className="text-lg text-gray-400 mt-2">Next round in {countdown}s</div>}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CrashChart;
