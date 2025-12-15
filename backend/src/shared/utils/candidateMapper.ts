/**
 * Candidate Mapper
 * Maps backend Candidate entities to frontend-compatible format
 */

import type { Candidate } from '../../domain/entities/Candidate';

/**
 * Frontend-compatible Candidate interface
 * Matches the frontend's expected field names
 */
export interface FrontendCandidate {
  id: string;
  eTag?: string;
  timestamp?: string;
  fullName: string;
  email: string;
  phone: string;
  positionAppliedFor: string;
  applicationDate: string;
  currentStatus: string;
  interviewStage: string;
  source: string;
  priority: string;
  resumeUrl?: string;
  technicalSkillsRating?: number;
  interviewerNames: string[];
  interviewNotes?: string;
  nextFollowUpDate?: string;
  decisionStatus?: string;
  offerDetails?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

/**
 * Maps backend Candidate entity to frontend-compatible format
 */
/**
 * Helper function to safely convert date to ISO string
 */
function toISOStringSafe(date: Date | string | undefined | null): string {
  if (!date) {
    return new Date().toISOString();
  }

  if (date instanceof Date) {
    try {
      return date.toISOString();
    } catch {
      return new Date().toISOString();
    }
  }

  // If it's a string, try to parse it as a date
  if (typeof date === 'string') {
    try {
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate.toISOString();
      }
    } catch {
      // Fall through to return the string as-is
    }
    return date; // Return the string as-is if we can't parse it
  }

  return new Date().toISOString();
}

export function mapCandidateToFrontend(candidate: Candidate): FrontendCandidate {
  return {
    id: candidate.id || candidate.rowKey,
    eTag: candidate.eTag,
    timestamp: candidate.timestamp ? toISOStringSafe(candidate.timestamp) : undefined,
    fullName: candidate.name,
    email: candidate.email,
    phone: candidate.phone ?? '',
    positionAppliedFor: candidate.position,
    applicationDate: toISOStringSafe(candidate.applicationDate),
    currentStatus: candidate.status,
    interviewStage: candidate.interviewStage,
    source: 'Direct Application', // Default value, not in backend schema
    priority: 'medium', // Default value, not in backend schema
    resumeUrl: undefined,
    technicalSkillsRating: undefined,
    interviewerNames: [],
    interviewNotes: candidate.notes,
    nextFollowUpDate: undefined,
    decisionStatus: undefined,
    offerDetails: undefined,
    createdAt: toISOStringSafe(candidate.createdAt),
    updatedAt: toISOStringSafe(candidate.updatedAt),
    createdBy: candidate.createdBy,
    updatedBy: candidate.updatedBy,
  };
}

/**
 * Maps array of backend Candidates to frontend format
 */
export function mapCandidatesToFrontend(candidates: Candidate[]): FrontendCandidate[] {
  return candidates.map(mapCandidateToFrontend);
}
