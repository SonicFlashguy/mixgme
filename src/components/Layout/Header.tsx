import type React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="bg-background border-b border-border-light py-2 px-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Link to="/" className="flex items-center">
          <img src="/rugsfun_logo.png" alt="Rugs.fun" className="h-8 mr-2" />
          <span className="font-bold text-xl text-white">RUGS<span className="text-primary">.FUN</span></span>
          <span className="ml-1 text-xs bg-primary bg-opacity-20 text-primary px-1 rounded">BETA</span>
        </Link>

        <div className="hidden md:flex items-center space-x-4 ml-6">
          <Link to="/crates" className="text-gray-300 hover:text-white uppercase font-medium">
            CRATES
          </Link>
          <div className="relative">
            <div className="w-9 h-9 bg-[#6c1d1c] border border-border-light rounded-full flex items-center justify-center">
              <img src="/icons/fairness.svg" alt="Fairness" className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <div className="flex items-center">
          <div className="text-blue-400 mr-1">Level 0</div>
          <img src="/icons/faq.svg" alt="Info" className="w-5 h-5" />
        </div>

        <button className="rugpass-button">
          Rugpass
        </button>

        <button className="withdraw-button">
          WITHDRAW
        </button>

        <button className="deposit-button">
          DEPOSIT
        </button>

        <button className="connect-button">
          Connect
        </button>
      </div>
    </header>
  );
};

export default Header;
