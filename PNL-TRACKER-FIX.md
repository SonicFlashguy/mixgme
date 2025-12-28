🎯 PNL TRACKER FIX SUMMARY
==========================

## Problem Identified
The PNL tracker was showing 0 because of a logic error in the `getCumulativePnL()` function.

## Root Cause
In the original implementation:
```tsx
// Add unrealized PnL from current active position
if (playerBet.isActive && currentPosition > 0) {
```

The condition `currentPosition > 0` was WRONG because:
- `currentPosition` tracks positions from completed trade actions only
- When you place a bet, it creates a trade action but `currentPosition` starts at 0
- The active bet's unrealized PnL was never calculated

## The Fix
Changed the condition to:
```tsx
// Add unrealized PnL from current active position
if (playerBet.isActive) {
```

## Why This Works
1. **When you place a bet:**
   - `playerBet.isActive = true`
   - A 'buy' trade action is recorded
   - Unrealized PnL is calculated: `(current_multiplier / entry_multiplier - 1) * bet_amount`

2. **When you sell:**
   - Realized PnL is calculated from the trade action
   - `playerBet.isActive = false` 
   - Only realized PnL shows

3. **Cumulative tracking:**
   - Multiple buy/sell cycles accumulate properly
   - Tracker persists until crash
   - Resets on new game

## Additional Improvements
1. **Added comprehensive debugging** to track PnL calculations
2. **Simplified totalInvested calculation** to avoid double-counting
3. **Fixed positioning** to absolute bottom right corner

## Testing Instructions
1. Open the app at http://localhost:5175
2. Place a bet - PNL tracker should appear with unrealized PnL
3. Watch multiplier change - PNL should update in real-time
4. Sell position - realized PnL should persist
5. Place another bet - cumulative PnL should show
6. Wait for crash (80% chance) - tracker should disappear
7. Check browser console for detailed PnL debugging logs

## Status: ✅ FIXED
The PNL tracker should now work correctly, showing:
- Real-time unrealized PnL for active positions
- Cumulative realized + unrealized PnL across multiple trades
- Persistence until crash occurs
- Reset on new game starts
