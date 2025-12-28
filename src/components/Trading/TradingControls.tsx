import type React from 'react';
import { useState, useEffect } from 'react';
import { useBetting } from '../../context/BettingContext';

type MultiplierButtonProps = {
  value: string;
  onClick: () => void;
};

const MultiplierButton: React.FC<MultiplierButtonProps> = ({ value, onClick }) => {
  return (
    <button
      className="bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white px-3 py-1 rounded text-sm border border-border-light"
      onClick={onClick}
    >
      {value}
    </button>
  );
};

const TradingControls: React.FC = () => {
  // Use our betting context instead of local state
  const {
    betAmount, setBetAmount,
    sellPercentage, setSellPercentage,
    balance,
    isPaperMode, setIsPaperMode,
    paperBalance,
    resetPaperBalance,
    playerBet,
    isGameActive,
    placeBet,
    cashOut,
    getCumulativePnL
  } = useBetting();
  
  const [selectedToken, setSelectedToken] = useState('SOL');
  
  // Update paper mode when token selection changes
  useEffect(() => {
    const newPaperMode = selectedToken === 'FREE';
    if (newPaperMode !== isPaperMode) {
      setIsPaperMode(newPaperMode);
      console.log('🔄 Paper mode', newPaperMode ? 'enabled' : 'disabled');
    }
  }, [selectedToken, isPaperMode, setIsPaperMode]);
  
  // Use appropriate balance based on mode
  const currentBalance = isPaperMode ? paperBalance : balance;
  const tokenAmount = currentBalance.toFixed(3);

  // Debug logging to track button states
  console.log('TradingControls state:', {
    isGameActive,
    playerBetActive: playerBet.isActive,
    betAmount,
    sellPercentage,
    currentBalance,
    isPaperMode,
    selectedToken
  });

  const handleBuyAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBetAmount(e.target.value);
  };

  const handleSellAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSellPercentage(e.target.value);
  };

  const applyMultiplier = (input: 'buy' | 'sell', value: string) => {
    if (input === 'buy') {
      setBetAmount(value);
    } else {
      setSellPercentage(value);
    }
  };

  return (
    <div className="mt-2">
      <div className="flex space-x-2 mt-4 mb-2">
        <MultiplierButton value="+0.001" onClick={() => applyMultiplier('buy', '0.001')} />
        <MultiplierButton value="+0.01" onClick={() => applyMultiplier('buy', '0.01')} />
        <MultiplierButton value="+0.1" onClick={() => applyMultiplier('buy', '0.1')} />
        <MultiplierButton value="+1" onClick={() => applyMultiplier('buy', '1')} />
        <MultiplierButton value="1/2" onClick={() => applyMultiplier('buy', (Number.parseFloat(tokenAmount) / 2).toString())} />
        <MultiplierButton value="x2" onClick={() => applyMultiplier('buy', (Number.parseFloat(betAmount) * 2).toString())} />
        <MultiplierButton value="MAX" onClick={() => applyMultiplier('buy', tokenAmount)} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="flex items-center mb-2">
            <h3 className="text-white text-xl font-bold">Buy</h3>
          </div>
          <div className="flex border border-border-light rounded">
            <input
              type="text"
              value={betAmount}
              onChange={handleBuyAmountChange}
              className="bg-[#0e0c0d] text-white w-full py-2 px-3 rounded-l outline-none border-none"
            />
            <div className="bg-[#1a1a1a] flex items-center rounded-r px-3 border-l border-border-light">
              <button
                className="text-white"
                onClick={() => setSelectedToken(selectedToken === 'SOL' ? 'FREE' : 'SOL')}
              >
                <div className="flex items-center">
                  <span className="mr-1">{selectedToken}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
              </button>
            </div>
          </div>
          <button 
            onClick={placeBet} 
            disabled={!isGameActive || playerBet.isActive}
            className="buy-button w-full mt-4 text-xl"
          >
            BUY
          </button>
        </div>

        <div>
          <div className="flex items-center mb-2">
            <h3 className="text-white text-xl font-bold">Sell</h3>
          </div>
          <div className="flex items-center border border-border-light rounded">
            <input
              type="text"
              value={sellPercentage}
              onChange={handleSellAmountChange}
              className="bg-[#0e0c0d] text-white w-full py-2 px-3 rounded-l outline-none border-none"
            />
            <div className="bg-[#1a1a1a] flex items-center rounded-r px-3 border-l border-border-light">
              <span className="text-white">%</span>
            </div>
          </div>
          <button 
            onClick={cashOut} 
            disabled={!isGameActive || !playerBet.isActive}
            className="sell-button w-full mt-4 text-xl"
          >
            SELL
          </button>
        </div>
        
        {/* Show active bet and P&L if a bet is active */}
        {playerBet.isActive && (
          <div className="col-span-2 mt-2 text-center text-white bg-black bg-opacity-50 py-1 px-2 rounded">
            <span>Active Bet: {playerBet.amount.toFixed(2)} @ {playerBet.entryMultiplier.toFixed(2)}x</span>
          </div>
        )}
      </div>

      {/* Account Balance Display - Replaces Leaderboard */}
      <div className="mt-8 text-center">
        <div className="bg-[#1a1a1a] border border-border-light rounded-lg p-4">
          <div className="flex items-center justify-center mb-2">
            <h3 className="text-white text-lg font-bold">
              {isPaperMode ? 'Paper Trading Balance' : 'Account Balance'}
            </h3>
            {isPaperMode && (
              <span className="ml-2 text-xs text-green-400 bg-green-900 px-2 py-1 rounded">
                PAPER MODE
              </span>
            )}
          </div>
          
          <div className="text-white text-2xl font-bold mb-2">
            {currentBalance.toFixed(3)} {selectedToken}
          </div>
          
          {/* Show cumulative PnL */}
          <div className="text-sm mb-3">
            <span className="text-gray-400">Session PnL: </span>
            <span className={getCumulativePnL() >= 0 ? 'text-green-400' : 'text-red-400'}>
              {getCumulativePnL() >= 0 ? '+' : ''}{getCumulativePnL().toFixed(3)} {selectedToken}
            </span>
          </div>
          
          {/* Refresh balance button for paper mode */}
          {isPaperMode && (
            <button
              onClick={resetPaperBalance}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
            >
              Reset to 1000 SOL
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TradingControls;
