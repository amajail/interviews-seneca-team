/**
 * Candidate List Page
 * Displays list of all candidates with table, pagination, and state handling
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CandidateTable } from '@/components/candidates/CandidateTable';
import { TableSkeleton } from '@/components/common/TableSkeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { Pagination } from '@/components/common/Pagination';
import { Button } from '@/components/common/Button';
import { candidateApi } from '@/services/api';
import type { Candidate, PaginatedResponse } from '@/models';

export const CandidateList: React.FC = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [continuationToken, setContinuationToken] = useState<string | undefined>(undefined);
  const [hasNextPage, setHasNextPage] = useState(false);
  const pageSize = 20;

  const fetchCandidates = async (token?: string) => {
    try {
      setLoading(true);
      setError(null);
      const response: PaginatedResponse<Candidate> = await candidateApi.getCandidates(
        undefined,
        pageSize,
        token
      );
      setCandidates(response.items);
      setContinuationToken(response.continuationToken);
      setHasNextPage(response.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const handleNextPage = () => {
    if (continuationToken) {
      setCurrentPage((prev) => prev + 1);
      fetchCandidates(continuationToken);
    }
  };

  const handlePreviousPage = () => {
    // Note: Azure Table Storage continuation tokens are forward-only
    // For previous page, we'd need to implement client-side caching or different pagination strategy
    // For now, we'll just reset to page 1
    setCurrentPage(1);
    fetchCandidates();
  };

  const handleAddCandidate = () => {
    navigate('/candidates/new');
  };

  const handleRetry = () => {
    fetchCandidates();
  };

  if (loading) {
    return (
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Candidates</h1>
          <Button onClick={handleAddCandidate} variant="primary">
            Add Candidate
          </Button>
        </div>
        <TableSkeleton rows={10} columns={6} />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Candidates</h1>
          <Button onClick={handleAddCandidate} variant="primary">
            Add Candidate
          </Button>
        </div>
        <ErrorState message={error} onRetry={handleRetry} />
      </div>
    );
  }

  if (candidates.length === 0) {
    return (
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Candidates</h1>
          <Button onClick={handleAddCandidate} variant="primary">
            Add Candidate
          </Button>
        </div>
        <EmptyState
          title="No candidates found"
          description="Get started by adding your first candidate to the system."
          actionLabel="Add Candidate"
          onAction={handleAddCandidate}
          icon={
            <svg
              className="h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          }
        />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Candidates</h1>
        <Button onClick={handleAddCandidate} variant="primary">
          Add Candidate
        </Button>
      </div>

      <div className="space-y-4">
        <CandidateTable candidates={candidates} />
        <Pagination
          currentPage={currentPage}
          hasNextPage={hasNextPage}
          hasPreviousPage={currentPage > 1}
          onNextPage={handleNextPage}
          onPreviousPage={handlePreviousPage}
          pageSize={pageSize}
        />
      </div>
    </div>
  );
};

export default CandidateList;
