/**
 * Form Field Error Component
 * Displays validation error messages for form fields
 */

import React from 'react';

export interface FormFieldErrorProps {
  error?: string;
}

export const FormFieldError: React.FC<FormFieldErrorProps> = ({ error }) => {
  if (!error) return null;

  return (
    <div className="mt-1 flex items-center gap-1 text-sm text-red-600">
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
      <span>{error}</span>
    </div>
  );
};
