import React from 'react';

const MainChart: React.FC = () => {
  return (
    <div className="chart-container border border-border-light rounded-lg overflow-hidden relative p-4 h-[325px] bg-gray-900">
      <div className="text-white text-center p-8">
        <h1 className="text-2xl font-bold mb-4">MainChart Component Loaded ✅</h1>
        <p className="text-lg">If you can see this, the component is working</p>
        <div className="mt-4 text-green-400">
          Current time: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default MainChart;
