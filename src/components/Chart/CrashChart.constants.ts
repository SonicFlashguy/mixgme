/**
 * CrashChart Constants
 * Aligned with rugs.fun specifications for production-ready implementation
 */

// ===== TIMING CONSTANTS (Rugs.fun aligned) =====
export const TICK_MS = 250;                    // 4 updates per second (rugs.fun spec)
export const TICKS_PER_CANDLE = 5;             // 5 ticks = 1 candle
export const CANDLE_DURATION_MS = TICK_MS * TICKS_PER_CANDLE; // 1.25 seconds
export const RENDER_FPS = 60;                  // Target render rate
export const RENDER_INTERVAL_MS = 1000 / RENDER_FPS; // ~16.67ms

// ===== GAME CONSTANTS =====
export const INITIAL_MULTIPLIER = 1.0;
export const MIN_MULTIPLIER = 0.01;
export const COUNTDOWN_SECONDS = 5;
export const CRASH_DISPLAY_DURATION_MS = 2000;
export const PRE_GAME_DELAY_MS = 1000;        // Delay before first game starts

// ===== PRICE MOVEMENT =====
export const BASE_PRICE_INCREMENT = 0.005;    // Base price increase per tick
export const PRICE_VOLATILITY = 0.01;         // Random price variation
export const PRICE_MOMENTUM_FACTOR = 0.02;    // Trend momentum

// ===== VISUAL CONSTANTS =====
export const COLORS = {
    BACKGROUND: '#15161D',         // Deep Obsidian (rugs.fun spec)
    BULLISH: '#00C853',            // Material Green (rugs.fun spec)
    BEARISH: '#FF1744',            // Material Red (rugs.fun spec)
    PRICE_LINE: '#FFFFFF',
    PRICE_LINE_ALPHA: 0.8,
    GRID: 'rgba(255, 255, 255, 0.07)',
    GRID_DASHED: 'rgba(255, 255, 255, 0.1)',
    TEXT: '#FFFFFF',
    TEXT_MUTED: 'rgba(255, 255, 255, 0.6)',
    CRASH_TEXT: '#FF1744',
    STATUS_ACTIVE: '#22c55e',
    STATUS_CRASHED: '#ef4444',
    STATUS_WAITING: '#eab308',
} as const;

export const CANDLE = {
    WIDTH: 10,
    SPACING: 4,
    MAX_VISIBLE: 50,
    WICK_WIDTH: 1,
} as const;

export const CHART = {
    PADDING: 40,
    PADDING_RIGHT: 80,             // Extra space for price labels
    GRID_LINES_HORIZONTAL: 5,
    GRID_LINES_VERTICAL: 4,
    PRICE_PADDING_PERCENT: 0.05,   // 5% padding on price range
} as const;

// ===== CRASH POINT DISTRIBUTION =====
// House edge is built into these probabilities
// Total should equal 1.0
export const CRASH_DISTRIBUTION = {
    // Sub-1x crashes (instant losses)
    BELOW_1X: {
        chance: 0.30,                // 30% lose immediately
        ranges: [
            { chance: 0.10, min: 0.01, max: 0.20 },  // 10% of sub-1x: 0.01-0.20x
            { chance: 0.20, min: 0.20, max: 0.50 },  // 20% of sub-1x: 0.20-0.50x
            { chance: 0.70, min: 0.50, max: 0.99 },  // 70% of sub-1x: 0.50-0.99x
        ],
    },
    // Above-1x wins
    ABOVE_1X: {
        chance: 0.70,                // 70% get above 1x
        ranges: [
            { chance: 0.40, min: 1.01, max: 2.00 },  // 40%: 1.01-2.00x (small win)
            { chance: 0.30, min: 2.00, max: 5.00 },  // 30%: 2.00-5.00x (medium win)
            { chance: 0.20, min: 5.00, max: 10.00 }, // 20%: 5.00-10.00x (big win)
            { chance: 0.10, min: 10.00, max: 25.00 },// 10%: 10.00-25.00x (huge win)
        ],
    },
} as const;

// ===== ANIMATION CONSTANTS =====
export const ANIMATION = {
    INTERPOLATION_SPEED: 0.15,     // Linear interpolation factor (0-1)
    CRASH_CANDLE_DURATION_MS: 200, // How fast the crash candle drops
    FADE_OUT_INTERVAL_MS: 100,     // Chart fade-out speed between rounds
} as const;

// ===== TEXT LABELS =====
export const LABELS = {
    CRASHED: 'CRASHED!',
    RUGGED: 'RUGGED!',             // Alternative crash text
    NEXT_ROUND: 'Next round in',
    LIVE: '🚀 Live',
    PREPARING: 'Preparing...',
    LOADING: 'Loading...',
} as const;

// ===== Z-INDEX LAYERS (for reference, Canvas2D handles via draw order) =====
export const LAYERS = {
    BACKGROUND: 0,
    GRID: 1,
    CANDLES: 2,
    PRICE_LINE: 3,
    OVERLAY: 4,
} as const;
