# CRASH-CLOSES-TRADE TESTING PROCEDURE

## Issue Found & Fixed:
- **Problem**: Chart was syncing `currentMultiplier: 0` during crashes instead of the actual crash point
- **Solution**: Modified chart to sync `currentMultiplier: crashPoint` for proper betting context detection

## Manual Testing Steps:

### 1. Open Application
- Navigate to http://localhost:5173
- Open browser console (F12 → Console)

### 2. Copy Test Script
```javascript
// Copy the console-test.js content and paste into console
```

### 3. Test Procedure
1. Wait for a new game to start (look for "🎯 New game starting" message)
2. Place any bet amount when game is active
3. Wait for crash (80% chance of immediate crash with current settings)
4. Look for these console messages:
   - `💥 CRASH TRIGGERED!` (chart detects crash)
   - `🔄 setGameState called:` (state sync happens)
   - `💥🎯 Crash detected with active trade!` (crash-closes-trade triggers)
   - `✅ Trade closed due to crash` (trade successfully closed)

### 4. Verify Results
- Run `showTestResults()` in console to see summary
- Check that balance only lost the bet amount (not full balance)
- Confirm trade is no longer active

## Expected Behavior:
✅ **Working**: Crash detection → State sync → Trade auto-closure  
❌ **Broken**: Crash detection → State sync → No trade closure

## Debug Information:
- Enhanced logging shows exact state values being synced
- Crash-closes-trade conditions are logged for verification
- Test results track all events for analysis

## Files Modified:
- `src/context/BettingContext.tsx` - Added debugging logs
- `src/components/Chart/CandlestickChart.tsx` - Fixed multiplier sync
- `console-test.js` - Created comprehensive test script

## Testing Notes:
- High crash rate (80%) active for easier testing
- Crashes typically happen within 5-10 seconds
- Multiple tests can be run by placing new bets
