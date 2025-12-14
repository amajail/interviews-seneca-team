import { TableEntity, TableEntityResult } from '@azure/data-tables';
import { Candidate, CandidateStatus, InterviewStage } from '../../../domain/entities/Candidate';

/**
 * Maps Candidate domain entity to Azure Table Storage entity
 */
export function toTableEntity(candidate: Candidate): TableEntity {
  return {
    partitionKey: candidate.partitionKey,
    rowKey: candidate.rowKey,
    id: candidate.id,
    name: candidate.name,
    email: candidate.email,
    phone: candidate.phone || '',
    position: candidate.position,
    status: candidate.status,
    interviewStage: candidate.interviewStage,
    applicationDate: candidate.applicationDate,
    expectedSalary: candidate.expectedSalary || 0,
    yearsOfExperience: candidate.yearsOfExperience || 0,
    notes: candidate.notes || '',
    createdAt: candidate.createdAt,
    updatedAt: candidate.updatedAt,
    createdBy: candidate.createdBy || '',
    updatedBy: candidate.updatedBy || ''
  };
}

/**
 * Maps Azure Table Storage entity to Candidate domain entity
 */
export function fromTableEntity(entity: TableEntityResult<Record<string, unknown>>): Candidate {
  return {
    id: entity.id as string,
    partitionKey: entity.partitionKey as string,
    rowKey: entity.rowKey as string,
    timestamp: entity.timestamp as Date | undefined,
    eTag: entity.etag as string | undefined,
    name: entity.name as string,
    email: entity.email as string,
    phone: entity.phone ? (entity.phone as string) : undefined,
    position: entity.position as string,
    status: entity.status as CandidateStatus,
    interviewStage: entity.interviewStage as InterviewStage,
    applicationDate: new Date(entity.applicationDate as Date),
    expectedSalary: entity.expectedSalary ? (entity.expectedSalary as number) : undefined,
    yearsOfExperience: entity.yearsOfExperience ? (entity.yearsOfExperience as number) : undefined,
    notes: entity.notes ? (entity.notes as string) : undefined,
    createdAt: new Date(entity.createdAt as Date),
    updatedAt: new Date(entity.updatedAt as Date),
    createdBy: entity.createdBy ? (entity.createdBy as string) : undefined,
    updatedBy: entity.updatedBy ? (entity.updatedBy as string) : undefined
  };
}
