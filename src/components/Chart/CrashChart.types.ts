/**
 * CrashChart Type Definitions
 * Simple, focused types for the crash game chart
 */

// ===== CANDLE DATA =====
export interface CandleData {
    open: number;
    high: number;
    low: number;
    close: number;
    time: number;            // Timestamp when candle was created
    tickCount: number;       // Number of ticks aggregated into this candle
}

// ===== GAME STATE =====
export type GamePhase = 'waiting' | 'running' | 'crashed';

export interface GameState {
    phase: GamePhase;
    multiplier: number;      // Current game multiplier (actual value)
    crashPoint: number;      // The hidden crash point for this round
    countdown: number;       // Countdown seconds until next round
    tickNumber: number;      // Current tick number in this round
    roundNumber: number;     // Track round for debugging
}

// ===== RENDER STATE =====
export interface RenderState {
    currentPrice: number;    // Interpolated display price (smooth)
    targetPrice: number;     // Actual game price (stepped)
    lastRenderTime: number;  // Performance tracking
    fps: number;             // Current FPS for monitoring
}

// ===== CONTEXT SYNC =====
// What we send to BettingContext
export interface ChartToContextSync {
    isGameActive: boolean;
    currentMultiplier: number;
    crashPoint: number;
}

// ===== CHART DIMENSIONS =====
export interface ChartDimensions {
    width: number;
    height: number;
    paddingLeft: number;
    paddingRight: number;
    paddingTop: number;
    paddingBottom: number;
    chartWidth: number;      // Drawable chart area width
    chartHeight: number;     // Drawable chart area height
}

// ===== PRICE RANGE =====
export interface PriceRange {
    min: number;
    max: number;
    range: number;
}

// ===== INITIAL STATES =====
export const INITIAL_GAME_STATE: GameState = {
    phase: 'waiting',
    multiplier: 1.0,
    crashPoint: 0,
    countdown: 0,
    tickNumber: 0,
    roundNumber: 0,
};

export const INITIAL_RENDER_STATE: RenderState = {
    currentPrice: 1.0,
    targetPrice: 1.0,
    lastRenderTime: 0,
    fps: 60,
};

// ===== UTILITY TYPES =====
export type NormalizeYFn = (price: number) => number;

export interface CandleRenderProps {
    candle: CandleData;
    x: number;
    width: number;
    normalizeY: NormalizeYFn;
    isLastCandle: boolean;
    isCrashCandle: boolean;
}
