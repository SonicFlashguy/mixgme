import type React from 'react';
import ErrorBoundary from '../ErrorBoundary/ErrorBoundary';

const SimpleLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <ErrorBoundary>
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">CryptoCash 2.0</h1>
          <p className="text-lg mb-8">Application is loading...</p>
          <div className="max-w-4xl mx-auto bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl mb-4">Debug Information</h2>
            <p>If you see this, React is rendering correctly.</p>
            <p>Timestamp: {new Date().toLocaleString()}</p>
            <button 
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
              onClick={() => console.log('Button clicked!')}
            >
              Test Button
            </button>
          </div>
        </div>
      </ErrorBoundary>
    </div>
  );
};

export default SimpleLayout;
