import { describe, it, expect } from 'vitest';
import { calculateNextReview } from './spaced-repetition.service';

describe('SpacedRepetitionService - SM-2 Algorithm', () => {
  describe('SM-2 Algorithm', () => {
    it('should calculate next review for first successful attempt (quality 4)', () => {
      const result = calculateNextReview(1, 0, 2.5, 4);
      
      expect(result.repetitions).toBe(1);
      expect(result.interval).toBe(1);
      expect(result.easeFactor).toBeCloseTo(2.36, 2);
    });

    it('should calculate next review for second successful attempt', () => {
      const result = calculateNextReview(1, 1, 2.5, 4);
      
      expect(result.repetitions).toBe(2);
      expect(result.interval).toBe(6);
      expect(result.easeFactor).toBeCloseTo(2.36, 2);
    });

    it('should calculate next review for third successful attempt', () => {
      const result = calculateNextReview(6, 2, 2.5, 4);
      
      expect(result.repetitions).toBe(3);
      expect(result.interval).toBe(15);
      expect(result.easeFactor).toBeCloseTo(2.36, 2);
    });

    it('should calculate next review for perfect recall (quality 5)', () => {
      const result = calculateNextReview(6, 2, 2.5, 5);
      
      expect(result.repetitions).toBe(3);
      expect(result.interval).toBe(15);
      expect(result.easeFactor).toBeCloseTo(2.5, 2);
    });

    it('should reset repetitions on failed attempt (quality < 3)', () => {
      const result = calculateNextReview(15, 3, 2.5, 2);
      
      expect(result.repetitions).toBe(0);
      expect(result.interval).toBe(1);
      expect(result.easeFactor).toBe(2.5);
    });

    it('should not allow ease factor to drop below 1.3', () => {
      const result = calculateNextReview(1, 1, 1.3, 0);
      
      expect(result.easeFactor).toBeGreaterThanOrEqual(1.3);
    });

    it('should calculate increasing intervals for successful reviews', () => {
      let interval = 1;
      let repetitions = 0;
      let easeFactor = 2.5;

      const result1 = calculateNextReview(interval, repetitions, easeFactor, 4);
      expect(result1.interval).toBe(1);

      const result2 = calculateNextReview(
        result1.interval,
        result1.repetitions,
        result1.easeFactor,
        4,
      );
      expect(result2.interval).toBe(6);

      const result3 = calculateNextReview(
        result2.interval,
        result2.repetitions,
        result2.easeFactor,
        4,
      );
      expect(result3.interval).toBeGreaterThan(6);
    });

    it('should handle multiple failed attempts', () => {
      let interval = 15;
      let repetitions = 3;
      let easeFactor = 2.5;

      const result1 = calculateNextReview(interval, repetitions, easeFactor, 1);
      expect(result1.repetitions).toBe(0);
      expect(result1.interval).toBe(1);

      const result2 = calculateNextReview(
        result1.interval,
        result1.repetitions,
        result1.easeFactor,
        1,
      );
      expect(result2.repetitions).toBe(0);
      expect(result2.interval).toBe(1);
    });

    it('should adjust ease factor based on quality', () => {
      const result1 = calculateNextReview(1, 1, 2.5, 5);
      expect(result1.easeFactor).toBeGreaterThan(2.5);

      const result2 = calculateNextReview(1, 1, 2.5, 3);
      expect(result2.easeFactor).toBeLessThan(2.5);
    });

    it('should calculate correct next review date', () => {
      const now = new Date();
      const result = calculateNextReview(1, 0, 2.5, 4);
      
      const expectedDate = new Date(now);
      expectedDate.setDate(expectedDate.getDate() + 1);

      expect(result.nextReview.getDate()).toBe(expectedDate.getDate());
    });
  });

  describe('Algorithm Edge Cases', () => {
    it('should handle quality 3 (barely passing)', () => {
      const result = calculateNextReview(1, 0, 2.5, 3);
      
      expect(result.repetitions).toBe(1);
      expect(result.interval).toBe(1);
    });

    it('should handle extreme ease factors', () => {
      const result1 = calculateNextReview(1, 1, 1.3, 5);
      expect(result1.easeFactor).toBeGreaterThanOrEqual(1.3);

      const result2 = calculateNextReview(1, 1, 5.0, 0);
      expect(result2.easeFactor).toBeGreaterThanOrEqual(1.3);
    });

    it('should handle long intervals', () => {
      const result = calculateNextReview(365, 10, 2.5, 4);
      
      expect(result.interval).toBeGreaterThan(365);
      expect(result.repetitions).toBe(11);
    });
  });
});
