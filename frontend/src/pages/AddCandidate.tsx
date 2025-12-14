/**
 * Add Candidate Page
 * Form to add a new candidate
 * Follows SRP - responsible only for page layout and navigation
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { CandidateForm } from '@/components/candidates';
import type { Candidate } from '@/models';

export const AddCandidate: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = (candidate: Candidate) => {
    // Navigate to the newly created candidate's detail page
    navigate(`/candidates/${candidate.id}`);
  };

  const handleCancel = () => {
    // Navigate back to candidates list
    navigate('/candidates');
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <Button onClick={handleCancel} variant="ghost" className="mb-2">
            ← Back to Candidates
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Add New Candidate</h1>
        </div>
      </div>

      {/* Form Section */}
      <CandidateForm onSuccess={handleSuccess} onCancel={handleCancel} />
    </div>
  );
};

export default AddCandidate;
