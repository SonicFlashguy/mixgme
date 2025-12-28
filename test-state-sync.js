// Quick test to verify the application is working
// Open this in browser console and run these checks

console.log("🚀 Testing crypto trading app state synchronization...");

// Test 1: Check if game starts and buttons become available
setTimeout(() => {
  console.log("⏰ Game should be active now, checking button states...");
  
  // Get button elements
  const buyButton = document.querySelector('.buy-button');
  const sellButton = document.querySelector('.sell-button');
  
  if (buyButton && sellButton) {
    console.log("✅ Buttons found!");
    console.log("🔴 Buy button disabled:", buyButton.disabled);
    console.log("🔴 Sell button disabled:", sellButton.disabled);
    
    // Try clicking buy button
    if (!buyButton.disabled) {
      console.log("🎯 Attempting to click BUY button...");
      buyButton.click();
    } else {
      console.log("❌ BUY button is disabled");
    }
  } else {
    console.log("❌ Buttons not found in DOM");
  }
}, 5000);

// Test 2: Monitor state changes
let stateCheckInterval = setInterval(() => {
  const buyButton = document.querySelector('.buy-button');
  const sellButton = document.querySelector('.sell-button');
  
  if (buyButton && sellButton) {
    console.log(`🔍 Button states - Buy: ${buyButton.disabled ? 'DISABLED' : 'ENABLED'}, Sell: ${sellButton.disabled ? 'DISABLED' : 'ENABLED'}`);
  }
}, 2000);

// Stop monitoring after 30 seconds
setTimeout(() => {
  clearInterval(stateCheckInterval);
  console.log("🏁 State monitoring stopped");
}, 30000);
