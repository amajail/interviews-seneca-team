/**
 * Candidate Form Component
 * Comprehensive form for adding and editing candidates
 * Follows SRP - responsible only for candidate form logic
 */

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { FormInput, FormTextarea, FormSelect, FormDatePicker } from '@/components/forms';
import { candidateFormSchema, type CandidateFormData } from '@/schemas/candidateFormSchema';
import { candidateApi } from '@/services/api';
import { useToast } from '@/hooks/useToast';
import type { Candidate, CreateCandidateDto, UpdateCandidateDto } from '@/models';

export interface CandidateFormProps {
  mode?: 'create' | 'edit';
  candidateId?: string;
  onSuccess?: (candidate: Candidate) => void;
  onCancel?: () => void;
  initialData?: Partial<Candidate>;
}

export const CandidateForm: React.FC<CandidateFormProps> = ({
  mode = 'create',
  candidateId,
  onSuccess,
  onCancel,
  initialData,
}) => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingCandidate, setLoadingCandidate] = useState(mode === 'edit');
  const [candidateETag, setCandidateETag] = useState<string | undefined>();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CandidateFormData>({
    resolver: zodResolver(candidateFormSchema),
    defaultValues: {
      fullName: initialData?.fullName || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      positionAppliedFor: initialData?.positionAppliedFor || '',
      applicationDate: initialData?.applicationDate || new Date().toISOString().split('T')[0],
      source: initialData?.source || '',
      priority: initialData?.priority || 'medium',
      currentStatus: initialData?.currentStatus || 'new',
      interviewStage: initialData?.interviewStage || 'initial_screening',
      resumeUrl: initialData?.resumeUrl || '',
      technicalSkillsRating: initialData?.technicalSkillsRating,
      interviewerNames: initialData?.interviewerNames?.join('\n') || '',
      interviewNotes: initialData?.interviewNotes || '',
      nextFollowUpDate: initialData?.nextFollowUpDate || '',
      expectedSalary: initialData?.expectedSalary,
      yearsOfExperience: initialData?.yearsOfExperience,
    },
  });

  // Fetch candidate data in edit mode
  useEffect(() => {
    if (mode === 'edit' && candidateId) {
      const fetchCandidate = async () => {
        try {
          setLoadingCandidate(true);
          const candidate = await candidateApi.getCandidateById(candidateId);

          // Store eTag for optimistic concurrency
          setCandidateETag(candidate.eTag);

          // Populate form with candidate data
          reset({
            fullName: candidate.fullName,
            email: candidate.email,
            phone: candidate.phone,
            positionAppliedFor: candidate.positionAppliedFor,
            applicationDate: candidate.applicationDate.split('T')[0],
            source: candidate.source,
            priority: candidate.priority,
            currentStatus: candidate.currentStatus,
            interviewStage: candidate.interviewStage,
            resumeUrl: candidate.resumeUrl || '',
            technicalSkillsRating: candidate.technicalSkillsRating,
            interviewerNames: candidate.interviewerNames?.join('\n') || '',
            interviewNotes: candidate.interviewNotes || '',
            nextFollowUpDate: candidate.nextFollowUpDate || '',
            expectedSalary: candidate.expectedSalary,
            yearsOfExperience: candidate.yearsOfExperience,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load candidate';
          showError(errorMessage);
        } finally {
          setLoadingCandidate(false);
        }
      };

      fetchCandidate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // Note: reset and showError are stable functions and don't need to be dependencies
  }, [mode, candidateId]);

  const onSubmit = async (data: CandidateFormData) => {
    try {
      setIsSubmitting(true);

      // Transform form data
      const candidateData = {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone || '',
        positionAppliedFor: data.positionAppliedFor,
        applicationDate: data.applicationDate,
        source: data.source,
        priority: data.priority,
        currentStatus: data.currentStatus || 'new',
        interviewStage: data.interviewStage || 'initial_screening',
        resumeUrl: data.resumeUrl || undefined,
        technicalSkillsRating: data.technicalSkillsRating,
        interviewerNames: data.interviewerNames
          ? data.interviewerNames.split('\n').filter((name) => name.trim())
          : [],
        interviewNotes: data.interviewNotes || undefined,
        nextFollowUpDate: data.nextFollowUpDate || undefined,
        expectedSalary: data.expectedSalary,
        yearsOfExperience: data.yearsOfExperience,
      };

      let candidate: Candidate;

      if (mode === 'edit' && candidateId) {
        // Update existing candidate
        const updateDto: UpdateCandidateDto = candidateData;
        candidate = await candidateApi.updateCandidate(candidateId, updateDto, candidateETag);
        showSuccess('Candidate updated successfully!');
      } else {
        // Create new candidate
        const createDto: CreateCandidateDto = candidateData;
        candidate = await candidateApi.createCandidate(createDto);
        showSuccess('Candidate added successfully!');
        reset();
      }

      if (onSuccess) {
        onSuccess(candidate);
      } else {
        // Navigate to candidate detail page
        navigate(`/candidates/${candidate.id}`);
      }
    } catch (error: unknown) {
      // Handle concurrency conflicts
      if (error && typeof error === 'object' && 'code' in error) {
        if (error.code === 'CONCURRENCY_CONFLICT') {
          showError(
            'This candidate was modified by someone else. Please refresh the page and try again.'
          );
          return;
        }
      }

      const errorMessage =
        error instanceof Error
          ? error.message
          : mode === 'edit'
            ? 'Failed to update candidate'
            : 'Failed to add candidate';
      showError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset the form? All data will be lost.')) {
      reset();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate('/candidates');
    }
  };

  // Show loading state while fetching candidate in edit mode
  if (loadingCandidate) {
    return (
      <div className="space-y-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-3">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Basic Information Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">
          Basic Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Full Name"
            name="fullName"
            register={register}
            error={errors.fullName?.message}
            required
            placeholder="John Doe"
            disabled={isSubmitting}
          />
          <FormInput
            label="Email"
            name="email"
            type="email"
            register={register}
            error={errors.email?.message}
            required
            placeholder="john.doe@example.com"
            disabled={isSubmitting}
          />
          <FormInput
            label="Phone"
            name="phone"
            type="tel"
            register={register}
            error={errors.phone?.message}
            placeholder="+1 (555) 123-4567"
            disabled={isSubmitting}
          />
          <FormInput
            label="Source"
            name="source"
            register={register}
            error={errors.source?.message}
            required
            placeholder="LinkedIn, Referral, Career Fair, etc."
            disabled={isSubmitting}
          />
        </div>
      </div>

      {/* Position Details Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">
          Position & Application
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Position Applied For"
            name="positionAppliedFor"
            register={register}
            error={errors.positionAppliedFor?.message}
            required
            placeholder="Software Engineer, Product Manager, etc."
            disabled={isSubmitting}
          />
          <FormDatePicker
            label="Application Date"
            name="applicationDate"
            register={register}
            error={errors.applicationDate?.message}
            required
          />
        </div>
      </div>

      {/* Status & Priority Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">
          Status & Priority
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormSelect
            label="Current Status"
            name="currentStatus"
            register={register}
            error={errors.currentStatus?.message}
            options={[
              { value: 'new', label: 'New' },
              { value: 'screening', label: 'Screening' },
              { value: 'interviewing', label: 'Interviewing' },
              { value: 'offered', label: 'Offered' },
              { value: 'hired', label: 'Hired' },
              { value: 'rejected', label: 'Rejected' },
            ]}
            disabled={isSubmitting}
          />
          <FormSelect
            label="Interview Stage"
            name="interviewStage"
            register={register}
            error={errors.interviewStage?.message}
            options={[
              { value: 'initial_screening', label: 'Initial Screening' },
              { value: 'phone_interview', label: 'Phone Interview' },
              { value: 'technical_interview', label: 'Technical Interview' },
              { value: 'behavioral_interview', label: 'Behavioral Interview' },
              { value: 'final_interview', label: 'Final Interview' },
            ]}
            disabled={isSubmitting}
          />
          <FormSelect
            label="Priority"
            name="priority"
            register={register}
            error={errors.priority?.message}
            required
            options={[
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
              { value: 'urgent', label: 'Urgent' },
            ]}
            disabled={isSubmitting}
          />
        </div>
      </div>

      {/* Additional Details Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">
          Additional Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="w-full">
            <label htmlFor="expectedSalary" className="block text-sm font-medium text-gray-700 mb-1">
              Expected Salary
            </label>
            <input
              id="expectedSalary"
              type="number"
              placeholder="70000"
              className={`
                w-full px-3 py-2 border rounded-md shadow-sm
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                ${errors.expectedSalary ? 'border-red-500' : 'border-gray-300'}
              `}
              disabled={isSubmitting}
              {...register('expectedSalary', { valueAsNumber: true })}
            />
            {errors.expectedSalary?.message && (
              <p className="mt-1 text-sm text-red-600">{errors.expectedSalary.message}</p>
            )}
          </div>
          <div className="w-full">
            <label htmlFor="yearsOfExperience" className="block text-sm font-medium text-gray-700 mb-1">
              Years of Experience
            </label>
            <input
              id="yearsOfExperience"
              type="number"
              placeholder="5"
              className={`
                w-full px-3 py-2 border rounded-md shadow-sm
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                ${errors.yearsOfExperience ? 'border-red-500' : 'border-gray-300'}
              `}
              disabled={isSubmitting}
              {...register('yearsOfExperience', { valueAsNumber: true })}
            />
            {errors.yearsOfExperience?.message && (
              <p className="mt-1 text-sm text-red-600">{errors.yearsOfExperience.message}</p>
            )}
          </div>
          <div className="w-full">
            <label htmlFor="technicalSkillsRating" className="block text-sm font-medium text-gray-700 mb-1">
              Technical Skills Rating (1-5)
            </label>
            <input
              id="technicalSkillsRating"
              type="number"
              placeholder="4"
              min={1}
              max={5}
              className={`
                w-full px-3 py-2 border rounded-md shadow-sm
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                ${errors.technicalSkillsRating ? 'border-red-500' : 'border-gray-300'}
              `}
              disabled={isSubmitting}
              {...register('technicalSkillsRating', { valueAsNumber: true })}
            />
            {errors.technicalSkillsRating?.message && (
              <p className="mt-1 text-sm text-red-600">{errors.technicalSkillsRating.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Notes & Documents Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">
          Notes & Documents
        </h2>
        <div className="space-y-4">
          <FormInput
            label="Resume URL"
            name="resumeUrl"
            type="url"
            register={register}
            error={errors.resumeUrl?.message}
            placeholder="https://example.com/resume.pdf"
            disabled={isSubmitting}
          />
          <FormTextarea
            label="Interview Notes"
            name="interviewNotes"
            register={register}
            error={errors.interviewNotes?.message}
            placeholder="Add any notes about the candidate's interviews, skills, or fit..."
            rows={6}
            maxLength={1000}
            disabled={isSubmitting}
          />
        </div>
      </div>

      {/* Interview Details Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">
          Interview Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormTextarea
            label="Interviewer Names"
            name="interviewerNames"
            register={register}
            error={errors.interviewerNames?.message}
            placeholder="Enter one name per line"
            rows={4}
            disabled={isSubmitting}
          />
          <FormDatePicker
            label="Next Follow-Up Date"
            name="nextFollowUpDate"
            register={register}
            error={errors.nextFollowUpDate?.message}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 bg-gray-50 px-6 py-4 rounded-lg">
        <Button type="button" variant="ghost" onClick={handleCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="button" variant="secondary" onClick={handleReset} disabled={isSubmitting}>
          Reset
        </Button>
        <Button type="submit" variant="primary" loading={isSubmitting} disabled={isSubmitting}>
          {isSubmitting
            ? mode === 'edit'
              ? 'Saving...'
              : 'Adding...'
            : mode === 'edit'
              ? 'Save Changes'
              : 'Add Candidate'}
        </Button>
      </div>
    </form>
  );
};

export default CandidateForm;
