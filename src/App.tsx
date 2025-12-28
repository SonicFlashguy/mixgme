import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import { BettingProvider } from './context/BettingContext';

function App() {
  return (
    <BettingProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />} />
          <Route path="/crates" element={<MainLayout />} />
          <Route path="/leaderboard" element={<MainLayout />} />
          <Route path="*" element={<MainLayout />} />
        </Routes>
      </Router>
    </BettingProvider>
  );
}

export default App;
