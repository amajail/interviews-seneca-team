/**
 * Layout Component
 * Main application layout wrapper
 * Follows SRP - responsible for overall page structure
 */

import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Navigation from './Navigation';

export interface LayoutProps {
  children?: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header Section */}
      <Header />

      {/* Navigation Section */}
      <Navigation />

      {/* Main Content Area */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Render children if provided, otherwise use Outlet for React Router */}
          {children || <Outlet />}
        </div>
      </main>

      {/* Footer (optional - can be added later) */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Interview Tracking System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
