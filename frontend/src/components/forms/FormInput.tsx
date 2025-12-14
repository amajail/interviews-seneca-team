/**
 * Form Input Component
 * Reusable text input with validation and error handling
 */

import React from 'react';
import type { UseFormRegister, FieldValues, Path } from 'react-hook-form';
import { FormFieldError } from './FormFieldError';

export interface FormInputProps<
  T extends FieldValues,
> extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: Path<T>;
  register: UseFormRegister<T>;
  error?: string;
  required?: boolean;
}

export function FormInput<T extends FieldValues>({
  label,
  name,
  register,
  error,
  required = false,
  type = 'text',
  placeholder,
  className = '',
  ...rest
}: FormInputProps<T>) {
  return (
    <div className="w-full">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        id={name}
        type={type}
        placeholder={placeholder}
        className={`
          w-full px-3 py-2 border rounded-md shadow-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${error ? 'border-red-500' : 'border-gray-300'}
          ${className}
        `}
        {...register(name)}
        {...rest}
      />
      <FormFieldError error={error} />
    </div>
  );
}
