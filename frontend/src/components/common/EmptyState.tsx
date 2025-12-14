/**
 * EmptyState Component
 * Displays when no data is available
 * Follows SRP - responsible only for empty state rendering
 */

import React from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-12">
      <div className="text-center">
        {icon && <div className="mx-auto mb-4 flex justify-center text-gray-400">{icon}</div>}
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-6">{description}</p>
        {actionLabel && onAction && (
          <Button onClick={onAction} variant="primary">
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
