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

export class CandidateApiService {
  private readonly basePath = '/candidates';

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
    return httpClient.post<Candidate>(this.basePath, data);
  }

  async updateCandidate(id: string, data: UpdateCandidateDto): Promise<Candidate> {
    return httpClient.put<Candidate>(`${this.basePath}/${id}`, data);
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

  async importCandidates(file: File): Promise<{ success: number; failed: number; errors: string[] }> {
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
