import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title, subtitle }) => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100">
      <Sidebar />
      
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="lg:ml-72 transition-all duration-300 ease-in-out">
        {/* Mobile header */}
        <div className="lg:hidden bg-white/95 backdrop-blur-xl border-b border-neutral-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-xl text-neutral-600 hover:bg-neutral-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg font-bold text-neutral-900">{title}</h1>
            <div className="w-10" /> {/* Spacer */}
          </div>
        </div>

        {/* Page header */}
        <header className="bg-white/70 backdrop-blur-xl border-b border-neutral-200/60 sticky top-0 lg:top-0 z-20">
          <div className="px-6 py-8 sm:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="animate-fade-in">
                <h1 className="text-3xl font-bold text-neutral-900 font-display">
                  {title}
                </h1>
                {subtitle && (
                  <p className="mt-2 text-neutral-600">{subtitle}</p>
                )}
              </div>
              
              {/* Quick actions */}
              <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                <div className="hidden sm:flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-neutral-900">
                      {user?.name || 'Admin User'}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {user?.email || 'admin@example.com'}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center text-white font-medium">
                    {(user?.name || 'A').charAt(0).toUpperCase()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="px-6 py-8 sm:px-8 animate-fade-in">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-neutral-200 bg-white/50 backdrop-blur-xl">
          <div className="px-6 py-6 sm:px-8">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between">
              <p className="text-sm text-neutral-500">
                © 2024 Restaurant Management System. All rights reserved.
              </p>
              <div className="mt-2 sm:mt-0 flex items-center space-x-6 text-sm text-neutral-500">
                <span>Version 1.0.0</span>
                <span>•</span>
                <span>Status: Operational</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;
