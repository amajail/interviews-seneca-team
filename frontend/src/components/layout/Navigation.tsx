/**
 * Navigation Component
 * Main navigation menu with links to different pages
 * Follows SRP - responsible only for navigation rendering
 */

import React from 'react';
import { NavLink } from 'react-router-dom';

export interface NavigationItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
}

export interface NavigationProps {
  items?: NavigationItem[];
}

const defaultNavigationItems: NavigationItem[] = [
  { label: 'Dashboard', path: '/' },
  { label: 'Candidates', path: '/candidates' },
  { label: 'Add Candidate', path: '/candidates/new' },
];

export const Navigation: React.FC<NavigationProps> = ({ items = defaultNavigationItems }) => {
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `inline-flex items-center px-1 pt-4 pb-4 border-b-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`
              }
            >
              {item.icon && <span className="mr-2">{item.icon}</span>}
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
