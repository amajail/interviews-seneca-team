/**
 * useCandidates Hook
 * Custom hook for managing candidate data
 * Encapsulates data fetching, state management, and error handling
 */

import { useState, useEffect, useCallback } from 'react';
import { candidateApi } from '../services/api';
import type { Candidate, CandidateFilters, PaginatedResponse } from '../models';

interface UseCandidatesState {
  candidates: Candidate[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  hasMore: boolean;
  continuationToken?: string;
}

interface UseCandidatesReturn extends UseCandidatesState {
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
}

export function useCandidates(
  filters?: CandidateFilters,
  pageSize: number = 20
): UseCandidatesReturn {
  const [state, setState] = useState<UseCandidatesState>({
    candidates: [],
    loading: false,
    error: null,
    totalCount: 0,
    hasMore: false,
    continuationToken: undefined,
  });

  const fetchCandidates = useCallback(
    async (token?: string, append: boolean = false) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response: PaginatedResponse<Candidate> = await candidateApi.getCandidates(
          filters,
          pageSize,
          token
        );

        setState((prev) => ({
          candidates: append ? [...prev.candidates, ...response.items] : response.items,
          loading: false,
          error: null,
          totalCount: response.totalCount,
          hasMore: response.hasMore,
          continuationToken: response.continuationToken,
        }));
      } catch (err) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : 'Failed to fetch candidates',
        }));
      }
    },
    [filters, pageSize]
  );

  const refetch = useCallback(async () => {
    await fetchCandidates(undefined, false);
  }, [fetchCandidates]);

  const loadMore = useCallback(async () => {
    if (state.continuationToken && !state.loading) {
      await fetchCandidates(state.continuationToken, true);
    }
  }, [state.continuationToken, state.loading, fetchCandidates]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  return {
    ...state,
    refetch,
    loadMore,
  };
}
