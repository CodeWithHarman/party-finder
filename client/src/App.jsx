import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { FindParty } from './pages/FindParty';
import { PostParty } from './pages/PostParty';
import './styles/globals.css';
import { ToastProvider } from './components/ui/Toast';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/find" element={<FindParty />} />
              <Route path="/post" element={<PostParty />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          
       </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;