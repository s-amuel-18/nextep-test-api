import { validateIsbn } from '../../../src/shared/utils/isbn.validator';

describe('validateIsbn', () => {
  describe('ISBN-13', () => {
    it('should return true for a valid ISBN-13', () => {
      expect(validateIsbn('9788437604947')).toBe(true);
    });

    it('should return true for a valid ISBN-13 with hyphens', () => {
      expect(validateIsbn('978-84-376-0494-7')).toBe(true);
    });

    it('should return true for a valid ISBN-13 with spaces', () => {
      expect(validateIsbn('978 84 376 0494 7')).toBe(true);
    });

    it('should return false for an ISBN-13 with an invalid checksum', () => {
      expect(validateIsbn('9788437604940')).toBe(false);
    });

    it('should return false for a 13-digit string that is not all digits', () => {
      expect(validateIsbn('978843760494X')).toBe(false);
    });
  });

  describe('ISBN-10', () => {
    it('should return true for a valid ISBN-10', () => {
      expect(validateIsbn('0306406152')).toBe(true);
    });

    it('should return true for a valid ISBN-10 with hyphens', () => {
      expect(validateIsbn('0-306-40615-2')).toBe(true);
    });

    it('should return true for a valid ISBN-10 with X as check digit', () => {
      expect(validateIsbn('080442957X')).toBe(true);
    });

    it('should return false for an ISBN-10 with an invalid checksum', () => {
      expect(validateIsbn('0306406150')).toBe(false);
    });

    it('should return false for an ISBN-10 with letters in wrong position', () => {
      expect(validateIsbn('030640615X')).toBe(false);
    });
  });

  describe('Invalid inputs', () => {
    it('should return false for a string that is too short', () => {
      expect(validateIsbn('12345678')).toBe(false);
    });

    it('should return false for a string that is too long', () => {
      expect(validateIsbn('97884376049471')).toBe(false);
    });

    it('should return false for an empty string', () => {
      expect(validateIsbn('')).toBe(false);
    });

    it('should return false for a string of length 11', () => {
      expect(validateIsbn('12345678901')).toBe(false);
    });
  });
});
