/**
 * Edit Candidate Page
 * Page for editing existing candidate information
 */

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CandidateForm } from '@/components/candidates';
import { Button } from '@/components/common/Button';
import type { Candidate } from '@/models';

export const EditCandidate: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const handleSuccess = (candidate: Candidate) => {
    // Navigate back to candidate detail page
    navigate(`/candidates/${candidate.id}`);
  };

  const handleCancel = () => {
    // Navigate back to candidate detail page
    navigate(`/candidates/${id}`);
  };

  if (!id) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Invalid candidate ID</p>
        <Button onClick={() => navigate('/candidates')} className="mt-4">
          Back to Candidates
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button onClick={handleCancel} variant="ghost" className="mb-2">
            ← Back to Candidate
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Candidate</h1>
        </div>
      </div>

      <CandidateForm
        mode="edit"
        candidateId={id}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default EditCandidate;
