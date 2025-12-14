/**
 * Header Component
 * Displays the application header with title and branding
 * Follows SRP - responsible only for header rendering
 */

import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">Interview Tracking System</h1>
          </div>
          <div className="flex items-center space-x-4">
            {/* Future: User profile, notifications, etc. */}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
