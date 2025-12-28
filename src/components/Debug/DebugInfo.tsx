import type React from 'react';
import { useEffect, useState } from 'react';

const DebugInfo: React.FC = () => {
  const [renderCount, setRenderCount] = useState(0);

  useEffect(() => {
    setRenderCount(prev => prev + 1);
    console.log('🐛 DebugInfo component rendered:', renderCount + 1);
  }, []);

  return (
    <div className="fixed top-4 right-4 bg-blue-600 text-white p-2 rounded text-xs z-50">
      <div>App is rendering</div>
      <div>Render count: {renderCount}</div>
      <div>Time: {new Date().toLocaleTimeString()}</div>
    </div>
  );
};

export default DebugInfo;
