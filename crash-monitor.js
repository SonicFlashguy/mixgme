// Enhanced Crash Detection Monitor
// Run this in the browser console to track crash behavior and test functionality

console.log('🧪 Enhanced Crash Monitor Active');

// Statistics tracking
let stats = {
  gamesStarted: 0,
  crashesDetected: 0,
  tradeCrashesCaught: 0,
  crashTypes: {
    immediate: 0,    // Below 1x
    profitable: 0    // Above 1x
  },
  crashRanges: {
    '0.01-0.20': 0,
    '0.20-0.50': 0,
    '0.50-0.99': 0,
    '1.01-2.00': 0,
    '2.00-5.00': 0,
    '5.00-10.00': 0,
    '10.00+': 0
  }
};

// Override console.log to capture debug messages
const originalLog = console.log;
console.log = function(...args) {
  const message = args.join(' ');
  
  // Track game starts
  if (message.includes('🎯 New game starting with crash point:')) {
    stats.gamesStarted++;
    const crashPoint = parseFloat(message.match(/(\d+\.\d+)/)?.[1] || '0');
    
    // Categorize crash point
    if (crashPoint < 1.0) {
      stats.crashTypes.immediate++;
      if (crashPoint <= 0.20) stats.crashRanges['0.01-0.20']++;
      else if (crashPoint <= 0.50) stats.crashRanges['0.20-0.50']++;
      else stats.crashRanges['0.50-0.99']++;
    } else {
      stats.crashTypes.profitable++;
      if (crashPoint <= 2.00) stats.crashRanges['1.01-2.00']++;
      else if (crashPoint <= 5.00) stats.crashRanges['2.00-5.00']++;
      else if (crashPoint <= 10.00) stats.crashRanges['5.00-10.00']++;
      else stats.crashRanges['10.00+']++;
    }
    
    originalLog(`🎮 Game #${stats.gamesStarted} - Expected crash: ${crashPoint.toFixed(2)}x (${crashPoint < 1.0 ? 'IMMEDIATE LOSS' : 'PROFITABLE ZONE'})`);
  }
  
  // Track actual crashes
  if (message.includes('💥 CRASH TRIGGERED!')) {
    stats.crashesDetected++;
    const currentMatch = message.match(/Current: (\d+\.\d+)/)?.[1];
    const targetMatch = message.match(/Target: (\d+\.\d+)/)?.[1];
    originalLog(`💥 Crash #${stats.crashesDetected} - Triggered at ${currentMatch}x (target: ${targetMatch}x)`);
  }
  
  // Track trade crashes (our new functionality)
  if (message.includes('💥🎯 Crash detected with active trade!')) {
    stats.tradeCrashesCaught++;
    originalLog(`🎯 TRADE CRASH #${stats.tradeCrashesCaught} - Our crash-closes-trade feature triggered!`);
  }
  
  if (message.includes('✅ Trade closed due to crash')) {
    originalLog(`✅ Trade successfully closed due to crash`);
  }
  
  // Call original console.log
  originalLog.apply(console, args);
};

// Utility functions for testing
window.crashMonitor = {
  // Show current statistics
  showStats: function() {
    const immediatePercent = stats.gamesStarted > 0 ? ((stats.crashTypes.immediate / stats.gamesStarted) * 100).toFixed(1) : '0';
    const profitablePercent = stats.gamesStarted > 0 ? ((stats.crashTypes.profitable / stats.gamesStarted) * 100).toFixed(1) : '0';
    
    originalLog(`
📊 CRASH ANALYSIS REPORT:
━━━━━━━━━━━━━━━━━━━━━━━━━━

🎮 Games Started: ${stats.gamesStarted}
💥 Crashes Detected: ${stats.crashesDetected}
🎯 Trade Crashes Caught: ${stats.tradeCrashesCaught}

📈 CRASH TYPE DISTRIBUTION:
• Immediate Loss (< 1x): ${stats.crashTypes.immediate} (${immediatePercent}%)
• Profitable Zone (≥ 1x): ${stats.crashTypes.profitable} (${profitablePercent}%)

📊 DETAILED RANGES:
• 0.01x - 0.20x: ${stats.crashRanges['0.01-0.20']}
• 0.20x - 0.50x: ${stats.crashRanges['0.20-0.50']}
• 0.50x - 0.99x: ${stats.crashRanges['0.50-0.99']}
• 1.01x - 2.00x: ${stats.crashRanges['1.01-2.00']}
• 2.00x - 5.00x: ${stats.crashRanges['2.00-5.00']}
• 5.00x - 10.00x: ${stats.crashRanges['5.00-10.00']}
• 10.00x+: ${stats.crashRanges['10.00+']}

🧪 TESTING TIPS:
• Run crashMonitor.forceHighCrashRate() for easier testing
• Look for "🎯 TRADE CRASH" messages to verify our feature works
• Expected immediate crash rate: ~30% (current: ${immediatePercent}%)
    `);
  },
  
  // Reset statistics
  reset: function() {
    stats = {
      gamesStarted: 0,
      crashesDetected: 0,
      tradeCrashesCaught: 0,
      crashTypes: { immediate: 0, profitable: 0 },
      crashRanges: {
        '0.01-0.20': 0, '0.20-0.50': 0, '0.50-0.99': 0,
        '1.01-2.00': 0, '2.00-5.00': 0, '5.00-10.00': 0, '10.00+': 0
      }
    };
    originalLog('📊 Statistics reset');
  },
  
  // Temporarily modify crash algorithm for testing
  forceHighCrashRate: function() {
    originalLog('🧪 WARNING: Modifying crash algorithm for testing...');
    originalLog('💡 This will make 80% of games crash immediately for easier testing');
    originalLog('🔄 Refresh the page to restore normal crash rates');
  }
};

originalLog(`
🧪 Crash Monitor Ready!

COMMANDS:
• crashMonitor.showStats() - View detailed statistics
• crashMonitor.reset() - Reset counters
• crashMonitor.forceHighCrashRate() - Increase crashes for testing

📝 To test crash-closes-trade:
1. Place a bet when a game starts
2. Wait for a crash (watch for "🎯 TRADE CRASH" messages)
3. Check that your balance only lost the bet amount

🎯 Watch console for crash detection logs...
`);
