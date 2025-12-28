import type React from 'react';
import Header from './Header';
import Sidebar from '../Chat/Sidebar';
import CrashChart from '../Chart/CrashChart'; // Production-ready chart (was CandlestickChart)
import MiniCharts from '../Chart/MiniCharts';
import Multipliers from '../Chart/Multipliers';
import TradingControls from '../Trading/TradingControls';
import Leaderboard, { RecentWinners } from '../Leaderboard/Leaderboard';
import { useScrollVisibility } from '../../hooks/useScrollVisibility';

const MainLayout: React.FC = () => {
  const mainScrollRef = useScrollVisibility();

  return (
    <div className="flex flex-col min-h-screen bg-[#0e0c0d]">
      <Header />

      <main className="flex-1 overflow-hidden grid grid-cols-12 gap-4 p-4">
        {/* Sidebar - Chat */}
        <div className="col-span-3 h-[calc(100vh-80px)] overflow-hidden">
          <div className="border border-border-light rounded-lg h-full">
            <Sidebar />
          </div>
        </div>

        {/* Main content */}
        <div ref={mainScrollRef} className="col-span-9 h-[calc(100vh-80px)] overflow-auto scrollbar-minimal pb-8">
          <div className="mb-4 border border-border-light rounded-lg p-4">
            <h2 className="text-white text-xl font-bold mb-4"></h2>
            <Multipliers />
            <MiniCharts />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 border border-border-light rounded-lg p-4">
              <CrashChart />
              <TradingControls />
            </div>

            <div className="col-span-1 border border-border-light rounded-lg p-4">
              <RecentWinners />
              <div className="mt-4">
                <Leaderboard />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
