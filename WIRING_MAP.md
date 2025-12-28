# 🔌 CrashChart Wiring & Architecture Map

> **Date:** December 27, 2024  
> **Status:** IMPLEMENTED ✅

---

## 📊 Component Overview

### New Files Created
| File | Lines | Purpose |
|------|-------|---------|
| `CrashChart.tsx` | ~450 | Main chart component |
| `CrashChart.types.ts` | ~85 | TypeScript type definitions |
| `CrashChart.constants.ts` | ~95 | All configurable constants |
| **Total** | **~630** | vs. 1,643 lines before (**61% reduction**) |

### Files Updated
- `MainLayout.tsx` - Now uses `CrashChart` instead of `CandlestickChart`

---

## 🔧 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CrashChart.tsx                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐                    │
│  │   GAME LOOP     │    │  RENDER LOOP    │                    │
│  │   (250ms tick)  │    │  (60fps rAF)    │                    │
│  ├─────────────────┤    ├─────────────────┤                    │
│  │ generateCrash() │    │ interpolate()   │                    │
│  │ updatePrice()   │    │ drawCanvas()    │                    │
│  │ updateCandles() │    │  - grid         │                    │
│  │ checkCrash()    │    │  - candles      │                    │
│  └────────┬────────┘    │  - price line   │                    │
│           │             └────────┬────────┘                    │
│           │                      │                             │
│           ▼                      ▼                             │
│  ┌─────────────────────────────────────────┐                   │
│  │              STATE MANAGEMENT           │                   │
│  ├─────────────────────────────────────────┤                   │
│  │ gameState: { phase, multiplier, crash } │                   │
│  │ candles: CandleData[]                   │                   │
│  │ renderState: { current, target price } │                   │
│  └────────────────────┬────────────────────┘                   │
│                       │                                        │
│                       ▼                                        │
│           ┌───────────────────────┐                            │
│           │  syncToBetting()      │                            │
│           │  ↓                    │                            │
│           │  BettingContext       │                            │
│           └───────────────────────┘                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔁 Data Flow

### 1. Game Tick (Every 250ms)

```typescript
gameTickRef.current = setInterval(() => {
  // 1. Generate new price
  currentPrice = generatePriceMovement(currentPrice);
  
  // 2. Update game state
  setGameState({ ...state, multiplier: currentPrice });
  
  // 3. Sync to betting context
  syncGameToBetting(updatedState);
  
  // 4. Update render target
  setRenderState(prev => ({ ...prev, targetPrice: currentPrice }));
  
  // 5. Update candles (create new every 5 ticks)
  setCandles(updateCandleLogic);
  
  // 6. Check for crash
  if (shouldCrash) triggerCrashSequence();
}, TICK_MS); // 250ms
```

### 2. Render Loop (60fps)

```typescript
const renderLoop = useCallback(() => {
  // 1. Interpolate price (smooth animation)
  newPrice = currentPrice + (targetPrice - currentPrice) * 0.15;
  
  // 2. Clear canvas
  ctx.fillStyle = COLORS.BACKGROUND;
  ctx.fillRect(0, 0, width, height);
  
  // 3. Draw layers (in order)
  drawGrid(ctx);
  drawCandles(ctx, candles);
  drawPriceLine(ctx, newPrice);
  
  // 4. Continue loop
  requestAnimationFrame(renderLoop);
}, []);
```

### 3. Betting Context Sync

```typescript
// CrashChart → BettingContext
syncToBetting({
  isGameActive: state.phase === 'running',
  currentMultiplier: state.multiplier,
  crashPoint: state.crashPoint,
});

// BettingContext receives and:
// - Updates isGameActive
// - Updates multiplier (for PnL calculations)
// - Auto-closes trades on crash
```

---

## 📐 Rugs.fun Spec Compliance

| Specification | Rugs.fun | Our Implementation | Status |
|--------------|----------|-------------------|--------|
| Tick Rate | 250ms (4Hz) | 250ms | ✅ |
| Ticks per Candle | 5 | 5 | ✅ |
| Candle Duration | 1.25s | 1.25s | ✅ |
| Render Rate | 60fps | 60fps (rAF) | ✅ |
| Interpolation | Linear | Linear (0.15 factor) | ✅ |
| Background Color | #15161D | #15161D | ✅ |
| Bullish Color | #00C853 | #00C853 | ✅ |
| Bearish Color | #FF1744 | #FF1744 | ✅ |

---

## 🎮 Game State Machine

```
┌─────────────┐
│   WAITING   │  (initial state, countdown between rounds)
└──────┬──────┘
       │ startNewGame()
       ▼
┌─────────────┐
│   RUNNING   │  (active gameplay, price updating)
└──────┬──────┘
       │ crash detected
       ▼
┌─────────────┐
│   CRASHED   │  (crash overlay, countdown starts)
└──────┬──────┘
       │ countdown ends
       ▼
       └──────────► WAITING (loop)
```

---

## 🎯 Key Functions

### `generateCrashPoint()`
Generates crash point based on distribution:
- 30% chance below 1x (instant loss)
- 40% chance 1.01x - 2.00x (small win)
- 20% chance 2.00x - 5.00x (medium win)  
- 8% chance 5.00x - 10.00x (big win)
- 2% chance 10.00x - 25.00x (huge win)

### `generatePriceMovement(price)`
Returns new price with:
- Base increment: 0.005
- Random volatility: ±0.01
- Minimum: 0.01

### `calculatePriceRange(candles, currentPrice)`
Returns { min, max, range } with 5% padding for chart scaling.

### `normalizeY(price)`
Converts price to canvas Y coordinate.

---

## 📁 File Structure

```
src/components/Chart/
├── CrashChart.tsx           # Main component (USE THIS)
├── CrashChart.types.ts      # Type definitions
├── CrashChart.constants.ts  # All constants
├── CandlestickChart.tsx     # OLD - can be deleted
├── MainChart.tsx            # OLD - can be deleted
├── MiniCharts.tsx           # Keep - unrelated
└── Multipliers.tsx          # Keep - unrelated
```

---

## ✅ Production Checklist

### Done ✅
- [x] Clean component architecture
- [x] Rugs.fun timing spec compliance
- [x] 60fps render loop
- [x] Linear price interpolation
- [x] Candle aggregation (5 ticks)
- [x] Crash detection and animation
- [x] BettingContext integration
- [x] TypeScript strict mode clean
- [x] Error boundary

### Optional Polish (Future)
- [ ] Add glow effects to candles
- [ ] Add particle effects on crash
- [ ] Add sound effects
- [ ] Add haptic feedback (mobile)
- [ ] Add bet indicators on chart

---

## 🚀 Quick Commands

```bash
# Development
npm run dev

# Type check
npx tsc --noEmit

# Build
npm run build

# Preview production
npm run preview
```

---

## 📞 Troubleshooting

### Chart Not Rendering
1. Check console for errors
2. Verify BettingProvider wraps the app
3. Check canvas ref is attached

### Price Not Updating
1. Verify gameState.phase === 'running'
2. Check gameTickRef.current is set
3. Look for crash detection triggering early

### Betting Not Syncing
1. Verify syncToBetting is called
2. Check BettingContext.setGameState implementation
3. Look for race conditions in crash handling

---

**Created by:** AI Assistant  
**Last Updated:** 2024-12-27
