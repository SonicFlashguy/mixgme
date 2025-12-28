import type React from 'react';
import { useScrollVisibility } from '../../hooks/useScrollVisibility';

type Player = {
  id: number;
  rank?: number;
  name: string;
  pnl: number;
  level?: number;
  percentage?: number;
};

const leaderboardData: Player[] = [
  { id: 1, rank: 1, name: 'Yur', pnl: 58.412 },
  { id: 2, rank: 2, name: 'Goldmine', pnl: 32.148 },
  { id: 3, rank: 3, name: 'GKK', pnl: 16.787 },
  { id: 4, rank: 4, name: 'omg3lol', pnl: 16.011 },
  { id: 5, rank: 5, name: '5to21', pnl: 15.702 },
  { id: 6, rank: 6, name: 'moon', pnl: 15.084 },
  { id: 7, rank: 7, name: 'Anon', pnl: 14.286 },
  { id: 8, rank: 8, name: 'Soro12', pnl: 13.606 },
  { id: 9, rank: 9, name: 'Anon', pnl: 12.563 },
  { id: 10, rank: 10, name: '42seth', pnl: 10.869 },
  { id: 11, rank: 11, name: 'Shpion', pnl: 8.689 },
  { id: 12, rank: 12, name: 'hako', pnl: 7.888 },
  { id: 13, rank: 13, name: 'NO1', pnl: 7.328 },
  { id: 14, rank: 14, name: 'voided', pnl: 7.263 },
  { id: 15, rank: 15, name: 'NotGOB', pnl: 7.032 },
  { id: 16, rank: 16, name: 'wha', pnl: 6.934 },
  { id: 17, rank: 17, name: 'Jeets', pnl: 6.886 },
  { id: 18, rank: 18, name: 'siris', pnl: 5.605 },
  { id: 19, rank: 19, name: 'EgyptianxFaris', pnl: 5.251 },
  { id: 20, rank: 20, name: 'MoezDW', pnl: 5.185 },
];

const recentWinners = [
  { id: 101, name: 'WizRider22', pnl: 0.193, level: 41, percentage: 91.76 },
  { id: 102, name: 'Jxm', pnl: 0.182, level: 66, percentage: 90.81 },
  { id: 103, name: 'Irishwolf710', pnl: 0.152, level: 47, percentage: 80.14 },
  { id: 104, name: 'GetYourAce', pnl: 0.140, level: 54, percentage: 70.70 },
  { id: 105, name: 'GOB', pnl: 0.117, level: 51, percentage: 66.40 },
];

// Helper function to get badge color based on level
const getBadgeColorForLevel = (level: number) => {
  if (level >= 50) return '#d4af37'; // Gold
  if (level >= 30) return '#C0C0C0'; // Silver
  if (level >= 15) return '#CD7F32'; // Bronze
  return '#617c9c'; // Basic blue
};

const Leaderboard: React.FC = () => {
  const scrollRef = useScrollVisibility();

  return (
    <div ref={scrollRef} className="leaderboard-container bg-[#0e0c0d] border border-border-light rounded-lg p-4 max-h-80 overflow-y-auto scrollbar-minimal">
      <h2 className="text-center text-white text-xl font-bold mb-6">
        Leaderboard
      </h2>
      <div className="text-gray-400 text-sm mb-2 text-center">Updates every 5 minutes</div>

      <div className="grid grid-cols-3 text-gray-400 text-sm mb-2 px-2">
        <div>Rank</div>
        <div>Player</div>
        <div className="text-right">PNL</div>
      </div>

      <div className="space-y-2">
        {leaderboardData.map((player) => (
          <div key={player.id} className="grid grid-cols-3 text-white py-1 px-2 hover:bg-gray-800 rounded border border-border-subtle">
            <div className="text-gray-400">{player.rank}</div>
            <div>{player.name}</div>
            <div className="text-right text-green-500">+{player.pnl.toFixed(3)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const RecentWinners: React.FC = () => {
  return (
    <div className="space-y-2 mt-4">
      {recentWinners.map((player) => (
        <div key={player.id} className="flex items-center justify-between bg-[#0e0c0d] border border-border-light p-2 rounded-md">
          <div className="flex items-center">
            {player.level && (
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white mr-2"
                style={{ backgroundColor: getBadgeColorForLevel(player.level) }}
              >
                {player.level}
              </div>
            )}
            <span className="text-white">{player.name}</span>
          </div>
          <div className="flex items-center">
            <span className="text-green-500 mr-1">+{player.pnl.toFixed(3)}</span>
            <img src="/icons/solana.png" alt="SOL" className="w-4 h-4" />
            {player.percentage && (
              <div className="ml-2 text-green-500">+{player.percentage.toFixed(2)}%</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Leaderboard;
