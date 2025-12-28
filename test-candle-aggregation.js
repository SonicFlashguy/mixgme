// Test script for candle aggregation logic
// Run with: node test-candle-aggregation.js

const CandleData = {
  create: (open, high, low, close, timestamp) => ({
    open,
    high,
    low,
    close,
    timestamp
  })
};

// Replicate the aggregation functions from CandlestickChart.tsx
const aggregateCandles = (candles) => {
  if (candles.length === 0) {
    throw new Error("Cannot aggregate empty candle array");
  }
  
  if (candles.length === 1) {
    return candles[0];
  }
  
  const sortedByTime = [...candles].sort((a, b) => a.timestamp - b.timestamp);
  
  const open = sortedByTime[0].open;
  const close = sortedByTime[sortedByTime.length - 1].close;
  
  // Calculate body range for wick limiting
  const bodyHigh = Math.max(open, close);
  const bodyLow = Math.min(open, close);
  const bodyRange = bodyHigh - bodyLow;
  
  // Get all highs and lows
  const allHighs = sortedByTime.map(c => c.high);
  const allLows = sortedByTime.map(c => c.low);
  const maxHigh = Math.max(...allHighs);
  const minLow = Math.min(...allLows);
  
  // Ultra-conservative wick limiting - much stricter limits
  const priceLevel = (open + close) / 2; // Average price level
  
  // Use very small wick extensions - prioritize body range limit
  let maxWickExtension;
  if (bodyRange > 0) {
    // For non-doji candles: max 20% of body range, capped at 0.5% of price
    maxWickExtension = Math.min(bodyRange * 0.20, priceLevel * 0.005);
  } else {
    // For doji candles: only allow tiny wicks (0.1% of price)
    maxWickExtension = priceLevel * 0.001;
  }

  // Apply ultra-strict wick limits
  const limitedHigh = Math.min(maxHigh, bodyHigh + maxWickExtension);
  const limitedLow = Math.max(minLow, bodyLow - maxWickExtension);

  // No override - stick to the calculated limits strictly
  const finalHigh = limitedHigh;
  const finalLow = limitedLow;
  
  return {
    open,
    close,
    high: finalHigh,
    low: finalLow,
    timestamp: sortedByTime[0].timestamp,
    volume: sortedByTime.reduce((sum, candle) => sum + (candle.volume || 0), 0)
  };
};

const performCandleAggregation = (chartData) => {
  // Only aggregate if we have 30 or more candles
  if (chartData.length < 30) {
    return chartData;
  }
  
  console.log(`🔄 Performing candle aggregation - Current count: ${chartData.length}`);
  
  // Take first 3 candles for aggregation
  const candlesToAggregate = chartData.slice(0, 3);
  const remainingCandles = chartData.slice(3);
  
  console.log('📊 Aggregating candles:', {
    firstCandle: candlesToAggregate[0],
    secondCandle: candlesToAggregate[1], 
    thirdCandle: candlesToAggregate[2]
  });
  
  // Create aggregated candle preserving average price action
  const aggregatedCandle = aggregateCandles(candlesToAggregate);
  
  console.log('✅ Aggregated candle created:', aggregatedCandle);
  console.log(`📉 Chart count reduced from ${chartData.length} to ${[aggregatedCandle, ...remainingCandles].length}`);
  
  // Return new array with aggregated candle at the beginning
  return [aggregatedCandle, ...remainingCandles];
};

// Test the aggregation logic
console.log('🧪 Testing Candle Aggregation Logic\n');

// Create test data with 32 candles
const testCandles = [];
const baseTime = Date.now();

for (let i = 0; i < 32; i++) {
  const price = 1.0 + (Math.random() - 0.5) * 0.2; // Random price around 1.0
  const high = price + Math.random() * 0.05;
  const low = price - Math.random() * 0.05;
  const close = low + Math.random() * (high - low);
  
  testCandles.push(CandleData.create(
    price,      // open
    high,       // high
    low,        // low
    close,      // close
    baseTime + (i * 3000) // timestamp (3 seconds apart)
  ));
}

console.log(`📊 Created ${testCandles.length} test candles`);
console.log(`💡 Should trigger aggregation since count >= 30\n`);

// Test aggregation
const result = performCandleAggregation(testCandles);

console.log(`\n✅ Test Results:`);
console.log(`   - Original count: ${testCandles.length}`);
console.log(`   - Final count: ${result.length}`);
console.log(`   - Expected final count: ${testCandles.length - 2} (3 candles become 1)`);
console.log(`   - ✓ Aggregation working: ${result.length === testCandles.length - 2}`);

// Test with less than 30 candles
console.log(`\n🧪 Testing with 25 candles (should NOT aggregate)`);
const smallTestCandles = testCandles.slice(0, 25);
const smallResult = performCandleAggregation(smallTestCandles);
console.log(`   - Original count: ${smallTestCandles.length}`);
console.log(`   - Final count: ${smallResult.length}`);
console.log(`   - ✓ No aggregation: ${smallResult.length === smallTestCandles.length}`);

// Test case specifically for huge wick scenario
console.log('\n🧪 Testing Huge Wick Prevention\n');

// Create candles with extreme price movements that would cause huge wicks
const extremeCandles = [
  CandleData.create(1.0, 1.02, 0.98, 1.01, baseTime),      // Normal candle
  CandleData.create(1.01, 2.5, 0.1, 1.02, baseTime + 3000), // Extreme wick candle
  CandleData.create(1.02, 1.04, 1.0, 1.03, baseTime + 6000)  // Normal candle
];

console.log('📊 Input candles with extreme wicks:');
extremeCandles.forEach((candle, i) => {
  const wickSize = (candle.high - candle.low);
  const bodySize = Math.abs(candle.close - candle.open);
  console.log(`Candle ${i + 1}: Open=${candle.open.toFixed(4)}, High=${candle.high.toFixed(4)}, Low=${candle.low.toFixed(4)}, Close=${candle.close.toFixed(4)}`);
  console.log(`  - Wick size: ${wickSize.toFixed(4)}, Body size: ${bodySize.toFixed(4)}, Ratio: ${(wickSize/bodySize).toFixed(2)}x`);
});

const aggregatedExtreme = aggregateCandles(extremeCandles);
const aggWickSize = aggregatedExtreme.high - aggregatedExtreme.low;
const aggBodySize = Math.abs(aggregatedExtreme.close - aggregatedExtreme.open);

console.log('\n✅ Aggregated result:');
console.log(`Open=${aggregatedExtreme.open.toFixed(4)}, High=${aggregatedExtreme.high.toFixed(4)}, Low=${aggregatedExtreme.low.toFixed(4)}, Close=${aggregatedExtreme.close.toFixed(4)}`);
console.log(`Final wick size: ${aggWickSize.toFixed(4)}, Body size: ${aggBodySize.toFixed(4)}, Ratio: ${(aggWickSize/(aggBodySize || 0.01)).toFixed(2)}x`);

// Verify wick is reasonable with new ultra-conservative logic
const bodyHigh = Math.max(aggregatedExtreme.open, aggregatedExtreme.close);
const bodyLow = Math.min(aggregatedExtreme.open, aggregatedExtreme.close);
const bodyRange = bodyHigh - bodyLow;
const priceLevel = (aggregatedExtreme.open + aggregatedExtreme.close) / 2;

// Calculate expected limits using same logic as aggregation
let maxAllowedWickExtension;
if (bodyRange > 0) {
  maxAllowedWickExtension = Math.min(bodyRange * 0.20, priceLevel * 0.005);
} else {
  maxAllowedWickExtension = priceLevel * 0.001;
}

const upperWick = aggregatedExtreme.high - bodyHigh;
const lowerWick = bodyLow - aggregatedExtreme.low;

console.log(`\n🔍 Wick analysis:`);
console.log(`Body range: ${bodyRange.toFixed(4)}`);
console.log(`Max allowed wick extension: ${maxAllowedWickExtension.toFixed(4)}`);
console.log(`Upper wick: ${upperWick.toFixed(4)} (${upperWick <= maxAllowedWickExtension + 0.0001 ? '✅ GOOD' : '❌ TOO LARGE'})`);
console.log(`Lower wick: ${lowerWick.toFixed(4)} (${lowerWick <= maxAllowedWickExtension + 0.0001 ? '✅ GOOD' : '❌ TOO LARGE'})`);

console.log('\n🎉 Candle Aggregation Test Complete!');
