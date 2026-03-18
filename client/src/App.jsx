import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { FindParty } from './pages/FindParty';
import { PostParty } from './pages/PostParty';
import './styles/globals.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/find" element={<FindParty />} />
          <Route path="/post" element={<PostParty />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;