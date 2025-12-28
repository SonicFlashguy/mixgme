# CryptoCash 2.0 - Gambling Mechanics & House Edge Algorithm

## Table of Contents

1. [Current Algorithm Analysis](#current-algorithm-analysis)
2. [House Edge Requirements](#house-edge-requirements)
3. [Proposed Advanced Algorithm](#proposed-advanced-algorithm)
4. [Bet-Weighted Crash Point Generation](#bet-weighted-crash-point-generation)
5. [Mathematical House Edge Calculation](#mathematical-house-edge-calculation)
6. [Risk Management System](#risk-management-system)
7. [Implementation Specifications](#implementation-specifications)

## Current Algorithm Analysis

### Existing Crash Point Generation

The current implementation uses a basic statistical distribution:

```typescript
// Current algorithm (simplified for documentation)
const generateCrashPoint = (): number => {
  const random = Math.random();
  
  // 80% chance to crash below 1x (testing mode)
  if (random < 0.8) {
    // Various loss ranges: 0.01x - 0.99x
    return generateLossMultiplier();
  }
  
  // 20% chance for profits above 1x
  // Ranges: 1.01x - 25.00x
  return generateProfitMultiplier();
};
```

### Problems with Current System

1. **No House Edge Consideration**: Algorithm doesn't account for total bet amounts
2. **No Bet-Weighted Logic**: High bets are treated same as low bets
3. **No Risk Management**: No protection against large payouts
4. **Fixed Probabilities**: Static percentages regardless of game state
5. **No Profit Guarantee**: House could lose money on high-bet rounds

## House Edge Requirements

### Target House Edge: 5% Minimum

The house must maintain a mathematical advantage of at least 5% across all games, with higher edges during high-risk periods.

### Key Principles

1. **Bet-Weighted Crash Points**: Higher total bets = lower crash points
2. **Dynamic Loss Ratios**: Adjust loss probability based on betting volume
3. **Maximum Payout Limits**: Cap potential payouts to protect house bankroll
4. **Guaranteed Profit Margins**: Ensure house profitability over time

## Proposed Advanced Algorithm

### Core Algorithm Structure

```typescript
interface HouseEdgeConfig {
  minimumHouseEdge: number;        // 5% minimum
  baseHouseEdge: number;           // 7% standard
  highRiskHouseEdge: number;       // 15% for high-bet rounds
  maxPayoutRatio: number;          // 80% of house bankroll max
  bettingThresholds: {
    low: number;                   // < 100 SOL total bets
    medium: number;                // 100-500 SOL total bets  
    high: number;                  // > 500 SOL total bets
  };
}

interface GameRound {
  totalBetAmount: number;          // Sum of all active bets
  averageBetSize: number;          // Average bet per player
  playerCount: number;             // Number of active players
  houseBankroll: number;           // Available house funds
  previousRounds: RoundHistory[];  // Last 100 rounds for analysis
}

interface CrashPointResult {
  crashPoint: number;              // Final crash multiplier
  houseEdge: number;               // Calculated house advantage
  maxPayout: number;               // Maximum possible payout
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'; // Risk assessment
}
```

## Bet-Weighted Crash Point Generation

### Algorithm Flow

```typescript
const generateAdvancedCrashPoint = (gameRound: GameRound): CrashPointResult => {
  
  // Step 1: Assess Risk Level
  const riskLevel = assessRiskLevel(gameRound);
  
  // Step 2: Calculate Required House Edge
  const requiredHouseEdge = calculateRequiredHouseEdge(riskLevel, gameRound);
  
  // Step 3: Determine Maximum Safe Crash Point
  const maxSafeCrashPoint = calculateMaxSafeCrashPoint(gameRound, requiredHouseEdge);
  
  // Step 4: Generate Weighted Crash Point
  const crashPoint = generateWeightedCrashPoint(maxSafeCrashPoint, riskLevel);
  
  // Step 5: Validate House Edge
  const actualHouseEdge = validateHouseEdge(crashPoint, gameRound);
  
  return {
    crashPoint,
    houseEdge: actualHouseEdge,
    maxPayout: calculateMaxPayout(crashPoint, gameRound),
    riskLevel
  };
};
```

### Risk Level Assessment

```typescript
const assessRiskLevel = (gameRound: GameRound): 'LOW' | 'MEDIUM' | 'HIGH' => {
  const { totalBetAmount, houseBankroll } = gameRound;
  
  // Risk based on bet-to-bankroll ratio
  const riskRatio = totalBetAmount / houseBankroll;
  
  if (riskRatio < 0.01) return 'LOW';     // < 1% of bankroll
  if (riskRatio < 0.05) return 'MEDIUM';  // 1-5% of bankroll  
  return 'HIGH';                          // > 5% of bankroll
};
```

### House Edge Calculation

```typescript
const calculateRequiredHouseEdge = (riskLevel: string, gameRound: GameRound): number => {
  const baseEdge = 0.05; // 5% minimum
  
  switch (riskLevel) {
    case 'LOW':
      return baseEdge;           // 5% house edge
    case 'MEDIUM': 
      return baseEdge + 0.02;    // 7% house edge
    case 'HIGH':
      return baseEdge + 0.10;    // 15% house edge
    default:
      return baseEdge;
  }
};
```

## Mathematical House Edge Calculation

### Expected Value Formula

```typescript
// Expected house profit per round
const calculateExpectedProfit = (crashPoint: number, totalBets: number): number => {
  
  // If crash point < 1.0: House wins all bets
  if (crashPoint < 1.0) {
    return totalBets; // 100% house profit
  }
  
  // If crash point >= 1.0: House pays out (crashPoint * totalBets) - totalBets
  const totalPayout = totalBets * crashPoint;
  const houseProfit = totalBets - totalPayout;
  
  return houseProfit;
};

// House edge percentage
const calculateHouseEdgePercentage = (expectedProfit: number, totalBets: number): number => {
  return (expectedProfit / totalBets) * 100;
};
```

### Weighted Probability Distribution

```typescript
const generateWeightedCrashPoint = (maxSafeCrashPoint: number, riskLevel: string): number => {
  const random = Math.random();
  
  // Adjust probabilities based on risk level
  const lossThresholds = {
    'LOW': 0.60,     // 60% loss rate (normal)
    'MEDIUM': 0.75,  // 75% loss rate (higher edge)
    'HIGH': 0.95     // 95% loss rate (maximum protection)
  };
  
  const lossThreshold = lossThresholds[riskLevel];
  
  if (random < lossThreshold) {
    // Generate loss multiplier (0.01x - 0.99x)
    return generateLossMultiplier();
  } else {
    // Generate profit multiplier (1.01x - maxSafeCrashPoint)
    return generateLimitedProfitMultiplier(maxSafeCrashPoint);
  }
};
```

## Risk Management System

### Maximum Payout Protection

```typescript
const calculateMaxSafeCrashPoint = (gameRound: GameRound, requiredHouseEdge: number): number => {
  const { totalBetAmount, houseBankroll } = gameRound;
  
  // Never risk more than 80% of house bankroll
  const maxRisk = houseBankroll * 0.8;
  
  // Calculate maximum safe multiplier
  const maxSafeMultiplier = (maxRisk / totalBetAmount) + 1;
  
  // Apply house edge constraint
  const houseEdgeMultiplier = 1 / (1 - requiredHouseEdge);
  
  // Return the more conservative limit
  return Math.min(maxSafeMultiplier, houseEdgeMultiplier);
};
```

### High-Bet Game Logic

```typescript
const applyHighBetLogic = (gameRound: GameRound): CrashPointResult => {
  const { totalBetAmount } = gameRound;
  
  // High bet threshold (example: > 500 SOL)
  if (totalBetAmount > 500) {
    
    // Severely limit crash point (max 1.3x as you specified)
    const maxCrashPoint = 1.3;
    
    // Increase loss probability to 98%
    const lossThreshold = 0.98;
    
    if (Math.random() < lossThreshold) {
      // 98% chance: crash below 1x (house wins all)
      return {
        crashPoint: generateLossMultiplier(), // 0.01x - 0.99x
        houseEdge: 1.0, // 100% house edge (house wins all bets)
        maxPayout: 0,
        riskLevel: 'HIGH'
      };
    } else {
      // 2% chance: limited profit (1.01x - 1.3x max)
      return {
        crashPoint: 1.01 + (Math.random() * 0.29), // 1.01x - 1.3x
        houseEdge: calculateLimitedHouseEdge(1.3, totalBetAmount),
        maxPayout: totalBetAmount * 1.3,
        riskLevel: 'HIGH'
      };
    }
  }
  
  // Normal bet logic for lower amounts
  return generateNormalCrashPoint(gameRound);
};
```

## Implementation Specifications

### Configuration Parameters

```typescript
const HOUSE_EDGE_CONFIG = {
  // Minimum guaranteed house edge
  minimumHouseEdge: 0.05,        // 5%
  
  // Risk-based house edges
  lowRiskEdge: 0.05,             // 5% for small bets
  mediumRiskEdge: 0.07,          // 7% for medium bets
  highRiskEdge: 0.15,            // 15% for large bets
  
  // Betting thresholds (in SOL)
  lowBetThreshold: 100,          // < 100 SOL total
  mediumBetThreshold: 500,       // 100-500 SOL total
  highBetThreshold: 500,         // > 500 SOL total
  
  // Payout limitations
  maxPayoutRatio: 0.8,           // Max 80% of house bankroll
  highBetMaxMultiplier: 1.3,     // Max 1.3x for high-bet rounds
  highBetLossRate: 0.98,         // 98% loss rate for high bets
  
  // House protection
  emergencyStopThreshold: 0.9,   // Stop if house bankroll < 10%
  minimumBankrollRatio: 0.05,    // Always keep 5% reserve
};
```

### Crash Point Generation Logic

```typescript
const CRASH_POINT_LOGIC = {
  // Loss multiplier ranges
  bigLoss: { min: 0.01, max: 0.20, weight: 0.1 },      // 10% of losses
  mediumLoss: { min: 0.20, max: 0.50, weight: 0.2 },   // 20% of losses  
  smallLoss: { min: 0.50, max: 0.99, weight: 0.7 },    // 70% of losses
  
  // Profit multiplier ranges (when allowed)
  smallProfit: { min: 1.01, max: 2.00, weight: 0.4 },  // 40% of profits
  mediumProfit: { min: 2.00, max: 5.00, weight: 0.3 }, // 30% of profits
  bigProfit: { min: 5.00, max: 10.00, weight: 0.2 },   // 20% of profits
  hugePayout: { min: 10.00, max: 25.00, weight: 0.1 }, // 10% of profits
  
  // High-bet restrictions
  highBetMaxProfit: { min: 1.01, max: 1.30, weight: 1.0 }, // Limited range
};
```

### Monitoring & Analytics

```typescript
interface HousePerformanceMetrics {
  // House edge tracking
  currentHouseEdge: number;      // Real-time house advantage
  targetHouseEdge: number;       // Desired house advantage
  actualVsTarget: number;        // Performance vs target
  
  // Risk management
  totalExposure: number;         // Current betting exposure
  bankrollRatio: number;         // Bets vs available funds
  maxPayoutExposure: number;     // Maximum potential payout
  
  // Performance history
  last100Games: GameResult[];    // Recent game outcomes
  hourlyProfitLoss: number[];    // Hourly P&L tracking
  dailyHouseEdge: number[];      // Daily house edge performance
  
  // Alert thresholds
  riskAlerts: RiskAlert[];       // Active risk warnings
  performanceAlerts: Alert[];    // Performance issues
}
```

## Example Scenarios

### Scenario 1: Low Betting Volume (< 100 SOL)

```
Total Bets: 50 SOL
Risk Level: LOW
House Edge: 5%
Loss Probability: 60%
Max Crash Point: Unlimited (up to 25x)

Expected Outcome:
- 60% chance: 0.01x - 0.99x (House wins ~50 SOL)
- 40% chance: 1.01x - 25.00x (Variable house profit/loss)
```

### Scenario 2: Medium Betting Volume (100-500 SOL)

```
Total Bets: 300 SOL  
Risk Level: MEDIUM
House Edge: 7%
Loss Probability: 75%
Max Crash Point: Limited based on bankroll

Expected Outcome:
- 75% chance: 0.01x - 0.99x (House wins ~300 SOL)
- 25% chance: 1.01x - 10.00x (Limited profit range)
```

### Scenario 3: High Betting Volume (> 500 SOL)

```
Total Bets: 800 SOL
Risk Level: HIGH  
House Edge: 15% minimum
Loss Probability: 98%
Max Crash Point: 1.30x MAXIMUM

Expected Outcome:
- 98% chance: 0.01x - 0.99x (House wins ~800 SOL)
- 2% chance: 1.01x - 1.30x (Limited to 240 SOL max payout)
```

## Summary

This advanced algorithm ensures:

1. **Guaranteed House Profitability**: Minimum 5% edge, scaling up to 15%
2. **Risk-Based Adjustments**: Higher edges for riskier betting patterns  
3. **Maximum Payout Protection**: Caps on potential house losses
4. **Dynamic Loss Ratios**: Up to 98% loss rate for high-bet rounds
5. **Bankroll Protection**: Never risk more than 80% of available funds

The system adapts in real-time to betting patterns, ensuring the house maintains mathematical advantage while providing exciting gameplay for users.