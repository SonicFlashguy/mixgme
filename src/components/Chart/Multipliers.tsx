import type React from 'react';

type MultiplierProps = {
  icon: string;
  value: string;
};

const Multiplier: React.FC<MultiplierProps> = ({ icon, value }) => {
  return (
    <div className="flex items-center">
      <img src={icon} alt="Multiplier" className="multiplier-icon mr-2" />
      <span className="text-white text-xl font-bold">{value}</span>
    </div>
  );
};

const Multipliers: React.FC = () => {
  return (
    <div className="flex items-center justify-start space-x-6 mb-4">
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full bg-[#2b3753] border border-border-light flex items-center justify-center mr-2">
          <span className="text-white font-bold">2x</span>
        </div>
        <span className="text-white text-xl font-bold">47</span>
      </div>

      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full bg-[#d7c9b1] border border-border-light flex items-center justify-center mr-2">
          <span className="text-black font-bold">10x</span>
        </div>
        <span className="text-white text-xl font-bold">7</span>
      </div>

      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full bg-[#d4af37] border border-border-light flex items-center justify-center mr-2">
          <span className="text-black font-bold">50x</span>
        </div>
        <span className="text-white text-xl font-bold">0</span>
      </div>
    </div>
  );
};

export default Multipliers;
