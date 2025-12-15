/**
 * Candidate API Service
 * Handles all API calls related to candidates
 * Implements Repository pattern for data access
 */

import httpClient from './httpClient';
import type {
  Candidate,
  CreateCandidateDto,
  UpdateCandidateDto,
  CandidateFilters,
  PaginatedResponse,
} from '../../models';
import {
  BackendCandidateStatus,
  BackendInterviewStage,
  type BackendCreateCandidateDto,
} from '../../models/BackendCandidate';

export class CandidateApiService {
  private readonly basePath = '/candidates';

  /**
   * Maps frontend CreateCandidateDto to backend-compatible format
   * Transforms field names to match backend schema
   */
  private mapToBackendDto(frontendDto: CreateCandidateDto): BackendCreateCandidateDto {
    // Map frontend status to backend status enum
    const statusMap: Record<string, BackendCandidateStatus> = {
      new: BackendCandidateStatus.NEW,
      screening: BackendCandidateStatus.SCREENING,
      interviewing: BackendCandidateStatus.INTERVIEWING,
      offered: BackendCandidateStatus.OFFER,
      hired: BackendCandidateStatus.HIRED,
      rejected: BackendCandidateStatus.REJECTED,
    };

    // Map frontend interview stage to backend interview stage enum
    const stageMap: Record<string, BackendInterviewStage> = {
      initial_screening: BackendInterviewStage.NOT_STARTED,
      phone_interview: BackendInterviewStage.PHONE_SCREEN,
      technical_interview: BackendInterviewStage.TECHNICAL,
      behavioral_interview: BackendInterviewStage.BEHAVIORAL,
      final_interview: BackendInterviewStage.FINAL,
    };

    return {
      name: frontendDto.fullName,
      email: frontendDto.email,
      phone: frontendDto.phone || undefined,
      position: frontendDto.positionAppliedFor,
      status: frontendDto.currentStatus ? statusMap[frontendDto.currentStatus] : undefined,
      interviewStage: frontendDto.interviewStage ? stageMap[frontendDto.interviewStage] : undefined,
      applicationDate: frontendDto.applicationDate,
      expectedSalary: frontendDto.expectedSalary,
      yearsOfExperience: frontendDto.yearsOfExperience,
      notes: frontendDto.interviewNotes || undefined,
    };
  }

  async getCandidates(
    filters?: CandidateFilters,
    pageSize?: number,
    continuationToken?: string
  ): Promise<PaginatedResponse<Candidate>> {
    const params = new URLSearchParams();

    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.stage) params.append('stage', filters.stage);
    if (filters?.position) params.append('position', filters.position);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    if (pageSize) params.append('pageSize', pageSize.toString());
    if (continuationToken) params.append('continuationToken', continuationToken);

    const queryString = params.toString();
    const url = queryString ? `${this.basePath}?${queryString}` : this.basePath;

    return httpClient.get<PaginatedResponse<Candidate>>(url);
  }

  async getCandidateById(id: string): Promise<Candidate> {
    return httpClient.get<Candidate>(`${this.basePath}/${id}`);
  }

  async createCandidate(data: CreateCandidateDto): Promise<Candidate> {
    const backendDto = this.mapToBackendDto(data);
    return httpClient.post<Candidate>(this.basePath, backendDto);
  }

  async updateCandidate(
    id: string,
    data: UpdateCandidateDto,
    eTag?: string
  ): Promise<Candidate> {
    const backendDto = this.mapToBackendDto(data);
    const headers = eTag ? { 'If-Match': eTag } : {};

    return httpClient.put<Candidate>(`${this.basePath}/${id}`, backendDto, { headers });
  }

  async deleteCandidate(id: string): Promise<void> {
    return httpClient.delete<void>(`${this.basePath}/${id}`);
  }

  async searchCandidates(
    filters: CandidateFilters,
    pageSize?: number,
    continuationToken?: string
  ): Promise<PaginatedResponse<Candidate>> {
    return this.getCandidates(filters, pageSize, continuationToken);
  }

  async exportCandidates(filters?: CandidateFilters): Promise<Blob> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.stage) params.append('stage', filters.stage);
    if (filters?.position) params.append('position', filters.position);
    if (filters?.priority) params.append('priority', filters.priority);

    const queryString = params.toString();
    const url = queryString ? `${this.basePath}/export?${queryString}` : `${this.basePath}/export`;

    const response = await httpClient.getAxiosInstance().get(url, {
      responseType: 'blob',
    });

    return response.data;
  }

  async importCandidates(
    file: File
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    const formData = new FormData();
    formData.append('file', file);

    return httpClient.post(`${this.basePath}/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
}

export const candidateApi = new CandidateApiService();
export default candidateApi;
