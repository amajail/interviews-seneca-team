/**
 * Candidate List Page
 * Displays list of all candidates
 */

import React from 'react';

export const CandidateList: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Candidates</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">
          This page will display a list of all candidates in a table format.
        </p>
        <div className="mt-4 text-sm text-gray-500">
          Coming soon: Candidate table with search, filter, and pagination.
        </div>
      </div>
    </div>
  );
};

export default CandidateList;
