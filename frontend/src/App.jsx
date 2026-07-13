import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import dashboardBg from './assets/dashboard-bg.jpg';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ComplaintSubmit from './pages/ComplaintSubmit';
import ComplaintDetails from './pages/ComplaintDetails';
import Profile from './pages/Profile';

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { darkMode } = useAuth();

  const overlay = darkMode 
    ? 'linear-gradient(rgba(15, 23, 42, 0.88), rgba(15, 23, 42, 0.88))'
    : 'linear-gradient(rgba(248, 250, 252, 0.85), rgba(248, 250, 252, 0.85))';

  return (
    <div 
      className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-200"
      style={{
        backgroundImage: `${overlay}, url(${dashboardBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-1 min-w-0">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 p-4 md:p-8 fade-in-page min-w-0 overflow-x-hidden">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/complaints/:id" element={<ComplaintDetails />} />
            
            {/* Student Only Routes inside Layout */}
            <Route element={<ProtectedRoute allowedRoles={['student']} />}>
              <Route path="/submit-complaint" element={<ComplaintSubmit />} />
            </Route>

            {/* Catch-all redirect inside app */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes Wrapper */}
          <Route element={<ProtectedRoute />}>
            <Route path="/*" element={<AppLayout />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

