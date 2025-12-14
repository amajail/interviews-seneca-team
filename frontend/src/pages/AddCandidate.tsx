/**
 * Add Candidate Page
 * Form to add a new candidate
 */

import React from 'react';

export const AddCandidate: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Add New Candidate</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">
          This page will contain a form to add new candidates to the system.
        </p>
        <div className="mt-4 text-sm text-gray-500">
          Coming soon: Candidate form with validation.
        </div>
      </div>
    </div>
  );
};

export default AddCandidate;
