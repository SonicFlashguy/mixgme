// Test script to verify CRASH-CLOSES-TRADE functionality
// Run this in the browser console to monitor crash auto-closure of trades

console.log('🧪 Starting CRASH-CLOSES-TRADE Test');
console.log('📋 Instructions:');
console.log('1. Place a bet when game is active');
console.log('2. Wait for crash to occur');
console.log('3. Verify trade is automatically closed');
console.log('4. Check balance is only reduced by bet amount');
console.log('');

// Monitor console for crash-closes-trade functionality
let gameStartCount = 0;
let crashCount = 0;
let betsPlaced = 0;
let tradesAutoClosedOnCrash = 0;
let lastBetAmount = 0;
let balanceBeforeBet = 0;

// Store original console.log to intercept our debug messages
const originalLog = console.log;
console.log = function(...args) {
  const message = args.join(' ');
  
  // Track game starts
  if (message.includes('🎯 New game starting with crash point:')) {
    gameStartCount++;
    const crashPoint = message.match(/(\d+\.\d+)/)?.[1];
    originalLog(`\n🎮 GAME #${gameStartCount} - Expected crash at: ${crashPoint}x`);
  }
  
  // Track bet placements
  if (message.includes('✅ placeBet executing:')) {
    betsPlaced++;
    const amountMatch = message.match(/amount: ([\d.]+)/);
    const balanceMatch = message.match(/balance: ([\d.]+)/);
    if (amountMatch && balanceMatch) {
      lastBetAmount = parseFloat(amountMatch[1]);
      balanceBeforeBet = parseFloat(balanceMatch[1]);
      originalLog(`💰 BET #${betsPlaced} PLACED - Amount: $${lastBetAmount} | Balance before: $${balanceBeforeBet}`);
    }
  }
  
  // Track crash detection
  if (message.includes('💥 CRASH TRIGGERED!')) {
    crashCount++;
    const currentMatch = message.match(/Current: (\d+\.\d+)/)?.[1];
    const targetMatch = message.match(/Target: (\d+\.\d+)/)?.[1];
    originalLog(`💥 CRASH #${crashCount} - Triggered at ${currentMatch}x (target: ${targetMatch}x)`);
  }
  
  // Track crash detection with active trade
  if (message.includes('💥🎯 Crash detected with active trade!')) {
    tradesAutoClosedOnCrash++;
    originalLog(`\n🎯 CRASH-CLOSES-TRADE TRIGGERED #${tradesAutoClosedOnCrash}!`);
    originalLog('👀 Monitoring for automatic trade closure...');
  }
  
  // Track trade closure completion
  if (message.includes('✅ Trade closed due to crash. Player lost bet amount:')) {
    const lostAmount = parseFloat(message.match(/(\d+(?:\.\d+)?)/)?.[1] || '0');
    originalLog(`✅ TRADE AUTO-CLOSED! Lost: $${lostAmount}`);
    originalLog(`📊 Expected total loss from balance: $${lastBetAmount}`);
    
    // Show summary after trade closure
    setTimeout(() => {
      originalLog('\n📈 CRASH-CLOSES-TRADE TEST RESULTS:');
      originalLog(`🎮 Games Started: ${gameStartCount}`);
      originalLog(`💰 Bets Placed: ${betsPlaced}`);
      originalLog(`💥 Total Crashes: ${crashCount}`);
      originalLog(`🎯 Crashes with Active Trades: ${tradesAutoClosedOnCrash}`);
      originalLog(`💸 Last Bet Amount: $${lastBetAmount}`);
      originalLog(`💳 Balance Before Bet: $${balanceBeforeBet}`);
      originalLog(`🔍 Expected Final Balance: $${(balanceBeforeBet - lastBetAmount).toFixed(2)}`);
      originalLog('\n✅ Test phase completed - verify balance in UI!');
    }, 1000);
  }
  
  // Call original console.log
  originalLog.apply(console, args);
};

// Enhanced summary function
window.showCrashTradeTestSummary = function() {
  originalLog(`
🧪 CRASH-CLOSES-TRADE TEST SUMMARY:
- Games Started: ${gameStartCount}
- Total Crashes: ${crashCount}
- Bets Placed: ${betsPlaced}
- Trades Auto-Closed on Crash: ${tradesAutoClosedOnCrash}
- Auto-Closure Success Rate: ${betsPlaced > 0 ? ((tradesAutoClosedOnCrash / betsPlaced) * 100).toFixed(1) : 0}%
- Last Bet: $${lastBetAmount}
- Expected Loss: $${lastBetAmount}
  `);
};

originalLog('🧪 CRASH-CLOSES-TRADE test monitoring active.');
originalLog('🎯 Place a bet and wait for crash to test auto-closure functionality...');
originalLog('💡 Run showCrashTradeTestSummary() for detailed results.');
