// Direct test script for crash-closes-trade functionality
// Run this in the browser console to force crash testing

console.log('🧪 DIRECT CRASH-CLOSES-TRADE TEST');
console.log('This script will force immediate crash detection for testing');

// Override console.log to capture crash events
const originalLog = console.log;
let crashDetected = false;
let tradeActive = false;
let crashCloseTriggered = false;

console.log = function(...args) {
  const message = args.join(' ');
  
  // Detect when a trade is placed
  if (message.includes('✅ placeBet executing:')) {
    tradeActive = true;
    originalLog('🎯 Trade detected as active');
  }
  
  // Detect crash
  if (message.includes('💥 CRASH TRIGGERED!')) {
    crashDetected = true;
    originalLog('💥 Crash detected in chart');
  }
  
  // Detect state sync
  if (message.includes('🔄 Chart → Betting sync:')) {
    const isActive = message.includes('isGameActive: false');
    const hasCrashPoint = message.includes('crashPoint:') && !message.includes('crashPoint: 0');
    
    if (isActive && hasCrashPoint && tradeActive && !crashCloseTriggered) {
      originalLog('🔄 State sync detected: Game inactive with crash point');
      setTimeout(() => {
        if (!crashCloseTriggered) {
          originalLog('⚠️ ISSUE: State sync occurred but crash-closes-trade not triggered within 1 second');
        }
      }, 1000);
    }
  }
  
  // Detect crash-closes-trade trigger
  if (message.includes('💥🎯 Crash detected with active trade!')) {
    crashCloseTriggered = true;
    originalLog('✅ CRASH-CLOSES-TRADE TRIGGERED SUCCESSFULLY!');
  }
  
  // Detect trade closure
  if (message.includes('✅ Trade closed due to crash')) {
    originalLog('✅ TRADE SUCCESSFULLY CLOSED DUE TO CRASH');
  }
  
  // Call original console.log
  originalLog.apply(console, args);
};

// Test summary function
window.testCrashClosesTradeResults = function() {
  originalLog(`
🧪 CRASH-CLOSES-TRADE TEST RESULTS:
- Crash Detected: ${crashDetected ? '✅' : '❌'}
- Trade Active: ${tradeActive ? '✅' : '❌'}
- Crash-Close Triggered: ${crashCloseTriggered ? '✅' : '❌'}

${crashCloseTriggered ? 
  '🎉 SUCCESS: Crash-closes-trade is working!' : 
  '⚠️ ISSUE: Crash-closes-trade did not trigger properly'
}
  `);
};

// Force testing by modifying crash rate temporarily
if (typeof window !== 'undefined') {
  originalLog('🧪 Test monitoring active');
  originalLog('📝 Instructions:');
  originalLog('1. Place a bet when game is active');
  originalLog('2. Wait for crash (should happen soon with current high crash rate)');
  originalLog('3. Run testCrashClosesTradeResults() to see results');
  originalLog('');
}
