/**
 * Form Textarea Component
 * Reusable textarea with character counter and validation
 */

import React, { useState } from 'react';
import type { UseFormRegister, FieldValues, Path } from 'react-hook-form';
import { FormFieldError } from './FormFieldError';

export interface FormTextareaProps<
  T extends FieldValues,
> extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  name: Path<T>;
  register: UseFormRegister<T>;
  error?: string;
  required?: boolean;
  maxLength?: number;
}

export function FormTextarea<T extends FieldValues>({
  label,
  name,
  register,
  error,
  required = false,
  placeholder,
  rows = 4,
  maxLength,
  className = '',
  ...rest
}: FormTextareaProps<T>) {
  const [charCount, setCharCount] = useState(0);

  return (
    <div className="w-full">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <textarea
        id={name}
        rows={rows}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`
          w-full px-3 py-2 border rounded-md shadow-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${error ? 'border-red-500' : 'border-gray-300'}
          ${className}
        `}
        {...register(name, {
          onChange: (e) => setCharCount(e.target.value.length),
        })}
        {...rest}
      />
      {maxLength && (
        <div className="mt-1 text-xs text-gray-500 text-right">
          {charCount}/{maxLength}
        </div>
      )}
      <FormFieldError error={error} />
    </div>
  );
}
