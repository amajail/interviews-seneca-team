import { TableEntity, TableEntityResult } from '@azure/data-tables';
import { Candidate, CandidateStatus, InterviewStage } from '../../../domain/entities/Candidate';

/**
 * Maps Candidate domain entity to Azure Table Storage entity
 * Azure Table Storage SDK requires Date objects to be valid Date instances
 */
export function toTableEntity(candidate: Candidate): TableEntity {
  // Azure Table Storage uses partitionKey and rowKey as identifiers
  // We don't need to store id separately since rowKey is already the unique identifier
  // Exclude empty strings as Azure Table Storage may reject them

  // Ensure required date fields are valid Date instances
  const ensureDate = (date: Date | string): Date => {
    if (date instanceof Date) return date;
    return new Date(date);
  };

  const entity: Record<string, unknown> = {
    partitionKey: candidate.partitionKey,
    rowKey: candidate.rowKey,
    name: candidate.name,
    email: candidate.email,
    position: candidate.position,
    status: candidate.status,
    interviewStage: candidate.interviewStage,
    applicationDate: ensureDate(candidate.applicationDate),
    createdAt: ensureDate(candidate.createdAt),
    updatedAt: ensureDate(candidate.updatedAt),
  };

  // Only include optional string fields if they have non-empty values
  if (candidate.phone && candidate.phone.trim() !== '') {
    entity.phone = candidate.phone;
  }
  if (candidate.notes && candidate.notes.trim() !== '') {
    entity.notes = candidate.notes;
  }
  if (candidate.createdBy && candidate.createdBy.trim() !== '') {
    entity.createdBy = candidate.createdBy;
  }
  if (candidate.updatedBy && candidate.updatedBy.trim() !== '') {
    entity.updatedBy = candidate.updatedBy;
  }

  // Include numeric fields (0 is a valid value)
  if (candidate.expectedSalary != null) {
    entity.expectedSalary = candidate.expectedSalary;
  }
  if (candidate.yearsOfExperience != null) {
    entity.yearsOfExperience = candidate.yearsOfExperience;
  }

  return entity as TableEntity;
}

/**
 * Maps Azure Table Storage entity to Candidate domain entity
 */
export function fromTableEntity(entity: TableEntityResult<Record<string, unknown>>): Candidate {
  return {
    id: (entity.id ?? entity.rowKey) as string,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    partitionKey: entity.partitionKey!,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    rowKey: entity.rowKey!,
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
    updatedBy: entity.updatedBy ? (entity.updatedBy as string) : undefined,
  };
}
