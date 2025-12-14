/**
 * Dashboard Page
 * Home page showing overview of interview tracking metrics
 */

import React from 'react';

export const Dashboard: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">
          Welcome to the Interview Tracking System. This dashboard will show key metrics and recent
          activity.
        </p>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900">Total Candidates</h3>
            <p className="text-2xl font-bold text-blue-600 mt-2">0</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-green-900">In Progress</h3>
            <p className="text-2xl font-bold text-green-600 mt-2">0</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-purple-900">Hired</h3>
            <p className="text-2xl font-bold text-purple-600 mt-2">0</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
