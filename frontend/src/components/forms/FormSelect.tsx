/**
 * Form Select Component
 * Reusable dropdown select with validation
 */

import React from 'react';
import type { UseFormRegister, FieldValues, Path } from 'react-hook-form';
import { FormFieldError } from './FormFieldError';

export interface SelectOption {
  value: string;
  label: string;
}

export interface FormSelectProps<
  T extends FieldValues,
> extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  name: Path<T>;
  register: UseFormRegister<T>;
  options: SelectOption[];
  error?: string;
  required?: boolean;
  placeholder?: string;
}

export function FormSelect<T extends FieldValues>({
  label,
  name,
  register,
  options,
  error,
  required = false,
  placeholder,
  className = '',
  ...rest
}: FormSelectProps<T>) {
  return (
    <div className="w-full">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        id={name}
        className={`
          w-full px-3 py-2 border rounded-md shadow-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${error ? 'border-red-500' : 'border-gray-300'}
          ${className}
        `}
        {...register(name)}
        {...rest}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <FormFieldError error={error} />
    </div>
  );
}
