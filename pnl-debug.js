// PNL Tracker Debug Helper
// Paste this in browser console for additional debugging

window.pnlDebug = {
  // Force show PNL calculations
  logPnL: () => {
    console.log('%c🔍 PNL DEBUG MODE ENABLED', 'background: #000; color: #0f0; font-size: 14px; padding: 5px;');
    console.log('Watch for these debug messages:');
    console.log('📊 PnL Debug - Active bet unrealized PnL');
    console.log('📊 PnL Debug - Final calculation');
    console.log('🎯 PNL Tracker Debug');
    console.log('💰 PNL Calculation');
  },
  
  // Show expected behavior
  expectedBehavior: () => {
    console.log(`
%c🎯 EXPECTED PNL TRACKER BEHAVIOR
================================%c

✅ WHEN PLACING A BET:
• PNL tracker appears in bottom right corner
• Shows unrealized PnL based on current multiplier vs entry multiplier
• Updates in real-time as multiplier changes
• Format: "+0.123 SOL (+12.3%)" or "-0.123 SOL (-12.3%)"

✅ WHEN SELLING:
• PNL becomes realized (locked in)
• Tracker REMAINS visible (doesn't disappear)
• Shows final profit/loss from that trade

✅ WHEN PLACING ANOTHER BET:
• New unrealized PnL adds to previous realized PnL
• Shows cumulative total across all trades this game

✅ WHEN CRASH OCCURS:
• PNL tracker disappears
• All tracking resets for next game

✅ ON NEW GAME:
• Fresh PNL tracking starts
• Previous game's PnL is forgotten
    `, 'background: #000; color: #0f0; font-size: 12px; font-weight: bold;', 'color: #fff; font-size: 11px;');
  }
};

console.log('%c🎯 PNL Debug Helper Loaded', 'background: #000; color: #0f0; font-size: 12px; padding: 3px;');
console.log('Run pnlDebug.logPnL() or pnlDebug.expectedBehavior() for help');
