/**
 * Validation Utilities
 * Common validation functions following DRY principle
 */

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\d\s\-+()]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isEmpty = (value: string | null | undefined): boolean => {
  return !value || value.trim().length === 0;
};

export const isInRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};
