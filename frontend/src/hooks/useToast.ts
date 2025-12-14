/**
 * Toast Notification Hook
 * Simple notification system for success/error messages
 * Uses browser alerts for MVP - can be upgraded to custom toast component later
 */

export interface UseToastReturn {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
}

export const useToast = (): UseToastReturn => {
  const showSuccess = (message: string) => {
    // For MVP, use browser alert
    // TODO: Replace with custom toast component in future
    alert(`✓ Success: ${message}`);
  };

  const showError = (message: string) => {
    // For MVP, use browser alert
    // TODO: Replace with custom toast component in future
    alert(`✗ Error: ${message}`);
  };

  return {
    showSuccess,
    showError,
  };
};
