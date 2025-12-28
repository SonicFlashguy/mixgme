import type React from 'react';
import { useScrollVisibility } from '../../hooks/useScrollVisibility';

type MiniChartProps = {
  multiplier: string;
  isGreen?: boolean;
};

const MiniChart: React.FC<MiniChartProps> = ({ multiplier, isGreen = true }) => {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-16 h-10 rounded border border-border-subtle ${isGreen ? 'bg-[#0c1a10]' : 'bg-[#1a0c0c]'} flex items-end justify-center overflow-hidden`}
      >
        <div
          className={`w-1 ${isGreen ? 'bg-[#2abb38]' : 'bg-[#be191c]'} h-6 mx-0.5`}
          style={{ height: `${Math.random() * 60 + 20}%` }}
        ></div>
        <div
          className={`w-1 ${isGreen ? 'bg-[#2abb38]' : 'bg-[#be191c]'} h-4 mx-0.5`}
          style={{ height: `${Math.random() * 60 + 20}%` }}
        ></div>
        <div
          className={`w-1 ${isGreen ? 'bg-[#2abb38]' : 'bg-[#be191c]'} h-8 mx-0.5`}
          style={{ height: `${Math.random() * 60 + 40}%` }}
        ></div>
        <div
          className={`w-1 ${isGreen ? 'bg-[#2abb38]' : 'bg-[#be191c]'} h-5 mx-0.5`}
          style={{ height: `${Math.random() * 40 + 60}%` }}
        ></div>
        <div
          className={`w-1 ${isGreen ? 'bg-[#2abb38]' : 'bg-[#be191c]'} h-9 mx-0.5`}
          style={{ height: `${Math.random() * 30 + 70}%` }}
        ></div>
      </div>
      <div className="text-white text-xs mt-1">
        {multiplier}x
      </div>
    </div>
  );
};

const MiniCharts: React.FC = () => {
  const scrollRef = useScrollVisibility();

  return (
    <div ref={scrollRef} className="grid grid-cols-10 gap-1 mb-4 overflow-x-auto scrollbar-minimal">
      <MiniChart multiplier="5.62" isGreen={true} />
      <MiniChart multiplier="1.11" isGreen={true} />
      <MiniChart multiplier="1.04" isGreen={true} />
      <MiniChart multiplier="2.90" isGreen={true} />
      <MiniChart multiplier="1.06" isGreen={true} />
      <MiniChart multiplier="1.03" isGreen={true} />
      <MiniChart multiplier="9.31" isGreen={true} />
      <MiniChart multiplier="1.40" isGreen={true} />
      <MiniChart multiplier="3.83" isGreen={true} />
      <MiniChart multiplier="2.87" isGreen={true} />
    </div>
  );
};

export default MiniCharts;
