/**
 * Form Date Picker Component
 * Reusable date input using HTML5 date input
 */

import type { UseFormRegister, FieldValues, Path } from 'react-hook-form';
import { FormFieldError } from './FormFieldError';

export interface FormDatePickerProps<T extends FieldValues> {
  label: string;
  name: Path<T>;
  register: UseFormRegister<T>;
  error?: string;
  required?: boolean;
  minDate?: string;
  maxDate?: string;
}

export function FormDatePicker<T extends FieldValues>({
  label,
  name,
  register,
  error,
  required = false,
  minDate,
  maxDate,
}: FormDatePickerProps<T>) {
  return (
    <div className="w-full">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        id={name}
        type="date"
        min={minDate}
        max={maxDate}
        className={`
          w-full px-3 py-2 border rounded-md shadow-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${error ? 'border-red-500' : 'border-gray-300'}
        `}
        {...register(name)}
      />
      <FormFieldError error={error} />
    </div>
  );
}
