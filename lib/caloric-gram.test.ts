import { describe, expect, test } from '@jest/globals';
import CaloricGram, { CaloricType } from './caloric-gram';

describe('CaloricGram', () => {
	test('calculates calories for PROTEIN', () => {
		const result = CaloricGram(10, 'PROTEIN');
		expect(result.calories).toBe(40);
		expect(result.type).toBe('PROTEIN');
		expect(result.grams).toBe(10);
	});

	test('calculates calories for CARB', () => {
		const result = CaloricGram(5, 'CARB');
		expect(result.calories).toBe(20);
		expect(result.type).toBe('CARB');
		expect(result.grams).toBe(5);
	});

	test('calculates calories for FAT', () => {
		const result = CaloricGram(2, 'FAT');
		expect(result.calories).toBe(18);
		expect(result.type).toBe('FAT');
		expect(result.grams).toBe(2);
	});

	test('returns correct type and grams', () => {
		const types: CaloricType[] = ['CARB', 'PROTEIN', 'FAT'];
		types.forEach((type) => {
			const grams = 7;
			const result = CaloricGram(grams, type);
			expect(result.type).toBe(type);
			expect(result.grams).toBe(grams);
		});
	});
});
