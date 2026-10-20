import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './components/Toast/Toast';
import { HomePage } from './pages/HomePage';
import { JobsPage } from './pages/JobsPage';
import { CompaniesPage } from './pages/CompaniesPage';
import { DashboardPage } from './pages/DashboardPage';
import './styles/variables.css';

export function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/offres" element={<JobsPage />} />
            <Route path="/entreprises" element={<CompaniesPage />} />
            <Route path="/tableau-de-bord" element={<DashboardPage />} />
            <Route path="/entreprise/profil" element={<DashboardPage />} />
            <Route path="/candidat/profil" element={<DashboardPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
