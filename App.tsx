
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'https://esm.sh/react-router-dom@7.13.0';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { VillaDetails } from './pages/VillaDetails';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { supabase } from './lib/supabase';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = supabase.getCurrentUser();
  return user ? <>{children}</> : <Navigate to="/admin/login" />;
};

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/villa/:id" element={<VillaDetails />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route 
            path="/admin" 
            element={
              <PrivateRoute>
                <AdminDashboard />
              </PrivateRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
