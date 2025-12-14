/**
 * Candidate Detail Page
 * Displays comprehensive candidate information organized in sections
 * Follows SRP - responsible only for displaying candidate details
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { ErrorState } from '@/components/common/ErrorState';
import { candidateApi } from '@/services/api';
import { formatDate, formatPhone, formatStatusLabel } from '@/utils/formatters';
import type { Candidate } from '@/models';

export const CandidateDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchCandidate = async () => {
      if (!id) {
        setError('Candidate ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await candidateApi.getCandidateById(id);
        setCandidate(data);
      } catch (err) {
        if (err instanceof Error && err.message.includes('404')) {
          setError('Candidate not found');
        } else {
          setError(err instanceof Error ? err.message : 'Failed to load candidate details');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCandidate();
  }, [id]);

  const handleBack = () => {
    navigate('/candidates');
  };

  const handleEdit = () => {
    navigate(`/candidates/${id}/edit`);
  };

  const handleDelete = async () => {
    if (!id || !candidate) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${candidate.fullName}? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      await candidateApi.deleteCandidate(id);
      navigate('/candidates', { replace: true });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete candidate');
    } finally {
      setDeleting(false);
    }
  };

  const handleRetry = () => {
    window.location.reload();
  };

  const getStatusBadgeClass = (status: string) => {
    const baseClasses = 'px-3 py-1 text-sm font-semibold rounded-full inline-block';
    switch (status) {
      case 'new':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'screening':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'interviewing':
        return `${baseClasses} bg-purple-100 text-purple-800`;
      case 'offered':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'hired':
        return `${baseClasses} bg-green-200 text-green-900`;
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    const baseClasses = 'px-3 py-1 text-sm font-semibold rounded-full inline-block';
    switch (priority) {
      case 'urgent':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'high':
        return `${baseClasses} bg-orange-100 text-orange-800`;
      case 'medium':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'low':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="flex gap-3">
            <div className="h-10 w-20 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-20 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-20 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-6 space-y-4">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="space-y-3">
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div>
        <div className="mb-6">
          <Button onClick={handleBack} variant="ghost">
            ← Back to Candidates
          </Button>
        </div>
        <ErrorState
          message={error || 'Candidate not found'}
          onRetry={error?.includes('not found') ? undefined : handleRetry}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <Button onClick={handleBack} variant="ghost" className="mb-2">
            ← Back to Candidates
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">{candidate.fullName}</h1>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleEdit} variant="secondary">
            Edit
          </Button>
          <Button onClick={handleDelete} variant="danger" loading={deleting}>
            Delete
          </Button>
        </div>
      </div>

      {/* Contact Information Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">
          Contact Information
        </h2>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Email</dt>
            <dd className="mt-1 text-sm text-gray-900">
              <a href={`mailto:${candidate.email}`} className="text-blue-600 hover:underline">
                {candidate.email}
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Phone</dt>
            <dd className="mt-1 text-sm text-gray-900">
              <a href={`tel:${candidate.phone}`} className="text-blue-600 hover:underline">
                {formatPhone(candidate.phone)}
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Source</dt>
            <dd className="mt-1 text-sm text-gray-900">{candidate.source}</dd>
          </div>
          {candidate.resumeUrl && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Resume</dt>
              <dd className="mt-1 text-sm">
                <a
                  href={candidate.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View Resume →
                </a>
              </dd>
            </div>
          )}
        </dl>
      </div>

      {/* Position & Status Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">
          Position & Status
        </h2>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Position Applied For</dt>
            <dd className="mt-1 text-sm text-gray-900 font-semibold">
              {candidate.positionAppliedFor}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Application Date</dt>
            <dd className="mt-1 text-sm text-gray-900">{formatDate(candidate.applicationDate)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Current Status</dt>
            <dd className="mt-1">
              <span className={getStatusBadgeClass(candidate.currentStatus)}>
                {formatStatusLabel(candidate.currentStatus)}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Interview Stage</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {formatStatusLabel(candidate.interviewStage)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Priority</dt>
            <dd className="mt-1">
              <span className={getPriorityBadgeClass(candidate.priority)}>
                {formatStatusLabel(candidate.priority)}
              </span>
            </dd>
          </div>
          {candidate.nextFollowUpDate && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Next Follow-Up</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {formatDate(candidate.nextFollowUpDate)}
              </dd>
            </div>
          )}
        </dl>
      </div>

      {/* Interview Details Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">
          Interview Details
        </h2>
        <dl className="space-y-4">
          {candidate.interviewerNames && candidate.interviewerNames.length > 0 && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Interviewers</dt>
              <dd className="mt-1 text-sm text-gray-900">
                <ul className="list-disc list-inside">
                  {candidate.interviewerNames.map((name, index) => (
                    <li key={index}>{name}</li>
                  ))}
                </ul>
              </dd>
            </div>
          )}
          {candidate.technicalSkillsRating !== undefined && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Technical Skills Rating</dt>
              <dd className="mt-1 text-sm text-gray-900">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`h-5 w-5 ${
                          star <= candidate.technicalSkillsRating!
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-gray-600">({candidate.technicalSkillsRating}/5)</span>
                </div>
              </dd>
            </div>
          )}
          {candidate.interviewNotes && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Interview Notes</dt>
              <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap bg-gray-50 p-4 rounded">
                {candidate.interviewNotes}
              </dd>
            </div>
          )}
          {candidate.decisionStatus && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Decision Status</dt>
              <dd className="mt-1 text-sm text-gray-900">{candidate.decisionStatus}</dd>
            </div>
          )}
          {candidate.offerDetails && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Offer Details</dt>
              <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap bg-gray-50 p-4 rounded">
                {candidate.offerDetails}
              </dd>
            </div>
          )}
        </dl>
      </div>

      {/* Metadata Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">
          Record Information
        </h2>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Created</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {formatDate(candidate.createdAt)}
              {candidate.createdBy && (
                <span className="text-gray-500"> by {candidate.createdBy}</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {formatDate(candidate.updatedAt)}
              {candidate.updatedBy && (
                <span className="text-gray-500"> by {candidate.updatedBy}</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Candidate ID</dt>
            <dd className="mt-1 text-sm text-gray-500 font-mono">{candidate.id}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
};

export default CandidateDetail;
