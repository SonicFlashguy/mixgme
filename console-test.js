/*
=== CRASH-CLOSES-TRADE TEST INSTRUCTIONS ===

1. Copy this entire script
2. Open browser console (F12 → Console tab)
3. Paste and press Enter
4. Follow the on-screen instructions
5. The test will automatically monitor and report results

Copy from here ↓
*/

console.log('🧪 CRASH-CLOSES-TRADE FUNCTIONALITY TEST');
console.log('📋 This test will monitor crash auto-closure of trades');
console.log('');

// Enhanced monitoring with detailed state tracking
let testResults = {
  gamesStarted: 0,
  betsPlaced: 0,
  crashesDetected: 0,
  stateUpdatesReceived: 0,
  crashCloseTriggered: 0,
  tradesClosedSuccessfully: 0,
  lastBetAmount: 0,
  lastCrashPoint: 0
};

const originalLog = console.log;

console.log = function(...args) {
  const message = args.join(' ');
  
  // Track game starts
  if (message.includes('🎯 New game starting with crash point:')) {
    testResults.gamesStarted++;
    testResults.lastCrashPoint = parseFloat(message.match(/(\d+\.\d+)/)?.[1] || '0');
    originalLog(`\n🎮 GAME #${testResults.gamesStarted} - Expected crash: ${testResults.lastCrashPoint.toFixed(2)}x`);
  }
  
  // Track bet placements
  if (message.includes('✅ placeBet executing:')) {
    testResults.betsPlaced++;
    const amount = parseFloat(message.match(/amount: ([\d.]+)/)?.[1] || '0');
    testResults.lastBetAmount = amount;
    originalLog(`💰 BET PLACED #${testResults.betsPlaced} - Amount: $${amount}`);
  }
  
  // Track setGameState calls
  if (message.includes('🔄 setGameState called:')) {
    testResults.stateUpdatesReceived++;
    if (message.includes('isGameActive: false') && message.includes('crashPoint:')) {
      originalLog(`🔄 STATE UPDATE #${testResults.stateUpdatesReceived} - Game crashed`);
    }
  }
  
  // Track crash detection in chart
  if (message.includes('💥 CRASH TRIGGERED!')) {
    testResults.crashesDetected++;
    originalLog(`💥 CHART CRASH #${testResults.crashesDetected} - Crash detected in chart`);
  }
  
  // Track crash condition checking
  if (message.includes('🔍 Checking crash-closes-trade conditions:')) {
    originalLog('🔍 Checking crash-closes-trade conditions...');
  }
  
  // Track crash-closes-trade trigger
  if (message.includes('💥🎯 Crash detected with active trade!')) {
    testResults.crashCloseTriggered++;
    originalLog(`\n🎯 CRASH-CLOSES-TRADE TRIGGERED #${testResults.crashCloseTriggered}!`);
    originalLog('✅ SUCCESS: Auto-closure mechanism activated!');
  }
  
  // Track successful trade closure
  if (message.includes('✅ Trade closed due to crash')) {
    testResults.tradesClosedSuccessfully++;
    originalLog(`✅ TRADE CLOSED #${testResults.tradesClosedSuccessfully} - Successfully closed due to crash`);
  }
  
  // Call original
  originalLog.apply(console, args);
};

// Results function
window.showTestResults = function() {
  originalLog(`
📊 CRASH-CLOSES-TRADE TEST RESULTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎮 Games Started: ${testResults.gamesStarted}
💰 Bets Placed: ${testResults.betsPlaced}
💥 Crashes Detected: ${testResults.crashesDetected}
🔄 State Updates: ${testResults.stateUpdatesReceived}
🎯 Crash-Close Triggered: ${testResults.crashCloseTriggered}
✅ Trades Closed Successfully: ${testResults.tradesClosedSuccessfully}

💸 Last Bet: $${testResults.lastBetAmount}
🎯 Last Crash Point: ${testResults.lastCrashPoint.toFixed(2)}x

${testResults.crashCloseTriggered > 0 ? 
  '🎉 SUCCESS: Crash-closes-trade is working!' : 
  '⚠️  ISSUE: Place a bet and wait for crash to test'
}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
};

originalLog('✅ Crash-closes-trade monitoring is now active!');
originalLog('📋 Instructions:');
originalLog('1. Wait for a new game to start');
originalLog('2. Place a bet (any amount)');
originalLog('3. Wait for crash (80% chance below 1x = quick crash)');
originalLog('4. Run showTestResults() to see if it worked');
originalLog('');
originalLog('🎯 High crash rate active: 80% immediate crashes for easier testing');

/*
Copy up to here ↑
*/
