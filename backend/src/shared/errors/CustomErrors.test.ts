import { NotFoundError, ValidationError, ConflictError, DatabaseError } from './CustomErrors';

describe('CustomErrors', () => {
  describe('NotFoundError', () => {
    it('should create error with correct message and name', () => {
      const error = new NotFoundError('Candidate', '123');

      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('NotFoundError');
      expect(error.message).toBe('Candidate with id 123 not found');
    });
  });

  describe('ValidationError', () => {
    it('should create error with message and name', () => {
      const error = new ValidationError('Invalid email format');

      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('ValidationError');
      expect(error.message).toBe('Invalid email format');
      expect(error.field).toBeUndefined();
    });

    it('should create error with field information', () => {
      const error = new ValidationError('Invalid format', 'email');

      expect(error.field).toBe('email');
      expect(error.message).toBe('Invalid format');
    });
  });

  describe('ConflictError', () => {
    it('should create error with correct message and name', () => {
      const error = new ConflictError('Resource already exists');

      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('ConflictError');
      expect(error.message).toBe('Resource already exists');
    });
  });

  describe('DatabaseError', () => {
    it('should create error with message and name', () => {
      const error = new DatabaseError('Connection failed');

      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('DatabaseError');
      expect(error.message).toBe('Connection failed');
      expect(error.originalError).toBeUndefined();
    });

    it('should create error with original error', () => {
      const originalError = new Error('Network timeout');
      const error = new DatabaseError('Database operation failed', originalError);

      expect(error.originalError).toBe(originalError);
      expect(error.message).toBe('Database operation failed');
    });
  });
});
