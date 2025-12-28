/**
 * Technical Analysis Library for Cryptocurrency Trading
 * Implements RSI, MACD, Moving Averages, Bollinger Bands, and Volume Analysis
 */

import type { CandleData } from '../types/chart';

export interface TechnicalIndicator {
  name: string;
  value: number;
  signal: 'bullish' | 'bearish' | 'neutral';
  strength: number; // 0-1
  timestamp: number;
}

export interface RSIData extends TechnicalIndicator {
  overbought: boolean;
  oversold: boolean;
  divergence?: 'bullish' | 'bearish';
}

export interface MACDData extends TechnicalIndicator {
  macdLine: number;
  signalLine: number;
  histogram: number;
  crossover?: 'bullish' | 'bearish';
}

export interface MovingAverageData extends TechnicalIndicator {
  period: number;
  type: 'sma' | 'ema' | 'wma';
  trend: 'up' | 'down' | 'sideways';
}

export interface BollingerBandsData {
  upper: number;
  middle: number;
  lower: number;
  squeeze: boolean;
  position: 'above' | 'below' | 'inside';
  signal: 'bullish' | 'bearish' | 'neutral';
}

export interface VolumeAnalysisData {
  volume: number;
  volumeMA: number;
  volumeRatio: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  signal: 'bullish' | 'bearish' | 'neutral';
}

export interface TechnicalAnalysisResult {
  rsi: RSIData;
  macd: MACDData;
  sma20: MovingAverageData;
  sma50: MovingAverageData;
  ema12: MovingAverageData;
  ema26: MovingAverageData;
  bollingerBands: BollingerBandsData;
  volumeAnalysis: VolumeAnalysisData;
  overallSignal: 'strong_bullish' | 'bullish' | 'neutral' | 'bearish' | 'strong_bearish';
  confidence: number;
}

/**
 * Calculate Simple Moving Average (SMA)
 */
export function calculateSMA(prices: number[], period: number): number[] {
  const sma: number[] = [];
  
  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      sma.push(Number.NaN);
      continue;
    }
    
    const sum = prices.slice(i - period + 1, i + 1).reduce((acc, price) => acc + price, 0);
    sma.push(sum / period);
  }
  
  return sma;
}

/**
 * Calculate Exponential Moving Average (EMA)
 */
export function calculateEMA(prices: number[], period: number): number[] {
  const ema: number[] = [];
  const multiplier = 2 / (period + 1);
  
  // First EMA is SMA
  let previousEMA = prices.slice(0, period).reduce((sum, price) => sum + price, 0) / period;
  
  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      ema.push(Number.NaN);
      continue;
    }
    
    if (i === period - 1) {
      ema.push(previousEMA);
    } else {
      const currentEMA = (prices[i] * multiplier) + (previousEMA * (1 - multiplier));
      ema.push(currentEMA);
      previousEMA = currentEMA;
    }
  }
  
  return ema;
}

/**
 * Calculate Relative Strength Index (RSI)
 */
export function calculateRSI(prices: number[], period = 14): RSIData[] {
  const rsiValues: RSIData[] = [];
  
  if (prices.length < period + 1) {
    return rsiValues;
  }
  
  // Calculate price changes
  const changes: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i - 1]);
  }
  
  // Calculate initial average gains and losses
  let avgGain = 0;
  let avgLoss = 0;
  
  for (let i = 0; i < period; i++) {
    const change = changes[i];
    if (change > 0) {
      avgGain += change;
    } else {
      avgLoss -= change;
    }
  }
  
  avgGain /= period;
  avgLoss /= period;
  
  // Calculate RSI for each subsequent period
  for (let i = period; i < changes.length; i++) {
    const change = changes[i];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? -change : 0;
    
    // Smooth the averages
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    
    const rs = avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));
    
    const overbought = rsi > 70;
    const oversold = rsi < 30;
    
    let signal: 'bullish' | 'bearish' | 'neutral' = 'neutral';
    let strength = 0.5;
    
    if (oversold) {
      signal = 'bullish';
      strength = Math.max(0, (30 - rsi) / 30);
    } else if (overbought) {
      signal = 'bearish';
      strength = Math.max(0, (rsi - 70) / 30);
    } else {
      strength = Math.abs(rsi - 50) / 20;
    }
    
    rsiValues.push({
      name: 'RSI',
      value: rsi,
      signal,
      strength,
      timestamp: Date.now(),
      overbought,
      oversold
    });
  }
  
  return rsiValues;
}

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 */
export function calculateMACD(prices: number[], fastPeriod = 12, slowPeriod = 26, signalPeriod = 9): MACDData[] {
  const macdValues: MACDData[] = [];
  
  const emaFast = calculateEMA(prices, fastPeriod);
  const emaSlow = calculateEMA(prices, slowPeriod);
  
  // Calculate MACD line
  const macdLine: number[] = [];
  for (let i = 0; i < prices.length; i++) {
    if (!isNaN(emaFast[i]) && !isNaN(emaSlow[i])) {
      macdLine.push(emaFast[i] - emaSlow[i]);
    } else {
      macdLine.push(Number.NaN);
    }
  }
  
  // Calculate signal line (EMA of MACD line)
  const validMacdValues = macdLine.filter(val => !isNaN(val));
  const signalLine = calculateEMA(validMacdValues, signalPeriod);
  
  // Calculate histogram and signals
  for (let i = Math.max(fastPeriod, slowPeriod) - 1; i < prices.length; i++) {
    const macd = macdLine[i];
    const signal = signalLine[i - (Math.max(fastPeriod, slowPeriod) - 1)] || 0;
    const histogram = macd - signal;
    
    let crossover: 'bullish' | 'bearish' | undefined;
    let signalType: 'bullish' | 'bearish' | 'neutral' = 'neutral';
    let strength = 0.5;
    
    if (histogram > 0) {
      signalType = 'bullish';
      strength = Math.min(1, Math.abs(histogram) / 0.1);
    } else if (histogram < 0) {
      signalType = 'bearish';
      strength = Math.min(1, Math.abs(histogram) / 0.1);
    }
    
    macdValues.push({
      name: 'MACD',
      value: macd,
      signal: signalType,
      strength,
      timestamp: Date.now(),
      macdLine: macd,
      signalLine: signal,
      histogram,
      crossover
    });
  }
  
  return macdValues;
}

/**
 * Calculate Bollinger Bands
 */
export function calculateBollingerBands(prices: number[], period = 20, stdDev = 2): BollingerBandsData[] {
  const bollingerBands: BollingerBandsData[] = [];
  const sma = calculateSMA(prices, period);
  
  for (let i = period - 1; i < prices.length; i++) {
    const priceSlice = prices.slice(i - period + 1, i + 1);
    const middle = sma[i];
    
    // Calculate standard deviation
    const variance = priceSlice.reduce((sum, price) => sum + Math.pow(price - middle, 2), 0) / period;
    const standardDeviation = Math.sqrt(variance);
    
    const upper = middle + (standardDeviation * stdDev);
    const lower = middle - (standardDeviation * stdDev);
    
    const currentPrice = prices[i];
    const bandWidth = upper - lower;
    const squeeze = bandWidth < (middle * 0.1); // Band width less than 10% of price
    
    let position: 'above' | 'below' | 'inside' = 'inside';
    let signal: 'bullish' | 'bearish' | 'neutral' = 'neutral';
    
    if (currentPrice > upper) {
      position = 'above';
      signal = 'bearish'; // Price above upper band suggests overbought
    } else if (currentPrice < lower) {
      position = 'below';
      signal = 'bullish'; // Price below lower band suggests oversold
    }
    
    bollingerBands.push({
      upper,
      middle,
      lower,
      squeeze,
      position,
      signal
    });
  }
  
  return bollingerBands;
}

/**
 * Analyze volume patterns
 */
export function analyzeVolume(candles: CandleData[], period = 20): VolumeAnalysisData[] {
  const volumeAnalysis: VolumeAnalysisData[] = [];
  const volumes = candles.map(candle => candle.volume || 0);
  const volumeMA = calculateSMA(volumes, period);
  
  for (let i = period - 1; i < candles.length; i++) {
    const volume = volumes[i];
    const volumeAvg = volumeMA[i];
    const volumeRatio = volumeAvg > 0 ? volume / volumeAvg : 1;
    
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    let signal: 'bullish' | 'bearish' | 'neutral' = 'neutral';
    
    if (i >= 3) {
      const recentVolumes = volumes.slice(i - 2, i + 1);
      const avgRecent = recentVolumes.reduce((sum, vol) => sum + vol, 0) / recentVolumes.length;
      const prevVolumes = volumes.slice(i - 5, i - 2);
      const avgPrev = prevVolumes.reduce((sum, vol) => sum + vol, 0) / prevVolumes.length;
      
      if (avgRecent > avgPrev * 1.2) {
        trend = 'increasing';
        signal = 'bullish';
      } else if (avgRecent < avgPrev * 0.8) {
        trend = 'decreasing';
        signal = 'bearish';
      }
    }
    
    volumeAnalysis.push({
      volume,
      volumeMA: volumeAvg,
      volumeRatio,
      trend,
      signal
    });
  }
  
  return volumeAnalysis;
}

/**
 * Comprehensive technical analysis
 */
export function performTechnicalAnalysis(candles: CandleData[]): TechnicalAnalysisResult | null {
  if (candles.length < 50) {
    return null; // Need at least 50 candles for reliable analysis
  }
  
  const prices = candles.map(candle => candle.close);
  const latestIndex = prices.length - 1;
  
  // Calculate all indicators
  const rsiData = calculateRSI(prices);
  const macdData = calculateMACD(prices);
  const sma20Data = calculateSMA(prices, 20);
  const sma50Data = calculateSMA(prices, 50);
  const ema12Data = calculateEMA(prices, 12);
  const ema26Data = calculateEMA(prices, 26);
  const bollingerData = calculateBollingerBands(prices);
  const volumeData = analyzeVolume(candles);
  
  // Get latest values
  const latestRSI = rsiData[rsiData.length - 1];
  const latestMACD = macdData[macdData.length - 1];
  const latestBollinger = bollingerData[bollingerData.length - 1];
  const latestVolume = volumeData[volumeData.length - 1];
  
  const currentPrice = prices[latestIndex];
  const sma20 = sma20Data[latestIndex];
  const sma50 = sma50Data[latestIndex];
  const ema12 = ema12Data[latestIndex];
  const ema26 = ema26Data[latestIndex];
  
  // Create moving average indicators
  const sma20Indicator: MovingAverageData = {
    name: 'SMA20',
    value: sma20,
    signal: currentPrice > sma20 ? 'bullish' : 'bearish',
    strength: Math.abs(currentPrice - sma20) / currentPrice,
    timestamp: Date.now(),
    period: 20,
    type: 'sma',
    trend: sma20 > sma20Data[latestIndex - 1] ? 'up' : 'down'
  };
  
  const sma50Indicator: MovingAverageData = {
    name: 'SMA50',
    value: sma50,
    signal: currentPrice > sma50 ? 'bullish' : 'bearish',
    strength: Math.abs(currentPrice - sma50) / currentPrice,
    timestamp: Date.now(),
    period: 50,
    type: 'sma',
    trend: sma50 > sma50Data[latestIndex - 1] ? 'up' : 'down'
  };
  
  const ema12Indicator: MovingAverageData = {
    name: 'EMA12',
    value: ema12,
    signal: currentPrice > ema12 ? 'bullish' : 'bearish',
    strength: Math.abs(currentPrice - ema12) / currentPrice,
    timestamp: Date.now(),
    period: 12,
    type: 'ema',
    trend: ema12 > ema12Data[latestIndex - 1] ? 'up' : 'down'
  };
  
  const ema26Indicator: MovingAverageData = {
    name: 'EMA26',
    value: ema26,
    signal: currentPrice > ema26 ? 'bullish' : 'bearish',
    strength: Math.abs(currentPrice - ema26) / currentPrice,
    timestamp: Date.now(),
    period: 26,
    type: 'ema',
    trend: ema26 > ema26Data[latestIndex - 1] ? 'up' : 'down'
  };
  
  // Calculate overall signal
  const signals = [
    latestRSI?.signal,
    latestMACD?.signal,
    sma20Indicator.signal,
    sma50Indicator.signal,
    ema12Indicator.signal,
    ema26Indicator.signal,
    latestBollinger?.signal,
    latestVolume?.signal
  ].filter(s => s !== 'neutral');
  
  const bullishCount = signals.filter(s => s === 'bullish').length;
  const bearishCount = signals.filter(s => s === 'bearish').length;
  const totalSignals = signals.length;
  
  let overallSignal: 'strong_bullish' | 'bullish' | 'neutral' | 'bearish' | 'strong_bearish' = 'neutral';
  let confidence = 0;
  
  if (totalSignals > 0) {
    const bullishRatio = bullishCount / totalSignals;
    const bearishRatio = bearishCount / totalSignals;
    
    if (bullishRatio >= 0.75) {
      overallSignal = 'strong_bullish';
      confidence = bullishRatio;
    } else if (bullishRatio >= 0.6) {
      overallSignal = 'bullish';
      confidence = bullishRatio;
    } else if (bearishRatio >= 0.75) {
      overallSignal = 'strong_bearish';
      confidence = bearishRatio;
    } else if (bearishRatio >= 0.6) {
      overallSignal = 'bearish';
      confidence = bearishRatio;
    } else {
      confidence = 0.5;
    }
  }
  
  return {
    rsi: latestRSI,
    macd: latestMACD,
    sma20: sma20Indicator,
    sma50: sma50Indicator,
    ema12: ema12Indicator,
    ema26: ema26Indicator,
    bollingerBands: latestBollinger,
    volumeAnalysis: latestVolume,
    overallSignal,
    confidence
  };
}

/**
 * Get trading recommendation based on technical analysis
 */
export function getTradingRecommendation(analysis: TechnicalAnalysisResult): {
  action: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
  confidence: number;
  reasoning: string[];
} {
  const reasoning: string[] = [];
  let score = 0;
  
  // RSI analysis
  if (analysis.rsi.oversold) {
    score += 2;
    reasoning.push(`RSI is oversold (${analysis.rsi.value.toFixed(1)}) - potential buying opportunity`);
  } else if (analysis.rsi.overbought) {
    score -= 2;
    reasoning.push(`RSI is overbought (${analysis.rsi.value.toFixed(1)}) - potential selling opportunity`);
  }
  
  // MACD analysis
  if (analysis.macd.histogram > 0) {
    score += 1;
    reasoning.push('MACD histogram is positive - bullish momentum');
  } else {
    score -= 1;
    reasoning.push('MACD histogram is negative - bearish momentum');
  }
  
  // Moving average analysis
  if (analysis.sma20.signal === 'bullish' && analysis.sma50.signal === 'bullish') {
    score += 2;
    reasoning.push('Price above both SMA20 and SMA50 - strong uptrend');
  } else if (analysis.sma20.signal === 'bearish' && analysis.sma50.signal === 'bearish') {
    score -= 2;
    reasoning.push('Price below both SMA20 and SMA50 - strong downtrend');
  }
  
  // Bollinger Bands analysis
  if (analysis.bollingerBands.position === 'below') {
    score += 1;
    reasoning.push('Price below lower Bollinger Band - oversold condition');
  } else if (analysis.bollingerBands.position === 'above') {
    score -= 1;
    reasoning.push('Price above upper Bollinger Band - overbought condition');
  }
  
  // Volume analysis
  if (analysis.volumeAnalysis.trend === 'increasing' && analysis.volumeAnalysis.signal === 'bullish') {
    score += 1;
    reasoning.push('Increasing volume supports bullish momentum');
  }
  
  // Determine action based on score
  let action: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
  if (score >= 4) {
    action = 'strong_buy';
  } else if (score >= 2) {
    action = 'buy';
  } else if (score <= -4) {
    action = 'strong_sell';
  } else if (score <= -2) {
    action = 'sell';
  } else {
    action = 'hold';
  }
  
  return {
    action,
    confidence: analysis.confidence,
    reasoning
  };
}
