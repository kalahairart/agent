
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const user = supabase.getCurrentUser();

  const handleLogout = async () => {
    await supabase.signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <Link to="/" className="text-2xl font-serif font-bold text-slate-800 tracking-tight">
                LUXE<span className="text-amber-600">VILLA</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-6">
              <Link to="/" className="text-sm font-medium text-slate-600 hover:text-amber-600 transition-colors">
                Find Villas
              </Link>
              {user ? (
                <>
                  <Link to="/admin" className="text-sm font-medium text-slate-600 hover:text-amber-600 transition-colors">
                    Dashboard
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="text-sm font-medium px-4 py-2 bg-slate-100 text-slate-700 rounded-full hover:bg-slate-200 transition-all"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link 
                  to="/admin/login" 
                  className="text-sm font-medium px-5 py-2.5 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-all shadow-sm"
                >
                  Agent Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xl font-serif font-bold text-white mb-4">LUXEVILLA</p>
          <p className="max-w-md mx-auto mb-8 text-sm leading-relaxed">
            Discover the world's most extraordinary villas. From beachfront mansions to mountain retreats, find your perfect escape.
          </p>
          <div className="flex justify-center space-x-6 mb-8 text-sm">
            <a href="#" className="hover:text-white transition-colors">About Us</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
          <p className="text-xs">&copy; {new Date().getFullYear()} LuxeVilla Agent Portal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
