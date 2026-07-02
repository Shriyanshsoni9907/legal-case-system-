import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Route Guards
import ProtectedRoute from './routes/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Unauthorized from './pages/Unauthorized';
import ClientList from './pages/clients/ClientList';
import ClientDetails from './pages/clients/ClientDetails';
import CaseList from './pages/cases/CaseList';
import CaseDetails from './pages/cases/CaseDetails';
import LawyerList from './pages/lawyers/LawyerList';
import LawyerDetails from './pages/lawyers/LawyerDetails';
import HearingCalendar from './pages/hearings/HearingCalendar';
import SearchResults from './pages/SearchResults';

function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <Routes>
          {/* Public Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Route>

          {/* Protected Main App Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              
              {/* Clients Routes */}
              <Route path="/clients" element={<ClientList />} />
              <Route path="/clients/:id" element={<ClientDetails />} />

              {/* Cases Routes */}
              <Route path="/cases" element={<CaseList />} />
              <Route path="/cases/:id" element={<CaseDetails />} />

              {/* Lawyers Routes */}
              <Route path="/lawyers" element={<LawyerList />} />
              <Route path="/lawyers/:id" element={<LawyerDetails />} />

              {/* Hearings Routes */}
              <Route path="/hearings" element={<HearingCalendar />} />

              {/* Global Search Routes */}
              <Route path="/search" element={<SearchResults />} />
            </Route>
          </Route>

          {/* Fallback Catch-All */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </HashRouter>
  );
}

export default App;
